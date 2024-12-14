// import Docker from 'dockerode';

// import { TestCase } from '../types/testCases';

import { PYTHON_IMAGE } from '../utils/constants';

import createContainer from './containerFactory';
import { decodeDockerStream } from './dockerHelper';
import pullImage from './pullImage';

async function runPython(code:string,inputTestCase:string){

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

    await new Promise((res)=>{
        loggerStream.on('end',()=>{
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
        });
        res(decodeDockerStream);
    })

    await pythonDockerContainer.remove();


    return pythonDockerContainer;
}

export default runPython;

