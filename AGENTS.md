
## Project Progress Handoff

### Current Goal
- Build the Drop The Vape mobile app UI and connect progress-related screens to real quit-profile progress data.
- Reference screenshots are structure references unless explicitly stated as image assets.
- Keep Expo Router route files in `frontend/src/app`; put screen implementation files in matching folders under `frontend/src/components`.

### Routing And Screen Structure
- Root layout is `frontend/src/app/_layout.tsx`.
- Current routes include:
  - `/onboarding`
  - `/welcome`
  - `/auth`
  - `/setup`
  - `/home`
  - `/progress`
  - `/achievements`
  - `/profile`
  - `/premium`
  - `/settings`
- `/home` is the main dashboard/home screen.
- `/progress` is the detailed progress screen.
- `frontend/src/app/index.tsx` handles startup routing and should wait until Expo Router is mounted before calling `router.replace`.

### Folder Organization
- Home/dashboard code belongs in `frontend/src/components/home`.
- Progress screen code belongs in `frontend/src/components/progress`.
- Achievements screen code belongs in `frontend/src/components/achievements`.
- Profile screen code belongs in `frontend/src/components/profile`.
- Route files in `frontend/src/app` should stay thin wrappers around the component folders.

### Onboarding And Welcome Work
- Onboarding was rebuilt to follow the provided three-page reference structure.
- Welcome/setup flow was rebuilt to use structured UI instead of pasting full screenshot images.
- Welcome first step uses the structure from `temp/1.png` and the real image asset from `frontend/assets/drop-the-vape/welcome/1-image.png`.
- Setup steps implemented from references:
  - Step 1: build quit plan intro.
  - Step 2: quit reason cards such as health, money, family, control, breathe easier, other.
  - Step 3: vape frequency cards.
  - Step 4: vaping history list.
  - Vape-lasts screen after step 4.
  - Final quit-goal step.
- Missing asset import errors were fixed by pointing code at the actual asset folder paths.

### Auth Work
- Signup/login screens were started from the provided signup reference.
- Signup landing should show social/email choices using structured UI.
- When the user taps email, the name/email/password form should appear.
- Signup should use `frontend/assets/drop-the-vape/sign-up.png` as the real illustration asset.

### Dashboard/Home Work
- Dashboard/home page was rebuilt as structured UI from `frontend/assets/drop-the-vape/dashboard.png`.
- The dashboard lives at `/home`.
- It includes:
  - Drop Vape header.
  - Greeting.
  - Streak card.
  - Money saved and time vape-free cards.
  - "Your Health is Improving" timeline.
  - Achievements row.
  - Daily Motivation, Craving Support, and Your Journal cards.
  - Bottom navigation with Home active.
- Achievement icons use `frontend/assets/drop-the-vape/dashboard/1.png` through `4.png`.
- Lower dashboard cards use available dashboard image assets such as `11 (1).png`, `11 (2).png`, and `11 (3).png`.

### Dynamic Progress Model
- Progress should not be static.
- Backend progress logic is in `backend/src/progress.js`.
- Dynamic values are derived from the user's quit profile:
  - `daysVapeFree`
  - `currentStreak`
  - `moneySaved`
  - `vapesAvoided`
  - `nextMilestone`
  - `milestones`
- Health improvement should be based on vape-free time.
- Achievements unlock when the user crosses configured thresholds.
- Dashboard, progress, achievements, and timeline should all reflect the same progress data.

### Progress Screen Work
- Detailed progress page was implemented at `frontend/src/components/progress/progress-dashboard.tsx`.
- Route wrapper is `frontend/src/app/progress.tsx`.
- Header image uses `frontend/assets/drop-the-vape/progress/call_6NETPqOTnynP7gH8bLlRzNpl.png`.
- The progress screen calculates:
  - current streak
  - next milestone percentage
  - health recovery percentage
  - money saved
  - puffs/vapes avoided
  - time reclaimed
  - health timeline active and next states
  - progress graph values from available aggregate progress data
- Current limitation: graph history is inferred from aggregate progress because there is not yet a real daily check-in or craving-history table.

### Achievements Work
- Achievements screen was started at `frontend/src/components/achievements/achievements-screen.tsx`.
- Route wrapper is `frontend/src/app/achievements.tsx`.
- Structure follows `temp/ach.png`:
  - Header with title and trophy art.
  - Current milestone dark card.
  - Next achievement progress card.
  - Category filter row.
  - All badges grid.
