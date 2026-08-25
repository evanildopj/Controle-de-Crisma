# Controle de Pagamentos — Catequese

App de controle de pagamentos para 1ª Comunhão e Crisma (Retiro, Camisetas e
Doação Paróquia), com um link geral para visão consolidada e um link
específico por responsável — cada um só vê e edita a própria parte.

- **Frontend:** React + Vite, hospedado grátis no GitHub Pages.
- **Backend/banco de dados:** Google Sheets + Apps Script (grátis, sem exigir
  login dos responsáveis para editar).

## Instalação e publicação

Veja o passo a passo completo em **DEPLOY.md**.

## Rodar localmente (opcional, para testar antes de publicar)

```bash
npm install
npm run dev
```

Lembre de configurar `src/config.js` com a URL do Apps Script antes de testar.
