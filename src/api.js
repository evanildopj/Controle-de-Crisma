import { API_URL } from "./config";

async function post(action, payload) {
  const res = await fetch(API_URL, {
    method: "POST",
    // Content-Type "text/plain" evita o preflight OPTIONS, que o Apps Script não trata.
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, ...payload }),
  });
  if (!res.ok) throw new Error("Falha na requisição (" + res.status + ")");
  return res.json();
}

export async function fetchAll() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Falha ao carregar dados (" + res.status + ")");
  return res.json();
}

export function addRow(data) {
  return post("add", { data });
}

export function updateRow(id, data) {
  return post("update", { id, data });
}

export function deleteRow(id) {
  return post("delete", { id });
}
