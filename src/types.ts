export interface User {
  id: string | number;
  email: string;
  full_name: string;
  headline: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_company_rep: number;
  company_name?: string | null;
  company_description?: string | null;
  company_website?: string | null;
  role: 'admin' | 'company' | 'jobseeker';
  subscription: 'free' | 'pro' | 'enterprise';
  place_id?: string | number | null;
  cv_text?: string | null;
  created_at: string;
}

export interface Job {
  id: string | number;
  user_id: string | number;
  title: string;
  company_name: string;
  location: string;
  description: string;
  salary_range: string;
  experience_level: string;
  end_date: string;
  created_at: string;
}

export interface CVSection {
  id: string | number;
  user_id: string | number;
  type: 'experience' | 'education' | 'project' | 'certification';
  title: string;
  subtitle: string;
  description: string;
  start_date: string;
  end_date: string | null;
  verification_url: string | null;
  keywords: string | null;
  created_at: string;
}

export interface Skill {
  name: string;
  proficiency: number;
  verification_url?: string | null;
  is_verified?: boolean;
}

export interface Post {
  id: string | number;
  user_id: string | number;
  content: string;
  type: 'standard' | 'cv_update' | 'discussion';
  attachment_type: 'cv_item' | 'portfolio_item' | 'none';
  attachment_id: string | number | null;
  quiz_data?: string | null;
  poll_data?: string | null;
  response_stats?: string | null;
  created_at: string;
  full_name: string;
  avatar_url: string | null;
  headline: string | null;
  comment_count: number;
}

export interface Comment {
  id: string | number;
  post_id: string | number;
  user_id: string | number;
  content: string;
  created_at: string;
  full_name: string;
  avatar_url: string | null;
}

export interface PortfolioItem {
  id: string | number;
  user_id: string | number;
  title: string;
  url: string;
  thumbnail_url: string | null;
  description: string | null;
  created_at: string;
}

export interface FileItem {
  id: string | number;
  user_id: string | number;
  name: string;
  url: string;
  type: string;
  purpose: string;
  created_at: string;
}
