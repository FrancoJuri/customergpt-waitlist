//@ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { render } from "npm:@react-email/render@0.0.17";
import WelcomeEmail from "./email-template.tsx";

interface WaitlistRequest {
  name?: string;
  email: string;
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMinutes: number;
}

// Configuración de rate limiting
const RATE_LIMIT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMinutes: 10, 
};

// Function to send welcome email using Resend API
async function sendWelcomeEmail(name: string, email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found in environment variables');
      return { success: false, error: 'Email service not configured' };
    }

    // Render React Email template to HTML
    const emailHtml = await render(WelcomeEmail({ name }));

    // Send email using Resend API (fetch method as per docs)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`
      },
      body: JSON.stringify({
        from: 'CustomerGPT <welcome@news.customergpt.pro>',
        to: [email],
        subject: 'Welcome to CustomerGPT waitlist! 🎉',
        html: emailHtml,
      })
    });

    const data = await res.json();

    if (!res.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data.message || 'Failed to send email' };
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: err.message };
  }
}

Deno.serve(async (req: Request) => {
  // PRIMERO: Manejar preflight requests (OPTIONS)
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey'
      }
    });
  }

  // SEGUNDO: Solo permitir método POST después de OPTIONS
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey'
        } 
      }
    );
  }

  try {
    // Obtener IP del cliente
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verificar rate limiting
    const rateLimitResult = await checkRateLimit(supabase, clientIP);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ 
          error: 'Too many attempts. Please try again later.',
          retryAfter: rateLimitResult.retryAfter
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900'
          } 
        }
      );
    }

    // Parsear el body de la request
    let requestData: WaitlistRequest;
    try {
      requestData = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Validar datos requeridos
    if (!requestData.email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestData.email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    if(!requestData.name) {
      return new Response(
        JSON.stringify({ error: 'Name is required' }),
        { 
          status: 400, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Registrar el intento
    await recordAttempt(supabase, clientIP);

    // Insertar en la waitlist
    const { data, error } = await supabase
      .from('waitlist')
      .insert({
        name: requestData.name || null,
        email: requestData.email.toLowerCase().trim(),
      })
      .select()
      .single();

    if (error) {
      // Si es error de email duplicado
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ error: 'This email is already registered in the waitlist' }),
          { 
            status: 409, 
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            } 
          }
        );
      }
      
      console.error('Error inserting into waitlist:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        { 
          status: 500, 
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          } 
        }
      );
    }

    // Send welcome email (non-blocking - we don't want to fail the signup if email fails)
    const emailResult = await sendWelcomeEmail(data.name || 'there', data.email);
    
    if (!emailResult.success) {
      console.warn('Failed to send welcome email, but user was added to waitlist:', emailResult.error);
    }

    // Respuesta exitosa
    return new Response(
      JSON.stringify({ 
        message: 'You have been added to the waitlist!',
        data: {
          id: data.id,
          email: data.email,
          name: data.name,
          created_at: data.created_at
        },
        emailSent: emailResult.success
      }),
      { 
        status: 201, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        } 
      }
    );
  }
});

// Función para verificar rate limiting
async function checkRateLimit(supabase: any, ipAddress: string): Promise<{
  allowed: boolean;
  retryAfter?: number;
}> {
  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.windowMinutes * 60 * 1000);
    
    // Buscar intentos recientes para esta IP
    const { data: existingRecord, error } = await supabase
      .from('rate_limit_attempts')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('endpoint', 'waitlist')
      .gte('last_attempt_at', windowStart.toISOString())
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking rate limit:', error);
      return { allowed: true }; // En caso de error, permitir la request
    }

    if (!existingRecord) {
      return { allowed: true }; // No hay intentos recientes
    }

    if (existingRecord.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
      const retryAfter = Math.ceil(
        (RATE_LIMIT_CONFIG.windowMinutes * 60 * 1000 - 
         (Date.now() - new Date(existingRecord.first_attempt_at).getTime())) / 1000
      );
      
      return { 
        allowed: false, 
        retryAfter: Math.max(retryAfter, 60) // mínimo 1 minuto
      };
    }

    return { allowed: true };
  } catch (err) {
    console.error('Unexpected error checking rate limit:', err);
    return { allowed: true }; // En caso de error, permitir la request
  }
}

// Función para registrar un intento
async function recordAttempt(supabase: any, ipAddress: string) {
  try {
    const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.windowMinutes * 60 * 1000);
    
    // Buscar registro existente en la ventana de tiempo
    const { data: existingRecord } = await supabase
      .from('rate_limit_attempts')
      .select('*')
      .eq('ip_address', ipAddress)
      .eq('endpoint', 'waitlist')
      .gte('last_attempt_at', windowStart.toISOString())
      .single();

    if (existingRecord) {
      // Actualizar el registro existente
      await supabase
        .from('rate_limit_attempts')
        .update({
          attempts: existingRecord.attempts + 1,
          last_attempt_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);
    } else {
      // Crear nuevo registro
      await supabase
        .from('rate_limit_attempts')
        .insert({
          ip_address: ipAddress,
          endpoint: 'waitlist',
          attempts: 1,
          first_attempt_at: new Date().toISOString(),
          last_attempt_at: new Date().toISOString()
        });
    }
  
  } catch (err) {
    console.error('Error recording attempt:', err);
  }
}