-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 27, 2026 at 06:15 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `iisms`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `year_id` int(10) UNSIGNED NOT NULL,
  `year_label` varchar(20) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`year_id`, `year_label`, `start_date`, `end_date`, `is_current`, `created_at`) VALUES
(1, '2026', '2026-01-05', '2026-12-18', 1, '2026-08-27 16:09:45'),
(2, '2025', '2025-01-06', '2025-12-19', 0, '2026-08-27 16:09:45');

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

CREATE TABLE `audit_log` (
  `audit_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` enum('create','update','delete','view','export','login','logout') NOT NULL,
  `entity_type` varchar(50) NOT NULL,
  `entity_id` int(10) UNSIGNED DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `changes_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`changes_json`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `books`
--

CREATE TABLE `books` (
  `book_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `author` varchar(255) NOT NULL,
  `isbn` varchar(20) DEFAULT NULL,
  `publisher` varchar(255) DEFAULT NULL,
  `publication_year` int(11) DEFAULT NULL,
  `category` varchar(100) NOT NULL,
  `total_copies` int(11) NOT NULL DEFAULT 1,
  `available_copies` int(11) NOT NULL DEFAULT 1,
  `location` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','retired') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `books`
--

INSERT INTO `books` (`book_id`, `title`, `author`, `isbn`, `publisher`, `publication_year`, `category`, `total_copies`, `available_copies`, `location`, `description`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(21, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262046305', 'MIT Press', 2022, 'Technology', 5, 5, 'Shelf A1', 'Comprehensive introduction to algorithms', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(22, 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Prentice Hall', 2008, 'Technology', 4, 4, 'Shelf A1', 'A handbook of agile software craftsmanship', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(23, 'JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'OReilly Media', 2008, 'Technology', 3, 3, 'Shelf A2', 'Unearthing the excellence in JavaScript', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(24, 'Python Crash Course', 'Eric Matthes', '978-1593279288', 'No Starch Press', 2022, 'Technology', 6, 6, 'Shelf A2', 'A hands-on, project-based introduction to Python', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(25, 'Head First Design Patterns', 'Eric Freeman', '978-1492078005', 'OReilly Media', 2020, 'Technology', 3, 3, 'Shelf A1', 'A brain-friendly guide to design patterns', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(26, 'Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'McGraw-Hill', 2019, 'Technology', 4, 4, 'Shelf A3', 'Foundational textbook on database management', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(27, 'Computer Networking', 'James Kurose', '978-135928608', 'Pearson', 2021, 'Technology', 3, 3, 'Shelf A3', 'Comprehensive introduction to networking', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(28, 'Linux Command Line', 'Richard Blum', '978-1119700913', 'Wiley', 2021, 'Technology', 3, 3, 'Shelf A2', 'Master the Linux command line', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(29, 'Engineering Mathematics', 'K.A. Stroud', '978-1352010350', 'Red Globe Press', 2020, 'Mathematics', 5, 5, 'Shelf B1', 'Comprehensive math for engineers', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(30, 'Discrete Mathematics', 'Kenneth H. Rosen', '978-1259676512', 'McGraw-Hill', 2019, 'Mathematics', 4, 4, 'Shelf B1', 'Essential discrete math for CS', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(31, 'Physics for Scientists', 'Raymond Serway', '978-1337553292', 'Cengage', 2018, 'Science', 4, 4, 'Shelf B2', 'Standard physics textbook', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(32, 'Electric Circuits', 'Charles Alexander', '978-1259226229', 'McGraw-Hill', 2020, 'Science', 3, 3, 'Shelf B2', 'Fundamental electric circuits', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(33, 'Oxford Learners Dictionary', 'Diana Lean', '978-0194798792', 'Oxford University Press', 2020, 'Reference', 8, 8, 'Shelf C1', 'Comprehensive English dictionary', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(34, 'Cambridge Grammar', 'Raymond Murphy', '978-1316637630', 'Cambridge University Press', 2019, 'Reference', 5, 5, 'Shelf C1', 'Advanced English grammar', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(35, 'Things Fall Apart', 'Chinua Achebe', '978-0385474542', 'Anchor Books', 1994, 'Literature', 6, 6, 'Shelf D1', 'Classic African literature', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(36, 'The Alchemist', 'Paulo Coelho', '978-0062315007', 'HarperOne', 2014, 'Fiction', 5, 5, 'Shelf D2', 'A fable about following your dreams', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(37, 'Half of a Yellow Sun', 'Chimamanda Adichie', '978-1400032112', 'Vintage', 2006, 'Fiction', 4, 4, 'Shelf D2', 'A novel about the Biafran War', 'active', '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(38, 'Digital Electronics', 'Roger Tokheim', '978-0073373881', 'McGraw-Hill', 2017, 'General', 3, 3, 'Shelf E1', 'Digital electronics and logic', 'active', '2026-08-27 16:10:19', '2026-08-27 16:10:19', NULL),
(39, 'Entrepreneurship', 'Robert Hisrich', '978-1259872990', 'McGraw-Hill', 2017, 'General', 4, 4, 'Shelf E1', 'Starting and managing businesses', 'active', '2026-08-27 16:10:19', '2026-08-27 16:10:19', NULL),
(40, 'Rwandan History', 'Jan Vansina', '978-0299102142', 'University of Wisconsin', 1998, 'General', 3, 3, 'Shelf E2', 'Oral tradition and Rwandan history', 'active', '2026-08-27 16:10:19', '2026-08-27 16:10:19', NULL),
(41, 'Introduction to Algorithms', 'Thomas H. Cormen', '978-0262046305', 'MIT Press', 2022, 'Technology', 5, 5, 'Shelf A1', 'Comprehensive introduction to algorithms', 'active', '2026-08-27 16:10:59', '2026-08-27 16:10:59', NULL),
(42, 'Clean Code', 'Robert C. Martin', '978-0132350884', 'Prentice Hall', 2008, 'Technology', 4, 4, 'Shelf A1', 'A handbook of agile software craftsmanship', 'active', '2026-08-27 16:10:59', '2026-08-27 16:10:59', NULL),
(43, 'JavaScript: The Good Parts', 'Douglas Crockford', '978-0596517748', 'OReilly Media', 2008, 'Technology', 3, 3, 'Shelf A2', 'Unearthing the excellence in JavaScript', 'active', '2026-08-27 16:10:59', '2026-08-27 16:10:59', NULL),
(44, 'Python Crash Course', 'Eric Matthes', '978-1593279288', 'No Starch Press', 2022, 'Technology', 6, 6, 'Shelf A2', 'A hands-on, project-based introduction to Python', 'active', '2026-08-27 16:10:59', '2026-08-27 16:10:59', NULL),
(45, 'Head First Design Patterns', 'Eric Freeman', '978-1492078005', 'OReilly Media', 2020, 'Technology', 3, 3, 'Shelf A1', 'A brain-friendly guide to design patterns', 'active', '2026-08-27 16:10:59', '2026-08-27 16:10:59', NULL),
(46, 'Database System Concepts', 'Abraham Silberschatz', '978-0078022159', 'McGraw-Hill', 2019, 'Technology', 4, 4, 'Shelf A3', 'Foundational textbook on database management', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(47, 'Computer Networking', 'James Kurose', '978-135928608', 'Pearson', 2021, 'Technology', 3, 3, 'Shelf A3', 'Comprehensive introduction to networking', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(48, 'Linux Command Line', 'Richard Blum', '978-1119700913', 'Wiley', 2021, 'Technology', 3, 3, 'Shelf A2', 'Master the Linux command line', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(49, 'Engineering Mathematics', 'K.A. Stroud', '978-1352010350', 'Red Globe Press', 2020, 'Mathematics', 5, 5, 'Shelf B1', 'Comprehensive math for engineers', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(50, 'Discrete Mathematics', 'Kenneth H. Rosen', '978-1259676512', 'McGraw-Hill', 2019, 'Mathematics', 4, 4, 'Shelf B1', 'Essential discrete math for CS', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(51, 'Physics for Scientists', 'Raymond Serway', '978-1337553292', 'Cengage', 2018, 'Science', 4, 4, 'Shelf B2', 'Standard physics textbook', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(52, 'Electric Circuits', 'Charles Alexander', '978-1259226229', 'McGraw-Hill', 2020, 'Science', 3, 3, 'Shelf B2', 'Fundamental electric circuits', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(53, 'Oxford Learners Dictionary', 'Diana Lean', '978-0194798792', 'Oxford University Press', 2020, 'Reference', 8, 8, 'Shelf C1', 'Comprehensive English dictionary', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(54, 'Cambridge Grammar', 'Raymond Murphy', '978-1316637630', 'Cambridge University Press', 2019, 'Reference', 5, 5, 'Shelf C1', 'Advanced English grammar', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(55, 'Things Fall Apart', 'Chinua Achebe', '978-0385474542', 'Anchor Books', 1994, 'Literature', 6, 6, 'Shelf D1', 'Classic African literature', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(56, 'The Alchemist', 'Paulo Coelho', '978-0062315007', 'HarperOne', 2014, 'Fiction', 5, 5, 'Shelf D2', 'A fable about following your dreams', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(57, 'Half of a Yellow Sun', 'Chimamanda Adichie', '978-1400032112', 'Vintage', 2006, 'Fiction', 4, 4, 'Shelf D2', 'A novel about the Biafran War', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(58, 'Digital Electronics', 'Roger Tokheim', '978-0073373881', 'McGraw-Hill', 2017, 'General', 3, 3, 'Shelf E1', 'Digital electronics and logic', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(59, 'Entrepreneurship', 'Robert Hisrich', '978-1259872990', 'McGraw-Hill', 2017, 'General', 4, 4, 'Shelf E1', 'Starting and managing businesses', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL),
(60, 'Rwandan History', 'Jan Vansina', '978-0299102142', 'University of Wisconsin', 1998, 'General', 3, 3, 'Shelf E2', 'Oral tradition and Rwandan history', 'active', '2026-08-27 16:11:00', '2026-08-27 16:11:00', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `book_transactions`
--

CREATE TABLE `book_transactions` (
  `transaction_id` int(11) NOT NULL,
  `book_id` int(11) NOT NULL,
  `borrower_type` enum('student','staff') NOT NULL,
  `borrower_id` int(11) NOT NULL,
  `borrow_date` date NOT NULL,
  `due_date` date NOT NULL,
  `return_date` date DEFAULT NULL,
  `status` enum('borrowed','returned','overdue','lost') NOT NULL DEFAULT 'borrowed',
  `notes` text DEFAULT NULL,
  `issued_by` int(11) DEFAULT NULL,
  `returned_to` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `class_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `class_name` varchar(100) NOT NULL,
  `level` varchar(20) NOT NULL,
  `trade` varchar(100) NOT NULL,
  `capacity` int(10) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`class_id`, `academic_year_id`, `class_name`, `level`, `trade`, `capacity`) VALUES
(15, 1, 'L2 Computer Applications', 'L2', '', NULL),
(16, 1, 'L2 Digital Skills', 'L2', '', NULL),
(17, 1, 'L2 Domestic Electricity', 'L2', '', NULL),
(18, 1, 'L3 Software Development', 'L3', '', NULL),
(19, 1, 'L4 Software Development', 'L4', '', NULL),
(20, 1, 'L5 Software Development', 'L5', '', NULL),
(21, 1, 'L2 Computer Applications', 'L2', '', NULL),
(22, 1, 'L2 Digital Skills', 'L2', '', NULL),
(23, 1, 'L2 Domestic Electricity', 'L2', '', NULL),
(24, 1, 'L3 Software Development', 'L3', '', NULL),
(25, 1, 'L4 Software Development', 'L4', '', NULL),
(26, 1, 'L5 Software Development', 'L5', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `fee_items`
--

CREATE TABLE `fee_items` (
  `fee_item_id` int(10) UNSIGNED NOT NULL,
  `item_name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fee_items`
--

INSERT INTO `fee_items` (`fee_item_id`, `item_name`, `description`, `created_at`) VALUES
(1, 'Tuition Fee', 'Per-term tuition', '2026-08-27 16:10:18'),
(2, 'Exam Fee', 'Examination fee', '2026-08-27 16:10:18'),
(3, 'Laboratory Fee', 'Lab and practical fee', '2026-08-27 16:10:18'),
(4, 'Sports Fee', 'Sports and activities fee', '2026-08-27 16:10:18'),
(5, 'Library Fee', 'Library access fee', '2026-08-27 16:10:18');

-- --------------------------------------------------------

--
-- Table structure for table `fee_structures`
--

CREATE TABLE `fee_structures` (
  `rate_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `level` varchar(20) NOT NULL,
  `term_id` int(10) UNSIGNED NOT NULL,
  `fee_item_id` int(10) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `fee_structures`
--

INSERT INTO `fee_structures` (`rate_id`, `academic_year_id`, `level`, `term_id`, `fee_item_id`, `amount`) VALUES
(47, 1, 'L2', 1, 1, 167000.00),
(48, 1, 'L2', 1, 2, 167000.00),
(49, 1, 'L2', 1, 3, 167000.00),
(50, 1, 'L2', 2, 1, 167000.00),
(51, 1, 'L2', 3, 1, 167000.00),
(52, 1, 'L3', 1, 1, 365000.00),
(53, 1, 'L3', 1, 2, 15000.00),
(54, 1, 'L3', 1, 3, 20000.00),
(55, 1, 'L3', 1, 4, 10000.00),
(56, 1, 'L3', 1, 5, 5000.00),
(57, 1, 'L3', 2, 1, 330000.00),
(58, 1, 'L3', 3, 1, 290000.00),
(59, 1, 'L4', 1, 1, 365000.00),
(60, 1, 'L4', 1, 2, 15000.00),
(61, 1, 'L4', 1, 3, 20000.00),
(62, 1, 'L4', 1, 4, 10000.00),
(63, 1, 'L4', 1, 5, 5000.00),
(64, 1, 'L4', 2, 1, 330000.00),
(65, 1, 'L4', 3, 1, 290000.00),
(66, 1, 'L5', 1, 1, 365000.00),
(67, 1, 'L5', 1, 2, 15000.00),
(68, 1, 'L5', 1, 3, 20000.00),
(69, 1, 'L5', 1, 4, 10000.00),
(70, 1, 'L5', 1, 5, 5000.00),
(71, 1, 'L5', 2, 1, 330000.00),
(72, 1, 'L5', 3, 1, 290000.00);

-- --------------------------------------------------------

--
-- Table structure for table `file_uploads`
--

CREATE TABLE `file_uploads` (
  `file_id` int(10) UNSIGNED NOT NULL,
  `original_name` varchar(255) NOT NULL,
  `storage_path` varchar(500) NOT NULL,
  `mime_type` varchar(100) NOT NULL,
  `file_size` int(10) UNSIGNED NOT NULL,
  `entity_type` varchar(50) DEFAULT NULL,
  `entity_id` int(10) UNSIGNED DEFAULT NULL,
  `uploaded_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `invoices`
--

CREATE TABLE `invoices` (
  `invoice_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `term_id` int(10) UNSIGNED NOT NULL,
  `fee_item_id` int(10) UNSIGNED NOT NULL,
  `invoice_date` date NOT NULL,
  `gross_amount` decimal(12,2) NOT NULL,
  `discount_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `amount_due` decimal(12,2) NOT NULL,
  `status` enum('open','partially_paid','paid','void','overdue') NOT NULL DEFAULT 'open',
  `notes` text DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `invoices`
--

INSERT INTO `invoices` (`invoice_id`, `student_id`, `academic_year_id`, `term_id`, `fee_item_id`, `invoice_date`, `gross_amount`, `discount_percent`, `amount_due`, `status`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(84, 39, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:12:30', '2026-08-27 16:12:30'),
(85, 39, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:29', '2026-08-27 16:13:29'),
(86, 39, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(87, 40, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(88, 41, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(89, 42, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(90, 49, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(91, 43, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(92, 44, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'open', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(93, 45, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(94, 46, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'open', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(95, 47, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(96, 48, 1, 1, 1, '2026-08-27', 167000.00, 0.00, 167000.00, 'open', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(97, 18, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:51', '2026-08-27 16:13:51'),
(98, 19, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(99, 20, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(100, 21, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(101, 22, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(102, 23, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(103, 24, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(104, 25, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(105, 26, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(106, 27, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(107, 28, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(108, 29, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(109, 30, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(110, 31, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(111, 32, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(112, 33, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(113, 34, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(114, 35, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(115, 36, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'paid', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(116, 37, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52'),
(117, 38, 1, 1, 1, '2026-08-27', 365000.00, 0.00, 365000.00, 'open', NULL, NULL, '2026-08-27 16:13:52', '2026-08-27 16:13:52');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `log_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `username_attempted` varchar(50) NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` text DEFAULT NULL,
  `status` enum('success','failed_password','failed_otp','locked') NOT NULL,
  `failure_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `login_logs`
--

INSERT INTO `login_logs` (`log_id`, `user_id`, `username_attempted`, `ip_address`, `user_agent`, `status`, `failure_reason`, `created_at`) VALUES
(106, 10, 'admin', 'req.ip', 'req.headers.user-agent', 'success', NULL, '2026-08-27 16:12:51');

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `module_id` int(10) UNSIGNED NOT NULL,
  `module_key` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `icon` varchar(50) NOT NULL DEFAULT 'bi-box',
  `built` tinyint(1) NOT NULL DEFAULT 0,
  `category` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `modules`
--

INSERT INTO `modules` (`module_id`, `module_key`, `label`, `icon`, `built`, `category`, `description`, `sort_order`, `created_at`) VALUES
(17, 'dashboard', 'Dashboard', 'bi-box', 0, '', NULL, 1, '2026-08-27 16:09:44'),
(18, 'students', 'Students', 'bi-box', 0, '', NULL, 2, '2026-08-27 16:09:44'),
(19, 'staff', 'Staff', 'bi-box', 0, '', NULL, 3, '2026-08-27 16:09:44'),
(20, 'finance', 'Finance', 'bi-box', 0, '', NULL, 4, '2026-08-27 16:09:44'),
(21, 'tasks', 'Tasks', 'bi-box', 0, '', NULL, 5, '2026-08-27 16:09:44'),
(22, 'classes', 'Classes', 'bi-box', 0, '', NULL, 6, '2026-08-27 16:09:44'),
(23, 'academic-years', 'Academic Years', 'bi-box', 0, '', NULL, 7, '2026-08-27 16:09:44'),
(24, 'library', 'Library', 'bi-box', 0, '', NULL, 8, '2026-08-27 16:09:44'),
(25, 'system-settings', 'System Settings', 'bi-box', 0, '', NULL, 9, '2026-08-27 16:09:44'),
(26, 'user-management', 'User Management', 'bi-box', 0, '', NULL, 10, '2026-08-27 16:09:44');

-- --------------------------------------------------------

--
-- Table structure for table `otp_codes`
--

CREATE TABLE `otp_codes` (
  `otp_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `code_hash` char(64) NOT NULL,
  `channel` enum('email','sms') NOT NULL DEFAULT 'email',
  `attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 0,
  `max_attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `consumed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `otp_codes`
--

INSERT INTO `otp_codes` (`otp_id`, `user_id`, `code_hash`, `channel`, `attempts`, `max_attempts`, `expires_at`, `consumed_at`, `created_at`) VALUES
(81, 10, '7c2645faefd62b199fa9c1006b70ee59a50b0053a9e88faa0b02569041ffd578', 'email', 0, 5, '2026-08-27 16:13:00', '2026-08-27 16:13:00', '2026-08-27 16:12:51');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `payment_id` int(10) UNSIGNED NOT NULL,
  `invoice_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `installment_no` tinyint(3) UNSIGNED NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `payment_date` date NOT NULL,
  `payment_method` enum('Cash','Mobile Money','Bank Transfer','Cheque','Other') NOT NULL DEFAULT 'Cash',
  `reference_no` varchar(100) DEFAULT NULL,
  `received_by` int(10) UNSIGNED DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`payment_id`, `invoice_id`, `student_id`, `installment_no`, `amount`, `payment_date`, `payment_method`, `reference_no`, `received_by`, `comment`, `created_at`) VALUES
(7, 86, 39, 0, 167000.00, '0000-00-00', 'Cash', 'PAY-1', 10, NULL, '2026-08-27 16:13:51'),
(8, 87, 40, 0, 167000.00, '0000-00-00', 'Cash', 'PAY-2', 10, NULL, '2026-08-27 16:13:51'),
(9, 88, 41, 0, 167000.00, '0000-00-00', 'Cash', 'PAY-3', 10, NULL, '2026-08-27 16:13:51'),
(10, 89, 42, 0, 167000.00, '0000-00-00', 'Cash', 'PAY-4', 10, NULL, '2026-08-27 16:13:51'),
(11, 90, 49, 0, 167000.00, '0000-00-00', '', 'PAY-5', 10, NULL, '2026-08-27 16:13:51'),
(12, 91, 43, 0, 167000.00, '0000-00-00', '', 'PAY-6', 10, NULL, '2026-08-27 16:13:51'),
(13, 93, 45, 0, 167000.00, '0000-00-00', '', 'PAY-7', 10, NULL, '2026-08-27 16:13:51'),
(14, 95, 47, 0, 167000.00, '0000-00-00', '', 'PAY-8', 10, NULL, '2026-08-27 16:13:51'),
(15, 97, 18, 0, 365000.00, '0000-00-00', '', 'PAY-9', 10, NULL, '2026-08-27 16:13:51'),
(16, 101, 22, 0, 365000.00, '0000-00-00', '', 'PAY-10', 10, NULL, '2026-08-27 16:13:52'),
(17, 105, 26, 0, 365000.00, '0000-00-00', 'Cash', 'PAY-11', 10, NULL, '2026-08-27 16:13:52'),
(18, 107, 28, 0, 365000.00, '0000-00-00', '', 'PAY-12', 10, NULL, '2026-08-27 16:13:52'),
(19, 110, 31, 0, 365000.00, '0000-00-00', 'Cash', 'PAY-13', 10, NULL, '2026-08-27 16:13:52'),
(20, 114, 35, 0, 365000.00, '0000-00-00', 'Cash', 'PAY-14', 10, NULL, '2026-08-27 16:13:52'),
(21, 115, 36, 0, 365000.00, '0000-00-00', '', 'PAY-15', 10, NULL, '2026-08-27 16:13:52');

-- --------------------------------------------------------

--
-- Table structure for table `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `token_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `token_hash` char(64) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `revoked` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`token_id`, `user_id`, `token_hash`, `expires_at`, `revoked`, `created_at`) VALUES
(53, 10, '0bba112245d9f720b1f5d5d8f748016d0adce6d8cb6d7971b7dd04eff8406145', '2026-09-03 16:13:00', 0, '2026-08-27 16:13:00');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(10) UNSIGNED NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_system` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `description`, `is_system`, `created_at`) VALUES
(12, 'Administrator', 'Full system access — all modules, all CRUD, system settings', 0, '2026-08-27 16:09:44'),
(13, 'Director', 'Strategic oversight — KPIs, reports, all modules', 0, '2026-08-27 16:09:44'),
(14, 'DOS', 'Academic program management, student oversight, timetabling', 0, '2026-08-27 16:09:44'),
(15, 'Registrar', 'Student registration, records, promotions, exports', 0, '2026-08-27 16:09:44'),
(16, 'Teacher', 'Basic student view, mark entry, personal tasks', 0, '2026-08-27 16:09:44'),
(17, 'Discipline Officer', 'Student welfare, disciplinary records, counselling', 0, '2026-08-27 16:09:44'),
(18, 'Accountant', 'Full finance: fee structure, invoices, sponsorships, payments', 0, '2026-08-27 16:09:44'),
(19, 'Cashier', 'Payment recording only — search students, receive payments', 0, '2026-08-27 16:09:44'),
(20, 'Finance Manager', 'Read-only finance reports and dashboard', 0, '2026-08-27 16:09:44'),
(21, 'HR Officer', 'Staff management: registration, editing', 0, '2026-08-27 16:09:44'),
(22, 'Librarian', 'Book catalog, borrow/return management', 0, '2026-08-27 16:09:44');

-- --------------------------------------------------------

--
-- Table structure for table `role_permissions`
--

CREATE TABLE `role_permissions` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `module_key` varchar(50) NOT NULL,
  `can_view` tinyint(1) NOT NULL DEFAULT 1,
  `can_create` tinyint(1) NOT NULL DEFAULT 0,
  `can_edit` tinyint(1) NOT NULL DEFAULT 0,
  `can_delete` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `role_permissions`
--

INSERT INTO `role_permissions` (`permission_id`, `role_id`, `module_key`, `can_view`, `can_create`, `can_edit`, `can_delete`) VALUES
(338, 12, 'dashboard', 1, 1, 1, 1),
(339, 12, 'students', 1, 1, 1, 1),
(340, 12, 'staff', 1, 1, 1, 1),
(341, 12, 'finance', 1, 1, 1, 1),
(342, 12, 'tasks', 1, 1, 1, 1),
(343, 12, 'classes', 1, 1, 1, 1),
(344, 12, 'academic-years', 1, 1, 1, 1),
(345, 12, 'library', 1, 1, 1, 1),
(346, 12, 'system-settings', 1, 1, 1, 1),
(347, 12, 'user-management', 1, 1, 1, 1),
(348, 13, 'dashboard', 1, 1, 1, 1),
(349, 13, 'students', 1, 1, 1, 1),
(350, 13, 'staff', 1, 1, 1, 1),
(351, 13, 'finance', 1, 1, 1, 1),
(352, 13, 'tasks', 1, 1, 1, 1),
(353, 13, 'classes', 1, 1, 1, 1),
(354, 13, 'academic-years', 1, 1, 1, 1),
(355, 13, 'library', 1, 1, 1, 1),
(356, 13, 'system-settings', 1, 0, 0, 0),
(357, 13, 'user-management', 1, 0, 0, 0),
(358, 14, 'dashboard', 1, 1, 1, 1),
(359, 14, 'students', 1, 1, 1, 1),
(360, 14, 'staff', 1, 0, 0, 0),
(361, 14, 'finance', 1, 0, 0, 0),
(362, 14, 'tasks', 1, 1, 1, 1),
(363, 14, 'classes', 1, 1, 1, 1),
(364, 14, 'academic-years', 1, 1, 1, 1),
(365, 14, 'library', 1, 0, 0, 0),
(366, 14, 'system-settings', 1, 0, 0, 0),
(367, 14, 'user-management', 1, 0, 0, 0),
(368, 15, 'dashboard', 1, 1, 1, 1),
(369, 15, 'students', 1, 1, 1, 1),
(370, 15, 'staff', 1, 0, 0, 0),
(371, 15, 'finance', 1, 0, 0, 0),
(372, 15, 'tasks', 1, 1, 1, 1),
(373, 15, 'classes', 1, 1, 1, 1),
(374, 15, 'academic-years', 1, 1, 1, 1),
(375, 15, 'library', 1, 0, 0, 0),
(376, 15, 'system-settings', 1, 0, 0, 0),
(377, 15, 'user-management', 1, 0, 0, 0),
(378, 16, 'dashboard', 1, 1, 1, 1),
(379, 16, 'students', 1, 0, 0, 0),
(380, 16, 'staff', 1, 0, 0, 0),
(381, 16, 'finance', 1, 0, 0, 0),
(382, 16, 'tasks', 1, 1, 1, 1),
(383, 16, 'classes', 1, 0, 0, 0),
(384, 16, 'academic-years', 1, 0, 0, 0),
(385, 16, 'library', 1, 0, 0, 0),
(386, 16, 'system-settings', 1, 0, 0, 0),
(387, 16, 'user-management', 1, 0, 0, 0),
(388, 17, 'dashboard', 1, 1, 1, 1),
(389, 17, 'students', 1, 0, 0, 0),
(390, 17, 'staff', 1, 0, 0, 0),
(391, 17, 'finance', 1, 0, 0, 0),
(392, 17, 'tasks', 1, 1, 1, 1),
(393, 17, 'classes', 1, 0, 0, 0),
(394, 17, 'academic-years', 1, 0, 0, 0),
(395, 17, 'library', 1, 0, 0, 0),
(396, 17, 'system-settings', 1, 0, 0, 0),
(397, 17, 'user-management', 1, 0, 0, 0),
(398, 18, 'dashboard', 1, 1, 1, 1),
(399, 18, 'students', 1, 0, 0, 0),
(400, 18, 'staff', 1, 0, 0, 0),
(401, 18, 'finance', 1, 1, 1, 1),
(402, 18, 'tasks', 1, 1, 1, 1),
(403, 18, 'classes', 1, 0, 0, 0),
(404, 18, 'academic-years', 1, 0, 0, 0),
(405, 18, 'library', 1, 0, 0, 0),
(406, 18, 'system-settings', 1, 0, 0, 0),
(407, 18, 'user-management', 1, 0, 0, 0),
(408, 19, 'dashboard', 1, 1, 1, 1),
(409, 19, 'students', 1, 0, 0, 0),
(410, 19, 'staff', 1, 0, 0, 0),
(411, 19, 'finance', 1, 0, 0, 0),
(412, 19, 'tasks', 1, 0, 0, 0),
(413, 19, 'classes', 1, 0, 0, 0),
(414, 19, 'academic-years', 1, 0, 0, 0),
(415, 19, 'library', 1, 0, 0, 0),
(416, 19, 'system-settings', 1, 0, 0, 0),
(417, 19, 'user-management', 1, 0, 0, 0),
(418, 20, 'dashboard', 1, 1, 1, 1),
(419, 20, 'students', 1, 0, 0, 0),
(420, 20, 'staff', 1, 0, 0, 0),
(421, 20, 'finance', 1, 0, 0, 0),
(422, 20, 'tasks', 1, 0, 0, 0),
(423, 20, 'classes', 1, 0, 0, 0),
(424, 20, 'academic-years', 1, 0, 0, 0),
(425, 20, 'library', 1, 0, 0, 0),
(426, 20, 'system-settings', 1, 0, 0, 0),
(427, 20, 'user-management', 1, 0, 0, 0),
(428, 21, 'dashboard', 1, 1, 1, 1),
(429, 21, 'students', 1, 0, 0, 0),
(430, 21, 'staff', 1, 1, 1, 1),
(431, 21, 'finance', 1, 0, 0, 0),
(432, 21, 'tasks', 1, 1, 1, 1),
(433, 21, 'classes', 1, 0, 0, 0),
(434, 21, 'academic-years', 1, 0, 0, 0),
(435, 21, 'library', 1, 0, 0, 0),
(436, 21, 'system-settings', 1, 0, 0, 0),
(437, 21, 'user-management', 1, 0, 0, 0),
(438, 22, 'dashboard', 1, 1, 1, 1),
(439, 22, 'students', 1, 0, 0, 0),
(440, 22, 'staff', 1, 0, 0, 0),
(441, 22, 'finance', 1, 0, 0, 0),
(442, 22, 'tasks', 1, 0, 0, 0),
(443, 22, 'classes', 1, 0, 0, 0),
(444, 22, 'academic-years', 1, 0, 0, 0),
(445, 22, 'library', 1, 1, 1, 1),
(446, 22, 'system-settings', 1, 0, 0, 0),
(447, 22, 'user-management', 1, 0, 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `staff_id` int(10) UNSIGNED NOT NULL,
  `staff_no` varchar(50) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('M','F') NOT NULL,
  `marital_status` varchar(20) DEFAULT NULL,
  `nationality` varchar(50) DEFAULT 'Rwandan',
  `id_passport_no` varchar(50) DEFAULT NULL,
  `staff_category` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `highest_qualification` varchar(50) DEFAULT NULL,
  `considered_qualification` varchar(50) DEFAULT NULL,
  `domain` varchar(100) DEFAULT NULL,
  `sub_domain` varchar(100) DEFAULT NULL,
  `field_of_study` varchar(100) DEFAULT NULL,
  `graduation_date` date DEFAULT NULL,
  `staff_position` varchar(100) DEFAULT NULL,
  `employment_date_education` date DEFAULT NULL,
  `employment_date_school` date DEFAULT NULL,
  `contract_type` varchar(50) DEFAULT NULL,
  `staff_bank` varchar(50) DEFAULT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `staff_rssb_number` varchar(50) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `detail_address` text DEFAULT NULL,
  `status` enum('active','on_leave','resigned','terminated') NOT NULL DEFAULT 'active',
  `photo_file_id` int(10) UNSIGNED DEFAULT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`staff_id`, `staff_no`, `full_name`, `date_of_birth`, `gender`, `marital_status`, `nationality`, `id_passport_no`, `staff_category`, `phone_number`, `email`, `highest_qualification`, `considered_qualification`, `domain`, `sub_domain`, `field_of_study`, `graduation_date`, `staff_position`, `employment_date_education`, `employment_date_school`, `contract_type`, `staff_bank`, `account_number`, `staff_rssb_number`, `province`, `district`, `sector`, `cell`, `village`, `detail_address`, `status`, `photo_file_id`, `metadata_json`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(2, 'STF-001', 'Jean-Paul Hakizimana', NULL, 'M', NULL, 'Rwandan', NULL, 'Teaching', NULL, NULL, NULL, NULL, 'Software Development', NULL, NULL, NULL, 'Senior Lecturer', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(3, 'STF-002', 'Marie Goreth Uwimana', NULL, 'F', NULL, 'Rwandan', NULL, 'Teaching', NULL, NULL, NULL, NULL, 'Networking & Security', NULL, NULL, NULL, 'Lecturer', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(4, 'STF-003', 'Pierre Celestin Nshimiyimana', NULL, 'M', NULL, 'Rwandan', NULL, 'Teaching', NULL, NULL, NULL, NULL, 'Database Systems', NULL, NULL, NULL, 'Lecturer', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(5, 'STF-004', 'Claude Rwasa', NULL, 'M', NULL, 'Rwandan', NULL, 'Teaching', NULL, NULL, NULL, NULL, 'Web Development', NULL, NULL, NULL, 'Assistant Lecturer', NULL, NULL, 'Part-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(6, 'STF-005', 'Ange Mutesi', NULL, 'F', NULL, 'Rwandan', NULL, 'Teaching', NULL, NULL, NULL, NULL, 'Digital Literacy', NULL, NULL, NULL, 'Assistant Lecturer', NULL, NULL, 'Part-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(7, 'STF-006', 'Emmanuel Habimana', NULL, 'M', NULL, 'Rwandan', NULL, 'Administrative', NULL, NULL, NULL, NULL, 'Finance', NULL, NULL, NULL, 'Accountant', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(8, 'STF-007', 'Solange Nyirabahizi', NULL, 'F', NULL, 'Rwandan', NULL, 'Administrative', NULL, NULL, NULL, NULL, 'Front Office', NULL, NULL, NULL, 'Receptionist', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(9, 'STF-008', 'Dieudonné Mugisha', NULL, 'M', NULL, 'Rwandan', NULL, 'Administrative', NULL, NULL, NULL, NULL, 'IT Department', NULL, NULL, NULL, 'IT Technician', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(10, 'STF-009', 'Esperance Mukamana', NULL, 'F', NULL, 'Rwandan', NULL, 'Administrative', NULL, NULL, NULL, NULL, 'Administration', NULL, NULL, NULL, 'Secretary', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(11, 'STF-010', 'Iracanyumuryezu Bizimana', NULL, 'M', NULL, 'Rwandan', NULL, 'Support', NULL, NULL, NULL, NULL, 'Library', NULL, NULL, NULL, 'Librarian', NULL, NULL, 'Full-Time', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(12, 'STF-011', 'Chantal Nyiragatare', NULL, 'F', NULL, 'Rwandan', NULL, 'Support', NULL, NULL, NULL, NULL, 'Maintenance', NULL, NULL, NULL, 'Cleaner', NULL, NULL, 'Contract', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL),
(13, 'STF-012', 'Fidele Twizeyimana', NULL, 'M', NULL, 'Rwandan', NULL, 'Support', NULL, NULL, NULL, NULL, 'Security', NULL, NULL, NULL, 'Security Guard', NULL, NULL, 'Contract', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:18', '2026-08-27 16:10:18', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `staff_academic_years`
--

CREATE TABLE `staff_academic_years` (
  `id` int(10) UNSIGNED NOT NULL,
  `staff_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `student_id` int(10) UNSIGNED NOT NULL,
  `admission_no` varchar(50) NOT NULL,
  `national_student_code` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `gender` enum('M','F') NOT NULL,
  `date_of_birth` date NOT NULL,
  `nationality` varchar(50) NOT NULL DEFAULT 'Rwandan',
  `residence_status` enum('Resident','Refugee','Non-resident') NOT NULL DEFAULT 'Resident',
  `disability` varchar(50) DEFAULT 'None',
  `parenthood` varchar(50) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `official_paper_type` varchar(50) DEFAULT NULL,
  `official_paper_no` varchar(50) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `detail_address` text DEFAULT NULL,
  `status` enum('active','transferred','graduated','dropped') NOT NULL DEFAULT 'active',
  `photo_file_id` int(10) UNSIGNED DEFAULT NULL,
  `metadata_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata_json`)),
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`student_id`, `admission_no`, `national_student_code`, `first_name`, `last_name`, `gender`, `date_of_birth`, `nationality`, `residence_status`, `disability`, `parenthood`, `father_name`, `mother_name`, `email`, `phone`, `official_paper_type`, `official_paper_no`, `province`, `district`, `sector`, `cell`, `village`, `detail_address`, `status`, `photo_file_id`, `metadata_json`, `created_by`, `created_at`, `updated_at`, `deleted_at`) VALUES
(18, 'INT-26-001', NULL, 'Jean', 'Bizimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:16', '2026-08-27 16:10:16', NULL),
(19, 'INT-26-002', NULL, 'Alice', 'Mukamana', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:16', '2026-08-27 16:10:16', NULL),
(20, 'INT-26-003', NULL, 'Patrick', 'Habimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(21, 'INT-26-004', NULL, 'Claudine', 'Uwera', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(22, 'INT-26-005', NULL, 'Eric', 'Niyonzima', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(23, 'INT-26-006', NULL, 'Grace', 'Ishimwe', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(24, 'INT-26-007', NULL, 'Emmanuel', 'Nshimiyimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(25, 'INT-26-008', NULL, 'Chantal', 'Nyiramana', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(26, 'INT-26-009', NULL, 'Olivier', 'Gakuru', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(27, 'INT-26-010', NULL, 'Diane', 'Kamikazi', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(28, 'INT-26-011', NULL, 'Kevin', 'Mugisha', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(29, 'INT-26-012', NULL, 'Sandrine', 'Nyinawumuntu', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(30, 'INT-26-013', NULL, 'Baptiste', 'Hakizimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(31, 'INT-26-014', NULL, 'Josiane', 'Uwimana', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(32, 'INT-26-015', NULL, 'Dieudonné', 'Niyongira', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(33, 'INT-26-016', NULL, 'Samuel', 'Bizimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(34, 'INT-26-017', NULL, 'Ange', 'Mukabalisa', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(35, 'INT-26-018', NULL, 'Yves', 'Twizeyimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(36, 'INT-26-019', NULL, 'Marie', 'Nshimiyimana', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(37, 'INT-26-020', NULL, 'Bernard', 'Sindayigaya', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(38, 'INT-26-021', NULL, 'Immaculée', 'Kayitesi', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(39, 'INT-26-022', NULL, 'Fiston', 'Irakoze', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(40, 'INT-26-023', NULL, 'Blooming', 'Nyirahabimana', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(41, 'INT-26-024', NULL, 'Dieu', 'Ndayisaba', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(42, 'INT-26-025', NULL, 'Espérance', 'Uwineza', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(43, 'INT-26-026', NULL, 'Aimable', 'Niyonsenga', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(44, 'INT-26-027', NULL, 'Charline', 'Murekatete', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(45, 'INT-26-028', NULL, 'Placide', 'Nzeyimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(46, 'INT-26-029', NULL, 'Ishmael', 'Bimenyimana', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(47, 'INT-26-030', NULL, 'Clarisse', 'Ingabire', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(48, 'INT-26-031', NULL, 'Thierry', 'Munyaneza', 'M', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL),
(49, 'INT-26-032', NULL, 'Dative', 'Niyonsaba', 'F', '0000-00-00', 'Rwandan', 'Resident', 'None', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'active', NULL, NULL, NULL, '2026-08-27 16:10:17', '2026-08-27 16:10:17', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_academic_records`
--

CREATE TABLE `student_academic_records` (
  `record_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `term_id` int(10) UNSIGNED DEFAULT NULL,
  `boarding_category` enum('Day','Boarding') NOT NULL DEFAULT 'Day',
  `sponsorship_type` varchar(50) DEFAULT NULL,
  `gor_funded` tinyint(1) NOT NULL DEFAULT 0,
  `comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_academic_records`
--

INSERT INTO `student_academic_records` (`record_id`, `student_id`, `academic_year_id`, `class_id`, `term_id`, `boarding_category`, `sponsorship_type`, `gor_funded`, `comment`) VALUES
(17, 18, 1, 18, NULL, 'Day', NULL, 0, NULL),
(18, 19, 1, 18, NULL, 'Day', NULL, 0, NULL),
(19, 20, 1, 18, NULL, 'Day', NULL, 0, NULL),
(20, 21, 1, 18, NULL, 'Day', NULL, 0, NULL),
(21, 22, 1, 18, NULL, 'Day', NULL, 0, NULL),
(22, 23, 1, 18, NULL, 'Day', NULL, 0, NULL),
(23, 24, 1, 18, NULL, 'Day', NULL, 0, NULL),
(24, 25, 1, 18, NULL, 'Day', NULL, 0, NULL),
(25, 26, 1, 19, NULL, 'Day', NULL, 0, NULL),
(26, 27, 1, 19, NULL, 'Day', NULL, 0, NULL),
(27, 28, 1, 19, NULL, 'Day', NULL, 0, NULL),
(28, 29, 1, 19, NULL, 'Day', NULL, 0, NULL),
(29, 30, 1, 19, NULL, 'Day', NULL, 0, NULL),
(30, 31, 1, 19, NULL, 'Day', NULL, 0, NULL),
(31, 32, 1, 19, NULL, 'Day', NULL, 0, NULL),
(32, 33, 1, 20, NULL, 'Day', NULL, 0, NULL),
(33, 34, 1, 20, NULL, 'Day', NULL, 0, NULL),
(34, 35, 1, 20, NULL, 'Day', NULL, 0, NULL),
(35, 36, 1, 20, NULL, 'Day', NULL, 0, NULL),
(36, 37, 1, 20, NULL, 'Day', NULL, 0, NULL),
(37, 38, 1, 20, NULL, 'Day', NULL, 0, NULL),
(38, 39, 1, 15, NULL, 'Day', NULL, 0, NULL),
(39, 40, 1, 15, NULL, 'Day', NULL, 0, NULL),
(40, 41, 1, 15, NULL, 'Day', NULL, 0, NULL),
(41, 42, 1, 15, NULL, 'Day', NULL, 0, NULL),
(42, 43, 1, 16, NULL, 'Day', NULL, 0, NULL),
(43, 44, 1, 16, NULL, 'Day', NULL, 0, NULL),
(44, 45, 1, 16, NULL, 'Day', NULL, 0, NULL),
(45, 46, 1, 17, NULL, 'Day', NULL, 0, NULL),
(46, 47, 1, 17, NULL, 'Day', NULL, 0, NULL),
(47, 48, 1, 17, NULL, 'Day', NULL, 0, NULL),
(48, 49, 1, 15, NULL, 'Day', NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_contacts`
--

CREATE TABLE `student_contacts` (
  `contact_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `relationship` varchar(50) NOT NULL,
  `contact_name` varchar(100) NOT NULL,
  `id_number` varchar(50) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `is_primary` tinyint(1) NOT NULL DEFAULT 0,
  `is_guardian` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `student_sponsorships`
--

CREATE TABLE `student_sponsorships` (
  `sponsorship_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `sponsor_name` varchar(200) NOT NULL,
  `coverage_percent` decimal(5,2) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `task_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `module_key` varchar(50) DEFAULT NULL,
  `assigned_to` int(10) UNSIGNED DEFAULT NULL,
  `assigned_by` int(10) UNSIGNED DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `completed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`task_id`, `title`, `description`, `module_key`, `assigned_to`, `assigned_by`, `due_date`, `priority`, `status`, `completed_at`, `created_at`, `updated_at`) VALUES
(3, 'Prepare Term 1 exam timetable', 'Create the examination schedule for all L3-L5 classes', 'academic', 10, NULL, '2026-09-10', 'high', 'pending', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00'),
(4, 'Update student fee payments', 'Reconcile payments received with invoice records', 'finance', 10, NULL, '2026-09-10', 'urgent', 'in_progress', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00'),
(5, 'Library book inventory check', 'Verify all books are accounted for and update catalog', 'library', 10, NULL, '2026-09-10', 'normal', 'pending', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00'),
(6, 'Staff meeting preparation', 'Prepare agenda for monthly staff meeting', 'system-settings', 10, NULL, '2026-09-10', 'normal', 'completed', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00'),
(7, 'Student enrollment records', 'Verify all student records are up to date for Term 1', 'students', 10, NULL, '2026-09-10', 'high', 'completed', '2026-08-27 16:13:47', '2026-08-27 16:11:00', '2026-08-27 16:13:47'),
(8, 'Update course materials list', 'Review and update software development course materials', 'academic', 10, NULL, '2026-09-10', 'normal', 'pending', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00'),
(9, 'Fee collection report', 'Generate monthly fee collection report for Director', 'finance', 10, NULL, '2026-09-10', 'high', 'pending', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00'),
(10, 'Equipment maintenance check', 'Check all computer lab equipment and report issues', 'system-settings', 10, NULL, '2026-09-10', 'low', 'pending', NULL, '2026-08-27 16:11:00', '2026-08-27 16:11:00');

-- --------------------------------------------------------

--
-- Table structure for table `terms`
--

CREATE TABLE `terms` (
  `term_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `term_name` varchar(50) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `terms`
--

INSERT INTO `terms` (`term_id`, `academic_year_id`, `term_name`, `start_date`, `end_date`, `is_current`) VALUES
(1, 1, 'Term 1', '2026-01-05', '2026-04-10', 0),
(2, 1, 'Term 2', '2026-04-27', '2026-08-07', 0),
(3, 1, 'Term 3', '2026-08-24', '2026-12-18', 0),
(4, 2, 'Term 1', '2025-01-06', '2025-04-11', 0),
(5, 2, 'Term 2', '2025-04-28', '2025-08-08', 0),
(6, 2, 'Term 3', '2025-08-25', '2025-12-19', 0);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(10) UNSIGNED NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `avatar_file_id` int(10) UNSIGNED DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `status` enum('active','inactive','locked') NOT NULL DEFAULT 'active',
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password_hash`, `full_name`, `email`, `avatar_file_id`, `phone`, `role_id`, `status`, `last_login_at`, `created_at`, `updated_at`, `deleted_at`) VALUES
(10, 'admin', '$2b$10$xdVPotrZGeUOid0AzWkSKefrMS2UwT.GP8ZkJ3pRnRjVgxScZ2z.O', 'Muhire Caleb', 'admin@intangotss.rw', NULL, '+250788100001', 12, 'active', '2026-08-27 16:13:00', '2026-08-27 16:09:45', '2026-08-27 16:13:00', NULL),
(11, 'thomas_dos', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Thomas Habimana', 'thomas@intangotss.rw', NULL, '+250788100002', 14, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(12, 'jean_registrar', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Jean Mugabo', 'jean@intangotss.rw', NULL, '+250788100003', 15, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(13, 'marie_teacher', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Marie Uwimana', 'marie@intangotss.rw', NULL, '+250788100004', 16, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(14, 'pierre_teacher', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Pierre Nshimiyimana', 'pierre@intangotss.rw', NULL, '+250788100005', 16, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(15, 'grace_accountant', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Grace Mukamana', 'grace@intangotss.rw', NULL, '+250788100006', 18, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(16, 'eric_cashier', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Eric Niyonzima', 'eric@intangotss.rw', NULL, '+250788100007', 19, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(17, 'alice_lib', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Alice Ishimwe', 'alice@intangotss.rw', NULL, '+250788100008', 22, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(18, 'david_hr', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'David Bizimana', 'david@intangotss.rw', NULL, '+250788100009', 21, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL),
(19, 'sarah_discipline', '$2b$10$Ys28w9NF3ZORXJ5KqbWeDe4jmQzNEiXEjXQRquI6.bBF.q0s9FRhi', 'Sarah Nyirahabimana', 'sarah@intangotss.rw', NULL, '+250788100010', 17, 'active', NULL, '2026-08-27 16:09:45', '2026-08-27 16:09:45', NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`year_id`),
  ADD UNIQUE KEY `year_label` (`year_label`);

--
-- Indexes for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD PRIMARY KEY (`audit_id`),
  ADD KEY `idx_audit_user` (`user_id`),
  ADD KEY `idx_audit_entity` (`entity_type`,`entity_id`),
  ADD KEY `idx_audit_created` (`created_at`);

--
-- Indexes for table `books`
--
ALTER TABLE `books`
  ADD PRIMARY KEY (`book_id`),
  ADD KEY `idx_books_title` (`title`),
  ADD KEY `idx_books_author` (`author`),
  ADD KEY `idx_books_category` (`category`);

--
-- Indexes for table `book_transactions`
--
ALTER TABLE `book_transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `book_id` (`book_id`),
  ADD KEY `idx_bt_borrower` (`borrower_type`,`borrower_id`),
  ADD KEY `idx_bt_status` (`status`),
  ADD KEY `idx_bt_due_date` (`due_date`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`class_id`),
  ADD KEY `idx_classes_year` (`academic_year_id`),
  ADD KEY `idx_classes_level` (`level`),
  ADD KEY `idx_classes_trade` (`trade`);

--
-- Indexes for table `fee_items`
--
ALTER TABLE `fee_items`
  ADD PRIMARY KEY (`fee_item_id`),
  ADD UNIQUE KEY `item_name` (`item_name`);

--
-- Indexes for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD PRIMARY KEY (`rate_id`),
  ADD UNIQUE KEY `uq_rate` (`academic_year_id`,`level`,`term_id`,`fee_item_id`),
  ADD KEY `idx_fs_year` (`academic_year_id`),
  ADD KEY `fk_fs_term` (`term_id`),
  ADD KEY `fk_fs_item` (`fee_item_id`);

--
-- Indexes for table `file_uploads`
--
ALTER TABLE `file_uploads`
  ADD PRIMARY KEY (`file_id`),
  ADD KEY `idx_fu_entity` (`entity_type`,`entity_id`),
  ADD KEY `fk_fu_user` (`uploaded_by`);

--
-- Indexes for table `invoices`
--
ALTER TABLE `invoices`
  ADD PRIMARY KEY (`invoice_id`),
  ADD KEY `idx_inv_student` (`student_id`,`academic_year_id`,`term_id`),
  ADD KEY `idx_inv_status` (`status`),
  ADD KEY `idx_inv_year` (`academic_year_id`),
  ADD KEY `fk_inv_term` (`term_id`),
  ADD KEY `fk_inv_item` (`fee_item_id`),
  ADD KEY `fk_inv_creator` (`created_by`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_ll_user` (`user_id`),
  ADD KEY `idx_ll_created` (`created_at`),
  ADD KEY `idx_ll_ip` (`ip_address`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`module_id`),
  ADD UNIQUE KEY `module_key` (`module_key`);

--
-- Indexes for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`otp_id`),
  ADD KEY `idx_otp_user` (`user_id`),
  ADD KEY `idx_otp_expires` (`expires_at`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `idx_pay_invoice` (`invoice_id`),
  ADD KEY `idx_pay_student` (`student_id`),
  ADD KEY `idx_pay_date` (`payment_date`),
  ADD KEY `fk_pay_receiver` (`received_by`);

--
-- Indexes for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`token_id`),
  ADD KEY `idx_rt_user` (`user_id`),
  ADD KEY `idx_rt_token` (`token_hash`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD PRIMARY KEY (`permission_id`),
  ADD UNIQUE KEY `uq_role_module` (`role_id`,`module_key`),
  ADD KEY `idx_rp_module` (`module_key`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`staff_id`),
  ADD UNIQUE KEY `staff_no` (`staff_no`),
  ADD KEY `idx_staff_name` (`full_name`),
  ADD KEY `idx_staff_position` (`staff_position`),
  ADD KEY `idx_staff_status` (`status`),
  ADD KEY `fk_staff_photo` (`photo_file_id`),
  ADD KEY `fk_staff_creator` (`created_by`);

--
-- Indexes for table `staff_academic_years`
--
ALTER TABLE `staff_academic_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_staff_year` (`staff_id`,`academic_year_id`),
  ADD KEY `idx_say_year` (`academic_year_id`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `admission_no` (`admission_no`),
  ADD UNIQUE KEY `national_student_code` (`national_student_code`),
  ADD KEY `idx_students_name` (`first_name`,`last_name`),
  ADD KEY `idx_students_gender` (`gender`),
  ADD KEY `idx_students_status` (`status`),
  ADD KEY `idx_students_district` (`district`),
  ADD KEY `fk_students_photo` (`photo_file_id`),
  ADD KEY `fk_students_creator` (`created_by`);

--
-- Indexes for table `student_academic_records`
--
ALTER TABLE `student_academic_records`
  ADD PRIMARY KEY (`record_id`),
  ADD UNIQUE KEY `uq_student_year` (`student_id`,`academic_year_id`),
  ADD KEY `idx_sar_class` (`class_id`),
  ADD KEY `idx_sar_year` (`academic_year_id`),
  ADD KEY `fk_sar_term` (`term_id`);

--
-- Indexes for table `student_contacts`
--
ALTER TABLE `student_contacts`
  ADD PRIMARY KEY (`contact_id`),
  ADD KEY `idx_sc_student` (`student_id`);

--
-- Indexes for table `student_sponsorships`
--
ALTER TABLE `student_sponsorships`
  ADD PRIMARY KEY (`sponsorship_id`),
  ADD UNIQUE KEY `uq_sponsor_student_year` (`student_id`,`academic_year_id`),
  ADD KEY `fk_sponsor_year` (`academic_year_id`),
  ADD KEY `fk_sponsor_creator` (`created_by`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `idx_tasks_assigned` (`assigned_to`),
  ADD KEY `idx_tasks_status` (`status`),
  ADD KEY `idx_tasks_module` (`module_key`),
  ADD KEY `idx_tasks_priority` (`priority`),
  ADD KEY `fk_tasks_assigner` (`assigned_by`);

--
-- Indexes for table `terms`
--
ALTER TABLE `terms`
  ADD PRIMARY KEY (`term_id`),
  ADD KEY `idx_terms_year` (`academic_year_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_users_role` (`role_id`),
  ADD KEY `idx_users_status` (`status`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `year_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `audit_log`
--
ALTER TABLE `audit_log`
  MODIFY `audit_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `books`
--
ALTER TABLE `books`
  MODIFY `book_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;

--
-- AUTO_INCREMENT for table `book_transactions`
--
ALTER TABLE `book_transactions`
  MODIFY `transaction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `class_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `fee_items`
--
ALTER TABLE `fee_items`
  MODIFY `fee_item_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `fee_structures`
--
ALTER TABLE `fee_structures`
  MODIFY `rate_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=99;

--
-- AUTO_INCREMENT for table `file_uploads`
--
ALTER TABLE `file_uploads`
  MODIFY `file_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `invoices`
--
ALTER TABLE `invoices`
  MODIFY `invoice_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=118;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `log_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `module_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=47;

--
-- AUTO_INCREMENT for table `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `otp_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `payment_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `token_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=54;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `role_permissions`
--
ALTER TABLE `role_permissions`
  MODIFY `permission_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=668;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `staff_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `staff_academic_years`
--
ALTER TABLE `staff_academic_years`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `student_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `student_academic_records`
--
ALTER TABLE `student_academic_records`
  MODIFY `record_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `student_contacts`
--
ALTER TABLE `student_contacts`
  MODIFY `contact_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `student_sponsorships`
--
ALTER TABLE `student_sponsorships`
  MODIFY `sponsorship_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `task_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `terms`
--
ALTER TABLE `terms`
  MODIFY `term_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_log`
--
ALTER TABLE `audit_log`
  ADD CONSTRAINT `fk_audit_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `book_transactions`
--
ALTER TABLE `book_transactions`
  ADD CONSTRAINT `book_transactions_ibfk_1` FOREIGN KEY (`book_id`) REFERENCES `books` (`book_id`) ON DELETE CASCADE;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_classes_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `fee_structures`
--
ALTER TABLE `fee_structures`
  ADD CONSTRAINT `fk_fs_item` FOREIGN KEY (`fee_item_id`) REFERENCES `fee_items` (`fee_item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fs_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fs_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `file_uploads`
--
ALTER TABLE `file_uploads`
  ADD CONSTRAINT `fk_fu_user` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `invoices`
--
ALTER TABLE `invoices`
  ADD CONSTRAINT `fk_inv_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_inv_item` FOREIGN KEY (`fee_item_id`) REFERENCES `fee_items` (`fee_item_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inv_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inv_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_inv_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `fk_ll_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD CONSTRAINT `fk_otp_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`invoice_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pay_receiver` FOREIGN KEY (`received_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_pay_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `fk_rt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `fk_rp_module` FOREIGN KEY (`module_key`) REFERENCES `modules` (`module_key`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rp_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`) ON DELETE CASCADE;

--
-- Constraints for table `staff`
--
ALTER TABLE `staff`
  ADD CONSTRAINT `fk_staff_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_staff_photo` FOREIGN KEY (`photo_file_id`) REFERENCES `file_uploads` (`file_id`) ON DELETE SET NULL;

--
-- Constraints for table `staff_academic_years`
--
ALTER TABLE `staff_academic_years`
  ADD CONSTRAINT `fk_say_staff` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`staff_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_say_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `fk_students_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_students_photo` FOREIGN KEY (`photo_file_id`) REFERENCES `file_uploads` (`file_id`) ON DELETE SET NULL;

--
-- Constraints for table `student_academic_records`
--
ALTER TABLE `student_academic_records`
  ADD CONSTRAINT `fk_sar_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`class_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sar_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sar_term` FOREIGN KEY (`term_id`) REFERENCES `terms` (`term_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sar_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_contacts`
--
ALTER TABLE `student_contacts`
  ADD CONSTRAINT `fk_sc_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE;

--
-- Constraints for table `student_sponsorships`
--
ALTER TABLE `student_sponsorships`
  ADD CONSTRAINT `fk_sponsor_creator` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sponsor_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`student_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sponsor_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `fk_tasks_assignee` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tasks_assigner` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `terms`
--
ALTER TABLE `terms`
  ADD CONSTRAINT `fk_terms_year` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`year_id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
