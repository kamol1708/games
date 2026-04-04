import { Component, StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'

type RootErrorBoundaryState = {
  hasError: boolean
  message: string
}

class RootErrorBoundary extends Component<{ children: ReactNode }, RootErrorBoundaryState> {
  state: RootErrorBoundaryState = {
    hasError: false,
    message: '',
  }

  static getDerivedStateFromError(error: unknown): RootErrorBoundaryState {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Nomaʼlum frontend xatoligi',
    }
  }

  componentDidCatch(error: unknown) {
    console.error('Root render error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main
          style={{
            minHeight: '100vh',
            display: 'grid',
            placeItems: 'center',
            background: '#0f172a',
            color: '#e2e8f0',
            padding: '24px',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <section
            style={{
              width: 'min(720px, 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '20px',
              background: 'rgba(15, 23, 42, 0.92)',
              padding: '24px',
              boxShadow: '0 24px 60px rgba(2,6,23,0.45)',
            }}
          >
            <p style={{ margin: 0, color: '#67e8f9', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '12px' }}>
              Frontend Error
            </p>
            <h1 style={{ margin: '12px 0 0', fontSize: '28px', lineHeight: 1.15 }}>Sahifa render bo‘lmadi</h1>
            <p style={{ margin: '12px 0 0', color: '#cbd5e1', lineHeight: 1.7 }}>
              App ishga tushishda xatolik berdi. Console ichidagi eng yuqori qizil xabarni tekshiring.
            </p>
            <pre
              style={{
                margin: '16px 0 0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: 'rgba(2, 6, 23, 0.7)',
                borderRadius: '14px',
                padding: '14px',
                color: '#fda4af',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {this.state.message}
            </pre>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </RootErrorBoundary>
  </StrictMode>,
)
