import express from "express";
import { checkAuth, login, logout, register } from "../controllers/auth.controler.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

// 1. register
router.post("/register" , register)

// 2. login
router.post("/login" , login)

// 3. logout
router.post("/logout" , logout)

// 4. check

router.get("/check" , authenticate , checkAuth)

export default router;