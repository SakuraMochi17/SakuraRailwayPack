# hi03式ATSプラグイン 実装方法まとめ

参照元: https://github.com/hi03s/hi03ATSPlugins

このドキュメントは、hi03式ATSプラグイン(hi03_ATS_Plugins_v1.0)を本パックの車両スクリプトに
組み込むための手順・仕様をまとめたものです。実際に組み込む際は下記の注意事項を必ず確認してください。

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
