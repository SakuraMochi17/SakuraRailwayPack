# RTM レンダースクリプト実装知識まとめ

RealTrainMod (RTM) / KaizPatchX 環境下でのレンダースクリプト（`VehiclePartsRenderer`）実装に関する調査・実装知見のまとめ。

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
