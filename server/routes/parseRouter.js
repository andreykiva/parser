const Router = require("express");
const router = new Router();
const controller = require("../controllers/parseController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/parse", authMiddleware, controller.parseProducts);

module.exports = router;
