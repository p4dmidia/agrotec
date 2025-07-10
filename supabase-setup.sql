-- Dr. Agro - Supabase Schema Setup
-- Este arquivo contém as tabelas necessárias para a aplicação Dr. Agro

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  plan VARCHAR(20) DEFAULT 'gratuito' CHECK (plan IN ('gratuito', 'pro', 'premium')),
  is_adimplente BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms table
CREATE TABLE IF NOT EXISTS farms (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  municipality VARCHAR(255),
  state VARCHAR(2),
  address TEXT,
  total_area DECIMAL(10,2),
  crop_type VARCHAR(255),
  development_stage VARCHAR(255),
  cep VARCHAR(8),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  mode VARCHAR(20) DEFAULT 'consultation' CHECK (mode IN ('consultation', 'diagnostic')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES chat_conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning tracks table
CREATE TABLE IF NOT EXISTS learning_tracks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  difficulty VARCHAR(20) DEFAULT 'beginner',
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Learning videos table
CREATE TABLE IF NOT EXISTS learning_videos (
  id SERIAL PRIMARY KEY,
  track_id INTEGER REFERENCES learning_tracks(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  video_url VARCHAR(500),
  duration_minutes INTEGER,
  order_index INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  track_id INTEGER REFERENCES learning_tracks(id) ON DELETE CASCADE,
  video_id INTEGER REFERENCES learning_videos(id) ON DELETE CASCADE,
  is_completed BOOLEAN DEFAULT false,
  score INTEGER,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, track_id, video_id)
);

-- Calendar events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50),
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(255),
  notes TEXT,
  image_path VARCHAR(500),
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Weather alerts table
CREATE TABLE IF NOT EXISTS weather_alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL,
  severity VARCHAR(20) DEFAULT 'medium',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  city VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Store products table
CREATE TABLE IF NOT EXISTS store_products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price DECIMAL(10,2) NOT NULL,
  image_url VARCHAR(500),
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Shopping cart table
CREATE TABLE IF NOT EXISTS shopping_cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES store_products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, product_id)
);

-- User usage table
CREATE TABLE IF NOT EXISTS user_usage (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM format
  ai_consultations INTEGER DEFAULT 0,
  tracks_completed INTEGER DEFAULT 0,
  videos_watched INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, month)
);

-- Task templates table
CREATE TABLE IF NOT EXISTS task_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_type VARCHAR(50),
  default_duration INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task suggestions table
CREATE TABLE IF NOT EXISTS task_suggestions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium',
  category VARCHAR(100),
  suggested_date DATE,
  is_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User activity table for tracking inactivity
CREATE TABLE IF NOT EXISTS user_activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  last_calendar_activity TIMESTAMP,
  last_chat_activity TIMESTAMP,
  last_learning_activity TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_cpf ON users(cpf);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_farms_active ON farms(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_weather_alerts_user_active ON weather_alerts(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_shopping_cart_user_id ON shopping_cart(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON user_usage(user_id, month);

-- Insert sample data
INSERT INTO learning_tracks (title, description, category, difficulty, duration_minutes) VALUES
('Agricultura Básica', 'Fundamentos da agricultura moderna', 'Iniciante', 'beginner', 120),
('Manejo de Pragas', 'Controle integrado de pragas', 'Intermediário', 'intermediate', 180),
('Irrigação Eficiente', 'Técnicas de irrigação sustentável', 'Avançado', 'advanced', 240)
ON CONFLICT DO NOTHING;

INSERT INTO learning_videos (track_id, title, description, video_url, duration_minutes, order_index) VALUES
(1, 'Introdução à Agricultura', 'Conceitos básicos', 'https://example.com/video1', 20, 1),
(1, 'Preparação do Solo', 'Como preparar o solo', 'https://example.com/video2', 25, 2),
(1, 'Plantio e Sementes', 'Técnicas de plantio', 'https://example.com/video3', 30, 3),
(2, 'Identificação de Pragas', 'Como identificar pragas', 'https://example.com/video4', 35, 1),
(2, 'Controle Biológico', 'Métodos naturais', 'https://example.com/video5', 40, 2),
(3, 'Sistemas de Irrigação', 'Tipos de irrigação', 'https://example.com/video6', 45, 1)
ON CONFLICT DO NOTHING;

INSERT INTO store_products (name, description, category, price, in_stock) VALUES
('Sementes de Milho Premium', 'Sementes de alta qualidade', 'seeds', 89.90, true),
('Fertilizante NPK 20-05-20', 'Fertilizante completo', 'fertilizers', 45.50, true),
('Pulverizador Manual 20L', 'Pulverizador resistente', 'tools', 156.00, true),
('Inseticida Biológico', 'Controle natural de pragas', 'pesticides', 78.30, true)
ON CONFLICT DO NOTHING;