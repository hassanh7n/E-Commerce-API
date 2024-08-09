const mongoose = require('mongoose');
const validator = require('validator')
const bcryptjs = require('bcryptjs')

const UserModel = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Please provide your name"],
        maxlength : 20
    },
    email : {
        type : String,
        required : [true, "Please provide email address"],
        unique : true,
        validate : {
            validator : validator.isEmail,
            message : "Please provide valid email"
        }
    },
    password : {
        type : String,
        required : [true, "Please provide password"],
        minlength : 6
    },
    role: {
        type : String,
        enum : ["admin", "user"],
        default : "user"
    },
    verificationToken : {
        type : String
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    verified : Date,
    passwordToken: {
        type: String,
    },
    passwordTokenExpirationDate: {
        type: Date,
    },
})


UserModel.pre('save', async function(){
    if(!this.isModified('password')) return;
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
})


UserModel.methods.comparePassword = async function(canditatePassword){
    const isMatch = await bcryptjs.compare(canditatePassword, this.password);
    return isMatch;
}



module.exports = mongoose.model("User", UserModel);