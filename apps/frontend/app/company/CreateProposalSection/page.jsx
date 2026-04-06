"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateProposalSection from "@/pages/CreateProposalSection";
import { createCompanyProposal } from "@/services/api";

const initialProposal = { title: "", client: "", description: "" };

export default function CompanyCreateProposalSectionPage() {
  const router = useRouter();
  const [newProposal, setNewProposal] = useState(initialProposal);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [timelineData, setTimelineData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  const handleClear = () => {
    setNewProposal(initialProposal);
    setShowTimeline(true);
    setShowBudget(true);
    setTimelineData([]);
    setBudgetData([]);
  };

  const handleSubmit = async () => {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem("crms_user") || "{}");
    } catch {
      user = {};
    }

    const companyId = user.companyId || user.id || user.userId || user._id;
    if (!companyId) {
      alert("Company ID not found. Please login again.");
      return;
    }

    try {
      const createdProposal = await createCompanyProposal(
        {
          title: newProposal.title,
          description: newProposal.description,
          clientId: newProposal.client,
          companyId,
        },
        companyId,
      );

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          "crms:latestCompanyProposal",
          JSON.stringify(createdProposal),
        );
      }

      router.push("/company/ProposalsListSection");
    } catch (error) {
      alert(error?.message || "Failed to create proposal");
    }
  };

  return (
    <CreateProposalSection
      newProposal={newProposal}
      setNewProposal={setNewProposal}
      showTimeline={showTimeline}
      setShowTimeline={setShowTimeline}
      showBudget={showBudget}
      setShowBudget={setShowBudget}
      timelineData={timelineData}
      setTimelineData={setTimelineData}
      budgetData={budgetData}
      setBudgetData={setBudgetData}
      onClear={handleClear}
      onSubmit={handleSubmit}
    />
  );
}