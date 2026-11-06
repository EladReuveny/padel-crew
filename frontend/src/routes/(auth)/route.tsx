import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/(auth)")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--bg-clr) px-4 py-12 sm:px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-1/4 size-96 rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute -bottom-40 left-1/4 size-96 rounded-full bg-primary/25 blur-[120px]" />
      </div>

      <section className="relative w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            aria-label="חזרה לעמוד הבית"
            className="bg-primary rounded-full py-1.5 px-3.5 text-lg font-bold text-(--bg-clr) shadow-lg shadow-primary/20 hover:scale-105"
          >
            P
          </Link>

          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-(--text-clr)/50 transition hover:text-(--text-clr)"
          >
            חזרה לאתר
            <ArrowRight size={16} />
          </Link>
        </div>

        {/* Auth card */}
        <div className="relative overflow-hidden rounded-xl">
          {/* Animated border */}
          <div
            className="absolute top-0 left-0 size-[150%]
    bg-[conic-gradient(from_0deg,transparent_0deg,transparent_280deg,var(--primary-clr)_320deg,#67e8f9_345deg,transparent_360deg)]
     animate-[spin_8s_linear_infinite] blur-sm rounded-xl"
          />

          {/* Auth content */}
          <div className="relative m-px rounded-xl border border-(--text-clr)/10 bg-(--bg-clr) p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-9">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-(--text-clr)/40">
          © {new Date().getFullYear()} כל הזכויות שמורות
        </p>
      </section>
    </main>
  );
}
