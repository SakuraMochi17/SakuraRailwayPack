var renderClass = "jp.ngt.rtm.render.VehiclePartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);
importPackage(Packages.jp.ngt.ngtlib.math);
importPackage(Packages.jp.ngt.rtm)
importPackage(Packages.jp.ngt.rtm.entity.train.util);
importPackage(Packages.jp.ngt.ngtlib.renderer);

var LocalData = new java.util.HashMap();

// DataMap.SYNC_FLAG=1: サーバー経由で全クライアントに同期
var SYNC_FLAG = 1;

// 半自動ドアのボタン状態を管理するDataMapキー
// モデルの対応オブジェクト名: btn_door_LF / btn_door_RF / btn_door_LB / btn_door_RB
var KEY_DOOR_LF = "sdoor_LF";
var KEY_DOOR_RF = "sdoor_RF";
var KEY_DOOR_LB = "sdoor_LB";
var KEY_DOOR_RB = "sdoor_RB";

//##### オブジェクト定義 ####################
function init(par1, par2)
{
	//車体
	body = renderer.registerParts(new Parts("front", "exterior", "sideacc", "Interior", "end", "floor", "fDoor", "in_car_equipment", "hood", "frontacc", "cab", "L1", "L2", "L3", "coupler", "skirt1", "skirt2", "roof_eq", "Jumper(middle)", "Uf1", "Uf2"));
	Back_Cab = renderer.registerParts(new Parts("Bcab", "front1", "sideacc1", "Interior1", "floor1", "cab1"));
	alpha = renderer.registerParts(new Parts("alpha"));
	alpha_shine = renderer.registerParts(new Parts("alpha_shine"));

	//貫通扉系
	F_TopDoor = [];
	F_CabDoor = [];
	F_TopDoor[0] = renderer.registerParts(new Parts("tdoor_c_F", "hood_c_F"));
	F_TopDoor[1] = renderer.registerParts(new Parts("tdoor_o_F", "hood_o_F"));
	F_CabDoor[0] = renderer.registerParts(new Parts("pdoor_c_F"));
	F_CabDoor[1] = renderer.registerParts(new Parts("pdoor_o_F"));

	B_TopDoor = [];
	B_CabDoor = [];
	B_TopDoor[0] = renderer.registerParts(new Parts("tdoor_c_B", "hood_c_B"));
	B_TopDoor[1] = renderer.registerParts(new Parts("tdoor_o_B", "hood_o_B"));
	B_CabDoor[0] = renderer.registerParts(new Parts("pdoor_c_B"));
	B_CabDoor[1] = renderer.registerParts(new Parts("pdoor_o_B"));

	//ライト
	LightFH = [];
	LightFT = [];
	LightFE = [];

	LightFH[0] = renderer.registerParts(new Parts("Hlight_f_F"));
	LightFH[1] = renderer.registerParts(new Parts("Hlight_t_F"));
	LightFT[0] = renderer.registerParts(new Parts("Tlight_f_F"));
	LightFT[1] = renderer.registerParts(new Parts("Tlight_t_F"));
	LightFE[0] = renderer.registerParts(new Parts(""));
	LightFE[1] = renderer.registerParts(new Parts(""));

	LightBH = [];
	LightBT = [];
	LightBE = [];

	LightBH[0] = renderer.registerParts(new Parts("Hlight_f_B"));
	LightBH[1] = renderer.registerParts(new Parts("Hlight_t_B"));
	LightBT[0] = renderer.registerParts(new Parts("Tlight_f_B"));
	LightBT[1] = renderer.registerParts(new Parts("Tlight_t_B"));
	LightBE[0] = renderer.registerParts(new Parts(""));
	LightBE[1] = renderer.registerParts(new Parts(""));

	//ドア
	door_LF = renderer.registerParts(new Parts("doorLF"));
	door_RF = renderer.registerParts(new Parts("doorRF"));
	door_LB = renderer.registerParts(new Parts("doorLB"));
	door_RB = renderer.registerParts(new Parts("doorRB"));

	//ドア半透明
	door_LFa = renderer.registerParts(new Parts("doorLFa"));
	door_RFa = renderer.registerParts(new Parts("doorRFa"));
	door_LBa = renderer.registerParts(new Parts("doorLBa"));
	door_RBa = renderer.registerParts(new Parts("doorRBa"));

	//車側灯
	doorLa_R = [];
	doorLa_L = [];
	doorLa_R[0] = renderer.registerParts(new Parts("doorLa_f_R"));
	doorLa_R[1] = renderer.registerParts(new Parts("doorLa_t_R"));
	doorLa_L[0] = renderer.registerParts(new Parts("doorLa_f_L"));
	doorLa_L[1] = renderer.registerParts(new Parts("doorLa_t_L"));

	//椅子
	seat_cross_A1 = renderer.registerParts(new Parts(""));
	seat_cross_A2 = renderer.registerParts(new Parts(""));

	//種別幕(ひーさん制作オブジェクト定義)
	r_type = [];
	r_dest = [];
	s_bord = [];
	Br_type = [];
	Br_dest = [];
	Bs_bord = [];
	for (var i = 0; i < 128; i++) {
		var objName_type = "type" + i;
		var objName_dest = "dest" + i;
		var objName_bord = "bord" + i;
		var objName_Btype = "Btype" + i;
		var objName_Bdest = "Bdest" + i;
		var objName_Bbord = "Bbord" + i;
		r_type[i] = renderer.registerParts(new Parts(objName_type));
		r_dest[i] = renderer.registerParts(new Parts(objName_dest));
		s_bord[i] = renderer.registerParts(new Parts(objName_bord));
		Br_type[i] = renderer.registerParts(new Parts(objName_Btype));
		Br_dest[i] = renderer.registerParts(new Parts(objName_Bdest));
		Bs_bord[i] = renderer.registerParts(new Parts(objName_Bbord));
	}

	//乗客
	passenger = [];
	passenger[0] = renderer.registerParts(new Parts(""));
	passenger[1] = renderer.registerParts(new Parts(""));
	passenger[2] = renderer.registerParts(new Parts(""));

	//ワイパー
	Wiper_R = renderer.registerParts(new Parts("Wiper_R"));
	Wiper_R1 = renderer.registerParts(new Parts("Wiper_R1"));
	Wiper_R2 = renderer.registerParts(new Parts("Wiper_R2"));
	Wiper_L = renderer.registerParts(new Parts("Wiper_L"));
	Wiper_L1 = renderer.registerParts(new Parts("Wiper_L1"));
	Wiper_L2 = renderer.registerParts(new Parts("Wiper_L2"));

	//パンタ
	pantabase = renderer.registerParts(new Parts("panta_AB1", "panta_AB2", "panta_A1", "panta_A2", "panta_B1", "panta_B2", "panta_C1", "panta_C2", "panta_D1", "panta_D2"));
	pantaA11 = renderer.registerParts(new Parts("panta_A1_1"));
	pantaA12 = renderer.registerParts(new Parts("panta_A1_2"));
	pantaA13 = renderer.registerParts(new Parts("panta_A1_3"));
	pantaA14 = renderer.registerParts(new Parts("panta_A1_4"));
	pantaA15 = renderer.registerParts(new Parts("panta_A1_5"));
	pantaA21 = renderer.registerParts(new Parts("panta_A2_1"));
	pantaA22 = renderer.registerParts(new Parts("panta_A2_2"));
	pantaA23 = renderer.registerParts(new Parts("panta_A2_3"));
	pantaA24 = renderer.registerParts(new Parts("panta_A2_4"));
	pantaA25 = renderer.registerParts(new Parts("panta_A2_5"));
	pantaB11 = renderer.registerParts(new Parts("panta_B1_1"));
	pantaB12 = renderer.registerParts(new Parts("panta_B1_2"));
	pantaB13 = renderer.registerParts(new Parts("panta_B1_3"));
	pantaB14 = renderer.registerParts(new Parts("panta_B1_4"));
	pantaB15 = renderer.registerParts(new Parts("panta_B1_5"));
	pantaB21 = renderer.registerParts(new Parts("panta_B2_1"));
	pantaB22 = renderer.registerParts(new Parts("panta_B2_2"));
	pantaB23 = renderer.registerParts(new Parts("panta_B2_3"));
	pantaB24 = renderer.registerParts(new Parts("panta_B2_4"));
	pantaB25 = renderer.registerParts(new Parts("panta_B2_5"));
	pantaC11 = renderer.registerParts(new Parts("panta_C1_1"));
	pantaC12 = renderer.registerParts(new Parts("panta_C1_2"));
	pantaC13 = renderer.registerParts(new Parts("panta_C1_3"));
	pantaC14 = renderer.registerParts(new Parts("panta_C1_4"));
	pantaC15 = renderer.registerParts(new Parts("panta_C1_5"));
	pantaC21 = renderer.registerParts(new Parts("panta_C2_1"));
	pantaC22 = renderer.registerParts(new Parts("panta_C2_2"));
	pantaC23 = renderer.registerParts(new Parts("panta_C2_3"));
	pantaC24 = renderer.registerParts(new Parts("panta_C2_4"));
	pantaC25 = renderer.registerParts(new Parts("panta_C2_5"));
	pantaD11 = renderer.registerParts(new Parts("panta_D1_1"));
	pantaD12 = renderer.registerParts(new Parts("panta_D1_2"));
	pantaD13 = renderer.registerParts(new Parts("panta_D1_3"));
	pantaD14 = renderer.registerParts(new Parts("panta_D1_4"));
	pantaD15 = renderer.registerParts(new Parts("panta_D1_5"));
	pantaD21 = renderer.registerParts(new Parts("panta_D2_1"));
	pantaD22 = renderer.registerParts(new Parts("panta_D2_2"));
	pantaD23 = renderer.registerParts(new Parts("panta_D2_3"));
	pantaD24 = renderer.registerParts(new Parts("panta_D2_4"));
	pantaD25 = renderer.registerParts(new Parts("panta_D2_5"));

	// 半自動ドアボタン (ActionParts.TOGGLE = 右クリックでON/OFF)
	// モデル内オブジェクト名と対応:
	//   外側開けるボタン : btn_out_LF / btn_out_RF / btn_out_LB / btn_out_RB
	//   内側開けるボタン : btn_in_o_LF / btn_in_o_RF / btn_in_o_LB / btn_in_o_RB
	//   内側閉めるボタン : btn_in_c_LF / btn_in_c_RF / btn_in_c_LB / btn_in_c_RB

	// 外側開けるボタン
	btn_out_LF = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_out_LF"));
	btn_out_RF = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_out_RF"));
	btn_out_LB = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_out_LB"));
	btn_out_RB = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_out_RB"));

	// 内側開けるボタン
	btn_in_o_LF = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_o_LF"));
	btn_in_o_RF = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_o_RF"));
	btn_in_o_LB = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_o_LB"));
	btn_in_o_RB = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_o_RB"));

	// 内側閉めるボタン
	btn_in_c_LF = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_c_LF"));
	btn_in_c_RF = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_c_RF"));
	btn_in_c_LB = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_c_LB"));
	btn_in_c_RB = renderer.registerParts(new ActionParts(ActionType.TOGGLE, "btn_in_c_RB"));
}


