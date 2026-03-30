import { useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { getAuthSession } from '../lib/localAuth'
import { getFeedbackMetaByPath, submitGameFeedback } from '../lib/gameFeedback'
import { useGameFeedback } from '../lib/useGameFeedback'

function formatStamp(value: number) {
  return new Date(value).toLocaleString('uz-UZ', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function GameFeedbackDock() {
  const location = useLocation()
  const meta = getFeedbackMetaByPath(location.pathname)
  const isFrogPond = location.pathname === '/games/frog-pond'
  const session = getAuthSession()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const threads = useGameFeedback(meta?.key)

  const approvedItems = useMemo(
    () => threads.filter((item) => item.status === 'approved'),
    [threads],
  )
  const myPendingItems = useMemo(
    () => threads.filter((item) => item.userId === session?.userId && item.status === 'pending'),
    [threads, session?.userId],
  )

  if (!meta || !session) {
    return null
  }

  const handleSubmit = async () => {
    const cleanMessage = message.trim()
    if (!cleanMessage) {
      setNotice('Fikr yozing.')
      return
    }

    setSubmitting(true)
    try {
      await submitGameFeedback({
        gameKey: meta.key,
        gameTitle: meta.title,
        message: cleanMessage,
      })
      setMessage('')
      setNotice('Comment adminga yuborildi. Tasdiqlangandan keyin shu o‘yin ichida chiqadi.')
      setOpen(true)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Xabar yuborilmadi.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full border border-sky-300/20 bg-[#0b1220]/92 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_50px_rgba(2,8,23,0.42)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-sky-300/35"
      >
        <span aria-hidden="true">💬</span>
        <span>Izoh qoldirish</span>
      </button>

      {open ? (
        <aside
          className={`fixed bottom-20 right-4 z-40 w-[min(420px,calc(100vw-24px))] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111d]/95 text-white shadow-[0_24px_80px_rgba(2,8,23,0.58)] backdrop-blur-xl ${
            isFrogPond ? 'max-h-[72vh]' : 'max-h-[82vh]'
          }`}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-sky-400/12 to-indigo-500/12 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/55">Game Feedback</p>
                <h3 className="mt-1 text-lg font-semibold">{meta.title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Admin tasdiqlagandan keyin commentingiz umumiy ro‘yxatda ko‘rinadi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10"
              >
                Yopish
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/72">
                {approvedItems.length} ta tasdiqlangan fikr
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-white/72">
                {meta.soloReady ? '1 kishilikka mos' : 'Asosan jamoaviy'}
              </span>
            </div>
          </div>

          <div className={`space-y-3 overflow-y-auto px-4 py-4 ${isFrogPond ? 'max-h-[calc(72vh-110px)]' : 'max-h-[calc(82vh-110px)]'}`}>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-3">
              <label className="block text-sm font-medium text-white">O‘yin haqida fikringiz</label>
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value)
                  if (notice) setNotice('')
                }}
                placeholder="Masalan: bu o‘yinda vaqt oz bo‘ldi, savollar yaxshi ekan..."
                className={`mt-3 w-full rounded-2xl border border-white/10 bg-[#08101d] px-3 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-sky-300/35 ${
                  isFrogPond ? 'min-h-24' : 'min-h-28'
                }`}
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <span className="text-xs text-white/50">Comment admin panelga moderatsiya uchun yuboriladi.</span>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => void handleSubmit()}
                  className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.35)] disabled:opacity-60"
                >
                  {submitting ? 'Yuborilmoqda...' : 'Submit'}
                </button>
              </div>
              {notice ? <p className="mt-3 text-xs text-sky-100/80">{notice}</p> : null}
            </div>

            {myPendingItems.length > 0 ? (
              <div className="rounded-2xl border border-amber-300/15 bg-amber-300/10 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-100/80">Kutilmoqda</p>
                <div className="mt-3 space-y-2">
                  {myPendingItems.slice(0, 2).map((item) => (
                    <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2.5">
                      <p className="text-sm text-white/90">{item.message}</p>
                      <p className="mt-1 text-[11px] text-white/45">{formatStamp(item.createdAt)} · admin tasdig‘i kutilmoqda</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Tasdiqlangan commentlar</p>
                <span className="text-xs text-white/40">{approvedItems.length} ta</span>
              </div>
              <div className={`space-y-3 overflow-y-auto pr-1 ${isFrogPond ? 'max-h-56' : 'max-h-72'}`}>
                {approvedItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">
                    Hozircha javob berilgan fikrlar yo‘q.
                  </div>
                ) : (
                  approvedItems.map((item) => (
                    <article key={item.id} className="rounded-3xl border border-white/10 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{item.userName}</p>
                        <span className="text-[11px] text-white/40">{formatStamp(item.createdAt)}</span>
                      </div>
                      <div className="mt-3 rounded-2xl rounded-tl-md bg-white/8 px-3 py-2.5 text-sm text-white/85">
                        {item.message}
                      </div>
                      <div className="mt-2 ml-6 rounded-2xl rounded-tr-md bg-sky-400/12 px-3 py-2.5 text-sm text-sky-50">
                        <p className="text-[11px] text-sky-100/70">
                          Tasdiqlagan: {item.approvedByName || 'Admin'} · {formatStamp(item.approvedAt ?? item.createdAt)}
                        </p>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </>
  )
}
