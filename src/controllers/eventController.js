const Event = require('../models/eventModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        // Accept images only
        if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
            req.fileValidationError = 'Only image files are allowed!';
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
}).array('images', 5); // Allow up to 5 images

const createEvent = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ error: err.message || 'Error uploading files' });
            }

            if (!req.files || req.files.length === 0) {
                return res.status(400).json({ error: 'Please upload at least one image' });
            }

            const images = req.files.map(file => file.path);
            const eventData = { ...req.body, images: JSON.stringify(images) };
            const result = await Event.create(eventData);
            res.status(201).json({ message: 'Event created successfully', eventId: result.insertId });
        });
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.getAll();
        res.status(200).json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const events = await Event.getById(id);
        if (events.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json(events[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch event' });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the existing event data
        const existingEvent = await Event.getById(id);
        if (existingEvent.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        let images;

        if (req.files && req.files.length > 0) {
            // Delete old images if new ones are provided
            const oldImages = JSON.parse(existingEvent[0].images || '[]');
            oldImages.forEach((imagePath) => {
                const fullPath = path.join(__dirname, '..', imagePath);
                fs.unlink(fullPath, (err) => {
                    if (err) {
                        console.error(`Failed to delete old image: ${fullPath}`, err);
                    } else {
                        console.log(`Deleted old image: ${fullPath}`);
                    }
                });
            });

            // Save new image paths
            images = req.files.map(file => file.path);
        } else {
            // Retain existing images if no new images are provided
            images = JSON.parse(existingEvent[0].images || '[]');
        }

        // Update the event data
        const data = { ...req.body, images: JSON.stringify(images) };
        await Event.update(id, data);

        res.status(200).json({ message: 'Event updated successfully' });
    } catch (err) {
        console.error('Error updating event:', err);
        res.status(500).json({ error: 'Failed to update event' });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the event data to get associated images
        const event = await Event.getById(id);
        if (event.length === 0) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Parse and delete the associated images
        const images = JSON.parse(event[0].images || '[]');
        images.forEach((imagePath) => {
            const fullPath = path.join(__dirname, '..', imagePath); // Ensure the correct path
            fs.unlink(fullPath, (err) => {
                if (err) {
                    console.error(`Failed to delete image: ${fullPath}`, err);
                } else {
                    console.log(`Deleted image: ${fullPath}`);
                }
            });
        });

        // Delete the event from the database
        await Event.delete(id);

        res.status(200).json({ message: 'Event and associated images deleted successfully' });
    } catch (err) {
        console.error('Error deleting event:', err);
        res.status(500).json({ error: 'Failed to delete event' });
    }
};

const checkEventAvailability = async (req, res) => {
    const { date, time } = req.body;
    console.log(date, time);

    // Validate input
    if (!date || !time) {
        return res.status(500).json({ error: 'date and time are required' });
    }

    // Validate time
    const validTimes = ['Morning', 'Evening'];
    if (!validTimes.includes(time)) {
        return res.status(400).json({ error: 'Time must be Morning or Evening' });
    }

    try {
        // Check availability through the model
        const isAvailable = await Event.isEventAvailable(date, time);
        return res.status(200).json({ available: isAvailable });
    } catch (error) {
        console.error('Error checking event availability:', error);
        return res.status(500).json({ error: 'Failed to check event availability' });;
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    upload,
    checkEventAvailability
};