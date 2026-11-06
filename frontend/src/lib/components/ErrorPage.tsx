import { ErrorComponentProps, Link } from "@tanstack/react-router";
import { Button } from "./Button";
import { TriangleAlert } from "lucide-react";

export function ErrorPage({ error, reset }: ErrorComponentProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-clr) px-6 text-(--text-clr)">
      <div className="max-w-md rounded-3xl border border-red-500/30 bg-red-500/10 p-8 text-center shadow-2xl backdrop-blur-sm">
        <TriangleAlert className="size-6 text-red-500 mx-auto" />
        <p className="mt-3 text-sm font-medium uppercase tracking-[0.3em] text-red-500">שגיאה</p>
        <h1 className="mt-1 text-3xl font-bold text-(--text-clr)">משהו השתבש</h1>

        {import.meta.env.NODE_ENV === "development" && (
          <pre className="mt-2 text-xs text-red-400 bg-black/20 p-2 rounded overflow-auto max-h-32 text-left">
            {(error as Error).message || String(error)}
          </pre>
        )}

        <p className="mt-3 text-sm text-(--text-clr)/70">אירעה בעיה בלתי צפויה בטעינת התצוגה.</p>

        <div className="mt-6 flex flex-col gap-2">
          {reset && (
            <Button variant="primary" className="w-full" onClick={() => reset()}>
              נסה שוב
            </Button>
          )}

          <Link to="/">
            <Button variant="secondary" className="w-full">
              חזרה הביתה
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
