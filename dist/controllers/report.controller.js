// 1. Primero, crea un servicio de exportación (ExportService)
// src/services/export.service.ts
import { json2csv } from 'json2csv';
import ExcelJS from 'exceljs';

export enum ExportFormat {
  CSV = 'csv',
  XLSX = 'xlsx'
}

export class ExportService {
  public async exportToCSV(data: any[]): Promise<Buffer> {
    const csvData = json2csv.parse(data);
    return Buffer.from(csvData);
  }

  public async exportToExcel(data: any[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reportes');
    
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      worksheet.addRow(headers);
    }
    
    data.forEach(item => {
      worksheet.addRow(Object.values(item));
    });
    
    return await workbook.xlsx.writeBuffer();
  }
}

// 2. Modifica tu ReportService para incluir métodos de exportación
// src/services/report.service.ts
import { ExportService, ExportFormat } from './export.service';

export class ReportService {
  private exportService: ExportService;
  
  constructor() {
    this.exportService = new ExportService();
  }
  
  // Tu método existente para obtener reportes
  public async getReports(filterDTO: any): Promise<any[]> {
    // Tu implementación actual
    // ...
  }
  
  // Nuevo método para exportar reportes
  public async exportReports(filterDTO: any, format: ExportFormat): Promise<{
    data: Buffer,
    contentType: string,
    filename: string
  }> {
    // Obtener los datos usando el método existente
    const reports = await this.getReports(filterDTO);
    
    // Exportar según el formato solicitado
    if (format === ExportFormat.CSV) {
      const data = await this.exportService.exportToCSV(reports);
      return {
        data,
        contentType: 'text/csv',
        filename: 'reports.csv'
      };
    } else if (format === ExportFormat.XLSX) {
      const data = await this.exportService.exportToExcel(reports);
      return {
        data,
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'reports.xlsx'
      };
    }
    
    throw new Error('Formato no soportado');
  }
}

// 3. Ahora, simplifica tu controlador
// src/controllers/report.controller.ts
import { Request, Response, NextFunction } from 'express';
import { Response as ExpressResponse, Request as ExpressRequest, NextFunction } from 'express';
import httpStatus from 'http-status-codes';
import { ReportService } from '../services/report.service';
import { ReportTransformer } from '../model/transformer/report.transformer';
import { ReportResponseMarshaller } from '../model/marshallers/report_response.marshaller';
import { ExportFormat } from '../services/export.service';

export class ReportController {
  private reportService: ReportService;
  
  constructor() {
    this.reportService = new ReportService();
    this.getReports = this.getReports.bind(this);
    this.exportReports = this.exportReports.bind(this);
  }
  
  // Tu método existente
  async getReports(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<void> {
    try {
      const filterDTO = ReportTransformer.toDTO(req.query);
      const reports = await this.reportService.getReports(filterDTO);
      const jsonResponse = ReportResponseMarshaller.toJSON(reports);
      res.status(httpStatus.OK).send(jsonResponse);
    } catch (error) {
      next(error);
      return;
    }
  }
  
  // Nuevo método para la exportación
  async exportReports(
    req: ExpressRequest,
    res: ExpressResponse,
    next: NextFunction
  ): Promise<void> {
    try {
      const filterDTO = ReportTransformer.toDTO(req.query);
      
      // Determinar formato
      const formatStr = (req.query.format as string)?.toLowerCase() || 'csv';
      const format = formatStr === 'xlsx' ? ExportFormat.XLSX : ExportFormat.CSV;
      
      // Obtener datos exportados
      const exportResult = await this.reportService.exportReports(filterDTO, format);
      
      // Configurar headers
      res.setHeader('Content-Type', exportResult.contentType);
      res.setHeader('Content-Disposition', `attachment; filename=${exportResult.filename}`);
      
      // Enviar respuesta
      res.status(httpStatus.OK).send(exportResult.data);
    } catch (error) {
      next(error);
      return;
    }
  }
}

// 4. Finalmente, configura las rutas
// src/routes/report.routes.ts
import { Router } from 'express';
import { ReportController } from '../controllers/report.controller';

const router = Router();
const reportController = new ReportController();

router.get('/reports', reportController.getReports);
router.get('/reports/export', reportController.exportReports);

export default router;
