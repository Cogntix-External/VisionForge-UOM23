"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CreateProposalSection from "@/pages/CreateProposalSection";
import { createCompanyProposal, getRegisteredClients } from "@/services/api";
import { cacheProposalDetails } from "@/utils/proposalDetailsCache";

const emptyTimelineRow = {
  phase: "",
  startDate: "",
  endDate: "",
  duration: "",
  assignedTo: "",
};

const emptyBudgetRow = {
  item: "",
  unit: "hours",
  qty: "",
  unitCost: "",
  total: "",
};

const initialProposal = {
  title: "",
  clientId: "",
  clientName: "",
  description: "",
};

const resolveCompanyId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
    return (
      localStorage.getItem("companyId") ||
      user.companyId ||
      user.id ||
      user.userId ||
      user._id ||
      null
    );
  } catch {
    return null;
  }
};

export default function CompanyCreateProposalSectionPage() {
  const router = useRouter();
  const [newProposal, setNewProposal] = useState(initialProposal);
  const [showTimeline, setShowTimeline] = useState(true);
  const [showBudget, setShowBudget] = useState(true);
  const [timelineData, setTimelineData] = useState([emptyTimelineRow]);
  const [budgetData, setBudgetData] = useState([emptyBudgetRow]);
  const [clientOptions, setClientOptions] = useState([]);
  const [companyId, setCompanyId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const resolvedCompanyId = resolveCompanyId();
    setCompanyId(resolvedCompanyId);

    const loadClients = async () => {
      try {
        setError("");
        const response = await getRegisteredClients();
        setClientOptions(Array.isArray(response) ? response : []);
      } catch (clientError) {
        setError(clientError.message || "Failed to load client IDs");
      }
    };

    loadClients();
  }, []);

  const handleClear = () => {
    setNewProposal(initialProposal);
    setShowTimeline(true);
    setShowBudget(true);
    setTimelineData([emptyTimelineRow]);
    setBudgetData([emptyBudgetRow]);
    setError("");
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    if (!companyId) {
      setError("Company ID is missing. Please login again.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const totalBudget = budgetData.reduce((sum, row) => {
        const rowTotal = Number(row.total);
        return sum + (Number.isFinite(rowTotal) ? rowTotal : 0);
      }, 0);

      const totalDurationDays = timelineData.reduce((sum, row) => {
        const value = parseInt(String(row.duration || "").trim(), 10);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0);

      const createdProposal = await createCompanyProposal(
        {
          title: newProposal.title.trim(),
          description: newProposal.description.trim(),
          clientId: newProposal.clientId,
          clientName: newProposal.clientName.trim(),
          totalBudget,
          totalDurationDays,
          budgetData,
          timelines: timelineData,
        },
        companyId,
      );

      cacheProposalDetails(createdProposal?.id, {
        budgetData,
        timelines: timelineData,
      });

      handleClear();
      router.push("/company/ProposalsListSection");
    } catch (submitError) {
      setError(submitError.message || "Failed to submit proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded border border-red-200 bg-red-50 text-red-800">
          {error}
        </div>
      )}

      {isSubmitting && (
        <div className="p-4 rounded border border-blue-200 bg-blue-50 text-blue-800">
          Submitting proposal...
        </div>
      )}

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
        clientOptions={clientOptions}
      />
    </div>
  );
}
