import express from 'express'
import * as DashboardController from './dashboard.controller'
import auth from "../../middlewares/auth";
import { Role } from '@prisma/client';

const router = express.Router();

router.use(auth(Role.ADMIN))

router.get("/calender/reminders", DashboardController.reminders)








export const DashboardRoutes = router