function MCVersionChecker() {
    var varsion = RTMCore.VERSION;
    if (varsion.indexOf("1.7.10") >= 0) return "1.7.10";
    else if (varsion.indexOf("2.0") >= 0) return "1.8.9";
    else if (varsion.indexOf("2.1") >= 0) return "1.9.4";
    else if (varsion.indexOf("2.2") >= 0) return "1.10.2";
    else if (varsion.indexOf("2.4") >= 0) return "1.12.2";
    else return "unknown";
}

var isKaizPatch = RTMCore.VERSION.indexOf("KaizPatch") !== -1;


//##### 右クリック処理 (ActionParts.TOGGLE) ####################
// ドアボタンを右クリックするとドアの開閉許可を切り替える
// 値はDataMapでサーバー経由同期される
function onRightClick(entity, parts) {
	if (entity == null) return;
	var dataMap = entity.getResourceState().getDataMap();

	// 全自動モード(cb[10]=0)のときはボタン操作を無効化
	var isSemiAuto = (dataMap.getInt("Button10") == 1);
	if (!isSemiAuto) return;

	// 無人駅(cb[11]=1)かつ非1両目のときはボタン操作を無効化
	var isUnmanned = (dataMap.getInt("Button11") == 1);
	var isFirstCar = (entity.isControlCar) ? entity.isControlCar() : true;
	if (isUnmanned && !isFirstCar) return;

	// 外側開けるボタン / 内側開けるボタン: 押すとドア開許可ON(既にONなら取り消し)
	var openKey = null;
	if      (parts.equals(btn_out_LF) || parts.equals(btn_in_o_LF)) openKey = KEY_DOOR_LF;
	else if (parts.equals(btn_out_RF) || parts.equals(btn_in_o_RF)) openKey = KEY_DOOR_RF;
	else if (parts.equals(btn_out_LB) || parts.equals(btn_in_o_LB)) openKey = KEY_DOOR_LB;
	else if (parts.equals(btn_out_RB) || parts.equals(btn_in_o_RB)) openKey = KEY_DOOR_RB;

	if (openKey != null) {
		var current = dataMap.getInt(openKey);
		dataMap.setInt(openKey, current == 0 ? 1 : 0, SYNC_FLAG);
		return;
	}

	// 内側閉めるボタン: 押すと問答無用でドア閉(0に強制セット)
	var closeKey = null;
	if      (parts.equals(btn_in_c_LF)) closeKey = KEY_DOOR_LF;
	else if (parts.equals(btn_in_c_RF)) closeKey = KEY_DOOR_RF;
	else if (parts.equals(btn_in_c_LB)) closeKey = KEY_DOOR_LB;
	else if (parts.equals(btn_in_c_RB)) closeKey = KEY_DOOR_RB;

	if (closeKey != null) {
		dataMap.setInt(closeKey, 0, SYNC_FLAG);
	}
}


