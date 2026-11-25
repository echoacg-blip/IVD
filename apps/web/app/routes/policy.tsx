import { Link, useSearchParams } from "react-router";
import { PhoneBar } from "../components/shell/PhoneBar";
import type { Screen } from "../components/shell/screens";
import { L } from "../lib/i18n";
import { policyMatters } from "../lib/policy-matters";
import { pageMeta } from "../lib/seo";

const title = "政策追踪";
const scopes = [
  { value: "", label: "全部地区" },
  { value: "national", label: "全国" },
  { value: "local", label: "地方" },
] as const;

export const handle: Screen = { home: "me", name: L(title, "Policy Tracker") };

export function meta() {
  return pageMeta({ locale: "zh", title, path: "/policy" });
}

export default function PolicyTracker() {
  const [params] = useSearchParams();
  const scope = scopes.find(({ value }) => value === params.get("scope")) ?? scopes[0];
  const matters = policyMatters.filter((matter) =>
    !scope.value || (scope.value === "national" ? matter.scope === "全国" : matter.scope !== "全国"),
  );

  return (
    <div className="pb-10">
      <PhoneBar back={{ to: "/more", label: "我的" }} title={title} />
      <header className="pb-4 pt-3 lg:pt-1">
        <h1 data-page-title="" className="text-ui-heading-lg font-semibold text-ink">{title}</h1>
        <p className="mt-1.5 text-ui-label leading-relaxed text-ink-3">
          查看国内 IVD 政策事项、官方原文和已核验的进展。
        </p>
      </header>
      <nav aria-label="按地区筛选" className="flex flex-wrap gap-2 pb-4">
        {scopes.map(({ value, label }) => (
          <Link key={value} to={value ? `/policy?scope=${value}` : "/policy"}
            aria-current={scope.value === value ? "page" : undefined}
            className={`rounded-full border px-4 py-2 text-ui-label font-semibold hover:text-accent ${scope.value === value ? "border-accent text-accent" : "border-line text-ink-3"}`}>
            {label}
          </Link>
        ))}
      </nav>
      <div className="divide-y divide-line-soft border-y border-line-soft">
        {matters.map((matter) => (
          <article id={matter.id} key={matter.id} className="scroll-mt-24 py-5">
            <p className="mb-1 text-ui-caption text-ink-3">{matter.scope} · {matter.area}</p>
            <h2 className="text-ui-body-plus font-semibold text-ink">{matter.title}</h2>
            <p className="mt-2 max-w-prose text-ui-label leading-relaxed text-ink-2">{matter.summary}</p>
            <ol className="mt-4 space-y-3">
              {matter.milestones.map((event) => (
                <li key={event.date} className="grid gap-x-4 gap-y-1 sm:grid-cols-[7rem_1fr]">
                  <time dateTime={event.date} className="num text-ui-label text-ink-3">{event.date}</time>
                  <div className="text-ui-label leading-relaxed">
                    <p className="font-semibold text-ink">{event.stage}</p>
                    <p className="text-ink-2">{event.detail}</p>
                    <a href={event.url} className="text-accent underline underline-offset-4">{event.source}原文</a>
                  </div>
                </li>
              ))}
            </ol>
            {matter.related && (
              <Link to={`/policy#${matter.related}`} className="mt-4 inline-block text-ui-label text-accent underline underline-offset-4">
                查看对应的全国指南
              </Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
