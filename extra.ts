//   if (app.type === "BUSINESS") {
//     drawSectionHeader("Owner Information");

//     drawTwoColumnFields(
//       "First Name",
//       app.firstName,
//       "Middle Name",
//       app.middleName,
//     );
//     drawTwoColumnFields("Last Name", app.lastName, "Email", app.email);
//     drawTwoColumnFields(
//       "Phone",
//       app.dayTimePhone,
//       "Date of Birth",
//       app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : "N/A",
//     );
//     drawTwoColumnFields(
//       "SSN",
//       app.ssn ? "***-**-" + app.ssn.slice(-4) : "N/A",
//       "Driver License",
//       app.driverLicenseNumber,
//     );

//     const addrY = doc.y;
//     doc
//       .fontSize(7)
//       .fillColor(secondaryColor)
//       .font("Helvetica-Bold")
//       .text("Address:", leftColumn, addrY, { width: columnWidth });
//     doc
//       .fontSize(7)
//       .fillColor(darkText)
//       .font("Helvetica")
//       .text(app.address || "N/A", leftColumn, addrY + 9, {
//         width: columnWidth,
//       });

//     drawField("City", app.city, rightColumn, addrY, columnWidth);
//     doc.y = addrY + 24;

//     drawTwoColumnFields("State", app.state, "Zip Code", app.zipcode);
//     drawTwoColumnFields("Residency Type", app.residencyType, "", "");

//     addGroupSpacing();

//     drawSectionHeader("Business Information");

//     const bizNameY = doc.y;
//     doc
//       .fontSize(7)
//       .fillColor(secondaryColor)
//       .font("Helvetica-Bold")
//       .text("Business Name:", leftColumn, bizNameY, { width: columnWidth });
//     doc
//       .fontSize(7)
//       .fillColor(darkText)
//       .font("Helvetica")
//       .text(app.businessName || "N/A", leftColumn, bizNameY + 9, {
//         width: columnWidth,
//       });

//     drawField(
//       "DBA Number",
//       app.businessDbaNumber,
//       rightColumn,
//       bizNameY,
//       columnWidth,
//     );
//     doc.y = bizNameY + 24;

//     drawTwoColumnFields("Entity Type", app.businessEntity, "Tax ID", app.taxId);
//     drawTwoColumnFields(
//       "Incorporation",
//       app.businessIncorporation,
//       "Years in Business",
//       app.yearsInBusiness,
//     );
//     drawTwoColumnFields(
//       "Business Phone",
//       app.businessPhone,
//       "Email",
//       app.businessEmail,
//     );

//     const bizAddrY = doc.y;
//     doc
//       .fontSize(7)
//       .fillColor(secondaryColor)
//       .font("Helvetica-Bold")
//       .text("Business Address:", leftColumn, bizAddrY, { width: columnWidth });
//     doc
//       .fontSize(7)
//       .fillColor(darkText)
//       .font("Helvetica")
//       .text(app.businessAddress || "N/A", leftColumn, bizAddrY + 9, {
//         width: columnWidth,
//       });

//     drawField("City", app.businessCity, rightColumn, bizAddrY, columnWidth);
//     doc.y = bizAddrY + 24;

//     drawTwoColumnFields(
//       "State",
//       app.businessState,
//       "Zip Code",
//       app.businessZipcode,
//     );

//     addGroupSpacing();

//     drawSectionHeader("Bank Information");

//     const bankNameY = doc.y;
//     doc
//       .fontSize(7)
//       .fillColor(secondaryColor)
//       .font("Helvetica-Bold")
//       .text("Bank Name:", leftColumn, bankNameY, { width: columnWidth });
//     doc
//       .fontSize(7)
//       .fillColor(darkText)
//       .font("Helvetica")
//       .text(app.bankName || "N/A", leftColumn, bankNameY + 9, {
//         width: columnWidth,
//       });

//     drawField(
//       "Account Number",
//       app.bankAccountNumber ? "****" + app.bankAccountNumber.slice(-4) : "N/A",
//       rightColumn,
//       bankNameY,
//       columnWidth,
//     );
//     doc.y = bankNameY + 24;

//     drawTwoColumnFields(
//       "Routing Number",
//       app.bankRoutingNumber,
//       "Phone",
//       app.bankPhone,
//     );
//     drawTwoColumnFields(
//       "Branch Location",
//       app.bankBranchLocation,
//       "State",
//       app.bankState,
//     );

//     addGroupSpacing();

//     drawSectionHeader("Financial Information");

//     drawTwoColumnFields(
//       "Gross Annual Income",
//       `$${app.grossAnnualIncome?.toLocaleString() || 0}`,
//       "Other Income",
//       `$${app.otherIncome?.toLocaleString() || 0}`,
//     );

//     if (app.hasCoSigner && app.guarantorFirstName) {
//       addGroupSpacing();

//       drawSectionHeader("Guarantor Information");

//       drawTwoColumnFields(
//         "First Name",
//         app.guarantorFirstName,
//         "Middle Name",
//         app.guarantorMiddleName,
//       );
//       drawTwoColumnFields(
//         "Last Name",
//         app.guarantorLastName,
//         "Phone",
//         app.guarantorPhone,
//       );
//       drawTwoColumnFields(
//         "SSN",
//         app.guarantorSsn ? "***-**-" + app.guarantorSsn.slice(-4) : "N/A",
//         "Date of Birth",
//         app.guarantorDob
//           ? new Date(app.guarantorDob).toLocaleDateString()
//           : "N/A",
//       );

//       const guarAddrY = doc.y;
//       doc
//         .fontSize(7)
//         .fillColor(secondaryColor)
//         .font("Helvetica-Bold")
//         .text("Address:", leftColumn, guarAddrY, { width: columnWidth });
//       doc
//         .fontSize(7)
//         .fillColor(darkText)
//         .font("Helvetica")
//         .text(app.guarantorAddress || "N/A", leftColumn, guarAddrY + 9, {
//           width: columnWidth,
//         });

//       drawField("City", app.guarantorCity, rightColumn, guarAddrY, columnWidth);
//       doc.y = guarAddrY + 24;

//       drawTwoColumnFields(
//         "State",
//         app.guarantorState,
//         "Zip Code",
//         app.guarantorZipcode,
//       );
//       drawTwoColumnFields("Residency", app.guarantorResidencyType, "", "");
//     }
