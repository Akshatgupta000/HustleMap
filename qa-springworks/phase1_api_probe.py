"""Phase 1 API reconnaissance and systematic tests for Effort Log Timesheet.
Does not submit bugs. Writes results as JSON lines.
"""
from __future__ import annotations

import json
import ssl
import sys
import urllib.error
import urllib.request
from datetime import date, timedelta
from pathlib import Path

BASE = "https://sv-qa-14-effort-timesheet.onrender.com"
CTX = ssl._create_unverified_context()
OUT = Path(__file__).with_name("api_probe_results.jsonl")
HEADERS = {
    "User-Agent": "Mozilla/5.0 QA-Agent",
    "Accept": "application/json",
}


def request(method: str, path: str, body=None, extra_headers=None, raw_body=None):
    headers = dict(HEADERS)
    data = None
    if raw_body is not None:
        data = raw_body if isinstance(raw_body, bytes) else raw_body.encode()
        headers.setdefault("Content-Type", "application/json")
    elif body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if extra_headers:
        headers.update(extra_headers)
        if extra_headers.get("Content-Type") == "":
            headers.pop("Content-Type", None)
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=CTX, timeout=60) as r:
            raw = r.read().decode("utf-8", "replace")
            try:
                parsed = json.loads(raw) if raw else None
            except json.JSONDecodeError:
                parsed = raw[:500]
            return {
                "ok": True,
                "status": r.status,
                "content_type": r.headers.get("content-type"),
                "body": parsed,
                "raw_preview": raw[:500],
            }
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")
        try:
            parsed = json.loads(raw) if raw else None
        except json.JSONDecodeError:
            parsed = raw[:500]
        return {
            "ok": False,
            "status": e.code,
            "reason": e.reason,
            "content_type": e.headers.get("content-type") if e.headers else None,
            "body": parsed,
            "raw_preview": raw[:500],
        }
    except Exception as e:
        return {"ok": False, "status": None, "error": f"{type(e).__name__}: {e}"}


def log(case: str, result: dict, **meta):
    row = {"case": case, **meta, **result}
    with OUT.open("a", encoding="utf-8") as f:
        f.write(json.dumps(row, ensure_ascii=True) + "\n")
    status = result.get("status")
    brief = result.get("body")
    if isinstance(brief, (dict, list)):
        brief = json.dumps(brief, ensure_ascii=True)[:240]
    print(f"[{status}] {case}: {brief}")


def main():
    OUT.write_text("", encoding="utf-8")
    today = date(2026, 9, 10)  # assessment clock
    yesterday = (today - timedelta(days=1)).isoformat()
    tomorrow = (today + timedelta(days=1)).isoformat()
    today_s = today.isoformat()

    print("=== BASELINE ===")
    for path in ["/api/agents", "/api/candidates", "/api/logs", "/api/analytics"]:
        log(f"GET {path}", request("GET", path))

    print("=== ANALYTICS RETRY ===")
    for i in range(3):
        log(f"GET /api/analytics retry {i+1}", request("GET", "/api/analytics"))

    valid = {
        "agentId": "AG1",
        "candidateId": "C1",
        "date": yesterday,
        "minutes": 30,
    }

    print("=== REQUIRED FIELDS ===")
    log("POST all fields", request("POST", "/api/logs", valid), expected=201)
    for field in ["agentId", "candidateId", "date", "minutes"]:
        body = dict(valid)
        body.pop(field)
        log(f"POST missing {field}", request("POST", "/api/logs", body), expected=400)
        body = dict(valid)
        body[field] = None
        log(f"POST null {field}", request("POST", "/api/logs", body), expected=400)
        body = dict(valid)
        body[field] = ""
        log(f"POST empty {field}", request("POST", "/api/logs", body), expected=400)

    print("=== AGENT / CANDIDATE REFS ===")
    log("POST unknown agent", request("POST", "/api/logs", {**valid, "agentId": "AG99"}), expected=400)
    log("POST unknown candidate", request("POST", "/api/logs", {**valid, "candidateId": "C99"}), expected=400)
    log("POST agent wrong type", request("POST", "/api/logs", {**valid, "agentId": 1}), expected=400)
    log("POST candidate wrong type", request("POST", "/api/logs", {**valid, "candidateId": 1}), expected=400)

    print("=== MINUTES BOUNDARY ===")
    for m in [0, -1, 1, 2, 479, 480, 481, 9999, 30.5, "30", True, False]:
        log(f"POST minutes={m!r}", request("POST", "/api/logs", {**valid, "minutes": m}))

    print("=== DATE VALIDATION ===")
    for d in [
        today_s,
        yesterday,
        tomorrow,
        "2099-01-01",
        "10-09-2026",
        "2026/09/10",
        "2026-9-10",
        "2026-02-30",
        "not-a-date",
        20260910,
    ]:
        log(f"POST date={d!r}", request("POST", "/api/logs", {**valid, "date": d}))

    print("=== MALFORMED ===")
    log("POST malformed json", request("POST", "/api/logs", raw_body="{not json"))
    log(
        "POST extra field",
        request("POST", "/api/logs", {**valid, "extra": "x", "minutes": 31}),
    )

    print("=== GET LOGS FILTERS ===")
    log("GET logs no filter", request("GET", "/api/logs"))
    log("GET logs agent AG1", request("GET", "/api/logs?agentId=AG1"))
    log("GET logs agent AG11", request("GET", "/api/logs?agentId=AG11"))
    log("GET logs agent AG", request("GET", "/api/logs?agentId=AG"))
    log("GET logs date 2026-07-20", request("GET", "/api/logs?date=2026-07-20"))
    log("GET logs AG1+2026-07-20", request("GET", "/api/logs?agentId=AG1&date=2026-07-20"))
    log("GET logs AG1+yesterday", request("GET", f"/api/logs?agentId=AG1&date={yesterday}"))

    print("=== ANALYTICS AFTER POSTS ===")
    log("GET analytics after posts", request("GET", "/api/analytics"))
    print("Wrote", OUT)


if __name__ == "__main__":
    main()
