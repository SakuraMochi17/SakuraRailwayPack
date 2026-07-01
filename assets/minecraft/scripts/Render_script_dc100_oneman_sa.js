var renderClass = "jp.ngt.rtm.render.VehiclePartsRenderer";
importPackage(Packages.org.lwjgl.opengl);
importPackage(Packages.jp.ngt.rtm.render);
importPackage(Packages.jp.ngt.ngtlib.math);
importPackage(Packages.jp.ngt.rtm)
importPackage(Packages.jp.ngt.rtm.entity.train.util);
importPackage(Packages.jp.ngt.ngtlib.renderer);

//データ保存処理(グローバル関数)
var LocalData = new java.util.HashMap();

//##### オブジェクト定義 ####################
function init(par1, par2)
{
	//車体
	body = renderer.registerParts(new Parts("front", "exterior", "sideacc", "Interior", "end", "floor", "fDoor", "in_car_equipment", "hood", "frontacc", "cab", "L1", "L2", "L3", "coupler", "skirt1", "skirt2", "roof_eq", "Jumper(middle)", "Uf1", "Uf2"));
	Back_Cab = renderer.registerParts(new Parts("Bcab", "front1", "sideacc1", "Interior1", "floor1", "cab1"));	//両運転台車の後方運転台はここ
	alpha = renderer.registerParts(new Parts("alpha"));
	alpha_shine = renderer.registerParts(new Parts("alpha_shine"));

	//貫通扉系
	F_TopDoor = [];
	F_CabDoor = [];
	F_TopDoor[0] = renderer.registerParts(new Parts("tdoor_c_F", "hood_c_F"));
	F_TopDoor[1] = renderer.registerParts(new Parts("tdoor_o_F", "hood_o_F"));
	F_CabDoor[0] = renderer.registerParts(new Parts("pdoor_c_F"));	//「ワンマンカー」機能を使うときはここに運賃箱等展開時
	F_CabDoor[1] = renderer.registerParts(new Parts("pdoor_o_F"));	//「ワンマンカー」機能を使うときはここに運賃箱等格納時

	B_TopDoor = [];
	B_CabDoor = [];
	B_TopDoor[0] = renderer.registerParts(new Parts("tdoor_c_B", "hood_c_B"));
	B_TopDoor[1] = renderer.registerParts(new Parts("tdoor_o_B", "hood_o_B"));
	B_CabDoor[0] = renderer.registerParts(new Parts("pdoor_c_B"));	//「ワンマンカー」機能を使うときはここに運賃箱等展開時
	B_CabDoor[1] = renderer.registerParts(new Parts("pdoor_o_B"));	//「ワンマンカー」機能を使うときはここに運賃箱等格納時

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
	seat_cross_A1 = renderer.registerParts(new Parts(""));		//基部
	seat_cross_A2 = renderer.registerParts(new Parts(""));		//背もたれ

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
		s_bord[i] = renderer.registerParts(new Parts(objName_bord));	//教習サボは0番に
		Br_type[i] = renderer.registerParts(new Parts(objName_Btype));
		Br_dest[i] = renderer.registerParts(new Parts(objName_Bdest));
		Bs_bord[i] = renderer.registerParts(new Parts(objName_Bbord));	//教習サボは0番に
	}

	//乗客
	passenger = [];	
	passenger[0] = renderer.registerParts(new Parts(""));			//乗客なし
	passenger[1] = renderer.registerParts(new Parts(""));			//乗客少なめ
	passenger[2] = renderer.registerParts(new Parts(""));			//乗客多め

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


