import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  title: String,
  focus: { type: String, required: true, trim: true },
  minutes: { type: Number, required: true, min: 0 },
  difficulty: { type: String, required: true, trim: true },
});

export const Workout = model('Workout', workoutSchema);
