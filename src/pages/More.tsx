import { Link } from 'react-router-dom';
import {
  ChevronRightIcon,
  InsightsIcon,
  ReportIcon,
  SettingsIcon,
} from '../components/icons';

const LINKS = [
  { to: '/insights', label: 'Insights', desc: 'Calm patterns from your practice', icon: InsightsIcon },
  { to: '/report', label: 'Teacher report', desc: 'Copyable lesson summary', icon: ReportIcon },
  { to: '/settings', label: 'Settings & backup', desc: 'Theme, instruments, export/import', icon: SettingsIcon },
];

export default function More() {
  return (
    <div className="stack-lg">
      <header className="stack-sm">
        <h1 className="page-title">More</h1>
        <p className="page-sub">Everything else, one tap away.</p>
      </header>

      <div className="card card-flush list">
        {LINKS.map(({ to, label, desc, icon: Icon }) => (
          <Link key={to} to={to} className="list-row card-link" style={{ borderRadius: 0 }}>
            <Icon width={22} height={22} style={{ color: 'var(--accent)', flex: 'none' }} />
            <div className="grow">
              <div>{label}</div>
              <div className="tiny faint">{desc}</div>
            </div>
            <ChevronRightIcon width={16} height={16} className="faint" />
          </Link>
        ))}
      </div>

      <p className="tiny faint" style={{ textAlign: 'center' }}>
        Practice Compass · local-first · one item, one focus.
      </p>
    </div>
  );
}
