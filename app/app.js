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

function searchText(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function validCoordinates(coordinates) {
  return coordinates && Number.isFinite(coordinates.latitude) && Number.isFinite(coordinates.longitude) &&
    coordinates.latitude >= -90 && coordinates.latitude <= 90 &&
    coordinates.longitude >= -180 && coordinates.longitude <= 180;
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

let reports = [];
let ownReports = [];
let reportView = 'all';
let currentUser = null;
let registering = false;
async function request(url, options = {}) {
  let response;
  try { response = await fetch(url, { credentials: 'same-origin', ...options }); }
  catch { throw new Error('No se pudo conectar con el servidor.'); }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Ocurrió un error en el servidor');
  return payload;
}
async function refreshReports() {
  reports = (await request('/api/reports')).reports;
  if (currentUser && reportView === 'mine') ownReports = (await request('/api/reports?mine=1')).reports;
  render();
}
function activeReports() { return reportView === 'mine' ? ownReports : reports; }
async function switchView(view) {
  if (view === 'mine' && !currentUser) return;
  reportView = view;
  document.getElementById('reportsTitle').textContent = view === 'mine' ? 'Mis reportes' : 'Reportes recientes';
  document.getElementById('allReportsButton').setAttribute('aria-pressed', String(view === 'all'));
  document.getElementById('myReportsButton').setAttribute('aria-pressed', String(view === 'mine'));
  filter.value = 'TODOS';
  search.value = '';
  if (view === 'mine') {
    reportList.replaceChildren(element('p', 'empty-state', 'Cargando tus reportes…'));
    try { ownReports = (await request('/api/reports?mine=1')).reports; }
    catch (error) { reportList.replaceChildren(element('p', 'empty-state', error.message)); return; }
  }
  render();
}
const reportList = document.getElementById("reportList");
const filter = document.getElementById("statusFilter");
const search = document.getElementById("reportSearch");
const form = document.getElementById("reportForm");
const message = document.getElementById("formMessage");
const dialog = document.getElementById("reportDialog");
const detail = document.getElementById("reportDetail");
const detailMessage = document.getElementById("detailMessage");
const advanceButton = document.getElementById("advanceStatus");
const adminActions = document.getElementById("adminActions");
const adminStatus = document.getElementById("adminStatus");
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
  for (const event of report.history) {
    const item = element("li", "timeline-item timeline-done");
    item.append(element("span", "timeline-dot", "✓"));
    const content = element("div", "timeline-content");
    content.append(element("strong", "", statuses[event.status].label));
    content.append(element("span", "", `${formatDate(event.at)} · ${event.actor}`));
    item.append(content);
    timeline.append(item);
  }
  detail.append(timeline);

  adminActions.hidden = !currentUser?.isAdmin;
  adminStatus.value = report.status;
}

function openReport(id) {
  const report = activeReports().find((item) => item.id === id);
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
  const visible = activeReports().filter((report) => {
    if (filter.value !== "TODOS" && report.status !== filter.value) return false;
    return [report.reference, types[report.type].label, report.location, report.description]
      .some((value) => searchText(value).includes(query));
  });
  reportList.replaceChildren();
  if (visible.length === 0) {
    reportList.append(element("p", "empty-state", query
      ? "No hay reportes que coincidan con la búsqueda."
      : filter.value !== "TODOS" ? "No hay reportes con este estado." : reportView === 'mine' ? "Aún no has publicado reportes." : "Aún no hay reportes. ¡Publica el primero!"));
  } else {
    reportList.append(...visible.map(reportCard));
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const type = form.elements.type.value;
  const location = form.elements.location.value.trim();
  const description = form.elements.description.value.trim();
  const latitudeText = form.elements.latitude.value.trim();
  const longitudeText = form.elements.longitude.value.trim();
  message.classList.remove("success");

  if (!currentUser) {
    message.textContent = "Crea una cuenta o inicia sesión para publicar.";
    showAuth();
    return;
  }

  if (!types[type] || location.length < 5 || description.length < 10) {
    message.textContent = "Completa la ubicación y una descripción de al menos 10 caracteres.";
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

  const submit = form.querySelector('[type=submit]');
  submit.disabled = true;
  try {
    const { report } = await request('/api/reports', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, location, description, coordinates }) });
    form.reset();
    locationMessage.textContent = "Las coordenadas se publicarán con el reporte si las ingresas.";
    filter.value = "TODOS";
    search.value = "";
    await refreshReports();
    message.classList.add("success");
    message.textContent = `Reporte ${report.reference} publicado.`;
  } catch (error) { message.textContent = error.message; }
  finally { submit.disabled = false; }
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
      locationMessage.textContent = "Coordenadas listas. Se publicarán con el reporte.";
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
advanceButton.addEventListener('click', async () => {
  if (!currentUser?.isAdmin || !selectedReportId) return;
  advanceButton.disabled = true;
  detailMessage.textContent = '';
  try {
    await request('/api/report-status', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedReportId, status: adminStatus.value }),
    });
    await refreshReports();
    const updated = activeReports().find((report) => report.id === selectedReportId);
    if (updated) renderDetail(updated);
    detailMessage.classList.add('success');
    detailMessage.textContent = 'Estado actualizado.';
  } catch (error) {
    detailMessage.classList.remove('success');
    detailMessage.textContent = error.message;
  } finally { advanceButton.disabled = false; }
});
function setUser(user) {
  currentUser = user;
  document.getElementById('accountButton').textContent = user ? `${user.name}${user.isAdmin ? ' · Admin' : ''} · Salir` : 'Ingresar';
  document.getElementById('myReportsNav').hidden = !user;
  document.getElementById('myReportsButton').hidden = !user;
  if (!user) {
    ownReports = [];
    reportView = 'all';
    document.getElementById('reportsTitle').textContent = 'Reportes recientes';
    document.getElementById('allReportsButton').setAttribute('aria-pressed', 'true');
    document.getElementById('myReportsButton').setAttribute('aria-pressed', 'false');
    render();
  }
  if (dialog.open && selectedReportId) {
    const report = activeReports().find((item) => item.id === selectedReportId);
    if (report) renderDetail(report);
  }
}
function showAuth(register = false) {
  registering = register;
  document.getElementById('authTitle').textContent = register ? 'Crear cuenta' : 'Iniciar sesión';
  document.getElementById('authSubmit').textContent = register ? 'Crear cuenta' : 'Ingresar';
  document.getElementById('authSwitch').textContent = register ? '¿Ya tienes cuenta? Ingresa' : '¿No tienes cuenta? Regístrate';
  document.getElementById('nameField').hidden = !register;
  document.getElementById('authPassword').autocomplete = register ? 'new-password' : 'current-password';
  document.getElementById('authMessage').textContent = '';
  const authDialog = document.getElementById('authDialog');
  if (!authDialog.open) authDialog.showModal();
}
document.getElementById('authForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  const authForm = event.currentTarget;
  const submit = document.getElementById('authSubmit');
  submit.disabled = true;
  try {
    const { user } = await request('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: registering ? 'register' : 'login', name: authForm.elements.name.value, email: authForm.elements.email.value, password: authForm.elements.password.value }) });
    setUser(user);
    authForm.reset();
    document.getElementById('authDialog').close();
    message.textContent = `Sesión iniciada como ${user.name}. Ya puedes publicar.`;
    await switchView('mine');
  } catch (error) { document.getElementById('authMessage').textContent = error.message; }
  finally { submit.disabled = false; }
});
document.getElementById('accountButton').addEventListener('click', async () => {
  if (!currentUser) { showAuth(); return; }
  try {
    await request('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) });
    setUser(null);
    message.textContent = 'Sesión cerrada.';
  } catch (error) { message.textContent = error.message; }
});
document.getElementById('authSwitch').addEventListener('click', () => showAuth(!registering));
document.getElementById('closeAuth').addEventListener('click', () => document.getElementById('authDialog').close());
document.getElementById('allReportsButton').addEventListener('click', () => switchView('all'));
document.getElementById('myReportsButton').addEventListener('click', () => switchView('mine'));
document.getElementById('myReportsNav').addEventListener('click', () => switchView('mine'));
async function initialize() {
  try { setUser((await request('/api/auth')).user); } catch { setUser(null); }
  try {
    await refreshReports();
    if (currentUser) await switchView('mine');
  } catch (error) {
    reportList.replaceChildren(element('p', 'empty-state', error.message));
  }
}
initialize();
