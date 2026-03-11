-- PostgreSQL Initialization Script for ImmoSénégal
-- This script is executed automatically by docker-compose

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create schema if not exists
CREATE SCHEMA IF NOT EXISTS public;

-- Set default privileges
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO immo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO immo_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO immo_user;

-- Create necessary indices
-- These will be handled by Prisma migrations
-- This file is just for initial setup

-- Grant permissions
GRANT USAGE ON SCHEMA public TO immo_user;
GRANT CREATE ON SCHEMA public TO immo_user;

-- Log initialization completion
SELECT 'Database initialized successfully' AS status;
