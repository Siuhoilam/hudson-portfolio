# NameThatUI：個人作品集 UI 選型與實作

研究與實作日期：2026-11-04。

## 版本與範圍

- 參考來源：[NameThatUI](https://namethatui.com/)。這是一個互動模式字典，不是應直接複製的完整網站模板。
- 直接瀏覽時首頁與元件頁觸發站方驗證；網頁讀取工具成功取得以下元件頁的說明、結構與實作注意事項。未繞過驗證，也未重用該站圖片或程式碼。
- 發布基底：`Siuhoilam/hudson-portfolio`，`main`，起始提交 `02e9fc7d8881cc98b66fb995ad0524bd8b814377`。
- GitHub 版與工作區根目錄多頁版並不相同。採保守方式，以線上最新版為基礎，保留已更新的論文狀態、人物動畫、指導老師、影片、圖片與六段工作經歷。
- 獨立工作副本：`output/github-sync/`。根目錄的多頁版不被替換。
- 以 `index.html` 小幅標記調整、`ui.css` 與 `ui.js` 增強為主；`script.js` 保留原有人物動畫，移除重複的導覽、滑塊與舊 PDF 控制器。

## 設計判斷

面向城市規劃／研究招聘方，採克制的顧問式作品集呈現。設計變化 4、動態強度 3、資訊密度 4。保留原有城市圖片與藍色品牌框架，以中性白、低飽和綠及細分隔線整理閱讀。圓角規則：一般控制項 4px、原生檢視器 6px、只有真實輪播位置點採圓形。

## 27 個已採用模式

各列皆列出獨立來源、轉化目的與實作位置；以下是自己的應用摘要，非來源原文。

| # | 模式與來源 | 在作品集中的應用 | 位置 |
|---|---|---|---|
| 1 | [Site Header / Navigation Bar](https://namethatui.com/web/header-navbar) | 維持一行桌面頁眉，將內容分成項目、關於、師承、作品庫、其他及聯絡；中英並列。 | `index.html` `.nav`、`ui.css` |
| 2 | [Sticky / Fixed](https://namethatui.com/web/sticky-fixed) | 頁眉隨閱讀保留；錨點預留高度，避免遮住標題。 | `.site-header`、`html` |
| 3 | [Hamburger / Nav Drawer](https://namethatui.com/web/hamburger-menu) | 手機改為可關閉抽屜，支援 Escape、遮罩、焦點返回與背景不可互動。 | `ui.js` `setMenu` |
| 4 | [Scrollspy](https://namethatui.com/web/scrollspy) | 閱讀時突出當前區段；使用 `aria-current="location"`，不把頁內導覽假裝成 tabs。 | `markSection`、`IntersectionObserver` |
| 5 | [Card](https://namethatui.com/web/card) | 作品卡保持圖像、類型、標題、行動的清晰層級；底部操作對齊。 | `.archive-card` |
| 6 | [Masonry](https://namethatui.com/web/masonry) | 志願照片改為自然高度的瀑布流，讓不同照片維持各自構圖。 | `.photo-wall` |
| 7 | [Carousel](https://namethatui.com/web/carousel) | 作品與指導老師皆支援觸控、箭頭及鍵盤；不自動播放，不攔截垂直滾輪。 | `enhanceCarousel` |
| 8 | [Pagination / Page Control](https://namethatui.com/web/pagination) | 實際項目對應位置點，選中項目放大，篩選後重新計算。不是無限捲動。 | `.slide-picker` |
| 9 | [Lightbox](https://namethatui.com/web/lightbox) | 照片原頁放大，前後切換、放大圖面與關閉，不離開閱讀位置。 | `.image-dialog` |
| 10 | [Modal Dialog](https://namethatui.com/web/dialog-drawer-sheet) | PDF 改用原生 `dialog.showModal()`，保留水印文件，關閉後返回觸發按鈕。 | `.document-dialog` |
| 11 | [Scrim](https://namethatui.com/web/scrim) | 檢視器與手機導覽使用一致深色遮罩，明確區分前景與背景。 | `dialog::backdrop`、`.nav-scrim` |
| 12 | [Accordion](https://namethatui.com/web/accordion) | 工作內容折疊，不改寫公司、職務或日期；保留原生鍵盤行為。 | `.timeline details` |
| 13 | [Timeline](https://namethatui.com/web/timeline) | 六段經歷使用有序清單、日期、點與連線；最後一點不多留尾線。 | `.timeline-list` |
| 14 | [Badge / Tag](https://namethatui.com/web/badge-chip-pill) | 作品類型作為非互動標籤；類型計數與選中篩選分開呈現。已接收論文狀態保留。 | `.project-tag`、篩選計數 |
| 15 | [Toggle Group](https://namethatui.com/web/toggle-group) | 全部／設計／研究／本科單選篩選，正確同步 `aria-pressed`。 | `.filter-group` |
| 16 | [Form Field](https://namethatui.com/web/form-field) | 搜尋有固定 label、範例 placeholder 與即時結果數；不以 placeholder 代替標籤。 | `.archive-search` |
| 17 | [Empty State](https://namethatui.com/web/empty-state) | 搜尋零結果時有清楚提示和重設篩選；不留空白畫廊。 | `.archive-empty` |
| 18 | [Toast](https://namethatui.com/web/toast) | 成功複製電郵／電話才顯示 `Copied!`，1 秒消失；失敗不假報成功。 | `.ui-toast`、`notify` |
| 19 | [Tooltip](https://namethatui.com/web/popover-dropdown-tooltip) | 圖示按鈕滑過或鍵盤聚焦顯示名稱，與螢幕閱讀標籤一致。 | `.ui-tooltip` |
| 20 | [Popover](https://namethatui.com/web/popover-dropdown-tooltip) | 保留人物歡迎訊息，隱藏時不可聚焦，新增 Escape 關閉。與模態檢視器不同。 | `.hero-companion-note` |
| 21 | [Focus Ring](https://namethatui.com/web/focus-ring-web) | 所有連結、按鈕、輸入與 disclosure 有清晰鍵盤焦點，不只靠 hover。 | `:focus-visible` |
| 22 | [Divider / Rule](https://namethatui.com/web/divider) | 統一細線顏色和段落邊界，減少彩色邊框與裝飾條。 | `--line`、`.case-list` |
| 23 | [Hover Feedback](https://namethatui.com/web/hover-effects) | 卡片小幅抬升、控制項底色改變，表達可互動，沒有光斑追蹤。 | `.archive-card:hover`、`.icon-button:hover` |
| 24 | [Easing](https://namethatui.com/web/easing) | 控制項統一短促緩動，系統減少動態偏好時停用動畫與平滑捲動。 | `--ease-ui`、`prefers-reduced-motion` |
| 25 | [Skeleton / Loading](https://namethatui.com/web/skeleton-spinner) | PDF 保留固定容器與載入狀態，載入完成即移除；12 秒後提示備援，不無限等候。 | `.document-loading`、iframe `aria-busy` |
| 26 | [Back-to-Top](https://namethatui.com/web/floating-buttons) | 離開 Hero 才顯示返回頂部，與聯絡入口、聊天入口區分。 | `.back-to-top` |
| 27 | [Breadcrumbs](https://namethatui.com/web/breadcrumbs) | 文件檢視器標示作品集與當前文件，當前項不做無效連結。 | `.document-breadcrumb` |

## 沒有照搬的模式

- 不增加 marquee、自動文字打字、游標光斑、scroll-jacking 或多層巢狀卡片。它們對招聘方查找作品幫助有限。
- 不增加登入、假表單、假統計、假推薦語或不必要的儀表板。
- 不把未發表稿件轉成公開 PDF；維持原有研究連結與已接收狀態。
- 不重新壓縮或替換照片、影片、PDF，不上傳工作區中未引用的大型原始素材。
- 不從參考站下載圖片；新增圖示使用固定版本 Lucide，附授權文件。

## 驗收要點

1. 桌面與 390px、320px 手機無橫向頁面溢出。
2. 所有篩選組合、搜尋與零結果重設可用；輪播到最右端後可返回。
3. 手機導覽可由鍵盤開啟、繞回、Escape 關閉，背景不可點擊。
4. 六段時間軸資訊完整、可單獨開關。
5. 照片檢視器保留圖說與切換，PDF 關閉返回原觸發處；備援網址可用。
6. 電郵／電話複製、1 秒提示與複製失敗分支均檢查。
7. 檢查圖片文字、按鈕、輔助文字對比與減少動態模式。
8. 發布只包含本次變更的文字、圖示及文件，基於遠端原樹保留其餘資產。

## 本機驗證結果

- Playwright 桌面 24 項與手機 15 項斷言通過，共 39 項。
- 1440px 桌面，以及 320／390／768／1024px 視口沒有頁面橫向溢出。
- 作品篩選 9／4／1／4、搜尋、零結果與重設通過；輪播最右端可返回。
- 六段經歷、原生 PDF 彈窗、備援網址、照片切換／放大、焦點返回及手機選單焦點循環通過。
- 電郵實際寫入剪貼簿，成功提示 1 秒後消失；模擬拒絕權限與失敗的備援複製時不顯示成功。
- 照片圖說不超出各自的 172px 容器；減少動態設定生效。
- 抽查色彩對比：正文 12.82:1、輔助文字 5.53:1、綠色連結 6.68:1、主按鈕 7.60:1、電話按鈕 10.46:1。這些純色組合均超過一般文字 AA 的 4.5:1 門檻。
- PDF iframe 經修正後佔檢視器 795／898px；所有原有引用圖片載入，瀏覽器無 JavaScript console error。
- 這些不是完整的跨瀏覽器 WCAG 稽核；Safari／iOS 的 PDF 內嵌行為需以實機為準，已保留「另開 PDF」。

