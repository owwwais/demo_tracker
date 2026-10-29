import { useEffect, useRef, useState, type Dispatch } from 'react'
import { Camera, Check, Clock, MapPin, Package, Phone, QrCode, Repeat, ShieldCheck, Truck, X } from 'lucide-react'
import { OFFICE, SECOND_DRIVER } from '../data'
import { DRIVER_URL, fmtTime, type Action } from '../state'
import type { DemoState } from '../types'
import { PhoneFrame, StatusPill } from '../../components/ui'

/** Simulated camera: a viewfinder with a sweeping line, then a flash. */
function Scanner({ label, onDone, onCancel }: { label: string; onDone: () => void; onCancel: () => void }) {
  const [hit, setHit] = useState(false)
  const done = useRef(onDone)
  useEffect(() => {
    done.current = onDone
  })
  useEffect(() => {
    const t1 = setTimeout(() => setHit(true), 1500)
    const t2 = setTimeout(() => done.current(), 2100)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])
  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-[#0a1512] text-white" role="status" aria-live="polite">
      <div className="flex items-center justify-between p-4">
        <span className="text-[14px]">{label}</span>
        <button aria-label="إلغاء المسح" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
          <X size={18} aria-hidden />
        </button>
      </div>
      <div className="relative mx-auto mt-6 h-56 w-56">
        <div className="absolute inset-6 grid grid-cols-6 grid-rows-6 gap-1 opacity-70" aria-hidden>
          {Array.from({ length: 36 }).map((_, i) => (
            <span key={i} className={`rounded-[2px] ${(i * 7 + (i % 5)) % 3 === 0 ? 'bg-white/80' : 'bg-transparent'}`} />
          ))}
        </div>
        {['top-0 right-0 border-t-4 border-r-4', 'top-0 left-0 border-t-4 border-l-4', 'bottom-0 right-0 border-b-4 border-r-4', 'bottom-0 left-0 border-b-4 border-l-4'].map((c) => (
          <span key={c} aria-hidden className={`absolute h-10 w-10 rounded-[6px] border-gold ${c}`} />
        ))}
        {!hit && <span aria-hidden className="animate-scan absolute inset-x-3 h-0.5 bg-gold" />}
        {hit && (
          <span className="animate-pop absolute inset-0 grid place-items-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-brand">
              <Check size={34} aria-hidden />
            </span>
          </span>
        )}
      </div>
      <p className="mt-6 text-center text-[14px] text-white/80">{hit ? 'تمت قراءة الرمز' : 'وجّه الكاميرا إلى رمز QR على الملصق'}</p>
      {hit && <span aria-hidden className="animate-flash pointer-events-none absolute inset-0 bg-white" />}
    </div>
  )
}

