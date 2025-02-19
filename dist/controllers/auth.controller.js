"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const User_1 = require("../entities/User");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    try {
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const newUser = User_1.User.create({ username, password: hashedPassword });
        yield newUser.save();
        res.status(201).json({ message: "Usuario registrado correctamente" });
    }
    catch (error) {
        res.status(400).json({ error: "Error al registrar usuario" });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        const user = yield User_1.User.findOne({ where: { username } });
        if (!user) {
            res.status(400).json({ error: "Usuario no encontrado" });
            return;
        }
        const isValidPassword = yield bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            res.status(400).json({ error: "Contraseña incorrecta" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, "secreto", {
            expiresIn: "1h",
        });
        res.status(200).json({ message: "Login exitoso", token });
    }
    catch (error) {
        res.status(500).json({ error: "Error en el servidor" });
    }
});
exports.login = login;
