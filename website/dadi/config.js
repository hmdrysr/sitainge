/* Dadi settings. Edit this file only; nothing else needs changing.
   githubClientId + relayUrl: turn on "Sign in with GitHub" (steps in docs/dadi/AUTH_SETUP.md). Leave empty to run without sign-in:
     learning, the dictionary and contribution drafts still work, and contributions can be exported or emailed instead.
   requireSignIn: true asks everyone to sign in before using the app (needs the two settings above). The default is false so that
     the app works offline and as a plain web page for anyone. */
window.DADI_CONFIG = {
  repo: "hmdrysr/sitainge",
  branch: "main",
  githubClientId: "",
  relayUrl: "",
  requireSignIn: false,
  contactEmail: "ctg@hamidyasir.com",
  creator: "Hamid Yasir",
  repoUrl: "https://github.com/hmdrysr/sitainge"
};
