#!/usr/bin/env python3
"""Mine 2026/27 cup competitions into published-fixtures.json without remineing leagues."""

from __future__ import annotations

import calendar
import json
import re
import time
import unicodedata
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app/data/published-fixtures.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

CUP_MONTHS = [
    "202608",
    "202609",
    "202610",
    "202611",
    "202612",
    "202701",
    "202702",
    "202703",
    "202704",
    "202705",
    "202706",
]

# User-facing calendar names. ESPN slugs that 400/empty still run so a remine picks them up.
SOURCES = [
    ("Champions League", "Football", "Europe", "soccer/uefa.champions", "Europe/London", CUP_MONTHS),
    ("Europa Cup", "Football", "Europe", "soccer/uefa.europa", "Europe/London", CUP_MONTHS),
    ("Europa Conference League", "Football", "Europe", "soccer/uefa.europa.conf", "Europe/London", CUP_MONTHS),
    ("FA Cup", "Football", "England", "soccer/eng.fa", "Europe/London", CUP_MONTHS),
    ("Carabao Cup", "Football", "England", "soccer/eng.league_cup", "Europe/London", CUP_MONTHS),
    ("Italian Cup", "Football", "Italy", "soccer/ita.coppa_italia", "Europe/Rome", CUP_MONTHS),
    ("German Cup", "Football", "Germany", "soccer/ger.dfb_pokal", "Europe/Berlin", CUP_MONTHS),
    ("French Cup", "Football", "France", "soccer/fra.coupe_de_france", "Europe/Paris", CUP_MONTHS),
    ("Spanish Cup", "Football", "Spain", "soccer/esp.copa_del_rey", "Europe/Madrid", CUP_MONTHS),
]

# FotMob overlays fill cups ESPN omits (Scottish Cup) and rounds ESPN truncates.
FOTMOB = [
    ("Champions League", "Football", "Europe", 42, "Europe/London"),
    ("Europa Cup", "Football", "Europe", 73, "Europe/London"),
    ("Europa Conference League", "Football", "Europe", 10216, "Europe/London"),
    ("FA Cup", "Football", "England", 132, "Europe/London"),
    ("Carabao Cup", "Football", "England", 133, "Europe/London"),
    ("Scottish Cup", "Football", "Scotland", 137, "Europe/London"),
    ("Italian Cup", "Football", "Italy", 141, "Europe/Rome"),
    ("German Cup", "Football", "Germany", 209, "Europe/Berlin"),
    ("French Cup", "Football", "France", 134, "Europe/Paris"),
    ("Spanish Cup", "Football", "Spain", 138, "Europe/Madrid"),
]

REPLACE_LEAGUES = {row[0] for row in SOURCES} | {row[0] for row in FOTMOB}

NAME_ALIASES = {
    "Heart of Midlothian": "Hearts",
    "Brighton & Hove Albion": "Brighton",
    "Brighton and Hove Albion": "Brighton",
    "AFC Bournemouth": "Bournemouth",
    "Internazionale": "Inter Milan",
    "Inter": "Inter Milan",
    "AS Roma": "Roma",
    "Atlético Madrid": "Atletico Madrid",
    "Atletico de Madrid": "Atletico Madrid",
    "Alavés": "Alaves",
    "Málaga": "Malaga",
    "Borussia Mönchengladbach": "Borussia Monchengladbach",
    "1. FC Köln": "FC Koln",
    "1 FC Köln": "FC Koln",
    "FC Schalke 04": "Schalke 04",
    "St. Mirren": "St Mirren",
    "St. Johnstone": "St Johnstone",
    "Paris Saint Germain": "Paris Saint-Germain",
    "Paris St Germain": "Paris Saint-Germain",
    "Bayern München": "Bayern Munich",
    "FC Bayern Munich": "Bayern Munich",
    "FC Bayern München": "Bayern Munich",
    "Athletic Bilbao": "Athletic Club",
    "AC Milan": "AC Milan",
    "Milan": "AC Milan",
    "FC Cologne": "FC Koln",
    "Hertha Berlin": "Hertha BSC",
    "Feyenoord Rotterdam": "Feyenoord",
    "LASK Linz": "LASK",
    "Viking FK": "Viking",
    "1. FC Magdeburg": "1. FC Magdeburg",
    "1. FC Nürnberg": "1. FC Nurnberg",
    "1. FC Nurnberg": "1. FC Nurnberg",
}


