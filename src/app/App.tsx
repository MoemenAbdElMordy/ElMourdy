import { lazy, Suspense } from "react";
import ErrorBoundary from "./ErrorBoundary";

const PlatformApp = lazy(() => import("../features/platform/PlatformApp"));

function AppLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center" role="status" aria-live="polite">
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto mb-3" />
        <span className="text-sm text-muted-foreground">جارٍ تحميل المنصة…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<AppLoading />}>
        <PlatformApp />
      </Suspense>
    </ErrorBoundary>
  );
}
