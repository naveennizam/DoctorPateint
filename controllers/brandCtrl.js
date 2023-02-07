const Brand = require("../models/brandModel");
const asyncHandler = require("express-async-handler");
const validatemongoodbId = require("../utage/validateMongoId");

const createBrand = asyncHandler(async (req, res) => {
    try {
        const newBrand = await Brand.create(req.body);
        res.json(newBrand);
    }
    catch (error) {
        throw new Error(error)
    }
});

const updateBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);

    try {
        const updated = await Brand.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updated);
    }
    catch (error) {
        throw new Error(error)
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
        validatemongoodbId(id);

    try {
        const deleted = await Brand.findByIdAndDelete(id);
        res.json(deleted);
    }
    catch (error) {
        throw new Error(error)
    }
});


const getBrand = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    try {
        const gettingBrand = await Brand.findById(id);
        res.json(gettingBrand);
    }
    catch (error) {
        throw new Error(error)
    }
});

const getAllBrand = asyncHandler(async (req, res) => {

    try {
        const gettingAllBrand = await Brand.find();
        res.json({gettingAllBrand});
    }
    catch (error) {
        throw new Error(error)
    }
});
module.exports = { createBrand, updateBrand, deleteBrand, getBrand, getAllBrand }