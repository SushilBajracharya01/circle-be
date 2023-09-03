import express from 'express';
import path from 'path';
import fileDirName from '../utilities/file-dir-name.js';

//
export const router = express.Router();
const { __dirname } = fileDirName(import.meta);

//
router.get('^/$|/index(.html)?', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'views', 'index.html'));
})