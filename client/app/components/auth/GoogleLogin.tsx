"use client";

import { useEffect, useRef } from "react";
import { useGoogleLoginMutation } from "@/app/store/apis/AuthApi";

declare global {
  interface Window {
    google: any;
  }
}

export default function GoogleLogin() {
  const [googleLogin] = useGoogleLoginMutation();
  const googleButtonRef = useRef<HTMLDivElement>(null);

  const handleCredentialResponse = async (response: any) => {
    try {
      console.log("Encoded JWT ID token: " + response.credential);
      await googleLogin({ idToken: response.credential }).unwrap();
      window.location.href = "/";
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        // FedCM is default now, but can be configured
        ux_mode: "popup", 
      });

      if (googleButtonRef.current) {
        window.google.accounts.id.renderButton(
          googleButtonRef.current,
          { theme: "outline", size: "large", width: "100%" }
        );
      }
    }
  }, []);

  return <div ref={googleButtonRef} className="w-full"></div>;
}
