# Export Test

Test the OTF export functionality by clicking the download button.

## Steps

1. Start the dev server with `npm run dev` if not already running
2. Navigate to http://localhost:5173 with puppeteer
3. Set a custom font name in the font name input (e.g., "TestFont")
4. Click the "Download OTF" button
5. Take a screenshot to confirm the download was triggered
6. Report the result

## Alternative (Live Site)

Can also test on the live site:
1. Navigate to https://venkat.io/my-font-editor/
2. Follow steps 3-6 above

## Expected Behavior

- Font file should download as `TestFont.otf`
- No JavaScript errors in console
- Font should contain all characters with strokes
