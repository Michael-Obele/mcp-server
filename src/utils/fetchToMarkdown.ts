import TurndownService from "turndown";
import { load } from "cheerio";
import { Defuddle } from "defuddle/node";
import { Readability } from "@mozilla/readability";
import { JSDOM } from "jsdom";
import scrapeIt from "scrape-it";
import metascraper from "metascraper";
import metascraperTitle from "metascraper-title";
import metascraperDescription from "metascraper-description";

export async function fetchToMarkdown(
  url: string,
  options: {
    timeoutMs?: number;
    useDefuddle?: boolean;
    useReadability?: boolean;
    useScrapeIt?: boolean;
    useMetascraper?: boolean;
  } = {}
) {
  const {
    timeoutMs = 10000,
    useDefuddle = false,
    useReadability = false,
    useScrapeIt = false,
    useMetascraper = false,
  } = options;

  // Option 1: Use defuddle for intelligent content extraction
  if (useDefuddle) {
    try {
      const dom = await JSDOM.fromURL(url, {
        userAgent: "Mozilla/5.0 (compatible; MCP-Fetch/1.0)",
        pretendToBeVisual: true,
        resources: "usable",
      });

      const result = await Defuddle(dom, url, {
        debug: false,
        markdown: false,
      });

      if (result && result.content) {
        const turndownService = new TurndownService({ headingStyle: "atx" });
        return turndownService.turndown(result.content);
      }
    } catch (error) {
      console.warn(
        "Defuddle extraction failed, falling back to standard method:",
        error
      );
    }
  }

  // Option 2: Use Readability for content extraction
  if (useReadability) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MCP-Fetch/1.0)" },
        signal: AbortSignal.timeout(timeoutMs),
      });
      const html = await response.text();
      const doc = new JSDOM(html, { url });

      const reader = new Readability(doc.window.document);
      const article = reader.parse();

      if (article?.content) {
        const turndownService = new TurndownService({ headingStyle: "atx" });
        return turndownService.turndown(article.content);
      }
    } catch (error) {
      console.warn(
        "Readability extraction failed, falling back to standard method:",
        error
      );
    }
  }

  // Option 3: Use scrape-it for structured content extraction
  if (useScrapeIt) {
    try {
      const { data } = (await scrapeIt(url, {
        title: 'h1, h2, .title, [class*="title"]',
        content: {
          selector:
            "main, article, .content, #content, .main, #main, .post, .entry",
          how: "html",
        },
        description:
          'meta[name="description"], meta[property="og:description"]',
      })) as {
        data: { content?: string; title?: string; description?: string };
      };

      if (data.content) {
        const turndownService = new TurndownService({ headingStyle: "atx" });
        return turndownService.turndown(data.content);
      }
    } catch (error) {
      console.warn(
        "Scrape-it extraction failed, falling back to standard method:",
        error
      );
    }
  }

  // Option 4: Use metascraper for metadata extraction
  if (useMetascraper) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; MCP-Fetch/1.0)" },
      });
      const html = await response.text();

      const metadata = await metascraper([
        metascraperTitle(),
        metascraperDescription(),
      ])({ html, url });

      // Try to extract content using cheerio as fallback
      const $ = load(html);
      const content =
        $("main, article, .content, #content").first().html() ||
        $("body").html();

      if (content) {
        const turndownService = new TurndownService({ headingStyle: "atx" });
        let markdown = turndownService.turndown(content);

        // Add metadata at the top
        if (metadata.title) {
          markdown = `# ${metadata.title}\n\n${markdown}`;
        }
        if (metadata.description) {
          markdown = `${markdown}\n\n${metadata.description}`;
        }

        return markdown;
      }
    } catch (error) {
      console.warn(
        "Metascraper extraction failed, falling back to standard method:",
        error
      );
    }
  }

  // Option 5: Standard fetch method
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MCP-Fetch/1.0)",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok)
      throw new Error(
        `Failed to fetch ${url}: ${res.status} ${res.statusText}`
      );
    const html = await res.text();
    const $ = load(html);

    // Remove footer elements heuristically
    $("footer").remove();
    $("[id*=footer]").remove();
    $("[class*=footer]").remove();
    $("[role=contentinfo]").remove();

    // Try to select the main content area
    let main = $("main");
    if (main.length === 0) {
      main = $("article");
    }
    if (main.length === 0) {
      // Try to find content containers
      main = $(
        ".content, #content, .main, #main, .container, #container"
      ).first();
    }
    if (main.length === 0) {
      // Fallback: pick body but remove only scripts and styles
      main = $("body");
      main.find("script, style, noscript").remove();
    }

    const content = main.html() || "";
    if (content.trim().length === 0) {
      throw new Error(
        `No content found in HTML. This might be a Single Page Application (SPA). Consider using a tool like Firecrawl for JS-rendered content.`
      );
    }

    const turndownService = new TurndownService({ headingStyle: "atx" });
    const markdown = turndownService.turndown(content);
    return markdown;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  }
}

// ESM-compatible CLI entry
if (typeof process !== "undefined" && process.argv?.length > 2) {
  const url = process.argv[2];
  const useDefuddle =
    process.argv.includes("--useDefuddle") ||
    process.argv.includes("--defuddle");
  const useReadability =
    process.argv.includes("--useReadability") ||
    process.argv.includes("--readability");
  const useScrapeIt =
    process.argv.includes("--useScrapeIt") ||
    process.argv.includes("--scrapeit");
  const useMetascraper =
    process.argv.includes("--useMetascraper") ||
    process.argv.includes("--metascraper");

  if (!url) {
    console.error(
      "Usage: bunx tsx src/utils/fetchToMarkdown.ts <url> [--useDefuddle] [--useReadability] [--useScrapeIt] [--useMetascraper]"
    );
    process.exit(1);
  }

  fetchToMarkdown(url, {
    useDefuddle,
    useReadability,
    useScrapeIt,
    useMetascraper,
  })
    .then((md) => console.log(md))
    .catch((err) => {
      console.error("Error:", err.message);
      process.exit(1);
    });
}
