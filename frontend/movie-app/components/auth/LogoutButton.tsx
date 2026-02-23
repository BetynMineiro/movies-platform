"use client";

import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  return (
    <button type="button" onClick={handleLogout} className={className}>
      Logout
    </button>
  );
}
