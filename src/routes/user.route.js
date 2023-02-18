const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const auth = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.put("/topup", userController.topup);
router.put("/withdraw", userController.withdraw);
router.get("/history/:id",userController.getHistory);
router.put("/buy", userController.buy);
router.put("/transfer", userController.transfer);

router.get("/:id", userController.getUser)

module.exports = router;
