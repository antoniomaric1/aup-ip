const path = require('path');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mysql = require('mysql2');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// MySQL konekcija
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'knjige_db'
});

connection.connect(err => {
  if (err) {
    console.error('MySQL greška: ', err);
    process.exit(1);
  } else {
    console.log('✅ Povezano s MySQL bazom');

    // Automatsko kreiranje tablice ako ne postoji
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS knjige (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        description TEXT,
        cover_url TEXT,
        year INT
      )
    `;

    connection.query(createTableQuery, (errTable) => {
      if (errTable) {
        console.error('❌ Greška pri kreiranju tablice:', errTable);
      } else {
        console.log('✅ Tablica "knjige" je spremna!');
      }
    });
  }
});

// Import knjiga iz Open Library
const importBooks = async () => {
  try {
    const res = await axios.get('https://openlibrary.org/search.json?q=javascript');
    if (!res.data || !res.data.docs) return;
    const books = res.data.docs.map(item => ({
      title: item.title || 'Nepoznato',
      author: item.author_name ? item.author_name.join(', ') : 'Nepoznato',
      description: item.first_sentence ? (typeof item.first_sentence === 'string' ? item.first_sentence : (item.first_sentence.join ? item.first_sentence.join(' ') : '')) : 'Nema opisa',
      coverUrl: item.cover_i ? `https://covers.openlibrary.org/b/id/${item.cover_i}-M.jpg` : null,
      year: item.first_publish_year || null
    }));

    books.forEach(book => {
      connection.query(
        'SELECT id FROM knjige WHERE title = ? AND author = ?',
        [book.title, book.author],
        (err, results) => {
          if (err) {
            console.error('Greška pri provjeri knjige:', err);
            return;
          }
          if (results.length === 0) {
            connection.query(
              'INSERT INTO knjige (title, author, description, cover_url, year) VALUES (?, ?, ?, ?, ?)',
              [book.title, book.author, book.description, book.coverUrl, book.year],
              err2 => {
                if (err2) console.error('Greška pri spremanju knjige:', err2);
              }
            );
          }
        }
      );
    });

    console.log('✅ Import (OpenLibrary) pokrenut/završen');
  } catch (error) {
    console.error('❌ Greška pri importu knjiga:', error.message || error);
  }
};

// ROUTES

// Dohvat svih knjiga
app.get('/api/knjige', (req, res) => {
  connection.query('SELECT id, title, author, description, cover_url, year FROM knjige', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Paginacija
app.get('/api/knjige/page/:page', (req, res) => {
  const limit = 10;
  const page = parseInt(req.params.page, 10) || 1;
  const offset = (page - 1) * limit;

  connection.query('SELECT SQL_CALC_FOUND_ROWS id, title, author, description, cover_url, year FROM knjige LIMIT ? OFFSET ?', [limit, offset], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    connection.query('SELECT FOUND_ROWS() as total', (err2, totalRes) => {
      if (err2) return res.status(500).json({ error: err2 });
      const totalItems = totalRes[0].total || 0;
      const totalPages = Math.ceil(totalItems / limit);
      res.json({ books: results, totalItems, totalPages });
    });
  });
});

// Pretraga
app.get('/api/knjige/search/:query', (req, res) => {
  const q = `%${req.params.query}%`;
  connection.query('SELECT id, title, author, description, cover_url, year FROM knjige WHERE title LIKE ? OR author LIKE ?', [q, q], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Dodavanje knjige
app.post('/api/knjige', (req, res) => {
  const { title, author, description, cover_url, year } = req.body;
  connection.query('INSERT INTO knjige (title, author, description, cover_url, year) VALUES (?, ?, ?, ?, ?)', [title, author, description, cover_url || null, year || null], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, title, author, description, cover_url, year });
  });
});

// Uređivanje knjige
app.put('/api/knjige/:id', (req, res) => {
  const { id } = req.params;
  const { title, author, description, cover_url, year } = req.body;
  connection.query('UPDATE knjige SET title=?, author=?, description=?, cover_url=?, year=? WHERE id=?', [title, author, description, cover_url || null, year || null, id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id, title, author, description, cover_url, year });
  });
});

// Brisanje knjige
app.delete('/api/knjige/:id', (req, res) => {
  const { id } = req.params;
  connection.query('DELETE FROM knjige WHERE id=?', [id], err => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: 'Knjiga obrisana' });
  });
});

// Catch-all middleware za frontend
app.use((req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Pokreni server
app.listen(PORT, () => {
  console.log(`🚀 Server radi na http://localhost:${PORT}`);
  importBooks();
});