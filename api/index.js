// api/index.js

export default async function handler(req, res) {
  const targetUrl = "https://www.cnn.com/sitemap/news.xml";

  try {
    // Fetch the CNN news sitemap
    const resp = await fetch(targetUrl);
    const xml = await resp.text();

    // Find the first <url> entry with an image
    const itemRegex = /<url>[\s\S]*?<loc>(.*?)<\/loc>[\s\S]*?<image:loc>(.*?)<\/image:loc>/i;
    const match = xml.match(itemRegex);

    const storyUrl = match ? match[1] : "";
    const imageUrl = match ? match[2] : "";

    // Derive the hostname for "source"
    const source = storyUrl
      ? new URL(storyUrl).hostname.replace(/^www\./, "")
      : "";

    // Allow requests from anywhere (for TRMNL)
    res.setHeader("Access-Control-Allow-Origin", "*");

    res.status(200).json({
      title: storyUrl ? `Top Story from ${source}` : "No story found",
      source,
      image_url: imageUrl || ""
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
