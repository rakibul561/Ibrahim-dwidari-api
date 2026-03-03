import express from "express";
import validateRequest from "../../middlewares/valideteRequest";
import { ApplicationController } from "./application.controller";
import { applicationValidation } from "./application.validatation";
import { csvFileUpload } from "../../utils/ProcessCsv";
// import { Role } from "@prisma/client";
// import auth from "../../middlewares/auth";

const router = express.Router();
// , auth(Role.ADMIN)
router.get("/exports", ApplicationController.exportAllApplications);

router.post(
  "/uploads-csv",
  csvFileUpload.upload.single("file"), // Multer middleware must come first
  ApplicationController.uploadCSV
);

router.get("/", ApplicationController.getAllAplication);
router.get("/overview", ApplicationController.getOverview);
router.patch(
  "/admin-update/:id",
  validateRequest(applicationValidation.updateSchema),
  ApplicationController.updateApplication,
);
router.patch("/:id/status", ApplicationController.updateStatus);
router.get("/:id/download", ApplicationController.downloadApplication);

// router.get("/single-application/:id", ApplicationController.getSingleApplication2);
router.get("/:id", ApplicationController.getSingleApplication);
router.post(
  "/personal",
  validateRequest(applicationValidation.applicationZodSchema),
  ApplicationController.createPersonalApplication,
);
router.post(
  "/business",
  validateRequest(applicationValidation.applicationZodSchema),
  ApplicationController.createBusinessApplication,
);

export const ApplicationRoutes = router;
