"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProposalDetailsSection from "@/pages/ProposalDetailsSection";
export default function CompanyProposalDetailsSectionPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsView, setDetailsView] = useState(null);
  const [projectBudgetData, setProjectBudgetData] = useState([]);
  const [projectTimelineData, setProjectTimelineData] = useState([]);
  const [projectMilestoneData, setProjectMilestoneData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [companyId, setCompanyId] = useState(null);

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
      }
    } catch {
      setSelectedProject(null);
    }
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
