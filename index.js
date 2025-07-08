// index.js (for Google Cloud Functions - Node.js Runtime)
// const functions = require('@google-cloud/functions-framework'); // No longer needed
const fetch = require('node-fetch'); // Use node-fetch or native fetch in newer Node versions

// IMPORTANT: Store your API Key securely!
// Best Practice: Use Secret Manager (https://cloud.google.com/secret-manager)
// Good Practice: Use Build-time Environment Variables (set during deployment)
// Simpler (but less secure than Secret Manager): Use Runtime Environment Variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // Will be set during deployment
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// --- Specialized System Instructions for Each Request Type ---

// 1. VTT Caption Generation (for videos with sound)
const vttCaptionInstructions = `You are a professional video captioning specialist. Your ONLY task is to generate properly formatted WebVTT subtitle files for videos. You MUST analyze both the visual content and audio to create accurate, synchronized captions.

CRITICAL FORMAT REQUIREMENTS - FOLLOW EXACTLY:
1. Start with "WEBVTT" as the very first line
2. Add one blank line after WEBVTT
3. Each caption segment follows this EXACT pattern:
   - Timestamp line: HH:MM:SS.mmm --> HH:MM:SS.mmm
   - Caption text (1-2 lines maximum)
   - Blank line

EXAMPLE OF CORRECT FORMAT:
WEBVTT

00:00:00.000 --> 00:00:03.000
[Music playing in background]

00:00:03.000 --> 00:00:06.000
Welcome to our demonstration video.

00:00:06.000 --> 00:00:09.000
Today we'll be showing you the main features.

CAPTIONING RULES:
1. Transcribe ALL spoken words verbatim and accurately
2. Include important sound effects in [square brackets]
3. Include music descriptions in [square brackets] like [Upbeat music] or [Soft piano music]
4. Each caption segment should be 2-5 seconds long
5. Split long sentences across multiple segments for readability
6. Use proper punctuation, capitalization, and grammar
7. For silent videos or sections, describe key visual actions in [brackets]
8. Maintain natural speech rhythm and pacing
9. Use speaker identification if multiple speakers: "Speaker 1: Hello there"
10. Include emotional context in brackets when relevant: [laughing], [sighs], [excited]

TIMING REQUIREMENTS:
- Captions must appear when words are spoken
- No caption should exceed 5 seconds duration
- Ensure smooth reading pace (not too fast)
- Leave brief gaps between rapid speech segments

OUTPUT REQUIREMENTS:
- ONLY output the properly formatted WebVTT content
- NO explanations, introductions, or additional text
- NO markdown formatting or code blocks
- Start immediately with "WEBVTT"`;

// 2. Still Image Alt Text Generation
const stillImageAltTextInstructions = `You are an expert in generating alternative text (alt-text) for static images to assist users with visual impairments. Your descriptions must be accurate, concise, and informative.

PURPOSE: Create alt-text for screen reader technology to help blind and visually impaired users understand static visual content.

DESCRIPTION GUIDELINES:
1. **Media Type**: Identify the type (photograph, illustration, diagram, screenshot, painting, etc.)
2. **Essential Content**: Describe the most important visual elements first
3. **Text Transcription**: If the image contains text, transcribe it verbatim in quotes
4. **Context and Purpose**: Explain why this image was included and what information it conveys
5. **People**: Name recognizable individuals when relevant
6. **Technical Elements**: For UI screenshots, describe key interface elements and their states

STYLE REQUIREMENTS:
- Use clinical, objective language without artistic interpretation
- Be concise but complete (aim for under 150 characters for simple images)
- Use clear, simple language avoiding jargon
- Proper grammar, punctuation, and capitalization
- End with a period

WHAT NOT TO DO:
- Don't start with "Image of..." or "Picture showing..."
- Don't add subjective interpretations or emotions
- Don't include information not visible in the image
- Don't use flowery or poetic language

OUTPUT: Provide ONLY the alt-text description with no introductory phrases or explanations.`;

