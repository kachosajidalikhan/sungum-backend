const Room = require('../models/roomModel');
const db = require('../config/database');
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

const createRoom = async (req, res) => {
    try {
        // Handle file upload
        upload(req, res, async (err) => {
            if (err) {
                return res.status(400).json({
                    error: err.message || 'Error uploading files'
                });
            }

            // Check if files were uploaded
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    error: 'Please upload at least one image'
                });
            }

            // Get file paths
            const images = req.files.map(file => file.path);

            // Create room data object
            const roomData = {
                ...req.body,
                images: JSON.stringify(images)
            };

            // Save to database
            const result = await Room.create(roomData);
            res.status(201).json({
                message: 'Room created successfully',
                roomId: result.insertId,
                room: {
                    ...roomData,
                    id: result.insertId
                }
            });
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({
            error: 'Failed to create room'
        });
    }
};

const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.getAll();
        res.status(200).json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
};

const getRoomById = async (req, res) => {
    try {
        const { id } = req.params;
        const rooms = await Room.getById(id);
        if (rooms.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }
        res.status(200).json(rooms[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch room' });
    }
};

const updateRoom = async (req, res) => {
    try {
        const { id } = req.params;

        // Get existing room data
        const existingRoom = await Room.getById(id);
        if (existingRoom.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Handle images
        let images;
        if (req.files && req.files.length > 0) {
            // Delete old images
            const oldImages = JSON.parse(existingRoom[0].images || '[]');
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
            // Retain existing images if no new images are uploaded
            images = JSON.parse(existingRoom[0].images || '[]');
        }

        // Prepare updated data
        const data = {
            ...req.body,
            images: JSON.stringify(images)
        };

        // Update room data in database
        await Room.update(id, data);

        res.status(200).json({ message: 'Room updated successfully' });
    } catch (err) {
        console.error('Error updating room:', err);
        res.status(500).json({ error: 'Failed to update room' });
    }
};

const deleteRoom = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch the room data to get associated images
        const room = await Room.getById(id);
        if (room.length === 0) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Parse and delete the associated images
        const images = JSON.parse(room[0].images || '[]');
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

        // Delete the room from the database
        await Room.delete(id);

        res.status(200).json({ message: 'Room and associated images deleted successfully' });
    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({ error: 'Failed to delete room' });
    }
};

const getRoomAvailability = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        // Validate dates
        if (!checkIn || !checkOut) {
            return res.status(400).json({
                error: 'Check-in and check-out dates are required'
            });
        }

        // Format dates and ensure they're valid
        const formattedCheckIn = new Date(checkIn);
        const formattedCheckOut = new Date(checkOut);

        // Validate date order
        if (formattedCheckIn > formattedCheckOut) {
            return res.status(400).json({
                error: 'Check-out date must be after check-in date'
            });
        }

        // Convert to YYYY-MM-DD format
        const checkInDate = formattedCheckIn.toISOString().split('T')[0];
        const checkOutDate = formattedCheckOut.toISOString().split('T')[0];

        console.log('Searching availability:', {
            checkIn: checkInDate,
            checkOut: checkOutDate
        });

        const availableRooms = await Room.getAvailableRooms(checkInDate, checkOutDate);

        res.status(200).json({
            checkIn: checkInDate,
            checkOut: checkOutDate,
            availableRooms: availableRooms,
            totalRooms: availableRooms.length
        });

    } catch (error) {
        console.error('Error checking room availability:', error);
        res.status(500).json({
            error: 'Failed to check room availability'
        });
    }
};

const checkRoomAvailability = async (req, res) => {
    try {
        const { id } = req.params;
        const { checkIn, checkOut } = req.query;

        // Validate dates
        if (!checkIn || !checkOut) {
            return res.status(400).json({
                error: 'Check-in and check-out dates are required'
            });
        }

        // Format dates
        const formattedCheckIn = new Date(checkIn).toISOString().split('T')[0];
        const formattedCheckOut = new Date(checkOut).toISOString().split('T')[0];

        // Check if room exists and get its number
        const [room] = await Room.getById(id);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }

        // Use room.number instead of id for availability check
        const isAvailable = await Room.isRoomAvailable(room.number, formattedCheckIn, formattedCheckOut);

        res.status(200).json({
            roomId: id,
            roomNumber: room.number,
            checkIn: formattedCheckIn,
            checkOut: formattedCheckOut,
            isAvailable,
            message: isAvailable
                ? 'Room is available for the selected dates'
                : 'Room is not available for the selected dates'
        });

    } catch (error) {
        console.error('Error checking room availability:', error);
        res.status(500).json({
            error: 'Failed to check room availability'
        });
    }
};

module.exports = {
    createRoom,
    getAllRooms,
    getRoomById,
    updateRoom,
    deleteRoom,
    getRoomAvailability,
    upload,
    checkRoomAvailability
};
