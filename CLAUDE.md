# ClassCade

## What this is

ClassCade (formerly "Lesson Games Generator") is an ESL classroom game website built by a
language teacher for their own classroom and shared with colleagues. A teacher picks a level
(A1-C1), a focus (grammar / vocabulary / themes), and one or more topics, then plays one of 15
competitive team-based games built entirely around that content. A companion "🎓 Learn" section
gives concise study lessons that mirror exactly what the games test.

The user (repo owner) is a teacher, not a professional developer — explain tradeoffs plainly,
default to reusing existing patterns over introducing new ones, and don't assume prior software
engineering background.

## Repo layout

This repo root (`C:\Users\chris\OneDrive\Desktop\game`) is a thin wrapper — the actual app lives
one level down:

```
app-juegos/               ← the real project root (npm install / npm run dev / npm run build here)
  src/
    App.tsx               ← top-level: auth gate, theme/subscription state, PlanIntroScreen gate
    LessonGamesGenerator.tsx  ← the main orchestrator: screen state machine (welcome → setup →
                               game-select → game → results, plus classes/profile/learn/billing),
                               team setup, save/resume-to-class wiring
    data/
      topics.ts            ← every topic's question bank (TOPIC_OPTIONS metadata + per-topic
                               questions/spyRounds/minefieldGrid/hotSeatWords/etc.), ~25k lines
      lessons.ts            ← "Learn" screen content (LESSONS record), keyed by the same topic id
                               used in topics.ts — see "Learn/game parity" below
      constants.ts          ← TEAM_COLORS, MASCOT_OPTIONS, LEVELS_META, GAME_MODES, FREE_PLAN_LIMITS
      themes.ts             ← accent-color theme presets for shared (non-game) chrome
      tutorials/             ← one file per game, scripted "How to Play" walkthrough steps — see
                               "How to Play" tutorials below
    components/
      games/                ← one file per game (15 total): AuctionGame, BattleshipGame,
                               CardShuffleGame, CastleGame, HotPotatoGame, HotSeatGame,
                               KingOfHillGame, MinefieldGame, OrderUpGame, RaceTrackGame,
                               RocketFuelGame, SpyAmongUsGame, VaultHeistGame, WordWhackGame,
                               ZombieSiegeGame
      shared/               ← non-game screens: AuthScreen, ClassesScreen, ProfileScreen,
                               LearnScreen, BillingScreen, PlanIntroScreen, ScoreBoard,
                               QuestionCard, ThemeAmbience, Timer/TurnTimerBar, Confetti,
                               HowToPlayModal
    lib/                    ← Supabase data-access layer: supabaseClient, classes, profile,
                               subscription (one file per table/concern, thin CRUD wrappers)
    types/index.ts          ← shared TypeScript interfaces (Team, GameProps, Profile,
                               Subscription, SavedClass, QuestionData, etc.)
```

## Stack & environment

- Vite + React 19 + TypeScript, no server code of its own beyond Supabase Edge Functions.
- **Supabase** (project ref `jyzceovbrnagyiwzakov`) is the entire backend: Postgres (auth, classes,
  profiles, subscriptions, promo_codes), Auth (email/password + Google OAuth), and 4 Edge
  Functions for Stripe (`create-checkout-session`, `create-portal-session`, `stripe-webhook`,
  `redeem-promo-code`). Reachable via the Supabase MCP tools when connected.
- **Deploys automatically on push to `main`** to two places: Vercel (linked via GitHub
  integration, `.vercel/repo.json`) and GitHub Pages (`.github/workflows/deploy-pages.yml`).
  Pushing a feature branch should also get its own Vercel preview URL.
- `npm run build` = `tsc -b && vite build` — a broken build fails typecheck first. Run
  `npx tsc -b` from inside `app-juegos/` after any change as the fast correctness check.

## Core architectural rule: Learn/game content parity

Every topic in `topics.ts` (its `TOPIC_OPTIONS` entry + question bank) **must** have a matching
lesson in `lessons.ts`'s `LESSONS` record, keyed by the same topic id — and vice versa. Never add,
edit, or remove one without checking the other. This is the single most important standing rule
in this codebase; the two files are not allowed to drift apart.

Each `LESSONS` entry must also be fully **self-contained** — never write "you already know X" or
"see the Y lesson," even for a closely related topic. A teacher or student may open any single
lesson (via the full Learn library, a game's scoped "Review these topics" view, or a printed
handout) with no guarantee they've seen any other specific lesson first.

## Other standing conventions

