"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProposalDetailsSection from "@/pages/ProposalDetailsSection";

export default function ClientProposalDetailsSectionPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsView, setDetailsView] = useState(null);
  const [projectBudgetData, setProjectBudgetData] = useState([]);
  const [projectTimelineData, setProjectTimelineData] = useState([]);
  const [projectMilestoneData, setProjectMilestoneData] = useState([]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
      const explicitClientId = localStorage.getItem("clientId");
      const resolvedClientId =
        explicitClientId || user.clientId || user.id || user.userId || user._id || null;
      setClientId(resolvedClientId);

      const storedProposal = window.sessionStorage.getItem("crms:selectedProposal");
      if (storedProposal) {
        const parsed = JSON.parse(storedProposal);
        setSelectedProject(parsed);
        setProjectBudgetData(Array.isArray(parsed.budgetData) ? parsed.budgetData : []);
        setProjectTimelineData(Array.isArray(parsed.timelines) ? parsed.timelines : []);
        setProjectMilestoneData(Array.isArray(parsed.milestones) ? parsed.milestones : []);
      }
    } catch {
      setSelectedProject(null);
    }
  }, []);

  const handleProposalUpdate = (updatedProposal) => {
    // Update the selected project state
    setSelectedProject(updatedProposal);
    // Optionally redirect back to proposals list after update
    setTimeout(() => {
      router.push("/client/Proposal");
    }, 1500);
  };

  return (
    <ProposalDetailsSection
      selectedProject={selectedProject}
      onBack={() => router.push("/client/Proposal")}
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
      clientId={clientId}
      onProposalUpdate={handleProposalUpdate}
    />
  );
}
