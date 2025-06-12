# Alt Text Project Repository Structure

This project is organized into three separate repositories, each serving a specific purpose. This file serves as a guide to help navigate the repositories.

## Repositories

### 1. `alt-text-ext`
- **Purpose:** Browser extension for Chrome, Firefox, and Safari
- **Features:** Integrates with Bluesky to provide alt text generation buttons
- **Technologies:** TypeScript, WXT framework, MV3 extension architecture
- **Repository URL:** [GitHub - alt-text-ext](https://github.com/symmetricalboy/alt-text-ext)

### 2. `alt-text-server` (This repository)
- **Purpose:** Backend server that handles alt text generation via Google Gemini API
- **Features:** Processes images/videos, generates alt text, creates captions
- **Technologies:** Node.js, Express, Google Gemini API
- **Deployment:** Railway.app
- **Repository URL:** [GitHub - alt-text-server](https://github.com/symmetricalboy/alt-text-server)

### 3. `alt-text-web`
- **Purpose:** Web application for generating alt text without browser extension
- **Features:** Provides a web interface for uploading and processing media
- **Technologies:** Modern web stack (likely React or similar)
- **Repository URL:** [GitHub - alt-text-web](https://github.com/symmetricalboy/alt-text-web)

## Important Notes

- These are **separate repositories**, not subdirectories of a main repository
- The old `gen-alt-text` repository is deprecated; its functionality has been migrated to these three repositories
- Each repository has its own independent codebase, dependencies, and deployment pipeline
- Changes to one repository do not automatically propagate to others

## Development Workflow

When working on this project, always be aware of which repository you are currently operating in. Commands like `cd` change directories but do not switch between repositories - they are completely separate Git projects. 