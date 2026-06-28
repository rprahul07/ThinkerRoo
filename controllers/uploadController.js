const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { randomUUID } = require('crypto');
const path = require('path');

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

const uploadPhoto = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file provided.' });
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const key = `uploads/${req.user.id}/${randomUUID()}${ext}`;

  try {
    await s3.send(new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }));

    const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    return res.status(201).json({ success: true, url, key });
  } catch (err) {
    console.error('S3 upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed.' });
  }
};

const deletePhoto = async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ success: false, message: 'key is required.' });
  }

  // Prevent users from deleting other users' files
  if (!key.startsWith(`uploads/${req.user.id}/`)) {
    return res.status(403).json({ success: false, message: 'Forbidden.' });
  }

  try {
    await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
    return res.json({ success: true, message: 'File deleted.' });
  } catch (err) {
    console.error('S3 delete error:', err);
    return res.status(500).json({ success: false, message: 'Delete failed.' });
  }
};

module.exports = { uploadPhoto, deletePhoto };
