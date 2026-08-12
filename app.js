const NEEDS = [
  { name: "Digitize internal operations", description: "Replace manual work with focused apps and connected data." },
  { name: "Automate workflows and processes", description: "Reduce repetitive work with automation, approvals, and AI." },
  { name: "Improve customer interactions", description: "Create secure experiences for customers, partners, and communities." },
  { name: "Modernize existing applications", description: "Evolve legacy solutions with modern apps, automation, and AI." },
  { name: "Strengthen governance and security", description: "Apply guardrails, visibility, and control across the platform." },
  { name: "Explore Solution Guidance", description: "Move from a business requirement to a suitable Power Platform architecture.", url: "https://jubilant-adventure-pz9w5gq.pages.github.io/#explore-guided-learning-journeys" },
];

const state = { labs: [], need: "", query: "", product: "", level: "", copilot: false };
const elements = Object.fromEntries([
  "needs-grid", "lab-grid", "result-count", "catalog-title", "search", "product-filter",
  "need-filter", "level-filter", "copilot-filter", "clear-filters", "active-path", "empty-state",
  "published-count", "coming-count", "product-count", "theme-button",
].map((id) => [id, document.getElementById(id)]));

const escapeHtml = (value = "") => String(value).replace(/[&<>'"]/g, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
}[character]));

function renderNeeds() {
  if (!elements["needs-grid"]) return;
  elements["needs-grid"].innerHTML = NEEDS.map((need) => {
    if (need.url) {
      return `<a class="need-card guidance-card" href="${escapeHtml(need.url)}" target="_blank" rel="noopener"><strong>${escapeHtml(need.name)}</strong><span>${escapeHtml(need.description)}</span><small>Explore guidance ↗</small></a>`;
    }
    const count = state.labs.filter((lab) => lab.businessNeeds.includes(need.name)).length;
    return `<a class="need-card" href="labs.html?need=${encodeURIComponent(need.name)}"><strong>${escapeHtml(need.name)}</strong><span>${escapeHtml(need.description)}</span><small>${count} ${count === 1 ? "lab" : "labs"} →</small></a>`;
  }).join("");
}

function labCard(lab) {
  const products = lab.products.map((product) => `<span class="pill">${escapeHtml(product)}</span>`).join("");
  const copilot = lab.requiresGitHubCopilot ? '<span class="pill pill-accent">Requires GitHub Copilot</span>' : "";
  const action = lab.display === "Published" && lab.url
    ? `<a class="lab-link" href="${escapeHtml(lab.url)}" target="_blank" rel="noopener">Open lab ↗</a>`
    : '<span class="coming-soon">Coming soon</span>';
  return `<article class="lab-card"><div class="lab-meta"><span class="pill">${escapeHtml(lab.level || "Level pending")}</span>${lab.duration ? `<span class="pill">${escapeHtml(lab.duration)}</span>` : ""}${copilot}</div><h3>${escapeHtml(lab.title)}</h3><p>${escapeHtml(lab.description || "Description coming soon.")}</p><div class="tags">${products}</div><div class="lab-footer"><span class="coming-soon">${escapeHtml(lab.type || "Lab")}</span>${action}</div></article>`;
}

function renderLabs() {
  if (!elements["lab-grid"]) return;
  const query = state.query.trim().toLowerCase();
  const filtered = state.labs.filter((lab) => {
    const searchable = [lab.title, lab.description, ...lab.products, ...lab.businessNeeds].join(" ").toLowerCase();
    return (!state.need || lab.businessNeeds.includes(state.need))
      && (!state.product || lab.products.includes(state.product))
      && (!state.level || lab.level === state.level)
      && (!state.copilot || lab.requiresGitHubCopilot)
      && (!query || searchable.includes(query));
  });
  elements["catalog-title"].textContent = state.need || "All labs";
  elements["result-count"].textContent = `${filtered.length} ${filtered.length === 1 ? "lab" : "labs"}`;
  elements["active-path"].hidden = !state.need;
  elements["active-path"].innerHTML = state.need
    ? `<span>Showing labs for <strong>${escapeHtml(state.need)}</strong></span><button class="clear-path" type="button" aria-label="Clear business need filter">&times;</button>`
    : "";
  elements["need-filter"].value = state.need;
  elements["lab-grid"].innerHTML = filtered.map(labCard).join("");
  elements["empty-state"].hidden = filtered.length > 0;
}

function resetFilters() {
  Object.assign(state, { need: "", query: "", product: "", level: "", copilot: false });
  elements.search.value = "";
  elements["need-filter"].value = "";
  elements["product-filter"].value = "";
  elements["level-filter"].value = "";
  elements["copilot-filter"].checked = false;
  renderLabs();
}

async function initialize() {
  const response = await fetch("data/labs.json", { cache: "no-store" });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  const payload = await response.json();
  state.labs = payload.labs.filter((lab) => lab.display !== "Retired" && lab.display !== "Hidden");
  const products = [...new Set(state.labs.flatMap((lab) => lab.products))].sort();
  const levels = [...new Set(state.labs.map((lab) => lab.level).filter(Boolean))].sort();
  const businessNeeds = NEEDS.filter((need) => !need.url).map((need) => need.name);
  const requestedNeed = new URLSearchParams(window.location.search).get("need");
  state.need = businessNeeds.includes(requestedNeed) ? requestedNeed : "";
  elements["need-filter"]?.insertAdjacentHTML("beforeend", businessNeeds.map((value) => `<option>${escapeHtml(value)}</option>`).join(""));
  elements["product-filter"]?.insertAdjacentHTML("beforeend", products.map((value) => `<option>${escapeHtml(value)}</option>`).join(""));
  elements["level-filter"]?.insertAdjacentHTML("beforeend", levels.map((value) => `<option>${escapeHtml(value)}</option>`).join(""));
  if (elements["published-count"]) elements["published-count"].textContent = state.labs.filter((lab) => lab.display === "Published").length;
  if (elements["coming-count"]) elements["coming-count"].textContent = state.labs.filter((lab) => lab.display === "Coming soon").length;
  if (elements["product-count"]) elements["product-count"].textContent = products.length;
  renderNeeds();
  renderLabs();
}

elements["active-path"]?.addEventListener("click", (event) => {
  if (!event.target.closest(".clear-path")) return;
  state.need = "";
  renderLabs();
});
elements.search?.addEventListener("input", (event) => { state.query = event.target.value; renderLabs(); });
elements["need-filter"]?.addEventListener("change", (event) => { state.need = event.target.value; renderLabs(); });
elements["product-filter"]?.addEventListener("change", (event) => { state.product = event.target.value; renderLabs(); });
elements["level-filter"]?.addEventListener("change", (event) => { state.level = event.target.value; renderLabs(); });
elements["copilot-filter"]?.addEventListener("change", (event) => { state.copilot = event.target.checked; renderLabs(); });
elements["clear-filters"]?.addEventListener("click", resetFilters);
elements["theme-button"].addEventListener("click", () => {
  document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
});

initialize().catch((error) => {
  if (elements["lab-grid"]) elements["lab-grid"].innerHTML = `<div class="empty-state"><h3>Catalog unavailable</h3><p>${escapeHtml(error.message)}. Run this site through a local web server rather than opening the HTML file directly.</p></div>`;
});
