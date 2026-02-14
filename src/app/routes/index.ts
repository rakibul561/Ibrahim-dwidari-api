import { Router } from "express";
import { ApplicationRoutes } from "../modules/application/application.route";
import { AuthRoutes } from "../modules/auth/auth.route";
import { UserRoutes } from "../modules/user/user.route";

const router = Router();

router.use("/users", UserRoutes);
router.use("/auth", AuthRoutes);
router.use("/applications", ApplicationRoutes);

export default router;
