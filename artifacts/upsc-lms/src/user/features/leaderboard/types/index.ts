// Leaderboard feature types
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  streak: number;
  weeklyChange: number;
}
