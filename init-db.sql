-- Create database if it doesn't exist
SELECT 'CREATE DATABASE stytch_starter'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'stytch_starter')\gexec

-- Grant privileges to the postgres user
GRANT ALL PRIVILEGES ON DATABASE stytch_starter TO postgres;
