
export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface IslamicResource {
  id: string;
  title: string;
  description: string;
  category: string;
  author?: string;
  source?: string;
  contentType: 'article' | 'video' | 'guide' | 'book';
  url?: string;
  content?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  featured?: boolean;
}
