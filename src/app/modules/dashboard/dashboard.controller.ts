import { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import * as DashboardServices  from "./dashboard.service";
import HttpStatus from "http-status";
// import ApiError from "../../errors/apiError";


export const reminders = catchAsync(async (req: Request, res: Response) => {

    const result = await DashboardServices.reminders();
   
    sendResponse(res, {
        statusCode: HttpStatus.OK,
        success: true,
        message: "Successfully retrieve all approved applications",
        data: result
    })
})
