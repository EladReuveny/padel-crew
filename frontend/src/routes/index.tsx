import { queryOptions, useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "../features/auth/store/auth.store";
import { gamesApi } from "../features/games/api/games.api";
import { GameCard } from "../lib/components/GameCard";
import { handleError } from "../lib/utils/utils";

const gamesQueryOptions = queryOptions({
  queryKey: ["games"],
  queryFn: () => gamesApi.findAll(),
});

export const Route = createFileRoute("/")({
  component: HomePage,
  loader: async ({ context }) => {
    await context.queryClient.query({ ...gamesQueryOptions });
  },
});

function HomePage() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: gamesData, isLoading: isLoadingGames } = useSuspenseQuery(gamesQueryOptions);

  const joinPlayerToGameMutation = useMutation({
    mutationFn: (gameId: string) => gamesApi.joinPlayerToGame(gameId),
    onSuccess: () => {
      toast.success("ניפגש על המגרש יא חרבן");
      queryClient.invalidateQueries({ queryKey: ["games"] });
    },
    onError: (err) => handleError(err),
  });

  const visibleGames = useMemo(() => {
    const text = search.trim().toLowerCase();
    const games = gamesData ?? [];

    if (!text) {
      return games;
    }

    return games.filter((game) => {
      return (
        game.title?.toLowerCase().includes(text) ||
        game.location.toLowerCase().includes(text) ||
        game.creator?.username?.toLowerCase().includes(text)
      );
    });
  }, [gamesData, search]);

  const handleJoinPlayerToGame = async (gameId: string) => {
    if (!user) {
      toast.info("עליך להתחבר כדי להצטרף למשחק.");
      navigate({
        to: "/login",
        search: { redirect: `/games/${gameId}` },
      });
      return;
    }

    joinPlayerToGameMutation.mutate(gameId);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="mx-auto max-w-[1600px] rounded-2xl sm:rounded-3xl md:rounded-[28px] border border-primary/20 bg-linear-to-r from-(--bg-clr) via-(--bg-clr) to-primary/40 p-4 sm:p-6 md:p-8 shadow-[0_25px_80px_rgba(2,6,23,0.8)]">
        <div className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs sm:text-sm uppercase tracking-[0.25em] sm:tracking-[0.35em] text-primary/70">
              מצא משחקים
            </p>
            <h1 className="mt-2 sm:mt-3 text-2xl sm:text-3xl md:text-4xl font-bold text-(--text-clr)">
              מצא את משחק הפדאל הבא שלך.
            </h1>
            <p className="mt-2 max-w-2xl text-xs sm:text-sm leading-relaxed text-(--text-clr)/70">
              עיין במשחקים הקרובים, ראה מי משחק ו הצטרף למשחקים שמתאימים ללוח הזמנים שלך.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="rounded-xl border border-(--text-clr)/10 bg-(--text-clr)/5 px-2.5 py-1.5 sm:px-3 sm:py-2 text-(--text-clr)/80">
              {gamesData?.length ?? 0} משחקים
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/10 px-2.5 py-1.5 sm:px-3 sm:py-2 text-primary/80">
              {user ? "מחובר" : "משתמש אורח"}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] rounded-2xl sm:rounded-3xl border border-(--text-clr)/10 bg-(--bg-clr) p-4 sm:p-6">
        <div className="mb-4 sm:mb-5 flex items-center gap-2.5 sm:gap-3">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-primary/70" />
          <h2 className="text-lg sm:text-xl font-semibold text-(--text-clr)">עיון במשחקים</h2>
        </div>

        <div className="mb-5 sm:mb-6 flex items-center gap-2.5 sm:gap-3 rounded-xl sm:rounded-2xl border border-(--text-clr)/10 hover:border-(--text-clr)/35 focus-within:border-(--primary-clr) hover:focus-within:border-(--primary-clr) bg-(--bg-clr) px-3.5 py-2.5 sm:px-4 sm:py-3">
          <Search className="h-4 w-4 shrink-0 text-(--text-clr)/60" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חפש לפי כותרת, מיקום או מארגן"
            className="w-full bg-transparent text-xs sm:text-sm text-(--text-clr) outline-none placeholder:text-(--text-clr)/60"
          />
        </div>

        {isLoadingGames ? (
          <div className="rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr)/50 p-6 sm:p-8 text-center text-xs sm:text-sm text-(--text-clr)/60">
            טוען משחקים...
          </div>
        ) : visibleGames.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-(--text-clr)/20 bg-(--bg-clr)/50 p-6 sm:p-8 text-center text-xs sm:text-sm text-(--text-clr)/60">
            אין משחקים שמתאימים לחיפוש שלך כרגע.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visibleGames.map((game, i) => (
              <GameCard key={game.id} game={game} onJoin={handleJoinPlayerToGame} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
