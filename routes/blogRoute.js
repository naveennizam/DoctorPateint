const express =require("express");
const { creatBlog , updateBlog , getBlog , getAllBlog, deleteBlog, likeBlog , dislikeBlog, uploadImages} = require("../controllers/blogCtrl");
const { authMiddleware, isAdmin } = require("../middlewares/authMiddleware");
const { uploadPhoto, blogImgResize } = require("../middlewares/uploadImages");

const router = express.Router();


router.post("/", authMiddleware,isAdmin,creatBlog)
router.put("/upload/:id",authMiddleware,isAdmin,uploadPhoto.array('images',2),blogImgResize , uploadImages);

router.put("/likes",authMiddleware,likeBlog)
router.put("/dislikes",authMiddleware,dislikeBlog)
router.put("/:id", authMiddleware,isAdmin,updateBlog)
router.get("/:id",getBlog)
router.get("/",getAllBlog)
router.delete("/delete/:id",deleteBlog)

module.exports = router;