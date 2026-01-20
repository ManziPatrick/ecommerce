import { useRouter } from "next/navigation";
import CustomLoader from "../feedback/CustomLoader";
import { useAuth } from "@/app/hooks/useAuth";
import { useEffect, useState } from "react";

export function withAuth<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
) {
  return function AuthWrapper(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    console.log("isAuthenticated: ", isAuthenticated);
    console.log("isLoading: ", isLoading);
    const router = useRouter();

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push("/sign-in");
      }
    }, [isLoading, isAuthenticated, router]);

    // Prevent hydration mismatch by ensuring initial render matches server (Loader)
    if (!mounted || isLoading) return <CustomLoader />;

    return <Component {...props} />;
  };
}
