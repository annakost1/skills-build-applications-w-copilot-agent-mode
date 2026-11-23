import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export async function loadTeams() {
  return getJson<Record<string, unknown>>('/api/teams');
}

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      loadItems={loadTeams}
      itemsKey="teams"
      emptyText="No teams found."
      renderItem={(item) => {
        const team = item as { name?: string; members?: unknown[] };
        const memberCount = Array.isArray(team.members) ? team.members.length : 0;
        return `${team.name ?? 'Team'}${memberCount ? ` - ${memberCount} member${memberCount === 1 ? '' : 's'}` : ''}`;
      }}
    />
  );
}
