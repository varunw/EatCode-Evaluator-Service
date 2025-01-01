// import Docker from 'dockerode';

// import { TestCase } from '../types/testCases';

import CodeExecutorStrategy, { ExecutionResponse } from '../types/CodeExecutorStrategy';
import { PYTHON_IMAGE } from '../utils/constants';

import createContainer from './containerFactory';
import { decodeDockerStream } from './dockerHelper';
import pullImage from './pullImage';

class PythonExecutor implements CodeExecutorStrategy{
    async execute(code: string, inputTestCase: string): Promise<ExecutionResponse> {
        const rawLogBuffer:Buffer[] = [];
    console.log("Initializing New docker container");
    await pullImage(PYTHON_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > test.py && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | python3 test.py`;
    console.log(runCommand);
    const pythonDockerContainer = await createContainer(PYTHON_IMAGE,['python3','/bin/sh','-c',code,runCommand]);

    await pythonDockerContainer.start();

    console.log("Starting the Docker Container");

    const loggerStream = await pythonDockerContainer.logs({
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
        await pythonDockerContainer.remove();
    }




    // return codeResponse;
    // return pythonDockerContainer;

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
            // res(decodeDockerStream);
        })
    }
    
}



export default PythonExecutor;

