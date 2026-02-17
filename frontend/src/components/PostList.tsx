import { Badge, Card, Group, Stack, Text, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import type { Post } from '../api/posts';
import { formatDate } from '../utils/date';

const renderAuthor = (post: Post) => {
  if (post.authorEmail) {
    return post.authorEmail.split('@')[0];
  }
  if (post.authorId) {
    return String(post.authorId);
  }
  return null;
};

export function PostList({ posts, showStatus }: { posts: Post[]; showStatus?: boolean }) {
  if (!posts.length) {
    return <Text c="dimmed">No posts yet.</Text>;
  }

  return (
    <Stack gap="md">
      {posts.map((post) => (
        <Card key={post.slug} withBorder radius="md" padding="md">
          <Group justify="space-between" align="flex-start" mb="xs">
            <div>
              <Title order={4} mb={4}>
                <Link to={`/post/${post.slug}`} className="link-plain">
                  {post.title}
                </Link>
              </Title>
              <Group gap="xs">
                <Text size="sm" c="dimmed">
                  {formatDate(post.publishedAt)}
                </Text>
                {renderAuthor(post) && (
                  <Text size="sm" c="dimmed">
                    · Author: {renderAuthor(post)}
                  </Text>
                )}
              </Group>
            </div>
            {showStatus && post.status && (
              <Badge variant={post.status === 'published' ? 'filled' : 'outline'} color={post.status === 'published' ? 'green' : 'gray'}>
                {post.status}
              </Badge>
            )}
          </Group>
          <Text size="sm">{post.summary}</Text>
          {post.tags && post.tags.length > 0 && (
            <Group gap="xs" mt="xs">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="light">
                  {tag}
                </Badge>
              ))}
            </Group>
          )}
        </Card>
      ))}
    </Stack>
  );
}

export default PostList;