//##### render ####################
function render(entity, pass, par3)
{
	var data = LocalData.get(entity) || {};
	LocalData.put(entity, data);

	/* 特殊発光Ver6
	「XXX_light1」: 前照灯・急行灯・尾灯・客室・メーターパネル・貫通扉乗務員室側
	「XXX_light2」: 前照灯・急行灯・尾灯・乗務員室・貫通扉車外側 */

	/*カスタムボタン設定
	"customButtons": [
		["Light_On","Light_Switching","Light_Off"],      // cb[0]  前照灯(前)
		["ExLight_Auto","ExLight_On","ExLight_Off"],     // cb[1]  急行灯(前)
		["Undefined"],                                   // cb[2]  系統板(前)
		["TopDoor_Close","TopDoor_Open"],                // cb[3]  貫通路(前)
		["Door_Enabled","Door_Disabled"],                // cb[4]  締切
		["Undefined"],                                   // cb[5]  乗客
		["[R]Light_On","[R]Light_Switching","[R]Light_Off"],  // cb[6]  前照灯(後)
		["[R]ExLight_Auto","[R]ExLight_On","[R]ExLight_Off"], // cb[7]  急行灯(後)
		["Undefined"],                                   // cb[8]  系統板(後)
		["[R]TopDoor_Close","[R]TopDoor_Open"],          // cb[9]  貫通路(後)
		["DoorMode_Auto","DoorMode_SemiAuto"],           // cb[10] ドアモード(全自動/半自動)
		["Station_Manned","Station_Unmanned"]            // cb[11] 駅種別(有人駅/無人駅)
	],
	*/

	//数値設定
	var doorMove = 0.96,
		pantaDistanceF = 7.0,
		pantaDistanceR = -7.0,
		YpantaOfsetF = 0.0,
		YpantaOfsetR = 0.0,
		pantaType = "W51",
		seetType = "Conversion",
		customButton = 12,    // cb[11] 駅種別追加のため12に変更
		isOneManCar = false,
		useBord = false,
		AutoExL_8 = [2,3,4,8,9];
		AutoExL_9 = [];

	//操作情報取得
	var st = [];
	var varsion = MCVersionChecker();
	for (var i = 0; i < 12; i++) {
		if(entity != null){
			if(varsion == "1.7.10" || varsion == "1.8.9" || varsion == "1.9.4"){
			   st[i]  = entity.getTrainStateData(i);
			}else{
			   st[i]  = entity.getVehicleState(TrainState.getStateType(i));
			}
		}else{
			st[i] = 0;
		}
	}

	var cb = [];
	for (var j = 0; j < customButton; j++) {
		if(entity != null){
			if(isKaizPatch == true || varsion == "1.12.2" || varsion == "1.10.2"){
				var cb_title = "Button" + j;
				cb[j] = entity.getResourceState().getDataMap().getInt(cb_title);
			}else{
				cb[j] = 0;
			}
		}else{
			cb[j] = 0;
		}
	}

	GL11.glPushMatrix();
		render_panta(entity, pantaDistanceF, pantaDistanceR, YpantaOfsetF, YpantaOfsetR, pantaType);
		render_light(entity, pass, st, cb, AutoExL_8, AutoExL_9);
		render_body(entity, pass, st, cb, doorMove, isOneManCar, useBord, seetType);
	GL11.glPopMatrix();

	// 半自動モード かつ ドアロックなし のときのみボタンを右クリック判定・ホバー輪郭対象にする
	var isSemiAuto_outer   = (Math.floor(cb[10]) == 1);
	var isUnmanned_outer   = (Math.floor(cb[11]) == 1);
	var isFirstCar_outer   = (entity != null && entity.isControlCar) ? entity.isControlCar() : true;
	var doorLocked_outer   = isUnmanned_outer && !isFirstCar_outer;
	var buttonsActive      = isSemiAuto_outer && !doorLocked_outer;

	// ActionPartsの右クリック判定用レンダリング (pass=255)
	if (pass == RenderPass.PICK.id && buttonsActive) {
		render_door_buttons(entity, pass);
	}

	// ActionPartsのホバー輪郭表示 (pass=2 LIGHT)
	if (pass == RenderPass.LIGHT.id && buttonsActive) {
		render_door_buttons(entity, pass);
	}

	shouldUpdateTick(entity, pass, st[11]);
}


