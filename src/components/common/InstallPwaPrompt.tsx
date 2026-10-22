import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
};

export function InstallPwaPrompt() {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallable(true);
    };

    const onAppInstalled = () => {
      setInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setInstallable(false);
    setDeferredPrompt(null);
  };

  if (!installable) {
    return null;
  }

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 md:inset-x-auto md:right-6 md:bottom-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#0D5C5A]/15 bg-[#0F172A]/95 px-4 py-3 text-white shadow-2xl backdrop-blur-md">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-emerald-200">BalayKo app</p>
          <p className="mt-1 text-sm font-semibold text-white">Install for faster access, offline use, and a cleaner mobile experience.</p>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="shrink-0 rounded-xl bg-[#22C55E] px-3 py-2 text-xs font-bold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:bg-[#16A34A]"
        >
          Install app
        </button>
      </div>
    </div>
  );
}
