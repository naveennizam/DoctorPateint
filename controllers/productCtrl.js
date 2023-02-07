const Product = require("../models/productModel");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const slugify = require("slugify");
// const { json } = require("body-parser");
// const { validate } = require("../models/productModel");
const fs = require('fs');
const validatemongoodbId = require("../utage/validateMongoId");
const cloudinaryUploadImg = require("../utage/cloudinary");


const createProduct = asyncHandler(async (req, res) => {
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const newProduct = await Product.create(req.body);
        res.json(newProduct)
    }
    catch (error) {
        throw new Error(error)
    }
});
// update Product
const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const updated = await Product.findByIdAndUpdate(id, req.body,
            {
                new: true
            });
        res.json({ updated });
    }
    catch (error) {
        throw new Error(error)
    }
})
// Find Product
const getaProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const findProduct = await Product.findById(id);
        res.json(findProduct);
    }
    catch (error) {
        throw new Error(error)
    }
});
// Get all Products
const getAllProduct = asyncHandler(async (req, res) => {
    try {
        // Filtering Data
        const queryObject = { ...req.query };
        // console.log(queryObject);
        const excludeFiels = ['page', 'sort', 'limit', 'fields']
        excludeFiels.forEach((el) => delete queryObject[el])
        // console.log(queryObject, req.query);

        let queryString = JSON.stringify(queryObject);
        queryString = queryString.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        //  console.log(JSON.parse( queryString));
        // localhost:5000/api/product/?price[lt]=1000000
        let query = Product.find(JSON.parse(queryString));

        // Sorting
        if ((req.query.sort)) {   // localhost:5000/api/product?sort=-category
            const sortBy = req.query.sort.split(",").join(" ")
            query = query.sort(sortBy)
            console.log(sortBy);
        }
        else {
            query = query.sort('-createdAt')
        }

        // limiting the fields

        // if ((req.query.fields)) {        // localhost:5000/api/product?fields=title,price
        //     const fields = req.query.fields.split(",").join(" ")
        //     query = query.select(fields)
        //     console.log(fields);
        // }
        // else {
        //     query = query.fields('__v')

        // }

        //Pagination 

        const page = req.query.page
        const limit = req.query.limit;
        const skip = (page - 1) * limit
        query = query.skip(skip).limit(limit)
        if (req.query.page) {     // localhost:5000/api/product/?page=1&limit=2
            const productCount = await Product.countDocuments();
            if (skip >= productCount) throw new Error("This page is not Exist")
        }
        console.log(page, limit, skip);

        const product = await query;
        res.json(product)

    }
    catch (error) {
        throw new Error(error)
    }
});
//Filter Product
const filterProduct = asyncHandler(async (req, res) => {
    try {
        const filterProduct = await Product.find({
            brand: req.query.brand,
            category: req.query.category,
        });
        res.json({
            filterProduct,
        })
    }
    catch (error) {
        throw new Error(error)
    }
});

// Delete Product
const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deleteProduct = await Product.findByIdAndDelete(id);
        res.json({
            deleteProduct,
        })
    }
    catch (error) {
        throw new Error(error)
    }
});
//Wishlist Functionality
const addToWishlist = asyncHandler(async (req, res) => {
    const { id } = req.user;
    const { prodId } = req.body;
    try {
        const user = await User.findById(id);
        const alreadyAdded = user.wishlist.find((id) => id.toString() === prodId)
        if (alreadyAdded) {
            let user = await User.findByIdAndUpdate(id,
                {
                    $pull: { wishlist: prodId }
                },
                { new: true }
            );
            res.json(user);
        }
        else {
            let user = await User.findByIdAndUpdate(id,
                {
                    $push: { wishlist: prodId }
                },
                { new: true }
            );
            res.json(user);
        }
    }
    catch (error) {
        throw new Error(error)
    }
});


// Product Rating
const rating = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    const { star, prodId, comment } = req.body;
    try {
        const product = await Product.findById(prodId);
        let alreadyRated = product.rating.find((userId) => userId.postedby.toString() === _id.toString());
        if (alreadyRated) {
            const updateRating = await Product.updateOne({
                rating: { $elemMatch: alreadyRated }
            }, {
                $set: { "rating.$.star": star, "rating.$.comment": comment },
            },
                {
                    new: true
                }
            );
            //  res.json(updateRating)
        }
        else {
            const rateProduct = await Product.findByIdAndUpdate(prodId, {
                $push: {
                    rating: {
                        star: star,
                        comment: comment,
                        postedby: _id,
                    },
                },
            }, { new: true });
            // res.json(rateProduct);
        }
        const getAllRating = await Product.findById(prodId);
        let totalRating = getAllRating.rating.length;
        let sumAllRating = getAllRating.rating.map((item) => item.star).reduce((previous, current) => previous + current, 0);
        let actualRating = Math.round(sumAllRating / totalRating);
        let finalProduct = await Product.findByIdAndUpdate(prodId, {
            totalrating: actualRating,
        }, { new: true });
        res.json(finalProduct)
    }
    catch (error) {
        throw new Error(error)
    }
});
const uploadImages = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    console.log(req.files);
    try {
        const uploader = (path) => cloudinaryUploadImg(path, 'images');
        const urls = [];
        const files = req.files;
        for (const file of files) {
            const { path } = file;
            const newpath = await uploader(path);
            console.log(newpath);
            urls.push(newpath);
            console.log(file);
            fs.unlinkSync(path);
        }
        const findProduct = await Product.findByIdAndUpdate(id,
            {
                images: urls.map((file) => {
                    return file;
                }),
            }, { new: true });
        res.json(findProduct);
    }
    catch (error) {
        throw new Error(error)
    }


});

module.exports = { createProduct, updateProduct, getaProduct, getAllProduct, deleteProduct, filterProduct, addToWishlist, rating, uploadImages }