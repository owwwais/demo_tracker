import type { Driver, Role, ShipmentForm, Status } from './types'

export const OFFICE = { name: 'الصقر للشحن البري', phone: '0500000000', city: 'الرياض' }

export const DRIVERS: Driver[] = [
  { id: 'd1', name: 'عبدالله', phone: '0500000003', plate: 'أ ب ج 1234' },
  { id: 'd2', name: 'ماجد', phone: '0500000005', plate: 'د هـ و 5678' },
  { id: 'd3', name: 'سعد', phone: '0500000006', plate: 'ح ط ي 9012' },
]

export const SECOND_DRIVER = { name: 'سالم', phone: '0500000004', plate: 'ك ل م 3456' }

export const AUTOFILL: ShipmentForm = {
  senderName: 'شركة الندى للتجارة',
  senderPhone: '0500000001',
  recipientName: 'فهد',
  recipientPhone: '0500000002',
  from: 'الرياض',
  to: 'جدة',
  goods: 'أجهزة إلكترونية',
  pieces: '4',
  weight: '38',
  price: '180',
}

export const EMPTY_FORM: ShipmentForm = {
  senderName: '',
  senderPhone: '',
  recipientName: '',
  recipientPhone: '',
  from: '',
  to: '',
  goods: '',
  pieces: '',
  weight: '',
  price: '',
}

export const STATUS_META: Record<Status, { label: string; tone: 'green' | 'gold' | 'late' | 'done' | 'muted' }> = {
  registered: { label: 'مسجّلة', tone: 'muted' },
  assigned: { label: 'بانتظار قبول السائق', tone: 'gold' },
  accepted: { label: 'قبلها السائق', tone: 'gold' },
  in_transit: { label: 'في الطريق', tone: 'green' },
  delayed: { label: 'متأخرة', tone: 'late' },
  out_for_delivery: { label: 'عند التسليم', tone: 'gold' },
  delivered: { label: 'تم الاستلام', tone: 'done' },
}

export const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: 'office', label: 'المكتب', hint: 'لوحة الشحنات' },
  { id: 'driver', label: 'السائق', hint: 'صفحة من رابط' },
  { id: 'tracking', label: 'المرسل إليه', hint: 'صفحة التتبع' },
  { id: 'owner', label: 'المالك', hint: 'لوحة المنصة' },
]

export interface StepDef {
  n: number
  title: string
  role: Role
  todo: string
  optional?: boolean
}

export const STEPS: StepDef[] = [
  { n: 1, title: 'تسجيل الشحنة', role: 'office', todo: 'اضغط «شحنة جديدة»، ثم «تعبئة تلقائية»، ثم «حفظ وإصدار الملصق».' },
  { n: 2, title: 'إسناد السائق', role: 'office', todo: 'اضغط «إسناد» على الشحنة واختر عبدالله.' },
  { n: 3, title: 'قبول السائق', role: 'driver', todo: 'السائق فتح الرابط من رسالته. اضغط «أوافق».' },
  { n: 4, title: 'المسح والخروج', role: 'driver', todo: 'اضغط «مسح QR»، ثم «خرجت من المكتب».' },
  { n: 5, title: 'المرسل إليه يتتبع', role: 'tracking', todo: 'هذه صفحة التتبع كما يراها فهد من الرابط. تابع حين تنتهي.' },
  { n: 6, title: 'تأخير', role: 'driver', todo: 'اضغط «تأخير» وحدّد الموعد الجديد، أو تخطَّ هذه الخطوة.', optional: true },
  { n: 7, title: 'استبدال السائق', role: 'driver', todo: 'اضغط «استبدال سائق» وأكمل الخطوات، أو تخطَّ هذه الخطوة.', optional: true },
  { n: 8, title: 'التسليم برمز', role: 'driver', todo: 'اضغط «تسليم»، ثم اكتب الرمز الذي وصل فهد في لوحة الرسائل.' },
  { n: 9, title: 'الإغلاق والأرقام', role: 'office', todo: 'الشحنة مغلقة بسجل كامل. انتقل إلى «المالك» لترى الأرقام وقد تحدّثت.' },
]

// Sample rows that sit in the office list beside the live shipment.
export const PAST_SHIPMENTS = [
  { id: 'TRK-24817', to: 'الدمام', recipient: 'نورة', driver: 'ماجد', status: 'delivered' as Status, when: 'أمس' },
  { id: 'TRK-24822', to: 'القصيم', recipient: 'خالد', driver: 'سعد', status: 'in_transit' as Status, when: 'اليوم 08:15' },
  { id: 'TRK-24826', to: 'المدينة المنورة', recipient: 'ريم', driver: 'ماجد', status: 'delayed' as Status, when: 'اليوم 07:50' },
]

export const OWNER = {
  offices: 14,
  shipmentsMonth: 1286,
  revenue: 23148, // SAR, platform subscriptions this month
  onTime: 94,
  monthly: [612, 704, 688, 812, 905, 978, 1041, 1120, 1086, 1194, 1238, 1285],
  months: ['نوفمبر', 'ديسمبر', 'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر'],
  table: [
    { name: 'الصقر للشحن البري', city: 'الرياض', plan: 'احترافي', month: 342, onTime: 96 },
    { name: 'درب الشمال للنقل', city: 'حائل', plan: 'أساسي', month: 118, onTime: 91 },
    { name: 'الساحل للشحن', city: 'جدة', plan: 'احترافي', month: 287, onTime: 95 },
    { name: 'نقل الواحة', city: 'الأحساء', plan: 'أساسي', month: 96, onTime: 89 },
    { name: 'القافلة السريعة', city: 'الدمام', plan: 'مؤسسات', month: 443, onTime: 97 },
  ],
}
