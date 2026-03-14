"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid credentials.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div
        className="w-full max-w-sm border border-gray-700 bg-gray-900/80 p-8"
        style={{ backdropFilter: "blur(8px)" }}
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs font-mono text-cyan-400 tracking-[0.3em] uppercase mb-1">
            Classified Access
          </p>
          <h1 className="text-xl font-mono font-bold text-gray-100 tracking-widest uppercase">
            WORLDVIEW
          </h1>
          <div className="mt-2 h-px bg-gradient-to-r from-transparent via-cyan-800 to-transparent" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
              Identifier
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-black border border-gray-700 text-gray-100 font-mono text-sm px-3 py-2 focus:outline-none focus:border-cyan-700 placeholder-gray-600"
              placeholder="user@domain.com"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 uppercase tracking-widest mb-1">
              Passphrase
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-black border border-gray-700 text-gray-100 font-mono text-sm px-3 py-2 focus:outline-none focus:border-cyan-700"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs font-mono text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-900 hover:bg-cyan-800 disabled:opacity-50 text-cyan-100 font-mono text-sm uppercase tracking-widest py-2 transition-colors"
          >
            {loading ? "Authenticating..." : "Authenticate"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-mono text-gray-600 tracking-widest">
          UNAUTHORIZED ACCESS PROHIBITED
        </p>
      </div>
    </div>
  );
}
