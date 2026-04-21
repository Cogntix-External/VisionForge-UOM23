import React, { useEffect, useMemo, useState } from "react";
import { Icons } from "../constants";
import {
  getClientDashboard,
  getCompanyDashboard,
  getClientChangeRequests,
} from "../services/api";

const normalizeRole = (rawRole) => {
  if (!rawRole) return "";
  const role = String(rawRole).trim().toUpperCase();

  if (role === "ROLE_CLIENT") return "CLIENT";
  if (role === "ROLE_COMPANY") return "COMPANY";

  return role;
};

const Dashboard = ({ user, role }) => {
  const resolvedRole = useMemo(() => {
    const propRole = normalizeRole(role);
    if (propRole) return propRole;

    if (typeof window !== "undefined") {
      const storedRole = normalizeRole(localStorage.getItem("crms_role"));
      if (storedRole) return storedRole;

      try {
        const storedUser = JSON.parse(localStorage.getItem("crms_user") || "{}");
        return normalizeRole(storedUser?.role);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }

    return "";
  }, [role]);

  const resolvedUser = useMemo(() => {
    if (user) return user;

    if (typeof window !== "undefined") {
      try {
        return JSON.parse(localStorage.getItem("crms_user") || "{}");
      } catch (error) {
        console.error("Failed to parse stored user:", error);
      }
    }

    return null;
  }, [user]);

  const [dashboardData, setDashboardData] = useState(null);
  const [pendingCRs, setPendingCRs] = useState(0);
  const [approvedCRs, setApprovedCRs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        if (!resolvedRole) {
          throw new Error("User role not found");
        }

        const data =
          resolvedRole === "COMPANY"
            ? await getCompanyDashboard()
            : await getClientDashboard();

        console.log("Dashboard data:", data);
        setDashboardData(data || {});
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err?.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [resolvedRole]);

  useEffect(() => {
    const fetchClientCRCounts = async () => {
      if (resolvedRole !== "CLIENT") return;

      try {
        const crs = await getClientChangeRequests();
        console.log("Client CRs:", crs);

        let pending = 0;
        let approved = 0;

        (Array.isArray(crs) ? crs : []).forEach((cr) => {
          const status = String(cr?.status || "").trim().toUpperCase();

          console.log("CR STATUS:", status);

          if (status.includes("PENDING")) {
            pending++;
          }

          if (status.includes("APPROVED") || status.includes("ACCEPTED")) {
            approved++;
          }
        });

        setPendingCRs(pending);
        setApprovedCRs(approved);
      } catch (err) {
        console.error("CR count fetch error:", err);
        setPendingCRs(0);
        setApprovedCRs(0);
      }
    };

    fetchClientCRCounts();
  }, [resolvedRole]);

  const isCompany = resolvedRole === "COMPANY";
  const safeData = dashboardData || {};

  const recentProjects = Array.isArray(safeData.recentProjects)
    ? safeData.recentProjects
    : [];

  const recentProposals = Array.isArray(safeData.recentProposals)
    ? safeData.recentProposals
    : [];

  if (loading) {
    return (
      <div className="space-y-10 -mt-6 relative z-10 px-4 pb-10">
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
          <p className="text-lg font-semibold text-gray-600">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-10 -mt-6 relative z-10 px-4 pb-10">
        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-red-200">
          <p className="text-lg font-semibold text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 -mt-6 relative z-10 px-4 pb-10">
      <div className="bg-white rounded-[32px] p-8 shadow-xl border border-gray-100">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Welcome, {resolvedUser?.fullName || resolvedUser?.name || "User"} 👋
        </h2>
        <p className="text-gray-500 mt-2 font-medium">
          {isCompany
            ? "Here is your company dashboard overview."
            : "Here is your client dashboard overview."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {isCompany ? (
          <>
            <StatCard
              title="Total Projects"
              value={safeData.totalProjects || 0}
              icon={<Icons.Projects />}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Pending Approvals"
              value={safeData.pendingApprovals || 0}
              icon={<Icons.Documents />}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              title="Accepted Proposals"
              value={safeData.acceptedProposals || 0}
              icon={<Icons.ChangeRequests />}
              color="from-amber-500 to-amber-600"
            />
            <StatCard
              title="Active Projects"
              value={safeData.activeProjects || 0}
              icon={<Icons.Kanban />}
              color="from-emerald-500 to-emerald-600"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Accepted Projects"
              value={safeData.acceptedProjectsCount || 0}
              icon={<Icons.Projects />}
              color="from-blue-500 to-blue-600"
            />
            <StatCard
              title="Pending Proposals"
              value={safeData.pendingProposalsCount || 0}
              icon={<Icons.Documents />}
              color="from-purple-500 to-purple-600"
            />
            <StatCard
              title="Pending CRs"
              value={pendingCRs}
              icon={<Icons.ChangeRequests />}
              color="from-amber-500 to-amber-600"
            />
            <StatCard
              title="Approved CRs"
              value={approvedCRs}
              icon={<Icons.Kanban />}
              color="from-emerald-500 to-emerald-600"
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 bg-white rounded-[32px] p-10 shadow-xl border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900">
              {isCompany ? "Recent Projects" : "Recent Proposals"}
            </h3>
            <button
              type="button"
              className="text-[#7c3aed] font-bold hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-6">
            {isCompany ? (
              recentProjects.length > 0 ? (
                recentProjects.map((project, index) => (
                  <ActivityItem
                    key={project?.id || index}
                    title={
                      project?.projectName ||
                      project?.name ||
                      "Untitled Project"
                    }
                    desc={`Owner: ${project?.owner || "Unknown"} | Status: ${
                      project?.status || "UNKNOWN"
                    }`}
                    time={project?.lastUpdated || ""}
                  />
                ))
              ) : (
                <p className="text-gray-500 font-medium">
                  No recent projects found.
                </p>
              )
            ) : recentProposals.length > 0 ? (
              recentProposals.map((proposal, index) => (
                <ActivityItem
                  key={proposal?.id || index}
                  title={proposal?.title || "Untitled Proposal"}
                  desc={proposal?.description || "No description provided"}
                  time={
                    proposal?.updatedAt
                      ? new Date(proposal.updatedAt).toLocaleDateString()
                      : proposal?.createdAt
                        ? new Date(proposal.createdAt).toLocaleDateString()
                        : ""
                  }
                />
              ))
            ) : (
              <p className="text-gray-500 font-medium">
                No recent activity found.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-[32px] p-10 shadow-xl border border-gray-100 flex flex-col">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            {isCompany ? "Project Overview" : "Recent Projects"}
          </h3>

          <div className="space-y-8 flex-1">
            {isCompany ? (
              <>
                <HealthItem
                  name="Total Proposals"
                  progress={safeData.totalProposals || 0}
                  isCount
                />
                <HealthItem
                  name="Accepted Proposals"
                  progress={safeData.acceptedProposals || 0}
                  isCount
                />
                <HealthItem
                  name="Rejected Proposals"
                  progress={safeData.rejectedProposals || 0}
                  isCount
                />
              </>
            ) : recentProjects.length > 0 ? (
              recentProjects.map((project, index) => (
                <HealthItem
                  key={project?.id || index}
                  name={
                    project?.name ||
                    project?.projectName ||
                    "Untitled Project"
                  }
                  progress={
                    typeof project?.progress === "number"
                      ? project.progress
                      : project?.status === "ACTIVE"
                        ? 100
                        : 0
                  }
                />
              ))
            ) : (
              <p className="text-gray-500 font-medium">
                No project health data found.
              </p>
            )}
          </div>

          <button
            type="button"
            className="w-full mt-10 py-4 bg-[#7c3aed] text-white font-bold rounded-2xl hover:bg-[#6d28d9] transition-all shadow-lg shadow-purple-200"
          >
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, color, icon }) => (
  <div className="bg-white p-8 rounded-[32px] shadow-xl border border-gray-100 relative overflow-hidden group">
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-5 -mr-10 -mt-10 rounded-full transition-transform group-hover:scale-110`}
    />
    <div className="flex justify-between items-start relative">
      <div>
        <p className="text-gray-500 text-lg font-semibold">{title}</p>
        <p className="text-4xl font-extrabold mt-2 text-gray-900">{value}</p>
      </div>
      <div
        className={`p-4 rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}
      >
        {icon}
      </div>
    </div>
  </div>
);

const ActivityItem = ({ title, desc, time }) => (
  <div className="flex items-center p-6 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer">
    <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 mr-6">
      <Icons.Documents />
    </div>
    <div className="flex-1">
      <h4 className="font-bold text-gray-900 text-lg">{title}</h4>
      <p className="text-gray-500 font-medium">{desc}</p>
    </div>
    <span className="text-gray-400 font-bold ml-6 whitespace-nowrap">
      {time}
    </span>
  </div>
);

const HealthItem = ({ name, progress, isCount = false }) => {
  const safeProgress = Number(progress) || 0;
  const widthValue = isCount ? Math.min(safeProgress * 10, 100) : safeProgress;

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-bold text-gray-700 text-lg">{name}</span>
        <span className="font-extrabold text-[#7c3aed] text-lg">
          {isCount ? safeProgress : `${safeProgress}%`}
        </span>
      </div>
      <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-[#7c3aed] to-[#c084fc] h-full rounded-full"
          style={{ width: `${widthValue}%` }}
        />
      </div>
    </div>
  );
};

export default Dashboard;