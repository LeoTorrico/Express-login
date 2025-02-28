import { Request } from "express";

export const validateReportRequest = (req: Request): string | null => {
  const { type, category, details, format } = req.query;

  if (!type || typeof type !== "string") {
    return "Invalid 'type'. It must be a non-empty string.";
  }

  if (!category || typeof category !== "string") {
    return "Invalid 'category'. It must be a non-empty string.";
  }

  if (details) {
    try {
      const parsedDetails = JSON.parse(details as string);
      if (typeof parsedDetails !== "object" || Array.isArray(parsedDetails)) {
        return "Invalid 'details'. It must be a JSON object.";
      }
    } catch (error) {
      return "Invalid 'details'. It must be a valid JSON object.";
    }
  }

  if (format && format !== "csv" && format !== "xls") {
    return "Invalid 'format'. Allowed values: 'csv', 'xls'.";
  }

  return null; // Si no hay errores, devuelve `null`
};




// CONTROLLER


import { Request, Response, NextFunction } from "express";
import { ReportService } from "../../services/report.service";
import { ReportTransformer } from "../../model/transformer/report.transformer";
import { ReportResponseMarshaller } from "../../model/marshallers/report_response.marshaller";
import { ReportExportService } from "../../services/report.export.service";
import { validateReportRequest } from "../../validators/report.validator";

export class ReportController {
  private reportService = new ReportService();

  constructor() {
    this.getReports = this.getReports.bind(this);
    this.exportReports = this.exportReports.bind(this);
  }

  async getReports(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validar la solicitud antes de procesarla
      const validationError = validateReportRequest(req);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const filterDTO = ReportTransformer.toDTO(req.query);
      const reports = await this.reportService.getReports(filterDTO);
      const jsonResponse = ReportResponseMarshaller.toJSON(reports);
      return res.status(200).json(jsonResponse);
    } catch (error) {
      next(error);
      return;
    }
  }

  async exportReports(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    try {
      // Validar la solicitud antes de procesarla
      const validationError = validateReportRequest(req);
      if (validationError) {
        return res.status(400).json({ message: validationError });
      }

      const filterDTO = ReportTransformer.toDTO(req.query);
      const reports = await this.reportService.getReports(filterDTO);
      const jsonResponse = ReportResponseMarshaller.toJSON(reports);

      const format = req.query.format as string;

      switch (format) {
        case "csv":
          await ReportExportService.toCSV(jsonResponse, res);
          break;
        case "xls":
          await ReportExportService.toXLS(jsonResponse, res);
          break;
        default:
          return res.status(400).json({ message: "Invalid format. Use 'csv' or 'xls'." });
      }
    } catch (error) {
      next(error);
      return;
    }
  }
}
