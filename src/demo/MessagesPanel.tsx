import { useEffect, useRef, useState } from 'react'
import { MessageSquareText } from 'lucide-react'
import { fmtTime, TRACK_URL, DRIVER_URL } from './state'
import type { Message, Party, Role } from './types'

const WHO: Record<Party, { label: string; dot: string }> = {
  sender: { label: 'المرسل', dot: 'bg-brand' },
  recipient: { label: 'المرسل إليه', dot: 'bg-brand' },
  driver: { label: 'السائق', dot: 'bg-gold' },
  driver2: { label: 'السائق البديل', dot: 'bg-gold' },
  office: { label: 'المكتب', dot: 'bg-ink' },
}

const FILTERS: { id: 'all' | Party; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'sender', label: 'المرسل' },
  { id: 'recipient', label: 'المرسل إليه' },
  { id: 'driver', label: 'السائق' },
  { id: 'office', label: 'المكتب' },
]

export function MessagesPanel({ messages, onOpen, className = '' }: { messages: Message[]; onOpen: (r: Role) => void; className?: string }) {
  const [filter, setFilter] = useState<'all' | Party>('all')
  const list = messages.filter((m) => filter === 'all' || m.to === filter || (filter === 'driver' && m.to === 'driver2'))
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = end.current?.parentElement
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [list.length])

  return (
    <section aria-labelledby="msgs-h" className={`card flex flex-col overflow-hidden ${className}`}>
      <div className="bg-ink px-5 pb-3 pt-4 text-white">
        <h2 id="msgs-h" className="flex items-center gap-2 text-[16px] font-bold">
          <MessageSquareText size={18} aria-hidden /> الرسائل
          <span className="tabular ms-auto rounded-full bg-white/10 px-2 py-0.5 text-[12.5px] font-semibold">{messages.length}</span>
        </h2>
        <p className="mt-0.5 text-[12.5px] text-white/70">كما تصل كل طرف على جواله</p>
        <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="تصفية الرسائل">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-semibold transition ${filter === f.id ? 'bg-white text-ink' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[220px] flex-1 space-y-3 overflow-y-auto bg-[#EEF2F0] p-3 sm:p-4" aria-live="polite">
        {list.length === 0 && (
          <p className="mx-auto mt-10 max-w-[240px] text-center text-[14px] text-ink-soft">
            {messages.length === 0 ? 'لم تُرسل أي رسالة بعد. ستظهر هنا لحظة إرسالها.' : 'لا رسائل لهذا الطرف بعد.'}
          </p>
        )}
        {list.map((m) => (
          <article key={m.id} className="animate-slidein">
            <p className="mb-1 flex items-center gap-1.5 px-1 text-[12px] text-ink-soft">
              <span aria-hidden className={`h-2 w-2 rounded-full ${WHO[m.to].dot}`} />
              إلى <b className="font-semibold text-ink">{m.toName}</b> · {WHO[m.to].label}
            </p>
            <div className="max-w-[94%] rounded-2xl rounded-ss-md bg-bubble px-3.5 py-2.5 text-[14px] leading-relaxed text-ink">
              <p>{m.body}</p>
              {m.code && (
                <p className="tabular mt-2 rounded-xl bg-white/70 py-1.5 text-center text-[22px] font-bold tracking-[.3em]" dir="ltr">
                  {m.code}
                </p>
              )}
              {m.link && (
                <button
                  onClick={() => onOpen(m.link === 'tracking' ? 'tracking' : 'driver')}
                  className="mt-1.5 block text-[13.5px] font-semibold text-brand underline underline-offset-2"
                  dir="ltr"
                >
                  {m.link === 'tracking' ? TRACK_URL : DRIVER_URL}
                </button>
              )}
              <p className="tabular mt-1 text-start text-[11.5px] text-ink-soft" dir="ltr">
                {fmtTime(m.at).time} ✓✓
              </p>
            </div>
          </article>
        ))}
        <div ref={end} />
      </div>
    </section>
  )
}
