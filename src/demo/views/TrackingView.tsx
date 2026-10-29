import { AlertTriangle, Building2, Check, Link2Off, Repeat, ShieldCheck, Truck } from 'lucide-react'
import { OFFICE } from '../data'
import { fmtTime, TRACK_URL } from '../state'
import type { DemoState, Shipment } from '../types'
import { PhoneFrame, StatusPill } from '../../components/ui'

function progress(s: Shipment) {
  switch (s.status) {
    case 'in_transit':
      return s.previousDriver ? 0.62 : 0.34
    case 'delayed':
      return s.previousDriver ? 0.62 : 0.48
    case 'out_for_delivery':
      return 0.97
    case 'delivered':
      return 1
    default:
      return 0
  }
}

/** The Riyadh → Jeddah road as a line, with the truck placed along it. Right to left, like the page. */
export function RouteStrip({ s, dark = false }: { s: Shipment; dark?: boolean }) {
  const p = progress(s)
  return (
    <div className="relative px-1 pb-1 pt-7">
      <div className={`relative h-2 rounded-full ${dark ? 'bg-white/15' : 'bg-line'}`}>
        <div
          className={`absolute inset-y-0 right-0 rounded-full transition-[width] duration-1000 ease-out ${s.status === 'delayed' ? 'bg-late' : 'bg-brand'}`}
          style={{ width: `${p * 100}%` }}
        />
        <span
          className="absolute top-1/2 grid h-8 w-8 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-gold text-ink ring-4 ring-white transition-[right] duration-1000 ease-out"
          style={{ right: `${p * 100}%` }}
          aria-hidden
        >
          <Truck size={16} className="-scale-x-100" />
        </span>
      </div>
      <div className={`mt-3 flex justify-between text-[13px] font-semibold ${dark ? 'text-white' : ''}`}>
        <span>{s.form.from}</span>
        <span>{s.form.to}</span>
      </div>
    </div>
  )
}

export function TrackingView({ state }: { state: DemoState }) {
  const s = state.shipment
  const linkSent = s && ['in_transit', 'delayed', 'out_for_delivery', 'delivered'].includes(s.status)

  if (!s || !linkSent) {
    return (
      <PhoneFrame url={TRACK_URL}>
        <div className="grid h-full place-items-center p-8 text-center">
          <div>
            <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-brand-50 text-brand">
              <Link2Off size={28} aria-hidden />
            </span>
            <p className="text-[17px] font-bold">لم يصل رابط التتبع بعد</p>
            <p className="mt-2 text-[14px] text-ink-soft">يصل الرابط للمرسل والمرسل إليه برسالة لحظة خروج الشحنة من المكتب.</p>
          </div>
        </div>
      </PhoneFrame>
    )
  }

  const eta = s.delay?.newEta ?? s.eta
  const delivered = s.status === 'delivered'
  const find = (needle: string) => s.events.find((e) => e.text.includes(needle))

  const timeline = [
    { label: 'سُجّلت في المكتب', at: s.createdAt, done: true },
    { label: 'خرجت من المكتب', at: find('خرجت')?.at, done: true },
    ...(s.delay ? [{ label: `تأخير: ${s.delay.reason}`, at: find('تأخير')?.at, done: true, late: true }] : []),
    ...(s.previousDriver ? [{ label: `استُبدل السائق إلى ${s.driver?.name}`, at: find('أكّد السائق')?.at, done: true }] : []),
    { label: 'وصل السائق', at: find('وصل السائق')?.at, done: ['out_for_delivery', 'delivered'].includes(s.status) },
    { label: 'تم الاستلام', at: find('تم الاستلام')?.at, done: delivered },
  ]

  return (
    <PhoneFrame url={TRACK_URL}>
      <div className="bg-ink px-5 pb-5 pt-3 text-white">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl leading-none tracking-wide" dir="ltr">
            {s.id}
          </p>
          <StatusPill status={s.status} />
        </div>
        <p className="mt-4 text-[13px] text-white/70">{delivered ? 'استُلمت' : 'الوصول المتوقع'}</p>
        <p className="tabular text-[28px] font-bold leading-tight">{fmtTime(delivered ? state.clock : eta).full}</p>
        <RouteStrip s={s} dark />
      </div>

      <div className="space-y-3 p-4">
        {s.delay && !delivered && (
          <div className="animate-slidein flex gap-3 rounded-2xl bg-late-50 p-3.5 text-late-text">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden />
            <p className="text-[14px]">
              تأخرت الشحنة بسبب {s.delay.reason}. الموعد الجديد <b className="tabular">{fmtTime(s.delay.newEta).full}</b>.
            </p>
          </div>
        )}

        {s.status === 'out_for_delivery' && s.otp && (
          <div className="animate-slidein rounded-2xl bg-gold-50 p-4">
            <p className="flex items-center gap-2 text-[14px] font-bold text-gold-text">
              <ShieldCheck size={18} aria-hidden /> تأكيد الاستلام برمز
            </p>
            <p className="tabular mt-2 text-center text-[34px] font-bold tracking-[.3em] text-ink" dir="ltr">
              {s.otp}
            </p>
            <p className="mt-1 text-[13px] text-ink-soft">أعطِ هذا الرمز للسائق بعد أن تستلم الطرد فقط.</p>
          </div>
        )}

        {delivered && (
          <div className="animate-slidein flex items-center gap-3 rounded-2xl bg-brand p-4 text-white">
            <Check size={22} aria-hidden />
            <p className="text-[14.5px] font-semibold">تم تأكيد الاستلام بالرمز. أُغلقت الشحنة.</p>
          </div>
        )}

        <div className="card grid grid-cols-2 gap-3 p-4 text-[13.5px]">
          <div>
            <p className="flex items-center gap-1.5 text-ink-soft">
              <Truck size={14} aria-hidden /> السائق
            </p>
            <p className="font-semibold">
              {s.driver?.name}
              {s.previousDriver && <Repeat size={12} className="ms-1 inline text-gold-text" aria-label="بعد الاستبدال" />}
            </p>
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-ink-soft">
              <Building2 size={14} aria-hidden /> المكتب
            </p>
            <p className="font-semibold">{OFFICE.name}</p>
          </div>
          <div className="col-span-2">
            <p className="text-ink-soft">من {s.form.senderName}</p>
            <p className="font-semibold">
              {s.form.pieces} قطع · {s.form.goods}
            </p>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-[14px] font-bold">مسار الشحنة</h3>
          <ol className="space-y-0">
            {timeline.map((t, i) => (
              <li key={t.label} className="relative flex gap-3 pb-4 last:pb-0">
                {i < timeline.length - 1 && (
                  <span aria-hidden className={`absolute start-[9px] top-5 h-full w-0.5 ${timeline[i + 1].done ? 'bg-brand' : 'bg-line'}`} />
                )}
                <span
                  aria-hidden
                  className={`relative z-[1] mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full transition-colors duration-700 ${
                    'late' in t && t.late ? 'bg-late text-white' : t.done ? 'bg-brand text-white' : 'bg-line'
                  }`}
                >
                  {t.done && <Check size={12} strokeWidth={3} />}
                </span>
                <div>
                  <p className={`text-[14px] ${t.done ? 'font-semibold' : 'text-ink-soft'}`}>{t.label}</p>
                  {t.at !== undefined && t.done && <p className="tabular text-[12px] text-ink-soft">{fmtTime(t.at).full}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="pb-2 text-center text-[12px] text-ink-soft">عرض تجريبي ببيانات وهمية</p>
      </div>
    </PhoneFrame>
  )
}
