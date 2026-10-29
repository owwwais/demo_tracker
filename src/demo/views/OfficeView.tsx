import { useState, type Dispatch } from 'react'
import { ClipboardList, PackagePlus, Printer, Sparkles, Truck, UserCheck } from 'lucide-react'
import { AUTOFILL, DRIVERS, EMPTY_FORM, OFFICE, PAST_SHIPMENTS } from '../data'
import { fmtTime, type Action } from '../state'
import type { DemoState, Shipment, ShipmentForm } from '../types'
import { Modal, StatusPill } from '../../components/ui'
import { ShipmentLabel } from '../../components/ShipmentLabel'

const FIELDS: { k: keyof ShipmentForm; label: string; ltr?: boolean; half?: boolean }[] = [
  { k: 'senderName', label: 'اسم المرسل' },
  { k: 'senderPhone', label: 'جوال المرسل', ltr: true },
  { k: 'recipientName', label: 'اسم المرسل إليه' },
  { k: 'recipientPhone', label: 'جوال المرسل إليه', ltr: true },
  { k: 'from', label: 'من', half: true },
  { k: 'to', label: 'إلى', half: true },
  { k: 'goods', label: 'نوع البضاعة' },
  { k: 'pieces', label: 'عدد القطع', ltr: true, half: true },
  { k: 'weight', label: 'الوزن (كجم)', ltr: true, half: true },
  { k: 'price', label: 'أجرة الشحن (ريال)', ltr: true },
]

