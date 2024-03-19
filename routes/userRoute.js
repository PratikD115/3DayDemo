const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.post(
  "/signup",
  authController.uploadUserPhoto,
  authController.createUser
);

router.post("/login", authController.login);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("editor", "admin"),
    userController.getAllUser
);
  
router.post("/", authController.updateUser);
router
  .route("/:id")
  .get(
    authController.protect,
    authController.restrictTo("editor", "admin"),
    userController.getUser
  );

router.post("/forgotPassword", authController.forgotPassword);

router.patch("/resetPassword/:token", authController.resetPassword);

router.patch(
  "/updateMyPassword",
  authController.protect,
  authController.updatePassword
);

module.exports = router;
