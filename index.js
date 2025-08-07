// mod.js

// Extract hostname for "source"
function getSource(url) {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return "";
  }
}

Deno.serve(async (req) => {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url") || "https://www.cnn.com/sitemap/news.xml";

  try {
    const res = await fetch(targetUrl);
    const xml = await res.text();

    // Extract first <url> entry
    const match = xml.match(/<loc>(.*?)<\/loc>/);
    const firstUrl = match ? match[1] : null;

    // Grab image (if present in sitemap)
    const imgMatch = xml.match(/<image:loc>(.*?)<\/image:loc>/);
    const imageUrl = imgMatch ? imgMatch[1] : null;

    return new Response(
      JSON.stringify({
        title: firstUrl ? `Top Story from ${getSource(firstUrl)}` : "No title found",
        source: getSource(firstUrl || targetUrl),
        image_url: imageUrl || "",
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
