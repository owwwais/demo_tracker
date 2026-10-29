export type Role = 'office' | 'driver' | 'tracking' | 'owner'

export type Status =
  | 'registered'
  | 'assigned'
  | 'accepted'
  | 'in_transit'
  | 'delayed'
  | 'out_for_delivery'
  | 'delivered'

export type Party = 'sender' | 'recipient' | 'driver' | 'driver2' | 'office'

export interface Driver {
  id: string
  name: string
  phone: string
  plate: string
}

export interface ShipmentForm {
  senderName: string
  senderPhone: string
  recipientName: string
  recipientPhone: string
  from: string
  to: string
  goods: string
  pieces: string
  weight: string
  price: string
}

export interface LogEvent {
  id: number
  at: number // simulated minutes since midnight + day offset * 1440
  text: string
  actor: 'office' | 'driver' | 'recipient' | 'system'
  tone?: 'late' | 'ok'
}

export interface Shipment {
  id: string
  form: ShipmentForm
  status: Status
  createdAt: number
  driver: Driver | null
  previousDriver: Driver | null
  scanned: boolean
  eta: number
  delay: { newEta: number; reason: string } | null
  otp: string | null
  events: LogEvent[]
}

export interface Message {
  id: number
  to: Party
  toName: string
  at: number
  body: string
  link?: 'tracking' | 'driver'
  code?: string
}

export interface ReplaceFlow {
  stage: 'scan' | 'details' | 'photo' | 'await' | 'done'
  name: string
  phone: string
  photo: boolean
}

export interface DemoState {
  step: number // 1..9
  role: Role
  clock: number
  shipment: Shipment | null
  messages: Message[]
  unread: number
  replace: ReplaceFlow | null
  skipped: number[]
  seq: number
}
