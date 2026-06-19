/**
 * ErrorBoundary component for Carbon Compass.
 *
 * React error boundaries must be class components. To work around the
 * useDefineForClassFields:false tsconfig setting, we declare the class
 * with explicit prototype assignments and keep the JSX render simple.
 */
import React from 'react';

interface EBProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  componentName?: string;
}

interface EBState {
  hasError: boolean;
  errorMsg: string;
}

// We intentionally avoid class field syntax here because
// useDefineForClassFields:false in tsconfig causes TypeScript to misresolve
// this.props / this.state / this.setState in class field initializers.
function createErrorBoundaryClass() {
  return class EB extends React.Component<EBProps, EBState> {
    constructor(props: EBProps) {
      super(props);
      this.state = { hasError: false, errorMsg: '' };
    }

    static getDerivedStateFromError(err: Error): EBState {
      return { hasError: true, errorMsg: err.message };
    }

    componentDidCatch(err: Error, info: React.ErrorInfo): void {
      const name = this.props.componentName ?? 'unknown';
      console.error(`[carbon-compass] Error in "${name}":`, err.message, info.componentStack);
    }

    handleReset(): void {
      this.setState({ hasError: false, errorMsg: '' });
    }

    render(): React.ReactNode {
      if (!this.state.hasError) {
        return this.props.children;
      }
      if (this.props.fallback) {
        return this.props.fallback;
      }
      const label = this.props.componentName
        ? `${this.props.componentName} failed to load`
        : 'Something went wrong';
      const self = this;
      return React.createElement(
        'div',
        { className: 'flex min-h-[200px] items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 p-8 dark:border-rose-900/30 dark:bg-rose-950/20 m-4' },
        React.createElement(
          'div',
          { className: 'text-center space-y-4 max-w-sm' },
          React.createElement(
            'div',
            { className: 'mx-auto h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-950/50 flex items-center justify-center' },
            React.createElement(
              'svg',
              { className: 'h-6 w-6 text-rose-500', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor' },
              React.createElement('path', {
                strokeLinecap: 'round', strokeLinejoin: 'round', strokeWidth: 2,
                d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
              })
            )
          ),
          React.createElement(
            'div',
            null,
            React.createElement('h3', { className: 'text-sm font-bold text-rose-800 dark:text-rose-300' }, label),
            React.createElement('p', { className: 'mt-1 text-xs text-rose-600 dark:text-rose-400 font-mono break-words' },
              self.state.errorMsg || 'An unexpected error occurred.'
            )
          ),
          React.createElement(
            'button',
            {
              onClick: () => self.handleReset(),
              className: 'inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer'
            },
            'Try Again'
          )
        )
      );
    }
  };
}

export const ErrorBoundary = createErrorBoundaryClass();
