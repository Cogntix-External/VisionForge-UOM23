"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardSection from "@/pages/DashboardSection";
import { getCompanyProjects, getRegisteredClients } from "@/services/api";

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

const formatDateTime = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString();
};

const mapProject = (project, clientNameById = {}) => ({
  id: project.id,
  title: project.name || project.title || "Untitled Project",
  owner: project.clientId || "Not assigned",
  clientName:
    project.clientName ||
    clientNameById[project.clientId] ||
    "Not available",
  status: String(project.status || "ACTIVE").toUpperCase(),
  state: String(project.status || "ACTIVE").toUpperCase(),
  lastUpdated: formatDateTime(project.updatedAt || project.createdAt),
  createdAt: project.createdAt,
  proposalId: project.proposalId,
  companyId: project.companyId,
  clientId: project.clientId,
  description: project.description,
});

export default function CompanyDashboardSectionPage() {
  const router = useRouter();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [companyId, setCompanyId] = useState(null);

  useEffect(() => {
    const resolvedCompanyId = resolveCompanyId();
    setCompanyId(resolvedCompanyId);

    if (!resolvedCompanyId) {
      setError("Company ID is missing. Please login again.");
      setLoading(false);
      return undefined;
    }

    let isMounted = true;

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");
        const [projectsResponse, clientsResponse] = await Promise.all([
          getCompanyProjects(resolvedCompanyId),
          getRegisteredClients(),
        ]);
        if (!isMounted) return;

        const clientNameById = (Array.isArray(clientsResponse) ? clientsResponse : []).reduce(
          (accumulator, client) => {
            accumulator[client.id] = client.fullName || client.email || client.id;
            return accumulator;
          },
          {},
        );

        const list = Array.isArray(projectsResponse)
          ? projectsResponse.map((project) => mapProject(project, clientNameById))
          : [];
        setProjects(list);
      } catch (loadError) {
        if (!isMounted) return;
        setError(loadError.message || "Failed to fetch projects");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProjects();
    const intervalId = window.setInterval(loadProjects, 8000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="p-4 rounded border border-blue-200 bg-blue-50 text-blue-800">
          Loading projects...
        </div>
      )}

      {error && (
        <div className="p-4 rounded border border-red-200 bg-red-50 text-red-800">
          {error}
        </div>
      )}

      <DashboardSection
        projects={projects}
        onCreate={() => {
          router.push("/company/CreateProposalSection");
        }}
      />
    </div>
  );
}