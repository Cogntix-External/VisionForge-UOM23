"use client";

import { useRouter } from "next/navigation";
import ProposalsListSection from "@/pages/ProposalsListSection";

export default function CompanyProposalsListSectionPage() {
  const router = useRouter();

  return (
    <ProposalsListSection
      onCreate={() => {
        router.push("/company/CreateProposalSection");
      }}
    />
  );
}