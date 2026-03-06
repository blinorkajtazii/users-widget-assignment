
import React from "react";

type Props = {
  label: string;
  value: string | number;
  hint?: string;
  accent?: boolean;
};

export default function StatCard({ label, value, hint, accent }: Props) {
  return (
    <article
      className={`stat-card${accent ? " stat-card--accent" : ""}`}
      aria-label={label}
    >
      <div className="stat-card_label">{label}</div>
      <div className="stat-card_value">{value}</div>
      {hint && <div className="stat-card_hint">{hint}</div>}
    </article>
  );
}
