
import { Request, Response } from "express";

export const pingCheck = (req:any,res:any)=>{
    console.log(req.url);
    return res.status(200).json({
        message:"Ping Check On",
    });
};