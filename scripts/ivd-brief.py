import json
from datetime import date, datetime
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
    items = []
    for record in data["results"]:
        name, number = record.get("device_name"), record.get("k_number")
        if not name or not number:
            continue
        fields = [f"FDA 510(k) 记录 {number}"]
        for label, key in (("申请方", "applicant"), ("器械专业类别", "medical_specialty_description"),
                           ("决定日期", "decision_date")):
            if record.get(key):
                fields.append(f"{label}：{record[key]}")
        items.append(dict(title=name, date=record.get("decision_date"), category="产品动态",
                          source="FDA 510(k)", summary="。".join(fields) + "。",
                          url="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=" + quote(number, safe="")))
    return items

def prioritize(item, today):
    published = item.get("date")
    try:
        age = max(0, (today - date.fromisoformat(published)).days)
    except (ValueError, TypeError):
        age = 30
    freshness = max(0, 30 - age)
    direct_source = item["source"] == "FDA 510(k)"
    item["score"] = freshness + (20 if direct_source else 10)
    item["reason"] = ("监管机构原始记录" if direct_source else "科研文献索引") + (
        " · 近一周发布" if age <= 7 else ""
    )
    item["reading_note"] = (
        "查看 FDA 原始记录中的申请方、器械类别和决定日期，了解此次更新涉及的产品。"
        if direct_source else
        "阅读原文时可先看研究人群、对照方法和验证范围，判断结论是否适用于你的应用场景。"
    )
    return item

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
    previous = output / f"{date}.json"
    if unavailable and previous.exists():
        saved = json.loads(previous.read_text(encoding="utf-8"))
        items.extend(item for item in saved["items"] if item["source"] in unavailable)
    unique = {item["url"]: prioritize(item, datetime.fromisoformat(date).date()) for item in items}
    ranked = sorted(unique.values(), key=lambda item: (item["score"], item["date"] or "", item["url"]), reverse=True)
    payload = dict(date=date, items=ranked, unavailable=unavailable)
    previous.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    dates = sorted((p.stem for p in output.glob("????-??-??.json")), reverse=True)
    (output / "index.json").write_text(json.dumps(dates), encoding="utf-8")

if __name__ == "__main__":
    main()
