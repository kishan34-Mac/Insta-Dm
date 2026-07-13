import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonical?: string;
  structuredData?: Record<string, unknown>;
}

export function useSEO({ title, description, keywords, canonical, structuredData }: SEOProps) {
  useEffect(() => {
    // 1. Title
    const formattedTitle = `${title} | DMPilot`;
    document.title = formattedTitle;

    const metaTitle = document.querySelector('meta[name="title"]');
    if (metaTitle) metaTitle.setAttribute("content", formattedTitle);

    // 2. Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", description);

    // 3. Keywords
    if (keywords) {
      let metaKeywords = document.querySelector('meta[name="keywords"]');
      if (!metaKeywords) {
        metaKeywords = document.createElement("meta");
        metaKeywords.setAttribute("name", "keywords");
        document.head.appendChild(metaKeywords);
      }
      metaKeywords.setAttribute("content", keywords);
    }

    // 4. Canonical
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    if (!linkCanonical) {
      linkCanonical = document.createElement("link");
      linkCanonical.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonical);
    }
    const currentUrl = canonical || window.location.origin + window.location.pathname;
    linkCanonical.setAttribute("href", currentUrl);

    // 5. Open Graph / Facebook
    const updateMetaProperty = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("property", property);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaProperty("og:title", formattedTitle);
    updateMetaProperty("og:description", description);
    updateMetaProperty("og:url", currentUrl);

    // 6. Twitter
    const updateMetaName = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute("name", name);
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    updateMetaName("twitter:title", formattedTitle);
    updateMetaName("twitter:description", description);
    updateMetaName("twitter:url", currentUrl);

    // 7. Structured Data (JSON-LD)
    const scriptId = "seo-json-ld";
    let script = document.getElementById(scriptId);
    if (script) {
      script.remove();
    }

    if (structuredData) {
      script = document.createElement("script");
      script.setAttribute("type", "application/ld+json");
      script.setAttribute("id", scriptId);
      script.innerHTML = JSON.stringify(structuredData);
      document.head.appendChild(script);
    }

    return () => {
      // Cleanup custom structured data script on unmount
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [title, description, keywords, canonical, structuredData]);
}
