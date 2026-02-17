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

  const [totalApplications, pendingReview, approvedToday, rejected] =
    await Promise.all([
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
  payload: { status: "IN_REVIEW" | "APPROVED" | "REJECTED" },
) => {
  const application = await prisma.application.findUnique({
    where: { id },
  });

  if (!application) {
    throw new ApiError(httpStatus.NOT_FOUND, "Application not found");
  }

  // Cannot update final states
  if (application.status === "APPROVED" || application.status === "REJECTED") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Application already ${application.status}`,
    );
  }

  //  Invalid transition
  if (application.status === "PENDING" && payload.status !== "IN_REVIEW") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "PENDING application can only move to IN_REVIEW",
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

const generateApplicationPdf = async (id: string) => {
  const app = await prisma.application.findUnique({
    where: { id },
  });

  console.log("application service responnse", app);

  if (!app) {
    throw new Error("Application not found");
  }

  // ✅ STEP 1: First render everything to measure actual content height
  // We'll use a two-pass approach: first pass to measure, second pass to render scaled

  const buffers: any[] = [];

  // ✅ KEY FIX: Don't scale the doc itself. Instead, use a smaller margin + font size
  // to fit everything naturally into 1 page. PDFKit's scale() affects coordinates
  // but doesn't shrink the page — causing blank space below.

  const doc = new PDFDocument({
    size: "A4",
    margin: 0,
    autoFirstPage: true,
  });

  doc.on("data", buffers.push.bind(buffers));

  // Layout constants (slightly tightened to fit in 1 page)
  const pageWidth = doc.page.width; // 595.28
  const pageHeight = doc.page.height; // 841.89
  const MARGIN = 30;
  const leftColumn = MARGIN;
  const rightColumn = pageWidth / 2 + 5;
  const columnWidth = (pageWidth - MARGIN * 2) / 2 - 5;

  // Colors
  const primaryColor = "#ebedf2";
  const secondaryColor = "#131414";
  const lightGray = "#f8fafc";
  const borderColor = "#e2e8f0";
  const darkText = "#1e293b";

  // ✅ TIGHTER spacing helpers to fit in 1 page
  const FIELD_HEIGHT = 20; // was 24
  const SECTION_HEIGHT = 24; // section header height
  const GROUP_SPACING = 5; // was 8

  const drawSectionHeader = (title: string) => {
    const startY = doc.y;
    doc
      .rect(leftColumn, startY, pageWidth - MARGIN * 2, 20)
      .fillAndStroke(lightGray, borderColor);
    doc
      .fontSize(9)
      .fillColor(secondaryColor)
      .font("Helvetica-Bold")
      .text(title, leftColumn + 8, startY + 5, {
        width: pageWidth - MARGIN * 2 - 16,
      });
    doc.y = startY + 24;
    doc.font("Helvetica");
    doc.fillColor(darkText);
  };

  const addGroupSpacing = () => {
    doc.y += GROUP_SPACING;
  };

  const drawField = (
    label: string,
    value: any,
    x: number,
    y: number,
    width: number,
  ) => {
    doc
      .fontSize(6.5)
      .fillColor(secondaryColor)
      .font("Helvetica-Bold")
      .text(label + ":", x, y, { width });
    const valueText = (value || "N/A").toString();
    doc
      .fontSize(6.5)
      .fillColor(darkText)
      .font("Helvetica")
      .text(valueText, x, y + 8, { width });
  };

  const drawTwoColumnFields = (
    label1: string,
    value1: any,
    label2: string,
    value2: any,
  ) => {
    const currentY = doc.y;
    drawField(label1, value1, leftColumn, currentY, columnWidth);
    if (label2) drawField(label2, value2, rightColumn, currentY, columnWidth);
    doc.y = currentY + FIELD_HEIGHT;
  };

  // ✅ FIXED signature section - no addPage(), tight layout
  const drawTwoSignatureFlex = (
    leftTitle: string,
    leftSig?: string,
    rightTitle?: string,
    rightSig?: string,
  ) => {
    addGroupSpacing();

    const gap = 10;
    const boxWidth = (pageWidth - MARGIN * 2 - gap) / 2;
    const boxHeight = 65;
    const startY = doc.y;
    const x1 = leftColumn;
    const x2 = leftColumn + boxWidth + gap;

    // Draw section header spanning full width
    doc
      .rect(leftColumn, startY, pageWidth - MARGIN * 2, 18)
      .fillAndStroke(lightGray, borderColor);
    doc
      .fontSize(9)
      .fillColor(secondaryColor)
      .font("Helvetica-Bold")
      .text("Signatures", leftColumn + 8, startY + 4, {
        width: pageWidth - MARGIN * 2 - 16,
      });

    const boxStartY = startY + 22;

    const drawOne = (
      title: string,
      sigBase64: string | undefined,
      x: number,
    ) => {
      // Box border
      doc.rect(x, boxStartY, boxWidth, boxHeight).stroke(borderColor);
      // Title
      doc
        .fontSize(7.5)
        .fillColor(secondaryColor)
        .font("Helvetica-Bold")
        .text(title, x + 6, boxStartY + 5, { width: boxWidth - 12 });
      // "Signature:" label
      doc
        .fontSize(6.5)
        .fillColor(secondaryColor)
        .font("Helvetica-Bold")
        .text("Signature:", x + 6, boxStartY + 18);
      // Signature image area
      const sigBoxY = boxStartY + 28;
      const sigBoxH = boxHeight - 32;
      doc.rect(x + 6, sigBoxY, boxWidth - 12, sigBoxH).stroke(borderColor);

      if (sigBase64) {
        try {
          const imgBuffer = base64ToBuffer(sigBase64);
          doc.image(imgBuffer, x + 8, sigBoxY + 2, {
            width: boxWidth - 16,
            height: sigBoxH - 4,
          });
        } catch (err) {
          doc
            .fontSize(6.5)
            .fillColor("red")
            .font("Helvetica")
            .text("Invalid Signature", x + 10, sigBoxY + sigBoxH / 2 - 3);
        }
      } else {
        doc
          .fontSize(6.5)
          .fillColor(darkText)
          .font("Helvetica")
          .text("No signature provided", x + 10, sigBoxY + sigBoxH / 2 - 3);
      }
    };

    drawOne(leftTitle, leftSig, x1);
    drawOne(rightTitle || "", rightSig, x2);

    // ✅ Set doc.y to exactly after signature box — no extra space
    doc.y = boxStartY + boxHeight + 5;
  };

  // ---- Logo (TOP-LEFT) ----
  const logoUrl = "https://i.ibb.co.com/CK6PRYtn/Logo.jpg";
  try {
    const logoBuffer = await loadImageFromUrl(logoUrl);
    doc.image(logoBuffer, MARGIN, 20, { width: 80 });
  } catch (err) {
    console.error("Logo load failed", err);
  }

  // ---- Date & Time (TOP-RIGHT) ----
  doc
    .fontSize(7.5)
    .fillColor("#000")
    .text(new Date(app.submittedDate).toLocaleString(), 0, 25, {
      align: "right",
      width: doc.page.width - MARGIN,
    });

  doc.y = 80;

  if (app.type === "BUSINESS") {
    // =========================
    // Owner Information
    // =========================
    drawSectionHeader("Owner Information");

    drawTwoColumnFields(
      "First Name",
      app.firstName || "N/A",
      "Middle Name",
      app.middleName || "N/A",
    );
    drawTwoColumnFields(
      "Last Name",
      app.lastName || "N/A",
      "Email",
      app.email || "N/A",
    );

    drawTwoColumnFields(
      "Phone",
      app.dayTimePhone || "N/A",
      "Date of Birth",
      app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : "N/A",
    );

    drawTwoColumnFields(
      "SSN",
      app.ssn ? "***-**-" + String(app.ssn).slice(-4) : "N/A",
      "Driver License",
      app.driverLicenseNumber || "N/A",
    );

    const addrY = doc.y;
    drawField("Address", app.address || "N/A", leftColumn, addrY, columnWidth);
    drawField("City", app.city || "N/A", rightColumn, addrY, columnWidth);
    doc.y = addrY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "State",
      app.state || "N/A",
      "Zip Code",
      app.zipcode || "N/A",
    );

    // ✅ ADDED (you wanted these values in PDF)
    drawTwoColumnFields(
      "Residency Type",
      app.residencyType || "N/A",
      "Years of Residence",
      app.yearsOfResidence != null ? String(app.yearsOfResidence) : "N/A",
    );

    drawTwoColumnFields(
      "Rent / Mortgage Payment",
      app.rentMortgagePayment != null
        ? `$${Number(app.rentMortgagePayment).toLocaleString()}`
        : "N/A",
      "",
      "",
    );

    addGroupSpacing();

    // =========================
    // Business Information
    // =========================
    drawSectionHeader("Business Information");

    const bizNameY = doc.y;
    drawField(
      "Business Name",
      app.businessName || "N/A",
      leftColumn,
      bizNameY,
      columnWidth,
    );
    drawField(
      "DBA Number",
      app.businessDbaNumber || "N/A",
      rightColumn,
      bizNameY,
      columnWidth,
    );
    doc.y = bizNameY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "Entity Type",
      app.businessEntity || "N/A",
      "Tax ID",
      app.taxId || "N/A",
    );

    drawTwoColumnFields(
      "Incorporation",
      app.businessIncorporation || "N/A",
      "Years in Business",
      app.yearsInBusiness != null ? String(app.yearsInBusiness) : "N/A",
    );

    drawTwoColumnFields(
      "Business Phone",
      app.businessPhone || "N/A",
      "Email",
      app.businessEmail || "N/A",
    );

    const bizAddrY = doc.y;
    drawField(
      "Business Address",
      app.businessAddress || "N/A",
      leftColumn,
      bizAddrY,
      columnWidth,
    );
    drawField(
      "City",
      app.businessCity || "N/A",
      rightColumn,
      bizAddrY,
      columnWidth,
    );
    doc.y = bizAddrY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "State",
      app.businessState || "N/A",
      "Zip Code",
      app.businessZipcode || "N/A",
    );
    addGroupSpacing();

    // =========================
    // Bank Information
    // =========================
    drawSectionHeader("Bank Information");

    const bankNameY = doc.y;
    drawField(
      "Bank Name",
      app.bankName || "N/A",
      leftColumn,
      bankNameY,
      columnWidth,
    );

    drawField(
      "Account Number",
      app.bankAccountNumber
        ? "****" + String(app.bankAccountNumber).slice(-4)
        : "N/A",
      rightColumn,
      bankNameY,
      columnWidth,
    );
    doc.y = bankNameY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "Routing Number",
      app.bankRoutingNumber || "N/A",
      "Phone",
      app.bankPhone || "N/A",
    );

    // branch loaction

    drawTwoColumnFields(
      "Branch Location",
      app.bankBranchLocation || "N/A",
      "State",
      app.bankState || "N/A",
    );

    addGroupSpacing();

    drawSectionHeader("Guarantor Information");
    drawTwoColumnFields(
      "firstName",
      app.firstName || "N/A",
      "middleName",
      app.middleName || "N/A",
    );
    drawTwoColumnFields(
      "city",
      app.city || "N/A",
      "address",
      app.address || "N/A",
    );
    drawTwoColumnFields(
      "state",
      app.state || "N/A",
      "zipcode",
      app.zipcode || "N/A",
    );
    drawTwoColumnFields(
      "email",
      app.email || "N/A",
      "dayTimePhone",
      app.dayTimePhone || "N/A",
    );
    drawTwoColumnFields(
      "driverLicenseNumber",
      app.driverLicenseNumber || "N/A",
      "ssn",
      app.ssn || "N/A",
    );
    drawTwoColumnFields(
      "residencyType",
      app.residencyType || "N/A",
      "yearsOfResidence",
      app.yearsOfResidence || "N/A",
    );
    drawTwoColumnFields(
      "rentMortgagePayment",
      app.rentMortgagePayment || "N/A",
      "dateOfBirth",
      app.dateOfBirth || "N/A",
    );

    if (app.signatureData) {
      addGroupSpacing();
      drawSectionHeader("Applicant Declaration & Signature");

      const sigY = doc.y;

      doc
        .fontSize(6.5)
        .fillColor(secondaryColor)
        .font("Helvetica-Bold")
        .text("Signature:", leftColumn, sigY);

      doc.rect(leftColumn, sigY + 10, 220, 42).stroke(borderColor);

      try {
        const imgBuffer = base64ToBuffer(app.signatureData);
        doc.image(imgBuffer, leftColumn + 5, sigY + 12, {
          width: 210,
          height: 38,
        });
      } catch {
        doc
          .fontSize(6.5)
          .fillColor("red")
          .font("Helvetica")
          .text("Invalid Signature", leftColumn + 5, sigY + 26);
      }

      doc.y = sigY + 60;
    }
  }

  // ========== PERSONAL TYPE ==========
  if (app.type === "PERSONAL") {
    // =========================
    // Signer Details
    // =========================
    drawSectionHeader("Signer Details");

    drawTwoColumnFields(
      "First Name",
      app.firstName,
      "Middle Name",
      app.middleName,
    );
    drawTwoColumnFields("Last Name", app.lastName, "Email", app.email);

    drawTwoColumnFields(
      "Phone",
      app.dayTimePhone,
      "Date of Birth",
      app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : "N/A",
    );

    drawTwoColumnFields(
      "SSN",
      app.ssn ? "***-**-" + String(app.ssn).slice(-4) : "N/A",
      "Driver License",
      app.driverLicenseNumber,
    );

    const addrY = doc.y;
    drawField("Address", app.address, leftColumn, addrY, columnWidth);
    drawField("City", app.city, rightColumn, addrY, columnWidth);
    doc.y = addrY + FIELD_HEIGHT;

    drawTwoColumnFields("State", app.state, "Zip Code", app.zipcode);
    drawTwoColumnFields(
      "Residency Type",
      app.residencyType,
      "Years of Residence",
      app.yearsOfResidence,
    );
    addGroupSpacing();

    // =========================
    // Employment Details
    // =========================
    drawSectionHeader("Employment Details");

    drawTwoColumnFields(
      "Status",
      app.employerStatus,
      "Employer Name",
      app.employerName,
    );

    const empAddrY = doc.y;
    drawField(
      "Employer Address",
      app.employerAddress,
      leftColumn,
      empAddrY,
      columnWidth,
    );
    drawField("City", app.employerCity, rightColumn, empAddrY, columnWidth);
    doc.y = empAddrY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "State",
      app.employerState,
      "Zip Code",
      app.employerZipcode,
    );
    drawTwoColumnFields(
      "Phone",
      app.employerPhone,
      "Occupation",
      app.occupation,
    );
    // drawTwoColumnFields("Time On Job", app.timeOnJob, "", "");
    addGroupSpacing();

    drawTwoColumnFields(
      "Gross Annual Income",
      `$${app.grossAnnualIncome?.toLocaleString() || 0}`,
      "Other Income",
      `$${app.otherIncome?.toLocaleString() || 0}`,
    );
    drawTwoColumnFields("Time On Job", app.timeOnJob, "", "");

    // =========================
    // Business Details (Self Employed)
    // =========================
    if (app.businessName) {
      addGroupSpacing();
      drawSectionHeader("Business Details - Self Employed");

      const bizNameY = doc.y;
      drawField(
        "Business Name",
        app.businessName,
        leftColumn,
        bizNameY,
        columnWidth,
      );
      drawField(
        "DBA Number",
        app.businessDbaNumber,
        rightColumn,
        bizNameY,
        columnWidth,
      );
      doc.y = bizNameY + FIELD_HEIGHT;

      drawTwoColumnFields(
        "Entity Type",
        app.businessEntity,
        "Tax ID",
        app.taxId,
      );
      drawTwoColumnFields("Years in Business", app.yearsInBusiness, "", "");
    }

    // =========================
    // Co-Applicant Information
    // =========================
    addGroupSpacing();
    drawSectionHeader("Co-Applicant Information");

    const coY = doc.y;
    const coFullName =
      [app.guarantorFirstName, app.guarantorMiddleName, app.guarantorLastName]
        .filter(Boolean)
        .join(" ")
        .trim() || "N/A";

    const maskedCoSSN = app.guarantorSsn
      ? "***-**-" + String(app.guarantorSsn).slice(-4)
      : "N/A";

    const coDobText = app.guarantorDob
      ? new Date(app.guarantorDob).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "N/A";

    drawField("Co-Applicant Name", coFullName, leftColumn, coY, columnWidth);
    drawField(
      "Has Co-Signer",
      app.hasCoSigner ? "Yes" : "No",
      rightColumn,
      coY,
      columnWidth,
    );
    doc.y = coY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "Phone",
      app.guarantorPhone || "N/A",
      "Email",
      app.guarantorEmail || "N/A",
    );
    drawTwoColumnFields(
      "Address",
      app.guarantorAddress || "N/A",
      "City",
      app.guarantorCity || "N/A",
    );
    drawTwoColumnFields(
      "State",
      app.guarantorState || "N/A",
      "Zip Code",
      app.guarantorZipcode || "N/A",
    );
    drawTwoColumnFields(
      "SSN",
      maskedCoSSN,
      "Driver License",
      app.guarantorDriverLicense || "N/A",
    );
    drawTwoColumnFields(
      "Date of Birth",
      coDobText,
      "Occupation",
      app.guarantorOccupation || "N/A",
    );

    drawTwoColumnFields(
      "Gross Annual Income",
      app.guarantorGrossAnnualIncome != null
        ? `$${Number(app.guarantorGrossAnnualIncome).toLocaleString()}`
        : "N/A",
      "",
      "",
    );

    // =========================
    // Co-Applicant Employment Details
    // =========================
    addGroupSpacing();
    drawSectionHeader("Co-Applicant Information - Employment Details");

    drawTwoColumnFields(
      "Employer Status",
      app.guarantorEmployerStatus || "N/A",
      "Employer Name",
      app.guarantorEmployerName || "N/A",
    );

    drawTwoColumnFields(
      "Employer Phone",
      app.guarantorEmployerPhone || "N/A",
      "Time On Job",
      app.guarantorTimeOnJob || "N/A",
    );

    const coEmpAddrY = doc.y;
    drawField(
      "Employer Address",
      app.guarantorEmployerAddress || "N/A",
      leftColumn,
      coEmpAddrY,
      columnWidth,
    );
    drawField(
      "City",
      app.guarantorEmployerCity || "N/A",
      rightColumn,
      coEmpAddrY,
      columnWidth,
    );
    doc.y = coEmpAddrY + FIELD_HEIGHT;

    drawTwoColumnFields(
      "State",
      app.guarantorEmployerState || "N/A",
      "Zip Code",
      app.guarantorEmployerZipcode || "N/A",
    );

    drawTwoColumnFields(
      "Gross Annual Income",
      app.guarantorGrossAnnualIncome != null
        ? `$${Number(app.guarantorGrossAnnualIncome).toLocaleString()}`
        : "N/A",
      "",
      "",
    );

    // =========================
    // Signatures (Side-by-side)
    // =========================
    drawTwoSignatureFlex(
      "Applicant Declaration & Signature",
      app.signatureData || undefined,
      "Co-Applicant Information & Signature",
      app.guarantorSignatureData || undefined,
    );
  }

  doc.save();
  doc.end();

  return new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => {
      resolve(Buffer.concat(buffers));
    });
    doc.on("error", reject);
  });
};

const updateApplication = async (id: string, data: any) => {
  const result = await prisma.application.update({
    where: { id },
    data: data,
  });

  return result;
};

export const ApplicationService = {
  createPersonalApplication,
  createBusinessApplication,
  getAllAplication,
  getSingleApplication,
  getApplicationOverview,
  updateApplicationStatus,
  generateApplicationPdf,
  updateApplication,
  getSingleApplication2,
};
