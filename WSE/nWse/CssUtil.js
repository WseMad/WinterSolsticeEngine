/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.stCssUtil)
	{
		//@ 避免重复执行相同的初始化代码
	//	console.log("避免重复：CssUtil.js");
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"DomUtil.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("CssUtil.fOnIcld：" + a_Errs);
	
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var unKnl = nWse.unKnl;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var tClo = nWse.tClo;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_TempClo0 = new tClo();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CSS实用静态类

	var stCssUtil;
	(function ()
	{
		/// CSS实用
		stCssUtil = function () { };
		nWse.stCssUtil = stCssUtil;
		stCssUtil.onHost = nWse;
		stCssUtil.oc_FullTpnm = nWse.ocBldFullName("stCssUtil");

		/// 构建全名
		stCssUtil.ocBldFullName = function (a_Name)
		{
			return stCssUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 私有字段

	//	var e_NonIhrtPptys = null;	// 非继承属性
		var e_DomPrn = null;		// 父节点
		var e_BgnStl = null, e_PrnStl = null;	// 样式
		var e_Rst_CalcBgnPV = null;		// eCalcBgnPV的返回值
		var e_Wse_CssExtd = null;		// 扩展CSS
		var e_BrsrPfx_Tsfm = null;		// 浏览器前缀 - transform
		var e_MaySupt3dTsfm = null;		// 可能支持3D变换？
		var e_AxisRad = null;			// 轴弧度

		//======== 私有函数

//		function eInitNonIhrtPptys()
//		{
//			if (e_NonIhrtPptys)
//			{ return; }
//
//			e_NonIhrtPptys["transform"] = true;
//		}

		function eInitWse_CssExtd()
		{
			if (e_Wse_CssExtd)
			{ return; }

			e_Wse_CssExtd = {
				i_2dTsfm : 20000,
				"scale" : 20001,
				"skew" : 20002,
				"rotate" : 20003,
				"translate" : 20004,
				i_3dTsfm : 30000,
				"perspective": 30001,
				"scale3d" : 30002,
				"rotate3d" : 30003,
				"translate3d" : 30004
			};
		}

		function eInitBrsrPfx_Tsfm()
		{
			if (null !== e_BrsrPfx_Tsfm) // 已初始化？注意即使是空串，也与null不等
			{ return; }

			e_AxisRad = { x:0, y:0, z:0, w:0 };	// 新建

			var l_Stl = document.documentElement.style;
			if ("transform" in l_Stl)
			{ e_BrsrPfx_Tsfm = "transform"; }
			else
			if ("webkitTransform" in l_Stl)
			{ e_BrsrPfx_Tsfm = "webkitTransform"; }
			else
			if ("mozTransform" in l_Stl)
			{ e_BrsrPfx_Tsfm = "mozTransform"; }
			else
			if ("msTransform" in l_Stl)
			{ e_BrsrPfx_Tsfm = "msTransform"; }
			else
			if ("OTransform" in l_Stl)
			{ e_BrsrPfx_Tsfm = "OTransform"; }
			else
			{ e_BrsrPfx_Tsfm = ""; } // 空串表示不支持
		}

		function eIsWse_Css_TypeIdx(a_Idx)
		{
			return (10000 <= a_Idx);
		}

		function eToCssUnit(a_Val)
		{
			return	nWse.fIsNum(a_Val) 
					? (a_Val.toString() + "px")
					: (a_Val || "");	// 用空串，以便样式表发挥作用！
		}

		function eDftAgm(a_Agms)
		{
			if (1 == a_Agms.length)	// a_DomElmt
			{
				a_Agms[1] = a_Agms[2] = a_Agms[3] = a_Agms[4] = "0";
			}
			else
			if (2 == a_Agms.length)	// a_DomElmt, a_Tp
			{
				a_Agms[4] = a_Agms[2] = a_Agms[3] = a_Agms[1];
			}
			else
			if (3 == a_Agms.length)	// a_DomElmt, a_Tp, a_Rt
			{
				a_Agms[4] = a_Agms[2];
				a_Agms[3] = a_Agms[1];
			}
			else
			if (4 == a_Agms.length)	// a_DomElmt, a_Tp, a_Rt, a_Dn
			{
				a_Agms[4] = a_Agms[2];
			}
		}

		function eGetCmptStl(a_DomElmt)
		{
			var l_DftView = document.defaultView;
			return (l_DftView && l_DftView.getComputedStyle && l_DftView.getComputedStyle(a_DomElmt, null)) || a_DomElmt.currentStyle;
		}

		function eGetMgn(a_Rst, a_CmptStl, a_AlnPxl)
		{
			a_Rst.c_MgnLt = parseFloat(a_CmptStl.marginLeft);
			a_Rst.c_MgnRt = parseFloat(a_CmptStl.marginRight);
			a_Rst.c_MgnTp = parseFloat(a_CmptStl.marginTop);
			a_Rst.c_MgnBm = parseFloat(a_CmptStl.marginBottom);
			if (a_AlnPxl)
			{
				a_Rst.c_MgnLt = Math.round(a_Rst.c_MgnLt);
				a_Rst.c_MgnRt = Math.round(a_Rst.c_MgnRt);
				a_Rst.c_MgnTp = Math.round(a_Rst.c_MgnTp);
				a_Rst.c_MgnBm = Math.round(a_Rst.c_MgnBm);
			}
		}

		function eCalcBdrThk(a_Val)
		{
			if ("thin" == a_Val) { return 1; }
			if ("medium" == a_Val) { return 3; }
			if ("thick" == a_Val) { return 5; }

			return parseFloat(a_Val);
		}

		function eGetBdrThk(a_Rst, a_CmptStl, a_AlnPxl)
		{
			a_Rst.c_BdrThkLt = eCalcBdrThk(a_CmptStl.borderLeftWidth);
			a_Rst.c_BdrThkRt = eCalcBdrThk(a_CmptStl.borderRightWidth);
			a_Rst.c_BdrThkTp = eCalcBdrThk(a_CmptStl.borderTopWidth);
			a_Rst.c_BdrThkBm = eCalcBdrThk(a_CmptStl.borderBottomWidth);
			if (a_AlnPxl)
			{
				a_Rst.c_BdrThkLt = Math.round(a_Rst.c_BdrThkLt);
				a_Rst.c_BdrThkRt = Math.round(a_Rst.c_BdrThkRt);
				a_Rst.c_BdrThkTp = Math.round(a_Rst.c_BdrThkTp);
				a_Rst.c_BdrThkBm = Math.round(a_Rst.c_BdrThkBm);
			}
		}

		function eGetBdrRds(a_Rst, a_CmptStl, a_AlnPxl)
		{
			a_Rst.c_BdrRdsLtTp = parseFloat(a_CmptStl.borderTopLeftRadius);
			a_Rst.c_BdrRdsRtTp = parseFloat(a_CmptStl.borderTopRightRadius);
			a_Rst.c_BdrRdsLtBm = parseFloat(a_CmptStl.borderBottomLeftRadius);
			a_Rst.c_BdrRdsRtBm = parseFloat(a_CmptStl.borderBottomRightRadius);
			if (a_AlnPxl)
			{
				a_Rst.c_BdrRdsLtTp = Math.round(a_Rst.c_BdrRdsLtTp);
				a_Rst.c_BdrRdsRtTp = Math.round(a_Rst.c_BdrRdsRtTp);
				a_Rst.c_BdrRdsLtBm = Math.round(a_Rst.c_BdrRdsLtBm);
				a_Rst.c_BdrRdsRtBm = Math.round(a_Rst.c_BdrRdsRtBm);
			}
		}

		function eGetPad(a_Rst, a_CmptStl, a_AlnPxl)
		{
			a_Rst.c_PadLt = parseFloat(a_CmptStl.paddingLeft);
			a_Rst.c_PadRt = parseFloat(a_CmptStl.paddingRight);
			a_Rst.c_PadTp = parseFloat(a_CmptStl.paddingTop);
			a_Rst.c_PadBm = parseFloat(a_CmptStl.paddingBottom);
			if (a_AlnPxl)
			{
				a_Rst.c_PadLt = Math.round(a_Rst.c_PadLt);
				a_Rst.c_PadRt = Math.round(a_Rst.c_PadRt);
				a_Rst.c_PadTp = Math.round(a_Rst.c_PadTp);
				a_Rst.c_PadBm = Math.round(a_Rst.c_PadBm);
			}
		}

		function eGetCtntWid(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			// 不用对齐像素，因为当a_AlnPxl为true时，相关数据已对齐像素
			a_Rst.c_CtntWid = a_DomElmt.offsetWidth - a_Rst.c_BdrThkLt - a_Rst.c_PadLt - a_Rst.c_PadRt - a_Rst.c_BdrThkRt;
		}

		function eGetCtntHgt(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			// 不用对齐像素，因为当a_AlnPxl为true时，相关数据已对齐像素
			a_Rst.c_CtntHgt = a_DomElmt.offsetHeight - a_Rst.c_BdrThkTp - a_Rst.c_PadTp - a_Rst.c_PadBm - a_Rst.c_BdrThkBm;
		}

		function eGetMinMaxWidHgt(a_Rst, a_CmptStl)
		{
			a_Rst.c_MinWid = parseFloat(a_CmptStl.minWidth); 	if (isNaN(a_Rst.c_MinWid)) { a_Rst.c_MinWid = 0; }
			a_Rst.c_MaxWid = parseFloat(a_CmptStl.maxWidth);	if (isNaN(a_Rst.c_MaxWid)) { a_Rst.c_MaxWid = Number.MAX_VALUE; }
			a_Rst.c_MinHgt = parseFloat(a_CmptStl.minHeight);	if (isNaN(a_Rst.c_MinHgt)) { a_Rst.c_MinHgt = 0; }
			a_Rst.c_MaxHgt = parseFloat(a_CmptStl.maxHeight);	if (isNaN(a_Rst.c_MaxHgt)) { a_Rst.c_MaxHgt = Number.MAX_VALUE; }
		}

		function eSplCssc(a_Cssc)
		{
			var i_Rgx = /\s+/;
			return a_Cssc.split(i_Rgx);
		}

		// 跳到动画最后
		function eJumpToAnmtEnd(a_DomElmt, a_Rvs)
		{
			stDomUtil.eJumpToAnmtEnd_Shr(true, a_DomElmt, a_Rvs,
				function (a_DomElmt, a_PN, a_Item)
				{
					var l_SV = a_Rvs ? a_Item.c_BgnStr : a_Item.c_EndStr;
					if (0 == a_PN.indexOf("Wse_")) //【注意】l_PN可能是扩展动画名，比如“Wse_2dTsfm”
					{
						//【将来扩展】目前，扩展动画只有变换，所以不用分支检测
						a_DomElmt.style[e_BrsrPfx_Tsfm] = l_SV;
					}
					else
					{
						a_DomElmt.style[a_PN] = l_SV;
					}
				});
		}

		function eGnrtAnmtFctn(a_DomElmt)
		{
			var l_X, l_Y, l_V, l_M; // 闭包里的变量，唯一于生成的函数
			return stDomUtil.eGnrtAnmtFctn_Shr(true, a_DomElmt,
				function (a_DomElmt, a_fAnmt)
				{
					l_X = a_fAnmt.Wse_Sp.x;
					l_Y = a_fAnmt.Wse_Sp.y;
				},
				function (a_DomElmt, a_fAnmt, a_PN, a_Bgn, a_End,
						  a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
				{
					if (eIsWse_Css_TypeIdx(a_Item.c_TypeIdx))	// 冬至引擎扩展CSS
					{
						eAnmtWse_CssExtd(a_DomElmt, a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
					}
					else
					if (6 == a_Item.c_TypeIdx)	// 颜色
					{
						l_V = tClo.scLnrItp(s_TempClo0, a_Bgn, a_End, a_EsnScl);
						a_DomElmt.style[a_PN] = tClo.scToCssCloStr(l_V);
					}
					else // 其他
					{
						l_V = l_M = stNumUtil.cLnrItp(a_Bgn, a_End, a_EsnScl);
						if ((2 == a_Item.c_TypeIdx) || (3 == a_Item.c_TypeIdx)) // 像素和百分比的中间过程皆用像素
						{ l_V = l_V.toString() + "px"; }
						a_DomElmt.style[a_PN] = l_V.toString();

						// 如果有left和/或top，更新当前值
						if (a_fAnmt.Wse_HasLeft && ("left" == a_PN))
						{ l_X = l_M; }
						else
						if (a_fAnmt.Wse_HasTop && ("top" == a_PN))
						{ l_Y = l_M; }
					}
				},
				function (a_DomElmt, a_fAnmt, a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
				{
					// 专门处理left和top
					if (a_fAnmt.Wse_HasDplc)
					{
						a_fAnmt.Wse_Pos.x = l_X;	// 从当前位置开始
						a_fAnmt.Wse_Pos.y = l_Y;
						if (a_Cfg.c_fDplc)			// 可以被c_fDplc改写
						{
							a_Cfg.c_fDplc(a_fAnmt.Wse_Pos, a_DomElmt,
								(a_Rvs ? a_fAnmt.Wse_Tp : a_fAnmt.Wse_Sp),
								(a_Rvs ? a_fAnmt.Wse_Sp : a_fAnmt.Wse_Tp),
								a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
						}

						a_DomElmt.style["left"] = a_fAnmt.Wse_Pos.x.toString() + "px";
						a_DomElmt.style["top"]  = a_fAnmt.Wse_Pos.y.toString() + "px";
					}
				},
				eJumpToAnmtEnd, stCssUtil.cFnshAnmt);
		}

		function eAnmtWse_CssExtd(a_DomElmt, a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur,
							  a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
		{
			// 变换
			if (e_Wse_CssExtd.i_2dTsfm == a_Item.c_TypeIdx)
			{ eAnmtWse_CssExtd_2dTsfm.apply(null, arguments); }
			else
			if (e_Wse_CssExtd.i_3dTsfm == a_Item.c_TypeIdx)
			{ eAnmtWse_CssExtd_3dTsfm.apply(null, arguments); }
		}

		function eLnrItp_Dim(a_Rst, a_Bgn, a_End, a_Scl, a_Dim)
		{
			var l_f = stNumUtil.cLnrItp;
			a_Rst.x = l_f(a_Bgn.x, a_End.x, a_Scl);
			a_Rst.y = l_f(a_Bgn.y, a_End.y, a_Scl);
			if (3 == a_Dim)
			{ a_Rst.z = l_f(a_Bgn.z, a_End.z, a_Scl); }
		}

		function eAnmtWse_CssExtd_2dTsfm(a_DomElmt, a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur,
							a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
		{
			var l_CUT = a_DomElmt.Wse_CssUtil.c_2dTsfm;
			var l_Item = a_Item, l_EsnScl = a_EsnScl;
			var l_Sqnc = l_Item.c_Sqnc;
			var l_CssStr = "";
			var l_Bgn, l_End;

			stAryUtil.cFor(l_Sqnc,
			function (a_Ary, a_Idx, a_Tsfm)
			{
				var l_Tsfm = a_Tsfm;
				if (a_Rvs)	// 需要反转始终值
				{
					l_Bgn = l_Tsfm.c_End;
					l_End = l_Tsfm.c_Bgn;
				}
				else
				{
					l_Bgn = l_Tsfm.c_Bgn;
					l_End = l_Tsfm.c_End;
				}

				if (e_Wse_CssExtd["scale"] == l_Tsfm.c_TypeIdx)
				{
					if (l_Tsfm.c_fDplc)
					{ l_Tsfm.c_fDplc(l_CUT.c_Scl, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
					else
					{ eLnrItp_Dim(l_CUT.c_Scl, l_Bgn, l_End, l_EsnScl, 2); }

					l_CssStr = eBldTsfmCssStr(l_CssStr, "scale", l_CUT.c_Scl, "", 2);
				}
				else
				if (e_Wse_CssExtd["skew"] == l_Tsfm.c_TypeIdx)
				{
					if (l_Tsfm.c_fDplc)
					{ l_Tsfm.c_fDplc(l_CUT.c_Skew, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
					else
					{ eLnrItp_Dim(l_CUT.c_Skew, l_Bgn, l_End, l_EsnScl, 2); }

					l_CssStr = eBldTsfmCssStr(l_CssStr, "skew", l_CUT.c_Skew, "rad", 2);
				}
				else
				if (e_Wse_CssExtd["rotate"] == l_Tsfm.c_TypeIdx)
				{
					if (l_Tsfm.c_fDplc)
					{ l_Tsfm.c_fDplc(l_CUT.c_Rot, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
					else
					{ l_CUT.c_Rot.w = stNumUtil.cLnrItp(l_Bgn.w, l_End.w, l_EsnScl); }

					l_CUT.c_Rot.w = stNumUtil.cNmlzRad(l_CUT.c_Rot.w, false);	// 标准化
					l_CssStr = eBldTsfmCssStr(l_CssStr, "rotate", l_CUT.c_Rot.w, "rad", 1);
				}
				else
			//	if (e_Wse_CssExtd["translate"] == l_Tsfm.c_TypeIdx)
				{
					if (l_Tsfm.c_fDplc)
					{ l_Tsfm.c_fDplc(l_CUT.c_Tslt, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
					else
					{ eLnrItp_Dim(l_CUT.c_Tslt, l_Bgn, l_End, l_EsnScl, 2); }

					l_CssStr = eBldTsfmCssStr(l_CssStr, "translate", l_CUT.c_Tslt, "px", 2);
				}
			});

			// 写成样式
			a_DomElmt.style[e_BrsrPfx_Tsfm] = l_CssStr;
		}

		function eAnmtWse_CssExtd_3dTsfm(a_DomElmt, a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur,
										 a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
		{
			var l_CUT = a_DomElmt.Wse_CssUtil.c_3dTsfm;
			var l_Item = a_Item, l_EsnScl = a_EsnScl;
			var l_Sqnc = l_Item.c_Sqnc;
			var l_CssStr = "";
			var l_Bgn, l_End;

			stAryUtil.cFor(l_Sqnc,
				function (a_Ary, a_Idx, a_Tsfm)
				{
					var l_Tsfm = a_Tsfm;
					if (a_Rvs)	// 需要反转始终值
					{
						l_Bgn = l_Tsfm.c_End;
						l_End = l_Tsfm.c_Bgn;
					}
					else
					{
						l_Bgn = l_Tsfm.c_Bgn;
						l_End = l_Tsfm.c_End;
					}

					if (e_Wse_CssExtd["perspective"] == l_Tsfm.c_TypeIdx)
					{
						if (l_Tsfm.c_fDplc)
						{ l_Tsfm.c_fDplc(l_CUT.c_Pspc, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
						else
						{ l_CUT.c_Pspc.d = stNumUtil.cLnrItp(l_Bgn.d, l_End.d, l_EsnScl); }

						l_CssStr = eBldTsfmCssStr(l_CssStr, "perspective", l_CUT.c_Pspc.d, "px", 1);
					}
					else
					if (e_Wse_CssExtd["scale3d"] == l_Tsfm.c_TypeIdx)
					{
						if (l_Tsfm.c_fDplc)
						{ l_Tsfm.c_fDplc(l_CUT.c_Scl, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
						else
						{ eLnrItp_Dim(l_CUT.c_Scl, l_Bgn, l_End, l_EsnScl, 3); }

						l_CssStr = eBldTsfmCssStr(l_CssStr, "scale3d", l_CUT.c_Scl, "", 3);
					}
					else
					if (e_Wse_CssExtd["rotate3d"] == l_Tsfm.c_TypeIdx)
					{
						if (l_Tsfm.c_fDplc)
						{ l_Tsfm.c_fDplc(l_CUT.c_Rot, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
						else // 球面线性插值
						{ stNumUtil.cQtnSlerp(l_CUT.c_Rot, l_Bgn, l_End, l_EsnScl); }

						stNumUtil.cAxisRadFromQtn(e_AxisRad, l_CUT.c_Rot);	// 取得轴弧度，不是四元数但无妨
						if (eNzQtn(e_AxisRad))
						{ l_CssStr = eBldTsfmCssStr(l_CssStr, "rotate3d", e_AxisRad, null, 4); }
					}
					else
				//	if (e_Wse_CssExtd["translate3d"] == l_Tsfm.c_TypeIdx)
					{
						if (l_Tsfm.c_fDplc)
						{ l_Tsfm.c_fDplc(l_CUT.c_Tslt, a_DomElmt, l_Bgn, l_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum); }
						else
						{ eLnrItp_Dim(l_CUT.c_Tslt, l_Bgn, l_End, l_EsnScl, 3); }

						l_CssStr = eBldTsfmCssStr(l_CssStr, "translate3d", l_CUT.c_Tslt, "px", 3);
					}
				});

			// 写成样式
			a_DomElmt.style[e_BrsrPfx_Tsfm] = l_CssStr;
		}

		function eEnsrExtdAnmtTsfm(a_DomElmt, a_Dim)
		{
			if (! a_DomElmt.Wse_CssUtil)
			{ a_DomElmt.Wse_CssUtil = {}; }

			if (((2 == a_Dim) && (! a_DomElmt.Wse_CssUtil.c_2dTsfm)) ||
				((3 == a_Dim) && (! a_DomElmt.Wse_CssUtil.c_3dTsfm)))
			{
				eRsetExtdAnmtTsfmData(a_DomElmt, a_Dim);
			}
		}

		function eRsetExtdAnmtTsfmData(a_DomElmt, a_Dim)
		{
			if (! a_DomElmt.Wse_CssUtil)
			{ a_DomElmt.Wse_CssUtil = {}; }

			if (2 == a_Dim)
			{
				a_DomElmt.Wse_CssUtil.c_2dTsfm = {
					c_Scl : { x:1, y:1, c_FrmTime:0 },
					c_Skew : { x:0, y:0, c_FrmTime:0 },
					c_Rot : { w:0, c_FrmTime:0 },
					c_Tslt : { x:0, y:0, c_FrmTime:0 }
				};
			}
			else
			if (3 == a_Dim)
			{
				a_DomElmt.Wse_CssUtil.c_3dTsfm = {
					c_Scl : { x:1, y:1, z:1, c_FrmTime:0 },
					c_Rot : { x:0, y:0, z:0, w:1, c_FrmTime:0 },	// 四元数
					c_Tslt : { x:0, y:0, z:0, c_FrmTime:0 },
					c_Pspc : { d: null, c_FrmTime:0 }
				};
			}
		}

		//======== 公有函数

		/// 获取计算样式
		/// 返回：计算样式
		stCssUtil.cGetCmptStl = function (a_DomElmt)
		{
			return eGetCmptStl(a_DomElmt);
		};

		/// 获取离文档计算样式
		/// a_DomElmt：HTMLElement，元素，必须离文档
		/// a_DomTgtPrn：HTMLElement，目标父节点，即a_DomElmt将作为其子节点的节点，必须在文档中，默认<body>
		/// a_fCabk：void f(a_DomElmt, a_CmptStl)，在这里可以获取元素属性，此时元素在文档中
		/// a_CssPos：String，CSS定位，默认"static"
		/// a_CssVsb：String，CSS可见性，默认"visible"
		/// 返回：计算样式
		stCssUtil.cGetOffDocCmptStl = function (a_DomElmt, a_DomTgtPrn, a_fCabk, a_CssPos, a_CssVsb)
		{
			a_DomTgtPrn = a_DomTgtPrn || stDomUtil.cAcsBody();

			var l_DomOrigPrn = a_DomElmt.parentNode;
			var l_OrigChdIdx = l_DomOrigPrn ? stDomUtil.cFindChd(l_DomOrigPrn, a_DomElmt) : -1;

			a_DomElmt.style.visibility = "hidden";		// 不可见
			a_DomElmt.style.position = "fixed";			// 脱离文档流
			a_DomTgtPrn.appendChild(a_DomElmt);

			var l_Rst;
			try
			{
				l_Rst = eGetCmptStl(a_DomElmt);
				if (a_fCabk)
				{ a_fCabk(a_DomElmt, l_Rst); }
			}
			finally
			{
				a_DomTgtPrn.removeChild(a_DomElmt);
				a_DomElmt.style.position = a_CssPos || "";
				a_DomElmt.style.visibility = a_CssVsb || "";

				if (l_DomOrigPrn)
				{
					(l_OrigChdIdx < l_DomOrigPrn.childNodes.length)
					? l_DomOrigPrn.insertBefore(a_DomElmt, l_DomOrigPrn.childNodes[l_OrigChdIdx])
					: l_DomOrigPrn.appendChild(a_DomElmt);
				}
			}
			return l_Rst;
		};

		/// 获取z-index
		/// 返回：Number
		stCssUtil.cGetZidx = function (a_DomElmt, a_CmptStl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			return parseInt(a_CmptStl.zIndex);
		};

		/// 获取外边距
		/// a_Rst：Object
		/// {
		///	c_MgnLt，c_MgnRt，c_MgnTp，c_MgnBm：Number，像素
		/// }
		/// a_DomElmt：HTMLElement
		/// a_CmptStl：计算样式，如不提供则现计算
		/// a_AlnPxl：Boolean，对齐像素？
		/// 返回：a_Rst
		stCssUtil.cGetMgn = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			eGetMgn(a_Rst, a_CmptStl, a_AlnPxl);
			return a_Rst;
		};

		/// 获取边框厚度
		/// a_Rst：Object
		/// {
		///	c_BdrThkLt，c_BdrThkRt，c_BdrThkTp，c_BdrThkBm：Number，像素
		/// }
		stCssUtil.cGetBdrThk = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			eGetBdrThk(a_Rst, a_CmptStl, a_AlnPxl);
			return a_Rst;
		};

		/// 获取边框半径
		/// a_Rst：Object
		/// {
		///	c_BdrRdsLtTp，c_BdrRdsRtTp，c_BdrRdsLtBm，c_BdrRdsRtBm：Number，像素
		/// }
		stCssUtil.cGetBdrRds = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			eGetBdrRds(a_Rst, a_CmptStl, a_AlnPxl);
			return a_Rst;
		};

		/// 获取内边距
		/// a_Rst：Object
		/// {
		///	c_PadLt，c_PadRt，c_PadTp，c_PadBm：Number，像素
		/// }
		stCssUtil.cGetPad = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			eGetPad(a_Rst, a_CmptStl, a_AlnPxl);
			return a_Rst;
		};

		/// 获取内容宽度（减去边框和内边距），【注意】a_DomElmt.offsetWidth必须有效！
		/// a_Rst：Object
		/// {
		/// c_BdrThkLt，c_BdrThkRt，c_BdrThkTp，c_BdrThkBm：Number，像素
		///	c_PadLt，c_PadRt，c_PadTp，c_PadBm：Number，像素
		/// c_CtntWid：Number，像素
		/// }
		stCssUtil.cGetCtntWid = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			stCssUtil.cGetBdrThk(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			stCssUtil.cGetPad(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			eGetCtntWid(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			return a_Rst;
		};

		/// 获取内容高度（减去边框和内边距），【注意】a_DomElmt.offsetHeight必须有效！
		/// a_Rst：Object
		/// {
		/// c_BdrThkLt，c_BdrThkRt，c_BdrThkTp，c_BdrThkBm：Number，像素
		///	c_PadLt，c_PadRt，c_PadTp，c_PadBm：Number，像素
		/// c_CtntHgt：Number，像素
		/// }
		stCssUtil.cGetCtntHgt = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			stCssUtil.cGetBdrThk(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			stCssUtil.cGetPad(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			eGetCtntHgt(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			return a_Rst;
		};

		/// 获取盒模型
		/// a_Rst：除了含有cGetCtntWid()和cGetCtntHgt()所含的一切外，
		/// 还会追加：c_HrztMgn，c_HrztBdrThk，c_HrztPad，c_HrztMbp，c_VticMgn，c_VticBdrThk，c_VticPad，c_VticMbp
		stCssUtil.cGetBoxMdl = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			stCssUtil.cGetMgn(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			stCssUtil.cGetBdrThk(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			stCssUtil.cGetPad(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			eGetCtntWid(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);
			eGetCtntHgt(a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl);

			a_Rst.c_HrztMgn = a_Rst.c_MgnLt + a_Rst.c_MgnRt;
			a_Rst.c_HrztBdrThk = a_Rst.c_BdrThkLt + a_Rst.c_BdrThkRt;
			a_Rst.c_HrztPad = a_Rst.c_PadLt + a_Rst.c_PadRt;
			a_Rst.c_HrztMbp = a_Rst.c_HrztMgn + a_Rst.c_HrztBdrThk + a_Rst.c_HrztPad;

			a_Rst.c_VticMgn = a_Rst.c_MgnTp + a_Rst.c_MgnBm;
			a_Rst.c_VticBdrThk = a_Rst.c_BdrThkTp + a_Rst.c_BdrThkBm;
			a_Rst.c_VticPad = a_Rst.c_PadTp + a_Rst.c_PadBm;
			a_Rst.c_VticMbp = a_Rst.c_VticMgn + a_Rst.c_VticBdrThk + a_Rst.c_VticPad;
			return a_Rst;
		};

		/// 获取位置
		/// a_Rst：Object
		/// {
		/// c_Lt，c_Tp：Number，像素
		/// }
		stCssUtil.cGetPos = function (a_Rst, a_DomElmt, a_CmptStl, a_AlnPxl)
		{
			a_CmptStl = a_CmptStl || eGetCmptStl(a_DomElmt);
			a_Rst.c_Lt = parseFloat(a_CmptStl.left);
			a_Rst.c_Tp = parseFloat(a_CmptStl.top);
			if (a_AlnPxl)
			{
				a_Rst.c_Lt = Math.round(a_Rst.c_Lt);
				a_Rst.c_Tp = Math.round(a_Rst.c_Tp);
			}
			return a_Rst;
		};

		/// 清零外边距、边框、内边距
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cZeroMbp = function (a_DomElmt)
		{
			a_DomElmt.style.margin = "0";
			a_DomElmt.style.borderWidth = "0";
			a_DomElmt.style.padding = "0";
			return stCssUtil;
		};

		/// 设置位置
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetPos = function (a_DomElmt, a_Lt, a_Tp)
		{
			a_DomElmt.style.left = eToCssUnit(a_Lt);
			a_DomElmt.style.top = eToCssUnit(a_Tp);
			return stCssUtil;
		};

		/// 设置位置左
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetPosLt = function (a_DomElmt, a_Lt)
		{
			a_DomElmt.style.left = eToCssUnit(a_Lt);
			return stCssUtil;
		};

		/// 设置位置上
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetPosTp = function (a_DomElmt, a_Tp)
		{
			a_DomElmt.style.top = eToCssUnit(a_Tp);
			return stCssUtil;
		};

		/// 设置尺寸
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetDim = function (a_DomElmt, a_Wid, a_Hgt)
		{
			a_DomElmt.style.width  = eToCssUnit(a_Wid);
			a_DomElmt.style.height = eToCssUnit(a_Hgt);
			return stCssUtil;
		};

		/// 设置尺寸宽
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetDimWid = function (a_DomElmt, a_Wid)
		{
			a_DomElmt.style.width  = eToCssUnit(a_Wid);
			return stCssUtil;
		};

		/// 设置尺寸高
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetDimHgt = function (a_DomElmt, a_Hgt)
		{
			a_DomElmt.style.height = eToCssUnit(a_Hgt);
			return stCssUtil;
		};

		/// 设置位置尺寸
		stCssUtil.cSetPosDim = function (a_DomElmt, a_Lt, a_Tp, a_Wid, a_Hgt)
		{
			return stCssUtil.cSetPos(a_DomElmt, a_Lt, a_Tp).cSetDim(a_DomElmt, a_Wid, a_Hgt);
		};

		/// 设置外边距
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetMgn = function (a_DomElmt, a_Tp, a_Rt, a_Dn, a_Lt)
		{
			eDftAgm(arguments);
			a_DomElmt.style.marginTop = eToCssUnit(arguments[1]);
			a_DomElmt.style.marginRight = eToCssUnit(arguments[2]);
			a_DomElmt.style.marginBottom = eToCssUnit(arguments[3]);
			a_DomElmt.style.marginLeft = eToCssUnit(arguments[4]);
			return stCssUtil;
		};

		/// 设置边框宽度
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetBdrWid = function (a_DomElmt, a_Tp, a_Rt, a_Dn, a_Lt)
		{
			eDftAgm(arguments);
			a_DomElmt.style.borderTopWidth = eToCssUnit(arguments[1]);
			a_DomElmt.style.borderRightWidth = eToCssUnit(arguments[2]);
			a_DomElmt.style.borderBottomWidth = eToCssUnit(arguments[3]);
			a_DomElmt.style.borderLeftWidth = eToCssUnit(arguments[4]);
			return stCssUtil;
		};

		/// 设置内边距
		/// a_DomElmt：HTMLElement
		/// 返回：stCssUtil
		stCssUtil.cSetPad = function (a_DomElmt, a_Tp, a_Rt, a_Dn, a_Lt)
		{
			eDftAgm(arguments);
			a_DomElmt.style.paddingTop = eToCssUnit(arguments[1]);
			a_DomElmt.style.paddingRight = eToCssUnit(arguments[2]);
			a_DomElmt.style.paddingBottom = eToCssUnit(arguments[3]);
			a_DomElmt.style.paddingLeft = eToCssUnit(arguments[4]);
			return stCssUtil;
		};

		/// 设置颜色
		/// a_DomElmt：HTMLElement
		/// a_Which：String，哪个颜色？
		/// 返回：stCssUtil
		stCssUtil.cSetClo = function (a_DomElmt, a_Which, a_R, a_G, a_B, a_A)
		{
			a_DomElmt.style[a_Which] = ((undefined === a_A) || (1 == a_A))
				? ("rgb(" + a_R + "," + a_G + "," + a_B)
				: ("rgba(" + a_R + "," + a_G + "," + a_B + "," + a_A);
			return stCssUtil;
		};

		/// 显示但不可见
		/// a_Fnsh：Boolean，完成？奇数次调用传false，偶数次传true，总是配对！
		/// a_Dspl：String，显示值，仅当a_Fnsh为false时有意义，默认"block"
		/// a_VsblOnFnsh：String，仅当a_Fnsh为true时有意义，默认空串（为了由样式表控制可见性）
		stCssUtil.cDsplButIvsb = function (a_DomElmt, a_Fnsh, a_Dspl, a_VsblOnFnsh)
		{
			if (a_Fnsh)
			{
				a_DomElmt.style.visibility = a_VsblOnFnsh ? a_VsblOnFnsh : "";
			}
			else
			{
				a_DomElmt.style.visibility = "hidden";
				a_DomElmt.style.display = a_Dspl || "block";
			}
			return stCssUtil;
		};

		/// 是否有样式类？
		/// a_Cssc：String，样式类，不能有空格
		stCssUtil.cHasCssc = function (a_DomElmt, a_Cssc)
		{
			if (! a_Cssc)
			{ return false; }

			var l_CnAry;
			if (a_DomElmt.classList)
			{
				return a_DomElmt.classList.contains(a_Cssc);
			}
			else
			{
				l_CnAry = stCssUtil.cGetCssc(a_DomElmt);
				return (l_CnAry.indexOf(a_Cssc) >= 0);
			}
		};

		/// 获取样式类
		/// 返回：String[]
		stCssUtil.cGetCssc = function (a_DomElmt)
		{
			return (a_DomElmt && a_DomElmt.className) ? eSplCssc(a_DomElmt.className) : [];
		};

		/// 设置样式类
		/// a_Cssc：String，样式类，可以用空格分隔多个
		stCssUtil.cSetCssc = function (a_DomElmt, a_Cssc)
		{
			if ((! a_DomElmt) || (! a_Cssc))
			{ return stCssUtil; }

			a_DomElmt.className = a_Cssc ? a_Cssc : "";
			return stCssUtil;
		};

		/// 添加样式类
		/// a_Cssc：String，样式类，可以用空格分隔多个
		stCssUtil.cAddCssc = function (a_DomElmt, a_Cssc)
		{
			if ((! a_DomElmt) || (! a_Cssc))
			{ return stCssUtil; }

			var l_CnAry, l_CcAry;
			var l_SpcIdx = a_Cssc.indexOf(" ");
			if (a_DomElmt.classList)
			{
				if (l_SpcIdx < 0)
				{
					a_DomElmt.classList.add(a_Cssc);
				}
				else
				{
					l_CcAry = eSplCssc(a_Cssc);
					stAryUtil.cFor(l_CcAry, function (a_A, a_I, a_C)
					{
						if (a_C)
						{ a_DomElmt.classList.add(a_C); }
					});
				}
			}
			else
			{
				l_CnAry = stCssUtil.cGetCssc(a_DomElmt);
				if (l_SpcIdx < 0)
				{
					if (l_CnAry.indexOf(a_Cssc) < 0)
					{ l_CnAry.push(a_Cssc); }
				}
				else
				{
					l_CcAry = eSplCssc(a_Cssc);
					stAryUtil.cFor(l_CcAry, function (a_A, a_I, a_C)
					{
						if (a_C && (l_CnAry.indexOf(a_C) < 0))
						{ l_CnAry.push(a_C); }
					});
				}
				a_DomElmt.className = l_CnAry.join(" ");
			}
			return stCssUtil;
		};

		/// 移除样式类
		/// a_Cssc：String，样式类，可以用空格分隔多个
		stCssUtil.cRmvCssc = function (a_DomElmt, a_Cssc)
		{
			if ((! a_DomElmt) || (! a_Cssc))
			{ return stCssUtil; }

			var l_CnAry, l_CcAry, l_Idx;
			var l_SpcIdx = a_Cssc.indexOf(" ");
			if (a_DomElmt.classList)
			{
				if (l_SpcIdx < 0)
				{
					a_DomElmt.classList.remove(a_Cssc);
				}
				else
				{
					l_CcAry = eSplCssc(a_Cssc);
					stAryUtil.cFor(l_CcAry,
						function (a_A, a_I, a_C)
						{
							if (a_C)
							{ a_DomElmt.classList.remove(a_C); }
						});
				}
			}
			else
			{
				l_CnAry = stCssUtil.cGetCssc(a_DomElmt);
				if (l_SpcIdx < 0)
				{
					l_Idx = l_CnAry.indexOf(a_Cssc);
					if (l_Idx >= 0)
					{ l_CnAry.splice(l_Idx, 1); }
				}
				else
				{
					l_CcAry = eSplCssc(a_Cssc);
					stAryUtil.cFor(l_CcAry, function (a_A, a_I, a_C)
					{
						l_Idx = a_C ? l_CnAry.indexOf(a_C) : -1;
						if (l_Idx >= 0)
						{ l_CnAry.splice(l_Idx, 1); }
					});
				}
				a_DomElmt.className = l_CnAry.join(" ");
			}
			return stCssUtil;
		};

		/// 切换样式类
		/// a_Cssc：String，样式类，可以用空格分隔多个
		stCssUtil.cTglCssc = function (a_DomElmt, a_Cssc)
		{
			if ((! a_DomElmt) || (! a_Cssc))
			{ return stCssUtil; }

			var l_CnAry, l_CcAry, l_Idx;
			var l_SpcIdx = a_Cssc.indexOf(" ");
			if (a_DomElmt.classList)
			{
				if (l_SpcIdx < 0)
				{
					a_DomElmt.classList.toggle(a_Cssc);
				}
				else
				{
					l_CcAry = eSplCssc(a_Cssc);
					stAryUtil.cFor(l_CcAry, function (a_A, a_I, a_C)
					{
						if (a_C)
						{ a_DomElmt.classList.toggle(a_C); }
					});
				}
			}
			else
			{
				l_CnAry = stCssUtil.cGetCssc(a_DomElmt);
				if (l_SpcIdx < 0)
				{
					l_Idx = l_CnAry.indexOf(a_Cssc);
					if (l_Idx >= 0)
					{ l_CnAry.splice(l_Idx, 1); }
					else
					{ l_CnAry.push(a_Cssc); }
				}
				else
				{
					l_CcAry = eSplCssc(a_Cssc);
					stAryUtil.cFor(l_CcAry,
					function (a_A, a_I, a_C)
					{
						l_Idx = a_C ? l_CnAry.indexOf(a_C) : -1;
						if (l_Idx >= 0)
						{ l_CnAry.splice(l_Idx, 1); }
						else
						if (a_C)
						{ l_CnAry.push(a_C); }
					});
				}
				a_DomElmt.className = l_CnAry.join(" ");
			}
			return stCssUtil;
		};

		/// 替换样式类
		/// a_RmvCssc, a_AddCssc：String，样式类，可以用空格分隔多个，但两者所含数量必须相等
		/// a_AddWhenAbst：Boolean，当不存在时是否添加？默认false
		stCssUtil.cRplcCssc = function (a_DomElmt, a_RmvCssc, a_AddCssc, a_AddWhenAbst)
		{
			if ((! a_DomElmt) || (! a_RmvCssc) || (! a_AddCssc))
			{ return stCssUtil; }

			var l_Rmvs = eSplCssc(a_RmvCssc);
			var l_Adds = eSplCssc(a_AddCssc);
			if (l_Rmvs.length != l_Adds.length)
			{ throw new Error("a_RmvCssc与a_AddCssc所含的样式类数量不相等！"); }

			var l_CnAry = stCssUtil.cGetCssc(a_DomElmt), l_Idx;
			var i = 0, l_Len = l_Rmvs.length;
			for (; i<l_Len; ++i)
			{
				l_Idx = l_CnAry.indexOf(l_Rmvs[i]);
				if (l_Idx >= 0)
				{ l_CnAry[l_Idx] = l_Adds[i]; }
				else
				if (a_AddWhenAbst && (l_CnAry.indexOf(l_Adds[i]) < 0))
				{ l_CnAry.push(l_Adds[i]); }
			}
			a_DomElmt.className = l_CnAry.join(" ");
			return stCssUtil;
		};

		/// 设置样式
		/// a_Stl：Object，样式对象
		stCssUtil.cSetStl = function (a_DomElmt, a_Stl)
		{
			if ((! a_DomElmt) || (! a_Stl))
			{ return stCssUtil; }

			nWse.stObjUtil.cFor(a_Stl,
				function (a_Obj, a_PN, a_PV)
				{
					if (! nWse.fIsUdfnOrNull(a_PV))
					{ a_DomElmt.style[a_PN] = a_PV.toString(); }
				});
			return stCssUtil;
		};

		/// 可能支持变换？
		stCssUtil.cMaySuptTsfm = function ()
		{
			if (nWse.fMaybeNonHtml5Brsr())  // 非H5浏览器肯定不支持
			{ return false; }

			if (null === e_BrsrPfx_Tsfm)	// 如果需要，初始化
			{ eInitBrsrPfx_Tsfm(); }
			
			return ("" != e_BrsrPfx_Tsfm);
		};

		/// 可能支持3D变换？
		stCssUtil.cMaySupt3dTsfm = function ()
		{
			if (! stCssUtil.cMaySuptTsfm()) // 不支持2D变换也不可能支持3D变换
			{ return false; }

			if (null !== e_MaySupt3dTsfm) // 如果已初始化
			{ return e_MaySupt3dTsfm; }

			// 探测3D变换的可用性
			var l_DomHtmlStl = document.documentElement.style;
			var l_OldVal = l_DomHtmlStl[e_BrsrPfx_Tsfm];
			l_DomHtmlStl[e_BrsrPfx_Tsfm] = "scale3d(1, 1, 1)";
			e_MaySupt3dTsfm = (l_DomHtmlStl[e_BrsrPfx_Tsfm].indexOf("scale3d") >= 0);
			l_DomHtmlStl[e_BrsrPfx_Tsfm] = l_OldVal;
			return e_MaySupt3dTsfm;
		};

		/// 动画
		/// a_End：Object，要动画的各个CSS属性的默认起始值和结束值，支持冬至引擎扩展动画；
		/// 起始值的优先顺序：①a_DomElmt.style，②a_DomElmt的计算样式，③填充0值；
		/// 各个字段名匹配a_DomElmt.style的字段名；支持的数据类型有Number、px、%、#、rgb、rgba
		/// 语法："EndVal[=][EndStr][<][BgnStr]"，方括号表可选，若不提供，EndStr=EndVal.toString()，BgnStr=起始值.toString()
		/// 示例："100px=50%<"，EndVal="100px"，EndStr="50%"，BgnStr=起始值.toString()
		/// a_Cfg：Object，配置
		/// {
		/// c_PsrvIdtcBesPpty：Boolean，保持具有相同始末字符串值的属性？默认false将跳过始末字符串值相同的属性
		/// c_Dly：Number，延期（秒）
		/// c_Dur：Number，时长（秒），＜0表示无限进行，0会立即结束动画并回调，默认1秒
		/// c_Tot：Number，总数，＜0表示循环，0会立即结束动画并回调，默认1
		/// c_EvenCntRvs：Boolean，偶数次倒放？若为true则当c_Tot＞1且第偶数次播放时，反转起始和结束值，默认false
		/// c_fEsn：Number f(Number a_Scl)，松弛函数，默认线性渐变
		/// c_fDplc：void f(a_Rst, a_DomElmt, a_Bgn, a_End, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)，
		/// 移动，写入到a_Rst.x、y字段，a_Bgn和a_End表起终点
		/// c_fOnUpd：void f(a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)，更新回调
		/// c_fOnEnd：void f(a_DomElmt)，结束回调
		/// }
		stCssUtil.cAnmt = function (a_DomElmt, a_End, a_Cfg)
		{
			// 借助这个共享的函数
			stDomUtil.eAnmtPpty_Shr(true, a_DomElmt, a_End, a_Cfg, eAnmt_NoDly);
			return stCssUtil;
		};

		function eAnmt_NoDly(a_DomElmt, a_End, a_Cfg)
		{
			stDomUtil.eAnmtPpty_NoDly_Shr(true, a_DomElmt, a_End, a_Cfg,
				function (a_DomElmt) // 准备
				{
					e_DomPrn = a_DomElmt.parentNode;
					e_BgnStl = e_PrnStl = null;
					stDomUtil.eEnsrAnmtFctn_Shr(true, a_DomElmt, eGnrtAnmtFctn);
				},
				function (a_DomElmt, a_fAnmt) // 初始化
				{
					a_fAnmt.Wse_HasDplc = !! (a_fAnmt.Wse_Cfg.c_fDplc);
					a_fAnmt.Wse_HasLeft = false;
					a_fAnmt.Wse_HasTop = false;
					if (! a_fAnmt.Wse_Pos)
					{
						a_fAnmt.Wse_Pos = { x:0, y:0 };
						a_fAnmt.Wse_Sp = { x:0, y:0 };
						a_fAnmt.Wse_Tp = { x:0, y:0 };
					}
				},
				eExtdAnmt, // 扩展
				function (a_DomElmt, a_PN) // 跳过
				{
					return (! (a_PN in a_DomElmt.style));
				},
				function (a_DomElmt, a_fAnmt, a_PN, a_PV, a_Item) // 计算始末值
				{
					var l_EndStr = null, l_BgnStr = null, l_EqIdx = -1, l_LtIdx = -1;
					if (nWse.fIsNum(a_PV)) // [1]Number
					{
						a_Item.c_TypeIdx = 1;
						a_Item.c_End = a_PV;
					}
					else if (nWse.fIsStr(a_PV))	// 字符串
					{
						l_LtIdx = a_PV.indexOf("<");	// 带有起始字符串？
						if (l_LtIdx >= 0)
						{
							l_BgnStr = (l_LtIdx == a_PV.length - 1) ? "" : a_PV.substring(l_LtIdx + 1, a_PV.length);
							a_PV = a_PV.substring(0, l_LtIdx);
						}

						l_EqIdx = a_PV.indexOf("=");	// 带有结束字符串？
						if (l_EqIdx >= 0)
						{
							l_EndStr = (l_EqIdx == a_PV.length - 1) ? "" : a_PV.substring(l_EqIdx + 1, a_PV.length);
							a_PV = a_PV.substring(0, l_EqIdx);
						}

						if ((a_PV.length - 2 >= 0) && (a_PV.indexOf("px") == a_PV.length - 2)) // [2]像素
						{
							a_Item.c_TypeIdx = 2;
							a_Item.c_End = parseFloat(a_PV);
						}
						else if ((a_PV.length - 1 >= 0) && (a_PV.indexOf("%") == a_PV.length - 1)) // [3]百分比
						{
							if (! e_PrnStl)
							{
								e_PrnStl = stCssUtil.cGetCmptStl(e_DomPrn);
							}

							a_Item.c_TypeIdx = 3;
							a_Item.c_End = parseFloat(e_PrnStl[a_PN]);
							if (isNaN(a_Item.c_End)) // 如果解析失败，使用父元素宽度？！
							{ a_Item.c_End = e_DomPrn.offsetWidth; }

							a_Item.c_End *= (parseFloat(a_PV) / 100);
						}
	//					else
	//					if ((a_PV.length - 2 >= 0) && (a_PV.indexOf("em") == a_PV.length - 2)) // [4]em
	//					{
	//						a_Item.c_TypeIdx = 4;
	//					}
	//					else
	//					if ((a_PV.length - 3 >= 0) && (a_PV.indexOf("rem") == a_PV.length - 3)) // [5]rem
	//					{
	//						a_Item.c_TypeIdx = 5;
	//					}
						else if ((a_PV.indexOf("rgb") == 0) || (a_PV.indexOf("#") == 0))	// [6]颜色
						{
							a_Item.c_TypeIdx = 6;
							a_Item.c_End = tClo.scFromCssCloStr(a_PV);
						}
						else // 按Number处理
						{
							a_Item.c_TypeIdx = 1;
							a_Item.c_End = parseFloat(a_PV);
							if (isNaN(a_Item.c_End))	// 若解析失败则跳过
							{ return false; }
						}
					}
					else // 无效类型，跳过
					{
						return false;
					}

					eCalcBgnPV(a_Item.c_TypeIdx, a_DomElmt, a_PN);
					a_Item.c_Bgn = e_Rst_CalcBgnPV.c_Bgn;
					a_Item.c_BgnStr = (l_LtIdx >= 0) ? l_BgnStr : e_Rst_CalcBgnPV.c_BgnStr;
					a_Item.c_EndStr = (l_EqIdx >= 0) ? l_EndStr : a_PV.toString();
					return true;
				},
				function (a_DomElmt, a_fAnmt, a_PN, a_PV, a_Item) // 不要录入？
				{
					// 如果起始串和结束串相同，除非是“left、top”且提供了c_fDplc，否则跳过
					return ((! a_fAnmt.Wse_Cfg.c_PsrvIdtcBesPpty) && (a_Item.c_BgnStr == a_Item.c_EndStr)) &&
						(! (a_fAnmt.Wse_HasDplc && (("left" == a_PN) || ("top" == a_PN))));
				},
				function (a_DomElmt, a_fAnmt, a_PN, a_PV, a_Item) // 录入后
				{
					// 如果需要动画位置，检查left和/或top是否存在，是的话记录起始和结束值
					if (a_fAnmt.Wse_HasDplc)
					{
						if ((! a_fAnmt.Wse_HasLeft) && ("left" == a_PN))
						{
							a_fAnmt.Wse_HasLeft = true;
							a_fAnmt.Wse_Sp.x = a_Item.c_Bgn;
							a_fAnmt.Wse_Tp.x = a_Item.c_End;
						}
						else
						if ((! a_fAnmt.Wse_HasTop) && ("top" == a_PN))
						{
							a_fAnmt.Wse_HasTop = true;
							a_fAnmt.Wse_Sp.y = a_Item.c_Bgn;
							a_fAnmt.Wse_Tp.y = a_Item.c_End;
						}
					}
				},
				function (a_DomElmt, a_fAnmt) // 枚举后
				{
					// 如果需要动画位置，计算left和/或top缺省的起始和结束值（此时相同，皆为当前值）
					if (a_fAnmt.Wse_HasDplc)
					{
						if (! a_fAnmt.Wse_HasLeft)
						{ a_fAnmt.Wse_Sp.x = a_fAnmt.Wse_Tp.x = eCalcBgnPV(2, a_DomElmt, "left").c_Bgn; }

						if (! a_fAnmt.Wse_HasTop)
						{ a_fAnmt.Wse_Sp.y = a_fAnmt.Wse_Tp.y = eCalcBgnPV(2, a_DomElmt, "top").c_Bgn; }
					}
				},
				stCssUtil.cFnshAnmt);
			return stCssUtil;
		}

		function eCalcExtdEndPV(a_Tsfm, a_CC, a_Dft)
		{
			return (a_Tsfm.c_End && (! nWse.fIsUdfnOrNull(a_Tsfm.c_End[a_CC]))) ? a_Tsfm.c_End[a_CC] : a_Dft;
		}

		function eNzQtn(a_Qtn)
		{
			return ((0 != a_Qtn.x) || (0 != a_Qtn.y) || (0 != a_Qtn.z) || (0 != a_Qtn.w));
		}

		function eBldTsfmCssStr(a_Str, a_TsfmName, a_Val, a_Unit, a_Dim)
		{
			if (a_Str)
			{ a_Str += " "; }
			a_Str += a_TsfmName;
			a_Str += "(";
			if (1 == a_Dim)
			{ a_Str += a_Val + a_Unit; }
			else
			if (2 == a_Dim)
			{ a_Str += a_Val.x + a_Unit + "," + a_Val.y + a_Unit; }
			else
			if (3 == a_Dim)
			{ a_Str += a_Val.x + a_Unit + "," + a_Val.y + a_Unit + "," + a_Val.z + a_Unit; }
			else // 只可能是旋转
			{ a_Str += a_Val.x + "," + a_Val.y + "," + a_Val.z + "," + a_Val.w + "rad"; }
			a_Str += ")";
			return a_Str;
		}

		function eExtdAnmt(a_DomElmt, a_PN, a_PV)
		{
			var l_IsEmt = true; // 返回值，true表示空

			if (! e_Wse_CssExtd)	// 如果需要，初始化
			{ eInitWse_CssExtd(); }

			var l_fAnmt = a_DomElmt.Wse_CssUtil.c_fAnmt;
			var l_Items = l_fAnmt.Wse_Items;
			var l_Cfg = l_fAnmt.Wse_Cfg;
			var l_Item, l_Tsfm, l_DomTsfm;
			if ("Wse_2dTsfm" == a_PN)
			{
				if (! stCssUtil.cMaySuptTsfm()) // 不支持立即返回
				{ return l_IsEmt; }

				if (! a_PV)						// 值无效立即返回
				{ return l_IsEmt; }

				eEnsrExtdAnmtTsfm(a_DomElmt, 2);	// 确保动画变换

				l_Item = {
					c_TypeIdx: e_Wse_CssExtd.i_2dTsfm,	// 必有
					c_BgnStr: "",						// 必有
					c_EndStr: "",						// 必有
					c_Sqnc : []
				};
				l_DomTsfm = a_DomElmt.Wse_CssUtil.c_2dTsfm;

				stAryUtil.cFor(a_PV,					// 是个数组
					function (a_Ary, a_Idx, a_Tsfm)
					{
						l_Tsfm = {};
						l_Tsfm.c_TypeIdx = e_Wse_CssExtd[a_Tsfm.c_Name] || -1;	// 把变换名称映射成索引
						if (l_Tsfm.c_TypeIdx < 0)
						{ return; }

						l_Tsfm.c_fDplc = a_Tsfm.c_fDplc || null;	// 位移函数

						if (e_Wse_CssExtd["scale"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { x: l_DomTsfm.c_Scl.x, y: l_DomTsfm.c_Scl.y };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "scale", l_Tsfm.c_Bgn, "", 2);

							l_Tsfm.c_End = { x: eCalcExtdEndPV(a_Tsfm, "x", 1), y: eCalcExtdEndPV(a_Tsfm, "y", 1) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "scale", l_Tsfm.c_End, "", 2);
						}
						else
						if (e_Wse_CssExtd["skew"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { x: l_DomTsfm.c_Skew.x, y: l_DomTsfm.c_Skew.y };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "skew", l_Tsfm.c_Bgn, "rad", 2);

							l_Tsfm.c_End = { x: eCalcExtdEndPV(a_Tsfm, "x", 0), y: eCalcExtdEndPV(a_Tsfm, "y", 0) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "skew", l_Tsfm.c_End, "rad", 2);
						}
						else
						if (e_Wse_CssExtd["rotate"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { w: l_DomTsfm.c_Rot.w };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "rotate", l_Tsfm.c_Bgn.w, "rad", 1);

							l_Tsfm.c_End = { w: eCalcExtdEndPV(a_Tsfm, "w", 0) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "rotate", l_Tsfm.c_End.w, "rad", 1);
						}
						else
					//	if (e_Wse_CssExtd["translate"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { x: l_DomTsfm.c_Tslt.x, y: l_DomTsfm.c_Tslt.y };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "translate", l_Tsfm.c_Bgn, "px", 2);

							l_Tsfm.c_End = { x: eCalcExtdEndPV(a_Tsfm, "x", 0), y: eCalcExtdEndPV(a_Tsfm, "y", 0) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "translate", l_Tsfm.c_End, "px", 2);
						}

						l_Item.c_Sqnc.push(l_Tsfm);
					});

				if (l_Item.c_Sqnc.length > 0)
				{
					l_Items[a_PN] = l_Item;
					l_IsEmt = false;
				}
			}
			else
			if ("Wse_3dTsfm" == a_PN)
			{
				if (! stCssUtil.cMaySupt3dTsfm()) // 不支持立即返回
				{ return l_IsEmt; }

				if (! a_PV)						// 值无效立即返回
				{ return l_IsEmt; }

				eEnsrExtdAnmtTsfm(a_DomElmt, 3);	// 确保动画变换

				l_Item = {
					c_TypeIdx: e_Wse_CssExtd.i_3dTsfm,	// 必有
					c_BgnStr: "",						// 必有
					c_EndStr: "",						// 必有
					c_Sqnc : []
				};
				l_DomTsfm = a_DomElmt.Wse_CssUtil.c_3dTsfm;

				stAryUtil.cFor(a_PV,					// 是个数组
					function (a_Ary, a_Idx, a_Tsfm)
					{
						l_Tsfm = {};
						l_Tsfm.c_TypeIdx = e_Wse_CssExtd[a_Tsfm.c_Name] || -1;	// 把变换名称映射成索引
						if (l_Tsfm.c_TypeIdx < 0)
						{ return; }

						l_Tsfm.c_fDplc = a_Tsfm.c_fDplc || null;	// 位移函数

						if (e_Wse_CssExtd["perspective"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { d: l_DomTsfm.c_Pspc.d };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "perspective", l_Tsfm.c_Bgn.d, "px", 1);

							l_Tsfm.c_End = { d: eCalcExtdEndPV(a_Tsfm, "d", 0) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "perspective", l_Tsfm.c_End.d, "px", 1);
						}
						else
						if (e_Wse_CssExtd["scale3d"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { x: l_DomTsfm.c_Scl.x, y: l_DomTsfm.c_Scl.y, z:l_DomTsfm.c_Scl.z };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "scale3d", l_Tsfm.c_Bgn, "", 3);

							l_Tsfm.c_End = { x: eCalcExtdEndPV(a_Tsfm, "x", 1), y: eCalcExtdEndPV(a_Tsfm, "y", 1), z: eCalcExtdEndPV(a_Tsfm, "z", 1) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "scale3d", l_Tsfm.c_End, "", 3);
						}
						else
						if (e_Wse_CssExtd["rotate3d"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { x: l_DomTsfm.c_Rot.x, y: l_DomTsfm.c_Rot.y, z: l_DomTsfm.c_Rot.z, w: l_DomTsfm.c_Rot.w };	// 四元数
							stNumUtil.cAxisRadFromQtn(e_AxisRad, l_Tsfm.c_Bgn);	// 取得轴弧度，不是四元数但无妨
							if (eNzQtn(e_AxisRad))
							{ l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "rotate3d", e_AxisRad, null, 4); }

							l_Tsfm.c_End = { x: eCalcExtdEndPV(a_Tsfm, "x", 0), y: eCalcExtdEndPV(a_Tsfm, "y", 0), z: eCalcExtdEndPV(a_Tsfm, "z", 0), w: eCalcExtdEndPV(a_Tsfm, "w", 1) };	// 四元数
							stNumUtil.cAxisRadFromQtn(e_AxisRad, l_Tsfm.c_End);	// 取得轴弧度，不是四元数但无妨
							if (eNzQtn(e_AxisRad))
							{ l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "rotate3d", e_AxisRad, null, 4); }
						}
						else
					//	if (e_Wse_CssExtd["translate3d"] == l_Tsfm.c_TypeIdx)
						{
							l_Tsfm.c_Bgn = { x: l_DomTsfm.c_Tslt.x, y: l_DomTsfm.c_Tslt.y, z:l_DomTsfm.c_Tslt.z };
							l_Item.c_BgnStr = eBldTsfmCssStr(l_Item.c_BgnStr, "translate3d", l_Tsfm.c_Bgn, "px", 3);

							l_Tsfm.c_End = { x: eCalcExtdEndPV(a_Tsfm, "x", 0), y: eCalcExtdEndPV(a_Tsfm, "y", 0), z: eCalcExtdEndPV(a_Tsfm, "z", 0) };
							l_Item.c_EndStr = eBldTsfmCssStr(l_Item.c_EndStr, "translate3d", l_Tsfm.c_End, "px", 3);
						}

						l_Item.c_Sqnc.push(l_Tsfm);
					});

				if (l_Item.c_Sqnc.length > 0)
				{
					l_Items[a_PN] = l_Item;
					l_IsEmt = false;
				}
			}
			return l_IsEmt;
		}

		function eCalcBgnPV(a_TypeIdx, a_DomElmt, a_PN, a_Dft)
		{
			if (! e_Rst_CalcBgnPV)
			{ e_Rst_CalcBgnPV = {}; }

			// ①a_DomElmt.style
			var l_PV = a_DomElmt.style[a_PN];
			if (l_PV) // 一定是字符串
			{
				e_Rst_CalcBgnPV.c_Bgn = fCalcBgnFromStr(a_DomElmt, a_PN, l_PV);
				e_Rst_CalcBgnPV.c_BgnStr = l_PV;

				if (! eNotNumAndClo(e_Rst_CalcBgnPV.c_Bgn))
				{ return e_Rst_CalcBgnPV; }
			}

			// ②a_DomElmt的计算样式
			if (! e_BgnStl)
			{ e_BgnStl = stCssUtil.cGetCmptStl(a_DomElmt); }

			l_PV = e_BgnStl[a_PN];
			if (l_PV)
			{
				if (nWse.fIsNum(l_PV)) // [1]Number
				{
					e_Rst_CalcBgnPV.c_Bgn = l_PV;
					e_Rst_CalcBgnPV.c_BgnStr = l_PV.toString();
				}
				else
				if (nWse.fIsStr(l_PV))	// 字符串
				{
					e_Rst_CalcBgnPV.c_Bgn = fCalcBgnFromStr(a_DomElmt, a_PN, l_PV);
					e_Rst_CalcBgnPV.c_BgnStr = l_PV;
				}

				if (! eNotNumAndClo(e_Rst_CalcBgnPV.c_Bgn))
				{ return e_Rst_CalcBgnPV; }
			}

			// ③填充默认值或0值
			if (6 == a_TypeIdx)
			{
				e_Rst_CalcBgnPV.c_Bgn = a_Dft || (new tClo());
				e_Rst_CalcBgnPV.c_BgnStr = tClo.scToCssCloStr(e_Rst_CalcBgnPV.c_Bgn);
			}
			else
			{
				e_Rst_CalcBgnPV.c_Bgn = a_Dft || 0;
				e_Rst_CalcBgnPV.c_BgnStr = a_Dft ? a_Dft.toString() : "0px";
			}

			return e_Rst_CalcBgnPV;
		}

		function fCalcBgnFromStr(a_DomElmt, a_PN, a_PV)
		{
			var l_Rst;
			if ((a_PV.length - 2 >= 0) && (a_PV.indexOf("px") == a_PV.length - 2)) // [2]像素
			{ l_Rst = parseFloat(a_PV); }
			else
			if ((a_PV.length - 1 >= 0) && (a_PV.indexOf("%") == a_PV.length - 1)) // [3]百分比
			{
				if (! e_PrnStl)
				{ e_PrnStl = stCssUtil.cGetCmptStl(e_DomPrn); }

				//【警告】未必是父节点的同名属性，比如“left: 50%”应读取父节点的“style.width”或“clientWidth”
				l_Rst = parseFloat(e_PrnStl[a_PN]) * (parseFloat(a_PV) / 100);
			}
//			else
//			if ((a_PV.length - 2 >= 0) && (a_PV.indexOf("em") == a_PV.length - 2)) // [4]em
//			{ }
//			else
//			if ((a_PV.length - 3 >= 0) && (a_PV.indexOf("rem") == a_PV.length - 3)) // [5]rem
//			{ }
			else
			if ((a_PV.indexOf("rgb") == 0) || (a_PV.indexOf("#") == 0))	// [6]颜色
			{ l_Rst = tClo.scFromCssCloStr(a_PV); }
			else // 按Number处理
			{ l_Rst = parseFloat(a_PV); }

			return l_Rst;
		}

		function eNotNumAndClo(a_Val)
		{
			return isNaN(a_Val) && (! (a_Val instanceof tClo));
//			if (isNaN(a_Val) && (! (a_Val instanceof tClo)))
//			{ throw new Error("不可计算CSS样式！"); }
		}

		/// 结束动画
		/// a_SkipToEnd：Boolean，跳到最后？默认false
		/// a_Cabk：Boolean，回调c_fOnEnd？默认false
		/// a_Rvs：Boolean，反转始末值？默认false
		stCssUtil.cFnshAnmt = function (a_DomElmt, a_SkipToEnd, a_Cabk, a_Rvs)
		{
			stDomUtil.eFnshAnmtPpty_Shr(true, a_DomElmt, a_SkipToEnd, a_Cabk, a_Rvs, eJumpToAnmtEnd);
			return stCssUtil;
		};

		/// 在动画期间？
		stCssUtil.cIsDurAnmt = function (a_DomElmt)
		{
			var l_fAnmt = a_DomElmt.Wse_CssUtil && a_DomElmt.Wse_CssUtil.c_fAnmt;
			return l_fAnmt ? (stDomUtil.cFindAnmt(l_fAnmt) >= 0) : false;
		};

		/// 暂停继续动画
		stCssUtil.cPauRsmAnmt = function (a_DomElmt, a_Pau)
		{
			var l_fAnmt = a_DomElmt.Wse_CssUtil && a_DomElmt.Wse_CssUtil.c_fAnmt;
			stDomUtil.cPauRsmAnmt(l_fAnmt, a_Pau);
			return stCssUtil;
		};

		/// 动画暂停？
		stCssUtil.cIsAnmtPau = function (a_DomElmt)
		{
			var l_fAnmt = a_DomElmt.Wse_CssUtil && a_DomElmt.Wse_CssUtil.c_fAnmt;
			return stDomUtil.cIsAnmtPau(l_fAnmt);
		};

		/// 存取扩展动画 - 二维变换
		/// 返回：Object
		/// {
		/// 	c_Scl:
		///		{
		///		x，y：Number
		/// 	c_FrmTime：Number
		///		}
		/// 	c_Skew:
		///		{
		///		x，y：Number
		/// 	c_FrmTime：Number
		///		}
		/// 	c_Rot:
		///		{
		///		w：Number，绕Z轴旋转的弧度
		/// 	c_FrmTime：Number
		///		}
		/// 	c_Tslt:
		///		{
		///		x，y：Number
		/// 	c_FrmTime：Number
		///		}
		/// }
		stCssUtil.cAcsExtdAnmt_2dTsfm = function (a_DomElmt)
		{
			eEnsrExtdAnmtTsfm(a_DomElmt, 2);	// 确保动画变换
			return a_DomElmt.Wse_CssUtil.c_2dTsfm;
		};

		/// 单位化扩展动画 - 二维变换
		stCssUtil.cIdtyExtdAnmt_2dTsfm = function (a_DomElmt)
		{
			if (! stCssUtil.cMaySuptTsfm()) // 不支持立即返回
			{ return stCssUtil; }

			eRsetExtdAnmtTsfmData(a_DomElmt, 2);	// 复位动画数据
			return stCssUtil;
		};

		/// 更新扩展动画 - 二维变换
		stCssUtil.cUpdExtdAnmt_2dTsfm = function (a_DomElmt)
		{
			if (! stCssUtil.cMaySuptTsfm()) // 不支持立即返回
			{ return stCssUtil; }

			eEnsrExtdAnmtTsfm(a_DomElmt, 2);	// 确保动画变换
			var l_Tsfm = a_DomElmt.Wse_CssUtil.c_2dTsfm;
			var l_CssStr = "";

			// 注意CSS的变换从右向左进行！故字符串拼接顺序是：T*R*K*S
			if ((0 != l_Tsfm.c_Tslt.x) || (0 != l_Tsfm.c_Tslt.y)) // T
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "translate", l_Tsfm.c_Tslt, "px", 2); }

			if ((0 != l_Tsfm.c_Rot.w)) // R
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "rotate", l_Tsfm.c_Rot.w, "rad", 1); }

			if ((0 != l_Tsfm.c_Skew.x) || (0 != l_Tsfm.c_Skew.y)) // K
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "skew", l_Tsfm.c_Skew, "rad", 2); }

			if ((1 != l_Tsfm.c_Scl.x) || (1 != l_Tsfm.c_Scl.y)) // S
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "scale", l_Tsfm.c_Scl, "", 2); }

			// 写成样式
			a_DomElmt.style[e_BrsrPfx_Tsfm] = l_CssStr;
			return stCssUtil;
		};

		/// 存取扩展动画 - 三维变换
		/// 返回：Object
		/// {
		/// 	c_Scl:
		///		{
		///		x，y, z：Number
		/// 	c_FrmTime：Number
		///		}
		/// 	c_Rot:
		///		{
		///		x，y, z, w：Number，四元数，xyz是转轴向量的三个分量，w是弧度
		/// 	c_FrmTime：Number
		///		}
		/// 	c_Tslt:
		///		{
		///		x，y, z：Number
		/// 	c_FrmTime：Number
		///		}
		///		c_Pspc:
		///		{
		///		d：Number，透视投影距离，null表示正交投影
		/// 	c_FrmTime：Number
		///		}
		/// }
		stCssUtil.cAcsExtdAnmt_3dTsfm = function (a_DomElmt)
		{
			eEnsrExtdAnmtTsfm(a_DomElmt, 3);	// 确保动画变换
			return a_DomElmt.Wse_CssUtil.c_3dTsfm;
		};

		/// 单位化扩展动画 - 三维变换
		stCssUtil.cIdtyExtdAnmt_3dTsfm = function (a_DomElmt)
		{
			if (! stCssUtil.cMaySupt3dTsfm()) // 不支持立即返回
			{ return stCssUtil; }

			eRsetExtdAnmtTsfmData(a_DomElmt, 3);	// 复位动画数据
			return stCssUtil;
		};

		/// 更新扩展动画 - 三维变换
		stCssUtil.cUpdExtdAnmt_3dTsfm = function (a_DomElmt)
		{
			if (! stCssUtil.cMaySupt3dTsfm()) // 不支持立即返回
			{ return stCssUtil; }

			// 注意CSS的变换从右向左进行！故字符串拼接顺序是：P*T*R*S
			eEnsrExtdAnmtTsfm(a_DomElmt, 3);	// 确保动画变换
			var l_Tsfm = a_DomElmt.Wse_CssUtil.c_3dTsfm;
			var l_CssStr = "";

			if (! nWse.fIsUdfnOrNull(l_Tsfm.c_Pspc.d)) // P
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "perspective", l_Tsfm.c_Pspc.d, "px", 1); }

			if ((0 != l_Tsfm.c_Tslt.x) || (0 != l_Tsfm.c_Tslt.y) || (0 != l_Tsfm.c_Tslt.z)) // T
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "translate3d", l_Tsfm.c_Tslt, "px", 3); }

			stNumUtil.cAxisRadFromQtn(e_AxisRad, l_Tsfm.c_Rot);	// 取得轴弧度，不是四元数但无妨
			if (eNzQtn(e_AxisRad)) // R
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "rotate3d", e_AxisRad, null, 4); }

			if ((1 != l_Tsfm.c_Scl.x) || (1 != l_Tsfm.c_Scl.y) || (1 != l_Tsfm.c_Scl.z)) // S
			{ l_CssStr = eBldTsfmCssStr(l_CssStr, "scale3d", l_Tsfm.c_Scl, "", 3); }
			
			// 写成样式
			a_DomElmt.style[e_BrsrPfx_Tsfm] = l_CssStr;
			return stCssUtil;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////