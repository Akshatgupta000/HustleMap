# Architecture Overview

HustleMap is designed with a decoupled architecture prioritizing real-time synchronization, seamless cross-platform communication (Web app to Chrome Extension), and intelligent data extraction.

## System Components

### 1. Frontend (React + Vite)
- **State Management:** Uses `@tanstack/react-query` as the primary server state manager. It handles aggressive caching, retry logic, and background polling.
- **Cross-Tab Sync:** A custom `AutoSyncQueries` component listens to `storage` events. When the extension saves a job, it updates local storage, triggering a TanStack Query invalidation across all open HustleMap tabs, resulting in a live-updating dashboard.

### 2. Backend (Express API)
- **Dynamic CORS:** Given the presence of a Chrome Extension (which operates outside traditional web origins), the Express server implements a dynamic CORS strategy. It validates typical web requests against a `CLIENT_URL` whitelist, but allows `chrome-extension://` origins to connect smoothly.
- **File Uploads:** Utilizes `multer` for handling base64 / binary payload submissions from the extension.

### 3. Chrome Extension (Manifest V3)
- **Auth Strategy:** Instead of implementing a complex OAuth or JWT handoff flow for the extension popup, HustleMap utilizes an **Extension ID**. Users generate this ID in their dashboard and paste it into the extension settings. The extension then attaches this ID to outgoing POST requests to attribute captured jobs to the correct user account.

### 4. Data Extraction Pipeline
When the Chrome extension sends a screenshot payload to the `/api/jobs/screenshot` endpoint, the following flow executes:
1. **Receipt:** `multer` parses the incoming payload.
2. **OCR Fallback:** `tesseract.js` processes the raw image into a block of text.
3. **AI Structuring:** The text (or image data directly) is piped into `@google/generative-ai` (Gemini API).
4. **JSON Conversion:** The AI is prompted to return structured JSON containing inferred fields like Company Name, Role, Location, and Requirements.
5. **Database Storage:** The structured data is stored in MongoDB as a "Captured" job, awaiting user review and conversion into the active pipeline.
