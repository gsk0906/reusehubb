-- =============================================================================
-- ReUseHub Database Schema (MySQL)
-- Tables: users, login_logs, items, purchase_requests
-- Includes Foreign Keys, Cascades, Indexes, and Optimizations
-- =============================================================================

CREATE DATABASE IF NOT EXISTS `reusehub_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `reusehub_db`;

-- -----------------------------------------------------------------------------
-- 1. Users Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `department` VARCHAR(255) NOT NULL DEFAULT 'Campus Member',
  `hostel` VARCHAR(255) NOT NULL DEFAULT 'Campus Member',
  `phone` VARCHAR(50) NOT NULL DEFAULT '',
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  INDEX `idx_users_email` (`email`),
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Login Activity Logs Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `login_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `login_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_address` VARCHAR(100) NULL DEFAULT NULL,
  `user_agent` TEXT NULL DEFAULT NULL,
  CONSTRAINT `fk_login_logs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_login_logs_user_id` (`user_id`),
  INDEX `idx_login_logs_login_time` (`login_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Items (Marketplace Listings) Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `seller_id` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `condition_type` VARCHAR(50) NOT NULL DEFAULT 'Good',
  `status` ENUM('Available', 'Sold') NOT NULL DEFAULT 'Available',
  `is_sold` TINYINT(1) NOT NULL DEFAULT 0,
  `image_url` TEXT NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_items_seller` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_items_seller_id` (`seller_id`),
  INDEX `idx_items_category` (`category`),
  INDEX `idx_items_status` (`status`),
  INDEX `idx_items_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Purchase & Exchange Requests Table
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `purchase_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `item_id` INT NOT NULL,
  `buyer_id` INT NOT NULL,
  `note` TEXT NULL DEFAULT NULL,
  `status` ENUM('pending', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_requests_item` FOREIGN KEY (`item_id`) REFERENCES `items` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_requests_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  INDEX `idx_requests_item_id` (`item_id`),
  INDEX `idx_requests_buyer_id` (`buyer_id`),
  INDEX `idx_requests_status` (`status`),
  INDEX `idx_requests_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
