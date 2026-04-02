'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { createClient } from '@/lib/supabase/browser';
import Link from 'next/link';

export default function LoginPage() {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setStatus(null);

    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });

    setLoading(false);
    setStatus(error ? error.message : 'Magic link sent. Check your email and come back hungry for supply savings.');
  }

  return (
    <main className="shell container" style={{ maxWidth: 720 }}>
      <div className="topbar">
        <div className="brand">
          <strong>TradeBase SG</strong>
          <span>Sign in to join the hawker network.</span>
        </div>
        <Link href="/" className="button-ghost">
          Back home
        </Link>
      </div>

      <section className="card pad">
        <span className="kicker">Join with email</span>
        <h1 style={{ margin: '8px 0 10px', fontSize: '2.3rem', lineHeight: 1.05 }}>Get a TradeBase ID.</h1>
        <p className="subtle" style={{ marginTop: 0 }}>
          A magic link logs you in. After that, you claim your stall profile and start posting requests.
        </p>

        <form className="form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="owner@stall.sg"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-actions">
            <button className="button" disabled={loading} type="submit">
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
            <span className="notice">The link comes from Supabase Auth. Humans, briefly, are optional.</span>
          </div>
        </form>

        {status ? (
          <div className="item" style={{ marginTop: 16 }}>
            <strong>{status}</strong>
          </div>
        ) : null}
      </section>
    </main>
  );
}
