const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios'); 
require('dotenv').config(); 

const app = express();
const PORT = 3001;

// creds from .env file
const TEXTBEE_API_KEY = process.env.TEXTBEE_API_KEY;
const TEXTBEE_DEVICE_ID = process.env.TEXTBEE_DEVICE_ID;

// checks
app.use(cors()); 
app.use(bodyParser.json()); 
app.use(express.static(__dirname)); 

// The API Endpoint
app.post('/send-sms', async (req, res) => {
    // phone number and message from the front-end
    const { to, message } = req.body;

    const TEXTBEE_URL = `https://api.textbee.dev/api/v1/gateway/devices/${TEXTBEE_DEVICE_ID}/send-sms`;

    // Check if keys are loaded
    if (!TEXTBEE_API_KEY || !TEXTBEE_DEVICE_ID) {
        console.error('[SERVER ERROR] Missing TextBee API Key or Device ID in .env file.');
        return res.status(500).json({ success: false, error: 'Server configuration error.' });
    }

    try {
        console.log(`[Gateway] Attempting to send SMS via TextBee to: ${to}`);

        // Use axios to send the POST request to TextBee's API
        const response = await axios.post(
            TEXTBEE_URL,
            {
                recipients: [to], // TextBee expects an array of numbers
                message: message
            },
            {
                headers: {
                    'x-api-key': TEXTBEE_API_KEY, 
                    'Content-Type': 'application/json'
                }
            }
        );
        
        console.log('[Gateway] Success:', response.data);
        res.json({ success: true, sid: response.data.message_id || 'textbee-sent' });

    } catch (error) {
        console.error('[Gateway] Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to send SMS via TextBee: ' + (error.response ? error.response.data.message : error.message) 
        });
    }
});

//Server Start 
app.listen(PORT, () => {
    console.log(`WhisperNet backend running on http://localhost:${PORT}`);
    console.log(`Visit http://localhost:${PORT}/index.html to start the app.`);
});
