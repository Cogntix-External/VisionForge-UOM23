"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProposalsListSection from "@/pages/ProposalsListSection";
import { getCompanyProposals } from "@/services/api";

export default function CompanyProposalsListSectionPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("crms_user") || "{}");
      const explicitCompanyId = localStorage.getItem("companyId");
      const latestProposal = JSON.parse(
        sessionStorage.getItem("crms:latestCompanyProposal") || "null",
      );
      const resolvedCompanyId =
        explicitCompanyId ||
        user.companyId ||
        user.id ||
        user.userId ||
        user._id ||
        latestProposal?.companyId ||
        null;
      setCompanyId(resolvedCompanyId);
    } catch {
      setCompanyId(null);
    }
  }, []);

  useEffect(() => {
    if (!companyId) return;

    const fetchProposals = async () => {
      try {
        const data = await getCompanyProposals(companyId);
        const serverList = Array.isArray(data) ? data : [];
        const latestRaw = sessionStorage.getItem("crms:latestCompanyProposal");
        const latestProposal = latestRaw ? JSON.parse(latestRaw) : null;

        if (
          latestProposal &&
          latestProposal.companyId === companyId &&
          !serverList.some((item) => item.id === latestProposal.id)
        ) {
          setProjects([latestProposal, ...serverList]);
        } else {
          setProjects(serverList);
        }
      } catch {
        const latestRaw = sessionStorage.getItem("crms:latestCompanyProposal");
        const latestProposal = latestRaw ? JSON.parse(latestRaw) : null;
        if (latestProposal && latestProposal.companyId === companyId) {
          setProjects([latestProposal]);
        } else {
          setProjects([]);
        }
      }
    };

    fetchProposals();
  }, [companyId]);

  const mappedProjects = useMemo(
    () =>
      projects.map((proposal) => ({
        id: proposal.id,
        title: proposal.title,
        client: proposal.clientId || "N/A",
        budget: "-",
        duration: "-",
        raw: proposal,
      })),
    [projects],
  );

  return (
    <ProposalsListSection
      projects={mappedProjects}
      onCreate={() => {
        router.push("/company/CreateProposalSection");
      }}
      onSelect={(proposalRow) => {
        const selectedProposal = proposalRow.raw || proposalRow;
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(
            "crms:selectedProposal",
            JSON.stringify(selectedProposal),
          );
        }
        router.push("/company/ProposalDetailsSection");
      }}
    />
  );
}