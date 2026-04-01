export type GameSettings = {
  exactRollToFinish: boolean
  movementSpeed: number
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS: GameSettings = {
  exactRollToFinish: false,
  movementSpeed: 1,
  soundEnabled: true,
}

const SETTINGS_KEY = 'jungle_dice_board_settings_v1'

export function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<GameSettings>
    return {
      exactRollToFinish: parsed.exactRollToFinish ?? DEFAULT_SETTINGS.exactRollToFinish,
      movementSpeed: typeof parsed.movementSpeed === 'number' ? Math.min(2, Math.max(0.4, parsed.movementSpeed)) : DEFAULT_SETTINGS.movementSpeed,
      soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch {
    // ignore
  }
}
