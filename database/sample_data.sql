USE productivity_manager;

-- Insert sample categories
INSERT INTO categories (name) VALUES 
('Study'), 
('Project'), 
('IDOR'), 
('SSRF'), 
('XSS'), 
('SQLi'), 
('Recon');

-- Insert sample user (password is 'password123')
INSERT INTO users (username, email, password) VALUES 
('techlearner', 'learner@example.com', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- Insert sample tasks
INSERT INTO tasks (user_id, category_id, title, description, deadline, status) VALUES 
(1, 1, 'Complete CS50', 'Finish week 5 assignments', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'pending'),
(1, 3, 'Practice IDOR', 'Find 5 IDOR vulnerabilities on practice sites', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'in_progress'),
(1, 4, 'SSRF Research', 'Read 3 SSRF writeups', DATE_ADD(CURDATE(), INTERVAL 2 DAY), 'completed');

-- Insert sample resources
INSERT INTO resources (user_id, title, type, url, notes) VALUES 
(1, 'SSRF Bible', 'article', 'https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/Server%20Side%20Request%20Forgery', 'Great resource for SSRF payloads'),
(1, 'PortSwigger XSS', 'video', 'https://portswigger.net/web-security/cross-site-scripting', 'XSS tutorial videos');

-- Insert sample sessions
INSERT INTO sessions (user_id, task_id, session_date, start_time, end_time, duration_minutes, notes) VALUES 
(1, 1, CURDATE(), '09:00:00', '10:30:00', 90, 'Focused study session'),
(1, 2, CURDATE(), '14:00:00', '15:00:00', 60, 'Found 2 IDOR vulns');

-- Insert sample notes
INSERT INTO notes (user_id, title, content) VALUES 
(1, 'XSS Payloads', '<script>alert(1)</script>\n<img src=x onerror=alert(1)>'),
(1, 'IDOR Patterns', 'Check for /api/user/[id] endpoints with incremented IDs');

-- Insert sample achievements
INSERT INTO achievements (user_id, title, description, achieved_on) VALUES 
(1, 'First Bug', 'Found my first XSS vulnerability', DATE_SUB(CURDATE(), INTERVAL 15 DAY)),
(1, 'HTB Complete', 'Finished HackTheBox beginner track', DATE_SUB(CURDATE(), INTERVAL 7 DAY));

-- Insert sample logs
INSERT INTO logs (user_id, log_date, summary, mood) VALUES 
(1, CURDATE(), 'Worked on CS50 and found 2 IDOR vulns. Productive day!', 'productive'),
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'Struggled with buffer overflow concepts', 'stuck');