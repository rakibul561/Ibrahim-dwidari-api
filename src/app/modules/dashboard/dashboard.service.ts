
// import config from "../../config";
// import ApiError from "../../errors/apiError";
import prisma from "../../prisma/prisma";
import { ApplicationStatus, ResidencyType } from "@prisma/client";

export const reminders = async () => {
  const now = new Date();

  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(now.getDate() - 3);

  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(now.getDate() - 15);

  // 1️⃣ Callbacks
  const callbacks = await prisma.application.findMany({
    where: {
      status: { in: [ApplicationStatus.PENDING, ApplicationStatus.IN_REVIEW] },
      submittedDate: { lte: threeDaysAgo }
    }
  });

  // 2️⃣ Follow-ups
  const followUps = await prisma.application.findMany({
    where: {
      status: ApplicationStatus.APPROVED,
      updatedAt: { lte: fifteenDaysAgo }
    }
  });

  // 3️⃣ Lease Expirations (example using yearsOfResidence logic)
  const leaseExpirations = await prisma.application.findMany({
    where: {
      status: ApplicationStatus.APPROVED,
      residencyType: ResidencyType.RENT
    }
  });

  // 4️⃣ Service Due (example using co-signer logic as placeholder)
  const serviceDue = await prisma.application.findMany({
    where: {
      status: ApplicationStatus.APPROVED,
      hasCoSigner: true
    }
  });

  return {
    leaseExpirations,
    callbacks,
    followUps,
    serviceDue
  };
};