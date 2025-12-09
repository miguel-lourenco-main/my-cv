"use client";

import React, { useEffect, useState } from "react";
import { cn } from "../../lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type GitlabReadmeViewerProps = {
  projectId: string;
};

/**
 * Renders a project's README.md from a local static markdown file.
 * Files are expected at `/readmes/{projectId}.md` under `public/`.
 */
export function GitlabReadmeViewer({ projectId }: GitlabReadmeViewerProps) {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [reloadKey, setReloadKey] = useState<number>(0);

  useEffect(() => {
    let cancelled = false;

    async function loadReadme() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/readmes/${projectId}.md`);
        const content = res.ok ? await res.text() : null;

        if (!cancelled) {
          if (content) {
            setMarkdown(content);
          } else {
            setError("not-found");
          }
        }
      } catch {
        if (!cancelled) {
          setError("error");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadReadme();

    return () => {
      cancelled = true;
    };
  }, [projectId, reloadKey]);

  const handleRetry = () => {
    // Reset state and trigger a re-fetch via reloadKey.
    setMarkdown(null);
    setError(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const isHtmlError =
    typeof markdown === "string" &&
    markdown.trimStart().toLowerCase().startsWith("<!doctype html");

  if (loading && !markdown) {
    return (
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Loading README…
      </p>
    );
  }

  if (error || !markdown || isHtmlError) {
    return (
      <div className="flex flex-col items-start gap-2 text-sm">
        <p className="text-neutral-500 dark:text-neutral-400">
          Project README not available or failed to load correctly.
        </p>
        <button
          type="button"
          onClick={handleRetry}
          className="inline-flex items-center rounded-md border border-neutral-300 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm transition-colors hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none text-sm
                 prose-headings:font-semibold prose-headings:text-neutral-900 dark:prose-headings:text-neutral-50
                 prose-a:text-green-600 dark:prose-a:text-green-400 prose-a:underline-offset-2 prose-a:no-underline hover:prose-a:underline
                 prose-code:text-sm prose-code:bg-neutral-100 dark:prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                 prose-pre:bg-neutral-950 dark:prose-pre:bg-neutral-900
                 prose-ul:list-disc prose-ol:list-decimal"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img({ className, ...props }) {
            // Mark images as `not-prose` so Tailwind Typography's `.prose img`
            // styles do not apply. We still allow additional classes via
            // `className` for manual overrides when needed.
            return <img {...props} className={cn(className, "not-prose")} />;
          },
          p({ node, children }) {
            const n: any = node as any;
            const kids: any[] = Array.isArray(n.children) ? n.children : [];

            // React children, used to avoid nested <p> and drop React-level
            // empty paragraphs.
            const childArray = React.Children.toArray(children);

            const meaningfulChildren = childArray.filter((child) => {
              if (typeof child === "string") {
                return child.trim().length > 0;
              }
              return true;
            });

            // AST-based: drop paragraphs that are only whitespace text.
            const onlyWhitespace =
              kids.length === 0 ||
              kids.every(
                (child) =>
                  child.type === "text" &&
                  typeof child.value === "string" &&
                  child.value.trim().length === 0
              );

            if (onlyWhitespace || meaningfulChildren.length === 0) {
              return null;
            }

            // Avoid producing <p><p>...</p></p> when the content is already a
            // single paragraph (for example, from raw HTML in the README).
            if (
              meaningfulChildren.length === 1 &&
              React.isValidElement(meaningfulChildren[0]) &&
              meaningfulChildren[0].type === "p"
            ) {
              return meaningfulChildren[0];
            }

            // AST-based detection: paragraph that contains only image links
            // (badges), so they can render in a single row similar to GitLab.
            const allMediaLinks =
              kids.length > 0 &&
              kids.every((child) => {
                // Allow and ignore pure whitespace text nodes.
                if (
                  child.type === "text" &&
                  typeof child.value === "string" &&
                  child.value.trim().length === 0
                ) {
                  return true;
                }

                if (child.type !== "element") return false;

                if (child.tagName === "img") {
                  return true;
                }

                if (child.tagName === "a") {
                  const grand = Array.isArray(child.children)
                    ? child.children
                    : [];

                  const hasImage = grand.some(
                    (gc: any) =>
                      gc.type === "element" && gc.tagName === "img"
                  );

                  const onlyImagesOrWhitespace = grand.every((gc: any) => {
                    if (
                      gc.type === "text" &&
                      typeof gc.value === "string" &&
                      gc.value.trim().length === 0
                    ) {
                      return true;
                    }
                    return gc.type === "element" && gc.tagName === "img";
                  });

                  return hasImage && onlyImagesOrWhitespace;
                }

                return false;
              });

            if (allMediaLinks) {
              // Inline flex paragraph so consecutive badge paragraphs
              // sit on the same visual row and wrap when needed.
              return (
                <p className="inline-flex flex-wrap items-center gap-2 mr-2 my-2">
                  {children}
                </p>
              );
            }

            return <p>{children}</p>;
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
