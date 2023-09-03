import path from 'path';
import { v4 } from 'uuid';
import { format } from 'date-fns';
import fs, { promises } from 'fs';
import fileDirName from '../utilities/file-dir-name.js';

const { __dirname } = fileDirName(import.meta);

//
export const logEvents = async (message, logFileName) => {
    const dateTime = `${format(new Date(), 'yyyyMMdd\tHH:mm:ss')}`;
    const logItem = `${dateTime}\t${v4()}\t${message}\n`;
    
    try {
        if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
            await promises.mkdir(path.join(__dirname, '..', 'logs'));
        }
        await promises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
    }
    catch (error) {
        console.log(error)
    }
}

//
export const logger = (req, res, next) => {
    //TODO: ADD conditions to insert logs data only if its from error
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
}