//##### render_車体 ####################
function render_body(entity, pass, st, cb, doorMove, isOneManCar, useBord, seetType){

	cb[3] = Math.floor(cb[3]);
	cb[5] = Math.floor(cb[5]);
	cb[9] = Math.floor(cb[9]);

	var varsion = MCVersionChecker();

	var cdIf = cb[3];
	if(isOneManCar == true && st[10] == 1) cdIf = 1;
	if(isOneManCar == true && st[0] == 1) cdIf = 1;

	var cdIb = cb[9];
	if(isOneManCar == true && st[10] == 1) cdIb = 1;
	if(isOneManCar == true && st[0] == 0) cdIb = 1;

	// ドアモード: cb[10]=0 → 全自動, cb[10]=1 → 半自動
	var isSemiAuto = (Math.floor(cb[10]) == 1);

	// 駅種別: cb[11]=0 → 有人駅(全車), cb[11]=1 → 無人駅(1両目のみ)
	// 1両目判定: entity.isControlCar() が true のとき先頭(運転)車両
	var isUnmannedStation = (Math.floor(cb[11]) == 1);
	var isFirstCar = (entity != null && entity.isControlCar) ? entity.isControlCar() : true;
	// 無人駅かつ非1両目 → このドアは全てロック
	var doorLocked = isUnmannedStation && !isFirstCar;

	var doorMoveL_F = 0.0, doorMoveL_B = 0.0;
	var doorMoveR_F = 0.0, doorMoveR_B = 0.0;
	var door_Cut = 1 - Math.floor(cb[4]);

	if(entity != null && !doorLocked){
		var dataMap = entity.getResourceState().getDataMap();
		var baseL = entity.doorMoveL / 60 * doorMove * door_Cut;
		var baseR = entity.doorMoveR / 60 * doorMove * door_Cut;

		if(isSemiAuto){
			// 半自動: 各ドアのボタン状態(0/1)を乗算 → ボタンを押したドアのみ開く
			doorMoveL_F = baseL * dataMap.getInt(KEY_DOOR_LF);
			doorMoveL_B = baseL * dataMap.getInt(KEY_DOOR_LB);
			doorMoveR_F = baseR * dataMap.getInt(KEY_DOOR_RF);
			doorMoveR_B = baseR * dataMap.getInt(KEY_DOOR_RB);
		} else {
			// 全自動: 車掌操作で全ドアが一斉に開閉する (従来動作)
			doorMoveL_F = doorMoveL_B = baseL;
			doorMoveR_F = doorMoveR_B = baseR;
		}
	}
	// doorLocked=true のとき全 doorMove は 0.0 のまま → ドア不動

	// 車側灯: どちらかのドアが開いていれば点灯
	var anyDoorR_open = (doorMoveR_F != 0 || doorMoveR_B != 0);
	var anyDoorL_open = (doorMoveL_F != 0 || doorMoveL_B != 0);

	if(pass == 0){ //通常描画

		GL11.glPushMatrix();
			body.render(renderer);
			passenger[cb[5]].render(renderer);
			Back_Cab.render(renderer);
			if(seetType == "Rotation") render_rotationseat(entity);
			if(seetType == "Conversion") render_conversionseat(entity);

			F_TopDoor[cb[3]].render(renderer);
			F_CabDoor[cdIf].render(renderer);

			B_TopDoor[cb[9]].render(renderer);
			B_CabDoor[cdIb].render(renderer);

			if(!anyDoorR_open) doorLa_R[0].render(renderer);
			if(!anyDoorL_open) doorLa_L[0].render(renderer);

			render_door(entity, pass, doorMoveL_F, doorMoveL_B, doorMoveR_F, doorMoveR_B);
			render_sign(entity, pass, st, useBord, cb, false);

			// 通常描画でドアボタンも表示
			render_door_buttons(entity, pass);

		GL11.glPopMatrix();
	}

	if(pass == 2){}

	if(st[11] != 2){
		if(pass == 3){

			GL11.glPushMatrix();
			if(st[5] == 2){
				body.render(renderer);
				passenger[cb[5]].render(renderer);
				if(seetType == "Rotation") render_rotationseat(entity);
				if(seetType == "Conversion") render_conversionseat(entity);
				render_door(entity, pass, doorMoveL_F, doorMoveL_B, doorMoveR_F, doorMoveR_B);

				if(st[0] == 0 && st[10] == 0){ }else{
					F_TopDoor[cb[3]].render(renderer);
				}
				F_CabDoor[cdIf].render(renderer);
				if(st[0] == 1 && st[10] == 0){ }else{
					B_TopDoor[cb[9]].render(renderer);
				}
				B_CabDoor[cdIb].render(renderer);
				Back_Cab.render(renderer);
			}
			GL11.glPopMatrix();

		}

		if(pass == 4){

			GL11.glPushMatrix();
			if(st[5] == 2){
				if(st[0] == 0 && st[10] == 0){ }else{
					if(cb[3]==1) F_TopDoor[cb[3]].render(renderer);
					body.render(renderer);
					F_CabDoor[cdIf].render(renderer);
				}
				if(st[0] == 1 && st[10] == 0){ }else{
					if(cb[9]==1) B_TopDoor[cb[9]].render(renderer);
					Back_Cab.render(renderer);
					B_CabDoor[cdIb].render(renderer);
				}
			}
			GL11.glPopMatrix();

		}
	}

	if(pass == 1){
		GL11.glPushMatrix();
			if(varsion != "1.7.10"){Packages.jp.ngt.ngtlib.renderer.GLHelper.setBrightness(entity ? entity.func_70070_b() : 0);}
				alpha.render(renderer);
				if(st[5] != 2) alpha_shine.render(renderer);
				render_door(entity, pass, doorMoveL_F, doorMoveL_B, doorMoveR_F, doorMoveR_B);
		GL11.glPopMatrix();
	}

	if(st[11] != 2){
		if(pass < 2){
			GL11.glPushMatrix();
				GLHelper.disableLighting();
				GLHelper.setLightmapMaxBrightness();

					if(st[5] == 2) alpha_shine.render(renderer);

					if(anyDoorR_open) doorLa_R[1].render(renderer);
					if(anyDoorL_open) doorLa_L[1].render(renderer);

					if(st[11] != 2) render_sign(entity, pass, st, cb, useBord, true);

				GL11.glColor4f(1.0, 1.0, 1.0, 1.0);
				if(varsion=="1.7.10") GLHelper.setBrightness(entity ? entity.func_70070_b(0) : 0);
				else GLHelper.setBrightness(entity ? entity.func_70070_b() : 0);
				GLHelper.enableLighting();
			GL11.glPopMatrix();
		}
	}
}


