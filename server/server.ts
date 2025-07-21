import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fs from 'fs';
import { findValidCoastalLocation } from './coastalLocationFinder.js';
import { ALLOWED_FILE_EXTENSIONS, SERVER } from './constants.js';

// Simple error logging utility for server
function logError(message: string, error?: unknown, context?: Record<string, unknown>) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    message,
    context,
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error
  };
  console.error('[ERROR]', logEntry);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || SERVER.DEFAULT_PORT;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, '../dist')));

// Serve static files from public directory with streaming support
app.use('/public', express.static(path.join(__dirname, '../public'), {
  // Enable streaming for large files
  acceptRanges: true,
  // Set appropriate headers for geospatial data
  setHeaders: (res, path) => {
    if (path.endsWith('.geojson')) {
      res.setHeader('Content-Type', 'application/geo+json');
    }
    // Enable compression
    res.setHeader('Vary', 'Accept-Encoding');
  }
}));

// Route for serving FlatGeobuf files with HTTP range requests and streaming
app.get('/api/data/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public', filename);
  
  // Validate file extension for security (FlatGeobuf and legacy GeoJSON)
  if (!filename.match(ALLOWED_FILE_EXTENSIONS)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }
  
  try {
    // Check if file exists
    const stats = await fs.promises.stat(filePath);
    const fileSize = stats.size;
    
    // Parse range header for partial requests
    const range = req.headers.range;
    
    if (range) {
      // Handle partial content request (HTTP 206) - essential for FlatGeobuf
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = (end - start) + 1;
      
      // Validate range
      if (start >= fileSize || end >= fileSize) {
        res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
        return res.end();
      }
      
      // Set partial content headers
      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Content-Type', getContentType(filename));
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Create read stream for the requested range
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    } else {
      // Handle full content request (HTTP 200) with streaming
      res.setHeader('Content-Length', fileSize);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Type', getContentType(filename));
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Create read stream for the entire file with streaming
      const stream = fs.createReadStream(filePath, { highWaterMark: 64 * 1024 }); // 64KB chunks
      stream.pipe(res);
    }
  } catch (err) {
    logError('Error serving file', err, { filename });
    res.status(404).json({ error: 'File not found' });
  }
});

// API endpoint for finding valid coastal locations
app.get('/api/coastal-location/:seed', async (req, res) => {
  try {
    const seed = parseInt(req.params.seed, 10);
    
    if (isNaN(seed)) {
      return res.status(400).json({ error: 'Invalid seed parameter' });
    }
    
    const location = await findValidCoastalLocation(seed);
    res.json(location);
  } catch (error) {
    logError('Error finding coastal location', error, { seed });
    res.status(500).json({ error: 'Failed to find coastal location' });
  }
});

// Helper function to determine content type
function getContentType(filename: string): string {
  if (filename.endsWith('.fgb')) {
    return 'application/octet-stream'; // FlatGeobuf binary format
  }
  if (filename.endsWith('.geojson') || filename.endsWith('.json')) {
    return 'application/geo+json';
  }
  return 'application/octet-stream';
}

// Fallback route for SPA (Single Page Application)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});