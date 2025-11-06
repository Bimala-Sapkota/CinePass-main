import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 character']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ],
        lowercase: true,
        trim: true,
    },
    phone: {
        type: String,
        maxlength: [15, 'Phone number cannot be longer than 15 characters'],
        match: [/^\+?[1-9]\d{1,14}$/, 'Please add a valid phone number']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    avatar: {
        url: {
            type: String,
            default: '/default-avatar.png'
        },
        public_id: { type: String }
    },
    watchHistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Movie'
        }
    ],
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    preferredLanguage: {
        type: String,
        enum: ['english', 'nepali'],
        default: 'english'
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, { timestamps: true })




//Encrypt password before saving using bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//Sign JWT and return
userSchema.methods.getSignedJwtToken = function () {
    return jwt.sign(
        {
            id: this._id,
            username: this.username,
            email: this.email,
            role: this.role
        }, process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_TOKEN_EXPIRE
        }
    )
}

userSchema.methods.matchPassword = async function (enteredPassword) {
    //match user entered password to hashed password
    let result = await bcrypt.compare(enteredPassword, this.password);
    return result;
}

export const User = mongoose.model('User', userSchema)

