This folder stores archived standalone mini-apps that are no longer part of the main Vite app root.

Why they were moved:
- The active application now lives in the root `src/` tree.
- Keeping multiple old Vite apps at the repo root made the structure noisy and harder to maintain.
- These folders are preserved for reference and gradual migration, not for day-to-day development.

Current convention:
- `src/pages/` contains route entry pages.
- `src/features/` contains feature/domain-specific code.
- `src/components/ui/` contains shared reusable UI.
