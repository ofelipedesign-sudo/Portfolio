#!/usr/bin/env node
/**
 * Gera index.html e work/*.html a partir de content/*.json.
 * Zero dependências — roda com `node scripts/build.js`.
 * Reexecutado automaticamente pelo Vercel a cada deploy (ver vercel.json).
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const CONTENT = path.join(ROOT, "content");
const WORK_DIR = path.join(ROOT, "work");
const SITE_URL_FALLBACK = "https://ofelipedesigne.com.br";

// ---------------------------------------------------------------- helpers

function readJSON(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}

/** Markdown-lite: **bold**, *italic*, [texto](url). Sem dependências externas. */
function md(str) {
  if (!str) return "";
  return str
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

function esc(str) {
  if (!str) return "";
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isVideo(m) {
  return m && m.type === "video";
}

// ---------------------------------------------------------------- load content

const settings = readJSON(path.join(CONTENT, "settings.json"));
const sectors = readJSON(path.join(CONTENT, "sectors.json")).sectors.sort((a, b) => a.order - b.order);

const workFiles = fs.readdirSync(path.join(CONTENT, "work")).filter((f) => f.endsWith(".json"));
const work = workFiles.map((f) => {
  const data = readJSON(path.join(CONTENT, "work", f));
  return { slug: f.replace(/\.json$/, ""), ...data };
});

const bySector = {};
for (const item of work) {
  (bySector[item.sector] = bySector[item.sector] || []).push(item);
}
for (const key of Object.keys(bySector)) {
  bySector[key].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// full site-wide order, used for prev/next cycling across every project page
const allOrdered = sectors.flatMap((s) => bySector[s.id] || []);

// ---------------------------------------------------------------- shared partials

const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' +
  '<link href="https://fonts.googleapis.com/css2?family=Anton&family=Archivo:ital,wght@0,400;0,500;0,600;0,700;0,900;1,400&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">';

function header(rootPrefix) {
  const logoHref = rootPrefix ? rootPrefix : "#topo";
  return `<header class="site-header" data-header>
  <a class="logo" href="${logoHref}">FELIPE<span>.</span></a>
  <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="nav-list" aria-label="Abrir menu">
    <span></span><span></span><span></span>
  </button>
  <nav aria-label="Navegação principal">
    <ul class="nav-list" id="nav-list" data-nav-list>
      <li><a href="${rootPrefix}#work"${rootPrefix ? "" : ' data-nav-link'}>Work</a></li>
      <li><a href="${rootPrefix}#about"${rootPrefix ? "" : ' data-nav-link'}>About</a></li>
      <li><a href="${rootPrefix}#contact"${rootPrefix ? "" : ' data-nav-link'}>Contact</a></li>
    </ul>
  </nav>
</header>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap footer-row">
    <span>© <span data-year>2026</span> Felipe. Todo o trabalho é autoral ou estudo pessoal.</span>
    <a href="${settings.social.instagram}" target="_blank" rel="noopener noreferrer">Instagram ↗</a>
  </div>
</footer>`;
}

function mediaFigure(item, { eager } = {}) {
  const loading = eager ? "eager" : "lazy";
  if (isVideo(item.media)) {
    const poster = item.media.poster ? ` poster="${esc(item.media.poster)}"` : "";
    return `<video src="${esc(item.media.src)}" controls playsinline preload="metadata"${poster} aria-label="${esc(item.media.alt)}"></video>`;
  }
  return `<img src="${esc(item.media.src)}" alt="${esc(item.media.alt)}" loading="${loading}">`;
}

function cardMediaThumb(item) {
  // cards on the index page always use a still image (poster for video items)
  if (isVideo(item.media)) {
    const src = item.media.poster || item.media.src;
    return `<img src="${esc(src)}" alt="" loading="lazy">`;
  }
  return `<img src="${esc(item.media.src)}" alt="" loading="lazy">`;
}

// ---------------------------------------------------------------- index.html

function buildSectorNav() {
  return sectors.map((s) => `        <a href="#${s.id}">${esc(s.title)}</a>`).join("\n");
}

function buildWorkEntry(item) {
  const sizeClass = { large: "is-large", medium: "is-medium", "medium-flip": "is-medium is-flip" }[item.layout] || "is-medium";
  const href = `/work/${item.slug}.html`;
  return `          <article class="work-entry ${sizeClass} reveal">
            <a class="work-figure" href="${href}" tabindex="-1" aria-hidden="true">
              ${cardMediaThumb(item)}
            </a>
            <div class="work-meta">
              <p class="work-tags">${item.category
                .split("·")
                .map((t) => `<span>${esc(t.trim())}</span>`)
                .join('<span class="dot">·</span>')}<span class="dot">·</span><span>${esc(item.year)}</span></p>
              <h4 class="work-title"><a href="${href}">${md(item.title)}</a></h4>
              <p class="work-desc">${md(item.cardDesc)}</p>
              <a class="work-link" href="${href}">Ver o projeto <span class="bar" aria-hidden="true"></span></a>
            </div>
          </article>`;
}

function buildSectorBlock(sector) {
  const items = bySector[sector.id] || [];
  const body =
    items.length > 0
      ? `        <div class="work-list">\n\n${items.map(buildWorkEntry).join("\n\n")}\n\n        </div>`
      : `        <div class="work-empty reveal">
          <p class="work-empty-tag">${esc(sector.emptyTag || "Em breve")}</p>
          <p class="work-empty-text">${md(sector.emptyText || "")}</p>
          <a class="work-link" href="#contact">Falar sobre um projeto <span class="bar" aria-hidden="true"></span></a>
        </div>`;

  return `      <div class="sector-block" id="${sector.id}">
        <div class="sector-head">
          <span class="sector-index">${esc(sector.indexLabel)}</span>
          <h3 class="sector-title">${esc(sector.title)}</h3>
          <p class="sector-lede">${md(sector.lede)}</p>
        </div>

${body}
      </div>`;
}

function buildFactsList(facts) {
  return facts
    .map(
      (f) => `        <div class="fact">
          <dt>${esc(f.label)}</dt>
          <dd>${f.link ? `<a href="${esc(f.link)}" target="_blank" rel="noopener noreferrer">${esc(f.value)}</a>` : esc(f.value)}</dd>
        </div>`
    )
    .join("\n");
}

function buildContactItems(items) {
  return items
    .map(
      (c) => `        <div class="contact-item">
          <dt>${esc(c.label)}</dt>
          <dd>${c.link ? `<a href="${esc(c.link)}" target="_blank" rel="noopener noreferrer">${esc(c.value)}</a>` : esc(c.value)}</dd>
        </div>`
    )
    .join("\n");
}

function buildIndex() {
  const siteUrl = settings.meta.siteUrl || SITE_URL_FALLBACK;
  const ogImage = allOrdered[0] ? allOrdered[0].media.src : "/assets/img/og/og-cover.svg";

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(settings.meta.title)}</title>
<meta name="description" content="${esc(settings.meta.description)}">
<link rel="canonical" href="${siteUrl}/">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(settings.meta.title)}">
<meta property="og:description" content="${esc(settings.meta.description)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta property="og:locale" content="pt_BR">
<meta property="og:url" content="${siteUrl}/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(settings.meta.title)}">
<meta name="twitter:description" content="${esc(settings.meta.description)}">
<meta name="twitter:image" content="${esc(ogImage)}">

<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
${FONT_LINK}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Felipe",
  "alternateName": "ofelipedesigne",
  "jobTitle": "Designer — Key Art, Comunicação Visual & Edição de Vídeo",
  "url": "${siteUrl}/",
  "sameAs": ["${settings.social.instagram}", "${settings.social.behance}"],
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Rio de Janeiro",
    "addressRegion": "RJ",
    "addressCountry": "BR"
  }
}
</script>
</head>
<body>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

