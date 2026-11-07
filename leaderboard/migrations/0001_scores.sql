-- The tower game's leaderboard: one row per accepted score.
CREATE TABLE scores (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	score INTEGER NOT NULL,
	duration_ms INTEGER NOT NULL,
	created_at INTEGER NOT NULL
);

-- the board reads the best scores, earliest first among equals
CREATE INDEX scores_rank ON scores (score DESC, created_at ASC);

-- recent submissions per (hashed) client address, for rate limiting; old rows are pruned
CREATE TABLE submissions (
	client TEXT NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE INDEX submissions_client ON submissions (client, created_at);

