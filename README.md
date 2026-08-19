# Felipe — Portfólio

Site do portfólio de Felipe Costa, designer carioca ([@ofelipedesigne](https://www.instagram.com/ofelipedesigne/) · [behance.net/felipecosta83](https://www.behance.net/felipecosta83)). Publicado no Vercel, com painel de edição próprio (sem precisar mexer em código pra trocar textos ou subir trabalho novo).

## Como o site é montado

O HTML que o navegador vê (`index.html`, `work/*.html`) **não é editado à mão** — ele é gerado a partir dos arquivos em `content/`:

```
content/settings.json      textos gerais: topo, sobre, contato, SEO
content/sectors.json       as "frentes" de trabalho (Key Art & Retratos, Estudos & Ilustração...)
content/work/*.json        um arquivo por projeto (título, categoria, textos do case, mídia)
scripts/build.js           lê tudo isso e escreve index.html + work/*.html
```

Sempre que `content/` muda, rodar:

```bash
npm run build
```

regenera o site inteiro. O Vercel já faz isso sozinho a cada vez que algo é publicado (configurado em `vercel.json`) — então editar pelo painel (veja abaixo) é suficiente; não precisa rodar nada manualmente em produção.

**Rodar localmente** (pra conferir antes de publicar): `node scripts/build.js` e depois qualquer servidor estático, ex. `npx serve .`. Não abra os arquivos com duplo clique (`file://`) — os caminhos absolutos quebram nesse modo.

## Painel de edição (`/admin`)

Painel visual (Decap CMS) pra editar textos e trabalhos sem tocar em código — inclui upload de imagem **e vídeo**, vertical ou horizontal. Ele funciona assim: você edita e salva no painel → a mudança vira um commit no GitHub → o Vercel detecta e republica o site sozinho, em ~1 minuto.

### O que falta pra ligar (só você consegue fazer essas 4 coisas — dependem da sua conta)

**1. Subir este código pro GitHub**, se ainda não fez:
```bash
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git branch -M main
git push -u origin main
```
(crie o repositório vazio antes em github.com/new — sem README/gitignore, pra não conflitar)

**2. Criar um "GitHub OAuth App"** — é o que permite o painel logar com sua conta GitHub:
- Acesse [github.com/settings/developers](https://github.com/settings/developers) → "New OAuth App"
- **Application name**: `Felipe Portfolio CMS` (ou qualquer nome)
- **Homepage URL**: a URL do seu site no Vercel (ex: `https://portfolio-mu-ashy-60.vercel.app`)
- **Authorization callback URL**: a mesma URL + `/api/callback` (ex: `https://portfolio-mu-ashy-60.vercel.app/api/callback`)
- Depois de criar, clique em "Generate a new client secret" e guarde os dois valores: **Client ID** e **Client Secret**

**3. Adicionar essas credenciais no Vercel** (Project Settings → Environment Variables):
- `OAUTH_CLIENT_ID` = o Client ID do passo 2
- `OAUTH_CLIENT_SECRET` = o Client Secret do passo 2

Depois de adicionar, faça um redeploy (Vercel → Deployments → ⋯ → Redeploy) pra elas passarem a valer.

**4. Preencher os valores reais em `admin/config.yml`** (hoje estão com placeholder) — troque:
```yaml
repo: SEU_USUARIO/SEU_REPOSITORIO        # → o repositório do passo 1
base_url: https://SEU-PROJETO...vercel.app   # → a URL do seu site no Vercel
site_url: https://SEU-SITE.vercel.app
display_url: https://SEU-SITE.vercel.app
```
Pode me pedir pra fazer essa troca — só preciso saber o link do GitHub e a URL final do Vercel.

Depois disso, acesse `seusite.vercel.app/admin` e o botão "Entrar com o GitHub" vai funcionar.

### Como usar o painel no dia a dia
- **Trocar textos** (nome, frase de efeito, sobre, contato, redes sociais): coleção "Configurações do site"
- **Adicionar um trabalho novo**: coleção "Trabalhos" → "New Trabalho" → preenche os campos e escolhe a frente (setor); o campo "Mídia" aceita imagem ou vídeo, qualquer proporção (vertical ou horizontal) — o site se ajusta sozinho, sem cortar
- **Criar uma frente nova**: coleção "Frentes de trabalho" → adiciona um item na lista com um `id` novo (ex: `sector-branding`) — depois volte em "Trabalhos" e adicione esse mesmo `id` como opção do campo Frente (isso aqui ainda exige me pedir um ajuste rápido no `config.yml`, é a única parte que não é 100% self-service)
- Toda alteração salva vira um commit — dá pra ver o histórico completo no GitHub a qualquer momento

## Setores hoje

1. **Key Art & Retratos** — Constantino de Constantinopla, Gêngis Khan, Carlos Magno, Pedro I do Brasil, Zumbi dos Palmares, Midas
2. **Estudos & Ilustração** — The Mandalorian, Patolino, R2D2, ELDIVO, FIFA 22
3. **Social & Comercial** — Brasil x Sérvia, Vitrine
4. **Vídeo** — vazio de propósito, esperando o primeiro case

## Sobre as imagens

Todas as 13 peças usam imagem real, a maioria exportada direto do Behance ([behance.net/felipecosta83](https://www.behance.net/felipecosta83)); nenhum placeholder gerado restante.

**Atenção ao R2D2** (`assets/img/work/personagens-r2d2.png`): a peça no Behance traz uma marca d'água `@ursinstudios` no canto — indício de que foi construída sobre uma composição de estúdio de referência (prática comum em estudos de manipulação). Mantive porque é um estudo real e publicado por você; se preferir não exibir a marca d'água publicamente, troque o arquivo pelo painel (Trabalhos → R2D2 → Mídia) ou peça pra eu remover o card.

## Pendências menores
- E-mail e/ou WhatsApp de contato — hoje os únicos canais públicos confirmados são Instagram e Behance (editável em Configurações → Contato assim que você tiver esses dados)
- `content/settings.json` → `meta.siteUrl` está com o domínio placeholder `ofelipedesigne.com.br` — atualize para a URL real do Vercel (ou domínio próprio, se comprar um depois)
- `assets/img/og/og-cover.svg` é SVG; pra preview funcionar 100% no WhatsApp, o ideal é um `.png` de 1200×630 — hoje o site já usa a primeira foto do Work como fallback, o que funciona bem na prática
