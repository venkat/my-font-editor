# Local

Start the Vite development server and preview the app for testing changes.

## Steps

1. Kill any existing processes on port 5173
2. Start the dev server with `npm run dev` in the background
3. Wait 3 seconds for the server to start
4. Navigate to http://localhost:5173 using puppeteer
5. Take a screenshot at 1200x800
6. Show the screenshot to the user
7. Inform the user the dev server is running at http://localhost:5173

## Notes

- Uses Vite dev server with hot module reload
- Changes to source files will auto-refresh
- Press Ctrl+C in terminal to stop the server
