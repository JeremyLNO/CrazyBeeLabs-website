"use client";

import { useState } from "react";

type Res = { stmt: string; ok: boolean; error?: string };

export function MigrateButton() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Res[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch("/api/admin/migrate", { method: "POST" });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Migration failed.");
      else setResults(data.results as Res[]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button className="btn btn-primary" onClick={run} disabled={loading}>
        {loading ? "Running…" : "Run pending migrations"}
      </button>
      {error && <p className="alert alert-error mt-m">{error}</p>}
      {results && (
        <div className="table-wrap mt-m">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Statement</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={i}>
                  <td className="mono-sm">{r.stmt}…</td>
                  <td>{r.ok ? "✓ ok" : `✕ ${r.error}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
