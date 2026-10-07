const STORAGE_KEY = "ecobogota-demo-reports-v1";

const types = {
  BASURA_NO_RECOGIDA: { label: "Basura no recogida", symbol: "B" },
  CONTENEDOR_LLENO: { label: "Contenedor lleno", symbol: "C" },
  ESCOMBROS: { label: "Escombros", symbol: "E" },
  OTRO: { label: "Otro", symbol: "O" },
};

const statuses = {
  RECIBIDO: { label: "Recibido", className: "status-recibido" },
  EN_GESTION: { label: "En gestión", className: "status-en-gestion" },
  RESUELTO: { label: "Resuelto", className: "status-resuelto" },
};

const now = Date.now();
const exampleReports = [
  { id: "demo-1", type: "CONTENEDOR_LLENO", location: "Chapinero · Calle 60 con Carrera 7", description: "El contenedor de la esquina está lleno.", status: "RECIBIDO", createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString() },
  { id: "demo-2", type: "ESCOMBROS", location: "Teusaquillo · Carrera 24 con Calle 45", description: "Hay escombros junto al andén.", status: "EN_GESTION", createdAt: new Date(now - 25 * 60 * 60 * 1000).toISOString() },
  { id: "demo-3", type: "BASURA_NO_RECOGIDA", location: "Suba · Avenida Boyacá con Calle 127", description: "Bolsas de residuos acumuladas desde ayer.", status: "RESUELTO", createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString() },
];

function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...exampleReports];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isValidReport) : [...exampleReports];
  } catch {
    return [...exampleReports];
  }
}

function isValidReport(report) {
  return report && typeof report.id === "string" && types[report.type] &&
    typeof report.location === "string" && typeof report.description === "string" &&
    statuses[report.status] && !Number.isNaN(Date.parse(report.createdAt));
}

function saveReports(reports) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    return true;
  } catch {
    return false;
  }
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function reportCard(report) {
  const card = element("article", "report-card");
  const top = element("div", "report-topline");
  const titleWrap = element("div", "report-title-wrap");
  titleWrap.append(element("span", "report-symbol", types[report.type].symbol));
  titleWrap.append(element("h3", "report-title", types[report.type].label));
  top.append(titleWrap);
  top.append(element("span", `status ${statuses[report.status].className}`, statuses[report.status].label));
  card.append(top);
  card.append(element("p", "report-description", report.description));
  const meta = element("div", "report-meta");
  meta.append(element("span", "", `⌖ ${report.location}`));
  meta.append(element("span", "", new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(new Date(report.createdAt))));
  card.append(meta);
  return card;
}

let reports = loadReports();
const reportList = document.getElementById("reportList");
const filter = document.getElementById("statusFilter");
const form = document.getElementById("reportForm");
const message = document.getElementById("formMessage");

function render() {
  document.getElementById("totalCount").textContent = String(reports.length);
  document.getElementById("openCount").textContent = String(reports.filter((report) => report.status !== "RESUELTO").length);
  document.getElementById("resolvedCount").textContent = String(reports.filter((report) => report.status === "RESUELTO").length);

  const visible = reports.filter((report) => filter.value === "TODOS" || report.status === filter.value);
  reportList.replaceChildren();
  if (visible.length === 0) {
    reportList.append(element("p", "empty-state", "No hay reportes con este estado."));
  } else {
    reportList.append(...visible.map(reportCard));
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = form.elements.type.value;
  const location = form.elements.location.value.trim();
  const description = form.elements.description.value.trim();
  message.classList.remove("success");

  if (!types[type] || !location || !description) {
    message.textContent = "Completa los tres campos para publicar el reporte.";
    return;
  }

  const report = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    type, location, description, status: "RECIBIDO", createdAt: new Date().toISOString(),
  };
  const updated = [report, ...reports];
  if (!saveReports(updated)) {
    message.textContent = "No se pudo guardar el reporte en este navegador.";
    return;
  }
  reports = updated;
  form.reset();
  filter.value = "TODOS";
  render();
  message.classList.add("success");
  message.textContent = "Reporte creado. Ya aparece en la lista con estado Recibido.";
});

filter.addEventListener("change", render);
render();