//##### render_ドアボタン ####################
// 通常描画(pass=0): ボタン本体を表示
//   開けるボタン: ドアが開いているとき(KEY=1)は PRESS_OFFSET 分沈む
//   閉めるボタン: 常駐状態を持たないため常に通常位置
// LIGHT描画(pass=2): ホバー輪郭をActionPartsが自動描画
// PICK描画(pass=255): 右クリック判定
function render_door_buttons(entity, pass) {
	// entity=null時(モデルプレビューなど)はそのままrender
	if (entity == null) {
		btn_out_LF.render(renderer);  btn_out_RF.render(renderer);
		btn_out_LB.render(renderer);  btn_out_RB.render(renderer);
		btn_in_o_LF.render(renderer); btn_in_o_RF.render(renderer);
		btn_in_o_LB.render(renderer); btn_in_o_RB.render(renderer);
		btn_in_c_LF.render(renderer); btn_in_c_RF.render(renderer);
		btn_in_c_LB.render(renderer); btn_in_c_RB.render(renderer);
		return;
	}

	var dataMap = entity.getResourceState().getDataMap();
	var sLF = dataMap.getInt(KEY_DOOR_LF); // 0=閉, 1=開許可
	var sRF = dataMap.getInt(KEY_DOOR_RF);
	var sLB = dataMap.getInt(KEY_DOOR_LB);
	var sRB = dataMap.getInt(KEY_DOOR_RB);

	// 開けるボタン: ドア開許可中(1)はボタンが押し込まれた状態を表現
	var PRESS_OFFSET = -0.003; // Y方向に沈む量(m)。モデルに応じて調整

	// --- 外側開けるボタン ---
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sLF, 0.0);
		btn_out_LF.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sRF, 0.0);
		btn_out_RF.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sLB, 0.0);
		btn_out_LB.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sRB, 0.0);
		btn_out_RB.render(renderer);
	GL11.glPopMatrix();

	// --- 内側開けるボタン ---
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sLF, 0.0);
		btn_in_o_LF.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sRF, 0.0);
		btn_in_o_RF.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sLB, 0.0);
		btn_in_o_LB.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
		GL11.glTranslatef(0.0, PRESS_OFFSET * sRB, 0.0);
		btn_in_o_RB.render(renderer);
	GL11.glPopMatrix();

	// --- 内側閉めるボタン (常駐状態なし・常に通常位置) ---
	btn_in_c_LF.render(renderer);
	btn_in_c_RF.render(renderer);
	btn_in_c_LB.render(renderer);
	btn_in_c_RB.render(renderer);
}


//##### render_ライト ####################
function render_light(entity, pass, st, cb, AutoExL_8, AutoExL_9){

	var fHI = 0;
	var fTI = 0;
	var fEI = 0;

	var bHI = 0;
	var bTI = 0;
	var bEI = 0;

	var cb1 = 0;
	var cb7 = 0;

	if(cb[1] == 0){
		if(AutoExL_8.indexOf(Math.floor(st[8])) != -1) cb1 = 1;
		if(AutoExL_9.indexOf(Math.floor(st[9])) != -1) cb1 = 1;
	}else{
		cb1 = Math.floor(cb[1]) - 1;
	}

	if(cb[7] == 0){
		if(AutoExL_8.indexOf(Math.floor(st[8])) != -1) cb7 = 1;
		if(AutoExL_9.indexOf(Math.floor(st[9])) != -1) cb7 = 1;
	}else{
		cb7 = Math.floor(cb[7]) - 1;
	}


	if(st [11] != 2){
		if(st[5] != 0){
			if(cb[3] == 0){
				if(st[0] == 0){
					if(cb[0] != 2)fHI = 1;
					if(cb[0] == 1)fTI = 1;
					fEI = cb1;
				}else{
					if(cb[0] != 2)fTI = 1;
				}
			}
			if(cb[9] == 0){
				if(st[0] == 1){
					if(cb[6] != 2)bHI = 1;
					if(cb[6] == 1)bTI = 1;
					bEI = cb7;
				}else{
					if(cb[6] != 2)bTI = 1;
				}
			}
		}
	}

	GL11.glPushMatrix();
		LightFH[fHI].render(renderer);
		LightFT[fTI].render(renderer);
		LightFE[fEI].render(renderer);

		LightBH[bHI].render(renderer);
		LightBT[bTI].render(renderer);
		LightBE[bEI].render(renderer);
	GL11.glPopMatrix();

}


