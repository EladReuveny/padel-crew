import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { CalendarDays, Lock, LogIn, LucideIcon, MapPin, Trophy, Users } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../features/auth/store/auth.store";
import { gamesApi } from "../../features/games/api/games.api";
import { Button } from "../../lib/components/Button";
import { handleError } from "../../lib/utils/utils";

const findGameByIdQuery = (gameId: string) =>
  queryOptions({
    queryKey: ["game", gameId],
    queryFn: () => gamesApi.findById(gameId),
    enabled: !!gameId,
  });

export const Route = createFileRoute("/games/$gameId")({
  loader: async ({ context, params }) => {
    const { gameId } = params;
    try {
      const game = await context.queryClient.query(findGameByIdQuery(gameId));

      if (!game) throw new Error();
    } catch (err) {
      handleError(err);
      throw notFound();
    }
  },
  component: GameDetailsPage,
});

function GameDetailsPage() {
  const { gameId } = Route.useParams();
  const queryClient = useQueryClient();

  const user = useAuthStore((state) => state.user);

  const { data: game } = useSuspenseQuery(findGameByIdQuery(gameId));

  const joinPlayerToGameMutation = useMutation({
    mutationFn: (gameId: string) => gamesApi.joinPlayerToGame(gameId),
    onSuccess: (_data) => {
      toast.success("ניפגש על המגרש יא חרבן");
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ["games"] }),
        queryClient.invalidateQueries({ queryKey: ["me"] }),
      ]);
    },
    onError: (err) => handleError(err),
  });

  const gameDetails: { title: string; Icon: LucideIcon; value: string }[] = [
    { title: "מיקום", Icon: MapPin, value: game.location },
    {
      title: "מתי",
      Icon: CalendarDays,
      value: new Date(game.date as Date).toLocaleString("he-IL", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        hour12: false,
      }),
    },
    {
      title: "יוצר",
      Icon: Trophy,
      value: game.creator?.username ?? "",
    },
  ];

  return (
    <div className="rounded-3xl border border-(--text-clr)/10 bg-(--bg-clr) p-6">
      <div className="flex flex-col gap-4 border-b border-(--text-clr)/10 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-primary/70">משחק</p>

          <h1 className="mt-2 text-3xl font-bold text-(--text-clr)">{game.title || "משחק פאדל"}</h1>
        </div>

        <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-semibold capitalize tracking-[0.2em] text-primary/80">
          {game.status.toLowerCase().replace(/_/g, " ")}
        </span>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {gameDetails.map(({ title, Icon, value }, i) => (
          <div
            key={`game-details-${i}`}
            className="rounded-2xl border border-(--text-clr)/20 bg-(--bg-clr) p-4"
          >
            <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-(--text-clr)/60">
              <Icon className="size-4" />
              {title}
            </div>
            <p className="text-sm text-(--text-clr)">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {user ? (
          <Button
            type="button"
            variant="primary"
            className="inline-flex items-center gap-2"
            onClick={() => joinPlayerToGameMutation.mutate(gameId)}
          >
            <LogIn className="size-4" /> הצטרף למשחק
          </Button>
        ) : (
          <Link to="/login" search={{ redirect: `/games/${gameId}` }}>
            <Button type="button" variant="primary" className="inline-flex items-center gap-2">
              <Lock className="size-4" /> התחבר כדי להצטרף
            </Button>
          </Link>
        )}

        <Link
          to="/"
          className="inline-flex items-center rounded-xl border border-(--text-clr)/10 bg-(--text-clr)/5 px-4 py-2.5 text-sm font-medium text-(--text-clr)/80 transition hover:bg-(--text-clr)/10"
        >
          חזרה למשחקים
        </Link>
      </div>

      <div className="mt-8 rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr) p-4">
        <div className="mb-4 flex items-start justify-between gap-2 text-(--text-clr)">
          <div className="flex items-center gap-2">
            <Users className="size-5 text-primary/70" />
            <h3 className="text-lg font-semibold">שחקנים</h3>
          </div>

          <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
            {game.players.length} שחקנים
          </span>
        </div>

        <div className="space-y-3">
          {game.players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between rounded-xl border border-(--text-clr)/10 bg-(--bg-clr) px-3 py-2"
            >
              <div>
                <p className="text-sm font-medium text-(--text-clr)">{player.username}</p>
                <p className="text-xs text-(--text-clr)/60">{player.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
