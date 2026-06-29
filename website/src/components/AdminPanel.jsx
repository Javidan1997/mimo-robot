import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, isSupabaseConfigured, usernameToEmail } from "../lib/supabase.js";

function fmt(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return ts;
  }
}

function Metric({ label, value }) {
  return (
    <div className="admin-metric">
      <span className="admin-metric__value">{value}</span>
      <span className="admin-metric__label">{label}</span>
    </div>
  );
}

function LoginView({ onSignedIn }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const email = usernameToEmail(username);
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (err) {
      setError("Invalid username or password.");
      return;
    }
    onSignedIn();
  };

  return (
    <form className="admin-login glass" onSubmit={submit}>
      <h1>Mimo Admin</h1>
      <p className="admin-login__hint">Sign in to view forms, the early list, and interactions.</p>
      <label>
        Username
        <input
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="mimoadmin"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="admin-login__error">{error}</p>}
      <button className="btn btn--primary" type="submit" disabled={busy}>
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function Dashboard({ onSignOut }) {
  const [tab, setTab] = useState("overview");
  const [contacts, setContacts] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const [c, w, e] = await Promise.all([
      supabase.from("contact_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist").select("*").order("created_at", { ascending: false }),
      supabase.from("events").select("*").order("created_at", { ascending: false }).limit(2000),
    ]);
    const firstErr = c.error || w.error || e.error;
    if (firstErr) setError(firstErr.message);
    setContacts(c.data || []);
    setWaitlist(w.data || []);
    setEvents(e.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const visitors = new Set();
    const byName = {};
    const byDevice = {};
    const byReferrer = {};
    let pageViews = 0;
    for (const ev of events) {
      if (ev.visitor_id) visitors.add(ev.visitor_id);
      byName[ev.name] = (byName[ev.name] || 0) + 1;
      if (ev.name === "page_view") pageViews += 1;
      const d = ev.meta?.device || "unknown";
      byDevice[d] = (byDevice[d] || 0) + 1;
      let ref = ev.meta?.referrer || "direct";
      try {
        if (ref !== "direct") ref = new URL(ref).hostname;
      } catch {
        /* keep raw */
      }
      byReferrer[ref] = (byReferrer[ref] || 0) + 1;
    }
    const top = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);
    return {
      visitors: visitors.size,
      pageViews,
      byName: top(byName),
      byDevice: top(byDevice),
      byReferrer: top(byReferrer).slice(0, 8),
    };
  }, [events]);

  const exportCsv = (rows, columns, filename) => {
    const head = columns.join(",");
    const body = rows
      .map((r) =>
        columns
          .map((col) => {
            const raw = col.split(".").reduce((o, k) => (o == null ? o : o[k]), r);
            const val = raw == null ? "" : typeof raw === "object" ? JSON.stringify(raw) : String(raw);
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([`${head}\n${body}`], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-shell">
      <header className="admin-bar">
        <div className="admin-bar__brand">
          <span className="nav__logo" aria-hidden="true">
            <span className="nav__logo-ring" />
          </span>
          <strong>Mimo Admin</strong>
        </div>
        <nav className="admin-tabs">
          {[
            ["overview", "Overview"],
            ["contacts", `Contact (${contacts.length})`],
            ["waitlist", `Early list (${waitlist.length})`],
            ["events", `Interactions (${events.length})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={tab === key ? "is-active" : ""}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </nav>
        <div className="admin-bar__actions">
          <button type="button" className="btn btn--ghost" onClick={load}>
            Refresh
          </button>
          <button type="button" className="btn btn--ghost" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </header>

      {error && <p className="admin-error">Could not load data: {error}</p>}
      {loading ? (
        <p className="admin-loading">Loading…</p>
      ) : (
        <main className="admin-content">
          {tab === "overview" && (
            <>
              <div className="admin-metrics">
                <Metric label="Unique visitors" value={stats.visitors} />
                <Metric label="Page views" value={stats.pageViews} />
                <Metric label="Contact messages" value={contacts.length} />
                <Metric label="Early list" value={waitlist.length} />
              </div>
              <div className="admin-cols">
                <section className="admin-card glass">
                  <h3>Interactions by type</h3>
                  <ul className="admin-bars">
                    {stats.byName.map(([name, count]) => (
                      <li key={name}>
                        <span>{name}</span>
                        <b>{count}</b>
                      </li>
                    ))}
                    {stats.byName.length === 0 && <li className="admin-empty">No events yet.</li>}
                  </ul>
                </section>
                <section className="admin-card glass">
                  <h3>Devices</h3>
                  <ul className="admin-bars">
                    {stats.byDevice.map(([name, count]) => (
                      <li key={name}>
                        <span>{name}</span>
                        <b>{count}</b>
                      </li>
                    ))}
                    {stats.byDevice.length === 0 && <li className="admin-empty">No data yet.</li>}
                  </ul>
                </section>
                <section className="admin-card glass">
                  <h3>Top referrers</h3>
                  <ul className="admin-bars">
                    {stats.byReferrer.map(([name, count]) => (
                      <li key={name}>
                        <span>{name}</span>
                        <b>{count}</b>
                      </li>
                    ))}
                    {stats.byReferrer.length === 0 && <li className="admin-empty">No data yet.</li>}
                  </ul>
                </section>
              </div>
            </>
          )}

          {tab === "contacts" && (
            <section className="admin-card glass">
              <div className="admin-card__head">
                <h3>Contact submissions</h3>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => exportCsv(contacts, ["created_at", "name", "email", "message"], "mimo-contacts.csv")}
                >
                  Export CSV
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((r) => (
                      <tr key={r.id}>
                        <td>{fmt(r.created_at)}</td>
                        <td>{r.name}</td>
                        <td>{r.email}</td>
                        <td className="admin-msg">{r.message}</td>
                      </tr>
                    ))}
                    {contacts.length === 0 && (
                      <tr>
                        <td colSpan={4} className="admin-empty">No contact messages yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "waitlist" && (
            <section className="admin-card glass">
              <div className="admin-card__head">
                <h3>Early access list</h3>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => exportCsv(waitlist, ["created_at", "email"], "mimo-early-list.csv")}
                >
                  Export CSV
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlist.map((r) => (
                      <tr key={r.id}>
                        <td>{fmt(r.created_at)}</td>
                        <td>{r.email}</td>
                      </tr>
                    ))}
                    {waitlist.length === 0 && (
                      <tr>
                        <td colSpan={2} className="admin-empty">No signups yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {tab === "events" && (
            <section className="admin-card glass">
              <div className="admin-card__head">
                <h3>Recent interactions</h3>
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => exportCsv(events, ["created_at", "name", "visitor_id", "meta.device", "meta.path", "props"], "mimo-events.csv")}
                >
                  Export CSV
                </button>
              </div>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Event</th>
                      <th>Device</th>
                      <th>Path</th>
                      <th>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.slice(0, 500).map((r) => (
                      <tr key={r.id}>
                        <td>{fmt(r.created_at)}</td>
                        <td>{r.name}</td>
                        <td>{r.meta?.device || "-"}</td>
                        <td className="admin-msg">{r.meta?.path || "-"}</td>
                        <td className="admin-msg">{r.props && Object.keys(r.props).length ? JSON.stringify(r.props) : "-"}</td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={5} className="admin-empty">No interactions tracked yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}

export default function AdminPanel() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="admin-root">
      <a className="admin-exit" href="#top" onClick={() => { window.location.hash = ""; }}>
        Back to site
      </a>
      {!isSupabaseConfigured ? (
        <div className="admin-login glass">
          <h1>Mimo Admin</h1>
          <p className="admin-login__hint">
            Supabase is not configured yet. Add <code>VITE_SUPABASE_URL</code> and{" "}
            <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env.local</code> (see{" "}
            <code>website/supabase/schema.sql</code> for setup), then redeploy.
          </p>
        </div>
      ) : !ready ? (
        <p className="admin-loading">Loading…</p>
      ) : session ? (
        <Dashboard onSignOut={signOut} />
      ) : (
        <LoginView onSignedIn={() => {}} />
      )}
    </div>
  );
}
