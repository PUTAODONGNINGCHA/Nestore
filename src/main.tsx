// Polyfills for pdfjs-dist v5 — Safari 旧版本不支持这些较新的 API
if (!(Promise as any).withResolvers) {
  (Promise as any).withResolvers = function () {
    let resolve: (value: unknown) => void
    let reject: (reason?: unknown) => void
    const promise = new Promise<unknown>((res, rej) => { resolve = res; reject = rej })
    return { promise, resolve: resolve!, reject: reject! }
  }
}
if (!(URL as any).parse) {
  (URL as any).parse = function (url: string, base?: string) {
    try { return new URL(url, base) } catch { return null }
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
