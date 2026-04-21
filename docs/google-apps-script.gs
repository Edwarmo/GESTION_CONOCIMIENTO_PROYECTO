/**
 * ════════════════════════════════════════════════════════════════════════════════
 *  GOOGLE APPS SCRIPT — Sistema BI (Feelback)
 * ════════════════════════════════════════════════════════════════════════════════
 *
 *  PROYECTO: SGPMI — Feelback | Social commerce
 *  ZONA HORARIA: America/Bogota (UTC-5)
 *  MONEDA: COP
 *
 *  NUEVA ESTRUCTURA DE HOJAS FUENTE (Inmutables):
 *  ├── Pedidos         → Cliente, Telefono, Pedido, Fecha, Estado, TotalCOP
 *  ├── Usuarios        → Nombre, Email, FechaRegistro, Rol
 *  └── PersonasExtra   → Nombre, Email, Telefono, Rol, Notas, RegistradoPor, Fecha
 *
 *  NUEVA ESTRUCTURA CACHÉ:
 *  ├── _CACHE_Pedidos  → Enriquecida temporalmente (Fechas, alias)
 *  ├── _CACHE_Clientes → Retención (Nuevo vs Recurrente), Ticket Promedio, RFM
 *  └── _CACHE_Inventario→ Frecuencia de palabras/ítems en los pedidos
 *
 * ════════════════════════════════════════════════════════════════════════════════
 */

const SPREADSHEET_ID = "12bnYLbUbs-nEccL3hrfVA1zKS4k0n_1zfP72ej07KF8";
const TIMEZONE = "America/Bogota"; 

// ═══════════════════════════════════════════════════════════════════════════════
//  FUNCIONES AUXILIARES (DEBEN IR PRIMERO)
// ═══════════════════════════════════════════════════════════════════════════════

function _getOrCreateSheet(ss, name, headers) {
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (headers && headers.length > 0) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      _formatHeaders(sheet, headers.length);
    }
  }
  return sheet;
}

function _formatHeaders(sheet, numCols) {
  sheet.getRange(1, 1, 1, numCols)
    .setFontWeight("bold")
    .setBackground("#1a1a2e")
    .setFontColor("#00f0ff")
    .setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}

function _parseDate(v) { 
  if (v instanceof Date) return v; 
  const d = new Date(v); 
  return isNaN(d) ? null : d; 
}

function _diaSemanaES(f) { 
  return ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][f.getDay()]; 
}

function _semanaISO(f) { 
  const d = new Date(Date.UTC(f.getFullYear(), f.getMonth(), f.getDate())); 
  const dn = d.getUTCDay() || 7; 
  d.setUTCDate(d.getUTCDate() + 4 - dn); 
  const ys = new Date(Date.UTC(d.getUTCFullYear(), 0, 1)); 
  return d.getUTCFullYear() + "-W" + String(Math.ceil(((d - ys) / 86400000 + 1) / 7)).padStart(2, "0"); 
}

function _registrarUltimaActualizacion(ss, ahora) {
  var meta = _getOrCreateSheet(ss, "_META", ["Clave", "Valor"]);
  meta.getRange("A2:B2").setValues([["UltimaActualizacion", Utilities.formatDate(ahora, TIMEZONE, "yyyy-MM-dd HH:mm:ss")]]);
  try {
    meta.hideSheet();
  } catch(e) {
    // Si ya está oculta, ignorar
  }
}

function _jsonResponse(data, code=200) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function _crearTarjeta(sheet, col, row, titulo, formula, formato) {
  sheet.getRange(col + row + ":" + String.fromCharCode(col.charCodeAt(0)+1) + (row+2)).merge().setBackground("#12182b");
  sheet.getRange(col + row).setValue(titulo).setFontSize(9).setFontColor("#aaa").setFontWeight("bold");
  sheet.getRange(col + (row+1)).setFormula(formula).setFontSize(22).setFontWeight("bold").setFontColor("#00f0ff").setHorizontalAlignment("center").setNumberFormat(formato);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  1. WEB APP (doPost / doGet)
// ═══════════════════════════════════════════════════════════════════════════════

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const sheetName = body.sheet;
    const data = body.data;

    if (!sheetName || !data) return _jsonResponse({ error: "Falta body" }, 400);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      const headers = Object.keys(data);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      _formatHeaders(sheet, headers.length);
    }

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(h => data[h] !== undefined ? data[h] : "");
    sheet.appendRow(row);

    if (sheetName === "Pedidos") {
      try { refrescarCache(); } catch(_) {}
    }

    return _jsonResponse({ success: true, sheet: sheetName });
  } catch (err) {
    return _jsonResponse({ error: err.message }, 500);
  }
}