//##### render_ドア ####################
// 引数を4つのドア個別移動量に変更
function render_door(entity, pass, doorMoveL_F, doorMoveL_B, doorMoveR_F, doorMoveR_B){

	if(pass == 1){

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveL_F);
			door_LFa.render(renderer);
		GL11.glPopMatrix();

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveL_B);
			door_LBa.render(renderer);
		GL11.glPopMatrix();

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveR_F);
			door_RFa.render(renderer);
		GL11.glPopMatrix();

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveR_B);
			door_RBa.render(renderer);
		GL11.glPopMatrix();

	}else{

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveL_F);
			door_LF.render(renderer);
		GL11.glPopMatrix();

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveL_B);
			door_LB.render(renderer);
		GL11.glPopMatrix();

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveR_F);
			door_RF.render(renderer);
		GL11.glPopMatrix();

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveR_B);
			door_RB.render(renderer);
		GL11.glPopMatrix();

	}
}


//##### render_転クロ ####################
function render_conversionseat(entity){

	var varsion = MCVersionChecker();

	var seat_r = 0;
	var rotate = 30;
	var pos_r = -0.33;
	if(entity != null){
	 	if(varsion == "1.12.2"){
		 	seat_r = (entity.seatRotation)/2+0.5;
	 	}else{
			seat_r = (entity.seatRotation)/90+0.5;
	 	}
	}

	var stpos_a = 4.14;
	var seatdistance_a = 0.92;
	var gloupdistance_a = 0;
	var seatcount_a = 12;
	var gloupcount_a = 1;

	for(var ss1_1 = 0; ss1_1 < gloupcount_a; ss1_1++) {
		for(var ss1_2 = 0; ss1_2 < seatcount_a; ss1_2++) {
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -gloupdistance_a * ss1_1);
			GL11.glTranslatef(0.0, 0.0, (stpos_a - seatdistance_a * (ss1_2)));
			seat_cross_A1.render(renderer);
			renderer.rotate(rotate * seat_r, 'X', 0.0, pos_r, 0.0);
			seat_cross_A2.render(renderer);
		GL11.glPopMatrix();
		}
		ss1_2 = 0;
	}
	ss1_1 = 0;
}


//##### render_回転クロス ####################
function render_rotationseat(entity){

	var varsion = MCVersionChecker();
	var seat_r = 0;
	var rotate = 180;
	var pos_r = 0.76;

	if(entity != null){
	 	if(varsion == "1.12.2"){
		 	seat_r = (entity.seatRotation)/2+0.5;
	 	}else{
			seat_r = (entity.seatRotation)/90+0.5;
	 	}
	}

	var stpos_a = 0.09;
	var seatdistance_a = 1.0;
	var gloupdistance_a = 5.83;
	var seatcount_a = 9;
	var gloupcount_a = 1;

	for(var ss1_1 = 0; ss1_1 < gloupcount_a; ss1_1++) {
		for(var ss1_2 = 0; ss1_2 < seatcount_a; ss1_2++) {
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -gloupdistance_a * ss1_1);
			GL11.glTranslatef(0.0, 0.0, (stpos_a - seatdistance_a * (ss1_2)));
			seat_cross_A1.render(renderer);
			renderer.rotate(rotate * seat_r, 'Y', pos_r, 0.0, 0.0);
			seat_cross_A2.render(renderer);
		GL11.glPopMatrix();
		}
		ss1_2 = 0;
	}
	ss1_1 = 0;

}


//##### render_方向幕 ####################
function render_sign(entity, pass, st, cb, useBord, isShine){

	var st8 = Math.floor(st[8]);
	var st9 = Math.floor(st[9]);
	var cb2 = Math.floor(cb[2]);
	var cb3 = Math.floor(cb[3]);
	var cb8 = Math.floor(cb[8]);
	var cb9 = Math.floor(cb[9]);

	GL11.glPushMatrix();
		if(cb3 == 0){
			if(isShine == false){
				s_bord[cb2].render(renderer);

				if(useBord == true){
					r_dest[st8].render(renderer);
					r_type[st9].render(renderer);
				}
			}
		}

		if(useBord == false){
			if(isShine == false && st[11] == 2){
				r_dest[st8].render(renderer);
				r_type[st9].render(renderer);
			}else if(isShine == true && st[11] != 2){
				r_dest[st8].render(renderer);
				r_type[st9].render(renderer);
			}
		}
	GL11.glPopMatrix();

	GL11.glPushMatrix();
		if(cb9 == 0){
			if(isShine == false){
				Bs_bord[cb8].render(renderer);

				if(useBord == true){
					Br_dest[st8].render(renderer);
					Br_type[st9].render(renderer);
				}
			}
		}

		if(useBord == false){
			if(isShine == false && st[11] == 2){
				Br_dest[st8].render(renderer);
				Br_type[st9].render(renderer);
			}else if(isShine == true && st[11] != 2){
				Br_dest[st8].render(renderer);
				Br_type[st9].render(renderer);
			}
		}
	GL11.glPopMatrix();

}


