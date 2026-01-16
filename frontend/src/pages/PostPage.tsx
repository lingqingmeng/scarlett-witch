import { Alert, Badge, Group, Stack, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost, getRawPost } from '../api/posts';
import { useAuth } from '../auth/useAuth';
import { formatDate } from '../utils/date';

const renderAuthor = (authorEmail?: string, authorId?: string | number) => {
  if (authorEmail) {
    return authorEmail.split('@')[0];
  }
  if (authorId) {
    return String(authorId);
  }
  return null;
};

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();

  const {
    data: published,
    isLoading: loadingPublished,
    error: publishedError,
  } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug || ''),
    enabled: !!slug,
    retry: false,
  });

  const {
    data: raw,
    isLoading: loadingRaw,
    error: rawError,
  } = useQuery({
    queryKey: ['post', slug, 'raw'],
    queryFn: () => getRawPost(slug || ''),
    enabled: !!slug && !!user && !!publishedError && !loadingPublished,
    retry: false,
  });

  if (!slug) return <Alert color="red">Missing slug</Alert>;

  if (loadingPublished || loadingRaw) return <Alert color="blue">Loading...</Alert>;

  if (published) {
    return (
      <Stack>
        <Title order={1}>{published.title}</Title>
        <Group gap="sm">
          <Text c="dimmed" size="sm">
            {formatDate(published.publishedAt)}
          </Text>
          {renderAuthor(published.authorEmail, published.authorId) && (
            <Text c="dimmed" size="sm">
              · Author: {renderAuthor(published.authorEmail, published.authorId)}
            </Text>
          )}
          {published.tags?.map((tag) => (
            <Badge key={tag} variant="light" size="sm">
              {tag}
            </Badge>
          ))}
        </Group>
        <Text c="dimmed">{published.summary}</Text>
        <div className="markdown-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{published.content}</ReactMarkdown>
        </div>
      </Stack>
    );
  }

  if (raw && user) {
    return (
      <Alert color="yellow">
        This post exists but is still a draft. Publish it to make it visible.
      </Alert>
    );
  }

  if (publishedError || rawError || !published) {
    return <Alert color="red">Post not found.</Alert>;
  }

  return null;
}
