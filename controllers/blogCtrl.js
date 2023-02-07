const Blog = require("../models/blogModel");
const User = require("../models/userModel");
const fs = require('fs');
const asyncHandler = require("express-async-handler");
const validatemongoodbId = require("../utage/validateMongoId");
const cloudinaryUploadImg = require("../utage/cloudinary");

const creatBlog = asyncHandler(async (req, res) => {
    try {
        const newBlog = await Blog.create(req.body);
        res.json({ newBlog })
    }
    catch (error) {
        throw new Error(error)
    }
});

const updateBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
            new: true,
        })
        res.json({ updatedBlog })
    }
    catch (error) {
        throw new Error(error)
    }
});

const getBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        // show person detail who like or dislike
        const gettingBlog = await Blog.findById(id).populate('likes').populate('dislikes');
        const updateViews = await Blog.findByIdAndUpdate(
            id,
            {
                $inc: { numViews: 1 },
            },
            {
                new: true
            }
        );
        res.json({ gettingBlog })
    }
    catch (error) {
        throw new Error(error)
    }
});

const getAllBlog = asyncHandler(async (req, res) => {
    try {
        const getAll = await Blog.find();
        res.json({ getAll })
    }
    catch (error) {
        throw new Error(error)
    }
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await Blog.findByIdAndDelete(id);
        res.json({ deleted })
    }
    catch (error) {
        throw new Error(error)
    }
});

const likeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    console.log(blogId);
    validatemongoodbId(blogId);
    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;
    const isLiked = blog?.isLiked;
    const alreadyDisliked = blog?.dislikes?.find(
        (userId) => userId?.toString() === loginUserId?.toString());
    if (alreadyDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loginUserId }, //pull -> remove
            isDisliked: false
        },
            {
                new: true
            }
        );
        res.json(blog);
    }
    if (isLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId }, //pull -> remove
            isLiked: false,
        },
            {
                new: true
            }
        );
        res.json(blog)
    }
    else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: { likes: loginUserId }, //pull -> remove
            isLiked: true,
        },
            {
                new: true
            }
        );
        res.json(blog)
    }

});


const dislikeBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.body;
    console.log(blogId);
    validatemongoodbId(blogId);
    const blog = await Blog.findById(blogId);
    const loginUserId = req?.user?._id;
    const isDisliked = blog?.isDisliked;
    const alreadyLiked = Blog?.likes?.find(
        (userId) => userId?.toString() === loginUserId?.toString());
    if (alreadyLiked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { likes: loginUserId }, //pull -> remove
            isLiked: false
        },
            {
                new: true
            }
        );
        res.json(blog);
    }
    if (isDisliked) {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $pull: { dislikes: loginUserId }, //pull -> remove
            isDisliked: false,
        },
            {
                new: true
            }
        );
        res.json(blog)
    }
    else {
        const blog = await Blog.findByIdAndUpdate(blogId, {
            $push: { dislikes: loginUserId }, //pull -> remove
            isDisliked: true,
        },
            {
                new: true
            }
        );
        res.json(blog)
    }

});

const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            urls.push(newpath);
            fs.unlinkSync(path);
        }
        const findBLog = await Blog.findByIdAndUpdate(id,
            {
                images: urls.map((file) => {
                    return file;
                }),
            }, { new: true });
        res.json(findBLog);
    }
    catch (error) {
        throw new Error(error)
    }

});



module.exports = { creatBlog, updateBlog, getBlog, getAllBlog, deleteBlog, likeBlog , dislikeBlog,uploadImages}