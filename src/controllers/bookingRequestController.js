const bookingRequest = require('../models/bookingRequests');
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

        // Create payment record with all required fields
        const paymentData = {
            booking_request_id: id,
            room_number: request.room_number,
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
            checkin_date: request.checkin_date,
            checkout_date: request.checkout_date,
            receipt: request.receipt,
            created_at: new Date()
        };

        await bookingRequest.createPaymentRecord(paymentData);

        // Send confirmation email
        try {
            await emailService.sendConfirmationEmail(request);
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
            await emailService.sendRejectionEmail(request);
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
            room_number: req.body.room_number,
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
            checkin_date: new Date(req.body.checkin_date),
            checkout_date: new Date(req.body.checkout_date),
            receipt: req.file ? req.file.path : null,
            status: 'pending', // Default status
            created_at: new Date()
        };

        // Validate required fields
        const requiredFields = [
            'room_number', 'booked_by', 'account_title', 
            'account_number', 'total_payment', 'email', 
            'phone', 'cnic', 'checkin_date', 'checkout_date'
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
        if (new Date(bookingData.checkin_date) <= new Date()) {
            return responseHandler.error(
                res, 
                'Check-in date must be in the future', 
                400
            );
        }

        if (bookingData.checkout_date <= bookingData.checkin_date) {
            return responseHandler.error(
                res, 
                'Check-out date must be after check-in date', 
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