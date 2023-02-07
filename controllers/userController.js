const User = require("../models/userModel");
const Product = require("../models/productModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Order = require("../models/orderModel");

const uniqid = require("uniqid");
const asyncHandler = require("express-async-handler");
const { generateToken } = require("../config/jwtToken");
const validatemongoodbId = require("../utage/validateMongoId");
const { generateRefreshToken } = require("../config/refreshToken");

const crypto = require("crypto")
const jwt = require('jsonwebtoken');
const sendEmail = require("./emailCtrl");


// Creaate User means Registeration
const createUser = asyncHandler(async (req, res) => {
    const email = req.body.email;
    const findUser = await User.findOne({ email: email })
    if (!findUser) {
        //Create new User
        const newUser = await User.create(req.body)
        res.json(newUser)
    }
    else {
        // User is exist
        throw new Error("User already Exists")
    }
});

const loginUserCtrl = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exist or not
    const findUser = await User.findOne({ email })
    if (findUser && await findUser.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findUser?._id);
        const updateUser = await User.findByIdAndUpdate(findUser.id, {
            refreshToken: refreshToken,
        },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,  // time in milliSecond 
            // 72 hours
        })
        res.json({
            _id: findUser?._id,
            firstname: findUser?.firstname,
            lastname: findUser?.lastname,
            email: findUser?.email,
            mobile: findUser?.mobile,
            token: generateToken(findUser?._id),
        })
    }
    else {
        throw new Error('Invalid Crediential')
    }
});

// admin logIn

const logInAdmin = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    //check if user exist or not
    const findAdmin = await User.findOne({ email });
    if (findAdmin.role !== 'admin') throw new Error('Not Authorize');
    if (findAdmin && await findAdmin.isPasswordMatched(password)) {
        const refreshToken = await generateRefreshToken(findAdmin?._id);
        const updateUser = await User.findByIdAndUpdate(findAdmin.id, {
            refreshToken: refreshToken,
        },
            { new: true }
        );
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            maxAge: 72 * 60 * 60 * 1000,  // time in milliSecond 
            // 72 hours
        })
        res.json({
            _id: findAdmin?._id,
            firstname: findAdmin?.firstname,
            lastname: findAdmin?.lastname,
            email: findAdmin?.email,
            mobile: findAdmin?.mobile,
            token: generateToken(findAdmin?._id),
        });
    }
    else {
        throw new Error('Invalid Crediential')
    }
});

//Save User Address
const saveAddress = asyncHandler(async (req, res, next) => {
    const { _id } = req.user;
    validatemongoodbId(_id);
    try {
        const addressUser = await User.findByIdAndUpdate(_id, {
            address: req?.body?.address,
        },
            { new: true }
        );
        res.json(addressUser)
    }
    catch (error) {
        throw new Error(error)
    }

})

// GET all user
const getAllUser = asyncHandler(async (req, res) => {
    try {
        const getUsers = await User.find();
        res.json(getUsers);
    }
    catch (error) {
        throw new Error(error)
    }
})

// SInggle User
const getaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    //console.log(id);
    try {
        const getaUser = await User.findById(id);
        res.json({
            getaUser,
        })
    }
    catch (error) {
        throw new Error(error)
    }
})

// Delete User
const deleteaUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    //console.log(id);
    try {
        const deleteaUser = await User.findByIdAndDelete(id);
        res.json({
            deleteaUser,
        })
    }
    catch (error) {
        throw new Error(error)
    }
});
const handleRefreshToken = asyncHandler(async (req, res) => {
    const cookie = req.cookies;
    //console.log(cookie);
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    console.log(cookie.refreshToken);
    const refreshToken = cookie.refreshToken
    // console.log(refreshToken);
    const user = await User.findOne({ refreshToken })
    if (!user) throw new Error("no refresh Token present in DB or not matched")
    jwt.verify(refreshToken, process.env.JWT_SECRET, (err, decoded) => {
        if (err || user.id !== decoded.id) {
            throw new Error("there is something wrong with refresh token")
        }
        const accessToken = generateToken(user?._id);
        res.json({ accessToken })
    });
    // res.json(user)
});
// LOgOut
const logOut = asyncHandler(async (req, res) => {

    const cookie = req.cookies;
    if (!cookie?.refreshToken) throw new Error("No refresh token in cookies");
    const refreshToken = cookie.refreshToken;
    const user = await User.findOne({ refreshToken })
    if (!user) {
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: true,
        });
        return res.sendStatus(204); // Forbiddien
    }
    await User.findOneAndUpdate(refreshToken, {
        refreshToken: "",
    });
    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
    });
    return res.sendStatus(204); // Forbiddien

});

//Update a User
const updatedUser = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);
    console.log(_id);
    res.json(_id)

    try {
        const updatedUser = await User.findByIdAndUpdate(_id, {
            firstname: req?.body?.firstname,
            lastname: req?.body?.lastname,
            email: req?.body?.email,
            mobile: req?.body?.mobile,
        },
            { new: true }
        );
        res.json(updatedUser)
    }
    catch (error) {
        throw new Error(error)
    }
});

// Blocked User

const blockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    validatemongoodbId(id);
    console.log(validatemongoodbId(id));

    try {
        const block = await User.findByIdAndUpdate(id, {
            isBlocked: true,
        }, {
            new: true,
        }
        );

        res.json({
            message: `User blocked`,
            block
        })
    }
    catch (error) {
        throw new Error(error)
    }

});
//Unblocked User
const unBlockUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    validatemongoodbId(id);
    console.log(validatemongoodbId(id));
    try {
        const unblock = await User.findByIdAndUpdate(id, {
            isBlocked: false,
        }, {
            new: true,
        }
        );
        res.json({
            message: "User Unblocked"
        })
    }
    catch (error) {
        throw new Error(error)
    }
});

