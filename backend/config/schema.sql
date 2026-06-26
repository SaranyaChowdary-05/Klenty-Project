-- SprintHub Database Schema (MySQL)
-- Create Database: CREATE DATABASE sprinthub_db;

USE sprinthub_db;

-- ── 1. Users Table ──
CREATE TABLE IF NOT EXISTS `users` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(30) DEFAULT NULL,
  `profession` ENUM('Student', 'Working Professional', 'Freelancer', 'Team Leader', 'Faculty', 'Startup Founder', 'Admin') DEFAULT 'Student',
  `organization` VARCHAR(255) DEFAULT NULL,
  `skills` JSON DEFAULT NULL,
  `experience` VARCHAR(100) DEFAULT NULL,
  `profilePicture` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `role` ENUM('user', 'admin') DEFAULT 'user',
  `isActive` TINYINT(1) DEFAULT 1,
  `lastLogin` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 2. Projects Table ──
CREATE TABLE IF NOT EXISTS `projects` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `status` ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled', 'Archived') DEFAULT 'Planning',
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  `startDate` DATETIME DEFAULT NULL,
  `endDate` DATETIME DEFAULT NULL,
  `deadline` DATETIME DEFAULT NULL,
  `tags` JSON DEFAULT NULL,
  `teamMembers` JSON DEFAULT NULL,
  `estimatedHours` INT DEFAULT 0,
  `progress` INT DEFAULT 0,
  `notes` TEXT DEFAULT NULL,
  `attachments` JSON DEFAULT NULL,
  `isArchived` TINYINT(1) DEFAULT 0,
  `createdBy` CHAR(36) NOT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`createdBy`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 3. Tasks Table ──
CREATE TABLE IF NOT EXISTS `tasks` (
  `id` CHAR(36) NOT NULL,
  `title` VARCHAR(300) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `projectId` CHAR(36) DEFAULT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `status` ENUM('Pending', 'In Progress', 'Completed', 'On Hold', 'Cancelled') DEFAULT 'Pending',
  `priority` ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  `deadline` DATETIME DEFAULT NULL,
  `assignedTo` CHAR(36) DEFAULT NULL,
  `estimatedHours` INT DEFAULT 0,
  `tags` JSON DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `attachments` JSON DEFAULT NULL,
  `isArchived` TINYINT(1) DEFAULT 0,
  `createdBy` CHAR(36) DEFAULT NULL,
  `completedAt` DATETIME DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`assignedTo`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 4. Notifications Table ──
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` CHAR(36) NOT NULL,
  `userId` CHAR(36) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT DEFAULT NULL,
  `type` ENUM('task_created', 'task_updated', 'task_deleted', 'project_created', 'project_updated', 'project_deleted', 'deadline_reminder', 'completion_alert') NOT NULL,
  `isRead` TINYINT(1) DEFAULT 0,
  `relatedId` CHAR(36) DEFAULT NULL,
  `relatedType` VARCHAR(50) DEFAULT NULL,
  `createdAt` DATETIME NOT NULL,
  `updatedAt` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
