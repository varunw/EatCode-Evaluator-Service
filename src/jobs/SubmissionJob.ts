import { Job } from "bullmq";
import { IJob } from "../types/bullMqJobDefination";
import { submissionPayload } from "../types/submissionPayload";
import runCpp from "../containers/runCppDocker";
import createExecutor from "../utils/ExecutorFactory";
import { ExecutionResponse } from "../types/CodeExecutorStrategy";

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
            const codeLanguage = this.payload[key].language;
            const code = this.payload[key].code;
            const inputTestCase = this.payload[key].inputCase;
            const outputTestCase = this.payload[key].outputCase;
            const strategy = createExecutor(codeLanguage);
            console.log(this.payload[key].language);
            // if(this.payload[key].language=="CPP"){
            //    const response = await runCpp(this.payload[key].code,this.payload[key].inputCase);
            //     console.log("Evaluated Response is : ",response);
            // }
            if(strategy!=null){
                const response : ExecutionResponse = await strategy.execute(code,inputTestCase,outputTestCase);
                if(response.status == "COMPLETED"){
                    console.log("Code executed successfully");
                    console.log(response);
                }else{
                    console.log("Something went wrong with code execution");
                    console.log(response);
                }
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