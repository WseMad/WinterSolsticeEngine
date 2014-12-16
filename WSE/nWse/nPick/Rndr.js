/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tRndr)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nPick",
		[
			"Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Rndr.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stStrUtil = nWse.stStrUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;

	var nPick = nWse.nPick;
	var unKnl = nPick.unKnl;
	var tInrName = nPick.tInrName;
	var tMsg = nPick.tMsg;
	var atPkup = nPick.atPkup;
	var tRelLyr = nPick.tRelLyr;
	var tRefFrm = nPick.tRefFrm;
	var tDockWay = nPick.tDockWay;
	var tPrmrSta = nPick.tPrmrSta;
	var tWgt = nPick.tWgt;
	var tRoot = nPick.tRoot;
//	var stFrmwk = nPick.stFrmwk;	// 尚未创建

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	unKnl.fObtnPutSrc = function (a_PutSrc)
	{
		// 获取，若不存在则返回
		var l_Rst = nWse.fIsStr(a_PutSrc) ? document.getElementById(a_PutSrc) : a_PutSrc;
		if (! l_Rst)
		{ return null; }

		// 簿记
		if (! l_Rst.Wse_PutSrc)
		{ l_Rst.Wse_PutSrc = {}; }

		// 记录原始CSS类，添加cnWse_PutSrc
		l_Rst.Wse_PutSrc.c_OrigCssc = l_Rst.className;
		stCssUtil.cAddCssc(l_Rst, "cnWse_PutSrc");
		return l_Rst;
	};

	unKnl.fAbdnPutSrc = function (a_PutSrc)
	{
		if ((! a_PutSrc) || (! a_PutSrc.Wse_PutSrc))
		{ return; }

		a_PutSrc.className = a_PutSrc.Wse_PutSrc.c_OrigCssc;	// CSS类
		a_PutSrc.Wse_PutSrc = null;								// 簿记
	};

	unKnl.fObtnPutTgt = function (a_PutTgt, a_PutSrc, a_PutTgtSlc)
	{
		// 获取，若不存在则新建
		var l_IsId = nWse.fIsStr(a_PutTgt);
		var l_Rst = l_IsId ? document.getElementById(a_PutTgt) : a_PutTgt;
		if ((! l_Rst) && a_PutTgtSlc)
		{
			l_Rst = a_PutSrc.id && stDomUtil.cQryOne("#" + a_PutSrc.id + a_PutTgtSlc);
			if (l_IsId)	// 记录ID
			{ l_Rst.id = a_PutTgt; }
		}

		if ((! l_Rst))
		{
			l_Rst = document.createElement("div");
			if (l_IsId)	// 记录ID
			{ l_Rst.id = a_PutTgt; }

			a_PutSrc.parentNode.insertBefore(l_Rst, a_PutSrc);	// 作为前一个兄弟节点
		}

		// 簿记
		if (! l_Rst.Wse_PutTgt)
		{ l_Rst.Wse_PutTgt = {}; }

		// 记录原始CSS类，添加cnWse_PutTgt
		l_Rst.Wse_PutTgt.c_OrigCssc = l_Rst.className;		// 记录原始CSS类
		stCssUtil.cAddCssc(l_Rst, "cnWse_PutTgt");
		return l_Rst;
	};

	unKnl.fAbdnPutTgt = function (a_PutTgt)
	{
		if ((! a_PutTgt) || (! a_PutTgt.Wse_PutTgt))
		{ return; }

		a_PutTgt.className = a_PutTgt.Wse_PutTgt.c_OrigCssc;	// CSS类
		a_PutTgt.Wse_PutTgt = null;								// 簿记
	};

	unKnl.fIsPutInTgt = function (a_PutTgt, a_Put)
	{
		return a_PutTgt && a_Put && (a_PutTgt === a_Put.parentNode);
	};

	unKnl.fPutToTgt = function (a_PutTgt, a_PutSrc, a_PutInSrc, a_Bef, a_Vrf)
	{
		// 无效，或已经在了？
		if ((! a_PutTgt) || (! a_PutSrc) || (! a_PutInSrc) || (a_PutTgt === a_PutInSrc.parentNode))
		{ return; }

		// 验证
		if (a_Vrf && (! stDomUtil.cIsAcst(a_PutSrc, a_PutInSrc)))
		{ throw new Error("“" + a_PutInSrc.id + "”不是“" + a_PutSrc.id + "”的后代节点！"); }

		// 簿记原始父节点
		if (! a_PutInSrc.Wse_Put)
		{ a_PutInSrc.Wse_Put = {}; }

		a_PutInSrc.Wse_Put.c_OrigPrn = a_PutInSrc.parentNode;

		// 插入或追加
		a_Bef
			? a_PutTgt.insertBefore(a_PutInSrc, a_Bef)
			: a_PutTgt.appendChild(a_PutInSrc);
	};

	function fObtnOrigPrnOfPut(a_PutSrc, a_Put)
	{
		return (a_Put.Wse_Put && a_Put.Wse_Put.c_OrigPrn) || a_PutSrc;
	}

	unKnl.fIsPutInSrc = function (a_PutSrc, a_Put)
	{
		return a_PutSrc && a_Put && (fObtnOrigPrnOfPut(a_PutSrc, a_Put) === a_Put.parentNode);
	};

	unKnl.fApdToSrc = function (a_PutSrc, a_Put)
	{
		if ((! a_PutSrc) || (! a_Put))
		{ return; }

		a_PutSrc.appendChild(a_Put);
	};

	unKnl.fRtnToSrc = function (a_PutTgt, a_PutSrc, a_PutInTgt, a_Bef, a_Vrf)
	{
		// 无效，或已经在了？
		var l_Prn = a_PutSrc && a_PutInTgt && fObtnOrigPrnOfPut(a_PutSrc, a_PutInTgt);
		if ((! a_PutTgt) || (! l_Prn) || (l_Prn === a_PutInTgt.parentNode))
		{ return; }

		// 验证
		if (a_Vrf && (! stDomUtil.cIsAcst(a_PutTgt, a_PutInTgt)))
		{ throw new Error("“" + a_PutInTgt.id + "”不是“" + a_PutTgt.id + "”的后代节点！"); }

		// 插入或追加
		a_Bef
			? l_Prn.insertBefore(a_PutInTgt, a_Bef)
			: l_Prn.appendChild(a_PutInTgt);
	};

	unKnl.fClnPutTgt = function (a_PutTgt, a_PutSrc)
	{
		var l_PutTgt = a_PutTgt;
		var l_Nl = l_PutTgt.childNodes, n = 0, l_Len = l_Nl.length;
		for (; n<l_Len; ++n)
		{
			// 如果是摆放过来的，归还回去
			if (l_Nl[n].Wse_Put && l_Nl[n].Wse_Put.c_OrigPrn)
			{
				unKnl.fRtnToSrc(a_PutTgt, a_PutSrc, l_Nl[n], null, false);
				-- n;
				-- l_Len;
			}
		}
	};

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

	// 主状态动画函数，确保只有一个实例
	function fPrmrStaAnmt(a_FrmTime, a_FrmItvl, a_FrmIdx)
	{
		var l_Rst = true;
		var l_Wgt = this.e_Wgt;
		var l_RootRndr = l_Wgt.cAcsRoot().cAcsRndr();
		var l_Dur = l_RootRndr.cGetPsaDur();
		var l_Scl;

		this.e_Psa_AphTimer += a_FrmItvl;

		// 完成
		if (this.e_Psa_AphTimer > l_Dur)
		{
			l_Scl = 1;
			this.e_Psa_AphTimer = 0;
			this.e_Psa_Aph = this.e_Psa_AphEnd;
			l_Rst = false;

			//unKnl.fSetWgtFlag(l_Wgt, 1, false);		// 主状态动画中
			//
			//// 如果此时主状态为i_Exit，通知宿主（一定存在，可为面板）
			//if (tPrmrSta.i_Exit == l_Wgt.e_PrmrSta)
			//{
			//	fSendMsg_PrmrOver(l_Wgt);
			//}
		}
		else // 继续
		{
			l_Scl = this.e_Psa_AphTimer / l_Dur;
			this.e_Psa_Aph = stNumUtil.cPrbItp(this.e_Psa_AphBgn, this.e_Psa_AphEnd, l_Scl, false);
		}
		return l_Rst;
	}

	/*
	 /// 当控件裁剪时
	 vdOnWgtClip : function ()
	 {
	 var l_Wgt = this.e_Wgt;
	 var l_Host, l_HostRndr;

	 // 不用裁剪
	 if (tRefFrm.i_Prst == l_Wgt.e_RefFrm)
	 {
	 //
	 }
	 else // 同宿主的裁剪路径
	 if (tRefFrm.i_Vwpt == l_Wgt.e_RefFrm)
	 {
	 l_Host = l_Wgt.e_Host;
	 if (l_Host && l_Host.cHasRndr())
	 {
	 l_HostRndr = l_Host.cAcsRndr();
	 l_HostRndr.vdOnWgtClip();
	 }
	 }
	 else // 宿主的裁剪路径∩宿主的身体路径
	 //	if (tRefFrm.i_Host == l_Wgt.e_RefFrm)
	 {
	 l_Host = l_Wgt.e_Host;
	 if (l_Host && l_Host.cHasRndr())
	 {
	 l_HostRndr = l_Host.cAcsRndr();
	 l_HostRndr.vdOnWgtClip();
	 }
	 }

	 return this;
	 }
	 */

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 控件渲染器

	var tRndr;
	(function ()
	{
		nWse.fClass(tWgt,
			/// 渲染器
			function tRndr(a_Wgt)
			{
				this.e_Wgt = a_Wgt || null;		// 记录控件
				this.e_BindHtmlCfg = null;
				this.e_PutSrc = null;
				this.e_PutTgt = null;
				this.e_CssBoxMdl = null;
			}
			,
			null
			,
			{
				/// 存取控件
				cAcsWgt : function ()
				{
					return this.e_Wgt;
				}
				,
				/// 当控件主状态改变时
				vdOnWgtPrmrStaChgd : function (a_Old, a_New)
				{
					// 结束主状态动画
					this.cAcsWgt().cFnshPrmrStaAnmt();
					return this;
				}
				,
				/// 当控件进入呈现目标
				vdOnWgtEntPrstTgt : function ()
				{
					// 如果已绑定Html
					if (this.cHasBndHtml())
					{
						// 先把自己的目标摆放到宿主的目标（呈现至呈现目标）
						// 然后校准自己的目标，这是为了正确计算放置目标的盒模型！
						// 要正确计算盒模型，需要首先将元素放入最终目的地，
						// 一是因为CSS选择器盒元素在文档里的位置有关，
						// 二是因为只有当元素出现在文档里，stCssUtil才有办法正确计算盒模型。
						this.cPutSelfTgtToHostTgt();
						this.cRgltPutTgt();
					}
					return this;
				}
				,
				/// 如果已绑定Html，当控件离开呈现目标
				vdOnWgtLeaPrstTgt : function ()
				{
					// 如果已绑定Html
					if (this.cHasBndHtml())
					{
						this.cRtnSelfTgtFromHostTgt();	// 从宿主的目标归还自己的目标
					}
					return this;
				}
				,
				/// 当控件刷新时
				vdOnWgtRfsh : function ()
				{
					//// 如果已绑定Html
					//if (this.cHasBndHtml())
					//{
					//	// 使放置目标的匹配显示区
					//}
					return this;
				}
				,
				/// 当控件绘制时
				vdOnWgtDraw : function ()
				{
					//
					return this;
				}
				,
				/// 当控件拾取时
				/// a_IdClo：tClo，标识符颜色
				vdOnWgtPick : function (a_IdClo)
				{
					return this;
				}
				,
				/// 绑定Html
				/// a_Cfg：Object，配置
				/// {
				///	c_PutTgt：String，放置目标的HTML元素ID，若不存在则自动创建带有指定ID的<div>，作为c_PutSrc的前一个兄弟节点
				/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
				/// }
				vcBindHtml : function (a_Cfg)
				{
					var l_This = this;

					//【不再提供解绑功能】
					//if (l_This.e_PutSrc)	// 先解绑以前的
					//{ l_This.vcUbnd(); }

					if (! a_Cfg)			// 配置无效立即返回
					{ return this; }

					l_This.e_BindHtmlCfg = a_Cfg;	// 记录配置

					// 取得目标和来源
					var l_PutSrc = fObtnPutSrc(l_This, a_Cfg);	if (! l_PutSrc) { throw new Error("c_PutSrc无效！"); }
					var l_PutTgt = fObtnPutTgt(l_This, a_Cfg, l_PutSrc);
					l_This.e_PutSrc = l_PutSrc;
					l_This.e_PutTgt = l_PutTgt;
					l_This.e_CssBoxMdl = {};		// CSS盒模型
					return this;
				}
				,
				/// 已绑定Html？
				cHasBndHtml : function ()
				{
					return !! this.e_PutSrc;
				}
				,
				/// 存取放置来源
				cAcsPutSrc : function ()
				{
					return this.e_PutSrc;
				}
				,
				/// 存取放置目标
				cAcsPutTgt : function ()
				{
					return this.e_PutTgt;
				}
				,
				/// 校准放置目标，使放置目标的外边距＋边框＋内边距＋内容＝控件的区域
				cRgltPutTgt : function ()
				{
					if (! this.cHasBndHtml())
					{ return this; }

					// 首先计算控件放置目标的CSS区域
					var l_Wgt = this.cAcsWgt();
					var l_CSSA = tSara.scEnsrTemps(1)[0];
					l_Wgt.cCalcCssArea(l_CSSA);

					// 获取盒模型，对齐像素
					stCssUtil.cGetBoxMdl(this.e_CssBoxMdl, this.cAcsPutTgt(), null, true);
					stCssUtil.cFillHrztMbp(this.e_CssBoxMdl);
					stCssUtil.cFillVticMbp(this.e_CssBoxMdl);

					// 计算CSS位置尺寸，设置
					var l_CssPosDim = tSara.scEnsrTemps(tSara.sc_Temps.c_Len + 1)[tSara.sc_Temps.c_Len - 1];
					tRndr.scCalcCssPosDimByCssArea(l_CssPosDim, l_CSSA, this.e_PutTgt, this.e_CssBoxMdl);
					stCssUtil.cSetPosDim(this.e_PutTgt, l_CssPosDim.c_X, l_CssPosDim.c_Y, l_CssPosDim.c_W, l_CssPosDim.c_H);
					return this;
				}
				,
				/// 把来源里的全部元素节点放入自己的目标
				cPutAllElmtsToTgt : function ()
				{
					var l_This = this;
					if (! this.cHasBndHtml())
					{ return this; }

					var l_Chds = stDomUtil.cGetAllElmtChds(l_This.e_PutSrc);
					stAryUtil.cFor(l_Chds, function (a_Ary, a_Idc, a_Chd) { l_This.cPutToTgt(a_Chd); });
					return this;
				}
				,
				/// 放置元素是否在自己的目标里
				cIsPutInTgt : function (a_Put)
				{
					return unKnl.fIsPutInTgt(this.e_PutTgt, a_Put);
				}
				,
				/// 放置元素是否在自己的来源里
				cIsPutInSrc : function (a_Put)
				{
					return unKnl.fIsPutInSrc(this.e_PutSrc, a_Put);
				}
				,
				/// 摆放至自己的目标
				/// a_Bef：Node，在该节点之前，默认null表最后
				cPutToTgt : function (a_PutInSrc, a_Bef)
				{
					unKnl.fPutToTgt(this.e_PutTgt, this.e_PutSrc, a_PutInSrc, a_Bef, true);
					return this;
				}
				,
				/// 追加到自己的放置来源
				cApdToSrc : function (a_Put)
				{
					unKnl.fApdToSrc(this.e_PutSrc, a_Put);
					return this;
				}
				,
				/// 归还至自己的来源
				/// a_Bef：Node，在该节点之前，默认null表最后
				cRtnToSrc : function (a_PutInTgt, a_Bef)
				{
					unKnl.fRtnToSrc(this.e_PutTgt, this.e_PutSrc, a_PutInTgt, a_Bef, true);
					return this;
				}
				,
				/// 把自己的目标摆放至宿主的目标
				/// a_Bef：Node，在该节点之前，默认null表最后
				cPutSelfTgtToHostTgt : function (a_Bef)
				{
					if (! this.cHasBndHtml())	// 绑定Html后才有意义
					{ return this; }

					var l_Wgt = this.cAcsWgt();
					if (l_Wgt.cIsRoot()) // 根，使用框架
					{
						unKnl.fPutToTgt(nPick.stFrmwk.cAcsPrstTgt(), nPick.stFrmwk.cAcsPrstSrc(), this.cAcsPutTgt());
						return this;
					}

					// 非根
					var l_Host = l_Wgt.cAcsHost();
					var l_HostRndr = l_Host && l_Host.cAcsRndr();
					if (! l_HostRndr)
					{ return this; }

					// 不要检查，没必要先放到宿主来源里再放入宿主目标
					unKnl.fPutToTgt(l_HostRndr.cAcsPutTgt(), l_HostRndr.cAcsPutSrc(), this.e_PutTgt, a_Bef, false);
					return this;
				}
				,
				/// 从宿主的目标归还自己的目标
				cRtnSelfTgtFromHostTgt : function ()
				{
					if (! this.cHasBndHtml())	// 绑定Html后才有意义
					{ return this; }

					var l_Wgt = this.cAcsWgt();
					if (l_Wgt.cIsRoot()) // 根，使用框架
					{
						// 把自己的放置目标归还到框架的呈现来源！【注意】这是必须的，否则仍会出现在呈现目标里！
						unKnl.fRtnToSrc(nPick.stFrmwk.cAcsPrstTgt(), nPick.stFrmwk.cAcsPrstSrc(), this.cAcsPutTgt());
						return this;
					}

					// 非根
					var l_Host = l_Wgt.cAcsHost();
					var l_HostRndr = l_Host && l_Host.cAcsRndr();
					if (! l_HostRndr)
					{ return this; }

					unKnl.fRtnToSrc(l_HostRndr.cAcsPutTgt(), l_HostRndr.cAcsPutSrc(), this.e_PutTgt, null, true);
					return this;
				}
			}
			,
			{
				/// 根据CSS区域计算CSS位置尺寸
				/// a_Rst：tSara，可把四个字段直接传给stCssUtil.cSetPosDim
				/// 返回：a_Rst
				scCalcCssPosDimByCssArea : function (a_Rst, a_CssArea, a_DomElmt, a_CssBoxMdl)
				{
					// 对于绝对定位的元素，其左上角从外边距开始算，而非边框，所以直接使用a_CssArea.c_XY就可以了！
					a_Rst.c_X = a_CssArea.c_X;
					a_Rst.c_Y = a_CssArea.c_Y;

					// 根据盒模型计算内容宽度，先设置
					a_Rst.c_W = a_CssArea.c_W - a_CssBoxMdl.c_HrztMbp;

					// 计算高度
					var l_CrntWid;
					if (nWse.fIsNull(a_CssArea.c_H))	// 自动计算
					{
						l_CrntWid = a_CssBoxMdl.c_CtntWid;				// 记录当前宽度
						stCssUtil.cSetDimWid(a_DomElmt, a_Rst.c_W);		// 设置新宽度，box-sizing为border-box时：a_CssArea.c_W - a_CssBoxMdl.c_HrztMgn
						a_Rst.c_H = a_DomElmt.offsetHeight - (a_CssBoxMdl.c_VticBdrThk + a_CssBoxMdl.c_VticPad);	// 记录高度
						stCssUtil.cSetDimWid(a_DomElmt, l_CrntWid);		// 还原当前宽度
					}
					else
					if (a_CssArea.c_H < 0)	// 保持宽高比，使offsetWidth / offsetHeight = -a_CssArea.c_H
					{
						a_Rst.c_H = (a_DomElmt.offsetWidth / -a_CssArea.c_H) - (a_CssBoxMdl.c_VticBdrThk + a_CssBoxMdl.c_VticPad);
					}
					else // 显示指定
					{
						a_Rst.c_H = a_CssArea.c_H - a_CssBoxMdl.c_VticMbp;
					}
					return a_Rst;
				}

				///// 公有静态字段
				//sc_ :
				//{
				//	/// 阴影色，默认rgba(0, 0, 0, 0.7)
				//	sc_ShdwClo : tClo.scNew$Rgba(0, 0, 0, 0.7)
				//	,
				//	/// 阴影偏移量X，默认0
				//	sc_ShdwOfstX : 0
				//	,
				//	/// 阴影偏移量Y，默认4
				//	sc_ShdwOfstY : 4
				//	,
				//	/// 阴影模糊因子，默认8
				//	sc_ShdwBlur : 8
				//	,
				//	/// 身体掩膜色
				//	sc_MaskClo : tClo.scNew$Rgba(0.3, 0.3, 0.3, 0.7)
				//}
			}
			,
			false);
	})();
	tRndr = tWgt.tRndr;	// IE8

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////