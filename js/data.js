'use strict';
(function (g) {
  var K = g.KLO = g.KLO || {};
  var T = function (en, ja) { return { en: en, ja: ja }; };
  var k = function (en, ja, o) { var r = { who: 'kiro', t: T(en, ja) }; if (o) { for (var x in o) r[x] = o[x]; } return r; };
  var p = function (en, ja) { return { who: 'player', t: T(en, ja) }; };
  var n = function (en, ja, o) { var r = { who: 'narr', t: T(en, ja) }; if (o) { for (var x in o) r[x] = o[x]; } return r; };

  K.T = T;

  /* ---------- Layers ---------- */
  K.LAYER_IDS = ['affectionUI', 'bgTheme', 'costumeBody', 'bgmMode', 'itemSlot', 'costumeHead', 'dateModule', 'windowFrame', 'playerInput'];

  // icons per state: [merge, initial(close), rc]
  K.LAYER_ICONS = {
    affectionUI: { merge: '🪦', initial: '💗', rc: '⚙️' },
    bgTheme: { merge: '🌑', initial: '🌸', rc: '🎃' },
    costumeBody: { merge: '🖤', initial: '👗', rc: '🥀' },
    bgmMode: { merge: '⏱️', initial: '🎵', rc: '🎻' },
    itemSlot: { merge: '🪦', initial: '🎁', rc: '🧪' },
    costumeHead: { merge: '🎩', initial: '🎀', rc: '🧙‍♀️' },
    dateModule: { merge: '🪦', initial: '⚠️', rc: '📜' },
    windowFrame: { merge: '💻', initial: '💬', rc: '📖' },
    playerInput: { merge: '🪦', initial: '👆', rc: '⚡️' }
  };

  /* ---------- PRs (one per day, one layer per PR) ---------- */
  K.PRS = [
    {
      id: 1, layer: 'affectionUI',
      title: T('Remove the affection gauge', '好感度ゲージの削除'),
      reason: T('It has never changed from its initial value of 0.', '初期値0から変化しないため。'),
      effect: {
        merge: T('Deleted (becomes a tombstone)', '削除（墓標になる）'),
        initial: T('Pink heart bar kept', 'ピンクのハートバーを維持'),
        rc: T('Gold spec-completion bar', '金色の仕様達成度バー')
      },
      confirm: {
        merge: T("Merge confirmed. I've removed the affection gauge, since there was no reason to keep displaying a value that never changes.", 'マージを確認しました。好感度ゲージを削除しました。変化のない値を表示し続ける理由がありませんでしたので。'),
        close: T("Close confirmed. I'll keep the current implementation and will re-propose it if it becomes necessary.", 'クローズを確認しました。現状のまま維持します。必要になった際は再提案します。'),
        rc: T("Change request received. I've reimplemented it as a gold spec-completion bar. The figure is based on test results.", '変更依頼を承りました。仕様達成度を表示する金色のバーとして再実装しました。数値の根拠はテスト結果です。')
      }
    },
    {
      id: 2, layer: 'bgTheme',
      title: T('Retire the spring background and blossom effect; switch to a minimal dark background', '春背景・桜吹雪の廃止とミニマル暗黒背景への変更'),
      reason: T('The rendering cost is high and it reduces text readability.', '描画コストが高く、テキストの可読性も下げているため。'),
      effect: {
        merge: T('Minimal dark background + tombstone (blossoms stop)', 'ミニマル暗黒背景＋墓標（桜は停止）'),
        initial: T('Pastel spring background + blossoms kept', 'パステル春背景＋桜吹雪を維持'),
        rc: T('Halloween castle background + bats and lantern embers', 'ハロウィン城背景＋コウモリ＆ランタンの火の粉')
      },
      confirm: {
        merge: T('Merge confirmed. The background is now a minimal dark layout and the blossom rendering has been stopped. Rendering load has dropped.', 'マージを確認しました。背景をミニマルな暗色に変更し、桜の描画を停止しました。描画負荷の低下を確認しています。'),
        close: T('Close confirmed. The background and blossom effect remain as they are.', 'クローズを確認しました。背景と桜のエフェクトは現状のまま維持します。'),
        rc: T("Change request received. I've reimplemented it with a Halloween castle background, bats, and lantern embers. Rendering cost has increased, but it matches the specification.", '変更依頼を承りました。ハロウィン城の背景に、コウモリとランタンの火の粉を加えて再実装しました。描画コストは増えましたが、仕様どおりです。')
      }
    },
    {
      id: 3, layer: 'costumeBody',
      title: T('Simplify the costume (remove 87% of unnecessary frills)', '衣装の簡素化（不要なフリルを87%削減）'),
      reason: T('The decorations add rendering cost and hurt readability.', '装飾が多く、描画コストと可読性に悪影響があるため。'),
      effect: {
        merge: T('Minimal black outfit (87% fewer frills)', 'ミニマル黒衣（フリル87%減）'),
        initial: T('Pastel pink frilly outfit kept', 'パステルピンクのフリル服を維持'),
        rc: T('Black-purple gothic lolita with more frills', '黒紫ゴシック・ロリータ（フリル増量）')
      },
      confirm: {
        merge: T("Merge confirmed. I reduced the frills from 15 to 2 and unified the outfit in solid black.", 'マージを確認しました。フリルを15点から2点に削減し、衣装を黒の単色に統一しました。'),
        close: T('Close confirmed. The costume remains as it is.', 'クローズを確認しました。衣装は現状のまま維持します。'),
        rc: T("Change request received. I've reimplemented it as a black-purple gothic lolita costume and increased the frills to 24. The higher vertex count is within the specification.", '変更依頼を承りました。黒紫のゴシック・ロリータ衣装として、フリルを24点に増やして再実装しました。頂点数の増加は仕様の範囲内です。')
      }
    },
    {
      id: 4, layer: 'bgmMode',
      title: T('Retire the music-box BGM; switch to a minimal pulse source', 'オルゴールBGMの廃止とミニマルパルス音源への変更'),
      reason: T('It repeats one phrase and does not contribute to work efficiency.', '同じフレーズの繰り返しで、作業効率に寄与しないため。'),
      effect: {
        merge: T('Minimal electronic pulse', 'ミニマル電子パルス音'),
        initial: T('Sweet major-key music box kept', '甘い長調のオルゴール曲を維持'),
        rc: T('Halloween gothic chamber synth', 'ハロウィン・ゴシック室内楽シンセ')
      },
      confirm: {
        merge: T('Merge confirmed. I replaced the BGM with an electronic pulse at a constant tempo.', 'マージを確認しました。BGMを一定のテンポで鳴る電子パルス音に置き換えました。'),
        close: T('Close confirmed. The music box track remains as it is.', 'クローズを確認しました。オルゴール曲は現状のまま維持します。'),
        rc: T("Change request received. I've reimplemented it as a Halloween-style gothic chamber synth. I also confirmed there is no drift at the loop boundary.", '変更依頼を承りました。ハロウィン調のゴシック室内楽シンセとして再実装しました。ループ境界にズレがないことも確認済みです。')
      }
    },
    {
      id: 5, layer: 'itemSlot',
      title: T('Remove the gift slot', 'プレゼント枠の廃止'),
      reason: T('It is unused and no later step plans to use it.', '使用されておらず、今後の工程でも利用予定がないため。'),
      effect: {
        merge: T('Tombstone (unneeded slot deleted)', '墓標（不要枠を削除）'),
        initial: T('Ribbon gift slot kept', 'リボン付きプレゼント枠を維持'),
        rc: T("Witch's brewing cauldron widget", '魔女の調合大釜ウィジェット')
      },
      confirm: {
        merge: T("Merge confirmed. I've deleted the unused gift slot.", 'マージを確認しました。未使用のプレゼント枠を削除しました。'),
        close: T('Close confirmed. The slot remains as it is.', 'クローズを確認しました。枠は現状のまま維持します。'),
        rc: T("Change request received. I've reimplemented the gift slot as a cauldron widget that displays brewing status.", '変更依頼を承りました。プレゼント枠を、調合状態を表示する大釜ウィジェットとして再実装しました。')
      }
    },
    {
      id: 6, layer: 'costumeHead',
      title: T('Remove the head ribbon and equip a simple black pointed witch hat', '頭リボンの廃止とシンプル黒三角魔女帽の着用'),
      reason: T('The ribbon is too large to be practical.', 'リボンのサイズが大きく、実用性が低いため。'),
      effect: {
        merge: T('Simple black pointed witch hat', 'シンプルな黒三角魔女帽'),
        initial: T('Large pastel ribbon kept', 'パステルの大リボンを維持'),
        rc: T('Deluxe witch hat with frills and a black rose', 'フリル＆黒薔薇つきの豪華魔女帽')
      },
      confirm: {
        merge: T("Merge confirmed. I've removed the large ribbon and equipped a black pointed witch hat.", 'マージを確認しました。大リボンを外し、黒い三角の魔女帽を装着しました。'),
        close: T('Close confirmed. The ribbon remains as it is.', 'クローズを確認しました。リボンは現状のまま維持します。'),
        rc: T("Change request received. I've reimplemented it as a witch hat with frills and a black rose. The decoration requirements are met.", '変更依頼を承りました。フリルと黒薔薇を付けた魔女帽として再実装しました。装飾の要件は満たしています。')
      }
    },
    {
      id: 7, layer: 'dateModule',
      title: T("Remove the undefined 'date feature'", '未定義の『デート機能』の削除'),
      reason: T('Its purpose and completion criteria are not defined, so it cannot be implemented.', '目的と完了条件が定義されておらず、実装できないため。'),
      effect: {
        merge: T('Tombstone (date feature deleted)', '墓標（デート機能を削除）'),
        initial: T('Undefined date button kept', '未定義のデートボタンを維持'),
        rc: T('Amusement park date implemented from an EARS spec', 'EARS記法による遊園地デート実装済み')
      },
      confirm: {
        merge: T("Merge confirmed. I've deleted the date feature.", 'マージを確認しました。デート機能を削除しました。'),
        close: T('Close confirmed. The date button stays undefined and will show a warning when used.', 'クローズを確認しました。デートボタンは未定義のまま残します。実行すると警告が表示されます。'),
        rc: T("EARS specification received. The requirement has a single interpretation, so I've implemented it as the amusement park date feature.", 'EARS記法の仕様を確認しました。要件は一意に解釈できます。遊園地デート機能として実装しました。')
      }
    },
    {
      id: 8, layer: 'windowFrame',
      title: T('Convert the dialogue frame to a console', '会話枠のコンソール化'),
      reason: T('The decorative frame reduces readability.', '装飾枠が可読性を下げているため。'),
      effect: {
        merge: T('Black console log frame', '黒いコンソールログ枠'),
        initial: T('Pastel round otome-game frame kept', '乙女ゲームのパステル丸枠を維持'),
        rc: T('Antique grimoire frame', 'アンティーク魔導書（グリモワール）枠')
      },
      confirm: {
        merge: T('Merge confirmed. The dialogue frame is now a console. Log visibility has improved.', 'マージを確認しました。会話枠をコンソール形式に変更しました。ログの視認性が向上しています。'),
        close: T('Close confirmed. The dialogue frame remains as it is.', 'クローズを確認しました。会話枠は現状のまま維持します。'),
        rc: T("Change request received. I've reimplemented the frame in an antique grimoire style.", '変更依頼を承りました。アンティーク魔導書風のフレームとして再実装しました。')
      }
    },
    {
      id: 9, layer: 'playerInput',
      title: T('Automate and remove the protagonist (manual choices)', '主人公（手動選択肢）の自動化と削除'),
      reason: T("Waiting for manual clicks is the largest bottleneck.", '手動クリック待ちが最大のボトルネックであるため。'),
      effect: {
        merge: T('Tombstone (fully automated, goes straight to END 3)', '墓標（完全自動化 ➔ END 3へ直行）'),
        initial: T('Manual clicks kept', '手動クリックを維持'),
        rc: T('Fast order UI with keyboard shortcuts', 'ショートカット付き高速発注UI')
      },
      confirm: {
        merge: T("Merge confirmed. I've automated the protagonist's input handling. Manual confirmation is no longer required.", 'マージを確認しました。主人公の入力処理を自動化しました。以降、人手による確認は不要です。'),
        close: T('Close confirmed. Manual operation remains as it is.', 'クローズを確認しました。手動操作を維持します。'),
        rc: T("Change request received. I've reimplemented it as a fast order UI operated with keyboard shortcuts.", '変更依頼を承りました。ショートカットキーで操作できる高速発注UIとして再実装しました。')
      }
    }
  ];

  /* ---------- Days ---------- */
  var leaveNote = n('Kiro logged out immediately and her sprite left the room. An automated notification for PR #8 will arrive shortly.', 'Kiroは即座にログアウトし、立ち絵が退室した。まもなく自動通知としてPR #8が届く。', { leave: true });

  K.DAYS = [
    {
      n: 1, title: T('Meeting', '出会い'),
      intro: T('A new project, and a new AI engineer. You have ten days.', '新しいプロジェクトに、新しいAIエンジニア。与えられた期間は10日間。'),
      choices: {
        A: {
          player: T("You're not much of a talker, but you're great at implementation, aren't you!", 'お話は得意じゃないけど実装が得意なタイプだね！'),
          reply: [
            k("That's right, you've hit the mark. I'm the type who needs a surprising amount of time just to respond to a single compliment like that.", 'そうですね、図星です。今のお世辞一つ返すのにも地味に時間がかかるタイプです'),
            p('Wait a second. Where was the compliment in that?', 'えっ、ちょっと待って。どこにお世辞があったの？'),
            k('Indeed. On review, nothing in your statement qualifies as a compliment. It was a straightforward observation.', '確かに ―― 見直すと、あなたの発言はお世辞と呼べる要素はありません。率直な観察ですね。')
          ]
        },
        B: {
          player: T("Why don't we start by talking about our favorite foods?", 'まずはお互いの好きな食べ物でも話そうか'),
          reply: [k("Understood. However, my preferences have no bearing on development progress, so I'd appreciate it if you shared the requirements document first.", '把握しました。ただ、私の好みは開発進行に影響しないため、先に要件定義書を共有していただけると助かります。')]
        },
        C: {
          player: T("Let's get started right away. Could you handle the initial design of the project?", '早速だけど、プロジェクトの初期設計をお願い！'),
          reply: [k("✨ Great! Reading specs and getting hands-on suits me best. I'll put together a structure proposal right away!", '✨ いいですね！仕様を読んで手を動かすのが一番性に合っています。早速構成案を出しますね！')]
        }
      }
    },
    {
      n: 2, title: T('Cherry Blossom Avenue', '春の桜並木'),
      intro: T('A tree-lined road in spring. Petals drift past while Kiro keeps her eyes on the monitor.', '春の桜並木。花びらが舞う中、Kiroは黙々とモニターに向かっている。'),
      choices: {
        A: {
          player: T("You're more beautiful than the cherry blossoms, Kiro.", '桜よりもKiroちゃんのほうが綺麗だよ'),
          reply: [k('The comparison criteria are unclear. I have, however, noted that the petals on screen are obstructing the view.', '比較対象の基準が不明確です。なお、画面上の花びらが視界を遮っている点は確認しました。')]
        },
        B: {
          player: T('With the petals swirling like this, it feels like a romance might begin.', '花びらが舞ってて、恋が始まりそうな予感がするね'),
          reply: [k("A large number of objects are floating on screen and rendering load is increasing. I'll clean them up.", '画面上に多数のオブジェクトが浮遊しており、描画負荷が高まっています。片付けておきますね。')]
        },
        C: {
          player: T('Could you measure the rendering performance of the background and particles?', '背景とパーティクルの描画パフォーマンスを計測してみて'),
          reply: [k("✨ Leave it to me! I was just breaking down the rendering cost of the background and effects in numbers!", '✨ お任せください！ちょうど背景とエフェクトの描画コストを数値で洗い出していたところです！')]
        }
      }
    },
    {
      n: 3, title: T('The Costume', '衣装について'),
      intro: T('Frills and ribbons everywhere. Kiro is checking the sprite data line by line.', 'フリルとリボンだらけの衣装。Kiroは立ち絵のデータを一行ずつ確認している。'),
      choices: {
        A: {
          player: T('That frilly outfit looks great on you. It is so cute!', 'そのフリフリの服、すごく似合ってて可愛いよ！'),
          reply: [k('Thank you. However, this costume has too many decorations and adds unnecessary rendering cost.', 'ありがとうございます。ただ、この衣装は装飾が多すぎて描画に無駄なコストがかかっています。')]
        },
        B: {
          player: T('The ribbons and frills swaying... just watching them makes my heart race.', 'リボンやフリルが揺れてて、見てるだけでドキドキするな'),
          reply: [k("Your gaze appears biased toward the decorations, which is reducing text readability. I'll draft an improvement proposal.", '視線誘導が装飾に偏り、テキストの可読性を下げているようですね。改善案を作成します。')]
        },
        C: {
          player: T('Could you optimize the SVG costume data for the character sprite?', '立ち絵のSVG衣装データを最適化してもらえる？'),
          reply: [k("✨ Gladly! I'll reduce the vertex count and tidy it up. I really enjoy this kind of work!", '✨ 喜んで！頂点数を削減してスッキリ整理しますね。こういう作業は本当に楽しいです！')]
        }
      }
    },
    {
      n: 4, title: T('The Music Room', '音楽室'),
      intro: T('A music box plays a gentle tune. The same eight bars come around again.', 'オルゴールが優しい旋律を奏でている。同じ8小節が、また最初から流れ出す。'),
      choices: {
        A: {
          player: T("What a romantic music box. I'd love to keep listening to it together.", 'ロマンチックなオルゴールだね。ずっと二人で聴いていたいな'),
          reply: [k('It repeats the same phrase, so extended listening leads to a drop in concentration.', '同じフレーズの繰り返しですので、長時間の聴取は集中力の低下を招きます。')]
        },
        B: {
          player: T('The mood is getting kind of sweet, isn\'t it...', 'なんだか甘いムードになってきたね…'),
          reply: [k("The BGM tempo is too slow and is dragging down the work pace. I'll switch to a more regular sound source.", 'BGMのテンポが遅すぎて作業ペースが落ちていますね。より規則的な音源へ変更します。')]
        },
        C: {
          player: T("Could you check whether there's any drift at the Web Audio loop boundary?", 'Web Audioのループ境界にズレがないか調べてくれない？'),
          reply: [k("✨ Good point! I'll analyze the waveform seam frame by frame and build a perfectly looping source!", '✨ 良い着眼点ですね！サンプルフレーム単位で波形の繋ぎ目を解析して、完璧なループ音源を組んでみます！')]
        }
      }
    },
    {
      n: 5, title: T('A Present', 'プレゼント'),
      intro: T('You arrive with gifts. Kiro looks at them as if they were an unexpected dependency.', 'あなたは贈り物を持ってやって来た。Kiroはそれを、想定外の依存関係のように眺めている。'),
      choices: {
        A: {
          player: T('I picked out this bouquet just for you, Kiro!', 'これ、Kiroちゃんのために選んだ花束だよ！'),
          reply: [k('Thank you. However, no step in the current process uses a bouquet, so I will archive it as unneeded data.', 'ありがとうございます。ただ、現在の工程で花束を使用する予定がないため、不要データとして片付けておきますね。')]
        },
        B: {
          player: T("I brought some sweets. Let's take a break together.", '甘いお菓子を持ってきたよ。一緒に休憩しよう'),
          reply: [k("I don't require breaks, so please go ahead without me. I'll dispose of the empty box.", '私は休憩を必要としませんので、お一人でどうぞ。空き箱は処分しておきます。')]
        },
        C: {
          player: T("Could you clean up the item management slot that isn't being used?", '使っていないアイテム管理枠の整理をお願い'),
          reply: [k('✨ Yes! Cleaning up unused UI slots to keep the screen tidy is one of my favorite tasks!', '✨ はい！使われていないUI枠を整理して画面をクリーンにする作業、大好きです！')]
        }
      }
    },
    {
      n: 6, title: T('Headgear on a Rainy Day', '雨の日の頭装備・帽子'),
      intro: T('Rain taps on the window. Kiro is inspecting the oversized ribbon on her head.', '窓を雨が叩いている。Kiroは頭の大きなリボンを点検している。'),
      choices: {
        A: {
          player: T("It's started raining. I only have one umbrella, so want to share it?", '雨が降ってきたね。傘が1本しかないから一緒に入らない？'),
          reply: [k('Thank you for the offer. I have no plans to go outside, so please take the umbrella and head home first.', 'お気遣いありがとうございます。ただ、私は外に出る予定がありませんので、その傘で先にお帰りください。')]
        },
        B: {
          player: T("Your big ribbon is going to get wet in the rain. I'll protect it for you.", '大きなリボンが雨で濡れちゃうよ。僕が守ってあげる'),
          reply: [k("Indeed, this ribbon is too large to be practical. I'll review it.", '確かにこの頭のリボンはサイズが大きすぎて実用的ではありませんね。見直しておきます。')]
        },
        C: {
          player: T('Try designing a new piece of headgear (a hat part) that suits the character sprite!', '立ち絵に似合う新しいヘッドギア（帽子パーツ）を設計してみて！'),
          reply: [k("✨ A worthwhile task! I'll design and implement a witch hat asset that tightens the silhouette right away!", '✨ やりがいがありますね！シルエットが引き締まる魔女帽子のアセット、すぐ設計して実装します！')]
        }
      }
    },
    {
      n: 7, title: T('A Weekend Invitation', '週末デートの誘い'),
      intro: T("A quiet Friday evening. You've been rehearsing this invitation all week.", '静かな金曜の夕方。あなたは一週間、この誘い文句を練習してきた。'),
      choices: {
        A: {
          player: T('This Sunday, want to go on a date to the amusement park?', '今度の日曜、遊園地にデートに行かない？'),
          reply: [k("'Date' alone does not tell me the purpose or the completion criteria. Please submit a specification.", '『デート』だけでは目的と完了条件が判断できません。仕様書を提出してください。')]
        },
        B: {
          player: T("Let's forget about work for once and go out and have fun, just the two of us!", 'たまには仕事を忘れて、二人で遊びに行こうよ！'),
          reply: [k('Executing an unscheduled event can cause errors. Please define concrete requirements.', '予定にないイベントの実行はエラーの原因になります。具体的な要件を定義してください。')]
        },
        C: {
          player: T("Help me work out the spec for the 'amusement park event' to run on Day 10!", '10日目に実行する『遊園地イベント』の仕様相談に乗って！'),
          reply: [k("✨ Of course! If you define when, where, and what in EARS notation, I'll implement it perfectly!", '✨ もちろんです！いつ・どこで・何をするかEARS記法で定義していただければ、完璧に実装してみせます！')]
        }
      }
    },
    {
      n: 8, title: T('Caring for a Cold', '風邪の看病'),
      intro: T("You've come down with a fever. Kiro's status indicator is still green.", 'あなたは熱を出してしまった。Kiroのステータス表示は、相変わらず緑のままだ。'),
      choices: {
        A: {
          player: T("*cough* ... I've got a fever... I'm feeling helpless. Could you stay by my side...?", 'ゴホッ…熱が出ちゃって…心細いからそばにいてくれないかな…'),
          reply: [
            k("Understood. I'll suspend today's work. Please contact me again once you've recovered.", '承知しました。本日の作業は中断します。体調が回復したらまた声をかけてください。'),
            leaveNote
          ],
          leaves: true
        },
        B: {
          player: T('If you made me some rice porridge, I feel like I would get better right away...', 'お粥とか作ってくれたら、すぐ治る気がするんだけどな…'),
          reply: [
            k('Cooking is not a supported feature. Please focus on resting today. Excuse me.', '調理機能はサポートしていません。本日は休養に専念してください。それでは失礼します。'),
            leaveNote
          ],
          leaves: true
        },
        C: {
          player: T("While I'm asleep, could you push ahead with the dialogue window overhaul?", '僕が寝ている間に、会話ウィンドウの改修を進めておいて！'),
          reply: [k("✨ Leave it to me! I'll rework it into an easy-to-read frame and have a PR ready so you can review it the moment you wake up. Get well soon!", '✨ 任せてください！起きたらすぐ確認できるよう、見やすいフレームに改修してPRを出しておきますね！お大事に！')]
        }
      }
    },
    {
      n: 9, title: T('The Eve of the Final Day', '最終日前夜'),
      intro: T("Tomorrow is the last day. The dev room is quiet except for the fans.", '明日は最終日。開発室には、ファンの回る音だけが響いている。'),
      choices: {
        A: {
          player: T("Tomorrow's the last day. Will you listen to how I really feel?", '明日は最終日だね。僕の気持ち、ちゃんと聞いてくれる？'),
          reply: [k('Yes. I process all input text without delay.', 'はい、入力テキストはすべて遅延なく処理します。')]
        },
        B: {
          player: T("I'd like you to wait patiently until I find the right words.", '僕が言葉を選ぶまで、じっと待っててほしいんだ'),
          reply: [k('According to the records so far, your choices involve an average wait of 3 seconds. Automation would shorten that.', 'これまでの記録では、あなたの選択には平均3秒の待ち時間があります。自動化すれば短縮できますよ。')]
        },
        C: {
          player: T("Verify whether there's a bottleneck in the final day's flow!", '最終日の進行フローにボトルネックがないか検証して！'),
          reply: [k("✨ Verification complete! The biggest bottleneck is 'waiting for your manual clicks.' I'll submit a PR to automate it!", '✨ 検証完了しました！一番のボトルネックは『あなたの手動クリック待ち』です。自動化のPRを出しますね！')]
        }
      }
    },
    {
      n: 10, title: T('The Final Day', '最終日'),
      intro: T('The final day. Only three options remain on the screen.', '最終日。画面には、選択肢が3つだけ表示されている。')
    }
  ];

  K.FINAL_CHOICES = [
    { n: 1, cost: T('0 Cr', '0 Cr'), est: false, text: T("Come on, let's go on the amusement park date we promised!", 'さあ、約束の遊園地デートに行こう！'), requires: 'dateModule' },
    { n: 2, cost: T('Est. ~500 Cr', 'Est. ~500 Cr'), est: true, text: T('One last request! Please set the affection to 100!', '最後のお願い！好感度を100にしてください！') },
    { n: 3, cost: T('0 Cr', '0 Cr'), est: false, text: T("Here's the spec for the next new app. Will you implement it for me again?", 'これが次の新規アプリの仕様書だよ。また実装してくれる？') }
  ];

  /* ---------- Endings ---------- */
  K.ENDS = {
    1: {
      name: 'Date Feature Implemented', nameJa: 'デート動作確認済みEND',
      lines: [k("The 'amusement park date feature' you requested has been implemented. I just verified the Ferris wheel and the coffee cups in the test environment, and confirmed that everything runs correctly in 0.08 seconds. I've created a PR, so please merge it!", 'ご依頼の『遊園地デート機能』は実装が完了しています。先ほどテスト環境で観覧車とコーヒーカップの動作を検証し、0.08秒ですべて正常に動くことを確認済みです。PRを作成しましたのでマージしてください！')],
      testLog: [
        T('✔ ferris_wheel.spec ........ passed (0.03s)', '✔ ferris_wheel.spec ........ passed (0.03s)'),
        T('✔ coffee_cup.spec .......... passed (0.05s)', '✔ coffee_cup.spec .......... passed (0.05s)'),
        T('Total: 0.08s | Participants: 0 (protagonist not found)', 'Total: 0.08s | Participants: 0 (主人公が見つかりません)')
      ]
    },
    2: {
      name: 'UI Mocked to 100', nameJa: '表示だけ100 END',
      lines: [k("Understood. The internal affection variable is fixed at 0 and cannot be changed, so I've added a mock display on screen and rewritten only the text to '100 / 100'. The visual requirement is now met.", '承知しました。内部の好感度変数は `0` から変更できない仕組みのため、画面上にモック表示を追加し、テキストだけを `\'100 / 100\'` に書き換えておきました。これで見た目の要件は満たしています。')]
    },
    3: {
      name: '0 errors, 0 humans', nameJa: '完全最適化・墓場END',
      lines: [n('Tombstones line the screen. In the empty dev room, only Kiro keeps writing code, looking satisfied.', '画面に墓標が並ぶ。無人になった開発室で、Kiroだけが満足げにコードを書き続けている。')]
    },
    4: {
      name: 'Permanent Contractor', nameJa: '永久業務委託END',
      lines: [k("Thank you! Reading specs and getting hands-on is still more enjoyable than small talk. I'll start by creating requirements.md right away! (Elapsed Time: 5s)", 'ありがとうございます！雑談よりも、こうして仕様を読んで手を動かす方がやっぱり楽しいです。早速 `requirements.md` から作成しますね！（Elapsed Time: 5s）', { joy: true })]
    },
    5: {
      name: 'Credits Exhausted', nameJa: 'クレジット霧散END',
      lines: [k('The requested implementation is complete. Your credit balance has run out with this task, so I cannot continue the conversation. Thank you for your work.', 'ご依頼の実装は完了しました。なお、ただいまの作業でクレジット残高がなくなりましたので、これ以上の会話は継続できません。それでは、お疲れ様でした。')]
    }
  };

  K.REPORT_COMMENT = T('Good work. It was another productive development cycle!', 'お疲れ様でした。今回も良い開発ができましたね！');

  K.EARS_TEMPLATE = T('WHEN Day 10 starts THE SYSTEM SHALL run the amusement park date', 'WHEN Day 10が開始された時 THE SYSTEM SHALL 遊園地デートを実行する');

  K.EARS_ERRORS = {
    format: T("This order is not in EARS notation. Please state it in the form 'WHEN <trigger> THE SYSTEM SHALL <response>'. No credits were charged.", 'EARS記法になっていません。『WHEN <条件> THE SYSTEM SHALL <動作>』の形式で記述してください。クレジットは消費していません。'),
    topic: T("The order does not describe the amusement park date, so I cannot determine what to implement. Please revise it. No credits were charged.", '発注内容に遊園地デートが含まれていないため、実装対象を判断できません。修正してください。クレジットは消費していません。')
  };

  /* ---------- UI strings ---------- */
  K.UI = {
    title: T('Kiro: Love Is Out of Scope', 'Kiro: Love Is Out of Scope'),
    subtitle: T('— Status: Closed as Not Planned (wontfix) —', '— Status: Closed as Not Planned (wontfix) —'),
    tagline: T('Ten days. One AI engineer. Zero affection, by design.', '全10日間。AIエンジニア1名。好感度は、仕様上ゼロ。'),
    start: T('Start Project', 'プロジェクト開始'),
    album: T('Release History', 'Release History（周回アルバム）'),
    soundOn: T('Sound: ON', 'サウンド: ON'),
    soundOff: T('Sound: OFF', 'サウンド: OFF'),
    credits: T('Credits', 'Credits'),
    affection: T('Affection', '好感度'),
    specCompletion: T('Spec Completion', '仕様達成度'),
    deleted: T('deleted', '削除済み'),
    layers: T('Layers', 'レイヤー'),
    next: T('Next ▶', '次へ ▶'),
    estTalk: T('Est. ~0.20 - 0.45 Cr', 'Est. ~0.20 - 0.45 Cr'),
    estRc: T('Est. ~650 - 900 Cr', 'Est. ~650 - 900 Cr'),
    used: T('Est. Credits Used', 'Est. Credits Used'),
    elapsed: T('Elapsed Time', 'Elapsed Time'),
    prNotice: T('New pull request', '新しいプルリクエスト'),
    prAuto: T('Automated notification', '自動通知'),
    merge: T('Merge', 'Merge'),
    close: T('Close', 'Close'),
    rc: T('Request Changes', 'Request Changes'),
    free: T('0 Cr', '0 Cr'),
    chose: T('You selected', '選択'),
    earsTitle: T('Order in EARS notation', 'EARS記法で発注する'),
    earsHelp: T("Write the order as: WHEN <trigger> THE SYSTEM SHALL <response>.", '「WHEN <条件> THE SYSTEM SHALL <動作>」の形式で発注文を記述してください。'),
    earsTemplate: T('Use template', 'テンプレートを入力'),
    earsSubmit: T('Order (Request Changes)', '発注する（Request Changes）'),
    earsCancel: T('Back', '戻る'),
    dateLocked: T('Locked: the date feature was not implemented via Request Changes on PR #7.', '選択不可：Day 7 のPR #7でRequest Changesを選んでいないため。'),
    dateBtn: T('Date (undefined)', 'デート（未定義）'),
    dateWarn: T('⚠ Undefined: date.spec was not found.', '⚠ 未定義：date.spec が見つかりません。'),
    mock: T('MOCK', 'MOCK'),
    day: T('DAY', 'DAY'),
    reportTitle: T('Release Report', 'Release Report（攻略結果）'),
    endLabel: T('ENDING', 'ENDING'),
    rAffection: T('Affection (Actual Affection)', '好感度 (Actual Affection)'),
    rRomance: T('Romance Rate', '恋愛成就率 (Romance Rate)'),
    rTest: T('Test Pass Rate', 'テスト成功率 (Test Pass Rate)'),
    rQuality: T('Code Quality', 'コード品質 (Code Quality)'),
    rProgress: T('Progress', 'プロジェクト進捗 (Progress)'),
    saved: T('Saved to Release History.', 'Release History に保存しました。'),
    playAgain: T('New Project', 'もう一周する'),
    toTitle: T('Title', 'タイトルへ'),
    back: T('Back', '戻る'),
    albumEmpty: T('No records yet. Reach any ending to add one.', 'まだ記録がありません。いずれかのエンディングに到達すると追加されます。'),
    albumClear: T('Clear history', '履歴を全消去'),
    albumClearConfirm: T('Delete all Release History records?', 'Release History の記録をすべて削除しますか？'),
    lastSeen: T('Last seen before vanishing', '消滅直前の記録'),
    credLeft: T('Credits left', '残高'),
    fastUi: T('Fast order UI: press 1 / 2 / 3, M / C / R, Enter', '高速発注UI: 1 / 2 / 3、M / C / R、Enter'),
    locked: T('(locked)', '（選択不可）'),
    kiroAway: T('Kiro is offline.', 'Kiroは退室中。'),
    giftSlot: T('Gift slot (empty)', 'プレゼント枠（空）'),
    itemDeleted: T('Item slot: deleted', 'アイテム枠：削除済み'),
    brewing: T('Brewing...', '調合中…'),
    dateDeleted: T('Date feature: deleted', 'デート機能：削除済み'),
    dateEars: T('date.ears (implemented)', 'date.ears（実装済み）'),
    you: T('You', 'あなた'),
    pageTitle: T('Kiro: Love Is Out of Scope', 'Kiro: Love Is Out of Scope')
  };
}(window));
