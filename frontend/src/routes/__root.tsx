import { QueryClient, useMutation } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { LayoutDashboard, LogOut, UserCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { authApi } from "../features/auth/api/auth.api";
import { useAuthStore } from "../features/auth/store/auth.store";
import { ErrorPage } from "../lib/components/ErrorPage";
import { LoadingScreen } from "../lib/components/LoadingScreen";
import { NotFoundPage } from "../lib/components/NotFoundPage";
import { handleError } from "../lib/utils/utils";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
}>()({
  component: RootLayout,
  errorComponent: ({ error, reset }) => <ErrorPage error={error} reset={reset} />,
  pendingComponent: LoadingScreen,
  notFoundComponent: NotFoundPage,
});

export function RootLayout() {
  const auth = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthRoute = location.pathname === "/login" || location.pathname === "/register";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: (data) => {
      auth.logout();
      toast.info(data.message);
      navigate({ to: "/login" });
    },
    onError: (err) => handleError(err),
  });

  return (
    <div className="min-h-screen bg-(--bg-clr) text-(--text-clr)">
      {!isAuthRoute && (
        <header className="sticky top-0 z-40 border-b border-(--text-clr)/10 bg-(--bg-clr)/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-300 items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
            <Link
              to="/"
              className="flex items-center gap-2.5 sm:gap-3"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <div className="grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full bg-(--primary-clr) text-lg sm:text-xl font-black leading-none text-(--bg-clr)">
                P
              </div>
              <div className="leading-none">
                <p className="text-xl sm:text-2xl font-black tracking-[-0.06em] text-(--text-clr)">
                  Padel Crew
                </p>
                <p className="mt-0.5 sm:text-xs font-light uppercase tracking-[0.12em] text-(--text-clr)/70">
                  ניהול משחקים
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center gap-6 md:flex">
              <nav className="flex items-center gap-6">
                {auth.user ? (
                  <Link
                    to="/$username/dashboard"
                    params={{ username: auth.user.username ?? "" }}
                    className="text-sm font-medium border-b border-transparent hover:border-(--primary-clr)"
                    inactiveProps={{
                      className: "text-(--text-clr)/80",
                    }}
                    activeProps={{
                      className: "text-(--primary-clr)",
                    }}
                  >
                    לוח הבקרה
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    search={{ redirect: "/" }}
                    className="text-sm font-medium border-b border-transparent hover:border-(--primary-clr)"
                    inactiveProps={{
                      className: "text-(--text-clr)/80",
                    }}
                    activeProps={{
                      className: "text-(--primary-clr)",
                    }}
                  >
                    לוח הבקרה
                  </Link>
                )}
              </nav>

              {auth.user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/$username/profile"
                    params={{ username: auth.user.username ?? "" }}
                    className="flex items-center gap-2 rounded-full border border-(--text-clr)/10 bg-(--text-clr)/5 px-3 py-2 text-sm text-(--text-clr)/80 hover:bg-(--text-clr)/10"
                  >
                    <UserCircle2 className="size-4 text-primary" />
                    <span>{auth.user.username ?? "user"}</span>
                  </Link>

                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-right text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 cursor-pointer"
                    onClick={() => logoutMutation.mutate()}
                  >
                    <LogOut className="size-4 text-red-400" />
                    <span>התנתקות</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    to="/login"
                    className="bg-primary text-(--bg-clr) text-sm hover:bg-primary/80 py-1.5 px-2 rounded-full"
                  >
                    התחברות
                  </Link>
                  <Link
                    to="/register"
                    className="flex-1 text-center border border-(--primary-clr)/30 hover:border-(--primary-clr)/50 text-(--primary-clr) hover:bg-(--text-clr)/10 py-1.5 px-2 rounded-full"
                  >
                    הרשמה
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Actions: Dashboard & Menubar Toggle */}
            <div className="flex items-center gap-2.5 md:hidden">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="group cursor-pointer p-1"
                aria-label="פתח תפריט"
                aria-expanded={isMobileMenuOpen}
              >
                <div className="relative space-y-1">
                  <div
                    className={`w-4 h-0.5 bg-(--text-clr)/75 group-hover:bg-(--text-clr) ${isMobileMenuOpen ? "rotate-45 translate-y-1.5" : ""}`}
                  />
                  <div
                    className={`w-4 h-0.5 bg-(--text-clr)/75 group-hover:bg-(--text-clr) ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}
                  />
                  <div
                    className={`w-4 h-0.5 bg-(--text-clr)/75 group-hover:bg-(--text-clr) ${isMobileMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`}
                  />
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menubar Dropdown */}
          {isMobileMenuOpen && (
            <div className="border-t border-(--text-clr)/10 bg-(--bg-clr)/95 p-4 backdrop-blur-md md:hidden">
              <nav className="flex flex-col gap-2">
                {auth.user ? (
                  <>
                    <div className="mb-2 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/10 p-3">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/20 text-primary">
                        <UserCircle2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-primary/80">מחובר כ-</p>
                        <p className="truncate text-sm font-semibold text-(--text-clr)">
                          {auth.user.username}
                        </p>
                      </div>
                    </div>

                    <Link
                      to="/$username/dashboard"
                      params={{ username: auth.user.username ?? "" }}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-(--text-clr)/80 hover:bg-(--text-clr)/5 hover:text-(--text-clr)"
                      activeProps={{
                        className: "bg-primary/15 text-primary font-semibold",
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4 text-primary" />
                      <span>לוח הבקרה</span>
                    </Link>

                    <Link
                      to="/$username/profile"
                      params={{ username: auth.user.username ?? "" }}
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-(--text-clr)/80 hover:bg-(--text-clr)/5 hover:text-(--text-clr)"
                      activeProps={{
                        className: "bg-primary/15 text-primary font-semibold",
                      }}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <UserCircle2 className="h-4 w-4 text-primary" />
                      <span>פרופיל אישי</span>
                    </Link>

                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-right text-sm font-medium text-red-400 hover:bg-red-500/10 border border-red-500/30 hover:border-red-500/50 cursor-pointer"
                      onClick={() => logoutMutation.mutate()}
                    >
                      <LogOut className="size-4 text-red-400" />
                      <span>התנתקות</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/"
                      className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-(--text-clr)/80 hover:bg-(--text-clr)/5 hover:text-(--text-clr)"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <span>עמוד הבית</span>
                    </Link>

                    <div className="my-2 border-t border-(--text-clr)/10" />

                    <div className="flex items-center gap-2 mt-1">
                      <Link
                        to="/login"
                        className="flex-1 text-center bg-primary text-(--bg-clr) hover:bg-primary/80 py-1.5 px-2 rounded-full"
                      >
                        התחברות
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 text-center border border-(--primary-clr)/30 hover:border-(--primary-clr)/50 text-(--primary-clr) hover:bg-(--text-clr)/10 py-1.5 px-2 rounded-full"
                      >
                        הרשמה
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </div>
          )}
        </header>
      )}

      <main className={!isAuthRoute ? "mx-auto max-w-300 px-4 py-8 sm:px-6" : ""}>
        <Outlet />
      </main>
    </div>
  );
}
