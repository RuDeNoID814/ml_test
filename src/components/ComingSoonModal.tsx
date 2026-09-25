import Link from 'next/link';

export function ComingSoonModal({ label, onClose }: { label: string; onClose?: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="bg-ink/40 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="border-line/60 bg-paper relative w-full max-w-[440px] rounded-[16px] border p-6 text-center shadow-[0_40px_80px_-30px_rgba(0,0,0,0.5)]">
        <h3 className="font-display text-ink mb-3 text-[20px] font-semibold">
          {label} — пока в разработке
        </h3>
        <p className="text-ink-3 mb-6 text-[14px]">Но вы не отчаивайтесь. Скоро всё будет!</p>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="bg-accent text-paper hover:bg-accent-deep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)]"
          >
            Понятно
          </button>
        ) : (
          <Link
            href="/"
            className="bg-accent text-paper hover:bg-accent-deep inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all hover:shadow-[0_12px_24px_-10px_rgba(232,93,47,0.6)]"
          >
            На главную
          </Link>
        )}
      </div>
    </div>
  );
}
