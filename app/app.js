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
const statusOrder = ["RECIBIDO", "EN_GESTION", "RESUELTO"];
const nextStatus = { RECIBIDO: "EN_GESTION", EN_GESTION: "RESUELTO" };

const now = Date.now();
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const demoEvent = (status, hours) => ({ status, at: hoursAgo(hours), actor: "Datos de ejemplo" });
const exampleReports = [
  { id: "demo-1", reference: "ECO-0101", type: "CONTENEDOR_LLENO", location: "Chapinero · Calle 60 con Carrera 7", description: "El contenedor de la esquina está lleno.", status: "RECIBIDO", createdAt: hoursAgo(2), history: [demoEvent("RECIBIDO", 2)] },
  { id: "demo-2", reference: "ECO-0102", type: "ESCOMBROS", location: "Teusaquillo · Carrera 24 con Calle 45", description: "Hay escombros junto al andén.", status: "EN_GESTION", createdAt: hoursAgo(25), history: [demoEvent("RECIBIDO", 25), demoEvent("EN_GESTION", 22)] },
  { id: "demo-3", reference: "ECO-0103", type: "BASURA_NO_RECOGIDA", location: "Suba · Avenida Boyacá con Calle 127", description: "Bolsas de residuos acumuladas desde ayer.", status: "RESUELTO", createdAt: hoursAgo(72), history: [demoEvent("RECIBIDO", 72), demoEvent("EN_GESTION", 48), demoEvent("RESUELTO", 20)] },
];

function referenceForId(id) {
  return `ECO-${id.replace(/[^a-z0-9]/gi, "").slice(-8).toUpperCase().padStart(8, "0")}`;
}

function searchText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function validCoordinates(coordinates) {
  return coordinates && Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 && coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 && coordinates.longitude <= 180;
}

function loadReports() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [...exampleReports];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.filter(isValidReport).map(normalizeReport) : [...exampleReports];
  } catch {
    return [...exampleReports];
  }
}

function normalizeReport(report) {
  const reference = typeof report.reference === "string" && /^ECO-[A-Z0-9]{4,12}$/.test(report.reference)
    ? report.reference : referenceForId(report.id);
  const coordinates = validCoordinates(report.coordinates) ? report.coordinates : null;
  if (Array.isArray(report.history) && report.history.length > 0) {
    const history = report.history.filter((event) => event && statuses[event.status] &&
      (event.at === null || !Number.isNaN(Date.parse(event.at))) && typeof event.actor === "string");
    if (history.length > 0 && history.at(-1).status === report.status) return { ...report, reference, coordinates, history };
  }
  // Los reportes guardados por la demo anterior no registraban las fechas de transición.
  const history = [{ status: "RECIBIDO", at: report.createdAt, actor: "Sistema local" }];
  for (const status of statusOrder.slice(1, statusOrder.indexOf(report.status) + 1)) {
    history.push({ status, at: null, actor: "Estado anterior" });
  }
  return { ...report, reference, coordinates, history };
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

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Fecha no registrada";
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
  meta.append(element("span", "report-reference", report.reference));
  meta.append(element("span", "", `⌖ ${report.location}`));
  meta.append(element("span", "", formatDate(report.createdAt)));
  card.append(meta);
  const detailButton = element("button", "detail-link", "Ver seguimiento →");
  detailButton.type = "button";
  detailButton.addEventListener("click", () => openReport(report.id));
  card.append(detailButton);
  return card;
}

let reports = loadReports();
const reportList = document.getElementById("reportList");
const filter = document.getElementById("statusFilter");
const search = document.getElementById("reportSearch");
const form = document.getElementById("reportForm");
const message = document.getElementById("formMessage");
const dialog = document.getElementById("reportDialog");
const detail = document.getElementById("reportDetail");
const detailMessage = document.getElementById("detailMessage");
const advanceButton = document.getElementById("advanceStatus");
const detectLocationButton = document.getElementById("detectLocation");
const locationMessage = document.getElementById("locationMessage");
let selectedReportId = null;

function renderDetail(report) {
  detail.replaceChildren();
  const summary = element("div", "detail-summary");
  summary.append(element("span", `status ${statuses[report.status].className}`, statuses[report.status].label));
  summary.append(element("p", "detail-description", report.description));
  const metadata = element("dl", "detail-meta");
  const fields = [
    ["Código", report.reference],
    ["Incidencia", types[report.type].label],
    ["Ubicación", report.location],
    ["Creado", formatDate(report.createdAt)],
  ];
  if (validCoordinates(report.coordinates)) {
    fields.splice(3, 0, ["Coordenadas", `${report.coordinates.latitude.toFixed(6)}, ${report.coordinates.longitude.toFixed(6)}`]);
  }
  for (const [label, value] of fields) {
    const row = element("div", "detail-meta-row");
    row.append(element("dt", "", label), element("dd", "", value));
    metadata.append(row);
  }
  summary.append(metadata);
  detail.append(summary);

  detail.append(element("h3", "timeline-heading", "Historial de estados"));
  const timeline = element("ol", "timeline");
  for (const status of statusOrder) {
    const event = report.history.find((item) => item.status === status);
    const item = element("li", `timeline-item ${event ? "timeline-done" : "timeline-pending"}`);
    item.append(element("span", "timeline-dot", event ? "✓" : ""));
    const content = element("div", "timeline-content");
    content.append(element("strong", "", statuses[status].label));
    content.append(element("span", "", event ? `${formatDate(event.at)} · ${event.actor}` : "Pendiente"));
    item.append(content);
    timeline.append(item);
  }
  detail.append(timeline);

  const next = nextStatus[report.status];
  advanceButton.hidden = !next;
  if (next) advanceButton.textContent = `Simular avance a ${statuses[next].label} →`;
}

