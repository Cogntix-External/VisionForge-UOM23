"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProposalDetailsSection from "@/pages/ProposalDetailsSection";
import { getStoredProposalById } from "@/lib/proposalStore";

export default function CompanyProposalDetailsSectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsView, setDetailsView] = useState(null);
  const [projectBudgetData, setProjectBudgetData] = useState([]);
  const [projectTimelineData, setProjectTimelineData] = useState([]);
  const [projectMilestoneData, setProjectMilestoneData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);

  useEffect(() => {
    const proposalId = searchParams.get("proposalId");
    if (!proposalId) {
      setSelectedProject(null);
      return;
    }

    const proposal = getStoredProposalById(proposalId);
    setSelectedProject(proposal);
  }, [searchParams]);

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
    />
  );
}