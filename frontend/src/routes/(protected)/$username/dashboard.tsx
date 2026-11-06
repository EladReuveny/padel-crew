import { useForm } from "@tanstack/react-form";
import { queryOptions, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { CalendarDays, Gamepad2, MapPin, PlusCircle, Trophy, Users } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "react-toastify";
import { z } from "zod";
import { useAuthStore } from "../../../features/auth/store/auth.store";
import { gamesApi } from "../../../features/games/api/games.api";
import type {
  CreateGameDto,
  GameWithCreatorAndPlayers,
} from "../../../features/games/types/games.types";
import { usersApi } from "../../../features/users/api/users.api";
import { Button } from "../../../lib/components/Button";
import { GameSummaryCard } from "../../../lib/components/GameSummaryCard";
import { handleError } from "../../../lib/utils/utils";

const createGameSchema = z.object({
  title: z.string().optional(),
  location: z.string().trim().min(1, "אנא ספק מיקום."),
  date: z
    .date()
    .optional()
    .refine((value) => !value || !Number.isNaN(value.getTime()), "אנא הזן תאריך תקין."),
});

type CreateGameFormValues = z.infer<typeof createGameSchema>;

type DisplayMode = "my-games" | "created-games";

const displayModes: {
  label: string;
  description: string;
  value: DisplayMode;
  Icon: LucideIcon;
}[] = [
  {
    label: "המשחקים שלי",
    description: "משחקים שבהם אני משתתף",
    value: "my-games",
    Icon: Users,
  },
  {
    label: "המשחקים שיצרתי",
    description: "משחקים שאני מנהל",
    value: "created-games",
    Icon: Trophy,
  },
];

const getMyGamesQuery = queryOptions<
  (Omit<GameWithCreatorAndPlayers, "creator"> & {
    creator?: GameWithCreatorAndPlayers["creator"];
  })[]
>({
  queryKey: ["me", "games"],
  queryFn: () => usersApi.getMyGames(),
});

const getMyCreatedGamesQuery = queryOptions<
  (Omit<GameWithCreatorAndPlayers, "creator"> & {
    creator?: GameWithCreatorAndPlayers["creator"];
  })[]
>({
  queryKey: ["me", "created-games"],
  queryFn: () => usersApi.getMyCreatedGames(),
});

export const Route = createFileRoute("/(protected)/$username/dashboard")({
  loader: async ({ context }) => {
    await context.queryClient.query({
      ...getMyGamesQuery,
    });
  },
  component: DashboardPage,
});

function DashboardPage() {
  const user = useAuthStore((state) => state.user)!;
  const queryClient = useQueryClient();

  const [displayMode, setDisplayMode] = useState<DisplayMode>("my-games");

  const dateInputRef = useRef<HTMLInputElement | null>(null);

  const activeModeItem = displayModes.find((mode) => mode.value === displayMode) ?? displayModes[0];

  const { data: games } = useQuery(
    activeModeItem.value === "my-games" ? getMyGamesQuery : getMyCreatedGamesQuery,
  );

  const createGameMutation = useMutation({
    mutationFn: (data: CreateGameDto) => gamesApi.create(data),

    onSuccess: async () => {
      toast.success("המשחק נוצר בהצלחה.");

      form.reset();

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["me"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["games"],
        }),
      ]);
    },
    onError: (err) => handleError(err),
  });

  const removePlayerMutation = useMutation({
    mutationFn: ({ gameId, playerId }: { gameId: string; playerId: string }) =>
      gamesApi.removePlayerFromGame(gameId, playerId),
    onSuccess: async (data) => {
      toast.success(data.message);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["me"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["games"],
        }),
      ]);
    },
    onError: (err) => handleError(err),
  });

  const deleteGameMutation = useMutation({
    mutationFn: (gameId: string) => gamesApi.delete(gameId),

    onSuccess: async (data) => {
      toast.success(data.message);

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["me"],
        }),
        queryClient.invalidateQueries({
          queryKey: ["games"],
        }),
      ]);
    },
    onError: (err) => handleError(err),
  });

  const form = useForm({
    defaultValues: {
      title: "",
      location: "",
      date: new Date(),
    } as CreateGameFormValues,

    validators: {
      onChange: createGameSchema,
      onSubmit: createGameSchema,
    },

    onSubmit: async ({ value }) => {
      createGameMutation.mutate({
        title: value.title?.trim(),
        location: value.location.trim(),
        date: value.date,
      });
    },
  });

  const openDatePicker = () => {
    try {
      dateInputRef.current?.showPicker?.();
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-primary/20 bg-linear-to-r from-(--bg-clr) via-(--bg-clr) to-primary/40 p-6 shadow-[0_25px_80px_rgba(2,6,23,0.8)]">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.35em] text-primary/70">לוח בקרה</p>

            <h1 className="mt-3 text-3xl font-bold text-(--text-clr)">
              שלום שוב, {user.username ?? "שחקן"}
            </h1>

            <p className="mt-2 text-sm text-(--text-clr)/70">
              המגרשים, השחקנים ולוח המשחקים שלך כולם במקום אחד.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary/80">
              {user.role ?? "USER"}
            </div>

            {user.email && (
              <div className="rounded-xl border border-(--text-clr)/10 bg-(--text-clr)/5 px-3 py-2 text-sm text-(--text-clr)/80">
                {user.email}
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[1fr_1.4fr]">
        <section className="h-fit rounded-3xl border border-(--text-clr)/10 bg-(--bg-clr) p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <PlusCircle className="h-5 w-5 text-primary" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-(--text-clr)">צור משחק</h2>

              <p className="mt-0.5 text-xs text-(--text-clr)/50">הזמן שחקנים והתחל משחק חדש</p>
            </div>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field name="title">
              {(field) => (
                <div>
                  <label
                    htmlFor="game-title"
                    className="mb-2 block text-sm font-medium text-(--text-clr)/70"
                  >
                    כותרת המשחק
                  </label>

                  <input
                    id="game-title"
                    name={field.name}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={field.state.meta.isTouched && field.state.meta.errors.length > 0}
                    className="w-full rounded-xl border border-(--text-clr)/20 bg-(--bg-clr) px-3 py-2.5 text-sm text-(--text-clr) outline-none transition placeholder:text-(--text-clr)/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    placeholder="משחק בראשון בערב"
                  />

                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-xs text-red-400">
                      {(field.state.meta.errors[0] as Error).message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="location">
              {(field) => (
                <div>
                  <label
                    htmlFor="game-location"
                    className="mb-2 block text-sm font-medium text-(--text-clr)/70"
                  >
                    מיקום
                  </label>

                  <div className="relative">
                    <input
                      id="game-location"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={
                        field.state.meta.isTouched && field.state.meta.errors.length > 0
                      }
                      className="w-full rounded-xl border border-(--text-clr)/20 bg-(--bg-clr) py-2.5 pr-10 pl-3 text-sm text-(--text-clr) outline-none transition placeholder:text-(--text-clr)/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      placeholder="ספורטק פתח תקווה"
                    />

                    <MapPin className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-clr)/40" />
                  </div>

                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-xs text-red-400">
                      {(field.state.meta.errors[0] as Error).message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="date">
              {(field) => (
                <div>
                  <label
                    htmlFor="game-date"
                    className="mb-2 block text-sm font-medium text-(--text-clr)/70"
                  >
                    תאריך ושעה
                  </label>

                  <div className="relative">
                    <input
                      ref={dateInputRef}
                      id="game-date"
                      name={field.name}
                      type="datetime-local"
                      value={
                        field.state.value
                          ? new Date(
                              field.state.value.getTime() -
                                field.state.value.getTimezoneOffset() * 60000,
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.value ? new Date(e.target.value) : undefined)
                      }
                      aria-invalid={
                        field.state.meta.isTouched && field.state.meta.errors.length > 0
                      }
                      className="w-full cursor-pointer rounded-xl border border-(--text-clr)/20 bg-(--bg-clr) py-2.5 pr-11 pl-3 text-sm text-(--text-clr) outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 [&::-webkit-calendar-picker-indicator]:opacity-0"
                      onClick={openDatePicker}
                    />

                    <button
                      type="button"
                      onClick={openDatePicker}
                      aria-label="פתח בורר תאריך"
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md text-(--text-clr)/60 transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <CalendarDays size={19} />
                    </button>
                  </div>

                  {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
                    <p className="mt-2 text-xs text-red-400">
                      {(field.state.meta.errors[0] as Error).message}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting || createGameMutation.isPending}
                >
                  {isSubmitting || createGameMutation.isPending ? "יוצר משחק..." : "צור משחק"}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </section>

        {/* Games section */}

        <section className="min-w-0 space-y-5">
          {/* Display mode selector */}

          <div className="rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr) p-3">
            <div className="mb-3 px-2 pt-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-(--text-clr)/50">
                תצוגת משחקים
              </p>

              <p className="mt-1 text-xs text-(--text-clr)/40">בחר אילו משחקים להציג</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {displayModes.map(({ label, description, value, Icon }) => {
                const isActive = displayMode === value;

                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setDisplayMode(value)}
                    aria-pressed={isActive}
                    className={`
                        group flex min-w-0 flex-col items-start gap-3
                        rounded-xl border p-4 text-right cursor-pointer
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                        ${
                          isActive
                            ? "border-primary/40 bg-primary/10 shadow-sm shadow-primary/10"
                            : "border-transparent bg-(--text-clr)/3 hover:border-(--text-clr)/15 hover:bg-(--text-clr)/5"
                        }
                      `}
                  >
                    <div
                      className={`
                          flex h-10 w-10 items-center justify-center
                          rounded-xl transition-colors
                          ${
                            isActive
                              ? "bg-primary text-white"
                              : "bg-(--text-clr)/5 text-(--text-clr)/60 group-hover:text-primary"
                          }
                        `}
                    >
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0 space-y-1">
                      <p
                        className={`text-sm font-semibold ${
                          isActive ? "text-primary" : "text-(--text-clr)"
                        }`}
                      >
                        {label}
                      </p>

                      <p className="text-xs leading-relaxed text-(--text-clr)/50">{description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active games collection */}

          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-5">
            {/* Section heading */}

            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-(--bg-clr)/70">
                  <activeModeItem.Icon className="size-5 text-primary" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-(--text-clr)">
                    {activeModeItem.label}
                  </h2>

                  <p className="mt-0.5 text-xs text-(--text-clr)/50">{games?.length} משחקים</p>
                </div>
              </div>
            </div>

            {games?.length === 0 ? (
              /* Empty state */

              <div className="rounded-2xl border border-dashed border-(--text-clr)/20 bg-(--bg-clr)/40 px-5 py-10 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-(--text-clr)/5">
                  <Gamepad2 className="h-6 w-6 text-(--text-clr)/40" />
                </div>

                <p className="text-sm font-medium text-(--text-clr)/80">
                  {displayMode === "created-games"
                    ? "עדיין לא יצרת משחקים."
                    : "אין לך משחקים פעילים כרגע."}
                </p>

                <p className="mt-2 text-xs text-(--text-clr)/45">
                  המשחקים שלך יופיעו כאן לאחר שתצטרף או תיצור משחק.
                </p>
              </div>
            ) : (
              /* Games list */

              <div className="space-y-5">
                {games?.map((game) => (
                  <GameSummaryCard
                    key={game.id}
                    game={game}
                    currentUserId={user.id}
                    onDelete={(gameId: string) => deleteGameMutation.mutate(gameId)}
                    onRemovePlayer={(gameId: string, playerId: string) =>
                      removePlayerMutation.mutate({ gameId, playerId })
                    }
                    deleting={deleteGameMutation.isPending}
                    removingPlayerId={
                      removePlayerMutation.isPending
                        ? removePlayerMutation.variables?.playerId
                        : undefined
                    }
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
