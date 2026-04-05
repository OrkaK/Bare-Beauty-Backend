const multer = require('multer');
const { storage, isConfigured } = require('../utils/cloudinary');

let upload;

if (isConfigured()) {
    upload = multer({ storage: storage });
} else {
    // Fallback to local disk storage for development without Cloudinary keys
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

module.exports = upload;