//##### render_パンタ ####################
function render_panta(entity, pantaDistanceF, pantaDistanceR, YpantaOfsetF, YpantaOfsetR, pantaType){

	var pantaState = 0.0,
		pDisF = pantaDistanceF,
		pDisR = pantaDistanceR,
		pHigF = YpantaOfsetF,
		pHigR = YpantaOfsetR;

	try{
		pantaState = renderer.sigmoid(entity.pantograph_F / 40);
	}catch(e){}

	var data = LocalData.get(entity);
	var FPantaSt = data.FPantaSt;
	var RPantaSt = data.RPantaSt;

	var FpAro1 = FPantaSt * 18 + pantaState * 15,
	 	FpAro2 = FPantaSt * 37 + pantaState * 26,
	 	FpBro1 = FPantaSt * 15 + pantaState * 12,
	 	FpBro2 = FPantaSt * 39 + pantaState * 27,
	 	FpCro1 = FPantaSt * 15 + pantaState * 14,
	 	FpCro2 = FPantaSt * 35 + pantaState * 24,
	 	FpCro4 = FPantaSt * 36 + pantaState * 24,
	 	FpCro5 = FPantaSt * 38 + pantaState * 28,
		RpAro1 = RPantaSt * 18 + pantaState * 15,
	 	RpAro2 = RPantaSt * 37 + pantaState * 26,
	 	RpBro1 = RPantaSt * 15 + pantaState * 12,
	 	RpBro2 = RPantaSt * 39 + pantaState * 27,
	 	RpCro1 = RPantaSt * 15 + pantaState * 14,
	 	RpCro2 = RPantaSt * 35 + pantaState * 24,
	 	RpCro4 = RPantaSt * 36 + pantaState * 24,
	 	RpCro5 = RPantaSt * 38 + pantaState * 28;

	pantabase.render(renderer);

	GL11.glPushMatrix();
	renderer.rotate(FpAro1, 'X', 0.0, 2.8784 + pHigF, pDisF+0.5224);
	pantaA11.render(renderer);
		renderer.rotate(-FpAro2, 'X', 0.0, 3.6729 + pHigF, pDisF+1.5431);
		pantaA12.render(renderer);
			renderer.rotate(FpAro2-FpAro1, 'X', 0.0, 4.6101 + pHigF, pDisF+0.0935);
			pantaA13.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
	renderer.rotate(-FpAro1, 'X', 0.0, 2.8784 + pHigF, pDisF-0.5224);
	pantaA14.render(renderer);
		renderer.rotate(FpAro2, 'X', 0.0, 3.6729 + pHigF, pDisF-1.5431);
		pantaA15.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(RpAro1, 'X', 0.0, 2.8784 + pHigR, pDisR+0.5224);
	pantaA21.render(renderer);
		renderer.rotate(-RpAro2, 'X', 0.0, 3.6729 + pHigR, pDisR+1.5431);
		pantaA22.render(renderer);
			renderer.rotate(RpAro2-RpAro1, 'X', 0.0, 4.6101 + pHigR, pDisR+0.0935);
			pantaA23.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
	renderer.rotate(-RpAro1, 'X', 0.0, 2.8784 + pHigR, pDisR-0.5224);
	pantaA24.render(renderer);
		renderer.rotate(RpAro2, 'X', 0.0, 3.6729 + pHigR, pDisR-1.5431);
		pantaA25.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(FpBro1, 'X', 0.0, 2.8784 + pHigF, pDisF-0.5224);
	pantaB11.render(renderer);
		renderer.rotate(-FpBro2, 'X', 0.0, 3.8526 + pHigF, pDisF+0.93);
		pantaB12.render(renderer);
			renderer.rotate(FpBro2-FpBro1, 'X', 0.0, 4.6227 + pHigF, pDisF+0.0229);
			pantaB13.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
	renderer.rotate(-FpBro1, 'X', 0.0, 2.8784 + pHigF, pDisF+0.5224);
	pantaB14.render(renderer);
		renderer.rotate(FpBro2, 'X', 0.0, 3.8526 + pHigF, pDisF-0.93);
		pantaB15.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(RpBro1, 'X', 0.0, 2.8784 + pHigR, pDisR-0.5224);
	pantaB21.render(renderer);
		renderer.rotate(-RpBro2, 'X', 0.0, 3.8526 + pHigR, pDisR+0.93);
		pantaB22.render(renderer);
			renderer.rotate(RpBro2-RpBro1, 'X', 0.0, 4.6227 + pHigR, pDisR+0.0229);
			pantaB23.render(renderer);
	GL11.glPopMatrix();
	GL11.glPushMatrix();
	renderer.rotate(-RpBro1, 'X', 0.0, 2.8784 + pHigR, pDisR+0.5224);
	pantaB24.render(renderer);
		renderer.rotate(RpBro2, 'X', 0.0, 3.8526 + pHigR, pDisR-0.93);
		pantaB25.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(FpCro1, 'X', 0.0, 3.0118 + pHigF, pDisF-0.314);
	pantaC11.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(-FpCro4, 'X', 0.0, 3.6084 + pHigF, pDisF+0.7523);
			pantaC14.render(renderer);
			GL11.glPopMatrix();
		renderer.rotate(-FpCro2, 'X', 0.0, 3.7151 + pHigF, pDisF+0.8641);
		pantaC12.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(FpCro2-FpCro1, 'X', 0.0, 4.5998 + pHigF, pDisF-0.6186);
			pantaC13.render(renderer);
			GL11.glPopMatrix();
			renderer.rotate(FpCro5, 'X', 0.0, 3.5258 + pHigF, pDisF+0.9758);
			pantaC15.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(RpCro1, 'X', 0.0, 3.0118 + pHigR, pDisR-0.314);
	pantaC21.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(-RpCro4, 'X', 0.0, 3.6084 + pHigR, pDisR+0.7523);
			pantaC24.render(renderer);
			GL11.glPopMatrix();
		renderer.rotate(-RpCro2, 'X', 0.0, 3.7151 + pHigR, pDisR+0.8641);
		pantaC22.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(RpCro2-RpCro1, 'X', 0.0, 4.5998 + pHigR, pDisR-0.6186);
			pantaC23.render(renderer);
			GL11.glPopMatrix();
			renderer.rotate(RpCro5, 'X', 0.0, 3.5258 + pHigR, pDisR+0.9758);
			pantaC25.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(-FpCro1, 'X', 0.0, 3.0118 + pHigF, pDisF+0.3140);
	pantaD11.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(FpCro4, 'X', 0.0, 3.6084 + pHigF, pDisF-0.7523);
			pantaD14.render(renderer);
			GL11.glPopMatrix();
		renderer.rotate(FpCro2, 'X', 0.0, 3.7151 + pHigF, pDisF-0.8641);
		pantaD12.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(-FpCro2+FpCro1, 'X', 0.0, 4.5998 + pHigF, pDisF+0.6186);
			pantaD13.render(renderer);
			GL11.glPopMatrix();
			renderer.rotate(-FpCro5, 'X', 0.0, 3.5258 + pHigF, pDisF-0.9758);
			pantaD15.render(renderer);
	GL11.glPopMatrix();

	GL11.glPushMatrix();
	renderer.rotate(-RpCro1, 'X', 0.0, 3.0118 + pHigR, pDisR+0.314);
	pantaD21.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(RpCro4, 'X', 0.0, 3.6084 + pHigR, pDisR-0.7523);
			pantaD24.render(renderer);
			GL11.glPopMatrix();
		renderer.rotate(RpCro2, 'X', 0.0, 3.7151 + pHigR, pDisR-0.8641);
		pantaD22.render(renderer);
			GL11.glPushMatrix();
			renderer.rotate(-RpCro2+RpCro1, 'X', 0.0, 4.5998 + pHigR, pDisR+0.6186);
			pantaD23.render(renderer);
			GL11.glPopMatrix();
			renderer.rotate(-RpCro5, 'X', 0.0, 3.5258 + pHigR, pDisR-0.9758);
			pantaD25.render(renderer);
	GL11.glPopMatrix();
}


