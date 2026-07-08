# Robo-ValueRL Video Assets

Add videos with these filenames to replace the page's visual placeholders:

- `overview.mp4` — hero intro video.
- `chip-insertion.mp4` — portrait task video for millimeter-level chip insertion.
- `block-disassembly.mp4` — portrait task video for generalizable block disassembly.
- `failure-recovery.mp4` — result/method demo for recovery behavior.
- `self-correction.mp4` — result/method demo for self-correction behavior.
- `online-adaptation.mp4` — result/method demo for online adaptation.
- `value-progress.mp4` — Methodology module 01, value progress demo.
- `error-sensitivity.mp4` — Methodology module 01, error sensitivity demo.
- `history-ablation.mp4` — Methodology module 01, history ablation demo.
- `quality-labels.mp4` — Methodology module 02, action-quality labels demo.
- `chip-policy.mp4` — Methodology module 02, chip policy demo.
- `block-policy.mp4` — Methodology module 02, block policy demo.
- `residual-gate.mp4` — Methodology module 03, residual gate demo.

After adding a video file, also add its relative path to `manifest.json`, for example:

```json
{
  "available": ["assets/videos/overview.mp4"]
}
```

The page keeps polished placeholders visible when files are absent from `manifest.json`.

Large local `.mov` files are ignored by git. Use compressed web exports, external hosting, or Git LFS before publishing original videos with the page.
