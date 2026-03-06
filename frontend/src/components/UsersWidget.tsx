
import React from "react";
import { useStats } from "../hooks/useStats";
import StatCard from "./StatCard";
import { formatPercentage } from "../utils/format";

type UsersWidgetProps = {
  title?: string;
  compact?: boolean;
};

export default function UsersWidget({ title = "Users Overview", compact }: UsersWidgetProps) {
  const { data, loading, error, lastUpdated, refresh } = useStats();

  const renderSkeleton = () => (
    <div className="users-widget-grid" aria-hidden="true">
      <div className="stat-skeleton" />
      <div className="stat-skeleton" />
      <div className="stat-skeleton" />
    </div>
  );

  const renderError = () => (
    <div className="users-widget-error" role="alert">
      <div>
        <strong>Couldn&apos;t fetch stats</strong>
        <div>Check the backend or your network.</div>
      </div>
      <div className="users-widget-error_actions">
        <button
          type="button"
          className="users-widget-error_retry"
          onClick={refresh}
        >
          Retry
        </button>
      </div>
    </div>
  );

  const safeUsers = Number.isFinite(data?.users ?? NaN) ? data!.users : 0;
  const safeActive = Number.isFinite(data?.active_today ?? NaN) ? data!.active_today : 0;

  const isEmpty = !loading && !error && (!data || safeUsers === 0);

  return (
    <section
      className="users-widget-shell"
      aria-label="Users statistics widget"
    >
      <div className="users-widget">
        <header className="users-widget-header">
          <div>
            <div className="users-widget-title">{title}</div>
            <div className="users-widget-meta">
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Fetching latest data"}
            </div>
          </div>
          <button
            type="button"
            className="users-widget-refresh"
            onClick={refresh}
            disabled={loading}
            aria-label="Refresh user statistics"
          >
            ⟳
            <span>{loading ? "Refreshing…" : "Refresh"}</span>
          </button>
        </header>

        {loading && renderSkeleton()}

        {!loading && error && renderError()}

        {!loading && !error && !isEmpty && data && (
          <div className="users-widget-grid">
            <StatCard
              label="Total Users"
              value={safeUsers.toLocaleString()}
              hint="All time"
            />
            <StatCard
              label="Active Today"
              value={safeActive.toLocaleString()}
              hint={`${Math.round((safeActive / safeUsers) * 100)}% of users`}
            />
            <StatCard
              label="Conversion Rate"
              value={formatPercentage(data.conversion_rate)}
              hint="Last 24 hours"
              accent
            />
          </div>
        )}

        {isEmpty && !loading && !error && (
          <div className="users-widget-error" role="status">
            <div>
              <strong>No users yet</strong>
              <div>Once users arrive, this widget will populate automatically.</div>
            </div>
          </div>
        )}

        <footer className="users-widget-footer">
          <div
            className={`users-widget-status${
              error ? " users-widget-status--error" : ""
            }`}
            aria-live="polite"
          >
            <span className="users-widget-dot" />
            <span>{error ? "Degraded" : loading ? "Updating" : "Live"}</span>
          </div>
          {!compact && (
            <div className="users-widget-pill">
              User activity overview
            </div>
          )}
        </footer>
      </div>
    </section>
  );
}
