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
