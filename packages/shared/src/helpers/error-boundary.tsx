import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        this.setState({ error, errorInfo });
        console.error("Error Boundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return <h1>Something went wrong - {JSON.stringify(this.state.error, null, 2)}</h1>;
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
