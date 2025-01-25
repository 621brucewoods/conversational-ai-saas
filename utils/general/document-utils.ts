"use server";
import mammoth from "mammoth";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";

export const handlePdfFile = async (file: File) => {
  try {
    const loader = new WebPDFLoader(file, { splitPages: false });
    const output = await loader.load();
    const pageCount = output[0].metadata.pdf.totalPages.toString();

    return pageCount;
  } catch (error) {
    console.error("Error reading PDF:", error);
    return "Unknown";
  }
};

export const handleTextFile = async (file: File) => {
  try {
    const textContent = await file.text();
    const lineCount = textContent.split("\n").length;
    return Math.ceil(lineCount / 50).toString();
  } catch (error) {
    console.error("Error reading text file:", error);
    return "Unknown";
  }
};

export const handleDocxFile = async (file: File) => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    const textContent = result.value || "";
    const wordCount = textContent.split(/\s+/).length;
    return Math.ceil(wordCount / 300).toString();
  } catch (error) {
    console.error("Error reading DOCX file:", error);
    return "Unknown";
  }
};