- **Mascots**: teams can pick an emoji mascot independent of team color. When a game has its own
  core-identity icon (e.g. Rocket Fuel's rocket, Vault Heist's vault), add the mascot *alongside*
  it — don't replace it. Generic stand-in icons (a missile, an attack animation) are fine to
  replace outright.
- **Themes**: `data/themes.ts` presets only skin the shared chrome (welcome/setup/game-select/
  results/My Classes/My Profile/Billing) — individual games keep their own fixed visual identity
  and are never themed. Colors that carry meaning (A1-C1 difficulty rainbow, correct/wrong
  feedback, destructive red) are also never themed.
- **Test accounts**: never sign up through the real `AuthScreen` form (sends real emails to
  whatever address is used). Create disposable test accounts via direct SQL insert into
  `auth.users`/`auth.identities` (see any recent Supabase-touching work for the exact template),
  and always fully delete them (in FK order: classes/subscriptions → identities → sessions →
  refresh_tokens → users) once done.
- **Verification scope**: live browser/Supabase verification (disposable accounts, screenshots)
  is for real behavioral or UI risk — new interaction logic, schema changes, anything that could
  plausibly be broken. A clean `tsc -b` plus a source-level diff review is the default bar for
  small, low-risk content or copy edits.
- **Billing**: free tier = 1 class + 2 teams per game (the class limit is enforced server-side by
  a Postgres trigger, not just the UI; the team limit is UI-only, a deliberate tradeoff). Paid =
  unlimited classes + up to 5 teams. `public.subscriptions` is Stripe-agnostic by design (a
  `provider` column) so a second payment provider (Mercado Pago is the planned one) can slot in
  without a schema rewrite.
- **Sentence Auction content (`auctionSentences`)**: every sentence must be independently written.
  Never write a correct sentence immediately followed by the same sentence with one word swapped
  to make it wrong — students pattern-match "the second of each near-identical pair is the broken
  one" almost instantly and stop reading. This is the one rule that actually matters here; a
  strictly alternating true/false/true/false sequence with otherwise-independent sentences is not
  a real problem and isn't worth fixing on its own. Run
  `node app-juegos/scripts/check-auction-sentences.js` after adding or editing any topic's
  `auctionSentences` before committing — it fails (non-zero exit) only on the near-duplicate
  pattern; alternation is reported as an FYI-only warning, not something to act on. See the
  comment on `auctionSentences` in `LessonGamesGenerator.tsx` for the same rule inline.
- **Building a topic from a teacher-supplied reference document**: never assume a player has read
  the source document — every game and lesson always assumes the player's only source of knowledge
  is the Learn lesson page itself. Don't lift a specific example phrase or scenario line verbatim
  from the source (e.g. a document's own illustrative dialogue), especially one built around an
  uncommon word the source had to gloss/define for its own reader — that word is then untaught and
  unexplained in ClassCade's own content, silently assuming the player saw the original document.
  A word from the source is fine to reuse *only* if it's actually decomposed and explained through
  the topic's own taught mechanism (e.g. an adjective built from a prefix/suffix the lesson
  explicitly teaches) or if it's common enough that no learner needs it explained at all. When in
  doubt, swap the word for a different, self-contained example rather than the source's own.
- **Vault Heist rewrite-sentence `transform` tags**: give each `transform` tag its own precise
  meaning — Vault Heist shows the tag verbatim (kebab-case → "LIKE THIS") on the lock-reveal card
  *before* the student sees the actual question, promising what kind of transformation is coming.
  If one topic's rewrite items actually test two or more distinguishable sub-skills (e.g. some
  items are prefix-only, others suffix-only), give each its own tag rather than one blanket tag
  covering both — a generic tag shown on every card regardless of which sub-skill that specific
  item tests reads as mislabeled/wrong to a teacher mid-game, even though it's technically a
  content-authoring gap rather than a game-logic bug. This applies just as much to the bare
  `negative`/`question`/`affirmative` tags as to custom ones — those three are reused across many
  topics precisely so unrelated topics' pools don't collide (see `AMBIGUOUS_TRANSFORMS` in
  `VaultHeistGame.tsx`), but that scoping is per-*topic*, not per-tense. A single topic mixing,
  say, present simple and past simple items under a bare `"negative"` tag has the same bug as a
  blanket custom tag: use `transform:"tense-<name>"` + `form:"negative"|"question"` instead (see
  `irregular_verbs` or `past_simple` for the established pattern) whenever one topic's rewrite
  content actually spans more than one tense or structure.