function Sheet({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex items-end bg-ink/40">
      <div className="animate-slidein w-full rounded-t-[26px] bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-[17px] font-bold">{title}</h3>
          <button aria-label="إغلاق" onClick={onClose} className="grid h-8 w-8 place-items-center rounded-full bg-ground">
            <X size={16} aria-hidden />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

const BIG = 'flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-4 text-[16px] font-bold transition active:scale-[.98] disabled:opacity-40'

export function DriverView({ state, dispatch }: { state: DemoState; dispatch: Dispatch<Action> }) {
  const s = state.shipment
  const [scanning, setScanning] = useState<null | 'load' | 'replace'>(null)
  const [rejectNote, setRejectNote] = useState(false)
  const [delayOpen, setDelayOpen] = useState(false)
  const [delayMin, setDelayMin] = useState(90)
  const [reason, setReason] = useState('ازدحام عند نقطة التفتيش')
  const [rep, setRep] = useState({ name: '', phone: '' })
  const [shot, setShot] = useState(false)
  const [asSecond, setAsSecond] = useState(false)
  const [otp, setOtp] = useState('')
  const [otpErr, setOtpErr] = useState(false)
  const otpRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (s?.status === 'out_for_delivery') otpRef.current?.focus({ preventScroll: true })
  }, [s?.status])

  const replace = state.replace
  const name = s?.driver?.name ?? 'عبدالله'

  let body: React.ReactNode

  if (!s || !s.driver) {
    body = (
      <div className="grid h-full place-items-center p-8 text-center">
        <div>
          <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-gold-50 text-gold-text">
            <Truck size={28} aria-hidden />
          </span>
          <p className="text-[17px] font-bold">لا توجد شحنة مسندة</p>
          <p className="mt-2 text-[14px] text-ink-soft">حين يسند المكتب شحنة، تصل السائق رسالة فيها رابط هذه الصفحة. لا تطبيق ولا تسجيل دخول.</p>
        </div>
      </div>
    )
  } else if (replace && replace.stage !== 'done' && !asSecond) {
    // Replacement flow, seen from the first driver's phone
    body = (
      <div className="p-4">
        <p className="mb-1 text-[13px] text-ink-soft">استبدال سائق · {s.id}</p>
        <ol className="mb-4 flex gap-1.5" aria-label="مراحل الاستبدال">
          {['scan', 'details', 'photo', 'await'].map((k, i) => {
            const idx = ['scan', 'details', 'photo', 'await'].indexOf(replace.stage)
            return <li key={k} className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= idx ? 'bg-gold' : 'bg-line'}`} />
          })}
        </ol>
        {replace.stage === 'scan' && (
          <div className="card p-5 text-center">
            <QrCode size={40} className="mx-auto text-gold-text" aria-hidden />
            <p className="mt-3 font-bold">امسح رمز الشحنة أمام السائق الجديد</p>
            <p className="mt-1 text-[14px] text-ink-soft">يثبت المسح أن الحمولة بين يديك لحظة التسليم.</p>
            <button className={`${BIG} mt-5 bg-gold text-ink`} onClick={() => setScanning('replace')}>
              <QrCode size={20} aria-hidden /> مسح QR
            </button>
          </div>
        )}
        {replace.stage === 'details' && (
          <form
            className="card space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault()
              dispatch({ type: 'REPLACE_DETAILS', name: rep.name, phone: rep.phone })
            }}
          >
            <p className="font-bold">بيانات السائق الجديد</p>
            <button type="button" className="btn-ghost btn-sm w-full" onClick={() => setRep({ name: SECOND_DRIVER.name, phone: SECOND_DRIVER.phone })}>
              تعبئة تلقائية
            </button>
            <div>
              <label className="label" htmlFor="rn">الاسم</label>
              <input id="rn" className="field" value={rep.name} onChange={(e) => setRep({ ...rep, name: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="rp">الجوال</label>
              <input id="rp" className="field" dir="ltr" inputMode="tel" value={rep.phone} onChange={(e) => setRep({ ...rep, phone: e.target.value })} />
            </div>
            <button type="submit" className={`${BIG} bg-gold text-ink`} disabled={!rep.name || !rep.phone}>
              التالي
            </button>
          </form>
        )}
        {replace.stage === 'photo' && (
          <div className="card overflow-hidden">
            <div className="relative grid h-52 place-items-center bg-[#1b2723]">
              <div aria-hidden className="grid grid-cols-3 gap-2 opacity-80">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="h-12 w-14 rounded-md bg-[#b98f5a]" style={{ opacity: 0.6 + (i % 3) * 0.13 }} />
                ))}
              </div>
              {shot && <span aria-hidden className="animate-flash absolute inset-0 bg-white" />}
              <span className="absolute bottom-2 start-3 text-[12px] text-white/70">صورة الحمولة (محاكاة)</span>
            </div>
            <div className="p-5">
              <p className="font-bold">التقط صورة للحمولة</p>
              <p className="mt-1 text-[14px] text-ink-soft">تُحفظ في سجل الشحنة مع وقت الاستبدال.</p>
              {!shot ? (
                <button className={`${BIG} mt-4 bg-ink text-white`} onClick={() => setShot(true)}>
                  <Camera size={20} aria-hidden /> التقاط
                </button>
              ) : (
                <button className={`${BIG} mt-4 bg-gold text-ink`} onClick={() => dispatch({ type: 'REPLACE_PHOTO' })}>
                  إرسال الطلب إلى {replace.name}
                </button>
              )}
            </div>
          </div>
        )}
        {replace.stage === 'await' && (
          <div className="card p-5 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-50 text-gold-text">
              <Clock size={26} aria-hidden />
            </span>
            <p className="mt-3 font-bold">بانتظار تأكيد {replace.name}</p>
            <p className="mt-1 text-[14px] text-ink-soft">وصلته رسالة فيها رابط التأكيد.</p>
            <button className={`${BIG} mt-5 animate-ring bg-ink text-white`} onClick={() => setAsSecond(true)}>
              افتح هاتف {replace.name}
            </button>
          </div>
        )}
        {replace.stage !== 'await' && (
          <button className="mt-4 w-full py-2 text-[14px] text-ink-soft underline" onClick={() => dispatch({ type: 'REPLACE_CANCEL' })}>
            إلغاء الاستبدال
          </button>
        )}
      </div>
    )
  } else if (replace && replace.stage === 'await' && asSecond) {
    body = (
      <div className="p-4">
        <p className="mb-3 text-[13px] text-ink-soft">هاتف السائق {SECOND_DRIVER.name}</p>
        <div className="card p-5">
          <p className="text-[17px] font-bold">طلب استلام شحنة</p>
          <p className="mt-1 text-[14px] text-ink-soft">من السائق {s.driver.name} · {s.id}</p>
          <div className="mt-4 flex items-center gap-3 rounded-2xl bg-ground p-3">
            <span className="grid h-14 w-16 shrink-0 grid-cols-3 gap-0.5 rounded-lg bg-[#1b2723] p-1.5" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="rounded-sm bg-[#b98f5a]" />
              ))}
            </span>
            <p className="text-[14px]">
              {s.form.pieces} قطع · {s.form.goods}
              <br />
              <span className="text-ink-soft">إلى {s.form.recipientName} في {s.form.to}</span>
            </p>
          </div>
          <button
            className={`${BIG} mt-5 bg-gold text-ink`}
            onClick={() => {
              dispatch({ type: 'REPLACE_CONFIRM' })
              setAsSecond(false)
            }}
          >
            <Check size={20} aria-hidden /> أؤكد استلام الشحنة
          </button>
        </div>
      </div>
    )
  } else if (s.status === 'assigned') {
    body = (
      <div className="p-4">
        <p className="mb-3 text-[14px] text-ink-soft">مرحبًا {name}، لديك شحنة جديدة</p>
        <TripCard state={state} />
        {rejectNote && (
          <p className="mt-3 rounded-xl bg-late-50 p-3 text-[13.5px] text-late-text">
            عند الرفض يصل المكتب إشعار فيسند الشحنة لسائق آخر. في هذا العرض نكمل بالقبول.
          </p>
        )}
        <div className="mt-4 grid grid-cols-[1fr_2fr] gap-2">
          <button className={`${BIG} bg-white text-bad ring-1 ring-line`} onClick={() => setRejectNote(true)}>
            أرفض
          </button>
          <button className={`${BIG} animate-ring bg-gold text-ink`} onClick={() => dispatch({ type: 'ACCEPT' })}>
            <Check size={20} aria-hidden /> أوافق
          </button>
        </div>
      </div>
    )
  } else if (s.status === 'accepted') {
    body = (
      <div className="p-4">
        <TripCard state={state} />
        <div className="mt-4 space-y-2">
          <button className={`${BIG} ${s.scanned ? 'bg-brand-50 text-brand' : 'animate-ring bg-gold text-ink'}`} onClick={() => setScanning('load')} disabled={s.scanned}>
            {s.scanned ? <Check size={20} aria-hidden /> : <QrCode size={20} aria-hidden />}
            {s.scanned ? 'تم مسح الملصق' : 'مسح QR'}
          </button>
          <button className={`${BIG} bg-ink text-white ${s.scanned ? 'animate-ring' : ''}`} disabled={!s.scanned} onClick={() => dispatch({ type: 'DEPART' })}>
            <Truck size={20} aria-hidden /> خرجت من المكتب
          </button>
        </div>
      </div>
    )
  } else if (s.status === 'in_transit' || s.status === 'delayed') {
    const canAct = state.step >= 6
    body = (
      <div className="p-4">
        <TripCard state={state} />
        {!canAct && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-[13.5px] text-brand">الشحنة في الطريق. تصل المرسل والمرسل إليه رسائل التتبع.</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            className={`${BIG} bg-white text-late-text ring-1 ring-line ${state.step === 6 ? 'animate-ring' : ''}`}
            disabled={!canAct || !!s.delay}
            onClick={() => setDelayOpen(true)}
          >
            <Clock size={18} aria-hidden /> تأخير
          </button>
          <button
            className={`${BIG} bg-white text-ink ring-1 ring-line ${state.step === 7 ? 'animate-ring' : ''}`}
            disabled={!canAct || !!s.previousDriver}
            onClick={() => {
              setRep({ name: '', phone: '' })
              setShot(false)
              dispatch({ type: 'REPLACE_START' })
            }}
          >
            <Repeat size={18} aria-hidden /> استبدال سائق
          </button>
          <button
            className={`${BIG} col-span-2 bg-brand text-white ${state.step === 8 ? 'animate-ring' : ''}`}
            disabled={state.step < 8}
            onClick={() => dispatch({ type: 'DELIVER_START' })}
          >
            <Package size={20} aria-hidden /> تسليم
          </button>
        </div>
      </div>
    )
  } else if (s.status === 'out_for_delivery') {
    const submit = () => {
      if (otp === s.otp) dispatch({ type: 'DELIVER_CONFIRM' })
      else setOtpErr(true)
    }
    body = (
      <div className="p-4">
        <div className="card p-5">
          <ShieldCheck size={34} className="text-brand" aria-hidden />
          <p className="mt-3 text-[17px] font-bold">اطلب رمز الاستلام من {s.form.recipientName}</p>
          <p className="mt-1 text-[14px] text-ink-soft">وصله الرمز برسالة الآن. اكتبه هنا بعد أن يستلم الطرد.</p>
          <form
            className="mt-4"
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <label htmlFor="otp" className="label">
              الرمز من ست أرقام
            </label>
            <input
              ref={otpRef}
              id="otp"
              dir="ltr"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              aria-invalid={otpErr}
              aria-describedby={otpErr ? 'otp-err' : undefined}
              onChange={(e) => {
                setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                setOtpErr(false)
              }}
              className={`tabular w-full rounded-2xl bg-ground px-4 py-3 text-center text-[28px] font-bold tracking-[.4em] outline-none ring-2 transition ${otpErr ? 'ring-bad' : 'ring-transparent focus:ring-brand'}`}
            />
            {otpErr && (
              <p id="otp-err" className="mt-2 text-[13.5px] font-medium text-bad">
                الرمز غير صحيح. تحقّق من رسالة {s.form.recipientName}.
              </p>
            )}
            <button type="submit" className={`${BIG} mt-4 bg-brand text-white`} disabled={otp.length !== 6}>
              تأكيد التسليم
            </button>
          </form>
        </div>
      </div>
    )
  } else {
    body = (
      <div className="grid h-full place-items-center p-8 text-center">
        <div className="animate-pop">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-brand text-white">
            <Check size={40} aria-hidden />
          </span>
          <p className="mt-5 text-xl font-bold">تم الاستلام</p>
          <p className="mt-2 text-[14px] text-ink-soft">
            أُغلقت الشحنة {s.id} {fmtTime(state.clock).full}. وصل المرسل والمرسل إليه إشعار الإغلاق.
          </p>
        </div>
      </div>
    )
  }

  return (
    <PhoneFrame url={DRIVER_URL}>
      <div className="flex items-center justify-between px-4 pb-1 pt-2">
        <span className="text-[13px] font-semibold text-gold-text">السائق · {asSecond ? SECOND_DRIVER.name : name}</span>
        {s && <StatusPill status={s.status} />}
      </div>
      {body}
      {scanning && (
        <Scanner
          label={scanning === 'load' ? `مسح ملصق ${s?.id}` : 'مسح رمز الاستبدال'}
          onCancel={() => setScanning(null)}
          onDone={() => {
            dispatch({ type: scanning === 'load' ? 'SCAN' : 'REPLACE_SCANNED' })
            setScanning(null)
          }}
        />
      )}
      {delayOpen && s && (
        <Sheet title="الإبلاغ عن تأخير" onClose={() => setDelayOpen(false)}>
          <p className="label">التأخير المتوقع</p>
          <div className="mb-3 grid grid-cols-3 gap-2">
            {[45, 90, 180].map((m) => (
              <button
                key={m}
                onClick={() => setDelayMin(m)}
                className={`rounded-xl py-2.5 text-[14px] font-semibold transition ${delayMin === m ? 'bg-late text-white' : 'bg-ground'}`}
                aria-pressed={delayMin === m}
              >
                {m < 60 ? `${m} دقيقة` : m === 90 ? 'ساعة ونصف' : '3 ساعات'}
              </button>
            ))}
          </div>
          <p className="mb-3 rounded-xl bg-late-50 p-3 text-[14px] text-late-text">
            الموعد الجديد: <b className="tabular">{fmtTime(s.eta + delayMin).full}</b>
          </p>
          <label className="label" htmlFor="reason">السبب</label>
          <select id="reason" className="field mb-4" value={reason} onChange={(e) => setReason(e.target.value)}>
            <option>ازدحام عند نقطة التفتيش</option>
            <option>عطل بسيط في الشاحنة</option>
            <option>سوء الأحوال الجوية</option>
          </select>
          <button
            className={`${BIG} bg-late text-white`}
            onClick={() => {
              dispatch({ type: 'DELAY', minutes: delayMin, reason })
              setDelayOpen(false)
            }}
          >
            إرسال التأخير
          </button>
        </Sheet>
      )}
    </PhoneFrame>
  )
}

function TripCard({ state }: { state: DemoState }) {
  const s = state.shipment!
  const eta = s.delay?.newEta ?? s.eta
  return (
    <div className="card overflow-hidden">
      <div className="stripes h-2 bg-ink" aria-hidden />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="font-display text-xl leading-none tracking-wide" dir="ltr">
            {s.id}
          </p>
          <span className="text-[12.5px] text-ink-soft">{OFFICE.name}</span>
        </div>
        <p className="mt-3 flex items-center gap-2 text-[19px] font-bold">
          <MapPin size={18} className="text-gold-text" aria-hidden />
          {s.form.from} ← {s.form.to}
        </p>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-[13.5px]">
          <div>
            <dt className="text-ink-soft">المرسل إليه</dt>
            <dd className="font-semibold">{s.form.recipientName}</dd>
          </div>
          <div>
            <dt className="text-ink-soft">الحمولة</dt>
            <dd className="font-semibold">
              {s.form.pieces} قطع · {s.form.weight} كجم
            </dd>
          </div>
          {s.eta > 0 && (
            <div className="col-span-2">
              <dt className="text-ink-soft">الوصول المتوقع</dt>
              <dd className={`tabular font-semibold ${s.delay ? 'text-late-text' : ''}`}>{fmtTime(eta).full}</dd>
            </div>
          )}
        </dl>
        <a href={`tel:${s.form.recipientPhone}`} onClick={(e) => e.preventDefault()} className="mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-brand">
          <Phone size={14} aria-hidden /> <span dir="ltr" className="tabular">{s.form.recipientPhone}</span>
        </a>
      </div>
    </div>
  )
}
