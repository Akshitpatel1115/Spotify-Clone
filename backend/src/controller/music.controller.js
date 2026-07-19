const cookieParser = require("cookie-parser");
const musicModel = require("../models/music.model");
const albumModel = require("../models/album.model");
const jwt = require("jsonwebtoken");
const { uploadFile } = require("../services/storage.service");

async function createMusic(req, res) {
  try {
    const { title } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No music file provided." });
    }

    const result = await uploadFile(file.buffer.toString("base64"));

    const music = await musicModel.create({
      uri: result.url,
      title,
      artist: req.user.id,
    });

    res.status(201).json({
      message: "Music create successfuly.",
      music: {
        id: music._id,
        uri: music.uri,
        title: music.title,
        artist: music.artist,
      },
    });
  } catch (error) {
    console.error("Error creating music:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}

async function createAlbum(req, res) {
  try {
    const { title, musics } = req.body;

    if (!Array.isArray(musics) || musics.length === 0) {
      return res.status(400).json({ message: "Please provide an array of track IDs." });
    }

    // Validate that all provided track IDs belong to the current artist
    const validTracks = await musicModel.find({
      _id: { $in: musics },
      artist: req.user.id
    });

    if (validTracks.length !== musics.length) {
      return res.status(403).json({ 
        message: "Validation failed: You can only add tracks that you have published." 
      });
    }

    const album = await albumModel.create({
      title,
      musics: musics,
      artist: req.user.id,
    });

    res.status(201).json({
      message: "Album created successfully.",
      album: {
        id: album._id,
        title: album.title,
        musics: album.musics,
        artist: album.artist,
      },
    });
  } catch (error) {
    console.error("Error creating album:", error);
    res.status(500).json({ message: error.message || "Internal server error" });
  }
}

async function getAllMusics(req, res) {
  const musics = await musicModel
  .find()
  .populate("artist", "username email");

  res.status(200).json({
    message: "Musics fetched successfuly.",
    musics: musics,
  });
}

async function getAllAlbums(req, res) {
  const albums = await albumModel
    .find()
    .select("title artist")
    .populate("artist", "username email");

  res.status(200).json({
    message: "Albums fetch successfuly.",
    albums: albums,
  });
}

async function getAlbumById(req, res) {
  const albumId = req.params.albumId;

  const albums = await albumModel.findById(albumId).populate('artist', 'username email').populate('musics')

  res.status(200).json({
    message: "Albums fetch successfuly.",
    albums: albums,
  });
}

module.exports = {
  createMusic,
  createAlbum,
  getAllMusics,
  getAllAlbums,
  getAlbumById,
};
