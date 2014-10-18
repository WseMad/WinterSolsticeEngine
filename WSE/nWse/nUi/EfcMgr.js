/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.stEfcMgr)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi",
		[
			"(0)Plmvc.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("EfcMgr.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stObjUtil = nWse.stObjUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;

	var nUi = nWse.nUi;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fItsc_Ray_Line(a_ROx, a_ROy, a_RDx, a_RDy,
			  				a_LSx, a_LSy, a_LTx, a_LTy)
	{
		var l_STx = a_LSx - a_LTx, l_STy = a_LSy - a_LTy;
		var l_SOx = a_LSx - a_ROx, l_SOy = a_LSy - a_ROy;
		var l_A = stNumUtil.cDet_2o(a_RDx, l_STx, a_RDy, l_STy);
		if (0 == l_A)
		{ return null; }

		var l_B = stNumUtil.cDet_2o(l_SOx, l_STx, l_SOy, l_STy);
		return l_B / l_A;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 特效

	var tEfc;
	(function ()
	{
		tEfc = nWse.fClass(nUi,
		/// 特效
		function tEfc(a_fStp, a_StpOnce)
		{
			this.c_fStp = a_fStp;				// void f(a_Efc, a_PutTgt, a_Put)，建立，【注意】每次回调前都会自动清空项！
			this.c_StpOnce = !! a_StpOnce;		// Boolean，只建立（回调）一次？
		//	this.c_(Ent/Rfl/Lea)Dur = 1;		// 参见stCssUtil.cAnmt
		//	this.c_f(Ent/Rfl/Lea)Esn = null;	// 参见stCssUtil.cAnmt
		//	this.c_f(Ent/Rfl/Lea)Move = null;	// 参见stCssUtil.cAnmt
		//	this.cClrItems();
		}
		,
		null
		,
		{
			/// 清空项
			cClrItems : function ()
			{
				if (this.c_CssEntBgn) { this.c_CssEntBgn = null; }	// void f(a_Rst, a_PutTgt, a_Put)[]
				if (this.c_CssEntEnd) { this.c_CssEntEnd = null; }
				if (this.c_CssEntCln) { this.c_CssEntCln = null; }

				if (this.c_CssLeaEnd) { this.c_CssLeaEnd = null; }
				if (this.c_CssLeaCln) { this.c_CssLeaCln = null; }

				if (this.c_fOnEntBgn) { this.c_fOnEntBgn = null; }	// void f(a_PutTgt, a_Put)
				if (this.c_fOnEntEnd) { this.c_fOnEntEnd = null; }	// void f(a_PutTgt, a_Put)
			//	if (this.c_fOnEntUpd) { this.c_fOnEntUpd = null; }	// void f(a_PutTgt, a_Put, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)

				if (this.c_fOnRflBgn) { this.c_fOnRflBgn = null; }
				if (this.c_fOnRflEnd) { this.c_fOnRflEnd = null; }
			//	if (this.c_fOnRflUpd) { this.c_fOnRflUpd = null; }

				if (this.c_fOnLeaBgn) { this.c_fOnLeaBgn = null; }
				if (this.c_fOnLeaEnd) { this.c_fOnLeaEnd = null; }
			//	if (this.c_fOnLeaUpd) { this.c_fOnLeaUpd = null; }	//【这三个更新函数先不要了】
				return this;
			}
			,
			/// 设置统一时长
			cSetUniDur : function (a_Dur)
			{
				a_Dur = a_Dur || 0;		// 0表示不动画
				this.c_EntDur = a_Dur;
				this.c_RflDur = a_Dur;
				this.c_LeaDur = a_Dur;
				return this;
			}
			,
			/// 设置统一松弛
			cSetUniEsn : function (a_fEsn)
			{
				a_fEsn = a_fEsn || null;
				this.c_fEntEsn = a_fEsn;
				this.c_fRflEsn = a_fEsn;
				this.c_fLeaEsn = a_fEsn;
				return this;
			}
			,
			/// 设置统一移动
			cSetUniMove : function (a_fMove)
			{
				a_fMove = a_fMove || null;
				this.c_fEntDplc = a_fMove;
				this.c_fRflDplc = a_fMove;
				this.c_fLeaDplc = a_fMove;
				return this;
			}
			,
			/// 存取数组
			/// a_PN：String，属性名
			cAcsAry : function (a_PN)
			{
				if (! this[a_PN])
				{ this[a_PN] = []; }
				return this[a_PN];
			}
			,
			/// 建立
			cStp : function (a_PutTgt, a_Put)
			{
				if ((! this.c_fStp) ||
					(this.c_StpOnce && this.c_fStp.Wse_Called))
				{ return this; }

				this.cClrItems();						// 自动清空项
				this.c_fStp(this, a_PutTgt, a_Put);		// 回调
				this.c_fStp.Wse_Called = true;			// 已回调
				return this;
			}
		}
		,
		{
			// 使用字段
			seUseFld : function (a_PN, a_PutEfc, a_DftEfc)
			{
				if (! a_PN)
				{ return null; }

				// 优先采用放置元素的
				if (a_PutEfc && (! nWse.fIsUdfn(a_PutEfc[a_PN])))
				{ return a_PutEfc[a_PN]; }

				// 其次采用默认的
				return (a_DftEfc && (! nWse.fIsUdfn(a_DftEfc[a_PN]))) ? a_DftEfc[a_PN] : null;
			}
			,
			// 累计样式
			seAccStl : function (a_PN, a_PutEfc, a_DftEfc, a_PutTgt, a_Put)
			{
				if (! a_PN)
				{ return null; }

				var l_CssAry = tEfc.seUseFld(a_PN, a_PutEfc, a_DftEfc);
				if (stAryUtil.cIsEmt(l_CssAry))
				{ return null; }

				var l_Rst = {};
				stAryUtil.cFor(l_CssAry, function (a_Ary, a_Idx, a_fCalc) { a_fCalc(l_Rst, a_PutTgt, a_Put); });
				return l_Rst;
			}
		}
		,
		false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 特效管理器

	var stEfcMgr;
	(function ()
	{
		/// 特效
		stEfcMgr = function () { };
		nUi.stEfcMgr = stEfcMgr;
		stEfcMgr.oc_nHost = nUi;
		stEfcMgr.oc_FullName = nUi.ocBldFullName("stEfcMgr");

		/// 构建全名
		stEfcMgr.ocBldFullName = function (a_Name)
		{
			return stEfcMgr.oc_FullName + "." + a_Name;
		};

		//======== 私有字段

		var e_Efc = null;		// 特效
		var e_OffScrnOfst = 4;	// 离屏偏移量

		//======== 私有函数

		function eAcsFld(a_PN)
		{
			return e_Efc.cAcsAry(a_PN);
		}

		function eToCssStr(a_Pxl)
		{
			return a_Pxl.toString() + "px";
		}

		function eGetPutTgtWid(a_PutTgt)
		{
			return Math.min(window.innerWidth, a_PutTgt.offsetWidth);
		}

		function eGetPutTgtHgt(a_PutTgt)
		{
			return Math.min(window.innerHeight, a_PutTgt.offsetHeight);
		}

		function eMake_Aph(a_Aph, a_Dft)
		{
			return function (a_Rst, a_PutTgt, a_Put) { a_Rst["opacity"] = nWse.fIsUdfnOrNull(a_Aph) ? a_Dft : a_Aph; };
		}

		//======== 公有函数

		/// 发出CSS动画
		/// a_Anmt：Boolean，是否动画
		/// a_Which：Number，1=进入，2=重排，3=离开
		/// a_CstmEnd：Object，定制动画结束值，默认null
		/// a_fOnEnd：void f()，当结束时
		stEfcMgr.cIsuCssAnmt = function (a_Anmt, a_PutTgt, a_Put,
										 a_Which, a_PutEfc, a_DftEfc,
										 a_CstmEnd, a_fOnEnd)
		{
			if (! a_Which)
			{ throw new Error("a_Which有误！"); }

			// 在这回调开始……
			var l_PN_Bgn = (1 == a_Which) ? "c_fOnEntBgn" : ((2 == a_Which) ? "c_fOnRflBgn" : "c_fOnLeaBgn");
			fEfcOn(l_PN_Bgn, a_PutEfc, a_DftEfc, [a_PutTgt, a_Put]);

			// 合并动画结束的CSS值
			//【注意】清理值的选取！
			var l_PN_Cln = (1 == a_Which) ? "c_CssLeaCln" : ((2 == a_Which) ? "c_CssLeaCln" : "c_CssEntCln");
			var l_PN_End = (1 == a_Which) ? "c_CssEntEnd" : ((2 == a_Which) ? null : "c_CssLeaEnd");
			var l_AnmtEnd = stObjUtil.cShlwAsn({},
				tEfc.seAccStl(l_PN_Cln, a_PutEfc, a_DftEfc, a_PutTgt, a_Put),
				tEfc.seAccStl(l_PN_End, a_PutEfc, a_DftEfc, a_PutTgt, a_Put),
				a_CstmEnd);

			function fOnEnd()
			{
				// 回调
				if (a_fOnEnd)
				{ a_fOnEnd(); }

				// 清理
				//【注意】清理值的选取！
				var l_PN_Cln = (1 == a_Which) ? "c_CssEntCln" : ((2 == a_Which) ? "c_CssEntCln" : "c_CssLeaCln");
				var l_Cln = tEfc.seAccStl(l_PN_Cln, a_PutEfc, a_DftEfc, a_PutTgt, a_Put);
				if (l_Cln)	// 如果有
				{ stCssUtil.cSetStl(a_Put, l_Cln); }

				// 在这回调结束……
				var l_PN_End = (1 == a_Which) ? "c_fOnEntEnd" : ((2 == a_Which) ? "c_fOnRflEnd" : "c_fOnLeaEnd");
				fEfcOn(l_PN_End, a_PutEfc, a_DftEfc, [a_PutTgt, a_Put]);

				// 触发摆放事件
				nUi.fTrgrPutEvt(a_Put, "AnmtEnd", null);
			}

			// 不动画时直接跳到结束状态
			if ((! a_Anmt))
			{
				stCssUtil.cSetStl(a_Put, l_AnmtEnd);
				fOnEnd();
				return;
			}

			// 动画
			var l_PN_Dur = (1 == a_Which) ? "c_EntDur" : ((2 == a_Which) ? "c_RflDur" : "c_LeaDur");
			var l_PN_Esn = (1 == a_Which) ? "c_fEntEsn" : ((2 == a_Which) ? "c_fRflEsn" : "c_fLeaEsn");
			var l_PN_Dplc = (1 == a_Which) ? "c_fEntDplc" : ((2 == a_Which) ? "c_fRflDplc" : "c_fLeaDplc");
			var l_Dur = tEfc.seUseFld(l_PN_Dur, a_PutEfc, a_DftEfc);	// 注意时长若为0则不动画
			if ((0 != l_Dur) && (1 == a_Which))	// 如果是进入开始，需要设置起始值
			{
				stCssUtil.cSetStl(a_Put,
					tEfc.seAccStl("c_CssEntBgn", a_PutEfc, a_DftEfc, a_PutTgt, a_Put));
			}

		//	var l_UpdAgms = [a_PutTgt, a_Put, 0, 0];
			stCssUtil.cAnmt(a_Put,
				l_AnmtEnd,
				{
				//	c_Dly: 0,
					c_Dur: l_Dur,
					c_fEsn : tEfc.seUseFld(l_PN_Esn, a_PutEfc, a_DftEfc),
					c_fDplc : tEfc.seUseFld(l_PN_Dplc, a_PutEfc, a_DftEfc),
//				c_fOnUpd : function (a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
//				{
//					// 在这回调更新……
//					l_UpdAgms[2] = a_NmlScl;
//					l_UpdAgms[3] = a_EsnScl;
//					fEfcOn(a_PutEfc, a_DftEfc, (l_EntAnmt ? "c_fOnEntUpd" : "c_fOnRflUpd"), l_UpdAgms);
//				},
					c_fOnUpd : nUi.fHasPutEvtHdlr(a_Put, "AnmtUpd") &&	// 如果有，触发放置元素动画更新事件
					function (a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
					{
						nUi.fTrgrPutEvt(a_Put, "AnmtUpd", arguments);
					},
					c_fOnEnd : fOnEnd	// 【警告】如果被打断时这个函数不会被调用！
				});
		};

		function fEfcOn(a_PN, a_PutEfc, a_DftEfc, a_Agms)
		{
//			var l_OnAry = tEfc.seUseFld(a_PN, a_PutEfc, a_DftEfc);
//			if (l_OnAry)
//			{ stAryUtil.cApl(l_OnAry, null, a_Agms); }	//【现在不用数组了！】

			var l_fOn = tEfc.seUseFld(a_PN, a_PutEfc, a_DftEfc);
			if (l_fOn)
			{ l_fOn.apply(null, a_Agms); }
		}


		/// 绑定
		/// a_Efc：tEfc，特效
		/// a_PutTgt：HTMLElement，放置目标
		/// a_Put：HTMLElement，放置元素
		stEfcMgr.cBind = function (a_Efc)
		{
			stEfcMgr.cUbnd();
			e_Efc = a_Efc;
			return stEfcMgr;
		};

		/// 解绑
		stEfcMgr.cUbnd = function ()
		{
			e_Efc = null;
			return stEfcMgr;
		};

		/// 进入开始 - 从左
		stEfcMgr.cCssEntBgn_FromLt = function ()
		{
			eAcsFld("c_CssEntBgn").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["left"] = eToCssStr(-e_OffScrnOfst - a_Put.offsetWidth); });
			return stEfcMgr;
		};

		/// 进入开始 - 从水平中心
		stEfcMgr.cCssEntBgn_FromHc = function ()
		{
			eAcsFld("c_CssEntBgn").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["left"] = eToCssStr((eGetPutTgtWid(a_PutTgt) - a_Put.offsetWidth) / 2); });
			return stEfcMgr;
		};

		/// 进入开始 - 从右
		stEfcMgr.cCssEntBgn_FromRt = function ()
		{
			eAcsFld("c_CssEntBgn").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["left"] = eToCssStr(eGetPutTgtWid(a_PutTgt) + e_OffScrnOfst); });
			return stEfcMgr;
		};

		/// 进入开始 - 从上
		stEfcMgr.cCssEntBgn_FromUp = function ()
		{
			eAcsFld("c_CssEntBgn").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["top"] = eToCssStr(-e_OffScrnOfst - a_Put.offsetHeight); });
			return stEfcMgr;
		};

		/// 进入开始 - 从垂直中心
		stEfcMgr.cCssEntBgn_FromVc = function ()
		{
			eAcsFld("c_CssEntBgn").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["top"] = eToCssStr((eGetPutTgtHgt(a_PutTgt) - a_Put.offsetHeight) / 2); });
			return stEfcMgr;
		};

		/// 进入开始 - 从下
		stEfcMgr.cCssEntBgn_FromDn = function ()
		{
			eAcsFld("c_CssEntBgn").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["top"] = eToCssStr(eGetPutTgtHgt(a_PutTgt) + e_OffScrnOfst); });
			return stEfcMgr;
		};

		/// 进入开始 - 不透明度
		stEfcMgr.cCssEntBgn_Aph = function (a_Aph)
		{
			eAcsFld("c_CssEntBgn").push(eMake_Aph(a_Aph, 0));
			return stEfcMgr;
		};

		/// 进入结束 - 不透明度
		stEfcMgr.cCssEntEnd_Aph = function (a_Aph)
		{
			eAcsFld("c_CssEntEnd").push(eMake_Aph(a_Aph, 1));
			return stEfcMgr;
		};


		/// 离开结束 - 到左
		stEfcMgr.cCssLeaEnd_ToLt = function ()
		{
			eAcsFld("c_CssLeaEnd").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["left"] = eToCssStr(-e_OffScrnOfst - a_Put.offsetWidth); });
			return stEfcMgr;
		};

		/// 离开结束 - 到水平中心
		stEfcMgr.cCssLeaEnd_ToHc = function ()
		{
			eAcsFld("c_CssLeaEnd").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["left"] = eToCssStr((eGetPutTgtWid(a_PutTgt) - a_Put.offsetWidth) / 2); });
			return stEfcMgr;
		};

		/// 离开结束 - 到右
		stEfcMgr.cCssLeaEnd_ToRt = function ()
		{
			eAcsFld("c_CssLeaEnd").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["left"] = eToCssStr(eGetPutTgtWid(a_PutTgt) + e_OffScrnOfst); });
			return stEfcMgr;
		};

		/// 离开结束 - 到上
		stEfcMgr.cCssLeaEnd_ToUp = function ()
		{
			eAcsFld("c_CssLeaEnd").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["top"] = eToCssStr(-e_OffScrnOfst - a_Put.offsetHeight); });
			return stEfcMgr;
		};

		/// 离开结束 - 到垂直中心
		stEfcMgr.cCssLeaEnd_ToVc = function ()
		{
			eAcsFld("c_CssLeaEnd").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["top"] = eToCssStr((eGetPutTgtHgt(a_PutTgt) - a_Put.offsetHeight) / 2); });
			return stEfcMgr;
		};

		/// 离开结束 - 到下
		stEfcMgr.cCssLeaEnd_ToDn = function ()
		{
			eAcsFld("c_CssLeaEnd").push(function (a_Rst, a_PutTgt, a_Put)
			{ a_Rst["top"] = eToCssStr(eGetPutTgtHgt(a_PutTgt) + e_OffScrnOfst); });
			return stEfcMgr;
		};

		/// 离开结束 - 不透明度
		stEfcMgr.cCssLeaEnd_Aph = function (a_Aph)
		{
			eAcsFld("c_CssLeaEnd").push(eMake_Aph(a_Aph, 0));
			return stEfcMgr;
		};

		/// 离开清理 - 不透明度
		stEfcMgr.cCssLeaCln_Aph = function (a_Aph)
		{
			eAcsFld("c_CssLeaCln").push(eMake_Aph(a_Aph, 1));
			return stEfcMgr;
		};

		/// 进入 - 从哪
		/// a_EH：String∈{ "Lt", "Hc", "Rt" }，null表示中间
		/// a_EV：String∈{ "Up", "Vc", "Dn" }，null表示中间
		stEfcMgr.cCssEnt_From = function (a_EH, a_EV)
		{
			var l_EH = a_EH ? ("cCssEntBgn_From" + a_EH) : null;
			var l_EV = a_EV ? ("cCssEntBgn_From" + a_EV) : null;
			if (l_EH) { stEfcMgr[l_EH](); }
			if (l_EV) { stEfcMgr[l_EV](); }
			return stEfcMgr;
		};

		/// 离开 - 到哪
		/// a_LH：String∈{ "Lt", "Hc", "Rt" }，null表示中间
		/// a_LV：String∈{ "Up", "Vc", "Dn" }，null表示中间
		stEfcMgr.cCssLea_To = function (a_LH, a_LV)
		{
			var l_LH = a_LH ? ("cCssLeaEnd_To" + a_LH) : null;
			var l_LV = a_LV ? ("cCssLeaEnd_To" + a_LV) : null;
			if (l_LH) { stEfcMgr[l_LH](); }
			if (l_LV) { stEfcMgr[l_LV](); }
			return stEfcMgr;
		};

		/// 进离 - 从哪到哪
		/// a_EH，a_LH：String∈{ "Lt", "Hc", "Rt" }，a_EH为null表示中间，a_LH为null表示同a_EH
		/// a_EV，a_LV：String∈{ "Up", "Vc", "Dn" }，a_EV为null表示中间，a_LV为null表示同a_EV
		stEfcMgr.cCssEntLea_FromTo = function (a_EH, a_EV, a_LH, a_LV)
		{
			stEfcMgr.cCssEnt_From(a_EH, a_EV).cCssLea_To((a_LH || a_EH), (a_LV || a_EV));
			return stEfcMgr;
		};

		/// 进入 - 渐现
		/// a_BgnAph：Number，起始不透明度，默认0
		/// a_EndAph：Number，结束不透明度，默认1
		stEfcMgr.cCssEnt_FadeIn = function (a_BgnAph, a_EndAph)
		{
			stEfcMgr.cCssEntBgn_Aph(a_BgnAph).cCssEntEnd_Aph(a_EndAph);
			return stEfcMgr;
		};

		/// 离开 - 渐隐
		/// a_EndAph：Number，结束不透明度，默认0
		/// a_ClnAph：Number，清理不透明度，默认1
		stEfcMgr.cCssLea_FadeOut = function (a_EndAph, a_ClnAph)
		{
			stEfcMgr.cCssLeaEnd_Aph(a_EndAph).cCssLeaCln_Aph(a_ClnAph);
			return stEfcMgr;
		};

		/// 进离 - 渐现渐隐
		stEfcMgr.cCssEntLea_Fade = function (a_BgnAph, a_EntEndAph, a_LeaEndAph, a_ClnAph)
		{
			stEfcMgr.cCssEnt_FadeIn(a_BgnAph, a_EntEndAph).cCssLea_FadeOut(a_LeaEndAph, a_ClnAph);
			return stEfcMgr;
		};


		//----------------------------------------- 实用函数

		/// 获取目标区中心x坐标
		stEfcMgr.cGetTgtAreaCenX = function (a_TgtArea)
		{
			return a_TgtArea.c_X + a_TgtArea.c_W / 2;
		};

		/// 获取目标区中心y坐标
		stEfcMgr.cGetTgtAreaCenY = function (a_TgtArea)
		{
			return a_TgtArea.c_Y + a_TgtArea.c_H / 2;
		};

		/// 推到屏幕边
		/// a_Sara：tSara，要推动的区域
		/// a_ROx, a_ROy：Number，射线起点坐标
		/// a_RDx, a_RDy：Number，射线方向，不必是单位向量，但不能同时为0
		/// a_Isd，Boolean，内边缘？
		/// 返回：a_Sara
		stEfcMgr.cPushToScrnEdge = function (a_Sara, a_ROx, a_ROy, a_RDx, a_RDy, a_Isd)
		{
			var l_t, l_t1, l_t2, l_t3, l_t4, l_X, l_Y;
			l_t1 = fItsc_Ray_Line(a_ROx, a_ROy, a_RDx, a_RDy, 0, 0, 0, window.innerHeight);	// ←
			l_t2 = fItsc_Ray_Line(a_ROx, a_ROy, a_RDx, a_RDy, window.innerWidth, 0, window.innerWidth, window.innerHeight);	// →
			l_t3 = fItsc_Ray_Line(a_ROx, a_ROy, a_RDx, a_RDy, 0, 0, window.innerWidth, 0);	// ↑
			l_t4 = fItsc_Ray_Line(a_ROx, a_ROy, a_RDx, a_RDy, 0, window.innerHeight, window.innerWidth, window.innerHeight);// ↓
			if (l_t1 || l_t2 || l_t3 || l_t4)
			{
				l_t = (l_t1 > 0) ? l_t1 : Math.max(l_t1, l_t2, l_t3, l_t4);
				l_t = (l_t2 > 0) ? Math.min(l_t, l_t2) : l_t;
				l_t = (l_t3 > 0) ? Math.min(l_t, l_t3) : l_t;
				l_t = (l_t4 > 0) ? Math.min(l_t, l_t4) : l_t;
				l_X = a_ROx + l_t * a_RDx;
				l_Y = a_ROy + l_t * a_RDy;

				if (l_t == l_t1)
				{
					a_Sara.c_X = a_Isd ? (l_X) : (l_X - a_Sara.c_W);
					a_Sara.c_Y = l_Y - a_Sara.c_H / 2;
				}
				else
				if (l_t == l_t2)
				{
					a_Sara.c_X = a_Isd ? (l_X - a_Sara.c_W) : (l_X);
					a_Sara.c_Y = l_Y - a_Sara.c_H / 2;
				}
				else
				if (l_t == l_t3)
				{
					a_Sara.c_X = l_X - a_Sara.c_W / 2;
					a_Sara.c_Y = a_Isd ? (l_Y) : (l_Y - a_Sara.c_H);
				}
				else
				{
					a_Sara.c_X = l_X - a_Sara.c_W / 2;
					a_Sara.c_Y = a_Isd ? (l_Y - a_Sara.c_H) : (l_Y);
				}
			}
			else
			{
				l_X = a_ROx;
				l_Y = a_ROy;
				a_Sara.c_X = l_X;
				a_Sara.c_Y = l_Y;
			}
			return a_Sara;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////