import express from 'express';
import multer from 'multer';
import { uploadFile } from '../controllers/uploadController.js';

const router = express.Router();

// Multer config for memory storage
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            // Checking extension as fallback for some CSV mime types
            if (file.originalname.endsWith('.csv')) {
                cb(null, true);
            } else {
                cb(new Error('Only .csv files are allowed!'), false);
            }
        }
    },
});

router.post('/', upload.single('file'), uploadFile);

export default router;
