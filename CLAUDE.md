# SARA Project Instructions

## Project

SARA is a child-focused media and learning application.

Main technologies:
- React
- TypeScript
- Vite / TanStack
- Node/Nitro
- Capacitor Android
- Existing backend API

Project root:
`/mnt/webapps/sasa-claude-review`

Production application/API domain:
`https://sara.khader-ai.online`

Local Dell review:
`http://192.168.0.113:5173`

For local Vite development:
`VITE_API_BASE_URL=/api`

The Vite development proxy forwards `/api` to the production backend.

---

# CRITICAL WORKING RULES

## 1. Inspect Before Editing

Before changing a feature:

1. Find its existing implementation.
2. Trace its state/data flow.
3. Identify the root cause.
4. Make the smallest safe change.
5. Run formatting/build/tests.
6. Report what was actually verified.

Do not invent backend behavior.

Do not claim runtime PASS based only on compilation.

Use:
`NEEDS MANUAL TEST`
when real-device/browser verification is required.

---

## 2. Never Commit or Push Automatically

Do NOT run:

- git commit
- git push
- git merge
- git rebase
- git reset --hard
- destructive checkout/restore

unless the user explicitly instructs you to do so.

Always leave changes uncommitted for review.

---

## 3. Protected Files

Treat these as protected:

- `.env`
- `.env.local`
- `.env.example`
- `vite.config.ts`
- `src/lib/api.ts`
- `.github/`
- `Dockerfile`
- `k8s/`
- deployment files

Do not modify them unless a verified functional bug requires it.

If a protected file appears to require modification:
1. explain why,
2. inspect the existing contract,
3. make the minimum possible change.

Never alter authentication or API contracts casually.

---

# SECURITY

Never:

- print secret values
- expose API keys
- expose tokens
- expose passwords
- expose PIN values
- expose database credentials
- commit secrets
- place secrets in CLAUDE.md
- copy secrets from another project

Environment variable names may be inspected when required.

Never disable TLS verification.

Never enable insecure HTTP networking unless explicitly required and explained.

---

# AUTHENTICATION

Parent login currently works.

Do not break:

- parent authentication
- child/profile authentication
- bearer tokens
- profile selection
- session handling

Do not redesign authentication while working on unrelated features.

---

# CHILD PROFILES AND PIN

PIN behavior is security-sensitive.

Before changing PIN logic, trace:

UI
-> component state
-> API function
-> backend contract
-> response
-> refreshed child/profile state

Never assume `child_login_id` means that a PIN exists unless the backend contract explicitly defines that behavior.

PIN reset/change must ultimately support:

- validation
- confirmation field
- persistence
- old PIN rejected
- new PIN accepted
- clear success/error state

If the backend does not provide the required PIN operation, report:

`BACKEND REQUIRED`

Do not fake PIN persistence in localStorage.

---

# KIDS ACTIVITY

Kids Activity must show real data only.

Never create fake:

- watch history
- activity events
- view counts
- engagement
- timestamps
- reactions

Trace the existing backend/API functionality first.

If no backend activity/history endpoint exists, report:

`BACKEND REQUIRED`

Expected UI states:

- loading
- actual activity
- empty
- error
- retry

---

# ASSIGNED MEDIA

Assigned media is critical.

Existing flow should remain conceptually:

backend
-> `getChildAssignedMedia`
-> media mapping
-> `assignedVideos`
-> Kids home
-> categories
-> player playlist

Verify these fields carefully when debugging:

- id
- media type
- sourceType
- sourceUrl
- public URL
- storage path
- YouTube video ID
- thumbnail/image
- title
- category

Do not replace real assigned media with mock data.

---

# MEDIA TYPES

SARA may contain:

## Photo
- object-fit contain
- never crop
- slideshow timer
- pause/resume
- previous/next

## Uploaded Video
- playback
- seeking
- volume
- mute
- fullscreen

## YouTube
- supported assigned YouTube items
- correct video ID parsing
- playback
- playlist navigation

## Built-In Media
Existing learning/media content must remain functional.

---

# DYNAMIC CATEGORIES

Dynamic categories must be derived from actual assigned media.

Requirements:

- unique categories
- case-insensitive duplicate prevention
- Photos category when photos exist
- correct category filtering
- All category
- no stale media flash when switching
- mobile responsive

Do not hard-code parent-created category names.

---

# PLAYER DESIGN

The watching page should be:

Professional video-platform usability
+
kid-friendly visual identity

Do not copy YouTube logos or branding.

Current direction:

- large central player
- Up Next BELOW the player
- no right-side recommendation sidebar
- one playback control bar
- no duplicate photo autoplay/progress bar
- responsive design
- object-fit contain for photos
- clean metadata
- compact reactions

