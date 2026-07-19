const { ImageKit } = require("@imagekit/nodejs");

const imagekitClient = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "missing_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/missing_endpoint",
});

async function uploadFile(file) {
  const result = imagekitClient.files.upload({
    file,
    fileName: "Music_" + Date.now(),
    folder: "Spotify-Clone/music",
  });

  return result;
}

module.exports = { uploadFile };
