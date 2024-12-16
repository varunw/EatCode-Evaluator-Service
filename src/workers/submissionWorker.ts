import { Job, Worker } from "bullmq";
import SubmissionJob from "../jobs/SubmissionJob";
import redisConnection from "../config/redisConfig";



export default function SubmissionWorker(queueName:string){
    new Worker(
        queueName,
        async(job:Job)=>{
            if(job.name == 'SubmissionJob'){
                const submissionJobInstance = new SubmissionJob(job.data);

                submissionJobInstance.handle(job);

                return true;
            }
        },
        {
            connection:redisConnection
        }
    )
}