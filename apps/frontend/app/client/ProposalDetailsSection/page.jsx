"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { getClientProposalById } from "@/services/api";
import {
  cacheProposalDetails,
  mergeProposalWithCachedDetails,
} from "@/utils/proposalDetailsCache";

const ProposalDetailsSection = dynamic(
  () => import("@/pages/ProposalDetailsSection"),
  { ssr: false },
);

export default function ClientProposalDetailsSectionPage() {
  const router = useRouter();
  const [selectedProject, setSelectedProject] = useState(null);
  const [detailsView, setDetailsView] = useState(null);
  const [projectBudgetData, setProjectBudgetData] = useState([]);
  const [projectTimelineData, setProjectTimelineData] = useState([]);
  const [clientId, setClientId] = useState(null);

  useEffect(() => {
    const hydrateProposal = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
        const explicitClientId = localStorage.getItem("clientId");
        const resolvedClientId =
          explicitClientId ||
          user.clientId ||
          user.id ||
          user.userId ||
          user._id ||
          null;

        setClientId(resolvedClientId);

        const proposalId = new URLSearchParams(window.location.search).get(
          "proposalId",
        );
        const storedProposal = window.sessionStorage.getItem("crms:selectedProposal");

        if (storedProposal) {
          const parsed = mergeProposalWithCachedDetails(JSON.parse(storedProposal));
          setSelectedProject(parsed);
          setProjectBudgetData(Array.isArray(parsed.budgetData) ? parsed.budgetData : []);
          setProjectTimelineData(Array.isArray(parsed.timelines) ? parsed.timelines : []);
        }

        if (proposalId) {
          const proposal = mergeProposalWithCachedDetails(
            await getClientProposalById(proposalId),
          );
          const mergedProposal = {
            ...proposal,
            submittedAt: proposal.createdAt
              ? new Date(proposal.createdAt).toLocaleDateString()
              : "-",
          };

          setSelectedProject(mergedProposal);
          setProjectBudgetData(
            Array.isArray(mergedProposal.budgetData) ? mergedProposal.budgetData : [],
          );
          setProjectTimelineData(
            Array.isArray(mergedProposal.timelines) ? mergedProposal.timelines : [],
          );
          cacheProposalDetails(proposalId, {
            budgetData: mergedProposal.budgetData || [],
            timelines: mergedProposal.timelines || [],
          });
          window.sessionStorage.setItem(
            "crms:selectedProposal",
            JSON.stringify(mergedProposal),
          );
        }
      } catch {
        setSelectedProject(null);
      }
    };

    hydrateProposal();
  }, []);

  const handleProposalUpdate = (updatedProposal) => {
    const mergedProposal = {
      ...updatedProposal,
      submittedAt: updatedProposal?.createdAt
        ? new Date(updatedProposal.createdAt).toLocaleDateString()
        : selectedProject?.submittedAt || "-",
    };

    setSelectedProject(mergedProposal);
    cacheProposalDetails(mergedProposal?.id, {
      budgetData: mergedProposal?.budgetData || [],
      timelines: mergedProposal?.timelines || [],
    });
    window.sessionStorage.setItem(
      "crms:selectedProposal",
      JSON.stringify(mergedProposal),
    );

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
      projectTimelineData={projectTimelineData}
      clientId={clientId}
      onProposalUpdate={handleProposalUpdate}
    />
  );
}
