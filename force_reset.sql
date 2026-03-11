-- Terminate all connections to the database
SELECT pg_terminate_backend(pid) 
FROM pg_stat_activity 
WHERE datname = 'immo_db' 
AND pid <> pg_backend_pid();

-- Clear tables
TRUNCATE TABLE "User", "Property", "Contact", "Favorite", "Notification", "Review", "Agency" RESTART IDENTITY CASCADE;

-- Verify
SELECT count(*) FROM "User";
