import mongoose from 'mongoose'
import bcryptjs from 'bcryptjs' //password Hashing 

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true ,'Please Provide a name'],
        trim:true, //removing white spaces from both ends
    },

    email:{
        type:String,
        required:[true ,'Please provide an email'],
        unique:true,
        lowercase:true,
        trim:true,
        match:[/^\S+@\S+\.\S+$/, 'Please provide a valid email'] // Regex for email validation
    },

    password:{
        type: String,
        required: [true , 'Please provide a password'],
        minlength: 6,
        select:false,
    },

    isAdmin:{
        type:Boolean,
        ref:'Product' //it references the product model
    },
    
    wishlist:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product' //it references the product model
    }],
    
    cart:[{
        product:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Product', //it references the product model
            required:true,
        },
        quantity:{
            default:1,
            required:true,
            type:Number,
            min:1,
        }
    }]
},{
    timestamps:true,
})


/**
 * Pre-save middleware - Runs before saving a user document
 * Hashes the password if it's new or has been modified
 */

userSchema.pre('save' , async function(next){
    //only hash the password if its new or modified
    if (!this.isModified('password')) {
        return next();
    }

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password , salt);
        next()
    } catch (error) {
        next(error)
    }
})

userSchema.methods.comparePassword = async function(enteredPassowrd){
    return await bcryptjs.compare(enteredPassowrd, this.password)
}

const User = mongoose.model('User', userSchema)
export default User;