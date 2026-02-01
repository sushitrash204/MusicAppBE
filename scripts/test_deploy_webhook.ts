
import axios from 'axios';

async function testWebhook() {
    const url = 'https://musicappbe-9e0b.onrender.com/api/payment/sepay-webhook';
    const apiKey = 'MRMDNWXYVRAXBDIDTJ9QQTVOS1YN2SLBEJEPQFHQWM8KFC16ZRIZU0NTVUAPCC8R';
    const userId = '69774601b21132e08562c1ef'; // ID user lgcute

    try {
        console.log('Sending test webhook to:', url);
        const response = await axios.post(url, {
            transferContent: `MUSA ${userId}`,
            transferAmount: 5000,
            gateway: 'MBBank'
        }, {
            headers: {
                'Authorization': `Apikey ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
        if (error.response) {
            console.error('Error Status:', error.response.status);
            console.error('Error Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error('Request Error:', error.message);
        }
    }
}

testWebhook();