function openReport(id) {
  const report = reports.find((item) => item.id === id);
  if (!report) return;
  selectedReportId = id;
  detailMessage.textContent = "";
  renderDetail(report);
  dialog.showModal();
}

function render() {
  document.getElementById("totalCount").textContent = String(reports.length);
  document.getElementById("openCount").textContent = String(reports.filter((report) => report.status !== "RESUELTO").length);
  document.getElementById("resolvedCount").textContent = String(reports.filter((report) => report.status === "RESUELTO").length);

  const query = searchText(search.value.trim());
  const visible = reports.filter((report) => {
    if (filter.value !== "TODOS" && report.status !== filter.value) return false;
    return [report.reference, types[report.type].label, report.location, report.description]
      .some((value) => searchText(value).includes(query));
  });
  reportList.replaceChildren();
  if (visible.length === 0) {
    reportList.append(element("p", "empty-state", query
      ? "No hay reportes que coincidan con la búsqueda."
      : "No hay reportes con este estado."));
  } else {
    reportList.append(...visible.map(reportCard));
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const type = form.elements.type.value;
  const location = form.elements.location.value.trim();
  const description = form.elements.description.value.trim();
  const latitudeText = form.elements.latitude.value.trim();
  const longitudeText = form.elements.longitude.value.trim();
  message.classList.remove("success");

  if (!types[type] || !location || !description) {
    message.textContent = "Completa los tres campos para publicar el reporte.";
    return;
  }

  let coordinates = null;
  if (latitudeText || longitudeText) {
    coordinates = { latitude: Number(latitudeText), longitude: Number(longitudeText) };
    if (!latitudeText || !longitudeText || !validCoordinates(coordinates)) {
      message.textContent = "Ingresa latitud y longitud válidas, o deja ambas vacías.";
      return;
    }
  }

  const report = {
    id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    type, location, description, coordinates, status: "RECIBIDO", createdAt: new Date().toISOString(),
  };
  report.reference = referenceForId(report.id);
  report.history = [{ status: "RECIBIDO", at: report.createdAt, actor: "Sistema local" }];
  const updated = [report, ...reports];
  if (!saveReports(updated)) {
    message.textContent = "No se pudo guardar el reporte en este navegador.";
    return;
  }
  reports = updated;
  form.reset();
  locationMessage.textContent = "Se guardarán solo en este navegador al publicar el reporte.";
  filter.value = "TODOS";
  search.value = "";
  render();
  message.classList.add("success");
  message.textContent = `Reporte ${report.reference} creado con estado Recibido.`;
});

filter.addEventListener("change", render);
search.addEventListener("input", render);
detectLocationButton.addEventListener("click", () => {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    locationMessage.textContent = "Este navegador no ofrece ubicación. Puedes escribir las coordenadas manualmente.";
    return;
  }
  detectLocationButton.disabled = true;
  locationMessage.textContent = "Consultando la ubicación del dispositivo…";
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => {
      detectLocationButton.disabled = false;
      const coordinates = { latitude: coords.latitude, longitude: coords.longitude };
      if (!validCoordinates(coordinates)) {
        locationMessage.textContent = "El dispositivo devolvió coordenadas inválidas.";
        return;
      }
      form.elements.latitude.value = coordinates.latitude.toFixed(6);
      form.elements.longitude.value = coordinates.longitude.toFixed(6);
      locationMessage.textContent = "Coordenadas listas. Se guardarán aquí solo si publicas el reporte.";
    },
    () => {
      detectLocationButton.disabled = false;
      locationMessage.textContent = "No se pudo obtener la ubicación. Puedes escribir las coordenadas manualmente.";
    },
    { enableHighAccuracy: false, timeout: 10000 },
  );
});
document.getElementById("closeDialog").addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => { selectedReportId = null; });
advanceButton.addEventListener("click", () => {
  const report = reports.find((item) => item.id === selectedReportId);
  const next = report && nextStatus[report.status];
  if (!next) return;
  const updatedReport = {
    ...report,
    status: next,
    history: [...report.history, { status: next, at: new Date().toISOString(), actor: "Simulación local" }],
  };
  const updated = reports.map((item) => item.id === report.id ? updatedReport : item);
  if (!saveReports(updated)) {
    detailMessage.textContent = "No se pudo guardar el cambio en este navegador.";
    return;
  }
  reports = updated;
  detailMessage.textContent = "";
  render();
  renderDetail(updatedReport);
});
render();
