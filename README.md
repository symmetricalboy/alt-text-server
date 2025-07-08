# Alt Text Server

Node.js Express server that proxies requests to the Google Gemini API for generating alt text and video captions. Designed for deployment on [Railway](https://railway.app).

## Features

-   Provides a secure endpoint for the [Alt Text Extension](https://github.com/your-github/alt-text-ext) and [Web App](https://github.com/your-github/alt-text-web).
-   **Specialized AI Instructions**: Uses dedicated instruction sets optimized for each request type:
    - VTT caption generation with precise WebVTT formatting requirements
    - Still image alt text generation for static images
    - Animated content descriptions for GIFs and short videos
    - Full video alt text for comprehensive video content
    - Video frame descriptions for single extracted frames
    - Text condensation for length optimization
-   **Smart Content Detection**: Automatically selects appropriate instruction sets based on media type and characteristics
-   Handles CORS and request validation.
-   Adapts the original Google Cloud Function logic to run as a standard Express server.
-   Includes a `/health` endpoint for deployment health checks.

## API Endpoint

-   `POST /generate-alt-text`

    This is the main endpoint that receives requests for alt text generation, video captioning, and text condensation. It expects a JSON body with the same structure as the original `generateAltTextProxy` function.

## Request Types and AI Instructions

The server uses specialized instruction sets tailored for different types of content:

### 1. VTT Caption Generation
- **Trigger**: `req.body.action === 'generateCaptions'`
- **Use Case**: Creating properly formatted WebVTT subtitle files for videos with audio
- **Features**: Precise timestamp formatting, audio transcription, sound effect notation

### 2. Still Image Alt Text
- **Trigger**: Static images (JPEG, PNG, etc.) without animation
- **Use Case**: Describing photographs, illustrations, screenshots, diagrams
- **Features**: Concise descriptions, text transcription, clinical objectivity

### 3. Animated Content Alt Text  
- **Trigger**: Animated GIFs, animated WebP, APNG, or short videos treated as animations
- **Use Case**: Describing looping animations and short motion content
- **Features**: Complete sequence description, motion capture, unified narrative

### 4. Full Video Alt Text
- **Trigger**: Standard video files (MP4, WebM) with `isVideo=true`
- **Use Case**: Comprehensive description of video content and narrative
- **Features**: Scene progression, visual narrative, comprehensive coverage

### 5. Video Frame Alt Text
- **Trigger**: Single frames extracted from videos due to processing limitations
- **Use Case**: Best-effort description when full video processing isn't possible
- **Features**: Detailed frame analysis, context inference, clear limitation acknowledgment

### 6. Text Condensation
- **Trigger**: `req.body.operation === 'condense_text'`
- **Use Case**: Reducing text length while preserving essential meaning
- **Features**: Intelligent summarization, length targeting, meaning preservation

## Getting Started

### Prerequisites

-   Node.js v18
-   A Google Gemini API Key

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-github/alt-text-server.git
    cd alt-text-server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a local environment file by copying the example:
    ```bash
    cp .env.example .env
    ```
4.  Open the new `.env` file and add your Google Gemini API key.

### Running Locally

1.  Start the server in development mode (with hot-reloading):
    ```bash
    npm run dev
    ```
2.  The server will be running at `http://localhost:3000`.

## Deployment to Railway

This server is ready to be deployed on Railway.

1.  Create a new project on Railway and link this GitHub repository.
2.  Railway will automatically detect the `start` script in `package.json` (`node server.js`).
3.  In the project's "Variables" tab on Railway, add your `GEMINI_API_KEY`. You do not need to upload your `.env` file, as Railway uses its own system for secrets.
4.  Configure the Healthcheck in the "Settings" tab to use the `/health` path.

Railway will build and deploy the service. The public URL will be provided in your Railway dashboard.

## Project Structure

```
alt-text-server/
├── server.js           # Express server wrapper for Railway
├── index.js            # Core logic from the original cloud function
├── package.json        # Dependencies and scripts
├── .gitignore          # Files to exclude from version control
├── .env.example        # Example environment variables
└── README.md           # This file
```
