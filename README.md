# ✏️ English Journal - 英文學習紀錄 App

一個活潑可愛的英文學習 App，支援 PWA 安裝到手機桌面！

## 功能
- 📚 單字本（間隔重複複習）
- 📷 **拍照辨識單字**（Claude AI Vision）
- 🤖 AI 自動生成例句
- 💬 片語 & 句子紀錄
- 📝 文法筆記
- ✅ 每日打卡（連續天數）
- 📊 學習統計
- 🎯 單字測驗 Quiz

---

## 🚀 部署步驟（Vercel）

### 方法一：GitHub + Vercel（推薦）

1. **上傳到 GitHub**
   - 建立新的 Repository（例如 `english-journal`）
   - 把這個資料夾的所有檔案上傳進去

2. **連接 Vercel**
   - 前往 [vercel.com](https://vercel.com) 並登入（可用 GitHub 帳號）
   - 點「Add New Project」→ 選你的 Repository
   - Framework 選「Create React App」
   - 點「Deploy」，等 1-2 分鐘就完成！

3. **取得網址**
   - Vercel 會給你一個 `xxx.vercel.app` 的網址
   - 你可以在設定中加入自訂網域

### 方法二：Vercel CLI

```bash
npm install -g vercel
cd english-journal
npm install
vercel --prod
```

---

## 📱 安裝到手機（PWA）

### iPhone / iPad（Safari）
1. 用 Safari 打開你的 Vercel 網址
2. 點下方中間的「分享」按鈕 □↑
3. 選「加入主畫面」
4. 點「新增」→ App 出現在桌面！

### Android（Chrome）
1. 用 Chrome 打開你的 Vercel 網址
2. 點右上角「⋮」選單
3. 選「加入主畫面」或「安裝應用程式」
4. 確認安裝 → 完成！

---

## 🛠️ 本地開發

```bash
cd english-journal
npm install
npm start
```

瀏覽器會自動開啟 http://localhost:3000

---

## ⚠️ 注意事項

- 拍照辨識功能使用 Anthropic API，需要在 App 連線狀態下使用
- 單字資料儲存在瀏覽器 localStorage，同一裝置、同一瀏覽器才能保留
- 如需跨裝置同步，未來可擴充加入後端資料庫
