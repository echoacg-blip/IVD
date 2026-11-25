// 英文版用的行业词：类别、标签、主题和公司的英文名。键是 taxonomy.ts、topics.json 里的中文写法或 key；
// 换行业时和它们一起改。网页英文页和英文的公开接口都读这里，没写到的词照原样显示；tests/industry-english.standalone.test.ts 检查都写到了。
import type { CATEGORIES } from "./taxonomy.ts";

type CategoryKey = (typeof CATEGORIES)[number]["key"];

/** 类别：筛选标签、分类 RSS 标题、日报栏目。 */
export const CATEGORY_EN: Record<CategoryKey, { label: string; feedLabel: string; section: string }> = {
  "ai-models": { label: "Technology", feedLabel: "IVD Technology", section: "Diagnostic technology" },
  "ai-products": { label: "Products", feedLabel: "IVD Products", section: "Product launches & updates" },
  industry: { label: "Industry", feedLabel: "Industry News", section: "Industry news" },
  paper: { label: "Papers", feedLabel: "Papers", section: "Research papers" },
  "ivd-regulation": { label: "Regulation", feedLabel: "IVD Regulation", section: "Regulation & standards" },
  "ivd-clinical": { label: "Clinical Practice", feedLabel: "Clinical Diagnostics", section: "Clinical diagnostics" },
  tip: { label: "Tutorials", feedLabel: "Tutorials", section: "Tips & opinions" },
  opinion: { label: "Opinion", feedLabel: "Opinion", section: "Tips & opinions" },
};

/** 标签（含 TAG_DISPLAY 里给读者看的短词）。 */
export const TAG_EN: Record<string, string> = {
  产品更新: "Product updates", 模型发布: "Model releases", "论文/研究": "Research", 论文: "Papers", "开源/仓库": "Open source", 开源: "Open source",
  "教程/实践": "Tutorials", 教程: "Tutorials", "现象/趋势": "Trends", 趋势: "Trends", 大佬观点: "Opinion", "评测/基准": "Benchmarks", 评测: "Benchmarks",
  "安全/对齐": "Safety", 安全: "Safety", 行业动态: "Industry", "政策/监管": "Policy", 政策: "Policy", "非AI/通用工具": "General tools", 其他: "Other",
  即时检测: "Point-of-care testing", 分子诊断: "Molecular diagnostics", 免疫诊断: "Immunodiagnostics",
  检验自动化: "Laboratory automation", 性能评价: "Performance evaluation", 临床验证: "Clinical validation",
  质量控制: "Quality control", 注册审批: "Regulatory approval", 实验室信息化: "Laboratory informatics",
};

/** 主题（topics.json 的 slug）：名字和一句话介绍。 */
export const TOPIC_EN: Record<string, { name: string; definition: string }> = {
  "roche-diagnostics": { name: "Roche Diagnostics", definition: "In vitro diagnostics coverage: Roche Diagnostics." },
  "abbott-diagnostics": { name: "Abbott Diagnostics", definition: "In vitro diagnostics coverage: Abbott Diagnostics." },
  "bd-diagnostics": { name: "BD Diagnostics", definition: "In vitro diagnostics coverage: BD Diagnostics." },
  "poct": { name: "Point-of-care Testing", definition: "In vitro diagnostics coverage: Point-of-care Testing." },
  "molecular-diagnostics": { name: "Molecular Diagnostics", definition: "In vitro diagnostics coverage: Molecular Diagnostics." },
  "immunodiagnostics": { name: "Immunodiagnostics", definition: "In vitro diagnostics coverage: Immunodiagnostics." },
  "lab-automation": { name: "Laboratory Automation", definition: "In vitro diagnostics coverage: Laboratory Automation." },
  "performance-evaluation": { name: "Performance Evaluation", definition: "In vitro diagnostics coverage: Performance Evaluation." },
  "ivd-research": { name: "IVD Research", definition: "In vitro diagnostics coverage: IVD Research." },
  "ivd-products": { name: "IVD Products", definition: "In vitro diagnostics coverage: IVD Products." },
  "ivd-regulation": { name: "IVD Regulation", definition: "In vitro diagnostics coverage: IVD Regulation." },
  "clinical-validation": { name: "Clinical Validation", definition: "In vitro diagnostics coverage: Clinical Validation." },
  "quality-control": { name: "Quality Control", definition: "In vitro diagnostics coverage: Quality Control." },
  "lab-informatics": { name: "Laboratory Informatics", definition: "In vitro diagnostics coverage: Laboratory Informatics." },
};

/** 主题分组（topics.json 的 groups）。 */
export const TOPIC_GROUP_EN: Record<string, { name: string; blurb: string }> = {
  company: { name: "Diagnostics Companies", blurb: "Follow the key companies: product launches, approvals and company news" },
  field: { name: "Research Areas", blurb: "Go deep by area: diagnostic methods and laboratory applications" },
  genre: { name: "Content Types", blurb: "Browse by kind: research, products and regulation" },
};

/** 日报报头“N 个新模型”。 */
export const RELEASE_UNIT_EN = { one: "new diagnostic technology", many: "new diagnostic technologies" };
