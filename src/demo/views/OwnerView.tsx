import { useEffect, useState } from 'react'
import { OWNER } from '../data'
import type { DemoState } from '../types'

const nf = new Intl.NumberFormat('en-US')

function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value)
  useEffect(() => {
    if (shown === value) return
    const from = shown
    const start = performance.now()
    let raf = 0
    const tick = (t: number) => {
      const k = Math.min(1, (t - start) / 700)
      setShown(Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])
  return <>{nf.format(shown)}</>
}

function LineChart({ data, labels }: { data: number[]; labels: string[] }) {
  const w = 640
  const h = 220
  const pad = { t: 16, r: 8, b: 28, l: 8 }
  const max = Math.ceil(Math.max(...data) / 200) * 200
  const x = (i: number) => w - pad.r - (i * (w - pad.l - pad.r)) / (data.length - 1) // RTL: oldest on the right
  const y = (v: number) => pad.t + (1 - v / max) * (h - pad.t - pad.b)
  const pts = data.map((v, i) => `${x(i)},${y(v)}`).join(' ')
  const last = data.length - 1
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label={`الشحنات شهريًا، من ${nf.format(data[0])} في ${labels[0]} إلى ${nf.format(data[last])} في ${labels[last]}`}>
      {[0.25, 0.5, 0.75, 1].map((k) => (
        <line key={k} x1={pad.l} x2={w - pad.r} y1={y(max * k)} y2={y(max * k)} stroke="#E3E8E6" strokeWidth="1" />
      ))}
      <polygon points={`${x(0)},${y(0)} ${pts} ${x(last)},${y(0)}`} fill="#0F5C3F" opacity=".08" />
      <polyline points={pts} fill="none" stroke="#0F5C3F" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(data[last])} r="5" fill="#D9A33B" stroke="#fff" strokeWidth="2" />
      {labels.map((l, i) =>
        i % 2 === 1 ? (
          <text key={l} x={x(i)} y={h - 8} textAnchor="middle" fontSize="15" fill="#3D5A51" fontFamily="IBM Plex Sans Arabic">
            {l}
          </text>
        ) : null,
      )}
      <text x={x(last)} y={y(data[last]) - 12} textAnchor="middle" fontSize="16" fontWeight="700" fill="#0B3B2E" fontFamily="IBM Plex Sans Arabic">
        {nf.format(data[last])}
      </text>
    </svg>
  )
}

export function OwnerView({ state }: { state: DemoState }) {
  const closed = state.shipment?.status === 'delivered' ? 1 : 0
  const monthly = [...OWNER.monthly.slice(0, -1), OWNER.monthly[OWNER.monthly.length - 1] + closed]
  const kpis = [
    { k: 'المكاتب المشتركة', v: OWNER.offices, unit: 'مكتبًا' },
    { k: 'شحنات هذا الشهر', v: OWNER.shipmentsMonth + closed, unit: 'شحنة', live: closed > 0 },
    { k: 'إيراد الاشتراكات', v: OWNER.revenue, unit: 'ريال' },
    { k: 'التسليم في الموعد', v: OWNER.onTime, unit: '٪' },
  ]
  return (
    <div className="space-y-4">
      <div className="card overflow-hidden">
        <header className="flex flex-wrap items-center justify-between gap-2 bg-ink px-5 py-4 text-white sm:px-6">
          <div>
            <p className="text-[13px] text-white/70">لوحة مالك المنصة</p>
            <h2 className="text-lg font-bold sm:text-xl">أكتوبر 2026</h2>
          </div>
          <span className="stripes h-6 w-24 rounded-md" aria-hidden />
        </header>
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {kpis.map((x) => (
            <div key={x.k} className={`bg-white px-4 py-4 transition-colors duration-700 sm:px-6 ${x.live ? 'bg-gold-50' : ''}`}>
              <p className="text-[13px] text-ink-soft">{x.k}</p>
              <p className="tabular mt-1 text-[26px] font-bold leading-none sm:text-[30px]">
                <CountUp value={x.v} /> <span className="text-[14px] font-medium text-ink-soft">{x.unit}</span>
              </p>
              {x.live && <p className="mt-1 text-[12.5px] font-semibold text-gold-text">+1 من شحنة العرض</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="card p-4 sm:p-6">
        <h3 className="text-[15px] font-bold">الشحنات شهريًا</h3>
        <p className="mb-2 text-[13px] text-ink-soft">نمت الشحنات الشهرية إلى أكثر من الضعف خلال سنة.</p>
        <LineChart data={monthly} labels={OWNER.months} />
      </div>

      <div className="card overflow-hidden">
        <h3 className="px-4 pb-2 pt-4 text-[15px] font-bold sm:px-6">أنشط المكاتب</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[14px]">
            <thead>
              <tr className="text-start text-[12.5px] text-ink-soft">
                <th className="px-4 py-2 text-start font-medium sm:px-6">المكتب</th>
                <th className="px-2 py-2 text-start font-medium">المدينة</th>
                <th className="px-2 py-2 text-start font-medium">الباقة</th>
                <th className="px-2 py-2 text-start font-medium">شحنات الشهر</th>
                <th className="px-4 py-2 text-start font-medium sm:px-6">في الموعد</th>
              </tr>
            </thead>
            <tbody>
              {OWNER.table.map((r, i) => (
                <tr key={r.name} className={`border-t border-line ${i === 0 && closed ? 'bg-gold-50' : ''}`}>
                  <td className="px-4 py-3 font-semibold sm:px-6">{r.name}</td>
                  <td className="px-2 py-3">{r.city}</td>
                  <td className="px-2 py-3">{r.plan}</td>
                  <td className="tabular px-2 py-3">{nf.format(r.month + (i === 0 ? closed : 0))}</td>
                  <td className="tabular px-4 py-3 sm:px-6">{r.onTime}٪</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
