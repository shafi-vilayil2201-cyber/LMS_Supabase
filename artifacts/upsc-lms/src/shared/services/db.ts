import { supabase } from '../lib/supabaseClient';

// ── Read APIs ────────────────────────────────────────────────────────────────

export const getUsers = async () => {
  const { data, error } = await supabase.from('users').select('*');
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  return data ?? [];
};

export const getCourses = async () => {
  const { data, error } = await supabase.from('courses').select('*');
  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }
  return data ?? [];
};

export const getWeeklyBlocks = async () => {
  const { data, error } = await supabase.from('weekly_blocks').select('*');
  if (error) {
    console.error('Error fetching weekly blocks:', error);
    return [];
  }
  return data ?? [];
};

export const getDailyHabits = async () => {
  const { data, error } = await supabase.from('daily_habits').select('*').order('date', { ascending: false });
  if (error) {
    console.error('Error fetching daily habits:', error);
    return [];
  }
  return data ?? [];
};

export const getSessions = async () => {
  const { data, error } = await supabase.from('sessions').select('*').order('scheduledAt', { ascending: true });
  if (error) {
    console.error('Error fetching sessions:', error);
    return [];
  }
  return data ?? [];
};

export const getLeaderboard = async () => {
  const { data, error } = await supabase.from('leaderboard').select('*').order('score', { ascending: false });
  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }
  // Re-rank based on scores
  return (data ?? []).map((x, i) => ({ ...x, rank: i + 1 }));
};

export const getWeeklyReviews = async () => {
  const { data, error } = await supabase.from('weekly_reviews').select('*').order('scheduledAt', { ascending: true });
  if (error) {
    console.error('Error fetching weekly reviews:', error);
    return [];
  }
  return data ?? [];
};

export const getCurrentAffairs = async () => {
  const { data, error } = await supabase.from('current_affairs').select('*').order('publishedAt', { ascending: false });
  if (error) {
    console.error('Error fetching current affairs:', error);
    return [];
  }
  return data ?? [];
};

export const getAnnouncements = async () => {
  const { data, error } = await supabase.from('announcements').select('*').order('publishedAt', { ascending: false });
  if (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
  return data ?? [];
};

export const getMentorApplications = async () => {
  const { data, error } = await supabase.from('mentor_applications').select('*').order('appliedAt', { ascending: false });
  if (error) {
    console.error('Error fetching mentor applications:', error);
    return [];
  }
  return data ?? [];
};

export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  return data;
};

export const getUsersByRole = async (role: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role);
  if (error) {
    console.error('Error fetching users by role:', error);
    return [];
  }
  return data ?? [];
};

// ── Write & Mutation APIs ────────────────────────────────────────────────────

export const saveDailyHabits = async (userId: string, date: string, habits: any) => {
  const disciplineScore = (Object.values(habits).filter(Boolean).length * 10 / 40) * 4; // Max 4.0
  const row = {
    userId,
    date,
    topicCompleted: !!habits.topicCompleted,
    quizAttended: !!habits.quizAttended,
    newspaperRead: !!habits.newspaperRead,
    exerciseDone: !!habits.exerciseDone,
    disciplineScore,
  };

  const { data, error } = await supabase
    .from('daily_habits')
    .upsert([row], { onConflict: 'userId,date' })
    .select();

  if (error) {
    console.error('Error saving daily habits:', error);
    throw error;
  }
  return data?.[0];
};

export const bookSession = async (session: any) => {
  const { data, error } = await supabase.from('sessions').insert([session]).select();
  if (error) {
    console.error('Error booking session:', error);
    throw error;
  }
  return data?.[0];
};

export const cancelSession = async (sessionId: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({ status: 'Cancelled' })
    .eq('id', sessionId)
    .select();

  if (error) {
    console.error('Error cancelling session:', error);
    throw error;
  }
  return data?.[0];
};

export const rateSession = async (sessionId: string, rating: number, feedback: string) => {
  const { data, error } = await supabase
    .from('sessions')
    .update({ studentRating: rating, feedback })
    .eq('id', sessionId)
    .select();

  if (error) {
    console.error('Error rating session:', error);
    throw error;
  }
  return data?.[0];
};

export const saveMentorAvailability = async (mentorId: string, slots: string[]) => {
  const { data, error } = await supabase
    .from('users')
    .update({ availability: slots })
    .eq('id', mentorId)
    .select();

  if (error) {
    console.error('Error saving mentor availability:', error);
    throw error;
  }
  return data?.[0];
};

export const createCourse = async (course: any) => {
  const { data, error } = await supabase.from('courses').insert([course]).select();
  if (error) {
    console.error('Error creating course:', error);
    throw error;
  }
  return data?.[0];
};

