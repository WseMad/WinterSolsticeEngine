/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.tWgt)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi",
		[
			"(0)Plmvc.js",
			"nWse:PntIptTrkr.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Wgt.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;
	var tSara = nWse.tSara;

	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;
	var tPntIptKind = tPntIpt.tKind;
	var tPntIptTch = tPntIpt.tTch;

	var nUi = nWse.nUi;
	var unKnl = nUi.unKnl;
//	var stFrmwk = nUi.stFrmwk || null;	//【警告】stFrmwk此时尚未创建

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_RcRectRds = null;		// 圆角矩形半径
	var s_DomElmtBbox = null;	// Dom元素包围盒

	function fObtnPutSrc(a_This, a_Cfg)
	{
		var l_Rst = unKnl.fObtnPutSrc(a_Cfg.c_PutSrc);

		// 簿记
		if (! l_Rst.Wse_Wgt)
		{ l_Rst.Wse_Wgt = {}; }

		l_Rst.Wse_Wgt.c_Wgt = a_This;	// 记录关联的控件
		return l_Rst;
	}

	function fObtnPutTgt(a_This, a_Cfg, a_PutSrc)
	{
		var l_Rst = unKnl.fObtnPutTgt(a_Cfg.c_PutTgt, a_PutSrc, tWgt.sd_PutTgtSlc);
		tWgt.sd_PutTgtSlc = "";	// 复位

		// 簿记
		if (! l_Rst.Wse_Wgt)
		{ l_Rst.Wse_Wgt = {}; }

		l_Rst.Wse_Wgt.c_Wgt = a_This;	// 记录关联的控件
		return l_Rst;
	}

	//document.getElementsByTagName("html")[0] === document.documentElement		true

	function fClnPutTgt(a_This)
	{
		unKnl.fClnPutTgt(a_This.d_PutTgt, a_This.d_PutSrc);
	}

	function fSetDmntTchId(a_This, a_TchId)
	{
		a_This.d_DmntTchId = a_TchId || null;
	}

	function fBld2dPathByCssBdr(a_Path, a_DomElmt, a_Bbox)
	{
		if (! a_Bbox)
		{
			if (! s_DomElmtBbox)
			{ s_DomElmtBbox = new tSara(); }

			a_Bbox = tSara.scCrt$DomBcr(s_DomElmtBbox, a_DomElmt);
		}

		var l_BdrRds = tWgt.sd_PutTgtBdrRds;
		stCssUtil.cGetBdrRds(l_BdrRds, a_DomElmt);

		if (! s_RcRectRds)
		{ s_RcRectRds = new Array(4); }
		s_RcRectRds[0] = l_BdrRds.c_BdrRdsLtUp;
		s_RcRectRds[1] = l_BdrRds.c_BdrRdsRtUp;
		s_RcRectRds[2] = l_BdrRds.c_BdrRdsRtDn;
		s_RcRectRds[3] = l_BdrRds.c_BdrRdsLtDn;

		a_Path.cRset().cRcRect(false, a_Bbox.c_X, a_Bbox.c_Y, a_Bbox.c_W, a_Bbox.c_H, s_RcRectRds);
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tWgt, tWgtSet, tForm;
	(function ()
	{
		tWgt = nWse.fClass(nUi,
		/// 控件
		function tWgt()
		{
			var l_This = this;
			this.d_Cfg = null;
			this.d_PutSrc = null;
			this.d_PutTgt = null;
			this.d_PutSrcOrigCssc = null;
			this.d_PutTgtOrigCssc = null;
		}
		,
		null
		,
		{
			/// 绑定
			/// a_Cfg：Object，配置
			/// {
			///	c_PutTgt：String，放置目标的HTML元素ID，若不存在则自动创建带有指定ID的<div>，作为c_PutSrc的前一个兄弟节点
			/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
			/// }
			vcBind : function f(a_Cfg)
			{
				var l_This = this;
				if (l_This.d_PutSrc)	// 先解绑以前的
				{ l_This.vcUbnd(); }

				if (! a_Cfg)			// 配置无效立即返回
				{ return this; }

				l_This.d_Cfg = a_Cfg;

				// 取得目标和来源
				var l_PutSrc = fObtnPutSrc(l_This, a_Cfg);	if (! l_PutSrc) { throw new Error("c_PutSrc无效！"); }
				var l_PutTgt = fObtnPutTgt(l_This, a_Cfg, l_PutSrc);
				l_This.d_PutSrc = l_PutSrc;
				l_This.d_PutTgt = l_PutTgt;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tWgt_Nml");	// CSS类
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 清理
			//	l_This.cClnPutTgt();	//【不用了，由外界控制】

				// 还原放置目标和来源
				if (l_This.d_PutTgt)
				{
					if (l_This.d_PutTgt.Wse_Wgt)							// 簿记
					{ l_This.d_PutTgt.Wse_Wgt = null; }

					unKnl.fAbdnPutTgt(l_This.d_PutTgt);
					l_This.d_PutTgt = null;
				}

				if (l_This.d_PutSrc)
				{
					if (l_This.d_PutSrc.Wse_Wgt)							// 簿记
					{ l_This.d_PutSrc.Wse_Wgt = null; }

					unKnl.fAbdnPutSrc(l_This.d_PutSrc);
					l_This.d_PutSrc = null;
				}

				// 清null
				l_This.d_Cfg = null;
				return this;
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				var l_This = this;

				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				var l_This = this;

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				var l_This = this;

				return this;
			}
			,
			/// 拾取
			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
			vcPick : function f(a_Bbox, a_Picker)
			{
				if (a_Bbox)
				{
					return this; // 直接使用初始值（放置目标的）就可以了
				}

				// 拾取放置目标
				this.dPickPutTgtByPathPnt(a_Picker, this.d_PutTgt);
				return this;
			}
			,
			/// 输入复位
			vcIptRset : function f()
			{
				// 清除支配触点
				fSetDmntTchId(this, null);
				return this;
			}
			,
			/// 处理输入
			vcHdlIpt : function f(a_Ipt)
			{
				var l_This = this;
//				l_PrmrTch.cSetDomEvtFlag(true, true);		// 设置DOM事件标志

				var l_TchIdx;	// 触点索引

				// 如果有支配触点
				if (l_This.d_DmntTchId)
				{
					// 找到支配触点
					l_TchIdx = a_Ipt.cFindTchById(l_This.d_DmntTchId);

					//【注意】如果没有找到，证明“支配触点丢失”，
					// 按理不应发生，因为框架追踪所有活动触点，每个触点的输入和处理流程应是完整的，
					// 但是造成丢失的原因可能很复杂（程序内部因素或不可控外部因素），所以必须应对
					if (l_TchIdx < 0)
					{
						// 目前这里的做法是，简单地清除支配触点
						fSetDmntTchId(l_This, null);

						// 对输入不作处理
						return;
					}
				}
				else // 尚无支配触点
				{
					// 找到最靠前的、拾取到自己的触点
					l_TchIdx = a_Ipt.cFindTchByPkdWgt(this);

					// 如果没有找到
					if (l_TchIdx < 0)
					{
						// 如果输入里含有i_TchBgn
						if (a_Ipt.cHasTchOfKind(tPntIptKind.i_TchBgn))
						{
							//【这是给nPick用的】
							// 通知面板把自己从焦点里移除
						//	this.cAcsPnl().cRmvFocs(this);

							//【这是给nUi用的】
							nUi.stFrmwk.cRmvFocs(l_This);
						}

						// 对输入不作处理
						return;
					}

					// 如果找到，将这个触点选作自己的支配触点
					fSetDmntTchId(l_This, a_Ipt.c_Tchs[l_TchIdx].c_TchId);
				}

				// 现在l_TchIdx一定表示自己的支配触点索引
				// 通过虚函数转发输入处理
				l_This.vdHdlIptFromDmntTch(a_Ipt, l_TchIdx, a_Ipt.c_Tchs[l_TchIdx]);
				return this;
			}
			,
			/// 处理来自支配触点的输入
			/// a_DmntTchIdx：Number，支配触点索引
			/// a_DmntTch：Object，支配触点
			vdHdlIptFromDmntTch : function f(a_Ipt, a_DmntTchIdx, a_DmntTch)
			{
				var l_This = this;

				// 如果支配触点的输入种类是i_TchLost或i_TchEnd
				//if ((tPntIptKind.i_TchLost == a_DmntTch.c_Kind) ||
				//	(tPntIptKind.i_TchEnd == a_DmntTch.c_Kind))
				if (l_This.dIsTchLostOrEnd(a_DmntTch))
				{
					l_This.vcIptRset();			// 输入复位
					a_DmntTch.c_Hdld = true;	// 已处理
				}

				if (l_This.dIsTchBgn(a_DmntTch))
				{
					l_This.dRplcCsscForPutTgt("cnWse_tWgt_Nml", "cnWse_tWgt_Tch", true);
				}
				else
				if (l_This.dIsTchLostOrEnd(a_DmntTch))
				{
					l_This.dRplcCsscForPutTgt("cnWse_tWgt_Tch", "cnWse_tWgt_Nml", true);

//					if (l_This.dIsTchLost(a_DmntTch))
//					{
//						//
//					}
//					else
//					if (l_This.dIsTchEnd(a_DmntTch))
//					{
//						//
//					}
				}
				return this;
			}
			,
			/// 获得焦点
			vcGainFoc : function f()
			{
				return this;
			}
			,
			/// 失去焦点
			vcLoseFoc : function f()
			{
				return this;
			}
			,
			/// 已绑定？即检查放置来源是否有效
			cHasBnd : function ()
			{
				return !! this.d_PutSrc;
			}
			,
			/// 刷新
			cRfsh : function ()
			{
				// 之前
				this.vcRfshBefLot();

				// 触发放置事件 - 宽度已决定
				if (nUi.tPcdrLot && this.d_PutTgt)
				{ nUi.tPcdrLot.scTrgrPutEvt_WidDtmnd(this.d_PutTgt); }

				// 之后
				this.vcRfshAftLot();
				return this;
			}
			,
			/// 触摸开始？
			dIsTchBgn : function (a_Tch)
			{
				return (tPntIptKind.i_TchBgn == a_Tch.c_Kind);
			//	return (a_Tch.c_PkdWgt === this) && (tPntIptKind.i_TchBgn == a_Tch.c_Kind);
			}
			,
			/// 触摸中断？
			dIsTchLost : function (a_Tch)
			{
				return (tPntIptKind.i_TchLost == a_Tch.c_Kind);
			//	return (a_Tch.c_PkdWgt !== this) || (tPntIptKind.i_TchLost == a_Tch.c_Kind);
			}
			,
			/// 触摸结束？
			dIsTchEnd : function (a_Tch)
			{
				return (tPntIptKind.i_TchEnd == a_Tch.c_Kind);
			//	return ((! a_Tch.c_PkdWgt) || (a_Tch.c_PkdWgt === this)) && (tPntIptKind.i_TchEnd == a_Tch.c_Kind);
			}
			,
			/// 触摸中断或结束
			dIsTchLostOrEnd : function (a_Tch)
			{
				return this.dIsTchLost(a_Tch) || this.dIsTchEnd(a_Tch);
			}
			,
			/// 清理放置目标
			cClnPutTgt : function f()
			{
				if (! this.d_PutTgt)
				{ return this; }

				var l_This = this;
				fClnPutTgt(l_This);
				return this;
			}
			,
			/// 存取放置来源
			cAcsPutSrc : function ()
			{
				return this.d_PutSrc;
			}
			,
			/// 存取放置目标
			cAcsPutTgt : function ()
			{
				return this.d_PutTgt;
			}
			,
			/// 获取放置目标宽度
			cGetPutTgtWid : function () { return this.d_PutTgt ? this.d_PutTgt.clientWidth : 0; }
			,
			/// 获取放置目标高度
			cGetPutTgtHgt : function () { return this.d_PutTgt ? this.d_PutTgt.clientHeight : 0; }
			,
			/// 生成查询选择器 - 放置来源
			dGnrtQrySlc_PutSrc : function ()
			{
				return this.d_PutSrc ? ("#" + this.d_PutSrc.id) : "";
			}
			,
			/// 生成查询选择器 - 放置目标
			dGnrtQrySlc_PutTgt : function ()
			{
				return this.d_PutTgt ? ("#" + this.d_PutTgt.id) : "";
			}
			,
			/// 根据特性存取DOM节点，首先搜索放置来源，若未找到再搜索放置目标
			dAcsDomNodeByAttr : function (a_AttrName)
			{
				var l_Rst = stDomUtil.cQryOne(this.dGnrtQrySlc_PutSrc() + ">[data-" + a_AttrName + "]");
				if (! l_Rst)
				{
					l_Rst = stDomUtil.cQryOne(this.dGnrtQrySlc_PutTgt() + ">[data-" + a_AttrName + "]");
				}
				return l_Rst;
			}
			,
			/// 根据特性获取DOM节点
			/// a_InPutTgt：Boolean，true=搜索放置目标，false=搜索放置来源
			dGetDomNodesByAttr : function (a_AttrName, a_InPutTgt)
			{
				var l_Slc = a_InPutTgt ? this.dGnrtQrySlc_PutTgt() : this.dGnrtQrySlc_PutSrc();
				var l_Rst = stDomUtil.cQryAll(l_Slc + ">[data-" + a_AttrName + "]");
				return l_Rst;
			}
			,
			/// 放置元素是否在目标里
			dIsPutInTgt : function (a_Put)
			{
				return unKnl.fIsPutInTgt(this.d_PutTgt, a_Put);
			}
			,
			/// 放置元素是否在来源里
			dIsPutInSrc : function (a_Put)
			{
				return a_Put ? unKnl.fIsPutInSrc(this.d_PutSrc, a_Put) : false;
			}
			,
			/// 摆放至目标
			dPutToTgt : function (a_PutInSrc, a_Bef)
			{
				unKnl.fPutToTgt(this.d_PutTgt, this.d_PutSrc, a_PutInSrc, a_Bef, true);
				return this;
			}
			,
			/// 追加到放置来源
			dApdToSrc : function (a_Put)
			{
				unKnl.fApdToSrc(this.d_PutSrc, a_Put);
			}
			,
			/// 归还至来源
			dRtnToSrc : function (a_PutInTgt, a_Bef)
			{
				unKnl.fRtnToSrc(this.d_PutTgt, this.d_PutSrc, a_PutInTgt, a_Bef, true);
				return this;
			}
			,
			/// 当在来源里时移除
			/// a_FldName：String，this的字段名，标识一个DOM节点
			dRmvWhenInSrc : function (a_FldName)
			{
				if (this.dIsPutInSrc(this[a_FldName]))
				{ this[a_FldName].parentNode.removeChild(this[a_FldName]); }

				this[a_FldName] = null;
			}
			,
			/// 为放置目标替换CSS类
			dRplcCsscForPutTgt : function (a_RmvCssc, a_AddCssc, a_AddWhenAbst)
			{
				stCssUtil.cRplcCssc(this.d_PutTgt, a_RmvCssc, a_AddCssc, a_AddWhenAbst);
				return this;
			}
			,
			/// 是放置目标或其后代？
			dIsSelfOrDsdtOfPutTgt : function (a_DomElmt)
			{
				return stDomUtil.cIsSelfOrAcst(this.d_PutTgt, a_DomElmt);
			}
			,
			/// 计算放置目标包围区，忽略外边距
			/// a_Rst：tSara
			dCalcPutTgtBbox : function (a_Rst)
			{
				return a_Rst.cCrt(0, 0, this.d_PutTgt.offsetWidth, this.d_PutTgt.offsetHeight);
			}
			,
			/// 获取放置目标宽度，必须在vcRfshAftLot里调用
			dGetPutTgtWid : function ()
			{
				var l_TgtArea = nUi.stFrmwk.cAcsTgtAreaOfPut(this.d_PutTgt);
				return l_TgtArea ? l_TgtArea.c_W : 0;
			}
			,
			/// 获取放置目标内容宽度，必须在vcRfshAftLot里调用，同时更新sd_PutTgtBdrThk和sd_PutTgtPad
			dGetPutTgtCtntWid : function ()
			{
				var l_TgtArea = nUi.stFrmwk.cAcsTgtAreaOfPut(this.d_PutTgt);
				if (! l_TgtArea)
				{ return 0; }

				// 计算边框和内边距
				var l_BdrThk = tWgt.sd_PutTgtBdrThk, l_Pad = tWgt.sd_PutTgtPad;
				stCssUtil.cGetBdrThk(l_BdrThk, this.d_PutTgt);
				stCssUtil.cGetPad(l_Pad, this.d_PutTgt);
				var l_Rst = l_TgtArea.c_W - l_BdrThk.c_BdrThkLt - l_BdrThk.c_BdrThkRt - l_Pad.c_PadLt - l_Pad.c_PadRt;
				return Math.max(l_Rst, 0);
			}
			,
			/// 清除放置目标CSS高度
			dClrPutTgtCssHgt : function ()
			{
				if (this.d_PutTgt && this.d_PutTgt.style.height)
				{ this.d_PutTgt.style.height = ""; }
				return this;
			}
			,
			/// 注册放置目标事件处理器 - 当宽度已决定时
			dRegPutTgtEvtHdlr_OnWidDtmnd : function (a_fOn)
			{
				nUi.fRegPutEvtHdlr(this.d_PutTgt, "WidDtmnd", a_fOn);
				return this;
			}
			,
			/// 注销放置目标事件处理器 - 当宽度已决定时
			dUrgPutTgtEvtHdlr_OnWidDtmnd : function (a_fOn)
			{
				nUi.fUrgPutEvtHdlr(this.d_PutTgt, "WidDtmnd", a_fOn);
				return this;
			}
			,
			/// 注册放置目标事件处理器 - 当动画更新结束时
			dRegPutTgtEvtHdlr_OnAnmtUpdEnd : function (a_fOn)
			{
				nUi.fRegPutEvtHdlr(this.d_PutTgt, "AnmtUpd", a_fOn);
				nUi.fRegPutEvtHdlr(this.d_PutTgt, "AnmtEnd", a_fOn);
				return this;
			}
			,
			/// 注销放置目标事件处理器 - 当动画更新结束时
			dUrgPutTgtEvtHdlr_OnAnmtUpdEnd : function (a_fOn)
			{
				nUi.fUrgPutEvtHdlr(this.d_PutTgt, "AnmtUpd", a_fOn);
				nUi.fUrgPutEvtHdlr(this.d_PutTgt, "AnmtEnd", a_fOn);
				return this;
			}
			,
			/// 获取序列化的键，依次选：Wse_Name，name，id
			dGetKeyOfSrlz : function ()
			{
				return this.d_PutSrc ? (this.d_PutSrc.Wse_Name || this.d_PutSrc.name || this.d_PutSrc.id) : "";
			}
			,
			/// 当序列化时检查键
			/// a_Key：String，键名，默认dGetKeyOfSrlz()
			/// 返回：a_Key，若发生冲突则抛出异常
			dChkKeyOnSrlz : function (a_Kvo, a_Key)
			{
				if (! a_Key)
				{ a_Key = this.dGetKeyOfSrlz(); }

				if (a_Key in a_Kvo)
				{ throw new Error("tWgt序列化时遇到键冲突：“" + a_Key + "”！"); }

				return a_Key;
			}
			,
			/// 根据路径点拾取放置目标
			/// a_EvtTgt：HTMLElement，事件目标，默认a_DomElmt
			dPickPutTgtByPathPnt : function (a_Picker, a_EvtTgt)
			{
				// 注意最后一个参数不要传a_Picker.cAcsBbox()，因为不一定是this.d_PutTgt的包围盒
				return this.ePickDomElmtByPathPnt(this.d_PutTgt, a_Picker, a_EvtTgt, null);//a_Picker.cAcsBbox());
			}
			,
			/// 根据路径点拾取DOM元素
			/// a_EvtTgt：HTMLElement，事件目标，默认a_DomElmt
			dPickDomElmtByPathPnt : function (a_DomElmt, a_Picker, a_EvtTgt)
			{
				return this.ePickDomElmtByPathPnt(a_DomElmt, a_Picker, a_EvtTgt, null);
			}
			,
			ePickDomElmtByPathPnt : function (a_DomElmt, a_Picker, a_EvtTgt, a_Bbox)
			{
				var l_This = this;
				if ((! a_DomElmt) || a_Picker.cIsOver())
				{ return this; }

				a_Picker.cPickBgn(l_This, a_Picker.i_PathPnt);
				fBld2dPathByCssBdr(a_Picker.cAcs2dPath(), a_DomElmt, a_Bbox);
				a_Picker.cPickEnd(l_This, a_EvtTgt || a_DomElmt);
				return this;
			}
			,
			/// 获取放置目标边框厚度，返回到tWgt.sd_PutTgtBdrThk
			dGetPutTgtBdrThk : function ()
			{
				stCssUtil.cGetBdrThk(tWgt.sd_PutTgtBdrThk, this.d_PutTgt, null, true);
				return tWgt.sd_PutTgtBdrThk;
			}
			,
			/// 获取放置目标边框半径，返回到tWgt.sd_PutTgtBdrRds
			dGetPutTgtBdrRds : function ()
			{
				stCssUtil.cGetBdrRds(tWgt.sd_PutTgtBdrRds, this.d_PutTgt, null, true);
				return tWgt.sd_PutTgtBdrRds;
			}
			,
			/// 获取放置目标内边距，返回到tWgt.sd_PutTgtPad
			dGetPutTgtPad : function ()
			{
				stCssUtil.cGetPad(tWgt.sd_PutTgtPad, this.d_PutTgt, null, true);
				return tWgt.sd_PutTgtPad;
			}
		}
		,
		{
			/// 最小高度（部分支持固定宽高比的控件使用）
			i_MinHgt : 32
			,
			/// 放置目标选择器
			sd_PutTgtSlc : ""
			,
			/// 放置目标边框厚度
			sd_PutTgtBdrThk : {}
			,
			/// 放置目标边框半径
			sd_PutTgtBdrRds : {}
			,
			/// 放置目标内边距
			sd_PutTgtPad : {}
		}
		,
		false);
	})();

	(function ()
	{
		tWgtSet = nWse.fClass(nUi,
		/// 控件集
		function tWgtSet()
		{
			this.cRset();
		}
		,
		null
		,
		{
			/// 重置
			cRset : function ()
			{
				this.e_Wgts = [];
				return this;
			}
			,
			/// 存取控件数组，【注意】不要修改！
			cAcsWgts : function ()
			{
				return this.e_Wgts;
			}
			,
			/// 获取数量
			cGetAmt : function ()
			{
				return this.e_Wgts.length;
			}
			,
			/// 清空
			cClr : function ()
			{
				this.e_Wgts.length = 0;
				return this;
			}
			,
			/// 根据放置来源ID查找
			/// a_PutSrcId：String，放置来源ID
			cFindByPutSrcId : function (a_PutSrcId)
			{
				if (! a_PutSrcId)
				{ return -1; }

				var l_This = this;
				return stAryUtil.cFind(l_This.e_Wgts,
				function (a_Ary, a_Idx, a_Wgt)
				{ return (a_Wgt.d_PutSrc && (a_Wgt.d_PutSrc.id == a_PutSrcId)); });
			}
			,
			/// 根据索引存取
			cAcsByIdx : function (a_Idx)
			{
				return stAryUtil.cIsIdxVld(this.e_Wgts, a_Idx) ? this.e_Wgts[a_Idx] : null;
			}
			,
			/// 根据放置来源ID存取
			cAcsByPutSrcId : function (a_PutSrcId)
			{
				return this.cAcsByIdx(this.cFindByPutSrcId(a_PutSrcId));
			}
			,
			/// 添加
			cAdd : function (a_Wgt)
			{
				if (this.e_Wgts.indexOf(a_Wgt) >= 0)	// 预防重复添加
				{ return this; }

				this.e_Wgts.push(a_Wgt);
				return this;
			}
			,
			/// 根据放置来源ID移除
			cRmvByPutSrcId : function (a_PutSrcId)
			{
				return this.cRmvByIdx(this.cFindByPutSrcId(a_PutSrcId));
			}
			,
			/// 根据索引移除
			cRmvByIdx : function (a_Idx)
			{
				if (! stAryUtil.cIsIdxVld(this.e_Wgts, a_Idx))
				{ return this; }

				this.e_Wgts.splice(a_Idx, 1);
				return this;
			}
			,
			/// 清理放置目标
			cClnPutTgt : function ()
			{
				var l_This = this;
				stAryUtil.cFor(l_This.e_Wgts,
					function (a_Ary, a_Idx, a_Wgt)
					{ a_Wgt.cClnPutTgt(); });
				return this;
			}
			,
			/// 解绑全部
			cUbndAll : function ()
			{
				var l_This = this;
				stAryUtil.cFor(l_This.e_Wgts,
					function (a_Ary, a_Idx, a_Wgt)
					{ a_Wgt.vcUbnd(); });
				return this;
			}
			,
			/// 刷新在布局之前
			cRfshBefLot : function ()
			{
				stAryUtil.cFor(this.e_Wgts,
				function (a_Ary, a_Idx, a_Wgt)
				{ a_Wgt.vcRfshBefLot(); });
				return this;
			}
			,
			/// 刷新在布局之后
			cRfshAftLot : function ()
			{
				stAryUtil.cFor(this.e_Wgts,
					function (a_Ary, a_Idx, a_Wgt)
					{ a_Wgt.vcRfshAftLot(); });
				return this;
			}
			,
			/// 刷新
			cRfsh : function ()
			{
				// 若在布局期间则忽略这次调用
				if (nUi.stFrmwk.cIsDurLot())
				{ return this; }

				stAryUtil.cFor(this.e_Wgts,
					function (a_Ary, a_Idx, a_Wgt)
					{ a_Wgt.cRfsh(); });
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
		tForm = nWse.fClass(nUi,
		/// 表单
		function tForm()
		{
			this.odBase(tForm).odCall();	// 基类版本

			this.d_WgtSet = new nUi.tWgtSet();	// 控件集
		}
		,
		tWgt
		,
		{
			/// 绑定，无需调用
			vcBind : function f(a_Cfg)
			{
				var l_This = this;
				return this;
			}
			,
			/// 解绑，无需调用
			vcUbnd : function f()
			{
				var l_This = this;
				return this;
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				var l_This = this;

				// 对每个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						a_Wgt.vcFnshAnmt();
					});
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				var l_This = this;

				// 对每个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						a_Wgt.vcRfshBefLot();
					});
				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				var l_This = this;

				// 对每个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						a_Wgt.vcRfshAftLot();
					});
				return this;
			}
			,
			/// 拾取
			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
			vcPick : function f(a_Bbox, a_Picker)
			{
				if (a_Bbox)
				{
					return this; // 直接使用初始值（放置目标的）就可以了
				}

				// 拾取表单里的各个控件
				var l_This = this;
				stAryUtil.cFind(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						a_Wgt.vcPick(null, a_Picker);
						return a_Picker.cIsOver();
					});

				if (a_Picker.cIsOver())
				{ return this; }

				// 最后拾取放置目标（如果有）
				if (l_This.d_PutTgt)
				{
					l_This.dPickPutTgtByPathPnt(a_Picker, l_This.d_PutTgt);
				}
				return this;
			}
			,
			/// 输入复位
			vcIptRset : function f()
			{
				var l_This = this;

				// 对每个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						a_Wgt.vcIptRset();
					});
				return this;
			}
			,
			/// 存取控件集
			cAcsWgtSet : function ()
			{
				return this.d_WgtSet;
			}
			,
			/// 存取控件数组
			cAcsWgts : function ()
			{
				return this.d_WgtSet.cAcsWgts();
			}
			,
			/// 清空
			cClr : function ()
			{
				this.d_WgtSet.cClr();
				return this;
			}
			,
			/// 序列化
			/// a_Kvo：Object，若为null则新建一个对象
			/// 返回：a_Kvo
			cSrlz : function (a_Kvo)
			{
				if (! a_Kvo)
				{ a_Kvo = {}; }

				// 对每个控件
				var l_This = this;
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						nUi.itForm.ocBindUbnd(a_Wgt, function (a_Istn) { a_Istn.vcSrlz(a_Kvo); });
					});
				return a_Kvo;
			}
			,
			/// 输入焦点
			cIptFoc : function (a_PutSrcId, a_YesNo)
			{
				var l_This = this;
				var l_Wgt = l_This.d_WgtSet && l_This.d_WgtSet.cAcsByPutSrcId(a_PutSrcId);
				if (! l_Wgt)
				{ return this; }

				nUi.itForm.ocBindUbnd(l_Wgt, function (a_Istn) { a_Istn.vcIptFoc(a_YesNo); });
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fItfc(nUi,
		/// 表单接口
		function itForm()
		{ }
		,
		null
		,
		{
			/// 序列化
			/// a_Kvo：Object，若为null则新建一个对象
			/// 返回：a_Kvo
			vcSrlz : function f(a_Kvo)
			{
				return a_Kvo;
			}
			,
			/// 输入焦点
			vcIptFoc : function f(a_YesNo)
			{
				return this;
			}
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////