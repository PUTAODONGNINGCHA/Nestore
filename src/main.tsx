// Polyfill for pdfjs-dist v5 — Safari < 18.2 不支持 Promise.withResolvers
if (!(Promise as any).withResolvers) {
  (Promise as any).withResolvers = function () {
    let resolve: (value: unknown) => void
    let reject: (reason?: unknown) => void
    const promise = new Promise<unknown>((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve: resolve!, reject: reject! }
  }
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
