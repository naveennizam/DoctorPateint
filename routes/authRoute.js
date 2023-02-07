const express = require("express");
const { createUser, loginUserCtrl, logInAdmin, saveAddress, getAllUser, getaUser, deleteaUser, updatedUser, blockUser, unBlockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword, getWishList, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus } = require("../controllers/userController");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware")
const router = express.Router();


router.post("/register", createUser);
router.post("/forgot-password-token", forgotPasswordToken)
router.post("/reset-password/:token", resetPassword)
router.put("/order/update-order/:id", authMiddleware, isAdmin, updateOrderStatus)


router.put("/password", authMiddleware, updatePassword)
router.post("/login", loginUserCtrl);
router.post("/login-admin", logInAdmin);
router.post("/cart", authMiddleware, userCart);
router.get("/cart", authMiddleware, getUserCart);
router.post("/cart/apply", authMiddleware, applyCoupon);
router.post("/cart/create-order", authMiddleware, createOrder)
router.get("/get-orders", authMiddleware, getOrders);


router.get("/all-users", getAllUser);
router.get("/refreshToken", handleRefreshToken);
router.get("/logout", logOut);
router.get("/wishlist", authMiddleware, getWishList);
router.get("/:id", authMiddleware, isAdmin, getaUser);


router.delete("/empty-cart", authMiddleware, emptyCart);
router.delete("/:id", deleteaUser);
router.put("/edit", authMiddleware, updatedUser);
router.put("/save", authMiddleware, saveAddress);
router.put("/block/:id", authMiddleware, isAdmin, blockUser);
router.put("/unblock/:id", authMiddleware, isAdmin, unBlockUser);



module.exports = router;