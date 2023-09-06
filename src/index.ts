import { config } from "dotenv";
//
import cors from 'cors';
import path from 'path';
import express from "express";
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';


//middlewares
import { logger, logEvents } from './middleware/logger.js';
import { errorHandler } from "./middleware/errorHandler.js";

// configs
import { connectDB } from "./configs/dbConn.js";
import { corsOptions } from "./configs/corsOptions.js";

// utilities
import fileDirName from './utilities/file-dir-name.js'

// routes
import { router } from "./routes/root.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import circleRouter from "./routes/circleRoutes.js";
import postRouter from "./routes/postRoutes.js";

const { __dirname } = fileDirName(import.meta);

// dotenv configuration
config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(logger);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({extended: true})); 


// Routings

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/', router);

app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/circle', circleRouter);
app.use('/post', postRouter);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
app.all('*', (req: any, res: any) => {
    res.status(404);
    if (req.accepts('html')) {
        res.sendFile(path.join(__dirname, 'views', '404.html'));
    }
    else if (req.accepts('json')) {
        res.json({
            message: '404 Not Found'
        })
    }
    else {
        res.type('txt').send('404 not found')
    }
});

app.use(errorHandler);

mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on ${PORT}`))
})

mongoose.connection.on('error', err => {
    console.log(err);
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log');
})
