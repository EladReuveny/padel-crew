import { Link } from "@tanstack/react-router";
import { CalendarDays, MapPin, Trash2, Trophy, UserMinus, Users } from "lucide-react";
import { GameWithCreatorAndPlayers } from "../../features/games/types/games.types";
import { Button } from "./Button";

type GameSummaryCardProps = {
  game: Omit<GameWithCreatorAndPlayers, "creator"> & {
    creator?: GameWithCreatorAndPlayers["creator"];
  };
  currentUserId?: string;
  onDelete: (gameId: string) => void;
  onRemovePlayer: (gameId: string, playerId: string) => void;
  deleting: boolean;
  removingPlayerId?: string;
};

export function GameSummaryCard({
  game,
  currentUserId,
  onDelete,
  onRemovePlayer,
  deleting,
  removingPlayerId,
}: GameSummaryCardProps) {
  const isCreator = game.creatorId === currentUserId || game.creator?.id === currentUserId;
  const gameStatus = game.status.toLowerCase().replace(/_/g, " ");

  return (
    <Link
      to="/games/$gameId"
      params={{ gameId: game.id }}
      className="group flex h-full flex-col rounded-3xl border border-(--primary-clr)/50 bg-(--bg-clr)/50 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.12)] hover:border-primary/50 hover:bg-(--primary-clr)/10"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.25em] text-primary/70 capitalize">{gameStatus}</p>
          <h3 className="mt-2 text-xl font-semibold text-(--text-clr)">
            {game.title || "משחק פאדל"}
          </h3>
        </div>

        <div className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
          {game.players.length} שחקנים
        </div>
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
          <Trophy className="h-4 w-4 text-primary/70" />
          מארח: {game.creator?.username ?? "אתה"}
        </div>
      </div>

      {isCreator && (
        <div className="mt-5 flex flex-wrap gap-3 pt-4">
          <Button
            type="button"
            variant="danger"
            className="inline-flex items-center gap-2"
            disabled={deleting}
            onClick={() => onDelete(game.id)}
          >
            <Trash2 className="h-4 w-4" />
            {deleting ? "מוחק..." : "מחק משחק"}
          </Button>
        </div>
      )}

      <div className="mt-5 rounded-2xl border border-(--text-clr)/10 bg-(--bg-clr) p-4">
        <div className="mb-4 flex items-center gap-2 text-(--text-clr)">
          <Users className="h-5 w-5 text-primary/70" />
          <h3 className="text-lg font-semibold">שחקנים</h3>
        </div>

        {game.players.length === 0 ? (
          <p className="text-sm text-(--text-clr)/60">עוד אין שחקנים</p>
        ) : (
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

                {isCreator && player.id !== game.creatorId && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    className="inline-flex items-center gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      onRemovePlayer(game.id, player.id);
                    }}
                    disabled={removingPlayerId === player.id}
                  >
                    <UserMinus className="h-3.5 w-3.5" />
                    {removingPlayerId === player.id ? "מסיר..." : "הסר"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
