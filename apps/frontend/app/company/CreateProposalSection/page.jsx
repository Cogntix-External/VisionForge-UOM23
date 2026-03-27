"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateProposalSection from "@/pages/CreateProposalSection";
import {
  addStoredProposal,
  buildProposalFromForm,
} from "@/lib/proposalStore";

export default function CompanyCreateProposalSectionPage() {
  const router = useRouter();
  const [newProposal, setNewProposal] = useState({
    title: "",
    client: "",
    description: "",
  });
  const [showTimeline, setShowTimeline] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [timelineData, setTimelineData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);

  const handleClear = () => {
    setNewProposal({ title: "", client: "", description: "" });
    setTimelineData([]);
    setBudgetData([]);
    setShowTimeline(true);
    setShowBudget(true);
  };

  const handleSubmit = () => {
    const proposal = buildProposalFromForm(newProposal, timelineData, budgetData);
    addStoredProposal(proposal);
    handleClear();
    router.push("/company/ProposalsListSection");
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