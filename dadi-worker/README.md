# Dadi sign-in relay

A 50-line forwarder so the static Dadi site can use GitHub's device sign-in. It holds no secret and stores nothing.
Free Cloudflare plan is enough (no card). Steps are in `docs/dadi/AUTH_SETUP.md`.
Code: `relay.js`. Test: `node scripts/tests/dadi_relay_test.js`.
