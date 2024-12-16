import express,{Express} from 'express';
import bodyParser from 'body-parser';
import serverConfig from './config/serverConfig';
import apiRouter from './routes';
import sampleQueueProducer from './producers/sampleQueueProducer';
import SampleWorker from './workers/SampleWorker';
// import runPython from './containers/runPythonDocker';
import SubmissionWorker from './workers/submissionWorker';
// import submissionQueue from './queues/submissionQueue';
import { submission_queue } from './utils/constants';
import submissionQueueProducer from './producers/submissionQueueProducer';

const app:Express = express();

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());
app.use(bodyParser.text());



app.use('/api',apiRouter);

app.listen(serverConfig.PORT,()=>{
    console.log(`Server started at port ${serverConfig.PORT}`);
    SampleWorker("SampleQueue");
    sampleQueueProducer('SampleJob',{
        name:"Varun",
        company:"Google",
        position:"SDE 3 L3",
        location:"London"
    },1);

    const inputCase = '10';

    const code = `#include <iostream> // For input and output

    // Function to add two numbers
    int addNumbers(int a, int b) {
        return a + b;
    }
    
    int main() {
        // Declare variables
        int num1, num2;
    
        // Prompt user for input
        std::cout << "Enter the first number: ";
        std::cin >> num1;
    
        std::cout << "Enter the second number: ";
        std::cin >> num2;
    
        // Call the function and store the result
        int sum = addNumbers(num1, num2);
    
        // Display the result
        std::cout << "The sum of " << num1 << " and " << num2 << " is: " << sum << std::endl;
    
        return 0;
    }
    `;
    
    SubmissionWorker(submission_queue);
    submissionQueueProducer({"1234":{
        language:"CPP",
        inputCase,
        code
    }});
    // const code = `print("Hello)`;
    // runPython(code,"100");
});