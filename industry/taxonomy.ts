// 这个行业的分类体系：类别、标签词表、公司（主体）名录，以及防止张冠李戴的身份词典。
// 模型按这里的词表打标签，主题页（topics.json）按标签归类，筛选栏按类别分组。
// 换行业时：类别的 key 会出现在网址里（/all?category=…），上线后就不要再改；标签和名录可以随时增减。

/**
 * 网页上的类别（筛选栏、卡片角标、RSS 分类订阅）。key 是网址和接口里的身份，上线后不要改。
 * section 是日报里的分节标题（几个类别可以共用一节，按这里的顺序排）；guide 告诉结构抽取模型这一类收什么、
 * 和相邻类别的边界在哪（总的归类原则写在 prompts/structure.md 里）。
 * commentary 标出评论类（教程、观点）：日报写过的事又有评论类的后续报道，只占一行快讯（报道它的信源够多时除外）。
 * 没归上类的资料在日报里放进第一个 key 为 industry 的类别所在的节（没有就放最后一节）。
 * tagColor 是飞书推送卡片里跟在标题后面的这一类小标签的颜色（飞书 text_tag 的颜色名）。
 * feedLabel 是分类 RSS 标题里的名字（不写就用 label）。公开接口、RSS 和 MCP 里要把一类并进另一类发布，写在站点设置里（site/site.ts 的 PUBLIC_CATEGORIES）。
 */
export const CATEGORIES = [
  { key: "ai-models", tagColor: "indigo", label: "技术创新", section: "技术创新", guide: "新检测原理、诊断算法或检测技术平台的实质更新。论文以研究发现为主时归前沿科研。" },
  { key: "ai-products", tagColor: "turquoise", label: "产品动态", section: "产品动态", guide: "体外诊断仪器、试剂和检测项目的上市、功能更新、正式批准及适用范围变更。" },
  { key: "industry", tagColor: "orange", label: "企业与行业", section: "企业与行业", guide: "IVD 企业的经营、融资并购、合作、供应和组织变化。" },
  { key: "paper", tagColor: "violet", label: "前沿科研", section: "前沿科研", guide: "以研究设计、诊断性能、临床验证或新发现为核心的论文与技术报告。" },
  { key: "ivd-regulation", tagColor: "orange", label: "政策标准", section: "政策标准", guide: "监管要求、指南、采购规则、行业标准及跨产品政策变化。单个产品批准归产品动态。" },
  { key: "ivd-clinical", tagColor: "purple", label: "临床学术", section: "临床学术", guide: "临床指南、共识及检验路径变化。以原创研究结果为重点时归前沿科研。" },
  { key: "tip", tagColor: "green", label: "服务与实践", section: "服务与实践", guide: "检验自动化、质量管理、技术服务或已有系统的可复用实践。", commentary: true },
  { key: "opinion", tagColor: "purple", label: "行业解读", section: "行业解读", guide: "围绕 IVD 行业的分析、访谈与评论。", commentary: true },
] as const satisfies ReadonlyArray<{ key: string; tagColor: string; label: string; feedLabel?: string; section: string; guide: string; commentary?: true }>;

/**
 * 这个行业最受关注的一类发布（AI 行业是新模型）：日报报头的“N 个新模型”、改分类后修订已出的报告都按它数。
 * category 是类别，tag 是标签，两者都对上才算；unit 接在数字后面。
 * 没有这样一类的行业设成 null，报头就不显示这个数。
 */
export const RELEASE: { category: string; tag: string; unit: string } | null = null;

/** 周报月报的总述可以直接写、不必在报道里找到出处的行业通用词（小写）。站名会自动算进去。 */
export const PLAIN_TERMS: readonly string[] = ["ivd", "poct", "pcr", "fda", "nmpa", "ceo", "ipo"];

/**
 * 内容理解一步给每篇资料判的“内容类型”（写在 prompts/content-understanding.md 里，改了类型要同步改那份提示词）。
 * 评分提示词（prompts/selection-score.md）按类型给五个维度不同的权重。
 */
export const ITEM_TYPES = ["model_release", "product_launch", "tool_or_prompt", "research_paper", "industry_event", "opinion_analysis", "tutorial_explainer"] as const;

// ── 标签词表 ────────────────────────────────────────────────────────────────────────────

/** 每篇资料的第一个标签必须是这些“分类标签”之一。 */
export const CATEGORY_TAGS = [
  "产品更新", "模型发布", "论文/研究", "开源/仓库", "教程/实践", "现象/趋势", "大佬观点", "评测/基准", "安全/对齐", "行业动态", "政策/监管",
  "非AI/通用工具", "其他",
] as const;

/** 可选的主题标签。 */
export const TOPIC_TAGS = [
  "即时检测", "分子诊断", "免疫诊断", "检验自动化", "性能评价", "临床验证", "质量控制", "注册审批", "实验室信息化",
] as const;

/** 可选的实体标签（公司、机构、平台）。 */
export const ENTITY_TAGS = ["罗氏诊断", "雅培诊断", "BD 诊断", "FDA", "NMPA"] as const;

