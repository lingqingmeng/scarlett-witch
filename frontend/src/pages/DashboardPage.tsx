import { Alert, Button, Group, Title } from '@mantine/core';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listDraftPosts } from '../api/posts';
import PostList from '../components/PostList';

export default function DashboardPage() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['posts', 'drafts'],
    queryFn: listDraftPosts,
  });

  return (
    <div>
      <Group justify="space-between" mb="md">
        <Title order={2}>Dashboard</Title>
        <Button component={Link} to="/editor">
          New post
        </Button>
      </Group>
      {error && (
        <Alert color="red" mb="md">
          Failed to load posts.
        </Alert>
      )}
      {isLoading ? <Alert color="blue">Loading...</Alert> : <PostList posts={data ?? []} showStatus />}
      <Button variant="subtle" mt="md" onClick={() => refetch()}>
        Refresh
      </Button>
    </div>
  );
}
