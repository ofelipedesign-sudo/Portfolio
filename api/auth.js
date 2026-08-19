// Passo 1 do login do painel: redireciona pro GitHub pedir autorização.
// Usa as variáveis de ambiente OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET (configuradas no Vercel).
module.exports = (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  if (!clientId) {
    res.status(500).send("OAUTH_CLIENT_ID não configurado no Vercel. Veja o README (seção Painel de edição).");
    return;
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const redirectUri = `${proto}://${host}/api/callback`;

  const state = Math.random().toString(36).slice(2);
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", "repo,user");
  url.searchParams.set("state", state);

  res.setHeader("Set-Cookie", `oauth_state=${state}; Path=/; HttpOnly; Max-Age=600; SameSite=Lax`);
  res.writeHead(302, { Location: url.toString() });
  res.end();
};
