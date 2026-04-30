"use client";

import { useState, useEffect } from "react";
import Proposals from "@/pages/Proposals";
import ProposalModal from "@/components/ProposalModal";
import { getClientProposals } from "@/services/api";

export default function ClientProposalsPage() {
  const [clientId, setClientId] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Get clientId from localStorage or context
  useEffect(() => {
    try {
      const storedClientId = localStorage.getItem("clientId");
      const storedUser = JSON.parse(localStorage.getItem("crms_user") || "{}");
      const resolvedClientId =
        storedClientId ||
        storedUser.clientId ||
        storedUser.id ||
        storedUser.userId ||
        storedUser._id ||
        null;

      if (resolvedClientId) {
        localStorage.setItem("clientId", resolvedClientId);
        setClientId(resolvedClientId);
      }
    } catch {
      setClientId(null);
    }
  }, []);

  // Fetch proposals when clientId is available
  useEffect(() => {
    if (!clientId) return;

    const fetchProposals = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getClientProposals(clientId);
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((proposal) => ({
          id: proposal.id,
          projectName: proposal.clientId || "Client Project",
          title: proposal.title || "Untitled Proposal",
          summary: proposal.description || "No description provided.",
          budget: 0,
          timeline: "-",
          totalBudget: proposal.totalBudget ?? null,
          totalDurationDays: proposal.totalDurationDays ?? null,
          budgetData: proposal.budgetData || [],
          timelines: proposal.timelines || [],
          submittedBy: proposal.companyId || "Company",
          submittedAt: proposal.createdAt
            ? new Date(proposal.createdAt).toLocaleDateString()
            : "-",
          status: proposal.status || "PENDING",
          scope: [],
          deliverables: [],
          risks: [],
          techStack: [],
          clientId: proposal.clientId,
          companyId: proposal.companyId,
          rejectionReason: proposal.rejectionReason,
          createdAt: proposal.createdAt,
          updatedAt: proposal.updatedAt,
        }));
        setProposals(mapped);
      } catch (err) {
        setError(err.message || "Failed to fetch proposals");
        console.error("Error fetching proposals:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProposals();
  }, [clientId]);

  const handleProposalUpdate = (updatedProposal) => {
    // Update the proposal in the list
    setProposals((prev) =>
      prev.map((p) => (p.id === updatedProposal.id ? updatedProposal : p)),
    );
    setIsModalOpen(false);
  };

  const handleViewProposal = (proposal) => {
    setSelectedProposal(proposal);
    setIsModalOpen(true);
  };

  if (!clientId) {
    return (
      <div className="p-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
        Please log in to view proposals.
      </div>
    );
  }

  return (
    <>
      <Proposals
        isClient
        useModal={true}
        proposals={proposals}
        loading={loading}
        error={error}
        clientId={clientId}
        onViewProposal={handleViewProposal}
      />
      <ProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        proposal={selectedProposal}
        clientId={clientId}
        onProposalUpdate={handleProposalUpdate}
      />
    </>
  );
}
