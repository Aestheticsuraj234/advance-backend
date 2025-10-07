import jwt from "jsonwebtoken";
import { db } from "../lib/db.js";


export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Assuming the cookie name is 'jwt'

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No Token Provided" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    const user = await db.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        image: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error in authenticate middleware:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

