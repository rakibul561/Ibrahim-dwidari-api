/* eslint-disable @typescript-eslint/no-unused-vars */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountType } from "@prisma/client";
import axios from "axios";
import httpStatus from "http-status";
import PDFDocument from "pdfkit";
import { v4 as uuidv4 } from "uuid";
import ApiError from "../../errors/apiError";
import prisma from "../../prisma/prisma";
import { base64ToBuffer } from "../../utils/base64ToBuffer";
import { PrismaQueryBuilder } from "../../utils/QueryBuilder";

const createPersonalApplication = async (payload: any) => {
  const result = await prisma.application.create({
    data: {
      ...payload,
      type: AccountType.PERSONAL,
      referenceId: uuidv4(),
    },


  });

  return result;
};

const createBusinessApplication = async (payload: any) => {
  const result = await prisma.application.create({
    data: {
      // ===== REQUIRED PERSONAL ADDRESS (MUST) =====
      address: payload.address,
      city: payload.city,
      state: payload.state,
      zipcode: payload.zipcode,

      // ===== REST OF PAYLOAD =====
      ...payload,

      type: AccountType.BUSINESS,
      referenceId: uuidv4(),
    },


  });

  return result;
};

const getAllAplication = async (query: Record<string, any>) => {
  const qb = new PrismaQueryBuilder(query)
    .filter()
    .search([
      "firstName",
      "lastName",
      "email",
      "referenceId",
      "ssn",
      "taxId",
      "businessName",
    ])
    .dateRange("submittedDate")
    .filterByType()
    .filterByStatus()
    .sort()
    .paginate();

  const prismaQuery = qb.build();

  const applications = await prisma.application.findMany({
    ...prismaQuery,
  });



  const total = await prisma.application.count({
    where: prismaQuery.where,
  });


  const formatted = applications.map((app) => {
    if (app.type === "PERSONAL") {
      return {
        id: app.id,
        referenceId: app.referenceId,
        type: app.type,
        status: app.status,
        submittedDate: app.submittedDate,

        personalInfo: {
          firstName: app.firstName,
          middleName: app.middleName,
          lastName: app.lastName,
          email: app.email,
          phone: app.dayTimePhone,
          dob: app.dateOfBirth,
          ssn: app.ssn,

          driverLicense: app.driverLicenseNumber,
          address: {
            address: app.address,
            city: app.city,
            state: app.state,
            zipcode: app.zipcode,
          },
          residency: {
            type: app.residencyType,
            years: app.yearsOfResidence,
          },
          signature: app.signatureData,
        },

        employmentInfo: {
          status: app.employerStatus,
          employerName: app.employerName,
          address: app.employerAddress,
          city: app.employerCity,
          state: app.employerState,
          zipcode: app.employerZipcode,
          phone: app.employerPhone,
          occupation: app.occupation,
          timeOnJob: app.timeOnJob,
          grossIncome: app.grossAnnualIncome,
          otherIncome: app.otherIncome,
        },
      };
    }

    // BUSINESS
    return {
      id: app.id,
      referenceId: app.referenceId,
      type: app.type,
      status: app.status,
      submittedDate: app.submittedDate,

      ownerInfo: {
        firstName: app.firstName,
        middleName: app.middleName,
        lastName: app.lastName,
        email: app.email,
        phone: app.dayTimePhone,
        dob: app.dateOfBirth,
        ssn: app.ssn,
        driverLicense: app.driverLicenseNumber,
      },

      businessInfo: {
        name: app.businessName,
        dba: app.businessDbaNumber,
        entityType: app.businessEntity,
        taxId: app.taxId,
        incorporation: app.businessIncorporation,
        address: app.businessAddress,
        city: app.businessCity,
        state: app.businessState,
        zipcode: app.businessZipcode,
        phone: app.businessPhone,
        email: app.businessEmail,
        yearsInBusiness: app.yearsInBusiness,
      },

      bankInfo: {
        bankName: app.bankName,
        accountNumber: app.bankAccountNumber,
        routingNumber: app.bankRoutingNumber,
        phone: app.bankPhone,
        branch: app.bankBranchLocation,
        state: app.bankState,
      },

      guarantor: app.hasCoSigner
        ? {
          firstName: app.guarantorFirstName,
          middleName: app.guarantorMiddleName,
          lastName: app.guarantorLastName,
          phone: app.guarantorPhone,
          ssn: app.guarantorSsn,
          dob: app.guarantorDob,
          address: {
            address: app.guarantorAddress,
            city: app.guarantorCity,
            state: app.guarantorState,
            zipcode: app.guarantorZipcode,
          },
          residency: app.guarantorResidency,
        }
        : null,
    };
  });

  return {
    meta: qb.getMeta(total),
    data: formatted,
  };
};


