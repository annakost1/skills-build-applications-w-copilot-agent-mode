import { CapabilityCard } from './CapabilityCard.js';

export default function Teams() {
  return (
    <CapabilityCard
      title="Teams"
      description="Manage teams and members."
      endpoint="/api/teams"
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
