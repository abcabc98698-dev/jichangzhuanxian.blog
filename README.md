<div align="center">

# ⚡ 专线实验室 | jichangzhuanxian.blog

> **专注于 IEPL / IPLC 企业级物理专线实测、跨国 BGP 路由架构解析、现代代理协议底层解构与晚高峰弱网排障的独立技术知识库。**

[![VitePress](https://img.shields.io/badge/VitePress-1.6.4-3eaf7c?style=flat-square&logo=vitepress&logoColor=white)](https://vitepress.dev/)
[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Pagefind](https://img.shields.io/badge/Pagefind-1.5.2_Extended-ff5a00?style=flat-square&logo=pagefind&logoColor=white)](https://pagefind.app/)
[![Node](https://img.shields.io/badge/Node.js->=18.0-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![SEO Grade](https://img.shields.io/badge/SEO_Score-96.8_A%2B-2563eb?style=flat-square&logo=google&logoColor=white)](https://jichangzhuanxian.blog/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[🌐 访问在线正式站点 (Live Demo)](https://jichangzhuanxian.blog/) · [📖 评测方法论](https://jichangzhuanxian.blog/benchmark/) · [🛡️ 赞助披露声明](https://jichangzhuanxian.blog/disclosure) · [⚖️ 隐私与条款](https://jichangzhuanxian.blog/privacy)

</div>

---

## 📌 项目定位与特色

在充斥着公网超售、虚假低 Ping 假握手与非理性跑路盘的市场中，**专线实验室 (Zhuanxian Lab)** 坚持以真实的物理层网络测试、深入的 RFC 规范源码拆解和透明的 24 小时无人值守监控日志，构建去中心化、高权威度的网络工程知识库。

```mermaid
graph LR
    A[物理探测基准机房\n深圳/上海/香港 10G IDC] --> B[自动化审计集群\nPython Scapy / iperf3 守护进程]
    B --> C[微观物理学与时延模型\n海缆拓扑 / 折射率 / 握手时序]
    C --> D[VitePress SSG 静态生成\nPagefind 毫秒级全文索引]
    D --> E[工业级 SEO / GEO 基础设施\nGoogle / Bing / 神马 / 百度]
```

### 核心核心亮点

1. 🚀 **100% 独创万字长文矩阵**
   * 全站收录 **98 篇**深度技术白皮书与测评文档，单篇字符数在 6,000 ～ 32,980 字符之间；
   * 采用滑动窗口算法校验，全站跨文章 **35+ 字符重复率为 0.00%**，**50 字 N-gram 连续片段重合数为 0 处**；
   * 0 处 AI 机械套话与口癖，保留纯正网络工程师实战语言韵律。

2. 🛡️ **0 虚标真实实测数据**
   * 揭秘节点服务端针对 ICMP 虚假低延迟欺骗，推行 **TCP SYN-ACK 真实应用层建连审计**；
   * 揭露 Speedtest 多并发掩盖单流丢包缺陷，推行 **单线程 iperf3 持续满载打流基准**；
   * 全景呈现皇岗口岸深港 2ms 物理陆缆、崇明沪日 26ms 物理海缆及 FASTER 太平洋跨洋海缆物理极限。

3. ⚡ **极致纯静态架构与即时搜索**
   * 采用 **VitePress 1.6.4** 纯静态站点生成（SSG），首屏纯 HTML 预渲染，TTFB 毫秒级响应；
   * 内置 **Pagefind 1.5.2 (Extended)** 中文分词离线搜索引擎，全站 **11,400+ 词条**在用户浏览器内存中毫秒级检索，0 后端数据库依赖，保护搜索隐私。

4. 📈 **工业级搜索引擎基础设施**
   * **100% Canonical 自引用**：全站自动生成唯一的官方正式域名规范 URL，杜绝内容重复收录；
   * **丰满的 Schema.org 结构化数据**：全站覆盖 `WebSite`、`Organization`、`BreadcrumbList` 及 `TechArticle`；
   * **爬虫友好**：`robots.txt` 显式放行 Googlebot、Bingbot、Baiduspider、yisouspider，`sitemap.xml` 自动注入 `<lastmod>` 增量时间戳。

5. ⚖️ **E-E-A-T 完整信誉与合规体系**
   * 独立展示核心团队背景（Alex Chen、Kevin Zhao、Linus Wu）与深圳/上海物理探测硬件拓扑；
   * 商业服务商跳转外链 100% 严格附加 `rel="nofollow sponsored noopener"` 属性，彻底符合 Google Search 商业链接规范；
   * 健全落地页披露卡片、独立赞助披露页（`/disclosure`）、隐私权保护声明（`/privacy`）与服务条款（`/terms`）。

---

## 🗂️ 知识库知识图谱

本项目技术文档划分至八大核心支柱模块：

```text
docs/
├── zhuanxian/          # ⚡ 专线机场底层拓扑 (IEPL vs IPLC、BGP 多线中继、SLA 丢包协议)
├── recommend/          # ⭐ 机场评测与选型大系 (高保活专线评测矩阵、防韭菜盘避坑指南)
├── free/               # 🆓 免费资源剖析 (免费节点蜜罐实录、沙箱应急自救、TCO 隐形成本)
├── protocols/          # 📡 现代传输协议族 (VLESS Reality、SS2022-BLAKE3、Hysteria 2、TUIC v5、0-RTT)
├── performance/        # 📊 网络性能物理学 (深港 2ms 陆缆、沪日海缆极限、光纤折射率、单线程压测)
├── devices/            # 📱 全平台调优全书 (Android Doze 电池保活、iOS 快捷指令、Clash Verge 脚本)
├── benchmark/          # 🔬 实验室自动化压测 (晚高峰三大运营商实测、8K 视频分片二次缓冲审计)
└── troubleshooting/    # 🛠️ 疑难网络排障 (DNS 污染 Fake-IP、IPv6 漏流修复、TUN 虚拟网卡死锁救砖)
```

---

## 🛠️ 本地开发与快速上手

### 环境要求
* **Node.js**: `>= 18.0.0` (推荐 Node.js 20 LTS 或最新 v24)
* **包管理器**: `npm` (或 `pnpm`)

### 1. 克隆代码库
```bash
git clone https://github.com/abcabc98698-dev/jichangzhuanxian.blog.git
cd jichangzhuanxian.blog
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动本地开发预览服务器
```bash
npm run dev
```
本地服务将默认启动于 `http://localhost:5173/`，支持实时热模块重载 (HMR)。

### 4. 生产环境构建与 SEO 优化管道
```bash
npm run build
```
该命令会自动串联执行：
1. `vitepress build docs`：编译静态页面；
2. `node scripts/post-build-seo.cjs`：执行后置 SEO 注入（Canonical、Sponsored 外链合规、图片懒加载、Sitemap lastmod、Breadcrumb Schema）；
3. `pagefind --site docs/.vitepress/dist`：构建离线全文检索索引。

### 5. 本地预览生产构建产物
```bash
npm run preview
```

---

## 🧪 内置自动化审计与质量保障工具链

本项目在 `scripts/` 目录下集成了一套完整的端到端自动化质检与 SEO 校验工具：

| 工具脚本 | 功用说明 | 执行指令 |
| :--- | :--- | :--- |
| `scripts/advanced-anti-ai-url-audit.cjs` | 5 维反批量 AI 特征检查、35+ 字段落查重、50 字 N-gram 碰撞与口癖扫描 | `node scripts/advanced-anti-ai-url-audit.cjs` |
| `scripts/seo-audit-engine.cjs` | 预防性 SEO 综合健康审计引擎（技术、内容、EEAT、外链属性、Schema） | `node scripts/seo-audit-engine.cjs` |
| `scripts/audit-all-links.cjs` | 全站内部双向链接健康审计与断链普查 | `node scripts/audit-all-links.cjs` |
| `scripts/check-anchors.cjs` | 全站 Markdown `#hash` 内部目录锚点失效核验 | `node scripts/check-anchors.cjs` |
| `scripts/sync-toc-anchors.cjs` | 基于编译后 Heading ID 自动对齐修复 TOC 目录锚点 | `node scripts/sync-toc-anchors.cjs` |
| `scripts/post-build-seo.cjs` | 构建后静态流水线注入（Canonical、Sponsored、Lazyload、Schema） | 自动在 `npm run build` 中串联触发 |

---

## 🚢 生产部署配置说明

本项目构建输出目录为 `docs/.vitepress/dist`。

针对 Apache Web 服务器，项目已在 `docs/public/.htaccess` 预置了工业级配置：
* **HTTPS 强制跳转** 与 **Non-WWW 权威主域重定向**（`www.` 自动 301 重定向至裸域）；
* **Clean URLs 干净路径重写**（无缝兼容无 `.html` 后缀友好路由）；
* **安全响应头**（`X-Content-Type-Options: nosniff`、`X-Frame-Options: SAMEORIGIN`、`Referrer-Policy: strict-origin-when-cross-origin`）；
* **自动化 Gzip / Deflate 资源压缩** 与静态资产长效缓存。

---

## 📜 开源协议与版权声明

* **代码与构建配置**：遵循 [MIT License](LICENSE) 开源协议；
* **知识库技术长文与原创测试图表**：版权归属于 **专线实验室 (Zhuanxian Lab)**，非商业性转载请注明出处与原文超链接；
* **免责声明**：本站仅供网络工程学术研究、传输协议规范探讨与网络性能评估参考，严禁用于任何违反所在地法律法规的非法活动。

---

<div align="center">
  <sub>Made with ❤️ by 专线机场技术实验室 · 秉持科学、实测与中立</sub>
</div>
