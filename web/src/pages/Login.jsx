import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Email and password required');
      return;
    }

    if (isSignup && !name) {
      setError('Name required');
      return;
    }

    if (isSignup && password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isSignup ? '/api/auth/signup' : '/api/auth/login';
      const body = isSignup ? { email, password, name } : { email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onLogin(data.token, { id: data.userId, name: data.name || 'Resident' });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-navy px-4">
      <div className="w-full max-w-md">
        <div className="bg-navy-2 rounded-lg border border-line p-8">
          <div className="mb-8 text-center">
            <h1 className="font-display text-3xl font-bold text-ink mb-2">UroApp</h1>
            <p className="text-muted text-sm">Residency platform for on-duty clinicians</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-ink mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2 rounded bg-steel border border-line text-ink placeholder-muted-2 focus:outline-none focus:border-violet"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="resident@hospital.edu"
                className="w-full px-4 py-2 rounded bg-steel border border-line text-ink placeholder-muted-2 focus:outline-none focus:border-violet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-2">Password</label>
              <input
                type="text"
                inputMode="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 rounded bg-steel border border-line text-ink placeholder-muted-2 focus:outline-none focus:border-violet"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="p-3 rounded bg-crimson/10 border border-crimson/30 text-crimson text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded bg-violet text-navy font-semibold hover:bg-violet-soft transition disabled:opacity-50"
            >
              {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="text-violet-soft hover:text-violet text-sm transition"
            >
              {isSignup ? 'Already have an account? Log in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <p className="text-center text-muted-2 text-xs mt-6">
          Demo: email@example.com / password
        </p>
      </div>
    </div>
  );
}
