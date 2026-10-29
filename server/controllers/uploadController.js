export const uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image file uploaded.' });
  }

  // Returns relative path matching resolveImageUrl in frontend
  const imageUrl = `/uploads/${req.file.filename}`;

  return res.status(201).json({
    message: 'Image uploaded successfully',
    imageUrl,
    filename: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
};
