import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { AuthServices } from "./auth.service";
import HttpStatus from "http-status";
import ApiError from "../../errors/apiError";


const login = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthServices.login(req.body);
    const { accessToken, refreshToken } = result;

    res.cookie("accessToken", accessToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    })
    res.cookie("refreshToken", refreshToken, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
    })
    sendResponse(res, {
        statusCode: 201,
        success: true,
        message: "User logged in successfully!",
        data: {
            result
        }
    })
})

const logout = catchAsync(async (req: Request, res: Response) => {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User logged out successfully!",
        data: null
    });
});

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
    await AuthServices.forgotPassword(req.body);

    sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: "Check your email for reset password link!",
        data: null,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
        throw new ApiError(HttpStatus.UNAUTHORIZED, "Reset token is required!");
    }

    await AuthServices.resetPassword(token, req.body);

    sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: "Password reset successfully!",
        data: null,
    });
});


//! note ---> forget password and reset password is not working
//*  forget password (send email to user with reset password link) ----> reset password (verify token and reset password) ---> new password



export const AuthController = {
    login,
    logout,
    forgotPassword,
    resetPassword,
};