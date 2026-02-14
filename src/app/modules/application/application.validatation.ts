import { z } from "zod";

/* ================= HELPERS ================= */

// "" → undefined
export const optionalString = z
    .string()
    .optional();

// "" → undefined → email validate
export const optionalEmail = z
    .string()
    .optional();


const applicationZodSchema = z
    .object({
        /* ---- Personal Info ---- */
        firstName: z.string().min(1, "First name is required"),
        middleName: optionalString,
        lastName: z.string().min(1, "Last name is required"),

        address: z.string().min(1),
        city: z.string().min(1),
        state: z.string().min(1),
        zipcode: z.string().min(1),

        dayTimePhone: z.string().min(5),
        email: z.string().email(),
        ssn: z.string().min(3),
        driverLicenseNumber: z.string().min(1),

        dateOfBirth: z.coerce.date(),
        yearsOfResidence: z.string(),
        residencyType: z
            .string()
            .optional()
            .refine(
                (val) => val === undefined || val.trim() !== "",
                {
                    message: "Please select one residencyType",
                }
            ),

        rentMortgagePayment: z.number().optional(),

        previousAddress: optionalString,
        previousCity: optionalString,
        previousState: optionalString,
        previousZipcode: optionalString,
        previousTimeOfResidence: optionalString,

        signatureData: optionalString,

        /* ---- Employment / Income ---- */
        occupation: optionalString,
        industry: optionalString,

        employerStatus: optionalString,
        employerName: optionalString,
        employerAddress: optionalString,
        employerCity: optionalString,
        employerState: optionalString,
        employerZipcode: optionalString,
        employerPhone: optionalString,

        timeOnJob: optionalString,
        grossAnnualIncome: z.number().nonnegative(),
        otherIncome: z.number().optional(),

        /* ---- Business Info ---- */
        businessName: optionalString,
        businessDbaNumber: optionalString,
        businessEntity: optionalString,
        taxId: optionalString,
        businessIncorporation: optionalString,
        yearEstablished: optionalString,

        businessAddress: optionalString,
        businessCity: optionalString,
        businessState: optionalString,
        businessZipcode: optionalString,
        businessPhone: optionalString,
        businessEmail: optionalEmail,
        yearsInBusiness: optionalString,

        /* ---- Bank Info ---- */
        bankName: optionalString,
        bankAccountNumber: optionalString,
        bankAddress: optionalString,
        bankCity: optionalString,
        bankState: optionalString,
        bankZipcode: optionalString,
        bankPhone: optionalString,
        bankContact: optionalString,
        bankRoutingNumber: optionalString,
        bankBranchLocation: optionalString,

        /* ---- Guarantor ---- */
        hasCoSigner: z.boolean().default(false),

        guarantorFirstName: optionalString,
        guarantorMiddleName: optionalString,
        guarantorLastName: optionalString,
        guarantorAddress: optionalString,
        guarantorCity: optionalString,
        guarantorState: optionalString,
        guarantorZipcode: optionalString,
        guarantorPhone: optionalString,
        guarantorEmail: optionalEmail,
        guarantorSsn: optionalString,
        guarantorDriverLicense: optionalString,
        guarantorDob: z.coerce.date().optional(),

        guarantorEmployerName: optionalString,
        guarantorEmployerStatus: optionalString,
        guarantorEmployerAddress: optionalString,
        guarantorEmployerCity: optionalString,
        guarantorEmployerState: optionalString,
        guarantorEmployerZipcode: optionalString,
        guarantorEmployerPhone: optionalString,
        guarantorOccupation: optionalString,
        guarantorTimeOnJob: optionalString,
        guarantorGrossAnnualIncome: z.number().optional(),

        guarantorPreviousAddress: optionalString,
        guarantorPreviousCity: optionalString,
        guarantorPreviousState: optionalString,
        guarantorPreviousZipcode: optionalString,
        guarantorPreviousTimeOfResidence: optionalString,

        guarantorResidencyType: z.string()
            .optional()
            .refine(
                (val) => val === undefined || val.trim() !== "",
                {
                    message: "Please select one residencyType",
                }
            ),
        guarantorResidency: optionalString,
        guarantorRentMortgagePayment: z.number().optional(),
        guarantorSignatureData: optionalString,
        guarantorPreviousTimeOnJob: optionalString,
        guarantorPreviousEmployerPhone: optionalString,
        guarantorPreviousEmployerName: optionalString,
        previousEmployerPhone: optionalString,
        previousEmployerName: optionalString,
        previousTimeOnJob: optionalString,

        /* ---- Extra ---- */
        salesperson: optionalString,
        heardFrom: optionalString,
    })

const updateSchema = applicationZodSchema.partial();

export const applicationValidation = {
    applicationZodSchema,
    updateSchema
};