Preserve:

- previous
- next
- continuous playlist traversal
- autoplay
- autoplay preference
- photo timer
- pause/resume
- seeking
- volume
- mute
- fullscreen
- screen lock
- keyboard shortcuts
- mobile swipe
- queue clicking
- reactions

---

# UP NEXT

Up Next belongs BELOW the player.

Desktop:
- horizontal card row
- 4-5 cards when space permits
- horizontal scroll when needed

Mobile:
- horizontal swipe/scroll
- approximately 1.5-2.5 cards visible

Each item should use real media data.

Current media should have a subtle Now Playing indicator.

Do not move Up Next to the right side unless explicitly requested.

---

# REACTIONS

Current intended reaction choices:

- 💖 Love it
- 🤩 Amazing
- 😂 Funny
- 🌟 Favorite

Keep reactions compact.

Do not create fake counts.

Preserve watch-party floating reactions separately.

---

# KIDS THEMES

Theme system may include:

- Space
- Ocean
- Jungle
- Rainbow
- Night
- Happy Day/Bright

Themes may modify:

- page background
- accents
- subtle decorative elements
- queue selection
- reaction accents

Themes must NOT modify actual media colors.

Prefer:

- local SVG assets
- CSS gradients
- CSS transforms
- lightweight animation

Create ORIGINAL cartoon artwork.

Never copy copyrighted characters or brands.

Cartoon artwork belongs around the media/player, not over the media.

Respect:
`prefers-reduced-motion`

---

# MOBILE / ANDROID

An Android Capacitor project already exists:

- `android/`
- `capacitor.config.ts`

DO NOT recreate the Android project unless inspection proves it is unusable.

Reuse the existing project.

Before Android work inspect:

- package.json
- capacitor.config.ts
- Android project
- web build output
- Android SDK
- Java
- Gradle

A packaged Android app cannot rely on the local Vite `/api` proxy.

Production mobile API configuration must use the secure production API appropriately.

Do not globally overwrite the Dell local-development `.env.local` merely to build Android.

Build debug APK first.

Do not configure Play Store release signing until explicitly requested.

---

# IOS

Do not begin iOS work until Android has been tested unless explicitly requested.

iOS project preparation may be done separately.

Final iOS compilation/signing requires the Apple/Xcode environment.

---

# RESPONSIVE UI

Always verify:

Desktop
Tablet
Mobile portrait
Mobile landscape

Avoid:

- horizontal overflow
- status-bar overlap
- bottom-nav overlap
- inaccessible controls
- tiny touch targets

---

# REFERENCE PROJECTS

Reference repositories are under:

`/mnt/webapps/sara-reference-projects`

Potential references include:

- Vidstack
- Vidstack examples
- Swiper
- Magic UI
- shadcn/ui
- ReactPlayer

These are references, not automatic dependencies.

Before adopting any library:

1. inspect it
2. determine what problem it solves
3. compare with existing SARA functionality
4. evaluate migration risk
5. prefer incremental adoption

Do not replace the whole media architecture merely because a library exists.

---

# DESIGN CHANGES

Do not respond to "improve the design" by only:

- changing colors
- adding random gradients
- increasing shadows
- adding excessive glow
- rewriting thousands of lines of CSS without purpose

Visual changes should have an explicit design goal.

Keep the player professional and allow kid-friendly themes around it.

---

# CSS

Avoid accumulating duplicate override blocks.

Before adding another large CSS section:

1. inspect existing selectors
2. reuse current structure
3. remove obsolete rules only when confirmed unused

Do not blindly append another 1000-line override block.

---

# BUILD PROCEDURE

After meaningful code changes:

1. Run Prettier on changed source files.
2. Run:

`npm run build`

3. Fix compilation/build errors.
4. Show:

`git diff --stat`

5. Show:

`git status --short`

6. Report exact modified files.

---

# FUNCTIONAL REPORTING

Use these result labels:

- `PASS` — actually established by available verification
- `FAIL` — verification failed
- `NEEDS MANUAL TEST` — browser/device interaction required
- `BACKEND REQUIRED` — frontend cannot correctly implement without backend capability

Never claim successful:

- login
- PIN change
- real activity logging
- Android device behavior
- fullscreen
- video playback
- YouTube playback

based solely on `npm run build`.

---

# PRIORITY ORDER

When multiple problems exist, prioritize:

1. Authentication stability
2. Assigned media
3. Dynamic categories
4. Kids PIN
5. Kids Activity
6. Player functionality
7. Mobile functionality
8. UI improvements
9. Animation/polish

Functional correctness is more important than another redesign.
