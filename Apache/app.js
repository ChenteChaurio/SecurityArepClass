(function () {
  const config = window.APP_CONFIG;

  const apiBaseNode = document.getElementById("apiBase");
  const pingBtn = document.getElementById("pingBtn");
  const pingResult = document.getElementById("pingResult");
  const loginForm = document.getElementById("loginForm");
  const loginResult = document.getElementById("loginResult");

  apiBaseNode.textContent = config.springApiBaseUrl;

  function setResult(node, title, data) {
    const value = typeof data === "string" ? data : JSON.stringify(data, null, 2);
    node.textContent = `${title}\n${value}`;
  }

  async function request(url, options) {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {})
      }
    });

    const responseText = await response.text();

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      body: responseText
    };
  }

  pingBtn.addEventListener("click", async function () {
    setResult(pingResult, "Consultando...", "");
    try {
      const result = await request(`${config.springApiBaseUrl}/`, {
        method: "GET"
      });
      setResult(pingResult, "Respuesta endpoint /", result);
    } catch (error) {
      setResult(pingResult, "Error de conexión", error.message);
    }
  });

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(loginForm);
    const payload = {
      email: String(formData.get("email") || ""),
      password: String(formData.get("password") || "")
    };

    setResult(loginResult, "Enviando login...", "");

    try {
      const result = await request(`${config.springApiBaseUrl}${config.loginPath}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      setResult(loginResult, "Respuesta login", result);
    } catch (error) {
      setResult(loginResult, "Error en login", error.message);
    }
  });
})();
