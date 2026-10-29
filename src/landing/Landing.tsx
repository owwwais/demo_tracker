import { useEffect, useState } from 'react'
import { ArrowLeft, Check, ChevronDown, Truck } from 'lucide-react'
import { Wordmark } from '../components/ui'

function useReveal() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('.reveal'))
    if (!('IntersectionObserver' in window)) {
      els.forEach((e) => e.classList.add('in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add('in')
            io.unobserve(en.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [])
}

const d = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties

const NAV = [
  { href: '#journey', label: 'رحلة الطرد' },
  { href: '#parties', label: 'الأطراف' },
  { href: '#pricing', label: 'الأسعار' },
  { href: '#faq', label: 'الأسئلة' },
]

function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-20">
      <div className="stripes-dark h-2" aria-hidden />
      <div className="wrap flex items-center justify-between gap-4 py-5">
        <a href="#/" aria-label="TRACKER، الرئيسية" className="rounded-lg">
          <Wordmark light />
        </a>
        <nav aria-label="الرئيسية" className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-[15px] text-white/80 transition hover:text-white" onClick={scrollTo(n.href)}>
              {n.label}
            </a>
          ))}
        </nav>
        <a href="#/demo" className="btn-gold btn-sm">
          جرّب الديمو
        </a>
      </div>
    </header>
  )
}

