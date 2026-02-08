import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { useAuth } from '../hooks/useAuth';

const LoginPage: React.FC = () => {
  const { profile, signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await signIn(email, password);
    } catch (err) {
      setError('Unable to sign in. Please check your credentials and try again.');
    }
  };

  if (profile) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">KTK Connect</p>
          <h1 className="text-2xl font-semibold text-slate-900">Sign in</h1>
          <p className="text-sm text-slate-500">
            Use your club email to access bookings, training plans, and announcements.
          </p>
        </div>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-slate-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="block text-sm font-semibold text-slate-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        <div className="mt-6 rounded-lg border border-dashed border-slate-200 p-3 text-xs text-slate-500">
          <p className="font-semibold text-slate-600">Role-based access reminder</p>
          <p className="mt-2">
            Admins see every module, coaches see their own groups, parents see linked players, and
            players see their training and bookings.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
