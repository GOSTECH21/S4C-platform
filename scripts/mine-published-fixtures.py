#!/usr/bin/env python3
"""Mine published 2026/27 fixtures from ESPN scoreboards into app/data."""

from __future__ import annotations

import calendar
import json
import time
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "app/data/published-fixtures.json"
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"

FOOTBALL_MONTHS = [
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
]
NFL_MONTHS = ["202609", "202610", "202611", "202612", "202701", "202702"]
NBA_MONTHS = ["202610", "202611", "202612", "202701", "202702", "202703", "202704"]
RUGBY_MONTHS = [
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

SOURCES = [
    ("Premier League", "Football", "England", "soccer/eng.1", "Europe/London", FOOTBALL_MONTHS),
    ("EFL Championship", "Football", "England", "soccer/eng.2", "Europe/London", FOOTBALL_MONTHS),
    ("EFL League One", "Football", "England", "soccer/eng.3", "Europe/London", FOOTBALL_MONTHS),
    ("Women's Super League", "Football", "England", "soccer/eng.w.1", "Europe/London", FOOTBALL_MONTHS),
    ("Scottish Premiership", "Football", "Scotland", "soccer/sco.1", "Europe/London", FOOTBALL_MONTHS),
    ("Bundesliga", "Football", "Germany", "soccer/ger.1", "Europe/London", FOOTBALL_MONTHS),
    ("La Liga", "Football", "Spain", "soccer/esp.1", "Europe/London", FOOTBALL_MONTHS),
    ("Ligue 1", "Football", "France", "soccer/fra.1", "Europe/London", FOOTBALL_MONTHS),
    ("Serie A", "Football", "Italy", "soccer/ita.1", "Europe/London", FOOTBALL_MONTHS),
    ("Champions League", "Football", "Europe", "soccer/uefa.champions", "Europe/London", FOOTBALL_MONTHS),
    ("Europa Cup", "Football", "Europe", "soccer/uefa.europa", "Europe/London", FOOTBALL_MONTHS),
    ("Europa Conference League", "Football", "Europe", "soccer/uefa.europa.conf", "Europe/London", FOOTBALL_MONTHS),
    ("FA Cup", "Football", "England", "soccer/eng.fa", "Europe/London", FOOTBALL_MONTHS),
    ("Carabao Cup", "Football", "England", "soccer/eng.league_cup", "Europe/London", FOOTBALL_MONTHS),
    ("Italian Cup", "Football", "Italy", "soccer/ita.coppa_italia", "Europe/London", FOOTBALL_MONTHS),
    ("German Cup", "Football", "Germany", "soccer/ger.dfb_pokal", "Europe/London", FOOTBALL_MONTHS),
    ("French Cup", "Football", "France", "soccer/fra.coupe_de_france", "Europe/London", FOOTBALL_MONTHS),
    ("Spanish Cup", "Football", "Spain", "soccer/esp.copa_del_rey", "Europe/London", FOOTBALL_MONTHS),
    ("NFL", "NFL", "United States", "football/nfl", "America/New_York", NFL_MONTHS),
    ("Premiership Rugby", "Rugby", "England", "rugby/267979", "Europe/London", RUGBY_MONTHS),
    ("Top 14", "Rugby", "France", "rugby/270559", "Europe/Paris", RUGBY_MONTHS),
    ("Six Nations", "Rugby", "Europe", "rugby/180659", "Europe/London", ["202702", "202703"]),
    ("The Rugby Championship", "Rugby", "International", "rugby/244293", "Pacific/Auckland", ["202707", "202708"]),
    ("Nations Championship", "Rugby", "International", "rugby/17567", "Europe/London", ["202607", "202611"]),
    ("NBA", "NBA", "United States", "basketball/nba", "America/New_York", NBA_MONTHS),
    # Super League (rugby league) is not on ESPN's rugby-league/3 scoreboard (that id is NRL).
    # Do not mine United Rugby Championship (270557) as Super League.
    # The Rugby Championship is paused in 2026 (Nations Championship year) and returns in 2027.
]

NAME_ALIASES = {
    "Heart of Midlothian": "Hearts",
    "Brighton & Hove Albion": "Brighton",
    "Brighton and Hove Albion": "Brighton",
    "AFC Bournemouth": "Bournemouth",
    "Internazionale": "Inter Milan",
    "AS Roma": "Roma",
    "Atlético Madrid": "Atletico Madrid",
    "Alavés": "Alaves",
    "Málaga": "Malaga",
    "Borussia Mönchengladbach": "Borussia Monchengladbach",
    "1. FC Köln": "FC Koln",
    "1 FC Köln": "FC Koln",
    "FC Schalke 04": "Schalke 04",
    "St. Mirren": "St Mirren",
    "St. Johnstone": "St Johnstone",
    "LOU Rugby": "Lyon",
    "Bordeaux": "Bordeaux Begles",
    "Stade Francais Paris": "Stade Francais",
    "Montpellier Herault": "Montpellier",
    "Clermont Auvergne": "Clermont",
    "Stade Toulousain": "Toulouse",
    "Castres Olympique": "Castres",
}


def canonical_name(name: str | None) -> str:
    trimmed = (name or "").strip()
    return NAME_ALIASES.get(trimmed, trimmed)


def local_stamp(iso: str, tz_name: str) -> tuple[str, str]:
    dt = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(ZoneInfo(tz_name))
    return dt.strftime("%Y-%m-%d"), dt.strftime("%H:%M")


def fetch_json(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json"})
    with urllib.request.urlopen(req, timeout=40) as response:
        return json.load(response)


def row_key(row: dict) -> str:
    return f"{row['league']}|{row['date']}|{row['homeName']}|{row['awayName']}"


def ingest(
    all_rows: list[dict],
    seen: set[str],
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
        if key in seen:
            continue
        seen.add(key)
        all_rows.append(row)
        added += 1
    return added


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
        if not date.startswith("2026") and not date.startswith("2027"):
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


def mine() -> list[dict]:
    all_rows: list[dict] = []
    seen: set[str] = set()
    for league, sport, country, path, tz_name, months in SOURCES:
        print(f"Mining {league}...")
        for month in months:
            year, mon = int(month[:4]), int(month[4:])
            days = calendar.monthrange(year, mon)[1]
            added = ingest(all_rows, seen, path, league, sport, country, tz_name, month)
            print(
                f"  {league} {month}: +{added} "
                f"({sum(1 for r in all_rows if r['league']==league)} total)"
            )
            if added >= 90:
                filled = 0
                for day in range(1, days + 1):
                    filled += ingest(
                        all_rows,
                        seen,
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
                    f"({sum(1 for r in all_rows if r['league']==league)} total)"
                )
            # Always pull the Budweiser example Saturday in case a monthly cap dropped it.
            if month == "202610":
                extra = ingest(
                    all_rows,
                    seen,
                    path,
                    league,
                    sport,
                    country,
                    tz_name,
                    "20261031",
                )
                if extra:
                    print(f"    2026-10-31 {league}: +{extra}")
            time.sleep(0.04)
    all_rows.sort(key=lambda row: (row["date"], row["league"], row["kickoff"], row["homeName"]))
    return all_rows


def main() -> None:
    rows = mine()
    counts: dict[str, int] = defaultdict(int)
    for row in rows:
        counts[row["league"]] += 1
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(
        json.dumps(
            {
                "season": "2026/27",
                "minedAt": datetime.now(timezone.utc).isoformat(),
                "source": "ESPN public scoreboard (published fixtures)",
                "counts": dict(counts),
                "matches": rows,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(rows)} published Matches to {OUT}")
    print(dict(counts))


if __name__ == "__main__":
    main()