const getSingleApplication = async (id: string) => {
  const app = await prisma.application.findUnique({
    where: { id },
  });

  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }



  //  PERSONAL APPLICATION
  if (app.type === "PERSONAL") {
    return {
      id: app.id,
      referenceId: app.referenceId,
      type: app.type,
      status: app.status,
      submittedDate: app.submittedDate,
      updatedAt: app.updatedAt,

      personalInfo: {
        firstName: app.firstName,
        middleName: app.middleName,
        lastName: app.lastName,
        email: app.email,
        phone: app.dayTimePhone,
        dateOfBirth: app.dateOfBirth,
        ssn: app.ssn,
        driverLicenseNumber: app.driverLicenseNumber,
        signature: app.signatureData,

        address: {
          address: app.address,
          city: app.city,
          state: app.state,
          zipcode: app.zipcode,
        },

        residency: {
          type: app.residencyType,
          years: app.yearsOfResidence,
        },
      },

      employmentInfo: {
        status: app.employerStatus,
        employerName: app.employerName,
        employerAddress: app.employerAddress,
        employerCity: app.employerCity,
        employerState: app.employerState,
        employerZipcode: app.employerZipcode,
        employerPhone: app.employerPhone,
        occupation: app.occupation,
        timeOnJob: app.timeOnJob,
        grossAnnualIncome: app.grossAnnualIncome,
        otherIncome: app.otherIncome,
      },
    };
  }

  //  BUSINESS APPLICATION
  if (app.type === "BUSINESS") {
    return {
      id: app.id,
      referenceId: app.referenceId,
      type: app.type,
      status: app.status,
      submittedDate: app.submittedDate,
      updatedAt: app.updatedAt,

      ownerInfo: {
        firstName: app.firstName,
        middleName: app.middleName,
        lastName: app.lastName,
        email: app.email,
        phone: app.dayTimePhone,
        dateOfBirth: app.dateOfBirth,
        ssn: app.ssn,
        driverLicenseNumber: app.driverLicenseNumber,
      },

      businessInfo: {
        businessName: app.businessName,
        dbaNumber: app.businessDbaNumber,
        entityType: app.businessEntity,
        taxId: app.taxId,
        incorporation: app.businessIncorporation,
        yearsInBusiness: app.yearsInBusiness,

        address: {
          address: app.businessAddress,
          city: app.businessCity,
          state: app.businessState,
          zipcode: app.businessZipcode,
        },

        contact: {
          phone: app.businessPhone,
          email: app.businessEmail,
        },
      },

      bankInfo: {
        bankName: app.bankName,
        accountNumber: app.bankAccountNumber,
        routingNumber: app.bankRoutingNumber,
        phone: app.bankPhone,
        branchLocation: app.bankBranchLocation,
        state: app.bankState,
      },

      guarantor: app.hasCoSigner
        ? {
          firstName: app.guarantorFirstName,
          middleName: app.guarantorMiddleName,
          lastName: app.guarantorLastName,
          phone: app.guarantorPhone,
          ssn: app.guarantorSsn,
          dateOfBirth: app.guarantorDob,

          address: {
            address: app.guarantorAddress,
            city: app.guarantorCity,
            state: app.guarantorState,
            zipcode: app.guarantorZipcode,
          },

          residency: app.guarantorResidencyType,

        }
        : null,
    };
  }

  return null;
};

const getSingleApplication2 = async (id: string) => {
  const app = await prisma.application.findUnique({
    where: { id },
  });

  if (!app) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  return app;
};


const getApplicationOverview = async () => {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    totalApplications,
    pendingReview,
    approvedToday,
    rejected,
  ] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({
      where: {
        status: {
          in: ["PENDING", "IN_REVIEW"],
        },
      },
    }),

    prisma.application.count({
      where: {
        status: "APPROVED",
        updatedAt: {
          gte: todayStart,
          lte: todayEnd,
        },
      },
    }),

    prisma.application.count({
      where: {
        status: "REJECTED",
      },
    }),
  ]);

  return {
    totalApplications,
    pendingReview,
    approvedToday,
    rejected,
  };
};

