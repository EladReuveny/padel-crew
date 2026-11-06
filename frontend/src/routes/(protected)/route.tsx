import { queryOptions } from "@tanstack/react-query";
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { toast } from "react-toastify";
import { authApi } from "../../features/auth/api/auth.api";

const getMeQuery = queryOptions({
  queryFn: () => authApi.getMe(),
  queryKey: ["me"],
});

export const Route = createFileRoute("/(protected)")({
  beforeLoad: async ({ context, location }) => {
    try {
      const user = await context.queryClient.query(getMeQuery);

      if (!user) {
        throw new Error();
      }
    } catch {
      toast.info("עלייך להתחבר קודם");
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
