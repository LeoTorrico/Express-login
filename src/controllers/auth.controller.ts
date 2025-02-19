import { Request, Response } from "express";
import { User } from "../entities/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = User.create({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(400).json({ error: "Error al registrar usuario" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user) {
      res.status(400).json({ error: "Usuario no encontrado" });
      return;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      res.status(400).json({ error: "Contraseña incorrecta" });
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      "secreto",
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Login exitoso", token });
  } catch (error) {
    res.status(500).json({ error: "Error en el servidor" });
  }
};
