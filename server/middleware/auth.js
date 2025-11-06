import { User } from "../models/User.model.js";
import asyncHandler from "./asyncHandler.js";
import jwt from 'jsonwebtoken';

export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    }
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
        console.log("[AUTH] No token provided");
        return res.status(401).json({
        success: false,
            error: 'Not authorized to access this route'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            console.log("[AUTH] No user found with id:", decoded.id);
            return res.status(401).json({
                success: false,
                error: 'No user found with this id'
            })
        }
        next();
    } catch (error) {
        console.log("[AUTH] JWT verification error:", error);
        return res.status(401).json({
            success: false,
            error: "Not authorized to access this route"
        })
    }

})

export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            })
        }
        next();
    }
}