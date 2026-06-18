export type BlogPost = {
  slug: string;
  title: string;
  seoTitle: string;
  excerpt: string;
  tags: string[];
  focusKeyword: string;
  category: string;
  emoji: string;
  publishedAt: string;
  content: string;
  status: 'published' | 'draft';
  coverImage?: string;
};

export type BlogPostInput = {
  slug: string;
  title: string;
  seoTitle?: string;
  excerpt: string;
  tags: string[];
  focusKeyword?: string;
  publishedAt: string;
  content: string;
  status?: 'published' | 'draft';
  coverImage?: string;
};
