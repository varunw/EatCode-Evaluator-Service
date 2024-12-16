import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefination";
import { submissionPayload } from "../types/submissionPayload";
import runCpp from "../containers/runCppDocker";

export default class SubmissionJob implements IJob{
    name:string;
    payload: Record<string, submissionPayload>;
    constructor(payload:Record<string,submissionPayload>){
        this.payload = payload;
        this.name = this.constructor.name;
    }

    handle = async (job?:Job)=>{
        console.log("Handler of the job called");
        if(job){
            console.log(job.name,job.id,job.data);
            const key = Object.keys(this.payload)[0];
            console.log(this.payload[key].language);
            if(this.payload[key].language=="CPP"){
               const response = await runCpp(this.payload[key].code,this.payload[key].inputCase);
                console.log("Evaluated Response is : ",response);
            }
        }
    };

    failed=(job?:Job):void=>{
        console.log("Job failed");
        if(job){
            console.log(job.id);
        }
    }
}