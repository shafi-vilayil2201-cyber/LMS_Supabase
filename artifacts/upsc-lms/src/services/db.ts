let cache: any = null;

async function getDb() {
  if (cache) return cache;
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const res = await fetch(`${base}/db.json`);
  cache = await res.json();
  return cache;
}

export const getUsers = async () => (await getDb()).users ?? [];
export const getCourses = async () => (await getDb()).courses ?? [];
export const getWeeklyBlocks = async () => (await getDb()).weeklyBlocks ?? [];
export const getDailyHabits = async () => (await getDb()).dailyHabits ?? [];
export const getSessions = async () => (await getDb()).sessions ?? [];
export const getLeaderboard = async () => (await getDb()).leaderboard ?? [];
export const getWeeklyReviews = async () => (await getDb()).weeklyReviews ?? [];
export const getCurrentAffairs = async () => (await getDb()).currentAffairs ?? [];
export const getAnnouncements = async () => (await getDb()).announcements ?? [];
export const getMentorApplications = async () => (await getDb()).mentorApplications ?? [];

export const getAdminAnalytics = async () => {
  const db = await getDb();
  const raw = db.adminAnalytics ?? {};

  const courseRevenue = (raw.courseEnrollments ?? []).map((e: any) => ({
    name: e.course,
    revenue: e.enrollments * 2500,
    enrollments: e.enrollments,
    price: 2500,
  }));
  courseRevenue[0] = { ...courseRevenue[0], revenue: (courseRevenue[0]?.enrollments ?? 0) * 25000, price: 25000 };

  return {
    totalStudents: raw.totalStudents,
    totalMentors: raw.totalMentors,
    activeEnrollments: raw.activeCourseEnrollments,
    monthlyRevenue: raw.monthlyRevenue,
    avgWeeklyScore: raw.avgWeeklyScore,
    dropoutRiskPercent: raw.dropoutRisk,
    userGrowth: (raw.userGrowthMonthly ?? []).map((d: any) => ({ month: d.month, students: d.users })),
    courseEnrollments: (raw.courseEnrollments ?? []).map((e: any) => ({ course: e.course.split(" ")[0], count: e.enrollments })),
    scoreDistribution: raw.scoreDistribution ?? [],
    monthlyRevenueData: (raw.revenueMonthly ?? []).map((d: any) => ({ month: d.month, revenue: d.revenue })),
    courseRevenue,
    topStudents: raw.topStudents ?? [],
    topMentors: raw.topMentors ?? [],
    habitCompletionRate: raw.habitCompletionRate ?? {},
  };
};
