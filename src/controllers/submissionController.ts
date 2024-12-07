// import { Request,Response } from "express";
import { CreateSubmissionDto } from "../dtos/CreateSubmissionDto";

export function addSubmission(req:any,res:any){
    const submissionDto = req.body as CreateSubmissionDto;

    return res.status(201).json({
        success:true,
        error:{},
        message:"Successafully collected the Submission",
        data:submissionDto
    })
}