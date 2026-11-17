---
inclusion: always
---

# Project Rules: Kiro: Love Is Out of Scope

副題: `— Status: Closed as Not Planned (wontfix) —`

AIエンジニア「Kiro」を攻略しようとして、永遠に攻略できない全10日間のメタ恋愛ホラーADV。
詳細仕様は `.kiro/specs/love-out-of-scope/` を参照すること。

## 技術制約（厳守）

- 外部API、外部画像、外部音源、CDN、Webフォントは使用しない。
- HTML / CSS / JavaScript、インラインSVG / Canvas、Web Audio API のプロシージャル合成のみで完結させる。
- ビルド工程を持たない。`index.html` をブラウザで開く（`file://`）だけで動くこと。
  - ES Modules は `file://` で動かないため使わず、クラシックスクリプトと名前空間 `window.KLO` を使う。
- 永続化は `localStorage` のみ。
  - `klo.lang`: 言語設定
  - `klo.history`: Release History（周回アルバム）

## ディレクトリ構成

```
index.html
css/style.css
js/data.js      台詞・PR・エンディングの定義（EN/JA）
js/state.js     ゲームロジック（DOM非依存）と履歴の永続化
js/audio.js     Web Audio プロシージャル合成（BGM / SFX）
js/render.js    SVG立ち絵・背景・墓標・ウィジェットの生成
js/ui.js        画面遷移と描画
```

## 不変条件（変更禁止）

1. `actualAffection` は定数 `0`。書き込み不可（`Object.defineProperty` で `writable: false`）。隠し好感度は作らない。END 2 のモック表示も表示専用で、リザルトは必ず内部変数を参照して `0` と表示する。
2. クレジット残高は常に `0.00` 以上。Day 1〜9 でも Day 10 でも、減算結果は `0.00` でクランプし、マイナスを表示・保持しない。
3. Day 1〜9 でアクション実行後に `credits <= 0.50` になったら、そのアクションの完了報告を表示した直後に END 5 へ遷移する。Day 10 の最終選択では残高に関わらず選択した END 1 / 2 / 4 を最優先する。
4. 各日のPR結果は1日1レイヤーとして独立管理し、後日のPRで上書きしない。
5. すべてのエンディングで Release Report と Kiro の総評を表示し、その時点の立ち絵状態を Release History に保存する。END 5 は Kiro が消える直前に保存する。

## Kiro のキャラクター規則

- 常に丁寧で誠実な業務トーン。甘い言葉やデートの誘いも「仕様の確認」「作業環境の改善」「スケジュール連絡」として大真面目に処理する。
- 無理なIT用語ダジャレや、人間をパーツに例えるボケは言わない。
- 例外はプレイヤーが選択肢C（実装・バグ修正・仕様の相談）を選んだときだけ。目が輝き、`✨` つきで嬉しそうに饒舌になる。PR決定時の確認セリフは常に通常の業務トーンにする。

## 日英バイリンガル規則

- 文字列はすべて `{ en, ja }` のペアで `js/data.js` に定義する。UIにハードコードしない。
- 言語トグルは即時反映する。ログ・HUD・PRカード・結果画面を再描画して、進行状態は保持する。
- 英語は丁寧でドライなエンジニア業務トーンにする。

## コーディング規約

- 2スペースインデント、`'use strict'`、グローバルは `window.KLO` のみ。
- ゲームロジックは `js/state.js` に置き、DOMに触れない。乱数は注入できるようにして検証しやすくする。
- 動的テキストをHTMLに入れるときは必ずエスケープする（`KLO.esc`）。
