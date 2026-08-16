import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyUserToken } from "@/lib/user-jwt";

import {
  cors,
  optionsResponse,
} from "@/lib/cors";

import fs from "fs/promises";
import path from "path";

import { readPaymentScreenshot } from "@/lib/ocr/payment-ocr";

// =====================================================
// OPTIONS
// =====================================================

export async function OPTIONS() {
  return optionsResponse();
}

// =====================================================
// POST PAYMENT
// =====================================================

export async function POST(
  request: NextRequest
) {
  let savedFilePath: string | null = null;

  try {
    // =================================================
    // AUTH
    // =================================================

    const token =
      request.cookies.get("user_token")?.value;

    if (!token) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Unauthorized",
          },
          { status: 401 }
        )
      );
    }

    const payload =
      await verifyUserToken(token);

    const userId = Number(payload.id);

    if (
      !Number.isInteger(userId) ||
      userId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message: "Invalid user",
          },
          { status: 401 }
        )
      );
    }

    // =================================================
    // FORM DATA
    // =================================================

    const formData =
      await request.formData();

    const subscriptionIdValue =
      formData.get("subscriptionId");

    const screenshot =
      formData.get("screenshot");

    const subscriptionId =
      Number(subscriptionIdValue);

    if (
      !Number.isInteger(subscriptionId) ||
      subscriptionId <= 0
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid subscription ID",
          },
          { status: 400 }
        )
      );
    }

    // =================================================
    // SCREENSHOT VALIDATION
    // =================================================

    if (!(screenshot instanceof File)) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Payment screenshot is required",
          },
          { status: 400 }
        )
      );
    }

    if (!screenshot.type.startsWith("image/")) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Screenshot must be an image",
          },
          { status: 400 }
        )
      );
    }

    if (
      screenshot.size >
      5 * 1024 * 1024
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Screenshot must be smaller than 5MB",
          },
          { status: 400 }
        )
      );
    }

    // =================================================
    // FIND USER'S SUBSCRIPTION
    // =================================================

    const subscription =
      await prisma.subscription.findFirst({
        where: {
          id: subscriptionId,
          userId,
        },

        include: {
          option: true,
          plan: true,
        },
      });

    if (!subscription) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Subscription not found.",
          },
          { status: 404 }
        )
      );
    }

    // =================================================
    // CHECK SUBSCRIPTION STATUS
    // =================================================

    if (
      subscription.status !==
      "PENDING"
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              `This subscription cannot accept payment because its status is ${subscription.status}.`,
          },
          { status: 409 }
        )
      );
    }

    // =================================================
    // CHECK EXISTING PAYMENT
    // =================================================

    const existingPayment =
      await prisma.payment.findFirst({
        where: {
          subscriptionId:
            subscription.id,
        },
      });

    if (existingPayment) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Payment has already been submitted for this subscription.",
          },
          { status: 409 }
        )
      );
    }

    // =================================================
    // CALCULATE EXPECTED AMOUNT
    // =================================================

    const price =
      Number(subscription.option.price);

    const discount =
      Number(
        subscription.option.discountPercent
      );

    const discountAmount =
      price * (discount / 100);

    const finalPrice =
      price - discountAmount;

    const expectedAmount =
      Math.round(finalPrice);

    // =================================================
    // SAVE SCREENSHOT
    // =================================================

    const bytes =
      await screenshot.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    let extension = "jpg";

    if (
      screenshot.type ===
      "image/png"
    ) {
      extension = "png";
    } else if (
      screenshot.type ===
      "image/webp"
    ) {
      extension = "webp";
    }

    const fileName =
      `payment-${userId}-${subscription.id}-${Date.now()}.${extension}`;

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        "payments"
      );

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      }
    );

    savedFilePath =
      path.join(
        uploadDirectory,
        fileName
      );

    await fs.writeFile(
      savedFilePath,
      buffer
    );

    const screenshotUrl =
      `/uploads/payments/${fileName}`;

    // =================================================
    // OCR
    // =================================================

    console.log(
      "========================================"
    );

    console.log(
      "STARTING PAYMENT OCR"
    );

    console.log(
      "Subscription ID:",
      subscription.id
    );

    console.log(
      "Screenshot:",
      savedFilePath
    );

    console.log(
      "Expected amount:",
      expectedAmount
    );

    console.log(
      "========================================"
    );

    const ocr =
      await readPaymentScreenshot(
        savedFilePath
      );

    console.log(
      "OCR RESULT:",
      ocr
    );

    // =================================================
    // TRANSACTION ID
    // =================================================

    if (!ocr.transactionId) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Could not detect the transaction ID from the screenshot. Please upload a clearer KPay screenshot.",
          },
          { status: 400 }
        )
      );
    }

    // =================================================
    // AMOUNT
    // =================================================

    if (
      ocr.amount === null ||
      ocr.amount === undefined
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Could not detect the payment amount from the screenshot. Please upload a clearer KPay screenshot.",
          },
          { status: 400 }
        )
      );
    }

    // =================================================
    // NORMALIZE TRANSACTION ID
    // =================================================

    const transactionId =
      String(ocr.transactionId)
        .trim()
        .replace(/\s+/g, "");

    if (!transactionId) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid transaction ID detected.",
          },
          { status: 400 }
        )
      );
    }

    // =================================================
    // DUPLICATE TRANSACTION
    // =================================================

    const duplicatePayment =
      await prisma.payment.findUnique({
        where: {
          transactionId,
        },
      });

    if (duplicatePayment) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "This transaction ID has already been used.",
          },
          { status: 409 }
        )
      );
    }

    // =================================================
    // PAYMENT AMOUNT
    // =================================================

    const ocrAmount =
      Math.round(
        Number(ocr.amount)
      );

    console.log(
      "EXPECTED AMOUNT:",
      expectedAmount
    );

    console.log(
      "OCR AMOUNT:",
      ocrAmount
    );

    if (
      !Number.isFinite(ocrAmount)
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "Invalid payment amount detected.",
          },
          { status: 400 }
        )
      );
    }

    if (
      ocrAmount !== expectedAmount
    ) {
      return cors(
        NextResponse.json(
          {
            success: false,
            message:
              "The payment amount does not match the subscription amount.",

            expectedAmount,

            detectedAmount:
              ocrAmount,
          },
          { status: 400 }
        )
      );
    }

    // =================================================
    // CREATE PAYMENT
    // =================================================

    const payment =
      await prisma.payment.create({
        data: {
          subscriptionId:
            subscription.id,

          amount:
            finalPrice,

          currency:
            "MMK",

          method:
            "KPAY",

          screenshotUrl,

          transactionId,

          status:
            "PENDING",
        },
      });

    // =================================================
    // RESPONSE
    // =================================================

    return cors(
      NextResponse.json(
        {
          success: true,

          message:
            "Payment submitted successfully. Your payment is waiting for verification.",

          payment: {
            id:
              payment.id,

            subscriptionId:
              payment.subscriptionId,

            amount:
              payment.amount,

            currency:
              payment.currency,

            method:
              payment.method,

            screenshotUrl:
              payment.screenshotUrl,

            transactionId:
              payment.transactionId,

            status:
              payment.status,

            createdAt:
              payment.createdAt,
          },

          ocr: {
            transactionId:
              transactionId,

            amount:
              ocr.amount,
          },
        },
        { status: 201 }
      )
    );

  } catch (error: unknown) {
    console.error(
      "CREATE PAYMENT ERROR:",
      error
    );

    // =================================================
    // CLEANUP IMAGE
    // =================================================

    if (savedFilePath) {
      try {
        await fs.unlink(
          savedFilePath
        );
      } catch {
        // Ignore cleanup error
      }
    }

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create payment";

    return cors(
      NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 500 }
      )
    );
  }
}