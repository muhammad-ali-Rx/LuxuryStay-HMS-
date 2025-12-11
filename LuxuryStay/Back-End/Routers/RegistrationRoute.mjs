import express from 'express';
import { sendOTP, resendOTP, verifyOTP, checkOTPStatus, completeRegistration } from '../Controller/RegistrationController.mjs';

const router = express.Router();

router.post('/send-otp', sendOTP);
router.post('/resend-otp', resendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/check-otp-status', checkOTPStatus);
router.post('/complete', completeRegistration);

export default router;
