# Spotify Clone: Ultimate Free Deployment Guide

This guide will walk you through deploying your full-stack Spotify Clone to the internet completely for free. We will use **MongoDB Atlas** for the database, **Render** for the Node.js backend, and **Vercel** for the React frontend.

---

## 🏗️ Phase 1: Preparation (GitHub)

Before you begin, your code needs to be pushed to GitHub so these cloud providers can read it.

1. Create a free account on [GitHub](https://github.com/).
2. Create a new repository (e.g., `spotify-clone`).
3. Open your terminal in your local project folder (`d:\Full-Stack-WD\Backend\Spotify-Clone`) and run:
   ```bash
   git init
   git add .
   git commit -m "Ready for production"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/spotify-clone.git
   git push -u origin main
   ```
> [!IMPORTANT]
> Make sure your `.env` files are added to your `.gitignore` file. You **never** want to upload your secret keys to GitHub.

---

## 🗄️ Phase 2: Database Setup (MongoDB Atlas)

You are likely already using MongoDB. If you are using a local MongoDB instance, you need to migrate it to the cloud.

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) and create a free account.
2. Build a Database using the **M0 Free** cluster tier.
3. Under **Database Access**, create a new database user (save the username and password).
4. Under **Network Access**, click `Add IP Address` and select `Allow Access From Anywhere` (`0.0.0.0/0`).
5. Go back to your Cluster, click **Connect**, select **Drivers**, and copy your Connection String.
   - It will look like this: `mongodb+srv://<username>:<password>@cluster0.mongodb.net/SpotifyClone?retryWrites=true&w=majority`
6. Save this connection string; you will need it for the Backend deployment.

---

## ⚙️ Phase 3: Backend Deployment (Render)

Render is an amazing free platform for hosting Node.js servers.

1. Go to [Render.com](https://render.com/) and sign up using your GitHub account.
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your `spotify-clone` repository.
4. **Configuration Details:**
   - **Name**: `spotify-backend`
   - **Root Directory**: `backend` (This tells Render your backend is inside the `backend` folder).
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**: Scroll down and click `Add Environment Variable`. You must add everything from your backend `.env` file here:
   - `PORT` = `3000`
   - `DB_CONNECTION_STRING` = `mongodb+srv://<user>:<pass>@...` (from Phase 2)
   - `JWT_SECRET` = `(your long secret string)`
   - `IMAGEKIT_PUBLIC_KEY` = `(your key)`
   - `IMAGEKIT_PRIVATE_KEY` = `(your key)`
   - `IMAGEKIT_URL_ENDPOINT` = `(your endpoint)`
   - `FRONTEND_URL` = (Leave this blank for now, we will update it after Phase 4).
6. Click **Create Web Service**. 
7. Render will take a few minutes to build and deploy. Once it says "Live", copy the Render URL (e.g., `https://spotify-backend-xyz.onrender.com`).

---

## 🎨 Phase 4: Frontend Deployment (Vercel)

Vercel is the fastest and easiest way to host React/Vite applications for free.

1. Go to [Vercel.com](https://vercel.com/) and sign up with your GitHub account.
2. Click **Add New...** -> **Project**.
3. Import your `spotify-clone` repository from GitHub.
4. **Configuration Details:**
   - **Project Name**: `spotify-clone`
   - **Framework Preset**: `Vite`
   - **Root Directory**: Edit this and type `frontend`.
5. **Environment Variables**: Expand the environment variables section and add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://spotify-backend-xyz.onrender.com/api` (Use the URL you copied from Render in Phase 3, make sure to add `/api` at the end).
6. Click **Deploy**.
7. Wait 1-2 minutes. Once finished, Vercel will give you a live URL for your frontend (e.g., `https://spotify-clone-abc.vercel.app`).

---

## 🔗 Phase 5: The Final Link

Your frontend is now talking to your backend, but your backend might block it due to CORS security. We need to tell the backend to trust the new Vercel URL.

1. Go back to your [Render Dashboard](https://dashboard.render.com/).
2. Click on your `spotify-backend` Web Service.
3. Go to the **Environment** tab on the left side.
4. Add or update the variable:
   - **Key**: `FRONTEND_URL`
   - **Value**: `https://spotify-clone-abc.vercel.app` (Your Vercel URL. **Do not put a `/` at the very end**).
5. Click **Save Changes**. Render will automatically restart your backend.

---

## 🎉 Phase 6: You're Live!

Wait 2 minutes for Render to finish restarting. 

Then, open your Vercel URL on your phone or computer. 

Congratulations! Your Spotify Clone is now fully live on the internet, secure, production-ready, and costing you exactly **$0.00/month**.

> [!TIP]
> Render's free tier "spins down" (goes to sleep) after 15 minutes of inactivity. If you haven't opened your app in a while, the very first API request (like logging in or fetching songs) might take 30-50 seconds as the server wakes up. This is normal for free hosting!
