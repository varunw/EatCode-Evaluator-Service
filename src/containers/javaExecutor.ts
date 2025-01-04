// import Docker from 'dockerode';

// import { TestCase } from '../types/testCases';

import CodeExecutorStrategy, { ExecutionResponse } from '../types/CodeExecutorStrategy';
import { JAVA_IMAGE } from '../utils/constants';

import createContainer from './containerFactory';
import { decodeDockerStream } from './dockerHelper';
import pullImage from './pullImage';

class JavaExecutor implements CodeExecutorStrategy{
    async execute(code: string, inputTestCase: string,outputCase:string): Promise<ExecutionResponse> {
        console.log(outputCase);
        const rawLogBuffer:Buffer[] = [];
    console.log("Initializing New docker container");
    await pullImage(JAVA_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > Main.java && javac Main.java && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | java Main`;
    console.log(runCommand);
    const javaDockerContainer = await createContainer(JAVA_IMAGE,['java3','/bin/sh','-c',code,runCommand]);

    await javaDockerContainer.start();

    console.log("Starting the Docker Container");

    const loggerStream = await javaDockerContainer.logs({
        stdout:true,
        stderr:true,
        timestamps:false,
        follow:true,
    });

    loggerStream.on('data',(chunk)=>{
        rawLogBuffer.push(chunk);
    })
    
    try {
        const codeResponse:string=await this.fetchDecodedStream(loggerStream,rawLogBuffer);
        return {output:codeResponse,status:"Completed"};
    } catch (error) {
        return {output:error as string,status:"Error"}
    } finally{
        await javaDockerContainer.remove();
    }
    
    // await javaDockerContainer.remove();


    // return javaDockerContainer;
    }

    fetchDecodedStream(loggerStream:NodeJS.ReadableStream,rawLogBuffer:Buffer[]):Promise<string>{
        return new Promise((res,rej)=>{
            loggerStream.on('end',()=>{
                console.log(rawLogBuffer);
                const completeBuffer = Buffer.concat(rawLogBuffer);
                const decodedStream = decodeDockerStream(completeBuffer);
                console.log(decodedStream);
                if(decodedStream.stderr){
                    rej(decodedStream.stderr);
                }else{
                    res(decodedStream.stdout);
                }
            });
            
        })
    
    }
    
}



export default JavaExecutor;

