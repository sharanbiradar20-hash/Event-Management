"use client";

interface AlertProps {
  type: "error" | "success";
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const styles = {
    error: {
      container:
        "rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 flex items-start gap-2.5",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      ),
    },
    success: {
      container:
        "rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-400 flex items-start gap-2.5",
      icon: (
        <svg
          className="h-5 w-5 shrink-0 mt-0.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  };

  const style = styles[type];

  return (
    <div className={style.container} role="alert" aria-live="polite">
      {style.icon}
      <span>{message}</span>
    </div>
  );
}
