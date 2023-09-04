import path from 'path';
import multer from 'multer';

import DatauriParser from 'datauri/parser.js';

const storage = multer.memoryStorage();
const multerUploads = multer({ storage }).any();

const dataUriParser = new DatauriParser();
/**
* @description This function converts the buffer to data url
* @param {Object} req containing the field object
* @returns {String} The data url from the string buffer
*/
const dataUri = file => {
    if (!file) return null;
    const extName = path.extname(file.originalname).toString();
    const file64 = dataUriParser.format(extName, file.buffer);
    return file64.content;
};

export {
    multerUploads,
    dataUri
}