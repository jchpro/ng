# docs-app deployment

docs-app (https://ng.jchpro.pl) is a static site served from the maintainer's VPS and managed by the private `infra-vps` repo.
[deploy-docs-app.yaml](.github/workflows/deploy-docs-app.yaml) builds it and streams a `tar.gz` over SSH to a restricted
deploy gate on the server, which switches the release atomically, keeps the last five and rolls back by itself if a
release fails its checks.

- **When**: every push to `main` except docs-only changes (`**.md`, `docs/**`), and by hand from the Actions tab
  (*Deploy docs-app*; `dry_run` is on by default: it builds and packs, validates the Environment, and does not connect).
- **Environment**: the GitHub Environment `docs-prod`, limited to the `main` branch. Secrets `DEPLOY_SSH_KEY` and
  `DEPLOY_KNOWN_HOSTS`, variable `DEPLOY_HOST`. The key is pinned to this one instance on the server.
- **Why copied, not called**: `infra-vps` is private and this repo is public, so the reusable workflow cannot be called from
  here. The workflow is adapted from its `deploy-ui.yml` and [the ssh-deploy action](.github/actions/ssh-deploy/action.yml)
  is a copy of its action. When `infra-vps` changes those, update the copies by hand.
- **Rollback**: `ssh -i <deploy key> deploy@<host> rollback` (see `infra-vps`, `docs/runbooks/rollback-deploy.md`).
