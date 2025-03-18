-- Create admin user
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role_id)
VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@example.com', '$2a$10$Ht.3LXRw9EC8dRqzU8QhG.QKXqD1sPcNxQR5K2JK5JRbRwGQHYzue', now(), now(), now(), '{"provider":"email","providers":["email"],"role":"admin"}', '{"full_name":"Admin User","role":"admin"}', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create supervisor users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role_id)
VALUES 
('00000000-0000-0000-0000-000000000002', 'supervisor1@example.com', '$2a$10$Ht.3LXRw9EC8dRqzU8QhG.QKXqD1sPcNxQR5K2JK5JRbRwGQHYzue', now(), now(), now(), '{"provider":"email","providers":["email"],"role":"supervisor"}', '{"full_name":"Dr. Sarah Johnson","role":"supervisor","supervisor_level":"senior"}', false, '00000000-0000-0000-0000-000000000000'),
('00000000-0000-0000-0000-000000000003', 'supervisor2@example.com', '$2a$10$Ht.3LXRw9EC8dRqzU8QhG.QKXqD1sPcNxQR5K2JK5JRbRwGQHYzue', now(), now(), now(), '{"provider":"email","providers":["email"],"role":"supervisor"}', '{"full_name":"Dr. Michael Chen","role":"supervisor","supervisor_level":"mid-level"}', false, '00000000-0000-0000-0000-000000000000'),
('00000000-0000-0000-0000-000000000004', 'supervisor3@example.com', '$2a$10$Ht.3LXRw9EC8dRqzU8QhG.QKXqD1sPcNxQR5K2JK5JRbRwGQHYzue', now(), now(), now(), '{"provider":"email","providers":["email"],"role":"supervisor"}', '{"full_name":"Dr. Aisha Patel","role":"supervisor","supervisor_level":"senior"}', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create counselor users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role_id)
VALUES 
('00000000-0000-0000-0000-000000000005', 'counselor1@example.com', '$2a$10$Ht.3LXRw9EC8dRqzU8QhG.QKXqD1sPcNxQR5K2JK5JRbRwGQHYzue', now(), now(), now(), '{"provider":"email","providers":["email"],"role":"counselor"}', '{"full_name":"John Doe","role":"counselor"}', false, '00000000-0000-0000-0000-000000000000'),
('00000000-0000-0000-0000-000000000006', 'counselor2@example.com', '$2a$10$Ht.3LXRw9EC8dRqzU8QhG.QKXqD1sPcNxQR5K2JK5JRbRwGQHYzue', now(), now(), now(), '{"provider":"email","providers":["email"],"role":"counselor"}', '{"full_name":"Jane Smith","role":"counselor"}', false, '00000000-0000-0000-0000-000000000000')
ON CONFLICT (id) DO NOTHING;

-- Create user profiles for admin
INSERT INTO public.user_profiles (id, full_name, role, is_approved, created_at)
VALUES 
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin', true, now())
ON CONFLICT (id) DO NOTHING;

-- Create user profiles for supervisors
INSERT INTO public.user_profiles (id, full_name, role, supervisor_level, is_approved, created_at)
VALUES 
('00000000-0000-0000-0000-000000000002', 'Dr. Sarah Johnson', 'supervisor', 'senior', true, now()),
('00000000-0000-0000-0000-000000000003', 'Dr. Michael Chen', 'supervisor', 'mid-level', true, now()),
('00000000-0000-0000-0000-000000000004', 'Dr. Aisha Patel', 'supervisor', 'senior', false, now())
ON CONFLICT (id) DO NOTHING;

-- Create user profiles for counselors
INSERT INTO public.user_profiles (id, full_name, role, is_approved, created_at)
VALUES 
('00000000-0000-0000-0000-000000000005', 'John Doe', 'counselor', true, now()),
('00000000-0000-0000-0000-000000000006', 'Jane Smith', 'counselor', true, now())
ON CONFLICT (id) DO NOTHING;

-- Create supervisor records
INSERT INTO public.supervisors (id, name, avatar, level, experience, background, introduction, title, specialization, years_of_experience, certifications, availability, bio, status)
VALUES
('00000000-0000-0000-0000-000000000002', 'Dr. Sarah Johnson', 'sarah', 'Senior', '12 years', 'Clinical Psychology', 'Specializes in CBT and trauma-informed care', 'Clinical Psychologist', 'Cognitive Behavioral Therapy', 12, ARRAY['Licensed Clinical Psychologist', 'CBT Certified'], 'Monday, Wednesday, Friday', 'Dr. Sarah Johnson is a licensed clinical psychologist with over 12 years of experience specializing in cognitive behavioral therapy. She has extensive experience working with adults dealing with anxiety, depression, and trauma.', 'Available'),
('00000000-0000-0000-0000-000000000003', 'Dr. Michael Chen', 'michael', 'Mid-level', '8 years', 'Family Therapy', 'Focuses on family dynamics and cultural contexts', 'Family Therapist', 'Family Systems Therapy', 8, ARRAY['Licensed Marriage and Family Therapist', 'Certified Family Trauma Professional'], 'Tuesday, Thursday', 'Dr. Michael Chen is a licensed marriage and family therapist who specializes in helping families navigate complex dynamics and improve communication. He has particular expertise in cultural issues affecting family systems.', 'Available'),
('00000000-0000-0000-0000-000000000004', 'Dr. Aisha Patel', 'aisha', 'Senior', '10 years', 'Child Psychology', 'Expert in play therapy and child development', 'Child Psychologist', 'Play Therapy', 10, ARRAY['Licensed Child Psychologist', 'Registered Play Therapist'], 'Monday, Tuesday, Thursday', 'Dr. Aisha Patel is a child psychologist who specializes in play therapy and developmental issues. She has worked extensively with children experiencing trauma, anxiety, and behavioral challenges.', 'Pending')
ON CONFLICT (id) DO NOTHING;
