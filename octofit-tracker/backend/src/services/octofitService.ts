import { Activity, Team, User, Workout } from '../models/index.js';
import mongoose from 'mongoose';

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!input || typeof input !== 'object') {
    throw Object.assign(new Error('Valid activity details are required'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input as {
    userId?: unknown;
    teamId?: unknown;
    type?: unknown;
    minutes?: unknown;
  };
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;

  if (typeof userId !== 'string' || !objectIdPattern.test(userId)
    || typeof teamId !== 'string' || !objectIdPattern.test(teamId)) {
    throw Object.assign(new Error('A valid userId and teamId are required'), { status: 400 });
  }
  if (typeof type !== 'string' || type.trim().length === 0
    || typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    throw Object.assign(new Error('A valid type and positive minutes value are required'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.findById(userId).lean(),
    Team.findById(teamId).lean(),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('User or team not found'), { status: 404 });
  }

  return Activity.create({
    user: new mongoose.Types.ObjectId(userId),
    team: new mongoose.Types.ObjectId(teamId),
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(_input: unknown) {
  if (!_input || typeof _input !== 'object') {
    throw Object.assign(new Error('A valid team is required'), { status: 400 });
  }

  const { name, mascot, members = [] } = _input as {
    name?: unknown;
    mascot?: unknown;
    members?: unknown;
  };
  if (typeof name !== 'string' || name.trim().length === 0
    || typeof mascot !== 'string' || mascot.trim().length === 0) {
    throw Object.assign(new Error('Team name and mascot are required'), { status: 400 });
  }
  if (!Array.isArray(members) || members.some((member) =>
    typeof member !== 'string' || !mongoose.isValidObjectId(member))) {
    throw Object.assign(new Error('Team members must contain valid user IDs'), { status: 400 });
  }

  const memberIds = members as string[];
  if (memberIds.length > 0) {
    const existingMembers = await User.countDocuments({ _id: { $in: memberIds } });
    if (existingMembers !== memberIds.length) {
      throw Object.assign(new Error('One or more team members were not found'), { status: 404 });
    }
  }

  const team = await Team.create({
    name: name.trim(),
    mascot: mascot.trim(),
    members: memberIds,
  });
  if (memberIds.length > 0) {
    await User.updateMany(
      { _id: { $in: memberIds } },
      { $set: { team: team._id } },
    );
  }
  return team;
}

export async function getLeaderboard() {
  const rankedTeams = await Activity.aggregate([
    {
      $group: {
        _id: '$team',
        totalPoints: { $sum: '$points' },
      },
    },
    { $sort: { totalPoints: -1, _id: 1 } },
  ]);

  const teams = await Team.find({
    _id: { $in: rankedTeams.map((entry) => entry._id) },
  }).lean();
  const teamNames = new Map(teams.map((team) => [team._id.toString(), team.name]));

  return rankedTeams.map((entry, index) => ({
    teamName: teamNames.get(entry._id.toString()) ?? 'Unknown team',
    totalPoints: entry.totalPoints,
    rank: index + 1,
  }));
}

export async function suggestWorkouts(_userEmail: string) {
  if (typeof _userEmail !== 'string' || _userEmail.trim().length === 0) {
    throw Object.assign(new Error('A valid user email is required'), { status: 400 });
  }

  const email = _userEmail.trim();
  const user = await User.findOne({ email }).lean();
  if (!user) {
    throw Object.assign(new Error('User not found'), { status: 404 });
  }

  const recentActivity = await Activity.findOne({ user: user._id })
    .sort({ occurredAt: -1 })
    .lean();
  const activityType = recentActivity?.type?.trim().toLowerCase();
  const goal = user.fitnessGoal?.trim().toLowerCase();
  let focus = goal;
  let reason = `Build toward your ${goal} goal`;

  if (activityType) {
    const activityFocus = activityType === 'run' || activityType === 'cycle'
      ? 'endurance'
      : activityType === 'strength'
        ? 'strength'
        : activityType;
    if (!focus) {
      focus = activityFocus;
      reason = `Based on your recent ${activityType} activity`;
    } else if (activityFocus === focus) {
      reason = `Based on your ${activityType} activity and ${goal} goal`;
    }
  }

  let suggestions = focus
    ? await Workout.find({ focus }).lean()
    : [];
  if (suggestions.length === 0) {
    suggestions = await Workout.find().lean();
  }

  return suggestions.map((workout) => ({
    ...workout,
    reason,
  }));
}

export { User };
