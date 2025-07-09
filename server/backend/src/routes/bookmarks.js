const express = require('express');
const { body, validationResult } = require('express-validator');
const Bookmark = require('../models/Bookmark');

const router = express.Router();

// Validation middleware
const validateBookmark = [
  body('url')
    .isURL()
    .withMessage('URL must be a valid URL')
    .notEmpty()
    .withMessage('URL is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Title must be between 1 and 500 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Description must be less than 5000 characters')
];

// GET /api/bookmarks - Get all bookmarks
router.get('/', async (req, res) => {
  try {
    const bookmarks = await Bookmark.findAll();
    res.json({
      success: true,
      data: bookmarks,
      count: bookmarks.length
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/bookmarks/:id - Get single bookmark
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findById(id);
    
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.json({
      success: true,
      data: bookmark
    });
  } catch (error) {
    console.error('Error fetching bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/bookmarks - Create new bookmark
router.post('/', validateBookmark, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { url, title, description } = req.body;
    const bookmark = await Bookmark.create({ url, title, description });
    
    res.status(201).json({
      success: true,
      data: bookmark,
      message: 'Bookmark created successfully'
    });
  } catch (error) {
    console.error('Error creating bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// PUT /api/bookmarks/:id - Update bookmark
router.put('/:id', validateBookmark, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { url, title, description } = req.body;
    
    const bookmark = await Bookmark.update(id, { url, title, description });
    
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.json({
      success: true,
      data: bookmark,
      message: 'Bookmark updated successfully'
    });
  } catch (error) {
    console.error('Error updating bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// DELETE /api/bookmarks/:id - Delete bookmark
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.delete(id);
    
    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.json({
      success: true,
      data: bookmark,
      message: 'Bookmark deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/bookmarks/:id/clone - Clone bookmark
router.post('/:id/clone', async (req, res) => {
  try {
    const { id } = req.params;
    const clonedBookmark = await Bookmark.clone(id);
    
    res.status(201).json({
      success: true,
      data: clonedBookmark,
      message: 'Bookmark cloned successfully'
    });
  } catch (error) {
    console.error('Error cloning bookmark:', error);
    
    if (error.message === 'Bookmark not found') {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router; 