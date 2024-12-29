const express = require("express");
const router = express.Router();
const { getGallery, addImage, deleteImage, upload } = require("../controllers/galleryController");

router.get("/", getGallery);
router.post("/", upload.single("image"), addImage);
router.delete("/:id", deleteImage);

module.exports = router;
