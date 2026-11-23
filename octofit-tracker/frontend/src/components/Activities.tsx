import { CapabilityCard } from './CapabilityCard.js';

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      endpoint="/api/activities"
      itemsKey="activities"
      emptyText="No activities yet."
      renderItem={(item) => {
        const activity = item as { type?: string; minutes?: number; points?: number };
        return `${activity.type ?? 'Activity'}${activity.minutes ? ` - ${activity.minutes} minutes` : ''}${activity.points ? ` - ${activity.points} points` : ''}`;
      }}
    />
  );
}
