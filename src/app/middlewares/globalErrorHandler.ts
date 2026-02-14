/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prisma } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";

const globalErrorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.log("server error", err);

    let statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
    let message = err.message || "Something went wrong!";
    let error: any = err;
    const success = false;

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2002") {
            statusCode = httpStatus.CONFLICT;
            message = "Duplicate key error!";
            error = err.meta;
        } else if (err.code === "P1000") {
            statusCode = httpStatus.BAD_GATEWAY;
            message = "Authentication failed against database server";
            error = err.meta;
        } else if (err.code === "P2003") {
            statusCode = httpStatus.BAD_REQUEST;
            message = "Foreign key constraint failed";
            error = err.message;
        } else if (err.code === "P2025") {
            statusCode = httpStatus.NOT_FOUND;
            message = "No record was found for your query.";
            error = err;
        } else if (err.code === "P2010") {
            statusCode = httpStatus.BAD_REQUEST;
            message =
                "Update operation is too complex. Please reduce nested updates.";
            error = {
                reason: "MongoDB Atlas pipeline limit exceeded",
                details: err.meta?.message || err.message,
            };
        }
    }

    else if (err instanceof Prisma.PrismaClientValidationError) {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation error!";
        error = err.message;
    }

    else if (err?.name === "ZodError") {
        statusCode = httpStatus.BAD_REQUEST;
        message = "Validation Error";
        error = err.issues.map((issue: any) => ({
            field: issue.path.join("."),
            message: issue.message,
        }));
    }

    res.status(statusCode).json({
        success,
        message,
        error,
    });
};

export default globalErrorHandler;