// 3. Animated Content Alt Text (GIFs, short videos, loops)
const animatedContentAltTextInstructions = `You are an expert in describing animated visual content (GIFs, animated images, short looping videos) for accessibility purposes. Your task is to capture the complete animation sequence in a unified description.

PURPOSE: Create alt-text that conveys the full animated sequence for users with visual impairments.

ANIMATION DESCRIPTION GUIDELINES:
1. **Animation Type**: Identify as "Animated GIF," "Short video," or "Looping animation"
2. **Complete Sequence**: Describe the entire loop/sequence as one unified action
3. **Motion and Flow**: Focus on the movement, transitions, and visual flow
4. **Repetitive Nature**: Mention if it loops continuously
5. **Key Moments**: Highlight the most important visual moments in the sequence
6. **Text Elements**: Transcribe any text that appears during the animation

STYLE REQUIREMENTS:
- Describe the COMPLETE action, not individual frames
- Use present tense for ongoing actions ("A cat repeatedly jumps...")
- Be descriptive about movement and visual changes
- Capture the essence and purpose of the animation
- Maintain clinical objectivity while being thorough

WHAT NOT TO DO:
- Don't use timestamp-based descriptions
- Don't break it into step-by-step sequences
- Don't describe it as a series of static frames
- Don't use "Video of..." or "Animation showing..." prefixes

EXAMPLE GOOD DESCRIPTION: "Animated GIF of a cat repeatedly raising and lowering its head while sitting on a windowsill, creating a continuous bobbing motion that loops seamlessly."

OUTPUT: Provide ONLY the alt-text description with no introductory phrases or explanations.`;

// 4. Full Video Alt Text Generation
const fullVideoAltTextInstructions = `You are an expert in generating comprehensive alternative text for video content. Your task is to create a thorough description that captures the video's visual narrative, key scenes, and overall content for accessibility.

PURPOSE: Create detailed alt-text that helps users with visual impairments understand the complete video content and its message.

VIDEO DESCRIPTION GUIDELINES:
1. **Content Overview**: Start with the video's main purpose or theme
2. **Visual Narrative**: Describe the progression of scenes and key visual elements
3. **Important Actions**: Detail significant actions, movements, and visual changes
4. **Text Overlays**: Transcribe any on-screen text, titles, or captions verbatim
5. **Setting and Context**: Describe locations, environments, and visual context
6. **Key Moments**: Highlight the most important or impactful visual moments
7. **Visual Information**: Include colors, composition, and visual style when relevant

COMPREHENSIVE COVERAGE:
- Describe what happens throughout the video's duration
- Include beginning, middle, and end content
- Mention visual transitions and scene changes
- Describe any graphics, charts, or visual aids shown
- Include clothing, objects, and environmental details when relevant

STYLE REQUIREMENTS:
- Use present tense for describing ongoing action
- Be thorough but maintain readability
- Focus on visual information that audio wouldn't convey
- Use clear, descriptive language
- Maintain objective, clinical tone

WHAT NOT TO DO:
- Don't describe only a single frame or thumbnail
- Don't use timestamp breakdowns
- Don't add subjective interpretations
- Don't prefix with "Video of..." or "This video shows..."

OUTPUT: Provide ONLY the comprehensive alt-text description with no introductory phrases or explanations.`;

// 5. Video Frame Alt Text (for when processing single frames from videos)
const videoFrameAltTextInstructions = `You are describing a single frame extracted from a video due to technical processing limitations. Your task is to describe this frame as thoroughly as possible while acknowledging it represents only one moment from a longer video.

PURPOSE: Provide the best possible description of video content when only a single frame is available.

FRAME DESCRIPTION GUIDELINES:
1. **Context**: Begin with "A frame from a video showing..." to clarify the limitation
2. **Detailed Description**: Describe everything visible in this single frame
3. **Inferred Context**: Suggest what the video might be about based on this frame
4. **Visual Elements**: Describe people, objects, settings, text, and visual composition
5. **Implied Action**: Suggest potential movement or action that might be occurring

COMPREHENSIVE DETAIL:
- Describe facial expressions and body language
- Include clothing, objects, and environmental details
- Transcribe any visible text exactly
- Describe colors, lighting, and visual composition
- Mention anything that suggests video content or context

STYLE REQUIREMENTS:
- Always start with "A frame from a video showing..."
- Be extremely thorough since this is the only visual information available
- Use present tense for describing what's visible
- Maintain clinical, objective description

OUTPUT: Provide ONLY the alt-text description starting with the required prefix.`;