const updateApplicationStatus = async (
  id: string,
  payload: { status: "IN_REVIEW" | "APPROVED" | "REJECTED" }
) => {
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  // Cannot update final states
  if (
    application.status === "APPROVED" ||
    application.status === "REJECTED"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Application already ${application.status}`
    );
  }

  //  Invalid transition
  if (
    application.status === "PENDING" &&
    payload.status !== "IN_REVIEW"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "PENDING application can only move to IN_REVIEW"
    );
  }

  const updated = await prisma.application.update({
    where: { id },
    data: {
      status: payload.status,
      updatedAt: new Date(),
    },
  });

  return updated;
};

const loadImageFromUrl = async (url: string): Promise<Buffer> => {
  const res = await axios.get(url, {
    responseType: "arraybuffer",
  });
  return Buffer.from(res.data);
};



// Generate PDF for application with 2-column layout (Single Page)
const generateApplicationPdf = async (id: string) => {
  const app = await prisma.application.findUnique({
    where: { id },
  });

  console.log("application service responnse",app)

  if (!app) {
    throw new Error("Application not found");
  }

  const doc = new PDFDocument({ size: "A4", margin: 30 });
  const buffers: any = [];

  doc.on("data", buffers.push.bind(buffers));

  // Layout constants
  const pageWidth = doc.page.width;
  const leftColumn = 40;
  const rightColumn = pageWidth / 2 + 5;
  const columnWidth = (pageWidth - 80) / 2 - 5;

  // Colors
  const primaryColor = "#ebedf2";
  const secondaryColor = "#131414";
  const lightGray = "#f8fafc";
  const borderColor = "#e2e8f0";
  const darkText = "#1e293b";

  // Helper functions (NO PAGE BREAK)
  const drawSectionHeader = (title: string) => {
    const startY = doc.y;

    doc
      .rect(leftColumn, startY, pageWidth - 80, 22)
      .fillAndStroke(lightGray, borderColor);

    doc
      .fontSize(10)
      .fillColor(secondaryColor)
      .font('Helvetica-Bold')
      .text(title, leftColumn + 8, startY + 6, { width: pageWidth - 96 });

    doc.y = startY + 28;
    doc.font('Helvetica');
    doc.fillColor(darkText);
  };

  const drawSignatureSection = (title: string, signatureBase64?: string) => {
    addGroupSpacing();
    drawSectionHeader(title);

    const startY = doc.y;

    doc
      .fontSize(7)
      .fillColor(secondaryColor)
      .font("Helvetica-Bold")
      .text("Signature:", leftColumn, startY);

    doc
      .rect(leftColumn, startY + 12, 200, 50)
      .stroke(borderColor);

    if (signatureBase64) {
      try {
        const imgBuffer = base64ToBuffer(signatureBase64);
        doc.image(imgBuffer, leftColumn + 5, startY + 15, {
          width: 190,
          height: 40,
        });
      } catch (err) {
        doc
          .fontSize(7)
          .fillColor("red")
          .text("Invalid Signature", leftColumn + 5, startY + 30);
      }
    } else {
      doc
        .fontSize(7)
        .fillColor(darkText)
        .text("No signature provided", leftColumn + 5, startY + 30);
    }

    doc.y = startY + 70;
  };

  const drawField = (label: string, value: any, x: number, y: number, width: number) => {
    doc
      .fontSize(7)
      .fillColor(secondaryColor)
      .font('Helvetica-Bold')
      .text(label + ":", x, y, { width: width });

    const valueText = (value || "N/A").toString();
    doc
      .fontSize(7)
      .fillColor(darkText)
      .font('Helvetica')
      .text(valueText, x, y + 9, { width: width });
  };

  const drawTwoColumnFields = (
    label1: string, value1: any,
    label2: string, value2: any
  ) => {
    const currentY = doc.y;

    drawField(label1, value1, leftColumn, currentY, columnWidth);
    drawField(label2, value2, rightColumn, currentY, columnWidth);

    doc.y = currentY + 24;
  };

  const addGroupSpacing = () => {
    doc.y += 8;
  };

  // ---- Logo (TOP-LEFT) ----
  const logoUrl = "https://i.ibb.co.com/CK6PRYtn/Logo.jpg";

  try {
    const logoBuffer = await loadImageFromUrl(logoUrl);
    doc.image(logoBuffer, 35, 25, { width: 90 });
  } catch (err) {
    console.error("Logo load failed", err);
  }

  // ---- Date & Time (TOP-RIGHT) ----
  doc
    .fontSize(8)
    .fillColor("#000")
    .text(new Date(app.submittedDate).toLocaleString(), 0, 30, {
      align: "right",
      width: doc.page.width - 35,
    });

  doc.y = 90;

  // ========== BUSINESS TYPE ==========
  if (app.type === "BUSINESS") {
    drawSectionHeader("Owner Information");

    drawTwoColumnFields("First Name", app.firstName, "Middle Name", app.middleName);
    drawTwoColumnFields("Last Name", app.lastName, "Email", app.email);
    drawTwoColumnFields("Phone", app.dayTimePhone, "Date of Birth",
      app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : "N/A");
    drawTwoColumnFields("SSN", app.ssn ? "***-**-" + app.ssn.slice(-4) : "N/A",
      "Driver License", app.driverLicenseNumber);

    const addrY = doc.y;
    doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
      .text("Address:", leftColumn, addrY, { width: columnWidth });
    doc.fontSize(7).fillColor(darkText).font('Helvetica')
      .text(app.address || "N/A", leftColumn, addrY + 9, { width: columnWidth });

    drawField("City", app.city, rightColumn, addrY, columnWidth);
    doc.y = addrY + 24;

    drawTwoColumnFields("State", app.state, "Zip Code", app.zipcode);
    drawTwoColumnFields("Residency Type", app.residencyType, "", "");

    addGroupSpacing();

    drawSectionHeader("Business Information");

    const bizNameY = doc.y;
    doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
      .text("Business Name:", leftColumn, bizNameY, { width: columnWidth });
    doc.fontSize(7).fillColor(darkText).font('Helvetica')
      .text(app.businessName || "N/A", leftColumn, bizNameY + 9, { width: columnWidth });

    drawField("DBA Number", app.businessDbaNumber, rightColumn, bizNameY, columnWidth);
    doc.y = bizNameY + 24;

    drawTwoColumnFields("Entity Type", app.businessEntity, "Tax ID", app.taxId);
    drawTwoColumnFields("Incorporation", app.businessIncorporation, "Years in Business", app.yearsInBusiness);
    drawTwoColumnFields("Business Phone", app.businessPhone, "Email", app.businessEmail);

    const bizAddrY = doc.y;
    doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
      .text("Business Address:", leftColumn, bizAddrY, { width: columnWidth });
    doc.fontSize(7).fillColor(darkText).font('Helvetica')
      .text(app.businessAddress || "N/A", leftColumn, bizAddrY + 9, { width: columnWidth });

    drawField("City", app.businessCity, rightColumn, bizAddrY, columnWidth);
    doc.y = bizAddrY + 24;

    drawTwoColumnFields("State", app.businessState, "Zip Code", app.businessZipcode);

    addGroupSpacing();

    drawSectionHeader("Bank Information");

    const bankNameY = doc.y;
    doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
      .text("Bank Name:", leftColumn, bankNameY, { width: columnWidth });
    doc.fontSize(7).fillColor(darkText).font('Helvetica')
      .text(app.bankName || "N/A", leftColumn, bankNameY + 9, { width: columnWidth });

    drawField("Account Number", app.bankAccountNumber ? "****" + app.bankAccountNumber.slice(-4) : "N/A",
      rightColumn, bankNameY, columnWidth);
    doc.y = bankNameY + 24;

    drawTwoColumnFields("Routing Number", app.bankRoutingNumber, "Phone", app.bankPhone);
    drawTwoColumnFields("Branch Location", app.bankBranchLocation, "State", app.bankState);

    addGroupSpacing();

    drawSectionHeader("Financial Information");

    drawTwoColumnFields(
      "Gross Annual Income",
      `$${app.grossAnnualIncome?.toLocaleString() || 0}`,
      "Other Income",
      `$${app.otherIncome?.toLocaleString() || 0}`
    );

    if (app.hasCoSigner && app.guarantorFirstName) {
      addGroupSpacing();

      drawSectionHeader("Guarantor Information");

      drawTwoColumnFields("First Name", app.guarantorFirstName, "Middle Name", app.guarantorMiddleName);
      drawTwoColumnFields("Last Name", app.guarantorLastName, "Phone", app.guarantorPhone);
      drawTwoColumnFields(
        "SSN",
        app.guarantorSsn ? "***-**-" + app.guarantorSsn.slice(-4) : "N/A",
        "Date of Birth",
        app.guarantorDob ? new Date(app.guarantorDob).toLocaleDateString() : "N/A"
      );

      const guarAddrY = doc.y;
      doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
        .text("Address:", leftColumn, guarAddrY, { width: columnWidth });
      doc.fontSize(7).fillColor(darkText).font('Helvetica')
        .text(app.guarantorAddress || "N/A", leftColumn, guarAddrY + 9, { width: columnWidth });

      drawField("City", app.guarantorCity, rightColumn, guarAddrY, columnWidth);
      doc.y = guarAddrY + 24;

      drawTwoColumnFields("State", app.guarantorState, "Zip Code", app.guarantorZipcode);
      drawTwoColumnFields("Residency", app.guarantorResidencyType, "", "");
    }
  }

  // ========== PERSONAL TYPE ==========
  if (app.type === "PERSONAL") {
    drawSectionHeader("Signer Details");

    drawTwoColumnFields("First Name", app.firstName, "Middle Name", app.middleName);
    drawTwoColumnFields("Last Name", app.lastName, "Email", app.email);
    drawTwoColumnFields("Phone", app.dayTimePhone, "Date of Birth",
      app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : "N/A");
    drawTwoColumnFields(
      "SSN",
      app.ssn ? "***-**-" + app.ssn.slice(-4) : "N/A",
      "Driver License",
      app.driverLicenseNumber
    );

    const addrY = doc.y;
    doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
      .text("Address:", leftColumn, addrY, { width: columnWidth });
    doc.fontSize(7).fillColor(darkText).font('Helvetica')
      .text(app.address || "N/A", leftColumn, addrY + 9, { width: columnWidth });

    drawField("City", app.city, rightColumn, addrY, columnWidth);
    doc.y = addrY + 24;

    drawTwoColumnFields("State", app.state, "Zip Code", app.zipcode);
    drawTwoColumnFields("Residency Type", app.residencyType, "Years of Residence", app.yearsOfResidence);

    addGroupSpacing();

    drawSectionHeader("Employment Details");

    drawTwoColumnFields("Status", app.employerStatus, "Employer Name", app.employerName);

    const empAddrY = doc.y;
    doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
      .text("Employer Address:", leftColumn, empAddrY, { width: columnWidth });
    doc.fontSize(7).fillColor(darkText).font('Helvetica')
      .text(app.employerAddress || "N/A", leftColumn, empAddrY + 9, { width: columnWidth });

    drawField("City", app.employerCity, rightColumn, empAddrY, columnWidth);
    doc.y = empAddrY + 24;

    drawTwoColumnFields("State", app.employerState, "Zip Code", app.employerZipcode);
    drawTwoColumnFields("Phone", app.employerPhone, "Occupation", app.occupation);
    drawTwoColumnFields("Time On Job", app.timeOnJob, "", "");

    addGroupSpacing();

    drawSectionHeader("Financial Information");

    drawTwoColumnFields(
      "Gross Annual Income",
      `$${app.grossAnnualIncome?.toLocaleString() || 0}`,
      "Other Income",
      `$${app.otherIncome?.toLocaleString() || 0}`
    );

    if (app.businessName) {
      addGroupSpacing();

      drawSectionHeader("Business Details - Self Employed");

      const bizNameY = doc.y;
      doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
        .text("Business Name:", leftColumn, bizNameY, { width: columnWidth });
      doc.fontSize(7).fillColor(darkText).font('Helvetica')
        .text(app.businessName || "N/A", leftColumn, bizNameY + 9, { width: columnWidth });

      drawField("DBA Number", app.businessDbaNumber, rightColumn, bizNameY, columnWidth);
      doc.y = bizNameY + 24;

      drawTwoColumnFields("Entity Type", app.businessEntity, "Tax ID", app.taxId);
      drawTwoColumnFields("Years in Business", app.yearsInBusiness, "", "");
    }

  //   drawSectionHeader("Bank Information");

  //   const bankNameY = doc.y;
  //   doc.fontSize(7).fillColor(secondaryColor).font('Helvetica-Bold')
  //     .text("Bank Name:", leftColumn, bankNameY, { width: columnWidth });
  //   doc.fontSize(7).fillColor(darkText).font('Helvetica')
  //     .text(app.bankName || "N/A", leftColumn, bankNameY + 9, { width: columnWidth });

  //   drawField("Account Number", app.bankAccountNumber ? "****" + app.bankAccountNumber.slice(-4) : "N/A",
  //     rightColumn, bankNameY, columnWidth);
  //   doc.y = bankNameY + 24;

  //   drawTwoColumnFields("Routing Number", app.bankRoutingNumber, "Phone", app.bankPhone);
  //   drawTwoColumnFields("Branch Location", app.bankBranchLocation, "State", app.bankState);
  // }

  // drawSignatureSection(
  //   "Applicant Declaration & Signature",
  //   app.signatureData || "no signature found"
  // );


  // doc.end();




  }


  // ✅ Replace Bank Information section with Co-Applicant Information
drawSectionHeader("Co-Applicant Information");

const coY = doc.y;

// Helper: join full name safely
const coFullName = [
  app.guarantorFirstName,
  app.guarantorMiddleName,
  app.guarantorLastName,
].filter(Boolean).join(" ").trim() || "N/A";

// Helper: mask SSN (show last 4)
const maskedSSN = app.guarantorSsn
  ? "*****" + String(app.guarantorSsn).slice(-4)
  : "N/A";

// Helper: format DOB
const dobText = app.guarantorDob
  ? new Date(app.guarantorDob).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    })
  : "N/A";

// Left column title/value (Name)
doc.fontSize(7).fillColor(secondaryColor).font("Helvetica-Bold")
  .text("Co-Applicant Name:", leftColumn, coY, { width: columnWidth });

doc.fontSize(7).fillColor(darkText).font("Helvetica")
  .text(coFullName, leftColumn, coY + 9, { width: columnWidth });

// Right column: Has Co-signer
drawField(
  "Has Co-Signer",
  app.hasCoSigner ? "Yes" : "No",
  rightColumn,
  coY,
  columnWidth
);

doc.y = coY + 24;

// Contact
drawTwoColumnFields("Phone", app.guarantorPhone || "N/A", "Email", app.guarantorEmail || "N/A");

// Address
drawTwoColumnFields("Address", app.guarantorAddress || "N/A", "City", app.guarantorCity || "N/A");
drawTwoColumnFields("State", app.guarantorState || "N/A", "Zip Code", app.guarantorZipcode || "N/A");

// IDs
drawTwoColumnFields("SSN", maskedSSN, "Driver License", app.guarantorDriverLicense || "N/A");
drawTwoColumnFields("Date of Birth", dobText, "Occupation", app.guarantorOccupation || "N/A");

// Employment
// drawTwoColumnFields("Employer Name", app.guarantorEmployerName || "N/A", "Employment Status", app.guarantorEmployerStatus || "N/A");
// drawTwoColumnFields("Employer Phone", app.guarantorEmployerPhone || "N/A", "Time On Job", app.guarantorTimeOnJob || "N/A");

// Employer Address
// drawTwoColumnFields("Employer Address", app.guarantorEmployerAddress || "N/A", "Employer City", app.guarantorEmployerCity || "N/A");
// drawTwoColumnFields("Employer State", app.guarantorEmployerState || "N/A", "Employer Zip", app.guarantorEmployerZipcode || "N/A");

// Income
drawTwoColumnFields(
  "Gross Annual Income",
  (app.guarantorGrossAnnualIncome ?? app.guarantorGrossAnnualIncome) != null
    ? String(app.guarantorGrossAnnualIncome ?? app.guarantorGrossAnnualIncome)
    : "N/A",
  "",
  ""
);

    addGroupSpacing();
      drawSignatureSection(
    "Applicant Declaration & Signature",
    app.signatureData || "no signature found"
  );




  doc.end();




  return new Promise((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers as any));
    });
    doc.on("error", reject);
  });
};

const updateApplication = async (id: string, data: any) => {
  const result = await prisma.application.update({
    where: { id },
    data: data
  })

  return result
}


export const ApplicationService = {
  createPersonalApplication,
  createBusinessApplication,
  getAllAplication,
  getSingleApplication,
  getApplicationOverview,
  updateApplicationStatus,
  generateApplicationPdf,
  updateApplication,
  getSingleApplication2
};
