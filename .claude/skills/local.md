# Local

Start a local server and preview the app for testing changes before deployment.

## Steps

1. Kill any existing serve processes on common ports (3456-3460)
2. Start a local server with `npx serve . -p 3456` in the background
3. Wait 2 seconds for the server to start
4. Navigate to http://localhost:3456/my-font-maker.html using puppeteer
5. Take a screenshot at 1200x800
6. Show the screenshot to the user
7. Inform the user the local server is running at http://localhost:3456/my-font-maker.html
