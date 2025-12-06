import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import env from '../config/env';
import slugify from '../utils/slugify';

export type PostStatus = 'draft' | 'published';

export interface PostMetadata {
  title: string;
  slug: string;
  summary: string;
  status: PostStatus;
  heroImage?: string;
  projectType?: string;
  tags: string[];
  dateRange?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  authorId?: string;
}

export interface PostInput {
  title: string;
  summary: string;
  content: string;
  status?: PostStatus;
  heroImage?: string;
  projectType?: string;
  tags?: string[];
  dateRange?: string;
  publishedAt?: string;
  slug?: string;
}

export interface Post extends PostMetadata {
  content: string;
}

const POSTS_DIR = env.contentDir;

const readFileIfExists = async (filePath: string): Promise<string | null> => {
  try {
    return await fs.readFile(filePath, 'utf8');
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw error;
  }
};

export const ensureContentDir = async () => {
  await fs.mkdir(POSTS_DIR, { recursive: true });
};

const parsePost = (raw: string, filePath: string): Post => {
  const { data, content } = matter(raw);
  const metadata: PostMetadata = {
    title: data.title ?? 'Untitled',
    slug: data.slug ?? path.basename(filePath, '.md'),
    summary: data.summary ?? '',
    status: data.status === 'published' ? 'published' : 'draft',
    heroImage: data.heroImage,
    projectType: data.projectType,
    tags: Array.isArray(data.tags) ? data.tags : [],
    dateRange: data.dateRange,
    publishedAt: data.publishedAt,
    createdAt: data.createdAt ?? new Date().toISOString(),
    updatedAt: data.updatedAt ?? new Date().toISOString(),
    authorId: data.authorId,
  };

  return { ...metadata, content: content.trim() };
};

export const listPosts = async (options?: {
  includeDrafts?: boolean;
}): Promise<PostMetadata[]> => {
  await ensureContentDir();
  const files = await fs.readdir(POSTS_DIR);
  const posts = await Promise.all(
    files
      .filter((file) => file.endsWith('.md'))
      .map(async (file) => {
        const raw = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
        return parsePost(raw, file);
      })
  );

  return posts
    .filter((post) => (options?.includeDrafts ? true : post.status === 'published'))
    .sort((a, b) => Date.parse(b.publishedAt ?? b.updatedAt) - Date.parse(a.publishedAt ?? a.updatedAt));
};

export const getPostBySlug = async (
  slug: string,
  options?: { includeDrafts?: boolean }
): Promise<Post | null> => {
  await ensureContentDir();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const raw = await readFileIfExists(filePath);
  if (!raw) {
    return null;
  }
  const post = parsePost(raw, filePath);

  if (!options?.includeDrafts && post.status !== 'published') {
    return null;
  }

  return post;
};

export const savePost = async (
  payload: PostInput,
  authorId?: string
): Promise<Post> => {
  await ensureContentDir();
  const slug = payload.slug ? slugify(payload.slug) : slugify(payload.title);
  if (!slug) {
    throw new Error('Unable to derive slug from title');
  }
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  const existingRaw = await readFileIfExists(filePath);
  const timestamp = new Date().toISOString();
  const existingMeta = existingRaw ? parsePost(existingRaw, filePath) : undefined;

  const metadata: PostMetadata = {
    title: payload.title,
    slug,
    summary: payload.summary,
    status: payload.status ?? existingMeta?.status ?? 'draft',
    heroImage: payload.heroImage ?? existingMeta?.heroImage,
    projectType: payload.projectType ?? existingMeta?.projectType,
    tags: payload.tags ?? existingMeta?.tags ?? [],
    dateRange: payload.dateRange ?? existingMeta?.dateRange,
    publishedAt:
      payload.publishedAt ??
      existingMeta?.publishedAt ??
      (payload.status === 'published' && existingMeta?.status !== 'published'
        ? timestamp
        : existingMeta?.publishedAt),
    createdAt: existingMeta?.createdAt ?? timestamp,
    updatedAt: timestamp,
    authorId: existingMeta?.authorId ?? authorId,
  };

  const fileContents = matter.stringify(payload.content, metadata);
  await fs.writeFile(filePath, `${fileContents.trim()}
`, 'utf8');
  return { ...metadata, content: payload.content };
};

export const deletePost = async (slug: string): Promise<void> => {
  await ensureContentDir();
  const filePath = path.join(POSTS_DIR, `${slug}.md`);
  try {
    await fs.unlink(filePath);
  } catch (error: unknown) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return;
    }
    throw error;
  }
};
