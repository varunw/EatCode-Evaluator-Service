// import Docker from 'dockerode';

// import { TestCase } from '../types/testCases';

import { JAVA_IMAGE } from '../utils/constants';

import createContainer from './containerFactory';
import { decodeDockerStream } from './dockerHelper';
import pullImage from './pullImage';

async function runJava(code:string,inputTestCase:string){

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

    await new Promise((res)=>{
        loggerStream.on('end',()=>{
            console.log(rawLogBuffer);
            const completeBuffer = Buffer.concat(rawLogBuffer);
            const decodedStream = decodeDockerStream(completeBuffer);
            console.log(decodedStream);
        });
        res(decodeDockerStream);
    })

    await javaDockerContainer.remove();


    return javaDockerContainer;
}

export default runJava;

