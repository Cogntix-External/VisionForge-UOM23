"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileEdit,
  FileText,
  History,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "../utils/cn.js";
import { createPrd, fetchPrds, getCompanyProjects } from "@/services/api";
import { getToken } from "@/utils/auth";

const emptyStakeholder = () => ({ role: "", name: "", responsibility: "" });

const emptyMilestone = () => ({
  phase: "",
  task: "",
  duration: "",
  responsibility: "",
});

const createEmptyForm = () => ({
  projectId: "",
  projectName: "",
  author: "",
  dateSubmitted: "",
  purpose: "",
  problemToSolve: "",
  projectGoal: "",
  stakeholders: [emptyStakeholder()],
  inScope: "",
  outOfScope: "",
  mainFeatures: "",
  functionalRequirement: "",
  nonFunctionalRequirement: "",
  userRoles: "",
  risksDependencies: "",
  milestones: [emptyMilestone()],
});

const stripHtml = (value) =>
  String(value || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();

const hasText = (value) => stripHtml(value).length > 0;

const editorFieldClass = (value, extraClassName = "") =>
  cn(
    "prd-editor-input",
    !hasText(value) && "prd-editor-input--empty",
    extraClassName
  );

const countFilledValues = (values) => values.filter(hasText).length;

const getProjectId = (project) => project?.id || project?._id || "";

function validateForm(form) {
  const scalarFields = [
    form.projectId,
    form.projectName,
    form.author,
    form.dateSubmitted,
    form.purpose,
    form.problemToSolve,
    form.projectGoal,
    form.inScope,
    form.outOfScope,
    form.mainFeatures,
    form.functionalRequirement,
    form.nonFunctionalRequirement,
    form.userRoles,
    form.risksDependencies,
  ];

  if (!scalarFields.every(hasText)) return false;

  const validStakeholders =
    form.stakeholders.length > 0 &&
    form.stakeholders.every(
      (item) =>
        hasText(item.role) &&
        hasText(item.name) &&
        hasText(item.responsibility)
    );

  const validMilestones =
    form.milestones.length > 0 &&
    form.milestones.every(
      (item) =>
        hasText(item.phase) &&
        hasText(item.task) &&
        hasText(item.duration) &&
        hasText(item.responsibility)
    );

  return validStakeholders && validMilestones;
}

function normalizePrd(prd, project) {
  return {
    ...prd,
    id: prd?.id || prd?._id || prd?.prdId || project?.prdId || project?.id,
    projectId: prd?.projectId || project?.id || project?._id,
    title:
      prd?.title ||
      prd?.projectName ||
      project?.name ||
      project?.title ||
      "Untitled PRD",
    status: prd?.status || "IN REVIEW",
    createdDate:
      prd?.createdDate ||
      prd?.createdAt ||
      prd?.dateSubmitted ||
      prd?.lastModified ||
      "-",
  };
}

function PrdRepositorySectionView({
  prdList = [],
  searchQuery = "",
  onSearchChange = () => {},
  onCreate = () => {},
  onReview = () => {},
  isLoading = false,
}) {
  const inReviewCount = prdList.filter((item) =>
    String(item.status || "").toLowerCase().includes("review")
  ).length;

  const StatCard = ({ label, value, icon: Icon, color }) => (
    <div className="flex min-w-[200px] flex-1 items-center gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className={cn("rounded-2xl p-3", color)}>
        <Icon size={24} className="text-white" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-6">
        <StatCard
          label="Total PRDs"
          value={prdList.length}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          label="PRDs in review"
          value={inReviewCount}
          icon={FileEdit}
          color="bg-orange-400"
        />
        <StatCard
          label="Avg. Review Time"
          value="4d"
          icon={History}
          color="bg-blue-400"
        />

        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-2xl bg-[#000080] px-8 py-4 font-semibold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-900"
        >
          <Plus size={20} />
          Create New PRD
        </button>
      </div>

      <div className="rounded-[2rem] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="relative mb-8">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
            size={20}
          />

          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border-none bg-[#F8F9FE] py-4 pl-12 pr-4 transition-all focus:ring-2 focus:ring-[#5D57A3]/20"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50 text-sm uppercase tracking-wider text-gray-400">
                <th className="px-4 pb-4 font-semibold">Project ID</th>
                <th className="px-4 pb-4 font-semibold">Title</th>
                <th className="px-4 pb-4 font-semibold">Status</th>
                <th className="px-4 pb-4 font-semibold">Created Date</th>
                <th className="pb-4 text-center font-semibold">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Loading PRDs...
                  </td>
                </tr>
              )}

              {!isLoading && prdList.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    No PRDs found. Create your first PRD.
                  </td>
                </tr>
              )}

              {!isLoading &&
                prdList.map((prd, index) => (
                  <tr
                    key={prd.id || `${prd.projectId}-${index}`}
                    className="group transition-colors hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-6 font-bold text-gray-700">
                      {prd.projectId || "-"}
                    </td>

                    <td className="max-w-xs px-4 py-6 font-bold text-gray-800">
                      {prd.title}
                    </td>

                    <td className="px-4 py-6">
                      <span className="font-medium text-gray-800">
                        {prd.status}
                      </span>
                    </td>

                    <td className="px-4 py-6 font-medium text-gray-500">
                      {prd.createdDate}
                    </td>

                    <td className="px-4 py-6">
                      <div className="flex justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => onReview(prd)}
                          className="rounded-xl bg-black px-6 py-2 text-sm font-bold text-white shadow-md transition-all duration-300 hover:scale-105 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-violet-600 hover:shadow-[0_10px_30px_rgba(99,102,241,0.45)]"
                        >
                          Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function CompanyPrdRepositorySection() {
  const router = useRouter();

  const [prdList, setPrdList] = useState([]);
  const [companyProjects, setCompanyProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(createEmptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  // Check if PRD is empty/incomplete (should not be displayed)
  const isPrdEmpty = (prd) => {
    if (!prd) return true;
    const fields = [
      prd.author,
      prd.purpose,
      prd.problemToSolve,
      prd.projectGoal,
      prd.inScope,
      prd.outOfScope,
      prd.mainFeatures,
      prd.functionalRequirement,
      prd.nonFunctionalRequirement,
      prd.userRoles,
      prd.risksDependencies,
    ];

    // Check if any critical field is missing
    if (fields.some((field) => !field || String(field).trim() === "" || String(field) === "-")) {
      return true;
    }

    // Check if stakeholders or milestones are missing
    if (!prd.stakeholders || prd.stakeholders.length === 0) return true;
    if (!prd.milestones || prd.milestones.length === 0) return true;

    return false;
  };

  const loadProjectsAndPrds = async () => {
    const token = getToken();
    if (!token) return;

    try {
      setIsLoading(true);

      const projects = await getCompanyProjects();
      const projectList = Array.isArray(projects) ? projects : [];

      const activeProjects = projectList.filter(
        (project) => String(project.status || "").toUpperCase() === "ACTIVE"
      );

      setCompanyProjects(activeProjects);

      const projectMap = new Map(
        activeProjects.map((project) => [String(getProjectId(project)), project])
      );
      const allPrds = await fetchPrds();
      const prdsByProject = new Map();

      // Filter out empty/incomplete PRDs - only show PRDs with complete information
      (Array.isArray(allPrds) ? allPrds : [])
        .map((prd) =>
          normalizePrd(prd, projectMap.get(String(prd?.projectId || "")))
        )
        .filter((prd) => !isPrdEmpty(prd))
        .forEach((prd) => {
          const key = String(prd.projectId || prd.id || "");

          if (key && !prdsByProject.has(key)) {
            prdsByProject.set(key, prd);
          }
        });

      setPrdList(Array.from(prdsByProject.values()));
    } catch (error) {
      console.error("Failed to load PRDs:", error);
      setPrdList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProjectsAndPrds();
  }, []);

  useEffect(() => {
    if (!isModalOpen) return;

    const loadProjects = async () => {
      const token = getToken();
      if (!token) return;

      try {
        setIsLoadingProjects(true);

        const projects = await getCompanyProjects();
        const acceptedProjects = Array.isArray(projects)
          ? projects.filter(
              (project) =>
                String(project.status || "").toUpperCase() === "ACTIVE"
            )
          : [];
        const existingPrds = await fetchPrds();
        const projectIdsWithPrds = new Set(
          (Array.isArray(existingPrds) ? existingPrds : [])
            .map((prd) => String(prd?.projectId || ""))
            .filter(Boolean)
        );

        setCompanyProjects(
          acceptedProjects.filter(
            (project) => !projectIdsWithPrds.has(String(getProjectId(project)))
          )
        );
      } catch (error) {
        console.error("Failed to load projects:", error);
        setCompanyProjects([]);
      } finally {
        setIsLoadingProjects(false);
      }
    };

    loadProjects();
  }, [isModalOpen]);

  const filteredPrds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return prdList;

    return prdList.filter((prd) =>
      [prd.projectId, prd.title, prd.status, prd.createdDate]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [prdList, searchQuery]);

  const resetForm = () => {
    setForm(createEmptyForm());
    setErrorMessage("");
  };

  const applyProjectSelection = (projectId) => {
    const selectedProject = companyProjects.find(
      (project) => String(getProjectId(project)) === String(projectId)
    );

    setForm((prev) => ({
      ...prev,
      projectId: getProjectId(selectedProject),
      projectName: selectedProject?.name || selectedProject?.title || "",
      author:
        selectedProject?.clientId ||
        selectedProject?.clientName ||
        selectedProject?.author ||
        "",
    }));

    if (!selectedProject && projectId) {
      setErrorMessage("Selected project is not available.");
    } else {
      setErrorMessage("");
    }
  };

  const openCreateModal = () => {
    setSubmitMessage("");
    setIsModalOpen(true);
    resetForm();

    const token = getToken();

    if (!token) {
      setErrorMessage("Please log in again to load PRDs.");
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const updateField = (field) => (event) => {
    setForm((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));

    setErrorMessage("");
  };

  const updateStakeholder = (index, field) => (event) => {
    const value = event.target.value;

    setForm((prev) => {
      const next = [...prev.stakeholders];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      return { ...prev, stakeholders: next };
    });

    setErrorMessage("");
  };

  const addStakeholder = () => {
    setForm((prev) => ({
      ...prev,
      stakeholders: [...prev.stakeholders, emptyStakeholder()],
    }));
  };

  const removeStakeholder = (index) => {
    setForm((prev) => {
      if (prev.stakeholders.length === 1) return prev;

      return {
        ...prev,
        stakeholders: prev.stakeholders.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };
    });
  };

  const updateMilestone = (index, field) => (event) => {
    const value = event.target.value;

    setForm((prev) => {
      const next = [...prev.milestones];
      next[index] = {
        ...next[index],
        [field]: value,
      };

      return { ...prev, milestones: next };
    });

    setErrorMessage("");
  };

  const addMilestone = () => {
    setForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, emptyMilestone()],
    }));
  };

  const removeMilestone = (index) => {
    setForm((prev) => {
      if (prev.milestones.length === 1) return prev;

      return {
        ...prev,
        milestones: prev.milestones.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitMessage("");

    if (!validateForm(form)) {
      setErrorMessage(
        "Please fill every field, plus at least one stakeholder and one milestone."
      );
      return;
    }

    if (prdList.some((prd) => String(prd.projectId) === String(form.projectId))) {
      setErrorMessage("A PRD already exists for this project.");
      return;
    }

    const token = getToken();

    if (!token) {
      setErrorMessage("Please log in again before submitting.");
      return;
    }

    try {
      setIsSaving(true);

      const created = await createPrd(form.projectId, form);
      const normalizedCreated = normalizePrd(created, {
        id: form.projectId,
        name: form.projectName,
      });

      setPrdList((prev) => [normalizedCreated, ...prev]);
      setSubmitMessage("PRD submitted successfully.");
      closeModal();
      await loadProjectsAndPrds();
    } catch (error) {
      setErrorMessage(error.message || "Failed to submit PRD.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToPrdDetails = (prd) => {
    const prdId = prd?.id || prd?._id || prd?.prdId;

    if (!prdId) {
      setErrorMessage("Selected PRD does not have an id.");
      return;
    }

    router.push(
      `/company/Prd-details&Editor?prdId=${encodeURIComponent(prdId)}`
    );
  };

  const editorCompletion = useMemo(() => {
    const coreFields = [
      form.projectId,
      form.projectName,
      form.author,
      form.dateSubmitted,
      form.purpose,
      form.problemToSolve,
      form.projectGoal,
      form.inScope,
      form.outOfScope,
      form.mainFeatures,
      form.functionalRequirement,
      form.nonFunctionalRequirement,
      form.userRoles,
      form.risksDependencies,
    ];

    const stakeholderFields = form.stakeholders.flatMap((item) => [
      item.role,
      item.name,
      item.responsibility,
    ]);

    const milestoneFields = form.milestones.flatMap((item) => [
      item.phase,
      item.task,
      item.duration,
      item.responsibility,
    ]);

    const total =
      coreFields.length + stakeholderFields.length + milestoneFields.length;
    const completed =
      countFilledValues(coreFields) +
      countFilledValues(stakeholderFields) +
      countFilledValues(milestoneFields);

    return {
      completed,
      total,
      percent: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [form]);

  const documentSections = useMemo(
    () => [
      {
        label: "Basic Information",
        state:
          form.projectId && form.projectName && form.author && form.dateSubmitted
            ? "complete"
            : "missing",
      },
      {
        label: "Project Overview",
        state:
          form.purpose && form.problemToSolve && form.projectGoal
            ? "complete"
            : "missing",
      },
      {
        label: "Key Stakeholders",
        state: form.stakeholders.every(
          (item) => item.role && item.name && item.responsibility
        )
          ? "complete"
          : "missing",
      },
      {
        label: "Scope",
        state: form.inScope && form.outOfScope ? "complete" : "missing",
      },
      {
        label: "Requirements",
        state:
          form.mainFeatures &&
          form.functionalRequirement &&
          form.nonFunctionalRequirement
            ? "complete"
            : "missing",
      },
      {
        label: "Roles and Risks",
        state: form.userRoles && form.risksDependencies ? "complete" : "missing",
      },
      {
        label: "Timeline",
        state: form.milestones.every(
          (item) => item.phase && item.task && item.duration && item.responsibility
        )
          ? "complete"
          : "missing",
      },
    ],
    [form]
  );

  return (
    <>
      <PrdRepositorySectionView
        prdList={filteredPrds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreate={openCreateModal}
        onReview={goToPrdDetails}
        isLoading={isLoading}
      />

      {submitMessage && (
        <p className="mt-3 text-sm font-medium text-green-600">
          {submitMessage}
        </p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-[#F5F7FB] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-300 px-6 py-5">
              <h2 className="text-3xl font-extrabold text-[#1A1A40]">
                Create New PRD
              </h2>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto px-6 py-6">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-[#F7F8FC] p-3 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1A1A40]">
                      Document editor
                    </p>
                    <h3 className="mt-1 text-base font-semibold text-slate-900">
                      Create a structured PRD document.
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      The form behaves like a document canvas with section guidance.
                    </p>
                  </div>

                  <div className="min-w-[160px] text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {editorCompletion.percent}% ready
                    </p>
                    <p className="text-xs text-slate-500">
                      {editorCompletion.completed} of {editorCompletion.total}{" "}
                      fields filled
                    </p>
                  </div>
                </div>

                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#1A1A40] to-[#5D57A3] transition-all"
                    style={{ width: `${editorCompletion.percent}%` }}
                  />
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-2">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Writing guidance
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-700">
                        Empty fields are highlighted
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Use short sentences in long fields
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">
                        Keep items specific and measurable
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-2 relative">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Document outline
                    </p>
                    <div className="mt-2 flex flex-col gap-2">
                      {documentSections.map((section) => (
                        <button
                          key={section.label}
                          onClick={() => {
                            const id = `section-${section.label
                              .toLowerCase()
                              .replace(/[^a-z0-9]+/g, "-")}`;
                            const el = document.getElementById(id);
                            if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                          }}
                          className={cn(
                            "text-left rounded-md px-3 py-1 text-xs font-semibold w-full",
                            section.state === "complete"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          )}
                        >
                          {section.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <section id="section-basic-information" className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <h3 id="section-Basic-Information" className="border-b border-slate-400 pb-2 text-lg font-bold text-slate-800">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                  <select
                    className={editorFieldClass(form.projectId)}
                    value={form.projectId}
                    onChange={(event) =>
                      applyProjectSelection(event.target.value)
                    }
                  >
                    <option value="">Select accepted project</option>

                    {isLoadingProjects && (
                      <option value="">Loading projects...</option>
                    )}

                    {companyProjects.map((project) => {
                      const projectId = getProjectId(project);

                      return (
                        <option key={projectId} value={projectId}>
                          {project.name || project.title || projectId} (
                          {project.clientName ||
                            project.clientId ||
                            "No client"}
                          )
                        </option>
                      );
                    })}
                  </select>

                  <input
                    className={editorFieldClass(form.projectName)}
                    placeholder="Project Name"
                    value={form.projectName}
                    readOnly
                  />

                  <input
                    className={editorFieldClass(form.author)}
                    placeholder="Client ID"
                    value={form.author}
                    readOnly
                  />

                  <input
                    className={editorFieldClass(form.dateSubmitted)}
                    type="date"
                    value={form.dateSubmitted}
                    onChange={updateField("dateSubmitted")}
                  />
                </div>

                {companyProjects.length === 0 && !isLoadingProjects && (
                  <p className="text-sm font-medium text-amber-600">
                    No accepted projects found. Accept a proposal first, then
                    create PRD from that project.
                  </p>
                )}
              </section>

              <section id="section-project-overview" className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <h3 id="section-Project-Overview" className="border-b border-slate-400 pb-2 text-lg font-bold text-slate-800">
                  Project Overview
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  <RichTextField
                    placeholder="Purpose"
                    value={form.purpose}
                    onChange={updateField("purpose")}
                    compact
                  />

                  <RichTextField
                    placeholder="Problem to solve"
                    value={form.problemToSolve}
                    onChange={updateField("problemToSolve")}
                    compact
                  />

                  <RichTextField
                    placeholder="Project Goal"
                    value={form.projectGoal}
                    onChange={updateField("projectGoal")}
                    compact
                  />
                </div>
              </section>

              <section id="section-key-stakeholders" className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-400 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    Key Stakeholders
                  </h3>

                  <button
                    type="button"
                    onClick={addStakeholder}
                    className="flex items-center gap-1 rounded-lg bg-[#1A1A40] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <Plus size={16} /> Add Stakeholder
                  </button>
                </div>

                {form.stakeholders.map((item, index) => (
                  <div
                    key={`stakeholder-${index}`}
                    className="grid grid-cols-1 items-center gap-3 md:grid-cols-12"
                  >
                    <input
                      className={editorFieldClass(item.role, "md:col-span-3")}
                      placeholder="Role"
                      value={item.role}
                      onChange={updateStakeholder(index, "role")}
                    />

                    <input
                      className={editorFieldClass(item.name, "md:col-span-3")}
                      placeholder="Name"
                      value={item.name}
                      onChange={updateStakeholder(index, "name")}
                    />

                    <input
                      className={editorFieldClass(
                        item.responsibility,
                        "md:col-span-5"
                      )}
                      placeholder="Responsibility"
                      value={item.responsibility}
                      onChange={updateStakeholder(index, "responsibility")}
                    />

                    <button
                      type="button"
                      onClick={() => removeStakeholder(index)}
                      disabled={form.stakeholders.length === 1}
                      className="justify-self-end text-red-500 disabled:text-slate-300 md:col-span-1"
                      aria-label="Delete stakeholder"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </section>

              <section id="section-scope" className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <h3 id="section-Scope" className="border-b border-slate-400 pb-2 text-lg font-bold text-slate-800">
                  Scope
                </h3>

                <div className="grid grid-cols-1 gap-5">
                  <RichTextField
                    placeholder="In Scope"
                    value={form.inScope}
                    onChange={updateField("inScope")}
                  />

                  <RichTextField
                    placeholder="Out of Scope"
                    value={form.outOfScope}
                    onChange={updateField("outOfScope")}
                  />
                </div>
              </section>

              <RichTextField
                title="Main Features"
                value={form.mainFeatures}
                onChange={updateField("mainFeatures")}
                helperText="List the core features the PRD must include."
              />

              <RichTextField
                title="Functional Requirement"
                value={form.functionalRequirement}
                onChange={updateField("functionalRequirement")}
                helperText="Capture what the system should do in clear statements."
              />

              <RichTextField
                title="Non Functional Requirement"
                value={form.nonFunctionalRequirement}
                onChange={updateField("nonFunctionalRequirement")}
                helperText="Add performance, security, usability, or reliability needs."
              />

              <RichTextField
                title="User Roles"
                value={form.userRoles}
                onChange={updateField("userRoles")}
                helperText="Mention every role that interacts with the project."
              />

              <RichTextField
                title="Risk / Dependencies"
                value={form.risksDependencies}
                onChange={updateField("risksDependencies")}
                helperText="Write any blockers, external systems, or dependencies."
              />

              <section id="section-requirements" className="space-y-3 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-400 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">
                    Timeline / Milestone
                  </h3>

                  <button
                    type="button"
                    onClick={addMilestone}
                    className="flex items-center gap-1 rounded-lg bg-[#1A1A40] px-3 py-2 text-sm font-semibold text-white"
                  >
                    <Plus size={16} /> Add Milestone
                  </button>
                </div>

                {form.milestones.map((item, index) => (
                  <div
                    key={`milestone-${index}`}
                    className="grid grid-cols-1 items-center gap-3 md:grid-cols-12"
                  >
                    <input
                      className={editorFieldClass(item.phase, "md:col-span-2")}
                      placeholder="Phase"
                      value={item.phase}
                      onChange={updateMilestone(index, "phase")}
                    />

                    <input
                      className={editorFieldClass(item.task, "md:col-span-4")}
                      placeholder="Task"
                      value={item.task}
                      onChange={updateMilestone(index, "task")}
                    />

                    <input
                      className={editorFieldClass(item.duration, "md:col-span-2")}
                      placeholder="Duration"
                      value={item.duration}
                      onChange={updateMilestone(index, "duration")}
                    />

                    <input
                      className={editorFieldClass(
                        item.responsibility,
                        "md:col-span-3"
                      )}
                      placeholder="Responsibility"
                      value={item.responsibility}
                      onChange={updateMilestone(index, "responsibility")}
                    />

                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      disabled={form.milestones.length === 1}
                      className="justify-self-end text-red-500 disabled:text-slate-300 md:col-span-1"
                      aria-label="Delete milestone"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </section>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-slate-300 bg-[#EEF1F7] px-6 py-4">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl bg-slate-400 px-7 py-3 font-semibold text-white hover:bg-slate-500"
              >
                Cancel
              </button>

              {errorMessage ? (
                <p className="flex-1 text-center text-sm font-semibold text-red-500">
                  {errorMessage}
                </p>
              ) : (
                <div className="flex-1" />
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-xl bg-[#D6DDE8] px-7 py-3 font-bold text-[#4B5563] hover:bg-[#c6cedb] disabled:opacity-60"
              >
                {isSaving ? "Submitting..." : "Submit PRD"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        .rich-editor-shell {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          border-radius: 1.5rem;
          border: 1px solid rgba(226, 232, 240, 0.95);
          background: rgba(255, 255, 255, 0.92);
          padding: 1rem;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.05);
        }

        .rich-editor-shell--compact {
          gap: 0.45rem;
          padding: 0.75rem;
          border-radius: 1.15rem;
        }

        .rich-editor-heading {
          display: flex;
          flex-wrap: wrap;
          align-items: end;
          justify-content: space-between;
          gap: 0.5rem;
        }

        .rich-editor-title {
          font-size: 0.92rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #475569;
        }

        .rich-editor-helper {
          font-size: 0.9rem;
          color: #64748b;
        }

        .rich-editor-toolbar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.5rem;
          border-radius: 1rem;
          background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%);
          padding: 0.65rem;
          border: 1px solid rgba(148, 163, 184, 0.18);
        }

        .rich-editor-toolbar--compact {
          gap: 0.35rem;
          padding: 0.5rem;
        }

        .rich-editor-group {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.45rem;
        }

        .rich-editor-group--compact {
          gap: 0.3rem;
        }

        .rich-editor-select {
          min-width: 10rem;
          border-radius: 0.8rem;
          border: 1px solid rgba(148, 163, 184, 0.2);
          background: white;
          padding: 0.52rem 0.75rem;
          font-size: 0.9rem;
          color: #334155;
        }

        .rich-editor-select--compact {
          display: none;
        }

        .rich-editor-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          border-radius: 0.75rem;
          border: 1px solid rgba(148, 163, 184, 0.16);
          background: #fff;
          padding: 0.55rem 0.7rem;
          min-width: 2.6rem;
          font-weight: 700;
          color: #1e293b;
          transition: transform 0.2s ease, background 0.2s ease, box-shadow 0.2s ease;
        }

        .rich-editor-button--compact {
          min-width: 2.2rem;
          padding: 0.46rem 0.6rem;
          border-radius: 0.65rem;
        }

        .rich-editor-button:hover {
          background: #eaf1ff;
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(15, 23, 42, 0.08);
        }

        .rich-editor-button span {
          line-height: 1;
        }

        .rich-editor-action {
          margin-left: auto;
          border-radius: 0.8rem;
          border: 1px solid rgba(26, 26, 64, 0.12);
          background: #1a1a40;
          color: white;
          padding: 0.55rem 0.9rem;
          font-weight: 700;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .rich-editor-action--compact {
          display: none;
        }

        .rich-editor-action:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }

        .rich-editor-content {
          min-height: 8rem;
          border-radius: 1rem;
          border: 1px solid rgba(203, 213, 225, 0.9);
          background: linear-gradient(180deg, #ffffff 0%, #f9fbff 100%);
          padding: 0.95rem 1rem;
          color: #0f172a;
          line-height: 1.65;
          outline: none;
          white-space: pre-wrap;
          word-break: break-word;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
        }

        .rich-editor-content--compact {
          min-height: 3.1rem;
          padding: 0.68rem 0.8rem;
          border-radius: 0.85rem;
        }

        .rich-editor-content:focus {
          border-color: #1a1a40;
          box-shadow: 0 0 0 2px rgba(26, 26, 64, 0.12);
        }

        .rich-editor-content:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8;
          font-weight: 500;
        }

        .rich-editor-content p {
          margin: 0 0 0.7rem 0;
        }

        .rich-editor-content ul,
        .rich-editor-content ol {
          margin: 0.35rem 0 0.8rem 1.15rem;
          padding-left: 0.9rem;
        }

        .rich-editor-content li {
          margin: 0.2rem 0;
        }

        .rich-editor-content blockquote {
          margin: 0.4rem 0;
          padding-left: 0.9rem;
          border-left: 3px solid #cbd5e1;
          color: #475569;
        }

        .rich-editor-content pre {
          margin: 0.4rem 0;
          padding: 0.75rem 0.9rem;
          border-radius: 0.75rem;
          background: #0f172a;
          color: #e2e8f0;
          white-space: pre-wrap;
        }

        .rich-editor-content--empty {
          border-style: dashed;
          background: linear-gradient(180deg, #fffaf1 0%, #f8fbff 100%);
        }

        .prd-editor-input {
          width: 100%;
          border: 1px solid transparent;
          border-radius: 14px;
          font-family: ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
          font-size: 15px;
          padding: 14px 16px;
          padding: 12px 14px;
          background: linear-gradient(180deg, #dfe3ea 0%, #d8dee8 100%);
          color: #0f172a;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .prd-editor-input:focus {
          outline: 2px solid #1a1a40;
          outline-offset: 1px;
          background: #eef2f8;
          border-color: #1a1a40;
          transform: translateY(-1px);
        }

        .prd-editor-input--empty {
          border-color: rgba(245, 158, 11, 0.35);
          background: linear-gradient(180deg, #fff8eb 0%, #f1f4fb 100%);
          box-shadow: inset 0 0 0 1px rgba(251, 191, 36, 0.18);
        }

        .prd-editor-input--empty::placeholder {
          color: #9aa4b2;
          font-weight: 500;
        }

      `}</style>
    </>
  );
}

function RichTextField({
  title = "",
  value,
  onChange,
  helperText = "",
  placeholder = "Enter text",
  compact = false,
  className = "",
}) {
  const editorRef = useRef(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const nextValue = String(value || "");
    if (editor.innerHTML !== nextValue) {
      editor.innerHTML = nextValue;
    }
  }, [value]);

  const updateValue = () => {
    const editor = editorRef.current;
    if (!editor) return;
    onChange({ target: { value: editor.innerHTML } });
  };

  const runCommand = (command, argument = null) => {
    const editor = editorRef.current;
    if (!editor || typeof document === "undefined") return;

    editor.focus();
    document.execCommand(command, false, argument);
    updateValue();
  };

  const insertLink = () => {
    if (typeof window === "undefined") return;
    const url = window.prompt("Enter link URL");
    if (!url) return;
    runCommand("createLink", url);
  };

  const editorClasses = cn(
    "rich-editor-content",
    compact && "rich-editor-content--compact",
    !hasText(value) && "rich-editor-content--empty"
  );

  return (
    <div className={cn("rich-editor-shell", compact && "rich-editor-shell--compact", className)}>
      {(title || helperText) && (
        <div className="rich-editor-heading">
          <div>
            {title && <h3 className="rich-editor-title">{title}</h3>}
            {helperText && <p className="rich-editor-helper">{helperText}</p>}
          </div>
        </div>
      )}

      <div className={cn("rich-editor-toolbar", compact && "rich-editor-toolbar--compact") }>
        <div className={cn("rich-editor-group", compact && "rich-editor-group--compact") }>
          <select className={cn("rich-editor-select", compact && "rich-editor-select--compact")} defaultValue="normal" aria-label="Text style">
            <option value="normal">Normal Text</option>
            <option value="quote">Quote</option>
            <option value="code">Code</option>
          </select>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={() => runCommand("bold")} aria-label="Bold">
            <span>B</span>
          </button>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={() => runCommand("italic")} aria-label="Italic">
            <span>I</span>
          </button>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={() => runCommand("underline")} aria-label="Underline">
            <span>U</span>
          </button>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={() => runCommand("insertUnorderedList")} aria-label="Bulleted list">
            <span>•</span>
          </button>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={() => runCommand("insertOrderedList")} aria-label="Numbered list">
            <span>1.</span>
          </button>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={() => runCommand("formatBlock", "blockquote")} aria-label="Quote block">
            <span>“”</span>
          </button>

          <button type="button" className={cn("rich-editor-button", compact && "rich-editor-button--compact")} onClick={insertLink} aria-label="Insert link">
            <span>🔗</span>
          </button>
        </div>

        <button type="button" className={cn("rich-editor-action", compact && "rich-editor-action--compact")} onClick={() => runCommand("insertHorizontalRule")}>
          Embed block entry
        </button>
      </div>

      <div
        ref={editorRef}
        className={editorClasses}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder || title || "Enter text"}
        onInput={updateValue}
        onBlur={updateValue}
      />
    </div>
  );
}
