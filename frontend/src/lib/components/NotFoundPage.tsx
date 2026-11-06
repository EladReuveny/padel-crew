import { Link } from "@tanstack/react-router";
import { Button } from "./Button";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-clr) px-6 text-(--text-clr)">
      <div className="max-w-md rounded-3xl border border-(--text-clr)/10 bg-(--text-clr)/5 p-8 text-center shadow-2xl backdrop-blur-sm">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/70">404</p>
        <h1 className="mt-4 text-3xl font-bold text-(--text-clr)">הדף לא נמצא</h1>
        <p className="mt-3 text-sm text-(--text-clr)/70">
          הכתובת שביקשת אינה קיימת או הועברה למקום אחר.
        </p>
        <Link to="/" className="mt-6 block">
          <Button variant="primary">לחזור הביתה</Button>
        </Link>
      </div>
    </div>
  );
}
