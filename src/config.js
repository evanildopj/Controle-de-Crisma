// ⚠️ Depois de publicar o Apps Script (ver DEPLOY.md), cole a URL do Web App aqui:
export const API_URL = "https://script.google.com/macros/s/AKfycbxsckfLsj0lI6j3OmKh1zMYuUaQaYGUtf39cjRRDu7WvHAo3_4cjQpb6gWyRjolsYoe/exec";

// Configuração de cada tipo de pagamento: cor, responsável, prazo e regra de valor.
// "valor" pode ser um número fixo ou uma função que recebe o array de sacramentos da pessoa.
export const TIPOS_PAGAMENTO = {
  retiro: {
    label: "Retiro",
    responsavel: "Dejanir Ferreira",
    dataLimite: "2026-10-09",
    valor: () => 50,
    cor: "#EDE6D6", // marfim — 1ª Comunhão/retiro espiritual
  },
  camisetas: {
    label: "Camisetas",
    responsavel: "Valderlene Ferreira Martins",
    dataLimite: "2026-10-15",
    valor: (sacramentos) => (sacramentos.length >= 2 ? 90 : 45),
    cor: "#C9A227", // dourado litúrgico
  },
  doacao: {
    label: "Doação Paróquia",
    responsavel: "Ariana Rehem Batista",
    dataLimite: "2026-10-23",
    valor: () => 100,
    cor: "#8C2F39", // vinho — Crisma / doação
  },
};

export const SACRAMENTOS_DISPONIVEIS = ["1ª Comunhão", "Crisma"];
