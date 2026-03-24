import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  ChevronRight,
  Code2,
  Gamepad2,
  GraduationCap,
  HelpCircle,
  Keyboard,
  Layers3,
  Rocket,
  Settings2,
  Sparkles,
  Target,
} from 'lucide-react'

type DocSection = {
  id: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  content: React.ReactNode
}

const sectionsBase: Omit<DocSection, 'content'>[] = [
  { id: 'overview', title: 'Umumiy Ko‘rinish', icon: BookOpen },
  { id: 'how-to-play', title: 'Qanday O‘ynaladi', icon: Gamepad2 },
  { id: 'controls', title: 'Boshqaruv', icon: Keyboard },
  { id: 'quiz-system', title: 'Quiz Tizimi', icon: Target },
  { id: 'levels', title: 'Bosqichlar', icon: Layers3 },
  { id: 'teacher-guide', title: 'O‘qituvchi Qo‘llanmasi', icon: GraduationCap },
  { id: 'developer-guide', title: 'Dasturchi Qo‘llanmasi', icon: Code2 },
  { id: 'faq', title: 'FAQ', icon: HelpCircle },
  { id: 'roadmap', title: 'Yo‘l Xaritasi', icon: Rocket },
]

function CodeBlock({ title, code }: { title?: string; code: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#090c14]">
      {title ? (
        <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2">
          <span className="text-xs font-medium text-white/70">{title}</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-400/80" />
            <span className="h-2 w-2 rounded-full bg-amber-400/80" />
            <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
          </div>
        </div>
      ) : null}
      <pre className="overflow-x-auto p-4 text-xs leading-6 text-slate-200 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function DocCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">{children}</div>
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = useMemo<DocSection[]>(
    () => [
      {
        ...sectionsBase[0],
        content: (
          <div className="space-y-4">
            <p className="text-sm leading-7 text-white/70">
              Game Hub hujjatlari platformadagi o‘yin jarayoni, o‘qituvchi ish jarayoni, premium kirish va integratsiya
              qilingan Mario Math platformeri uchun markaziy qo‘llanmadir. Ushbu sahifa projektorda qulay o‘qish uchun
              premium dark hujjat dizaynida tayyorlangan.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ['O‘yinlar', '12+', 'Interaktiv sinf o‘yinlari'],
                ['Rejimlar', 'O‘qituvchi + O‘quvchi', 'Auth asosidagi kirish va premium qulflar'],
                ['Texnologiya', 'React + Tailwind', 'Tez UI iteratsiya va local-first holat'],
              ].map(([label, value, sub]) => (
                <DocCard key={label}>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">{label}</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{value}</p>
                  <p className="mt-1 text-xs leading-5 text-white/60">{sub}</p>
                </DocCard>
              ))}
            </div>
          </div>
        ),
      },
      {
        ...sectionsBase[1],
        content: (
          <div className="space-y-4 text-sm leading-7 text-white/70">
            <p>
              Foydalanuvchilar `Games` sahifasiga kiradi, mavjud o‘yinni tanlaydi va darhol boshlaydi. Qulflangan
              premium o‘yinlarda obuna modali chiqadi. O‘yin boshlanishidan oldin o‘quvchi autentifikatsiyasi talab
              qilinadi.
            </p>
            <ol className="space-y-2 pl-5 text-white/75">
              <li>`Games` sahifasini oching va o‘yin kartasini tanlang.</li>
              <li>Kirmagan bo‘lsangiz, `Student` sifatida ro‘yxatdan o‘ting yoki login qiling.</li>
              <li>O‘yin premium bo‘lsa, `Payment` sahifasi orqali obuna oling.</li>
              <li>O‘yinni boshlang, roundlarni yakunlang va natija/g‘olib modallarini ko‘ring.</li>
            </ol>
            <DocCard>
              <p className="text-xs uppercase tracking-[0.18em] text-white/45">Maslahat</p>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Sinfda ishlatish uchun login va premium kirishni darsdan oldin tayyorlab qo‘ying, shunda o‘quvchilar
                dars vaqtida kutib qolmaydi.
              </p>
            </DocCard>
          </div>
        ),
      },
      {
        ...sectionsBase[2],
        content: (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <DocCard>
                <p className="text-sm font-semibold text-white">Umumiy Navigatsiya</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>UI asosidagi o‘yinlar uchun sichqoncha / touch</li>
                  <li>Ruxsat berilgan overlaylarda yopish uchun `Esc`</li>
                  <li>Navbar orqali O‘qituvchi / O‘quvchi login roli tanlanadi</li>
                </ul>
              </DocCard>
              <DocCard>
                <p className="text-sm font-semibold text-white">Mario Math Platformer</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>`← →` / `A D` yurish</li>
                  <li>`↑ / W / Space` sakrash</li>
                  <li>`P / Esc` pauza</li>
                  <li>`Enter` quiz javobini yuboradi (overlayda ham ishlaydi)</li>
                </ul>
              </DocCard>
            </div>
            <CodeBlock
              title="Tezkor Boshqaruv Xarita"
              code={`Yurish: ArrowLeft / ArrowRight / A / D\nSakrash: ArrowUp / W / Space\nPauza: P / Esc\nQuiz yuborish: Enter / NumpadEnter / Submit bosish`}
            />
          </div>
        ),
      },
      {
        ...sectionsBase[3],
        content: (
          <div className="space-y-4 text-sm leading-7 text-white/70">
            <p>
              Quiz overlaylari bir nechta o‘yinlarda ishlatiladi. Mario platformerda quiz ochilganda fizika pauzaga
              olinadi va natijadan keyin o‘yin davom etadi. Timed quizlarda vaqt tugashi noto‘g‘ri javob hisoblanadi.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <DocCard>
                <p className="text-sm font-semibold text-white">Quiz Qoidalari</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>Mario Mathda har quiz uchun 15s timer</li>
                  <li>To‘g‘ri javob: davom etadi va ball qo‘shiladi</li>
                  <li>Noto‘g‘ri javob: life kamayadi va pozitsiya reset bo‘ladi</li>
                  <li>Gate quiz keyingi bosqichni ochadi</li>
                </ul>
              </DocCard>
              <DocCard>
                <p className="text-sm font-semibold text-white">Sinf Rejimlari</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>`5-7`: yengilroq son oralig‘i va amallar</li>
                  <li>`8-11`: kattaroq oralig‘ va murakkabroq savollar</li>
                  <li>Savol generatori local ishlaydi va har chaqirishda deterministik oqimga yaqin</li>
                </ul>
              </DocCard>
            </div>
            <CodeBlock
              title="Quiz Oqimi"
              code={`Player Quiz Block/Gate ga tegadi\n→ Fizika pause\n→ Overlay ochiladi\n→ Javob kiriting + Submit\n→ Tekshiruv\n→ To'g'ri: +ball / unlock\n→ Noto'g'ri: life kamayadi / reset`}
            />
          </div>
        ),
      },
      {
        ...sectionsBase[4],
        content: (
          <div className="space-y-4 text-sm leading-7 text-white/70">
            <p>
              Mario Math Platformer hozir 10 bosqichli progress bilan ishlaydi. 1-3 bosqichlar qo‘lda balanslangan.
              4-10 bosqichlar procedural, lekin sakrash masofasi va sinfda o‘ynash qulayligi uchun balans qilingan.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <DocCard>
                <p className="text-sm font-semibold text-white">Progress Eslatmalari</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>Har bosqichdan oldin level intro overlay chiqadi</li>
                  <li>7-10 bosqichlarda moving platform va spike chiqadi</li>
                  <li>10-bosqichda Boss Gate bor (bir nechta quiz kerak)</li>
                </ul>
              </DocCard>
              <DocCard>
                <p className="text-sm font-semibold text-white">Yutqazish va Qayta Urinish</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>Lives asosidagi loop</li>
                  <li>Qayta boshlash tugmali Game Over modali</li>
                  <li>Final bossdan keyin Victory modali</li>
                </ul>
              </DocCard>
            </div>
          </div>
        ),
      },
      {
        ...sectionsBase[5],
        content: (
          <div className="space-y-4 text-sm leading-7 text-white/70">
            <p>
              O‘qituvchilar Admin Panelga kirib qo‘llab-quvvatlanadigan o‘yinlar uchun savol qo‘shishi mumkin.
              Kontent demo/local ish jarayonlari uchun localStorage’da saqlanadi.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <DocCard>
                <p className="text-sm font-semibold text-white">O‘qituvchi Oqimi</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>Header modalidan O‘qituvchi sifatida login qiling</li>
                  <li>`Teacher Panel` ni oching</li>
                  <li>O‘yin tanlang va savol qo‘shing/tahrir qiling</li>
                  <li>Kontent, users va analytics uchun tablardan foydalaning</li>
                </ul>
              </DocCard>
              <DocCard>
                <p className="text-sm font-semibold text-white">Sinf uchun Eng Yaxshi Amaliyotlar</p>
                <ul className="mt-2 space-y-2 text-sm text-white/70">
                  <li>Projector mode va fullscreen o‘yinlardan foydalaning</li>
                  <li>Premium unlockni darsdan oldin tayyorlang</li>
                  <li>Jamoaviy o‘yinlardan faollik va tezkor roundlar uchun foydalaning</li>
                </ul>
              </DocCard>
            </div>
          </div>
        ),
      },
      {
        ...sectionsBase[6],
        content: (
          <div className="space-y-4 text-sm leading-7 text-white/70">
            <p>
              Loyiha React + Tailwind UI’da qurilgan bo‘lib, bir nechta local-state mini o‘yinlar va asosiy app route’ga
              integratsiya qilingan Phaser asosidagi Mario Math o‘yinini o‘z ichiga oladi.
            </p>
            <CodeBlock
              title="Route Misol"
              code={`<Route path="/docs" element={<DocsPage />} />\n<Route path="/games/mario-math-platformer" element={<MarioMathEmbedPage />} />`}
            />
            <CodeBlock
              title="Premium Ochish (Demo)"
              code={`localStorage.setItem('gamehub_premium_active', 'true')\nlocalStorage.setItem('gamehub_premium_expires_at', expiresAtISO)`}
            />
            <DocCard>
              <p className="text-sm font-semibold text-white">Dasturchi Eslatmalari</p>
              <ul className="mt-2 space-y-2 text-sm text-white/70">
                <li>Premium/auth oqimi hozir localStorage asosida (demo)</li>
                <li>Keyin backend integratsiya local auth/payment holatini almashtirishi mumkin</li>
                <li>Phaser scene fayllari lokal mantiq va overlay HTML UI’dan foydalanadi</li>
              </ul>
            </DocCard>
          </div>
        ),
      },
      {
        ...sectionsBase[7],
        content: (
          <div className="space-y-3">
            {[
              ['Backendsiz ishlatsa bo‘ladimi?', 'Ha. Hozirgi auth/payment va kontent funksiyalari demo rejimda localStorage ishlatadi.'],
              ['Keyin real to‘lov qo‘shsa bo‘ladimi?', 'Ha. Stripe / Payme / Click endpointlarini `my_api` backend orqali ulash mumkin.'],
              ['Premium lock direct URLlarni ham bloklaydimi?', 'Ha. Premium route’lar guard qilingan va modal holati bilan `/games` ga yo‘naltiriladi.'],
              ['O‘qituvchi custom savol qo‘sha oladimi?', 'Ha. Teacher panel har bir o‘yin bo‘yicha kontent va analyticsni local storage’da saqlaydi.'],
            ].map(([q, a]) => (
              <DocCard key={q}>
                <p className="text-sm font-semibold text-white">{q}</p>
                <p className="mt-2 text-sm leading-6 text-white/70">{a}</p>
              </DocCard>
            ))}
          </div>
        ),
      },
      {
        ...sectionsBase[8],
        content: (
          <div className="space-y-4 text-sm leading-7 text-white/70">
            <p>
              Rejalashtirilgan yaxshilanishlar o‘qituvchi ish jarayoni, sinf analytics va boyroq o‘yin mexanikalariga
              qaratilgan, lekin tezlik va projector qulayligini saqlab qoladi.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ['Qisqa muddat', ['Docs qidiruv', 'Teacher forma builder UI', 'Profil tarixi']],
                  ['O‘rta muddat', ['Real backend auth', 'Real payment webhooklar', 'Cloud savol banki']],
                  ['Game Design', ['Mario boss stage polish', 'Qo‘shimcha hazardlar', 'Ko‘proq level mavzulari']],
                  ['Operatsion', ['Xatolik kuzatuvi', 'Onboarding uchun A/B testlar', 'Release changelog sahifasi']],
                ] as [string, string[]][]
              ).map(([title, items]) => (
                <DocCard key={title}>
                  <p className="text-sm font-semibold text-white">{title}</p>
                  <ul className="mt-2 space-y-2 text-sm text-white/70">
                    {items.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <ChevronRight className="mt-0.5 h-4 w-4 text-violet-300" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </DocCard>
              ))}
            </div>
          </div>
        ),
      },
    ],
    [],
  )

  useEffect(() => {
    const observers: IntersectionObserver[] = []
    sections.forEach((section) => {
      const el = document.getElementById(section.id)
      if (!el) return
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setActiveSection(section.id)
              break
            }
          }
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0.1 },
      )
      observer.observe(el)
      observers.push(observer)
    })

    return () => observers.forEach((o) => o.disconnect())
  }, [sections])

  return (
    <main className="relative min-h-screen overflow-x-clip bg-[#05060a] text-white">
      <div className="noise-overlay fixed inset-0 z-0" />
      <div className="pointer-events-none fixed left-0 top-10 z-0 h-72 w-72 rounded-full bg-violet-500/15 blur-[120px]" />
      <div className="pointer-events-none fixed right-0 top-12 z-0 h-80 w-80 rounded-full bg-blue-500/15 blur-[130px]" />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70">
                <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                Premium Hujjatlar
              </p>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Game Hub Hujjatlari
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">
                O‘yin jarayoni, o‘qituvchi ish jarayoni va dasturchi sozlamalari uchun Vercel/Huly uslubidagi hujjat tajribasi.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/home"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white/80 hover:bg-white/10"
              >
                ← Bosh sahifa
              </Link>
              <Link
                to="/games"
                className="rounded-xl border border-violet-300/20 bg-violet-400/10 px-4 py-2.5 text-sm font-medium text-violet-100 hover:bg-violet-400/15"
              >
                O‘yinlarni ochish
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-xl">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/40">Hujjatlar</p>
              <nav className="mt-2 space-y-1" aria-label="Hujjat bo‘limlari">
                {sections.map((section) => {
                  const Icon = section.icon
                  const active = activeSection === section.id
                  return (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className={[
                        'group flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm transition',
                        active
                          ? 'border border-violet-300/20 bg-violet-400/10 text-white'
                          : 'border border-transparent text-white/65 hover:bg-white/5 hover:text-white',
                      ].join(' ')}
                    >
                      <Icon className={active ? 'h-4 w-4 text-violet-200' : 'h-4 w-4 text-white/45 group-hover:text-white/70'} />
                      <span>{section.title}</span>
                    </a>
                  )
                })}
              </nav>

              <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
                <p className="text-xs uppercase tracking-[0.16em] text-white/45">Tezkor Kirish</p>
                <div className="mt-2 space-y-2 text-sm">
                  <a href="#teacher-guide" className="flex items-center gap-2 text-white/70 hover:text-white">
                    <Settings2 className="h-4 w-4" />
                    O‘qituvchi sozlamasi
                  </a>
                  <a href="#developer-guide" className="flex items-center gap-2 text-white/70 hover:text-white">
                    <Code2 className="h-4 w-4" />
                    Dasturchi eslatmalari
                  </a>
                </div>
              </div>
            </div>
          </aside>

          <section className="min-w-0 space-y-4">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <article
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-6"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                      <Icon className="h-4.5 w-4.5 text-violet-200" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.18em] text-white/40">Bo‘lim</p>
                      <h2 className="text-xl font-semibold tracking-tight text-white">{section.title}</h2>
                    </div>
                  </div>
                  {section.content}
                </article>
              )
            })}
          </section>
        </div>
      </div>
    </main>
  )
}