function doGet() {
  return _jsonResponse({ status: "ok", proyecto: "SGPMI - Feelback BI" });
}

function _jsonResponse(data, code=200) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function _formatHeaders(sheet, numCols) {
  sheet.getRange(1, 1, 1, numCols).setFontWeight("bold").setBackground("#1a1a2e").setFontColor("#00f0ff").setHorizontalAlignment("center");
  sheet.setFrozenRows(1);
}


// ═══════════════════════════════════════════════════════════════════════════════
//  2. MOTOR DE CACHÉ Y TRANSFORMACIÓN (ETL)
// ═══════════════════════════════════════════════════════════════════════════════

function refrescarCache() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const ahora = new Date();

  const pedidosSheet = ss.getSheetByName("Pedidos");
  if (!pedidosSheet || pedidosSheet.getLastRow() < 2) return;

  // Asumimos columnas: 0:Cliente, 1:Telefono, 2:Pedido(texto), 3:Fecha, 4:Estado, 5:TotalCOP
  const lastCol = Math.max(6, pedidosSheet.getLastColumn()); 
  const pedidosData = pedidosSheet.getRange(2, 1, pedidosSheet.getLastRow() - 1, lastCol).getValues();

  // ── A. CACHE PEDIDOS ──────────────────────────────────────────────────────
  const cachePedidos = _getOrCreateSheet(ss, "_CACHE_Pedidos",
    ["PedidoID", "ClienteAlias", "PedidoTexto", "Fecha", "MesResumen", "SemanaISO", "DiaSemana", "Hora", "Estado", "TotalCOP"]
  );

  let inventarioCrudo = [];
  
  const enrichedRows = pedidosData.map((row, i) => {
    const fecha = _parseDate(row[3]);
    const alias = (String(row[0]).split(" ")[0] || "Anon") + "_" + String(row[1]).slice(-4);
    const totalCop = parseFloat(row[5]) || 0; // Si no hay, es 0
    const pedidoTexto = String(row[2]).toLowerCase();

    // Extraer palabras/items simples p/ inventario
    const items = pedidoTexto.split(/[,\n]+/).map(x => x.trim()).filter(x => x.length > 2);
    inventarioCrudo = inventarioCrudo.concat(items.map(item => ({ item: item, fecha: fecha })));

    return [
      "P-" + String(i + 1).padStart(4, "0"),
      alias,
      row[2],
      fecha ? Utilities.formatDate(fecha, TIMEZONE, "yyyy-MM-dd HH:mm") : "",
      fecha ? Utilities.formatDate(fecha, TIMEZONE, "yyyy-MM") : "",
      fecha ? _semanaISO(fecha) : "",
      fecha ? _diaSemanaES(fecha) : "",
      fecha ? Utilities.formatDate(fecha, TIMEZONE, "HH") : "",
      row[4] || "PENDIENTE",
      totalCop
    ];
  });

  cachePedidos.getRange(2, 1, cachePedidos.getMaxRows() - 1, 10).clearContent();
  if (enrichedRows.length > 0) cachePedidos.getRange(2, 1, enrichedRows.length, 10).setValues(enrichedRows);

  // ── B. CACHE CLIENTES (Segmentación) ──────────────────────────────────────
  const cacheClientes = _getOrCreateSheet(ss, "_CACHE_Clientes",
    ["ClienteAlias", "Tipo (Nuevo/Recurrente)", "TotalPedidos", "TotalGastado", "TicketPromedio", 
     "PrimerPedido", "UltimoPedido", "DiasDesdeUltimo", "Ritmo (DiasEntrePedidos)", "SegmentoRFM"]
  );

  const clientesMap = {};
  enrichedRows.forEach(row => {
    const alias = row[1];
    const fechaStr = row[3];
    const gasto = parseFloat(row[9]) || 0;
    if (!alias || !fechaStr) return;

    if (!clientesMap[alias]) clientesMap[alias] = { t: 0, g: 0, f: [] };
    clientesMap[alias].t++;
    clientesMap[alias].g += gasto;
    clientesMap[alias].f.push(new Date(fechaStr));
  });

  const clienteRows = [];
  for (let alias in clientesMap) {
    const c = clientesMap[alias];
    const fechas = c.f.sort((a,b) => a-b);
    const primera = fechas[0];
    const ultima = fechas[fechas.length - 1];
    
    const diasInactivo = Math.floor((ahora - ultima) / 86400000);
    const rangoDiasVida = Math.floor((ultima - primera) / 86400000);
    const ritmoDias = c.t > 1 ? (rangoDiasVida / (c.t - 1)) : 0; // Tiempo promedio entre pedidos

    const ticketPromedio = c.g / c.t;
    const tipo = c.t > 1 ? "RECURRENTE" : "NUEVO";
    
    // Segmentación
    let segmento = "REGULAR";
    // Si compran más de 3 veces al mes (proyectado por el ritmo)
    if (c.t > 3 && ritmoDias > 0 && ritmoDias <= 10) segmento = "Fidelizable (>3/mes)";
    // RFM standard
    else if (diasInactivo <= 7 && c.t >= 4) segmento = "CAMPEÓN";
    else if (diasInactivo <= 14 && tipo === "NUEVO") segmento = "NUEVO PROMETEDOR";
    else if (diasInactivo > 30 && c.t > 2) segmento = "RIESGO DE FUGA";
    
    clienteRows.push([
      alias, tipo, c.t, c.g, ticketPromedio,
      Utilities.formatDate(primera, TIMEZONE, "yyyy-MM-dd"),
      Utilities.formatDate(ultima, TIMEZONE, "yyyy-MM-dd"),
      diasInactivo, ritmoDias, segmento
    ]);
  }

  cacheClientes.getRange(2, 1, cacheClientes.getMaxRows() - 1, 10).clearContent();
  if (clienteRows.length > 0) cacheClientes.getRange(2, 1, clienteRows.length, 10).setValues(clienteRows);

  // ── C. CACHE INVENTARIO (Proyección y Rotación) ───────────────────────────
  const cacheInv = _getOrCreateSheet(ss, "_CACHE_Inventario",
    ["ProductoEstimado", "MencionesTotales", "UltimaVenta", "DiasSinRotacion", "Status"]
  );

  const invMap = {};
  inventarioCrudo.forEach(x => {
    // limpieza super basica
    let p = x.item.replace(/[0-9]+x/g, '').trim().toUpperCase();
    if(p.length < 3) return; 
    if(!invMap[p]) invMap[p] = { count: 0, last: x.fecha };
    invMap[p].count++;
    if(x.fecha > invMap[p].last) invMap[p].last = x.fecha;
  });

  const invRows = [];
  for(let p in invMap) {
    const obj = invMap[p];
    if(!obj.last) continue;
    const dias = Math.floor((ahora - obj.last) / 86400000);
    let status = "NORMAL";
    if (dias > 30) status = "SIN ROTACION (Evaluar)";
    if (obj.count >= 10 && dias <= 7) status = "ESTRELLA (Priorizar stock)";

    invRows.push([p, obj.count, Utilities.formatDate(obj.last, TIMEZONE, "yyyy-MM-dd"), dias, status]);
  }
  
  // Ordenar por MencionesDesc
  invRows.sort((a,b) => b[1] - a[1]);

  cacheInv.getRange(2, 1, cacheInv.getMaxRows() - 1, 5).clearContent();
  if (invRows.length > 0) cacheInv.getRange(2, 1, invRows.length, 5).setValues(invRows);

  _registrarUltimaActualizacion(ss, ahora);
}