- Existing badge images are reused where available.
- Day badges such as 30, 100, and 365 are generated in UI with numbers instead of requiring image assets.
- Backend milestone keys were expanded to support dynamic badge unlocks:
  - first day
  - first week
  - two weeks
  - 30 days
  - 100 days
  - one year
  - consistency
  - healthy heart
  - better lungs
  - saved $50
  - saved $100
  - clean choices
  - vape-free hero
- Needed later if exact badge art is desired:
  - Healthy Heart image
  - Better Lungs image
  - Saved $50 image
  - Saved $100 image
  - Vape-Free Hero image

### Phase 08 Breath Hold Work
- Breath hold exercise implementation started from `phases/phase08/spec.md`.
- Added backend persistence for breath hold attempts in `backend/src/db.js` with `breath_hold_attempts`.
- Added backend breath hold logic in `backend/src/breathHold.js` for:
  - start attempt
  - complete attempt
  - leave attempt
  - summary
  - history
  - trend
  - backend-derived completion streak
- Added authenticated backend routes:
  - `GET /breath-hold/summary`
  - `POST /breath-hold/start`
  - `POST /breath-hold/:attemptId/complete`
  - `POST /breath-hold/:attemptId/leave`
  - `GET /breath-hold/history`
  - `GET /breath-hold/trend`
- `/progress/me` now uses breath hold completion streak for `currentStreak`.
- `daysVapeFree` remains the quit-duration metric for quit time, money saved, vapes avoided, health recovery, and day-based milestones.
- Added frontend API client at `frontend/src/lib/breath-hold-api.ts`.
- Added route wrapper at `frontend/src/app/breath-hold.tsx`.
- Added screen implementation at `frontend/src/components/breath-hold/breath-hold-screen.tsx`.
- Home Craving Support now opens `/breath-hold`.
- Progress screen now has a Breath Hold Exercise entry card.
- Streak labels in home/progress were updated to reflect breath hold streak meaning.
- Backend syntax checks passed for:
  - `backend/src/breathHold.js`
  - `backend/src/progress.js`
  - `backend/src/server.js`
- Frontend typecheck still reports only the known unrelated starter-template errors in explore/app-tabs/external-link/collapsible after Phase 8 route typing was fixed.
### Libraries And Assets
- Use `lucide-react-native` for new icons going forward when an icon is better than an image.
- Do not install dependencies automatically. If missing, ask the user to run:
  - `pnpm add lucide-react-native`
- Use real provided PNG assets only when the user explicitly says to use the image.
- Do not paste full screenshot references as the UI image. Recreate the structure in React Native components.

### Known Runtime Notes
- For phone testing on the same Wi-Fi, use the Wi-Fi IPv4 address, not the WSL adapter.
- Last known correct frontend command:
  - `cd C:\Users\beeso\OneDrive\Desktop\drop-the-vape\frontend`
  - `set REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.4`
  - `set EXPO_PUBLIC_API_URL=http://192.168.1.4:5000`
  - `pnpm exec expo start --lan -c`
- `172.27.0.1` is the WSL virtual adapter and can cause Expo Go to fail connecting from the phone.
- Restart backend after changing `backend/src/progress.js`.

### Known Typecheck State
- `node --check backend\src\progress.js` passed after progress milestone updates.
- Frontend `npx tsc --noEmit --pretty false` still reports unrelated starter-template type errors in:
  - `frontend/src/app/explore.tsx`
  - `frontend/src/components/app-tabs.tsx`
  - `frontend/src/components/app-tabs.web.tsx`
  - `frontend/src/components/external-link.tsx`
  - `frontend/src/components/ui/collapsible.tsx`
- Do not treat those as caused by the dashboard/progress/achievements work unless new evidence shows otherwise.

### Git And Repo State
- Project root currently contains `backend`, `frontend`, `phases`, and `temp`.
- Project root is the active Git repo for commits and pushes.
- Push completed work to `origin` on `main`: `https://github.com/Riya922003/Drop-the-Vape-app.git`.
- Do not push to `cumbersomeamir` unless the user explicitly asks for that remote.
- Do not commit `.env` files, accidental root package install files, or unrelated deletions.
- Do not silently delete or move `frontend/.git` if it exists; ask first because nested Git state must be handled explicitly.
