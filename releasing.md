# Releasing the libraries

`@jchpro/ngx-common` and `@jchpro/ngx-kit` are versioned and published independently. A release is
a PR that bumps the version, then a tag that makes GitHub Actions publish to npm. Tags are
`common-vX.Y.Z` and `kit-vX.Y.Z`. Pre-1.0, a breaking change can be a minor bump.

The docs-app is not part of this: every push to `main` deploys it
([example_app.yaml](.github/workflows/example_app.yaml)).

## Steps

1. **Pick the version** and make sure the library's changelog
   (`projects/@jchpro/<lib>/changelog.md`) has a `## [X.Y.Z] - Unreleased` heading on top,
   holding everything since the last release. Work accumulates under that one heading; the
   version number is only chosen at release time.
2. **Prepare it**, from a clean working tree, on a branch:
   ```bash
   npm run release -- prepare <common|kit> <X.Y.Z>
   ```
   This sets `version` in the library's `package.json` and dates the changelog heading. When
   releasing `common` it also moves `kit`'s peer range on it to `^X.Y.Z`: on 0.x a caret pins the
   minor, so a minor bump of `common` would otherwise leave kit's peer unsatisfiable.
3. **Review `git diff`, commit and open a PR.** The PR check
   ([pull_request.yaml](.github/workflows/pull_request.yaml)) builds everything and runs
   `npm test`, which includes `npm run check:versions`: it fails on drift between `package.json`,
   the changelog and kit's peer range.
4. **Merge the PR.** A release never needs the `main` bypass.
5. **Tag**, on an up-to-date `main`:
   ```bash
   git checkout main && git pull
   npm run release -- tag <common|kit>
   ```
   It refuses unless the tree is clean, you are on `main` at `origin/main`, the changelog entry is
   dated and the tag doesn't exist yet. It creates an annotated tag and **does not push it**.
6. **Push the tag**, which starts the publish:
   ```bash
   git push origin <lib>-vX.Y.Z
   ```
7. **Watch the run** in the Actions tab ([publish-common.yaml](.github/workflows/publish-common.yaml)
   or [publish-kit.yaml](.github/workflows/publish-kit.yaml)), then check the new version on
   npmjs.com.

### Releasing both

Publish **`common` first**: release it end to end (steps 1 to 7), then `kit`. The kit workflow
builds common from the repo, but the published kit's peer range points at the common version
on npm, which has to exist by then.

## What the publish workflow does

On a `common-v*` / `kit-v*` tag only (there is deliberately no `workflow_dispatch`, so a branch
can never publish):

1. Installs with `npm ci` on Node 24 and upgrades npm (OIDC publishing needs npm 11.5.1 or later,
   and `actions/setup-node` ignores the repo's `packageManager`).
2. `node scripts/check-versions.mjs --tag <tag>`: the tag must equal the library's `package.json`
   version and its changelog entry must be dated, not `Unreleased`.
3. Builds the production bundle (kit builds common first, since it resolves it from `dist/`) and
   runs the library's tests.
4. `npm publish --access public` from `dist/@jchpro/<lib>`, with **npm OIDC trusted publishing**:
   no `NPM_TOKEN`, `id-token: write` on the job, provenance attached automatically.

If a run fails, fix the cause and **re-run the job** from the Actions tab. If the tag itself was
wrong (before anything was published), delete it locally and on the remote, fix, and tag again.
A version already on npm can't be reused, so bump the patch instead.

## One-time setup (npmjs.com)

Each package has a **trusted publisher** configured on npmjs.com (package settings, Trusted
Publisher): GitHub Actions, repository `jchpro/ng`, and the workflow **file name**
(`publish-common.yaml` / `publish-kit.yaml`). Consequences:

- **Don't rename the workflow files.** The binding is to the file name, so publishing from a
  renamed file stops working until the trusted publisher is updated on npmjs.com.
- A new package needs the same setup. A trusted publisher is configured on an existing package,
  so its very first publish likely has to be done by hand.
- The old `NPM_TOKEN` repo secret is no longer used and can be deleted once a tag-triggered
  publish has worked for real (it hasn't run yet; see the [roadmap](roadmap.md)).
