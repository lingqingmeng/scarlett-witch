import { Alert, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { listPublishedPosts } from '../api/posts';
import PostList from '../components/PostList';

export default function HomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['posts', 'published'],
    queryFn: listPublishedPosts,
  });

  if (error) {
    return <Alert color="red">Failed to load posts.</Alert>;
  }

  return (
    <div>
      <Title order={2} mb="md">
        Blog
      </Title>
      {isLoading ? <Alert color="blue">Loading posts...</Alert> : <PostList posts={data ?? []} />}
    </div>
  );
}
