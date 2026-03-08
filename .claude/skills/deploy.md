# Deploy

Deploy changes to GitHub Pages and verify the deployment.

## Steps

1. Run `npm test` to ensure all tests pass
2. Run `npm run build` to verify production build works
3. Check for uncommitted changes with `git status`
4. If there are changes, stage and commit them with a descriptive message
5. Push to origin main
6. Wait for GitHub Actions deployment to complete (check with `gh run list --limit 1`)
7. Once deployment succeeds, open https://venkat.io/my-font-editor/ with puppeteer
8. Take a screenshot to verify the deployment
9. Report the deployment status to the user

## Important

- Tests MUST pass before committing
- Build MUST succeed before pushing
- Deployment will be blocked by CI if tests fail
