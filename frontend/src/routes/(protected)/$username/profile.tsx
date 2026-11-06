import { useForm } from "@tanstack/react-form";
import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { KeyRound, LockKeyhole, ShieldAlert, UserCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import { authApi } from "../../../features/auth/api/auth.api";
import { useAuthStore } from "../../../features/auth/store/auth.store";
import { usersApi } from "../../../features/users/api/users.api";
import { UpdateUserDto } from "../../../features/users/types/users.types";
import { AuthInput } from "../../../lib/components/AuthInput";
import { Button } from "../../../lib/components/Button";
import { LoadingScreen } from "../../../lib/components/LoadingScreen";
import { handleError } from "../../../lib/utils/utils";

const updateUserSchema = z
  .object({
    password: z
      .string()
      .min(5, "הסיסמה חייבת להכיל לפחות 5 תווים.")
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, "הסיסמה חייבת להכיל לפחות אות קטנה אחת ואות גדולה אחת."),
    confirmPassword: z
      .string()
      .min(5, "הסיסמה חייבת להכיל לפחות 5 תווים.")
      .regex(/(?=.*[a-z])(?=.*[A-Z])/, "הסיסמה חייבת להכיל לפחות אות קטנה אחת ואות גדולה אחת."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "הסיסמאות חייבות להתאים",
    path: ["confirmPassword"],
  });

const getMeQuery = queryOptions({
  queryFn: () => authApi.getMe(),
  queryKey: ["me"],
});

export const Route = createFileRoute("/(protected)/$username/profile")({
  loader: async ({ context }) => {
    await context.queryClient.query({ ...getMeQuery });
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { data: user, isLoading: isUserLoading } = useSuspenseQuery(getMeQuery);
  const queryClient = useQueryClient();

  const auth = useAuthStore();

  const navigate = useNavigate();

  const updateUserMutation = useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(data),
    onSuccess: (data) => {
      toast.success("החשבון עודכן בהצלחה.");
      updateUserForm.reset();
      auth.user = data;
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => handleError(err),
  });

  const updateUserForm = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    } as z.infer<typeof updateUserSchema>,
    validators: {
      onChange: updateUserSchema,
      onSubmit: updateUserSchema,
    },
    onSubmit: ({ value }) => {
      updateUserMutation.mutate(value);
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: () => usersApi.delete(),
    onSuccess: (data) => {
      toast.success(data.message);
      navigate({ to: "/" });
      auth.logout();
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (err) => handleError(err),
  });

  if (isUserLoading) return <LoadingScreen />;

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_1.2fr]">
      {/* Profile information */}
      <section className="rounded-[28px] border border-(--text-clr)/10 bg-(--bg-clr) p-6 shadow-[0_25px_80px_rgba(2,6,23,0.7)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary/70">
            <UserCircle2 className="h-5 w-5" />
          </div>

          <h1 className="text-2xl font-bold text-(--text-clr)">פרופיל</h1>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr) p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-(--text-clr)/60">שם משתמש</p>
            <p className="mt-2 text-lg font-semibold text-(--text-clr)">{user.username}</p>
          </div>

          <div className="rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr) p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-(--text-clr)/60">אימייל</p>
            <p className="mt-2 text-lg font-semibold text-(--text-clr)">{user.email}</p>
          </div>

          <div className="rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr) p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-(--text-clr)/60">תפקיד</p>
            <p className="mt-2 text-lg font-semibold capitalize text-(--text-clr)">
              {user.role.toLowerCase()}
            </p>
          </div>
        </div>
      </section>

      {/* Account settings */}
      <section className="rounded-[28px] border border-(--text-clr)/10 bg-(--bg-clr) p-6 shadow-[0_25px_80px_rgba(2,6,23,0.7)]">
        <div className="mb-6 flex items-center gap-3">
          <div className="rounded-2xl bg-primary/10 p-2 text-primary/70">
            <KeyRound className="h-5 w-5" />
          </div>

          <h2 className="text-2xl font-bold text-(--text-clr)">עדכון סיסמה</h2>
        </div>

        {/* Update password form */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateUserForm.handleSubmit();
          }}
        >
          <updateUserForm.Field name="password">
            {(field) => (
              <AuthInput
                label="סיסמה"
                type="password"
                placeholder="*******"
                icon={<LockKeyhole size={18} />}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                autoComplete="password"
                error={
                  field.state.meta.isTouched
                    ? String(field.state.meta.errors[0]?.message ?? "") || undefined
                    : undefined
                }
              />
            )}
          </updateUserForm.Field>

          <updateUserForm.Field name="confirmPassword">
            {(field) => (
              <AuthInput
                label="אימות סיסמה"
                type="password"
                placeholder="*******"
                icon={<LockKeyhole size={18} />}
                value={field.state.value}
                onChange={field.handleChange}
                onBlur={field.handleBlur}
                autoComplete="password"
                error={
                  field.state.meta.isTouched
                    ? String(field.state.meta.errors[0]?.message ?? "") || undefined
                    : undefined
                }
              />
            )}
          </updateUserForm.Field>

          <updateUserForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={!canSubmit || isSubmitting}
              >
                {isSubmitting ? "שומר..." : "עדכון סיסמה"}
              </Button>
            )}
          </updateUserForm.Subscribe>
        </form>

        {/* Delete account */}
        <div className="mt-8 border-t border-(--text-clr)/10 pt-6">
          <div className="mb-4 flex items-center gap-3 text-red-500">
            <ShieldAlert className="size-5" />
            <h3 className="text-lg font-semibold text-(--text-clr)">אזור מסוכן</h3>
          </div>

          <Button
            type="button"
            variant="danger"
            className="w-full"
            disabled={deleteUserMutation.isPending}
            onClick={() => deleteUserMutation.mutate()}
          >
            {deleteUserMutation.isPending ? "מוחק חשבון..." : "מחק את החשבון שלי"}
          </Button>
        </div>
      </section>
    </div>
  );
}
