const STORAGE_KEY = "company_proposals";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoney(value) {
  return `$${value.toFixed(2)}`;
}

function summarizeDuration(timelines) {
  if (!Array.isArray(timelines) || timelines.length === 0) {
    return "N/A";
  }

  const startTimes = timelines
    .map((row) => Date.parse(row.startDate))
    .filter((time) => Number.isFinite(time));
  const endTimes = timelines
    .map((row) => Date.parse(row.endDate))
    .filter((time) => Number.isFinite(time));

  if (startTimes.length === 0 || endTimes.length === 0) {
    return `${timelines.length} phase(s)`;
  }

  const start = Math.min(...startTimes);
  const end = Math.max(...endTimes);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const days = Math.floor((end - start) / oneDayMs) + 1;

  return days > 0 ? `${days} days` : `${timelines.length} phase(s)`;
}

export function getStoredProposals() {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveStoredProposals(proposals) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
}

export function addStoredProposal(proposal) {
  const current = getStoredProposals();
  const next = [proposal, ...current];
  saveStoredProposals(next);
  return next;
}

export function getStoredProposalById(proposalId) {
  return getStoredProposals().find((proposal) => proposal.id === proposalId) || null;
}

export function buildProposalFromForm(newProposal, timelineData, budgetData) {
  const totalBudget = (budgetData || []).reduce((sum, row) => {
    const rowTotal = row.total === "" ? toNumber(row.quantity) * toNumber(row.unitPrice) : toNumber(row.total);
    return sum + rowTotal;
  }, 0);

  const timestamp = Date.now();
  const id = `PRJ-${String(timestamp).slice(-6)}`;
  const now = new Date().toLocaleDateString();

  return {
    id,
    title: String(newProposal?.title || "").trim(),
    client: String(newProposal?.client || "").trim(),
    description: String(newProposal?.description || "").trim(),
    budget: formatMoney(totalBudget),
    duration: summarizeDuration(timelineData || []),
    status: "Pending",
    state: "Draft",
    owner: "Company",
    lastUpdated: now,
    timelines: Array.isArray(timelineData) ? timelineData : [],
    budgetData: Array.isArray(budgetData) ? budgetData : [],
  };
}
