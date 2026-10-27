# 待办 · chat-digest

把**微信群聊**自动总结成「要点」的本地小软件 —— 每天读一下你关心的群，把里面的通知、待办、学业、活动拎出来，存成一张张随时能翻的卡片。

> 纯本地运行：聊天记录只在自己电脑上过一遍，总结完立刻删掉原始记录，硬盘上只留要点。

## 它做什么

- **一键生成**：勾选想看的群 → 读最近 1 / 7 / 30 天的聊天 → 用 AI 提炼成要点，自动打上 `通知 / 待办 / 学业 / 活动 / 闲聊` 分类标签
- **每天自动**：配一条系统计划任务，到点自动跑一遍（也可以只用「一键生成」手动点）
- **阅后即焚**：总结完成后立即删除这一轮导出的原始聊天记录，只保留整理好的要点
- **想改就改**：要点可以新建 / 编辑 / 删除 / 按分类筛选，标题和正文都随便写
- **媒体还原**：能从微信本地缓存里解密还原聊天图片，也可以手动插入图片、视频、链接

## 界面

浅色简约风：左侧是要点列表（带彩色分类标签），右侧是正文，右下角气泡点开可以勾选要自动总结的群。

## 环境要求

| 依赖 | 说明 |
|---|---|
| Windows 10 / 11 | 目前只在 Windows 上跑过 |
| 微信 4.x 桌面版 | 必须**登录并运行中**（聊天记录和数据库密钥都在本机进程里） |
| Python 3.9+ | 导出聊天记录用 |
| Electron | 运行界面的外壳 |
| DeepSeek API Key | 做 AI 总结用；只导出不总结的话可以不填 |

## 快速开始

1. 装 Electron（任选其一）
   ```
   npm i -g electron
   ```
2. 建 Python 环境并装依赖
   ```
   python -m venv runtime/venv
   runtime\venv\Scripts\pip install -r vendor\wechat-export\requirements.txt
   ```
3. 改 `start.cmd`：把里面的 `electron.exe` 路径换成你本机 Electron 的位置
4. 双击 `start.cmd` 打开软件
5. 点右下角气泡勾选要总结的群 → 点右上角 ⚙ 填 DeepSeek API Key → 点「一键生成」

## 目录结构

```
chat-digest/
  main.js / preload.js / renderer/   界面（Electron 主进程 + 原生 HTML/CSS/JS）
  data/points.json                   所有要点（运行后自动生成）
  data/config.json                   勾选的群、AI 密钥、上次运行时间
  data/inbox/                        每日导出的临时目录（提交后自动清空）
  vendor/wechat-export/              内置的微信导出器（Python）
  runtime/venv/                      内置 Python 环境（自己建）
  tools/digest-daily.cjs             每日导出 / 落盘脚本
  tools/wxmedia.cjs                  图片解密 / 视频提取
  assets/                            图标
  start.cmd                          启动
```

## 工作流程

1. `vendor/wechat-export` 从微信本地数据库读消息（数据库密钥从运行中的微信进程内存里提取）
2. `tools/digest-daily.cjs export` 导出成 JSON + Markdown 汇总
3. 软件把汇总发给 AI，让它按群、按分类提炼成要点
4. `commit` 把要点写进 `data/points.json`，同时删掉这一轮的原始导出

## 注意

- 只读取本机**已有**的聊天记录，不会登录你的微信，也不会把聊天内容传到除你自己配置的 AI 接口以外的任何地方
- 请自行遵守微信软件许可协议与当地法律法规，仅用于整理**你本人有权限查看**的内容
- 微信版本升级后如果取不到数据库密钥，需要等导出器适配

## 许可

MIT，见 [LICENSE](LICENSE)。内置的微信导出器来自第三方项目，其许可见 `vendor/wechat-export/LICENSE`。
