/**
 * Backend do "Controle de Pagamentos — Catequese".
 * Cole este código em Extensões > Apps Script, dentro da planilha Google Sheets
 * que terá uma aba chamada exatamente "Pagamentos" com o cabeçalho:
 * ID | Nome | Sacramentos | TipoPagamento | Valor | Status | DataPagamento | DataLimite
 *
 * Publique como Web App: Executar como "Eu", Acesso "Qualquer pessoa".
 * Veja o passo a passo completo em DEPLOY.md.
 */

var SHEET_NAME = "Pagamentos";
var HEADERS = ["ID", "Nome", "Sacramentos", "TipoPagamento", "Valor", "Status", "DataPagamento", "DataLimite"];

function getSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
  }
  return sheet;
}

function doGet(e) {
  var out = ContentService.createTextOutput(JSON.stringify(getAllRows_()));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function doPost(e) {
  var body = JSON.parse(e.postData.contents);
  var action = body.action;
  var result;
  if (action === "add") {
    result = addRow_(body.data);
  } else if (action === "update") {
    result = updateRow_(body.id, body.data);
  } else if (action === "delete") {
    result = deleteRow_(body.id);
  } else {
    result = { success: false, error: "Ação desconhecida: " + action };
  }
  var out = ContentService.createTextOutput(JSON.stringify(result));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function getAllRows_() {
  var sheet = getSheet_();
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    if (!data[i][0]) continue; // pula linhas vazias
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      var val = data[i][j];
      // Datas viram string ISO (YYYY-MM-DD) para o front-end tratar com facilidade.
      if (val instanceof Date) {
        val = Utilities.formatDate(val, Session.getScriptTimeZone(), "yyyy-MM-dd");
      }
      row[headers[j]] = val;
    }
    rows.push(row);
  }
  return rows;
}

function addRow_(data) {
  var sheet = getSheet_();
  var id = Utilities.getUuid();
  sheet.appendRow([
    id,
    data.nome || "",
    data.sacramentos || "",
    data.tipoPagamento || "",
    data.valor || 0,
    data.status || "Pendente",
    data.dataPagamento || "",
    data.dataLimite || "",
  ]);
  return { success: true, id: id };
}

function updateRow_(id, data) {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      var r = i + 1;
      if (data.nome !== undefined) sheet.getRange(r, 2).setValue(data.nome);
      if (data.sacramentos !== undefined) sheet.getRange(r, 3).setValue(data.sacramentos);
      if (data.tipoPagamento !== undefined) sheet.getRange(r, 4).setValue(data.tipoPagamento);
      if (data.valor !== undefined) sheet.getRange(r, 5).setValue(data.valor);
      if (data.status !== undefined) sheet.getRange(r, 6).setValue(data.status);
      if (data.dataPagamento !== undefined) sheet.getRange(r, 7).setValue(data.dataPagamento);
      if (data.dataLimite !== undefined) sheet.getRange(r, 8).setValue(data.dataLimite);
      return { success: true };
    }
  }
  return { success: false, error: "Registro não encontrado" };
}

function deleteRow_(id) {
  var sheet = getSheet_();
  var values = sheet.getDataRange().getValues();
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] === id) {
      sheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: "Registro não encontrado" };
}
