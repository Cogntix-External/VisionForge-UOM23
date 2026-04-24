"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  cacheProposalDetails,
  mergeProposalWithCachedDetails,
} from "@/utils/proposalDetailsCache";

const ProposalDetailsSection = dynamic(
  () => import("@/pages/ProposalDetailsSection"),
  { ssr: false },
);

export default function CompanyProposalDetailsSectionPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsView, setDetailsView] = useState(null);
  const [projectBudgetData, setProjectBudgetData] = useState([]);
  const [projectTimelineData, setProjectTimelineData] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
      const resolvedCompanyId =
        localStorage.getItem("companyId") ||
        window.sessionStorage.getItem("crms:companyId") ||
        user.companyId ||
        user.id ||
        user.userId ||
        user._id ||
        null;

      setCompanyId(resolvedCompanyId);

      const proposalId = new URLSearchParams(window.location.search).get(
        "proposalId",
      );
      const storedProposal = window.sessionStorage.getItem("crms:selectedProposal");

      if (!storedProposal) {
        setSelectedProject(null);
        return;
      }

      const parsed = mergeProposalWithCachedDetails(JSON.parse(storedProposal));

      if (!proposalId || parsed?.id === proposalId) {
        setSelectedProject(parsed);
        setProjectBudgetData(Array.isArray(parsed.budgetData) ? parsed.budgetData : []);
        setProjectTimelineData(Array.isArray(parsed.timelines) ? parsed.timelines : []);
        return;
      }

      setSelectedProject(null);
    } catch {
      setSelectedProject(null);
    }
  }, []);

  const handleProposalUpdate = (updatedProposal) => {
    setSelectedProject(updatedProposal);
    cacheProposalDetails(updatedProposal?.id, {
      budgetData: updatedProposal?.budgetData || [],
      timelines: updatedProposal?.timelines || [],
    });
    window.sessionStorage.setItem(
      "crms:selectedProposal",
      JSON.stringify(updatedProposal),
    );
  };

  return (
    <ProposalDetailsSection
      selectedProject={selectedProject}
      onBack={() => router.push("/company/ProposalsListSection")}
      detailsView={detailsView}
      setDetailsView={setDetailsView}
      projectBudgetData={projectBudgetData}
      projectTimelineData={projectTimelineData}
      companyId={companyId}
      onProposalUpdate={handleProposalUpdate}
    />
  );
}
