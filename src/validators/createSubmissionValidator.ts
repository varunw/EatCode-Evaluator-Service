import { ZodSchema } from "zod";
// import { CreateSubmissionDto } from "../dtos/CreateSubmissionDto";

export const validate = (schema:ZodSchema<any>)=>(req:any,res:any,next:any)=>{
    try {
      schema.parse({
        ...req.body
      });
      next();  
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:"Invalid Request Params Recieved",
            data:{},
            error:error
        });
    }
}