//##### render ####################
function render(entity, pass, par3)
{
	//データ保存処理の初期化
	//Entityをキーにしてるので競合を起こさない(setData/getDataのビットシフトより確実性が高い)
	//必ず一番最初に実行されるように書く
	var data = LocalData.get(entity) || {};
	LocalData.put(entity, data);


	/* 特殊発光Ver6							 */
	/*「XXX_light0」: いらない							 */
	/*「XXX_light1」: 前照灯・急行灯・尾灯・客室・メーターパネル・貫通扉乗務員室側 */
	/*「XXX_light2」: 前照灯・急行灯・尾灯・乗務員室・貫通扉車外側	*/

	/*カスタムボタン設定				 
	"customButtons": [
		["Light_On","Light_Switching","Light_Off"],	//前照灯(前)
		["ExLight_Auto","ExLight_Off","ExLight_On"],	//種別灯(前)
		["Bord_None","Bord_Training","Bord_No2","Bord_No3","Bord_No4","Bord_No5","Bord_No6","Bord_No7","Bord_No8","Bord_No9","Bord_No10","Bord_No11","Bord_No12","Bord_No13","Bord_No14","Bord_No15","Bord_No16","Bord_No17","Bord_No18","Bord_No19","Bord_No20","Bord_No21","Bord_No22","Bord_No23","Bord_No24","Bord_No25","Bord_No26","Bord_No27","Bord_No28","Bord_No29","Bord_No30","Bord_No31","Bord_No32","Bord_No33","Bord_No34","Bord_No35","Bord_No36","Bord_No37","Bord_No38","Bord_No39","Bord_No40","Bord_No41","Bord_No42","Bord_No43","Bord_No44","Bord_No45","Bord_No46","Bord_No47","Bord_No48","Bord_No49","Bord_No50","Bord_No51","Bord_No52","Bord_No53","Bord_No54","Bord_No55","Bord_No56","Bord_No57","Bord_No58","Bord_No59","Bord_No60","Bord_No61","Bord_No62","Bord_No63","Bord_No64","Bord_No65","Bord_No66","Bord_No67","Bord_No68","Bord_No69","Bord_No70","Bord_No71","Bord_No72","Bord_No73","Bord_No74","Bord_No75","Bord_No76","Bord_No77","Bord_No78","Bord_No79","Bord_No80","Bord_No81","Bord_No82","Bord_No83","Bord_No84","Bord_No85","Bord_No86","Bord_No87","Bord_No88","Bord_No89","Bord_No90","Bord_No91","Bord_No92","Bord_No93","Bord_No94","Bord_No95","Bord_No96","Bord_No97","Bord_No98","Bord_No99","Bord_No100","Bord_No101","Bord_No102","Bord_No103","Bord_No104","Bord_No105","Bord_No106","Bord_No107","Bord_No108","Bord_No109","Bord_No110","Bord_No111","Bord_No112","Bord_No113","Bord_No114","Bord_No115","Bord_No116","Bord_No117","Bord_No118","Bord_No119","Bord_No120","Bord_No121","Bord_No122","Bord_No123","Bord_No124","Bord_No125","Bord_No126","Bord_No127"],
			//記念系統板(前)
		["TopDoor_Close","TopDoor_Open"],	//貫通路(前)
		["Door_Enabled","Door_Disabled"],	//締切
		["Passenger_None", "Passenger_Few", "Passenger_Many"],	//乗客
		["[R]Light_On","[R]Light_Switching","[R]Light_Off"],	//前照灯(後)
		["[R]ExLight_Auto","[R]ExLight_Off","[R]ExLight_On"],	//種別灯(後)
		["[R]Bord_None","[R]Bord_Training","[R]Bord_No2","[R]Bord_No3","[R]Bord_No4","[R]Bord_No5","[R]Bord_No6","[R]Bord_No7","[R]Bord_No8","[R]Bord_No9","[R]Bord_No10","[R]Bord_No11","[R]Bord_No12","[R]Bord_No13","[R]Bord_No14","[R]Bord_No15","[R]Bord_No16","[R]Bord_No17","[R]Bord_No18","[R]Bord_No19","[R]Bord_No20","[R]Bord_No21","[R]Bord_No22","[R]Bord_No23","[R]Bord_No24","[R]Bord_No25","[R]Bord_No26","[R]Bord_No27","[R]Bord_No28","[R]Bord_No29","[R]Bord_No30","[R]Bord_No31","[R]Bord_No32","[R]Bord_No33","[R]Bord_No34","[R]Bord_No35","[R]Bord_No36","[R]Bord_No37","[R]Bord_No38","[R]Bord_No39","[R]Bord_No40","[R]Bord_No41","[R]Bord_No42","[R]Bord_No43","[R]Bord_No44","[R]Bord_No45","[R]Bord_No46","[R]Bord_No47","[R]Bord_No48","[R]Bord_No49","[R]Bord_No50","[R]Bord_No51","[R]Bord_No52","[R]Bord_No53","[R]Bord_No54","[R]Bord_No55","[R]Bord_No56","[R]Bord_No57","[R]Bord_No58","[R]Bord_No59","[R]Bord_No60","[R]Bord_No61","[R]Bord_No62","[R]Bord_No63","[R]Bord_No64","[R]Bord_No65","[R]Bord_No66","[R]Bord_No67","[R]Bord_No68","[R]Bord_No69","[R]Bord_No70","[R]Bord_No71","[R]Bord_No72","[R]Bord_No73","[R]Bord_No74","[R]Bord_No75","[R]Bord_No76","[R]Bord_No77","[R]Bord_No78","[R]Bord_No79","[R]Bord_No80","[R]Bord_No81","[R]Bord_No82","[R]Bord_No83","[R]Bord_No84","[R]Bord_No85","[R]Bord_No86","[R]Bord_No87","[R]Bord_No88","[R]Bord_No89","[R]Bord_No90","[R]Bord_No91","[R]Bord_No92","[R]Bord_No93","[R]Bord_No94","[R]Bord_No95","[R]Bord_No96","[R]Bord_No97","[R]Bord_No98","[R]Bord_No99","[R]Bord_No100","[R]Bord_No101","[R]Bord_No102","[R]Bord_No103","[R]Bord_No104","[R]Bord_No105","[R]Bord_No106","[R]Bord_No107","[R]Bord_No108","[R]Bord_No109","[R]Bord_No110","[R]Bord_No111","[R]Bord_No112","[R]Bord_No113","[R]Bord_No114","[R]Bord_No115","[R]Bord_No116","[R]Bord_No117","[R]Bord_No118","[R]Bord_No119","[R]Bord_No120","[R]Bord_No121","[R]Bord_No122","[R]Bord_No123","[R]Bord_No124","[R]Bord_No125","[R]Bord_No126","[R]Bord_No127"],
			//記念系統板(後)
		["[R]TopDoor_Close","[R]TopDoor_Open"]	//貫通路(後)
	],
*/

	//数値設定
	var doorMove = 0.96, //ドア開閉距離(m)
		pantaDistanceF = 7.0, //前パンタ中心の前後位置(m)
		pantaDistanceR = -7.0, //後パンタ中心の前後位置(m)
		YpantaOfsetF = 0.0, //前パンタの上下移動量(m)
		YpantaOfsetR = 0.0, //後パンタの上下移動量(m)
		pantaType = "W51", //パンタ高(Normal:標準-格納 / W51:W51-格納 / Compatible:標準-W51)
		seetType = "Conversion", //座席タイプ(Conversion:転換クロス / Rotation:回転クロス / Long:ロング)
		customButton = 10, //カスタムボタンの個数
		isOneManCar = true, //ワンマンカーとして実装するか
		useBord = false,  //サボを使うか
		AutoExL_8 = [2,3,4,8,9]; //急行灯を自動点灯させる幕番号
		AutoExL_9 = []; //急行灯を自動点灯させるアナウンス番号



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

	var tick = 0;
	if(entity != null){
		tick = renderer.getTick(entity);
	}



	GL11.glPushMatrix();
		render_panta(entity, pantaDistanceF, pantaDistanceR, YpantaOfsetF, YpantaOfsetR, pantaType);
		render_light(entity, pass, st, cb, AutoExL_8, AutoExL_9);
		render_body(entity, pass, st, cb, doorMove, isOneManCar, useBord, seetType);
	GL11.glPopMatrix();

	//## Tick処理 ##
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

	var doorMoveL = 0.0,
		doorMoveR = 0.0,
		door_Cut = 1 - Math.floor(cb[4]);
	
	if(entity != null){
		doorMoveL = entity.doorMoveL / 60 * doorMove * door_Cut;
		doorMoveR = entity.doorMoveR / 60 * doorMove * door_Cut;
	}

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

			if(doorMoveR == 0) doorLa_R[0].render(renderer);
			if(doorMoveL == 0) doorLa_L[0].render(renderer);

			
			render_door(entity, pass, st, cb, doorMoveL, doorMoveR);
			
			render_sign(entity, pass, st, useBord, cb, false);

		GL11.glPopMatrix();
	}

	if(pass == 2){}//Light0テクスチャ描画(前照灯オフ時のみ描画される)

	if(st[11] != 2){
		if(pass == 3){ //Light1テクスチャ描画
		
			GL11.glPushMatrix();
			if(st[5] == 2){
				body.render(renderer);
				passenger[cb[5]].render(renderer);
				if(seetType == "Rotation") render_rotationseat(entity);
				if(seetType == "Conversion") render_conversionseat(entity);
				render_door(entity, pass, st, cb, doorMoveL, doorMoveR);

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

		if(pass == 4){ //Light2テクスチャ描画
				
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

	if(pass == 1){ //半透明描画
		GL11.glPushMatrix();
			if(varsion != "1.7.10"){Packages.jp.ngt.ngtlib.renderer.GLHelper.setBrightness(entity ? entity.func_70070_b() : 0);}
				alpha.render(renderer);
				if(st[5] != 2) alpha_shine.render(renderer);
				render_door(entity, pass, st, cb, doorMoveL, doorMoveR);
		GL11.glPopMatrix();
	}

	if(st[11] != 2){//強制発光
		if(pass < 2){
			GL11.glPushMatrix();
				GLHelper.disableLighting();
				GLHelper.setLightmapMaxBrightness();

					if(st[5] == 2) alpha_shine.render(renderer);

					if(doorMoveR != 0) doorLa_R[1].render(renderer);
					if(doorMoveL != 0) doorLa_L[1].render(renderer);
		
					if(st[11] != 2) render_sign(entity, pass, st, cb, useBord, true);

				GL11.glColor4f(1.0, 1.0, 1.0, 1.0);
				if(varsion=="1.7.10") GLHelper.setBrightness(entity ? entity.func_70070_b(0) : 0);
				else GLHelper.setBrightness(entity ? entity.func_70070_b() : 0);
				GLHelper.enableLighting();
			GL11.glPopMatrix();
		}
	}
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
function render_door(entity, pass, st, cb, doorMoveL, doorMoveR){

	if(pass == 1){

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveL);
			door_LFa.render(renderer);
		GL11.glPopMatrix();
		
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveL);
			door_LBa.render(renderer);
		GL11.glPopMatrix();
		
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveR);
			door_RFa.render(renderer);
		GL11.glPopMatrix();
		
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveR);
			door_RBa.render(renderer);
		GL11.glPopMatrix();

	}else{

		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveL);
			door_LF.render(renderer);
		GL11.glPopMatrix();
		
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveL);
			door_LB.render(renderer);
		GL11.glPopMatrix();
		
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, doorMoveR);
			door_RF.render(renderer);
		GL11.glPopMatrix();
		
		GL11.glPushMatrix();
			GL11.glTranslatef(0.0, 0.0, -doorMoveR);
			door_RB.render(renderer);
		GL11.glPopMatrix();

	}
}

