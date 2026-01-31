import { Request, Response } from 'express';
import User from '../models/User';

export const handleSepayWebhook = async (req: Request, res: Response) => {
    try {
        console.log('Received SePay Webhook:', req.body);

        // Security Check: Verify API Key
        // SePay sends format: "Apikey YOUR_API_KEY"
        const sepayApiKey = process.env.SEPAY_API_KEY; // Fallback to the one shown in screenshot
        const authHeader = req.headers['authorization'];

        if (!authHeader || authHeader !== `Apikey ${sepayApiKey}`) {
            console.warn('Unauthorized Webhook Attempt:', authHeader);
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // SePay payload typically contains:
        // {
        //   "gateway": "MBBank",
        //   "transactionDate": "...",
        //   "accountNumber": "...",
        //   "subAccount": "...",
        //   "transferAmount": 20000,
        //   "transferContent": "MUSA 65b...",
        //   "referenceCode": "...",
        //   "description": "..."
        // }

        const { transferContent, content, description, amount, transferAmount } = req.body;

        // Normalize content and amount
        // Some gateways use 'content', some 'transferContent', some 'description'
        const transactionContent = (transferContent || content || description || '').toString().toUpperCase();
        const transactionAmount = Number(amount || transferAmount || 0);

        // Check format: MUSA_USERID or just MUSA USERID
        // Regex to find "MUSA" followed by ID
        // Assuming ID is standard MongoID (24 hex chars) or just the string we put there
        const match = transactionContent.match(/MUSA\s*[:_]?\s*([a-zA-Z0-9]+)/);

        if (!match) {
            console.log('No matching payment code found in content:', transactionContent);
            return res.json({ success: true, message: 'Ignored: No code found' }); // Return success to acknowledge webhook
        }

        const userId = match[1];

        if (transactionAmount < 10000) { // Example threshold, can be adjusted
            console.log('Amount too small:', transactionAmount);
            return res.json({ success: true, message: 'Ignored: Amount too small' });
        }

        // Find and update user
        const user = await User.findById(userId);
        if (!user) {
            console.log('User not found for ID:', userId);
            return res.json({ success: true, message: 'User not found' });
        }

        // Check if user is already premium and has a valid expiry date
        let newExpiryDate = new Date();
        const now = new Date();

        if (user.isPremium && user.premiumExpiryDate && user.premiumExpiryDate > now) {
            // User is already premium, EXTEND by 30 days
            newExpiryDate = new Date(user.premiumExpiryDate);
            newExpiryDate.setDate(newExpiryDate.getDate() + 30);
            console.log(`Extending Premium for user ${userId} until: ${newExpiryDate.toISOString()}`);
        } else {
            // New subscription or expired, set to 30 days from now
            newExpiryDate.setDate(newExpiryDate.getDate() + 30);
            console.log(`Activating new Premium for user ${userId} until: ${newExpiryDate.toISOString()}`);
        }

        // Activate Premium
        user.isPremium = true;
        user.premiumExpiryDate = newExpiryDate;
        await user.save();

        console.log(`Successfully upgraded user ${userId} (${user.username}) to Premium via SePay.`);

        return res.json({ success: true, message: 'Premium activated' });

    } catch (error) {
        console.error('Error processing webhook:', error);
        return res.status(500).json({ success: false, message: 'Internal Error' });
    }
};
