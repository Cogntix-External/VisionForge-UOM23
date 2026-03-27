"use client";

import DashboardSection from "@/pages/DashboardSection";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredProposals } from "@/lib/proposalStore";

export default function CompanyDashboardSectionPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(getStoredProposals());
  }, []);

  return (
    <DashboardSection
      projects={projects}
      onCreate={() => router.push("/company/CreateProposalSection")}
    />
  );
}