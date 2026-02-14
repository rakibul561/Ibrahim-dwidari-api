import { Role } from "@prisma/client";
import express from "express";
import auth from "../../middlewares/auth";
import { fileUpload } from "../../utils/fileUpload";
import { UserController } from "./user.controller";

const router = express.Router();


router.patch("/profile", auth(Role.ADMIN), fileUpload.upload.single("file"), UserController.userUpdateProfile);

// Get current user (protected)
router.get("/me", auth(Role.ADMIN), UserController.getSingleUser);

// FIND USER BY ID (protected)
router.get("/:id", auth(Role.ADMIN), UserController.getFindUserById);

// GET ALL USERS (protected)
router.get("/", auth(Role.ADMIN), UserController.getAllUsers);

// DELETE USER BY ID (protected)
router.delete("/:id", auth(Role.ADMIN), UserController.deleteUser);




export const UserRoutes = router;