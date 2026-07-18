import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error("Unhandled UI error", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-6" dir="rtl">
        <section role="alert" className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <h1 className="text-xl font-black mb-2">حدث خطأ غير متوقع</h1>
          <p className="text-sm text-muted-foreground mb-5">تعذر عرض الصفحة. يمكنك إعادة تحميل التطبيق والمحاولة مرة أخرى.</p>
          <button className="min-h-11 rounded-xl bg-primary px-5 py-2.5 font-bold text-primary-foreground" onClick={() => window.location.reload()}>
            إعادة تحميل الصفحة
          </button>
        </section>
      </main>
    );
  }
}
