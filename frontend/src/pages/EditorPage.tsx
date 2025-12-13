import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Group, Select, Stack, TextInput, Textarea, Title } from '@mantine/core';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { createPost, getRawPost, updatePost } from '../api/posts';
import type { PostInput } from '../api/posts';

const defaultPost: PostInput = {
  title: '',
  summary: '',
  content: '',
  status: 'draft',
  tags: [],
};

export default function EditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: existing, isLoading, error } = useQuery({
    queryKey: ['post', slug, 'raw'],
    queryFn: () => getRawPost(slug || ''),
    enabled: !!slug,
  });

  const [post, setPost] = useState<PostInput>(defaultPost);
  const [tagInput, setTagInput] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setPost({
        title: existing.title,
        summary: existing.summary,
        content: existing.content,
        status: existing.status,
        tags: existing.tags ?? [],
        heroImage: existing.heroImage,
        dateRange: existing.dateRange,
        projectType: existing.projectType,
        publishedAt: existing.publishedAt,
        slug: existing.slug,
      });
      setTagInput((existing.tags ?? []).join(', '));
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async (payload: PostInput) => {
      if (slug) {
        return updatePost(slug, payload);
      }
      return createPost(payload);
    },
    onSuccess: (saved) => {
      void queryClient.invalidateQueries({ queryKey: ['posts'] });
      navigate(`/post/${saved.slug}`);
    },
    onError: () => {
      setSaveError('Failed to save post.');
    },
  });

  const handleSave = () => {
    const nextPayload: PostInput = {
      ...post,
      slug: post.slug || toSlug(post.title),
      tags: parseTags(tagInput),
    };
    saveMutation.mutate(nextPayload);
  };

  const statusOptions = useMemo(
    () => [
      { value: 'draft', label: 'Draft' },
      { value: 'published', label: 'Published' },
    ],
    []
  );

  if (slug && isLoading) return <Alert color="blue">Loading post...</Alert>;
  if (slug && error) return <Alert color="red">Could not load post.</Alert>;

  return (
    <Stack gap="md">
      <Title order={2}>{slug ? 'Edit post' : 'New post'}</Title>
      <Group grow>
        <TextInput
          label="Title"
          required
          value={post.title}
          onChange={(e) => setPost((prev) => ({ ...prev, title: e.target.value }))}
        />
        <TextInput
          label="Slug"
          placeholder="auto-generated if empty"
          value={post.slug ?? ''}
          onChange={(e) => setPost((prev) => ({ ...prev, slug: e.target.value }))}
        />
      </Group>
      <TextInput
        label="Summary"
        required
        value={post.summary}
        onChange={(e) => setPost((prev) => ({ ...prev, summary: e.target.value }))}
      />
      <Group grow>
        <Select
          label="Status"
          data={statusOptions}
          value={post.status ?? 'draft'}
          onChange={(value) => setPost((prev) => ({ ...prev, status: (value as PostInput['status']) ?? 'draft' }))}
        />
        <TextInput
          label="Tags (comma separated)"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          placeholder="product, growth, eng"
        />
      </Group>
      <Textarea
        label="Hero image URL"
        value={post.heroImage ?? ''}
        onChange={(e) => setPost((prev) => ({ ...prev, heroImage: e.target.value }))}
        autosize
        minRows={1}
      />
      <MDEditor value={post.content} onChange={(value) => setPost((prev) => ({ ...prev, content: value || '' }))} height={400} />
      {saveError && <Alert color="red">{saveError}</Alert>}
      <Group justify="flex-end">
        <Button variant="light" onClick={() => navigate(-1)}>
          Cancel
        </Button>
        <Button loading={saveMutation.isPending} onClick={handleSave}>
          {slug ? 'Update' : 'Publish'}
        </Button>
      </Group>
    </Stack>
  );
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function parseTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}
