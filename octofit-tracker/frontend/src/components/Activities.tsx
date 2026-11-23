import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export async function loadActivities() {
  return getJson<Record<string, unknown>>('/api/activities');
}

export default function Activities() {
  return (
    <CapabilityCard
      title="Activities"
      description="Track student activity minutes and points."
      loadItems={loadActivities}
      itemsKey="activities"
      emptyText="No activities yet."
      renderItem={(item) => {
        const activity = item as { type?: string; minutes?: number; points?: number };
        return `${activity.type ?? 'Activity'}${activity.minutes ? ` - ${activity.minutes} minutes` : ''}${activity.points ? ` - ${activity.points} points` : ''}`;
      }}
    />
  );
}
