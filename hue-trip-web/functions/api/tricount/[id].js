const EXPORTER_BASE = "https://tricount-exporter.pages.dev/tricount/";

const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: jsonHeaders });
}

export async function onRequestGet(context) {
  const id = String(context.params.id || "").trim();
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) {
    return reply({ ok: false, error: "Invalid Tricount ID" }, 400);
  }

  const sourceUrl = `${EXPORTER_BASE}${encodeURIComponent(id)}`;
  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "Accept": "application/json, text/html;q=0.9",
        "User-Agent": "Hue-Trip-2026/1.0"
      },
      cf: { cacheTtl: 0, cacheEverything: false }
    });

    const contentType = response.headers.get("content-type") || "";
    const text = await response.text();

    if (!response.ok) {
      return reply({ ok: false, error: `Exporter HTTP ${response.status}`, sourceUrl }, 502);
    }

    if (contentType.toLowerCase().includes("json")) {
      const data = JSON.parse(text);
      return reply({ ok: true, sourceUrl, syncedAt: new Date().toISOString(), data });
    }

    const embedded = extractEmbeddedJson(text);
    if (embedded) {
      return reply({ ok: true, sourceUrl, syncedAt: new Date().toISOString(), data: embedded });
    }

    return reply({
      ok: false,
      error: "Exporter returned HTML without embedded financial JSON.",
      code: "EXPORTER_HTML_ONLY",
      sourceUrl,
      guidance: "Use the exporter JSON download, or update this Function when the exporter publishes a JSON endpoint."
    }, 422);
  } catch (error) {
    return reply({ ok: false, error: error.message, sourceUrl }, 502);
  }
}

function extractEmbeddedJson(html) {
  const patterns = [
    /<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/i,
    /<script[^>]+type=["']application\/json["'][^>]*>([\s\S]*?)<\/script>/i,
    /window\.__TRICOUNT_DATA__\s*=\s*([\s\S]*?);\s*<\/script>/i
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (!match) continue;
    try { return JSON.parse(decodeHtml(match[1].trim())); } catch (_) {}
  }
  return null;
}

function decodeHtml(value) {
  return value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

function reply(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), { status, headers: jsonHeaders });
}
