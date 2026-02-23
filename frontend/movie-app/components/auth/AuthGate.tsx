"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/services/api-client";

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const token = getAccessToken();
  const isLoginRoute = pathname === "/login";
  const shouldRedirectToLogin = !token && !isLoginRoute;
  const shouldRedirectToHome = Boolean(token) && isLoginRoute;

  useEffect(() => {
    if (shouldRedirectToLogin) {
      router.replace("/login");
      return;
    }

    if (shouldRedirectToHome) {
      router.replace("/");
    }
  }, [router, shouldRedirectToHome, shouldRedirectToLogin]);

  if (shouldRedirectToLogin || shouldRedirectToHome) {
    return <div className="min-h-screen" />;
  }

  return <>{children}</>;
}
