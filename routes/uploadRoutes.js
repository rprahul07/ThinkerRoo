const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { uploadPhoto, deletePhoto } = require('../controllers/uploadController');

router.use(verifyToken);

router.post('/', upload.single('photo'), uploadPhoto);
router.delete('/', deletePhoto);

module.exports = router;