${header("")}

<main id="conteudo">
  <div id="topo"></div>

  <section class="hero wrap" aria-label="Introdução">
    <div class="focus-glow" aria-hidden="true"></div>
    <p class="hero-kicker">${esc(settings.hero.kicker)}</p>
    <h1 class="hero-name">${esc(settings.hero.name)}<span class="glow">.</span></h1>
    <ul class="hero-role">
${settings.hero.roles.map((r) => `      <li>${esc(r)}</li>`).join("\n")}
    </ul>
    <p class="hero-statement">${md(settings.hero.statement)}</p>
    <a class="hero-scroll" href="#work">
      <span class="arrow" aria-hidden="true">↓</span> Explorar o trabalho
    </a>
  </section>

  <section class="section" id="work" aria-labelledby="work-title">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow">Work</span>
        <h2 class="section-title" id="work-title">${settings.work.title}</h2>
        <p class="section-lede">${md(settings.work.lede)}</p>
      </div>

      <nav class="sector-nav" aria-label="Frentes de trabalho">
${buildSectorNav()}
      </nav>

${sectors.map(buildSectorBlock).join("\n\n")}

    </div>
  </section>

  <section class="section" id="about" aria-labelledby="about-title">
    <div class="wrap about-grid">
      <div class="about-text">
        <span class="eyebrow">Sobre</span>
        <h2 class="section-title" id="about-title" style="margin-top:1.25rem;">${settings.about.title}</h2>
        <p style="margin-top:2rem;">${md(settings.about.paragraphs[0] || "")}</p>
${settings.about.paragraphs
  .slice(1)
  .map((p) => `        <p class="muted">${md(p)}</p>`)
  .join("\n")}
      </div>
      <dl class="about-facts reveal">
${buildFactsList(settings.about.facts)}
      </dl>
    </div>
  </section>

  <section class="section contact" id="contact" aria-labelledby="contact-title">
    <div class="wrap">
      <span class="eyebrow">Contato</span>
      <h2 class="contact-title" id="contact-title" style="margin-top:1.5rem;">
        <a href="${esc(settings.contact.link)}" target="_blank" rel="noopener noreferrer">${settings.contact.title}</a>
      </h2>
      <dl class="contact-row">
