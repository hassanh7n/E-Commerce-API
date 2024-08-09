const {StatusCodes} = require('http-status-codes');
const User = require('../model/userModel');
const CustomError = require('../errors');
const crypto = require('crypto')
const Token = require('../model/tokenModel');
    const {  
        attachCookiesToResponse,
        createTokenUser,
        sendVerificationEmail,
        sendResetPasswordEmail,
        hashString
    } = require('../utils')
const jwt = require('jsonwebtoken');

const register = async(req, res) => {
    const { email, password, name } = req.body;

    const isAlreadyExistedEmail = await User.findOne({email});

    if(isAlreadyExistedEmail){
        throw new CustomError.BadRequestError("Email already existed")
    };

    const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'user';

  const verificationToken = crypto.randomBytes(40).toString('hex');
  const user = await User.create({ name, email, password, role, verificationToken });
    const origin = "http://localhost:3000"

    console.log(req)
    //rawHeaders:
    // const tempOrigin = req.get('origin');
    // console.log(`Origin : ${tempOrigin}`)
    // const protocol = req.ptotocol;
    // console.log(`protocol : ${protocol}`);
    // const host = req.get(('host'));
    // console.log(`host : ${host}`)
    // const forwardedProtocol = req.get('x-forwarded-proto');
    // const forwadedHost = req.get('x-forwarded-host');
    // console.log(`forqarded host :  : ${forwadedHost}`)
    // console.log(`forqarded protocol :  : ${forwardedProtocol}`)

  await sendVerificationEmail({
    name : user.name,
    email : user.email,
    verificationToken : user.verificationToken,
    origin
  })

//   const tokenUser = createTokenUser(user)
  

//     attachCookiesToResponse({res, user : tokenUser})

    // res.status(StatusCodes.CREATED).json({
    //     user : tokenUser
    // })
    res.status(StatusCodes.CREATED).json({
        msg : "Success! Please check your email to verify account",
    })
}

const logIn = async(req, res) => {

    const {email, password} = req.body;
    if(!email || !password){
        throw new CustomError.BadRequestError("There is no email and password")
    }

    const user = await User.findOne({email})


    if(!user){
        throw new CustomError.UnauthenticatedError("User does not exist")
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError("Invalid credentials")
    }
    if(!user.isVerified){
        throw new CustomError.BadRequestError("Please verify your email!")
    }

    const tokenUser = createTokenUser(user)


    //create refresh token
    let refreshToken = ''

    const existingToken = await Token.findOne({user : user._id});

    if(existingToken){
        const {isValid} = existingToken;
        if(!isValid){
            throw new CustomError.UnauthenticatedError("Invalid credentials")
        }
        refreshToken = existingToken.refreshToken
        attachCookiesToResponse({res, user : tokenUser, refreshToken})
        res.status(StatusCodes.OK).json({
            user : tokenUser,
        })
        return 
    }

    //check for existing token
    refreshToken = crypto.randomBytes(40).toString('hex');
    const userAgent = req.headers['user-agent'];
    const ip = req.ip;
    const userToken = {refreshToken, ip, user : user._id, userAgent}

    await Token.create(userToken);
    
    attachCookiesToResponse({res, user : tokenUser, refreshToken})


    res.status(StatusCodes.OK).json({
        user : tokenUser,
    })
}


const logOut = async(req, res) => {

    await Token.findOneAndDelete({user : req.user.userId});
    

    res.cookie('accessToken', 'logout', {
        httpOnly : true,
        expires : new Date(Date.now()),
    })

    res.cookie('refreshToken', 'logout', {
        httpOnly : true,
        expires : new Date(Date.now()),
    })
    res.status(StatusCodes.OK).json({
        msg : "User LogOut"
    })
}

const verifyEmail = async(req, res) => {
    const {verificationToken, email} = req.body;

    const user = await User.findOne({email});
    if(!user){
        throw new CustomError.BadRequestError(`Verification failed! email`)
    }

    if(user.verificationToken !== verificationToken){
        throw new CustomError.BadRequestError(`Verification failed! token`)
    }

    user.isVerified = true,
    user.verified = Date.now()
    user.verificationToken = ''
    await user.save()

    res.status(StatusCodes.OK).json({
        msg : 'Email verified'
    })
}


const forgotPassword = async(req, res) => {
    const {email} = req.body;
    const origin = "http://localhost:3000"
    if(!email){
        throw new CustomError.BadRequestError("Please provide email")
    }

    const user = await User.findOne({email})
    if(!user){
        throw new CustomError.BadRequestError(`No user with this email : ${email}`)
    }
    if(user){
        const passwordToken = crypto.randomBytes(70).toString('hex');


        await sendResetPasswordEmail({
            email : user.name,
            email : user.email,
            token : passwordToken,
            origin
        })

        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes)

        user.passwordToken = hashString( passwordToken );
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;

        await user.save()
    }
    res.send(StatusCodes.OK).send(
        "Please check your email"
    )
}

const resetPassword = async(req, res) => {
    const {email , token, password} = req.body;
    if (!token || !email || !password) {
        throw new CustomError.BadRequestError('Please provide all values');
    }

    const user = await User.findOne({ email });


    if (user) {
        const currentDate = new Date();
    
        if (
          user.passwordToken === hashString( token ) &&
          user.passwordTokenExpirationDate > currentDate
        ) {
          user.password = password;
          user.passwordToken = null;
          user.passwordTokenExpirationDate = null;
          await user.save();
        }
      }
    
      res.send('reset password');

}

module.exports = {
    register,
    logIn,
    logOut,
    verifyEmail,
    forgotPassword,
    resetPassword
}