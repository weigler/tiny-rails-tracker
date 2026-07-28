/* ============================================================
   Tiny Rails — Manifesto de Carga
   Reescrita em HTML/JS do controle que antes vivia em macros
   VBA numa planilha. Tudo é salvo no localStorage do navegador.
   ============================================================ */

const LS_KEYS = {
  cities: 'tr_cities',
  inventory: 'tr_inventory',
  trains: 'tr_trains',
  seeded: 'tr_seeded_v5',
  lang: 'tr_item_lang',
};

let state = {
  cities: [],
  inventory: {},   // { itemName: { depot, cargo } }
  trains: [],
  lang: localStorage.getItem(LS_KEYS.lang) || 'pt',
  sort: { cidades: { key: 'city', dir: 1 }, estoque: { key: 'remaining', dir: -1 }, trens: { key: 'points', dir: -1 } },
};

function displayItem(englishName) {
  if (state.lang === 'pt') {
    return SEED_DATA.itemNamesPT[englishName] || englishName;
  }
  return englishName;
}

function itemSearchHaystack(englishName) {
  const pt = SEED_DATA.itemNamesPT[englishName] || '';
  return `${englishName} ${pt}`.toLowerCase();
}

/* ---------------- Bootstrapping / persistence ---------------- */

function loadState() {
  const seeded = localStorage.getItem(LS_KEYS.seeded);
  if (!seeded) {
    seedFromWorkbookData();
    return;
  }
  state.cities = JSON.parse(localStorage.getItem(LS_KEYS.cities) || '[]');
  state.inventory = JSON.parse(localStorage.getItem(LS_KEYS.inventory) || '{}');
  state.trains = JSON.parse(localStorage.getItem(LS_KEYS.trains) || '[]');
}

function seedFromWorkbookData() {
  state.cities = SEED_DATA.cities.map((c, i) => ({ id: 'c' + i, ...c }));

  const inv = {};
  SEED_DATA.inventory.forEach(row => {
    inv[row.item] = { depot: row.depot || 0, cargo: row.cargo || 0 };
  });
  state.inventory = inv;

  state.trains = SEED_DATA.trains.map((t, i) => ({
    id: 't' + i,
    name: t.name,
    namePT: t.namePT,
    type: t.type,
    levels: JSON.parse(JSON.stringify(t.levels)),
    levelOrder: [...t.levelOrder],
    currentLevel: t.currentLevel,
    owned: t.owned,
  }));

  persistAll();
  localStorage.setItem(LS_KEYS.seeded, '1');
}

function persistAll() {
  localStorage.setItem(LS_KEYS.cities, JSON.stringify(state.cities));
  localStorage.setItem(LS_KEYS.inventory, JSON.stringify(state.inventory));
  localStorage.setItem(LS_KEYS.trains, JSON.stringify(state.trains));
}

/* ---------------- Helpers ---------------- */

function clamp0(n) { return n < 0 ? 0 : n; }

function getInv(item) {
  if (!state.inventory[item]) state.inventory[item] = { depot: 0, cargo: 0 };
  return state.inventory[item];
}

function showToast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.add('hidden'), 2200);
}

function debounce(fn, ms) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function sortRows(rows, key, dir) {
  const locale = state.lang === 'pt' ? 'pt-BR' : 'en-US';
  return rows.slice().sort((a, b) => {
    let av = a[key], bv = b[key];
    if (typeof av === 'string' || typeof bv === 'string') {
      return dir * String(av ?? '').localeCompare(String(bv ?? ''), locale, { sensitivity: 'base' });
    }
    av = av ?? -Infinity; bv = bv ?? -Infinity;
    if (av < bv) return -1 * dir;
    if (av > bv) return 1 * dir;
    return 0;
  });
}

function attachSortHandlers(tableId, panelKey, renderFn) {
  document.querySelectorAll(`#${tableId} thead th[data-sort]`).forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      const s = state.sort[panelKey];
      if (s.key === key) s.dir *= -1; else { s.key = key; s.dir = 1; }
      renderFn();
    });
  });
}

/* ================= CIDADES ================= */

function cityRemaining(c) { return clamp0((c.total || 0) - (c.delivered || 0)); }
function cityProgress(c) {
  if (!c.total) return c.delivered > 0 ? 1 : 0;
  return Math.min(1, (c.delivered || 0) / c.total);
}

