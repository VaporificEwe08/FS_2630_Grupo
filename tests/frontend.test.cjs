const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'app', 'app.js'), 'utf8');
const storageKey = 'ecobogota-demo-reports-v1';

class FakeElement {
  constructor() {
    this.children = [];
    this.handlers = {};
    this.textContent = '';
    this.className = '';
    this.hidden = false;
    this.classList = { add: () => {}, remove: () => {} };
  }

  append(...children) { this.children.push(...children); }
  replaceChildren(...children) { this.children = children; }
  addEventListener(event, handler) { this.handlers[event] = handler; }
  showModal() { this.open = true; }
  close() { this.open = false; this.handlers.close?.(); }
}

function makeStorage(initial = {}, failWrites = false) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    getItem(key) { return values.get(key) ?? null; },
    setItem(key, value) {
      if (failWrites) throw new Error('Storage unavailable');
      values.set(key, value);
    },
  };
}

function boot(storage = makeStorage(), geolocation = null) {
  const ids = Object.fromEntries([
    'reportList', 'statusFilter', 'reportSearch', 'reportForm', 'formMessage',
    'totalCount', 'openCount', 'resolvedCount', 'reportDialog', 'reportDetail',
    'detailMessage', 'advanceStatus', 'closeDialog', 'detectLocation', 'locationMessage',
  ].map((id) => [id, new FakeElement()]));
  ids.statusFilter.value = 'TODOS';
  ids.reportSearch.value = '';
  ids.reportForm.elements = {
    type: { value: '' }, location: { value: '' }, description: { value: '' },
    latitude: { value: '' }, longitude: { value: '' },
  };
  ids.reportForm.reset = () => {
    for (const field of Object.values(ids.reportForm.elements)) field.value = '';
  };
  const document = {
    getElementById: (id) => ids[id],
    createElement: () => new FakeElement(),
  };
  const context = vm.createContext({
    document, localStorage: storage, Date, Intl, Math, String, JSON, Number,
    crypto: { randomUUID: () => '00000000-0000-4000-8000-12345678abcd' },
    navigator: geolocation ? { geolocation } : {},
  });
  vm.runInContext(source, context);
  return { ids, storage, context };
}

function submit(ids, type, location, description) {
  ids.reportForm.elements.type.value = type;
  ids.reportForm.elements.location.value = location;
  ids.reportForm.elements.description.value = description;
  ids.reportForm.handlers.submit({ preventDefault() {} });
}

function cards(ids) {
  return ids.reportList.children.filter((child) => child.className === 'report-card');
}

test('crea un reporte y permite buscarlo por código, ubicación y descripción', () => {
  const { ids, storage } = boot();
  assert.equal(cards(ids).length, 3);
  submit(ids, 'ESCOMBROS', 'Calle 50, Bogotá', 'Hay residuos en el andén');
  assert.equal(ids.totalCount.textContent, '4');
  const saved = JSON.parse(storage.getItem(storageKey));
  assert.match(saved[0].reference, /^ECO-[A-Z0-9]{8}$/);
  assert.equal(saved[0].status, 'RECIBIDO');
  assert.equal(saved[0].history.length, 1);
  for (const query of [saved[0].reference.toLowerCase(), 'bogota', 'RESIDUOS EN EL ANDEN']) {
    ids.reportSearch.value = query;
    ids.reportSearch.handlers.input();
    assert.equal(cards(ids).length, 1);
  }
  ids.statusFilter.value = 'RESUELTO';
  ids.statusFilter.handlers.change();
  assert.equal(cards(ids).length, 0);
});

test('rechaza formularios incompletos y fallos al guardar sin alterar la lista', () => {
  const { ids, storage } = boot();
  submit(ids, 'OTRO', '   ', 'Descripción');
  assert.equal(ids.totalCount.textContent, '3');
  assert.equal(storage.getItem(storageKey), null);

  const unavailable = boot(makeStorage({}, true));
  submit(unavailable.ids, 'OTRO', 'Calle 50', 'Descripción');
  assert.equal(unavailable.ids.totalCount.textContent, '3');
  assert.match(unavailable.ids.formMessage.textContent, /No se pudo guardar/);
});