const updatePassword = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    console.log(_id);  //localhost:5000/api/user/password
    const { password } = req.body;
    console.log(password);
    validatemongoodbId(_id);
    const user = await User.findById(_id);
    if (password) {
        user.password = password;
        console.log(user.password);
        const updatedPassword = await user.save();
        console.log(updatedPassword);
        res.json(updatedPassword)
    }
    else {
        res.json(user);
    }
})

const forgotPasswordToken = asyncHandler(async (req, res) => {
    const { email } = req.body;  //  localhost:5000/api/user/forgot-password-token
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found with this Email")


    try {
        const token = await user.createPasswordResetToken();
        await user.save();
        const resetURL = `Hi , Please follow this Link to reset your password. this link is valid for 10 minutes for now.<a href='http://localhost:5000/api/user/reset-password/${token}' style="color:blue;text-align:center;">Click Here</a>`
        const data = {
            to: email,
            text: 'Hey User',
            subject: 'Forgot password link',
            htm: resetURL
        };
        sendEmail(data);
        res.json(token);
    }
    catch (error) {
        throw new Error(error)
    }

})

const resetPassword = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const { token } = req.params;
    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) throw new Error(`Token expire . please try again`);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    res.json(user);
});


const getWishList = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    try {
        const findUser = await User.findById(_id).populate('wishlist');
        res.json(findUser)
    }
    catch (error) {
        throw new Error(error)
    }
});

// Card Funtionality
const userCart = asyncHandler(async (req, res) => {

    const { _id } = req.user;
    validatemongoodbId(_id);
    const { cart } = req.body;
    try {
        let products = []
        const user = await User.findById(_id);
        // Chexk User already have Product in Cart
        const alreadyExistCart = await Cart.findOne({ orderby: user._id });
        if (alreadyExistCart) {
            alreadyExistCart.remove();

        }
        for (let i = 0; i < cart.length; i++) {
            let object = {};
            object.product = cart[i]._id;
            object.count = cart[i].count;
            object.color = cart[i].color;
            let getPrice = await Product.findById(cart[i]._id).select('price').exec();
            object.price = getPrice.price;
            products.push(object);
        }
        let cartTotal = 0;
        for (let i = 0; i < products.length; i++) {
            cartTotal = cartTotal + products[i].price * products[i].count;
        }
        let newCart = await new Cart({
            products,
            cartTotal,
            orderby: user?._id,
        }).save();
        res.json(newCart);
    }
    catch (error) {
        throw new Error(error)
    }
});

const getUserCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);

    try {
        const cart = await Cart.findOne({ orderby: _id }).populate("products.product")
        res.json(cart)
    }
    catch (error) {
        throw new Error(error)
    }
});
const emptyCart = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);

    try {
        const user = await User.findOne(_id);
        const cart = await Cart.findOneAndRemove({ orderby: user._id });
        res.json(cart)
    }
    catch (error) {
        throw new Error(error)
    }
});
const applyCoupon = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);
    const { coupon } = req.body;
    const validCopoun = await Coupon.findOne({ name: coupon });
    if (validCopoun == null) {
        throw new Error("Invalid Coupon")
    }
    const user = await User.findOne({ _id });
    let { cartTotal } = await Cart.findOne({ orderby: user._id }).populate("products.product");
    let totalAfterDiscount = (cartTotal - (cartTotal * validCopoun.discount) / 100).toFixed(2);
    await Cart.findOneAndUpdate({ orderby: user._id }, { totalAfterDiscount }, { new: true });
    res.json(totalAfterDiscount);
});
const createOrder = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);
    const { COD, couponApplied } = req.body;
    try {
        if (!COD) throw new Error(`Create Cash Order Failed`);
        const user = await User.findById(_id);
        let userCart = await Cart.findOne({ orderby: user._id });
        let finalAmount = 0;
        if (couponApplied && userCart.totalAfterDiscount) {
            finalAmount = userCart.totalAfterDiscount;
        }
        else {
            finalAmount = userCart.cartTotal;
        }
        let newOrder = await new Order({
            products: userCart.products,
            paymentIntent: {
                id: uniqid(),
                method: "COD",
                amount: finalAmount,
                status: "Cash on Delivery",
                created: Date.now(),
                currency: "USD",

            },
            orderby: user._id,
            orderStatus: "Cash on Delivery",
        }).save();
        let update = userCart.products.map((item) => {
            return {
                updateOne: {
                    filter: { _id: item.product._id },
                    update: { $inc: { quantity: -item.count, sold: +item.count } },
                }
            }
        });
        const updated = await Product.bulkWrite(update, {})
        res.json({ message: "success" });


    } catch (error) { throw new Error(error); }
});
const getOrders = asyncHandler(async (req, res) => {
    const { _id } = req.user;
    validatemongoodbId(_id);
    try {
        const userorders = await Order.findOne({ orderby: _id }).populate('products.product').exec();
        res.json(userorders);
    }
    catch (error) {
        throw new Error(error)
    }

});
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    console.log(id);
    validatemongoodbId(id);
    const { status } = req.body;
    try {
        const findOrder = await Order.findByIdAndUpdate(id, {
            orderStatus: status,
            paymentIntent: { status: status },
        },
         { new: true }
         );
        res.json(findOrder)

    }
    catch (error) {
        throw new Error(error);
    }
})

module.exports = { createUser, loginUserCtrl, logInAdmin, saveAddress, getAllUser, getaUser, deleteaUser, updatedUser, blockUser, unBlockUser, handleRefreshToken, logOut, updatePassword, forgotPasswordToken, resetPassword, getWishList, userCart, getUserCart, emptyCart, applyCoupon, createOrder, getOrders, updateOrderStatus };