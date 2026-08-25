# Como colocar no ar — passo a passo

Duas partes: (1) o "banco de dados" no Google, (2) o site no GitHub Pages.
Leva uns 15–20 minutos na primeira vez. Depois disso, é só usar.

## Parte 1 — Planilha + Apps Script (o backend)

1. Crie uma planilha nova em **sheets.google.com** (pode chamar de "Pagamentos Catequese 2026"). Não precisa criar abas ou cabeçalhos — o sistema cria sozinho na primeira vez que alguém acessar.
2. No menu, vá em **Extensões > Apps Script**. Vai abrir um editor de código numa aba nova.
3. Apague o conteúdo padrão (`function myFunction() {}`) e cole todo o conteúdo do arquivo **Code.gs** (está na pasta do projeto).
4. Clique em **Implantar > Nova implantação** (canto superior direito).
5. Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha **App da Web**.
6. Configure assim:
   - **Executar como:** Eu (seu e-mail)
   - **Quem pode acessar:** Qualquer pessoa
7. Clique em **Implantar**. Ele vai pedir para autorizar o script (é a sua própria conta acessando a sua própria planilha — pode confirmar).
8. Copie a **URL do app da Web** que aparece (algo como `https://script.google.com/macros/s/AKfycb.../exec`). Guarde ela, é a peça mais importante.

> Sempre que você editar o Code.gs depois, precisa ir em **Implantar > Gerenciar implantações > editar (ícone de lápis) > Nova versão > Implantar** para as mudanças valerem.

## Parte 2 — Configurar o projeto

1. Abra o arquivo `src/config.js` e cole a URL copiada no lugar de `"COLE_AQUI_A_URL_DO_APPS_SCRIPT"`.
2. Abra o arquivo `vite.config.js` e confira se o nome depois de `base:` é exatamente igual ao nome que você vai dar ao repositório no GitHub (passo abaixo). Se o repositório vai se chamar `pagamentos-catequese`, o valor deve ser `"/pagamentos-catequese/"`.

## Parte 3 — Subir para o GitHub

1. Crie um repositório novo (pode ser privado) em github.com — ex: `pagamentos-catequese`.
2. No terminal, dentro da pasta do projeto:
   ```bash
   git init
   git add .
   git commit -m "primeira versão"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/pagamentos-catequese.git
   git push -u origin main
   ```
3. No repositório no GitHub, vá em **Settings > Pages**.
4. Em **Source**, escolha **GitHub Actions** (não "Deploy from a branch").
5. Pronto — o workflow (`.github/workflows/deploy.yml`, já incluso) builda e publica automaticamente a cada `git push`. Acompanhe em **Actions**; leva 1–2 minutos.
6. O site fica em: `https://SEU-USUARIO.github.io/pagamentos-catequese/`

## Parte 4 — Gerar os links de cada responsável

O mesmo site, só muda o final do link:

| Quem | Link |
|---|---|
| Visão geral (você / responsável do grupo) | `https://SEU-USUARIO.github.io/pagamentos-catequese/` |
| Dejanir (Retiro) | `https://SEU-USUARIO.github.io/pagamentos-catequese/?parte=retiro` |
| Valderlene (Camisetas) | `https://SEU-USUARIO.github.io/pagamentos-catequese/?parte=camisetas` |
| Ariana (Doação) | `https://SEU-USUARIO.github.io/pagamentos-catequese/?parte=doacao` |

Cada responsável só enxerga e edita a própria tabela — não existe link nem menu para ver as outras partes.

## Observações importantes

- **Cadastro de pessoas:** o ideal é cadastrar as ~15 pessoas pela **visão geral** (ela cria automaticamente os 3 pagamentos de uma vez — Retiro, Camisetas e Doação). Se um responsável específico incluir alguém direto no link dele, só aquele pagamento é criado — os outros dois responsáveis não verão essa pessoa até que alguém a cadastre no tipo deles também.
- **Segurança:** o link é "secreto por padrão", não uma senha de verdade — quem tiver o link edita. Para esse uso (grupo de confiança da paróquia) é o suficiente, mas evite postar os links em lugar público.
- **Custo:** tudo isso (GitHub Pages + Google Sheets + Apps Script) é gratuito.
