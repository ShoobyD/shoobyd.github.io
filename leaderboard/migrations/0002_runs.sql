-- Run tickets: one per game run started, stamped with the server's own clock, so how long a run
-- took is measured here rather than claimed by the browser. A submission uses its ticket up;
-- tickets older than two hours are pruned.
CREATE TABLE runs (
	id TEXT PRIMARY KEY,
	-- the same per-day hash of the address as submissions, for the start limit
	client TEXT NOT NULL,
	started_at INTEGER NOT NULL
);

CREATE INDEX runs_client ON runs (client, started_at);
CREATE INDEX runs_started ON runs (started_at);

