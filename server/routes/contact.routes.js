import express from 'express'
import asyncHandler from '../middleware/asyncHandler.js';
import { sendContactInquiryEmail } from '../utils/email.util.js';
import { ApiError } from '../utils/ApiError.js';

const router = express.Router();

router.post("/", asyncHandler(async (req, res) => {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
        return res.status(400).json({ message: "All fields required" });
    }

    try {
        await sendContactInquiryEmail({ fullName, email, message })

        res.status(200).json({ message: "Message received and sent to administrator." })
    } catch (error) {
        console.error("Failed to send contact inquiry email:", error);
        throw new ApiError(500, "There was an error sending your message. Please try again later.")
    }
}))

export default router;