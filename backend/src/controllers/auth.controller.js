import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
export const signup=async (req,res)=>{
    const {email,username,password}=req.body;
    try{
        if(!email || !username || !password){
            return res.status(400).json({message:"All fields are required"});
        }
        if (password.length<6){
            return res.status(400).json({
                message:"Password must be atleast 6 characters"
            });
        }
        const user=await User.findOne({email});
        if(user){
            return res.status(400).json({message:"Email already exists"})
        };
        const user2=await User.findOne({username});
        if(user2){
            return res.status(400).json({message:"Username already exists"})
        };
        const salt = await bcrypt.genSalt(10);
        const hashedPassword= await bcrypt.hash(password,salt);
        const newUser= new User({
            email,username,password:hashedPassword
        });
            if(newUser){
                // generate JWT token here
                generateToken(newUser._id,res);
                await newUser.save();
                return res.status(201).json({
                    _id: newUser._id,
                    username:newUser.username,
                    email:newUser.email,
                    profilepic:newUser.profilePic,
                });}
            else{
                return res.status(400).json({message:"Invalid user data"});
            }
        }
        catch(error){
            console.log(error.message);
            return res.status(500).json({message:"Internal server error"});
        }

    };
export const login=async (req,res)=>{
    const {email,username,password}=req.body; // Note: You're accepting both email and username, but only querying by email
    try{
        // Adjust query to find by either email or username, depending on your login strategy
        const user=await User.findOne({ $or: [{ email: email }, { username: username }] }); 

        if(!user){
            return res.status(400).json({message:"Invalid credentials"})
        };
        const isPasswordCorrect= await bcrypt.compare(password,user.password);
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"})
        }

    
        generateToken(user._id, res); 


        return res.status(200).json({
                _id: user._id,
                username:user.username,
                email:user.email,
                profilepic:user.profilePic,
            });
    }catch(error){
        console.log("Error in login controller",error);
        return res.status(500).json({message:"Internal server error"});
    }
};
export const logout=(req,res)=>{
    try{
        res.cookie("jwt","",{maxAge:0});
        return res.status(200).json({message:"You have been logged out"});
    }
    catch(error){
        console.log("error in logout controller",error);
        return res.status(500).json({message:"Internal server error"});
    }
};
export const updateProfile=async (req,res)=>{
    try{
    const {profilePic}= req.body;
    const userId=req.user._id;

    if(!profilePic){
        return res.status(400).json({message:"invalid profielpic"})
    };
    const uploadedResponse= await cloudinary.uploader.upload(profilePic);
    const updatedUser= await User.findByIdAndUpdate(userId,{profilePic:uploadedResponse.secure_url},{new:true})
    res.status(200).json(updatedUser);
    }
    catch(error){
        console.log("Error in update profile",error)
        return res.status(500).json({message:"Internal server error"});
    }
}
export const checkAuth=(req,res)=>{
    try{
        return res.status(200).json(req.user);
    }
    catch(error){
        console.log("Error in check Auth",error)
        return res.status(500).json({message:"Internal server error"});
    }
};
