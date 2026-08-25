import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// ⚠️ Troque "/Controle-de-Crisma/" pelo nome exato do seu repositório no GitHub
// (o link final fica seu-usuario.github.io/nome-do-repositorio/).
export default defineConfig({
  plugins: [react()],
  base: "/Controle-de-Crisma/",
});
