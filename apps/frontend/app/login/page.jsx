"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Auth from "../../pages/Auth";
import { getToken, getUser, normalizeRole, setSession } from "../../utils/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (getToken()) {
      const role = normalizeRole(getUser()?.role);
      router.replace(
        role === "COMPANY" ? "/company/DashboardSection" : "/client/dashboard",
      );
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
        const role = normalizeRole(user?.role || "CLIENT");
        router.push(
          role === "COMPANY"
            ? "/company/DashboardSection"
            : "/client/dashboard",
        );
      }}
    />
  );
}
