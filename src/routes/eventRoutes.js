import express from 'express';
import { createEvent, getEvents, getEventById, updateEvent, deleteEvent } from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js'; // Import authenticateToken as a named export

const router = express.Router();

// @route   POST api/events
// @desc    Create a new event
// @access  Private
router.post('/', authenticateToken, createEvent);

// @route   GET api/events
// @desc    Get all events for a user
// @access  Private
router.get('/', authenticateToken, getEvents);

// @route   GET api/events/:id
// @desc    Get a single event by ID
// @access  Private
router.get('/:id', authenticateToken, getEventById);

// @route   PUT api/events/:id
// @desc    Update an event
// @access  Private
router.put('/:id', authenticateToken, updateEvent);

// @route   DELETE api/events/:id
// @desc    Delete an event
// @access  Private
router.delete('/:id', authenticateToken, deleteEvent);

export default router;