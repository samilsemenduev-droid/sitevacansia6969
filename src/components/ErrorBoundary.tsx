import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: unknown): State {
    const message =
      err instanceof Error ? err.message : typeof err === 'string' ? err : 'Неизвестная ошибка';
    return { hasError: true, message };
  }

  componentDidCatch(err: unknown, info: ErrorInfo) {
    console.error('[vacansia] ErrorBoundary', err, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            color: '#e4e4e7',
            background: '#060608',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', fontWeight: 600 }}>
            Ошибка запуска приложения
          </h1>
          <p style={{ opacity: 0.9, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
            {this.state.message}
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
