# Contributing to Barterly

Thank you for your interest in contributing to Barterly. This guide explains how to set up the project, choose an issue, submit a pull request, and work with maintainers during review.

## Project Setup

Barterly has two apps:

- `barterly-backend`: Express.js, MongoDB, Socket.io, Redis, RabbitMQ
- `barterly-frontend`: React, Vite, Tailwind CSS

Follow the setup instructions in the root `README.md` before starting work. Use Node.js 18 or higher.

## Before You Start

1. Check existing issues before opening a new one.
2. Comment on the issue you want to work on and wait for assignment.
3. Do not submit pull requests for unassigned issues unless a maintainer has asked for it.
4. Ask for clarification on the issue before starting if the expected behavior is unclear.

## Branch Naming

Use short, descriptive branch names:

```bash
feature/add-skill-empty-state
fix/login-error-message
docs/update-frontend-readme
test/add-auth-validation-tests
```

## Commit Messages

Use clear commit messages with one of these prefixes:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting-only changes
- `refactor:` for code restructuring without behavior changes
- `test:` for tests
- `chore:` for maintenance work

Examples:

```bash
feat: add empty state to bookmarks page
fix: handle missing category in skill cards
docs: add frontend setup instructions
```

## Code Style

- Use modern JavaScript and React patterns already present in the codebase.
- Keep changes focused on the assigned issue.
- Do not mix unrelated formatting or refactors into feature and bug-fix pull requests.
- Use meaningful variable and function names.
- Add comments only when the logic is not obvious.
- Follow the existing folder structure for pages, components, services, controllers, routes, and models.

## Testing Expectations

Before opening a pull request, run the checks for the part of the project you changed.

For frontend changes:

```bash
cd barterly-frontend
npm install
npm run lint
npm run build
```

For backend changes:

```bash
cd barterly-backend
npm install
npm test
```

If the change needs external services such as MongoDB, Redis, RabbitMQ, Cloudinary, or SMTP, mention what you tested locally and what could not be tested.

## Pull Request Requirements

Every pull request must include:

- What changed
- Why it changed
- How to test it
- Screenshots or screen recordings for UI changes
- Linked issue number
- Any known limitations or follow-up work

Use this format:

```md
## What Changed

## Why

## How To Test

## Screenshots

## Related Issue

Closes #issue-number

## Notes
```

## Review Timeline

Maintainers will try to respond to issue assignment requests and pull requests within 24-48 hours. If you do not receive a response after that, you may leave one polite follow-up comment.

During review:

- Respond to requested changes within 48 hours when possible.
- Explain your approach if a maintainer asks.
- Do not resolve review comments until the requested change or discussion is complete.
- Keep the pull request updated with the target branch.

## AI Assistance

You may use AI tools for learning, debugging, or boilerplate, but you must understand and test every line you submit. If AI substantially helped with your solution, mention it in the pull request notes.

Do not submit copied code from closed-source projects, unrelated repositories, or AI output that you cannot explain.

## Good First Issues

Issues labelled `good first issue` are intended for beginners and should be small, well-scoped tasks. If you are new to the project, start there.

## Community Standards

Be respectful, constructive, and patient. Barterly is intended to be beginner-friendly, and maintainers may close issues or pull requests that include harassment, spam, plagiarism, or low-effort changes.
