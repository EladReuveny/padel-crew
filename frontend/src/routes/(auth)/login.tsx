import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import { authApi } from "../../features/auth/api/auth.api";
import { useAuthStore } from "../../features/auth/store/auth.store";
import { LoginUserDto } from "../../features/auth/types/auth.types";
import { AuthInput } from "../../lib/components/AuthInput";
import { Button } from "../../lib/components/Button";
import { handleError } from "../../lib/utils/utils";

const loginSchema = z.object({
  email: z.email("אנא הזן כתובת אימייל תקינה."),
  password: z
    .string()
    .min(5, "הסיסמה חייבת להכיל לפחות 5 תווים.")
    .regex(/(?=.*[a-z])(?=.*[A-Z])/, "הסיסמה חייבת להכיל לפחות אות קטנה אחת ואות גדולה אחת."),
});

const searchLoginSchema = z.object({
  redirect: z.string().optional().describe("Where to redirect after login."),
});

export const Route = createFileRoute("/(auth)/login")({
  component: LoginPage,
  validateSearch: searchLoginSchema,
});

function LoginPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();

  const login = useAuthStore((state) => state.login);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onChange: loginSchema,
    },
    onSubmit: async ({ value }) => {
      loginMutation.mutate(value);
    },
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginUserDto) => authApi.login(data),
    onSuccess: (data) => {
      login(data);
      toast.success("התחברת בהצלחה.");
      navigate({
        to: search.redirect ?? "/$username/dashboard",
        params: { username: data.username },
      });
    },
    onError: (err) => handleError(err),
  });

  return (
    <>
      <div className="mb-8">
        <p className="mb-3 text-xs font-semibold tracking-widest text-primary">טוב שחזרת</p>

        <h1 className="text-3xl font-bold tracking-tight text-(--text-clr)">ברוך הבא!</h1>

        <p className="mt-3 text-sm leading-relaxed text-(--text-clr)/55">
          התחבר לחשבון שלך כדי להמשיך לנהל את המשחקים שלך.
        </p>
      </div>

      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="email">
          {(field) => (
            <AuthInput
              label="כתובת אימייל"
              type="email"
              placeholder="you@example.com"
              icon={<Mail size={18} />}
              value={field.state.value}
              onChange={field.handleChange}
              onBlur={field.handleBlur}
              autoComplete="email"
              error={
                field.state.meta.isTouched
                  ? String(field.state.meta.errors[0]?.message ?? "") || undefined
                  : undefined
              }
            />
          )}
        </form.Field>

        <form.Field name="password">
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
        </form.Field>

        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => (
            <Button
              type="submit"
              variant="primary"
              disabled={!canSubmit || isSubmitting}
              className="mt-2 w-full rounded-xl py-3 text-sm font-semibold shadow-lg shadow-primary/20 transition hover:shadow-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "מתחבר..." : "התחברות"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-2 border-t border-(--text-clr)/10 pt-6 text-center text-sm text-(--text-clr)/60">
        עדיין אין לך חשבון?{" "}
        <Link
          to="/register"
          className="font-semibold text-primary transition hover:text-primary/80 hover:underline hover:underline-offset-4"
        >
          צור חשבון
        </Link>
      </div>
    </>
  );
}