- **Vault Heist rewrite-sentence fragments must only show words that specific answer needs**: the
  `question` field is a literal set of words the player is meant to build the answer from — never
  show a word or clause there that the correct answer for that exact item doesn't use. When one
  scenario's fragment is naturally shared across multiple transform variants that need different
  subsets of it (e.g. an excuse's cause vs. cause+consequence), give each variant its own trimmed
  `question` field rather than reusing the full fragment on every variant. The reverse gap matters
  just as much: if a production lock's own topic has several different valid fixed phrasings for
  the same function (e.g. `invitations`' `invitation-reject` locks in one specific polite-refusal
  opener per item — "I'm afraid", "That's so kind, but", "Thanks for asking, but", etc. — out of
  many equally correct options), the fragment must include that item's own specific fixed-phrase
  words, not just the variable content (event/time/reason) — otherwise the player has no way to
  know which of several correct phrasings the answer key actually expects, and a different, equally
  valid response gets marked wrong purely because nothing ever cued which one to use.
- **Minefield's `minefieldGrid` — non-negotiable, check on every single new topic**:
  `MinefieldGame.tsx` hard-codes a 5x5 board (`ROWS = 5, COLS = 5`) and indexes `colLabels`/
  `rowLabels` by that fixed size regardless of how many entries the arrays actually have — a topic
  with fewer than 5 of either isn't a smaller grid, it's tiles rendering `undefined` text to a
  player. **Every `minefieldGrid` must have exactly 5 `colLabels` and exactly 5 `rowLabels`, always
  — count them before moving on, every time, no exceptions.** And both arrays must be real,
  half-sentence-shaped ideas — a genuine sentence opener/subject and a genuine verb-phrase/blank
  continuation — never abstract category labels ("Get = Obtain") or bare topic words. The game
  shows a picked tile's col label + row label side by side plus "+ your idea"; the student builds
  one full sentence combining all three aloud, and the teacher judges it live — there's no
  auto-graded correct/incorrect pairing, so never frame a grid as "match the correct pairs,
  mismatched pairs are the mines" (the mines are random hidden tiles, unrelated to grammar).
  Follow the established shape: `colLabels` = a subject or sentence-opener (e.g. `["I", "She",
  "They", "We", "He"]` or `["I always …", "She needs to …", ...]`), `rowLabels` = a verb-phrase or
  blank-templated continuation (e.g. `["___ (go) to…", ...]` or `["… give up …", ...]`) that reads
  as one coherent sentence stem when combined with any column — see `irregular_verbs`,
  `present_perfect`, or `phrasal_verbs` for the pattern. It's fine for a row's base-form word to
  need student-supplied conjugation depending on the column (that's the actual speaking practice).
  This conversation (`new-topics`) is where every new topic in this repo is authored, so this check
  belongs in the build checklist for every single topic from here on — not something to catch on
  a later audit.
- **"How to Play" tutorials (`data/tutorials/*.tsx`)**: each game's intro screen has a How to
  Play button opening a scripted walkthrough (`components/shared/HowToPlayModal.tsx`) — hand-authored
  mockups, not driven by real game state, so nothing keeps them in sync with the actual game
  automatically. Each tutorial file opens with a one-line comment naming the game file it
  recreates, and each game's intro block has a matching comment pointing back. When you change a
  game's core rules/scoring/phases, do a quick pass over its tutorial file and update anything now
  stale. This is a reminder, not an enforced rule — much lower-stakes than the Learn/topics parity
  rule above, since a stale tutorial mockup is a UX papercut, not wrong grammar content.

## Git workflow (multiple concurrent focus areas)

Work on this repo is split across parallel conversation threads by concern, each on its own
long-lived branch off `main`:

- **`new-topics`** — adding new topics/question banks to `topics.ts` (+ matching Learn lessons).
- **`game-lesson-changes`** — fixes/changes to the 14 other existing games, or corrections to
  existing Learn lessons/topics content not specific to Vault Heist.
- **`new-features`** — new functionality: new screens, new games, new backend architecture.
- **`vault-heist`** — carved out of `game-lesson-changes` because Vault Heist alone generates a
  disproportionate, recurring stream of content/bug work (see the `vault_heist_needs_work` and
  `vault_heist_content_classification_standard` memory files for the full history) — any work
  scoped to `VaultHeistGame.tsx` or its rewrite-sentences content/locks in `topics.ts` belongs here
  instead of `game-lesson-changes`.

Check out the branch matching the current conversation's focus before making changes, rather than
committing to `main` directly. Merge back (PR or direct merge) when a batch of work is ready. If
`main` has moved since a branch was created, merge `main` into that branch before starting new
work on it, so it isn't building on a stale base.
