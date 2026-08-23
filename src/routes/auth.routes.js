const { Router } = require("express");
const authController = require("../controllers/auth.controller");

const authRouter = Router();

/**
 * @route Post/api/auth/register
 * @description Register a new user
 * @access Public
 */
authRouter.post("/register", authController.registerUserController);

/**
 * @route POST/api/auth/login
 * @description login user with email and password
 * @access Public
 */
authRouter.post("/login", authController.loginUserController);

/**
 * @route GET /api/auth/logout
 * @description clear token and add to blacklist
 * @access Public
 */
authRouter.get("/logout", authController.loginUserController);

module.exports = authRouter;
