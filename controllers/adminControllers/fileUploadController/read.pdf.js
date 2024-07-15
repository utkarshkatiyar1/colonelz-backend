import fs from 'fs';
import { PDFDocument } from 'pdf-lib';
import { responseData } from "../../../utils/respounse.js";

export const readPdf = async (req, res) => {
    try {
        // if (!req.files || !req.files.pdf) {
        //     return res.status(400).json({ error: 'PDF file not uploaded' });
        // }

        // const pdfFile = req.files.pdf;
        // const pdfBuffer = pdfFile.data;

        // // Load the PDF document
        // const pdfDoc = await PDFDocument.load(pdfBuffer);

        // // Extract text from the PDF
        // const texts = [];
        // const numPages = pdfDoc.getPageCount();
        // for (let i = 0; i < numPages; i++) {
        //     const page = pdfDoc.getPage(i);
        //     const content = await page.getText();
        //     texts.push(content);
        // }

        // // Example logic: Find occurrences of 'waiting area'
        // const waitingAreaPages = texts.filter(text => text.toLowerCase().includes('waiting area'));
        // const waitingAreaPageNumbers = waitingAreaPages.map((_, index) => index + 1); // Page numbers start from 1

        // // Send response with waiting area page numbers
        // responseData(res, 200, { waitingAreaPageNumbers });

    } catch (err) {
        console.error('Error reading PDF:', err);
        res.status(500).send(err.message);
    }
};
