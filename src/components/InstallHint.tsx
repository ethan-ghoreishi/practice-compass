import { useEffect, useState } from 'react';
import { XIcon } from './icons';

// Minimal type for the (non-standard) Chrome install prompt event.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'pc-install-dismissed';

function isStandalone(): boolean {
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/**
 * A calm, dismissible nudge to install the app. On Chromium it offers a native
 * install button; on iOS Safari (which has no prompt) it shows the Share →
 * "Add to Home Screen" steps. Hidden once installed or dismissed.
 */
export default function InstallHint() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      setDismissed(true);
      return;
    }
    const ua = navigator.userAgent;
    setIsIOS(/iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios/i.test(ua));
    const onBIP = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', onBIP);
    return () => window.removeEventListener('beforeinstallprompt', onBIP);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  }

  if (dismissed || (!isIOS && !deferred)) return null;

  return (
    <div className="card card-accent stack-sm" style={{ position: 'relative' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={dismiss}
        aria-label="Dismiss"
        style={{ position: 'absolute', top: 6, right: 6, minHeight: 28, padding: 4 }}
      >
        <XIcon width={16} height={16} />
      </button>
      <div className="eyebrow">Practice on the go</div>
      {deferred ? (
        <>
          <div className="small">Install Practice Compass as an app — it works offline and opens full-screen.</div>
          <button
            className="btn btn-primary btn-sm"
            style={{ width: 'fit-content' }}
            onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              dismiss();
            }}
          >
            Install app
          </button>
        </>
      ) : (
        <div className="small">
          Add to your iPhone: tap the <strong>Share</strong> button{' '}
          <span aria-hidden>􀈂</span> in Safari, then <strong>“Add to Home Screen.”</strong> It opens full-screen and works
          offline.
        </div>
      )}
    </div>
  );
}
