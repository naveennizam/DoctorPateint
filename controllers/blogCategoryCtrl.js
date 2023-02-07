const Category = require("../models/blogCategoryModel");
const asyncHandler = require("express-async-handler");
const validatemongoodbId = require("../utage/validateMongoId");

const createCategory = asyncHandler(async (req, res) => {
    try {
        const newCategory = await Category.create(req.body);
        res.json(newCategory);
    }
    catch (error) {
        throw new Error(error)
    }
});

const updateCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);

    try {
        const updated = await Category.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    }
    catch (error) {
        throw new Error(error)
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
        validatemongoodbId(id);

    try {
        const deleted = await Category.findByIdAndDelete(id);
        res.json(deleted);
    }
    catch (error) {
        throw new Error(error)
    }
});


const getCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    try {
        const gettingCategory = await Category.findById(id);
        res.json(gettingCategory);
    }
    catch (error) {
        throw new Error(error)
    }
});

const getAllCategory = asyncHandler(async (req, res) => {

    try {
        const gettingAllCategory = await Category.find();
        res.json({gettingAllCategory});
    }
    catch (error) {
        throw new Error(error)
    }
});
module.exports = { createCategory, updateCategory, deleteCategory, getCategory, getAllCategory }