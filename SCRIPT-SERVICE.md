# RTM スクリプト実装知識まとめ

RealTrainMod (RTM) / KaizPatchX 環境下でのレンダー/音声/サーバースクリプト（`VehiclePartsRenderer`等）実装に関する調査・実装知見、および hi03式ATSプラグインの実装方法をまとめたもの。

## 目次
1. [基本構造](#1-基本構造)
2. [アクションパーツ（右クリック操作可能なパーツ）](#2-アクションパーツ右クリック操作可能なパーツ)
3. [カスタムボタン（GUIから操作する状態フラグ）](#3-カスタムボタンguiから操作する状態フラグ)
4. [DataMap（永続・同期可能な状態保存）](#4-datamap永続同期可能な状態保存)
5. [`renderer.getData` / `setData`（スクリプト内スクラッチデータ）](#5-renderergetdata--setdataスクリプト内スクラッチデータ)
6. [車両情報の取得API](#6-車両情報の取得api)
7. [ワンマン運転（1両目のみ乗降）実装](#7-ワンマン運転1両目のみ乗降実装)
8. [半自動ドアボタンの3種類実装](#8-半自動ドアボタンの3種類実装)
9. [TIMS（列車情報管理システム表示）の仕組み](#9-tims列車情報管理システム表示の仕組み)
10. [計器類・可動部の実装パターン一覧](#10-計器類可動部の実装パターン一覧)
11. [実装時の注意点まとめ](#11-実装時の注意点まとめ)
12. [スクリプト未対応車両のスクリプト化（hi03式「スクリプト対応化スクリプト」）](#12-スクリプト未対応車両のスクリプト化hi03式スクリプト対応化スクリプト)
13. [hi03式ATSプラグイン 実装方法まとめ](#13-hi03式atsプラグイン-実装方法まとめ)
    - 13.0 [注意事項](#130-注意事項) / 13.1 [対応ATS種別](#131-対応ats種別) / 13.2 [入手方法](#132-入手方法)
    - 13.3 [ファイル配置](#133-ファイル配置) / 13.4 [各ATSの組み込みコード](#134-各atsの組み込みコード) / 13.5 [DataMapキー一覧](#135-開発者向け-datamapキー一覧)
    - 13.6 [ATS種別ごとの挙動・操作・地上子設置](#136-ats種別ごとの挙動操作地上子設置) / 13.7 [地上子モデル本体の導入](#137-地上子トランスポンダモデル本体の導入) / 13.8 [RTM対応バージョン](#138-rtm対応バージョン)
    - 13.9 [DC100へのATS-P・Ps実装ガイド](#139-dc100へのats-pps実装ガイドv11実ファイル確認済み)

---

## 1. 基本構造

```js
var renderClass = "jp.ngt.rtm.render.VehiclePartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);

function init(par1, par2) { ... }      // 起動時1回: パーツ登録
function render(entity, pass, par3) { ... }  // 毎フレーム: 描画
function onRightClick(entity, parts) { ... } // 右クリック時(ActionParts用)
function onRightDrag(entity, parts, move) { ... } // 右クリックドラッグ時(ActionParts用)
```

### レンダーパス (`pass`)

| pass | RenderPass | 内容 |
|---|---|---|
| 0 | NORMAL | 通常描画（不透明） |
| 1 | TRANSPARENT | 半透明描画（窓ガラス等） |
| 2 | LIGHT | 発光テクスチャ（消灯時 or 基本発光） |
| 3 | LIGHT_FRONT | 発光テクスチャ（客室灯・乗務員室内側など） |
| 4 | LIGHT_BACK | 発光テクスチャ（乗務員室外側・貫通扉車外側など） |
| 253 | OUTLINE | 輪郭線 |
| 254 | GUI | GUI用 |
| 255 | PICK | 右クリック判定用（見た目には描画されない） |

---

## 2. アクションパーツ（右クリック操作可能なパーツ）

### 登録方法

```js
importPackage(Packages.jp.ngt.rtm.render); // ActionParts, ActionType

// ActionType: TOGGLE(トグル), DRAG_X(X方向ドラッグ), DRAG_Y(Y方向ドラッグ)
myButton = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "obj_name_in_model"));
```

- モデル(.mqo)内のオブジェクト名と `Parts`/`ActionParts` の登録名を一致させる必要がある。
- `ActionParts` は `Parts` を継承しており、通常の `render(renderer)` 呼び出しで描画できる。
- ホバー時に自動で輪郭線（アウトライン）がハイライト表示される（`ActionParts.java` 内で自動処理、スクリプト側で追加実装は不要）。

### 右クリック判定に必要なレンダリング

ActionParts は **pass=255 (PICK)** で `render()` を呼ばないと右クリック判定が効かない。また pass=2 (LIGHT) でホバー輪郭線が描画される。

```js
if (pass == RenderPass.PICK.id) {
    myButton.render(renderer);
}
if (pass == RenderPass.LIGHT.id) {
    myButton.render(renderer);
}
```

### 右クリック時の処理

```js
function onRightClick(entity, parts) {
    if (entity == null) return;
    if (parts.equals(myButton)) {
        // 処理
    }
}
```

### ドラッグ操作（マスコン・ブレーキてこ等）

```js
function onRightDrag(entity, parts, move) {
    // move: 右クリック開始時を0とした相対マウス移動量
    var notch = entity.getNotch();
    if (move === 0) {
        // ドラッグ開始時の初期化処理
        return;
    }
    var newNotch = startNotch + Math.floor(-move / 20); // 20pxごとに1段階
    entity.syncNotch(newNotch - notch);
}
```

参考実装: `RenderOhmi220.js`（マスコン/ブレーキハンドルのドラッグ操作、締切スイッチのトグル操作）、`RenderPalm.js`（植物の高さドラッグ操作）。

---

## 3. カスタムボタン（GUIから操作する状態フラグ）

モデルJSON側で定義:

```json
"customButtons": [
    ["Light_On","Light_Switching","Light_Off"],
    ["ExLight_Auto","ExLight_On","ExLight_Off"],
    ...
],
```

スクリプト側で読み取り:

```js
var isKaizPatch = RTMCore.VERSION.indexOf("KaizPatch") !== -1;

var cb = [];
for (var j = 0; j < customButton; j++) {
    if (entity != null && (isKaizPatch || varsion == "1.12.2" || varsion == "1.10.2")) {
        cb[j] = entity.getResourceState().getDataMap().getInt("Button" + j);
    } else {
        cb[j] = 0;
    }
}
```

- `cb[j]` の値は customButtons配列の要素数によって 0,1,2... と巡回する。
- `customButton` 変数（ボタン総数）と `customButtons` JSON配列の要素数を必ず一致させる。

---

## 4. DataMap（永続・同期可能な状態保存）

車両エンティティごとに任意のキーで値を保存できる。カスタムボタン以外にも自由に使える。

```js
var dataMap = entity.getResourceState().getDataMap();

dataMap.setInt("myKey", 1, 1);   // 第3引数=flag。1=SYNC_FLAG(全クライアント同期)
var v = dataMap.getInt("myKey"); // 未設定時は0
```

- `DataMap.SYNC_FLAG = 1`: サーバー経由で全クライアントに同期
- `DataMap.SAVE_FLAG = 2`: NBTセーブに保存
- `setInt/getInt`, `setDouble/getDouble`, `setBoolean/getBoolean`, `setString/getString` などが使用可能。

### 半自動ドア実装での利用例

各ドアの「開許可」状態をDataMapで保持し、右クリックボタンでトグル。車掌操作(`entity.doorMoveL/R`)と乗客ボタン操作の**両方が揃ったときだけ**そのドアを開く、という掛け算方式で実装した。

```js
var baseL = entity.doorMoveL / 60 * doorMove;
doorMoveL_F = baseL * dataMap.getInt("sdoor_LF"); // ボタンOFF(0)なら常に0
```

ドアが閉まりきったタイミング（`doorMoveL/R` が0に戻った瞬間）でボタン状態を自動リセットする処理をTick処理内に入れることで、次駅での誤開扉を防止できる。

---

## 5. `renderer.getData` / `setData`（スクリプト内スクラッチデータ）

DataMapとは別に、`PartsRenderer` が持つ簡易データ領域。エンティティIDとビットシフトで名前空間を分離して使う。

```js
var entityID = entity.func_145782_y(); // getEntityId() のコンパイル後名

var ID_PrevTick = 0;
var ID_DoorMovement = 1;

renderer.setData(entityID << ID_DoorMovement, value);
var value = renderer.getData(entityID << ID_DoorMovement);
```

- サーバー同期やNBTセーブはされない、**クライアント側の描画専用の一時データ**。
- パンタグラフの補間状態やドア開閉のtick管理など、フレーム間で値を持ち越したい処理に使う。
- 配列を格納する場合は `getArrayFromData(ID, amount)` のようなヘルパーで「未初期化時はゼロ埋め配列を返す」処理を書くと安全。

### Tick変化の検知（`shouldUpdate`パターン）

`render()` は1フレームに複数passで呼ばれるため、「1tickに1回だけ実行したい処理」は前回tick値と比較して検知する。

```js
var prevTick = renderer.getData(entityID << ID_PrevTick);
var currentTick = renderer.getTick(entity);
var shouldUpdate = (prevTick != currentTick) && (pass == 0);
if (shouldUpdate) renderer.setData(entityID << ID_PrevTick, currentTick);
```

---

## 6. 車両情報の取得API

| メソッド | 内容 |
|---|---|
| `entity.getNotch()` | ノッチ値（-8=EB非常 〜 +5=力行最大、車種依存） |
| `entity.getSpeed()` | 現在速度 |
| `entity.brakeCount` | ブレーキシリンダ相当の生値 |
| `entity.brakeAirCount` | ブレーキ管圧相当の生値 |
| `entity.getSignal()` | 現在の信号値（ATS用、-1=無効/0=進行) |
| `entity.doorMoveL` / `doorMoveR` | ドア開閉の生の移動量（0〜60） |
| `entity.isControlCar()` | この車両端に運転台があるか（前 or 後どちらか） |
| `entity.getTrainStateData(id)` / `getVehicleState(TrainState.getStateType(id))` | 旧/新バージョンでのvehicle state取得（バージョン分岐が必要） |
| `entity.getCabDirection()` | 編成として現在どちら向きに運転しているか(0/1) |
| `entity.getTrainDirection()` | 列車の走行方向(State_TrainDir, 0/1) |
| `entity.getFormation()` | 編成情報 (`Formation`オブジェクト、`entries[]`で各車両にアクセス) |
| `entity.getConnectedTrain(0)` / `getConnectedTrain(1)` | この車両の前(0)/後(1)に連結されている車両を取得（無ければ`null`） |

### 連結判定（`getConnectedTrain`）

`entity.getConnectedTrain(par1)` は「この車両の前後どちらに連結車両がいるか」を返す（[EntityTrainBase.java:906-927](../../../IdeaProjects/KaizPatchX-1.10.0/KaizPatchX-1.10.0/src/main/java/jp/ngt/rtm/entity/train/EntityTrainBase.java)）。

```java
public EntityTrainBase getConnectedTrain(int par1) {
    // par1: 0 or 1
    ...
}
```

- `getConnectedTrain(0)` → この車両の**前側**に連結されている車両（`null`なら前は非連結）
- `getConnectedTrain(1)` → この車両の**後側**に連結されている車両（`null`なら後は非連結）

内部で編成内のこの車両の向き（`entry.dir`）に応じて探索方向を反転させているため、**編成が逆向きに連結されていても常にこの車両自身の物理的な前後で正しく返る**。

```js
// 使用例: 連結器の描画切替(RenderOhmi220.js)
if (entity.getConnectedTrain(0) != null) {
    // 前が連結されている → 連結器を隣接車両のボギー角度に合わせて描画
    var bogieF = entity.getBogie(0);
    ayF = bogieF.rotationYaw - entity.rotationYaw;
}

// 編成の先頭/最後尾車両を判定したい場合
var isHeadOfFormation = (entity.getConnectedTrain(0) == null); // 前に何も無い＝先頭
var isTailOfFormation  = (entity.getConnectedTrain(1) == null); // 後に何も無い＝最後尾
```

`st[10]`（運転台の前後位置）とは別軸の情報であり、組み合わせることで「先頭運転台車で、かつ前方が非連結（＝本当の編成最前部）」といった判定も可能。

### vehicle state (st[]) の主要インデックス（`TrainStateType`）

| index | 意味 | 備考 |
|---|---|---|
| 0 | State_TrainDir | 列車の走行方向(0/1) |
| 1 | State_Notch | ノッチ |
| 2 | State_Signal | 信号 |
| 4 | State_Door | ドア開閉状態(0=閉,1=右開,2=左開,3=両開) |
| 5 | State_Light | 前照灯状態 |
| 6 | State_Pantograph | パンタグラフ状態 |
| 8 | State_Destination | 行先幕番号 |
| 9 | State_Announcement | 種別/放送番号 |
| 10 | **State_Direction** | **この車両の運転台位置** (0=前に運転台, 1=運転台なし, 2=後に運転台) |
| 11 | State_InteriorLight | 室内灯状態 |

**st[10] (State_Direction) が「1両単位で前後どちらに運転台があるか」を判定する決定的な値。** `isControlCar()`は`st[10]==0 || st[10]==2`の判定のみで、前後の区別は`st[10]`を直接見る必要がある。

先頭車判定（走行方向を考慮）:
```js
var isLeadCar =
    (st[0] == 0 && st[10] == 0) ||  // 通常方向で前運転台
    (st[0] == 1 && st[10] == 2);    // 逆方向で後運転台
```

---

## 7. ワンマン運転（1両目のみ乗降）実装

無人駅では1両目（`isControlCar()`が真の車両）のみドア扱いを許可し、有人駅では全車両で扱う、という要件は以下のロジックで実装:

```js
var isUnmannedStation = (Math.floor(cb[11]) == 1); // カスタムボタンで駅種別を選択
var isFirstCar = entity.isControlCar();
var doorLocked = isUnmannedStation && !isFirstCar;
```

`doorLocked` が真の場合、そのドアのdoorMove計算をすべて0に固定し、ActionPartsの右クリック判定・ホバー輪郭表示も無効化する。

---

## 8. 半自動ドアボタンの3種類実装

ホームの「外側開けるボタン」「内側開けるボタン」「内側閉めるボタン」をそれぞれ独立したActionPartsとして実装。

| ボタン | モデルオブジェクト名例 | 動作 |
|---|---|---|
| 外側開けるボタン | `btn_out_LF`等 | DataMapのドア開許可を 0↔1 トグル |
| 内側開けるボタン | `btn_in_o_LF`等 | 同上（外側と同じキーを共有） |
| 内側閉めるボタン | `btn_in_c_LF`等 | DataMapのドア開許可を **常に0に強制** |

開けるボタンは「現在状態に関わらずトグル」、閉めるボタンは「現在状態に関わらず強制0」という非対称の実装がポイント。

---

## 9. TIMS（列車情報管理システム表示）の仕組み

参考実装: `render_tora_E231K-h.js`（TJRET2パック）

### 描画方式の特徴

TIMSパネルはモデル(.mqo)のパーツではなく、**`tessellator`で直接ポリゴンを描画し、テクスチャ上の固定UV座標を割り当てる**手法で実装されている。

```js
tessellator.startDrawingQuads();
tessellator.addVertexWithUV(x, y, z, u, v); // 4頂点で1枚の板を構成
tessellator.draw();
```

### 発光テクスチャの自動命名規則

JSONで `["tex_light", "map_l.png", "Light AlphaBlend"]` のように**テクスチャ名を1つだけ**指定した場合、pass=2/3/4 (LIGHT/LIGHT_FRONT/LIGHT_BACK) 用の3枚は以下の規則で自動的に探索される（`TextureSet.java`）:

```
map_l_light0.png  ← pass 2 (LIGHT)
map_l_light1.png  ← pass 3 (LIGHT_FRONT)
map_l_light2.png  ← pass 4 (LIGHT_BACK)
```

**TIMSの実グラフィック（数字・編成アイコン・矢印等）は `_light1.png` / `_light2.png` 側に描かれていた**（`_light0.png`は小さいランプ表示のみ）。テクスチャを探す際は「本体のテクスチャ(`tex`)」ではなく「発光テクスチャの`_light1`/`_light2`」を確認する必要がある。

### `updateTIMS()` — データ収集（17tick毎に間引き）

```js
if ((time % 17) == 0) {
    var formation = entity.getFormation();
    for (var i = 0; i < formation.size(); ++i) {
        var entry = formation.entries[i];
        var name = entry.train.getModelName();
        // モデル名の部分文字列一致で車種コードを割り当て(1=先頭運転台,6=後尾運転台,2〜5=中間車種別)
    }
    renderer.setData(entityID << FormationID, array);
}
```

- 編成走査は重い処理なので17tickに1回だけ実行し、結果を`renderer.setData`でキャッシュする。
- 車種の判定は**モデル名文字列の部分一致**というシンプルな方式（"h"=運転台付き、"nd"系=付随車）。

### 力行/ブレーキ表示の閾値判定（チラつき防止）

```js
if (notch == 0 || (notch < 0 && speed < 5.0)) {
    ticksUnitOn = (ticksUnitOn > 0) ? 0 : ticksUnitOn - 1;
} else {
    ticksUnitOn = (ticksUnitOn < 0) ? 0 : ticksUnitOn + 1;
}
var unitOn = (ticksUnitOn > 120) || (ticksUnitOn < -120);
```

三角波的なカウンタを使い、**一定時間(120tick=6秒)状態が継続したときだけ**表示を切り替える。これにより短時間のノッチ操作でパネル表示がチラつかない。

### 数字描画の共通パターン（速度・時刻表示）

```js
var fx = 0.003 + (0.0117 * digit); // digit(0-9)ごとにU座標を等間隔でずらす
tessellator.addVertexWithUV(x, y, z, fx, v);
```

テクスチャに0〜9の数字を等間隔で並べておき、桁の数値でUオフセットを切り替えるだけの仕組み。桁数分（1の位・10の位・100の位）繰り返して多桁数値を表示する。

---

## 10. 計器類・可動部の実装パターン一覧

| 部位 | 動かし方 | 入力値 | 備考 |
|---|---|---|---|
| マスコン | `glRotatef`（X軸回転） | `notch` | 回転軸位置に`glTranslatef`→回転→Pop |
| ブレーキてこ | **UVシフト**（メッシュ回転なし） | `notch` | tessellatorで板ポリゴンのUのみ動かす |
| 速度計針 | `glRotatef`（Z軸回転） | `entity.getSpeed()` | 線形マッピング（速度→角度） |
| ブレーキ計針(シリンダ圧) | `glRotatef`（Z軸回転） | `entity.brakeCount` + 自作の遅れ補正カウンタ | 目標値到達後も追加チャージ、緩解時は徐々に減衰 |
| ブレーキ計針(管圧) | `glRotatef`（Z軸回転） | `entity.brakeAirCount` | 単純な1次式 |
| ワイパー | `glRotatef`（Z軸+X軸チルト） | 天候(`isRaining`) + tick三角波 | 0→23→折返し→0 の往復運動、雨が止んでも角度0まで動作継続 |
| 各種インジケーターランプ | Partsのrender()呼出/不呼出の二値切替 | 各種状態値 | メッシュ自体は静止、表示ON/OFFのみ |
| ATS動作灯（点滅） | 二値切替 + `time % 18` 判定 | `signal`, `notch`, `time` | 走行中と停止時で点滅パターンを反転 |

### ブレーキシリンダ圧の遅れ補正（実車挙動の再現）

```js
var targetBrakeCount = (notch < 0 ? notch * -18 : 0) * 3;
var minEBrakeCount = targetBrakeCount * 0.25;

if ((targetBrakeCount - EBrakePressure/4.0) > minEBrakeCount && notch != -8 && speed > 5.0) {
    if (brkb == targetBrakeCount) EBrakePressure += 2; // 目標到達後も追加チャージ
} else {
    if (EBrakePressure > 0) EBrakePressure--;           // それ以外は徐々に減衰
}
brkb = brkb - EBrakePressure / 4.0;
```

生の`entity.brakeCount`値をそのまま針に使うのではなく、`renderer.getData/setData`で保持した補正カウンタを加減算することで、実車ブレーキの過渡応答（緩め時の残圧感など）を表現している。

---

## 11. 実装時の注意点まとめ

- **バージョン分岐が必須**: `MCVersionChecker()`で`RTMCore.VERSION`を判定し、1.7.10〜1.9.4系は`getTrainStateData(id)`、1.10.2/1.12.2/KaizPatch系は`getVehicleState(TrainState.getStateType(id))`を使う。
- **カスタムボタンはKaizPatch/1.10.2/1.12.2限定**: 古いバージョンでは`getResourceState().getDataMap()`が使えないため`cb[j]=0`にフォールバックする。
- **ActionPartsは3つのpassすべてで`render()`を呼ぶ**: 通常描画(0)・ホバー輪郭(LIGHT=2)・右クリック判定(PICK=255)。1つでも欠けると機能しない。
- **DataMapのSYNC_FLAGを忘れない**: サーバー経由で同期しないと他クライアントの表示がズレる。
- **entity=null時のフォールバック処理を必ず書く**: モデルプレビュー等で`entity`が渡らないケースがあるため、`entity == null`分岐で安全にrenderできるようにする。

---

## 12. スクリプト未対応車両のスクリプト化（hi03式「スクリプト対応化スクリプト」）

json設定のみでスクリプトを持たない車両に、jsonの動作設定（ドア・パンタ・走行音）を引き継いだまま
render/sound/serverスクリプトを後付けするための雛形（作者: hi03, ver.α1.0）。

⚠️ **自分で作成したモデルパック以外には組み込まないこと**（改造にあたるため無断組み込み不可）。

### 導入方法

対応させたいスクリプトファイル（render.js/sound.js/server.js）をscriptsフォルダ以下にコピーし、
**他と競合しないよう必ずファイル名を変更**する。車両jsonから以下のように参照する。

```json
{
  "trainModel2": {
    "modelFile": "test/test.mqo",
    "textures": [["mat1", "textures/test/test.png", "AlphaBlend,Light"]],
    "rendererPath": "scripts/test/render_test.js"
  },
  "soundScriptPath": "scripts/test/sound_test.js",
  "serverScriptPath": "scripts/test/server_test.js"
}
```

### render.js の仕組み

- `init()`内で`par2.model.getGroupObjects()`を全走査し、**mqo内の全グループオブジェクトを自動的に`Parts`として登録**する（`objList[objName]`）。個別に`registerParts`を書く必要がない。
- json側の`door_left` / `door_right` / `pantograph_front` / `pantograph_back`（config内のドア・パンタ定義）を読み取り、`renderer.getDoorMovementL/R(entity)` や `renderer.getPantographMovementFront/Back(entity)` の可動量をそのまま使って**jsonで定義した開閉・昇降アニメーションを引き継いで自動描画**する（`renderPartsAll` → `renderParts`で`pos`基準に`glTranslatef`/`glRotatef`を適用）。
- 通常は全パーツが自動描画されるが、**手動で描画順序やGL変換を制御したいパーツ**は`excludeList`に名前を追加することで自動描画から除外し、`objList["パーツ名"].render(renderer)`で任意のタイミング・変換を加えて描画できる。

```js
function hi03_init_customDoor(par1, par2) {
    var list = ["doorLF1", "doorLB1", "doorRF1", "doorRB1", "doorDummy"];
    NGTUtil.addArray(excludeList, list); // 自動描画から除外(数が少なければexcludeList.push()でも可)
}

function hi03_render_customDoor(entity, pass, par3) {
    GL11.glPushMatrix();
    GL11.glTranslatef(0, 0, moveLF);
    objList["doorLF1"].render(renderer); // 除外したパーツを手動描画
    GL11.glPopMatrix();
}
```

追加する組み込み関数は、テンプレート内の「組み込み関数追加スペース」コメントの間、または
末尾の「コピペスペース」に追記し、`init()`/`render()`本体から呼び出す形にする。

### sound.js の仕組み

- 冒頭の`soundLibPath`に外部SoundLib（例: `scripts/sound_223.js`）のパスを指定すると、
  `eval`でそのSoundLib本体を読み込みつつ`onUpdate(su)`を呼び出す（**改造不可のSoundLibや既存の音声スクリプトを、本体を書き換えずに読み込ませて拡張できる**）。
- `soundLibPath`を空のままにすると、json側の`sound_Acceleration`/`sound_Deceleration`/`sound_D_S`/`sound_S_A`/`sound_Stop`（走行音定義）とノッチ・速度から自動でクロスフェード再生する`sound_playJsonStyle(su)`にフォールバックする。json駆動の走行音を維持しつつ、追加のカスタム音声処理だけを組み込み関数として足せる。

### server.js の仕組み

jsonから引き継ぐ設定が特にないため、`onUpdate(entity, scriptExecuter)`の空テンプレートのみ。組み込み関数はそのまま追記する。

### 開発者向け規約（他スクリプトとの競合防止）

- **dataMapキー名の頭に作者名を付ける**: 例 `dataMap.getBoolean("hi03_tickUpdate")`。他の組み込みスクリプトと共存させる前提のため必須。
- **グローバル関数・変数名の頭にも作者名を付ける**: 例 `hi03_doorMoveDistance = 0.63;`。
- **組み込み用関数は1スコープ（1関数）にまとめる**: 内部で使うヘルパー関数はその関数内にネストして定義し、外部から参照できないようにすることで名前衝突を防ぐ。

```js
// 非推奨: setBooleanがグローバルに漏れて他スクリプトと衝突しうる
function main(){ setBoolean(dataMap, key, value); }
function setBoolean(dataMap, key, value){ /* 実装 */ }

// 推奨: ヘルパーを内部にネストしてスコープを閉じる
function hi03_main(){
  function setBoolean(dataMap, key, value){ /* 実装 */ }
  setBoolean(dataMap, key, value);
}
```

- **MC1.7.10/1.12両対応を意識する**: テンプレート自体は両対応済み。追加関数も可能な限り両対応にする（バージョン分岐の要領は本ドキュメント11節と同様、`RTMCore.VERSION`判定を使う）。

---

## 13. hi03式ATSプラグイン 実装方法まとめ

参照元: https://github.com/hi03s/hi03ATSPlugins

このセクションは、hi03式ATSプラグイン(hi03_ATS_Plugins_v1.0)を本パックの車両スクリプトに
組み込むための手順・仕様をまとめたものです。実際に組み込む際は下記の注意事項を必ず確認してください。

なお13.3〜13.8節はGitHub公開docs（v1.0系）を元にした一般解説。13.9節ではDC100へのATS-P・Ps実装を
想定し、実際に入手した`hi03_ATS_Plugins_v1.1`（配布zip内は既にv1.1に更新済み）と地上子zip、
音声素材を直接確認した上で、より具体的な手順・v1.1新機能を記載している。

📁 入手済みのソースコード一式（車両組み込みスクリプト.zip、ATS-P/Ps/Sx Transponderの各zip、
音声素材）は `C:\Users\nitta\Desktop\rtm_2026\hi03-ATSplugin` に展開・保管されている。
実装時に内部の関数名・引数・DataMapキー等を直接確認したい場合はここを参照する。

### 13.0 注意事項
- スクリプトやパック構成に関する知識が必要。初心者は非推奨。
- 描画スクリプト・音声スクリプト・サーバースクリプトの3種が事前に導入済みであること。
- 地上子は信号機に対して動作するため、WebCTCやシグナルコントローラー等の**閉塞システムが別途必要**。
- 自分が作者でないパックに組み込む場合は「改造」に該当するため、必ず作者から許諾を取ること。

### 13.1 対応ATS種別
- ATS-P(East) / ATS-P(West) — 東京仕様(東)・西日本仕様(西)相当のATS-P
- ATS-P・Ps — ATS-PsにATS-P機能を統合したもの
- ATS-P・SW — ATS-Pに加えATS-Sx地上子にも反応するもの
- ATS-Ps
- ATS-Sx

### 13.2 入手方法
[Download (Google Drive)](https://drive.google.com/drive/folders/1Ftv9CaXNEGQdwqUMEZRu3wjXR-1p9VOu?usp=sharing)
から「車両組み込みスクリプト.zip」を取得し、解凍する。
描画/音声/サーバースクリプトが未導入のパックは、同梱の「スクリプト化スクリプト」で先に用意しておく。

### 13.3 ファイル配置
解凍した `Train scripts/scripts/hi03_ATS_Plugins_v1.0` フォルダを、
組み込みたいパックの scripts フォルダにそのままコピーする。

```
📁パック/assets/minecraft/scripts/hi03_ATS_Plugins_v1.0
```

---

### 13.4 各ATSの組み込みコード

以下、`XXXX` はATS種別ごとの識別子に置き換える。差分は種別ごとの表を参照。

| ATS種別 | ライブラリ接尾辞 | Stateクラス | 変数名例 | operationATS_関数 | ATS_ID | KeyMap切替キー名 |
|---|---|---|---|---|---|---|
| ATS-P(East) | `ATS_P_East` | `ATS_P_East_State` | `ats_p_east` | `operationATS_P_East` | `"ATS-P_East"` | `switchButton_p_east` |
| ATS-P(West) | `ATS_P_West` | `ATS_P_West_State` | `ats_p_west` | `operationATS_P_West` | `"ATS-P_West"` | `switchButton_p_west` |
| ATS-P/Ps | `ATS_P_Ps` | `ATS_P_Ps_State` | `ats_p_ps` | `operationATS_P_Ps` | `"ATS-P_Ps"` | `switchButton_p_ps` |
| ATS-Ps | `ATS_Ps` | `ATS_Ps_State` | `ats_ps` | `operationATS_Ps` | `"ATS-Ps"` | `switchButton_ps` |
| ATS-Sx | `ATS_Sx` | `ATS_Sx_State` | `ats_sx` | `operationATS_Sx` | `"ATS-Sx"` | `switchButton_sx` |

#### 13.4.1 描画スクリプト

ファイル先頭:
```javascript
//include <scripts/hi03_ATS_Plugins_v1.0/lib_ATS_XXXX_Render.js>
importPackage(Packages.org.lwjgl.input);
```

`function init(par1, par2)` 内:
```javascript
var atsOptions = {
  MaxBrakeNotch: -8, //非常ブレーキのノッチ
  KeyMap: {          //キー設定
    optionKey: Keyboard.KEY_LCONTROL, //オプションキー
    atsButton: Keyboard.KEY_SPACE,    //ATS確認ボタン / [オプションキー同時押し]ATS警報持続ボタン
    disableButton: Keyboard.KEY_BACK, //ATS復帰ボタン / [オプションキー同時押し]ブレーキ開放ボタン
    switchButton_off: Keyboard.KEY_0, //[オプションキー同時押し]ATS:OFFボタン (0推奨)
    switchButton_XXXX: Keyboard.KEY_1 //[オプションキー同時押し]ATS切換ボタン (1～9推奨、上表の名前で)
  }
}

ats_XXXX = new ATS_XXXX_State(atsOptions);
```
※複数のATSを同時搭載する場合はこのブロックをATS種別ごとに追加し、`atsOptions`・変数名は種別ごとに用意する。

`function render(entity, pass, par3)` 内:
```javascript
ats_XXXX.onUpdate(entity, pass);
```

#### 13.4.2 音声スクリプト

ファイル先頭:
```javascript
//include <scripts/hi03_ATS_Plugins_v1.0/lib_ATS_XXXX_Sound.js>
```

`function onUpdate(su)` 内(音声名は任意のものに差し替え可):
```javascript
var atsSounds = {
  soundList: {
    // ATS-Sx系
    pushButton1: "sound_xxx:pushButton",  //ATS確認ボタン押下
    pushButton2: "sound_xxx:pushButton",  //ATS警報持続ボタン押下
    // ATS-Ps系(ATS-Ps / ATS-P・Ps使用時)
    patternPsStart: "sound_xxx:patternStart",
    patternPsEnd: "sound_xxx:patternEnd",
    patternPsApproachingOn: "sound_xxx:psChime1",
    patternPsApproachingOff: "sound_xxx:psChime1",
    patternPsOver: "sound_xxx:psChime1",
    // ATS-P系(ATS-P(East/West) / ATS-P・Ps / ATS-P・SW使用時)
    patternPApproachingOn: "sound_xxx:bell1",
    patternPApproachingOff: "sound_xxx:bell1",
    patternPOver: "sound_xxx:bell1",
    initialize: "sound_xxx:bell1",
    atsPActivate: "sound_xxx:bell1",
    switchToWest: "sound_xxx:bell1",
    switchToEast: "sound_xxx:bell1"
  },
  loopSoundList: {
    atsBrakeDirect: "sound_xxx:bell2",
    atsBrakeLong: "sound_xxx:bell2",
    alert1: "sound_xxx:bell2",
    alert2: "sound_xxx:bell3",
    // ATS-Ps系
    atsPsBrakeDirect: "sound_xxx:bell2",
    atsPsBrakePattern: "sound_xxx:bell2",
    atsPsBrakeLong: "sound_xxx:bell2",
    atsPsBrakeRollback: "sound_xxx:bell2",
    // ATS-P系
    atsPBrake: "sound_xxx:ATSPAnnounce"
  }
}

operationATS_XXXX(su, atsSounds);
```
※各ATS種別で使う音声キーは上表を参照し、不要なキーは省いてよい(詳細は元リポジトリの `docs/Install_ATS-*.md` 参照)。

#### 13.4.3 サーバースクリプト

ファイル先頭:
```javascript
//include <scripts/hi03_ATS_Plugins_v1.0/lib_ATSSelector_Server.js>
//include <scripts/hi03_ATS_Plugins_v1.0/lib_ATS_XXXX_Server.js>
```

`function onUpdate(entity, scriptExecuter)` 内:
```javascript
var atsOptions = {
  MaxBrakeNotch: -8,       //非常ブレーキのノッチ
  BrakeDeceleration: -2.5, //ブレーキパターン減速度[km/h/s] (ATS-P, ATS-P/Ps, ATS-P・SW用)
  MaxSpeed: 130,           //車両の最高速度[km/h] (同上)
  IsOldType: false         //古い車両(115系・211系等)向けATS切替タイプ (ATS-P, ATS-P・SW用のみ)
};
var operationATSList = [
  operationATS_XXXX //使用するATS種別分だけ追加
]
var atsButtonList = {
  //"ボタン表示名(カスタムボタン用)": ATS_ID
  "ATS-P(East)": "ATS-P_East" //上表のATS_IDを使用。表示名は任意
}
atsSelector(entity, atsButtonList, operationATSList, atsOptions);
```
※`atsButtonList` と `operationATSList` に複数のATSをまとめて登録すれば、1両で複数のATSを搭載できる。

#### 13.4.4 カスタムボタン(車両json)

`"ATS:OFF"` は必ず配列の先頭に置く:
```json
{
  "customButtons": [
    ["ATS:OFF", "ATS-P(East)"],
    ["ATS:AutoCheck", "ATS:Manual"]
  ]
}
```

複数ATS搭載時の例:
```json
{
  "customButtons": [
    ["ATS:OFF", "ATS-P(East)", "ATS-P(West)", "ATS-Sx"],
    ["ATS:AutoCheck", "ATS:Manual"]
  ]
}
```

---

### 13.5 開発者向け: DataMapキー一覧

ATSの状態はすべて `dataMap` (entityのDataMap) 経由で取得・操作できる。
キー名の接頭辞はATS_ID(上表参照。例: `ATS-P_East`, `ATS-Ps`, `ATS-Sx`)。

代表的な取得例:
```javascript
dataMap.getBoolean("ATS-Sx_isATSBrake");        //ATSブレーキ:直下地上子
dataMap.getBoolean("ATS-Sx_isATSLongBrake");    //ATSブレーキ:ロング(Sx)未確認
dataMap.getBoolean("ATS-Sx_isLongAlert");       //ATS警報ベル(ジリジリ)
dataMap.getBoolean("ATS-Sx_isLongAlertLatched");//ATS警報持続(キンコン)
dataMap.getBoolean("ATS-Sx_isAtsFault");        //ATS故障
dataMap.getBoolean("ATS-Sx_isATSBrakeDisable"); //ブレーキ開放
dataMap.getBoolean("ATS-Sx_isInitialize");      //ATS初期化中

// ATS-Ps系で追加
dataMap.getBoolean("ATS-Ps_hasPattern");        //パターン発生
dataMap.getBoolean("ATS-Ps_patternAlert");      //パターン接近
dataMap.getDouble ("ATS-Ps_patternSpeed");      //パターン速度
dataMap.getBoolean("ATS-Ps_isRollbackBrake");   //後退検知
dataMap.getInt    ("ATS-Ps_maxSpeed");          //列車選択スイッチ速度/最高速度

// ATS-P系で追加
dataMap.getBoolean("ATS-P_East_isActiveATSP");    //ATS-P有効化
dataMap.getBoolean("ATS-P_East_isATSPBrake");     //ATS-P非常ブレーキ(直下地上子)
dataMap.getBoolean("ATS-P_East_isPatternBrake");  //ATS-P常用ブレーキ:パターン抵触
dataMap.getString ("ATS-P_East_ATSPMode");        //ATS-Pモード ("East"/"West")
```
(接頭辞を `ATS-P_West` / `ATS-P_Ps` に置き換えれば各種別に対応。詳細キーは元リポジトリの
`docs/Install_ATS-*.md` の「開発者向け情報」節を参照)

ボタン押下・復帰の外部操作例:
```javascript
dataMap.setBoolean("ATS-Sx_acknowledgeAlert", isKeyDown1, 1);       //ATS確認ボタン
dataMap.setBoolean("ATS-Sx_pushAlertButton", isKeyDown2, 1);        //ATS警報持続ボタン
dataMap.setBoolean("ATS-Sx_pushBrakeDisableButton", isKeyDown3, 1); //ブレーキ開放ボタン

// ATS復帰ボタン相当(該当するブレーキ系フラグをすべてfalseに)
if (isKeyDown4) {
  dataMap.setBoolean("ATS-Sx_isATSBrake", false, 1);
  dataMap.setBoolean("ATS-Sx_isATSLongBrake", false, 1);
}
```

---

### 13.6 ATS種別ごとの挙動・操作・地上子設置

#### 互換性(地上子とATSプラグインの組み合わせ)
|        |ATS-Sx地上子|ATS-Ps地上子|ATS-P地上子|
|---|---|---|---|
|ATS-P/Ps|○※1|○※2|○|
|ATS-P/SW|○   |×※3|○|
|ATS-P   |○※1|×※4|○|
|ATS-Ps  |○   |○   |×|
|ATS-Sx  |○   |×※3|×|

※1 ATS-Pモード中はATS-Sx地上子に反応しない。
※2 ATS-Pモード中はATS-Ps地上子に反応しない。
※3 ロング地上子/直下地上子のみ反応。
※4 ATS-Pモード未有効時、ロング地上子/直下地上子のみ反応。

#### 共通操作
- カスタムボタンからATS種別を切り替え
- ブレーキノッチ+スペースキー: ロング警報(ジリジリ)を確認
- CTRL+スペースキー: ATS警報持続(キンコン)を解除
- 非常ブレーキ+Backspaceキー: ATS非常ブレーキを解除
- CTRL+Backspaceキー: ATS開放

#### ATS-Sx
- 前方信号が停止現示: ロング地上子で警報→5秒以内未確認だと非常ブレーキ、直下地上子は即時非常ブレーキ
- 速度制限地上子: 制限超過で非常ブレーキ
- 地上子直下のコマンドブロックに以下を設定:
```javascript
// 直下/ロング/パターン/誤出発防止地上子
{ "signal": [[x,y,z], ...], "branchPos": [x,y,z], "dir": true }
// 速度制限地上子
{ "speed": speed }
// 分岐制限地上子
{ "speed": speed, "branchPos": [x,y,z], "dir": true }
// 誤出発防止タイマー起動地上子
{ "time": time }
```

#### ATS-Ps
- ロング地上子で警報→5秒以内未確認だと非常ブレーキ
- パターン地上子でパターン生成、超過で非常ブレーキ。直下地上子は即時非常ブレーキ
- 信号アップ時: 第二パターン地上子/直下地上子でパターン消去
- 速度制限地上子: 制限パターン生成
```javascript
// 直下/ロング/パターン/誤出発防止/誘導パターン/入換パターン地上子
{ "signal": [[x,y,z], ...], "speed": speed, "distance": distance, "branchPos": [x,y,z], "dir": true }
// 誤出発防止タイマー起動地上子
{ "time": time }
// 分岐制限地上子
{ "speed": speed, "branchPos": [x,y,z], "dir": true, "signal": [[x,y,z], ...], "distance": distance, "limitLength": length }
// 速度制限地上子
{ "speed": speed, "distance": distance }
// 速度制限解除地上子: 空のコマンドブロック
```

#### ATS-P
- 前方信号が停止現示: パターン地上子でパターン生成、超過で非常ブレーキ
- 信号アップ時: パターン地上子/直下地上子でパターン消去
- 速度制限地上子: 制限パターン生成、超過で常用最大ブレーキ(下回れば緩解)
```javascript
// 直下/パターン/パターン取消地上子
{ "id": id, "signal": [[x,y,z], ...], "distance": distance, "branchPos": [x,y,z], "dir": true }
// 誘導パターン/入換パターン地上子
{ "signal": [[x,y,z], ...] }
// 分岐制限地上子
{ "id": id, "speed": speed, "branchPos": [x,y,z], "dir": true, "distance": distance }
// 速度制限地上子
{ "id": id, "speed": speed, "length": length, "distance": distance }
// 速度制限解除地上子
{ "id": id }
// ATS-P終了地上子 / ATS-P切替地上子(東⇔西): 空のコマンドブロック
```

#### ATS-P・SW
ATS-P機能を有効にしつつATS-Sx地上子にも反応。動作はATS-P、ATS-Sxに準拠。
設置基準もATS-P/ATS-Sxに準拠するが、パターン地上子(600m)とロング地上子の設置位置が
重なるため、ロング地上子を3～5m手前(外方)にずらして設置する。

#### ATS-P・Ps
ATS-PsにATS-P機能を追加。ATS-P有効時はATS-Pに、無効時はATS-Psの動作に準拠。
ATS-P区間はATS-Pの設置基準、ATS-Ps/Sx区間はATS-Ps/Sxの設置基準に準拠して設置する。

---

### 13.7 地上子(トランスポンダ)モデル本体の導入

リポジトリ内の以下のアセットをそのまま(または参考に)導入する。信号機と連動する
コマンドブロックとセットで機能するため、閉塞システム側の信号機座標指定が必須。

- `hi03 ATS-P Transponder/` — ATS-P用地上子モデル・テクスチャ・json一式
- `hi03 ATS-Ps Transponder/` — ATS-Ps用地上子モデル・テクスチャ・json一式
- `hi03 ATS-Sx Transponder/` — ATS-Sx用地上子モデル・テクスチャ・json一式

各フォルダの `assets/minecraft/scripts/hi03_ats_*/server_ATS_Beacon.js` が地上子の
コマンドブロック連動処理、`render_ATS_Beacon.js` が地上子モデルの描画処理を担う。
`json/ModelMachine_*.json` が地上子ごとの設置用アイテム定義。

### 13.8 RTM対応バージョン
- MC1.7.10: RTM1.7.10.4x〜(動作未確認) / KaizPatchX-1.9.6〜
- MC1.12: RTM2.4.24〜(動作未確認) / fixRTM-2.0.28〜(動作未確認)

---

### 13.9 DC100へのATS-P・Ps実装ガイド（v1.1・実ファイル確認済み）

DC100(`org_DC100`)に**ATS-P・Ps**（ATS-PsをベースにATS-P機能を統合したタイプ）を実装する前提の、
より具体的な手順。手元に入手した以下の実ファイルを直接確認して書いている。

- `車両組み込みスクリプト.zip` → 中身は `scripts/hi03_ATS_Plugins_v1.1/`（**フォルダ名がv1.1に更新されている**。13.3〜13.8節はv1.0系のGitHub公開docsを元にした一般情報なので、ライブラリのバージョン表記だけ以下に合わせて読み替えること）
- `hi03 ATS-P Transponder.zip` / `hi03 ATS-Ps Transponder.zip` / `hi03 ATS-Sx Transponder.zip`（地上子本体。中身は13.7節記載の構成と同一）
- `音声素材/`（ATSPAnnounce, bell1〜5, patternEnd, patternStart, psChime1〜2, pushButton の.ogg。旧docsのサンプルにはbell1〜3/psChime1のみ登場していたが、実際にはbell4・bell5・psChime2も同梱されている＝将来の音声差し替え用に確保されている）

#### 13.9.1 ファイル配置（DC100の実パスに合わせる）

```
SakuraRailwayPack/
  assets/minecraft/scripts/
    hi03_ATS_Plugins_v1.1/              ← zipの中身をそのままコピー
      lib_ATSSelector_Server.js
      lib_ATS_P_Ps_Render.js
      lib_ATS_P_Ps_Server.js
      lib_ATS_P_Ps_Sound.js
      （East/West/Ps/Sx の各libも同梱されるが、DC100はP・Psのみ使うなら未使用でも削除しなくてよい）
    Render_script_dc100_sa.js           ← 既存(Tc車)。ATS組み込み対象
    Render_script_dc100_oneman_sa.js    ← 既存(cMc車・ワンマン)。同上
    Render_script_dc100_semiauto_sa.js  ← 既存(cMc車・半自動)。同上
    Sound_script_dc100_sa.js            ← 新規作成が必要(後述7-4)
    Server_script_dc100_sa.js           ← 新規作成が必要(後述7-5)
  assets/sound_dc100_sa/
    sounds.json                         ← ATS用エントリを追記(後述7-3)
    sounds/train/ats/
      ATSPAnnounce.ogg, bell1.ogg, bell2.ogg, bell3.ogg,
      patternStart.ogg, patternEnd.ogg, psChime1.ogg, pushButton.ogg
      （音声素材フォルダからコピー。bell4/5, psChime2は今回未使用なら省略可）
```

#### 13.9.2 車両jsonへの追記（3ファイル共通）

`mods/RTM/train/ModelTrain_org_DC100_n1_Tc.json` / `..._n2_cMc.json` / `..._n2_cMc_semiauto.json` の3つに対して:

```json
{
  "soundScriptPath": "scripts/Sound_script_dc100_sa.js",
  "serverScriptPath": "scripts/Server_script_dc100_sa.js",

  "customButtons": [
    ["Light_On","Light_Switching","Light_Off"],
    ["ExLight_Auto","ExLight_On","ExLight_Off"],
    ["Undefined"],
    ["TopDoor_Close","TopDoor_Open"],
    ["Door_Enabled","Door_Disabled"],
    ["Undefined"],

    ["ATS:OFF", "ATS-P/Ps"],
    ["ATS:AutoCheck", "ATS:Manual"]
  ]
}
```

- 既存の`soundScriptPath`は`"scripts/sound_223.js"`（本パックに同梱されていない外部ファイル）だったが、
  ATS音を追加するには自前のスクリプトが必要になるため、12節の「スクリプト対応化スクリプト」の手法で
  `sound_223.js`を`soundLibPath`として読み込みつつ拡張する（13.9.4節参照）。
- `serverScriptPath`はDC100の現状のjsonに未設定なので新規追加になる。
- `"ATS:OFF"`は必ずATS切替用配列の先頭に置く（13.4.4節のルール通り）。
- `"ATS:AutoCheck"`を含むボタン配列を用意すると、v1.1の自動運転支援機能（13.9.7節）が有効になる。

#### 13.9.3 音声素材の追加（sounds.json）

`assets/sound_dc100_sa/sounds.json` に以下を追記（既存の`rtm_mcth_*`エントリはそのまま残す）:

```json
{
  "ats.ATSPAnnounce": { "category": "neutral", "sounds": ["train/ats/ATSPAnnounce"] },
  "ats.bell1":         { "category": "neutral", "sounds": ["train/ats/bell1"] },
  "ats.bell2":         { "category": "neutral", "sounds": ["train/ats/bell2"] },
  "ats.bell3":         { "category": "neutral", "sounds": ["train/ats/bell3"] },
  "ats.patternStart":  { "category": "neutral", "sounds": ["train/ats/patternStart"] },
  "ats.patternEnd":    { "category": "neutral", "sounds": ["train/ats/patternEnd"] },
  "ats.psChime1":      { "category": "neutral", "sounds": ["train/ats/psChime1"] },
  "ats.pushButton":    { "category": "neutral", "sounds": ["train/ats/pushButton"] }
}
```

音声スクリプト側では `"sound_dc100_sa:ats.bell1"` のように `ドメイン名:サウンド名` 形式で参照する。

#### 13.9.4 音声スクリプト新規作成（`Sound_script_dc100_sa.js`）

DC100は現状カスタム音声スクリプトを持たないため、12節の雛形をベースに
「既存のsound_223.js(走行音)を読み込みつつ、ATS-P・Psの音声処理を追加する」形で新規作成する。

```javascript
//SoundLib(既存の走行音スクリプト)をそのまま読み込む
var soundLibPath = "scripts/sound_223.js";

importPackage(Packages.jp.ngt.rtm.modelpack);
importPackage(Packages.jp.ngt.ngtlib.io);
importPackage(Packages.jp.ngt.ngtlib.util);
importPackage(Packages.jp.ngt.rtm.sound);

//include <scripts/hi03_ATS_Plugins_v1.1/lib_ATS_P_Ps_Sound.js>

function onUpdate(su) {
    //ATS-P・Ps 音声処理
    var atsSounds = {
        soundList: {
            pushButton1: "sound_dc100_sa:ats.pushButton",
            pushButton2: "sound_dc100_sa:ats.pushButton",
            patternPsStart: "sound_dc100_sa:ats.patternStart",
            patternPsEnd: "sound_dc100_sa:ats.patternEnd",
            patternPsApproachingOn: "sound_dc100_sa:ats.psChime1",
            patternPsApproachingOff: "sound_dc100_sa:ats.psChime1",
            patternPsOver: "sound_dc100_sa:ats.psChime1",
            patternPApproachingOn: "sound_dc100_sa:ats.bell1",
            patternPApproachingOff: "sound_dc100_sa:ats.bell1",
            patternPOver: "sound_dc100_sa:ats.bell1",
            initialize: "sound_dc100_sa:ats.bell1",
            atsPActivate: "sound_dc100_sa:ats.bell1",
            switchToWest: "sound_dc100_sa:ats.bell1",
            switchToEast: "sound_dc100_sa:ats.bell1"
        },
        loopSoundList: {
            atsPsBrakeDirect: "sound_dc100_sa:ats.bell2",
            atsPsBrakePattern: "sound_dc100_sa:ats.bell2",
            atsPsBrakeLong: "sound_dc100_sa:ats.bell2",
            atsPsBrakeRollback: "sound_dc100_sa:ats.bell2",
            atsPBrake: "sound_dc100_sa:ats.ATSPAnnounce",
            alert1: "sound_dc100_sa:ats.bell2",
            alert2: "sound_dc100_sa:ats.bell3"
        }
    };
    operationATS_P_Ps(su, atsSounds);

    //既存の走行音(sound_223.js)を継続再生
    if (soundLibPath !== "") sound_includeSoundLib(su);
}

//以下、12節「スクリプト対応化スクリプト」テンプレートのsoundLibPath読み込み部をそのまま流用
var soundLibFunction = (function includeScripts() {
    var append = function (list) {
        var sb = new java.lang.StringBuilder();
        for (var i = 0; i < list.size(); i++) { sb.append(list.get(i) + "\n"); }
        return sb.toString();
    }
    return append(NGTText.readText(ModelPackManager.INSTANCE.getResource(soundLibPath)));
})();
function sound_includeSoundLib(su) {
    eval(soundLibFunction);
    onUpdate(su); //sound_223.js側のonUpdateを呼び出す(名前が衝突するため注意。詳細は12節参照)
}
```

⚠️ `sound_includeSoundLib`は内部で`onUpdate`を再定義・呼び出す構造のため、**この関数自体を`onUpdate`本体の最後に呼ぶと無限再帰する**。実際に組み込む際は、12節の元テンプレート通り「ATS処理だけを先に行い、走行音再生は`eval`後の`onUpdate`呼び出しに一本化する」構成を崩さないよう注意すること（`operationATS_P_Ps`呼び出しをeval前、sound_223.js側のonUpdate呼び出しをeval後、に分離するのが安全）。

#### 13.9.5 サーバースクリプト新規作成（`Server_script_dc100_sa.js`）

```javascript
//include <scripts/hi03_ATS_Plugins_v1.1/lib_ATSSelector_Server.js>
//include <scripts/hi03_ATS_Plugins_v1.1/lib_ATS_P_Ps_Server.js>

function onUpdate(entity, scriptExecuter) {
    var atsOptions = {
        MaxBrakeNotch: -8,
        BrakeDeceleration: -2.5, //ブレーキパターン減速度[km/h/s]
        MaxSpeed: 100,           //DC100の最高速度[km/h]に合わせて調整
        IsOldType: false
    };
    var operationATSList = [
        operationATS_P_Ps
    ];
    var atsButtonList = {
        "ATS-P/Ps": "ATS-P_Ps"
    };
    atsSelector(entity, atsButtonList, operationATSList, atsOptions);
}
```

`MaxSpeed`はDC100のjson内`maxSpeed`(現状 `[0.40, 0.84, 1.08, 1.39, 1.60]`、単位はゲーム内速度)とは
**別系統の値（km/h）**なので、実車の性能表に基づいて別途設定する。

#### 13.9.6 描画スクリプトへの追記（Render_script_dc100_sa.js 他2ファイル共通）

ファイル冒頭（`importPackage`群のあと）に追加:
```javascript
//include <scripts/hi03_ATS_Plugins_v1.1/lib_ATS_P_Ps_Render.js>
importPackage(Packages.org.lwjgl.input);
```

`function init(par1, par2)` の中（既存の`body = renderer.registerParts(...)`等のパーツ登録処理の後ろに追加）:
```javascript
var atsOptions = {
    MaxBrakeNotch: -8,
    KeyMap: {
        optionKey: Keyboard.KEY_LCONTROL,
        atsButton: Keyboard.KEY_SPACE,
        disableButton: Keyboard.KEY_BACK,
        switchButton_off: Keyboard.KEY_0,
        switchButton_p_ps: Keyboard.KEY_1
    }
};
ats_p_ps = new ATS_P_Ps_State(atsOptions);
```

`function render(entity, pass, par3)` の中（既存の`render_panta`/`render_light`/`render_body`呼び出しと並べて追加）:
```javascript
ats_p_ps.onUpdate(entity, pass);
```

#### 13.9.7 v1.1で追加されていた新機能（GitHub公開docsには未記載）

zipの実ファイルを読むと、GitHub上の`docs/Install_ATS-*.md`（v1.0相当）には無い以下の機能が
P_East/P_West/P_Ps/Ps（Sxは一部）の各Render libに共通で実装されている。

**① `ATS:AutoCheck`自動化モード**

車両jsonの`customButtons`に`["ATS:AutoCheck", "ATS:Manual"]`を含めておくと、Render側の
`onUpdate`が自動的に以下を代行する（該当カスタムボタンが無い場合は常にマニュアル動作＝13.4節までの説明通り）。

- **ATS確認ボタンの自動押下**: 警報中（`isLongAlert`）にノッチが投入されている状態が続くと、CTRLキーなしでも自動的に確認扱いになる。
- **ATS警報持続ボタンの自動押下**: 警報持続（`isLongAlertLatched`）状態のまま速度0まで減速すると自動解除される。
- **ATS復帰ボタンの自動押下**: 停止していてブレーキノッチが`MaxBrakeNotch`以下、かつ何らかのATSブレーキが掛かっている状態が続くと自動でATS復帰が行われる。

→ DC100を自動運転寄りの操作性にしたい場合は、13.9.2節のcustomButtons例のように`"ATS:AutoCheck"`枠を必ず追加しておくとよい。

**② `getState(entity)` メソッド**

`ats_p_ps.getState(entity)` を呼ぶと、13.5節に列挙した個別`dataMap.getXxx(...)`呼び出しをまとめて
1オブジェクトで取得できる（内部的には同じキーを読んでいるだけだが、TIMS等の他スクリプトから
状態を参照する際はこちらの方が簡潔）。

```javascript
var st = ats_p_ps.getState(entity);
if (st.isPatternApproaching || st.isPatternApproachingPs) {
    // パターン接近灯を点灯 など
}
```

戻り値の主なキー: `isInitialize`, `isLongAlert`, `isLongAlertLatched`, `isAtsFault`, `isBrakeDisable`,
`isAlertButton1Pressed`, `isAlertButton2Pressed`, `isATSBrake`, `isATSLongBrake`, `isRollbackBrake`,
`isPatternBrakePs`, `hasPatternPs`, `isPatternApproachingPs`, `patternSpeedPs`, `isActiveATSP`,
`isATSPBrake`, `isPatternBrake`, `isPatternBrakeFull`, `atspMode`（`"East"`/`"West"`）,
`isPatternApproaching`, `patternSpeed`。

**③ `renderInstalledObjects(entity, pass, x, y, z, yaw)` — 車内ATS表示器の描画**

README記載の「ATS-P/Ps表示器/TIMSモニターを組み込む（準備中）」に対応する実装が
v1.1のRender libにはすでに入っている。DC100のmqoモデル側に以下のオブジェクト名を
用意すれば、運転台に故障灯・パターン照査灯・速度計付きのATS表示器を描画できる。

| モデルオブジェクト名 | 用途 |
|---|---|
| `ATS-Ps_body` | 表示器本体（非発光） |
| `ATS-Ps_meter0` | 速度計の目盛(非発光、80分割で描画される) |
| `ATS-Ps_normal` / `ATS-Ps_pattern` / `ATS-Ps_patternOver` | 通常/パターン接近/パターン抵触の状態表示(発光) |
| `ATS-Ps_longBrake` / `ATS-Ps_directBrake` / `ATS-Ps_rollbackBrake` | ロング/直下/後退検知ブレーキ表示(発光) |
| `ATS-Ps_powerP` / `ATS-Ps_patternP` / `ATS-Ps_patternPs` | 電源灯/ATS-P動作中/ATS-Ps動作中 表示(発光) |
| `ATS-Ps_brake` / `ATS-Ps_disable` | ブレーキ動作中/ブレーキ開放中 表示(発光) |
| `ATS-Ps_failureP` / `ATS-Ps_failurePs` | ATS-P故障/ATS-Ps故障 表示(発光) |
| `ATS-Ps_meter1` / `ATS-Ps_meter2` | 速度計の現在速度針/パターン速度針相当(発光、80分割) |

⚠️ ATS-P・Psクラス(`ATS_P_Ps_State`)であっても内部の`Parts`登録名は`ATS-Ps_xxx`固定
（`ATS-P_Ps_xxx`ではない）。モデル側のオブジェクト名を間違えると描画されないので注意。

呼び出し例（`render()`内）:
```javascript
ats_p_ps.renderInstalledObjects(entity, pass, x, y, z, yaw);
```
表示器自体は組み込み任意（未使用でもATS本体の動作自体には影響しない）。

**meter0/1/2の描画の仕組みと`x,y,z,yaw`の実際の意味（重要・訂正）**

`body`/`normal`/`directBrake`等の状態灯パーツは、`x,y,z,yaw`による変換を一切受けずに
そのまま描画される。つまり**メタセコイア上でモデリングした座標がそのまま最終的な表示位置**になり、
車両ローカル座標系(json内の`playerPos`/`seatPos`/`bogiePos`と同一の原点・軸: X=左右, Y=上下,
Z=前後, 単位m)で他の車体パーツと同じ感覚で配置すればよい。スクリプト側に座標を渡す必要はない。

一方、`meter0`/`meter1`/`meter2`(速度計のバーグラフ)だけは以下のループで1オブジェクトを
80回、位置をずらしながら描画する:
```javascript
for (var i = 0; i < 80; i++) {
    GL11.glPushMatrix();
    GL11.glTranslatef(x, y, z);
    GL11.glRotatef(yaw, 0, 1, 0);
    GL11.glTranslatef(-0.001759 * i, 0, 0);
    GL11.glRotatef(-yaw, 0, 1, 0);
    GL11.glTranslatef(-x, -y, -z);
    this.parts.meter0.render(renderer); // meter1/meter2も同じ変換
    GL11.glPopMatrix();
}
```
この変換を行列展開すると、`T(x,y,z)`と`T(-x,-y,-z)`が数学的に完全に打ち消し合い、
最終的な効果は次の式に単純化される（実際に検証済み）:
```
最終位置 = meter0/1/2のmqo上の座標 + yaw回転した(-0.001759 × i, 0, 0)ベクトル
```
つまり **`x`, `y`, `z`引数は何を渡しても結果に影響しない**（内部で相殺される、実質未使用の引数）。
意味を持つのは`yaw`だけで、これも「80個のティックがどの方向(水平面内、Y軸回りの回転)に
並んでいくか」を決めるだけであり、絶対位置の指定には使われない。

したがって実装時は:
1. `meter0`/`meter1`/`meter2`は「1目盛分」だけをモデリングし、**80個の並びの起点(i=0)の位置**に置く（この位置がそのまま最終表示位置の基準になる）
2. `yaw`は目盛を並べたい方向に合わせて調整する（車両ローカルの-X方向へ並べるなら`yaw=0`。パネルが斜め設置なら実機で見ながら角度を調整）
3. 79個分のコピーは起点から`yaw`方向へ`-0.001759 × i`(i=1〜79、合計スパン約0.139m)ずつ自動でずれて描画される
4. `meter1`/`meter2`は速度としきい値`i × (140/79)`(0〜約140km/h相当)を比較して点灯するので、モデル側の並びの間隔＝速度目盛の間隔と考えてよい
5. `x,y,z`引数は無効化されるため`0,0,0`を渡してよい。実質チューニングが必要なのは`yaw`のみ

⚠️ **表示器の見た目(mqo/テクスチャ)は配布物に一切含まれていない。** 今回入手した4つのzip
（`車両組み込みスクリプト.zip`、ATS-P/Ps/Sx Transponderの各zip）にmqoは地上子(アンテナ)用の
ものしかなく、`ATS-Ps_body`等の表示器パーツは存在しない。スクリプト側は「対応するオブジェクト名の
パーツがあれば描画する」という仕組みを提供しているだけなので、DC100で使う場合は上表のオブジェクト名で
表示器のモデル・テクスチャを**自作してmqoに追加する**必要がある。

#### 13.9.8 地上子の選定（DC100運用時の指針）

13.6節の互換表の通り、ATS-P・Psは**ATS-P地上子・ATS-Ps地上子のどちらにも反応する**
（ATS-Pモード中はATS-Ps地上子を無視）。路線設定に応じて使い分ける:

- 高速新線区間・複雑な分岐がある区間 → `hi03 ATS-P Transponder`（パターン制御が精密）
- 在来線・地方交通線相当の区間 → `hi03 ATS-Ps Transponder`（ロング/パターン/直下の3段式）
- 両方を1路線に混在させても、ATS-P・Ps側は自動でモード追従するため問題ない（13.9.7節②の`atspMode`で東西モードを判定可能）。

地上子本体の導入・設置方法自体は13.7節および13.6節の各ATSごとの解説を参照。
