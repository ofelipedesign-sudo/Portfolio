# Felipe — Portfólio

Site estático (HTML + CSS + JS puros, sem build step) para o portfólio de Felipe Costa, designer carioca ([@ofelipedesigne](https://www.instagram.com/ofelipedesigne/) · [behance.net/felipecosta83](https://www.behance.net/felipecosta83)).

## Rodar localmente

Qualquer servidor estático simples funciona, porque os caminhos usam raiz absoluta (`/css/...`, `/assets/...`). Exemplos:

```bash
npx serve .
```

ou, com a extensão **Live Server** do VS Code, abrindo `index.html`.

Não abra os arquivos direto com duplo clique (`file://`) — os caminhos absolutos quebram nesse modo.

## Estrutura

```
index.html                    one-page: hero, work, about, contact
work/*.html                    13 páginas de projeto (template reutilizável, uma por peça)
css/style.css                   sistema de design (tokens, componentes)
js/main.js                      nav, menu mobile, reveals no scroll
assets/img/work/*.jpg .png      imagens reais, exportadas do Behance
assets/img/work/*.svg           placeholders (só onde não há imagem real ainda)
assets/img/favicon.svg
assets/img/og/og-cover.svg
robots.txt, sitemap.xml
```

## Estrutura de setores (frentes de trabalho)

A seção Work (`index.html#work`) não é uma lista única — é organizada em **frentes**, cada uma seu próprio `<div class="sector-block" id="sector-...">` com `.sector-head` (índice, título, texto) seguido de um `.work-list` com os `.work-entry` daquela frente. Isso é proposital: como o Felipe atende qualquer nicho, novas áreas de atuação entram como um novo setor, não misturadas com as existentes.

Setores hoje (cada peça do Behance é um projeto próprio, uma página própria — sem agrupar várias peças num só case):
1. **Key Art & Retratos** — Constantino de Constantinopla, Gêngis Khan, Carlos Magno, Pedro I do Brasil, Zumbi dos Palmares, Midas
2. **Estudos & Ilustração** — The Mandalorian, Patolino, R2D2, ELDIVO, FIFA 22
3. **Social & Comercial** — Brasil x Sérvia, Vitrine
4. **Vídeo** — vazio, ver abaixo

**Para adicionar um projeto a um setor que já existe:** copie um `<article class="work-entry ...">` dentro do `.work-list` daquele `.sector-block` e ajuste imagem, tags, título, descrição e link. Alterne `is-large` / `is-medium` / `is-medium is-flip` para manter o ritmo assimétrico.

**Para criar um setor novo:** duplique um bloco `.sector-block` inteiro (com `id` novo), adicione um link para ele em `.sector-nav` no topo da seção, e escreva o `.sector-lede` com a voz de sempre (direta, sem "soluções criativas").

**Setor Vídeo:** hoje está como estado vazio (`.work-empty`), porque ainda não há case de edição de vídeo publicado no Instagram/Behance de referência — o setor foi criado a pedido do Felipe (que confirmou editar vídeo), mas nenhum projeto foi inventado para preencher. Assim que houver um primeiro case, troque o bloco `.work-empty` por `.work-entry`(s) normais, do mesmo jeito que os outros setores.

## Sobre as imagens

A maior parte das imagens de trabalho já são os arquivos reais, exportados diretamente do Behance ([behance.net/felipecosta83](https://www.behance.net/felipecosta83)) — não são mais placeholders:

| Página | Imagem |
|---|---|
| Constantino de Constantinopla | `retratos-epicos-constantino.jpg` |
| Gêngis Khan | `retratos-epicos-gengis-khan.png` |
| Carlos Magno | `retratos-epicos-carlos-magno.png` |
| Pedro I do Brasil | `retratos-epicos-pedro-i.png` |
| Zumbi dos Palmares | `zumbi-real.png` |
| The Mandalorian | `cartazes-mandalorian-real.png` |
| Patolino | `cartazes-patolino-real.jpg` |
| R2D2 | `personagens-r2d2.png` |
| ELDIVO | `personagens-eldivo.png` |
| FIFA 22 | `fifa22-real.png` |
| Midas — O Toque que Transforma | `midas-real.jpg` |
| Brasil x Sérvia | `brasil-x-servia.jpg` |
| Vitrine | `vitrine-real.webp` |

Todas as 13 peças hoje usam imagem real — nenhum placeholder gerado restante.

**Atenção ao R2D2** (`personagens-r2d2.png`): a peça no Behance traz uma marca d'água `@ursinstudios` no canto — indício de que foi construída sobre uma composição de estúdio de referência (prática comum em estudos de manipulação). Mantive a peça porque é um estudo real, publicado por você, mas se preferir não exibir a marca d'água publicamente, troque por outra versão sem ela ou remova o card do setor "Estudos & Ilustração".

**Outros pontos marcados no código com `TODO(designer)`:**
- E-mail e/ou WhatsApp de contato (seção Contato e About) — hoje os únicos canais públicos confirmados são Instagram e Behance.
- LinkedIn e lista de ferramentas em About, se você quiser incluir.
- Domínio real em `<link rel="canonical">`, Open Graph e `sitemap.xml` (está como placeholder `ofelipedesigne.com.br`).
- `og-cover.svg` é SVG; para compatibilidade máxima com previews do WhatsApp/Facebook, exporte uma versão `.png` de 1200×630 a partir de uma das imagens reais e aponte `og:image`/`twitter:image` para ela (o `index.html` já usa `retratos-epicos-constantino.jpg` como fallback).
