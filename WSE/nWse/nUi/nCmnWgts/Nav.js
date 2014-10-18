/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tNav)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nCmnWgts",
		[
			"nWse:nUi/Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Nav.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;

	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;
	var tPntIptKind = tPntIpt.tKind;
	var tPntIptTch = tPntIpt.tTch;

	var nUi = nWse.nUi;
	var stEfcMgr = nUi.stEfcMgr || null;
	var tWgt = nUi.tWgt;
	var stFrmwk = nUi.stFrmwk || null;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 名字空间

	if (! nUi.nCmnWgts)
	{
		nWse.fNmspc(nUi,
			/// 公共控件
			function nCmnWgts() {});
	}
	var nCmnWgts = nUi.nCmnWgts;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fRset(a_This)
	{
		a_This.d_LiAry = null;

		a_This.d_TgtArea = new tSara();
		a_This.d_LeafAry = null;

		// 特效
		a_This.d_EfcAry = [
			new tNav.tEfc_Expd1(a_This),
			new tNav.tEfc_Expd2(a_This),
			new tNav.tEfc_Bzr(a_This)
		];
		a_This.d_ActvEfcIdx = 0;

		// 当窗口调整大小时，校准位置尺寸
		if (stFrmwk)
		{
			stFrmwk.cRegEvtHdlr("WndRszBefLot",
			function()
			{
				// 校准
				fRgltPosDim(a_This);
			});
		}
	}


	// 校准位置尺寸
	function fRgltPosDim(a_This)
	{
		// 首先计算宽度，确定目标区域
//		tSara.scEnsrTemps(1);
//		var l_WndArea = tSara.sc_Temps[0], l_TgtArea = a_This.d_TgtArea;
//		l_WndArea.cCrt(0, 0, window.innerWidth, window.innerHeight);

		var l_IsLvesVsb = a_This.cIsLvesVsb();

		var i_2Pi = 2 * Math.PI;
		var i_RadRge = i_2Pi;
		var i_MinR0 = 32, i_MaxR0 = 64;
		var l_R0 = Math.round(stNumUtil.cClmOnNum(window.innerWidth / 8, i_MinR0, i_MaxR0));
		var l_Dist = l_R0 * 3;
		var l_L = a_This.d_LiAry.length;

		var l_R1 = l_R0;
		var l_Tht = Math.asin(l_R1 / l_Dist);
		var l_Phi = 5 * Math.PI / 180;
		var l_Psi = 2 * l_Tht * l_L + l_Phi * (l_L - 1);
		if (l_Psi > i_RadRge)
		{
			if (2 * l_Tht * l_L < i_RadRge)
			{
				l_Phi = (i_RadRge - 2 * l_Tht * l_L) / (l_L - 1);
			}
			else
			{
				l_Tht = Math.PI / l_L;
				l_Phi = 0;
				l_R1 = Math.round(l_Dist * Math.sin(l_Tht));
			}

			l_Psi = i_RadRge;
		}

		a_This.d_RootRds = l_R0;
		a_This.d_LeafRds = l_R1;
		a_This.d_LeafRad = 2 * l_Tht;
		a_This.d_LeafDist = l_Dist;

		var l_Cx = window.innerWidth / 2, l_Cy = window.innerHeight / 2;
		a_This.d_RootX = l_Cx - a_This.d_RootRds;
		a_This.d_RootY0 = window.innerHeight - a_This.d_RootRds * 2;
		a_This.d_RootY1 = l_Cy - a_This.d_RootRds;
		stCssUtil.cSetPosDim(a_This.d_PutTgt, a_This.d_RootX, a_This.d_RootY0,
				a_This.d_RootRds * 2, a_This.d_RootRds * 2);
		a_This.d_PutTgt.style.borderRadius = a_This.d_RootRds.toString() + "px";	// 设置根的边框半径，使成为圆形

		a_This.d_CenX = l_Cx;
		a_This.d_CenY = l_Cy;
		a_This.d_LeafBornX = 0;
		a_This.d_LeafBornY = 0;

		// 对每个<li>
		var l_New = (! a_This.d_LeafAry) || (a_This.d_LeafAry.length != l_L);
		if (l_New)
		{ a_This.d_LeafAry = new Array(l_L); }

		var l_TotBgnRad = -Math.PI / 2 - l_Psi / 2 + l_Tht;	// 从左向右排列
		var l_Idx, l_Leaf, l_Cos, l_Sin, l_X, l_Y;
		for (l_Idx = 0; l_Idx<l_L; ++l_Idx)
		{
			if (! a_This.d_LeafAry[l_Idx])
			{ a_This.d_LeafAry[l_Idx] = { c_TgtArea: new tSara() }; }

			l_Leaf = a_This.d_LeafAry[l_Idx];
			if (! l_Leaf.c_Dom)
			{
				l_Leaf.c_Dom = a_This.d_LiAry[l_Idx];
				stCssUtil.cAddCssc(l_Leaf.c_Dom, "cnWse_tNav_Leaf");
			}

			l_Leaf.c_TgtRad = l_TotBgnRad + (a_This.d_LeafRad + l_Phi) * l_Idx;
			fCalcLeafTgtAreaByRad(l_Leaf.c_TgtArea, a_This, l_Leaf.c_TgtRad);

			// 设置<li>和<a>的边框半径，使成为圆形
			var l_BdrRds = a_This.d_LeafRds.toString() + "px";
			l_Leaf.c_Dom.style.borderRadius = l_BdrRds;

			var l_Dom_a = stDomUtil.cGetChdsOfTag(l_Leaf.c_Dom, "A", true);	// 得到第一个<a>
			if (l_Dom_a)
			{ l_Dom_a.style.borderRadius = l_BdrRds; }

			// 记录叶片
			a_This.d_LeafAry[l_Idx] = l_Leaf;

			// 添加到放置目标
			if (l_New)
			{
				//【已经改成绝对定位，所以不用放在<body>里了】
				a_This.d_PutTgt.appendChild(l_Leaf.c_Dom);		// 放在这里面更好，可IE愚蠢的脏矩形算法……
				//	stDomUtil.cAcsBody().appendChild(l_Leaf.c_Dom);	// fixed里不能有fixed，所以放在<body>里
			}
		}

		// 结束动画
		fFnshAnmt(a_This, false);
	}

	function fFnshAnmt(a_This, a_Cabk)
	{
		// 特效
		var l_ActvEfc = a_This.d_EfcAry[a_This.d_ActvEfcIdx];
		l_ActvEfc.vcFnshAnmt();

		// 摆放到目标区域
		fPutLeavesToTgtArea(a_This, a_Cabk);
	}

	function fPutLeavesToTgtArea(a_This, a_Cabk)
	{
		var l_This = a_This;
		var l_ActvEfc = l_This.d_EfcAry[l_This.d_ActvEfcIdx];
		var l_IsLvesVsb = l_ActvEfc.vcIsLvesVsb();
		stAryUtil.cFor(a_This.d_LeafAry,
			function (a_Ary, a_Idx, a_Leaf)
			{
				if (l_IsLvesVsb)
				{
					stCssUtil.cSetPosDim(a_Leaf.c_Dom, a_Leaf.c_TgtArea.c_X, a_Leaf.c_TgtArea.c_Y,
						a_Leaf.c_TgtArea.c_W, a_Leaf.c_TgtArea.c_H);
				}
				else
				{
					fOnLvesAnmtEnd_Lea(a_This, a_Idx, a_Leaf, a_Cabk);
				}
			});
	}

	function fIsPickLeaf(a_This, a_EvtTgt)
	{
		return (stAryUtil.cFind(a_This.d_LeafAry,
			function (a_Ary, a_Idx, a_Leaf)
			{
				return stDomUtil.cIsSelfOrAcst(a_Leaf.c_Dom, a_EvtTgt);
			}) >= 0);
	}

	function fCalcLeafTgtAreaByRad(a_Rst, a_This, a_Rad)
	{
		// 计算圆心(l_X, l_Y)，注意现在是绝对定位，不用 - a_This.d_LeafRds
		var l_Cos = Math.cos(a_Rad);
		var l_Sin = Math.sin(a_Rad);
		var l_X = a_This.d_LeafDist * l_Cos;
		var l_Y = a_This.d_LeafDist * l_Sin;
		a_Rst.cCrt(l_X, l_Y, a_This.d_LeafRds * 2, a_This.d_LeafRds * 2);
	}

	function fOnLvesAnmtBgn_Ent(a_This, a_Idx, a_Leaf)
	{
		a_Leaf.c_Dom.style.display = "block";	// 显示
		stCssUtil.cSetPosDim(a_Leaf.c_Dom, a_This.d_LeafBornX, a_This.d_LeafBornY, a_Leaf.c_TgtArea.c_W, a_Leaf.c_TgtArea.c_H);
	}

	function fOnLvesAnmtEnd_Ent(a_This, a_Idx, a_Leaf)
	{
		// 如果这是最后一个
		if (a_This.cAcsLeafAry().length - 1 == a_Idx)
		{
			// 回调
			if (a_This.d_Cfg.c_fOnAnmtEnd_Ent)
			{
				a_This.d_Cfg.c_fOnAnmtEnd_Ent(a_This);
			}
		}
	}

	function fOnLvesAnmtBgn_Lea(a_This, a_Idx, a_Leaf)
	{

	}

	function fOnLvesAnmtEnd_Lea(a_This, a_Idx, a_Leaf, a_Cabk)
	{
		a_Leaf.c_Dom.style.display = "";	// 样式表已设为"none"

		// 如果这是最后一个
		if (a_This.cAcsLeafAry().length - 1 == a_Idx)
		{
			// 如果自动随机切换特效
			if (a_This.d_Cfg.c_AutoRandEfc)
			{
				a_This.d_ActvEfcIdx = stNumUtil.cRandInt(0, a_This.cGetEfcAmt() - 1);
			}

			// 回调
			if (a_Cabk && a_This.d_Cfg.c_fOnAnmtEnd_Lea)
			{
				a_This.d_Cfg.c_fOnAnmtEnd_Lea(a_This);
			}
		}
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tNav;
	(function ()
	{
		tNav = nWse.fClass(nCmnWgts,
		/// 导航
		function tNav()
		{
			this.odBase(tNav).odCall();	// 基类版本

			var l_This = this;
			fRset(this);
		}
		,
		tWgt
		,
		{
			/// 绑定
			/// a_Cfg：Object，配置
			/// {
			///	c_PutTgt：String，放置目标的HTML元素ID，若不存在则自动创建带有指定ID的<div>，作为c_PutSrc的前一个兄弟节点
			/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
			/// c_DomPrn：Node，父节点，默认<body>
			/// c_AutoRandEfc：Boolean，自动随机特效，默认false
			/// c_fOnAnmtEnd_Ent：void f(a_Nav)，当进入动画结束时
			/// c_fOnAnmtEnd_Lea：void f(a_Nav)，当离开动画结束时
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tNav");	// CSS类

				l_This.d_LiAry = stDomUtil.cQryAll(l_This.dGnrtQrySlc_PutSrc() + " li");	// 取得所有<li>

				fRgltPosDim(l_This);	// 校准位置尺寸

				var l_Prn = a_Cfg.c_DomPrn || stDomUtil.cAcsBody();		// 加入到文档
				l_Prn.appendChild(l_This.d_PutTgt);
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 清除CSS类
				stAryUtil.cFor(l_This.d_LiAry,
				function (a_Ary, a_Idx, a_Li)
				{
					stCssUtil.cRmvCssc(a_Li, "cnWse_tNav_Leaf");
				});

				// 重置
				fRset(this);

				// 基类版本，最后才调用！
				this.odBase(f).odCall();
				return this;
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				var l_This = this;
				fFnshAnmt(l_This, true);
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				return this;
			}
			,
			/// 处理来自支配触点的输入
			/// a_DmntTchIdx：Number，支配触点索引
			/// a_DmntTch：Object，支配触点
			vdHdlIptFromDmntTch : function f(a_Ipt, a_DmntTchIdx, a_DmntTch)
			{
				this.odBase(f).odCall(a_Ipt, a_DmntTchIdx, a_DmntTch);	// 基类版本

				var l_This = this;
				var l_ActvEfc = l_This.d_EfcAry[l_This.d_ActvEfcIdx];

				if (l_This.dIsTchBgn(a_DmntTch))
				{
					a_DmntTch.c_Hdld = true;		// 已处理
				}
				else
				if (l_This.dIsTchLostOrEnd(a_DmntTch))
				{
//					if (l_This.dIsTchLost(a_DmntTch))
//					{
//						//
//					}
//					else
					if (l_This.dIsTchEnd(a_DmntTch))
					{
						// 如果点中根，切换叶片显示
						if (stDomUtil.cIsSelfOrAcst(l_This.d_PutTgt, a_DmntTch.cAcsEvtTgt()) &&
							(! fIsPickLeaf(l_This, a_DmntTch.cAcsEvtTgt())))
						{
							l_This.dTglLvesDspl();
						}

						a_DmntTch.c_Hdld = true;		// 已处理
					}
				}
				return this;
			}
			,
			/// 获得焦点
			vcGainFoc : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;
				return this;
			}
			,
			/// 失去焦点
			vcLoseFoc : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;
				return this;
			}
			,
			/// 叶瓣可见？
			cIsLvesVsb : function ()
			{
				var l_This = this;
				var l_ActvEfc = l_This.d_EfcAry[l_This.d_ActvEfcIdx];
				return l_ActvEfc.vcIsLvesVsb();
			}
			,
			/// 显隐叶瓣
			cShowHideLves : function (a_Show)
			{
				var l_This = this;
				var l_ActvEfc = l_This.d_EfcAry[l_This.d_ActvEfcIdx];
				l_ActvEfc.vcShowHideLves(a_Show);
				return this;
			}
			,
			/// 存取叶瓣数组
			cAcsLeafAry : function () { return this.d_LeafAry; }
			,
			/// 获取叶瓣数量
			cGetLeafAmt : function () { return this.d_LeafAry ? this.d_LeafAry.length : 0; }
			,
			/// 存取特效数组
			cAcsEfcAry : function ()
			{
				if (! this.d_EfcAry)
				{ this.d_EfcAry = []; }
				return this.d_EfcAry;
			}
			,
			/// 获取特效数量
			cGetEfcAmt : function () { return this.d_EfcAry ? this.d_EfcAry.length : 0; }
			,
			/// 获取激活特效索引
			cGetActvEfcIdx : function () { return this.d_ActvEfcIdx; }
			,
			/// 设置激活特效索引
			cSetActvEfcIdx : function (a_Idx)
			{
				this.d_ActvEfcIdx = stNumUtil.cClmOnAry(null, this.d_EfcAry, a_Idx);
				return this;
			}
			,
			/// 根据类存取特效
			cAcsEfcByClass : function (a_tClass)
			{
				var l_Idx = stAryUtil.cFind(this.d_EfcAry,
								function (a_Ary, a_Idx, a_Efc)
								{ return (a_Efc instanceof a_tClass); });
				return (l_Idx >= 0) ? this.d_EfcAry[l_Idx] : null;
			}
			,
			/// 切换叶片显示
			dTglLvesDspl : function ()
			{
				var l_This = this;
				var l_ActvEfc = l_This.d_EfcAry[l_This.d_ActvEfcIdx];
				var l_IsLvesVsb = l_ActvEfc.vcIsLvesVsb();

				// 根
				stCssUtil.cAnmt(l_This.d_PutTgt,
					{
						"top" : (l_IsLvesVsb ? l_This.d_RootY0 : l_This.d_RootY1).toString() + "px"
					},
					{
						c_Dur: 0.6,
						c_fEsn: function (a_Scl)
						{
							return nWse.stNumUtil.cPrbItp(0, 1, a_Scl, false);
						}
					});

				// 叶片
				l_ActvEfc.vcShowHideLves(! l_IsLvesVsb);
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fClass(tNav,
		/// 特效
		function atEfc(a_Nav)
		{
//			this.odBase(tNav).odCall();	// 基类版本
//
			var l_This = this;
			this.d_Host = a_Nav || null;
		}
		,
		null
		,
		{
			/// 叶瓣可见？
			vcIsLvesVsb : function f() { }
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				var l_This = this;

				// 结束动画
				stAryUtil.cFor(l_This.dAcsLeafAry(),
					function (a_Ary, a_Idx, a_Leaf)
					{
						stCssUtil.cFnshAnmt(a_Leaf.c_Dom, false, false);	// 不要跳，不回调
					});
				return this;
			}
			,
			/// 显隐叶瓣
			vcShowHideLves : function f(a_Show) { }
			,
			/// 存取宿主
			cAcsHost : function () { return this.d_Host; }
			,
			/// 获取导航x坐标
			dGetNavX : function () { return this.d_Host.d_RootX; }
			,
			/// 获取导航y坐标
			dGetNavY : function () { return this.vcIsLvesVsb() ? this.d_Host.d_RootY1 : this.d_Host.d_RootY0; }
			,
			/// 获取导航y0坐标
			dGetNavY0 : function () { return this.d_Host.d_RootY0; }
			,
			/// 获取导航y1坐标
			dGetNavY1 : function () { return this.d_Host.d_RootY1; }
			,
			/// 获取导航中心x坐标
			dGetNavCenX : function () { return this.d_Host.d_CenX; }
			,
			/// 获取导航中心y坐标
			dGetNavCenY : function () { return this.d_Host.d_CenY; }
			,
			/// 获取叶瓣出生x坐标
			dGetLeafBornX : function () { return this.d_Host.d_LeafBornX; }
			,
			/// 获取叶瓣出生y坐标
			dGetLeafBornY : function () { return this.d_Host.d_LeafBornY; }
			,
			/// 获取叶瓣中年x坐标
			dGetLeafMidX : function () { return 0; }
			,
			/// 获取叶瓣中年y坐标
			dGetLeafMidY : function () { return -this.d_Host.d_LeafDist; }
			,
			/// 获取叶瓣半径
			dGetLeafRds : function () { return this.d_Host.d_LeafRds; }
			,
			/// 获取叶瓣距离
			dGetLeafDist : function () { return this.d_Host.d_LeafDist; }
			,
			/// 获取叶瓣弧度
			dGetLeafRad : function () { return this.d_Host.d_LeafRad; }
			,
			/// 存取叶瓣数组
			dAcsLeafAry : function () { return this.d_Host.cAcsLeafAry(); }
			,
			/// 获取叶瓣数量
			dGetLeafAmt : function () { return this.d_Host.cGetLeafAmt(); }
			,
			/// 是最后一个叶瓣索引
			dIsLastLeafIdx : function (a_Idx) { return (this.d_Host.cGetLeafAmt() - 1 == a_Idx); }
			,
			/// 当动画结束 - 离开
			dOnAnmtEnd_Lea : function (a_Idx, a_Leaf) { fOnLvesAnmtEnd_Lea(this.d_Host, a_Idx, a_Leaf, true); }
			,
			/// 当动画结束 - 进入
			dOnAnmtEnd_Ent : function (a_Idx, a_Leaf) { fOnLvesAnmtEnd_Ent(this.d_Host, a_Idx, a_Leaf); }
		});

		nWse.fClass(tNav,
		/// 1阶段特效
		function t1StgEfc(a_Nav)
		{
			this.odBase(t1StgEfc).odCall(a_Nav);	// 基类版本

			var l_This = this;
			this.d_AnmtSta = 0;	// 动画状态：-1=离开1；0=隐藏；1=进入1；3=显示
		}
		,
		tNav.atEfc
		,
		{
			/// 叶瓣可见？
			vcIsLvesVsb: function f()
			{
				return (0 != this.d_AnmtSta);
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;
				if (l_This.dDurAnmtEnt())
				{
					l_This.d_AnmtSta = +3;
				}
				else
				if (l_This.dDurAnmtLea())
				{
					l_This.d_AnmtSta = 0;
				}
				return this;
			}
			,
			/// 显隐叶瓣
			vcShowHideLves: function f(a_Show)
			{
				var l_This = this;
				var l_Nav = l_This.d_Host;
				var l_fAnmtLeaf = null;
				if (a_Show) // d_AnmtSta一定是0
				{
					l_This.d_AnmtSta = +1;
					l_fAnmtLeaf = l_This.vdAnmtLeaf_Ent;
				}
				else // d_AnmtSta一定不是0
				{
					if (-1 == l_This.d_AnmtSta) // 正在离开，则进入
					{
						l_This.d_AnmtSta = +1;
						l_fAnmtLeaf = l_This.vdAnmtLeaf_Ent;
					}
					else
					if (+1 == l_This.d_AnmtSta) // 正在进入，则离开
					{
						l_This.d_AnmtSta = -1;
						l_fAnmtLeaf = l_This.vdAnmtLeaf_Lea;
					}
					else // +3，离开
					{
						l_This.d_AnmtSta = -1;
						l_fAnmtLeaf = l_This.vdAnmtLeaf_Lea;
					}
				}

				// 动画叶片
				stAryUtil.cFor(l_Nav.cAcsLeafAry(),
					function (a_Ary, a_Idx, a_Leaf)
					{
						l_fAnmtLeaf.call(l_This, a_Idx, a_Leaf);
					});
				return this;
			}
			,
			/// 在动画离开期间？
			dDurAnmtLea : function ()
			{
				return (-2 <= this.d_AnmtSta) && (this.d_AnmtSta <= -1);	// -2取不到，但不要紧
			}
			,
			/// 在动画进入期间？
			dDurAnmtEnt : function ()
			{
				return (+1 <= this.d_AnmtSta) && (this.d_AnmtSta <= +2);	// +2取不到，但不要紧
			}
			,
			/// 动画叶瓣 - 离开
			vdAnmtLeaf_Lea : function f(a_Idx, a_Leaf)
			{
				var l_This = this;
				fOnLvesAnmtBgn_Lea(l_This.d_Host, a_Idx, a_Leaf);	// 离开开始
			}
			,
			/// 动画叶瓣 - 进入
			vdAnmtLeaf_Ent : function f(a_Idx, a_Leaf)
			{
				var l_This = this;
				fOnLvesAnmtBgn_Ent(l_This.d_Host, a_Idx, a_Leaf);	// 进入开始
			}
		});

		nWse.fClass(tNav,
		/// 特效 - 展开1
		function tEfc_Expd1(a_Nav)
		{
			this.odBase(tEfc_Expd1).odCall(a_Nav);	// 基类版本

			var l_This = this;
		}
		,
		tNav.t1StgEfc
		,
		{
			vdAnmtLeaf_Lea : function f(a_Idx, a_Leaf)
			{
				this.odBase(f).odCall(a_Idx, a_Leaf);	// 基类版本

				var l_This = this;
				stCssUtil.cAnmt(a_Leaf.c_Dom,
					{
						"left": l_This.dGetLeafBornX().toString() + "px",
						"top": l_This.dGetLeafBornY().toString() + "px"
					},
					{
						c_Dur: 0.6,
						c_fEsn: function (a_Scl)
						{
							return nWse.stNumUtil.cPrbItp(0, 1, a_Scl, false);
						},
						c_fOnEnd: function ()
						{
							if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
							{ l_This.d_AnmtSta = 0; }

							l_This.dOnAnmtEnd_Lea(a_Idx, a_Leaf);
						}
					});
			}
			,
			vdAnmtLeaf_Ent : function f(a_Idx, a_Leaf)
			{
				this.odBase(f).odCall(a_Idx, a_Leaf);	// 基类版本

				var l_This = this;
				stCssUtil.cAnmt(a_Leaf.c_Dom,
					{
						"left": a_Leaf.c_TgtArea.c_X.toString() + "px",
						"top": a_Leaf.c_TgtArea.c_Y.toString() + "px"
					},
					{
						c_Dur: 0.6,
						c_fEsn: function (a_Scl)
						{
							return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.2, a_Scl, false);
						},
						c_fOnEnd: function ()
						{
							if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
							{ l_This.d_AnmtSta = +3; }

							l_This.dOnAnmtEnd_Ent(a_Idx, a_Leaf);
						}
					});
			}
		});

		nWse.fClass(tNav,
			/// 特效 - 贝塞尔
			function tEfc_Bzr(a_Nav)
			{
				this.odBase(tEfc_Bzr).odCall(a_Nav);	// 基类版本

				var l_This = this;
			}
			,
			tNav.t1StgEfc
			,
			{
				vdAnmtLeaf_Lea : function f(a_Idx, a_Leaf)
				{
					this.odBase(f).odCall(a_Idx, a_Leaf);	// 基类版本

					var l_This = this;

					var l_IP = l_This.dCalcItscPntWithScrnEdge(a_Idx, a_Leaf, false);	// 计算交点

					stCssUtil.cAnmt(a_Leaf.c_Dom,
						{
							"left": (l_IP.c_X).toString() + "px",
							"top": (l_IP.c_Y).toString() + "px"
						},
						{
							c_Dur: 0.6,
							c_fEsn: function (a_Scl)
							{
								return nWse.stNumUtil.cPrbItp(0, 1, a_Scl, true);
							},
							c_fMove : function (a_Rst, a_DomElmt, a_Bgn, a_End,
												a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
							{
								l_This.dAnmtMove.apply(l_This, arguments);
							},
							c_fOnEnd: function ()
							{
								if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
								{ l_This.d_AnmtSta = 0; }

								l_This.dOnAnmtEnd_Lea(a_Idx, a_Leaf);
							}
						});
				}
				,
				vdAnmtLeaf_Ent : function f(a_Idx, a_Leaf)
				{
					this.odBase(f).odCall(a_Idx, a_Leaf);	// 基类版本

					var l_This = this;

					var l_IP = l_This.dCalcItscPntWithScrnEdge(a_Idx, a_Leaf, true);	// 计算交点
					stCssUtil.cSetPos(a_Leaf.c_Dom, l_IP.c_X, l_IP.c_Y);	// 设置起始值

					stCssUtil.cAnmt(a_Leaf.c_Dom,
						{
							"left": a_Leaf.c_TgtArea.c_X.toString() + "px",
							"top": a_Leaf.c_TgtArea.c_Y.toString() + "px"
						},
						{
							c_Dur: 0.6,
							c_fEsn: function (a_Scl)
							{
								return nWse.stNumUtil.cPrbItp(0, 1, a_Scl, false);
							},
							c_fMove : function (a_Rst, a_DomElmt, a_Bgn, a_End,
												a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
							{
								l_This.dAnmtMove.apply(l_This, arguments);
							},
							c_fOnEnd: function ()
							{
								if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
								{ l_This.d_AnmtSta = +3; }

								l_This.dOnAnmtEnd_Ent(a_Idx, a_Leaf);
							}
						});
				}
				,
				/// 计算与屏幕边缘交点
				dCalcItscPntWithScrnEdge : function (a_Idx, a_Leaf, a_Ent)
				{
					// 计算与屏幕边缘的交点（先旋转）
					//【注意】叶瓣实用绝对定位，相对于根！
					// 客户区坐标系，而a_Leaf.c_TgtArea相对于根
					var l_This = this;
					tSara.scEnsrTemps(1);
					var l_IP = tSara.sc_Temps[0].cCrt$Wh(a_Leaf.c_TgtArea.c_W, a_Leaf.c_TgtArea.c_H);
					var l_RDx = (l_This.dGetNavX() + stEfcMgr.cGetTgtAreaCenX(a_Leaf.c_TgtArea)) - l_This.dGetNavCenX();
					var l_RDy = (l_This.dGetNavY() + stEfcMgr.cGetTgtAreaCenY(a_Leaf.c_TgtArea)) - l_This.dGetNavCenY();
//					var l_RDx = (l_This.dGetNavX() + a_Leaf.c_TgtArea.c_X) - l_This.dGetNavCenX();
//					var l_RDy = (l_This.dGetNavY() + a_Leaf.c_TgtArea.c_Y) - l_This.dGetNavCenY();
					var l_Tht = (a_Ent ? -Math.PI : Math.PI) / l_This.dGetLeafAmt();	// 转动量取决于叶瓣数
					var l_Cos = Math.cos(l_Tht), l_Sin = Math.sin(l_Tht);
					var l_RRDx = l_RDx * l_Cos - l_RDy * l_Sin;
					var l_RRDy = l_RDx * l_Sin + l_RDy * l_Cos;
					stEfcMgr.cPushToScrnEdge(l_IP, l_This.dGetNavCenX(), l_This.dGetNavCenY(), l_RRDx, l_RRDy);
					if (1) // 叶片绝对定位，为了支持IE……
					{
						l_IP.c_X -= l_This.dGetNavX();
						l_IP.c_Y -= l_This.dGetNavY0(); // 注意总是选Y0
					}
					return l_IP;
				}
				,
				/// 动画移动函数
				dAnmtMove : function (a_Rst, a_DomElmt, a_Bgn, a_End,
									  a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
				{
					var l_This = this;
					var l_DtaX = a_End.x - a_Bgn.x, l_DtaY = a_End.y - a_Bgn.y;
					var l_PerpX = l_DtaY, l_PerpY = -l_DtaX;
					var l_PerpLen = Math.sqrt(l_PerpX * l_PerpX + l_PerpY * l_PerpY);
					var l_Amp = l_PerpLen / 4;//l_This.dGetLeafRds() * 4;
					l_PerpX *= l_Amp / l_PerpLen;	l_PerpY *= l_Amp / l_PerpLen;

					var l_MidX = a_Bgn.x + l_DtaX / 2, l_MidY = a_Bgn.y + l_DtaY / 2;
					var l_C1x = l_MidX + l_PerpX,  l_C1y = l_MidY + l_PerpY;
					var l_C2x = l_C1x, l_C2y = l_C1y;
					nWse.stNumUtil.c2dBzr(a_Rst, [a_Bgn, {x:l_C1x, y:l_C1y}, {x:l_C2x, y:l_C2y}, a_End], a_EsnScl);
				}
			});

		nWse.fClass(tNav,
		/// 特效 - 展开2
		function tEfc_Expd2(a_Nav)
		{
			this.odBase(tEfc_Expd2).odCall(a_Nav);	// 基类版本

			var l_This = this;
			this.d_AnmtSta = 0;	// 动画状态：-1=离开1；-2=离开2；0=隐藏；1=进入1；2=进入2；3=显示
		}
		,
		tNav.atEfc
		,
		{
			/// 叶瓣可见？
			vcIsLvesVsb: function f()
			{
				return (0 != this.d_AnmtSta);
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;
				if (l_This.dDurAnmtEnt())
				{
					l_This.d_AnmtSta = +3;
				}
				else
				if (l_This.dDurAnmtLea())
				{
					l_This.d_AnmtSta = 0;
				}
				return this;
			}
			,
			/// 显隐叶瓣
			vcShowHideLves: function f(a_Show)
			{
				var l_This = this;
				var l_Nav = l_This.d_Host;
				var l_fAnmtLeaf = null;
				if (a_Show) // d_AnmtSta一定是0
				{
					l_This.d_AnmtSta = +1;
					l_fAnmtLeaf = l_This.dAnmtLeaf_Ent1;
				}
				else // d_AnmtSta一定不是0
				{
					if (-1 == l_This.d_AnmtSta) // 正在离开1，则进入2
					{
						l_This.d_AnmtSta = +2;
						l_fAnmtLeaf = l_This.dAnmtLeaf_Ent2;
					}
					else
					if (-2 == l_This.d_AnmtSta)	// 正在离开2，则进入1
					{
						l_This.d_AnmtSta = +1;
						l_fAnmtLeaf = l_This.dAnmtLeaf_Ent1;
					}
					else
					if (+1 == l_This.d_AnmtSta) // 正在进入1，则离开2
					{
						l_This.d_AnmtSta = -2;
						l_fAnmtLeaf = l_This.dAnmtLeaf_Lea2;
					}
					else
					if (+2 == l_This.d_AnmtSta) // 正在进入2，则离开1
					{
						l_This.d_AnmtSta = -1;
						l_fAnmtLeaf = l_This.dAnmtLeaf_Lea1;
					}
					else // +3，离开1
					{
						l_This.d_AnmtSta = -1;
						l_fAnmtLeaf = l_This.dAnmtLeaf_Lea1;
					}
				}

				// 动画叶片
				stAryUtil.cFor(l_Nav.cAcsLeafAry(),
					function (a_Ary, a_Idx, a_Leaf)
					{
						l_fAnmtLeaf.call(l_This, a_Idx, a_Leaf);
					});
				return this;
			}
			,
			/// 在动画离开期间？
			dDurAnmtLea : function ()
			{
				return (-2 <= this.d_AnmtSta) && (this.d_AnmtSta <= -1);
			}
			,
			/// 在动画进入期间？
			dDurAnmtEnt : function ()
			{
				return (+1 <= this.d_AnmtSta) && (this.d_AnmtSta <= +2);
			}
			,
			dAnmtLeaf_Lea1 : function (a_Idx, a_Leaf)
			{
				var l_This = this;
				fOnLvesAnmtBgn_Lea(l_This.d_Host, a_Idx, a_Leaf);	// 离开开始

				stCssUtil.cAnmt(a_Leaf.c_Dom,
					{
						"left": l_This.dGetLeafMidX().toString() + "px",
						"top": l_This.dGetLeafMidY().toString() + "px"
					},
					{
						c_Dur: 0.2,
						c_fMove: function (a_Rst, a_DomElmt, a_Bgn, a_End,
										   a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
						{
							tSara.scEnsrTemps(1);
							var l_AnmtTgtArea = tSara.sc_Temps[0];

							var l_BgnRad = a_Leaf.c_TgtRad;
							var l_EndRad = -Math.PI / 2;
							a_Leaf.c_Rad = stNumUtil.cLnrItp(l_BgnRad, l_EndRad, a_EsnScl);
							fCalcLeafTgtAreaByRad(l_AnmtTgtArea, l_This.cAcsHost(), a_Leaf.c_Rad);
							a_Rst.x = l_AnmtTgtArea.c_X;
							a_Rst.y = l_AnmtTgtArea.c_Y;
						},
						c_fOnEnd: function ()
						{
							if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
							{ l_This.d_AnmtSta = -2; }

							l_This.dAnmtLeaf_Lea2(a_Idx, a_Leaf);
						}
					});
			}
			,
			dAnmtLeaf_Lea2 : function (a_Idx, a_Leaf)
			{
				var l_This = this;
				stCssUtil.cAnmt(a_Leaf.c_Dom,
					{
						"left": l_This.dGetLeafBornX().toString() + "px",
						"top": l_This.dGetLeafBornY().toString() + "px"
					},
					{
						c_Dur: 0.4,
						c_fEsn: function (a_Scl)
						{
							return nWse.stNumUtil.cPrbItp(0, 1, a_Scl, false);
						//	return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.2, a_Scl, false);
						},
						c_fOnEnd: function ()
						{
							if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
							{ l_This.d_AnmtSta = 0; }

							l_This.dOnAnmtEnd_Lea(a_Idx, a_Leaf);
						}
					});
			}
			,
			dAnmtLeaf_Ent1 : function (a_Idx, a_Leaf)
			{
				var l_This = this;
				fOnLvesAnmtBgn_Ent(l_This.d_Host, a_Idx, a_Leaf);	// 进入开始

				stCssUtil.cAnmt(a_Leaf.c_Dom,
					{
						"left": l_This.dGetLeafMidX().toString() + "px",
						"top": l_This.dGetLeafMidY().toString() + "px"
					},
					{
						c_Dur: 0.4,
						c_fEsn: function (a_Scl)
						{
							return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.8, a_Scl, false);
						},
						c_fOnEnd: function ()
						{
							if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
							{ l_This.d_AnmtSta = +2; }

							l_This.dAnmtLeaf_Ent2(a_Idx, a_Leaf);
						}
					});
			}
			,
			dAnmtLeaf_Ent2 : function (a_Idx, a_Leaf)
			{
				var l_This = this;
				stCssUtil.cAnmt(a_Leaf.c_Dom,
					{
						"left": a_Leaf.c_TgtArea.c_X.toString() + "px",
						"top": a_Leaf.c_TgtArea.c_Y.toString() + "px"
					},
					{
						c_Dur: 0.2,
	//				c_fEsn: function (a_Scl)
	//				{
	//					return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.2, a_Scl, false);
	//				},
						c_fMove: function (a_Rst, a_DomElmt, a_Bgn, a_End,
										   a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
						{
							tSara.scEnsrTemps(1);
							var l_AnmtTgtArea = tSara.sc_Temps[0];

							var l_BgnRad = -Math.PI / 2;
							var l_EndRad = a_Leaf.c_TgtRad;
							a_Leaf.c_Rad = stNumUtil.cLnrItp(l_BgnRad, l_EndRad, a_EsnScl);
							fCalcLeafTgtAreaByRad(l_AnmtTgtArea, l_This.cAcsHost(), a_Leaf.c_Rad);
							a_Rst.x = l_AnmtTgtArea.c_X;
							a_Rst.y = l_AnmtTgtArea.c_Y;
						},
						c_fOnEnd: function ()
						{
							if (l_This.dIsLastLeafIdx(a_Idx))	// 设置状态
							{ l_This.d_AnmtSta = +3; }

							l_This.dOnAnmtEnd_Ent(a_Idx, a_Leaf);
						}
					});
			}
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////