import { useState, useEffect } from 'react';
import { useForm } from './hooks';
import { supabase } from './lib/supabaseConfig';

const formValidations = {
  name: [(value) => value.length > 0, 'Name is required'],
  email: [(value) => value.length > 0, 'Email is required'],
}

const WAITLIST_STORAGE_KEY = 'waitlist_registered';

const App = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // type: 'success', 'error', 'info'
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);

  const { formState, onInputChange, isFormValid } = useForm({
    name: '',
    email: '',
  }, formValidations);

  // Verificar si ya está registrado al cargar el componente
  useEffect(() => {
    const registeredData = localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (registeredData) {
      try {
        const parsed = JSON.parse(registeredData);
        setIsAlreadyRegistered(true);
        setMessage({ 
          text: `Welcome back! You're already on our waitlist with ${parsed.email}`, 
          type: 'success' 
        });
      } catch {
        // Si hay error al parsear, limpiar localStorage
        localStorage.removeItem(WAITLIST_STORAGE_KEY);
      }
    }
  }, []);

  // Función para resetear el estado (útil para desarrollo/testing)
  /* const resetRegistration = () => {
    localStorage.removeItem(WAITLIST_STORAGE_KEY);
    setIsAlreadyRegistered(false);
    setMessage({ text: '', type: '' });
    onResetForm();
  }; */
 
  const onSubmit = async (e) => {
    e.preventDefault();
    
    // Si ya está registrado, no permitir nuevo envío
    if (isAlreadyRegistered) {
      return;
    }

    // Validar que el formulario sea válido
    if (!isFormValid) {
      setMessage({ text: 'Please fill in all required fields', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Llamar a la Edge Function usando invoke
      const { data, error } = await supabase.functions.invoke('waitlist-signup', {
        body: {
          name: formState.name.trim(),
          email: formState.email.trim()
        }
      });

      if (error) {
        console.error('Error calling edge function:', error);
        
        // Manejar diferentes tipos de errores
        if (error.message?.includes('429') || error.message?.includes('rate')) {
          setMessage({ 
            text: 'Too many attempts. Please try again later.', 
            type: 'error' 
          });
        } else if (error.message?.includes('409') || error.message?.includes('duplicate')) {
          setMessage({ 
            text: 'This email is already registered in the waitlist.', 
            type: 'info' 
          });
        } else {
          setMessage({ 
            text: 'An error occurred while processing your request. Please try again later.', 
            type: 'error' 
          });
        }
        return;
      }

      // Si hay datos pero con error en la respuesta
      if (data?.error) {
        setMessage({ text: 'An error occurred. Please try again later.', type: 'error' });
        return;
      }

      // Éxito - Guardar en localStorage y marcar como registrado
      const registrationData = {
        email: formState.email,
        name: formState.name,
        registeredAt: new Date().toISOString()
      };
      
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(registrationData));
      setIsAlreadyRegistered(true);
      
      setMessage({ 
        text: data?.message || 'You have been added to the waitlist!', 
        type: 'success' 
      });

    } catch (err) {
      console.error('Unexpected error:', err);
      setMessage({ 
        text: 'An unexpected error occurred. Please try again later.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <div className="min-h-dvh relative overflow-hidden bg-background text-foreground flex flex-col">
      <div className="absolute inset-0 bg-surface-pattern pointer-events-none"></div>
      {/* Glows to match reference */}
      <div className="glow-orange w-[880px] h-[480px] top-28 left-[10%] -translate-x-10 rounded-full"></div>
      <div className="glow-amber w-[1000px] h-[520px] bottom-16 right-[8%] translate-x-10 rounded-full"></div>
      <main className="relative flex-1 flex flex-col">
        <section className="max-w-4xl mx-auto px-6 pt-16 pb-16 sm:pt-24">
          {/* Badges */}
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-sm shadow-[0_2px_0_0_rgba(249,115,22,0.35)] ring-1 ring-ring/60 px-3 py-1 text-xs font-medium text-foreground/70">
              Waitlist
            </span>
            <span className="inline-flex items-center rounded-full bg-white/70 backdrop-blur-sm shadow-[0_2px_0_0_rgba(249,115,22,0.35)] ring-1 ring-ring/60 px-3 py-1 text-xs font-medium text-foreground/70">
              Coming Soon
            </span>
          </div>

          {/* Heading */}
          <h1 className="mt-6 text-center font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-foreground">
            Get <span className="text-orange-500">AI support</span> and <span className="text-orange-500">feedback</span>
            <br className="hidden sm:block" />
            with just <span className="text-orange-500">one line</span> of code
          </h1>

          {/* Subtext */}
          <p className="mt-4 text-center text-base sm:text-lg text-muted max-w-3xl mx-auto">
            A lightweight widget that gives you a smart chatbot + feedback collector — trained on your site — with zero backend or setup needed.
          </p>

          {/* Email Card */}
          <div className="mt-10 mx-auto max-w-2xl px-4 relative">
            <form onSubmit={onSubmit} className="waitlist-card rounded-2xl p-4 relative">
              <div className="waitlist-field flex items-center gap-3 px-4">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <input
                  type="text"
                  placeholder="Your name..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-muted/70 text-foreground disabled:opacity-50"
                  name="name"
                  value={formState.name}
                  onChange={onInputChange}
                  disabled={isAlreadyRegistered}
                />
              </div>
              <div className="waitlist-field flex items-center gap-3 px-4 mt-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-muted">
                  <path d="M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.4"/>
                </svg>
                <input
                  type="email"
                  placeholder="Your email..."
                  className="flex-1 bg-transparent outline-none text-base placeholder:text-muted/70 text-foreground disabled:opacity-50"
                  name="email"
                  value={formState.email}
                  onChange={onInputChange}
                  disabled={isAlreadyRegistered}
                />
              </div>
              <button 
                type="submit" 
                disabled={isLoading || !isFormValid || isAlreadyRegistered}
                className="waitlist-button mt-3 w-full font-semibold text-base cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed relative"
              >
                {isAlreadyRegistered ? (
                  '✓ Already on Waitlist'
                ) : isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Joining...
                  </span>
                ) : (
                  'Join The Waitlist'
                )}
              </button>
              
              {/* Message display */}
              {message.text && (
                <div className={`mt-3 p-3 rounded-lg text-sm text-center transition-all duration-300 ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}>
                  {message.text}
                </div>
              )}

              {/* Reset button for development */}
              {/* {isAlreadyRegistered && import.meta.env.DEV && (
                <button
                  type="button"
                  onClick={resetRegistration}
                  className="mt-2 text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Reset registration (dev only)
                </button>
              )} */}
            </form>
          </div>

          {/* Feature bullets */}
          <div className="mt-10">
            <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-3">
              <li className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-orange-600">
                  <path d="M9 8l-4 4 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 8l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>One-line integration</span>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600">
                  <path d="M12 4.5V3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  <rect x="6" y="6.5" width="12" height="10" rx="3" stroke="currentColor" strokeWidth="1.8"/>
                  <circle cx="10" cy="11" r="1.1" fill="currentColor"/>
                  <circle cx="14" cy="11" r="1.1" fill="currentColor"/>
                  <path d="M8.5 15.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                <span>AI trained on your site</span>
              </li>
              <li className="inline-flex items-center gap-2 text-sm text-foreground/80">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-600">
                  <path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span>Built for builders</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <footer className="px-6 pb-7 mt-auto">
          <p className="text-center text-xs text-muted">
            © Customer GPT – Handle customer support with AI. Built by
            <a className="font-medium text-foreground/80 hover:underline ml-1" target="_blank" rel="noreferrer" href="https://x.com/francojuri_dev">@francojuri_dev</a>
          </p>
        </footer>
      </main>
    </div>
  )
}

export default App;