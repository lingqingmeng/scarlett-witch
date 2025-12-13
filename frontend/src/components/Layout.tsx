import { Anchor, Button, Container, Group, Title } from '@mantine/core';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="navbar">
        <Container size="lg">
          <Group justify="space-between" align="center">
            <Group gap="md" align="center">
              <Anchor component={Link} to="/" className="brand">
                <Title order={3}>Scarlett CMS</Title>
              </Anchor>
              <Anchor component={Link} to="/dashboard">
                Dashboard
              </Anchor>
              {user && (
                <Anchor component={Link} to="/editor">
                  New post
                </Anchor>
              )}
            </Group>
            <Group gap="xs">
              {user ? (
                <>
                  <span className="muted">{user.email}</span>
                  <Button variant="light" size="xs" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              ) : (
                <Button component={Link} to="/login" size="xs">
                  Login
                </Button>
              )}
            </Group>
          </Group>
        </Container>
      </header>
      <main>
        <Container size="lg" py="md">
          <Outlet />
        </Container>
      </main>
    </div>
  );
}

export default Layout;
