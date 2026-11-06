export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-(--bg-clr) text-(--text-clr)">
      <div className="flex items-center gap-4 rounded-full border border-(--text-clr)/10 bg-(--text-clr)/5 px-5 py-3 backdrop-blur-sm">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm font-medium tracking-[0.2em] text-(--text-clr)/70 uppercase">
          Loading
        </span>
      </div>
    </div>
  );
}
