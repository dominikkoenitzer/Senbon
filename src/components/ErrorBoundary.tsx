"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch and handle React errors
 * Provides graceful error UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="zen-card px-6 md:px-10 py-12 md:py-20 text-center">
          <h2 className="font-display text-xl md:text-2xl text-zen-mist mb-4">
            Something went wrong
          </h2>
          <p className="text-sm md:text-base text-zen-mist/60 mb-6">
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-zen-gold/10 border border-zen-gold/20 text-zen-gold hover:bg-zen-gold/20 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Simple error fallback component for blog posts
 */
export const BlogErrorFallback = ({ error }: { error?: string }) => (
  <div className="zen-card px-6 md:px-10 py-12 md:py-20 text-center">
    <h2 className="font-display text-xl md:text-2xl text-zen-mist mb-4">
      Unable to load post
    </h2>
    <p className="text-sm md:text-base text-zen-mist/60">
      {error || "This post could not be loaded. Please try again later."}
    </p>
  </div>
);

