
import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, State> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if ((import.meta as any).env?.DEV) {
      // eslint-disable-next-line no-console
      console.error("UsersWidget ErrorBoundary caught error", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong loading the widget.</div>;
    }
    return this.props.children;
  }
}
