import { Request } from "express";
import multer from "multer";
import path from "path";

const storage = multer.memoryStorage(); // ✅ only in memory

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype === "text/csv" || path.extname(file.originalname) === ".csv") {
    cb(null, true);
  } else {
    cb(new Error("Only CSV files are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

export const csvFileUpload = { upload };