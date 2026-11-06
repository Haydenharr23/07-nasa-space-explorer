# Project 7: NASA API - Space Explorer App
NASA releases a new "Astronomy Picture of the Day" (APOD) every day—spotlighting breathtaking images of galaxies, stars, planets, and more.

Your task is to build an interactive web app that fetches and displays these photos using [NASA's API](https://api.nasa.gov/). Users will pick a date range and instantly view stunning photos from across the cosmos, along with titles and descriptions.

You'll get to use your skills to build something that's actually connected to real-world data from one of the most iconic organizations in the world.

## Run locally

The app uses a small Node.js server to keep the NASA API key out of browser code. Use Node.js 20.6 or newer.

1. Copy `.env.example` to `.env` and add your NASA API key to the `NASA_API_KEY` value. The `.env` file is ignored by Git and must not be committed.

2. Start the app, loading the key from `.env`:

   ```sh
   node --env-file=.env server.js
   ```

3. Open [http://localhost:8000](http://localhost:8000).

The API key is only used by the local server and should never be added to a browser file or committed to GitHub. Static hosting such as GitHub Pages cannot run the server-side API proxy; deploy this project to a Node.js host and configure `NASA_API_KEY` as a private environment variable there.
