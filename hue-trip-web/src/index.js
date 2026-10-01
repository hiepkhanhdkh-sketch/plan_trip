const EXPORTER_BASE =
  "*ttps://tricount-exporter.pages.dev*tricount/";

export default {
 *async fetch(request, env) {
    co*st url = new URL(request.url);

  * if (url.pathname.startsWith("/api*tricount/")) {
      return handle*ricount(request, url);
    }

    *eturn env.ASSETS.fetch(request);
 *}
};

async function handleTricoun*(request, url) {
  if (request.met*od === "OPTIONS") {
    return new*Response(null, {
      status: 204*
      headers: corsHeaders()
    *);
  }

  if (request.method !== "*ET") {
    return jsonResponse(
  *   {
        ok: false,
        er*or: "Method not allowed"
      },
*     405
    );
  }

  const prefi* = "/api/tricount/";
  const trico*ntId = decodeURIComponent(
    url*pathname.slice(prefix.length)
  ).*rim();

  if (!/^[A-Za-z0-9_-]{8,6*}$/.test(tricountId)) {
    return*jsonResponse(
      {
        ok: *alse,
        error: "Invalid Tric*unt ID"
      },
      400
    );
* }

  const*sourceUrl =
   *EXPORTER_BASE + encodeURIComponent*tricountId);

  try {
    const re*ponse = await fetch(sourceUrl, {
 *    headers: {
        Accept: "ap*lication/json, text/html;q=0.9",
 *      "User-Agent": "Hue-Trip-2026*1.0"
      }
    });

    const co*tentType =
      response.headers.*et("content-type") || "";

    con*t responseText = await response.te*t();

    if (!response.ok) {
    * return jsonResponse(
        {
  *       ok: false,
          error:*`Tricount Exporter HTTP ${response*status}`,
          sourceUrl
    *   },
        502
      );
    }

*   if (contentType.toLowerCase().i*cludes("json")) {
      const data*= JSON.parse(responseText);

     *return jsonResponse({
        ok: *rue,
        sourceUrl,
        sy*cedAt: new Date().toISOString(),
 *      data
      });
    }

    co*st embeddedData =
      extractEmb*ddedJson(responseText);

    if (e*beddedData) {
      return jsonRes*onse({
        ok: true,
        s*urceUrl,
        syncedAt: new Dat*().toISOString(),
        data: em*eddedData
      });
    }

    ret*rn jsonResponse(
      {
        o*: false,
        code: "EXPORTER_H*ML_ONLY",
        error:
         *"Tricount Exporter chỉ trả HTML và*không có dữ liệu JSON nhúng.",
   *    sourceUrl
      },
      422
 *  );
  } catch (error) {
    retur* jsonResponse(
      {
        ok:*false,
        error: error.messag*,
        sourceUrl
      },
     *502
    );
  }
}

function extract*mbeddedJson(html) {
  const patter*s = [
    /<script[^>]+id=["']__NE*T_DATA__["'][^>]*>([\s\S]*?)<\/scr*pt>/i,

    /<script[^>]+type=["']*pplication\/json["'][^>]*>([\s\S]**)<\/script>/i,

    /window\.__TRI*OUNT_DATA__\s*=\s*([\s\S]*?);\s*<\*script>/i
  ];

  for (const patte*n of patterns) {
    const match =*html.match(pattern);

    if (!mat*h) {
      continue;
    }

    tr* {
      return JSON.parse(
      * decodeHtml(match[1].trim())
     *);
    } catch {
      // Thử patt*rn kế tiếp.
    }
  }

  return nu*l;
}

function decodeHtml(value) {*  return value
    .replace(/&quot*/g, "\"")
    .replace(/&#39;/g, "*")
    .replace(/&amp;/g, "&")
   *.replace(/&lt;/g, "<")
    .replac*(/&gt;/g, ">");
}

function corsHe*ders() {
  return {
    "Access-Co*trol-Allow-Origin": "*",
    "Acce*s-Control-Allow-Methods": "GET, OP*IONS",
    "Access-Control-Allow-H*aders":
      "Content-Type, Accep*"
  };
}

function jsonResponse(bo*y, status = 200) {
  return new Re*ponse(
    JSON.stringify(body, nu*l, 2),
    {
      status,
      h*aders: {
        ...corsHeaders(),*        "Content-Type":
          *application/json; charset=utf-8",
*       "Cache-Control": "no-store"*      }
    }
  );
}