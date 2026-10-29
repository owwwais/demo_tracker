import { DRIVERS, OFFICE, SECOND_DRIVER, STEPS } from './data'
import type { DemoState, Driver, LogEvent, Message, Party, Role, Shipment, ShipmentForm } from './types'

export const START_CLOCK = 9 * 60 + 40 // اليوم 09:40
export const SHIPMENT_ID = 'TRK-24831'
export const TRACK_URL = 'trk.demo/t/24831'
export const DRIVER_URL = 'trk.demo/d/24831'

export type Action =
  | { type: 'CREATE'; form: ShipmentForm }
  | { type: 'ASSIGN'; driverId: string }
  | { type: 'ACCEPT' }
  | { type: 'SCAN' }
  | { type: 'DEPART' }
  | { type: 'NEXT' }
  | { type: 'SKIP' }
  | { type: 'DELAY'; minutes: number; reason: string }
  | { type: 'REPLACE_START' }
  | { type: 'REPLACE_SCANNED' }
  | { type: 'REPLACE_DETAILS'; name: string; phone: string }
  | { type: 'REPLACE_PHOTO' }
  | { type: 'REPLACE_CANCEL' }
  | { type: 'REPLACE_CONFIRM' }
  | { type: 'DELIVER_START' }
  | { type: 'DELIVER_CONFIRM' }
  | { type: 'SET_ROLE'; role: Role }
  | { type: 'READ' }
  | { type: 'RESET' }

export const initialState: DemoState = {
  step: 1,
  role: 'office',
  clock: START_CLOCK,
  shipment: null,
  messages: [],
  unread: 0,
  replace: null,
  skipped: [],
  seq: 1,
}

export function fmtTime(min: number) {
  const day = Math.floor(min / 1440)
  const m = ((min % 1440) + 1440) % 1440
  const hh = String(Math.floor(m / 60)).padStart(2, '0')
  const mm = String(m % 60).padStart(2, '0')
  const d = day === 0 ? 'اليوم' : day === 1 ? 'غدًا' : `بعد ${day} أيام`
  return { day: d, time: `${hh}:${mm}`, full: `${d} ${hh}:${mm}` }
}

function partyName(s: Shipment, p: Party) {
  switch (p) {
    case 'sender':
      return s.form.senderName
    case 'recipient':
      return s.form.recipientName
    case 'driver':
      return s.driver?.name ?? ''
    case 'driver2':
      return SECOND_DRIVER.name
    case 'office':
      return OFFICE.name
  }
}

type Draft = { state: DemoState; s: Shipment }

function msg(d: Draft, to: Party, body: string, extra: Partial<Message> = {}) {
  d.state.messages = [
    ...d.state.messages,
    { id: d.state.seq++, to, toName: partyName(d.s, to), at: d.state.clock, body, ...extra },
  ]
  d.state.unread += 1
}

function log(d: Draft, text: string, actor: LogEvent['actor'], tone?: LogEvent['tone']) {
  d.s.events = [...d.s.events, { id: d.state.seq++, at: d.state.clock, text, actor, tone }]
}

function advance(state: DemoState, to: number) {
  return { ...state, step: Math.max(state.step, to) }
}

/** Runs a mutation against shallow copies so the reducer stays pure. */
function withShipment(state: DemoState, fn: (d: Draft) => void): DemoState {
  if (!state.shipment) return state
  const d: Draft = { state: { ...state }, s: { ...state.shipment } }
  fn(d)
  d.state.shipment = d.s
  return d.state
}

