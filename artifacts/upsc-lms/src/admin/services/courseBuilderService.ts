import { supabase } from '@/shared/lib/supabaseClient';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Program {
  id: number;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
}

export interface Subject {
  id: number;
  program_id: number;
  name: string;
  description: string;
  duration_months: number;
  is_published: boolean;
  created_at: string;
}

export interface SubjectMonth {
  id: number;
  subject_id: number;
  month_number: number;
  title: string;
  created_at: string;
}

export interface SubjectWeek {
  id: number;
  subject_month_id: number;
  week_number: number;
  title: string;
  created_at: string;
}

export interface SubjectDayTopic {
  id: number;
  subject_week_id: number;
  day_number: number;
  title: string;
  description: string;
  estimated_minutes: number;
  created_at: string;
}

export interface CourseSubjectRow {
  id: number;
  course_id: string;
  subject_id: number;
  display_order: number;
  start_month: number;
  created_at: string;
}

export interface CourseWithProgramId {
  id: string;
  title: string;
  description: string;
  program_id: number | null;
  duration_months: number | null;
  price: number;
  status: string;
}

export interface AttachedSubject {
  subject_id: number;
  subject_name: string;
  display_order: number;
  start_month: number;
}

export interface CurriculumTree {
  months: (SubjectMonth & {
    weeks: (SubjectWeek & {
      dayTopics: SubjectDayTopic[];
    })[];
  })[];
}

// ─── Validation Helpers ──────────────────────────────────────────────────────

function assertTrimmedNotEmpty(value: string, label: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new Error(`${label} is required.`);
  }
  return trimmed;
}

function assertMaxLength(value: string, max: number, label: string): void {
  if (value.length > max) {
    throw new Error(`${label} must be at most ${max} characters.`);
  }
}

function assertRange(value: number, min: number, max: number, label: string): void {
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`${label} must be between ${min} and ${max}.`);
  }
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${label} must be 0 or higher.`);
  }
}

function assertPositiveStrict(value: number, label: string): void {
  if (!Number.isFinite(value) || value < 1) {
    throw new Error(`${label} must be 1 or higher.`);
  }
}

// ─── Programs ────────────────────────────────────────────────────────────────

export async function getPrograms(): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch programs: ${error.message}`);
  return data ?? [];
}

export async function createProgram(payload: { name: string; code: string }): Promise<Program> {
  const name = assertTrimmedNotEmpty(payload.name, 'Program name');
  const code = assertTrimmedNotEmpty(payload.code, 'Program code');

  const { data, error } = await supabase
    .from('programs')
    .insert({ name, code, is_active: true })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A program with this name or code already exists.');
    throw new Error(`Failed to create program: ${error.message}`);
  }
  return data;
}

// ─── Subjects ────────────────────────────────────────────────────────────────

export async function getSubjects(programId: number): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('*')
    .eq('program_id', programId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(`Failed to fetch subjects: ${error.message}`);
  return data ?? [];
}

