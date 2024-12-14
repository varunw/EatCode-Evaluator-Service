// import Docker from 'dockerode';

// import { TestCase } from '../types/testCases';

import { CPP_IMAGE } from '../utils/constants';

import createContainer from './containerFactory';
import { decodeDockerStream } from './dockerHelper';
import pullImage from './pullImage';

async function runCpp(code:string,inputTestCase:string){

    const rawLogBuffer:Buffer[] = [];
    console.log("Initializing New docker container");
    await pullImage(CPP_IMAGE);
    const runCommand = `echo '${code.replace(/'/g, `'\\"`)}' > main.cpp && g++ main.cpp -o main && echo '${inputTestCase.replace(/'/g, `'\\"`)}' | stdbuf -oL -eL ./main`;
    console.log(runCommand);
    const CppDockerContainer = await createContainer(CPP_IMAGE,['Cpp3','/bin/sh','-c',code,runCommand]);

    await CppDockerContainer.start();

    console.log("Starting the Docker Container");

    const loggerStream = await CppDockerContainer.logs({
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

    await CppDockerContainer.remove();


    return CppDockerContainer;
}

export default runCpp;

