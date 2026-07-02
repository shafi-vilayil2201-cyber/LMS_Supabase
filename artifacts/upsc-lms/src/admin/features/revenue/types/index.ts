// Revenue feature types
export interface RevenueDataPoint {
  month: string;
  revenue: number;
}

export interface CourseRevenue {
  name: string;
  revenue: number;
  enrollments: number;
  price: number;
}
