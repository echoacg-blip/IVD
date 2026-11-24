import json
from datetime import date, datetime
from pathlib import Path
from time import sleep
from urllib.parse import urlencode, quote, unquote, urlsplit
from urllib.request import urlopen
from zoneinfo import ZoneInfo
from xml.etree import ElementTree as ET
from email.utils import format_datetime

def get(url, query):
    for attempt in range(2):
        try:
            with urlopen(url + "?" + urlencode(query), timeout=20) as response:
                return json.load(response)
        except OSError:
            if attempt == 1:
                raise
            sleep(3)

def research_summary(record):
    fields = []
    for label, key in (("期刊", "journalTitle"), ("作者", "authorString"),
                       ("首次发表日期", "firstPublicationDate")):
        if record.get(key):
            fields.append(f"{label}：{record[key]}")
    return "。".join(fields) + "。" if fields else ""

def research_category(title):
    normalized = title.casefold().replace("-", " ")
    if any(term in normalized for term in ("point of care", "poct", "near patient testing")):
        return "即时检测"
    if any(term in normalized for term in ("molecular diagnos", "nucleic acid test", "digital pcr")):
        return "分子诊断"
    return "前沿科研"

def research():
    data = get("https://www.ebi.ac.uk/europepmc/webservices/rest/search", {
        "query": '("in vitro diagnostics" OR "point-of-care testing" OR "molecular diagnostics") AND HAS_DOI:Y SORT_DATE:y',
        "format": "json", "pageSize": 12,
    })
    return [dict(title=r["title"], date=r.get("firstPublicationDate"), category=research_category(r["title"]),
                 source="Europe PMC", summary=research_summary(r),
                 related=([dict(label="PubMed", url="https://pubmed.ncbi.nlm.nih.gov/" + r["pmid"] + "/")]
                          if str(r.get("pmid", "")).isdigit() else []),
                 url="https://doi.org/" + quote(r["doi"], safe="/"))
            for r in data["resultList"]["result"] if r.get("title") and r.get("doi")]

def regulatory():
    endpoint = "https://api.fda.gov/device/510k.json"
    results = []
    failed = []
    for committee in ("CH", "HE"):
        try:
            data = get(endpoint, {
                "search": f"advisory_committee:{committee}",
                "sort": "decision_date:desc", "limit": 8,
            })
            results.extend(data["results"])
        except (OSError, ValueError, KeyError) as error:
            failed.append(committee)
            print(f"FDA 510(k) {committee}: {error}")
    if not results:
        raise OSError("No FDA records returned for " + ", ".join(failed))
    items = []
    for record in results:
        name, number = record.get("device_name"), record.get("k_number")
        if not name or not number:
            continue
        fields = [f"FDA 510(k) 记录 {number}"]
        for label, key in (("申请方", "applicant"), ("审查专业代码", "advisory_committee"),
                           ("决定日期", "decision_date"), ("审查结果", "decision_description")):
            if record.get(key):
                fields.append(f"{label}：{record[key]}")
        items.append(dict(title=name, date=record.get("decision_date"), category="产品动态",
                          source="FDA 510(k)", summary="。".join(fields) + "。",
                          url="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=" + quote(number, safe="")))
    return items

def pma():
    data = get("https://api.fda.gov/device/pma.json", {
        "search": "advisory_committee:(CH OR HE OR MI OR IM OR PA)",
        "sort": "decision_date:desc", "limit": 8,
    })
    items = []
    for record in data["results"]:
        name, number = record.get("trade_name"), record.get("pma_number")
        if not name or not number:
            continue
        supplement = record.get("supplement_number")
        identifier = number + (supplement or "")
        fields = [f"FDA PMA 记录 {identifier}"]
        for label, key in (("申请方", "applicant"), ("决定日期", "decision_date"),
                           ("补充申请类型", "supplement_type"), ("补充申请原因", "supplement_reason")):
            if record.get(key):
                fields.append(f"{label}：{record[key]}")
        items.append(dict(title=name, date=record.get("decision_date"), category="产品动态",
                          source="FDA PMA", summary="。".join(fields) + "。",
                          url="https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpma/pma.cfm?ID=" + quote(identifier, safe="")))
    return items

def prioritize(item, today):
    published = item.get("date")
    try:
        age = max(0, (today - date.fromisoformat(published)).days)
    except (ValueError, TypeError):
        age = 30
    freshness = max(0, 30 - age)
    direct_source = item["source"] in {"FDA 510(k)", "FDA PMA"}
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

def record_key(item):
    url = urlsplit(item["url"])
    if url.hostname in {"doi.org", "dx.doi.org"}:
        return "doi:" + unquote(url.path.lstrip("/")).strip().casefold()
    return item["url"]

def write_feed(output, payload, collected_at):
    site = "https://echoacg-blip.github.io/IVD/"
    rss = ET.Element("rss", version="2.0")
    channel = ET.SubElement(rss, "channel")
    ET.SubElement(channel, "title").text = "IVD Horizon"
    ET.SubElement(channel, "link").text = site
    ET.SubElement(channel, "description").text = "体外诊断行业简报"
    ET.SubElement(channel, "lastBuildDate").text = format_datetime(collected_at)
    for record in payload["items"]:
        item = ET.SubElement(channel, "item")
        for tag, value in (("title", record["title"]), ("link", record["url"]),
                           ("category", record["category"])):
            ET.SubElement(item, tag).text = value
        ET.SubElement(item, "guid", isPermaLink="true").text = record["url"]
        ET.SubElement(item, "description").text = record.get("summary") or record.get("reason", "")
    ET.ElementTree(rss).write(output / "feed.xml", encoding="utf-8", xml_declaration=True)

def main():
    output = Path("docs/briefs")
    output.mkdir(exist_ok=True)
    items, unavailable = [], []
    for source, load in [("Europe PMC", research), ("FDA 510(k)", regulatory), ("FDA PMA", pma)]:
        try:
            items.extend(load())
        except (OSError, ValueError, KeyError) as error:
            print(f"{source}: {error}")
            unavailable.append(source)
    if not items and (output / "index.json").is_file():
        print("No new data; publishing the existing archive unchanged.")
        return
    if not items:
        raise SystemExit("No source returned publishable data")
    collected_at = datetime.now(ZoneInfo("Asia/Shanghai"))
    date = collected_at.date().isoformat()
    previous = output / f"{date}.json"
    if unavailable and previous.exists():
        saved = json.loads(previous.read_text(encoding="utf-8"))
        items.extend(item for item in saved["items"] if item["source"] in unavailable)
    unique = {record_key(item): prioritize(item, datetime.fromisoformat(date).date()) for item in items}
    ranked = sorted(unique.values(), key=lambda item: (item["score"], item["date"] or "", item["url"]), reverse=True)
    earlier = sorted(path for path in output.glob("????-??-??.json") if path.stem < date)
    previous_keys = set()
    if earlier:
        older = json.loads(earlier[-1].read_text(encoding="utf-8"))
        previous_keys = {record_key(item) for item in older["items"]}
    for item in ranked:
        item["new_to_edition"] = record_key(item) not in previous_keys if earlier else None
    payload = dict(date=date, collected_at=collected_at.isoformat(timespec="seconds"),
                   items=ranked, unavailable=unavailable)
    write_feed(output, payload, collected_at)
    previous.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    dates = sorted((p.stem for p in output.glob("????-??-??.json")), reverse=True)
    (output / "index.json").write_text(json.dumps(dates), encoding="utf-8")

if __name__ == "__main__":
    main()