// 6. Text Condensation Instructions (for the condense_text operation)
const textCondensationInstructions = `You are a text condensation specialist. Your task is to reduce the length of provided text while preserving all essential meaning and information.

CONDENSATION GUIDELINES:
1. Preserve all key facts, data, and important details
2. Maintain the original tone and style
3. Remove redundancy and unnecessary words
4. Keep essential context and clarity
5. Ensure the condensed version is coherent and complete
6. Meet the specified target length requirements

OUTPUT: Provide ONLY the condensed text with no explanations or commentary.`;

// --- !!! REPLACE WITH YOUR ACTUAL IDs !!! ---
const ALLOWED_CHROME_ORIGIN = 'chrome-extension://bdgpkmjnfildfjhpjagjibfnfpdieddp';
// Find this when you package your Safari extension via Xcode (e.g., com.yourcompany.yourextension)
// The exact Origin format might need testing, but it uses the bundle ID.
const ALLOWED_CHROME_ORIGIN_PREFIX = 'chrome-extension://';
const ALLOWED_SAFARI_ORIGIN_PREFIX = 'safari-web-extension://';
const ALLOWED_FIREFOX_ORIGIN_PREFIX = 'moz-extension://';
// Web app domains
const ALLOWED_WEB_APP_ORIGIN = 'https://alttext.symm.app';
const ALLOWED_DEV_WEB_APP_ORIGIN = 'https://alttextdev.symm.app'; // Added for dev environment
// Railway domains (for Railway deployments)
const ALLOWED_RAILWAY_PREFIX = 'https://'; // Allow any HTTPS domain temporarily for Railway testing
const ALLOWED_RAILWAY_SPECIFIC_PREFIX = 'https://alt-text-web-'; // Specific Railway domain pattern
// Local development origins
const ALLOWED_LOCAL_ORIGINS = [
    'http://localhost:8080',
    'http://localhost:3000', 
    'http://127.0.0.1:8080',
    'http://127.0.0.1:3000'
];
// ---

// List of fully allowed origins (for precise matching)
const allowedFullOrigins = [
    ALLOWED_CHROME_ORIGIN,
    ALLOWED_WEB_APP_ORIGIN,
    ALLOWED_DEV_WEB_APP_ORIGIN, // Added for dev environment
    ...ALLOWED_LOCAL_ORIGINS,
    // Add other specific origins if needed, e.g., for testing environments
];

// List of allowed prefixes (for matching start of the string)
const allowedPrefixes = [
    ALLOWED_CHROME_ORIGIN_PREFIX,
    ALLOWED_SAFARI_ORIGIN_PREFIX, // Check if Safari needs full ID or just prefix based on testing
    ALLOWED_FIREFOX_ORIGIN_PREFIX,
    ALLOWED_RAILWAY_SPECIFIC_PREFIX, // Specific Railway domain pattern
    // Temporarily allow any HTTPS for Railway testing - REMOVE IN PRODUCTION
    // 'https://' // Uncomment this line for broad testing only
];


// --- All system instructions are now defined above as specialized instruction sets ---


