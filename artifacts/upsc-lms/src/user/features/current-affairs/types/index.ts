// Current Affairs feature types
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  relevantFor: string[];
  publishedAt: string;
  readTime: number;
}
