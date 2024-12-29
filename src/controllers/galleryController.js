const multer = require("multer");
const fs = require("fs");
const Gallery = require("../models/galleryModel");

const upload = multer({ dest: "uploads/" });

const getGallery = async (req, res) => {
  try {
    const images = await Gallery.getAll();
    const transformedImages = images.map((image) => ({
      id: image.id,
      alt_text: image.alt_text,
      tags: image.tags,
      image: image.image ? Buffer.from(image.image).toString("base64") : null,
    }));
    res.status(200).json(transformedImages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const addImage = async (req, res) => {
  const { alt_text, tags } = req.body;
  const filePath = req.file?.path;

  if (!filePath) {
    return res.status(400).json({ error: "No image uploaded" });
  }

  try {
    // Read the file as a binary buffer
    const imageBuffer = fs.readFileSync(filePath);

    // Insert into the database
    const id = await Gallery.create({ image: imageBuffer, alt_text, tags });

    // Delete the file from the local filesystem
    fs.unlinkSync(filePath);

    console.log(req.body);
    res.status(201).json({
      message: "Image added successfully",
      data: { id, alt_text, tags: tags || null },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteImage = async (req, res) => {
  const { id } = req.params;
  try {
    await Gallery.delete(id);
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getGallery, addImage, deleteImage, upload };
