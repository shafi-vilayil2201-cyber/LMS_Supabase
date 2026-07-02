// Admin Leaderboard Control feature types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  streak: number;
  weeklyChange: number;
  isDisqualified?: boolean;
}
