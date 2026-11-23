import { CapabilityCard } from './CapabilityCard.js';
import { getJson } from '../api/client.js';

export async function loadWorkouts() {
  return getJson<Record<string, unknown>>('/api/workouts/suggestions/mona%40example.com');
}

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      loadItems={loadWorkouts}
      itemsKey="suggestions"
      emptyText="No workout suggestions yet."
      renderItem={(item) => {
        const workout = item as { title?: string; reason?: string };
        return `${workout.title ?? 'Workout'}${workout.reason ? ` - ${workout.reason}` : ''}`;
      }}
    />
  );
}
