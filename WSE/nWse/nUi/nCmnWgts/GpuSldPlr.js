/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tGpuSldPlr)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nCmnWgts",
		[
			"Cmb.js",

			"nWse:nGpu/2dPath.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("GpuSldPlr.fOnIcld：" + a_Errs);

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
	var tWgt = nUi.tWgt;
	var stFrmwk = nUi.stFrmwk || null;

	var nGpu = nWse.nGpu;
	var t2dCtxt = nGpu.t2dCtxt;
	var tPath = t2dCtxt.tPath;

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
		a_This.d_Cvs = null;
		a_This.d_2dCtxt = null;
		a_This.d_Path = null;

		// 控件集
		a_This.d_WgtSet = null;
		a_This.d_DivCvsDta = -1;	// -1表示待计算
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tGpuSldPlr;
	(function ()
	{
		tGpuSldPlr = nWse.fClass(nCmnWgts,
		/// GPU幻灯片播放器
		function tGpuSldPlr()
		{
			this.odBase(tGpuSldPlr).odCall();	// 基类版本

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
			/// c_FxdAr：Number，固定宽高比
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tGpuSldPlr");			// CSS类

				// 新建画布，面板，控件集
				l_This.dNewCvs();
				l_This.dNewPnl();
				l_This.dNewWgtSet();

				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function (a_Put, a_TotWid, a_OfstWid)
					{
						// 修正画布尺寸
						l_This.dFixCvsDim(a_OfstWid);

						// 修正控件位置尺寸
						l_This.dFixWgtsPosDim(a_OfstWid);
					};

					l_This.dRegPutTgtEvtHdlr_OnWidDtmnd(l_This.d_fOnWidDtmnd);
				}

				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;
				if (! l_This.d_PutSrc)
				{ return this; }

				// 重置
				fRset(this);

				// 基类版本，最后才调用！
				this.odBase(f).odCall();
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 把画布和面板摆放到目标
				if (l_This.d_Cvs)
				{
					l_This.dPutToTgt(l_This.d_Cvs);
				}

//				if (l_This.d_Pnl)
//				{
//					l_This.dPutToTgt(l_This.d_Pnl);
//				}

				// 各个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						l_This.dPutToTgt(a_Wgt.cAcsPutTgt());
						a_Wgt.vcRfshBefLot();

						// 加入总数至数字框的后面
					//	if ((l_This.d_NumIpt === a_Wgt) && (! l_This.d_NumTot.parentNode))
						if ((l_This.d_NumIpt === a_Wgt) && (! l_This.dIsPutInTgt(l_This.d_NumTot)))
						{
					//		l_This.d_NumIpt.cAcsPutTgt().appendChild(l_This.d_NumTot);
							l_This.dPutToTgt(l_This.d_NumTot);
						}
					});

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 各个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						a_Wgt.vcRfshAftLot();
					});
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
//				if (l_This.d_NumIpt === a_DmntTch.cAcsEvtTgt())
//				{
//				//	a_DmntTch.c_Hdld = false;
//					return this;
//				}
//				else
//				if (l_This.d_NumIpt)
//				{
//					l_This.d_NumIpt.blur();
//				}

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
			/// 新建画布
			dNewCvs : function ()
			{
				var l_This = this;

				l_This.d_Cvs = document.createElement("canvas");
				l_This.dApdToSrc(l_This.d_Cvs);				// 放入来源
				l_This.d_2dCtxt = new t2dCtxt();			// 创建上下文
				l_This.d_2dCtxt.cBindCvs(l_This.d_Cvs);		// 绑定画布
				l_This.d_Path = new tPath();				// 创建路径

				return this;
			}
			,
			/// 新建面板
			dNewPnl : function ()
			{
				var l_This = this;
//				l_This.d_Pnl = document.createElement("div");
//				l_This.dApdToSrc(l_This.d_Pnl);				// 放入来源
//				stCssUtil.cAddCssc(l_This.d_Pnl, "cnWse_tGpuSldPlr_Pnl");	// CSS类
				return this;
			}
			,
			/// 新建控件集
			dNewWgtSet : function ()
			{
				var l_This = this;

				// 控件集
				l_This.d_WgtSet = new nUi.tWgtSet();
				l_This.eNewBtn("Prev", "＜");
				l_This.eNewBtn("Next", "＞");
				l_This.eNewBtn("Auto", "▶", true);
				l_This.d_Auto.cUpDown(false);
				l_This.eNewNumIpt();
				l_This.eNewCmb();
				return this;
			}
			,
			// 新建按钮
			eNewBtn : function (a_Name, a_Text, a_UpDown, a_fOnClk)
			{
				var l_This = this;
				l_This.dGnrtSubWgtId(a_Name);
				var l_Div = stDomUtil.cObtnOne(null, "div", tWgt.sd_SubWgtPutSrcId, null, l_This.d_PutSrc);
				var l_Span = document.createElement("span");
				l_Span.setAttribute("data-Wse_Tit", "data-Wse_Tit");
				l_Span.textContent = a_Text || "";
				l_Div.appendChild(l_Span);

				var l_Wgt = new nCmnWgts.tBtn();
				l_Wgt.vcBind({
					c_PutTgt: tWgt.sd_SubWgtPutTgtId,
					c_PutSrc: tWgt.sd_SubWgtPutSrcId
					,c_UpDown : a_UpDown
					,c_Shp : nCmnWgts.tBtn.tShp.i_Cir
					,c_TitVcen : true
				//	,c_TxtrLyr : 1		// 纹理层
					,c_fOnClk : a_fOnClk
				});
				l_This["d_" + a_Name] = l_Wgt;
				l_This.d_WgtSet.cAdd(l_Wgt);
				nWse.stCssUtil.cAddCssc(l_Wgt.cAcsPutTgt(), "cnWse_tGpuSldPlr_" + a_Name);	// CSS类
			//	nWse.stCssUtil.cAddCssc(l_Wgt.cAcsPutTgt(), "cnWse_Skin_Metal");
			//	l_This.d_Pnl.appendChild(l_Wgt.cAcsPutTgt());	// 放入到面板里
				return l_Wgt;
			}
			,
			/// 新建数字框
			eNewNumIpt : function ()
			{
				var l_This = this;

				l_This.dGnrtSubWgtId("NumIpt");
				var l_Div = stDomUtil.cObtnOne(null, "div", tWgt.sd_SubWgtPutSrcId, null, l_This.d_PutSrc);
				l_Wgt = new nCmnWgts.tEdit();
				l_Wgt.vcBind({
					c_PutTgt: tWgt.sd_SubWgtPutTgtId,
					c_PutSrc: tWgt.sd_SubWgtPutSrcId
					,c_fOnOk: function (a_Wgt, a_Text)
					{
//						var l_DivIdx = a_Text.indexOf("/");
//						if (l_DivIdx >= 0)
//						{ a_Text = a_Text.slice(0, l_DivIdx).trim(); }
//
//						a_Text += " / " + "999";
//						a_Wgt.cSetText(a_Text);
					}
				});
				l_This.d_NumIpt = l_Wgt;
				l_This.d_WgtSet.cAdd(l_Wgt);
			//	l_This.d_Pnl.appendChild(l_Wgt.cAcsPutTgt());	// 放入到面板里

				// 创建总数
				l_This.d_NumTot = document.createElement("div");
				nWse.stCssUtil.cAddCssc(l_This.d_NumTot, "cnWse_tGpuSldPlr_NumTot");	// CSS类
				l_This.dApdToSrc(l_This.d_NumTot);	// 放入来源
				l_This.dSetNumTot(9999);
				return this;
			}
			,
			/// 设置总数
			dSetNumTot : function (a_Tot)
			{
				var l_This = this;
				if (! l_This.d_NumTot)
				{ return this; }

				l_This.d_NumTot.textContent = "/ " + a_Tot.toString();	// ／
				return this;
			}
			,
			/// 新建组合框
			eNewCmb : function ()
			{
				var l_This = this;
				l_This.dGnrtSubWgtId("Exchg");
				var l_Div = stDomUtil.cObtnOne(null, "div", tWgt.sd_SubWgtPutSrcId, null, l_This.d_PutSrc);
			//	var l_Ul =
				var l_Wgt = new nCmnWgts.tCmb();
				l_Wgt.vcBind({
					c_PutTgt: tWgt.sd_SubWgtPutTgtId,
					c_PutSrc: tWgt.sd_SubWgtPutSrcId
					,c_SlcOnly : true
					,c_fOnOk : function (a_Wgt, a_Text)
					{
						//
					}
				});
				l_This.d_Exchg = l_Wgt;
				l_This.d_WgtSet.cAdd(l_Wgt);
			//	l_This.d_Pnl.appendChild(l_Wgt.cAcsPutTgt());	// 放入到面板里
			}
			,
			/// 修正画布尺寸
			dFixCvsDim : function (a_OfstWid)
			{
				a_OfstWid = Math.round(a_OfstWid);

				var l_This = this;
				if ((! l_This.d_Cvs) || (l_This.d_Cvs.width == a_OfstWid))
				{ return l_This; }

				l_This.d_Cvs.width = a_OfstWid;
				var l_CvsH;
				if (l_This.d_Cfg.c_FxdAr)
				{
					l_CvsH = Math.round(a_OfstWid / l_This.d_Cfg.c_FxdAr);
					l_This.d_Cvs.height = l_CvsH;
				}

				// 清屏，用哪个？
			//	l_This.d_2dCtxt.cClr();
				l_This.d_2dCtxt.cFill();
				return this;
			}
			,
			/// 修正控件位置尺寸
			dFixWgtsPosDim : function (a_OfstWid)
			{
				a_OfstWid = Math.round(a_OfstWid);

				var l_This = this;
				if (! l_This.d_WgtSet)
				{ return this; }

				// 先计算各个控件的尺寸
				var l_EvtAgms = [0, 1, 2];
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						// 触发编辑框和按钮的事件
						var l_PutTgt = a_Wgt.cAcsPutTgt();
						l_EvtAgms[0] = l_PutTgt;
						l_EvtAgms[1] = l_PutTgt.offsetWidth;
						l_EvtAgms[2] = l_PutTgt.offsetWidth;
						nUi.fTrgrPutEvt(l_PutTgt, "WidDtmnd", l_EvtAgms);
					});

				// 计算整个放置目标的高度

				// 计算<div>与<canvas>的差量
				if (l_This.d_DivCvsDta < 0)
				{
					l_This.d_DivCvsDta = Math.max(0, l_This.d_PutTgt.offsetHeight - l_This.d_Cvs.height);
				//	console.log("l_This.d_DivCvsDta = " + l_This.d_DivCvsDta)
				}

				// 修正位置，即排版……

				var l_Rcd = {
					c_Y : l_This.d_Cvs.height + l_This.d_DivCvsDta,
					c_AccW : 0,
					c_RowH : 0,
					c_RowAmt : 1
				};
				var l_TotW = l_This.d_PutTgt.offsetWidth;

				// 先排三个按钮
				l_This.eFlow(l_Rcd, l_This.d_Prev.cAcsPutTgt());
				l_This.eFlow(l_Rcd, l_This.d_Next.cAcsPutTgt());
				l_This.eFlow(l_Rcd, l_This.d_Auto.cAcsPutTgt());
				var l_1stRowH = l_Rcd.c_RowH;
				var l_BtnsRt = l_Rcd.c_AccW;

				// 计算数字和组合框的总宽
				var l_Put = l_This.d_NumIpt.cAcsPutTgt();
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, l_Put, null, true);
				l_Rcd.e_NumIptTotWid = l_Put.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;
				l_Rcd.e_NumIptTotHgt = l_Put.offsetHeight + tWgt.sd_PutTgtMgn.c_MgnUp + tWgt.sd_PutTgtMgn.c_MgnDn;

				l_Put = l_This.d_NumTot;
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, l_Put, null, true);
				l_Rcd.e_NumTotTotWid = l_Put.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;
			//	l_Rcd.e_NumTotTotHgt = l_Put.offsetHeight + tWgt.sd_PutTgtMgn.c_MgnUp + tWgt.sd_PutTgtMgn.c_MgnDn;	//【见下】
				var l_NumTotWid = l_Rcd.e_NumIptTotWid + l_Rcd.e_NumTotTotWid;

