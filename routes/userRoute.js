const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);
router.post("/signup", authController.createUser);

router.post("/login", authController.login);

router.post("/forgotPassword", authController.forgotPassword);

router.patch("/resetPassword/:token", authController.resetPassword);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("editor", "admin"),
    userController.getAllUser
  );
router
  .route("/:id")
  .get(
    // authController.protect,
    // authController.restrictTo("editor", "admin"),
    userController.getUser
  );

module.exports = router;