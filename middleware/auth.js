import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * Authentication Middleware - Protects routes that require login
 * Verifies JWT token and attaches user to request object
*/

const protect = async(req , res , next) =>{
    let token;

    //to check if the token exists in the authorization header
    //Format : "Bearer <token>""

    if(
        req.headers.authorization && req.headers.authorization.startsWith('Bearer')
    ){
        try {
            //extract token from "Bearer <Token>"
            token = req.headers.authorization.split(' ')[1];

            //verify token using secret key
            const decoded = jwt.verify(token , process.env.JWT_SECRET);

            //fetch user from the database using ID from token , and also exclude password field
            req.user = await User.findById(decoded.id).select('-password')

            //Check if user still exists
            if(!req.user){
                return res.status(401).json({message:'User not found'})
            }

            //user authenticated now move on to the next 
            next()
        } catch (error) {
            console.error('Token Verification error: ', error)
            return res.status(401).json({message:'Not authorized , token failed'})
        }
    }

    //no token found in the request
    if(!token){
        return res.status(401).json({message:'Not authorized , no Token'})
    }
};



/**
 * Admin Middleware - Ensures user has admin privileges
 * Must be used AFTER protect middleware
 */

const admin = (req, res ,next)=>{
    //check if user exists and is admin?
    if(req.user && req.user.isAdmin){
        next() // user is admin now proceed
    }else{
        res.status(403).json({ message: 'Not authorized as admin' });
    }
}

export { protect, admin };
