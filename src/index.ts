import express,{Express} from 'express';
import bodyParser from 'body-parser';
import serverConfig from './config/serverConfig';
import apiRouter from './routes';
import sampleQueueProducer from './producers/sampleQueueProducer';
import SampleWorker from './workers/SampleWorker';

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
});