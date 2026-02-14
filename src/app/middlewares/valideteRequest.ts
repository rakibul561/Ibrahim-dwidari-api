import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

const validateRequest =
    (schema: ZodSchema) =>
        async (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = await schema.parseAsync(req.body);
                next();
            } catch (err) {
                next(err);
            }
        };

export default validateRequest;
