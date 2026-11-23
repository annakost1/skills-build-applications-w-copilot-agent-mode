import { CapabilityCard } from './CapabilityCard.js';

export default function Workouts() {
  return (
    <CapabilityCard
      title="Workout suggestions"
      description="Recommend workouts from activity patterns."
      endpoint="/api/workouts/suggestions/mona%40example.com"
      itemsKey="suggestions"
      emptyText="No workout suggestions yet."
      renderItem={(item) => {
        const workout = item as { title?: string; reason?: string };
        return `${workout.title ?? 'Workout'}${workout.reason ? ` - ${workout.reason}` : ''}`;
      }}
    />
  );
}
