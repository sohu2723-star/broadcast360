export interface PaymentOCRResult {
  transactionId: string | null;
  amount: number | null;
  rawText: string;
}

/**
 * Cloudflare Workers do not run the previous Node/Tesseract worker.
 * Payment submissions now store the screenshot and accept the transaction
 * ID and amount as explicit form fields for subsequent admin verification.
 */
export async function readPaymentScreenshot(
  _imagePath: string,
): Promise<PaymentOCRResult> {
  throw new Error(
    "Automatic payment OCR is unavailable on Cloudflare Workers. Provide the transaction ID and amount in the payment form.",
  );
}
