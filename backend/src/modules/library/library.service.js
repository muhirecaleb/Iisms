const db = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/errors');

class LibraryService {
  // ─── Books ──────────────────────────────────────────────
  async listBooks({ page = 1, limit = 20, search, category, status } = {}) {
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    let query = 'FROM books WHERE deleted_at IS NULL';
    const params = [];

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR isbn LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }
    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total ${query}`, params);
    const [rows] = await db.query(
      `SELECT * ${query} ORDER BY title ASC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { data: rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getBook(bookId) {
    const [rows] = await db.query('SELECT * FROM books WHERE book_id = ? AND deleted_at IS NULL', [bookId]);
    if (rows.length === 0) throw new NotFoundError('Book not found');
    return rows[0];
  }

  async createBook(data) {
    const { title, author, isbn, publisher, publicationYear, category, totalCopies, location, description } = data;
    const [result] = await db.query(
      `INSERT INTO books (title, author, isbn, publisher, publication_year, category, total_copies, available_copies, location, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, author, isbn || null, publisher || null, publicationYear || null, category, totalCopies || 1, totalCopies || 1, location || null, description || null]
    );
    return this.getBook(result.insertId);
  }

  async updateBook(bookId, data) {
    await this.getBook(bookId); // ensure exists
    const fields = [];
    const params = [];

    const map = {
      title: 'title', author: 'author', isbn: 'isbn', publisher: 'publisher',
      publicationYear: 'publication_year', category: 'category', totalCopies: 'total_copies',
      location: 'location', description: 'description', status: 'status'
    };

    for (const [key, col] of Object.entries(map)) {
      if (data[key] !== undefined) {
        fields.push(`${col} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return this.getBook(bookId);

    // Adjust available_copies if total_copies changed
    if (data.totalCopies !== undefined) {
      const book = await this.getBook(bookId);
      const borrowed = book.total_copies - book.available_copies;
      const newAvailable = Math.max(0, data.totalCopies - borrowed);
      fields.push('available_copies = ?');
      params.push(newAvailable);
    }

    params.push(bookId);
    await db.query(`UPDATE books SET ${fields.join(', ')} WHERE book_id = ?`, params);
    return this.getBook(bookId);
  }

  async deleteBook(bookId) {
    // Check if there are active borrows
    const [active] = await db.query(
      "SELECT COUNT(*) as cnt FROM book_transactions WHERE book_id = ? AND status = 'borrowed'", [bookId]
    );
    if (active[0].cnt > 0) {
      throw new ValidationError('Cannot delete book with active borrows');
    }
    await db.query('UPDATE books SET deleted_at = NOW() WHERE book_id = ?', [bookId]);
  }

  async getCategories() {
    const [rows] = await db.query(
      "SELECT DISTINCT category FROM books WHERE deleted_at IS NULL AND status = 'active' ORDER BY category"
    );
    return rows.map(r => r.category);
  }

  // ─── Borrowing ──────────────────────────────────────────
  async borrowBook({ bookId, borrowerType, borrowerId, dueDate, notes, issuedBy }) {
    const book = await this.getBook(bookId);
    if (book.available_copies <= 0) {
      throw new ValidationError('No copies available for borrowing');
    }

    // Check if borrower already has this book borrowed
    const [existing] = await db.query(
      "SELECT transaction_id FROM book_transactions WHERE book_id = ? AND borrower_type = ? AND borrower_id = ? AND status = 'borrowed'",
      [bookId, borrowerType, borrowerId]
    );
    if (existing.length > 0) {
      throw new ValidationError('This borrower already has this book borrowed');
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        `INSERT INTO book_transactions (book_id, borrower_type, borrower_id, borrow_date, due_date, notes, issued_by, status)
         VALUES (?, ?, ?, CURDATE(), ?, ?, ?, 'borrowed')`,
        [bookId, borrowerType, borrowerId, dueDate, notes || null, issuedBy || null]
      );

      await conn.query(
        'UPDATE books SET available_copies = available_copies - 1 WHERE book_id = ?',
        [bookId]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    return { message: 'Book borrowed successfully' };
  }

  async returnBook(transactionId, { returnedTo, notes } = {}) {
    const [rows] = await db.query('SELECT * FROM book_transactions WHERE transaction_id = ?', [transactionId]);
    if (rows.length === 0) throw new NotFoundError('Transaction not found');

    const tx = rows[0];
    if (tx.status === 'returned') throw new ValidationError('Book already returned');

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      await conn.query(
        'UPDATE book_transactions SET return_date = CURDATE(), status = ?, returned_to = ?, notes = CONCAT(COALESCE(notes, ""), ?) WHERE transaction_id = ?',
        ['returned', returnedTo || null, notes ? `\nReturn note: ${notes}` : '', transactionId]
      );

      await conn.query(
        'UPDATE books SET available_copies = available_copies + 1 WHERE book_id = ?',
        [tx.book_id]
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    return { message: 'Book returned successfully' };
  }

  async listTransactions({ page = 1, limit = 20, search, status, borrowerType } = {}) {
    page = Number(page);
    limit = Number(limit);
    const offset = (page - 1) * limit;

    let query = `FROM book_transactions bt
      JOIN books b ON bt.book_id = b.book_id
      LEFT JOIN students s ON bt.borrower_type = 'student' AND bt.borrower_id = s.student_id
      LEFT JOIN student_academic_records sar ON bt.borrower_type = 'student' AND bt.borrower_id = sar.student_id
      LEFT JOIN classes cls ON sar.class_id = cls.class_id
      LEFT JOIN staff st ON bt.borrower_type = 'staff' AND bt.borrower_id = st.staff_id
      WHERE 1=1`;
    const params = [];

    if (search) {
      query += ' AND (b.title LIKE ? OR s.first_name LIKE ? OR s.last_name LIKE ? OR s.admission_no LIKE ? OR st.full_name LIKE ? OR st.staff_no LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s, s, s);
    }
    if (status) {
      query += ' AND bt.status = ?';
      params.push(status);
    }
    if (borrowerType) {
      query += ' AND bt.borrower_type = ?';
      params.push(borrowerType);
    }

    const [[{ total }]] = await db.query(`SELECT COUNT(*) as total ${query}`, params);
    const [rows] = await db.query(
      `SELECT bt.*,
        b.title as book_title, b.author as book_author, b.isbn as book_isbn,
        CASE
          WHEN bt.borrower_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
          WHEN bt.borrower_type = 'staff' THEN st.full_name
        END as borrower_name,
        CASE
          WHEN bt.borrower_type = 'student' THEN s.admission_no
          ELSE st.staff_no
        END as borrower_no,
        CASE
          WHEN bt.borrower_type = 'student' THEN cls.class_name
          ELSE st.staff_position
        END as borrower_detail
      ${query}
      ORDER BY bt.created_at DESC LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Left join classes for students
    const enhancedRows = rows.map(r => {
      if (r.borrower_type === 'student') {
        // student detail already joined via class_name
      }
      return r;
    });

    return { data: enhancedRows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getOverdueTransactions() {
    const [rows] = await db.query(
      `SELECT bt.*, b.title as book_title,
        CASE
          WHEN bt.borrower_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
          WHEN bt.borrower_type = 'staff' THEN st.full_name
        END as borrower_name,
        DATEDIFF(CURDATE(), bt.due_date) as days_overdue
      FROM book_transactions bt
      JOIN books b ON bt.book_id = b.book_id
      LEFT JOIN students s ON bt.borrower_type = 'student' AND bt.borrower_id = s.student_id
      LEFT JOIN staff st ON bt.borrower_type = 'staff' AND bt.borrower_id = st.staff_id
      WHERE bt.status = 'borrowed' AND bt.due_date < CURDATE()
      ORDER BY bt.due_date ASC`
    );
    return rows;
  }

  async getDashboard() {
    const [[bookStats]] = await db.query(
      "SELECT COUNT(*) as totalBooks, SUM(total_copies) as totalCopies, SUM(available_copies) as availableCopies FROM books WHERE deleted_at IS NULL AND status = 'active'"
    );
    const [[borrowStats]] = await db.query(
      "SELECT COUNT(*) as activeBorrows FROM book_transactions WHERE status = 'borrowed'"
    );
    const [[overdueStats]] = await db.query(
      "SELECT COUNT(*) as overdue FROM book_transactions WHERE status = 'borrowed' AND due_date < CURDATE()"
    );
    const [topBooks] = await db.query(
      `SELECT b.title, b.author, COUNT(bt.transaction_id) as borrow_count
       FROM books b JOIN book_transactions bt ON b.book_id = bt.book_id
       GROUP BY b.book_id ORDER BY borrow_count DESC LIMIT 5`
    );

    // Category breakdown
    const [categoryBreakdown] = await db.query(
      `SELECT category, COUNT(*) as book_count, SUM(total_copies) as total_copies, SUM(available_copies) as available_copies
       FROM books WHERE deleted_at IS NULL AND status = 'active' GROUP BY category ORDER BY total_copies DESC`
    );

    // Recent transactions
    const [recentTransactions] = await db.query(
      `SELECT bt.*, b.title as book_title,
        CASE
          WHEN bt.borrower_type = 'student' THEN CONCAT(s.first_name, ' ', s.last_name)
          WHEN bt.borrower_type = 'staff' THEN st.full_name
        END as borrower_name
      FROM book_transactions bt
      JOIN books b ON bt.book_id = b.book_id
      LEFT JOIN students s ON bt.borrower_type = 'student' AND bt.borrower_id = s.student_id
      LEFT JOIN staff st ON bt.borrower_type = 'staff' AND bt.borrower_id = st.staff_id
      ORDER BY bt.created_at DESC LIMIT 5`
    );

    // Borrower type breakdown
    const [borrowerBreakdown] = await db.query(
      `SELECT borrower_type, COUNT(*) as count FROM book_transactions WHERE status = 'borrowed' GROUP BY borrower_type`
    );

    // Total transactions
    const [[totalStats]] = await db.query(
      "SELECT COUNT(*) as totalTransactions, SUM(CASE WHEN status = 'returned' THEN 1 ELSE 0 END) as returned FROM book_transactions"
    );

    return {
      totalBooks: bookStats.totalBooks || 0,
      totalCopies: bookStats.totalCopies || 0,
      availableCopies: bookStats.availableCopies || 0,
      activeBorrows: borrowStats.activeBorrows || 0,
      overdue: overdueStats.overdue || 0,
      topBooks,
      categoryBreakdown,
      recentTransactions,
      borrowerBreakdown,
      totalTransactions: totalStats.totalTransactions || 0,
      returned: totalStats.returned || 0,
    };
  }

  // ─── Seed ──────────────────────────────────────────────
  async seedBooks() {
    const books = [
      // Technology / Software Development
      { title: 'Introduction to Algorithms', author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest, Clifford Stein', isbn: '978-0262046305', publisher: 'MIT Press', publication_year: 2022, category: 'Technology', total_copies: 5, location: 'Shelf A1', description: 'Comprehensive introduction to algorithms used in computer science' },
      { title: 'Clean Code', author: 'Robert C. Martin', isbn: '978-0132350884', publisher: 'Prentice Hall', publication_year: 2008, category: 'Technology', total_copies: 4, location: 'Shelf A1', description: 'A handbook of agile software craftsmanship' },
      { title: 'JavaScript: The Good Parts', author: 'Douglas Crockford', isbn: '978-0596517748', publisher: 'OReilly Media', publication_year: 2008, category: 'Technology', total_copies: 3, location: 'Shelf A2', description: 'Unearthing the excellence in JavaScript' },
      { title: 'Python Crash Course', author: 'Eric Matthes', isbn: '978-1593279288', publisher: 'No Starch Press', publication_year: 2022, category: 'Technology', total_copies: 6, location: 'Shelf A2', description: 'A hands-on, project-based introduction to Python' },
      { title: 'Head First Design Patterns', author: 'Eric Freeman, Elisabeth Robson', isbn: '978-1492078005', publisher: 'OReilly Media', publication_year: 2020, category: 'Technology', total_copies: 3, location: 'Shelf A1', description: 'A brain-friendly guide to design patterns' },
      { title: 'Database System Concepts', author: 'Abraham Silberschatz, Henry Korth, S. Sudarshan', isbn: '978-0078022159', publisher: 'McGraw-Hill', publication_year: 2019, category: 'Technology', total_copies: 4, location: 'Shelf A3', description: 'Foundational textbook on database management systems' },
      { title: 'Computer Networking: A Top-Down Approach', author: 'James Kurose, Keith Ross', isbn: '978-0135928608', publisher: 'Pearson', publication_year: 2021, category: 'Technology', total_copies: 3, location: 'Shelf A3', description: 'Comprehensive introduction to computer networking' },
      { title: 'Linux Command Line and Shell Scripting Bible', author: 'Richard Blum, Christine Bresnahan', isbn: '978-1119700913', publisher: 'Wiley', publication_year: 2021, category: 'Technology', total_copies: 3, location: 'Shelf A2', description: 'Master the Linux command line and shell scripting' },
      // Textbooks - Mathematics
      { title: 'Engineering Mathematics', author: 'K.A. Stroud, Dexter Booth', isbn: '978-1352010350', publisher: 'Red Globe Press', publication_year: 2020, category: 'Mathematics', total_copies: 5, location: 'Shelf B1', description: 'Comprehensive mathematics for engineering students' },
      { title: 'Discrete Mathematics and Its Applications', author: 'Kenneth H. Rosen', isbn: '978-1259676512', publisher: 'McGraw-Hill', publication_year: 2019, category: 'Mathematics', total_copies: 4, location: 'Shelf B1', description: 'Essential discrete math for computer science' },
      // Textbooks - Science
      { title: 'Physics for Scientists and Engineers', author: 'Raymond A. Serway, John W. Jewett', isbn: '978-1337553292', publisher: 'Cengage Learning', publication_year: 2018, category: 'Science', total_copies: 4, location: 'Shelf B2', description: 'Standard physics textbook for engineering students' },
      { title: 'Fundamentals of Electric Circuits', author: 'Charles K. Alexander, Matthew N.O. Sadiku', isbn: '978-1259226229', publisher: 'McGraw-Hill', publication_year: 2020, category: 'Science', total_copies: 3, location: 'Shelf B2', description: 'Fundamental principles of electric circuits' },
      // Reference
      { title: 'Oxford Advanced Learners Dictionary', author: 'Diana Lean, Hornby AS', isbn: '978-0194798792', publisher: 'Oxford University Press', publication_year: 2020, category: 'Reference', total_copies: 8, location: 'Shelf C1', description: 'Comprehensive English dictionary for learners' },
      { title: 'Cambridge Advanced English Grammar', author: 'Raymond Murphy', isbn: '978-1316637630', publisher: 'Cambridge University Press', publication_year: 2019, category: 'Reference', total_copies: 5, location: 'Shelf C1', description: 'Advanced English grammar reference' },
      // Literature
      { title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '978-0385474542', publisher: 'Anchor Books', publication_year: 1994, category: 'Literature', total_copies: 6, location: 'Shelf D1', description: 'Classic African literature about pre-colonial Nigeria' },
      { title: 'A Message to My Children', author: 'Jean-Baptiste Habimana', isbn: '978-2360360406', publisher: 'Mediaspaul', publication_year: 2015, category: 'Literature', total_copies: 3, location: 'Shelf D1', description: 'Rwandan literature and cultural heritage' },
      // Fiction
      { title: 'The Alchemist', author: 'Paulo Coelho', isbn: '978-0062315007', publisher: 'HarperOne', publication_year: 2014, category: 'Fiction', total_copies: 5, location: 'Shelf D2', description: 'A fable about following your dreams' },
      { title: 'Half of a Yellow Sun', author: 'Chimamanda Ngozi Adichie', isbn: '978-1400032112', publisher: 'Vintage', publication_year: 2006, category: 'Fiction', total_copies: 4, location: 'Shelf D2', description: 'A novel about the Biafran War in Nigeria' },
      // General / Vocational
      { title: 'Digital Electronics: Principles and Applications', author: 'Roger L. Tokheim', isbn: '978-0073373881', publisher: 'McGraw-Hill', publication_year: 2017, category: 'General', total_copies: 3, location: 'Shelf E1', description: 'Introduction to digital electronics and logic circuits' },
      { title: 'Entrepreneurship: Starting and Growing a Business', author: 'Robert Hisrich, Michael Peters, Dean Shepherd', isbn: '978-1259872990', publisher: 'McGraw-Hill', publication_year: 2017, category: 'General', total_copies: 4, location: 'Shelf E1', description: 'Guide to starting and managing small businesses' },
    ];

    let inserted = 0;
    for (const b of books) {
      // Skip if book with same title already exists
      const [existing] = await db.query('SELECT book_id FROM books WHERE title = ? AND deleted_at IS NULL', [b.title]);
      if (existing.length > 0) continue;

      await db.query(
        `INSERT INTO books (title, author, isbn, publisher, publication_year, category, total_copies, available_copies, location, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [b.title, b.author, b.isbn, b.publisher, b.publication_year, b.category, b.total_copies, b.total_copies, b.location, b.description]
      );
      inserted++;
    }
    return { message: `Seeded ${inserted} books (${books.length - inserted} already existed)`, total: books.length, inserted };
  }
}

module.exports = new LibraryService();
