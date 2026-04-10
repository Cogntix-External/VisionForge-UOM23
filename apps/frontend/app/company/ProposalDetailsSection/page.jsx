"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProposalDetailsSection from "@/pages/ProposalDetailsSection";
import { getCompanyProposals } from "@/services/api";

const mapServerProposalToViewModel = (proposal, fallback = {}) => ({
  ...fallback,
  id: proposal.id,
  title: proposal.title || fallback.title || "Untitled Proposal",
  clientId: proposal.clientId || fallback.clientId || "Not assigned",
  client: proposal.clientId || fallback.client || "Not assigned",
  status: String(proposal.status || fallback.status || "PENDING").toUpperCase(),
  rejectionReason: proposal.rejectionReason || "",
  lastUpdated: proposal.updatedAt
    ? new Date(proposal.updatedAt).toLocaleString()
    : fallback.lastUpdated || "Not available",
});

export default function CompanyProposalDetailsSectionPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsView, setDetailsView] = useState(null);
  const [projectBudgetData, setProjectBudgetData] = useState([]);
  const [projectTimelineData, setProjectTimelineData] = useState([]);
  const [projectMilestoneData, setProjectMilestoneData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [companyId, setCompanyId] = useState(null);

  const syncLatestProposal = async (proposalId, resolvedCompanyId) => {
    if (!proposalId || !resolvedCompanyId) return;

    try {
      const proposals = await getCompanyProposals(resolvedCompanyId);
      const latestProposal = Array.isArray(proposals)
        ? proposals.find((proposal) => proposal.id === proposalId)
        : null;

      if (!latestProposal) return;

      setSelectedProject((previous) =>
        mapServerProposalToViewModel(latestProposal, previous || {}),
      );
    } catch {
      // Keep the last known state if background sync fails.
    }
  };

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
      const explicitCompanyId = localStorage.getItem("companyId");
      const resolvedCompanyId =
        explicitCompanyId ||
        user.companyId ||
        user.id ||
        user.userId ||
        user._id ||
        null;
      setCompanyId(resolvedCompanyId);

      const storedProposal = window.sessionStorage.getItem(
        "crms:selectedProposal",
      );
      if (storedProposal) {
        const parsed = JSON.parse(storedProposal);
        setSelectedProject(parsed);
        setProjectBudgetData(
          Array.isArray(parsed.budgetData) ? parsed.budgetData : [],
        );
        setProjectTimelineData(
          Array.isArray(parsed.timelines) ? parsed.timelines : [],
        );
        setProjectMilestoneData(
          Array.isArray(parsed.milestones) ? parsed.milestones : [],
        );

        syncLatestProposal(parsed.id, resolvedCompanyId);

        const intervalId = window.setInterval(() => {
          syncLatestProposal(parsed.id, resolvedCompanyId);
        }, 8000);

        return () => {
          window.clearInterval(intervalId);
        };
      }
    } catch {
      setSelectedProject(null);
    }

    return undefined;
  }, []);

  return (
    <ProposalDetailsSection
      selectedProject={selectedProject}
      onBack={() => router.push("/company/ProposalsListSection")}
      detailsView={detailsView}
      setDetailsView={setDetailsView}
      projectBudgetData={projectBudgetData}
      setProjectBudgetData={setProjectBudgetData}
      projectTimelineData={projectTimelineData}
      setProjectTimelineData={setProjectTimelineData}
      projectMilestoneData={projectMilestoneData}
      setProjectMilestoneData={setProjectMilestoneData}
      uploadedFile={uploadedFile}
      setUploadedFile={setUploadedFile}
      companyId={companyId}
    />
  );
}
