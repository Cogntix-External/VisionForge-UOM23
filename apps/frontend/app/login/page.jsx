"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Auth from "../../pages/Auth";
import { getToken, setSession } from "../../utils/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      router.replace("/client/dashboard");
    }
  }, [router]);

  return (
    <Auth
      onLogin={(user) => {
        const token =
          typeof globalThis.window !== "undefined"
            ? localStorage.getItem("crms_token")
            : null;
        setSession(token, user);
        const role = (user?.role || "CLIENT").toUpperCase();
        router.push(
          role === "COMPANY" ? "/company/dashboard" : "/client/dashboard",
        );
      }}
    />
  );
}
