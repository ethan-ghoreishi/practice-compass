import { Link } from 'react-router-dom';
import {
  FOCUS_LABELS,
  ITEM_TYPE_LABELS,
  type PracticeItem,
} from '../domain';
import { useStore } from '../store/useStore';
import { instrumentName } from '../store/lookups';
import { Stars, StatusBadge } from './ui';
import { ClockIcon, FlagIcon, PaperclipIcon } from './icons';
import { formatMinutes, relativeDay, relativeFromDateTime } from './format';

export default function ItemCard({ item, now = new Date() }: { item: PracticeItem; now?: Date }) {
  const db = useStore((s) => s.db);
  const inst = instrumentName(db, item.instrumentId);
  const fileCount = db.attachments.filter((a) => a.itemId === item.id).length;

  return (
    <Link to={`/items/${item.id}`} className="card card-link">
      <div className="row between" style={{ alignItems: 'flex-start' }}>
        <div className="grow">
          <div className="title-md">{item.title}</div>
          <div className="row-wrap small dim" style={{ marginTop: 3 }}>
            <span>{inst}</span>
            <span className="faint">·</span>
            <span>{ITEM_TYPE_LABELS[item.itemType]}</span>
            {item.primaryFocus && (
              <>
                <span className="faint">·</span>
                <span>{FOCUS_LABELS[item.primaryFocus]}</span>
              </>
            )}
          </div>
        </div>
        <StatusBadge status={item.status} />
      </div>

      {item.currentProblem && (
        <div className="small dim" style={{ marginTop: 8 }}>
          {item.currentProblem}
        </div>
      )}

      <div className="row-wrap tiny faint" style={{ marginTop: 10, gap: 12, rowGap: 6 }}>
        <span className="row" style={{ gap: 5 }}>
          <Stars value={item.importance} /> <span>importance</span>
        </span>
        <span>difficulty {item.difficulty}/5</span>
        <span className="mono-num">{item.timesPractised}× · {formatMinutes(item.totalMinutes)}</span>
        <span>last {relativeFromDateTime(item.lastPractisedAt, now)}</span>
        {item.nextReviewDate && (
          <span className="row" style={{ gap: 4 }}>
            <ClockIcon width={12} height={12} /> review {relativeDay(item.nextReviewDate, now)}
          </span>
        )}
        {item.teacherQuestion && (
          <span className="row warn-flag" style={{ gap: 4 }}>
            <FlagIcon width={12} height={12} /> teacher
          </span>
        )}
        {fileCount > 0 && (
          <span className="row" style={{ gap: 4 }}>
            <PaperclipIcon width={12} height={12} /> {fileCount}
          </span>
        )}
        {item.saturationWarning && <span className="warn-flag">saturated</span>}
      </div>
    </Link>
  );
}
