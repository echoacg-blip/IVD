type Milestone = {
  date: string;
  stage: string;
  detail: string;
  source: string;
  url: string;
};

type PolicyMatter = {
  id: string;
  title: string;
  scope: "全国" | "新疆";
  area: string;
  summary: string;
  related?: string;
  milestones: readonly Milestone[];
};

export const policyMatters: readonly PolicyMatter[] = [
  {
    id: "lab-pricing-xinjiang",
    title: "检验类医疗服务价格项目立项指南（征求意见稿）",
    scope: "新疆",
    area: "医疗服务价格",
    summary: "新疆医保局就本地检验类医疗服务价格项目公开征求意见。以当地后续正式文件核实项目和执行安排。",
    related: "lab-pricing-national",
    milestones: [
      {
        date: "2026-11-23",
        stage: "发布征求意见稿",
        detail: "自治区医保局发布公开征求意见公告。",
        source: "新疆维吾尔自治区医疗保障局",
        url: "https://ylbzj.xinjiang.gov.cn/ylbzj/tzgg/202611/0e53565f3e8842038a25169308287f64.shtml",
      },
    ],
  },
  {
    id: "lab-result-recognition",
    title: "临床检验结果互认的基本技术条件及质量指标",
    scope: "全国",
    area: "检验质量与互认",
    summary: "卫生行业标准 WS/T 885—2026。适合检验科、质控团队和 IVD 企业跟踪结果互认的技术条件与质量指标。",
    milestones: [
      {
        date: "2026-11-01",
        stage: "标准所列实施日",
        detail: "按国家卫生健康委公布的标准信息标注实施日期。",
        source: "国家卫生健康委员会",
        url: "https://www.nhc.gov.cn/wjw/s9492/202606/649d2d3b12dc4edc9a79b2566dc2dcf8.shtml",
      },
      {
        date: "2026-05-25",
        stage: "标准发布",
        detail: "按标准所列发布日期记录。",
        source: "国家卫生健康委员会",
        url: "https://www.nhc.gov.cn/wjw/s9492/202606/649d2d3b12dc4edc9a79b2566dc2dcf8.shtml",
      },
    ],
  },
  {
    id: "lab-pricing-national",
    title: "检验类医疗服务价格项目立项指南（试行）",
    scope: "全国",
    area: "医疗服务价格",
    summary: "国家医保局的检验类价格项目框架。具体收费与执行时间需查各地正式文件。",
    milestones: [
      {
        date: "2026-09-09",
        stage: "官方公布对接进展",
        detail: "国家医保局发布进展，地方陆续对接。",
        source: "国家医疗保障局",
        url: "https://www.nhsa.gov.cn/art/2026/9/9/art_14_22050.html",
      },
      {
        date: "2026-08-14",
        stage: "官方披露指南发布",
        detail: "日期为国家医保局官网报道日期。",
        source: "国家医疗保障局",
        url: "https://www.nhsa.gov.cn/art/2026/8/14/art_14_21764.html",
      },
    ],
  },
];