//##### Tick処理 ####################
function shouldUpdateTick(entity, pass, st11) {
	if (entity === null) return;
	if (pass !== 0) return;
	if (renderer.currentMatId !== 0) return;

	var data = LocalData.get(entity);
	var tick = renderer.getTick(entity);
	var prevTick = data.prevTick || 0;
	data.prevTick = tick;
	LocalData.put(entity, data);
	if(tick === prevTick) return;

	//### ここからTick処理 ###

	// パンタグラフ状態補間
	var FPantaSt_pr = data.FPantaSt;
	var RPantaSt_pr = data.RPantaSt;

	switch(st11){
	  case 0:
		var FPantaSt = 0;
		var RPantaSt = 0;
	    break;
	  case 1:
		var FPantaSt = 0;
		var RPantaSt = 1;
	    break;
  	 default:
		var FPantaSt = 1;
		var RPantaSt = 1;
	}

	if(FPantaSt_pr == null)FPantaSt_pr = FPantaSt;
	if(RPantaSt_pr == null)RPantaSt_pr = RPantaSt;

	FPantaSt_pr = FPantaSt_pr * 1000;
	FPantaSt_pr = Math.round(FPantaSt_pr);
	FPantaSt_pr = FPantaSt_pr / 1000;

	if(FPantaSt_pr > FPantaSt){
		FPantaSt_pr = FPantaSt_pr - 0.02;
	}else if(FPantaSt_pr < FPantaSt){
		FPantaSt_pr = FPantaSt_pr + 0.02;
	}

	RPantaSt_pr = RPantaSt_pr * 1000;
	RPantaSt_pr = Math.round(RPantaSt_pr);
	RPantaSt_pr = RPantaSt_pr / 1000;

	if(RPantaSt_pr > RPantaSt){
		RPantaSt_pr = RPantaSt_pr - 0.02;
	}else if(RPantaSt_pr < RPantaSt){
		RPantaSt_pr = RPantaSt_pr + 0.02;
	}

	data.FPantaSt = FPantaSt_pr;
	data.RPantaSt = RPantaSt_pr;
	LocalData.put(entity, data);

	// 半自動ドアボタン状態リセット
	// 車掌がドアを完全に閉めたとき (doorMoveL/R が 0 に戻ったとき) に
	// 各ドアのボタン状態をリセットして、次の駅で誤って自動開扉しないようにする
	var prevDoorL = data.prevDoorL !== undefined ? data.prevDoorL : 0;
	var prevDoorR = data.prevDoorR !== undefined ? data.prevDoorR : 0;
	var curDoorL = entity.doorMoveL;
	var curDoorR = entity.doorMoveR;

	if (prevDoorL > 0 && curDoorL == 0) {
		// 左側ドアが閉まりきった → 左ドアボタンをリセット
		var dm = entity.getResourceState().getDataMap();
		dm.setInt(KEY_DOOR_LF, 0, SYNC_FLAG);
		dm.setInt(KEY_DOOR_LB, 0, SYNC_FLAG);
	}

	if (prevDoorR > 0 && curDoorR == 0) {
		// 右側ドアが閉まりきった → 右ドアボタンをリセット
		var dm = entity.getResourceState().getDataMap();
		dm.setInt(KEY_DOOR_RF, 0, SYNC_FLAG);
		dm.setInt(KEY_DOOR_RB, 0, SYNC_FLAG);
	}

	data.prevDoorL = curDoorL;
	data.prevDoorR = curDoorR;

	// 無人駅かつ非1両目のとき: DataMapのドア開放状態を強制リセット
	// 「有人駅→無人駅」に切り替わった瞬間、または既に無人駅モードで起動した場合に
	// 誤開放のまま放置されないよう処理する
	var dm = entity.getResourceState().getDataMap();
	var isUnmanned = (dm.getInt("Button11") == 1);
	var isFirstCar = (entity.isControlCar) ? entity.isControlCar() : true;
	var prevWasUnmanned = data.prevUnmanned || false;

	if (isUnmanned && !isFirstCar) {
		// 前Tickは有人駅だった → 無人駅に切り替わったタイミングでリセット
		if (!prevWasUnmanned) {
			dm.setInt(KEY_DOOR_LF, 0, SYNC_FLAG);
			dm.setInt(KEY_DOOR_LB, 0, SYNC_FLAG);
			dm.setInt(KEY_DOOR_RF, 0, SYNC_FLAG);
			dm.setInt(KEY_DOOR_RB, 0, SYNC_FLAG);
		}
	}
	data.prevUnmanned = (isUnmanned && !isFirstCar);

	LocalData.put(entity, data);
}
