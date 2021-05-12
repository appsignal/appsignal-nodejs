---
bump: "patch"
---

Replace the `--no-report` option--which turned sending the diagnose report
to AppSignal's servers off--with `--send-report` and `--no-send-report`.

By default, the report is not sent if you don't pass `--send-report`.
