-- THIS IS DEMO. this is for manually adding sql data, for automated use API in .env.local

-- ========================================
-- CLIENT MANAGEMENT SYSTEM DATABASE SCHEMA
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- TABLES
-- ========================================

-- Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  website TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects Table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  budget NUMERIC(12, 2),
  status TEXT NOT NULL DEFAULT 'not_completed' CHECK (status IN ('completed', 'not_completed')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'on_hold', 'completed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================
-- INDEXES
-- ========================================

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- ========================================
-- FUNCTIONS
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger for clients table
DROP TRIGGER IF EXISTS update_clients_updated_at ON clients;
CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for projects table
DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for tasks table
DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS
-- ========================================

-- Client Overview View (with aggregated project data)
CREATE OR REPLACE VIEW client_overview AS
SELECT 
  c.id,
  c.name,
  c.email,
  c.phone,
  c.website,
  c.status,
  c.notes,
  c.created_at,
  c.updated_at,
  COALESCE(COUNT(DISTINCT p.id), 0)::INTEGER AS project_count,
  COALESCE(SUM(p.budget), 0)::NUMERIC AS total_budget
FROM clients c
LEFT JOIN projects p ON c.id = p.client_id
GROUP BY c.id, c.name, c.email, c.phone, c.website, c.status, c.notes, c.created_at, c.updated_at;

-- ========================================
-- ROW LEVEL SECURITY (RLS)
-- ========================================
-- Note: RLS is disabled by default for simplicity
-- Enable and configure as needed for production

-- Enable RLS (uncomment if needed)
-- ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (uncomment and modify as needed)
-- CREATE POLICY "Enable read access for all users" ON clients FOR SELECT USING (true);
-- CREATE POLICY "Enable insert access for all users" ON clients FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Enable update access for all users" ON clients FOR UPDATE USING (true);
-- CREATE POLICY "Enable delete access for all users" ON clients FOR DELETE USING (true);

-- ========================================
-- SAMPLE DATA (Optional - comment out if not needed)
-- ========================================

-- Insert sample clients
INSERT INTO clients (name, email, phone, website, status, notes)
VALUES 
  ('Acme Corporation', 'contact@acme.com', '+1-555-0100', 'https://acme.com', 'active', 'Enterprise client'),
  ('TechStart Inc', 'info@techstart.io', '+1-555-0101', 'https://techstart.io', 'active', 'Startup client'),
  ('Global Solutions', 'hello@globalsolutions.com', '+1-555-0102', 'https://globalsolutions.com', 'inactive', 'Former client')
ON CONFLICT DO NOTHING;

-- Insert sample projects
INSERT INTO projects (client_id, name, description, budget, status, start_date, end_date)
SELECT 
  c.id,
  'Website Redesign',
  'Complete website overhaul with modern design',
  25000.00,
  'not_completed',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '3 months'
FROM clients c WHERE c.name = 'Acme Corporation'
ON CONFLICT DO NOTHING;

INSERT INTO projects (client_id, name, description, budget, status, start_date, end_date)
SELECT 
  c.id,
  'Mobile App Development',
  'iOS and Android app development',
  50000.00,
  'not_completed',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '6 months'
FROM clients c WHERE c.name = 'TechStart Inc'
ON CONFLICT DO NOTHING;

-- Insert sample tasks
INSERT INTO tasks (project_id, name, description, status, priority, start_date, end_date)
SELECT 
  p.id,
  'Design mockups',
  'Create design mockups for all pages',
  'in_progress',
  'high',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '2 weeks'
FROM projects p WHERE p.name = 'Website Redesign'
ON CONFLICT DO NOTHING;

INSERT INTO tasks (project_id, name, description, status, priority, start_date, end_date)
SELECT 
  p.id,
  'Develop homepage',
  'Implement responsive homepage',
  'open',
  'high',
  CURRENT_DATE + INTERVAL '2 weeks',
  CURRENT_DATE + INTERVAL '1 month'
FROM projects p WHERE p.name = 'Website Redesign'
ON CONFLICT DO NOTHING;

-- ========================================
-- COMPLETION MESSAGE
-- ========================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tables created: clients, projects, tasks';
  RAISE NOTICE 'Views created: client_overview';
  RAISE NOTICE 'Sample data inserted';
  RAISE NOTICE '';
  RAISE NOTICE 'You can now run: npm run dev';
  RAISE NOTICE '========================================';
END $$;
