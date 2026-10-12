"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { LogoMark } from "@/components/Logo";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const setup = params.get("setup") === "1";
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const res = await fetch("/api/auth", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (res.ok) {
      const next = params.get("next");
      // Full navigation so the app shell reloads with the new cookie.
      window.location.href = next && next.startsWith("/") ? next : "/";
      return;
    }
    setErr(((await res.json().catch(() => ({}))) as { error?: string }).error || "Sign-in failed");
    setBusy(false);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="card w-full max-w-sm p-6">
        <div className="mb-6 flex items-center gap-2 text-fg">
          <LogoMark size={28} />
          <span className="font-display text-xl font-semibold">{BRAND.name}</span>
        </div>
        {setup ? (
          <div className="space-y-2 text-sm text-muted">
            <p className="font-medium text-fg">One more step</p>
            <p>Add a <code>SETLO_PASSWORD</code> environment variable in Vercel (Project → Settings → Environment Variables), then redeploy.</p>
          </div>
        ) : (
          <>
            <label className="label">Password</label>
            <input type="password" autoFocus className="input" value={pw} onChange={(e) => setPw(e.target.value)} />
            {err && <p className="mt-2 text-xs text-danger">{err}</p>}
            <button className="btn-primary mt-4 w-full" disabled={!pw || busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </>
        )}
        <p className="mt-6 text-center text-[11px] text-muted">{BRAND.tagline}</p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
