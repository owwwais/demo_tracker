import type { ReactNode } from 'react'
import { STATUS_META } from '../demo/data'
import type { Status } from '../demo/types'

export function Wordmark({ light = false, className = '' }: { light?: boolean; className?: string }) {
  return (
    <span dir="ltr" className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden className="stripes block h-5 w-5 rounded-[5px] bg-ink" />
      <span className={`font-display text-[22px] leading-none tracking-[.04em] ${light ? 'text-white' : 'text-ink'}`}>TRACKER</span>
    </span>
  )
}

const toneCls = {
  green: 'bg-brand-50 text-brand',
  gold: 'bg-gold-50 text-gold-text',
  late: 'bg-late-50 text-late-text',
  done: 'bg-brand text-white',
  muted: 'bg-ground text-ink-soft',
}

export function StatusPill({ status, className = '' }: { status: Status; className?: string }) {
  const m = STATUS_META[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12.5px] font-semibold transition-colors duration-500 ${toneCls[m.tone]} ${className}`}
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {m.label}
    </span>
  )
}

/** A phone shell. On very narrow screens the bezel thins so the screen keeps its width. */
export function PhoneFrame({ children, url, tone = 'light' }: { children: ReactNode; url?: string; tone?: 'light' | 'dark' }) {
  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="rounded-[44px] bg-ink-2 p-[7px] shadow-float sm:p-[10px]">
        <div className={`relative flex h-[640px] flex-col overflow-hidden rounded-[36px] ${tone === 'dark' ? 'bg-ink' : 'bg-ground'}`}>
          <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[12px] font-semibold text-ink/80" dir="ltr">
            <span className="tabular">9:41</span>
            <span aria-hidden className="h-[22px] w-[86px] rounded-full bg-ink-2" />
            <span aria-hidden className="flex gap-1">
              <span className="h-2.5 w-1 rounded-sm bg-ink/70" />
              <span className="h-2.5 w-1 rounded-sm bg-ink/70" />
              <span className="h-2.5 w-4 rounded-sm bg-ink/70" />
            </span>
          </div>
          {url && (
            <div className="mx-3 mb-2 flex items-center justify-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 text-[12px] text-ink-soft" dir="ltr">
              <svg aria-hidden width="10" height="12" viewBox="0 0 10 12" className="fill-ink-soft">
                <path d="M2 5V3.5a3 3 0 0 1 6 0V5h1v7H1V5h1Zm1.2 0h3.6V3.5a1.8 1.8 0 0 0-3.6 0V5Z" />
              </svg>
              {url}
            </div>
          )}
          <div className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          <div aria-hidden className="mx-auto mb-2 mt-1 h-1 w-28 rounded-full bg-ink/25" />
        </div>
      </div>
    </div>
  )
}

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
        className={`animate-slidein max-h-[92vh] w-full overflow-y-auto rounded-t-[24px] bg-white p-5 shadow-float sm:rounded-[24px] sm:p-7 ${wide ? 'sm:max-w-[760px]' : 'sm:max-w-[520px]'}`}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-ground text-ink transition hover:bg-brand-50" aria-label="إغلاق">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export const DemoNote = ({ className = '' }: { className?: string }) => (
  <p className={`text-[12.5px] text-ink-soft ${className}`}>عرض تجريبي ببيانات وهمية</p>
)
