// Passo 2 do login do painel: troca o código do GitHub por um token de acesso
// e devolve pro popup do Decap CMS (que fica esperando essa mensagem).
module.exports = async (req, res) => {
  const clientId = process.env.OAUTH_CLIENT_ID;
  const clientSecret = process.env.OAUTH_CLIENT_SECRET;
  const { code, state } = req.query || {};

  const cookies = Object.fromEntries(
    (req.headers.cookie || "").split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    })
  );

  function respond(status, message, content) {
    res.status(200).send(`<!doctype html><html><body>
<script>
(function() {
  function receiveMessage(e) {
    window.opener.postMessage(
      'authorization:github:${status}:${JSON.stringify({ token: content, provider: "github" })}',
      e.origin
    );
    window.removeEventListener("message", receiveMessage, false);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:github", "*");
})();
</script>
<p>${message}</p>
</body></html>`);
  }

  if (!clientId || !clientSecret) {
    res.status(500).send("OAUTH_CLIENT_ID / OAUTH_CLIENT_SECRET não configurados no Vercel.");
    return;
  }
  if (!code) {
    res.status(400).send("Código de autorização ausente.");
    return;
  }
  if (!cookies.oauth_state || cookies.oauth_state !== state) {
    res.status(400).send("Estado inválido — tente logar de novo.");
    return;
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    const tokenJson = await tokenRes.json();

    if (tokenJson.error || !tokenJson.access_token) {
      respond("error", "Falha ao autenticar: " + (tokenJson.error_description || tokenJson.error || "token ausente"), "");
      return;
    }

    respond("success", "Login feito — pode fechar esta janela.", tokenJson.access_token);
  } catch (err) {
    respond("error", "Erro inesperado: " + err.message, "");
  }
};
