-- Fresh schema for cPanel-safe plain PHP API
-- Target: MySQL 5.7+ / MariaDB 10.4+

SET FOREIGN_KEY_CHECKS=0;

DROP TABLE IF EXISTS failed_notifications;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS youth;
DROP TABLE IF EXISTS member_societies;
DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS societies;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS token_blocklist;
DROP TABLE IF EXISTS users;

SET FOREIGN_KEY_CHECKS=1;

CREATE TABLE users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('Admin','Pastor','Clerk','Viewer') NOT NULL DEFAULT 'Viewer',
    last_login DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_users_role (role),
    INDEX idx_users_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE token_blocklist (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jti VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_token_blocklist_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE societies (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE,
    leader VARCHAR(120) NULL,
    assistant_leader VARCHAR(120) NULL,
    meeting_day VARCHAR(40) NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE members (
    id VARCHAR(64) PRIMARY KEY,
    first_name VARCHAR(120) NOT NULL,
    last_name VARCHAR(120) NOT NULL,
    gender ENUM('Male','Female','Other') NULL,
    phone VARCHAR(30) NULL,
    email VARCHAR(190) NULL,
    national_id VARCHAR(60) NULL,
    date_of_birth DATE NULL,
    address TEXT NULL,
    baptism_date DATE NULL,
    society_id VARCHAR(64) NULL,
    status ENUM('BAPTIZED','TRANSFERRED_IN','ACTIVE','INACTIVE','TRANSFERRED_OUT') NOT NULL DEFAULT 'ACTIVE',
    department VARCHAR(255) NULL,
    previous_church VARCHAR(190) NULL,
    destination_church VARCHAR(190) NULL,
    transfer_date DATETIME NULL,
    board_approval_date DATE NULL,
    notes TEXT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_members_last_name (last_name),
    INDEX idx_members_status (status),
    INDEX idx_members_phone (phone),
    INDEX idx_members_email (email),
    INDEX idx_members_national_id (national_id),
    INDEX idx_members_created_at (created_at),
    CONSTRAINT fk_members_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE member_societies (
    id VARCHAR(64) PRIMARY KEY,
    member_id VARCHAR(64) NOT NULL,
    society_id VARCHAR(64) NOT NULL,
    skills TEXT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uq_member_society (member_id, society_id),
    INDEX idx_member_societies_society_id (society_id),
    CONSTRAINT fk_member_societies_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE,
    CONSTRAINT fk_member_societies_society FOREIGN KEY (society_id) REFERENCES societies(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE youth (
    id VARCHAR(64) PRIMARY KEY,
    member_id VARCHAR(64) NOT NULL,
    school VARCHAR(120) NULL,
    guardian_name VARCHAR(120) NULL,
    guardian_phone VARCHAR(30) NULL,
    grade VARCHAR(40) NULL,
    club ENUM('PATHFINDER','ADVENTURER') NULL,
    rank VARCHAR(60) NULL,
    health_notes TEXT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_youth_member_id (member_id),
    INDEX idx_youth_club (club),
    CONSTRAINT fk_youth_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE attendance (
    id VARCHAR(64) PRIMARY KEY,
    member_id VARCHAR(64) NOT NULL,
    event_type ENUM('Sabbath','Youth','Society','Campmeeting') NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present','Absent','Late') NOT NULL DEFAULT 'Present',
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    UNIQUE KEY uq_attendance (member_id, event_type, date),
    INDEX idx_attendance_event_date (event_type, date),
    CONSTRAINT fk_attendance_member FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(120) NOT NULL,
    entity_id VARCHAR(120) NULL,
    ip_address VARCHAR(45) NULL,
    created_at DATETIME NOT NULL,
    INDEX idx_audit_logs_created_at (created_at),
    INDEX idx_audit_logs_user_id_created_at (user_id, created_at),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE notifications (
    id VARCHAR(64) PRIMARY KEY,
    channel VARCHAR(30) NOT NULL DEFAULT 'sms',
    provider VARCHAR(60) NOT NULL DEFAULT 'africastalking',
    recipient VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    status ENUM('PENDING','SENT','FAILED') NOT NULL DEFAULT 'PENDING',
    response_payload LONGTEXT NULL,
    sent_at DATETIME NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_notifications_recipient (recipient),
    INDEX idx_notifications_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE failed_notifications (
    id VARCHAR(64) PRIMARY KEY,
    notification_id VARCHAR(64) NULL,
    provider VARCHAR(60) NULL,
    recipient VARCHAR(30) NULL,
    message TEXT NULL,
    reason TEXT NOT NULL,
    payload LONGTEXT NULL,
    failed_at DATETIME NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL,
    INDEX idx_failed_notifications_failed_at (failed_at),
    CONSTRAINT fk_failed_notifications_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;