/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (0)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	window.addEventListener("load", function ()
	{
		console.log("window.onload");
		nWse.stNowLoad.cEnd(null);	// 结束

		nWse.stAsynIcld.cFromApp("nWse",
			[
				"Fsm.js",
				"VtuCsl.js",
				"nUi/PcdrLot.js",
				"nUi/EfcMgr.js"
			]
			,
			fOnIcld);
	});


function fOnIcld(a_Errs)
{
	"use strict";

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stVtuCsl = nWse.stVtuCsl;
	var tFsm = nWse.tFsm;
	var nUi = nWse.nUi;
	var tPcdrLot = nUi.tPcdrLot;
	var tEfc = nUi.tEfc;
	var stEfcMgr = nUi.stEfcMgr;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 示例应用程序

	var tExmApp = nWse.fClass(nApp,
	function tExmApp()
	{
		var l_This = this;
		l_This.e_WidPct = 100;				// 宽度百分比
		l_This.e_PcdrLot = new tPcdrLot();	// 程序化布局

		// 状态机
		l_This.e_Fsm = new tFsm();
		l_This.e_Fsm.cRegSta(new tExmApp.tSta_404(l_This));
		l_This.e_Fsm.cRegSta(new tExmApp.tSta_Home(l_This));
		l_This.e_Fsm.cRegSta(new tExmApp.tSta_News(l_This));
		l_This.e_Fsm.cRegSta(new tExmApp.tSta_Archives(l_This));
		l_This.e_Fsm.cRegSta(new tExmApp.tSta_About(l_This));
		l_This.e_Fsm.cRegSta(new tExmApp.tSta_Contact(l_This));
	},
	null,
	{
		eInit : function ()
		{
			var l_This = this;
			l_This.e_PcdrLot.cPlan({
				c_PutTgt: "k_PutTgt_Lot",
				c_PutSrc: "k_PutSrc_Lot",
				c_WidPct: l_This.e_WidPct,
				c_MinWid: 256,
				c_MaxWid: 2000,
				c_MinHgt: null,	// 同window.innerHeight
				c_BrkPnts: [0, 480, 960],
				c_fBpc : nWse.stFctnUtil.cBindThis(l_This, l_This.cBpc)
			});

		//	l_This.e_PcdrLot.cTheUseBrkPntWid(true);

			l_This.e_PcdrLot.cShowHideGridUi(true);

			// 自定义默认进离动画
			var l_DftEfc = l_This.e_PcdrLot.cAcsDftEfc();
			l_DftEfc.cSetUniDur(0.6);
			l_DftEfc.cSetUniEsn(function (a_Scl)
			{
				//	return a_Scl;
				return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.2, a_Scl, false);
			});

			stEfcMgr.cBind(l_This.e_PcdrLot.cAcsDftEfc())
				.cCssEntBgn_FromRt()
				.cCssLeaEnd_ToRt()
				.cCssEntLea_Fade();

			// 虚拟控制台
			stVtuCsl.cHotKeyUi(true);	// F2快捷键

			// 响应窗口尺寸变化
			nWse.stDomUtil.cAddEvtHdlr_WndRsz(
				function()
				{
					if (l_This.e_PcdrLot)
					{ l_This.e_PcdrLot.cRun(); }
				}, 0.1);	// 1秒更新10次足够了

			//======================== 虚拟控制台

			// 监视
			stVtuCsl.cMonUrlHashChg(true, "nav");

			stVtuCsl.cReg("lot", function (a_Mode, a_Cmd, a_Agms)
			{
				if (stVtuCsl.tHdlMode.i_Help == a_Mode)
				{
					stVtuCsl.cOptLine(a_Agms[0] + " —— 功能：布局。");
					return;
				}

				if (l_This.e_PcdrLot)
				{ l_This.e_PcdrLot.cRun(); }

				stVtuCsl.cOptLine("OK!");
			});

			stVtuCsl.cReg("nav", function (a_Mode, a_Cmd, a_Agms)
			{
				if (stVtuCsl.tHdlMode.i_Help == a_Mode)
				{
					stVtuCsl.cOptLine(a_Agms[0] + " —— 功能：导航。"
						+ "\n参数："
						+ "\nString，分页名，若不提供则回到主页。");
					return;
				}

				// 转换，立即更新（转换是异步的）
				stVtuCsl.cEnsrAgmIsStr(a_Agms, 1, "home");
				if (! l_This.e_Fsm.cAcsSta(a_Agms[1]))	// 如果无效
				{
					// 404
					l_This.e_Fsm.cTsit("404").cUpd();

//					console.log(window.location.hash);	// 【这里？】
//					a_Agms[1] = l_This.e_Fsm.cAcsSta().cGetName();	// 留在当前状态
//					stVtuCsl.cSyncUrlHash(a_Agms);	// 同步URL#

					// 什么都不做的话，错误的URL#会留在历史和地址栏上！
				//	window.history.replaceState(null, null, "#" + a_Agms.join("/").toLowerCase());	// 地址栏√，历史多一条（无法删除）
//					window.history.back();	// 无用，等同于单击后退按钮！
				}	// 无效时保持当前状态
				else
				{
					l_This.e_Fsm.cTsit(a_Agms[1]).cUpd();
					stVtuCsl.cSyncUrlHash(a_Agms);	// 同步URL#
				}

				stVtuCsl.cOptLine("OK!");

				//【BUG】如果用户输错了URL，会导致回退按钮不能后退！H5  replace?
			});
		}
		,
		// 运行
		cRun : function ()
		{
			var l_This = this;

			// 初始动画
			var l_PutTgt_Lot = document.getElementById("k_PutTgt_Lot");

			nWse.stCssUtil.cAnmt(l_PutTgt_Lot,
				{
					"width": l_This.e_WidPct.toString() + "%",		// 百分比
					"height": (window.innerHeight - 10) + "px=",	// 像素，EndStr=""
					"backgroundColor": "rgba(63, 64, 59, 1)="		// 颜色，EndStr=""
				},
				{
					c_Dly: 0,
					c_Dur: 0.4,
					c_fEsn : function (a_Scl)
					{
						return a_Scl;
					},
					c_fOnEnd : function (a_LotPutTgt)
					{
						l_This.eInit();	// 初始化

						nWse.stCssUtil.cAddCssc(nWse.stDomUtil.cAcsBody(), "ctBodyBkgd");
					//	l_PutTgt_Lot.style.backgroundColor = "";	// 清除上面动画的颜色【已并入到a_End】
					//	l_PutTgt_Lot.style.height = "";				// 自动确定

						function fStt()
						{
							// 初始路由
							stVtuCsl.cIptUrlHash();
						}
						fStt();
					//	setTimeout(fStt, 500);	// 延迟？似乎页面加载后的动画能快一点！（心理作用？）
					}
				});


			// 初始布局？在初始动画完成后进行也行！
			//	l_This.e_PcdrLot.cRun();
		}
		,
		cBpc : function (a_Lot)
		{
			var l_BrkPntIdx = a_Lot.cGetBrkPntIdx();
			var l_This = this;
			if (l_This.e_Fsm.cAcsSta())
			{ l_This.e_Fsm.cAcsSta().vcBPC(l_BrkPntIdx); }
		}
	});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 状态

	(function ()
	{
		nWse.fClass(tExmApp,
		/// 基本状态
		function tBaseSta(a_Name, a_App)
		{
			this.odBase(tBaseSta).odCall(a_Name);

			this.d_App = a_App;
		}
		,
		tFsm.atSta
		,
		{
			vcEnt : function f(a_Prev)
			{
				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 运行布局
				l_Lot.cRun();

				// 把主导航的下划线去掉，
				// 注意设为空串更好，以便样式表继续发挥作用，none的话就否决了样式表
				var l_LiAry = nWse.stDomUtil.cQryAll("#k_MainNav>li");
				nWse.stAryUtil.cFor(l_LiAry,
				function (a_Ary, a_Idx, a_Li)
				{ a_Li.style.borderBottom = ""; });
			}
			,
			vcLea : function f(a_Next)
			{
				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;
			}
			,
			vcBPC : function f(a_BrkPntIdx)
			{
				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 主导航斜杠
				l_This.dMainNavSlash(a_BrkPntIdx);
			}
			,
			dMainNavUdln : function (a_Id)
			{
				var l_Li = nWse.stDomUtil.cQryOne("#" + a_Id);
				l_Li.style.borderBottom = "1px solid rgb(181, 193, 173)";
			}
			,
			dMainNavSlash : function (a_BrkPntIdx)
			{
				// 注意斜杠前的空格，与后面的换行（及下行空白）正好形成左右对称的空格
			//	var l_DomNav = document.getElementById("k_MainNav");
				var l_LiAry = nWse.stDomUtil.cQryAll("#k_MainNav>li");
				nWse.stAryUtil.cFor(l_LiAry,
				function (a_Ary, a_Idx, a_Dom_Li)
				{
				//	console.log(a_Dom_Li.nextSibling.textContent);

					if (0 == a_BrkPntIdx)
					{
						if (a_Dom_Li.nextSibling.textContent.indexOf("/") >= 0)
						{ a_Dom_Li.nextSibling.textContent = " "; }
					}
					else
					{
						if (a_Dom_Li.nextSibling.textContent.indexOf("/") < 0)
						{ a_Dom_Li.nextSibling.textContent = " /" + a_Dom_Li.nextSibling.textContent; }
					}
				}, 0, l_LiAry.length - 1);	// 最后一个不加！
			}
			,
			dBPC_LogoBoa : function (a_BrkPntIdx)
			{
				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 徽标板
				l_Lot
					.cBoa({
						c_Id: "k_LogoBoa",
						c_Cssc: "ctLogoBoa_" + a_BrkPntIdx,
						c_ColDvd: (a_BrkPntIdx < 2) ? [null] : [null, null]
					})
					.cCol({
						c_GridTot: (a_BrkPntIdx < 2) ? ((a_BrkPntIdx < 1) ? 4 : 10) : 4
					})
					.cPut({
						c_Id: "k_Logo",
						c_GridIdx: (a_BrkPntIdx < 2) ? ((a_BrkPntIdx < 1) ? 1 : 3) : 0,
						c_GridCnt: (a_BrkPntIdx < 2) ? ((a_BrkPntIdx < 1) ? 2 : 4) : 2,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							a_Efc.c_EntDur = 1.5;
							a_Efc.c_fEntEsn = function (a_Scl)
							{
								return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1, a_Scl, false);
							};

							a_Efc.c_fEntDplc = function (a_Rst, a_DomElmt, a_Bgn, a_End,
														 a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
							{
								var l_C1x = window.innerWidth / 2, l_C1y = Math.abs(a_End.y - a_Bgn.y) / 2;
								var l_C2x = l_C1x, l_C2y = l_C1y;
								nWse.stNumUtil.c2dBzr(a_Rst, [a_Bgn, {x:l_C1x, y:l_C1y}, {x:l_C2x, y:l_C2y}, a_End], a_NmlScl);
							};

							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Lt", "Dn", null, "Up")
								.cCssEntLea_Fade();

							// 来一个持久斜切效果
							function fOn(a_PutTgt, a_Put)
							{
								nWse.stCssUtil.cAnmt(a_Put,
									{
										"Wse_2dTsfm" : [
											{
												c_Name : "skew",
												c_End : { x:0, y:0 },	// 无限进行时忽略，转而使用位移函数
											//#	c_EndStr : "",			// 空串表示不变换，可选"scale(1)"
												c_fDplc : function (a_Rst, a_DomElmt, a_Bgn, a_End,
																	a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
												{
													a_Rst.c_FrmTime += a_FrmItvl;
													a_Rst.x = (Math.PI / 8) * (Math.sin(2 * a_Rst.c_FrmTime));
												}
											}
										]
									},
									{
										c_Dur : -1	// 无限进行
									});
							}

							a_Efc.c_fOnEntEnd = fOn;
							a_Efc.c_fOnRflEnd = fOn;
						}, true)	// 这里不传或传false也没关系，因为每次都会重建配置对象，继而新建特性实例！
					})
					.cCol({		// a_BrkPntIdx>=2时忽略
						c_HtmlTag: "nav",
						c_VticAln: 100
					})
					.cPut({
						c_Id: "k_MainNav",
						c_Cssc : "ctMainNav_" + a_BrkPntIdx
					})
				;

				return this;
			}
		}
		,
		{
			//
		}
		,
		false);
	})();

	(function ()
	{
		nWse.fClass(tExmApp,
		/// 状态 - Home
		function tSta_Home(a_App)
		{
			this.odBase(tSta_Home).odCall("Home", a_App);
		}
		,
		tExmApp.tBaseSta
		,
		{
			vcEnt : function f(a_Prev)
			{
				this.odBase(f).odCall(a_Prev);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 主导航下划线
				this.dMainNavUdln("k_Home");

				// 来一个循环变色效果
				var l_Dom_p = document.getElementById("k_ItroP2");
				if (l_Dom_p)
				{
					l_Dom_p.style.color = "rgb(255,255,255)";
					nWse.stCssUtil.cAnmt(l_Dom_p,
					{
						"color" : "rgb(255,215,0)"
					},
					{
						c_Dur : 2,
						c_Tot : -1,				// 循环播放
						c_EvenCntRvs: true
					});
				}
			}
			,
			vcLea : function f(a_Next)
			{
				this.odBase(f).odCall(a_Next);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;
			}
			,
			vcBPC : function f(a_BrkPntIdx)
			{
				this.odBase(f).odCall(a_BrkPntIdx);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 徽标板
				l_This.dBPC_LogoBoa(a_BrkPntIdx);

				// 介绍板
				l_Lot
					.cBoa({
						c_Id: "k_ItroBoa",
						c_Cssc: "ctItroBoa_" + a_BrkPntIdx,
						c_ColDvd: (a_BrkPntIdx < 2) ? [null] : [null, null]
					})
					.cCol({
						c_GridTot: 5
					})
					.cPut({
						c_Id: "k_BkgdTrg",
						c_GridIdx: 0,
						c_GridCnt: 5,
					//	c_VticOfst: -5,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							//	a_Efc.c_Dur = 10;
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Lt", null, null, null)
								.cCssEntLea_Fade();

							// 来一个持久旋转效果
							function fOn(a_PutTgt, a_Put)
							{
								nWse.stCssUtil.cAnmt(a_Put,
									{
										"Wse_2dTsfm" : [
											{
												c_Name : "rotate",
												c_End : { w:2 * Math.PI },
												c_fDplc : function (a_Rst, a_DomElmt, a_Bgn, a_End,
																	a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
												{
													a_Rst.c_FrmTime += a_FrmItvl;
													var l_a = Math.PI / 12, l_w = Math.PI;
													a_Rst.w = l_a * Math.sin(l_w * a_Rst.c_FrmTime);
												}
											}
										]
									},
									{
										c_Dur : -1	// 无限进行
									});

								window.onkeydown = function (a_Evt)
								{
									if (80 == a_Evt.keyCode)
									{
										nWse.stCssUtil.cPauRsmAnmt(a_Put, ! nWse.stCssUtil.cIsAnmtPau(a_Put));
									}
								}
							}

							a_Efc.c_fOnEntEnd = fOn;
							a_Efc.c_fOnRflEnd = fOn;
						}, true)
					})
					.cCol({	// a_BrkPntIdx>=2时忽略
						c_GridTot: 5
					})
					.cPut({
						c_Id : "k_MainHdn",
						c_Cssc: "ctMainHdn_" + a_BrkPntIdx,
						c_GridCnt: 5,
						c_GridOfst : (a_BrkPntIdx < 2) ? 0 : -1,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo(null, "Up", null, null)
								.cCssEntLea_Fade();

							// 来一个持久缩放效果
							function fOn(a_PutTgt, a_Put)
							{
								nWse.stCssUtil.cAnmt(a_Put,
									{
										"Wse_2dTsfm" : [
											{
												c_Name : "scale",
												c_End : { x:1, y:1 },	// 无限进行时忽略，转而使用位移函数
											//#	c_EndStr : "",			// 空串表示不变换，可选"scale(1)"
												c_fDplc : function (a_Rst, a_DomElmt, a_Bgn, a_End,
																	a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
												{
													a_Rst.c_FrmTime += a_FrmItvl;
													a_Rst.x = a_Rst.y = 1 + 0.2 * Math.abs(Math.sin(2 * a_Rst.c_FrmTime));
												}
											}
										]
									},
									{
										c_Dur : -1	// 无限进行
									});
							}

							a_Efc.c_fOnEntEnd = fOn;
							a_Efc.c_fOnRflEnd = fOn;
						}, true)
					})
					.cPut({
						c_NewRow: true,
						c_Id : "k_ItroCol",
						c_Cssc: "ctItroCol_" + a_BrkPntIdx,
						c_GridIdx: 0,
						c_GridCnt: 5,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo(null, "Up", null, null)
								.cCssEntLea_Fade();
						}, true)
					})
				;

				// 文章板
				l_Lot
					.cBoa({
						c_Id: "k_ArtcBoa",
						c_Cssc: "ctArtcBoa_" + a_BrkPntIdx,
						c_ColDvd: [null]
					})
					.cCol({
						c_GridTot: (a_BrkPntIdx < 2) ? ((a_BrkPntIdx < 1) ? 1 : 2) : 4
					})
					.cPut({
						c_Id : "k_ArtcHdn",
						c_Cssc: "ctArtcHdn_" + a_BrkPntIdx,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Lt", null, null, null)
								.cCssEntLea_Fade()
						}, true)
					})
					.cPut({
						c_Id : "k_More1",
						c_Cssc : "ctArtcSmry",
						c_GridCnt : 1,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Hc", "Vc", null, null)
								.cCssEntLea_Fade()
						}, true)
					})
					.cPut({
						c_Id : "k_More2",
						c_Cssc : "ctArtcSmry",
						c_GridCnt : 1,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Hc", "Vc", null, null)
								.cCssEntLea_Fade()
						}, true)
					})
					.cPut({
						c_Id : "k_More3",
						c_Cssc : "ctArtcSmry",
						c_GridCnt : 1,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Hc", "Vc", null, null)
								.cCssEntLea_Fade()
						}, true)
					})
					.cPut({
						c_Id : "k_More4",
						c_Cssc : "ctArtcSmry",
						c_GridCnt : 1,
						c_Efc : new tEfc(function (a_Efc, a_Lot, a_Put)
						{
							stEfcMgr.cBind(a_Efc)
								.cCssEntLea_FromTo("Hc", "Vc", null, null)
								.cCssEntLea_Fade()
						}, true)
					})
				;

				// 页脚板
				l_Lot
					.cBoa({
						c_Id: "k_FootBoa",
						c_Cssc: "ctFootBoa_" + a_BrkPntIdx,
						c_ColDvd: [null]
					})
					.cCol({
						c_GridTot: (a_BrkPntIdx < 2) ? 1 : 3
					})
					.cPut({
						c_Id: "k_Legal",
						c_Cssc: (a_BrkPntIdx < 2) ? null : "ctLPC",
						c_GridCnt: (a_BrkPntIdx < 2) ? 1 : 1
					})
					.cPut({
						c_Id: "k_Privacy",
						c_Cssc: (a_BrkPntIdx < 2) ? null : "ctLPC",
						c_GridCnt: (a_BrkPntIdx < 2) ? 1 : 1
					})
					.cPut({
						c_Id: "k_Copyright",
						c_Cssc: (a_BrkPntIdx < 2) ? null : "ctLPC",
						c_GridCnt: (a_BrkPntIdx < 2) ? 1 : 1
					})
				;
			}
		}
		,
		{
			//
		}
		,
		false);
	})();

	(function ()
	{
		nWse.fClass(tExmApp,
		/// 状态 - News
		function tSta_News(a_App)
		{
			this.odBase(tSta_News).odCall("News", a_App);
		}
		,
			tExmApp.tBaseSta
		,
		{
			vcEnt: function f(a_Prev)
			{
				this.odBase(f).odCall(a_Prev);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 主导航下划线
				this.dMainNavUdln("k_News")
			},
			vcLea: function f(a_Next)
			{
				this.odBase(f).odCall(a_Next);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;
			},
			vcBPC: function f(a_BrkPntIdx)
			{
				this.odBase(f).odCall(a_BrkPntIdx);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 徽标板
				l_This.dBPC_LogoBoa(a_BrkPntIdx);
			}
		});
	})();

	(function ()
	{
		nWse.fClass(tExmApp,
		/// 状态 - Archives
		function tSta_Archives(a_App)
		{
			this.odBase(tSta_Archives).odCall("Archives", a_App);
		}
		,
		tExmApp.tBaseSta
		,
		{
			vcEnt: function f(a_Prev)
			{
				this.odBase(f).odCall(a_Prev);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 主导航下划线
				this.dMainNavUdln("k_Archives")
			},
			vcLea: function f(a_Next)
			{
				this.odBase(f).odCall(a_Next);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;
			},
			vcBPC: function f(a_BrkPntIdx)
			{
				this.odBase(f).odCall(a_BrkPntIdx);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 徽标板
				l_This.dBPC_LogoBoa(a_BrkPntIdx);
			}
		});
	})();

	(function ()
	{
		nWse.fClass(tExmApp,
		/// 状态 - About
		function tSta_About(a_App)
		{
			this.odBase(tSta_About).odCall("About", a_App);
		}
		,
		tExmApp.tBaseSta
		,
		{
			vcEnt: function f(a_Prev)
			{
				this.odBase(f).odCall(a_Prev);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 主导航下划线
				this.dMainNavUdln("k_About")
			},
			vcLea: function f(a_Next)
			{
				this.odBase(f).odCall(a_Next);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;
			},
			vcBPC: function f(a_BrkPntIdx)
			{
				this.odBase(f).odCall(a_BrkPntIdx);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 徽标板
				l_This.dBPC_LogoBoa(a_BrkPntIdx);
			}
		});
	})();

	(function ()
	{
	nWse.fClass(tExmApp,
		/// 状态 - Contact
		function tSta_Contact(a_App)
		{
			this.odBase(tSta_Contact).odCall("Contact", a_App);
		}
		,
		tExmApp.tBaseSta
		,
		{
			vcEnt: function f(a_Prev)
			{
				this.odBase(f).odCall(a_Prev);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 主导航下划线
				this.dMainNavUdln("k_Contact")
			},
			vcLea: function f(a_Next)
			{
				this.odBase(f).odCall(a_Next);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;
			},
			vcBPC: function f(a_BrkPntIdx)
			{
				this.odBase(f).odCall(a_BrkPntIdx);

				var l_This = this;
				var l_Lot = l_This.d_App.e_PcdrLot;

				// 徽标板
				l_This.dBPC_LogoBoa(a_BrkPntIdx);
			}
		});
	})();

	(function ()
	{
		nWse.fClass(tExmApp,
			/// 状态 - 404
			function tSta_404(a_App)
			{
				this.odBase(tSta_404).odCall("404", a_App);
			}
			,
			tExmApp.tBaseSta
			,
			{
				vcEnt: function f(a_Prev)
				{
					this.odBase(f).odCall(a_Prev);

					var l_This = this;
					var l_Lot = l_This.d_App.e_PcdrLot;
				},
				vcLea: function f(a_Next)
				{
					this.odBase(f).odCall(a_Next);

					var l_This = this;
					var l_Lot = l_This.d_App.e_PcdrLot;
				},
				vcBPC: function f(a_BrkPntIdx)
				{
					this.odBase(f).odCall(a_BrkPntIdx);

					var l_This = this;
					var l_Lot = l_This.d_App.e_PcdrLot;

					l_Lot
						.cBoa({
							c_Id: "k_404Boa"
						})
						.cCol({
							//
						})
						.cPut({
							c_Id : "k_404"
						});
				}
			});
	})();

	var zzz=0;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

	// 示例应用程序
	var e_App = new nApp.tExmApp();
	e_App.cRun();
}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////