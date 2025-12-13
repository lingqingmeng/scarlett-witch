import { Alert, Badge, Group, Stack, Title, Text } from '@mantine/core';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getPost } from '../api/posts';
import { formatDate } from '../utils/date';

export default function PostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['post', slug],
    queryFn: () => getPost(slug || ''),
    enabled: !!slug,
  });

  if (!slug) return <Alert color="red">Missing slug</Alert>;

  if (isLoading) return <Alert color="blue">Loading...</Alert>;
  if (error || !data) return <Alert color="red">Post not found.</Alert>;

  return (
    <Stack>
      <Title order={1}>{data.title}</Title>
      <Group gap="sm">
        <Text c="dimmed" size="sm">
          {formatDate(data.publishedAt)}
        </Text>
        {data.tags?.map((tag) => (
          <Badge key={tag} variant="light" size="sm">
            {tag}
          </Badge>
        ))}
      </Group>
      <Text c="dimmed">{data.summary}</Text>
      <div className="markdown-body">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{data.content}</ReactMarkdown>
      </div>
    </Stack>
  );
}
