"use client";

import { useRouter } from "next/navigation";
import DashboardSection from "@/pages/DashboardSection";

export default function CompanyDashboardSectionPage() {
  const router = useRouter();

  return (
    <DashboardSection
      onCreate={() => {
        router.push("/company/CreateProposalSection");
      }}
    />
  );
}