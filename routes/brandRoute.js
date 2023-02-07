const express =require("express");
const { createBrand , updateBrand,deleteBrand,getBrand,getAllBrand} = require('../controllers/brandCtrl')
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/",authMiddleware,isAdmin,createBrand);
router.put("/:id",authMiddleware,isAdmin,updateBrand);
router.delete("/delete/:id",authMiddleware,isAdmin,deleteBrand);
router.get("/get/:id",getBrand)
router.get("/getall",getAllBrand);


module.exports = router;