export async function createSubject(payload: {
  programId: number;
  name: string;
  description: string;
  durationMonths: number;
}): Promise<Subject> {
  const name = assertTrimmedNotEmpty(payload.name, 'Subject name');
  assertMaxLength(name, 150, 'Subject name');
  const description = payload.description.trim();
  assertMaxLength(description, 1000, 'Subject description');
  assertRange(payload.durationMonths, 1, 24, 'Duration months');

  const { data, error } = await supabase
    .from('subjects')
    .insert({
      program_id: payload.programId,
      name,
      description,
      duration_months: payload.durationMonths,
      is_published: false,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A subject with this name already exists in this program.');
    throw new Error(`Failed to create subject: ${error.message}`);
  }
  return data;
}

// ─── Subject Months ──────────────────────────────────────────────────────────

export async function getSubjectMonths(subjectId: number): Promise<SubjectMonth[]> {
  const { data, error } = await supabase
    .from('subject_months')
    .select('*')
    .eq('subject_id', subjectId)
    .order('month_number', { ascending: true });

  if (error) throw new Error(`Failed to fetch months: ${error.message}`);
  return data ?? [];
}

export async function createSubjectMonth(payload: {
  subjectId: number;
  monthNumber: number;
  title: string;
}): Promise<SubjectMonth> {
  const title = assertTrimmedNotEmpty(payload.title, 'Month title');
  assertMaxLength(title, 150, 'Month title');
  assertRange(payload.monthNumber, 1, 24, 'Month number');

  const { data, error } = await supabase
    .from('subject_months')
    .insert({
      subject_id: payload.subjectId,
      month_number: payload.monthNumber,
      title,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error(`Month ${payload.monthNumber} already exists in this subject.`);
    throw new Error(`Failed to create month: ${error.message}`);
  }
  return data;
}

// ─── Subject Weeks ───────────────────────────────────────────────────────────

export async function getSubjectWeeks(monthId: number): Promise<SubjectWeek[]> {
  const { data, error } = await supabase
    .from('subject_weeks')
    .select('*')
    .eq('subject_month_id', monthId)
    .order('week_number', { ascending: true });

  if (error) throw new Error(`Failed to fetch weeks: ${error.message}`);
  return data ?? [];
}

export async function createSubjectWeek(payload: {
  monthId: number;
  weekNumber: number;
  title: string;
}): Promise<SubjectWeek> {
  const title = assertTrimmedNotEmpty(payload.title, 'Week title');
  assertMaxLength(title, 150, 'Week title');
  assertRange(payload.weekNumber, 1, 6, 'Week number');

  const { data, error } = await supabase
    .from('subject_weeks')
    .insert({
      subject_month_id: payload.monthId,
      week_number: payload.weekNumber,
      title,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error(`Week ${payload.weekNumber} already exists in this month.`);
    throw new Error(`Failed to create week: ${error.message}`);
  }
  return data;
}

// ─── Subject Day Topics ─────────────────────────────────────────────────────

export async function getDayTopics(weekId: number): Promise<SubjectDayTopic[]> {
  const { data, error } = await supabase
    .from('subject_day_topics')
    .select('*')
    .eq('subject_week_id', weekId)
    .order('day_number', { ascending: true });

  if (error) throw new Error(`Failed to fetch day topics: ${error.message}`);
  return data ?? [];
}

export async function createDayTopic(payload: {
  weekId: number;
  dayNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
}): Promise<SubjectDayTopic> {
  const title = assertTrimmedNotEmpty(payload.title, 'Day topic title');
  assertMaxLength(title, 200, 'Day topic title');
  const description = payload.description.trim();
  assertMaxLength(description, 2000, 'Day topic description');
  assertRange(payload.dayNumber, 1, 7, 'Day number');
  assertRange(payload.estimatedMinutes, 1, 600, 'Estimated minutes');

  const { data, error } = await supabase
    .from('subject_day_topics')
    .insert({
      subject_week_id: payload.weekId,
      day_number: payload.dayNumber,
      title,
      description,
      estimated_minutes: payload.estimatedMinutes,
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error(`Day ${payload.dayNumber} already exists in this week.`);
    throw new Error(`Failed to create day topic: ${error.message}`);
  }
  return data;
}

// ─── Curriculum Tree ─────────────────────────────────────────────────────────

export async function getSubjectCurriculum(subjectId: number): Promise<CurriculumTree> {
  // Fetch months
  const months = await getSubjectMonths(subjectId);

  // Fetch all weeks for those months in one go
  const monthIds = months.map((m) => m.id);
  let allWeeks: SubjectWeek[] = [];
  if (monthIds.length > 0) {
    const { data, error } = await supabase
      .from('subject_weeks')
      .select('*')
      .in('subject_month_id', monthIds)
      .order('week_number', { ascending: true });
    if (error) throw new Error(`Failed to fetch weeks: ${error.message}`);
    allWeeks = data ?? [];
  }

  // Fetch all day topics for those weeks in one go
  const weekIds = allWeeks.map((w) => w.id);
  let allDayTopics: SubjectDayTopic[] = [];
  if (weekIds.length > 0) {
    const { data, error } = await supabase
      .from('subject_day_topics')
      .select('*')
      .in('subject_week_id', weekIds)
      .order('day_number', { ascending: true });
    if (error) throw new Error(`Failed to fetch day topics: ${error.message}`);
    allDayTopics = data ?? [];
  }

  // Assemble tree
  const tree: CurriculumTree = {
    months: months.map((month) => ({
      ...month,
      weeks: allWeeks
        .filter((w) => w.subject_month_id === month.id)
        .map((week) => ({
          ...week,
          dayTopics: allDayTopics.filter((dt) => dt.subject_week_id === week.id),
        })),
    })),
  };

  return tree;
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function getCoursesByProgram(programId: number): Promise<CourseWithProgramId[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('id, title, description, program_id, duration_months, price, status')
    .eq('program_id', programId)
    .order('createdAt', { ascending: false });

  if (error) throw new Error(`Failed to fetch courses: ${error.message}`);
  return (data ?? []) as CourseWithProgramId[];
}

export async function createCourseForProgram(payload: {
  programId: number;
  title: string;
  description: string;
  durationMonths: number;
  price: number;
}): Promise<CourseWithProgramId> {
  const title = assertTrimmedNotEmpty(payload.title, 'Course title');
  assertMaxLength(title, 200, 'Course title');
  const description = payload.description.trim();
  assertMaxLength(description, 2000, 'Course description');
  assertRange(payload.durationMonths, 1, 36, 'Duration months');
  assertPositive(payload.price, 'Price');

  // Check for duplicate course title within the same program
  const { data: existing } = await supabase
    .from('courses')
    .select('id')
    .eq('program_id', payload.programId)
    .ilike('title', title)
    .limit(1);

  if (existing && existing.length > 0) {
    throw new Error('A course with this title already exists in this program.');
  }

  const courseId = 'c_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();

  const { data, error } = await supabase
    .from('courses')
    .insert({
      id: courseId,
      title,
      description,
      program_id: payload.programId,
      duration_months: payload.durationMonths,
      price: payload.price,
      status: 'Draft',
      category: 'Program Course',
      type: 'ProgramCourse',
      duration: `${payload.durationMonths} months`,
    })
    .select('id, title, description, program_id, duration_months, price, status')
    .single();

  if (error) throw new Error(`Failed to create course: ${error.message}`);
  return data as CourseWithProgramId;
}

// ─── Course Subject Attachment ───────────────────────────────────────────────

export async function getAttachedSubjects(courseId: string): Promise<AttachedSubject[]> {
  const { data, error } = await supabase
    .from('course_subjects')
    .select(`
      subject_id,
      display_order,
      start_month,
      subjects ( name )
    `)
    .eq('course_id', courseId)
    .order('display_order', { ascending: true });

  if (error) throw new Error(`Failed to fetch attached subjects: ${error.message}`);

  return (data ?? []).map((row: any) => ({
    subject_id: row.subject_id,
    subject_name: row.subjects?.name ?? 'Unknown',
    display_order: row.display_order,
    start_month: row.start_month,
  }));
}

export async function attachSubjectToCourse(payload: {
  courseId: string;
  subjectId: number;
  displayOrder: number;
  startMonth: number;
}): Promise<void> {
  assertPositiveStrict(payload.displayOrder, 'Display order');
  assertPositiveStrict(payload.startMonth, 'Start month');

  // Verify the subject belongs to the same program as the course
  const { data: courseData } = await supabase
    .from('courses')
    .select('program_id')
    .eq('id', payload.courseId)
    .single();

  const { data: subjectData } = await supabase
    .from('subjects')
    .select('program_id')
    .eq('id', payload.subjectId)
    .single();

  if (!courseData || !subjectData) {
    throw new Error('Course or subject not found.');
  }

  if (courseData.program_id !== subjectData.program_id) {
    throw new Error('The subject must belong to the same program as the course.');
  }

  const { error } = await supabase
    .from('course_subjects')
    .insert({
      course_id: payload.courseId,
      subject_id: payload.subjectId,
      display_order: payload.displayOrder,
      start_month: payload.startMonth,
    });

  if (error) {
    if (error.code === '23505') throw new Error('This subject is already attached to this course.');
    throw new Error(`Failed to attach subject: ${error.message}`);
  }
}

// ─── Update & Delete APIs ────────────────────────────────────────────────────

export async function updateProgram(id: number, payload: { name: string; code: string }): Promise<Program> {
  const name = assertTrimmedNotEmpty(payload.name, 'Program name');
  const code = assertTrimmedNotEmpty(payload.code, 'Program code');

  const { data, error } = await supabase
    .from('programs')
    .update({ name, code })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A program with this name or code already exists.');
    throw new Error(`Failed to update program: ${error.message}`);
  }
  return data;
}

export async function deleteProgram(id: number): Promise<void> {
  const { error } = await supabase
    .from('programs')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete program: ${error.message}`);
}

export async function updateSubject(id: number, payload: {
  name: string;
  description: string;
  durationMonths: number;
}): Promise<Subject> {
  const name = assertTrimmedNotEmpty(payload.name, 'Subject name');
  assertMaxLength(name, 150, 'Subject name');
  const description = payload.description.trim();
  assertMaxLength(description, 1000, 'Subject description');
  assertRange(payload.durationMonths, 1, 24, 'Duration months');

  const { data, error } = await supabase
    .from('subjects')
    .update({
      name,
      description,
      duration_months: payload.durationMonths,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A subject with this name already exists in this program.');
    throw new Error(`Failed to update subject: ${error.message}`);
  }
  return data;
}

export async function deleteSubject(id: number): Promise<void> {
  const { error } = await supabase
    .from('subjects')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete subject: ${error.message}`);
}

export async function updateSubjectMonth(id: number, payload: {
  monthNumber: number;
  title: string;
}): Promise<SubjectMonth> {
  const title = assertTrimmedNotEmpty(payload.title, 'Month title');
  assertMaxLength(title, 150, 'Month title');
  assertRange(payload.monthNumber, 1, 24, 'Month number');

  const { data, error } = await supabase
    .from('subject_months')
    .update({
      month_number: payload.monthNumber,
      title,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A month with this number already exists in this subject.');
    throw new Error(`Failed to update month: ${error.message}`);
  }
  return data;
}

export async function deleteSubjectMonth(id: number): Promise<void> {
  const { error } = await supabase
    .from('subject_months')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete month: ${error.message}`);
}

export async function updateSubjectWeek(id: number, payload: {
  weekNumber: number;
  title: string;
}): Promise<SubjectWeek> {
  const title = assertTrimmedNotEmpty(payload.title, 'Week title');
  assertMaxLength(title, 150, 'Week title');
  assertRange(payload.weekNumber, 1, 6, 'Week number');

  const { data, error } = await supabase
    .from('subject_weeks')
    .update({
      week_number: payload.weekNumber,
      title,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A week with this number already exists in this month.');
    throw new Error(`Failed to update week: ${error.message}`);
  }
  return data;
}

export async function deleteSubjectWeek(id: number): Promise<void> {
  const { error } = await supabase
    .from('subject_weeks')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete week: ${error.message}`);
}

export async function updateDayTopic(id: number, payload: {
  dayNumber: number;
  title: string;
  description: string;
  estimatedMinutes: number;
}): Promise<SubjectDayTopic> {
  const title = assertTrimmedNotEmpty(payload.title, 'Day topic title');
  assertMaxLength(title, 200, 'Day topic title');
  const description = payload.description.trim();
  assertMaxLength(description, 2000, 'Day topic description');
  assertRange(payload.dayNumber, 1, 7, 'Day number');
  assertRange(payload.estimatedMinutes, 1, 600, 'Estimated minutes');

  const { data, error } = await supabase
    .from('subject_day_topics')
    .update({
      day_number: payload.dayNumber,
      title,
      description,
      estimated_minutes: payload.estimatedMinutes,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('A topic with this day number already exists in this week.');
    throw new Error(`Failed to update day topic: ${error.message}`);
  }
  return data;
}

export async function deleteDayTopic(id: number): Promise<void> {
  const { error } = await supabase
    .from('subject_day_topics')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete day topic: ${error.message}`);
}

export async function updateCourse(id: string, payload: {
  title: string;
  description: string;
  durationMonths: number;
  price: number;
}): Promise<CourseWithProgramId> {
  const title = assertTrimmedNotEmpty(payload.title, 'Course title');
  assertMaxLength(title, 200, 'Course title');
  const description = payload.description.trim();
  assertMaxLength(description, 2000, 'Course description');
  assertRange(payload.durationMonths, 1, 36, 'Duration months');
  assertPositive(payload.price, 'Price');

  const { data, error } = await supabase
    .from('courses')
    .update({
      title,
      description,
      duration_months: payload.durationMonths,
      price: payload.price,
      duration: `${payload.durationMonths} months`,
    })
    .eq('id', id)
    .select('id, title, description, program_id, duration_months, price, status')
    .single();

  if (error) throw new Error(`Failed to update course: ${error.message}`);
  return data as CourseWithProgramId;
}

export async function deleteCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from('courses')
    .delete()
    .eq('id', id);

  if (error) throw new Error(`Failed to delete course: ${error.message}`);
}

export async function detachSubjectFromCourse(courseId: string, subjectId: number): Promise<void> {
  const { error } = await supabase
    .from('course_subjects')
    .delete()
    .eq('course_id', courseId)
    .eq('subject_id', subjectId);

  if (error) throw new Error(`Failed to detach subject: ${error.message}`);
}

