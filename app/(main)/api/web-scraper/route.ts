import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");

    if (!url) {
      return NextResponse.json(
        { error: "URL parameter is required" },
        { status: 400 }
      );
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Initialize content structure focused on code snippets
    const content = {
      title: $("title").text().trim(),
      codeSnippets: [] as Array<{
        language?: string;
        code: string;
        context?: string; // Optional heading or context where the code was found
      }>,
    };

    // Look for code blocks in pre and code tags
    $("pre, code").each((_, element) => {
      const $el = $(element);
      const code = $el.text().trim();

      // Skip empty code blocks
      if (!code) return;

      // Try to determine the language
      const language = $el.attr("class")?.match(/language-(\w+)/)?.[1];

      // Get surrounding context (e.g., nearest heading)
      const context = $el
        .closest("section")
        .find("h1, h2, h3, h4, h5, h6")
        .first()
        .text()
        .trim();

      // Avoid duplicates
      if (!content.codeSnippets.some((snippet) => snippet.code === code)) {
        content.codeSnippets.push({
          language,
          code,
          context: context || undefined,
        });
      }
    });

    return NextResponse.json({
      success: true,
      data: content,
      debug: {
        url: response.url,
        snippetsFound: content.codeSnippets.length,
      },
    });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json(
      {
        error: "Failed to scrape the webpage",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
