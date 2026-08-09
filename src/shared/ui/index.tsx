import {
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import {
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";
type BadgeVariant =
  "default" | "success" | "danger" | "warning" | "info" | "primary";
type SelectOption = { value: string | number; label: ReactNode };
// ============================================================
// SHARED UTILITIES
// ============================================================
export function cn(...cls: (string | undefined | false | null)[]) {
  return cls.filter(Boolean).join(" ");
}

let toastDispatch:
  ((msg: string, type?: "success" | "error" | "info") => void) | null = null;
let nextToastId = 0;

export function notify(
  msg: string,
  type: "success" | "error" | "info" = "info",
) {
  toastDispatch?.(msg, type);
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<
    Array<{ id: number; msg: string; type: string }>
  >([]);
  useEffect(() => {
    toastDispatch = (msg, type = "info") => {
      const id = ++nextToastId;
      setToasts((t) => [...t, { id, msg, type }]);
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
    };
  }, []);
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 max-w-xs"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            "px-4 py-3 rounded-xl text-white text-sm shadow-xl flex items-center gap-2",
            t.type === "success"
              ? "bg-primary"
              : t.type === "error"
                ? "bg-red-600"
                : "bg-gray-700",
          )}
        >
          {t.type === "success" ? (
            <CheckCircle size={15} />
          ) : t.type === "error" ? (
            <XCircle size={15} />
          ) : (
            <Info size={15} />
          )}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

export function Btn({
  children,
  variant = "primary",
  size = "md",
  className = "",
  onClick,
  disabled,
  type = "button",
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none";
  const v: Record<ButtonVariant, string> = {
    primary:
      "bg-primary text-primary-foreground hover:opacity-90 active:scale-[.98]",
    secondary:
      "bg-secondary text-secondary-foreground border border-border hover:bg-accent",
    ghost: "text-foreground hover:bg-accent",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground",
  };
  const s: Record<ButtonSize, string> = {
    sm: "px-3 py-1.5 text-xs min-h-[36px]",
    md: "px-4 py-2.5 text-sm min-h-[44px]",
    lg: "px-6 py-3 text-base min-h-[48px]",
    icon: "p-2 min-h-[40px] min-w-[40px]",
  };
  return (
    <button
      type={type}
      className={cn(base, v[variant], s[size], className)}
      onClick={onClick}
      disabled={disabled}
      {...p}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  error,
  children,
  className = "",
  htmlFor,
  errorId,
}: {
  label?: ReactNode;
  error?: ReactNode;
  children: ReactNode;
  className?: string;
  htmlFor?: string;
  errorId?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-foreground"
        >
          {label}
        </label>
      )}
      {children}
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}

export function Input2({
  label,
  error,
  className = "",
  ...p
}: InputHTMLAttributes<HTMLInputElement> & {
  label?: ReactNode;
  error?: ReactNode;
}) {
  const generatedId = useId();
  const id = p.id ?? generatedId;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <Field label={label} error={error} htmlFor={id} errorId={errorId}>
      <input
        className={cn(
          "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary",
          "placeholder:text-muted-foreground text-sm min-h-[44px]",
          Boolean(error) && "border-red-500",
          className,
        )}
        {...p}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
      />
    </Field>
  );
}

export function Select2({
  label,
  options,
  value,
  onChange,
  className = "",
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: ReactNode;
  options: SelectOption[];
}) {
  const id = useId();
  return (
    <Field label={label} htmlFor={id}>
      <select
        id={id}
        value={value}
        onChange={onChange}
        className={cn(
          "w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm min-h-[44px]",
          className,
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

export function Card2({
  children,
  className = "",
  ...rest
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-card text-card-foreground rounded-2xl border border-border p-4 shadow-sm",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function Badge2({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  const v: Record<BadgeVariant, string> = {
    default: "bg-secondary text-secondary-foreground",
    success:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    danger: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    warning:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    info: "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary",
    primary: "bg-primary/10 text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap",
        v[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Modal2({
  open,
  onClose,
  title,
  children,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus first focusable element
    const timer = setTimeout(() => {
      const el = dialogRef.current?.querySelector<HTMLElement>(
        "button,input,textarea,select,[tabindex]:not([tabindex='-1'])",
      );
      el?.focus();
    }, 20);
    // Escape to close
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className={cn(
          "relative bg-card rounded-2xl shadow-2xl border border-border overflow-hidden w-full mx-auto",
          size === "lg" ? "max-w-2xl" : size === "sm" ? "max-w-sm" : "max-w-md",
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 id={titleId} className="text-lg font-bold">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-xl focus-visible:outline-2 focus-visible:outline-primary"
            aria-label="إغلاق"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-5 sm:p-6 max-h-[85vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon: Icon,
  sub,
  primary = false,
}: {
  label: ReactNode;
  value: ReactNode;
  icon: LucideIcon;
  sub?: ReactNode;
  primary?: boolean;
}) {
  return (
    <Card2
      className={cn(
        "flex items-center gap-3",
        primary && "bg-primary text-primary-foreground border-transparent",
      )}
    >
      <div
        className={cn(
          "rounded-xl p-3 shrink-0",
          primary ? "bg-white/20" : "bg-primary/10",
        )}
      >
        <Icon size={20} className={primary ? "text-white" : "text-primary"} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-black leading-none mb-0.5">{value}</div>
        <div
          className={cn(
            "text-xs",
            primary ? "opacity-80" : "text-muted-foreground",
          )}
        >
          {label}
        </div>
        {sub && (
          <div
            className={cn(
              "text-xs mt-0.5",
              primary ? "opacity-70" : "text-muted-foreground",
            )}
          >
            {sub}
          </div>
        )}
      </div>
    </Card2>
  );
}

export function Pager({
  page,
  total,
  onChange,
}: {
  page: number;
  total: number;
  onChange: (page: number) => void;
}) {
  if (total <= 1) return null;
  const pages = Math.min(total, 7);
  return (
    <div className="flex items-center gap-1.5 justify-center mt-4 flex-wrap">
      <Btn
        aria-label="الصفحة السابقة"
        variant="ghost"
        size="sm"
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      >
        <ChevronRight size={14} />
      </Btn>
      {Array.from({ length: pages }, (_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "w-9 h-9 rounded-xl text-sm font-semibold transition-colors",
              p === page
                ? "bg-primary text-primary-foreground"
                : "hover:bg-accent text-foreground",
            )}
          >
            {p}
          </button>
        );
      })}
      {total > 7 && <span className="text-muted-foreground px-1">…</span>}
      <Btn
        aria-label="الصفحة التالية"
        variant="ghost"
        size="sm"
        onClick={() => onChange(page + 1)}
        disabled={page === total}
      >
        <ChevronLeft size={14} />
      </Btn>
    </div>
  );
}
