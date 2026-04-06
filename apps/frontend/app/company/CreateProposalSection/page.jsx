"use client";

import { useState } from "react";
import CreateProposalSection from "@/pages/CreateProposalSection";

const initialProposal = { title: "", client: "", description: "" };

export default function CompanyCreateProposalSectionPage() {
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

  const handleSubmit = () => {
    console.log("Proposal submitted", {
      proposal: newProposal,
      timeline: timelineData,
      budget: budgetData,
    });
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