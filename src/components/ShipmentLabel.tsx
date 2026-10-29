import { QRCodeSVG } from 'qrcode.react'
import { OFFICE } from '../demo/data'
import { fmtTime, TRACK_URL } from '../demo/state'
import type { Shipment } from '../demo/types'

export function ShipmentLabel({ s, compact = false }: { s: Shipment; compact?: boolean }) {
  const f = s.form
  return (
    <div className="print-label overflow-hidden rounded-[18px] bg-white ring-2 ring-ink">
      <div className="stripes-dark h-4" aria-hidden />
      <div className="flex items-start justify-between gap-4 px-5 pt-4">
        <div>
          <p className="text-[13px] text-ink-soft">{OFFICE.name}</p>
          <p className="font-display text-[34px] leading-none tracking-wide" dir="ltr">
            {s.id}
          </p>
        </div>
        <div className="shrink-0 rounded-xl bg-white p-1.5 ring-1 ring-line">
          <QRCodeSVG value={`https://${TRACK_URL}`} size={compact ? 76 : 96} fgColor="#0B3B2E" level="M" />
        </div>
      </div>
      <div className="mt-3 flex items-center gap-3 bg-ink px-5 py-3 text-white">
        <span className="text-2xl font-bold">{f.from}</span>
        <svg aria-hidden width="46" height="12" viewBox="0 0 46 12" className="text-gold">
          <path d="M46 6H4M9 1 3 6l6 5" stroke="currentColor" strokeWidth="2" fill="none" />
        </svg>
        <span className="text-2xl font-bold">{f.to}</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-5 py-4 text-[14px]">
        <div>
          <dt className="text-[12px] text-ink-soft">المرسل</dt>
          <dd className="font-semibold">{f.senderName}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-soft">المرسل إليه</dt>
          <dd className="font-semibold">
            {f.recipientName} <span className="tabular text-ink-soft" dir="ltr">{f.recipientPhone}</span>
          </dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-soft">البضاعة</dt>
          <dd className="font-semibold">{f.goods}</dd>
        </div>
        <div>
          <dt className="text-[12px] text-ink-soft">القطع والوزن</dt>
          <dd className="tabular font-semibold">
            {f.pieces} قطع · {f.weight} كجم
          </dd>
        </div>
      </dl>
      <div className="flex items-center justify-between bg-ground px-5 py-2.5 text-[12px] text-ink-soft">
        <span>سُجّلت {fmtTime(s.createdAt).full}</span>
        <span>عرض تجريبي ببيانات وهمية</span>
      </div>
    </div>
  )
}
