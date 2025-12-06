import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth';
import { deletePost, getPostBySlug, listPosts, savePost } from '../services/postService';

const router = Router();

router.get('/', async (_req, res) => {
  const posts = await listPosts({ includeDrafts: false });
  return res.json({ posts });
});

router.get('/drafts', requireAuth, async (_req, res) => {
  const posts = await listPosts({ includeDrafts: true });
  return res.json({ posts });
});

router.get('/:slug', async (req, res) => {
  const post = await getPostBySlug(req.params.slug, { includeDrafts: false });
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  return res.json({ post });
});

router.get('/:slug/raw', requireAuth, async (req, res) => {
  const post = await getPostBySlug(req.params.slug, { includeDrafts: true });
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }
  return res.json({ post });
});

const postSchema = z.object({
  title: z.string().min(3),
  summary: z.string().min(10),
  content: z.string().min(1),
  status: z.enum(['draft', 'published']).optional(),
  heroImage: z.string().url().optional(),
  projectType: z.string().optional(),
  tags: z.array(z.string()).optional(),
  dateRange: z.string().optional(),
  publishedAt: z.string().optional(),
  slug: z.string().optional(),
});

router.post('/', requireAuth, async (req, res) => {
  const payload = postSchema.parse(req.body);
  const post = await savePost(payload, req.user?.id);
  return res.status(201).json({ post });
});

router.put('/:slug', requireAuth, async (req, res) => {
  const payload = postSchema.parse({ ...req.body, slug: req.params.slug });
  const post = await savePost(payload, req.user?.id);
  return res.json({ post });
});

router.delete('/:slug', requireAuth, async (req, res) => {
  await deletePost(req.params.slug);
  return res.status(204).send();
});

export default router;
