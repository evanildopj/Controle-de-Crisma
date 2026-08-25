import { useEffect, useMemo, useState } from "react";
import { fetchAll, addRow, updateRow, deleteRow } from "./api";
import { TIPOS_PAGAMENTO, SACRAMENTOS_DISPONIVEIS } from "./config";

const TIPO_KEYS = Object.keys(TIPOS_PAGAMENTO);

function parseParteFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const parte = params.get("parte");
  return TIPO_KEYS.includes(parte) ? parte : null;
}

function formatMoney(v) {
  return "R$ " + Number(v || 0).toFixed(2).replace(".", ",");
}

function formatDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + (String(iso).length === 10 ? "T00:00:00" : ""));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("pt-BR");
}

function isAtrasado(dataLimite, status) {
  if (status === "Pago" || !dataLimite) return false;
  return new Date(dataLimite + "T00:00:00") < new Date(new Date().toDateString());
}

function Seal() {
  return (
    <svg className="masthead-seal" viewBox="0 0 46 46" fill="none">
      <circle cx="23" cy="23" r="21" stroke="var(--gold)" strokeWidth="1.4" />
      <circle cx="23" cy="23" r="16" stroke="var(--gold)" strokeWidth="0.8" />
      <path d="M23 12 L23 34 M14 20 L32 20" stroke="var(--gold-soft)" strokeWidth="1.2" />
      <path d="M17 15 Q23 9 29 15" stroke="var(--gold-soft)" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

export default function App() {
  const parte = useMemo(parseParteFromUrl, []);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(parte || "todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    fetchAll()
      .then((data) => setRows(Array.isArray(data) ? data : []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  const visibleRows = useMemo(() => {
    const key = parte || (activeTab === "todos" ? null : activeTab);
    const filtered = key ? rows.filter((r) => r.TipoPagamento === key) : rows;
    return [...filtered].sort((a, b) => (a.Nome || "").localeCompare(b.Nome || ""));
  }, [rows, parte, activeTab]);

  const summary = useMemo(() => {
    const pessoas = new Set(visibleRows.map((r) => r.Nome)).size;
    const pagos = visibleRows.filter((r) => r.Status === "Pago");
    const pendentes = visibleRows.filter((r) => r.Status !== "Pago");
    const arrecadado = pagos.reduce((s, r) => s + Number(r.Valor || 0), 0);
    return { pessoas, pagosCount: pagos.length, pendentesCount: pendentes.length, arrecadado };
  }, [visibleRows]);

  function toRowShape(patch) {
    const out = {};
    if (patch.nome !== undefined) out.Nome = patch.nome;
    if (patch.sacramentos !== undefined) out.Sacramentos = patch.sacramentos;
    if (patch.status !== undefined) out.Status = patch.status;
    if (patch.dataPagamento !== undefined) out.DataPagamento = patch.dataPagamento;
    if (patch.valor !== undefined) out.Valor = patch.valor;
    return out;
  }

  async function toggleStatus(row) {
    const novoStatus = row.Status === "Pago" ? "Pendente" : "Pago";
    const patch = { status: novoStatus };
    if (novoStatus === "Pago" && !row.DataPagamento) {
      patch.dataPagamento = new Date().toISOString().slice(0, 10);
    }
    setRows((prev) => prev.map((r) => (r.ID === row.ID ? { ...r, ...toRowShape(patch) } : r)));
    try {
      await updateRow(row.ID, patch);
    } catch (e) {
      setError(e.message);
      load();
    }
  }

  async function handleDelete(row) {
    const label = row.TipoPagamento && TIPOS_PAGAMENTO[row.TipoPagamento] ? TIPOS_PAGAMENTO[row.TipoPagamento].label : row.TipoPagamento;
    if (!window.confirm(`Excluir o pagamento de "${label}" de ${row.Nome}?`)) return;
    setRows((prev) => prev.filter((r) => r.ID !== row.ID));
    try {
      await deleteRow(row.ID);
    } catch (e) {
      setError(e.message);
      load();
    }
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(row) {
    setEditing(row);
    setModalOpen(true);
  }

  async function handleSave(form) {
    setModalOpen(false);
    if (editing) {
      const sacStr = form.sacramentos.join(", ");
      const tipo = editing.TipoPagamento;
      const valor = TIPOS_PAGAMENTO[tipo].valor(form.sacramentos);
      const patch = {
        nome: form.nome,
        sacramentos: sacStr,
        status: form.status,
        dataPagamento: form.dataPagamento,
        valor,
      };
      setRows((prev) => prev.map((r) => (r.ID === editing.ID ? { ...r, ...toRowShape(patch) } : r)));
      try {
        await updateRow(editing.ID, patch);
      } catch (e) {
        setError(e.message);
        load();
      }
    } else {
      const sacStr = form.sacramentos.join(", ");
      const tiposParaCriar = parte ? [parte] : TIPO_KEYS;
      try {
        for (const tipoKey of tiposParaCriar) {
          const cfg = TIPOS_PAGAMENTO[tipoKey];
          await addRow({
            nome: form.nome,
            sacramentos: sacStr,
            tipoPagamento: tipoKey,
            valor: cfg.valor(form.sacramentos),
            status: form.status,
            dataPagamento: form.dataPagamento,
            dataLimite: cfg.dataLimite,
          });
        }
        load();
      } catch (e) {
        setError(e.message);
      }
    }
  }

  const showTipoColumn = !parte;
  const responsavelAtual = parte ? TIPOS_PAGAMENTO[parte].responsavel : null;

  return (
    <div className="app">
      <header className="masthead">
        <div className="masthead-titles">
          <Seal />
          <div>
            <h1>Controle de Pagamentos</h1>
            <div className="subtitle">1ª Comunhão &amp; Crisma · 2026</div>
          </div>
        </div>
        {responsavelAtual && (
          <div className="masthead-meta">
            RESPONSÁVEL
            <br />
            <span className="resp-name">{responsavelAtual}</span>
          </div>
        )}
      </header>

      {!parte && (
        <div className="tabs">
          <button className={`tab ${activeTab === "todos" ? "active" : ""}`} onClick={() => setActiveTab("todos")}>
            Todos
          </button>
          {TIPO_KEYS.map((k) => (
            <button key={k} className={`tab ${activeTab === k ? "active" : ""}`} onClick={() => setActiveTab(k)}>
              {TIPOS_PAGAMENTO[k].label}
            </button>
          ))}
        </div>
      )}

      <div className="summary">
        <div className="summary-item">
          <div className="num">{summary.pessoas}</div>
          <div className="label">Pessoas</div>
        </div>
        <div className="summary-item">
          <div className="num" style={{ color: "var(--ok)" }}>{summary.pagosCount}</div>
          <div className="label">Pagos</div>
        </div>
        <div className="summary-item">
          <div className="num" style={{ color: "var(--gold-soft)" }}>{summary.pendentesCount}</div>
          <div className="label">Pendentes</div>
        </div>
        <div className="summary-item">
          <div className="num">{formatMoney(summary.arrecadado)}</div>
          <div className="label">Arrecadado</div>
        </div>
      </div>

      <div className="toolbar">
        <button className="btn btn-ghost" onClick={load}>↻ Atualizar</button>
        <button className="btn btn-primary" onClick={openNew}>+ {parte ? "Novo pagamento" : "Nova pessoa"}</button>
      </div>

      {loading && <div className="status-line">Carregando…</div>}
      {error && <div className="status-line error-line">{error}</div>}

      {!loading && !error && visibleRows.length === 0 && (
        <div className="empty">
          Nenhum registro por aqui ainda.
          <br />
          <button className="btn btn-primary" onClick={openNew}>+ {parte ? "Novo pagamento" : "Nova pessoa"}</button>
        </div>
      )}

      {!loading && !error && visibleRows.length > 0 && (
        <table className="ledger">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Sacramento(s)</th>
              {showTipoColumn && <th>Tipo</th>}
              <th>Valor</th>
              <th>Status</th>
              <th>Data pag.</th>
              <th>Prazo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row) => {
              const cfg = TIPOS_PAGAMENTO[row.TipoPagamento];
              const atrasado = isAtrasado(row.DataLimite, row.Status);
              return (
                <tr key={row.ID}>
                  <td className="nome">{row.Nome}</td>
                  <td className="sacramentos">{row.Sacramentos || "—"}</td>
                  {showTipoColumn && (
                    <td>
                      <span className="tipo-dot" style={{ background: cfg ? cfg.cor : "#888" }} />
                      {cfg ? cfg.label : row.TipoPagamento}
                    </td>
                  )}
                  <td className="valor">{formatMoney(row.Valor)}</td>
                  <td>
                    <button
                      className={`stamp ${row.Status === "Pago" ? "pago" : "pendente"}`}
                      onClick={() => toggleStatus(row)}
                      title="Clique para alternar"
                    >
                      {row.Status === "Pago" ? "Pago" : "Pendente"}
                    </button>
                  </td>
                  <td>{formatDate(row.DataPagamento)}</td>
                  <td className={`data-limite ${atrasado ? "atrasado" : ""}`}>{formatDate(row.DataLimite)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="btn btn-ghost" onClick={() => openEdit(row)}>Editar</button>
                      <button className="btn btn-ghost btn-danger" onClick={() => handleDelete(row)}>Excluir</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {modalOpen && (
        <PersonModal
          editing={editing}
          isGeral={!parte}
          onCancel={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PersonModal({ editing, isGeral, onCancel, onSave }) {
  const [nome, setNome] = useState(editing ? editing.Nome : "");
  const [sacramentos, setSacramentos] = useState(
    editing && editing.Sacramentos ? editing.Sacramentos.split(",").map((s) => s.trim()).filter(Boolean) : []
  );
  const [status, setStatus] = useState(editing ? editing.Status : "Pendente");
  const [dataPagamento, setDataPagamento] = useState(editing ? editing.DataPagamento || "" : "");

  function toggleSac(s) {
    setSacramentos((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  }

  function submit(e) {
    e.preventDefault();
    if (!nome.trim() || sacramentos.length === 0) return;
    onSave({ nome: nome.trim(), sacramentos, status, dataPagamento: dataPagamento || null });
  }

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? "Editar registro" : isGeral ? "Nova pessoa" : "Novo pagamento"}</h2>
        <form onSubmit={submit}>
          <div className="field">
            <label htmlFor="nome">Nome</label>
            <input id="nome" type="text" value={nome} onChange={(e) => setNome(e.target.value)} required />
          </div>
          <div className="field">
            <label>Sacramento(s)</label>
            <div className="checkbox-row">
              {SACRAMENTOS_DISPONIVEIS.map((s) => (
                <label key={s}>
                  <input type="checkbox" checked={sacramentos.includes(s)} onChange={() => toggleSac(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <div className="field">
            <label htmlFor="status">Status</label>
            <select id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="Pendente">Pendente</option>
              <option value="Pago">Pago</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="dataPagamento">Data do pagamento</label>
            <input id="dataPagamento" type="date" value={dataPagamento || ""} onChange={(e) => setDataPagamento(e.target.value)} />
          </div>
          {!editing && isGeral && (
            <p style={{ fontSize: "0.78rem", color: "var(--paper-dim)" }}>
              Isso cria automaticamente os 3 pagamentos (Retiro, Camisetas e Doação) para essa pessoa.
            </p>
          )}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
