# Setting up GitHub sign-in for Dadi (about 15 minutes)

Dadi works without this setup. Complete it so that contributions go straight to the repository from each contributor's own GitHub account.

## 1. Create the GitHub App
1. GitHub > Settings > Developer settings > GitHub Apps > New GitHub App.
2. Name: `Dadi`. Homepage URL: the Pages address (`https://<owner>.github.io/sitainge/dadi/`).
3. Check **Enable Device Flow**. Uncheck Webhook (Active). Leave "Request user authorization during installation" off.
4. Permissions > Repository permissions > **Issues: Read and write**. No other permission is needed. (Metadata: read-only is added automatically.)
5. Where can this app be installed: **Only on this account**.
6. Create the App. Copy the **Client ID** (it starts with `Iv1.` or `Iv23`). Do not generate a client secret; nothing here needs one.

After creating the App, open its page > Install App and install it on the `sitainge` repository only. A GitHub App user token can act only where the App is installed, and only within what the signed-in person may do. Contributors do not install anything: they sign in with a code and approve. If sending reports "app not found", the installation on the repository is missing.

This setup follows GitHub's documented device flow for GitHub Apps but has not yet been run against a live App. If a step differs on screen, follow GitHub's current page and update this file.

## 2. Deploy the relay (Cloudflare, free plan, no card)
1. dash.cloudflare.com > Workers & Pages > Create > Create Worker > name it `dadi-relay` > Deploy.
2. Edit code: replace everything with the contents of `dadi-worker/relay.js`. Deploy.
3. Settings > Variables and Secrets > add two plain variables: `CLIENT_ID` = the Client ID, and `ALLOWED_ORIGIN` = `https://<owner>.github.io` (no slash, no path).
4. Copy the Worker address, which looks like `https://dadi-relay.<you>.workers.dev`.

## 3. Point Dadi at the relay
Edit `website/dadi/config.js` on GitHub: set `githubClientId` and `relayUrl`. Commit, then wait for the Pages deploy.

## 4. Check
Open Dadi > Me > Sign in with GitHub. A code appears; enter it at github.com/login/device. Back in Dadi, the app should report that the user is signed in. Queue one test item in Teach and send it. An issue titled `[Dadi] ...` should appear in the repository. Delete the test issue afterwards.

## Optional
- `requireSignIn: true` makes sign-in mandatory before sending.
- Ingest: see `ingest-dadi-workflow.yml.txt`.
- Tokens expire after 8 hours, and people sign in again. Their queue is kept on the device.
- If sign-in breaks, nothing is lost: the queue stays local, and the copy, file and email options still work.
