import api from "../api/axios";

export const getAllMusic = async () => {
  const response = await api.get("/music/");
  return response.data.musics;
};

export const createMusic = async (formData) => {
  const response = await api.post("/music/createMusic", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const createAlbum = async (payload) => {
  const response = await api.post("/music/album", payload);
  return response.data;
};

export const deleteMusic = async (id) => {
  const response = await api.delete(`/music/${id}`);
  return response.data;
};

export const getAllAlbums = async () => {
  const response = await api.get("/music/albums");
  return response.data.albums;
};

export const getAlbumById = async (albumId) => {
  const response = await api.get(`/music/albums/${albumId}`);
  return response.data.albums;
};