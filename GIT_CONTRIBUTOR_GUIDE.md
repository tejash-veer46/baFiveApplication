# Git Contributor Attribution Guide

This file documents how to push commits so that both contributors appear in GitHub and repository history. Use this process when multiple people need attribution on a single feature or branch, especially when one contributor authored the commit and another should be preserved as a co-author.

## Goals

- Ensure the primary commit author is set correctly.
- Preserve a second contributor as a co-author in the commit message.
- Push the same commit to multiple remotes while preserving attribution.
- Avoid losing contributor metadata on GitHub.

---

## 1. Confirm the correct author and committer information locally

Before making any changes, verify the author identity you want to associate with the commit:

```bash
git config user.name
git config user.email
```

If you need to set the commit author for the current repository only:

```bash
git config user.name "tejash-veer46"
git config user.email "rajtejashwy@gmail.com"
```

If you are using a temporary author identity for only the next commit:

```bash
GIT_AUTHOR_NAME="Tejashveer" GIT_AUTHOR_EMAIL="rajtejashwy@gmail.com" git commit
```

---

## 2. Create a commit with the primary author

When you want the commit author to be a specific person, create or amend the commit using that author metadata.

### Option A: Create a new commit with the correct author

```bash
GIT_AUTHOR_NAME="Tejashveer" GIT_AUTHOR_EMAIL="rajtejashwy@gmail.com" git commit -m "Your commit message"
```

### Option B: Amend an existing commit author

If the commit already exists and needs its author corrected:

```bash
git commit --amend --author "Tejashveer <rajtejashwy@gmail.com>" --no-edit
```

This updates the author metadata without changing the commit message.

---

## 3. Add a co-author line to the commit message

GitHub recognizes `Co-authored-by:` trailer lines in commit messages. This is the key to showing multiple contributors.

### Best practice commit message format

```text
Short summary of the change

Detailed description of the change, why it was made, and any context.

Co-authored-by: Krushna <krushna@example.com>
```

### Add a co-author while amending without editing the message

If the commit already exists and you want to append a co-author line:

```bash
git commit --amend --no-edit --message "$(git log -1 --pretty=%B)

Co-authored-by: Krushna <krushna@example.com>"
```

### Add a co-author while editing the message manually

```bash
git commit --amend
```

Then add the `Co-authored-by:` line at the bottom of the commit message and save.

> Note: The co-author line must be exactly `Co-authored-by:` and include a valid email address.

---

## 4. Verify the commit metadata

Check that the commit author and co-author were saved correctly:

```bash
git log -1 --pretty=fuller
```

Expected output should include:

- `Author: Tejashveer <rajtejashwy@gmail.com>`
- `Commit: ...` (committer may be your current Git identity)
- `Co-authored-by: Krushna <krushna@example.com>` in the commit message body

---

## 5. Push the commit to multiple remotes

This repository currently has multiple remotes configured. The common pattern used in this project is:

- `origin` = primary repository remote
- `krushna` = secondary repository remote for Krushna

### Push to the primary remote

```bash
git push origin main
```

### Push to the secondary remote branch

If the secondary remote uses a different branch name, push it explicitly.

Example, pushing local `main` to remote `master`:

```bash
git push krushna main:master
```

### If the local branch is behind the remote

If the remote rejects the push because the branch is behind, fetch and rebase first:

```bash
git fetch origin
git rebase origin/main
```

Then retry the push:

```bash
git push origin main
```

If you intentionally need to rewrite the remote branch because the commit history was amended:

```bash
git push --force-with-lease origin main
git push --force-with-lease krushna main:master
```

> Use `--force-with-lease` instead of `--force` whenever possible. It is safer and prevents overwriting changes you do not have locally.

---

## 6. Confirm GitHub displays both contributors

After the push completes, verify on GitHub that:

- The commit author is listed as the specified primary author.
- The commit message includes the `Co-authored-by:` trailer.
- GitHub shows both contributors on the commit details page.

If the co-author does not appear immediately, GitHub may take a moment to index the new metadata.

---

## 7. Example workflow for this project

1. Stage changes:

```bash
git add .
```

2. Create or amend commit with primary author:

```bash
GIT_AUTHOR_NAME="Tejashveer" GIT_AUTHOR_EMAIL="rajtejashwy@gmail.com" git commit -m "Update theme and login UI"
```

3. Add co-author line:

```bash
git commit --amend -m "Update theme and login UI

Co-authored-by: Krushna <krushna@example.com>"
```

4. Verify the commit:

```bash
git log -1 --pretty=fuller
```

5. Push to both remotes:

```bash
git push origin main
git push krushna main:master
```

---

## 8. Troubleshooting

- If the author is wrong after a push, amend locally and push again with `--force-with-lease`.
- If the co-author line is missing, use `git commit --amend` and add it manually.
- If GitHub still does not show the co-author, verify the email address matches a GitHub account.

---

## 9. Notes

- GitHub recognizes co-authorship only when the email address is associated with a GitHub account.
- If you want a third contributor, add additional `Co-authored-by:` lines in the same commit.
- Keep commit messages clear and descriptive, with co-author trailers separated by a blank line from the body.
