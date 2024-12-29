const bookingRequest = require('../models/eventRequests');
const emailService = require('../utils/emailServices');
const responseHandler = require('../utils/responseHandler');
const db = require('../config/database');
const multer = require('multer');
const path = require('path');

const getAllRequests = async (req, res) => {
    try {
        const requests = await bookingRequest.findAll();
        return responseHandler.success(res, requests, 'Booking requests retrieved successfully');
    } catch (error) {
        console.error('Error fetching booking requests:', error);
        return responseHandler.error(res, 'Failed to fetch booking requests');
    }
};
const confirmRequest = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the booking request
        const request = await bookingRequest.findById(id);
        if (!request) {
            return responseHandler.error(res, 'Booking request not found', 404);
        }

        // Check if booking is already processed
        if (request.status !== 'pending') {
            return responseHandler.error(res, 'Booking request already processed', 400);
        }

        // Update the status to confirmed
        await bookingRequest.updateStatus(id, 'confirmed');

        // Ensure number_of_guests is an integer
        const numberOfGuests = parseInt(request.number_of_guests, 10);
        if (isNaN(numberOfGuests)) {
            return responseHandler.error(res, 'Invalid number of guests', 400);
        }

        // Create payment record with all required fields
        const paymentData = {
            booking_request_id: id,
            event_name: request.event_name,
            booked_by: request.booked_by,
            account_title: request.account_title,
            account_number: request.account_number,
            payment_date: new Date(),
            total_payment: request.total_payment,
            paid_amount: request.paid_amount,
            payment_status: request.paid_amount == request.total_payment ? 'full' : 'partial',
            email: request.email,
            phone: request.phone,
            cnic: request.cnic,
            booking_date: request.booking_date,
            booking_time: request.booking_time,
            number_of_guests: numberOfGuests, // Ensure this is an integer
            menu: request.menu,
            stage: request.stage,
            services: request.services,
            receipt: request.receipt,
            created_at: new Date()
        };

        // Debugging output
        console.log('Payment Data:', paymentData.number_of_guests); // Log the payment data to see the values

        await bookingRequest.createPaymentRecord(paymentData);

        // Send confirmation email
        try {
            await emailService.sendEventConfirmationEmail(request);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
        }

        return responseHandler.success(res, null, 'Booking confirmed successfully');
    } catch (error) {
        console.error('Error confirming booking:', error);
        return responseHandler.error(res, 'Failed to confirm booking');
    }
};
const rejectRequest = async (req, res) => {
    const { id } = req.params;
    try {
        // Find the booking request
        const request = await bookingRequest.findById(id);
        if (!request) {
            return responseHandler.error(res, 'Booking request not found', 404);
        }

        // Check if booking is already processed
        if (request.status !== 'pending') {
            return responseHandler.error(res, 'Booking request already processed', 400);
        }

        // Update the status to rejected
        await bookingRequest.updateStatus(id, 'rejected');

        // Send rejection email
        try {
            await emailService.sendEventRejectionEmail(request);
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Continue even if email fails
        }

        return responseHandler.success(res, null, 'Booking rejected successfully');
    } catch (error) {
        console.error('Error rejecting booking:', error);
        return responseHandler.error(res, 'Failed to reject booking');
    }
};

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/receipts/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Only jpeg, jpg, png, and pdf files are allowed!'));
    }
});

// Add this new controller method
const createRequest = async (req, res) => {
    try {
        const bookingData = {
            event_name: req.body.event_name,
            booked_by: req.body.booked_by,
            account_title: req.body.account_title,
            account_number: req.body.account_number,
            payment_date: new Date(req.body.payment_date),
            total_payment: req.body.total_payment,
            paid_amount: req.body.paid_amount,
            payment_status: req.body.payment_status,
            email: req.body.email,
            phone: req.body.phone,
            cnic: req.body.cnic,
            booking_date: new Date(req.body.booking_date),
            booking_time: req.body.booking_time,
            number_of_guests: parseInt(req.body.number_of_guests, 10),
            menu: req.body.menu,
            stage: req.body.stage,
            services: req.body.services,
            receipt: req.file ? req.file.path : null,
            status: 'pending', // Default status
            created_at: new Date()
        };

        // Validate required fields
        const requiredFields = [
            'event_name', 'booked_by', 'account_title',
            'account_number', 'total_payment', 'email',
            'phone', 'cnic', 'booking_date', 'booking_time',
            'number_of_guests', 'menu', 'stage'
        ];

        for (const field of requiredFields) {
            if (!bookingData[field]) {
                return responseHandler.error(
                    res,
                    `Missing required field: ${field}`,
                    400
                );
            }
        }

        // Validate dates
        if (new Date(bookingData.booking_date) <= new Date()) {
            return responseHandler.error(
                res,
                'Check-in date must be in the future',
                400
            );
        }

        // Create the booking request
        const bookingId = await bookingRequest.create(bookingData);

        // Fetch the created booking for response
        const createdBooking = await bookingRequest.findById(bookingId);

        return responseHandler.success(
            res,
            createdBooking,
            'Booking request created successfully',
            201
        );

    } catch (error) {
        console.error('Error creating booking request:', error);
        return responseHandler.error(
            res,
            'Failed to create booking request'
        );
    }
};

module.exports = {
    getAllRequests,
    confirmRequest,
    rejectRequest,
    createRequest
};