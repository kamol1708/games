import type { GameSettings } from '../logic/storage'

type Props = {
  open: boolean
  settings: GameSettings
  onClose: () => void
  onChange: (settings: GameSettings) => void
}

export default function SettingsModal({ open, settings, onClose, onChange }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#070b12]/95 p-5 shadow-2xl backdrop-blur-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">Settings</p>
            <h2 className="text-xl font-bold text-white">Game Settings</h2>
          </div>
          <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/90" onClick={onClose}>Close</button>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">Exact roll to finish</p>
                <p className="text-sm text-white/60">ON bo‘lsa 100 ga aynan tushish kerak.</p>
              </div>
              <button
                onClick={() => onChange({ ...settings, exactRollToFinish: !settings.exactRollToFinish })}
                className={`h-8 w-16 rounded-full border transition ${settings.exactRollToFinish ? 'border-emerald-300/30 bg-emerald-500/30' : 'border-white/10 bg-white/5'}`}
              >
                <span className={`block h-6 w-6 rounded-full bg-white transition ${settings.exactRollToFinish ? 'translate-x-8' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="font-semibold text-white">Movement speed</p>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs text-white/75">{settings.movementSpeed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={0.4}
              max={2}
              step={0.1}
              value={settings.movementSpeed}
              onChange={(e) => onChange({ ...settings, movementSpeed: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-white">Sound</p>
                <p className="text-sm text-white/60">Placeholder toggle (future SFX integration)</p>
              </div>
              <button
                onClick={() => onChange({ ...settings, soundEnabled: !settings.soundEnabled })}
                className={`rounded-xl border px-3 py-1.5 text-sm ${settings.soundEnabled ? 'border-cyan-300/30 bg-cyan-500/15 text-cyan-200' : 'border-white/10 bg-white/5 text-white/70'}`}
              >
                {settings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
