import { Link } from "@tanstack/react-router";
import { CalendarDays, Lock, LogIn, MapPin, Users } from "lucide-react";
import { useAuthStore } from "../../features/auth/store/auth.store";
import { GameWithPlayers } from "../../features/games/types/games.types";
import { Button } from "./Button";

type GameCardProps = {
  game: GameWithPlayers;
  onJoin: (gameId: string) => void;
  index: number;
};

export function GameCard({ game, onJoin, index }: GameCardProps) {
  const user = useAuthStore((state) => state.user);

  const gameStatus = game.status.toLowerCase().replace(/_/g, " ");

  return (
    <Link
      to={`/games/$gameId`}
      params={{ gameId: game.id }}
      className="group flex h-full cursor-pointer flex-col rounded-3xl border border-(--primary-clr)/10 bg-(--bg-clr)/50 p-5 hover:border-primary/50 hover:bg-(--primary-clr)/15"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.25em] text-primary/70">
            {gameStatus[0].toUpperCase() + gameStatus.slice(1)}
          </p>

          <h3 className="mt-2 text-xl font-semibold text-(--text-clr)">
            {game.title || `משחק פאדל #${index + 1}`}
          </h3>
        </div>
        <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          {game.players.length} שחקנים
        </span>
      </div>

      <div className="mt-5 space-y-3 text-sm text-(--text-clr)/70">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary/70" />
          {game.location}
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-primary/70" />
          {new Date(game.date).toLocaleString("he-IL", {
            year: "numeric",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          })}
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-primary/70" />
          מארח: {game.creator?.username ?? "לא ידוע"}
        </div>
      </div>

      <div className="mt-5 flex gap-3 pt-5">
        <Button
          type="button"
          variant="primary"
          className="flex-1"
          onClick={(e) => {
            e.preventDefault();
            onJoin(game.id);
          }}
        >
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <LogIn className="size-4" />
                הצטרף למשחק
              </>
            ) : (
              <>
                <Lock className="size-4" />
                התחבר כדי להצטרף
              </>
            )}
          </div>
        </Button>
      </div>
    </Link>
  );
}
