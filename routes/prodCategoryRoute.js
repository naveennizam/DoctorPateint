const express =require("express");
const { createCategory , updateCategory,deleteCategory,getCategory,getAllCategory} = require('../controllers/prodCategoryCtrl')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/",authMiddleware,isAdmin,createCategory);
router.put("/:id",authMiddleware,isAdmin,updateCategory);
router.delete("/delete/:id",authMiddleware,isAdmin,deleteCategory);
router.get("/get/:id",getCategory)
router.get("/getall",getAllCategory);


module.exports = router;
