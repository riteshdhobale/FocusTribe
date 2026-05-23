import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { useEffect } from "react";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { loadPostHog } from "@/lib/analytics";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "StudyDate — Find your perfect study room" },
      {
        name: "description",
        content:
          "Find study partners, join focused rooms, and build momentum with students preparing for exams, finals, certifications, and research goals.",
      },
      { name: "author", content: "StudyDate" },
      { name: "theme-color", content: "#FF6B9E" },
      { property: "og:title", content: "StudyDate — Find your perfect study partner" },
      {
        property: "og:description",
        content:
          "Swipe on ambition, not just looks. Match by goal, exam focus, and availability, then study in focused rooms. Free to start.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://studydate.in" },
      { property: "og:image", content: "https://studydate.in/og-image.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "StudyDate — Find your perfect study partner" },
      { property: "og:site_name", content: "StudyDate" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@StudyDateApp" },
      { name: "twitter:creator", content: "@StudyDateApp" },
      { name: "twitter:title", content: "StudyDate — Tinder for study partners" },
      {
        name: "twitter:description",
        content:
          "Swipe on ambition, not just looks. Match by goal, exam focus, and availability. Free to start.",
      },
      { name: "twitter:image", content: "https://studydate.in/og-image.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        type: "image/png",
        href: "/favicon.png",
      },
      {
        rel: "apple-touch-icon",
        href: "/favicon.png",
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  // Initialize analytics + register service worker on mount
  useEffect(() => {
    loadPostHog();

    // Register PWA service worker
    if ("serviceWorker" in navigator && !import.meta.env.DEV) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("[SW] Registration failed:", err);
      });
    }
  }, []);

  return (
    <ErrorBoundary>
      <Outlet />
      <Toaster
        position="top-center"
        richColors
        theme="dark"
        toastOptions={{
          style: {
            background: "rgba(15, 23, 42, 0.95)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#f1f5f9",
          },
        }}
      />
    </ErrorBoundary>
  );
}
