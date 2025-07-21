# Campaign Region

A sophisticated D&D mapping tool that generates random coastal regions with hexagonal grid overlays for tabletop gaming. Built with OpenLayers and FlatGeobuf for efficient geospatial data handling, featuring server-side optimization and comprehensive error handling.

## Features

- **Server-side coastal navigation** - Fast generation of valid coastal locations using pre-calculated data
- **FlatGeobuf data format** - Cloud-optimized geospatial files with HTTP range request support
- **Multi-resolution maps** - Displays coastlines and land masses at appropriate detail levels based on zoom
- **Hexagonal grid overlay** - Configurable hex grid for measuring distances and movement
- **Screenshot capture** - Export map views with hex overlays for use in campaigns
- **Reproducible results** - Share specific views using seed values in URLs
- **LayerGroup architecture** - Efficient layer management with automatic zoom-based visibility
- **Robust error handling** - Comprehensive logging and graceful error recovery
- **Type-safe architecture** - Full TypeScript implementation with strict typing

## Quick Start

### Development (Frontend + Backend)

```bash
npm install
npm run dev:full
```

This starts both the frontend (port 5173) and backend server (port 3000) concurrently.

### Frontend Only

```bash
npm run dev
```

### Backend Only

```bash
npm run dev:server
```

Visit `http://localhost:5173` and click "Generate!" to explore random coastal regions.

## Controls

- **Generate Button** - Navigate to a new random coastal location
- **Hex Size Controls** - Adjust grid size from Tiny to Huge
- **Seed Input** - Enter specific seeds for reproducible results
- **Screenshot Button** - Download the current view with hex overlay

## Architecture

### Frontend Architecture

The frontend follows a modular architecture with clear separation of concerns:

#### Core Components
- **main.ts** - Application entry point and initialization
- **mapSetup.ts** - OpenLayers map creation with LayerGroup management
- **controls.ts** - UI event handlers and user interactions
- **navigation.ts** - Client-side navigation with server-side fallback
- **hexGrid.ts** - Canvas-based hexagonal grid overlay system
- **screenshot.ts** - Map screenshot functionality with rotation and compositing

#### Utility Modules
- **utils/errorHandler.ts** - Centralized error logging and handling
- **utils/domUtils.ts** - Safe DOM manipulation with caching
- **utils/seedManager.ts** - Seed management and URL synchronization
- **utils/seededRandom.ts** - Deterministic random number generation

#### Configuration
- **constants.ts** - Application-wide constants and magic numbers
- **config/dataSources.ts** - Geographic data source configurations
- **config/mapStyles.ts** - OpenLayers styling definitions
- **config/hexSizes.ts** - Hexagonal grid size configurations

#### Data Loading
- **createLoader.ts** - FlatGeobuf loader with spatial filtering and error handling

### Backend Architecture

#### Server Components
- **server.ts** - Express server with HTTP range request support and structured logging
- **coastalLocationFinder.ts** - Main coastal intersection logic coordinator
- **utils/coastalLocationUtils.ts** - Modular coastal calculation utilities
- **constants.ts** - Server-side constants and configuration

#### Key Features
- **HTTP Range Requests** - Efficient partial content delivery for FlatGeobuf files
- **Coastal Location API** - Server-side calculation of valid coastal views
- **Structured Logging** - Consistent error reporting and debugging information
- **File Security** - Validated file serving with proper MIME types and security headers

### Technology Stack

#### Frontend
- **OpenLayers** - Web mapping library for rendering and interaction
- **FlatGeobuf** - Efficient binary geospatial format with spatial indexing
- **Turf.js** - Geospatial analysis for intersection detection
- **TypeScript** - Type safety and development tooling
- **Vite** - Build tool and development server with API proxying

#### Backend
- **Express.js** - Web server with middleware support
- **Node.js** - JavaScript runtime with ES modules
- **Turf.js** - Server-side geospatial analysis
- **TypeScript** - Type-safe server-side development

### Data Layer System

The application uses a sophisticated multi-resolution approach:

#### Resolution Levels
- **High detail (10m)** - For detailed coastal views (zoom 9-23)
- **Medium detail (50m)** - For regional exploration (zoom 5-9)  
- **Low detail (110m)** - For continental overviews (zoom 0-5)

#### Data Management
- **LayerGroups** - Organized layer management with automatic visibility
- **Spatial Indexing** - FlatGeobuf's built-in spatial indexing for efficient queries
- **HTTP Range Requests** - Partial file loading for optimal performance
- **Zoom-based Loading** - Automatic layer switching based on zoom level

### Navigation System

#### Server-side Calculation
1. **Seeded Random Generation** - Deterministic coordinate generation
2. **Coastal Intersection Testing** - Turf.js-based geometric analysis
3. **View Validation** - Ensures minimum coastal intersections for interesting views
4. **Fallback Locations** - Guaranteed valid results with predefined fallbacks

#### Client-side Fallback
- **Data Availability Check** - Graceful degradation when server unavailable
- **Local Intersection Logic** - Complete client-side implementation as backup
- **Error Recovery** - Automatic fallback to fixed locations when all else fails

## Development Commands

### Frontend & Backend
- `npm run dev:full` - Start both frontend and backend servers concurrently
- `npm run dev` - Start frontend development server with Vite (port 5173)
- `npm run dev:server` - Start backend server in development mode (port 3000)

### Building
- `npm run build` - Build frontend for production (TypeScript + Vite)
- `npm run build:server` - Build backend server for production
- `npm run start` - Start production server
- `npm run preview` - Preview production build locally

### Code Quality
- `npm run lint` - Run ESLint on TypeScript files
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without making changes

## API Endpoints

### Coastal Location API
- `GET /api/coastal-location/:seed` - Get valid coastal location for given seed
  - **Parameters**: `seed` (integer) - Deterministic seed for location generation
  - **Returns**: JSON object with center coordinates, zoom level, rotation, and seed
  - **Error Handling**: 400 for invalid seeds, 500 for calculation failures

### Data Serving API
- `GET /api/data/:filename` - Serve FlatGeobuf files with HTTP range request support
  - **Supports**: Partial content requests (HTTP 206 responses)
  - **Security**: File extension validation, path traversal protection
  - **Caching**: Proper cache headers for optimal performance
  - **Error Handling**: 400 for invalid files, 404 for missing files

## File Structure

```
src/
├── main.ts                    # Application entry point and initialization
├── mapSetup.ts               # OpenLayers map and LayerGroup management
├── types.ts                  # TypeScript interfaces and type definitions
├── constants.ts              # Application-wide constants and configuration
├── controls.ts               # UI event handlers and user interactions
├── navigation.ts             # Navigation logic with server integration
├── hexGrid.ts                # Canvas-based hexagonal grid overlay
├── screenshot.ts             # Screenshot functionality with composition
├── createLoader.ts           # FlatGeobuf loader with spatial filtering
├── utils/
│   ├── errorHandler.ts       # Centralized error logging and handling
│   ├── domUtils.ts           # Safe DOM manipulation utilities
│   ├── seedManager.ts        # Seed management and URL synchronization
│   └── seededRandom.ts       # Deterministic random number generation
└── config/
    ├── dataSources.ts        # Geographic data source configurations
    ├── mapStyles.ts          # OpenLayers styling definitions
    └── hexSizes.ts           # Hexagonal grid size configurations

server/
├── server.ts                 # Express server with range request support
├── coastalLocationFinder.ts  # Main coastal intersection coordinator
├── constants.ts              # Server-side constants and configuration
└── utils/
    └── coastalLocationUtils.ts  # Modular coastal calculation utilities

public/
├── coast*.fgb               # Coastline data at multiple resolutions
└── land*.fgb                # Land mass data at multiple resolutions
```

## Error Handling

The application implements comprehensive error handling throughout:

### Frontend Error Handling
- **Structured Logging** - Consistent error format with context and timestamps
- **User-Friendly Fallbacks** - Graceful degradation when operations fail
- **DOM Safety** - Protected element access with meaningful error messages
- **Network Resilience** - Automatic retry and fallback mechanisms

