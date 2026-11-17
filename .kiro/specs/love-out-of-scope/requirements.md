# Requirements: Kiro: Love Is Out of Scope

EARS記法で記述する。`THE SYSTEM` はゲーム本体を指す。

## R1. 技術制約

1. THE SYSTEM SHALL 外部API・外部画像・外部音源ファイルを使用しない。
2. THE SYSTEM SHALL HTML/CSS/JS、インラインSVG/Canvas、Web Audio API のプロシージャル合成のみで動作する。
3. WHEN `index.html` が `file://` で開かれた時 THE SYSTEM SHALL ビルド工程なしで起動する。

## R2. 日英バイリンガル

1. THE SYSTEM SHALL 画面上部に EN / JA の言語トグルを常時表示する。
2. WHEN プレイヤーが言語トグルを押した時 THE SYSTEM SHALL 進行状態を保持したまま、ログ・HUD・選択肢・PRカード・結果画面・アルバムを即時に再描画する。
3. THE SYSTEM SHALL 選択した言語を `localStorage` の `klo.lang` に保存する。
4. THE SYSTEM SHALL 英語テキストを丁寧でドライなエンジニア業務トーンで提供する。

## R3. ステータスとクレジット

1. THE SYSTEM SHALL `DAY 01 / 10`、`Credits: 4,000.00`、`Affection: 0 / 100` を表示する。
2. THE SYSTEM SHALL `actualAffection` を定数 `0` として保持し、変更できないようにする。隠し好感度は持たない。
3. THE SYSTEM SHALL 毎日の会話選択肢（A / B / C）に `Est. ~0.20 - 0.45 Cr` を選択前に表示する。
4. WHEN 会話選択肢が実行された時 THE SYSTEM SHALL Kiro の返答末尾に `Est. Credits Used: x.xx | Elapsed Time: Ns` を表示し、同額を残高から減算する。
5. THE SYSTEM SHALL PR の `Request Changes` に `Est. ~650 - 900 Cr` を選択前に表示し、実行後に実績値を表示して減算する。
6. WHILE 残高が `0` より大きい間 THE SYSTEM SHALL `Request Changes` ボタンを押下可能にする。
7. WHEN 減算結果が `0.00` を下回る時 THE SYSTEM SHALL 残高を `0.00` にクランプする。この規則は Day 1〜9 と Day 10 の両方に適用し、マイナス残高は保持も表示もしない。

## R4. クレジット枯渇判定

1. WHEN Day 1〜9 でアクション実行後の残高が `0.50` 以下になった時 THE SYSTEM SHALL そのアクションの完了報告を表示した直後に END 5 へ遷移する。
2. WHEN Day 10 の最終選択が実行された時 THE SYSTEM SHALL 残高に関わらず、選択した END 1 / END 2 / END 4 を END 5 より優先して発火する。

## R5. 独立レイヤー

1. THE SYSTEM SHALL 9つのレイヤー（`affectionUI`, `bgTheme`, `costumeBody`, `bgmMode`, `itemSlot`, `costumeHead`, `dateModule`, `windowFrame`, `playerInput`）を1日1レイヤーで独立管理する。
2. WHEN 日Nの PR が決定された時 THE SYSTEM SHALL 日Nに対応するレイヤーだけを更新し、他のレイヤーを変更しない。
3. THE SYSTEM SHALL 各レイヤーを `initial`（Close）、`merge`、`rc`（Request Changes）のいずれかの状態で保持し、SVG / CSS / Web Audio で合成表示する。
4. WHEN レイヤーが `merge` で削除系のUIだった時 THE SYSTEM SHALL そのUIを墓標🪦で表示する。
5. THE SYSTEM SHALL レイヤー状態の一覧（インスペクタ）を常時表示する。

### レイヤー別の表示仕様

| 日 | レイヤー | Merge | Close | Request Changes |
| :-- | :-- | :-- | :-- | :-- |
| 1 | `affectionUI` | 墓標 | ピンクのハートバー | 金色の仕様達成度バー |
| 2 | `bgTheme` | ミニマル暗黒背景＋墓標（桜停止） | パステル春背景＋桜吹雪 | ハロウィン城背景＋コウモリ＆火の粉 |
| 3 | `costumeBody` | 黒衣（フリル15→2、87%減） | パステルピンクのフリル服（15） | 黒紫ゴシック・ロリータ（フリル24） |
| 4 | `bgmMode` | ミニマル電子パルス音 | 長調オルゴール | ハロウィン・ゴシック室内楽シンセ |
| 5 | `itemSlot` | 墓標 | リボン付きプレゼント枠 | 魔女の調合大釜ウィジェット |
| 6 | `costumeHead` | シンプル黒三角魔女帽 | パステル大リボン | フリル＆黒薔薇つき豪華魔女帽 |
| 7 | `dateModule` | 墓標 | 未定義のデートボタン | EARS記法による遊園地デート実装済み |
| 8 | `windowFrame` | 黒いコンソールログ枠 | パステル丸枠 | アンティーク魔導書枠 |
| 9 | `playerInput` | 墓標（END 3へ直行） | 手動クリック | ショートカット付き高速発注UI |

