import { CapabilityCard } from './CapabilityCard.js';

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      endpoint="/api/leaderboard"
      itemsKey="leaderboard"
      emptyText="No leaderboard rankings or scores yet."
      renderItem={(item) => {
        const entry = item as { rank?: number; teamName?: string; totalPoints?: number };
        return `${entry.rank ? `${entry.rank}. ` : ''}${entry.teamName ?? 'Team'} - ${entry.totalPoints ?? 0} points`;
      }}
    />
  );
}
