-- Run this in your Supabase SQL Editor to create the table

CREATE TABLE registrations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  dob DATE NOT NULL,
  positions JSONB,
  role VARCHAR(50),
  phone VARCHAR(20),
  photo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Note: We use SERIAL for id to automatically increment. 
-- The backend API formats this id as "AC-0001".
