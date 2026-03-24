import { subjectLabel } from '../logic/gameEngine'
import type { BoardTile, Subject } from '../logic/types'

type Props = {
  subjects: Subject[]
  tiles: BoardTile[]
  onSelect: (tileId: string) => void
}

const pointRows: Array<{ points: 150 | 250 | 400; label: string }> = [
  { points: 150, label: '150' },
  { points: 250, label: '250' },
  { points: 400, label: '400' },
]

export default function CategoryGrid({ subjects, tiles, onSelect }: Props) {
  const getTile = (subject: Subject, points: 150 | 250 | 400) =>
    tiles.find((tile) => tile.subject === subject && tile.points === points)

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-4">
      <h3 className="text-lg font-semibold">Quiz Board</h3>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-2 text-center">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left text-xs uppercase tracking-[0.14em] text-white/50">Points</th>
              {subjects.map((subject) => (
                <th key={subject} className="rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-sm">
                  {subjectLabel(subject)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pointRows.map((row) => (
              <tr key={row.points}>
                <td className="px-2 py-2 text-left text-sm font-semibold text-white/70">{row.label}</td>
                {subjects.map((subject) => {
                  const tile = getTile(subject, row.points)
                  if (!tile) {
                    return <td key={`${subject}-${row.points}`} className="rounded-xl border border-white/10 bg-black/20 px-4 py-4">-</td>
                  }
                  return (
                    <td key={tile.id}>
                      <button
                        type="button"
                        disabled={tile.used}
                        onClick={() => onSelect(tile.id)}
                        className={`w-full rounded-xl border px-4 py-4 text-lg font-semibold transition ${
                          tile.used
                            ? 'cursor-not-allowed border-white/10 bg-black/30 text-white/30'
                            : tile.isDouble
                              ? 'border-amber-300/40 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30'
                              : 'border-cyan-300/35 bg-cyan-500/15 text-cyan-100 hover:bg-cyan-500/25'
                        }`}
                      >
                        {tile.points}
                      </button>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
