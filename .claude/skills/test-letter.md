# Test Letter

Test editing a specific letter in the font editor.

## Arguments

- `letter` (optional): The letter to test (default: "A")

## Steps

1. Start the dev server with `npm run dev` if not already running
2. Navigate to http://localhost:5173 with puppeteer
3. Click on the "Edit letter..." button to open the character picker
4. Click on the specified letter in the character grid
5. Take a screenshot showing the letter's strokes on the canvas
6. Report what strokes are currently defined for this letter

## Alternative (Live Site)

Can also test on the live site:
1. Navigate to https://venkat.io/my-font-editor/
2. Follow steps 3-6 above