// ── Helpers ────────────────────────────────────────────────────────────────
function _parseDate(v) { if (v instanceof Date) return v; const d = new Date(v); return isNaN(d) ? null : d; }
function _diaSemanaES(f) { return ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][f.getDay()]; }
function _semanaISO(f) { const d=new Date(Date.UTC(f.getFullYear(), f.getMonth(), f.getDate())); const dn=d.getUTCDay()||7; d.setUTCDate(d.getUTCDate()+4-dn); const ys=new Date(Date.UTC(d.getUTCFullYear(),0,1)); return d.getUTCFullYear()+"-W"+String(Math.ceil(((d-ys)/86400000+1)/7)).padStart(2,"0"); }
function _registrarUltimaActualizacion(ss, ahora) {
  var meta = _getOrCreateSheet(ss, "_META", ["Clave", "Valor"]);
  meta.getRange("A2:B2").setValues([["UltimaActualizacion", Utilities.formatDate(ahora, TIMEZONE, "yyyy-MM-dd HH:mm:ss")]]);
  meta.hideSheet();
}

// ═══════════════════════════════════════════════════════════════════════════════
//  3. DASHBOARD ESTRATÉGICO PARA FEELBACK
// ═══════════════════════════════════════════════════════════════════════════════

function construirDashboard() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var dash = ss.getSheetByName("📊 DASHBOARD");
  if (dash) ss.deleteSheet(dash);
  dash = ss.insertSheet("📊 DASHBOARD");

  // Grid
  dash.setColumnWidth(1, 20); dash.setColumnWidth(2, 230); dash.setColumnWidth(3, 170); dash.setColumnWidth(4, 20);
  dash.setColumnWidth(5, 230); dash.setColumnWidth(6, 170); dash.setColumnWidth(7, 20); dash.setColumnWidth(8, 230); dash.setColumnWidth(9, 170);
  dash.getRange(1, 1, 100, 10).setBackground("#090b14").setFontColor("#ddd").setVerticalAlignment("middle");

  // Header
  dash.getRange("B1:I1").merge().setValue("🚀 FEELBACK SGPMI — CONTROL DE MANDO")
    .setFontSize(16).setFontWeight("bold").setFontColor("#00f0ff").setHorizontalAlignment("center").setBackground("#12182b");
  dash.setRowHeight(1, 40);

  // ── FILA 1: KPIs OPERACIONALES Y PATRONES ──────────────────────────────
  let r = 3;
  _crearTarjeta(dash, "B", r, "💰 VENTAS MES ACTUAL (COP)", '=IFERROR(SUMIFS(\'_CACHE_Pedidos\'!J:J, \'_CACHE_Pedidos\'!E:E, TEXT(TODAY(),"yyyy-mm")), 0)', "$ #,##0");
  _crearTarjeta(dash, "E", r, "📦 TOTAL PEDIDOS (ESTA SEMANA)", '=IFERROR(COUNTIFS(\'_CACHE_Pedidos\'!D:D, ">="&TEXT(TODAY()-WEEKDAY(TODAY(),2)+1,"yyyy-mm-dd")), 0)', "0");
  
  // Tiempo promedio entre pedidos y Ticket
  let m3 = '=IFERROR(TEXT(AVERAGE(\'_CACHE_Clientes\'!E:E),"$ #,##0") & " Ticket Promedio | " & TEXT(AVERAGEIF(\'_CACHE_Clientes\'!I:I, ">0", \'_CACHE_Clientes\'!I:I),"0.0") & " días entre pedidos", "Datos proc.")';
  _crearTarjeta(dash, "H", r, "⏱ RITMO RECURRENCIA", m3, "@");

  r += 4;
  dash.getRange("B"+r+":I"+r).merge().setBackground("#00f0ff"); dash.setRowHeight(r, 2); r += 2;

  // ── FILA 2: SEGMENTACION / RETENCION ───────────────────────────────────
  dash.getRange("B"+r).setValue("👥 RETENCIÓN: NUEVOS VS RECURRENTES").setFontWeight("bold").setFontColor("#fff");
  dash.getRange("E"+r).setValue("🕒 PATRONES OPERATIVOS (Turnos)").setFontWeight("bold").setFontColor("#fff");
  dash.getRange("H"+r).setValue("🏆 TOP 5 PRODUCTOS (Inventario)").setFontWeight("bold").setFontColor("#fff");
  r++;

  // Segmentacion: Total Nuevos vs Recurrentes
  dash.getRange("B"+r).setValue("Nuevos (1 compra):").setFontColor("#aaa");
  dash.getRange("C"+r).setFormula('=COUNTIF(\'_CACHE_Clientes\'!B:B, "NUEVO")').setHorizontalAlignment("right").setFontWeight("bold");
  r++;
  dash.getRange("B"+r).setValue("Recurrentes (>1 compra):").setFontColor("#aaa");
  dash.getRange("C"+r).setFormula('=COUNTIF(\'_CACHE_Clientes\'!B:B, "RECURRENTE")').setHorizontalAlignment("right").setFontWeight("bold").setFontColor("#00ff88");
  r++;
  dash.getRange("B"+r).setValue("Fidelizables (>3/mes):").setFontColor("#aaa");
  dash.getRange("C"+r).setFormula('=COUNTIF(\'_CACHE_Clientes\'!J:J, "*Fidelizable*")').setHorizontalAlignment("right").setFontColor("#ffd700").setFontWeight("bold");
  r-=2;

  // Patrones operativos
  dash.getRange("E"+r).setValue("Día Mayor Volumen:").setFontColor("#aaa");
  dash.getRange("F"+r).setFormula('=IFERROR(INDEX(QUERY(\'_CACHE_Pedidos\'!G:G, "SELECT G, COUNT(G) WHERE G<>\'\' AND G<>\'DiaSemana\' GROUP BY G ORDER BY COUNT(G) DESC LIMIT 1"),1,1), "Sin datos")').setHorizontalAlignment("right").setFontWeight("bold").setFontColor("#00b4ff");
  r++;
  dash.getRange("E"+r).setValue("Hora Pico Pedidos:").setFontColor("#aaa");
  dash.getRange("F"+r).setFormula('=IFERROR(INDEX(QUERY(\'_CACHE_Pedidos\'!H:H, "SELECT H, COUNT(H) WHERE H<>\'\' AND H<>\'Hora\' GROUP BY H ORDER BY COUNT(H) DESC LIMIT 1"),1,1)&":00 hs", "Sin datos")').setHorizontalAlignment("right").setFontWeight("bold").setFontColor("#ffd700");
  r++;
  dash.getRange("E"+r).setValue("→ Planificar staff en estos horarios").setFontSize(8).setFontColor("#666");
  r-=2;

  // Top Inventario
  for(let i=1; i<=3; i++) {
    dash.getRange("H"+r).setFormula('=IFERROR(INDEX(\'_CACHE_Inventario\'!A:A, '+(i+1)+'), "—")');
    dash.getRange("I"+r).setFormula('=IFERROR(INDEX(\'_CACHE_Inventario\'!B:B, '+(i+1)+') & " u.", "")').setHorizontalAlignment("right").setFontColor("#00ff88");
    r++;
  }
  
  r+=1;
  dash.getRange("H"+r).setValue("⏳ Producto Sin Rotación:").setFontColor("#ff6b6b").setFontSize(9);
  r++;
  dash.getRange("H"+r+":I"+r).merge().setFormula('=IFERROR(INDEX(QUERY(\'_CACHE_Inventario\'!A:E, "SELECT A WHERE E CONTAINS \'SIN ROTACION\' LIMIT 1"),1,1), "Todo rotando bien ✅")').setFontColor("#ccc").setFontSize(9);

  dash.setFrozenRows(1);
  dash.setTabColor("#00f0ff");
}

