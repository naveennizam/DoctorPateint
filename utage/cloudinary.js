const cloudinary = require( "cloudinary");

// cloudinary.config({cloud_name : process.env.CLOUD_NAME,
//     api_key : process.env.API_KEY,
//     api_secret : process.env.SECRET_KEY,
//     secure : true
// });
cloudinary.config({
    cloud_name: "qwertynavi",
    api_key: "485926728772184",
    api_secret: "ftT2GxjgV8UfQ2Ki8kPvmTlHdbM",
    secure: true
})




const cloudinaryUploadImg = async(fileToUploads) =>{
    return new Promise((resolve)=>{
        cloudinary.uploader.upload(fileToUploads,(result)=>{
            resolve({
                url : result.secure_url,
            },
            {
                resource_type :"auto",
            });
        });
    });
};

module.exports = cloudinaryUploadImg;