${buildContactItems(settings.contact.items)}
      </dl>
    </div>
  </section>
</main>

${footer()}

<script src="/js/main.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- work/*.html

function buildCasePage(item, idx) {
  const prev = allOrdered[(idx - 1 + allOrdered.length) % allOrdered.length];
  const next = allOrdered[(idx + 1) % allOrdered.length];
  const siteUrl = settings.meta.siteUrl || SITE_URL_FALLBACK;

  const metaFields = [];
  if (item.tools) metaFields.push({ label: "Ferramentas", value: item.tools });
  else if (item.role) metaFields.push({ label: "Papel", value: item.role });

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${md(item.title).replace(/<[^>]+>/g, "")} — Felipe, Designer</title>
<meta name="description" content="${esc(item.cardDesc)}">
<link rel="canonical" href="${siteUrl}/work/${item.slug}.html">
<meta property="og:type" content="article">
<meta property="og:title" content="${md(item.title).replace(/<[^>]+>/g, "")} — Felipe, Designer">
<meta property="og:description" content="${esc(item.cardDesc)}">
<meta property="og:image" content="${esc(isVideo(item.media) ? item.media.poster || "/assets/img/og/og-cover.svg" : item.media.src)}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/css/style.css">
${FONT_LINK}
</head>
<body>
<a class="skip-link" href="#conteudo">Pular para o conteúdo</a>

${header("/")}

<main id="conteudo">
  <section class="case-hero wrap">
    <a class="case-back" href="/#work">← Todo o trabalho</a>
    <p class="eyebrow">${esc(item.category)}</p>
    <h1 class="case-title" style="margin-top:1rem;">${md(item.title)}</h1>
    <dl class="case-meta">
      <div><dt>Ano</dt><dd>${esc(item.year)}</dd></div>
      <div><dt>Categoria</dt><dd>${esc(item.category)}</dd></div>
${metaFields.map((f) => `      <div><dt>${esc(f.label)}</dt><dd>${esc(f.value)}</dd></div>`).join("\n")}
      <div><dt>Peças</dt><dd>1</dd></div>
    </dl>
    <figure class="case-cover">
      ${mediaFigure(item, { eager: true })}
    </figure>
  </section>

  <section class="case-body wrap">
    <nav class="case-toc" aria-label="Seções do projeto">
      <a href="#contexto">Contexto</a>
      <a href="#desafio">Desafio</a>
      <a href="#solucao">Solução</a>
      <a href="#detalhes">Detalhes</a>
    </nav>

    <div class="case-content">
      <div class="case-block" id="contexto">
        <h2>Contexto</h2>
        <p>${md(item.contexto)}</p>
      </div>

      <div class="case-block" id="desafio">
        <h2>Desafio</h2>
        <p>${md(item.desafio)}</p>
      </div>

      <div class="case-block" id="solucao">
        <h2>Solução</h2>
        <p>${md(item.solucao)}</p>
      </div>

      <div class="case-block" id="detalhes">
        <h2>Detalhes visuais</h2>
        <p>${md(item.detalhes)}</p>
        <p class="case-note">${md(item.nota)}</p>
      </div>
    </div>
  </section>

  <nav class="case-nextprev" aria-label="Outros projetos">
    <a href="/work/${prev.slug}.html">
      <span class="eyebrow">Anterior</span>
      <span class="ttl">${md(prev.title)}</span>
    </a>
    <a href="/work/${next.slug}.html">
      <span class="eyebrow">Próximo</span>
      <span class="ttl">${md(next.title)}</span>
    </a>
  </nav>
</main>

${footer()}

<script src="/js/main.js"></script>
</body>
</html>
`;
}

// ---------------------------------------------------------------- write files

fs.writeFileSync(path.join(ROOT, "index.html"), buildIndex(), "utf8");

if (!fs.existsSync(WORK_DIR)) fs.mkdirSync(WORK_DIR);
const keepFiles = new Set(work.map((w) => w.slug + ".html"));
for (const existing of fs.readdirSync(WORK_DIR)) {
  if (existing.endsWith(".html") && !keepFiles.has(existing)) {
    fs.unlinkSync(path.join(WORK_DIR, existing));
    console.log("removed stale", "work/" + existing);
  }
}
allOrdered.forEach((item, idx) => {
  fs.writeFileSync(path.join(WORK_DIR, item.slug + ".html"), buildCasePage(item, idx), "utf8");
});

// sitemap.xml
const siteUrl = settings.meta.siteUrl || SITE_URL_FALLBACK;
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${siteUrl}/</loc></url>
${allOrdered.map((w) => `  <url><loc>${siteUrl}/work/${w.slug}.html</loc></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sitemap, "utf8");

console.log(`Build ok: index.html + ${allOrdered.length} páginas de projeto + sitemap.xml`);
