-- Sketch Match: Create tables for real-time collaboration
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard > SQL Editor)

-- Sessions table (stores collaboration session metadata)
CREATE TABLE IF NOT EXISTS canvas_sessions (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  canvas_data JSONB DEFAULT '{}'::jsonb
);

-- Real-time canvas updates (optional — used for persistence)
CREATE TABLE IF NOT EXISTS canvas_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  update_type VARCHAR(50) NOT NULL,
  element_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User presence tracking
CREATE TABLE IF NOT EXISTS user_presence (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT REFERENCES canvas_sessions(id) ON DELETE CASCADE,
  user_id VARCHAR(255) NOT NULL,
  user_name VARCHAR(255) NOT NULL,
  user_color VARCHAR(10) NOT NULL,
  cursor_x FLOAT DEFAULT 0,
  cursor_y FLOAT DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(session_id, user_id)
);

-- Enable Row Level Security (required by Supabase)
ALTER TABLE canvas_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE canvas_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_presence ENABLE ROW LEVEL SECURITY;

-- Allow all operations (for development — restrict in production)
CREATE POLICY "Allow all on canvas_sessions" ON canvas_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on canvas_updates" ON canvas_updates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on user_presence" ON user_presence FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE canvas_updates;
ALTER PUBLICATION supabase_realtime ADD TABLE user_presence;
