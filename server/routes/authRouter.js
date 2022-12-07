const Router = require("express");
const router = new Router();
const { check } = require("express-validator");
const controller = require("../controllers/authController");
const roleMiddleware = require("../middlewares/roleMiddleware");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
	"/registration",
	[check("login", "Логін не може бути пустим").notEmpty()],
	[check("password", "Пароль повинен бути білше 3").isLength({ min: 4 })],
	roleMiddleware(["ADMIN"]),
	controller.registration
);

router.post(
	"/login",
	[check("login", "Логін не може бути пустим").notEmpty()],
	[check("password", "Пароль повинен бути білше 3").isLength({ min: 4 })],
	controller.login
);

router.delete(
	"/remove",
	[check("login", "Логін не може бути пустим").notEmpty()],
	roleMiddleware(["ADMIN"]),
	controller.removeUser
);

router.get("/users", roleMiddleware(["ADMIN"]), controller.getUsers);

router.get("/roles", authMiddleware, controller.getRoles);

router.get("/logs", roleMiddleware(["ADMIN"]), controller.getLogs);

module.exports = router;
