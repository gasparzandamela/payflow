# Guia de Deploy na Vercel

Este projeto está configurado e pronto para deploy na Vercel.

## Passos para Deploy

1.  **Crie um repositório no GitHub/GitLab/Bitbucket** e envie o código:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    # Adicione a URL do seu repositório remoto
    git remote add origin <SUA_URL_DO_REPO>
    git push -u origin main
    ```

2.  **Acesse a Vercel** (https://vercel.com) e faça login.

3.  **Adicione um Novo Projeto**:
    *   Clique em "Add New..." > "Project".
    *   Importe o repositório Git que você acabou de criar.

4.  **Configurações de Build (Automático)**:
    *   A Vercel deve detectar automaticamente que é um projeto **Vite**.
    *   **Framework Preset**: `Vite`
    *   **Build Command**: `vite build` (ou `npm run build`)
    *   **Output Directory**: `dist`
    *   *Nenhuma configuração manual deve ser necessária aqui.*

5.  **Variáveis de Ambiente (.env)**:
    *   Este projeto verifica a existência de `GEMINI_API_KEY` apenas na configuração, mas não parece utilizá-la diretamente no código atual da interface.
    *   Se você planeja usar funcionalidades de IA no futuro, adicione a variável `GEMINI_API_KEY` nas configurações do projeto na Vercel (Settings > Environment Variables).

6.  **Deploy**:
    *   Clique em "Deploy".

## Notas Importantes

*   **Roteamento (SPA)**: O arquivo `vercel.json` já foi criado na raiz do projeto para garantir que o roteamento do React (Client-Side Routing) funcione corretamente. Isso evita erros 404 ao atualizar páginas como `/dashboard` ou `/login`.
*   **HashRouter vs BrowserRouter**: O projeto foi atualizado para usar `BrowserRouter` para URLs mais limpas (ex: `seudominio.com/dashboard` em vez de `seudominio.com/#/dashboard`).

## Verificação Pós-Deploy

Após o deploy, acesse a URL fornecida pela Vercel e verifique:
1.  Se o Login redireciona corretamente para o Dashboard.
2.  Se recarregar a página (F5) no Dashboard mantém você na mesma tela (não dá erro 404).
