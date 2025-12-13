import { Alert, Title } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { listPublishedPosts } from '../api/posts';
import PostList from '../components/PostList';
import { branding } from '../config/branding';

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
      <div className="post-hero">
        <div className="post-hero__text">
          <h2 className="post-hero__title">{branding.title}</h2>
          <p className="post-hero__subtitle">{branding.subtitle}</p>
        </div>
        <img
          className="post-hero__image"
          src={branding.image}
          alt={branding.title}
          loading="lazy"
        />
      </div>
      <Title order={2} mb="md">
        Blog
      </Title>
      {isLoading ? <Alert color="blue">Loading posts...</Alert> : <PostList posts={data ?? []} />}
    </div>
  );
}
