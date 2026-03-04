-- Database Schema for Magwegwe West SDA Membership System
CREATE DATABASE IF NOT EXISTS magweusf_magwegwe_members;
USE magweusf_magwegwe_members;
-- Users Table (System Administrators, Pastors, Clerks)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    -- Added for future authentication
    role ENUM('ADMIN', 'PASTOR', 'CLERK') NOT NULL,
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Members Table (Main Church Membership)
CREATE TABLE IF NOT EXISTS members (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(50),
    email VARCHAR(100),
    phone VARCHAR(20),
    status ENUM(
        'BAPTIZED',
        'TRANSFERRED_IN',
        'ACTIVE',
        'INACTIVE',
        'TRANSFERRED_OUT'
    ) DEFAULT 'ACTIVE',
    department VARCHAR(100),
    registration_date DATE,
    baptism_date DATE,
    previous_church VARCHAR(150),
    destination_church VARCHAR(150),
    transfer_date DATE,
    board_approval_date DATE,
    address TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
-- Youth Members Table (Pathfinders, Adventurers)
CREATE TABLE IF NOT EXISTS youth_members (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    dob DATE,
    parent_name VARCHAR(100),
    parent_phone VARCHAR(20),
    grade VARCHAR(50),
    club ENUM('PATHFINDER', 'ADVENTURER') NOT NULL,
    `rank` VARCHAR(50),
    health_notes TEXT,
    registration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Society Members Table (Dorcas, AMO)
CREATE TABLE IF NOT EXISTS society_members (
    id VARCHAR(50) PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(50),
    phone VARCHAR(20),
    type ENUM('DORCAS', 'AMO') NOT NULL,
    skills TEXT,
    registration_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Audit Logs Table (Tracking System Activity)
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(50) PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    action VARCHAR(50) NOT NULL,
    details TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE
    SET NULL
);
-- Initial Admin User
-- Email: admin@magwegwesda.co.zw
-- Password: admin123
INSERT INTO users (id, name, email, password_hash, role, created_at)
VALUES (
        'admin-init',
        'System Administrator',
        'admin@magwegwesda.co.zw',
        '$2a$10$wvgtyi7cVESxIr9PYO7Pmup9/qHdZ/3quS180BRRrKejlRIvqcco2',
        'ADMIN',
        NOW()
    ) ON DUPLICATE KEY
UPDATE id = id;