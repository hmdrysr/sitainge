# Setup, in the order to do it

Everything is in the update zip. If you installed the Dadi tools workflow earlier, install this version over it the same way (step 2): it adds the video and photo tasks. Only two things cannot be automated, and both are one-time: installing the workflow file (GitHub blocks automated changes to workflow files), and the Cloudflare relay for sign-in (a separate service). Everything else runs from the Actions tab.

## 1. Put the update in the repository
1. Repository > Add file > Upload files > choose `sitainge-v0.1.0.zip` > Commit changes.
2. Actions > **Unpack zip** > Run workflow. (This is the older workflow already in the repository. It unzips and commits.)
3. Actions > **Deploy site** > Run workflow. Wait for the check mark. (Pushes made by a workflow do not start other workflows, so this step is manual until step 2 below is done.)

## 2. Install the Dadi tools workflow (once)
The zip puts it at `workflows-to-install/dadi-tools.yml`. Move it so GitHub sees it:
1. Open that file on GitHub > pencil (Edit).
2. In the file name box at the top, replace the whole path with `.github/workflows/dadi-tools.yml`. (Type it carefully: no spaces, no leading slash.)
3. Commit changes.

If your phone keyboard garbles the path: Actions > New workflow > set up a workflow yourself > paste the file's contents > name it `dadi-tools.yml` > Commit.

Then, once: Settings > Actions > General > Workflow permissions > select "Read and write permissions" and check "Allow GitHub Actions to create and approve pull requests" > Save.

From now on, updates are: upload a zip, then Actions > **Dadi tools** > Run workflow > `unpack-zip`. It unzips every .zip at the top level, checks the data, rebuilds the app's offline copy, commits, and publishes the site by itself.

## 3. Turn on GitHub sign-in (optional, about 15 minutes)
Follow `AUTH_SETUP.md`. Without it, the app still works and people send contributions by copy, file, email or share.

## 4. Automatic contributions
Once step 2 is done there is nothing more to set up. When someone sends a contribution from Dadi, it arrives as an issue titled `[Dadi] ...`. The workflow reads it, assigns a speaker id (from a hash of their GitHub login, so no login is written to the repository), writes RAW records, runs the checks and opens a pull request. You review and merge. To skip the review for RAW records only, add the repository variable `DADI_AUTOMERGE` = `true` (Settings > Secrets and variables > Actions > Variables). Records stay RAW and unverified either way.

## 5. Other tasks in Dadi tools
- `check-data`: validates the repository and runs the tests.
- `rebuild-seed`: rebuilds the app's offline copy of the words and publishes.
- `deploy-site`: publishes the site again.
- `ingest-issue`: ingests one issue by number (use it for an issue the automatic step missed).
- `check-videos`: checks that each learning video still plays, counts open `[Video report]` issues, hides flagged or missing videos. Runs every Monday by itself.
- `update-media`: finds freely licensed photos on Wikimedia Commons for the landing page and credits them. Runs every Monday by itself, and is the only way photos appear.
Moderators then approve or reject: see `docs/contribute/moderators.md`.

## If something fails
Nothing is lost: contributions stay on the sender's device until sent, and every workflow commits through git, so any change can be reverted from the repository history. Open the failed run in the Actions tab and send me the red lines.
