import express from 'express';
import { handleSepayWebhook } from '../controllers/paymentController';

const router = express.Router();

// Webhook endpoint for SePay
// SePay sends a POST request with transaction details
router.post('/sepay-webhook', handleSepayWebhook);

export default router;