// Hash routing owns the URL hash, so in-page links scroll by hand.
const scrollTo = (href: string) => (e: React.MouseEvent) => {
  e.preventDefault()
  document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function HeroPhone() {
  return (
    <div className="w-[248px] rounded-[38px] bg-ink-2 p-[7px] shadow-float sm:w-[268px]" aria-label="صفحة التتبع كما تصل المرسل إليه" role="img">
      <div className="overflow-hidden rounded-[31px] bg-ground">
        <div className="bg-ink px-4 pb-4 pt-4 text-white">
          <div className="flex items-center justify-between">
            <span className="font-display text-[17px] tracking-wide" dir="ltr">TRK-24831</span>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand">في الطريق</span>
          </div>
          <p className="mt-3 text-[11px] text-white/70">الوصول المتوقع</p>
          <p className="tabular text-[22px] font-bold leading-tight">اليوم 21:41</p>
          <div className="relative mt-5 h-1.5 rounded-full bg-white/15">
            <span className="drive absolute top-1/2 grid h-6 w-6 -translate-y-1/2 translate-x-1/2 place-items-center rounded-full bg-gold text-ink ring-[3px] ring-ink">
              <Truck size={12} className="-scale-x-100" />
            </span>
          </div>
          <div className="mt-2.5 flex justify-between text-[11px] font-semibold">
            <span>الرياض</span>
            <span>جدة</span>
          </div>
        </div>
        <div className="space-y-2 p-3">
          {[
            ['سُجّلت في المكتب', 'اليوم 09:40', true],
            ['خرجت من المكتب', 'اليوم 10:21', true],
            ['وصل السائق', '', false],
            ['تم الاستلام', '', false],
          ].map(([t, at, done]) => (
            <div key={t as string} className="flex items-center gap-2.5 rounded-xl bg-white px-3 py-2">
              <span className={`grid h-4 w-4 place-items-center rounded-full ${done ? 'bg-brand text-white' : 'bg-line'}`}>{done && <Check size={10} strokeWidth={3} />}</span>
              <span className={`text-[12px] ${done ? 'font-semibold' : 'text-ink-soft'}`}>{t}</span>
              <span className="tabular ms-auto text-[10.5px] text-ink-soft">{at}</span>
            </div>
          ))}
          <div className="rounded-xl bg-white px-3 py-2 text-[11.5px]">
            السائق <b>عبدالله</b> · الصقر للشحن البري
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink pb-16 pt-28 text-white sm:pb-20 lg:min-h-[92vh] lg:pb-0 lg:pt-32">
      <div className="wrap relative grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10">
          <h1 className="animate-rise text-[44px] font-bold leading-[1.08] tracking-[-.01em] sm:text-[60px] lg:text-[76px]">
            اعرف أين طردك
            <br />
            دون أن تتصل
          </h1>
          <p className="animate-rise mt-7 max-w-[34rem] text-[18px] leading-relaxed text-white/85 sm:text-[20px]" style={{ animationDelay: '90ms' }}>
            TRACKER لمكاتب الشحن البري: رسالة تصل المرسل والمرسل إليه عند كل خطوة، وصفحة للسائق بنقرات قليلة، وكل الشحنات في لوحة واحدة.
          </p>
          <div className="animate-rise mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: '180ms' }}>
            <a href="#/demo" className="btn-gold px-7 py-4 text-[17px]">
              جرّب الديمو
              <ArrowLeft size={20} aria-hidden />
            </a>
            <span className="text-[14px] text-white/70">رحلة طرد كاملة في أقل من ثلاث دقائق</span>
          </div>
        </div>

        <div className="relative h-[420px] sm:h-[520px] lg:h-[640px]">
          <div className="absolute inset-y-0 -start-4 -end-4 overflow-hidden rounded-[28px] sm:start-0 sm:end-0 lg:-end-[max(2rem,calc((100vw-1240px)/2+2rem))] lg:rounded-e-none">
            <picture>
              <source media="(max-width: 700px)" srcSet="/hero-road-sm.webp" />
              <img
                src="/hero-road.webp"
                alt="شاحنة نقل بيضاء على طريق صحراوي وقت الغروب"
                className="drift h-full w-full object-cover object-[62%_50%]"
                fetchPriority="high"
                width={1600}
                height={900}
              />
            </picture>
            <div className="absolute inset-0 bg-ink/15" aria-hidden />
          </div>
          <div className="animate-rise absolute bottom-6 start-2 sm:start-8 lg:bottom-auto lg:start-[-56px] lg:top-1/2 lg:-translate-y-1/2" style={{ animationDelay: '260ms' }}>
            <HeroPhone />
          </div>
        </div>
      </div>
    </section>
  )
}

const PROBLEMS = [
  { t: 'هاتف المكتب لا يهدأ', b: 'المرسل إليه يتصل ليسأل: أين طردي؟ ومتى يصل؟ والمكتب يتصل بالسائق ليعرف.', big: true },
  { t: 'السائق بين المكالمات والطريق', b: 'يرد على الأسئلة وهو يقود، ولا أداة بسيطة يسجّل بها ما حدث.' },
  { t: 'لا صورة كاملة', b: 'دفاتر ومحادثات متفرقة، ولا سجل واحد يجمع رحلة كل شحنة.' },
  { t: 'تسليم بلا إثبات', b: 'لا شيء يثبت أن الطرد وصل إلى الشخص الصحيح وفي أي وقت.', dark: true },
]

function Problem() {
  return (
    <section className="py-24 sm:py-32" aria-labelledby="problem-h">
      <div className="wrap">
        <h2 id="problem-h" className="reveal max-w-[22ch] text-[34px] font-bold leading-tight sm:text-[48px]">
          المشكلة ليست في الطريق، بل في الاتصال
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {PROBLEMS.map((p, i) => (
            <article
              key={p.t}
              style={d(i * 80)}
              className={`reveal flex flex-col justify-end rounded-[24px] p-6 sm:p-8 ${
                p.big ? 'bg-brand text-white md:col-span-2 md:min-h-[260px]' : p.dark ? 'bg-ink text-white md:col-span-2 md:min-h-[220px]' : 'bg-white md:min-h-[220px]'
              }`}
            >
              <h3 className={`font-bold ${p.big ? 'text-[28px] sm:text-[36px]' : 'text-[22px]'}`}>{p.t}</h3>
              <p className={`mt-3 max-w-[40ch] text-[16.5px] leading-relaxed ${p.big || p.dark ? 'text-white/85' : 'text-ink'}`}>{p.b}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const JOURNEY = [
  { who: 'المكتب', t: 'يسجّل الشحنة', b: 'نموذج قصير، وملصق برمز QR جاهز للطباعة. يصل المرسل تأكيد.', c: 'g' },
  { who: 'المكتب', t: 'يسند لسائق', b: 'يختار السائق من القائمة، فتصله رسالة فيها رابط.', c: 'g' },
  { who: 'السائق', t: 'يقبل', b: 'من الرابط مباشرة، بلا تطبيق ولا كلمة مرور.', c: 'y' },
  { who: 'السائق', t: 'يمسح ويخرج', b: 'يمسح الملصق ثم «خرجت من المكتب». يصل الطرفين رابط التتبع.', c: 'y' },
  { who: 'المرسل إليه', t: 'يتابع', b: 'خط زمني، واسم السائق والمكتب، والموعد المتوقع.', c: 'g' },
  { who: 'السائق', t: 'يسلّم برمز', b: 'رمز من ست أرقام يصل المرسل إليه وحده، ولا تُغلق الشحنة إلا به.', c: 'y' },
  { who: 'المكتب', t: 'يغلق ويرى السجل', b: 'كل حدث بوقته وصاحبه، في لوحة واحدة.', c: 'g' },
]

function Journey() {
  return (
    <section id="journey" className="scroll-mt-6 bg-white py-24 sm:py-32" aria-labelledby="journey-h">
      <div className="wrap">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <h2 id="journey-h" className="reveal text-[34px] font-bold leading-tight sm:text-[48px]">
            رحلة الطرد في سبع خطوات
          </h2>
          <p className="reveal flex flex-wrap gap-4 text-[15px]" style={d(80)}>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-brand" aria-hidden /> المكتب والمرسل إليه
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-gold" aria-hidden /> السائق
            </span>
          </p>
        </div>

        <p className="reveal mt-4 max-w-[52ch] text-[17px] leading-relaxed" style={d(120)}>
          من مكتب في الرياض إلى باب في جدة. كل نقطة على الطريق رسالة تصل من يهمه الأمر في وقتها.
        </p>

        <ol className="relative mt-14 grid gap-0 lg:grid-cols-7 lg:gap-3">
          <span aria-hidden className="absolute bottom-6 start-[15px] top-6 w-1 rounded-full bg-ground lg:inset-x-6 lg:bottom-auto lg:top-[14px] lg:h-1 lg:w-auto" />
          {JOURNEY.map((s, i) => (
            <li key={s.t} className="reveal relative flex gap-5 pb-8 lg:block lg:pb-0" style={d(i * 70)}>
              <span
                className={`relative z-[1] grid h-8 w-8 shrink-0 place-items-center rounded-full text-[14px] font-bold ring-[6px] ring-white ${s.c === 'y' ? 'bg-gold text-ink' : 'bg-brand text-white'}`}
                aria-hidden
              >
                {i === 6 ? <Check size={16} strokeWidth={3} /> : <span className="tabular">{i + 1}</span>}
              </span>
              <div className="lg:mt-5">
                <p className={`text-[13.5px] font-semibold ${s.c === 'y' ? 'text-gold-text' : 'text-brand'}`}>{s.who}</p>
                <h3 className="mt-0.5 text-[20px] font-bold">{s.t}</h3>
                <p className="mt-1.5 text-[15px] leading-relaxed">{s.b}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="reveal mt-16 flex flex-wrap items-center justify-between gap-4 rounded-[24px] bg-ground p-6 sm:p-8">
          <p className="text-[20px] font-bold sm:text-[24px]">مرّ بالرحلة بنفسك، بأربعة أدوار</p>
          <a href="#/demo" className="btn-primary">
            افتح الديمو <ArrowLeft size={18} aria-hidden />
          </a>
        </div>
      </div>
    </section>
  )
}

function Parties() {
  return (
    <section id="parties" className="scroll-mt-6 py-24 sm:py-32" aria-labelledby="parties-h">
      <div className="wrap">
        <h2 id="parties-h" className="reveal text-[34px] font-bold leading-tight sm:text-[48px]">
          خمسة أطراف، كلٌّ يرى ما يخصه
        </h2>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          <article className="reveal overflow-hidden rounded-[24px] bg-white md:col-span-4 md:grid md:grid-cols-2">
            <img src="/office-counter.webp" alt="طرود مغلقة بملصقات بيضاء على طاولة مكتب شحن" loading="lazy" width={1000} height={750} className="h-60 w-full object-cover md:h-full" />
            <div className="flex flex-col justify-end p-6 sm:p-8">
              <p className="text-[14px] font-semibold text-brand">المكتب</p>
              <h3 className="mt-1 text-[26px] font-bold leading-snug">كل الشحنات في لوحة واحدة</h3>
              <ul className="mt-4 space-y-2 text-[15.5px]">
                {['تسجيل الشحنة وطباعة ملصق QR', 'إسناد السائق بضغطة', 'حالة ملونة لكل شحنة', 'سجل أحداث كامل بالوقت'].map((x) => (
                  <li key={x} className="flex gap-2">
                    <Check size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <article className="reveal relative min-h-[360px] overflow-hidden rounded-[24px] bg-gold md:col-span-2" style={d(80)}>
            <img src="/driver-dock.webp" alt="يد تمسك جوالًا أمام باب شاحنة محمّلة بالطرود" loading="lazy" width={1000} height={750} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-3 bottom-3 rounded-[18px] bg-gold p-5 text-ink">
              <p className="text-[14px] font-semibold">السائق</p>
              <h3 className="mt-1 text-[22px] font-bold leading-snug">رابط، لا تطبيق</h3>
              <p className="mt-1.5 text-[15px]">قبول، مسح، تأخير، استبدال، تسليم. كل شيء بنقرة أو اثنتين.</p>
            </div>
          </article>

          <article className="reveal rounded-[24px] bg-brand p-6 text-white sm:p-8 md:col-span-2" style={d(60)}>
            <p className="text-[14px] font-semibold text-white/80">المرسل</p>
            <h3 className="mt-1 text-[22px] font-bold">يعرف أن شحنته تحركت</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-white/90">رسالة عند التسجيل، وعند الخروج مع رابط التتبع، وعند التسليم.</p>
          </article>
          <article className="reveal rounded-[24px] bg-white p-6 sm:p-8 md:col-span-2" style={d(120)}>
            <p className="text-[14px] font-semibold text-brand">المرسل إليه</p>
            <h3 className="mt-1 text-[22px] font-bold">يتابع دون أن يتصل</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed">رابط تتبع بخط زمني وموعد متوقع، ورمز استلام يصله وحده.</p>
          </article>
          <article className="reveal rounded-[24px] bg-ink p-6 text-white sm:p-8 md:col-span-2" style={d(180)}>
            <p className="text-[14px] font-semibold text-gold">مالك المنصة</p>
            <h3 className="mt-1 text-[22px] font-bold">يرى المكاتب كلها</h3>
            <p className="mt-2 text-[15.5px] leading-relaxed text-white/85">عدد المكاتب، وشحنات الشهر، والإيراد، في لوحة واحدة.</p>
          </article>
        </div>
      </div>
    </section>
  )
}

const PERIODS = [
  { id: 'm1', label: 'شهري', months: 1, off: 0 },
  { id: 'm3', label: '3 أشهر', months: 3, off: 5 },
  { id: 'm6', label: '6 أشهر', months: 6, off: 10 },
  { id: 'm12', label: 'سنوي', months: 12, off: 20 },
]

const PLANS = [
  { name: 'أساسي', base: 149, for: 'مكتب واحد يبدأ', items: ['حتى 300 شحنة شهريًا', 'رسائل المرسل والمرسل إليه', 'واجهة السائق', 'لوحة المكتب'] },
  { name: 'احترافي', base: 299, for: 'مكتب بحركة يومية', items: ['حتى 1,000 شحنة شهريًا', 'كل ما في الأساسي', 'التأخير واستبدال السائق', 'سجل أحداث قابل للتصدير'], featured: true },
  { name: 'مؤسسات', base: 599, for: 'عدة فروع', items: ['شحنات بلا حد', 'كل ما في الاحترافي', 'عدة فروع في حساب واحد', 'دعم مخصص'] },
]

function Pricing() {
  const [p, setP] = useState(PERIODS[0])
  return (
    <section id="pricing" className="scroll-mt-6 bg-ink py-24 text-white sm:py-32" aria-labelledby="pricing-h">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="pricing-h" className="reveal text-[34px] font-bold leading-tight sm:text-[48px]">
            الأسعار
          </h2>
          <div role="radiogroup" aria-label="مدة الاشتراك" className="reveal flex rounded-full bg-white/10 p-1" style={d(80)}>
            {PERIODS.map((x) => (
              <button
                key={x.id}
                role="radio"
                aria-checked={p.id === x.id}
                onClick={() => setP(x)}
                className={`rounded-full px-3.5 py-2 text-[14px] font-semibold transition sm:px-5 ${p.id === x.id ? 'bg-gold text-ink' : 'text-white/80 hover:text-white'}`}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {PLANS.map((pl, i) => {
            const monthly = Math.round(pl.base * (1 - p.off / 100))
            return (
              <article key={pl.name} style={d(i * 80)} className={`reveal flex flex-col rounded-[24px] p-7 sm:p-8 ${pl.featured ? 'bg-white text-ink' : 'bg-white/[.06]'}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-[22px] font-bold">{pl.name}</h3>
                  {pl.featured && <span className="rounded-full bg-gold px-3 py-1 text-[13px] font-semibold text-ink">الأكثر اختيارًا</span>}
                </div>
                <p className={`mt-1 text-[15px] ${pl.featured ? 'text-ink-soft' : 'text-white/70'}`}>{pl.for}</p>
                <p className="mt-6 flex items-baseline gap-2">
                  <span key={monthly} className="tabular animate-pop font-display text-[56px] leading-none">{monthly}</span>
                  <span className={`text-[15px] ${pl.featured ? 'text-ink-soft' : 'text-white/70'}`}>ريال شهريًا</span>
                </p>
                <p className={`mt-2 h-5 text-[13.5px] ${pl.featured ? 'text-gold-text' : 'text-gold'}`}>
                  {p.off > 0 ? `تُدفع ${(monthly * p.months).toLocaleString('en-US')} ريال كل ${p.label}، بخصم ${p.off}٪` : 'تُدفع شهريًا، بلا التزام'}
                </p>
                <ul className="mt-6 flex-1 space-y-2.5 text-[15.5px]">
                  {pl.items.map((x) => (
                    <li key={x} className="flex gap-2">
                      <Check size={18} className={`mt-0.5 shrink-0 ${pl.featured ? 'text-brand' : 'text-gold'}`} aria-hidden /> {x}
                    </li>
                  ))}
                </ul>
                <a href="#/demo" className={`mt-8 ${pl.featured ? 'btn-primary' : 'btn bg-white/10 text-white hover:bg-white/20'}`}>
                  جرّبه في الديمو
                </a>
              </article>
            )
          })}
        </div>
        <p className="mt-6 text-[14px] text-white/60">الأسعار للعرض فقط، ولا اشتراك أو دفع في هذا الديمو.</p>
      </div>
    </section>
  )
}

const FAQ = [
  { q: 'هل يحتاج السائق إلى تطبيق؟', a: 'لا. تصله رسالة فيها رابط، فيفتحه من متصفح جواله ويعمل بنقرات قليلة.' },
  { q: 'كيف يعرف المرسل إليه مكان طرده؟', a: 'تصله رسالة فيها رابط تتبع لحظة خروج الشحنة من المكتب، ويتحدّث الرابط عند كل خطوة: الخروج، والتأخير إن حدث، ووصول السائق، والتسليم.' },
  { q: 'ماذا لو تأخر السائق في الطريق؟', a: 'يضغط «تأخير» ويحدد الموعد الجديد والسبب، فيصل الإشعار إلى المرسل والمرسل إليه والمكتب معًا.' },
  { q: 'ماذا لو تغيّر السائق أثناء الرحلة؟', a: 'يمسح السائق الأول رمز الشحنة، ويُدخل بيانات السائق الثاني، ويلتقط صورة للحمولة. ثم يؤكد الثاني الاستلام، فيصل الجميع إشعار الاستبدال.' },
  { q: 'كيف نتأكد أن الطرد وصل إلى الشخص الصحيح؟', a: 'عند التسليم يصل المرسل إليه وحده رمز من ست أرقام، يعطيه للسائق بعد أن يستلم. لا تُغلق الشحنة إلا بهذا الرمز.' },
  { q: 'هل البيانات في الديمو حقيقية؟', a: 'لا. كل الأسماء والأرقام وهمية، والرسائل محاكاة داخل المتصفح. لا يُرسل شيء خارج جهازك.' },
]

function Faq() {
  return (
    <section id="faq" className="scroll-mt-6 py-24 sm:py-32" aria-labelledby="faq-h">
      <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.6fr]">
        <div>
          <h2 id="faq-h" className="reveal text-[34px] font-bold leading-tight sm:text-[48px]">
            أسئلة شائعة
          </h2>
          <p className="reveal mt-4 max-w-[34ch] text-[17px] leading-relaxed" style={d(80)}>
            أقصر جواب على أي سؤال هنا: جرّب الرحلة بنفسك في الديمو.
          </p>
          <a href="#/demo" className="reveal btn-primary mt-6" style={d(140)}>
            جرّب الديمو <ArrowLeft size={18} aria-hidden />
          </a>
        </div>
        <div className="space-y-3">
          {FAQ.map((f, i) => (
            <details key={f.q} className="reveal group rounded-[20px] bg-white" style={d(i * 50)}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-[17px] font-bold sm:p-6 [&::-webkit-details-marker]:hidden">
                {f.q}
                <ChevronDown size={20} className="shrink-0 text-brand transition-transform duration-300 group-open:rotate-180" aria-hidden />
              </summary>
              <p className="-mt-1 px-5 pb-6 text-[16px] leading-relaxed sm:px-6">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="overflow-hidden bg-ink text-white">
      <div className="stripes h-3" aria-hidden />
      <div className="wrap pb-8 pt-16">
        <div className="flex flex-wrap items-start justify-between gap-8">
          <p className="max-w-[30ch] text-[20px] font-bold leading-snug">جاهز لترى رحلة طرد كاملة؟</p>
          <nav aria-label="روابط التذييل" className="flex flex-wrap gap-x-7 gap-y-2 text-[15px] text-white/80">
            {NAV.map((n) => (
              <a key={n.href} href={n.href} onClick={scrollTo(n.href)} className="hover:text-white">
                {n.label}
              </a>
            ))}
            <a href="#/demo" className="font-semibold text-gold hover:text-white">
              جرّب الديمو
            </a>
          </nav>
        </div>
        <p dir="ltr" aria-hidden className="mt-12 select-none text-center font-display text-[24vw] leading-[.8] tracking-[.02em] text-white lg:text-[300px]">
          TRACKER
        </p>
        <div className="mt-8 flex flex-wrap justify-between gap-2 text-[13.5px] text-white/60">
          <p>عرض تجريبي ببيانات وهمية</p>
          <p>كل الأرقام بصيغة 0500000000 ولا تعود لأحد</p>
        </div>
      </div>
    </footer>
  )
}

export function Landing() {
  useReveal()
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Journey />
        <Parties />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </>
  )
}
