# Gameplay and reporting investigation — November 14, 2026

These findings concern source commit `56123d4` plus the local launcher/tooling
changes. No gameplay fix or successful reproduction is claimed here.

## Gunspin (main catalog ID 91)

The pinned main entry is `91-fix2.html` in `Xnogsis/html` at
`6dde3f7f4d06535e43ff37f3665e75f486505875`. It instantiates Unity with
`Build/GunSpin%20WebGL%20FinalVersion.json` from `bubbls/gunspin`.
That configuration points its compiled runtime/data at another external repo.
The inspected `bubbls/gunspin` main revision is
`2de8e3959f085a9a1f18620910901392bb58c8d0`.

Its recursive tree contains the entry, loader, styles, Unity configuration,
compiled WASM/framework and game data; it contains no C# physics source or Unity
project. A GitHub code search for GunSpin/Rigidbody C# returned no results.
This does not establish that no source exists anywhere.

The reported high-speed ground clipping/acceleration is still unresolved.
There is no validated page-script change that can change the gun rigidbody's
collision mode or physics timestep. Guessing WASM offsets or capping global
animation timers would risk unrelated game behavior. A reproducible save,
gun/upgrades and input sequence, plus editable source or a demonstrably corrected
build, are needed to establish and test a real fix. Optional loader/ad failures
are separate from this gameplay report.

## Chat Bot AI (ID 253)

The pinned `253-update2.html` decrypts an inline XOR/Base64 wrapper into a nested
portable HTML document. Its chat component connects to
`wss://ai.thi-ng.ixl.college`. Source inspection found automatic reconnect with
up to six attempts, delays increasing by 800 ms to a six-second cap, and a
five-minute stream-inactivity watchdog. The component marks an interrupted
assistant stream stopped on close. No undocumented heartbeat was introduced.

A headless Chromium check navigated to `https://larp.mom/home.html` with automatic
reports disabled before load, then opened only the WebSocket (no chat message).
It opened after about 164 ms and remained OPEN for a 30-second observation.
A separate Node WebSocket probe failed with code 1006 and no useful error detail;
the browser result demonstrates why that Node failure alone cannot be called a
production outage. An HTTPS HEAD request returned 200, but HTTP availability is
not evidence of a working WebSocket session or completed model response.

The reported longer-session disconnect remains unconfirmed. This site does not
operate that backend. Next evidence needed: close code/reason, duration, whether
streaming was active, and whether the issue depends on the affected network.
Do not retry submitted prompts automatically: that can duplicate model requests.

## Reporting quality

The mocked browser reporting suite passed, including known optional script and
interaction-denial handling, real errors, dedupe/opt-out, redaction, modal focus
and failed-delivery recovery. The 21 existing loader tests passed. No filters
were broadened, and no real Discord test reports were sent.

The owner subsequently supplied 31 historical report events from November 9–11.
Their classification and current disposition are in
[report-review-2026-11-14.md](report-review-2026-11-14.md). Review confirmed an
uncovered Pokémon Black 2 host-bridge call, now removed with a scoped worker fix
and regression test. Several other genuine failures already have targeted fixes;
ambiguous/required errors remain reportable. No complete Windows or managed
network reproduction is claimed.

Classify each report by required failed engine/data/script, observed gameplay
symptom, optional wrapper/ad/analytics dependency, user-gesture denial, or unknown.
Retain unknown cases and real errors. Match optional resources to narrow known
host/path patterns; do not suppress all exceptions or primitive rejections.

## Repository rename

Both URLs below returned HTTP 200 with identical 1,551-byte SVG bodies:

- https://cdn.jsdelivr.net/gh/Xnogsis/larp.garden@main/play.svg
- https://cdn.jsdelivr.net/gh/Xnogsis/larp@main/play.svg

`game-viewer.js` now uses the canonical new name. A viewer regression check
verifies the generated launcher URL retains the pinned game path and `noopener`.
A headless Chromium check also loaded the new CDN URL and verified that its SVG
script fetched the pinned Bowmasters HTML and populated the iframe srcdoc (2,505
characters), with downstream game assets blocked. These checks do not establish
complete gameplay through the alternate launcher for every title. Normal loader patches still do not apply
to that alternate launcher.

## Encrypted launcher tooling

See [entry-launcher.md](entry-launcher.md). Password regeneration preserves the
current shell/pages, uses new random salt/IV, verifies ciphertext, and updates
keyboard length. The current production password/ciphertext were not changed.
Separate game-origin isolation/save migration remains outside this work.
