"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAccessToken } from "@/services/api-client";

interface AuthGateProps {
  children: React.ReactNode;
}

export default function AuthGate({ children }: AuthGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const token = getAccessToken();
    const isLoginRoute = pathname === "/login";

    if (!token && !isLoginRoute) {
      router.replace("/login");
      return;
    }

    if (token && isLoginRoute) {
      router.replace("/");
      return;
    }

    setIsReady(true);
  }, [pathname, router]);

  if (!isReady) {
    return <div className="min-h-screen" />;
  }

  return <>{children}</>;
}
