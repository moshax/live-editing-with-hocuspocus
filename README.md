# Live Editing with Hocuspocus

[Live Demo](https://2ooly.com/live-editor-demo/)

A collaborative rich-text editor built with React, Vite, Tiptap, and Yjs. It connects to a Hocuspocus backend for real-time document sync, shared cursors, and live comments so multiple users can edit together.

## Features
- Real-time collaboration powered by Yjs and Hocuspocus (shared cursors and presence colors)
- Rich text formatting (headings, lists, bold/italic/underline, links, images, highlights, text alignment)
- Inline comments with the ability to clear all comment markers across the document
- Arabic-first UI copy suitable for educational demos
- Configurable document ID and username via the global `window.EditorConfig` object

## Prerequisites
- Node.js 18 or newer
- npm (bundled with Node.js)

## Local development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```
3. Open the printed URL (defaults to `http://localhost:5173`).

### Configuration
- The Hocuspocus WebSocket endpoint is set inside [`src/CollaborativeEditor.jsx`](src/CollaborativeEditor.jsx) (`url: 'wss://2ooly.com/'`). Update it to point to your own Hocuspocus server when self-hosting.
- Document metadata can be provided before loading the bundle:
  ```html
  <script>
    window.EditorConfig = {
      docId: 'my-shared-doc',
      userName: 'Student Name'
    }
  </script>
  <script type="module" src="/src/main.jsx"></script>
  ```
  If omitted, the app falls back to sensible defaults.

## Building for production
```bash
npm run build
npm run preview  # Optional: serve the production build locally
```

## Docker setup
You can containerize the app with a multi-stage build (Node for compilation, Nginx for static hosting). Save the following as `Dockerfile` in the project root:

```Dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run the image:
```bash
docker build -t hocuspocus-editor .
docker run --rm -p 4173:80 hocuspocus-editor
```
Then visit `http://localhost:4173` to use the editor. Update the Hocuspocus URL in `src/CollaborativeEditor.jsx` before building if you want the container to connect to your own server.
