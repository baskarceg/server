// server/src/utils/pdfGenerator.js
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generates a SWOT Analysis PDF for the given user data.
 * @param {Object} swotData - The user and SWOT analysis data.
 * @param {string} filePath - The full path where the PDF should be saved.
 * @returns {Promise<string>} Resolves with the file path when done.
 */
export const generateSwotPDF = (swotData, filePath) => {
  return new Promise((resolve, reject) => {
    // Ensure the output directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Title
    doc.fontSize(18).text("SWOT Analysis Report", { align: "center" });
    doc.moveDown();

    // User Info
    doc.fontSize(14).text(`Name: ${swotData.name}`);
    doc.text(`Email: ${swotData.email}`);
    doc.text(`Mobile: ${swotData.mobile}`);
    doc.text(`College: ${swotData.college}`);
    doc.text(`Degree: ${swotData.degree}`);
    doc.moveDown();

    // SWOT Sections
    ["strengths", "weaknesses", "opportunities", "threats", "recommendations"].forEach(section => {
      doc.fontSize(16).text(section.toUpperCase(), { underline: true });
      swotData.swotAnalysis[section].forEach((point, index) => {
        doc.fontSize(12).text(`${index + 1}. ${point}`);
      });
      doc.moveDown();
    });

    // Finalize PDF file
    doc.end();
    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};
