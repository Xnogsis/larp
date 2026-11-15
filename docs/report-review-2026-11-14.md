# Review of supplied game reports

Reviewed November 14, 2026, against source `56123d4` plus local changes. The
supplied events are dated November 9–11; they are historical evidence, not proof
that each fault remains in the current deployed version. Duplicate reports are
grouped below. No Discord test submissions were made and no error filters were
broadened.

| Game / report pattern | Count | Classification and current disposition |
| --- | ---: | --- |
| EvoWars: CPMstar zonefile | 2 | Optional ad helper. Current diagnostic classifier already recognizes this exact host/path family; retain in diagnostics without auto-reporting. |
| Retro Bowl College: GameMaker_Init undefined | 2 | Required engine failed to initialize. Keep reportable. Exact engine URL currently returns 200 from jsDelivr and raw GitHub, 403 from esm.sh. Existing mirror fallback is relevant, but HTTP success is not proof gameplay is fixed on the affected network. |
| Highway Racer 2: NotAllowedError from play() | 1 | Audio needs user interaction. Current narrow interaction classifier handles this exact message family. |
| Chat Bot AI: manual disconnect report | 1 | Real user symptom; cause unresolved. Thirty-second production-origin socket observation connected, but does not reproduce a longer/intermittent failure. |
| EvoWars: cross-origin Worker SecurityError | 1 | Genuine startup/worker failure. Current EvoWars blob-worker bridge addresses the cross-origin constructor mechanism; covered by loader tests. No fresh complete EvoWars session claimed. |
| Soccer Random: unexpected end of input | 1 | Genuine syntax failure. Existing targeted exported-comment repair addresses known cause; loader regression passes. Stackless report alone cannot exclude other causes. |
| Bloons TD 5: local ruffle.js failed | 1 | Required Flash engine, not optional. Current larp.mom runtime URL returns 200; prior event on larp.surf does not establish the cause. Keep reportable. |
| Bob the Robber 2: CDN-root /js/main.js | 1 | Original-host wrapper removed by current matching LAMAR HTML fix. Do not globally classify any /js/main.js failure as optional. |
| Bob the Robber 2: undefined requestAds | 1 | Likely ad integration, but no stack/source location supplied. Current Bob optional-display handling addresses a related path; do not claim this exact symptom reproduced or globally suppress requestAds errors. |
| City Smash: duplicated JSZip folder | 1 | Required asset failure. Current path correction removes duplicated folder; regression passes. |
| Escape Road: script URL is game directory | 1 | Known optional wrapper/null-placeholder pattern in current diagnostics. Not equivalent to filtering its engine scripts. |
| Moto X3M 2: motox3m2.min.js failed | 2 | Required game script. Exact URL currently returns 200; preserve reports and investigate affected-network/mirror recurrence. |
| Blackjack: NotSupportedError, unsupported sources | 1 | Potential optional sound failure. Existing local script rewrite catches rejected Sound.play calls. Do not suppress all NotSupportedError: that can hide genuine missing media/engine assets. |
| OvO: cache already declared | 1 | Genuine helper syntax/reload defect. Current scoped translation-cache repair addresses repeat helper loads; regression passes. |
| Minecraft 1.12.2: WrongDocumentError pointer lock | 1 | Genuine document/context problem, distinct from user-gesture denial. Still unresolved; deliberately reportable. |
| Moto X3M: null.php, no query shown | 2 | Ambiguous. Report redaction removes query data; original null URL may wrap an ad request, but that is not established by the supplied text. Current filter requires a recognizable optional wrapped target and does not suppress a bare null.php. |
| Rooftop Snipers 2: sdkv3/master-loader.js | 1 | Required bootstrap despite SDK name. Inspected script loads platform SDK and then Unity bootstrap; suppressing it would hide startup failure. Exact URL currently returns 200. |
| Rooftop Snipers: CDN-root /js/main.js | 1 | Known original-host wrapper family removed by targeted HTML fix when its LAMAR marker matches. No blanket CDN-root suppression. |
| Scrap Metal 3: scrapUnityLoader.js failed | 1 | Required Unity loader. Exact URL currently returns 200; keep reportable. |
| Scrap Metal 3: UnityLoader undefined | 1 | Consequence consistent with preceding missing loader. Treat as the same likely startup incident, not proof of a separate fixed bug. |
| Protektor: CDN-root /js/main.js | 1 | Known original-host wrapper removed by matching current LAMAR fix. |
| Protektor: undefined cordova.file in pathfind.js | 1 | Real worker failure cascading into Cordova fallback. Inspected pathfind.js first tries new Worker, then reads cordova.file on constructor failure. Current blob bridge targets that first failure; not grounds to suppress undefined-property errors. |
| PEAK: NotAllowedError pointer lock | 1 | User gesture needed; current narrow classifier handles it. |
| Johnny Trigger: egret.min_d92caeca.js failed | 1 | Required engine, distinct from optional adsdk.js. Exact pinned URL currently returns 200; preserve engine errors. |
| Crazy Cattle 3D: unexpected '.' | 1 | Genuine syntax failure; existing audio-worklet optional-chaining repair addresses the known corrupted script. Stackless report is insufficient to prove the same location. |
| Crossy Road: null SetVolume | 1 | Startup/audio-manager race. Current targeted external-script guard handles known SetVolume calls; regression passes. |
| pokeblack2html: missing parent.maeExportApis_ | 1 | Confirmed unsupported host-bridge call still present in pinned page. New local scoped HTML fix removes it for this Pokémon launcher and preserves emulator configuration/Play wiring. |

Total: **31 supplied reports, 27 grouped patterns**. These counts are report
instances, not distinct confirmed gameplay outages. No gunspin report appears in
this supplied batch; the earlier physics symptom remains unresolved.

## Verification and limits

Current Node loader tests cover the known worker/HTML fixes and the new Pokémon
bridge removal. The reporting browser test now explicitly preserves failures for
Rooftop's master loader, Moto 2's game engine, bare null.php and generic CDN-root
scripts, along with primitive rejections and NotSupportedError. Existing optional
CPMstar/ad paths and user-gesture exclusions remain covered.

A separate browser check of the actual rewritten pinned Pokémon page found no
page exceptions and confirmed PLAY configures the NDS emulator; external assets
were blocked, so it was not a ROM playthrough.

The resource checks above were HTTP availability checks from this environment,
not a Windows/managed-school-browser reproduction, full playthrough, or proof
that historical outages never happened. Only narrow confirmed defects should
be changed; recurring required-script failures need loader diagnostics/network
observations rather than broader suppression.
