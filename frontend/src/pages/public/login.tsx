import { useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Seo } from '@/components/Seo';
import { Button, Field, Input } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { session, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (session) navigate('/admin', { replace: true });
  }, [navigate, session]);

  if (session) return null;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password, true);
      navigate(params.get('returnTo') ?? '/admin');
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="v2-login v2-page-top">
      <Seo title="Studio login" description="Private portfolio content workspace." path="/login" />
      <div className="v2-shell v2-login-layout">
        <div className="v2-login-intro">
          <span>PRIVATE STUDIO / ACCESS</span>
          <h1>Content with clear ownership.</h1>
          <p>Authentication is handled by the Spring Boot backend with secure, HttpOnly session cookies.</p>
        </div>
        <form className="v2-access-form" onSubmit={submit}>
          <Field label="Email"><Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></Field>
          <Field label="Password" controlId="studio-password">
            <div className="v2-password-field">
              <Input
                id="studio-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="v2-password-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff aria-hidden="true" size={17} /> : <Eye aria-hidden="true" size={17} />}
              </button>
            </div>
          </Field>
          {error ? <p className="v2-form-error" role="alert">{error}</p> : null}
          <Button type="submit" disabled={loading}>{loading ? 'Signing in...' : 'Enter studio'}</Button>
        </form>
      </div>
    </div>
  );
}