function _crearTarjeta(sheet, col, row, titulo, formula, formato) {
  sheet.getRange(col + row + ":" + String.fromCharCode(col.charCodeAt(0)+1) + (row+2)).merge().setBackground("#12182b");
  sheet.getRange(col + row).setValue(titulo).setFontSize(9).setFontColor("#aaa").setFontWeight("bold");
  sheet.getRange(col + (row+1)).setFormula(formula).setFontSize(22).setFontWeight("bold").setFontColor("#00f0ff").setHorizontalAlignment("center").setNumberFormat(formato);
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SETUP Y TRIGGERS
// ═══════════════════════════════════════════════════════════════════════════════

function setupCompleto() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  
  // Crear inmutables
  _getOrCreateSheet(ss, "Pedidos", ["Cliente", "Telefono", "Pedido", "Fecha", "Estado", "TotalCOP"]);
  _getOrCreateSheet(ss, "Usuarios", ["Nombre", "Email", "FechaRegistro", "Rol"]);
  _getOrCreateSheet(ss, "PersonasExtra", ["Nombre", "Email", "Telefono", "Rol", "Notas", "RegistradoPor", "Fecha"]);
  
  // Cache base
  refrescarCache();
  
  // Vistas
  construirDashboard();
  
  // Triggers
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger("refrescarCache").timeBased().everyMinutes(15).create();
}
