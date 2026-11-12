const ALLOWED_ORIGIN = "https://rousmimi087-lgtm.github.io";

function cors(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin"
  };
}

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...cors(origin) }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors(origin) });
    }
    if (origin !== ALLOWED_ORIGIN) {
      return json({ error: "Origin not allowed" }, 403, origin);
    }
    if (!env.MAGIC_HOUR_API_KEY) {
      return json({ error: "Video provider is not configured" }, 503, origin);
    }

    const url = new URL(request.url);
    const headers = {
      "Authorization": `Bearer ${env.MAGIC_HOUR_API_KEY}`,
      "Content-Type": "application/json"
    };

    try {
      if (request.method === "POST" && url.pathname === "/api/generate") {
        const input = await request.json();
        const prompt = typeof input.prompt === "string" ? input.prompt.trim() : "";
        if (!prompt || prompt.length > 1200) {
          return json({ error: "Enter a prompt between 1 and 1200 characters." }, 400, origin);
        }

        const requestedDuration = Number(input.duration ?? 3);
        if (!Number.isInteger(requestedDuration) || requestedDuration < 3 || requestedDuration > 60) {
          return json({ error: "Choose a whole-number duration from 3 to 60 seconds." }, 400, origin);
        }

        // LTX-2.5 supports durations up to 60 seconds; account plan and credits may restrict longer jobs.
        const body = {
          end_seconds: requestedDuration,
          aspect_ratio: ["16:9", "9:16", "1:1"].includes(input.aspectRatio) ? input.aspectRatio : "16:9",
          style: { prompt: prompt + (input.style ? `. Visual style: ${String(input.style).slice(0, 50)}.` : "") },
          name: `Motion Studio ${requestedDuration}s video`,
          model: "ltx-2.5",
          resolution: "480p",
          audio: false
        };

        const upstream = await fetch("https://api.magichour.ai/v1/text-to-video", {
          method: "POST",
          headers,
          body: JSON.stringify(body)
        });
        const result = await upstream.json().catch(() => ({}));
        return json(result, upstream.status, origin);
      }

      if (request.method === "GET" && url.pathname === "/api/status") {
        const id = url.searchParams.get("id");
        if (!id || !/^[a-zA-Z0-9_-]{1,160}$/.test(id)) {
          return json({ error: "A valid project id is required." }, 400, origin);
        }
        const upstream = await fetch(`https://api.magichour.ai/v1/video-projects/${encodeURIComponent(id)}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${env.MAGIC_HOUR_API_KEY}` }
        });
        const result = await upstream.json().catch(() => ({}));
        return json(result, upstream.status, origin);
      }

      return json({ error: "Not found" }, 404, origin);
    } catch {
      return json({ error: "The request could not be completed. Please try again later." }, 500, origin);
    }
  }
};
