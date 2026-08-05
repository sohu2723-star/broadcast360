import { NextRequest, NextResponse } from "next/server";

import { verifyUserToken } from "@/lib/user-jwt";
import { AuthService } from "@/services/auth.service";

import {
  cors,
  optionsResponse,
} from "@/lib/cors";


const authService = new AuthService();


export async function OPTIONS() {
  return optionsResponse();
}


export async function PUT(
  request: NextRequest,
) {
  try {

    const token =
      request.cookies.get("user_token")?.value;


    if (!token) {
      return cors(
        NextResponse.json(
          {
            message: "Unauthorized",
          },
          {
            status:401,
          }
        )
      );
    }


    const payload =
      await verifyUserToken(token);


    const body =
      await request.json();


    await authService.changePassword(
      Number(payload.id),
      body.currentPassword,
      body.newPassword,
    );


    return cors(
      NextResponse.json({
        success:true,
        message:
          "Password changed successfully",
      })
    );


  } catch(error){

    const message =
      error instanceof Error
      ? error.message
      : "Password change failed";


    return cors(
      NextResponse.json(
        {
          success:false,
          message,
        },
        {
          status:400,
        }
      )
    );
  }
}