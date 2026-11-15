# Changing the encrypted entrance

The entry encrypts only its launcher, not public catalogs/assets. The browser uses
PBKDF2/SHA-256 (100,000 iterations), AES-256-GCM, and Base64 bytes in this order:
16-byte salt, 12-byte IV, ciphertext, 16-byte authentication tag.

After successful popup creation, the new tab holds the site in an `about:blank`
iframe shell and the original tab is replaced with `https://www.google.com/`.
Blocked popups leave the entrance in place until Open succeeds. This exit URL is
plain launcher code in `index.html`, outside the encrypted payload.

## Regenerate

From the checkout with Node installed:

```bash
node .github/scripts/entry-payload.cjs --check
node .github/scripts/entry-payload.cjs
```

The first command checks the current password without writing. The second asks
for the current password, a new password, and confirmation. Prompts do not echo;
passwords are not arguments, logged output, or generated plaintext files. Use an
interactive terminal. No npm dependencies are needed.

The script decrypts/validates the current `{html, pages}`, generates a fresh salt
and IV, verifies its new ciphertext, then replaces only the inline payload and
`PASSWORD_LENGTH` in `index.html`. Failed decryption, validation, or confirmation
leaves the file unchanged. It supports 1–128 printable ASCII characters, matching
the entrance's ordinary keyboard input. Prefer a password longer than a single
character. It does not recover a forgotten current password.

To change the shell, provide `--launcher /path/to/launcher.json`. The JSON must
have an `html` string containing the `content-frame` iframe and a `pages` array
containing exactly `gnmath.html` and `ugs.html` (in the desired default order).
Keep fullscreen permissions and full-window iframe layout. This option still
requires the current password. `--index PATH` targets a disposable copy for a dry
run; review that copy before replacing the real entry. Do not add credentials to
shell HTML.

## Review and test

```bash
node --test tests/entry-payload.cjs tests/loader-fixes.cjs
python3 tests/entry.py
```

Browser helpers default to the current repository test password, `locked`.
After actually changing the password, set `ENTRY_PASSWORD` in your test terminal
and CI environment before running browser suites that call `unlock_entry`.
For a local terminal, read it without putting it in shell history:

```bash
read -rs 'ENTRY_PASSWORD?Entry test password: '
export ENTRY_PASSWORD
python3 tests/entry.py
unset ENTRY_PASSWORD
```

That `read` example is for zsh. Configure the corresponding Actions secret
`ENTRY_PASSWORD` when changing production's password; the Pages check step uses
it when present and otherwise the helper defaults to `locked`. Do not change the
production password without updating that test configuration. The test password
is not server authentication: direct catalog routes remain public.

Review `git diff`, add a Home update for an actual user-facing entrance change,
and exercise automatic matching without Enter, stray prefix typing, Backspace,
wrong-password feedback, popup recovery, saved catalog choices, and nested
navigation. Regenerating ciphertext with the same shell/password alone is not a
user-facing feature and does not require an Updates entry.