export const updateCourse = async (courseId: string, course: any) => {
  const { data, error } = await supabase
    .from('courses')
    .update(course)
    .eq('id', courseId)
    .select();

  if (error) {
    console.error('Error updating course:', error);
    throw error;
  }
  return data?.[0];
};

export const deleteCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .delete()
    .eq('id', courseId)
    .select();

  if (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
  return data;
};

export const updateMentorApplicationStatus = async (applicationId: string, status: string, applicantId?: string) => {
  const { data, error } = await supabase
    .from('mentor_applications')
    .update({ status })
    .eq('id', applicationId)
    .select();

  if (error) {
    console.error('Error updating mentor application status:', error);
    throw error;
  }

  // If approved, update the user role and approval status as well
  if (status === 'approved' && applicantId) {
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'mentor', approvalStatus: 'approved' })
      .eq('id', applicantId);

    if (userError) {
      console.error('Error updating user role on mentor approval:', userError);
    }
  } else if (status === 'rejected' && applicantId) {
    await supabase
      .from('users')
      .update({ approvalStatus: 'rejected' })
      .eq('id', applicantId);
  }

  return data?.[0];
};

export const submitReviewScores = async (reviewId: string, scores: any) => {
  const totalScore = (
    parseFloat(scores.oralScore) +
    parseFloat(scores.prelimScore) +
    parseFloat(scores.mainsScore) +
    parseFloat(scores.disciplineScore)
  );

  const nextWeekUnlocked = totalScore >= 7.5;

  const { data: reviewData, error } = await supabase
    .from('weekly_reviews')
    .update({
      oralScore: parseFloat(scores.oralScore),
      prelimScore: parseFloat(scores.prelimScore),
      mainsScore: parseFloat(scores.mainsScore),
      totalScore,
      reviewerFeedback: scores.reviewerFeedback,
      status: 'Completed',
      nextWeekUnlocked,
    })
    .eq('id', reviewId)
    .select();

  if (error) {
    console.error('Error submitting review scores:', error);
    throw error;
  }

  // Unlock the student's next week if the score is sufficient
  const completedReview = reviewData?.[0];
  if (completedReview && nextWeekUnlocked) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('currentWeek')
      .eq('id', completedReview.userId)
      .single();

    if (userProfile) {
      await supabase
        .from('users')
        .update({ currentWeek: userProfile.currentWeek + 1 })
        .eq('id', completedReview.userId);
    }
  }

  return completedReview;
};

export const createAnnouncement = async (announcement: any) => {
  const { data, error } = await supabase.from('announcements').insert([announcement]).select();
  if (error) {
    console.error('Error creating announcement:', error);
    throw error;
  }
  return data?.[0];
};

export const toggleAnnouncementActive = async (announcementId: string, isActive: boolean) => {
  const { data, error } = await supabase
    .from('announcements')
    .update({ isActive })
    .eq('id', announcementId)
    .select();

  if (error) {
    console.error('Error toggling announcement active:', error);
    throw error;
  }
  return data?.[0];
};

// ── Admin Analytics ──────────────────────────────────────────────────────────

