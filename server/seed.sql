-- =============================================================================
-- ReUseHub Seed Data (MySQL)
-- Standard Indian Campus Marketplace Samples
-- Default password for all seed accounts is: password123
-- =============================================================================

USE `reusehub_db`;

-- Seed Users (Students + Admin)
INSERT INTO `users` (`id`, `name`, `email`, `department`, `hostel`, `phone`, `password_hash`, `role`, `created_at`, `last_login_at`)
VALUES
  (1, 'Campus Admin', 'admin@reusehub.edu.in', 'Administration', 'Staff Quarters', '+91 98000 11223', '$2b$10$bA7etmSKDmVOCz3hHCNAS.yPK3KthFvq7JSFyzkeii90HqdaQmPTu', 'admin', NOW(), NOW()),
  (2, 'Aarav Sharma', 'aarav.sharma@college.edu.in', 'CSE, Block A', 'Block A', '+91 98765 43210', '$2b$10$bA7etmSKDmVOCz3hHCNAS.yPK3KthFvq7JSFyzkeii90HqdaQmPTu', 'user', NOW(), NOW()),
  (3, 'Priya Nair', 'priya.nair@college.edu.in', 'ECE, Block B', 'Block B', '+91 91234 56789', '$2b$10$bA7etmSKDmVOCz3hHCNAS.yPK3KthFvq7JSFyzkeii90HqdaQmPTu', 'user', NOW(), NOW()),
  (4, 'Rohan Reddy', 'rohan.reddy@college.edu.in', 'Mechanical, Block C', 'Block C', '+91 99887 76655', '$2b$10$bA7etmSKDmVOCz3hHCNAS.yPK3KthFvq7JSFyzkeii90HqdaQmPTu', 'user', NOW(), NOW()),
  (5, 'Ananya Iyer', 'ananya.iyer@college.edu.in', 'Civil, Block A', 'Block A', '+91 97654 32109', '$2b$10$bA7etmSKDmVOCz3hHCNAS.yPK3KthFvq7JSFyzkeii90HqdaQmPTu', 'user', NOW(), NOW()),
  (6, 'Karthik Rao', 'karthik.rao@college.edu.in', 'Chemical, Block D', 'Block D', '+91 96543 21098', '$2b$10$bA7etmSKDmVOCz3hHCNAS.yPK3KthFvq7JSFyzkeii90HqdaQmPTu', 'user', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- Seed Items
INSERT INTO `items` (`id`, `seller_id`, `title`, `description`, `category`, `price`, `condition_type`, `status`, `is_sold`, `image_url`, `created_at`)
VALUES
  (1, 3, 'Higher Engineering Mathematics by B.S. Grewal (44th Edition)', 'Standard textbook for 1st & 2nd year engineering mathematics. Clean pages with minimal pencil notes.', 'Textbooks', 450.00, 'Like New', 'Available', 0, 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 2 DAY)),
  (2, 2, 'Casio fx-991EX ClassWiz Scientific Calculator', 'Non-programmable college exam approved calculator. Dual solar and battery power, high-res LCD screen.', 'Calculators', 850.00, 'Good', 'Available', 0, 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 3 DAY)),
  (3, 3, 'White Cotton Lab Coat (Size 38) + Chemical Splash Goggles', 'Required for 1st year Chemistry and Physics labs. Washed, crisp 100% cotton with transparent safety eyewear.', 'Lab Equipment', 250.00, 'Good', 'Available', 0, 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 4 DAY)),
  (4, 4, 'Omega Mini Drafter with Stainless Steel Rods & Sheet Holder', 'Essential for Engineering Graphics (ED) drawing sheets. Smooth 360-degree protractor clamp.', 'Drawing Instruments', 420.00, 'Like New', 'Available', 0, 'https://images.unsplash.com/photo-1585336261026-6a4574972f07?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 5 DAY)),
  (5, 4, 'Hostel Study Table Lamp (Rechargeable LED) & Spike Guard', '3 color light modes with dimmable touch control, 6-hour backup. Includes 4-socket surge extension board.', 'Hostel Essentials', 350.00, 'Good', 'Available', 0, 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 6 DAY)),
  (6, 2, 'Engineering Mechanics by S.S. Bhavikatti (New Age International)', 'Textbook for Statics & Dynamics with solved university question papers. Great for Civil & Mechanical.', 'Textbooks', 280.00, 'Good', 'Available', 0, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (7, 5, 'Rotring Isograph Technical Drawing Pen Set (0.2, 0.3, 0.5 mm)', 'Precision German drafting technical pens for architectural and civil engineering drawings.', 'Drawing Instruments', 650.00, 'Like New', 'Available', 0, 'https://images.unsplash.com/photo-1585336261026-6a4574972f07?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (8, 6, 'Hero Sprint 26T Campus Bicycle with Heavy Duty Basket & Lock', 'Single speed campus cycle in smooth running condition. New brake pads, anti-theft chain lock included.', 'Hostel Essentials', 1800.00, 'Good', 'Available', 0, 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80', DATE_SUB(NOW(), INTERVAL 9 DAY))
ON DUPLICATE KEY UPDATE `title`=VALUES(`title`);

-- Seed Purchase Requests
INSERT INTO `purchase_requests` (`id`, `item_id`, `buyer_id`, `note`, `status`, `created_at`)
VALUES
  (1, 3, 2, 'Hi Priya! I have Chemistry practicals starting this Thursday. Can we meet near the Central Canteen to exchange?', 'pending', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
  (2, 4, 2, 'Hey Rohan, is the mini drafter still available? Can meet at Block C hostel gate.', 'accepted', DATE_SUB(NOW(), INTERVAL 1 DAY))
ON DUPLICATE KEY UPDATE `note`=VALUES(`note`);

-- Seed Sample Login Logs
INSERT INTO `login_logs` (`user_id`, `login_time`, `ip_address`, `user_agent`)
VALUES
  (1, NOW(), '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36'),
  (2, DATE_SUB(NOW(), INTERVAL 2 HOUR), '192.168.1.105', 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148'),
  (3, DATE_SUB(NOW(), INTERVAL 12 HOUR), '192.168.1.120', 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Chrome/120.0 Mobile Safari/537.36');