### Backend Error Handling
- **Request Validation** - Input sanitization and type checking
- **File Security** - Path traversal protection and file type validation
- **Structured Responses** - Consistent JSON error responses
- **Detailed Logging** - Comprehensive error context for debugging

## Performance Optimizations

### Data Loading
- **Spatial Indexing** - FlatGeobuf's built-in R-tree indexing
- **HTTP Range Requests** - Partial file loading for large datasets
- **Layer Management** - Automatic loading/unloading based on zoom
- **Caching Strategy** - Browser and server-side caching optimization

### Rendering
- **Canvas Optimization** - Efficient hex grid drawing with proper clearing
- **Layer Grouping** - Reduced rendering overhead with LayerGroups
- **Event Throttling** - Controlled update frequency for smooth interaction
- **Memory Management** - Proper cleanup and resource management

### Navigation
- **Server-side Calculation** - Offloaded expensive calculations to backend
- **Smart Fallbacks** - Multiple levels of graceful degradation
- **Cached Lookups** - Reduced redundant calculations
- **Optimized Algorithms** - Efficient geometric intersection testing

## Code Quality Standards

### TypeScript Implementation
- **Strict Type Checking** - Full type safety with strict compiler options
- **Interface Definitions** - Clear contracts for all data structures
- **Proper Generics** - Type-safe generic implementations where needed
- **No Implicit Any** - Explicit typing throughout the codebase

### Code Organization
- **Single Responsibility** - Each module has a clear, focused purpose
- **Dependency Injection** - Loose coupling between components
- **Configuration Management** - Centralized constants and configuration
- **Utility Functions** - Reusable helper functions with clear interfaces

### Testing Considerations
- **Error Boundary Testing** - All error paths have defined behavior
- **Input Validation** - Comprehensive validation of user inputs
- **Edge Case Handling** - Proper handling of boundary conditions
- **Fallback Verification** - All fallback mechanisms are tested

## Deployment

### Production Build
```bash
npm run build        # Build frontend
npm run build:server # Build backend
npm run start        # Start production server
```

### Environment Configuration
- **BASE_URL** - Configure asset serving path
- **PORT** - Server port configuration (default: 3000)
- **NODE_ENV** - Environment-specific optimizations

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Start development servers: `npm run dev:full`
4. Follow code quality standards with `npm run lint` and `npm run format`

### Code Standards
- Use TypeScript for all new code
- Follow existing error handling patterns
- Add comprehensive type definitions
- Include proper error handling and logging
- Write self-documenting code with clear naming

## Future Enhancements

### Immediate Improvements
- Toggle hex overlay visibility
- Increase screenshot resolution options
- Enhanced keyboard navigation
- Accessibility improvements

### Advanced Features
- Terrain elevation data integration
- User-created features and annotations
- Procedural terrain generation
- Settlement and encounter generation tools
- Custom map styling options
- Export formats (KML, GeoJSON, etc.)

### Performance Enhancements
- Web Worker integration for heavy calculations
- Progressive loading strategies
- Advanced caching mechanisms
- Offline capability with service workers

## Troubleshooting

### Common Issues

#### Build Failures
- Ensure Node.js version compatibility
- Clear `node_modules` and reinstall if dependency issues occur
- Check TypeScript compilation errors for type mismatches

#### Server Connection Issues
- Verify backend server is running on port 3000
- Check Vite proxy configuration for API requests
- Ensure CORS settings allow frontend requests

#### Map Loading Problems
- Verify FlatGeobuf files are accessible in public directory
- Check browser console for network errors
- Ensure proper file permissions for data files

#### Performance Issues
- Monitor browser memory usage for large datasets
- Check network tab for efficient data loading
- Verify layer management is working correctly

### Debug Mode
Enable detailed logging by setting browser localStorage:
```javascript
localStorage.setItem('debug', 'true');
```

## Data Attribution

Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com.

## License

This project is open source. Please refer to the license file for terms and conditions.