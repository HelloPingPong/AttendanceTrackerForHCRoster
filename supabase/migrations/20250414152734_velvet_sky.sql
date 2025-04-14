/*
  # Initial Schema Setup

  1. New Tables
    - members
      - id (uuid, primary key)
      - name (text)
      - category (enum)
      - sub_categories (jsonb)
      - created_at (timestamptz)
      - updated_at (timestamptz)
    
    - meetings
      - id (uuid, primary key)
      - name (text)
      - description (text)
      - date (timestamptz)
      - type (enum)
      - special_note (text, nullable)
      - created_at (timestamptz)
    
    - attendance
      - id (uuid, primary key)
      - meeting_id (uuid, foreign key)
      - member_id (uuid, foreign key)
      - is_present (boolean)
      - date (timestamptz)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create member category enum
CREATE TYPE member_category AS ENUM ('OM', 'FT', 'RN', 'XT', 'V');

-- Create meeting type enum
CREATE TYPE meeting_type AS ENUM (
  'homechurch',
  'central_teaching',
  'prayer_group',
  'mens_cell',
  'womens_cell',
  'special'
);

-- Create members table
CREATE TABLE IF NOT EXISTS members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category member_category NOT NULL,
  sub_categories jsonb NOT NULL DEFAULT '{
    "gender": "male",
    "isBeliever": false,
    "isDisciple": false,
    "inMinistryHouse": false,
    "isPrimaryLeader": false,
    "isSecondaryLeader": false,
    "isMarried": false
  }'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  date timestamptz NOT NULL,
  type meeting_type NOT NULL,
  special_note text,
  created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE,
  member_id uuid REFERENCES members(id) ON DELETE CASCADE,
  is_present boolean NOT NULL DEFAULT false,
  date timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Allow authenticated users to read members"
  ON members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert members"
  ON members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update members"
  ON members
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read meetings"
  ON meetings
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert meetings"
  ON meetings
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update meetings"
  ON meetings
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to read attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert attendance"
  ON attendance
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update attendance"
  ON attendance
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_members_category ON members(category);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_type ON meetings(type);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_meeting ON attendance(meeting_id);
CREATE INDEX IF NOT EXISTS idx_attendance_member ON attendance(member_id);