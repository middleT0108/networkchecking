-- NetCheck Gaming D1 SQLite Schema

CREATE TABLE IF NOT EXISTS test_history (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    region_id TEXT NOT NULL,
    timestamp INTEGER NOT NULL,
    avg_ping REAL NOT NULL,
    median_ping REAL NOT NULL,
    min_ping REAL NOT NULL,
    max_ping REAL NOT NULL,
    jitter REAL NOT NULL,
    packet_loss REAL NOT NULL,
    score INTEGER NOT NULL,
    rating TEXT NOT NULL,
    connection_type TEXT,
    isp_country TEXT,
    isp_org TEXT,
    client_type TEXT DEFAULT 'web',
    ip_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_history_game_timestamp ON test_history (game_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_history_region_timestamp ON test_history (region_id, timestamp DESC);

CREATE TABLE IF NOT EXISTS game_server_status (
    game_id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    message TEXT,
    last_checked TEXT NOT NULL,
    source TEXT NOT NULL
);
