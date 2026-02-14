/* eslint-disable @typescript-eslint/no-explicit-any */

import bcrypt from "bcryptjs";
import prisma from "../../prisma/prisma";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";




const getAllUsers = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search(["name", "email"])
    .sort()
    .fields()
    .paginate();

  const prismaQuery = qb.build();

  const [data, total] = await Promise.all([
    prisma.user.findMany(prismaQuery),
    prisma.user.count({ where: prismaQuery.where }),
  ]);
  return {
    meta: qb.getMeta(total),
    data
  };
};

// New: Get current authenticated user
const getSingleUser = async (userId: string) => {
  return prisma.user.findUnique({
    where: { id: userId },
  });
};

const userUpdateProfile = async (userId: string, payload: any) => {
  const { firstName, lastName, oldPassword, newPassword, email } = payload;


  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const updateData: any = {};


  // update name
  if (firstName || lastName) {
    updateData.firstName = firstName;
    updateData.lastName = lastName;
  }
  if (email) {
    updateData.email = email
  }


  // update password
  if (oldPassword && newPassword) {

    if (!user.password) {
      throw new Error("Password not set for this user");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      throw new Error("Old password is incorrect");
    }

    updateData.password = await bcrypt.hash(newPassword, 10);
  }


  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  return updatedUser;
};

const deleteUser = async (userId: string) => {
  return prisma.user.delete({
    where: { id: userId },
  });
};



export const UserService = {
  getAllUsers,
  getSingleUser,
  userUpdateProfile,
  deleteUser
};