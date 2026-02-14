
import express from "express";
import { ApplicationController } from "./application.controller";
import validateRequest from "../../middlewares/valideteRequest";
import { applicationValidation } from "./application.validatation";


const router = express.Router();

router.get("/", ApplicationController.getAllAplication);
router.get("/overview", ApplicationController.getOverview);
router.patch('/admin-update/:id',
    validateRequest(applicationValidation.updateSchema),
    ApplicationController.updateApplication
);
router.patch("/:id/status", ApplicationController.updateStatus);
router.get("/:id/download", ApplicationController.downloadApplication);

router.get("/single-application/:id", ApplicationController.getSingleApplication2);
router.get("/:id", ApplicationController.getSingleApplication);
router.post(
    "/personal",
    validateRequest(applicationValidation.applicationZodSchema),
    ApplicationController.createPersonalApplication);
router.post(
    "/business",
    validateRequest(applicationValidation.applicationZodSchema),
    ApplicationController.createBusinessApplication
);


export const ApplicationRoutes = router;
