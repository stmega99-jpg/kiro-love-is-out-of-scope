# Design: Kiro: Love Is Out of Scope

要件は `requirements.md` を参照。

## 1. アーキテクチャ

ビルドなしの静的サイト。クラシックスクリプトを `index.html` から順に読み込み、名前空間 `window.KLO` に登録する。

```
data.js ──▶ state.js ──▶ audio.js ──▶ render.js ──▶ ui.js
 (文言)     (ロジック)    (BGM/SFX)     (SVG)        (画面制御)
```

| ファイル | 責務 | DOM依存 |
| :-- | :-- | :-- |
| `js/data.js` | 日ごとの台詞、PR、エンディング、UI文言（`{en, ja}`） | なし |
| `js/state.js` | `createGame()`、費用計算、枯渇判定、EARS検証、履歴の永続化 | なし |
| `js/audio.js` | BGM3種とSFXの合成、ミュート | AudioContext |
| `js/render.js` | 立ち絵、背景、墓標、ウィジェットのSVG文字列生成 | なし（文字列を返す） |
| `js/ui.js` | 画面遷移、ログ、アクション領域、言語切替、ショートカット | あり |

## 2. 状態モデル

```js
state = {
  day: 1,                       // 1..10
  credits: 4000,                // 常に >= 0（2桁丸め）
  layers: {                     // 'initial' | 'merge' | 'rc'
    affectionUI, bgTheme, costumeBody, bgmMode, itemSlot,
    costumeHead, dateModule, windowFrame, playerInput
  },
  earsText: '',                 // PR #7 で発注したEARS文
  ended: null,                  // 1..5
  // actualAffection: 0         // defineProperty(writable:false, configurable:false)
}
```

- 1つのPRは `PRS[day].layer` で指す1レイヤーだけを書き換える。他の日のレイヤーに触れる経路を作らない。
- `Close` は `initial` のまま。ペナルティなし。

## 3. クレジット

- 減算は `spend(cost)` に集約し、`credits = round2(max(0, credits - cost))` とする。Day 1〜10 のすべてに適用される。
- 費用は注入可能な乱数 `rng` から決める。

| 行動 | 費用 | 所要時間 |
| :-- | :-- | :-- |
| 会話 A/B/C | 0.20〜0.45 | 3〜8s |
| `Request Changes` | 650〜900 | 4〜9s |
| Day 10 選択肢2 | 約500（480〜520） | 5〜9s |

- 枯渇判定 `isExhausted()` は `day <= 9 && credits <= 0.50`。会話の完了報告後とPR確認セリフの後にUI層が呼ぶ。
- Day 10 の `finalChoice(n)` は枯渇判定を呼ばず、選んだ END を返す。

## 4. 画面フロー

```
Title ─▶ Day N 導入 ─▶ 選択肢 A/B/C ─▶ Kiro返答（複数行 / Next）
                                         │ 枯渇? ─▶ END 5
                                         ▼
                                   PR #N 提示 ─▶ Merge / Close / Request Changes
                                         │          （Day 7 の RC は EARS入力）
                                         ▼
                                 Kiro確認セリフ ─▶ PR #9 Merge ─▶ END 3
                                         │ 枯渇? ─▶ END 5
                                         ▼
                                   Day N+1 ... Day 10 ─▶ 最終選択 ─▶ END 1 / 2 / 4
                                                                       ▼
                                                              Release Report ─▶ Album
```

- Day 8 の A/B では、返答に `leave` フラグつきの地の文を入れ、Kiro の立ち絵を退室させて PR #8 を自動通知として出す。
- Day 1 の A は返答を3行（Kiro / 主人公のツッコミ / Kiro）で持つ。返答は `{ who: 'kiro' | 'player' | 'narr', t }` の配列で、使用量は最後の Kiro 行に付ける。

## 5. 描画

- ステージは2枚のSVGを重ねる。`#stage-bg`（背景）は `bgTheme` またはシーンが変わった時だけ書き換え、桜やコウモリのCSSアニメを途切れさせない。`#stage-kiro`（立ち絵）はレイヤー・表情・在室が変わるたびに再生成する。
- 立ち絵は 胴体 / 頭 / 髪 / 衣装(`costumeBody`) / 帽子(`costumeHead`) のSVGグループを合成する。
- フリル数: `initial` 15（スカート9 + 襟3 + 袖2 + 腰リボン1）、`merge` 2（袖のみ。13/15 ≒ 87%減）、`rc` 24。`render.frillCount()` で確認できる。
- 墓標は共通のSVG部品 `tomb()`。HUD・スロット・背景で使う。
- 会話枠は `windowFrame` に応じて `frame-initial` / `frame-merge`（コンソール）/ `frame-rc`（魔導書）のクラスを切り替える。
- END 2 のモックバーは `#stage-fx` に重ねる。`affectionUI` の状態は変更しない。

## 6. 音声

`AudioContext` はユーザー操作後に生成する。先読みスケジューラ（50msごと、0.2s先まで）で次のステップを予約する。

| `bgmMode` | 音色 | 内容 |
| :-- | :-- | :-- |
| `initial` | sine + 倍音 | C長調のオルゴール、0.3s/step |
| `merge` | square | A2周辺の一定パルス、キック風ブリップ |
| `rc` | saw + LPF、triangle | Dm - B♭ - Gm - A のパッドとチェンバロ風アルペジオ、ビブラート付きの旋律 |

SFX: `click`, `sparkle`（選択肢C）, `thunk`（Merge/墓標）, `magic`（Request Changes）, `buzz`（エラー）, `vanish`（END 5）, `jingle`（END）。

## 7. 永続化とアルバム

```js
// localStorage['klo.history'] : 最大50件、新しい順
{ id, at, endId, day, layers, credits, vanished, earsText }
```

- `triggerEnd(endId)` の先頭で記録する。END 5 は消滅演出の前に保存するため、Kiro が消えた後でも立ち絵を再現できる。
- アルバムのカードは `render.miniStage(layers)` で背景と立ち絵を描く。`vanished` のカードは「消滅直前の記録」ラベルを付ける。
- `localStorage` へのアクセスは `try/catch` で囲み、失敗しても進行を止めない。

## 8. エラー処理

| 状況 | 挙動 |
| :-- | :-- |
| EARS文が不正 | 課金せず Kiro が理由を返す。再入力またはキャンセル |
| `Request Changes` 時に残高0 | ボタンを無効化 |
| `AudioContext` 非対応 | 音声なしで続行 |
| `localStorage` 不可 | 保存をスキップ。アルバムは空表示 |
