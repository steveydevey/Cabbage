const pool = require('../database/connection');

class Bookmark {
  // Get all bookmarks
  static async findAll() {
    const query = 'SELECT * FROM bookmarks ORDER BY created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  // Get bookmark by ID
  static async findById(id) {
    const query = 'SELECT * FROM bookmarks WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Create a new bookmark
  static async create(bookmarkData) {
    const { url, title, description } = bookmarkData;
    const query = `
      INSERT INTO bookmarks (url, title, description)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [url, title, description]);
    return result.rows[0];
  }

  // Update an existing bookmark
  static async update(id, bookmarkData) {
    const { url, title, description } = bookmarkData;
    const query = `
      UPDATE bookmarks 
      SET url = $1, title = $2, description = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [url, title, description, id]);
    return result.rows[0];
  }

  // Delete a bookmark
  static async delete(id) {
    const query = 'DELETE FROM bookmarks WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  // Clone a bookmark (create a copy)
  static async clone(id) {
    const original = await this.findById(id);
    if (!original) {
      throw new Error('Bookmark not found');
    }
    
    const clonedData = {
      url: original.url,
      title: `${original.title} (Copy)`,
      description: original.description
    };
    
    return await this.create(clonedData);
  }
}

module.exports = Bookmark; 