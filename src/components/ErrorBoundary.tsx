import { Component, type ErrorInfo, type ReactNode } from 'react'
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false }
  static getDerivedStateFromError() {
    return { error: true }
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ModelValue Radar render error', error.message, info.componentStack)
  }
  render() {
    return this.state.error ? (
      <main className="fatal-error">
        <h1>Something went wrong / 页面遇到错误</h1>
        <p>
          Reload to recover. Your catalog was not uploaded or persisted.
          <br />
          请刷新页面重试。模型目录未上传或持久化保存。
        </p>
        <button className="button button-primary" onClick={() => location.reload()}>
          Reload / 刷新
        </button>
      </main>
    ) : (
      this.props.children
    )
  }
}
