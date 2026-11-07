# Tower leaderboard

The leaderboard API for the Tower of Babel brick-stacking game on [shoobyd.github.io](https://shoobyd.github.io/): a Cloudflare Worker with a D1 database. The site itself stays static on GitHub Pages. This Worker is the only thing that writes scores, so the write access never reaches the browser.

## API

| Method | Path | Body / headers | Result |
| --- | --- | --- | --- |
| `GET` | `/scores` | | `{ scores }`: the top 10, best first, earliest first among equals |
| `POST` | `/scores` | `{ name, score, durationMs }` | `201 { accepted: true, id, rank, scores }`, or `{ accepted: false, reason, scores }` |
| `DELETE` | `/scores/:id` | `Authorization: Bearer <ADMIN_TOKEN>` | `{ deleted, scores }` |

Reasons a submission is refused:

| Reason | Meaning |
| --- | --- |
| `score_invalid` | Not a whole number from 1 to 500, or no duration |
| `too_fast` | Impossible in the reported time (see `minimumDurationMs` in `src/rules.ts`) |
| `name_empty`, `name_long`, `name_chars`, `name_banned` | The name is empty, longer than 20 characters, uses characters other than letters, digits, spaces and `._'-`, or contains a banned word (`src/banned.ts`) |
| `rate_limited` | More than 5 submissions a minute from one client |
| `not_on_board` | Doesn't beat the current 10th place |

Only `POST` checks the origin: it must be one of `ALLOWED_ORIGINS` in `wrangler.toml`. The table only ever holds the board itself.

## Develop

```sh
cd leaderboard
npm install
npm run migrate:local   # creates the tables in the local D1
npm run dev             # http://localhost:8787
npm run typecheck
```

## Deploy

```sh
npx wrangler d1 create tower-leaderboard    # once; put the printed id in wrangler.toml
npm run migrate:remote
npx wrangler secret put ADMIN_TOKEN         # once; any long random string
npm run deploy
```

## Remove an entry

```sh
curl -X DELETE https://<worker-url>/scores/<id> -H "Authorization: Bearer <ADMIN_TOKEN>"
```

Entry ids are in the `GET /scores` response.

## Keep in sync with the game

The plausibility check in `src/rules.ts` mirrors the brick timing in the site's `src/components/tower/scene/game/stack.ts` (`AMP`, `BS`, `SPEED0`, `SPEED_MAX` and the speed growth). If the game changes, change it here too.

