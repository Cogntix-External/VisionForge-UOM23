"use client";

import { useState, useEffect } from "react";
import Proposals from "@/pages/Proposals";
import { getClientProposals } from "@/services/api";

export default function ClientProposalsPage() {
  const [clientId, setClientId] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get clientId from localStorage or context
  useEffect(() => {
    const storedClientId = localStorage.getItem("clientId");
    if (storedClientId) {
      setClientId(storedClientId);
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
        setProposals(data);
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
  };

  if (!clientId) {
    return (
      <div className="p-8 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
        Please log in to view proposals.
      </div>
    );
  }

  return (
    <Proposals
      isClient
      proposals={proposals}
      loading={loading}
      error={error}
      clientId={clientId}
      onProposalUpdate={handleProposalUpdate}
    />
  );
}
