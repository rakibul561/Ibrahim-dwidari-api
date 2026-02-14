
import * as bcrypt from "bcrypt";
import config from "../config";
import prisma from "../prisma/prisma";
import { Role } from "@prisma/client";


interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    phone: string;
}

export const seedAdmin = async () => {
    const payload: IUser = {
        firstName: "Test",
        lastName: "Admin",
        email: config.admin.email as string,
        role: Role.ADMIN,
        phone: "1234567890",

    };
    const hashedPassword = await bcrypt.hash(
        config.admin.password as string, config.salt_rounds as number
    );

    const isExistUser = await prisma.user.findUnique({
        where: {
            email: payload.email,
        },
    });

    if (isExistUser) return;

    const result = await prisma.user.create({
        data: { ...payload, password: hashedPassword },
    });

    console.log(result);
};
