import axios from "axios";
import { ApiError } from "./ApiError.js";

const KHALTI_API_BASE_URL = "https://dev.khalti.com/api";

export const initiateKhaltiRefund = async (transactionId) => {
  const refundUrl = `${KHALTI_API_BASE_URL}/v2/merchant-transaction/${transactionId}/refund/`;

  try {
    console.log(
      `Initiating Khalti refund for transaction_id: ${transactionId}`
    );

    const headers = {
      Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      "Content-Type": "application/json",
    };

    const response = await axios.post(refundUrl, {}, { headers });

    if (
      response.data &&
      response.data.detail === "Transaction refund successful."
    ) {
      console.log("Khalti refund successful:", response.data);
      return {
        success: true,
        message: "Refund processed successfully via Khalti.",
      };
    } else {
      console.error(
        "Khalti refund failed with unexpected response:",
        response.data
      );
      return {
        success: false,
        message: response.data.detail || "Khalti refund failed.",
      };
    }
  } catch (error) {
    console.error(
      "Error during Khalti refund API call:",
      error.response ? error.response.data : error.message
    );
    const errorMessage =
      error.response?.data?.detail ||
      "Failed to communicate with Khalti for refund.";
    throw new ApiError(502, errorMessage);
  }
};
