import json
from datetime import datetime
from pathlib import Path
from urllib.parse import urlencode, quote
from urllib.request import urlopen
from zoneinfo import ZoneInfo

def get(url, query):
    with urlopen(url + "?" + urlencode(query), timeout=25) as response:
        return json.load(response)

def research():
    data = get("https://www.ebi.ac.uk/europepmc/webservices/rest/search", {
        "query": '("in vitro diagnostics" OR "point-of-care testing") AND HAS_DOI:Y SORT_DATE:y',
        "format": "json", "pageSize": 12,
    })
    return [dict(title=r["title"], date=r.get("firstPublicationDate"), category="前沿科研",
                 source="Europe PMC", url="https://doi.org/" + quote(r["doi"], safe="/"))
            for r in data["resultList"]["result"] if r.get("title") and r.get("doi")]

def regulatory():
    data = get("https://api.fda.gov/device/510k.json", {
        "search": 'medical_specialty_description:"Clinical Chemistry" OR medical_specialty_description:"Hematology"',
        "sort": "decision_date:desc", "limit": 12,
    })
    return [dict(title=r["device_name"], date=r.get("decision_date"), category="产品动态",
                 source="FDA 510(k)", url="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=" + quote(r["k_number"]))
            for r in data["results"] if r.get("device_name") and r.get("k_number")]

def main():
    output = Path("docs/briefs")
    output.mkdir(exist_ok=True)
    items, unavailable = [], []
    for source, load in [("Europe PMC", research), ("FDA 510(k)", regulatory)]:
        try:
            items.extend(load())
        except (OSError, ValueError, KeyError) as error:
            print(f"{source}: {error}")
            unavailable.append(source)
    if not items:
        raise SystemExit("No source returned publishable data")
    date = datetime.now(ZoneInfo("Asia/Shanghai")).date().isoformat()
    ranked = sorted({item["url"]: item for item in items}.values(),
                    key=lambda item: item["date"] or "", reverse=True)
    payload = dict(date=date, items=ranked, unavailable=unavailable)
    (output / f"{date}.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    dates = sorted((p.stem for p in output.glob("????-??-??.json")), reverse=True)
    (output / "index.json").write_text(json.dumps(dates), encoding="utf-8")

if __name__ == "__main__":
    main()
