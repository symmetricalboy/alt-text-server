# Alt Text Generator - Backend Server

Centralized API server providing Google Gemini AI integration for alt text and caption generation. Designed for Railway deployment with comprehensive file handling and specialized AI instruction sets.

## 🌟 Features

- **🤖 Advanced AI Integration:** Google GenAI SDK v1.12.0 with Gemini 2.5 Flash
- **📝 Specialized Instructions:** Content-type aware AI processing for optimal results
- **📁 Smart File Handling:** Automatic strategy selection based on file size and type  
- **🔄 Files API Support:** Large file processing up to 100MB with compression fallbacks
- **🌐 Multi-Client Support:** Serves both browser extension and web application
- **🚀 Production Ready:** Railway deployment with health monitoring and auto-scaling

## 🏗️ Architecture

### Core Components
- **Express.js Server:** HTTP API with CORS and security middleware
- **Google GenAI Client:** Official SDK for Gemini API integration  
- **File Processing Pipeline:** Size-based strategy selection and optimization
- **Specialized AI Instructions:** Six content-type specific instruction sets

### Processing Strategies
```
File Size < 15MB    → Direct API call
File Size 15-100MB  → Files API upload  
File Size > 100MB   → Compression + Files API
```

## 📡 API Endpoints

### POST /generate-alt-text
Primary endpoint for all alt text and caption generation.

**Request:**
```json
{
  "base64Data": "data:image/jpeg;base64,/9j/4AAQ...",
  "mimeType": "image/jpeg",
  "action": "generateAltText",
  "isVideo": false
}
```

**Response:**
```json
{
  "altText": "A photograph showing...",
  "processing": {
    "strategy": "direct_api",
    "fileSize": 1048576
  }
}
```

### GET /health
Health monitoring endpoint for deployment systems.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-20T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🧠 AI Instruction Sets

The server uses specialized instruction sets optimized for different content types:

1. **VTT Caption Generation** - WebVTT-formatted video captions
2. **Still Image Alt Text** - Optimized for photographs and static images  
3. **Animated Content** - Specialized for GIFs and short animations
4. **Full Video Alt Text** - Comprehensive video descriptions
5. **Video Frame Alt Text** - Single frame analysis with context
6. **Text Condensation** - Length optimization while preserving meaning

## 🚀 Deployment

### Railway Deployment (Recommended)

1. **Create Railway Project:**
   ```bash
   # Connect to GitHub repository
   railway login
   railway link
   ```

2. **Set Environment Variables:**
   ```bash
   railway variables set GEMINI_API_KEY=your_api_key_here
   ```

3. **Deploy:**
   ```bash
   railway up
   ```

### Local Development

1. **Setup:**
   ```bash
   git clone https://github.com/symmetricalboy/alt-text-server.git
   cd alt-text-server
   npm install
   ```

2. **Configuration:**
   ```bash
   cp .env.example .env
   # Edit .env and add your GEMINI_API_KEY
   ```

3. **Run:**
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

## 🔧 Configuration

### Environment Variables
```bash
GEMINI_API_KEY=your_gemini_api_key_here  # Required
PORT=3000                                # Optional, defaults to 3000
NODE_ENV=production                      # Optional
```

### CORS Configuration
Pre-configured for:
- Extension origins (Chrome, Firefox, Safari)
- Web app domains (alttext.symm.app)
- Local development (localhost:3000, localhost:8080)

## 🌐 Related Repositories

This server is part of a comprehensive ecosystem:

- **🏠 [gen-alt-text](https://github.com/symmetricalboy/gen-alt-text)** - Main project hub and documentation
- **🧩 [alt-text-ext](https://github.com/symmetricalboy/alt-text-ext)** - Browser extension client
- **🖥️ [alt-text-web](https://github.com/symmetricalboy/alt-text-web)** - Web application client

## 📊 Performance & Monitoring

### File Processing Metrics
- **Direct API:** Files < 15MB processed in ~2-5 seconds
- **Files API:** Large files processed in ~10-30 seconds  
- **Compression:** Automatic quality adjustment based on file characteristics

### Health Monitoring
- **Railway Integration:** Automatic health checks and uptime monitoring
- **Error Tracking:** Comprehensive logging and error reporting
- **Auto-scaling:** Automatic scaling based on request volume

## 🛡️ Security Features

- **API Key Protection:** Secure environment variable storage
- **CORS Policy:** Restricted origin access with specific allowlists
- **Request Validation:** Input sanitization and file size limits
- **Rate Limiting:** Built-in protection against abuse
- **HTTPS Only:** Secure transmission for all communications

## 🔬 Advanced Features

### Smart Content Detection
Automatic selection of appropriate AI instructions based on:
- File MIME type analysis
- Content characteristics detection  
- Processing context awareness

### Compression Strategies
- **Adaptive Quality:** Progressive quality reduction for large files
- **Format Optimization:** Codec selection based on content type
- **Bitrate Management:** Intelligent bitrate adjustment

### Caching & Optimization
- **Response Caching:** Intelligent caching for repeated requests
- **Memory Management:** Automatic cleanup for large file processing
- **Request Optimization:** Concurrent request limiting and timeout management

## 🐛 Troubleshooting

### Common Issues

**API Key Invalid:**
```bash
# Verify environment variable is set
echo $GEMINI_API_KEY
```

**CORS Errors:**
```bash  
# Check origin in request headers
# Ensure origin is in allowlist
```

**File Too Large:**
```bash
# Server supports up to 100MB with Files API
# Files > 100MB will be compressed automatically
```

## 🤝 Contributing

For server-specific issues and contributions:

1. **Bug Reports:** [Server Issues](https://github.com/symmetricalboy/alt-text-server/issues)
2. **Feature Requests:** [Main Project Issues](https://github.com/symmetricalboy/gen-alt-text/issues)
3. **Development:** See [Development Guide](https://github.com/symmetricalboy/gen-alt-text/blob/main/docs/development-guide.md)

## 📖 Documentation

Comprehensive documentation available in the main project:
- **[Technical Architecture](https://github.com/symmetricalboy/gen-alt-text/blob/main/docs/technical-architecture.md)**
- **[Backend Server Details](https://github.com/symmetricalboy/gen-alt-text/blob/main/docs/backend-server.md)**
- **[API Documentation](https://github.com/symmetricalboy/gen-alt-text/blob/main/docs/api-documentation.md)**

## 📜 License

MIT License - see [LICENSE](./LICENSE) file for details.

## 🔗 Links

- **🌐 Live Web App:** [alttext.symm.app](https://alttext.symm.app)
- **🧩 Browser Extension:** Available on [Chrome](https://chromewebstore.google.com/detail/bdgpkmjnfildfjhpjagjibfnfpdieddp) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/bluesky-alt-text-generator/)
- **🏠 Main Project:** [gen-alt-text](https://github.com/symmetricalboy/gen-alt-text)
- **📱 Bluesky:** [@symm.app](https://bsky.app/profile/symm.app)

---

*Powering accessible AI generation across the entire Alt Text Generator ecosystem! 🚀*