function populateRegionFilter() {
  const sel = document.getElementById('cidadeRegiaoFiltro');
  const regions = [...new Set(state.cities.map(c => c.region).filter(Boolean))].sort();
  sel.innerHTML = '<option value="">Todas as regiões</option>' +
    regions.map(r => `<option value="${r}">${r}</option>`).join('');
}

function renderCidades() {
  const q = document.getElementById('cidadeBusca').value.trim().toLowerCase();
  const regiao = document.getElementById('cidadeRegiaoFiltro').value;
  const status = document.getElementById('cidadeStatusFiltro').value;

  let rows = state.cities.filter(c => {
    if (regiao && c.region !== regiao) return false;
    const done = cityRemaining(c) === 0;
    if (status === 'pendente' && done) return false;
    if (status === 'completo' && !done) return false;
    if (q) {
      const hay = `${c.city} ${c.state} ${c.region} ${itemSearchHaystack(c.item)}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const { key, dir } = state.sort.cidades;
  const withDerived = rows.map(c => ({ ...c, remaining: cityRemaining(c), progress: cityProgress(c), itemDisplay: displayItem(c.item) }));
  rows = sortRows(withDerived, key === 'item' ? 'itemDisplay' : key, dir);

  document.getElementById('cidadeCount').textContent = `${rows.length} linha(s)`;

  const tbody = document.querySelector('#tabelaCidades tbody');
  tbody.innerHTML = rows.map(c => {
    const pct = Math.round(cityProgress(c) * 100);
    const done = cityRemaining(c) === 0;
    return `
      <tr class="${done ? 'completo' : ''}" data-id="${c.id}">
        <td>${c.region || ''}</td>
        <td>${c.city === 'Factory' ? 'Fábrica' : c.city}</td>
        <td>${c.state || ''}</td>
        <td class="item-name">${displayItem(c.item)}</td>
        <td>${c.total || 0}</td>
        <td><input class="qty-input" type="number" min="0" data-field="delivered" value="${c.delivered || 0}"></td>
        <td>${cityRemaining(c)}</td>
        <td>
          <div class="progress-cell">
            <div class="progress-bar"><span style="width:${pct}%"></span></div>
            <span class="progress-pct">${pct}%</span>
          </div>
        </td>
      </tr>`;
  }).join('') || `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--ink-soft)">Nenhuma linha bate com esse filtro.</td></tr>`;

  tbody.querySelectorAll('input[data-field="delivered"]').forEach(input => {
    input.addEventListener('change', e => {
      const id = e.target.closest('tr').dataset.id;
      const city = state.cities.find(c => c.id === id);
      let v = parseInt(e.target.value, 10);
      if (isNaN(v) || v < 0) v = 0;
      if (v > city.total) v = city.total;
      city.delivered = v;
      persistAll();
      renderCidades();
      renderEstoque();
      showToast(`${displayItem(city.item)} em ${city.city}: entregue atualizado.`);
    });
  });
}

/* ================= ESTOQUE ================= */

function computeItemNeeds() {
  const needMap = {};
  state.cities.forEach(c => {
    if (!c.item) return;
    needMap[c.item] = (needMap[c.item] || 0) + cityRemaining(c);
  });
  const allItems = new Set([...Object.keys(needMap), ...Object.keys(state.inventory)]);
  return [...allItems].map(item => {
    const inv = getInv(item);
    const needed = needMap[item] || 0;
    const remaining = needed - inv.depot - inv.cargo;
    return { item, needed, depot: inv.depot, cargo: inv.cargo, remaining };
  });
}

function renderEstoque() {
  const q = document.getElementById('itemBusca').value.trim().toLowerCase();
  const status = document.getElementById('itemStatusFiltro').value;

  let rows = computeItemNeeds().filter(r => {
    if (q && !itemSearchHaystack(r.item).includes(q)) return false;
    if (status === 'falta' && r.remaining <= 0) return false;
    if (status === 'completo' && r.remaining > 0) return false;
    return true;
  });

  const { key, dir } = state.sort.estoque;
  const withDerived = rows.map(r => ({ ...r, itemDisplay: displayItem(r.item) }));
  rows = sortRows(withDerived, key === 'item' ? 'itemDisplay' : key, dir);

  document.getElementById('itemCount').textContent = `${rows.length} item(ns)`;

  const tbody = document.querySelector('#tabelaItens tbody');
  tbody.innerHTML = rows.map(r => `
    <tr class="${r.remaining <= 0 ? 'completo' : ''}" data-item="${encodeURIComponent(r.item)}">
      <td class="item-name">${displayItem(r.item)}</td>
      <td>${r.needed}</td>
      <td><input class="qty-input" type="number" min="0" data-field="depot" value="${r.depot}"></td>
      <td><input class="qty-input" type="number" min="0" data-field="cargo" value="${r.cargo}"></td>
      <td>${r.remaining}</td>
      <td>
        <div class="transfer-cell">
          <input type="number" min="1" placeholder="qtd" class="transfer-qty">
          <button class="btn btn-secondary btn-mini" data-dir="toDepot" title="Mover do vagão pro depósito">⇐ Depósito</button>
          <button class="btn btn-secondary btn-mini" data-dir="toCargo" title="Mover do depósito pro vagão">Vagão ⇒</button>
        </div>
      </td>
    </tr>`).join('') || `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--ink-soft)">Nenhum item bate com esse filtro.</td></tr>`;

  tbody.querySelectorAll('tr').forEach(tr => {
    const item = decodeURIComponent(tr.dataset.item);

    tr.querySelector('input[data-field="depot"]').addEventListener('change', e => {
      let v = parseInt(e.target.value, 10); if (isNaN(v) || v < 0) v = 0;
      getInv(item).depot = v; persistAll(); renderEstoque();
      showToast(`${displayItem(item)}: depósito atualizado.`);
    });
    tr.querySelector('input[data-field="cargo"]').addEventListener('change', e => {
      let v = parseInt(e.target.value, 10); if (isNaN(v) || v < 0) v = 0;
      getInv(item).cargo = v; persistAll(); renderEstoque();
      showToast(`${displayItem(item)}: vagão atualizado.`);
    });

    tr.querySelectorAll('.transfer-cell button').forEach(btn => {
      btn.addEventListener('click', () => {
        const qtyInput = tr.querySelector('.transfer-qty');
        let qty = parseInt(qtyInput.value, 10);
        const inv = getInv(item);
        if (isNaN(qty) || qty <= 0) { showToast('Digite uma quantidade válida.'); return; }
        if (btn.dataset.dir === 'toDepot') {
          if (qty > inv.cargo) { showToast(`O vagão só tem ${inv.cargo} de ${displayItem(item)}.`); return; }
          inv.cargo -= qty; inv.depot += qty;
        } else {
          if (qty > inv.depot) { showToast(`O depósito só tem ${inv.depot} de ${displayItem(item)}.`); return; }
          inv.depot -= qty; inv.cargo += qty;
        }
        persistAll();
        renderEstoque();
        showToast(`Transferido ${qty}× ${displayItem(item)}.`);
      });
    });
  });
}

/* ================= TRENS ================= */

const TREN_STAT_FIELDS = ['weight', 'passengers', 'cargo', 'food', 'comfort', 'entertainment', 'facilities', 'points'];
const LEVEL_LABELS = { '1': 'Nível 1', '2': 'Nível 2', 'max': 'Max' };
const LEVEL_SEQUENCE = ['1', '2', 'max'];

function currentStats(train) {
  return train.levels[train.currentLevel] || {};
}

function displayTrainName(t) {
  return state.lang === 'pt' ? (t.namePT || t.name) : t.name;
}

function trainSearchHaystack(t) {
  return `${t.name} ${t.namePT || ''}`.toLowerCase();
}

function renderTrens() {
  const q = document.getElementById('trenBusca').value.trim().toLowerCase();
  const tipo = document.getElementById('trenTipoFiltro').value;
  const possuo = document.getElementById('trenPossuoFiltro').value;

  let rows = state.trains.filter(t => {
    if (tipo && t.type !== tipo) return false;
    if (possuo === 'sim' && !t.owned) return false;
    if (possuo === 'nao' && t.owned) return false;
    if (q && !trainSearchHaystack(t).includes(q)) return false;
    return true;
  });

  const { key, dir } = state.sort.trens;
  const withStats = rows.map(t => ({ ...t, ...currentStats(t), nameDisplay: displayTrainName(t) }));
  rows = sortRows(withStats, key === 'name' ? 'nameDisplay' : key, dir).map(r => state.trains.find(t => t.id === r.id));

  document.getElementById('trenCount').textContent = `${rows.length} vagão/vagões`;

  const tbody = document.querySelector('#tabelaTrens tbody');
  const fmt = v => v === null || v === undefined ? '—' : v;
  tbody.innerHTML = rows.map(t => {
    const stats = currentStats(t);
    return `
    <tr data-id="${t.id}">
      <td>${displayTrainName(t)}</td>
      <td>${t.type}</td>
      <td>
        <select class="tbl-select" data-field="currentLevel">
          ${t.levelOrder.map(lv => `<option value="${lv}" ${t.currentLevel === lv ? 'selected' : ''}>${LEVEL_LABELS[lv]}</option>`).join('')}
        </select>
      </td>
      ${TREN_STAT_FIELDS.map(f => `<td>${fmt(stats[f])}</td>`).join('')}
      <td><input type="checkbox" class="own-check" ${t.owned ? 'checked' : ''}></td>
    </tr>`;
  }).join('') || `<tr><td colspan="12" style="text-align:center;padding:24px;color:var(--ink-soft)">Nenhum vagão bate com esse filtro.</td></tr>`;

  tbody.querySelectorAll('tr[data-id]').forEach(tr => {
    const id = tr.dataset.id;
    const train = state.trains.find(t => t.id === id);
    if (!train) return;

    tr.querySelector('select[data-field="currentLevel"]').addEventListener('change', e => {
      train.currentLevel = e.target.value;
      persistAll();
      renderTrens();
      showToast(`${displayTrainName(train)}: mostrando ${LEVEL_LABELS[train.currentLevel]}.`);
    });
    tr.querySelector('.own-check').addEventListener('change', e => {
      train.owned = e.target.checked;
      persistAll();
      showToast(`${displayTrainName(train)}: ${e.target.checked ? 'marcado como possuído' : 'desmarcado'}.`);
    });
  });
}

const WEIGHT_SCALE = 10; // weights have at most 1 decimal place
const MAX_WEIGHT_UNITS = 6000; // safety cap (= weight limit of 600) so the calculation never hangs the browser
const MAX_SLOTS_CAP = 60;

// 0/1 knapsack with two simultaneous limits: at most maxCount items, at most maxWeightUnits total weight.
// Returns the indices (into items[]) of the chosen items that maximize total points.
function knapsackBestCombo(items, maxCount, maxWeightUnits) {
  const n = items.length;
  const K = Math.min(maxCount, MAX_SLOTS_CAP, n);
  const W = Math.min(maxWeightUnits, MAX_WEIGHT_UNITS);

  let dp = Array.from({ length: K + 1 }, () => new Float64Array(W + 1));
  const takenPerItem = [];

  for (let i = 0; i < n; i++) {
    const wUnits = Math.max(0, Math.round(items[i].weight * WEIGHT_SCALE));
    const pts = items[i].points || 0;
    const taken = new Uint8Array((K + 1) * (W + 1));
    for (let k = K; k >= 1; k--) {
      const rowK = dp[k], rowKm1 = dp[k - 1];
      for (let w = W; w >= wUnits; w--) {
        const candidate = rowKm1[w - wUnits] + pts;
        if (candidate > rowK[w]) {
          rowK[w] = candidate;
          taken[k * (W + 1) + w] = 1;
        }
      }
    }
    takenPerItem.push(taken);
  }

  let k = K, w = W;
  const chosenIdx = [];
  for (let i = n - 1; i >= 0; i--) {
    const taken = takenPerItem[i];
    if (taken[k * (W + 1) + w]) {
      chosenIdx.push(i);
      const wUnits = Math.max(0, Math.round(items[i].weight * WEIGHT_SCALE));
      k -= 1;
      w -= wUnits;
    }
  }
  return { chosenIdx: chosenIdx.reverse(), totalPoints: dp[K][W] };
}

function renderComboResultado(slots, maxWeight) {
  const box = document.getElementById('comboResultado');
  const owned = state.trains.filter(t => t.owned);

  if (owned.length === 0) {
    box.innerHTML = `<p class="combo-empty">Nenhum vagão está marcado como "Tenho" ainda. Marque na tabela abaixo pra calcular.</p>`;
    return;
  }

  const withStats = owned.map(t => ({ ...t, ...currentStats(t) }));
  const maxWeightUnits = Math.round(maxWeight * WEIGHT_SCALE);
  const { chosenIdx } = knapsackBestCombo(withStats, slots, maxWeightUnits);
  const chosen = chosenIdx.map(i => withStats[i]);
  const sum = (field) => chosen.reduce((acc, t) => acc + (t[field] || 0), 0);

  const cappedNote = (slots > MAX_SLOTS_CAP || maxWeight * WEIGHT_SCALE > MAX_WEIGHT_UNITS)
    ? `<p class="combo-empty" style="margin-bottom:8px">Limitei o cálculo a no máximo ${MAX_SLOTS_CAP} vagas e peso ${MAX_WEIGHT_UNITS / WEIGHT_SCALE} pra não travar o navegador.</p>` : '';

  const summaryHtml = `
    ${cappedNote}
    <div class="combo-summary">
      <span><b>${chosen.length}</b> de ${slots} vaga(s) preenchida(s)</span>
      <span><b>${sum('weight').toFixed(1)}</b> de ${maxWeight} de peso</span>
      <span><b>${sum('points').toFixed(1)}</b> pontos</span>
      <span><b>${sum('passengers')}</b> passageiros</span>
      <span><b>${sum('cargo')}</b> carga</span>
      <span><b>${sum('food')}</b> comida</span>
      <span><b>${sum('comfort')}</b> conforto</span>
      <span><b>${sum('entertainment')}</b> diversão</span>
      <span><b>${sum('facilities')}</b> instalações</span>
    </div>`;

  const listHtml = chosen.length
    ? `<div class="combo-list">${chosen.map(t => `
        <div class="combo-list-item"><span>${displayTrainName(t)} <span style="color:var(--ink-soft)">(${t.type}, ${LEVEL_LABELS[t.currentLevel]}, peso ${t.weight})</span></span><span>${t.points ?? '—'} pts</span></div>
      `).join('')}</div>`
    : `<p class="combo-empty">Nenhuma combinação coube nesses limites.</p>`;

  box.innerHTML = summaryHtml + listHtml;

  if (owned.length < slots) {
    box.innerHTML += `<p class="combo-empty" style="margin-top:8px">Você só tem ${owned.length} vagão/vagões marcados como "Tenho" — pode ser menos que as ${slots} vagas pedidas.</p>`;
  }
}

document.getElementById('btnCalcularCombo').addEventListener('click', () => {
  let slots = parseInt(document.getElementById('comboVagas').value, 10);
  if (isNaN(slots) || slots < 1) slots = 1;
  let maxWeight = parseFloat(document.getElementById('comboPesoMax').value);
  if (isNaN(maxWeight) || maxWeight < 0) maxWeight = 0;
  renderComboResultado(slots, maxWeight);
});

document.getElementById('btnRecalcularPontos').addEventListener('click', () => {
  const pesoAlto = parseFloat(document.getElementById('pesoCargaPass').value) || 0;
  const pesoBaixo = parseFloat(document.getElementById('pesoOutros').value) || 0;
  localStorage.setItem('tr_peso_carga_pass', pesoAlto);
  localStorage.setItem('tr_peso_outros', pesoBaixo);
  if (!confirm(`Isso substitui a pontuação já preenchida em todos os vagões (todos os níveis), usando peso ${pesoAlto} pra carga/passageiros e peso ${pesoBaixo} pros demais atributos. Continuar?`)) return;

  state.trains.forEach(t => {
    Object.values(t.levels).forEach(stats => {
      stats.points = pesoAlto * ((stats.passengers || 0) + (stats.cargo || 0))
        + pesoBaixo * ((stats.food || 0) + (stats.comfort || 0) + (stats.entertainment || 0) + (stats.facilities || 0));
    });
  });
  persistAll();
  renderTrens();
  showToast('Pontuação recalculada pra todos os vagões e níveis.');
});

/* ================= AJUSTES ================= */

function renderConfig() {
  const aliasBox = document.getElementById('listaAliases');
  aliasBox.innerHTML = Object.entries(SEED_DATA.aliasesApplied)
    .map(([oldName, newName]) => `<span class="alias-pill">${oldName} → ${newName}</span>`).join('');

  const reviewBox = document.getElementById('listaRevisao');
  const resolved = SEED_DATA.resolvedViaWiki || [];
  reviewBox.innerHTML = resolved
    .map(entry => `<span class="alias-pill">${entry}</span>`).join('') || '<span class="alias-pill">Nenhum</span>';

  document.getElementById('idiomaItens').value = state.lang;
}

document.getElementById('idiomaItens').addEventListener('change', e => {
  state.lang = e.target.value;
  localStorage.setItem(LS_KEYS.lang, state.lang);
  renderCidades();
  renderEstoque();
  renderTrens();
  if (document.getElementById('comboResultado').innerHTML.trim()) {
    let slots = parseInt(document.getElementById('comboVagas').value, 10);
    if (isNaN(slots) || slots < 1) slots = 1;
    let maxWeight = parseFloat(document.getElementById('comboPesoMax').value);
    if (isNaN(maxWeight) || maxWeight < 0) maxWeight = 0;
    renderComboResultado(slots, maxWeight);
  }
  showToast(state.lang === 'pt' ? 'Itens e vagões em português.' : 'Itens e vagões em inglês.');
});

document.getElementById('btnExportar').addEventListener('click', () => {
  const backup = { cities: state.cities, inventory: state.inventory, trains: state.trains, exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tiny-rails-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  showToast('Backup exportado.');
});

document.getElementById('inputImportar').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data.cities || !data.inventory || !data.trains) throw new Error('formato inesperado');
      state.cities = data.cities;
      state.inventory = data.inventory;
      state.trains = data.trains;
      persistAll();
      renderAll();
      showToast('Backup importado com sucesso.');
    } catch (err) {
      showToast('Esse arquivo não parece um backup válido.');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
});

