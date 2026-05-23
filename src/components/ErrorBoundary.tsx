// ─── Error Boundary ────────────────────────────────────────────────
// Global React error boundary that catches rendering crashes and
// shows a branded recovery screen instead of a blank page.

import { Component, type ErrorInfo, type ReactNode } from "react";
import { track } from "@/lib/analytics";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
};

type State = {
  hasError: boolean;
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("[ErrorBoundary] Caught error:", error, errorInfo);

    // Track the error in analytics
    track("app_error", {
      error_message: error.message,
      error_name: error.name,
      component_stack: errorInfo.componentStack?.slice(0, 500),
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          className="min-h-screen flex items-center justify-center px-4"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(255,107,158,0.08) 0%, #0B1120 55%)",
          }}
        >
          <div className="text-center max-w-md">
            {/* Animated icon */}
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(255,107,158,0.1)",
                border: "1px solid rgba(255,107,158,0.2)",
              }}
            >
              <span className="text-4xl" role="img" aria-label="error">
                📚
              </span>
            </div>

            <h1
              className="font-bold text-2xl mb-3"
              style={{
                fontFamily: "var(--font-display, 'Inter', sans-serif)",
                color: "#f1f5f9",
              }}
            >
              Something went wrong
            </h1>

            <p
              className="text-sm mb-2 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              FocusTribe hit an unexpected error. Don't worry — your data is safe.
            </p>

            {/* Show error message in dev mode */}
            {import.meta.env.DEV && this.state.error && (
              <pre
                className="text-left text-xs p-3 rounded-xl mb-6 overflow-x-auto"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#FCA5A5",
                  maxHeight: "120px",
                }}
              >
                {this.state.error.message}
              </pre>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
              <button
                onClick={this.handleRefresh}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #FF6B9E 0%, #FF8FB5 100%)",
                  color: "#0B1120",
                  boxShadow: "0 4px 15px rgba(255,107,158,0.3)",
                }}
              >
                Refresh page
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 rounded-xl text-sm font-semibold transition hover:opacity-80"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#94a3b8",
                }}
              >
                Go home
              </button>
            </div>

            <p
              className="text-xs mt-8"
              style={{ color: "rgba(255,255,255,0.25)" }}
            >
              If this keeps happening, contact us at support@focustribe.in
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
