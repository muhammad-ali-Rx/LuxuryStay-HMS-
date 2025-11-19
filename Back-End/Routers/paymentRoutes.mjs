import express from 'express';
import { 
  getBillingData, 
  updatePaymentStatus, 
  sendInvoice,
  getPaymentStats
} from '../Controller/paymentController.mjs';
import { auth } from '../middleware/auth.mjs';

const router = express.Router();

// All routes are protected
router.get('/billing-data', auth, getBillingData);
router.put('/:id/payment-status', auth, updatePaymentStatus);
router.post('/:id/send-invoice', auth, sendInvoice);
router.get('/stats', auth, getPaymentStats);

export default router;