document.getElementById('btnZerarProgresso').addEventListener('click', () => {
  if (!confirm('Isso zera o quanto você já entregou em cada cidade, o depósito e o vagão de todo item, e desmarca todos os vagões como "Tenho". As listas de cidades, itens e vagões continuam do jeito que estão. Continuar?')) return;
  state.cities.forEach(c => { c.delivered = 0; });
  Object.keys(state.inventory).forEach(item => {
    state.inventory[item].depot = 0;
    state.inventory[item].cargo = 0;
  });
  state.trains.forEach(t => { t.owned = false; t.currentLevel = t.levelOrder[0]; });
  persistAll();
  renderAll();
  showToast('Progresso zerado — jogo novo, listas mantidas.');
});

/* ================= Tabs / init ================= */

function renderAll() {
  populateRegionFilter();
  renderCidades();
  renderEstoque();
  renderTrens();
  renderConfig();
}

document.getElementById('tabs').addEventListener('click', e => {
  const btn = e.target.closest('.tab');
  if (!btn) return;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
  document.getElementById(`panel-${btn.dataset.tab}`).classList.remove('hidden');
});

['cidadeBusca', 'cidadeRegiaoFiltro', 'cidadeStatusFiltro'].forEach(id =>
  document.getElementById(id).addEventListener('input', debounce(renderCidades, 120)));
['itemBusca', 'itemStatusFiltro'].forEach(id =>
  document.getElementById(id).addEventListener('input', debounce(renderEstoque, 120)));
['trenBusca', 'trenTipoFiltro', 'trenPossuoFiltro'].forEach(id =>
  document.getElementById(id).addEventListener('input', debounce(renderTrens, 120)));

attachSortHandlers('tabelaCidades', 'cidades', renderCidades);
attachSortHandlers('tabelaItens', 'estoque', renderEstoque);
attachSortHandlers('tabelaTrens', 'trens', renderTrens);

loadState();
renderAll();

const savedPesoAlto = localStorage.getItem('tr_peso_carga_pass');
const savedPesoBaixo = localStorage.getItem('tr_peso_outros');
if (savedPesoAlto !== null) document.getElementById('pesoCargaPass').value = savedPesoAlto;
if (savedPesoBaixo !== null) document.getElementById('pesoOutros').value = savedPesoBaixo;
