SakuraRailwayPack - RTM新規車両アドオン (骨組み)
=================================================

このパックは kit-SPLMv6sam の構成を参考に作成した、新規RTM(Realistic Train Mod)
アドオンのひな形です。識別名は "org_DC100" としています。
別の識別名に変更したい場合は、下記の「リネームすべき箇所」を一括置換してください。

■ フォルダ構成
  assets/minecraft/models/org_DC100/
      bogie.mqo            台車モデル (テンプレート。要編集)
      mdc_n_Tc.mqo          Tc車(制御車)モデル (テンプレート。要編集)
      DC100_cMc.mqo         cMc車(制御電動車)モデル (テンプレート。要編集)

  assets/minecraft/scripts/
      Render_script_dc100_sa.js           通常編成用レンダースクリプト
      Render_script_dc100_oneman_sa.js    ワンマン運転用レンダースクリプト
      Render_script_dc100_semiauto_sa.js  半自動ドア対応レンダースクリプト

  assets/minecraft/textures/train/org_DC100/
      bogie.png             台車テクスチャ
      button/Tc.png          Tc車 操作パネル用テクスチャ
      button/cMc.png         cMc車 操作パネル用テクスチャ
      mdc_n_Tc.png / _light0 / _light1 / _light2    Tc車 車体テクスチャ(発光用含む)
      DC100_cMc.png / _light0 / _light1 / _light2   cMc車 車体テクスチャ(発光用含む)
      parts.png / _light0 / _light1 / _light2        共通パーツテクスチャ(台車以外の細部)
      sign.png               方向幕テクスチャ

  assets/sound_dc100_sa/
      sounds.json
      sounds/train/rtm_mcth_dooropen_sa.ogg
      sounds/train/rtm_mcth_doorclose_sa.ogg
      sounds/train/rtm_mcth_none.ogg

  mods/RTM/train/
      ModelTrain_org_DC100_n1_Tc.json           Tc車 定義ファイル
      ModelTrain_org_DC100_n2_cMc.json          cMc車(ワンマン用スクリプト) 定義ファイル
      ModelTrain_org_DC100_n2_cMc_semiauto.json cMc車(半自動ドア対応) 定義ファイル

■ 作業手順の目安
  1. mqoファイルをMetasequoiaで開き、車体モデルを新形式に編集
  2. 各pngテクスチャを実車に合わせて描き直し
  3. mods/RTM/train/*.json の customButtons や seatPos、maxSpeed、
     accelerateion(加速度) 等の数値を実車仕様に合わせて調整
  4. レンダースクリプト(Render_script_*.js)はmqo内のオブジェクト名と
     対応しているため、モデルのオブジェクト名を変更した場合は
     registerParts() の引数も合わせて修正する

■ 注意
  ・レンダースクリプトはkit-SPLMv6samのものをそのまま流用しています。
    モデルのパーツ構成(オブジェクト名)を変更しない限りはそのまま動作します。
  ・soundScriptPath等、RTM2本体やKaizPatch側で用意されている共通スクリプト・
    サウンド("scripts/sound_223.js"、"rtm:train.door"等)は本パックには含まれません。
