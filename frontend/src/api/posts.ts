import api from './http';

export type Post = {
  title: string;
  summary: string;
  content: string;
  slug: string;
  status?: 'draft' | 'published';
  heroImage?: string;
  projectType?: string;
  tags?: string[];
  dateRange?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  authorId?: string | number;
  authorEmail?: string;
};

export type PostInput = Omit<Post, 'slug'> & { slug?: string };

export async function listPublishedPosts() {
  const { data } = await api.get<{ posts: Post[] }>('/posts');
  return data.posts;
}

export async function listDraftPosts() {
  const { data } = await api.get<{ posts: Post[] }>('/posts/drafts');
  return data.posts;
}

export async function getPost(slug: string) {
  const { data } = await api.get<{ post: Post }>(`/posts/${slug}`);
  return data.post;
}

export async function getRawPost(slug: string) {
  const { data } = await api.get<{ post: Post }>(`/posts/${slug}/raw`);
  return data.post;
}

export async function createPost(payload: PostInput) {
  const { data } = await api.post<{ post: Post }>('/posts', payload);
  return data.post;
}

export async function updatePost(slug: string, payload: PostInput) {
  const { data } = await api.put<{ post: Post }>(`/posts/${slug}`, payload);
  return data.post;
}

export async function removePost(slug: string) {
  await api.delete(`/posts/${slug}`);
}
