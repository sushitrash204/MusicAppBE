import { Request, Response } from 'express';
import User from '../models/User';

export const handleSepayWebhook = async (req: Request, res: Response) => {
    try {
        console.log('--- RAW SEPAY WEBHOOK DATA ---');
        console.log('Headers:', JSON.stringify(req.headers));
        console.log('Body:', JSON.stringify(req.body));
        console.log('------------------------------');
        console.log('Received SePay Webhook:', req.body);

        // Security Check: Verify API Key
        // SePay sends format: "Apikey YOUR_API_KEY"
        const sepayApiKey = process.env.SEPAY_API_KEY;
        const authHeader = req.headers['authorization'];

        console.log('--- SePay Webhook Authentication ---');

        // Strict check according to SePay documentation: "Apikey API_KEY_CUA_BAN"
        if (!authHeader || authHeader !== `Apikey ${sepayApiKey}`) {
            console.warn('❌ Unauthorized: Auth header does not match exactly.');
            console.warn('Expected: Apikey [YOUR_KEY]');
            console.warn('Received:', authHeader);
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        console.log('✅ Authentication Successful');

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

        const transactionContent = (transferContent || content || description || '').toString();
        const transactionAmount = Number(amount || transferAmount || 0);

        console.log('Normalized Content:', transactionContent);
        console.log('Transaction Amount:', transactionAmount);

        // Improved Regex: Find "MUSA" (case insensitive) -> optional separator -> exactly 24 hex characters (standard MongoDB ID)
        // This is much safer than just taking any characters.
        const match = transactionContent.match(/MUSA\s*[:_]?\s*([a-fA-F0-9]{24})/i);

        if (!match) {
            console.log('❌ No valid MUSA + 24-char ID found in content:', transactionContent);
            return res.json({ success: true, message: 'Ignored: No valid user ID found' });
        }

        const userId = match[1];
        console.log('✅ Extracted User ID:', userId);

        if (transactionAmount < 1000) { // Accept 1000 and above.
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
