
import { createWorker } from "tesseract.js";
import path from "path";

export interface PaymentOCRResult {
  transactionId: string | null;
  amount: number | null;
  rawText: string;
}

// =====================================================
// OCR
// =====================================================

export async function readPaymentScreenshot(
  imagePath: string
): Promise<PaymentOCRResult> {
  console.log("OCR START:", imagePath);

  let worker:
    | Awaited<ReturnType<typeof createWorker>>
    | null = null;

  try {
    // =================================================
    // TESSERACT NODE WORKER
    // =================================================

    const workerPath = path.join(
      process.cwd(),
      "node_modules",
      "tesseract.js",
      "src",
      "worker-script",
      "node",
      "index.js"
    );

    console.log(
      "TESSERACT WORKER:",
      workerPath
    );

    worker = await createWorker(
      "eng",
      1,
      {
        workerPath,

        logger: (info) => {
          if (
            info.status === "recognizing text" &&
            typeof info.progress === "number"
          ) {
            console.log(
              `OCR progress: ${Math.round(
                info.progress * 100
              )}%`
            );
          }
        },
      }
    );

    console.log(
      "OCR WORKER CREATED"
    );

    // =================================================
    // RECOGNIZE
    // =================================================

    const result =
      await worker.recognize(imagePath);

    const rawText =
      result.data.text;

    console.log(
      "OCR RAW TEXT:"
    );

    console.log(rawText);

    // =================================================
    // EXTRACT TRANSACTION ID
    // =================================================

    const transactionId =
      extractTransactionId(rawText);

    // =================================================
    // EXTRACT AMOUNT
    // =================================================

    const amount =
      extractAmount(rawText);

    console.log(
      "OCR TRANSACTION ID:",
      transactionId
    );

    console.log(
      "OCR AMOUNT:",
      amount
    );

    return {
      transactionId,
      amount,
      rawText,
    };
  } catch (error) {
    console.error(
      "OCR ERROR:",
      error
    );

    throw error;
  } finally {
    // =================================================
    // TERMINATE WORKER
    // =================================================

    if (worker) {
      try {
        await worker.terminate();

        console.log(
          "OCR WORKER TERMINATED"
        );
      } catch (error) {
        console.error(
          "OCR WORKER TERMINATE ERROR:",
          error
        );
      }
    }
  }
}

// =====================================================
// TRANSACTION ID
// =====================================================

function extractTransactionId(
  text: string
): string | null {
  /*
   * KPay / KBZPay OCR commonly returns a long
   * numeric transaction/reference number.
   *
   * Example:
   *
   * 01004242091273804619
   *
   * We use the LAST 12 digits as the transaction ID.
   */

  const normalized = text
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  console.log(
    "OCR NORMALIZED TEXT:",
    normalized
  );

  /*
   * Find numeric sequences.
   *
   * We require at least 12 digits so that
   * small numbers such as:
   *
   * 15,000
   * 2026
   * 23:23:16
   *
   * are not treated as transaction IDs.
   *
   * Remove commas/spaces before matching.
   */

  const numericCandidates =
    normalized.match(
      /\d[\d\s,]{11,}\d/g
    ) ?? [];

  console.log(
    "OCR TRANSACTION CANDIDATES:",
    numericCandidates
  );

  /*
   * Clean each candidate.
   */

  const cleanedCandidates =
    numericCandidates
      .map((candidate) =>
        candidate.replace(/[^\d]/g, "")
      )
      .filter(
        (candidate) =>
          candidate.length >= 12
      );

  console.log(
    "CLEAN TRANSACTION CANDIDATES:",
    cleanedCandidates
  );

  /*
   * Prefer the longest numeric candidate.
   *
   * For the example:
   *
   * 01004242091273804619
   *
   * length = 20
   */

  if (cleanedCandidates.length === 0) {
    return null;
  }

  const transactionNumber =
    cleanedCandidates.sort(
      (a, b) =>
        b.length - a.length
    )[0];

  /*
   * Use the LAST 12 digits.
   */

  const transactionId =
    transactionNumber.slice(-12);

  console.log(
    "FULL TRANSACTION NUMBER:",
    transactionNumber
  );

  console.log(
    "FINAL TRANSACTION ID (LAST 12):",
    transactionId
  );

  return transactionId;
}


// =====================================================
// AMOUNT
// =====================================================

function extractAmount(
  text: string
): number | null {
  const normalized = text
    .replace(/\r/g, "")
    .replace(/\n+/g, " ")
    .replace(/[ \t]+/g, " ")
    .trim();

  const patterns = [
    /(?:amount|total|paid|payment)\s*[:\-]?\s*([\d,]+(?:\.\d{1,2})?)/i,

    /([\d,]+(?:\.\d{1,2})?)\s*(?:MMK|Ks|KYATS?)/i,
  ];

  for (const pattern of patterns) {
    const match =
      normalized.match(pattern);

    if (match?.[1]) {
      const value =
        Number(
          match[1].replace(/,/g, "")
        );

      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
}
