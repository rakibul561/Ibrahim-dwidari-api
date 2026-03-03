import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { ApplicationService } from "./application.service";
import { v4 as uuidv4 } from "uuid";

const createPersonalApplication = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ApplicationService.createPersonalApplication(req.body);
    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Personal application created successfully",
      data: result,
    });
  },
);

const exportAllApplications = catchAsync(async (req: Request, res: Response) => {
    const resultCsvFile = await ApplicationService.exportAllApplications();

    const downloadId: string =  uuidv4().slice(0, 16).replace(/-/g, '');
    
    res.header("Content-Type", "text/csv");
    res.header("Content-Disposition", `attachment; filename=applications_${downloadId}.csv`);
    
    res.status(httpStatus.CREATED).send(resultCsvFile);
});


// const uploadCSV = catchAsync(async (req: Request, res: Response) => {



//     console.log("\n\n req.file ==> \n\n", req.file)
//     console.log("\n\n____ end ___ ==> \n\n")


//     sendResponse(res, {
//       statusCode: 201,
//       success: true,
//       message: "Business applications created successfully",
//       data: "",
//     });
// });
const uploadCSV = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    return sendResponse(res, {
      statusCode: 400,
      success: false,
      message: "No file uploaded",
    });
  }

  const result = await ApplicationService.uploadCSV(req.file);

  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: `${result.total} applications created successfully`,
    data: result.applications,
  });
});

const createBusinessApplication = catchAsync(
  async (req: Request, res: Response) => {
    const result = await ApplicationService.createBusinessApplication(req.body);

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Business application created successfully",
      data: result,
    });
  },
);

const getAllAplication = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.getAllAplication(req.query);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "All applications retrieved successfully",
    data: result,
  });
});

const getSingleApplication = catchAsync(async (req: Request, res: Response) => {
  const result = await ApplicationService.getSingleApplication(req.params.id);
  sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Single application retrieved successfully",
    data: result,
  });
});

// const getSingleApplication2 = catchAsync(async (req: Request, res: Response) => {
//   const result = await ApplicationService.getSingleApplication2(req.params.id);
//   sendResponse(res, {
//     statusCode: 201,
//     success: true,
//     message: "Single application retrieved successfully",
//     data: result,
//   });
// });

const getOverview = catchAsync(async (req, res) => {
  const result = await ApplicationService.getApplicationOverview();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application overview retrieved successfully",
    data: result,
  });
});

const updateStatus = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await ApplicationService.updateApplicationStatus(id, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application status updated successfully",
    data: {
      id: result.id,
      status: result.status,
      updatedAt: result.updatedAt,
    },
  });
});

const downloadApplication = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const pdfBuffer = await ApplicationService.generateApplicationPdf(id);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=application-${id}.pdf`,
  );

  res.status(httpStatus.OK).send(pdfBuffer);
});

const updateApplication = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ApplicationService.updateApplication(id, req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Application updated successfully",
    data: result,
  });
});

export const ApplicationController = {
  uploadCSV,
  exportAllApplications,
  createPersonalApplication,
  createBusinessApplication,
  getAllAplication,
  getSingleApplication,
  getOverview,
  updateStatus,
  downloadApplication,
  updateApplication,
  // getSingleApplication2,
};
