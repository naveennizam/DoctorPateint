const Coupon = require("../models/couponModel");
const asyncHandler = require("express-async-handler");
const validatemongoodbId = require("../utage/validateMongoId");

const createCoupon = asyncHandler(async(req,res)=>{

    try{
        const coupon = await Coupon.create(req.body);
        res.json({coupon})

    }
    catch(error){
        throw new Error (error);
    }
});

// const getCoupon = asyncHandler(async(req,res)=>{
// const {id} = req.params;
// validatemongoodbId(id)
//     try{
//         const coupon = await Coupon.findById(id);
//         res.json({coupon})

//     }
//     catch(error){
//         throw new Error (error);
//     }
// });
const getAllCoupon = asyncHandler(async(req,res)=>{

    try{
        const coupon = await Coupon.find();
        res.json({coupon})

    }
    catch(error){
        throw new Error (error);
    }
});

const updateCoupon = asyncHandler(async(req,res)=>{
const {id} = req.params;
validatemongoodbId(id);
    try{
        const coupon = await Coupon.findByIdAndUpdate(id,req.body , {
            new : true
        });
        res.json(coupon)

    }
    catch(error){
        throw new Error (error);
    }
});

const deleteCoupon = asyncHandler(async(req,res)=>{
    const {id} = req.params;
    validatemongoodbId(id);
        try{
            const deleted = await Coupon.findByIdAndDelete(id);
            res.json({deleted})
    
        }
        catch(error){
            throw new Error (error);
        }
    });

module.exports = {createCoupon, getAllCoupon, updateCoupon, deleteCoupon}