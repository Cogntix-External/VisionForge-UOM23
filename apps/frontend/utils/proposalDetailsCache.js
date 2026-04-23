const CACHE_KEY = "crms:proposal-details-cache";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.sessionStorage);
}

function readCache() {
  if (!canUseStorage()) return {};

  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeCache(cache) {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

export function cacheProposalDetails(proposalId, details) {
  if (!proposalId) return;

  const cache = readCache();
  cache[proposalId] = {
    ...(cache[proposalId] || {}),
    ...details,
  };
  writeCache(cache);
}

export function getCachedProposalDetails(proposalId) {
  if (!proposalId) return null;
  const cache = readCache();
  return cache[proposalId] || null;
}

export function mergeProposalWithCachedDetails(proposal) {
  if (!proposal?.id) return proposal;

  const cached = getCachedProposalDetails(proposal.id);
  if (!cached) return proposal;

  return {
    ...proposal,
    ...cached,
  };
}
