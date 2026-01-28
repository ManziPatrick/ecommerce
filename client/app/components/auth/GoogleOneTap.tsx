"use client";

import { useEffect } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { usePathname } from "next/navigation";
import { useGoogleLoginMutation } from "@/app/store/apis/AuthApi";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleOneTap() {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();
  const [googleLogin] = useGoogleLoginMutation();

  const handleCredentialResponse = async (response: any) => {
    try {
      console.log("🚀 Google One Tap: Verifying token...");
      await googleLogin({ idToken: response.credential }).unwrap();
      window.location.reload();
    } catch (error) {
      console.error("Error during Google One Tap login:", error);
    }
  };

  useEffect(() => {
    // Prevent One Tap on auth pages to avoid conflicts with buttons
    const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";
    
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      console.log("🚀 Google One Tap: Starting initialization sequence...");
      
      const initOneTap = () => {
        if (typeof window !== "undefined" && window.google?.accounts?.id) {
          try {
            console.log("🚀 Google One Tap: Initializing with Client ID:", process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
            
            window.google.accounts.id.initialize({
              client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
              auto_select: false,
              itp_support: true,
              use_fedcm_for_prompt: true, // Google now highly recommends this
              context: "signin",
            });

            // The prompt() call is what actually triggers the UI
            window.google.accounts.id.prompt((notification: any) => {
              const momentType = notification.getMomentType();
              
              if (notification.isNotDisplayed()) {
                const reason = notification.getNotDisplayedReason();
                console.warn(`⚠️ One Tap NOT displayed. Reason: ${reason} (Moment: ${momentType})`);
                
                if (reason === "skipped_by_cookie") {
                  console.info("💡 Hint: One Tap is hidden because you closed it recently (backoff). Clear your 'g_state' cookie to see it again.");
                }
              } else if (notification.isSkippedMoment()) {
                console.warn(`⚠️ One Tap skipped. Reason: ${notification.getSkippedReason()} (Moment: ${momentType})`);
              } else if (notification.isDismissedMoment()) {
                console.warn(`⚠️ One Tap dismissed. Reason: ${notification.getDismissedReason()} (Moment: ${momentType})`);
              } else {
                console.log(`✅ One Tap moment successful: ${momentType}`);
              }
            });
          } catch (err) {
            console.error("❌ Google One Tap Runtime Error:", err);
          }
        }
      };

      // Check for script with a bit more persistence
      let attempts = 0;
      const checkScript = setInterval(() => {
        attempts++;
        if (window.google?.accounts?.id) {
          console.log(`✅ Google GSI script detected after ${attempts} checks.`);
          clearInterval(checkScript);
          initOneTap();
        } else if (attempts > 20) {
          console.error("❌ Google GSI script failed to load after 10 seconds.");
          clearInterval(checkScript);
        }
      }, 500);

      return () => clearInterval(checkScript);
    }
  }, [isAuthenticated, isLoading, pathname]);

  return null;
}
