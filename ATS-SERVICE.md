# hi03式ATSプラグイン 実装方法まとめ

参照元: https://github.com/hi03s/hi03ATSPlugins

このドキュメントは、hi03式ATSプラグイン(hi03_ATS_Plugins_v1.0)を本パックの車両スクリプトに
組み込むための手順・仕様をまとめたものです。実際に組み込む際は下記の注意事項を必ず確認してください。

なお1〜6節はGitHub公開docs（v1.0系）を元にした一般解説。7節ではDC100へのATS-P・Ps実装を
想定し、実際に入手した`hi03_ATS_Plugins_v1.1`（配布zip内は既にv1.1に更新済み）と地上子zip、
音声素材を直接確認した上で、より具体的な手順・v1.1新機能を記載している。

## ⚠️注意
- スクリプトやパック構成に関する知識が必要。初心者は非推奨。
- 描画スクリプト・音声スクリプト・サーバースクリプトの3種が事前に導入済みであること。
- 地上子は信号機に対して動作するため、WebCTCやシグナルコントローラー等の**閉塞システムが別途必要**。
- 自分が作者でないパックに組み込む場合は「改造」に該当するため、必ず作者から許諾を取ること。

## 対応ATS種別
- ATS-P(East) / ATS-P(West) — 東京仕様(東)・西日本仕様(西)相当のATS-P
- ATS-P・Ps — ATS-PsにATS-P機能を統合したもの
- ATS-P・SW — ATS-Pに加えATS-Sx地上子にも反応するもの
- ATS-Ps
- ATS-Sx

