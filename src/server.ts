import "reflect-metadata";
import express from "express";
import cors from "cors";
import { AppDataSource } from "./databases";
import authRoutes from "./routes/auth.routes";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);

AppDataSource.initialize()
  .then(() => {
    console.log("📦 Conectado a la base de datos");
    app.listen(PORT, () =>
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
    );
  })
  .catch((error) =>
    console.log("❌ Error al conectar la base de datos:", error)
  );
