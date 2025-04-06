import User from "../models/user.model.js";
import jwt from "jsonwebtoken";

export const protectedRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({ message: "Unauthorized - Access token not found" });
        }

        try {
            const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-password");

            if (!user) {
                return res.status(401).json({ message: "Unauthorized - User not found" });
            }

            req.user = user;
            next();
        } catch (error) {
            if(error.name === "TokenExpiredError") {
                console.error("Access token expired:", error);
                return res.status(401).json({ message: "Unauthorized - Access token expired" });
            }
        }
    } catch (error) {
        console.error("Error in protectedRoute:", error);
        return res.status(401).json({ message: "Unauthorized - Invalid access token" });
    }
}

export const adminRoute = async (req, res, next) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Forbidden - Admin access required" });
        }
        next();
    } catch (error) {
        console.error("Error in adminRoute:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
}