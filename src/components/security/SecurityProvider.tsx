
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface SecurityContextType {
  isSecure: boolean;
  securityLevel: "low" | "medium" | "high";
  emailVerified: boolean;
  sessionValid: boolean;
  lastSecurityCheck: Date | null;
  performSecurityCheck: () => Promise<void>;
  reportSecurityIssue: (issue: string) => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth();
  const [isSecure, setIsSecure] = useState(false);
  const [securityLevel, setSecurityLevel] = useState<"low" | "medium" | "high">("low");
  const [emailVerified, setEmailVerified] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);
  const [lastSecurityCheck, setLastSecurityCheck] = useState<Date | null>(null);

  // Set up Content Security Policy
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://*.supabase.co",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com",
      "font-src 'self' https://fonts.gstatic.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');
    
    // Remove existing CSP meta tag if present
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }
    
    document.head.appendChild(meta);

    return () => {
      meta.remove();
    };
  }, []);

  // Perform security check
  const performSecurityCheck = async () => {
    if (!user || !session) {
      setIsSecure(false);
      setSecurityLevel("low");
      setEmailVerified(false);
      setSessionValid(false);
      setLastSecurityCheck(new Date());
      return;
    }

    try {
      // Check email verification
      const emailVerificationStatus = !!session.user.email_confirmed_at;
      setEmailVerified(emailVerificationStatus);

      // Check session validity
      const sessionAge = Date.now() - new Date(session.expires_at || 0).getTime();
      const sessionValidStatus = sessionAge > 0; // Session is still valid
      setSessionValid(sessionValidStatus);

      // Calculate security level
      let level: "low" | "medium" | "high" = "low";
      let secure = false;

      if (emailVerificationStatus && sessionValidStatus) {
        level = "medium";
        secure = true;
        
        // Additional checks for high security
        const accountAge = Date.now() - new Date(user.created_at).getTime();
        const hasRecentActivity = sessionAge < 24 * 60 * 60 * 1000; // Less than 24 hours
        
        if (accountAge > 7 * 24 * 60 * 60 * 1000 && hasRecentActivity) { // Account older than 7 days
          level = "high";
        }
      }

      setIsSecure(secure);
      setSecurityLevel(level);
      setLastSecurityCheck(new Date());

      // Notify user of security issues
      if (!emailVerificationStatus) {
        toast.warning("Vérification email requise", {
          description: "Veuillez vérifier votre email pour sécuriser votre compte"
        });
      }

    } catch (error) {
      console.error("Security check failed:", error);
      setIsSecure(false);
      setSecurityLevel("low");
    }
  };

  const reportSecurityIssue = (issue: string) => {
    console.warn("Security issue reported:", issue);
    toast.error("Problème de sécurité détecté", {
      description: "L'équipe de sécurité a été notifiée"
    });
    
    // In a real app, you would send this to your security monitoring service
  };

  // Perform initial security check
  useEffect(() => {
    performSecurityCheck();
  }, [user, session]);

  // Set up security headers
  useEffect(() => {
    // Set security headers
    const headers = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Apply headers (this would typically be done on the server)
    Object.entries(headers).forEach(([header, value]) => {
      document.documentElement.setAttribute(`data-${header.toLowerCase()}`, value);
    });
  }, []);

  return (
    <SecurityContext.Provider
      value={{
        isSecure,
        securityLevel,
        emailVerified,
        sessionValid,
        lastSecurityCheck,
        performSecurityCheck,
        reportSecurityIssue
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error("useSecurity must be used within a SecurityProvider");
  }
  return context;
};
