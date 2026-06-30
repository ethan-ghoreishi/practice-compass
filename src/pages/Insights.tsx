import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { generateInsights, type Insight, type InsightTone } from '../domain';
import { useStore } from '../store/useStore';
import { EmptyState } from '../components/ui';
import { InsightsIcon } from '../components/icons';

const TONE_COLOR: Record<InsightTone, string> = {
  neutral: 'var(--border-strong)',
  positive: 'var(--tone-good)',
  attention: 'var(--tone-warn)',
};

export default function Insights() {
  const db = useStore((s) => s.db);
  const [windowDays, setWindowDays] = useState(7);
  const now = useMemo(() => new Date(), []);
  const insights = useMemo(() => generateInsights(db, now, windowDays), [db, now, windowDays]);

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Insights</h1>
        <p className="page-sub">Calm, neutral patterns from your practice — not a scoreboard.</p>
      </header>

      <div className="options">
        {[7, 30].map((d) => (
          <button
            key={d}
            className={`option${windowDays === d ? ' selected' : ''}`}
            onClick={() => setWindowDays(d)}
          >
            Last {d} days
          </button>
        ))}
      </div>

      {insights.length === 0 ? (
        <div className="card">
          <EmptyState icon={<InsightsIcon />} title="Not enough to say yet">
            Log a few practice blocks and patterns will appear here.
          </EmptyState>
        </div>
      ) : (
        <div className="stack">
          {insights.map((i) => (
            <InsightCard key={i.id} insight={i} />
          ))}
        </div>
      )}

      <Link to="/report" className="btn btn-block">
        Build a teacher report →
      </Link>
    </div>
  );
}

function InsightCard({ insight }: { insight: Insight }) {
  return (
    <article
      className="card"
      style={{ borderLeft: `3px solid ${TONE_COLOR[insight.tone]}` }}
    >
      <div className="section-label" style={{ marginBottom: 4 }}>
        {insight.category}
      </div>
      <div className="title-md" style={{ fontSize: '1.05rem', marginBottom: 4 }}>
        {insight.title}
      </div>
      <div className="small dim">{insight.body}</div>
    </article>
  );
}
