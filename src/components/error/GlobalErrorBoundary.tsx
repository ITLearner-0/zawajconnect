
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'sonner';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    console.error('Global Error Boundary caught an error:', error, errorInfo);
    
    toast.error('Une erreur inattendue s\'est produite', {
      description: 'L\'application continue de fonctionner',
      duration: 5000
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Oops ! Une erreur s'est produite
            </h2>
            <p className="text-gray-600 mb-6">
              Nous nous excusons pour la gêne occasionnée. Une erreur inattendue s'est produite.
            </p>
            <button
              onClick={this.handleRetry}
              className="bg-rose-500 hover:bg-rose-600 text-white px-4 py-2 rounded-md transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;
