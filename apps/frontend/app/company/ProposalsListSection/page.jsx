"use client";

import ProposalsListSection from "@/pages/ProposalsListSection";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredProposals } from "@/lib/proposalStore";

export default function CompanyProposalsListSectionPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    setProjects(getStoredProposals());
  }, []);

  const handleSelect = (project) => {
    if (!project?.id) {
      return;
    }

    router.push(
      `/company/ProposalDetailsSection?proposalId=${encodeURIComponent(project.id)}`,
    );
  };

  return (
    <ProposalsListSection
      projects={projects}
      onSelect={handleSelect}
      onCreate={() => router.push("/company/CreateProposalSection")}
    />
  );
}