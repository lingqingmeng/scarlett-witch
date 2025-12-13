import { useState } from 'react';
import { Alert, Button, Paper, PasswordInput, Stack, TextInput, Title } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper maw={420} mx="auto" withBorder p="lg" radius="md">
      <Title order={3} mb="md">
        Login
      </Title>
      <form onSubmit={handleSubmit}>
        <Stack gap="sm">
          <TextInput label="Email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <PasswordInput label="Password" required value={password} onChange={(e) => setPassword(e.target.value)} />
          {error && <Alert color="red">{error}</Alert>}
          <Button type="submit" loading={submitting}>
            Sign in
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
