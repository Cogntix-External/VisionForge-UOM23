"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileEdit, FileText, History, Plus, Search, Trash2, X } from "lucide-react";
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

const hasText = (value) => String(value || "").trim().length > 0;

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

  if (!scalarFields.every(hasText)) {
    return false;
  }

  const validStakeholders =
    form.stakeholders.length > 0 &&
    form.stakeholders.every(
      (item) => hasText(item.role) && hasText(item.name) && hasText(item.responsibility)
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
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4 flex-1 min-w-[200px]">
      <div className={cn("p-3 rounded-2xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex gap-6 items-center">
        <StatCard label="Total PRDs" value={prdList.length} icon={FileText} color="bg-green-500" />
        <StatCard label="PRDs in review" value={inReviewCount} icon={FileEdit} color="bg-orange-400" />
        <StatCard label="Avg. Review Time" value="4d" icon={History} color="bg-blue-400" />
        <button
          onClick={onCreate}
          className="bg-[#000080] text-white px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:bg-blue-900 transition-all shadow-lg shadow-blue-900/20"
        >
          <Plus size={20} />
          Create New PRD
        </button>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full bg-[#F8F9FE] border-none rounded-xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-[#5D57A3]/20 transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 text-sm uppercase tracking-wider border-b border-gray-50">
                <th className="pb-4 font-semibold px-4">Project ID</th>
                <th className="pb-4 font-semibold px-4">Title</th>
                <th className="pb-4 font-semibold px-4">Status</th>
                <th className="pb-4 font-semibold px-4">Created Date</th>
                <th className="pb-4 font-semibold text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-sm text-gray-500">
                    Loading PRDs...
                  </td>
                </tr>
              )}

              {!isLoading && prdList.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 px-4 text-center text-sm text-gray-500">
                    No PRDs found. Create your first PRD.
                  </td>
                </tr>
              )}

              {!isLoading &&
                prdList.map((prd) => (
                  <tr key={prd.id || prd.pid} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-6 px-4 font-bold text-gray-700">{prd.projectId || prd.pid}</td>
                    <td className="py-6 px-4 font-bold text-gray-800 max-w-xs">{prd.title}</td>
                    <td className="py-6 px-4">
                      <span className="font-medium text-gray-800">{prd.status}</span>
                    </td>
                    <td className="py-6 px-4 text-gray-500 font-medium">{prd.createdDate || prd.lastModified}</td>
                    <td className="py-6 px-4">
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => onReview(prd)}
                          className="bg-[#B2EBF2] text-[#00838F] px-6 py-2 rounded-lg text-sm font-semibold hover:bg-[#80DEEA] transition-colors"
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

        <div className="mt-8 flex justify-end gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
            &lt;
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#5D57A3] text-white">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            2
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            3
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            4
          </button>
          <span className="flex items-center text-gray-400 px-1">...</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50">
            40
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 text-gray-400 hover:bg-gray-50">
            &gt;
          </button>
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

  useEffect(() => {
    const loadPrds = async () => {
      const token = getToken();
      if (!token) return;

      try {
        setIsLoading(true);
        const list = await fetchPrds(token);
        setPrdList(Array.isArray(list) ? list : []);
      } catch {
        setPrdList([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPrds();
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
          ? projects.filter((project) => String(project.status || "").toUpperCase() === "ACTIVE")
          : [];
        setCompanyProjects(acceptedProjects);
      } catch {
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

    return prdList.filter((prd) => {
      return [prd.projectId, prd.pid, prd.title, prd.status, prd.createdDate]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [prdList, searchQuery]);

  const resetForm = () => {
    setForm(createEmptyForm());
    setErrorMessage("");
  };

  const applyProjectSelection = (projectId) => {
    const selectedProject = companyProjects.find((project) => project.id === projectId);

    setForm((prev) => ({
      ...prev,
      projectId: selectedProject?.id || "",
      projectName: selectedProject?.name || "",
      author: selectedProject?.clientId || "",
    }));

    if (!selectedProject && projectId) {
      setErrorMessage("Selected project is not available.");
    }
  };

  const openCreateModal = async () => {
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
        stakeholders: prev.stakeholders.filter((_, itemIndex) => itemIndex !== index),
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
        milestones: prev.milestones.filter((_, itemIndex) => itemIndex !== index),
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

    const token = getToken();
    if (!token) {
      setErrorMessage("Please log in again before submitting.");
      return;
    }

    try {
      setIsSaving(true);
      const created = await createPrd(form, token);
      setPrdList((prev) => [created, ...prev]);
      setSubmitMessage("PRD submitted successfully.");
      closeModal();
    } catch (error) {
      setErrorMessage(error.message || "Failed to submit PRD.");
    } finally {
      setIsSaving(false);
    }
  };

  const goToPrdDetails = (prd) => {
    if (!prd?.id) {
      setErrorMessage("Selected PRD does not have an id.");
      return;
    }

    router.push(`/company/Prd-details&Editor?prdId=${encodeURIComponent(prd.id)}`);
  };

  const onReview = (prd) => {
    goToPrdDetails(prd);
  };

  return (
    <>
      <PrdRepositorySectionView
        prdList={filteredPrds}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCreate={openCreateModal}
        onReview={onReview}
        isLoading={isLoading}
      />

      {submitMessage && (
        <p className="mt-3 text-sm text-green-600 font-medium">{submitMessage}</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-4xl max-h-[90vh] bg-[#F5F7FB] rounded-3xl border border-slate-200 shadow-2xl flex flex-col"
          >
            <div className="px-6 py-5 border-b border-slate-300 flex items-center justify-between">
              <h2 className="text-3xl font-extrabold text-[#1A1A40]">Create New PRD</h2>
              <button
                type="button"
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 overflow-y-auto space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-2">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    className="input"
                    value={form.projectId}
                    onChange={(event) => applyProjectSelection(event.target.value)}
                  >
                    <option value="">Select accepted project</option>
                    {isLoadingProjects && <option value="">Loading projects...</option>}
                    {companyProjects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name || project.id} ({project.clientName || project.clientId || "No client"})
                      </option>
                    ))}
                  </select>
                  <input className="input" placeholder="Project Name" value={form.projectName} readOnly />
                  <input className="input" placeholder="Client ID" value={form.author} readOnly />
                  <input className="input" type="date" value={form.dateSubmitted} onChange={updateField("dateSubmitted")} />
                </div>
                {companyProjects.length === 0 && !isLoadingProjects && (
                  <p className="text-sm text-amber-600 font-medium">
                    No accepted projects found. Accept a proposal first, then create PRD from that project.
                  </p>
                )}
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-2">Project Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input className="input" placeholder="Purpose" value={form.purpose} onChange={updateField("purpose")} />
                  <input className="input" placeholder="Problem to solve" value={form.problemToSolve} onChange={updateField("problemToSolve")} />
                  <input className="input" placeholder="Project Goal" value={form.projectGoal} onChange={updateField("projectGoal")} />
                </div>
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-400 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">Key Stakeholders</h3>
                  <button
                    type="button"
                    onClick={addStakeholder}
                    className="bg-[#1A1A40] text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Stakeholder
                  </button>
                </div>

                {form.stakeholders.map((item, index) => (
                  <div key={`stakeholder-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <input className="input md:col-span-3" placeholder="Role" value={item.role} onChange={updateStakeholder(index, "role")} />
                    <input className="input md:col-span-3" placeholder="Name" value={item.name} onChange={updateStakeholder(index, "name")} />
                    <input className="input md:col-span-5" placeholder="Responsibility" value={item.responsibility} onChange={updateStakeholder(index, "responsibility")} />
                    <button
                      type="button"
                      onClick={() => removeStakeholder(index)}
                      disabled={form.stakeholders.length === 1}
                      className="md:col-span-1 justify-self-end text-red-500 disabled:text-slate-300"
                      aria-label="Delete stakeholder"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </section>

              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 border-b border-slate-400 pb-2">Scope</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <textarea className="input min-h-24" placeholder="In Scope" value={form.inScope} onChange={updateField("inScope")} />
                  <textarea className="input min-h-24" placeholder="Out of Scope" value={form.outOfScope} onChange={updateField("outOfScope")} />
                </div>
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-600 uppercase">Main Features</h3>
                <textarea className="input min-h-24" value={form.mainFeatures} onChange={updateField("mainFeatures")} />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-600 uppercase">Functional Requirement</h3>
                <textarea className="input min-h-24" value={form.functionalRequirement} onChange={updateField("functionalRequirement")} />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-600 uppercase">Non Functional Requirement</h3>
                <textarea className="input min-h-24" value={form.nonFunctionalRequirement} onChange={updateField("nonFunctionalRequirement")} />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-600 uppercase">User Roles</h3>
                <textarea className="input min-h-24" value={form.userRoles} onChange={updateField("userRoles")} />
              </section>

              <section className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-600 uppercase">Risk / Dependencies</h3>
                <textarea className="input min-h-24" value={form.risksDependencies} onChange={updateField("risksDependencies")} />
              </section>

              <section className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-400 pb-2">
                  <h3 className="text-lg font-bold text-slate-800">Timeline / Milestone</h3>
                  <button
                    type="button"
                    onClick={addMilestone}
                    className="bg-[#1A1A40] text-white px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1"
                  >
                    <Plus size={16} /> Add Milestone
                  </button>
                </div>

                {form.milestones.map((item, index) => (
                  <div key={`milestone-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                    <input className="input md:col-span-2" placeholder="Phase" value={item.phase} onChange={updateMilestone(index, "phase")} />
                    <input className="input md:col-span-4" placeholder="Task" value={item.task} onChange={updateMilestone(index, "task")} />
                    <input className="input md:col-span-2" placeholder="Duration" value={item.duration} onChange={updateMilestone(index, "duration")} />
                    <input className="input md:col-span-3" placeholder="Responsibility" value={item.responsibility} onChange={updateMilestone(index, "responsibility")} />
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      disabled={form.milestones.length === 1}
                      className="md:col-span-1 justify-self-end text-red-500 disabled:text-slate-300"
                      aria-label="Delete milestone"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </section>
            </div>

            <div className="px-6 py-4 border-t border-slate-300 bg-[#EEF1F7] flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="px-7 py-3 rounded-xl bg-slate-400 text-white font-semibold hover:bg-slate-500"
              >
                Cancel
              </button>

              {errorMessage ? (
                <p className="text-sm font-semibold text-red-500 text-center flex-1">{errorMessage}</p>
              ) : (
                <div className="flex-1" />
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="px-7 py-3 rounded-xl bg-[#D6DDE8] text-[#4B5563] font-bold hover:bg-[#c6cedb] disabled:opacity-60"
              >
                {isSaving ? "Submitting..." : "Submit PRD"}
              </button>
            </div>
          </form>
        </div>
      )}

      <style jsx global>{`
        .input {
          width: 100%;
          border: none;
          border-radius: 10px;
          padding: 12px 14px;
          background: #dfe3ea;
          color: #0f172a;
        }

        .input:focus {
          outline: 2px solid #1a1a40;
          outline-offset: 1px;
          background: #eef2f8;
        }
      `}</style>
    </>
  );
}