def canonical_name(name: str | None) -> str:
    trimmed = (name or "").strip()
    return NAME_ALIASES.get(trimmed, trimmed)


def local_stamp(iso: str, tz_name: str) -> tuple[str, str]:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(ZoneInfo(tz_name))
    return dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M")


def in_season(date: str) -> bool:
    return date >= "2026-08-01" and date <= "2027-07-31"


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Accept": "application/json", "Referer": "https://www.espn.com/"},
    )
    with urllib.request.urlopen(req, timeout=40) as response:
        return json.load(response)


def row_key(row: dict) -> str:
    return f"{row['league']}|{row['date']}|{row['homeName']}|{row['awayName']}"


def fold_name(name: str) -> str:
    text = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
    text = text.lower()
    text = re.sub(r"\b(fc|fk|cf|afc|sc|ac|as|ssc|bsc|sv|vfl|vfb|tsg|rb)\b", " ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return " ".join(text.split())


def team_token(name: str) -> str:
    skip = {
        "united",
        "city",
        "town",
        "real",
        "sporting",
        "athletic",
        "club",
        "hotspur",
        "munich",
        "wanderers",
    }
    tokens = [part for part in fold_name(name).split() if len(part) >= 4 and part not in skip]
    if tokens:
        return tokens[0]
    parts = fold_name(name).split()
    return parts[0] if parts else ""


def fuzzy_key(row: dict) -> str:
    return f"{row['league']}|{row['date']}|{team_token(row['homeName'])}|{team_token(row['awayName'])}"


def rows_from_scoreboard(payload: dict, league: str, sport: str, country: str, tz_name: str) -> list[dict]:
    rows = []
    for event in payload.get("events") or []:
        competition = (event.get("competitions") or [None])[0]
        if not competition:
            continue
        home = next((c for c in competition.get("competitors") or [] if c.get("homeAway") == "home"), None)
        away = next((c for c in competition.get("competitors") or [] if c.get("homeAway") == "away"), None)
        home_name = canonical_name((home or {}).get("team", {}).get("displayName"))
        away_name = canonical_name((away or {}).get("team", {}).get("displayName"))
        if not home_name or not away_name:
            continue
        date, kickoff = local_stamp(competition.get("date") or event.get("date"), tz_name)
        if not in_season(date):
            continue
        venue = ((competition.get("venue") or {}).get("fullName")) or ""
        rows.append(
            {
                "league": league,
                "sport": sport,
                "country": country,
                "date": date,
                "kickoff": kickoff,
                "homeName": home_name,
                "awayName": away_name,
                "venue": venue,
                "source": "espn",
            }
        )
    return rows


def ingest(
    all_rows: list[dict],
    seen: set[str],
    fuzzy: set[str],
    path: str,
    league: str,
    sport: str,
    country: str,
    tz_name: str,
    stamp: str,
) -> int:
    url = (
        "https://site.api.espn.com/apis/site/v2/sports/"
        f"{path}/scoreboard?dates={stamp}"
    )
    try:
        payload = fetch_json(url)
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
        print(f"    skip {league} {stamp}: {exc}")
        return 0
    added = 0
    for row in rows_from_scoreboard(payload, league, sport, country, tz_name):
        key = row_key(row)
        if key in seen or fuzzy_key(row) in fuzzy:
            continue
        seen.add(key)
        fuzzy.add(fuzzy_key(row))
        all_rows.append(row)
        added += 1
    return added


def mine_espn() -> tuple[list[dict], set[str], set[str]]:
    all_rows: list[dict] = []
    seen: set[str] = set()
    fuzzy: set[str] = set()
    for league, sport, country, path, tz_name, months in SOURCES:
        print(f"Mining {league}...", flush=True)
        for month in months:
            year, mon = int(month[:4]), int(month[4:])
            days = calendar.monthrange(year, mon)[1]
            added = ingest(all_rows, seen, fuzzy, path, league, sport, country, tz_name, month)
            print(
                f"  {league} {month}: +{added} "
                f"({sum(1 for r in all_rows if r['league']==league)} total)",
                flush=True,
            )
            if added >= 90:
                filled = 0
                for day in range(1, days + 1):
                    filled += ingest(
                        all_rows,
                        seen,
                        fuzzy,
                        path,
                        league,
                        sport,
                        country,
                        tz_name,
                        f"{year:04d}{mon:02d}{day:02d}",
                    )
                    time.sleep(0.03)
                print(
                    f"    daily-fill {league} {month}: +{filled} "
                    f"({sum(1 for r in all_rows if r['league']==league)} total)",
                    flush=True,
                )
            time.sleep(0.04)
    return all_rows, seen, fuzzy


def mine_fotmob(all_rows: list[dict], seen: set[str], fuzzy: set[str]) -> None:
    for league, sport, country, league_id, tz_name in FOTMOB:
        url = f"https://www.fotmob.com/api/data/leagues?id={league_id}"
        print(f"Overlay FotMob {league} ({league_id})...", flush=True)
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": UA,
                "Accept": "application/json",
                "Referer": "https://www.fotmob.com/",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=40) as response:
                payload = json.load(response)
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"    skip FotMob {league}: {exc}")
            continue
        matches = ((payload.get("fixtures") or {}).get("allMatches")) or []
        added = 0
        for match in matches:
            status = match.get("status") or {}
            if status.get("cancelled"):
                continue
            iso = status.get("utcTime") or ""
            if not iso:
                continue
            try:
                date, kickoff = local_stamp(iso, tz_name)
            except ValueError:
                continue
            if not in_season(date):
                continue
            home_name = canonical_name((match.get("home") or {}).get("name"))
            away_name = canonical_name((match.get("away") or {}).get("name"))
            if not home_name or not away_name:
                continue
            row = {
                "league": league,
                "sport": sport,
                "country": country,
                "date": date,
                "kickoff": kickoff,
                "homeName": home_name,
                "awayName": away_name,
                "venue": "",
                "source": "fotmob",
            }
            key = row_key(row)
            if key in seen or fuzzy_key(row) in fuzzy:
                continue
            seen.add(key)
            fuzzy.add(fuzzy_key(row))
            all_rows.append(row)
            added += 1
        print(
            f"  FotMob {league}: +{added} "
            f"({sum(1 for r in all_rows if r['league']==league)} total)",
            flush=True,
        )


def main() -> None:
    existing = json.loads(OUT.read_text(encoding="utf-8"))
    kept = [row for row in existing.get("matches") or [] if row.get("league") not in REPLACE_LEAGUES]
    mined, seen, fuzzy = mine_espn()
    mine_fotmob(mined, seen, fuzzy)
    matches = kept + mined
    matches.sort(
        key=lambda row: (row["date"], row["league"], row.get("kickoff") or "", row["homeName"])
    )
    counts: dict[str, int] = defaultdict(int)
    for row in matches:
        counts[row["league"]] += 1
    existing["minedAt"] = datetime.now(timezone.utc).isoformat()
    existing["source"] = (
        "ESPN public scoreboard (published fixtures) plus Guinness Men's Six Nations "
        "and Rugby Australia calendars; cup competitions from ESPN and FotMob"
    )
    existing["counts"] = dict(counts)
    existing["matches"] = matches
    OUT.write_text(json.dumps(existing, indent=2) + "\n", encoding="utf-8")
    cup_counts = {name: counts.get(name, 0) for name in sorted(REPLACE_LEAGUES)}
    print(f"Wrote {len(matches)} published Matches to {OUT}")
    print("Cup additions:", cup_counts)


if __name__ == "__main__":
    main()
