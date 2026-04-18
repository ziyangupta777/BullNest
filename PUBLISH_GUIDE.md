# 🚀 BullNest Publishing Guide

Follow these steps to take your project from your computer to a live website.

## 1. Upload to GitHub
1.  Go to [github.com](https://github.com) and create a new repository named `bullnest`.
2.  Open your terminal in the `bullnest` folder and run:
    ```bash
    git init
    git add .
    git commit -m "Initial commit - SQLite Migration"
    git branch -M main
    git remote add origin YOUR_GITHUB_REPO_URL
    git push -u origin main
    ```

## 2. Deploy to Render (Recommended Free Hosting)
1.  Log in to [Render.com](https://render.com).
2.  Click **New +** and select **Web Service**.
3.  Connect your GitHub repository.
4.  Use these settings:
    - **Name**: `bullnest`
    - **Environment**: `Node`
    - **Build Command**: `cd backend && npm install`
    - **Start Command**: `cd backend && node server.js`
5.  Click **Advanced** and add these **Environment Variables**:
    - `JWT_SECRET`: (Anything secure, like `bullnest_secret_2025`)
    - `NODE_ENV`: `production`

## 3. Handling the Database (SQLite)
Since Render's free tier has ephemeral storage (it wipes files when it restarts), your database will reset occasionally.
**For a permanent database:**
1.  In Render, go to the **Dashboard** of your service.
2.  Go to **Disks** and click **Add Disk**.
3.  Mount it at `/data`.
4.  Update your `backend/config/database.js` storage path to `/data/bullnest.sqlite`.

## 4. Custom Domain (bullnest.in)
Once your app is live on Render (e.g., `bullnest.onrender.com`):
1.  Buy `bullnest.in` from a registrar like GoDaddy.
2.  In Render settings, go to **Custom Domains** and add `bullnest.in`.
3.  Follow the instructions to update your DNS (CNAME and A records).

---
**Need help with any of these steps? Just ask!**
