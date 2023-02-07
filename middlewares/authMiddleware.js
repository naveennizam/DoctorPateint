const User = require("../models/userModel");
const jwt = require("jsonwebtoken")
const asyncHandler = require("express-async-handler")

const authMiddleware = asyncHandler(async (req, res,next) => {
    let token;
    if (req?.headers?.authorization?.startsWith('Bearer')) {
        token=(req.headers.authorization.split(" ")[1]);
       
      //  console.log(token);
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET)
               const user = await User.findById(decoded?.id);
               req.user = user;
               next();
            
            }
        }
        catch (error) {
            throw new Error(`not authorize token expire , please login again`);
        }
    }
    else {
        throw new Error(`There is no token attached to header`)
    }
});

const isAdmin = asyncHandler (async(req,res,next)=>{
    console.log(req.user);
   const {email} = req.user;
   // console.log({email});
   const adminUSer  = await User.findOne({email});
     // console.log(adminUSer);
   if(adminUSer.role !== "admin"){
    throw new Error (`You are not an Admin`)
   }
   else{
    next();
   }

})

module.exports = {authMiddleware,isAdmin};