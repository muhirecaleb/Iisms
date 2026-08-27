-- Library Management Tables

-- Books table
CREATE TABLE IF NOT EXISTS books (
  book_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  isbn VARCHAR(20) NULL,
  publisher VARCHAR(255) NULL,
  publication_year INT NULL,
  category VARCHAR(100) NOT NULL,
  total_copies INT NOT NULL DEFAULT 1,
  available_copies INT NOT NULL DEFAULT 1,
  location VARCHAR(100) NULL COMMENT 'Shelf/section location in library',
  description TEXT NULL,
  status ENUM('active', 'retired') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP NULL,
  INDEX idx_books_title (title),
  INDEX idx_books_author (author),
  INDEX idx_books_category (category),
  INDEX idx_books_isbn (isbn)
);

-- Book transactions (borrow/return) table
CREATE TABLE IF NOT EXISTS book_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  borrower_type ENUM('student', 'staff') NOT NULL,
  borrower_id INT NOT NULL COMMENT 'student_id or staff_id',
  borrow_date DATE NOT NULL,
  due_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('borrowed', 'returned', 'overdue', 'lost') NOT NULL DEFAULT 'borrowed',
  notes TEXT NULL,
  issued_by INT NULL COMMENT 'user_id of librarian who issued',
  returned_to INT NULL COMMENT 'user_id of librarian who accepted return',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
  INDEX idx_bt_borrower (borrower_type, borrower_id),
  INDEX idx_bt_status (status),
  INDEX idx_bt_due_date (due_date)
);
