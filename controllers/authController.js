import User from "../models/user.js";
import jwt from 'jsonwebtoken';


const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET,{
        expiresIn:'30d'
    })
}


const registerUser = async(req , res)=>{
    try {
        const {name , email , password} = req.body

        //validate input
        if(!name || !email || !password){
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        //check if user already exists
        const UserExists = await User.findOne({email});
        if(UserExists){
            return res.status(400).json({ message: 'User already exists' });
        }

        //create new user  , password will be hashed by  presave middleware
        const user = await User.create({
            name ,
            email,
            password
        })

        //if user Created successfully , send response with token
        if(user){
            res.status(201).json({
                _id:user._id,
                name:user.name,
                email:user.email,
                isAdmin:user.isAdmin,
                token:generateToken(user._id)
            })
        }else{
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const loginUser = async(req, res)=>{
    try {
        const {email , password} = req.body

        if(!email || !password){
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        // now find the user and include the password field
        const user = await User.findOne({email}).select('+password')

        //now check if user exists and password matches 
        if(user && (await user.comparePassword(password))){
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                token: generateToken(user._id)
            })
        }else{
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getUserProfile = async (req, res) => {
  try {
    // req.user is set by protect middleware
    const user = await User.findById(req.user._id).populate('wishlist').populate('cart.product');

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        wishlist: user.wishlist,
        cart: user.cart
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Update fields if provided
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      
      // Update password if provided
      if (req.body.password) {
        user.password = req.body.password; // Will be hashed by pre-save middleware
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export {registerUser , loginUser , updateUserProfile , getUserProfile}