//				// 换行？【在下面检查】
//				if (l_Rcd.c_AccW + l_Rcd.e_NumIptTotWid + l_Rcd.e_NumTotTotWid >= l_TotW)
//				{
//					l_This.eFlow_NewLine(l_Rcd);
//				}

				// 排数字
				var l_NumX = (l_TotW - l_NumTotWid) / 2;
				var l_NumsRt = l_NumX + l_NumTotWid;
				if (l_NumX <= l_BtnsRt)	// 与三个按钮重叠，换行
				{
					l_This.eFlow_NewLine(l_Rcd);
				}

				var l_NumY = l_Rcd.c_Y + (l_1stRowH - l_Rcd.e_NumIptTotHgt) / 2;
				stCssUtil.cSetPos(l_This.d_NumIpt.cAcsPutTgt(), l_NumX, l_NumY);

				l_NumX += l_Rcd.e_NumIptTotWid;
			//	l_NumY = l_Rcd.c_Y + Math.max(0, l_1stRowH - l_Rcd.e_NumTotTotHgt) / 2;	//【续用上面的】
				stCssUtil.cSetPos(l_This.d_NumTot, l_NumX, l_NumY);

				// 排组合框
				if (2 == l_Rcd.c_RowAmt) // 已经排了两行，则把组合框排到第三行
				{
					l_This.eFlow_NewLine(l_Rcd);
				}

				l_Put = l_This.d_Exchg.cAcsPutTgt();
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, l_Put, null, true);
				var l_ExchgTotWid = l_Put.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;
				var l_ExchgTotHgt = l_Put.offsetHeight + tWgt.sd_PutTgtMgn.c_MgnUp + tWgt.sd_PutTgtMgn.c_MgnDn;
				var l_ExchgX = l_TotW - l_ExchgTotWid;
				if (l_ExchgX <= l_NumsRt)	// 检查与数字的重叠，若重叠则换行
				{
					l_This.eFlow_NewLine(l_Rcd);
				}

				stCssUtil.cSetPos(l_Put, l_ExchgX, l_Rcd.c_Y);

				// 设置放置目标的高度，即为当前的c_Y + max(c_RowH, l_ExchgTotHgt)
				var l_PutTgtHgt = l_Rcd.c_Y + Math.max(l_Rcd.c_RowH, l_ExchgTotHgt);
				stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_PutTgtHgt);
				return this;
			}
			,
			eFlow : function (a_Rcd, a_Put, a_1stRowH)
			{
				var l_This = this;
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, a_Put, null, true);
				var l_TotH = a_Put.offsetHeight + tWgt.sd_PutTgtMgn.c_MgnUp + tWgt.sd_PutTgtMgn.c_MgnDn;
				a_Rcd.c_RowH = Math.max(a_Rcd.c_RowH, l_TotH);

				var l_Y = a_Rcd.c_Y;
				if (a_1stRowH)
				{
					l_Y += (a_1stRowH - l_TotH) / 2;
				}

				stCssUtil.cSetPos(a_Put, a_Rcd.c_AccW, l_Y);
				a_Rcd.c_AccW += a_Put.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;
				return this;
			}
			,
			eFlow_NewLine : function (a_Rcd)
			{
				a_Rcd.c_Y += a_Rcd.c_RowH;
				a_Rcd.c_AccW = 0;
				a_Rcd.c_RowH = 0;
				++ a_Rcd.c_RowAmt;
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////