export function reducer(state: DemoState, a: Action): DemoState {
  switch (a.type) {
    case 'SET_ROLE':
      return { ...state, role: a.role }
    case 'READ':
      return { ...state, unread: 0 }
    case 'RESET':
      return initialState

    case 'CREATE': {
      if (state.shipment) return state
      const s: Shipment = {
        id: SHIPMENT_ID,
        form: a.form,
        status: 'registered',
        createdAt: state.clock,
        driver: null,
        previousDriver: null,
        scanned: false,
        eta: 0,
        delay: null,
        otp: null,
        events: [],
      }
      const next = withShipment({ ...state, shipment: s }, (d) => {
        log(d, `سُجّلت الشحنة وأُصدر الملصق (${a.form.pieces} قطع، ${a.form.weight} كجم)`, 'office')
        msg(
          d,
          'sender',
          `تم تسجيل شحنتك رقم ${SHIPMENT_ID} لدى ${OFFICE.name}، من ${a.form.from} إلى ${a.form.to} باسم المرسل إليه ${a.form.recipientName}. سيصلك رابط التتبع عند خروج الشحنة.`,
        )
      })
      return advance(next, 2)
    }

    case 'ASSIGN': {
      const driver = DRIVERS.find((x) => x.id === a.driverId) as Driver
      const next = withShipment({ ...state, clock: state.clock + 6 }, (d) => {
        d.s.driver = driver
        d.s.status = 'assigned'
        log(d, `أُسندت الشحنة إلى السائق ${driver.name}`, 'office')
        msg(
          d,
          'driver',
          `لديك شحنة جديدة ${SHIPMENT_ID} من ${OFFICE.name}: ${d.s.form.from} ← ${d.s.form.to}، ${d.s.form.pieces} قطع (${d.s.form.goods}). افتح الرابط للقبول أو الرفض.`,
          { link: 'driver' },
        )
      })
      return advance(next, 3)
    }

    case 'ACCEPT': {
      const next = withShipment({ ...state, clock: state.clock + 4 }, (d) => {
        d.s.status = 'accepted'
        log(d, `قبل السائق ${d.s.driver?.name} الشحنة`, 'driver')
        msg(d, 'office', `قبل السائق ${d.s.driver?.name} الشحنة ${SHIPMENT_ID}، وهو في الطريق إلى المكتب للاستلام.`)
      })
      return advance(next, 4)
    }

    case 'SCAN':
      return withShipment({ ...state, clock: state.clock + 25 }, (d) => {
        d.s.scanned = true
        log(d, 'مسح السائق ملصق الشحنة في المكتب', 'driver')
      })

    case 'DEPART': {
      const next = withShipment({ ...state, clock: state.clock + 6 }, (d) => {
        d.s.status = 'in_transit'
        d.s.eta = d.state.clock + 11 * 60 + 20
        const eta = fmtTime(d.s.eta).full
        log(d, `خرجت الشحنة من المكتب. الوصول المتوقع ${eta}`, 'driver')
        msg(
          d,
          'sender',
          `خرجت شحنتك ${SHIPMENT_ID} من ${OFFICE.name} مع السائق ${d.s.driver?.name}. الوصول المتوقع إلى ${d.s.form.to}: ${eta}. تابعها من الرابط.`,
          { link: 'tracking' },
        )
        msg(
          d,
          'recipient',
          `مرحبًا ${d.s.form.recipientName}، شحنتك من ${d.s.form.senderName} في الطريق إليك مع السائق ${d.s.driver?.name}. الوصول المتوقع: ${eta}. تابعها من الرابط دون أن تتصل بأحد.`,
          { link: 'tracking' },
        )
      })
      return advance(next, 5)
    }

    case 'NEXT':
      return advance(state, state.step + 1)

    case 'SKIP':
      return { ...advance(state, state.step + 1), skipped: [...state.skipped, state.step], replace: null }

    case 'DELAY': {
      const next = withShipment({ ...state, clock: state.clock + 3 * 60 + 10 }, (d) => {
        const newEta = d.s.eta + a.minutes
        d.s.delay = { newEta, reason: a.reason }
        d.s.status = 'delayed'
        const t = fmtTime(newEta).full
        log(d, `أبلغ السائق عن تأخير: ${a.reason}. الموعد الجديد ${t}`, 'driver', 'late')
        const body = `تأخرت الشحنة ${SHIPMENT_ID} بسبب ${a.reason}. الموعد الجديد المتوقع: ${t}.`
        msg(d, 'sender', body, { link: 'tracking' })
        msg(d, 'recipient', body, { link: 'tracking' })
        msg(d, 'office', `أبلغ السائق ${d.s.driver?.name} عن تأخير الشحنة ${SHIPMENT_ID}: ${a.reason}. الموعد الجديد ${t}.`)
      })
      return advance(next, 7)
    }

    case 'REPLACE_START':
      return { ...state, replace: { stage: 'scan', name: '', phone: '', photo: false } }
    case 'REPLACE_CANCEL':
      return { ...state, replace: null }
    case 'REPLACE_SCANNED':
      return state.replace ? { ...state, replace: { ...state.replace, stage: 'details' } } : state
    case 'REPLACE_DETAILS':
      return state.replace ? { ...state, replace: { ...state.replace, stage: 'photo', name: a.name, phone: a.phone } } : state
    case 'REPLACE_PHOTO': {
      if (!state.replace) return state
      const next = withShipment({ ...state, clock: state.clock + 2 * 60 + 5 }, (d) => {
        log(d, `بدأ السائق ${d.s.driver?.name} استبدالًا إلى ${SECOND_DRIVER.name} مع صورة للحمولة`, 'driver')
        msg(
          d,
          'driver2',
          `طلب ${d.s.driver?.name} تسليمك الشحنة ${SHIPMENT_ID} (${d.s.form.pieces} قطع) لإكمالها إلى ${d.s.form.to}. افتح الرابط وأكّد الاستلام.`,
          { link: 'driver' },
        )
      })
      return { ...next, replace: { ...state.replace, stage: 'await', photo: true } }
    }
    case 'REPLACE_CONFIRM': {
      const next = withShipment({ ...state, clock: state.clock + 8 }, (d) => {
        const prev = d.s.driver as Driver
        d.s.previousDriver = prev
        d.s.driver = { id: 'd9', name: SECOND_DRIVER.name, phone: SECOND_DRIVER.phone, plate: SECOND_DRIVER.plate }
        log(d, `أكّد السائق ${SECOND_DRIVER.name} الاستلام من ${prev.name}`, 'driver')
        const body = `تم استبدال سائق الشحنة ${SHIPMENT_ID}: يكملها الآن السائق ${SECOND_DRIVER.name} بدلًا من ${prev.name}. الموعد المتوقع لم يتغير.`
        msg(d, 'sender', body, { link: 'tracking' })
        msg(d, 'recipient', body, { link: 'tracking' })
        msg(d, 'office', `استُبدل سائق الشحنة ${SHIPMENT_ID}: من ${prev.name} إلى ${SECOND_DRIVER.name} (${SECOND_DRIVER.phone}). الصورة محفوظة في السجل.`)
      })
      return { ...advance(next, 8), replace: { ...(state.replace as NonNullable<DemoState['replace']>), stage: 'done' } }
    }

    case 'DELIVER_START': {
      const target = state.shipment ? (state.shipment.delay?.newEta ?? state.shipment.eta) - 6 : state.clock
      return withShipment({ ...state, clock: Math.max(state.clock + 30, target), replace: null }, (d) => {
        d.s.status = 'out_for_delivery'
        d.s.otp = String(Math.floor(100000 + Math.random() * 900000))
        log(d, `وصل السائق ${d.s.driver?.name} وطلب رمز الاستلام`, 'driver')
        msg(
          d,
          'recipient',
          `وصل السائق ${d.s.driver?.name} بشحنتك ${SHIPMENT_ID}. رمز الاستلام أدناه، أعطه للسائق بعد أن تستلم الطرد فقط.`,
          { code: d.s.otp },
        )
      })
    }

    case 'DELIVER_CONFIRM': {
      const next = withShipment({ ...state, clock: state.clock + 3 }, (d) => {
        d.s.status = 'delivered'
        log(d, `تم الاستلام بالرمز. أُغلقت الشحنة`, 'recipient', 'ok')
        msg(d, 'sender', `تم تسليم شحنتك ${SHIPMENT_ID} إلى ${d.s.form.recipientName} في ${d.s.form.to} وتأكيدها برمز الاستلام. شكرًا لتعاملك مع ${OFFICE.name}.`)
        msg(d, 'recipient', `تم تأكيد استلامك للشحنة ${SHIPMENT_ID}. شكرًا لك.`)
      })
      return advance(next, 9)
    }
  }
}

export const stepDef = (n: number) => STEPS[Math.min(Math.max(n, 1), 9) - 1]
