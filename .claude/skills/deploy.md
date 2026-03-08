# Deploy

Deploy changes to GitHub Pages and verify the deployment.

## Steps

1. Check for uncommitted changes with `git status`
2. If there are changes, stage and commit them with a descriptive message
3. Push to origin main
4. Wait for GitHub Actions deployment to complete (check with `gh run list --limit 1`)
5. Once deployment succeeds, open https://venkat.io/my-font-editor/ with puppeteer
6. Take a screenshot to verify the deployment
7. Report the deployment status to the user