export const getAdminAnalytics = async () => {
  const users = await getUsers();
  const courses = await getCourses();
  const reviews = await getWeeklyReviews();
  const habits = await getDailyHabits();
  const applications = await getMentorApplications();

  const students = users.filter((u: any) => u.role === 'student');
  const mentors = users.filter((u: any) => u.role === 'mentor' && u.approvalStatus === 'approved');
  const pendingApps = applications.filter((a: any) => a.status === 'pending');

  const totalStudents = students.length;
  const totalMentors = mentors.length;
  const pendingMentorApprovals = pendingApps.length;
  const totalCourses = courses.length;

  const activeCourseEnrollments = students.reduce((acc, s) => {
    const courseCount = Array.isArray(s.enrolledCourses) ? s.enrolledCourses.length : 0;
    return acc + courseCount;
  }, 0);

  const completedReviews = reviews.filter((r) => r.status === 'Completed' && r.totalScore != null);
  const avgWeeklyScore = completedReviews.length > 0
    ? completedReviews.reduce((acc, r) => acc + Number(r.totalScore), 0) / completedReviews.length
    : 0;

  // Calculate dropout risk: ratio of students whose latest review score was < 7.5
  let riskCount = 0;
  students.forEach((student: any) => {
    const studentReviews = reviews.filter((r) => r.userId === student.id && r.status === 'Completed');
    if (studentReviews.length > 0) {
      const latestReview = studentReviews.reduce((latest, current) => {
        return new Date(current.scheduledAt) > new Date(latest.scheduledAt) ? current : latest;
      });
      if (latestReview.totalScore < 7.5) {
        riskCount++;
      }
    }
  });
  const dropoutRiskPercent = students.length > 0 ? Math.round((riskCount / students.length) * 100) : 0;

  // Monthly breakdown of registration & revenue over the last 6 months
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    last6Months.push({
      monthName: months[d.getMonth()],
      year: d.getFullYear(),
      monthIndex: d.getMonth(),
      studentsCount: 0,
      revenue: 0
    });
  }

  last6Months.forEach((m) => {
    const endOfMonth = new Date(m.year, m.monthIndex + 1, 0, 23, 59, 59, 999);
    m.studentsCount = students.filter((s: any) => new Date(s.joinedAt) <= endOfMonth).length;

    const startOfMonth = new Date(m.year, m.monthIndex, 1);
    const joinedThisMonth = students.filter((s: any) => {
      const joinDate = new Date(s.joinedAt);
      return joinDate >= startOfMonth && joinDate <= endOfMonth;
    });

    let monthRev = 0;
    joinedThisMonth.forEach((s: any) => {
      if (Array.isArray(s.enrolledCourses)) {
        s.enrolledCourses.forEach((courseId: string) => {
          const course = courses.find(c => c.id === courseId);
          if (course) {
            monthRev += course.price || 0;
          }
        });
      }
    });
    m.revenue = monthRev;
  });

  const userGrowth = last6Months.map(m => ({
    month: m.monthName,
    students: m.studentsCount
  }));

  const monthlyRevenueData = last6Months.map(m => ({
    month: m.monthName,
    revenue: m.revenue
  }));

  const monthlyRevenue = last6Months[last6Months.length - 1].revenue;

  const courseEnrollments = courses.map((c) => {
    const count = students.filter(s => Array.isArray(s.enrolledCourses) && s.enrolledCourses.includes(c.id)).length;
    return {
      course: c.title.split(' ')[0],
      count
    };
  });

  const courseRevenue = courses.map((c) => {
    const enrollmentsCount = students.filter(s => Array.isArray(s.enrolledCourses) && s.enrolledCourses.includes(c.id)).length;
    return {
      name: c.title,
      revenue: enrollmentsCount * (c.price || 0),
      enrollments: enrollmentsCount,
      price: c.price || 0
    };
  });

  // Score distribution ranges
  const completedScores = reviews.filter((r) => r.status === 'Completed' && r.totalScore != null).map((r) => r.totalScore);
  const scoreDistribution = [
    { range: '9-10', count: completedScores.filter(s => s >= 9).length },
    { range: '8-9', count: completedScores.filter(s => s >= 8 && s < 9).length },
    { range: '7.5-8', count: completedScores.filter(s => s >= 7.5 && s < 8).length },
    { range: '7-7.5', count: completedScores.filter(s => s >= 7 && s < 7.5).length },
    { range: 'Below 7', count: completedScores.filter(s => s < 7).length }
  ];

  const totalHabitsCount = habits.length;
  const habitCompletionRate = {
    topic: totalHabitsCount > 0 ? Math.round((habits.filter((h: any) => h.topicCompleted).length / totalHabitsCount) * 100) : 0,
    quiz: totalHabitsCount > 0 ? Math.round((habits.filter((h: any) => h.quizAttended).length / totalHabitsCount) * 100) : 0,
    newspaper: totalHabitsCount > 0 ? Math.round((habits.filter((h: any) => h.newspaperRead).length / totalHabitsCount) * 100) : 0,
    exercise: totalHabitsCount > 0 ? Math.round((habits.filter((h: any) => h.exerciseDone).length / totalHabitsCount) * 100) : 0
  };

  return {
    totalStudents,
    totalMentors,
    pendingMentorApprovals,
    totalCourses,
    activeEnrollments: activeCourseEnrollments,
    monthlyRevenue,
    avgWeeklyScore: parseFloat(avgWeeklyScore.toFixed(1)),
    dropoutRiskPercent,
    userGrowth,
    courseEnrollments,
    scoreDistribution,
    monthlyRevenueData,
    courseRevenue,
    topStudents: students.sort((a: any, b: any) => (a.rank || 999) - (b.rank || 999)).slice(0, 3).map(s => ({ name: s.name, score: s.totalScore, rank: s.rank, city: s.city })),
    topMentors: mentors.sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0)).slice(0, 3).map(m => ({ name: m.name, rating: m.rating, reviews: m.totalReviews, sessions: m.totalSessions })),
    habitCompletionRate
  };
};


