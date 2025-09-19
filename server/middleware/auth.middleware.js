import jwt from "jsonwebtoken";
import User from "../models/User.js";

// 1️⃣  Verify token, attach user to req
export const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.split(" ")[1];



  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).lean();
    if (!req.user)
      return res.status(401).json({ message: "User not found" });
    next();                                             // ✅ only here
  } catch (err) {
    console.error("verify error →", err.name, err.message);
    return res.status(401).json({ message: "Token invalid/expired" });
  }
};


// 2️⃣  Allow only specific roles
export const allowRoles = (...allowed) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: "Not authenticated" });
  if (!allowed.includes(req.user.role))
    return res.status(403).json({ message: "Access denied. Wrong role" });
  next();
};
