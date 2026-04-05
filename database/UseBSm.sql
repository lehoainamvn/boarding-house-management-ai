USE master;
GO

IF NOT EXISTS (SELECT * FROM sys.sql_logins WHERE name = 'bsm_user')
BEGIN
    CREATE LOGIN bsm_user
    WITH PASSWORD = '123456',
    CHECK_POLICY = OFF;
END
GO

USE BSM_Management;
GO

IF NOT EXISTS (SELECT * FROM sys.database_principals WHERE name = 'bsm_user')
BEGIN
    CREATE USER bsm_user FOR LOGIN bsm_user;
END
GO

ALTER ROLE db_owner ADD MEMBER bsm_user;
GO
