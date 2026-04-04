import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

function CommentIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="h-4 w-4 text-sky-100/90 sm:h-[18px] sm:w-[18px]">
      <path
        d="M4.167 5.833A2.5 2.5 0 0 1 6.667 3.333h6.666a2.5 2.5 0 0 1 2.5 2.5v4.584a2.5 2.5 0 0 1-2.5 2.5H9.54l-3.359 2.518a.625.625 0 0 1-1-.5v-2.018a2.501 2.501 0 0 1-1.014-2V5.833Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function GameFeedbackDock() {
  const location = useLocation()
  const navigate = useNavigate()
  const meta = getFeedbackMetaByPath(location.pathname)
  const isFrogPond = location.pathname === '/games/frog-pond'
  const session = getAuthSession()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notice, setNotice] = useState('')
  const threads = useGameFeedback(meta?.key)

  const approvedItems = useMemo(
    () => threads,
    [threads],
  )

  if (!meta) {
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
      setNotice('Comment yuborildi. Filterdan o‘tgan izohlar darhol shu yerda ko‘rinadi.')
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
        className="fixed bottom-[calc(10px+var(--safe-bottom))] right-[calc(10px+var(--safe-right))] z-40 inline-flex items-center gap-2 rounded-full border border-sky-300/12 bg-[#08111d]/72 px-3 py-2 text-[11px] font-semibold tracking-[0.01em] text-white/88 shadow-[0_10px_28px_rgba(2,8,23,0.28)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-sky-300/28 hover:bg-[#0b1220]/88 sm:bottom-[calc(16px+var(--safe-bottom))] sm:right-[calc(16px+var(--safe-right))] sm:px-3.5 sm:py-2.5 sm:text-xs"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-sky-400/18 to-indigo-400/16 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] sm:h-7 sm:w-7">
          <CommentIcon />
        </span>
        <span>Izoh yozish</span>
      </button>

      {open ? (
        <aside
          className={`fixed bottom-[calc(58px+var(--safe-bottom))] right-[calc(10px+var(--safe-right))] z-40 w-[min(392px,calc(100vw-20px))] overflow-hidden rounded-[28px] border border-white/10 bg-[#07111d]/94 text-white shadow-[0_24px_80px_rgba(2,8,23,0.58)] backdrop-blur-xl sm:bottom-[calc(76px+var(--safe-bottom))] sm:right-[calc(16px+var(--safe-right))] sm:w-[min(412px,calc(100vw-32px))] ${
            isFrogPond ? 'max-h-[72vh]' : 'max-h-[82vh]'
          }`}
        >
          <div className="border-b border-white/10 bg-gradient-to-r from-sky-400/10 to-indigo-500/10 px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-100/55">Game Feedback</p>
                <h3 className="mt-1 text-lg font-semibold">{meta.title}</h3>
                <p className="mt-1 text-xs leading-5 text-white/65">
                  Yuborilgan izoh teacher panelga tushadi va tasdiqlangandan keyin shu yerda chiqadi.
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
              {session ? (
                <>
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
                  <span className="text-xs text-white/50">Yomon so‘zlar filterdan o‘tmaydi. Toza izohlar hammaga ko‘rinadi.</span>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => void handleSubmit()}
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.35)] disabled:opacity-60"
                    >
                      {submitting ? 'Yuborilmoqda...' : 'Yuborish'}
                    </button>
                  </div>
                  {notice ? <p className="mt-3 text-xs text-sky-100/80">{notice}</p> : null}
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-white">Izoh yuborish uchun kirish kerak</p>
                  <p className="mt-2 text-sm leading-6 text-white/65">
                    Fikringiz teacher panelga tushishi uchun avval login qiling. Shundan keyin shu oynadan izoh yubora olasiz.
                  </p>
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => navigate('/login', { state: { from: { pathname: location.pathname } } })}
                      className="rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(59,130,246,0.35)]"
                    >
                      Login qilish
                    </button>
                  </div>
                </>
              )}
            </div>

            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">Commentlar</p>
                <span className="text-xs text-white/40">{approvedItems.length} ta</span>
              </div>
              <div className={`space-y-3 overflow-y-auto pr-1 ${isFrogPond ? 'max-h-56' : 'max-h-72'}`}>
                {approvedItems.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/50">
                    Hozircha comment yo‘q.
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
                          Ko‘rindi: {formatStamp(item.approvedAt ?? item.createdAt)}
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