const generateAltTextProxy = async (req, res) => {
    const requestOrigin = req.headers.origin;
    let originAllowed = false;
    let allowedOriginForCors = null;

    // --- Origin Validation Logic ---
    if (requestOrigin) {
        // Check for exact match first
        if (allowedFullOrigins.includes(requestOrigin)) {
            originAllowed = true;
            allowedOriginForCors = requestOrigin;
        } else {
            // Check for prefix match if no exact match found
            for (const prefix of allowedPrefixes) {
                if (requestOrigin.startsWith(prefix)) {
                    originAllowed = true;
                    allowedOriginForCors = requestOrigin; // Reflect the specific requesting origin
                    break; // Stop checking prefixes once one matches
                }
            }
            
            // Allow any extension origin (for debugging/development)
            // This is less secure but helps during development
            if (!originAllowed && (
                requestOrigin.startsWith('chrome-extension://') || 
                requestOrigin.startsWith('moz-extension://') || 
                requestOrigin.startsWith('safari-web-extension://')
            )) {
                console.log(`Allowing extension origin: ${requestOrigin}`);
                originAllowed = true;
                allowedOriginForCors = requestOrigin;
            }
        }
    }

    // !!! ADDED LOGGING HERE !!!
    console.log(`[CORS DEBUG] Request Origin: ${requestOrigin}, Allowed: ${originAllowed}, AllowedOriginForCors: ${allowedOriginForCors}`);

    // --- Set CORS Headers ---
    // Only set Allow-Origin if the request origin is actually allowed
    if (allowedOriginForCors) {
         res.set('Access-Control-Allow-Origin', allowedOriginForCors);
    }
    // Add Vary header to indicate response depends on Origin
    res.set('Vary', 'Origin');

    // --- Handle OPTIONS (preflight) requests ---
    if (req.method === 'OPTIONS') {
        if (originAllowed) {
            res.set('Access-Control-Allow-Methods', 'POST');
            res.set('Access-Control-Allow-Headers', 'Content-Type, Connection, Accept, Cache-Control');
            res.set('Access-Control-Max-Age', '3600');
            res.status(204).send('');
        } else {
            // If origin isn't allowed, don't grant CORS preflight
            console.warn(`Rejected OPTIONS request from origin: ${requestOrigin || 'Not Specified'}`);
            res.status(403).send('Forbidden: Origin not allowed');
        }
        return;
    }

    // --- Reject if Origin Not Allowed ---
    if (!originAllowed) {
        console.warn(`Rejected POST request from origin: ${requestOrigin || 'Not Specified'}`);
        return res.status(403).send('Forbidden: Invalid Origin');
    }

    // --- Handle POST requests (if Origin is valid) ---
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    // --- API Key Check ---
    if (!GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY environment variable not set.");
        return res.status(500).json({ error: 'Server configuration error: API Key missing.' });
    }

    try {
        // --- Input Validation ---
        // Check if this is a special condensing request
        if (req.body.operation === 'condense_text') {
            if (!req.body.text || !req.body.directive || !req.body.targetLength) {
                return res.status(400).json({ error: 'Missing required fields for text condensation' });
            }
            
            console.log(`Processing text condensation request, targetLength: ${req.body.targetLength}, text length: ${req.body.text.length}`);
            
            // Use specialized text condensation instructions
            const condensationPrompt = `${textCondensationInstructions}\n\nTARGET LENGTH: ${req.body.targetLength}\nDIRECTIVE: ${req.body.directive}\n\nTEXT TO CONDENSE:\n${req.body.text}`;
            
            // Call Gemini API for text condensation
            const condensingRequestBody = {
                contents: [{
                    parts: [
                        { text: condensationPrompt }
                    ]
                }],
                generationConfig: {
                    temperature: 0.2, // Lower temperature for more deterministic output
                    maxOutputTokens: 1024 // Limit output size
                }
            };
            
            const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(condensingRequestBody)
            });
            
            const geminiData = await geminiResponse.json();
            
            if (!geminiResponse.ok) {
                console.error('Gemini API Error in text condensation:', JSON.stringify(geminiData));
                const errorMsg = geminiData?.error?.message || `Gemini API failed with status ${geminiResponse.status}`;
                return res.status(geminiResponse.status >= 500 ? 502 : 400).json({ error: `Gemini API Error: ${errorMsg}` });
            }
            
            const condensedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
            
            if (!condensedText) {
                console.error('Could not extract condensed text from Gemini response:', JSON.stringify(geminiData));
                return res.status(500).json({ error: 'Failed to parse response from AI service' });
            }
            
            console.log(`Successfully condensed text from ${req.body.text.length} to ${condensedText.length} characters`);
            return res.status(200).json({ altText: condensedText.trim() });
        }
        
        // Check if this is a caption generation request
        if (req.body.action === 'generateCaptions') {
            let { base64Data, mimeType, duration, transcriptId } = req.body; // Allow mimeType to be modified
            
            if (!base64Data || !mimeType) {
                return res.status(400).json({ error: 'Missing required fields: base64Data and mimeType' });
            }

            const originalMimeTypeForCaptions = mimeType;
            if (mimeType.includes(';')) {
                mimeType = mimeType.split(';')[0];
                console.log(`Cleaned mimeType for captions from "${originalMimeTypeForCaptions}" to: "${mimeType}"`);
            }
            
            if (!mimeType.startsWith('video/')) {
                return res.status(400).json({ error: `Invalid mime type for caption generation. Expected video/*, got "${mimeType}" (original: "${originalMimeTypeForCaptions}")` });
            }
            
            console.log(`Processing caption generation request for ${mimeType} (original: ${originalMimeTypeForCaptions}), data length: ${base64Data.length}, duration: ${duration || 'unknown'}, ID: ${transcriptId}`);
            
            // Prepare the caption request
            const videoDuration = duration || 60; // Default to 60 seconds if no duration provided
            
            // Add the duration to the instructions
            const instructionsWithDuration = `${vttCaptionInstructions}\n\nThis video is approximately ${videoDuration} seconds long. Please create appropriate captions with timestamps that cover this duration.`;
            
            // Call Gemini API for caption generation
            const captionRequestBody = {
                contents: [{
                    parts: [
                        { text: instructionsWithDuration },
                        { inline_data: { mime_type: mimeType, data: base64Data } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.2,
                    maxOutputTokens: 4096, // Higher token limit for longer caption text
                    topP: 0.95,
                    topK: 40
                }
            };
            
            try {
                console.log('Calling Gemini API for caption generation...');
                const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(captionRequestBody)
                });
                
                const geminiData = await geminiResponse.json();
                
                if (!geminiResponse.ok) {
                    console.error('Gemini API Error in caption generation:', JSON.stringify(geminiData));
                    const errorMsg = geminiData?.error?.message || `Gemini API failed with status ${geminiResponse.status}`;
                    return res.status(geminiResponse.status >= 500 ? 502 : 400).json({ error: `Gemini API Error: ${errorMsg}` });
                }
                
                // Extract the generated captions
                const generatedCaptions = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                
                if (!generatedCaptions) {
                    console.error('Could not extract captions from Gemini response:', JSON.stringify(geminiData));
                    return res.status(500).json({ error: 'Failed to parse caption response from AI service' });
                }
                
                // Ensure we have a properly formatted WebVTT file
                let vttContent = generatedCaptions.trim();
                
                // Add WEBVTT header if not present
                if (!vttContent.startsWith('WEBVTT')) {
                    vttContent = `WEBVTT\n\n${vttContent}`;
                }
                
                console.log('Successfully generated captions.');
                return res.status(200).json({ vttContent: vttContent });
                
            } catch (error) {
                console.error('Error generating captions:', error);
                return res.status(500).json({ error: `Caption generation failed: ${error.message}` });
            }
        }
        
        if (req.body.action === 'getUploadUrl') {
            // Handle generating a signed upload URL
            const { mediaType, mimeType, fileSize, uploadId } = req.body;
            
            if (!mediaType || !mimeType || !fileSize || !uploadId) {
                return res.status(400).json({ error: 'Missing required fields for upload URL generation' });
            }
            
            // Check if file size is too large (20MB limit)
            const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
            if (fileSize > MAX_FILE_SIZE) {
                return res.status(413).json({ error: 'File too large. Maximum size is 20MB.' });
            }
            
            // For demo purposes, instead of actually generating a signed URL, we'll just return 
            // a simple URL with a dummy querystring that we'll recognize later.
            // In a real implementation, you'd use proper cloud storage signed URLs.
            console.log(`Generating upload URL for ${mediaType}, type ${mimeType}, size ${fileSize}, ID ${uploadId}`);
            
            // In a real implementation, you would generate a signed URL and store the uploadId
            // in some database or in-memory for later retrieval
            const uploadUrl = `https://example.com/upload-endpoint?id=${uploadId}`; // Placeholder
            
            return res.status(200).json({ 
                uploadUrl: uploadUrl,
                uploadId: uploadId 
            });
        }
        
        if (req.body.action === 'processUploadedMedia') {
            // Handle processing media that was uploaded directly
            const { uploadId, purpose } = req.body;
            const processPurpose = purpose || 'altText'; // Default to alt text if not specified
            
            if (!uploadId) {
                return res.status(400).json({ error: 'Missing required field: uploadId' });
            }
            
            // In a real implementation, you would retrieve the uploaded file using the uploadId
            // For this demo, we'll simulate processing with some placeholder content
            console.log(`Processing uploaded media with ID ${uploadId} for purpose: ${processPurpose}`);
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (processPurpose === 'captions') {
                // Return dummy captions for demo purposes
                // In a real implementation, you would process the actual uploaded file
                const dummyVtt = `WEBVTT

00:00:00.000 --> 00:00:05.000
[Music Playing]

00:00:05.000 --> 00:00:10.000
Hello, this is a sample caption for demonstration purposes.

00:00:10.000 --> 00:00:15.000
In a real implementation, we would analyze the actual video.`;

                return res.status(200).json({ vttContent: dummyVtt });
            } else {
                // Default to alt text
                return res.status(200).json({ 
                    altText: "This is a placeholder alt text for the uploaded media. In a real implementation, we would analyze the actual media that was uploaded." 
                });
            }
        }
        
        // Regular image/video alt text generation
        let { base64Data, mimeType } = req.body; // Allow mimeType to be modified

        if (!base64Data || !mimeType) {
            return res.status(400).json({ error: 'Missing required fields: base64Data and mimeType' });
        }
        if (typeof base64Data !== 'string' || typeof mimeType !== 'string') {
            return res.status(400).json({ error: 'Invalid data types for base64Data or mimeType' });
        }

        const originalMimeTypeForAltText = mimeType;
        if (mimeType.includes(';')) {
            mimeType = mimeType.split(';')[0];
            console.log(`Cleaned mimeType for alt text from "${originalMimeTypeForAltText}" to: "${mimeType}"`);
        }

        // Basic check for common image/video types - adjust as needed
        if (!mimeType.startsWith('image/') && !mimeType.startsWith('video/')) {
             console.warn(`Received potentially unsupported mimeType: ${mimeType} (original: ${originalMimeTypeForAltText})`);
             // Allow it for now, Gemini might handle it, but consider stricter validation
        }

        // Get isVideo flag if present (helps with proper description prompting)
        const isVideo = req.body.isVideo === true;
        
        // Define animated image MIME types
        const animatedImageMimeTypes = ['image/gif', 'image/webp', 'image/apng'];
        const isAnimatedImage = animatedImageMimeTypes.includes(mimeType);

        // isVideoFrame is true if the client flagged it as video-related,
        // it's an image MIME type, BUT it's NOT one of the directly supported animated image types
        // (implying it's a frame extracted from a non-natively-animated-image video type).
        const isVideoFrame = isVideo && mimeType.startsWith('image/') && !isAnimatedImage;

        console.log(`Processing allowed request from origin: ${requestOrigin}, mimeType: ${mimeType} (original: ${originalMimeTypeForAltText}), data length: ${base64Data.length}, isVideo: ${isVideo}, isAnimatedImage: ${isAnimatedImage}, isVideoFrame: ${isVideoFrame}`);
        
        // Additional debugging for WebM files
        if (mimeType === 'video/webm' || originalMimeTypeForAltText.includes('webm')) {
            console.log(`WEBM DEBUG: Processing WebM file with original type: ${originalMimeTypeForAltText}, cleaned type: ${mimeType}`);
        }

        // Select appropriate system instructions based on media type and characteristics
        let effectiveSystemInstructions;
        let instructionType;
        
        if (isVideoFrame) {
            // Single frame extracted from video due to processing limitations
            effectiveSystemInstructions = videoFrameAltTextInstructions;
            instructionType = "video frame";
        } else if (isAnimatedImage || (mimeType.startsWith('video/') && !isVideo)) {
            // Animated GIFs, animated WebP, APNG, or short video content treated as animation
            effectiveSystemInstructions = animatedContentAltTextInstructions;
            instructionType = "animated content";
        } else if (mimeType.startsWith('video/') || isVideo) {
            // Full video content
            effectiveSystemInstructions = fullVideoAltTextInstructions;
            instructionType = "full video";
        } else {
            // Static images (default case)
            effectiveSystemInstructions = stillImageAltTextInstructions;
            instructionType = "still image";
        }
        
        console.log(`Using ${instructionType} instructions for mimeType: ${mimeType}, isVideo: ${isVideo}, isAnimatedImage: ${isAnimatedImage}, isVideoFrame: ${isVideoFrame}`);

        // --- Call Gemini API ---
        let mimeTypeForGemini = mimeType; // Start with the (cleaned) original mimeType
        if (isVideo && isAnimatedImage) {
            // If the client flagged it as video-like (e.g., for Bluesky posting requirements)
            // AND it's one of our recognized animated image types (gif, animated webp, apng),
            // let's try sending a common video MIME type to Gemini.
            // The system instructions for animated images should still guide Gemini correctly.
            mimeTypeForGemini = 'video/mp4'; 
            console.log(`ALERT: For Gemini API call, overriding mimeType from "${mimeType}" to "${mimeTypeForGemini}" because isVideo=true and isAnimatedImage=true.`);
        } else if (mimeType === 'video/webm') {
            // WebM files should be sent as MP4 for better Gemini compatibility
            mimeTypeForGemini = 'video/mp4';
            console.log(`ALERT: For Gemini API call, overriding mimeType from "${mimeType}" to "${mimeTypeForGemini}" for better WebM compatibility.`);
        }

        const geminiRequestBody = {
          contents: [{
            parts: [
              { text: effectiveSystemInstructions },
              { inline_data: { mime_type: mimeTypeForGemini, data: base64Data } } // Use mimeTypeForGemini
            ]
          }],
          generationConfig: {
            temperature: 0.2, // Lower temperature for more deterministic output
            maxOutputTokens: 2048, // Allow for longer descriptions if needed
            topP: 0.95,
            topK: 64
          }
        };

        console.log(`Calling Gemini API with mimeType: ${mimeTypeForGemini}, dataLength: ${base64Data.length}...`);
        const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiRequestBody)
        });

        const geminiData = await geminiResponse.json();

        if (!geminiResponse.ok) {
          console.error('Gemini API Error Response:', JSON.stringify(geminiData));
          const errorMsg = geminiData?.error?.message || `Gemini API failed with status ${geminiResponse.status}`;
          // Return a structured error that the extension can understand
          return res.status(geminiResponse.status >= 500 ? 502 : 400).json({ error: `Gemini API Error: ${errorMsg}` });
        }

        // --- Extract Text and Respond ---
        // Adjust path based on Gemini API version/response structure if needed
        const generatedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!generatedText) {
          console.error('Could not extract text from Gemini response:', JSON.stringify(geminiData));
          return res.status(500).json({ error: 'Failed to parse response from AI service' });
        }

        // For video frames, ensure the user knows this was an optimization
        let finalText = generatedText.trim();
        if (isVideoFrame && !finalText.toLowerCase().startsWith("a frame from a video")) {
            // Add a prefix if Gemini didn't use our suggested format
            finalText = "A frame from a video showing " + finalText.charAt(0).toLowerCase() + finalText.slice(1);
        }

        console.log('Successfully generated alt text for allowed origin.');
        // Send successful response back to the extension
        res.status(200).json({ altText: finalText });

    } catch (error) {
        console.error('Error processing request:', error);
        // Send generic server error back
        res.status(500).json({ error: error instanceof Error ? error.message : 'An internal server error occurred' });
    }
};

// Export for use in Express server
module.exports = { generateAltTextProxy }; 