export function OfficeView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<Action> }) {
  const s = state.shipment
  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ShipmentForm>(EMPTY_FORM)
  const [labelOpen, setLabelOpen] = useState(false)
  const [assignOpen, setAssignOpen] = useState(false)
  const [logOpen, setLogOpen] = useState(false)
  const complete = Object.values(form).every((v) => v.trim() !== '')

  const save = () => {
    dispatch({ type: 'CREATE', form })
    setFormOpen(false)
    setLabelOpen(true)
  }

  const todayCount = 3 + (s ? 1 : 0)
  const inTransit = 1 + (s && ['in_transit', 'delayed', 'out_for_delivery'].includes(s.status) ? 1 : 0)
  const delivered = 1 + (s?.status === 'delivered' ? 1 : 0)

  return (
    <div className="card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 bg-ink px-5 py-4 text-white sm:px-6">
        <div>
          <p className="text-[13px] text-white/70">لوحة المكتب</p>
          <h2 className="text-lg font-bold sm:text-xl">{OFFICE.name}</h2>
        </div>
        <button className="btn-gold btn-sm" onClick={() => setFormOpen(true)} disabled={!!s}>
          <PackagePlus size={18} aria-hidden /> شحنة جديدة
        </button>
      </header>

      <div className="grid grid-cols-3 gap-px bg-line">
        {[
          { k: 'شحنات اليوم', v: todayCount },
          { k: 'في الطريق', v: inTransit },
          { k: 'مُسلّمة', v: delivered },
        ].map((x) => (
          <div key={x.k} className="bg-white px-4 py-3 sm:px-6">
            <p className="text-[12.5px] text-ink-soft">{x.k}</p>
            <p className="tabular text-2xl font-bold">{x.v}</p>
          </div>
        ))}
      </div>

      <div className="p-3 sm:p-5">
        <h3 className="mb-3 px-1 text-[15px] font-bold">الشحنات</h3>
        <ul className="space-y-2">
          {s && (
            <li className="animate-slidein rounded-2xl bg-brand-50/60 p-3 ring-2 ring-brand/30 sm:p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display text-lg leading-none tracking-wide" dir="ltr">
                    {s.id}
                  </p>
                  <p className="mt-1 text-[14px]">
                    {s.form.from} ← {s.form.to} · {s.form.recipientName}
                    {s.driver && <span className="text-ink-soft"> · السائق {s.driver.name}</span>}
                  </p>
                </div>
                <StatusPill status={s.status} />
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {s.status === 'registered' && (
                  <button className={`btn-primary btn-sm ${state.step === 2 ? 'animate-ring' : ''}`} onClick={() => setAssignOpen(true)}>
                    <UserCheck size={16} aria-hidden /> إسناد
                  </button>
                )}
                <button className="btn-ghost btn-sm" onClick={() => setLabelOpen(true)}>
                  <Printer size={16} aria-hidden /> الملصق
                </button>
                <button className={`btn-ghost btn-sm ${state.step === 9 ? 'animate-ring' : ''}`} onClick={() => setLogOpen(true)}>
                  <ClipboardList size={16} aria-hidden /> سجل الأحداث ({s.events.length})
                </button>
              </div>
              {s.status === 'delivered' && (
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <h4 className="mb-3 text-[14px] font-bold">سجل الأحداث الكامل</h4>
                  <EventLog s={s} />
                </div>
              )}
            </li>
          )}
          {!s && (
            <li className="rounded-2xl bg-gold-50 p-4 text-[14px] text-gold-text">
              لا توجد شحنة للعرض بعد. ابدأ بزر «شحنة جديدة».
            </li>
          )}
          {PAST_SHIPMENTS.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-ground p-3 sm:p-4">
              <div className="min-w-0">
                <p className="font-display text-lg leading-none tracking-wide text-ink-soft" dir="ltr">
                  {p.id}
                </p>
                <p className="mt-1 text-[14px] text-ink-soft">
                  {OFFICE.city} ← {p.to} · {p.recipient} · {p.driver} · {p.when}
                </p>
              </div>
              <StatusPill status={p.status} />
            </li>
          ))}
        </ul>
      </div>

      {formOpen && (
        <Modal title="شحنة جديدة" onClose={() => setFormOpen(false)}>
          <button className={`btn-gold btn-sm mb-4 w-full ${!complete ? 'animate-ring' : ''}`} onClick={() => setForm(AUTOFILL)}>
            <Sparkles size={16} aria-hidden /> تعبئة تلقائية
          </button>
          <form
            className="grid grid-cols-2 gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (complete) save()
            }}
          >
            {FIELDS.map((f) => (
              <div key={f.k} className={f.half ? 'col-span-1' : 'col-span-2'}>
                <label className="label" htmlFor={f.k}>
                  {f.label}
                </label>
                <input
                  id={f.k}
                  className="field"
                  dir={f.ltr ? 'ltr' : undefined}
                  inputMode={f.ltr ? 'numeric' : undefined}
                  value={form[f.k]}
                  onChange={(e) => setForm({ ...form, [f.k]: e.target.value })}
                />
              </div>
            ))}
            <button type="submit" className="btn-primary col-span-2 mt-2" disabled={!complete}>
              حفظ وإصدار الملصق
            </button>
          </form>
        </Modal>
      )}

      {labelOpen && s && (
        <Modal title="ملصق الشحنة" onClose={() => setLabelOpen(false)}>
          <ShipmentLabel s={s} />
          <p className="mt-4 rounded-xl bg-brand-50 p-3 text-[14px] text-brand">
            وصلت المرسل رسالة «تم تسجيل شحنتك». الرسالة ظاهرة في لوحة الرسائل.
          </p>
          <div className="mt-4 flex gap-2">
            <button className="btn-ghost flex-1" onClick={() => window.print()}>
              <Printer size={16} aria-hidden /> طباعة
            </button>
            <button className="btn-primary flex-1" onClick={() => setLabelOpen(false)}>
              تم
            </button>
          </div>
        </Modal>
      )}

      {assignOpen && s && (
        <Modal title="إسناد الشحنة لسائق" onClose={() => setAssignOpen(false)}>
          <ul className="space-y-2">
            {DRIVERS.map((d, i) => (
              <li key={d.id}>
                <button
                  className={`flex w-full items-center justify-between gap-3 rounded-2xl p-4 text-start transition hover:bg-brand-50 active:scale-[.99] ${i === 0 ? 'bg-gold-50 ring-2 ring-gold' : 'bg-ground'}`}
                  onClick={() => {
                    dispatch({ type: 'ASSIGN', driverId: d.id })
                    setAssignOpen(false)
                  }}
                >
                  <span className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white">
                      <Truck size={18} aria-hidden />
                    </span>
                    <span>
                      <span className="block font-semibold">{d.name}</span>
                      <span className="tabular block text-[13px] text-ink-soft" dir="ltr">
                        {d.phone} · {d.plate}
                      </span>
                    </span>
                  </span>
                  <span className="text-[13px] font-semibold text-brand">{i === 0 ? 'متاح الآن' : 'متاح'}</span>
                </button>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      {logOpen && s && (
        <Modal title={`سجل أحداث ${s.id}`} onClose={() => setLogOpen(false)}>
          <div className="mb-4 flex items-center justify-between">
            <StatusPill status={s.status} />
            <span className="text-[13px] text-ink-soft">{s.events.length} أحداث</span>
          </div>
          <EventLog s={s} />
        </Modal>
      )}
    </div>
  )
}

function EventLog({ s }: { s: Shipment }) {
  return (
    <ol className="relative space-y-4 border-s-2 border-line ps-5">
      {s.events.map((e) => (
        <li key={e.id} className="relative">
          <span
            aria-hidden
            className={`absolute -start-[27px] top-1.5 h-3 w-3 rounded-full ring-4 ring-white ${
              e.tone === 'late' ? 'bg-late' : e.actor === 'driver' ? 'bg-gold' : 'bg-brand'
            }`}
          />
          <p className="text-[14.5px] font-medium">{e.text}</p>
          <p className="tabular text-[12.5px] text-ink-soft">
            {fmtTime(e.at).full} · {e.actor === 'driver' ? 'السائق' : e.actor === 'office' ? 'المكتب' : e.actor === 'recipient' ? 'المرسل إليه' : 'النظام'}
          </p>
        </li>
      ))}
    </ol>
  )
}
