# Tower leaderboard

The leaderboard API for the Tower of Babel brick-stacking game on [shoobyd.github.io](https://shoobyd.github.io/): a Cloudflare Worker with a D1 database. The site itself stays static on GitHub Pages. This Worker is the only thing that writes scores, so the write access never reaches the browser.

## API

| Method | Path | Body / headers | Result |
| --- | --- | --- | --- |
| `POST` | `/runs` | | `201 { run }`: a ticket for a run starting now, stamped with the server's clock; `429` past 30 starts a minute from one client |
| `GET` | `/scores` | | `{ scores }`: the top 10, best first, earliest first among equals |
| `POST` | `/scores` | `{ name, score, run, phases }`: `run` is the run's ticket, `phases` the phase each brick was dropped at | `201 { accepted: true, id, rank, scores }`, or `{ accepted: false, reason, scores }` |
| `DELETE` | `/scores/:id` | `Authorization: Bearer <ADMIN_TOKEN>` | `{ deleted, scores }` |

Reasons a submission is refused:

| Reason | Meaning |
| --- | --- |
| `run_invalid` | No ticket, one already used, or one older than two hours |
| `score_invalid` | Replaying the phases (`replay` in `src/rules.ts`) doesn't land every brick, or doesn't give the score sent |
| `too_fast` | The bricks moved for longer than the time since the ticket was issued (plus 3 seconds) |
| `name_empty`, `name_long`, `name_chars`, `name_banned` | The name is empty, longer than 20 characters, uses characters other than letters, digits, spaces and `._'-`, or contains a banned word (`src/banned.ts`) |
| `rate_limited` | More than 5 submissions a minute from one client |
| `not_on_board` | Doesn't beat the current 10th place |

A name the board refuses leaves the ticket for another try; any other answer uses it up. Only `POST` checks the origin: it must be one of `ALLOWED_ORIGINS` in `wrangler.toml`. The scores table only ever holds the board itself; run tickets are pruned after two hours.

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

`replay` in `src/rules.ts` mirrors the stack's rules in the site's `src/components/tower/scene/game/stack.ts`: `AMP`, `BS`, `PERFECT`, `SPEED0`, `SPEED_MAX`, the speed growth, and the arithmetic of a drop. If the game changes, change it here too.