/** 模型常写的近义词，统一成词表里的写法。 */
export const TAG_SYNONYMS: Readonly<Record<string, string>> = {
  "教程/玩法": "教程/实践", "技巧/最佳实践": "教程/实践", "合作/生态": "行业动态", "融资/收购": "行业动态", "公司动态": "行业动态",
  合作: "行业动态", 生态: "行业动态", 融资: "行业动态", 收购: "行业动态", 投资: "行业动态", 并购: "行业动态",
  政策: "政策/监管", 监管: "政策/监管", 法规: "政策/监管", 安全: "安全/对齐", 对齐: "安全/对齐",
  论文: "论文/研究", 研究: "论文/研究", paper: "论文/研究", papers: "论文/研究",
  "open-source": "开源/仓库", 开源: "开源/仓库", 仓库: "开源/仓库", repo: "开源/仓库",
  教程: "教程/实践", 玩法: "教程/实践", 指南: "教程/实践", 技巧: "教程/实践", 最佳实践: "教程/实践", 实践: "教程/实践",
  产品: "产品更新", 更新: "产品更新", 发布: "模型发布", 模型: "模型发布", 趋势: "现象/趋势", 现象: "现象/趋势", 观点: "大佬观点",
  视频生成: "视频", 非ai: "非AI/通用工具", "non-ai": "非AI/通用工具", 通用工具: "非AI/通用工具", 工程工具: "非AI/通用工具",
  安全扫描: "非AI/通用工具", devops: "非AI/通用工具", 行业: "行业动态", 动态: "行业动态",
};

/** 网页前端展示的标签名：把内部斜杠写法换成自然短词，null 表示不对读者展示（存储、接口与后台仍保留原标签）。 */
export const TAG_DISPLAY: Readonly<Record<string, string | null>> = {
  "论文/研究": "论文",
  "开源/仓库": "开源",
  "教程/实践": "教程",
  "现象/趋势": "趋势",
  "评测/基准": "评测",
  "安全/对齐": "安全",
  "政策/监管": "政策",
  "数据/训练": "数据与训练",
  "部署/工程": "工程部署",
  "MCP/工具调用": "MCP 与工具调用",
  "非AI/通用工具": null,
};

// ── 公司与主体 ──────────────────────────────────────────────────────────────────────────

/**
 * 公司主题：id → 显示名、卡片上显示的标签（null 表示只用 entity:<id> 归类）、别名。
 * aliases 给结构抽取模型看；orgNames 是这家公司发消息时开头用的组织名（公司、实验室、团队），
 * 在它自己的主题页上读者知道说的是谁，可以省去；otherNames 是公司的其他称呼（官方账号名、子品牌）。
 * 所有这些名字都用来认出说的是哪家公司，比如把事实的主体对到发布方。
 */
export const ENTITIES: Record<string, { name: string; displayTag: string | null; aliases: string[]; orgNames?: string[]; otherNames?: string[] }> = {
  "roche-diagnostics": { name: "罗氏诊断", displayTag: "罗氏诊断", aliases: ["Roche Diagnostics", "Roche", "罗氏诊断", "罗氏", "cobas"], orgNames: ["Roche Diagnostics","罗氏诊断"] },
  "abbott-diagnostics": { name: "雅培诊断", displayTag: "雅培诊断", aliases: ["Abbott Diagnostics", "Abbott Molecular", "Abbott", "雅培诊断", "雅培", "Alinity"], orgNames: ["Abbott Diagnostics","Abbott Molecular","雅培诊断"] },
  "bd-diagnostics": { name: "BD 诊断", displayTag: "BD 诊断", aliases: ["BD Diagnostics", "Becton Dickinson", "BD", "BD 诊断", "BD MAX"], orgNames: ["BD Diagnostics","Becton Dickinson","BD 诊断"] },

};

/**
 * 身份词典：摘要和标题里出现的公司，必须在原文里也出现过，否则退回原标题、丢掉摘要（防止模型张冠李戴）。
 * 行业没有这个问题时可以留空数组。
 */
export const IDENTITY_LEXICON: ReadonlyArray<{ id: string; name: string; patterns: RegExp[] }> = [
  { id: "roche-diagnostics", name: "罗氏诊断", patterns: [/\bRoche\b|\bcobas\b|罗氏/i] },
  { id: "abbott-diagnostics", name: "雅培诊断", patterns: [/\bAbbott\b|\bAlinity\b|雅培/i] },
  { id: "bd-diagnostics", name: "BD 诊断", patterns: [/\bBecton Dickinson\b|\bBD(?: Diagnostics| MAX)?\b/] },
];

/** 这些域名上的文章，发布方就是对应的公司（托管平台如 GitHub、arXiv 不算）。 */
export const PUBLISHER_DOMAINS: ReadonlyArray<{ entityId: string; domains: readonly string[] }> = [
  { entityId: "roche-diagnostics", domains: ["diagnostics.roche.com"] },
  { entityId: "abbott-diagnostics", domains: ["diagnostics.abbott", "molecular.abbott"] },
];

/** 原文里的这些写法也算提到了对应公司。 */
export const IDENTITY_CONTEXT_ALIASES: ReadonlyArray<{ entityId: string; pattern: RegExp }> = [];
