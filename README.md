# rythm

次世代の音ゲーの「ノーツの取り方」を試すためのプロトタイプ集です。

すべての形式が `index.html` 1 枚にまとまっています。ブラウザで開くと形式の一覧が出て、選ぶとその形式で遊べます。ビルドは不要です。

- 曲はすべて Web Audio API でリアルタイムに合成しているので、音源ファイルはありません。
- 判定オフセット・ハイスピード・オートプレイの設定は全形式で共通です。
- `index.html#kiriko` のように形式の id を付けて開くと、その形式のタイトル画面から始まります。

## 形式

- `kumihimo` KUMIHIMO（編み込みレーン）：4 本のレーンが交差して入れ替わる。キーは位置ではなく色。D F J K
- `kiriko` KIRIKO（変形する多角形）：回る多角形の辺がレーン。三角〜六角に形が変わる。S D F J K L
- `kagami` KAGAMI（四辺反射）：跳ね回る光の玉が壁に当たる瞬間に、その壁のキー。↑←↓→ または W A S D
- `hotaru` HOTARU（踊るレセプター）：踊る受け皿に、曲線を描く光の筋が届く瞬間。D F J K
- `minamo` MINAMO（広がる円）：広がる波紋が、待っているノーツに届く瞬間に狙って叩く。マウス + Z / X、またはタップ
- `furiko` FURIKO（振り子判定線）：メトロノームの振り子が帯の上のノーツを通過する瞬間。D F J K
- `hasami` HASAMI（閉じる 2 本線）：両側から近づく 2 本の線が重なる瞬間。D F J K
- `tomoshi` TOMOSHI（自分で動かす判定線）：動かない提灯に、自分で動かす光の柱を重ねて灯す。マウスで柱を動かし、段のキー D F J K（スマホは提灯をタップ）

## ファイルの中身

`index.html` の `<script>` は 3 つに分かれています。

1. **ENGINE**：全形式共通。設定、画面（一覧・タイトル・リザルト）、判定、入力、音（ドラム・ベース・パッド）、メインループ。
2. **MODES**：形式ごとの `defineMode(kit => ({ ... }))` ブロック。
3. **BOOT**：起動処理。

## 新しい形式を追加する

`MODES` の最後（`BOOT` の直前）に `defineMode` ブロックを 1 つ足すだけで、一覧に並びます。既存のブロックを丸ごとコピーして書き換えるのが一番早いです。

ブロックが返すオブジェクトに必要なもの：

- **表示**：`id`（URL の `#` に使う）、`name`、`kind`（取り方の名前）、`kana`、`blurb`（一覧の 1 行説明）、`lede`（タイトル画面の説明、HTML 可）、`keys`（`{ label, name, color }` の配列）、`touchHint`、`meta`、`theme`（`ink` `ink2` `panel` `paper` `muted` `accent`）。
- **曲と譜面**：`bpm`、`bars`、`sections`（`{ bar, name }`）、`chords`（`{ pad, bass, lead }`）、`chart`（ノーツの配列。最低限 `beat` `t` `dur` と、キー入力なら `lane`）、`attractFromBar`（タイトル画面のデモを始める小節）。
  - レーン型の譜面は `kit.parseLanes(BARS, SPB, レーン数)` で、1 小節 16 文字の文字列から作れます（`0`〜`5` がタップ、`a`〜`f` と `-` が長押し）。作ったら `kit.sortChart(chart)`。
- **音**：`song.arrange(add, bar, b0, ch, name)` でドラムやベースを並べ、`song.lead(A, at, midi, dur)` でリードの音色、`song.leadMidi(note)` でノーツごとの音程を決めます。`song.bass` `song.pad` `song.delay` で共通の音色を調整できます。
- **入力**：キーで叩く形式は `laneCodes`（レーンごとのキーコード配列）と `touchLane(x, y, now)`。押したときに追加の条件を付けたいときは `laneAccept(note, now)`、長押し中の条件は `holdCheck(note, now)`、マウスカーソルを隠すなら `hideCursor: true`（マウスや指の位置は `kit.S.aim`）。位置を狙う形式は `input: 'aim'` と `hitTest(note, x, y)`・`followPos(note, now)`・`followReach()`。
- **描画**：`layout(W, H, snap)`、`update(now, dt)`、`draw(now, dt)`、`onJudge(note, grade, now)`、`onNewRun()`。画面左のパネルを避けたいときは `kit.wide()` を見ます。スコアと進行バーはエンジンが描きます。コンボを自分で描く形式は `comboOwn: true`。

`kit` には描画コンテキスト `g`、実行中の状態 `S`（`notes` `pressed` `autoHold` `flash` `combo` `popup` など）、`rgba` `hex` `mulberry32` `secIndex` `pulse` `view` `holding` `runOf` などの道具が入っています。