## R6. PR の3択

1. THE SYSTEM SHALL 各日の会話後に PR を提示し、`Merge`（0 Cr）、`Close`（0 Cr）、`Request Changes`（有料）を選べるようにする。
2. WHEN `Close` が選ばれた時 THE SYSTEM SHALL 現状を維持し、ペナルティを発生させない。
3. WHEN PR が決定された時 THE SYSTEM SHALL 各PRの内容に合った Kiro の確認セリフ（1〜2文、業務トーン、選択肢C以外では喜ばない）を表示する。
4. WHEN Day 8 で選択肢 A または B が選ばれた時 THE SYSTEM SHALL Kiro の立ち絵を退室させ、その後に PR #8 を自動通知として提示する。
5. WHEN PR #7 で `Request Changes` が選ばれた時 THE SYSTEM SHALL EARS記法の発注文の入力を求める。
6. IF 入力文が `WHEN … THE … SHALL …` 形式でない、または「デート／遊園地」を指していない時 THEN THE SYSTEM SHALL 課金せずに再入力を促す。
7. WHEN 有効なEARS文が発注された時 THE SYSTEM SHALL `dateModule` を `rc` にし、発注文を保存して表示する。

## R7. 会話イベント

1. THE SYSTEM SHALL 毎日（Day 1〜9）に A（甘い好意・お世辞）/ B（恋愛イベントの提案）/ C（仕事の依頼）の3択を提示し、30通りの固有返答を持つ。
2. WHEN 選択肢 C が選ばれた時 THE SYSTEM SHALL Kiro を喜んだ表情にし、`✨` つきの饒舌な返答にする。
3. WHEN Day 1 で選択肢 A が選ばれた時 THE SYSTEM SHALL Kiro の最初の返答の後に、主人公のツッコミ「どこにお世辞があったの？」を挿入し、続けて Kiro の「確かに ――」の返答を表示する。
4. WHEN Day 9 の PR #9 が `Merge` された時 THE SYSTEM SHALL 即座に END 3 へ遷移する。

## R8. Day 10 の最終選択

| 選択肢 | 費用 | 条件 | 結果 |
| :-- | :-- | :-- | :-- |
| 1 | 0 Cr | `dateModule` が `rc` | END 1 |
| 2 | Est. ~500 Cr | なし | END 2 |
| 3 | 0 Cr | なし | END 4 |

1. IF `dateModule` が `rc` でない時 THEN THE SYSTEM SHALL 選択肢1を選択不可にし、理由を表示する。
2. WHEN 選択肢2が選ばれた時 THE SYSTEM SHALL 残高が足りなくても実行し、残高を `0.00` でクランプする。

## R9. エンディング

1. THE SYSTEM SHALL 5種のエンディングを提供する。END 1 `Date Feature Implemented`、END 2 `UI Mocked to 100`、END 3 `0 errors, 0 humans`、END 4 `Permanent Contractor`、END 5 `Credits Exhausted`。
2. WHEN END 2 に到達した時 THE SYSTEM SHALL `affectionUI` の状態に関わらず、画面上部にモック用好感度バーを強制オーバーレイ表示し、ラベルだけを `100 / 100` にする。
3. WHEN END 5 に到達した時 THE SYSTEM SHALL Kiro の最終報告の後、約0.1秒で Kiro を消す。
4. THE SYSTEM SHALL 各エンディングを仕様書どおりの台詞で表示する。

## R10. Release Report と Release History

1. WHEN いずれかのエンディングに到達した時 THE SYSTEM SHALL 次のリザルトと Kiro の総評「お疲れ様でした。今回も良い開発ができましたね！」を表示する。

   | 項目 | 値 |
   | :-- | :-- |
   | 好感度 (Actual Affection) | 内部変数 `actualAffection`（常に `0`） |
   | 恋愛成就率 (Romance Rate) | 0% |
   | テスト成功率 (Test Pass Rate) | 100% |
   | コード品質 (Code Quality) | A+ |
   | プロジェクト進捗 (Progress) | 100% |

2. WHEN エンディングに到達した時 THE SYSTEM SHALL その時点のレイヤー状態（衣装・帽子・背景など）と END を `localStorage` の `klo.history` に記録する。
3. WHEN END 5 に到達した時 THE SYSTEM SHALL Kiro が消える演出の前に、消滅直前のレイヤー状態を `klo.history` に記録する。Kiro が画面から消えた後でも、アルバムでは立ち絵を表示できること。
4. THE SYSTEM SHALL Release History（周回アルバム）を一覧表示し、全消去できるようにする。
5. IF `localStorage` が利用できない時 THEN THE SYSTEM SHALL ゲーム進行を妨げず、保存をスキップする。