test('avanza estados, guarda el historial y lo recupera al recargar', () => {
  const storage = makeStorage();
  const { ids } = boot(storage);
  cards(ids)[0].children.at(-1).handlers.click();
  assert.equal(ids.reportDialog.open, true);
  assert.equal(ids.reportDetail.children[2].children.length, 3);
  ids.advanceStatus.handlers.click();
  ids.advanceStatus.handlers.click();
  assert.equal(ids.advanceStatus.hidden, true);
  assert.equal(ids.resolvedCount.textContent, '2');
  ids.advanceStatus.handlers.click();
  const saved = JSON.parse(storage.getItem(storageKey));
  assert.equal(saved[0].status, 'RESUELTO');
  assert.equal(saved[0].history.length, 3);

  const reloaded = boot(storage);
  assert.equal(reloaded.ids.resolvedCount.textContent, '2');
  assert.equal(cards(reloaded.ids).length, 3);
});

test('migra reportes anteriores sin inventar fechas de transición', () => {
  const previous = [{
    id: 'reporte-anterior', type: 'ESCOMBROS', location: 'Centro',
    description: 'Escombros en el andén', status: 'RESUELTO',
    createdAt: '2026-08-01T12:00:00.000Z',
  }];
  const storage = makeStorage({ [storageKey]: JSON.stringify(previous) });
  const { ids } = boot(storage);
  assert.equal(cards(ids).length, 1);
  cards(ids)[0].children.at(-1).handlers.click();
  const timeline = ids.reportDetail.children[2];
  assert.equal(timeline.children.length, 3);
  assert.match(timeline.children[1].children[1].children[1].textContent, /Fecha no registrada/);
  assert.match(timeline.children[2].children[1].children[1].textContent, /Fecha no registrada/);
  assert.equal(ids.advanceStatus.hidden, true);
  assert.match(ids.reportDetail.children[0].children[2].children[0].children[1].textContent, /^ECO-/);
});

test('guarda coordenadas válidas y rechaza pares incompletos o fuera de rango', () => {
  const { ids, storage } = boot();
  ids.reportForm.elements.latitude.value = '4.65';
  submit(ids, 'OTRO', 'Calle 50', 'Residuos en el andén');
  assert.equal(storage.getItem(storageKey), null);
  assert.match(ids.formMessage.textContent, /latitud y longitud/);

  ids.reportForm.elements.longitude.value = '-200';
  submit(ids, 'OTRO', 'Calle 50', 'Residuos en el andén');
  assert.equal(storage.getItem(storageKey), null);

  ids.reportForm.elements.longitude.value = '-74.08';
  submit(ids, 'OTRO', 'Calle 50', 'Residuos en el andén');
  const saved = JSON.parse(storage.getItem(storageKey));
  assert.equal(saved[0].coordinates.latitude, 4.65);
  assert.equal(saved[0].coordinates.longitude, -74.08);
  cards(ids)[0].children.at(-1).handlers.click();
  const metadata = ids.reportDetail.children[0].children[2];
  assert.equal(metadata.children[3].children[0].textContent, 'Coordenadas');
  const reloaded = boot(storage);
  cards(reloaded.ids)[0].children.at(-1).handlers.click();
  assert.equal(reloaded.ids.reportDetail.children[0].children[2].children[3].children[0].textContent, 'Coordenadas');
});

test('solo pide geolocalización al pulsar el botón y permite continuar si no está disponible', () => {
  let requests = 0;
  const geolocation = {
    getCurrentPosition(success) {
      requests += 1;
      success({ coords: { latitude: 4.65, longitude: -74.08 } });
    },
  };
  const { ids } = boot(makeStorage(), geolocation);
  assert.equal(requests, 0);
  ids.detectLocation.handlers.click();
  assert.equal(requests, 1);
  assert.equal(ids.reportForm.elements.latitude.value, '4.650000');
  assert.equal(ids.reportForm.elements.longitude.value, '-74.080000');
  assert.equal(ids.detectLocation.disabled, false);

  const withoutLocation = boot();
  withoutLocation.ids.detectLocation.handlers.click();
  assert.match(withoutLocation.ids.locationMessage.textContent, /manualmente/);

  const denied = boot(makeStorage(), { getCurrentPosition(_success, error) { error({ code: 1 }); } });
  denied.ids.detectLocation.handlers.click();
  assert.equal(denied.ids.detectLocation.disabled, false);
  assert.match(denied.ids.locationMessage.textContent, /manualmente/);
});
