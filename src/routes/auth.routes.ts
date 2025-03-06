import { Router } from "express";
import { login, register } from "../controllers/auth.controller";

const router = Router();

router.post(
  "/register",
  (req, res, next) => {
    console.log("📩 Petición recibida en /register:", req.body);
    next(); // Pasa la petición al controlador
  },
  register
);

router.post(
  "/login",
  (req, res, next) => {
    console.log("📩 Petición recibida en /login:", req.body);
    next();
  },
  login
);

export default router;




import { ReportService } from '../../src/services/reportService';
import { ReportRepository } from '../../src/repositories/reportRepository';
import { ReportTransformer } from '../../src/transformers/reportTransformer';

jest.mock('../../src/repositories/reportRepository');
jest.mock('../../src/transformers/reportTransformer');

describe('ReportService - getReports', () => {
  let reportService: ReportService;
  let reportRepository: jest.Mocked<ReportRepository>;

  beforeEach(() => {
    reportRepository = new ReportRepository() as jest.Mocked<ReportRepository>;
    reportService = new ReportService(reportRepository);
  });

  it('debe retornar un ReportResponseDTO correctamente', async () => {
    // Mock de la data de la BD (similar a la imagen)
    const mockResults = [
      {
        sub_category_id: '043dcc98-0a4f-45e1-ba9e-dfc8e0b7102e',
        id: '48a90353-8a09-4a73-bbf5-5aae858f3144',
        update_date: '2025-02-25T13:22:47.695Z',
        item_status: 'Disponible',
        is_deleted: 0,
        update_user_id: 'e4a56b82-d519-4831-8197-30b56186927e',
        code: 'ECU-001-004',
      },
    ];

    // Mock del DTO de entrada
    const mockFilterDTO = {
      type: 'Equipo',
      category: 'Laptop',
      details: { brand: 'Dell', ram: '16GB' },
    };

    // Mock del repository
    reportRepository.getFilteredReports.mockResolvedValue(mockResults);

    // Mock del transformer
    const mockResponseDTO = {
      type: 'Equipo',
      category: 'Laptop',
      details: { brand: 'Dell', ram: '16GB' },
      results: mockResults,
    };
    (ReportTransformer.toResponseDTO as jest.Mock).mockReturnValue(mockResponseDTO);

    // Ejecutar el método
    const response = await reportService.getReports(mockFilterDTO);

    // Validar que el repository se llamó con el DTO correcto
    expect(reportRepository.getFilteredReports).toHaveBeenCalledWith(
      mockFilterDTO.type,
      mockFilterDTO.category,
      mockFilterDTO.details
    );

    // Validar que el transformer se llamó con los datos correctos
    expect(ReportTransformer.toResponseDTO).toHaveBeenCalledWith(
      mockFilterDTO.type,
      mockFilterDTO.category,
      mockFilterDTO.details,
      mockResults
    );

    // Validar la respuesta final
    expect(response).toEqual(mockResponseDTO);
  });
});
