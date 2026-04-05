const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const { storage: cloudStorage, isConfigured } = require('../utils/cloudinary');

let upload;

if (isConfigured()) {
    upload = multer({ storage: cloudStorage });
} else {
    // Fallback to local disk storage
    const diskStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'src/uploads/');
        },
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    });
    upload = multer({ storage: diskStorage });
}

// POST /api/upload
router.post('/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let url = req.file.path;
        if (!isConfigured()) {
            // If local storage, return relative path
            url = `/${req.file.filename}`;
        }

        res.status(201).json({
            message: 'Image uploaded successfully',
            url: url
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
