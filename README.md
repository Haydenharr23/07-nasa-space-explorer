# Project 7: NASA API - Space Explorer App
NASA releases a new "Astronomy Picture of the Day" (APOD) every day—spotlighting breathtaking images of galaxies, stars, planets, and more.

Your task is to build an interactive web app that fetches and displays these photos using [NASA's API](https://api.nasa.gov/). Users will pick a date range and instantly view stunning photos from across the cosmos, along with titles and descriptions.

You'll get to use your skills to build something that's actually connected to real-world data from one of the most iconic organizations in the world.

## Run locally

The app uses a small Node.js server to keep the NASA API key out of browser code. Use Node.js 18 or newer.

1. In a terminal, set your NASA API key as an environment variable:

   ```sh
   export NASA_API_KEY="your-nasa-api-key"
   ```

2. Start the app:

   ```sh
   node server.js
   ```

3. Open [http://localhost:8000](http://localhost:8000).

The API key is only used by the local server and should never be added to a source file or committed to GitHub.
