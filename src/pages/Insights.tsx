import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import {
  generateInsights,
  practiceTotals,
  practiceTotalsByInstrument,
  type Insight,
  type InsightTone,
} from '../domain';
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
  // A LIVE clock: this page can sit open across midnight, and a `now` frozen at
  // mount would keep reporting yesterday's blocks as today's — and, on a Monday
  // rollover, last week's as this week's. One clock for the whole page, passed
  // down, so the totals below can never drift from the insights above.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const insights = useMemo(() => generateInsights(db, now, windowDays), [db, now, windowDays]);

  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">Insights</h1>
        <p className="page-sub">Calm, neutral patterns from your practice — not a scoreboard.</p>
      </header>

      <PractiseTotals now={now} />

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

/**
 * How much practice there has actually been: today, this week and all time,
 * overall and per instrument. CALENDAR figures — a block belongs whole to the
 * local day it began, and the week starts Monday, so a session begun Sunday
 * 23:30 belongs to the week that is ending. Neutral counts of minutes and
 * blocks: no goal, no streak, no score, no bar that fills, no colour that
 * judges.
 */
function PractiseTotals({ now }: { now: Date }) {
  const db = useStore((s) => s.db);
  const overall = useMemo(() => practiceTotals(db.blocks, now), [db.blocks, now]);
  // EVERY instrument, not just the active ones. The "All instruments" row
  // counts every block, so filtering the per-instrument rows down to the active
  // ones left a retired instrument's history with no row of its own and the
  // rows silently short of the total. Instruments are never deleted (only made
  // inactive), so this covers every block; rows with nothing to report are
  // dropped so the table stays a list of practice rather than of instruments.
  const rows = useMemo(
    () => practiceTotalsByInstrument(db.instruments, db.blocks, now).filter((r) => r.allTime.blocks > 0),
    [db.instruments, db.blocks, now],
  );
  if (overall.allTime.blocks === 0) return null;

  return (
    <section className="card stack-sm">
      <div className="section-label">Time practised</div>
      <div className="table-scroll" style={{ overflowX: 'auto' }}>
        <table className="small" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={CELL} scope="col"></th>
              <th style={NUM} scope="col">Today</th>
              <th style={NUM} scope="col">This week</th>
              <th style={NUM} scope="col">All time</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={{ ...CELL, fontWeight: 600 }} scope="row">All instruments</th>
              <td style={NUM}>{cell(overall.today)}</td>
              <td style={NUM}>{cell(overall.week)}</td>
              <td style={NUM}>{cell(overall.allTime)}</td>
            </tr>
            {rows.map((r) => (
              <tr key={r.instrumentId}>
                <th style={CELL} scope="row" className="dim">{r.instrumentName}</th>
                <td style={NUM} className="dim">{cell(r.today)}</td>
                <td style={NUM} className="dim">{cell(r.week)}</td>
                <td style={NUM} className="dim">{cell(r.allTime)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="tiny faint">
        Counted by calendar day, and the week starts Monday — a block belongs whole to the day it began.
      </p>
    </section>
  );
}

const CELL: CSSProperties = { textAlign: 'left', padding: '4px 8px 4px 0', whiteSpace: 'nowrap' };
const NUM: CSSProperties = { textAlign: 'right', padding: '4px 0 4px 8px', whiteSpace: 'nowrap' };

function cell(t: { minutes: number; blocks: number }): string {
  return `${t.minutes} min · ${t.blocks}`;
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