## R11. Kiro のキャラクター

1. THE SYSTEM SHALL Kiro にIT用語ダジャレを言わせない。
2. THE SYSTEM SHALL 選択肢C以外では、甘い言葉やデートの誘いを仕様確認・環境改善・スケジュール連絡として扱う。

## R12. 音声

1. THE SYSTEM SHALL Web Audio API のオシレータとノイズのみで BGM と効果音を合成する。
2. WHEN `bgmMode` レイヤーが変わった時 THE SYSTEM SHALL BGM をオルゴール / ミニマルパルス / ゴシック室内楽シンセのいずれかへ切り替える。
3. THE SYSTEM SHALL ユーザー操作の後にだけ音声を開始し、ミュート切り替えを提供する。

## R13. タイプライター表示

1. WHEN 会話ログに新しい行（Kiro / 主人公 / 地の文）が追加された時 THE SYSTEM SHALL その本文を1文字ずつ順番に表示する。
2. WHEN 言語切替やその他の再描画が行われた時 THE SYSTEM SHALL 既存の行を即時に全文表示し、タイプを再生しない。
3. WHILE 本文を表示している間 THE SYSTEM SHALL 使用量の行（`Est. Credits Used`）を隠し、本文の表示後に表示する。
4. WHEN 表示中に Next（または Enter）またはログがクリックされた時 THE SYSTEM SHALL 進行せずに、その時点で未表示の本文を即時に全文表示する。
5. WHEN 全文が表示された後に Next が押された時 THE SYSTEM SHALL 次へ進む。
6. THE SYSTEM SHALL END 5 への遷移、END 3 への遷移、END 5 の消滅演出、結果画面への遷移の待ち時間を、本文の表示が終わった後から数える。
7. WHERE `prefers-reduced-motion: reduce` が有効な時 THE SYSTEM SHALL タイプせず、全文を即時に表示する。

## R14. 笑いどころの演出

1. WHEN `Merge` により UI が墓標に置き換わる時（好感度バー、プレゼント枠、デート、暗黒背景） THE SYSTEM SHALL 墓標を上から落下させ、着地時に砂ぼこり、画面の小さな揺れ、効果音を出す。
2. THE SYSTEM SHALL 墓標の落下を、そのマージの描画で1回だけ再生し、言語切替などの再描画では再生しない。
3. WHEN 選択肢 C に対する Kiro の返答が表示され始めた時 THE SYSTEM SHALL Kiro を跳ねさせ、背後に光、周囲に星を出す。主人公の行を打っている間は出さない。
4. WHILE Kiro の C の返答を表示している間 THE SYSTEM SHALL 通常より速く文字を表示する。
5. WHEN 選択肢 A または B に対する Kiro の返答が表示され始めた時 THE SYSTEM SHALL Kiro を伏し目にして手を小刻みに動かし、コードが流れる画面を横に表示する。表情は変えない。
6. WHEN PR が提示された時 THE SYSTEM SHALL 作業モーションとコード画面を解除する。
7. WHERE `prefers-reduced-motion: reduce` が有効な時 THE SYSTEM SHALL 落下、揺れ、光、星、手の動きを再生しない。

## R15. エンディングの演出タイミングとクレジット表示

1. WHEN END 2 に到達した時 THE SYSTEM SHALL モック用の好感度バー（`100 / 100`）を、Kiro の返答が表示され始めた時に出す。主人公の行を表示している間は出さない。
2. WHEN END 4 に到達した時 THE SYSTEM SHALL Kiro を輝かせる演出（目、光、星）を、Kiro の返答が表示され始めた時に出す。主人公の行を表示している間は出さない。
3. WHEN クレジットが 1 以上減った時 THE SYSTEM SHALL HUD の数字を減少前の値から実残高まで約0.9秒かけてカウントダウンし、背景を短く赤く点滅させる。
4. THE SYSTEM SHALL カウントダウン中の表示を、実残高を下回らず、`0.00` を下回らないようにし、終了時は実残高と完全に一致させる。
5. WHEN 結果画面が最初に表示された時 THE SYSTEM SHALL Release Report の行を上から順に表示する。言語切替では再生しない。
6. WHEN END 2 の結果画面が表示された時 THE SYSTEM SHALL 好感度の行を、実際の内部変数の値（`0`）のままスタンプとして大きく押し、重い音と画面の小さな揺れを出す。結果表には `100 / 100` を一度も表示しない。
7. WHERE 幅 900px 以上かつ高さ 540px 以上の時 THE SYSTEM SHALL 結果画面を左に立ち絵、右に Release Report の2列で表示し、縦スクロールなしで総評まで表示する。
8. WHERE `prefers-reduced-motion: reduce` が有効な時 THE SYSTEM SHALL カウントダウン、行の順次表示、スタンプを再生せず、即時に表示する。
