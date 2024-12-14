// import Docker from 'dockerode';

// import { TestCase } from '../types/testCases';

import { PYTHON_IMAGE } from '../utils/constants';

import createContainer from './containerFactory';
import { decodeDockerStream } from './dockerHelper';

async function runPython(code:string){

    const rawLogBuffer:Buffer[] = [];
    console.log("Initializing New docker container");
    const pythonDockerContainer = await createContainer(PYTHON_IMAGE,['python3','-c',code,'stty -echo']);

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