## 入手方法
[Download (Google Drive)](https://drive.google.com/drive/folders/1Ftv9CaXNEGQdwqUMEZRu3wjXR-1p9VOu?usp=sharing)
から「車両組み込みスクリプト.zip」を取得し、解凍する。
描画/音声/サーバースクリプトが未導入のパックは、同梱の「スクリプト化スクリプト」で先に用意しておく。

## 1. ファイル配置
解凍した `Train scripts/scripts/hi03_ATS_Plugins_v1.0` フォルダを、
組み込みたいパックの scripts フォルダにそのままコピーする。

```
📁パック/assets/minecraft/scripts/hi03_ATS_Plugins_v1.0
```

---

## 2. 各ATSの組み込みコード

以下、`XXXX` はATS種別ごとの識別子に置き換える。差分は種別ごとの表を参照。

| ATS種別 | ライブラリ接尾辞 | Stateクラス | 変数名例 | operationATS_関数 | ATS_ID | KeyMap切替キー名 |
|---|---|---|---|---|---|---|
| ATS-P(East) | `ATS_P_East` | `ATS_P_East_State` | `ats_p_east` | `operationATS_P_East` | `"ATS-P_East"` | `switchButton_p_east` |
| ATS-P(West) | `ATS_P_West` | `ATS_P_West_State` | `ats_p_west` | `operationATS_P_West` | `"ATS-P_West"` | `switchButton_p_west` |
| ATS-P/Ps | `ATS_P_Ps` | `ATS_P_Ps_State` | `ats_p_ps` | `operationATS_P_Ps` | `"ATS-P_Ps"` | `switchButton_p_ps` |
| ATS-Ps | `ATS_Ps` | `ATS_Ps_State` | `ats_ps` | `operationATS_Ps` | `"ATS-Ps"` | `switchButton_ps` |
| ATS-Sx | `ATS_Sx` | `ATS_Sx_State` | `ats_sx` | `operationATS_Sx` | `"ATS-Sx"` | `switchButton_sx` |

### 2-1. 描画スクリプト

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

### 2-2. 音声スクリプト

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

### 2-3. サーバースクリプト

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

### 2-4. カスタムボタン(車両json)

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

## 3. 開発者向け: DataMapキー一覧

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

## 4. ATS種別ごとの挙動・操作・地上子設置

### 互換性(地上子とATSプラグインの組み合わせ)
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

### 共通操作
- カスタムボタンからATS種別を切り替え
- ブレーキノッチ+スペースキー: ロング警報(ジリジリ)を確認
- CTRL+スペースキー: ATS警報持続(キンコン)を解除
- 非常ブレーキ+Backspaceキー: ATS非常ブレーキを解除
- CTRL+Backspaceキー: ATS開放

### ATS-Sx
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

### ATS-Ps
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

### ATS-P
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

### ATS-P・SW
ATS-P機能を有効にしつつATS-Sx地上子にも反応。動作はATS-P、ATS-Sxに準拠。
設置基準もATS-P/ATS-Sxに準拠するが、パターン地上子(600m)とロング地上子の設置位置が
重なるため、ロング地上子を3～5m手前(外方)にずらして設置する。

### ATS-P・Ps
ATS-PsにATS-P機能を追加。ATS-P有効時はATS-Pに、無効時はATS-Psの動作に準拠。
ATS-P区間はATS-Pの設置基準、ATS-Ps/Sx区間はATS-Ps/Sxの設置基準に準拠して設置する。

---

## 5. 地上子(トランスポンダ)モデル本体の導入

リポジトリ内の以下のアセットをそのまま(または参考に)導入する。信号機と連動する
コマンドブロックとセットで機能するため、閉塞システム側の信号機座標指定が必須。

- `hi03 ATS-P Transponder/` — ATS-P用地上子モデル・テクスチャ・json一式
- `hi03 ATS-Ps Transponder/` — ATS-Ps用地上子モデル・テクスチャ・json一式
- `hi03 ATS-Sx Transponder/` — ATS-Sx用地上子モデル・テクスチャ・json一式

各フォルダの `assets/minecraft/scripts/hi03_ats_*/server_ATS_Beacon.js` が地上子の
コマンドブロック連動処理、`render_ATS_Beacon.js` が地上子モデルの描画処理を担う。
`json/ModelMachine_*.json` が地上子ごとの設置用アイテム定義。

## 6. RTM対応バージョン
- MC1.7.10: RTM1.7.10.4x〜(動作未確認) / KaizPatchX-1.9.6〜
- MC1.12: RTM2.4.24〜(動作未確認) / fixRTM-2.0.28〜(動作未確認)

---

## 7. DC100へのATS-P・Ps実装ガイド（v1.1・実ファイル確認済み）

DC100(`org_DC100`)に**ATS-P・Ps**（ATS-PsをベースにATS-P機能を統合したタイプ）を実装する前提の、
より具体的な手順。手元に入手した以下の実ファイルを直接確認して書いている。

- `車両組み込みスクリプト.zip` → 中身は `scripts/hi03_ATS_Plugins_v1.1/`（**フォルダ名がv1.1に更新されている**。1〜6節はv1.0系のGitHub公開docsを元にした一般情報なので、ライブラリのバージョン表記だけ以下に合わせて読み替えること）
- `hi03 ATS-P Transponder.zip` / `hi03 ATS-Ps Transponder.zip` / `hi03 ATS-Sx Transponder.zip`（地上子本体。中身は5節記載の構成と同一）
- `音声素材/`（ATSPAnnounce, bell1〜5, patternEnd, patternStart, psChime1〜2, pushButton の.ogg。旧docsのサンプルにはbell1〜3/psChime1のみ登場していたが、実際にはbell4・bell5・psChime2も同梱されている＝将来の音声差し替え用に確保されている）

### 7-1. ファイル配置（DC100の実パスに合わせる）

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

### 7-2. 車両jsonへの追記（3ファイル共通）

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
  `sound_223.js`を`soundLibPath`として読み込みつつ拡張する（7-4節参照）。
- `serverScriptPath`はDC100の現状のjsonに未設定なので新規追加になる。
- `"ATS:OFF"`は必ずATS切替用配列の先頭に置く（2-4節のルール通り）。
- `"ATS:AutoCheck"`を含むボタン配列を用意すると、v1.1の自動運転支援機能（7-6節）が有効になる。

### 7-3. 音声素材の追加（sounds.json）

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

### 7-4. 音声スクリプト新規作成（`Sound_script_dc100_sa.js`）

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

### 7-5. サーバースクリプト新規作成（`Server_script_dc100_sa.js`）

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

### 7-6. 描画スクリプトへの追記（Render_script_dc100_sa.js 他2ファイル共通）

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

### 7-7. v1.1で追加されていた新機能（GitHub公開docsには未記載）

zipの実ファイルを読むと、GitHub上の`docs/Install_ATS-*.md`（v1.0相当）には無い以下の機能が
P_East/P_West/P_Ps/Ps（Sxは一部）の各Render libに共通で実装されている。

**① `ATS:AutoCheck`自動化モード**

車両jsonの`customButtons`に`["ATS:AutoCheck", "ATS:Manual"]`を含めておくと、Render側の
`onUpdate`が自動的に以下を代行する（該当カスタムボタンが無い場合は常にマニュアル動作＝5-1節までの説明通り）。

- **ATS確認ボタンの自動押下**: 警報中（`isLongAlert`）にノッチが投入されている状態が続くと、CTRLキーなしでも自動的に確認扱いになる。
- **ATS警報持続ボタンの自動押下**: 警報持続（`isLongAlertLatched`）状態のまま速度0まで減速すると自動解除される。
- **ATS復帰ボタンの自動押下**: 停止していてブレーキノッチが`MaxBrakeNotch`以下、かつ何らかのATSブレーキが掛かっている状態が続くと自動でATS復帰が行われる。

→ DC100を自動運転寄りの操作性にしたい場合は、7-2節のcustomButtons例のように`"ATS:AutoCheck"`枠を必ず追加しておくとよい。

**② `getState(entity)` メソッド**

`ats_p_ps.getState(entity)` を呼ぶと、3節に列挙した個別`dataMap.getXxx(...)`呼び出しをまとめて
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

呼び出し例（`render()`内、`x,y,z,yaw`は表示器を設置したい運転台内のワールド座標・向き）:
```javascript
ats_p_ps.renderInstalledObjects(entity, pass, x, y, z, yaw);
```
表示器自体は組み込み任意（未使用でもATS本体の動作自体には影響しない）。DC100に
実装する場合はmqoへのオブジェクト追加が必要なため、モデル制作側の対応が前提になる。

### 7-8. 地上子の選定（DC100運用時の指針）

4節の互換表の通り、ATS-P・Psは**ATS-P地上子・ATS-Ps地上子のどちらにも反応する**
（ATS-Pモード中はATS-Ps地上子を無視）。路線設定に応じて使い分ける:

- 高速新線区間・複雑な分岐がある区間 → `hi03 ATS-P Transponder`（パターン制御が精密）
- 在来線・地方交通線相当の区間 → `hi03 ATS-Ps Transponder`（ロング/パターン/直下の3段式）
- 両方を1路線に混在させても、ATS-P・Ps側は自動でモード追従するため問題ない（7-7節②の`atspMode`で東西モードを判定可能）。

地上子本体の導入・設置方法自体は5節および4節の各ATSごとの解説を参照。
