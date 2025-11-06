import axios from 'axios';
import crypto from 'crypto'

export const generateEsewaSignature = ({ total_amount, transaction_uuid, product_code }) => {
    const secretKey = process.env.ESEWA_SECRET_KEY;

    const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`

    const hmac = crypto.createHmac('sha256', secretKey)
    hmac.update(message)

    const signature = hmac.digest('base64')

    return signature
}

// helper function to check status if no response within 5 minutes
export const checkEsewaTransactionStatus = async (transaction_uuid, totalAmount) => {
    try {
        const url = new URL(process.env.ESEWA_STATUS_CHECK_URL);

        url.searchParams.append('product_code', process.env.ESEWA_PRODUCT_CODE);
        url.searchParams.append('total_amount', totalAmount);
        url.searchParams.append('transaction_uuid', transaction_uuid);

        console.log(`Checking eSewa status at URL: ${url.toString()}`);

        const response = await axios.get(url.toString())
        return response.data;
    } catch (error) {
        console.error('eSewa status check API call failed:', error.response ? error.response.data : error.message);
        throw error;
    }
}

