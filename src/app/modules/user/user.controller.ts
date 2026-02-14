/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { UserService } from "./user.service";

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
    const users = await UserService.getAllUsers(req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "users retrieved successfully",
        data: users
    })
});

// New: Get current authenticated user
const getSingleUser = catchAsync(async (req: Request & { user?: any }, res: Response) => {

    const decodedUser = req.user as any;

    const user = await UserService.getSingleUser(decodedUser.userId);


    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Current user retrieved successfully",
        data: user
    });
});

const getFindUserById = catchAsync(async (req: Request & { user?: any }, res: Response) => {

    const decodedUser = req.user as any;

    const user = await UserService.getSingleUser(decodedUser.userId);


    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Current user retrieved successfully",
        data: user
    });
});


const userUpdateProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
    const decodedUser = req.user as any;;
    const payload = req.body;

    const result = await UserService.userUpdateProfile(decodedUser.userId, payload)

    sendResponse(res, {
        success: true,
        statusCode: 201,
        message: "User profile updated successfully",
        data: result
    });
})



const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const user = await UserService.deleteUser(req.params.id);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "User deleted successfully",
        data: user
    })
});




export const UserController = {
    getAllUsers,
    getSingleUser,
    getFindUserById,
    userUpdateProfile,
    deleteUser

};