import { useEffect, useReducer, useRef, useState } from 'react'
import { ArrowRight, Check, MessageSquareText, RotateCcw, SkipBack } from 'lucide-react'
import { ROLES, STEPS } from './data'
import { initialState, reducer, stepDef } from './state'
import type { Role } from './types'
import { MessagesPanel } from './MessagesPanel'
import { OfficeView } from './views/OfficeView'
import { DriverView } from './views/DriverView'
import { TrackingView } from './views/TrackingView'
import { OwnerView } from './views/OwnerView'
import { DemoNote, Wordmark } from '../components/ui'

const ROLE_TONE: Record<Role, string> = {
  office: 'bg-brand',
  driver: 'bg-gold',
  tracking: 'bg-brand',
  owner: 'bg-ink',
}

export function Demo() {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [toast, setToast] = useState<string | null>(null)
  const [resets, setResets] = useState(0)
  const msgsRef = useRef<HTMLDivElement>(null)
  const lastStep = useRef(state.step)
  const lastMsgCount = useRef(0)

  // The role follows the scene: a beat after a step completes, the screen changes hands.
  useEffect(() => {
    if (state.step === lastStep.current) return
    lastStep.current = state.step
    const target = stepDef(state.step).role
    const t = setTimeout(() => dispatch({ type: 'SET_ROLE', role: target }), 1100)
    return () => clearTimeout(t)
  }, [state.step])

  // On phones the messages panel sits below the screen, so a new message also shows as a toast.
  useEffect(() => {
    const n = state.messages.length
    if (n > lastMsgCount.current) {
      const m = state.messages[n - 1]
      setToast(`إلى ${m.toName}: ${m.body}`)
      const t = setTimeout(() => setToast(null), 3800)
      lastMsgCount.current = n
      return () => clearTimeout(t)
    }
    lastMsgCount.current = n
  }, [state.messages])

  const cur = stepDef(state.step)
  const done = (n: number) => n < state.step || (n === 9 && state.shipment?.status === 'delivered')
  const setRole = (role: Role) => {
    dispatch({ type: 'SET_ROLE', role })
    document.getElementById('screen')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen pb-24 lg:pb-10">
      <div className="stripes-dark h-2" aria-hidden />
      <header className="bg-ink text-white">
        <div className="wrap flex items-center justify-between gap-3 py-3">
          <a href="#/" className="flex items-center gap-2 rounded-lg text-[14px] text-white/80 transition hover:text-white">
            <ArrowRight size={18} aria-hidden />
            <Wordmark light />
          </a>
          <div className="flex items-center gap-2">
            <span className="hidden text-[13px] text-white/60 sm:inline">عرض تجريبي ببيانات وهمية</span>
            <button
              className="btn btn-sm bg-white/10 text-white hover:bg-white/20"
              onClick={() => {
                dispatch({ type: 'RESET' })
                lastStep.current = 1
                lastMsgCount.current = 0
                setToast(null)
                setResets((n) => n + 1)
              }}
            >
              <RotateCcw size={16} aria-hidden /> إعادة المشهد
            </button>
          </div>
        </div>

        {/* scene progress */}
        <nav aria-label="خطوات المشهد" className="wrap pb-4">
          <ol className="grid grid-cols-9 gap-1 sm:gap-1.5">
            {STEPS.map((st) => {
              const isCur = st.n === state.step && !done(st.n)
              const skipped = state.skipped.includes(st.n)
              return (
                <li key={st.n} className="min-w-0" aria-current={isCur ? 'step' : undefined}>
                  <div
                    className={`h-1.5 rounded-full transition-colors duration-500 ${
                      skipped ? 'bg-white/30' : done(st.n) ? (st.role === 'driver' ? 'bg-gold' : 'bg-[#4FB286]') : isCur ? 'bg-white' : 'bg-white/15'
                    }`}
                  />
                  <p className={`mt-1.5 hidden truncate text-[12px] lg:block ${isCur ? 'font-semibold text-white' : 'text-white/55'}`}>
                    {st.title}
                    {st.optional ? ' (اختياري)' : ''}
                  </p>
                </li>
              )
            })}
          </ol>
        </nav>
      </header>

      {/* what to do now */}
      <div className="wrap mt-4">
        <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5" aria-live="polite">
          <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-[18px] font-bold ${cur.role === 'driver' ? 'bg-gold text-ink' : 'bg-brand text-white'}`}>
            {state.shipment?.status === 'delivered' && state.step === 9 ? <Check size={20} aria-hidden /> : <span className="tabular">{state.step}</span>}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] text-ink-soft">
              الخطوة {state.step} من 9 · {ROLES.find((r) => r.id === cur.role)?.label}
            </p>
            <h1 className="text-[18px] font-bold leading-snug sm:text-[20px]">{cur.title}</h1>
            <p className="text-[14.5px] text-ink">{cur.todo}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {state.step === 5 && (
              <button className="btn-primary btn-sm" onClick={() => dispatch({ type: 'NEXT' })}>
                التالي: التأخير
              </button>
            )}
            {cur.optional && (
              <button className="btn-ghost btn-sm" onClick={() => dispatch({ type: 'SKIP' })}>
                <SkipBack size={16} className="-scale-x-100" aria-hidden /> تخطَّ
              </button>
            )}
            {state.step === 9 && state.role !== 'owner' && (
              <button className="btn-gold btn-sm animate-ring" onClick={() => setRole('owner')}>
                افتح لوحة المالك
              </button>
            )}
          </div>
        </div>
      </div>

      {/* role switcher */}
      <div id="screen" className="wrap mt-4 scroll-mt-4">
        <div role="tablist" aria-label="الأدوار" className="grid grid-cols-4 gap-1 rounded-full bg-white p-1 shadow-soft">
          {ROLES.map((r) => {
            const active = state.role === r.id
            return (
              <button
                key={r.id}
                role="tab"
                aria-selected={active}
                onClick={() => setRole(r.id)}
                className={`relative rounded-full px-1 py-2 text-[13.5px] font-semibold transition sm:py-2.5 sm:text-[15px] ${
                  active ? `${ROLE_TONE[r.id]} ${r.id === 'driver' ? 'text-ink' : 'text-white'}` : 'text-ink hover:bg-ground'
                }`}
              >
                {r.label}
                {cur.role === r.id && !active && <span aria-label="دور الخطوة الحالية" className="absolute end-2 top-2 h-2 w-2 rounded-full bg-gold sm:end-3 sm:top-3" />}
              </button>
            )
          })}
        </div>
      </div>

      <main className="wrap mt-4 grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div key={`${state.role}-${resets}`} className="animate-rise min-w-0">
          {state.role === 'office' && <OfficeView state={state} dispatch={dispatch} />}
          {state.role === 'driver' && <DriverView state={state} dispatch={dispatch} />}
          {state.role === 'tracking' && <TrackingView state={state} />}
          {state.role === 'owner' && <OwnerView state={state} />}
        </div>
        <div ref={msgsRef} className="min-w-0 scroll-mt-4 lg:sticky lg:top-4">
          <MessagesPanel messages={state.messages} onOpen={setRole} className="h-[520px] lg:h-[calc(100vh-2rem)] lg:max-h-[760px]" />
        </div>
      </main>

      <footer className="wrap mt-8 flex flex-wrap items-center justify-between gap-2">
        <DemoNote />
        <p className="text-[12.5px] text-ink-soft">لا خادم ولا رسائل حقيقية. كل شيء يجري في متصفحك ويزول بإعادة التحميل.</p>
      </footer>

      {/* phone toast + jump to messages */}
      <div className="fixed inset-x-0 bottom-0 z-40 p-3 lg:hidden">
        {toast && (
          <div className="animate-slidein mb-2 line-clamp-2 rounded-2xl bg-bubble px-4 py-3 text-[13.5px] text-ink shadow-float" role="status">
            {toast}
          </div>
        )}
        <button
          className="btn w-full bg-ink text-white shadow-float"
          onClick={() => msgsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        >
          <MessageSquareText size={18} aria-hidden /> الرسائل
          <span className="tabular rounded-full bg-gold px-2 text-[13px] text-ink">{state.messages.length}</span>
        </button>
      </div>
    </div>
  )
}
