import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail = ({ name = "there" }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>CustomerGPT will be available soon! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Welcome to Customer GPT!</Heading>
        </Section>
        
        <Section style={content}>
          <Text style={paragraph}>Hi {name},</Text>
          
          <Text style={paragraph}>
            Thank you for joining the Customer GPT waitlist! We're excited to have you on board. 🎉
          </Text>
          
          <Text style={paragraph}>
            You're now among the first to know when we launch. We'll keep you updated on our progress and notify you as soon as we're ready.
          </Text>
          
          <Text style={paragraph}>
            Stay tuned for exciting updates!
          </Text>
          
          <Section style={box}>
            <Text style={boxText}>
              <strong>What's next?</strong>
              <br />
              We're working hard to bring you an amazing AI-powered customer support experience for your products. You'll be the first to know when we're ready to launch.
            </Text>
          </Section>
        </Section>
        
        <Section style={footer}>
          <Text style={footerText}>
            Best regards,
            <br />
            <strong>Franco Juri, CustomerGPT founder</strong>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: "#f5f5f5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "600px",
};

const header = {
  background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
  borderRadius: "12px 12px 0 0",
  padding: "40px 30px",
  textAlign: "center" as const,
};

const h1 = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "600",
  margin: "0",
};

const content = {
  backgroundColor: "#ffffff",
  padding: "40px 30px",
};

const paragraph = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px 0",
};

const box = {
  backgroundColor: "#f8f9fa",
  borderLeft: "4px solid #ff6b35",
  borderRadius: "4px",
  padding: "16px",
  margin: "20px 0",
};

const boxText = {
  color: "#555555",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};

const footer = {
  backgroundColor: "#f8f9fa",
  borderRadius: "0 0 12px 12px",
  borderTop: "1px solid #e9ecef",
  padding: "30px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#6c757d",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
};