//##### render_転クロ ####################
function render_conversionseat(entity){

	var varsion = MCVersionChecker();

	var seat_r = 0;
	var rotate = 30;
	var pos_r = -0.33;//クロス時の回転軸(デフォルトは0.25)
	if(entity != null){
	 	if(varsion == "1.12.2"){
		 	seat_r = (entity.seatRotation)/2+0.5;
	 	}else{
			seat_r = (entity.seatRotation)/90+0.5;
	 	}
	}

	var stpos_a = 4.14;//最前のグループの最前席の中心座標
	var seatdistance_a = 0.92;//シートピッチ
	var gloupdistance_a = 0;//グループ数ピッチ
	var seatcount_a = 12;//席数
	var gloupcount_a = 1;//グループ数

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
	var pos_r = 0.76;//クロス時の回転軸(デフォルトは0.99)

	if(entity != null){
	 	if(varsion == "1.12.2"){
		 	seat_r = (entity.seatRotation)/2+0.5;
	 	}else{
			seat_r = (entity.seatRotation)/90+0.5;
	 	}
	}

	var stpos_a = 0.09;//最前のグループの最前席の中心座標
	var seatdistance_a = 1.0;//シートピッチ
	var gloupdistance_a = 5.83;//グループ数ピッチ
	var seatcount_a = 9;//席数
	var gloupcount_a = 1;//グループ数

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
				//記念系統版と教習ここ
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
				//記念系統版と教習ここ
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

	var data = LocalData.get(entity);//保存された"データ群"の呼び出し
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
	
	//パンタA1
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
	
	//パンタA2
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
	
	//パンタB1
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
	
	//パンタB2
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
	
	//パンタC1
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
	
	//パンタC2
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
	
	//パンタD1
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
	
	//パンタD2
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


//##### Tick処理 #############################
//Tick処理について:
//Tick処理と描画処理は実行回数が違うため一緒にはできない
//detectTickはスクリプト上で1回のみ実行する必要がある(データ保存の関係で2箇所以上では呼び出せない) → detectTickをshouldUpdateTickに組み込みました
//TileEntityはEntityIdを持たないため、データをスクリプト上の変数に保存する(これは車両などのEntityに応用できます  IDの管理が必要なくなります)

//補完処理について
//補完の変化速度が特に気にならない場合、Tick処理ではなく
function shouldUpdateTick(entity, pass, st11) {
	//-通さない処理-
	if (entity === null) return;
	if (pass !== 0) return;
	if (renderer.currentMatId !== 0) return;//材質でも走査されるため

	//-Tick変化判定(detectTick)-
	var data = LocalData.get(entity);//保存された"データ群"の呼び出し
	var tick = renderer.getTick(entity);
	var prevTick = data.prevTick || 0;//data.○○で呼び出しができる ||の右は初期値
	data.prevTick = tick;
	LocalData.put(entity, data);//データの保存は"データ群"を渡すこと
	if(tick === prevTick) return;

	//### ここからTick処理 ###

	//パンタグラフ状態
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

	//誤差による振動防止
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


	//データ保存
	data.FPantaSt = FPantaSt_pr;
	data.RPantaSt = RPantaSt_pr;
	LocalData.put(entity, data);
}