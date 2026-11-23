import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export async function loadLeaderboard() {
  return getJson<Record<string, unknown>>('/api/leaderboard');
}

export default function Leaderboard() {
  return (
    <CapabilityCard
      title="Leaderboard"
      description="Compare team point totals."
      loadItems={loadLeaderboard}
      itemsKey="leaderboard"
      emptyText="No leaderboard rankings or scores yet."
      renderItem={(item) => {
        const entry = item as { rank?: number; teamName?: string; totalPoints?: number };
        return `${entry.rank ? `${entry.rank}. ` : ''}${entry.teamName ?? 'Team'} - ${entry.totalPoints ?? 0} points`;
      }}
    />
  );
}
