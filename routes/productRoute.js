const express = require("express");
const { createProduct, updateProduct , getaProduct ,getAllProduct, deleteProduct , filterProduct, addToWishlist, rating, uploadImages} = require("../controllers/productCtrl");
const router = express.Router();
const {isAdmin, authMiddleware} = require("../middlewares/authMiddleware");
const { uploadPhoto, productImgResize } = require("../middlewares/uploadImages");

router.post("/", authMiddleware,isAdmin,createProduct);
router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array('images',10),productImgResize , uploadImages);
router.get("/:id",getaProduct)
router.put('/wishlist',authMiddleware,addToWishlist);
router.put("/rating",authMiddleware,rating);


router.get("/",getAllProduct)
router.get("/",filterProduct)
router.delete("/:id", authMiddleware,isAdmin, deleteProduct)
router.put("/:id",  authMiddleware,isAdmin,updateProduct)



module.exports =  router 