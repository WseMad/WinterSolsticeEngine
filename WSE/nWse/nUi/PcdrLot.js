/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.tPcdrLot)
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
	console.log("PcdrLot.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stStrUtil = nWse.stStrUtil;
	var stObjUtil = nWse.stObjUtil;
	var stFctnUtil = nWse.stFctnUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;
	var tSara = nWse.tSara;

	var nUi = nWse.nUi;
	var unKnl = nUi.unKnl;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_EvtAgms_WidDtmnd = [0, 1, 2];			// 事件参数

	function fFindBrkPnt(a_This, a_W)
	{
		var l_Rst = stAryUtil.cRvsFind(a_This.e_Cfg.c_BrkPnts, function (a_Tgt, a_Idx, a_Elmt) { return (a_W >= a_Elmt); });
		return (l_Rst < 0) ? 0 : l_Rst;
	}

	function fCrtDomElmt(a_This, a_Cfg, a_OrigCssc, a_DftId, a_DftHtmlTag)
	{
		var l_Rst = document.createElement(a_Cfg.c_HtmlTag || a_DftHtmlTag);
		l_Rst.id = a_Cfg.c_Id || a_DftId;
		stCssUtil.cSetCssc(l_Rst, stStrUtil.cCcat(a_OrigCssc, " ", a_Cfg.c_Cssc));	// CSS样式类
		l_Rst.Wse_PcdrLot =		// WSE数据
		{
			c_From : 0 		// 0=新建；1=先前的；2=正在移除（暂不支持）
		};
		//	console.log("创建“" + (a_Cfg.c_Id || a_DftId) + "”");
		return l_Rst;
	}

	function fGetDomElmt(a_This, a_Cfg, a_OrigCssc, a_DftId)
	{
		var l_Rst = document.getElementById(a_Cfg.c_Id || a_DftId);
		if (l_Rst)
		{
			stCssUtil.cSetCssc(l_Rst, stStrUtil.cCcat(a_OrigCssc, " ", a_Cfg.c_Cssc));	// CSS样式类
			l_Rst.Wse_PcdrLot =	// WSE数据
			{
				c_From : 1
			}
		}
		return l_Rst;
	}

	function fObtnBoaCol(a_This, a_Cfg, a_OrigCssc, a_DftId, a_DftHtmlTag)
	{
		// 先获取，若失败则创建
		return fGetDomElmt(a_This, a_Cfg, a_OrigCssc, a_DftId) || fCrtDomElmt(a_This, a_Cfg, a_OrigCssc, a_DftId, a_DftHtmlTag);
	}

	function fObtnPut(a_This, a_Id)
	{
		// 先从e_RmvdPutAry里找，再从文档里找
		var l_Idx = stAryUtil.cFind(a_This.e_RmvdPutAry,
			function (a_Ary, a_Idx, a_Put) { return (a_Put.id == a_Id); });

		var l_OldFrom = -1;
		var l_From = (l_Idx < 0) ? -1 : 1;	// 0=来源；1=先前的；2=正在移除
		var l_Rst = (l_From < 0) ? document.getElementById(a_Id) : a_This.e_RmvdPutAry[l_Idx];
		if (l_Rst)
		{
			if (l_Rst.Wse_PcdrLot)	// 记录旧的
			{ l_OldFrom = l_Rst.Wse_PcdrLot.c_From; }

			if (l_From < 0) // 位于正在移除地带或放置来源
			{ l_From = (a_This.e_DomRmvd === l_Rst.parentNode) ? 2 : 0; }

			l_Rst.Wse_PcdrLot
				? (l_Rst.Wse_PcdrLot.c_From = l_From)
				: (l_Rst.Wse_PcdrLot = { c_From : l_From });	// 来自？

			if (0 == l_From) // 如果来自源，记录父节点
			{
				if (! l_Rst.Wse_Put) // 簿记
				{ l_Rst.Wse_Put = {}; }

				l_Rst.Wse_Put.c_OrigPrn = l_Rst.parentNode;
			}
			else
			if (1 == l_From) // 来自e_RmvdPutAry，注销
			{ a_This.e_RmvdPutAry.splice(l_Idx, 1); }
			else
			if (2 == l_From) // 来自e_DomRmvd，注销
			{ a_This.e_DomRmvd.removeChild(l_Rst); }

			if (a_This.e_RunCnt > 1)	// 第二次运行时不要修改c_From
			{ l_Rst.Wse_PcdrLot.c_From = l_OldFrom; }
		}
		return l_Rst;
	}

	function fCalcBoaNullPct(a_This, a_Boa, a_Cfg)
	{
		var l_Sum = 0, l_NullAmt = 0;
		if (a_Cfg.c_ColDvd && (a_Cfg.c_ColDvd.length > 0))
		{
			a_Boa.Wse_PcdrLot.c_ColDvd = Array.prototype.slice.call(a_Cfg.c_ColDvd);
			l_Sum = stAryUtil.cSum(0, a_Boa.Wse_PcdrLot.c_ColDvd,
				function(a_Sum, a_Ary, a_Idx, a_Elmt)
				{
					if (null === a_Elmt)
					{
						++ l_NullAmt;
						return a_Sum;
					}

					if (0 === a_Elmt)
					{ throw new Error("不能有百分数为0的列"); }
					return a_Sum + a_Elmt;
				});

			if (l_Sum > 100)
			{ throw new Error("百分数之和＞100"); }

			if (l_NullAmt > 0)
			{
				if (100 === l_Sum)
				{ throw new Error("null列的百分数计算得0"); }

				stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColDvd,
					function(a_Ary, a_Idx, a_Elmt)
					{
						if (null === a_Elmt)
						{ a_Ary[a_Idx] = (100 - l_Sum) / l_NullAmt; }
					});
			}
		}
		else
		{
			a_Boa.Wse_PcdrLot.c_ColDvd = [100];
		}
	}

	function fAcsBoa(a_This)
	{
		return (a_This.e_BoaAry.length > 0) ? a_This.e_BoaAry[a_This.e_BoaAry.length - 1] : null;
	}

	function fAcsCol(a_This)
	{
		var l_Boa = fAcsBoa(a_This);
		var l_ColAry = (l_Boa && l_Boa.Wse_PcdrLot) ? l_Boa.Wse_PcdrLot.c_ColAry : null;
		return l_ColAry ? l_ColAry[l_ColAry.length - 1] : null;
	}

	// 计算板列完全尺寸
	function fCalcBoaTotDim(a_This, a_Boa, a_CmptStl)
	{
		a_CmptStl = a_CmptStl || stCssUtil.cGetCmptStl(a_Boa);
		var l_CssDim = a_Boa.Wse_PcdrLot.c_CssDim;
		l_CssDim.c_MinHgt = parseFloat(a_CmptStl.minHeight);	if (isNaN(l_CssDim.c_MinHgt)) { l_CssDim.c_MinHgt = 0; }
		stCssUtil.cGetBdrThk(l_CssDim, a_Boa, a_CmptStl);
		stCssUtil.cGetPad(l_CssDim, a_Boa, a_CmptStl);
		fCalcBoaColTotDim_Bp(l_CssDim);
	}

	function fCalcColTotDim(a_This, a_Boa, a_Col, a_CmptStl)
	{
		a_CmptStl = a_CmptStl || stCssUtil.cGetCmptStl(a_Col);
		var l_CssDim = a_Col.Wse_PcdrLot.c_CssDim;
		stCssUtil.cGetBdrThk(l_CssDim, a_Col, a_CmptStl);
		stCssUtil.cGetPad(l_CssDim, a_Col, a_CmptStl);
		fCalcBoaColTotDim_Bp(l_CssDim);
	}

	function fCalcBoaColTotDim_Bp(a_CssDim)
	{
		a_CssDim.c_BpUp = a_CssDim.c_BdrThkUp + a_CssDim.c_PadUp;
		a_CssDim.c_BpDn = a_CssDim.c_PadDn + a_CssDim.c_BdrThkDn;
		a_CssDim.c_BpUpDn = a_CssDim.c_BpUp + a_CssDim.c_BpDn;

		a_CssDim.c_BpLt = a_CssDim.c_BdrThkLt + a_CssDim.c_PadLt;
		a_CssDim.c_BpRt = a_CssDim.c_PadRt + a_CssDim.c_BdrThkRt;
		a_CssDim.c_BpLtRt = a_CssDim.c_BpLt + a_CssDim.c_BpRt;
	}

	// 计算板Y
	function fCalcBoaY(a_This, a_Boa)
	{
		a_Boa.Wse_PcdrLot.c_Y = 0;
		var l_BoaAry = a_This.e_BoaAry;
		var l_BoaIdx = l_BoaAry.indexOf(a_Boa);
		var l_LastBoa;
		if (l_BoaIdx > 0)
		{
			l_LastBoa = l_BoaAry[l_BoaIdx - 1];
			a_Boa.Wse_PcdrLot.c_Y += l_LastBoa.Wse_PcdrLot.c_Y + l_LastBoa.Wse_PcdrLot.c_H;
		}
	}

	// 计算板宽
	function fCalcBoaW(a_This, a_Boa, a_UseBrkPntWid)
	{
		return a_UseBrkPntWid ? a_This.cGetBrkPntWid() : a_This.cGetPutTgtWid();
	}

	// 计算板内容宽
	function fCalcBoaCtntW(a_This, a_Boa, a_UseBrkPntWid)
	{
		var l_Rst = fCalcBoaW(a_This, a_Boa, a_UseBrkPntWid);
		l_Rst -= a_Boa.Wse_PcdrLot.c_CssDim.c_BpLtRt;
		return l_Rst;
	}

	// 计算板H
	function fCalcBoaH(a_This, a_Boa)
	{
		if (0 == a_This.e_BoaAry.length)
		{ return; }

		// 计算l_Boa的最大列高
		var l_MaxColH = 0;
		var l_FxdAr = a_Boa.Wse_PcdrLot.c_Cfg.c_FxdAr;
		stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
			function (a_ColAry, a_ColIdx, a_Col)
			{ l_MaxColH = Math.max(l_MaxColH, fCalcColH(a_This, a_Boa, a_Col)); });

		if (l_FxdAr) // 固定宽高比？
		{ l_MaxColH = Math.max(l_MaxColH, fCalcBoaW(a_This, a_Boa) / l_FxdAr); }

		l_MaxColH = Math.max(l_MaxColH, a_Boa.Wse_PcdrLot.c_CssDim.c_MinHgt);
		a_Boa.Wse_PcdrLot.c_H = l_MaxColH + a_Boa.Wse_PcdrLot.c_CssDim.c_BpUpDn;	// 板高 = 最大列高 + 上下框内距
		stCssUtil.cSetDimHgt(a_Boa, a_Boa.Wse_PcdrLot.c_H);
		//	console.log("l_MaxColH = " + l_MaxColH)
	}

	// 计算列X坐标
	function fCalcColX(a_This, a_Boa, a_Col)
	{
		var l_Rst = 0;
		stAryUtil.cFind(a_Boa.Wse_PcdrLot.c_ColAry,
			function (a_Ary, a_Idx, a_Elmt) // 累加前面各列的宽度
			{
				if (a_Elmt === a_Col)
				{ return true; }

				l_Rst += a_Elmt.Wse_PcdrLot.c_W;
				return false;
			});

		l_Rst += a_Boa.Wse_PcdrLot.c_CssDim.c_BpLt;
		return l_Rst;
	}

	// 计算列内容X坐标
	function fCalcColCtntX(a_This, a_Boa, a_Col)
	{
		var l_Rst = fCalcColX(a_This, a_Boa, a_Col);
		l_Rst += a_Col.Wse_PcdrLot.c_CssDim.c_BpLt;
		return l_Rst;
	}

	// 计算列Y坐标
	function fCalcColY(a_This, a_Boa, a_Col)
	{
		var l_Rst = a_Boa.Wse_PcdrLot.c_Y + a_Boa.Wse_PcdrLot.c_CssDim.c_BpUp;
		return l_Rst;
	}

	// 计算列内容Y坐标
	function fCalcColCtntY(a_This, a_Boa, a_Col)
	{
		var l_Rst = fCalcColY(a_This, a_Boa, a_Col);
		l_Rst += a_Col.Wse_PcdrLot.c_CssDim.c_BpUp;
		return l_Rst;
	}

	// 计算列宽
	function fCalcColW(a_This, a_Boa, a_Col, a_ColPct, a_UseBrkPntWid)
	{
		var l_BoaCtntWid = fCalcBoaCtntW(a_This, a_Boa, a_UseBrkPntWid);	// 使用板的内容宽
		var l_Rst = l_BoaCtntWid * (a_ColPct / 100);
		return l_Rst;
	}

	// 计算列内容宽
	function fCalcColCtntW(a_This, a_Boa, a_Col, a_ColPct, a_UseBrkPntWid)
	{
		var l_Rst = fCalcColW(a_This, a_Boa, a_Col, a_ColPct, a_UseBrkPntWid);
		l_Rst -= a_Col.Wse_PcdrLot.c_CssDim.c_BpLtRt;
		return l_Rst;
	}

	// 计算列高
	function fCalcColH(a_This, a_Boa, a_Col)
	{
		var l_Rst = fCalcColCtntH(a_This, a_Boa, a_Col);
		l_Rst += a_Col.Wse_PcdrLot.c_CssDim.c_BpUpDn;
		return l_Rst;
	}

	// 计算列内容高
	function fCalcColCtntH(a_This, a_Boa, a_Col)
	{
		return stAryUtil.cSum(0, a_Col.Wse_PcdrLot.c_RowHgts, null);
	}

	// 计算栅格单位宽
	function fCalcGridUnitW(a_This, a_Boa, a_Col, a_ColIdx)
	{
		var l_ColIdx = nWse.fIsUdfnOrNull(a_ColIdx) ? a_Boa.Wse_PcdrLot.c_ColAry.indexOf(a_Col) : a_ColIdx;
		var l_ColPct = a_Boa.Wse_PcdrLot.c_ColDvd[l_ColIdx];
		var l_BaseColW = fCalcColCtntW(a_This, a_Boa, a_Col, l_ColPct, true);
		var l_ColW = fCalcColCtntW(a_This, a_Boa, a_Col, l_ColPct, false);
		var l_GridTot = a_Col.Wse_PcdrLot.c_GridTot;
		a_Col.Wse_PcdrLot.c_BaseGridUnit = l_BaseColW / l_GridTot;
		a_Col.Wse_PcdrLot.c_CrntGridUnit = l_ColW / l_GridTot;
	}

	// 转移板
	function fTsfrBoas(a_This)
	{
		//【注意】首先转移列，然后转移板
		// 因为转移板后可能引起垂直滚动条出现，导致放置目标宽度缩小，
		// 继而需要重新计算放置目标的宽度，并重排，详见fRun()

		// 转移列
		stAryUtil.cFor(a_This.e_BoaAry,
			function (a_BoaAry, a_BoaIdx, a_Boa)
			{
				// 转移放
				stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
					function (a_ColAry, a_ColIdx, a_Col)
					{ stDomUtil.cSetAllChds(a_Col, a_Col.Wse_PcdrLot.c_PutAry); });

				stDomUtil.cSetAllChds(a_Boa, a_Boa.Wse_PcdrLot.c_ColAry);
			});

		// 转移板
		stDomUtil.cSetAllChds(a_This.e_DomFlow, a_This.e_BoaAry);
	}

	// 检查放置目标父节点收缩
	function fChkPutTgtPrnShnk(a_This)
	{
		if (! a_This.e_WidPct) // 只涉及百分比宽度，像素宽度除外
		{ return; }

		//【注意】如果转移后发现放置目标之父节点宽度缩小，可能是垂直滚动条出现，再次运行
		// 但是，仅仅在fTsfrDomElmts调用前后检测父节点宽度变化是不够的，
		// 因为stDomUtil.cSetAllChds函数可能没对DOM做任何修改（这是我优化的结果）
		// 所以还要检测从运行的开始到此刻，父节点宽度是否变小
		var l_PutTgt = a_This.cAcsPutTgt();
		var l_Prn = l_PutTgt.parentNode;
		var l_AftWid = l_Prn.clientWidth;
		//	a_This.e_RunAgn = true;	// 再次运行
		if (l_AftWid < a_This.e_PrnWidWhenRunBgn)	// 宽度变小，可能是垂直滚动条出现
		{
			// 必须再次进行布局
			a_This.e_RunAgn = true;
		}
		else
		if (l_AftWid > a_This.e_PrnWidWhenRunBgn)	// 宽度变大，可能是垂直滚动条消失
		{
			// 如果这是第一次运行，尝试第二次运行以使屏幕空间尽可能占满，
			// 否则保持现状，因若再次尝试可能又会导致垂直滚动条出现，继而第四次运行！
			if (1 == a_This.e_RunCnt)
			{
				a_This.e_RunAgn = true;
			}
		}
	}

	// 处置移除的放数组
	function fDspsRmvdPutAry(a_This)
	{
		stAryUtil.cFor(a_This.e_RmvdPutAry,
			function (a_Ary, a_Idx, a_RmvdPut)
			{ fDspsRmvdPut(a_This, null, null, a_RmvdPut, false, true, null, null); });

		a_This.e_RmvdPutAry.length = 0;
	}

	function fDspsRmvdPut(a_This, a_Boa, a_Col, a_RmvdPut, a_RmvFromPutAry, a_Anmt, a_fCabk, a_RmvdPuts)
	{
		var l_Wse_PcdrLot = a_RmvdPut.Wse_PcdrLot;
		var l_Cfg = l_Wse_PcdrLot && l_Wse_PcdrLot.c_Cfg;
		var tEfc = nUi.tEfc || null;

//		// 建立特效		// 不必了，进入时应该已建立好
//		if (l_Cfg.c_Efc)
//		{ l_Cfg.c_Efc.cStp(a_This, a_RmvdPut); }

		// 还给来源
		function fRtnToSrc()
		{
			// 移除定制的和默认的CSS类
			var l_OldCssc = l_Cfg && l_Cfg.c_Cssc;
			if (l_OldCssc)
			{ stCssUtil.cRmvCssc(a_RmvdPut, l_OldCssc); }

			stCssUtil.cRmvCssc(a_RmvdPut, "cnWse_tPcdrLot_Put");

			// 转发至放置来源
			var l_OrigPrn = ((a_RmvdPut.Wse_Put && a_RmvdPut.Wse_Put.c_OrigPrn) || a_This.e_PutSrc);
			fFowdRmvdPut(a_This, a_Boa, a_Col, a_RmvdPut, a_RmvFromPutAry, l_OrigPrn);

			// 当动画且有回调时，注销，数量为0时回调
			var l_Idx;
			if (a_Anmt && a_fCabk)
			{
				l_Idx = a_RmvdPuts.indexOf(a_RmvdPut);
				if (l_Idx >= 0)
				{ a_RmvdPuts.splice(l_Idx, 1); }

				if (0 == a_RmvdPuts.length)
				{ a_fCabk(a_This); }
			}

			// 最后，归还后回调
			var l_fAftRtn = a_RmvdPut.Wse_PcdrLot.c_Cfg.c_fAftRtn;
			if (l_fAftRtn)
			{ l_fAftRtn(a_RmvdPut); }
		}

		// 没有特效时，立即归还并返回
		if ((! tEfc))
		{
			fRtnToSrc();
			return;
		}

		// 如果动画，转发至e_DomRmvd
		fFowdRmvdPut(a_This, a_Boa, a_Col, a_RmvdPut, a_RmvFromPutAry, a_This.e_DomRmvd);

		// 特效动画
		nUi.stEfcMgr.cIsuCssAnmt(a_Anmt,
			a_This.e_PutTgt, a_RmvdPut,
			3, a_RmvdPut.Wse_PcdrLot.c_Cfg.c_Efc, a_This.e_DftEfc,
			null, fRtnToSrc);
	}

	// 转发移除的放
	function fFowdRmvdPut(a_This, a_Boa, a_Col, a_RmvdPut, a_RmvFromPutAry, a_NewPrn)
	{
		var l_PutIdxInCol = (a_RmvFromPutAry && a_Col) ? a_Col.Wse_PcdrLot.c_PutAry.indexOf(a_RmvdPut) : -1;
		if (l_PutIdxInCol >= 0)
		{ a_Col.Wse_PcdrLot.c_PutAry.splice(l_PutIdxInCol, 1); }

		a_NewPrn.appendChild(a_RmvdPut);
	}

	// 遍历每个板列放
	function fForEachBoaColPut(a_This, a_fBoa1, a_fCol1, a_fPut, a_fCol2, a_fBoa2)
	{
		// 对每个板
		stAryUtil.cFor(a_This.e_BoaAry,
			function (a_BoaAry, a_BoaIdx, a_Boa)
			{
				if (a_fBoa1)
				{ a_fBoa1(a_This, a_Boa, a_BoaIdx); }

				// 对每个列
				stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
					function (a_ColAry, a_ColIdx, a_Col)
					{
						if (a_fCol1)
						{ a_fCol1(a_This, a_Boa, a_Col, a_ColIdx); }

						// 对每个放
						stAryUtil.cFor(a_Col.Wse_PcdrLot.c_PutAry,
							function (a_PutAry, a_PutIdx, a_Put)
							{
								a_fPut(a_This, a_Boa, a_Col, a_Put, a_PutIdx);
							});

						if (a_fCol2)
						{ a_fCol2(a_This, a_Boa, a_Col, a_ColIdx); }
					});

				if (a_fBoa2)
				{ a_fBoa2(a_This, a_Boa, a_BoaIdx); }
			});
	}

	// 移除全部放
	function fRmvAllPuts(a_This, a_Anmt, a_fCabk)
	{
		// 对每个放
		var l_RmvdPuts = (a_Anmt && a_fCabk) ? [] : null;	// 移除的放
		fForEachBoaColPut(a_This,
			null,
			function (a_This, a_Boa, a_Col) // Col1
			{
				// 列的行高数组清零
				a_Col.Wse_PcdrLot.c_RowHgts.length = 0;
			},
			function (a_This, a_Boa, a_Col, a_Put)	// Put
			{
				// 动画且有回调时，注册
				if (a_Anmt && a_fCabk)
				{ l_RmvdPuts.push(a_Put); }

				// 处置
				fDspsRmvdPut(a_This, a_Boa, a_Col, a_Put, false, a_Anmt, a_fCabk, l_RmvdPuts);
			},
			function (a_This, a_Boa, a_Col)	// Col2
			{
				// 列的放数组清零
				a_Col.Wse_PcdrLot.c_PutAry.length = 0;
			});

		// 不动画时立即回调
		if ((! a_Anmt) && a_fCabk)
		{ a_fCabk(a_This); }
	}

	// 清理放置目标
	function fClnPutTgt(a_This)
	{
		// 撤销计时器
		stAryUtil.cFor(a_This.e_TmrIdAry,
			function (a_Ary, a_Idx, a_Id) { clearTimeout(a_Id); });
		a_This.e_TmrIdAry = null;

		// 如果需要，隐藏栅格
		if (a_This.e_ShowGrid)
		{ a_This.cShowHideGrid(false); }

		// 清空各个地带里的子元素
		if (a_This.e_DomFlow)
		{ fRmvAllPuts(a_This, false); }

		if (a_This.e_DomCstm)
		{ fClrChdElmts(a_This, a_This.e_DomCstm); }

		if (a_This.e_DomRmvd)
		{ fClrChdElmts(a_This, a_This.e_DomRmvd); }

		// 删除各个地带
		if (a_This.e_DomFlow)
		{ a_This.e_PutTgt.removeChild(a_This.e_DomFlow); }

		if (a_This.e_DomCstm)
		{ a_This.e_PutTgt.removeChild(a_This.e_DomCstm); }

		if (a_This.e_DomRmvd)
		{ a_This.e_PutTgt.removeChild(a_This.e_DomRmvd); }

		// 复位相关字段
		a_This.e_DomFlow = null;			// <div class="cnWse_tPcdrLot_FlowZone">
		a_This.e_DomCstm = null;			// <div class="cnWse_tPcdrLot_CstmZone">
		a_This.e_DomRmvd = null;			// <div class="cnWse_tPcdrLot_RmvdZone">
		a_This.e_BoaAry = [];				// 板数组
		a_This.e_RmvdPutAry = [];			// 移除的放数组
		a_This.e_AllPuts = [];				// 全部放置元素
		a_This.e_ImgSrcRgtr = [];			// 图像源注册表
		a_This.e_TmrIdAry = [];				// 计时器ID数组
	}

	// 清空子节点元素
	function fClrChdElmts(a_This, a_Prn)
	{
		var l_Chds = stDomUtil.cGetAllChds(a_Prn);	// 必须这么做，因为下面会转移元素，导致节点列表发生变化！
		stAryUtil.cFor(l_Chds,
			function (a_Ary, a_Idx, a_Chd)
			{
				if (1 == a_Chd.nodeType)
				{ fDspsRmvdPut(a_This, null, null, a_Chd, false, false, null, null); }
			});
	}

	// 创建全部地带
	function fCrtAllZones(a_This)
	{
		a_This.e_DomFlow = fCrtZone(a_This, "FlowZone", "cnWse_tPcdrLot_FlowZone");
		//	a_This.e_DomCstm = fCrtZone(a_This, "CstmZone", "cnWse_tPcdrLot_CstmZone");
		a_This.e_DomRmvd = fCrtZone(a_This, "RmvdZone", "cnWse_tPcdrLot_RmvdZone");
	}

	function fCrtZone(a_This, a_Id, a_Cssc)
	{
		var l_PutTgt = a_This.cAcsPutTgt();
		a_Id = l_PutTgt.id + "_" + a_Id;
		var l_Rst = document.createElement("div");
		l_Rst.id = a_Id;
		stCssUtil.cAddCssc(l_Rst, a_Cssc);
		l_PutTgt.appendChild(l_Rst);
		return l_Rst;
	}

	function fCverPutTgtWidToPxl(a_This)
	{
		if (! a_This.e_WidPct)
		{ throw new Error("a_This.e_WidPct是0或null"); }

		var l_PutTgt = a_This.cAcsPutTgt();
		var l_Prn = l_PutTgt.parentNode;
		var l_Wid = Math.floor(l_Prn.clientWidth * a_This.e_WidPct / 100 + 0.5);	// 四舍五入成整数
		l_Wid = stNumUtil.cClmOnNum(l_Wid, a_This.e_MinWid, a_This.e_MaxWid);
		l_PutTgt.style.width = l_Wid.toString() + "px";
	}

	function fSetPutTgtDim(a_This)
	{
		// 决定放置目标的尺寸，优先使用断点宽度（此时根据父元素的客户区宽度计算断点索引）
		var l_PutTgt = a_This.cAcsPutTgt();
		var l_Prn = l_PutTgt.parentNode;
		a_This.e_PrnWidWhenRunBgn = l_Prn.clientWidth;	// 记录运行开始时的父节点宽度

		if (a_This.e_UseBrkPntWid)
		{
			stCssUtil.cSetDimWid(l_PutTgt, a_This.cGetBrkPntWid(fFindBrkPnt(a_This, l_Prn.clientWidth)));
		}
		else // 其次如果比例有效则转成像素
		if (a_This.e_WidPct)
		{
			fCverPutTgtWidToPxl(a_This);
		}
//		else // 否则保持不变（可能开发者指定了像素宽度）
//		{
//			//
//		}

		// 更新最小高度，如果使用innerHeight则可能会变
		a_This.e_PutTgt.style.minHeight = (a_This.e_MinHgt || window.innerHeight).toString() + "px";
	}

	// 运行或重排
	function fRunOrRfl(a_This, a_Rfl)
	{
		// 如果需要，先隐藏栅格
		var l_ShowGrid = a_This.e_ShowGrid;
		if (l_ShowGrid)
		{ fShowHideGrid(a_This, false); }

		// 需要创建全部地带？
		if (null == a_This.e_DomFlow)
		{ fCrtAllZones(a_This); }

		// 清零计数，运行
		var l_OldBrkPntIdx = a_This.e_BrkPntIdx;
		a_This.e_RunCnt = 0;
		fRun(a_This, a_Rfl);

		// 如果需要，显示栅格
		if (l_ShowGrid)
		{ fShowHideGrid(a_This, true); }

		// 如果改变了断点索引
		if ((a_This.e_BrkPntIdx != l_OldBrkPntIdx))
		{
			// 图像LOD系统
			fImgLodSys(a_This);
		}
	}

	// 准备运行
	function fRdyToRun(a_This, a_Rfl)
	{
		// 对于运行把放置目标里的所有放录入，对于重排设置c_From为1
		var l_PutTgt = a_This.cAcsPutTgt();
		a_This.e_RmvdPutAry.length = 0;		// 首先清零
		stAryUtil.cFor(a_This.e_BoaAry,
			function (a_BoaAry, a_BoaIdx, a_Boa)
			{
				stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
					function (a_ColAry, a_ColIdx, a_Col)
					{
						if (a_Rfl)
						{
							stAryUtil.cFor(a_Col.Wse_PcdrLot.c_PutAry,
								function (a_PutAry, a_PutIdx, a_Put)
								{ a_Put.Wse_PcdrLot.c_From = 1; });
						}
						else
						{
							Array.prototype.push.apply(a_This.e_RmvdPutAry, a_Col.Wse_PcdrLot.c_PutAry);
						}
					});
			});

		// 对于运行
		if (! a_Rfl)
		{
			a_This.e_BoaAry.length = 0;			// 清空板数组
			a_This.e_AllPuts.length = 0;		// 清空全部放置元素数组
		}
	}

	// 运行
	function fRun(a_This, a_Rfl)
	{
		// 准备
		++ a_This.e_RunCnt;			// 递增计数
		fSetPutTgtDim(a_This);		// 设置放置目标尺寸
		fRdyToRun(a_This, a_Rfl);	// 准备运行

		// 如果是运行
		var l_W, l_BrkPntIdx, l_fCabk;
		if (! a_Rfl)
		{
			// 根据放置目标宽度，找到合适的断点
			l_W = a_This.cGetPutTgtWid();
			l_BrkPntIdx = fFindBrkPnt(a_This, l_W);
			l_fCabk = a_This.e_Cfg.c_fBpc;

			if (-1 == a_This.e_BrkPntIdx)
			{ a_This.e_Rsn = "初始"; }
			else
			if (a_This.e_BrkPntIdx == l_BrkPntIdx)
			{ a_This.e_Rsn = "更新"; }
			else
			{ a_This.e_Rsn = a_This.e_BrkPntIdx; }

			a_This.e_BrkPntIdx = l_BrkPntIdx;	// 更新断点索引
		}

		// 进行回调
		try
		{
			a_This.e_RunAgn = false;			// 复位再次运行请求
			a_This.e_DurCabk = true;			// 在回调期间

			// 如果是运行
			if (! a_Rfl)
			{
				if (l_fCabk)					// 如果有回调，调用之
				{ l_fCabk(a_This); }

				fDspsRmvdPutAry(a_This);		// 处置移除的放数组
				fTsfrBoas(a_This);				// 把板转移到文档中
			}

			fFlowAllPuts(a_This, a_Rfl);		// 排放
			fChkPutTgtPrnShnk(a_This);			// 检查放置目标父节点收缩
		}
		finally
		{
			a_This.e_DurCabk = false;		// 不在回调期间
		}

		if (a_This.e_RunAgn)				// 如果要求再次运行，递归
		{
			fRun(a_This, false);			// 再次运行一定不是重排
		}
	}

	// 排放所有
	function fFlowAllPuts(a_This, a_Rfl)
	{
		// 对每个板
		var l_This = a_This;
		stAryUtil.cFor(l_This.e_BoaAry,
			function (a_BoaAry, a_BoaIdx, a_Boa)
			{
				// 计算板的位置尺寸，清零已分配宽（用于校准列宽）
				fCalcBoaTotDim(a_This, a_Boa);
				fCalcBoaY(l_This, a_Boa);
				a_Boa.Wse_PcdrLot.c_AlctdW = 0;
				a_Boa.Wse_PcdrLot.c_W = fCalcBoaW(a_This, a_Boa, a_This.e_UseBrkPntWid);
				a_Boa.Wse_PcdrLot.c_CtntW = fCalcBoaCtntW(a_This, a_Boa, a_This.e_UseBrkPntWid);
				var l_ColDvd = a_Boa.Wse_PcdrLot.c_ColDvd;
				stCssUtil.cSetDimWid(a_Boa, a_Boa.Wse_PcdrLot.c_W);	// 把板宽设为像素

				// 对每个列
				stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
					function (a_ColAry, a_ColIdx, a_Col)
					{
						// 计算列的位置尺寸
						fCalcColTotDim(a_This, a_Boa, a_Col);

						// 校准列宽，对齐像素
						var l_ColW = (a_ColIdx < a_ColAry.length - 1)
							? Math.round(fCalcColW(a_This, a_Boa, a_Col, l_ColDvd[a_ColIdx], a_This.e_UseBrkPntWid))
							: Math.floor(a_Boa.Wse_PcdrLot.c_CtntW - a_Boa.Wse_PcdrLot.c_AlctdW);
						a_Boa.Wse_PcdrLot.c_AlctdW += l_ColW;
						a_Col.style.width = l_ColW.toString() + "px";
						a_Col.Wse_PcdrLot.c_W = l_ColW;
						a_Col.Wse_PcdrLot.c_CtntW = l_ColW - a_Col.Wse_PcdrLot.c_CssDim.c_BpLtRt;

						// 排版准备新列
						fFlow_RdyForNewCol(l_This, a_Boa, a_Col, a_ColIdx);

						// 对每个放排版
						stAryUtil.cFor(a_Col.Wse_PcdrLot.c_PutAry,
							function (a_PutAry, a_PutIdx, a_Put)
							{
								fFlow(l_This, a_Boa, a_Col, a_Put, a_Rfl);
							});

						// 如果行高数组最后一项是0，弹出
						var l_RowHgts = a_Col.Wse_PcdrLot.c_RowHgts;
						if ((l_RowHgts.length > 0) && (0 == l_RowHgts[l_RowHgts.length - 1]))
						{ l_RowHgts.pop(); }
					});

				// 计算板的内容H
				fCalcBoaH(l_This, a_Boa);
				var l_BoaH = a_Boa.Wse_PcdrLot.c_H - a_Boa.Wse_PcdrLot.c_CssDim.c_BpUpDn;

				// 对每个列，垂直对齐修正
				stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
					function (a_ColAry, a_ColIdx, a_Col)
					{
						var l_ColH, l_BoaCenY, l_ColCenY, l_ColOfstY = 0;
						var l_VticAln = a_Col.Wse_PcdrLot.c_Cfg.c_VticAln;
						if (l_VticAln)
						{
							l_ColH = fCalcColCtntH(l_This, a_Boa, a_Col);
							if (l_ColH < l_BoaH)
							{
								// 计算垂直偏移量
								l_BoaCenY = l_BoaH * l_VticAln / 100;
								l_ColCenY = l_ColH * l_VticAln / 100;
								l_ColOfstY = l_BoaCenY - l_ColCenY;
							}
						}

						// 对每个放
						stAryUtil.cFor(a_Col.Wse_PcdrLot.c_PutAry,
							function (a_PutAry, a_PutIdx, a_Put)
							{
								// 垂直修正，目标区域对齐像素，动画放置
								fFlow_VticAlnFix(l_This, a_Boa, a_Col, a_Put, a_PutIdx, l_ColOfstY);
								tSara.scAlnPxl(a_Put.Wse_PcdrLot.c_TgtArea);
								fAnmtPut(l_This, a_Rfl, a_Boa, a_Col, a_Put, a_PutIdx, true);
							});
					});
			});
	}

	// 排版
	function fFlow(a_This, a_Boa, a_Col, a_Put, a_Rfl)
	{
		// 如果这是第一行
		var l_RowHgts = a_Col.Wse_PcdrLot.c_RowHgts;
		if (0 == l_RowHgts.length)
		{ l_RowHgts.push(0); }

		// 准备
		var l_Cfg = a_Put.Wse_PcdrLot.c_Cfg;
		var l_fTgtArea = l_Cfg.c_fTgtArea;
		var l_TgtArea = a_Put.Wse_PcdrLot.c_TgtArea;
		var l_GridTot = a_Col.Wse_PcdrLot.c_GridTot;
		var l_OrigGridIdx = l_Cfg.c_GridIdx, l_GridIdx = l_OrigGridIdx;
		var l_GridOfst = (l_Cfg.c_GridOfst || 0);
		var l_GridCnt = l_Cfg.c_GridCnt || a_Col.Wse_PcdrLot.c_GridTot;
		var l_HrztAln = l_Cfg.c_HrztAln;
		var l_AutoGridIdx;

		if (l_fTgtArea) // 计算目标区域
		{
			a_Put.Wse_PcdrLot.c_ActGridIdx = -1;			// 记录修正后的实际索引和个数
			a_Put.Wse_PcdrLot.c_ActGridCnt = 0;
			a_Put.Wse_PcdrLot.c_RowIdx = -1;				// 记录行索引;
		}
		else // 计算栅格索引和个数
		{
			if (l_Cfg.c_NewRow)	// 换行
			{ fFlow_NewLine(a_This, a_Boa, a_Col); }

			if (l_GridCnt > l_GridTot)	// 确保c_GridCnt <= l_GridTot
			{ l_GridCnt = l_GridTot; }

			l_AutoGridIdx = nWse.fIsUdfnOrNull(l_GridIdx);
			if (l_AutoGridIdx && (! nWse.fIsUdfnOrNull(l_HrztAln)))	// 未提供c_GridIdx，但要求水平对齐？
			{
				if (l_HrztAln < 0)
				{ l_OrigGridIdx = 0; }
				else
				if (0 == l_HrztAln)
				{ l_OrigGridIdx = Math.floor((l_GridTot - l_GridCnt) / 2); }
				else
				{ l_OrigGridIdx = (l_GridTot - l_GridCnt); }

				l_GridIdx = l_OrigGridIdx;			// 假定这就是原始输入的栅格索引
				l_AutoGridIdx = false;				// 不再认为是自动生成
			}

			if (l_AutoGridIdx)
			{ l_GridIdx = a_This.e_FlowGridNext; }
			else
			if (l_GridIdx < a_This.e_FlowGridNext)	// 确保c_GridIdx >= e_FlowGridNext
			{ l_GridIdx = a_This.e_FlowGridNext; }

			if (l_GridIdx + l_GridCnt > l_GridTot) // 如果本行剩余空间不足以容纳这个元素，换行
			{
				fFlow_NewLine(a_This, a_Boa, a_Col);
				l_GridIdx = l_AutoGridIdx ? 0 : l_OrigGridIdx;	// 除非自动生成，否则不要用前面修正过的
				if (l_GridIdx + l_GridCnt > l_GridTot)			// 换行后仍不够，左推
				{ l_GridIdx = l_GridTot - l_GridCnt; }
			}

			l_GridIdx += l_GridOfst;							// 栅格偏移
			a_Put.Wse_PcdrLot.c_ActGridIdx = l_GridIdx;			// 记录修正后的实际索引和个数
			a_Put.Wse_PcdrLot.c_ActGridCnt = l_GridCnt;
			a_Put.Wse_PcdrLot.c_RowIdx = l_RowHgts.length - 1;	// 记录行索引
			a_This.e_FlowGridNext = l_GridIdx + l_GridCnt;		// 更新下一个索引
		}

		// 现在可以从c_GridIdx处开始摆放，横跨c_GridCnt条栅格，据此计算包围盒并修改元素样式：
		// 计算位置时，不考虑外边距，因为浏览器定位时也算上外边距了
		// 计算宽度时，不用加外边距，因为它们已被算在包围盒里
		// 计算高度时，需另加外边距，因为排版时要以此确定行高
		var l_FxdAr = a_Put.Wse_PcdrLot.c_Cfg.c_FxdAr;
	//	var l_FxdAny = !! (l_fTgtArea || l_FxdAr);
		var l_CssMgn = a_Put.Wse_PcdrLot.c_CssMgn;
		var l_BaseGridUnit = a_Col.Wse_PcdrLot.c_BaseGridUnit;
		var l_CrntGridUnit = a_Col.Wse_PcdrLot.c_CrntGridUnit;
		var l_GridUnit = (a_This.e_UseBrkPntWid ? l_BaseGridUnit : l_CrntGridUnit);
		var l_OldWid;

		var l_CmptStl = stCssUtil.cGetCmptStl(a_Put);
		stCssUtil.cGetMgn(l_CssMgn, a_Put, l_CmptStl, true);	// 计算外边距，对齐像素

		if (l_fTgtArea)	// 计算目标区，优先顺序为：c_fTgtArea，c_FxdAr，style.height，auto
		{
			l_fTgtArea(l_TgtArea, a_Boa, a_Col);
		}
		else
		{
			l_TgtArea.c_X = l_GridIdx * l_GridUnit + fCalcColCtntX(a_This, a_Boa, a_Col);
			l_TgtArea.c_Y = a_This.e_FlowRelY + fCalcColCtntY(a_This, a_Boa, a_Col);
			l_TgtArea.c_W = l_GridCnt * l_GridUnit;

			// 立即触发摆放事件之宽度已决定，因为事件处理器可能会趁机修改高度
			tPcdrLot.scTrgrPutEvt_WidDtmnd(a_Put);

			if (l_FxdAr) // 如果提供了宽高比，使用它来计算
			{
				l_TgtArea.c_H = (l_TgtArea.c_W - l_CssMgn.c_MgnLt - l_CssMgn.c_MgnRt) / l_FxdAr;
			}
			else // 使用样式高度
		//	if (l_CmptStl.height.indexOf("px") >= 0)	// 不要用这个，因为总是为true
			if (a_Put.style.height.indexOf("px") >= 0)	// 只允许像素
			{
			//	l_TgtArea.c_H = parseFloat(l_CmptStl.height);
				l_TgtArea.c_H = parseFloat(a_Put.style.height);
			}
			else // 否则设置宽度使浏览器自动计算，注意box-sizing是border-box，所以用offsetWidth和offsetHeight
			{
				l_OldWid = a_Put.offsetWidth;	// 暂存
				stCssUtil.cSetDimWid(a_Put, l_TgtArea.c_W - l_CssMgn.c_MgnLt - l_CssMgn.c_MgnRt);
				l_TgtArea.c_H = a_Put.offsetHeight;
				stCssUtil.cSetDimWid(a_Put, l_OldWid);	// 恢复
			}

			l_TgtArea.c_H += l_CssMgn.c_MgnUp + l_CssMgn.c_MgnDn;
		}

		// 更新行高
		if (l_TgtArea && (l_TgtArea.c_H > l_RowHgts[l_RowHgts.length - 1]))
		{ l_RowHgts[l_RowHgts.length - 1] = l_TgtArea.c_H; }
	}

	function fFlow_VticAlnFix(a_This, a_Boa, a_Col, a_Put, a_PutIdx, a_ColOfstY)
	{
		// 不在排版流里？
		if (a_Put.Wse_PcdrLot.c_RowIdx < 0)
		{ return; }

		// 行垂直紧凑
		var l_TgtArea = a_Put.Wse_PcdrLot.c_TgtArea;
		var l_VticCmpc = a_Put.Wse_PcdrLot.c_Cfg.c_VticCmpc;
		if (l_VticCmpc)
		{
			l_TgtArea.c_Y = fFlow_RowVticCmpc(a_This, a_Boa, a_Col, a_Put, a_PutIdx);
			return;
		}

		// 列垂直对齐
		l_TgtArea.c_Y += a_ColOfstY;

		// 行垂直对齐
		var l_RowHgts = a_Col.Wse_PcdrLot.c_RowHgts;
		var l_RowH = l_RowHgts[a_Put.Wse_PcdrLot.c_RowIdx];
		var l_RowCenY, l_PutCenY, l_PutOfstY;
		var l_VticAln = a_Put.Wse_PcdrLot.c_Cfg.c_VticAln;
		if (l_VticAln)
		{
			if (l_TgtArea.c_H < l_RowH)
			{
				// 计算垂直偏移量
				l_RowCenY = l_RowH * l_VticAln / 100;
				l_PutCenY = l_TgtArea.c_H * l_VticAln / 100;
				l_PutOfstY = l_RowCenY - l_PutCenY;
				l_TgtArea.c_Y += l_PutOfstY;
			}
		}

		// 行垂直偏移
		var l_VticOfst = a_Put.Wse_PcdrLot.c_Cfg.c_VticOfst;
		if (l_VticOfst)
		{
			l_PutOfstY = l_RowH * l_VticOfst / 100;
			l_TgtArea.c_Y += l_PutOfstY;
		}
	}

	// 行垂直紧凑
	function fFlow_RowVticCmpc(a_This, a_Boa, a_Col, a_Put, a_PutIdx)
	{
		// 第一行原地不动
		var l_RowIdx = a_Put.Wse_PcdrLot.c_RowIdx;
		if (0 == l_RowIdx)
		{ return a_Put.Wse_PcdrLot.c_TgtArea.c_Y; }

		// 定位上一行元素的索引范围
		var l_PutAry = a_Col.Wse_PcdrLot.c_PutAry;
		var l_PrevRowIdx = l_RowIdx - 1;
		var l_Bgn, l_End = a_PutIdx - 1;
		for (; l_End>=0; --l_End)
		{
			if (l_PutAry[l_End].Wse_PcdrLot.c_RowIdx == l_PrevRowIdx)
			{ break; }
		}
		for (l_Bgn=l_End-1; l_Bgn>=0; --l_Bgn)
		{
			if (l_PutAry[l_Bgn].Wse_PcdrLot.c_RowIdx != l_PrevRowIdx)
			{ break; }
		}
		++ l_Bgn;

		// 遍历索引范围[l_Bgn, l_End]，找出和a_Put栅格范围重叠的放，记录底线
		var i=l_Bgn, l_PPP, l_Bm = 0;
		for (; i<=l_End; ++i)
		{
			l_PPP = l_PutAry[i].Wse_PcdrLot;
			if (stNumUtil.cHasOvlp(l_PPP.c_ActGridIdx, l_PPP.c_ActGridIdx + l_PPP.c_ActGridCnt - 1,
				a_Put.Wse_PcdrLot.c_ActGridIdx, a_Put.Wse_PcdrLot.c_ActGridIdx + a_Put.Wse_PcdrLot.c_ActGridCnt - 1))
			{
				l_Bm = Math.max(l_Bm, l_PPP.c_TgtArea.c_Y + l_PPP.c_TgtArea.c_H);
			}
		}
		return l_Bm;
	}

	// 动画放置
	function fAnmtPut(a_This, a_Rfl, a_Boa, a_Col, a_Put, a_PutIdx, a_Anmt)
	{
		var l_fTgtArea = a_Put.Wse_PcdrLot.c_Cfg.c_fTgtArea;
		var l_FxdAr = a_Put.Wse_PcdrLot.c_Cfg.c_FxdAr;
		var l_FxdAny = !! (l_fTgtArea || l_FxdAr);
		var l_CssMgn = a_Put.Wse_PcdrLot.c_CssMgn;
		var l_TgtArea = a_Put.Wse_PcdrLot.c_TgtArea;
		var l_Cfg = a_Put.Wse_PcdrLot.c_Cfg;
		var tEfc = nUi.tEfc || null;

		// 建立特效
		if (l_Cfg.c_Efc)
		{ l_Cfg.c_Efc.cStp(a_This, a_Put); }

		// 进入动画还是重排动画？
		// 当不是重新排版且来自源时，设置进入起始值，不要使用元素当前值，
		// 确保第一个条件是有必要的，因为除非再次回调，c_From的值将一直保持0
		var l_EntAnmt = (! a_Rfl) && (0 == a_Put.Wse_PcdrLot.c_From);
		if (l_EntAnmt) // 进入动画时，首先设置结束值以应对不做动画的情形，允许后面的动画覆盖这些值
		{
			stCssUtil.cSetPos(a_Put, l_TgtArea.c_X, l_TgtArea.c_Y);
			stCssUtil.cSetDimWid(a_Put, l_TgtArea.c_W - l_CssMgn.c_MgnLt - l_CssMgn.c_MgnRt);
		}

		if (l_FxdAny)	// 固定时需要设置初始高度（此时不可定制）
		{ stCssUtil.cSetDimHgt(a_Put, l_TgtArea.c_H - l_CssMgn.c_MgnUp - l_CssMgn.c_MgnDn); }

		// 没有特效时，立即返回
		if ((! tEfc))
		{
			return;
		}

		// 特效动画
		nUi.stEfcMgr.cIsuCssAnmt(a_Anmt,
			a_This.e_PutTgt, a_Put,
			(l_EntAnmt ? 1 : 2), a_Put.Wse_PcdrLot.c_Cfg.c_Efc, a_This.e_DftEfc,
			{ // 目标区域，覆盖自定义特效
				"left" : l_TgtArea.c_X.toString() + "px",
				"top" : l_TgtArea.c_Y.toString() + "px",
				"width" : (l_TgtArea.c_W - l_CssMgn.c_MgnLt - l_CssMgn.c_MgnRt).toString() + "px",
				"height" : l_FxdAny
					? ((l_TgtArea.c_H - (l_CssMgn.c_MgnUp + l_CssMgn.c_MgnDn)).toString() + "px")
					: undefined	// 必须用这个，将被cShlwAsn跳过
			}, null);
	}

	function fFlow_RdyForNewCol(a_This, a_Boa, a_Col, a_ColIdx)
	{
		fCalcGridUnitW(a_This, a_Boa, a_Col, a_ColIdx);			// 计算栅格单位宽

		a_This.e_FlowGridNext = 0;								// 排版栅格下一个索引
		a_This.e_FlowRelY = 0;									// 排版相对板Y坐标
		if (a_Col.Wse_PcdrLot.c_RowHgts.length > 0)				// 行高清零
		{ a_Col.Wse_PcdrLot.c_RowHgts.length = 0; }
	}

	function fFlow_NewLine(a_This, a_Boa, a_Col)
	{
		var l_RowHgts = a_Col.Wse_PcdrLot.c_RowHgts;
		a_This.e_FlowGridNext = 0;								// 索引复位
		a_This.e_FlowRelY += l_RowHgts[l_RowHgts.length - 1];	// Y跳至下一行
		l_RowHgts.push(0);										// 清零行高
	}

	// 图像LOD系统
	function fImgLodSys(a_This)
	{
		// 取得所有需要该系统的元素，对每一个
		var l_AllImg = stDomUtil.cQryAll("#" + a_This.cAcsPutTgt().id + " *[data-Wse_ImgSrc]");
		stAryUtil.cFor(l_AllImg,
			function (a_Ary, a_Idx, a_DomElmt)
			{
				// 跳过不是属于自身的，取得文件路径，跳过无效的
				var l_Src = a_This.cCtanPut(a_DomElmt) ? a_DomElmt.getAttribute("data-Wse_ImgSrc"): null;
				var l_DotIdx = l_Src ? l_Src.lastIndexOf(".") : -1;	// 必须有扩展名
				if (l_DotIdx < 0)
				{ return; }

				// 根据断点索引计算文件路径，并小写化
				if (a_This.e_BrkPntIdx > 0)
				{ l_Src = stStrUtil.cIst(l_Src, l_DotIdx, "_L" + a_This.e_BrkPntIdx.toString()); }
				l_Src = l_Src.toLowerCase();

				if (a_DomElmt.Wse_PcdrLot && (a_DomElmt.Wse_PcdrLot.c_ImgSrc == l_Src)) // 没必要加载
				{ return; }

				// 录入
				var l_Img = null;
				var l_Idx = fFindImgItem(a_This, l_Src, true);
				if (l_Idx < 0)
				{
					// 【警告】在下载完成前放置目标有可能已被清空，所以先判断自身状态的有效性
					l_Img = new Image();
					l_Img.onerror = function ()
					{
						// 出错时只注销
						var l_Idx;
						if (a_This.e_ImgSrcRgtr.length > 0)
						{
							l_Idx = fFindImgItem(a_This, l_Img, false);
							a_This.e_ImgSrcRgtr.splice(l_Idx, 1);
						}

						// 清null
						l_Img.onerror = null;
						l_Img.onload = null;
					};
					l_Img.onload = function ()
					{
						// 完成并注销
						function fCpltAndUrg()
						{
							var l_Idx = fFindImgItem(a_This, l_Img, false);
							fOnImgCplt(l_Idx);
							a_This.e_ImgSrcRgtr.splice(l_Idx, 1);
						}

						if (a_This.e_ImgSrcRgtr.length > 0)
						{
							if (nWse.fIsAsynDly())	// 如果设置了异步延迟
							{ a_This.e_TmrIdAry.push(setTimeout(fCpltAndUrg, nWse.g_AsynDly * 1000)); }
							else
							{ fCpltAndUrg(); }
						}

						// 清null
						l_Img.onerror = null;
						l_Img.onload = null;
					};
					a_This.e_ImgSrcRgtr.push({
						c_Img: l_Img,
						c_Src: l_Src,
						c_DomElmts: [a_DomElmt]
					});

					l_Img.src = l_Src;	// 最后才指定src
				}
				else
				{
					a_This.e_ImgSrcRgtr[l_Idx].c_DomElmts.push(a_DomElmt);
				}
			});

		function fOnImgCplt(a_Idx)	//【注意】这个函数可能被延迟调用，所以必须仔细检查有效性！
		{
			// 如果在下载或延迟期间发生放置目标重置，或断点索引发生改变，这个检查可以防止LOD错乱
			var l_OrigIsr = fOnImgCplt.Wse_ImgSrcRgtr;
			var l_OrigBpi = fOnImgCplt.Wse_BrkPntIdx;
			if ((l_OrigIsr !== a_This.e_ImgSrcRgtr) || (l_OrigBpi != a_This.cGetBrkPntIdx()))
			{ return; }

			// 项也可能失效
			var l_Item = a_This.e_ImgSrcRgtr[a_Idx];
			if (! l_Item)
			{ return; }

			// 对每个元素
			var l_NeedRfl = false;	// 需要重排？当宽高比变化时需要
			stAryUtil.cFor(l_Item.c_DomElmts,
				function (a_Ary, a_Idx, a_DomElmt)
				{
					// 判断宽高比的变化，并根据标记设置图像源路径
					var l_OldAr, l_NewAr;
					if (! a_DomElmt.Wse_PcdrLot)
					{ a_DomElmt.Wse_PcdrLot = { }; }

					if ("IMG" == a_DomElmt.tagName)	// <img src="l_Item.c_Src">
					{
						l_OldAr = a_DomElmt.Wse_PcdrLot.c_ImgAr;
						a_DomElmt.src = l_Item.c_Src;
					}
					else // background-image: url("l_Item.c_Src");
					{
						l_OldAr = a_DomElmt.Wse_PcdrLot.c_ImgAr;
						a_DomElmt.style.backgroundImage = 'url("' + l_Item.c_Src + '")';
					}

					l_NewAr = (l_Item.c_Img.height > 0) ? (l_Item.c_Img.width / l_Item.c_Img.height) : null;
					a_DomElmt.Wse_PcdrLot.c_ImgAr = l_NewAr;

					// 需要重排？
					if ((! l_NeedRfl) && l_OldAr && l_NewAr)
					{
						if (! stNumUtil.cEq(l_OldAr, l_NewAr, 0.05)) // 误差5%
						{ l_NeedRfl = true; }
					}

					// 记录当前的文件路径
					if (! a_DomElmt.Wse_PcdrLot)
					{ a_DomElmt.Wse_PcdrLot = {}; }
					a_DomElmt.Wse_PcdrLot.c_ImgSrc = l_Item.c_Src;
				});

			// 如果需要，重排
			if (l_NeedRfl)
			{ a_This.cRfl(); }
		}
		fOnImgCplt.Wse_ImgSrcRgtr = a_This.e_ImgSrcRgtr;	// 用于检查有效性
		fOnImgCplt.Wse_BrkPntIdx = a_This.cGetBrkPntIdx();
	}

	function fFindImgItem(a_This, a_Src, a_BySrc)
	{
		return stAryUtil.cFind(a_This.e_ImgSrcRgtr,
			function (a_Ary, a_Idx, a_Item)
			{ return a_BySrc ? (a_Item.c_Src == a_Src) : (a_Item.c_Img === a_Src); });
	}

	// 显示隐藏栅格
	function fShowHideGrid(a_This, a_Show, a_OddCloStr, a_EvenCloStr, a_Zidx)
	{
		a_OddCloStr = a_OddCloStr || "rgba(128, 128, 128, 0.4)";
		a_EvenCloStr = a_EvenCloStr || "rgba(192, 192, 192, 0.4)";
		a_Zidx = nWse.fIsUdfnOrNull(a_Zidx) ? 999998 : a_Zidx;

		var l_Dom_Body = stDomUtil.cAcsBody();
		var l_GridBarSet;

		if (a_Show)
		{
			// 如果已经显示，则先隐藏，不要直接返回，因为页面位置可能发生变化
			if (document.getElementById("uok_GridBarSet"))
			{ fHide(); }

			// 创建栅格条集合
			l_GridBarSet = document.createElement("div");
			l_GridBarSet.id = "uok_GridBarSet";

			// 对每个板
			stAryUtil.cFor(a_This.e_BoaAry,
				function (a_BoaAry, a_BoaIdx, a_Boa)
				{
					// 对每个列
					stAryUtil.cFor(a_Boa.Wse_PcdrLot.c_ColAry,
						function (a_ColAry, a_ColIdx, a_Col)
						{ fDraw(a_This, a_Boa, a_Col); });
				});
		}
		else
		{
			// 隐藏
			fHide();
		}

		function fHide()
		{
			// 移除栅格条集合
			var l_Dom_GridBarSet = document.getElementById("uok_GridBarSet");
			if (! l_Dom_GridBarSet)
			{ return; }

			l_Dom_Body.removeChild(l_Dom_GridBarSet);
		}

		function fDraw(a_This, a_Boa, a_Col)
		{
			var l_CssDim = a_Col.Wse_PcdrLot.c_CssDim;
			var l_ColCtntW = a_Col.Wse_PcdrLot.c_CtntW;
			var l_Wid = l_ColCtntW;
			var l_DsplAbb = a_Col.getBoundingClientRect();
			var l_BarDsplTot = a_Col.Wse_PcdrLot.c_GridTot;
			var l_BarSpc = l_Wid / l_BarDsplTot;
			var l_AccBarSpc = 0;
			var l_BarWidCssStr = (l_BarSpc).toString() + "px";
			var l_GridBar = null;
			var l_RandCloStr = null;
			var l_ColIdx = 0;
			for (; l_ColIdx < l_BarDsplTot; ++l_ColIdx)
			{
				l_GridBar = document.createElement("div");
				l_GridBar.className = "cnWse_tPcdrLot_GridBar";
				l_GridBar.style.zIndex = a_Zidx.toString();
				l_GridBar.style.left = (l_DsplAbb.left + l_CssDim.c_BpLt + l_ColIdx * l_BarSpc).toString() + "px";
				l_GridBar.style.top = (l_DsplAbb.top + l_CssDim.c_BpUp).toString() + "px";
				l_GridBar.style.width = (l_ColIdx < l_BarDsplTot - 1) ? l_BarWidCssStr : (Math.floor(l_Wid - l_AccBarSpc + 0.5).toString() + "px");
				l_GridBar.style.height = (l_DsplAbb.height - l_CssDim.c_BpUpDn).toString() + "px";
				l_GridBar.style.backgroundColor = ((1 + l_ColIdx) % 2) ? a_OddCloStr : a_EvenCloStr;
				if (0 == l_ColIdx)
				{
					nWse.tClo.scRand(fShowHideGrid.Wse_RandClo);	fShowHideGrid.Wse_RandClo.a = 1;
					l_RandCloStr = nWse.tClo.scToCssCloStr(fShowHideGrid.Wse_RandClo);
					l_GridBar.style.borderLeft = "1px solid " + l_RandCloStr;
				}
				if (l_ColIdx == l_BarDsplTot - 1)
				{ l_GridBar.style.borderRight = "1px solid " + l_RandCloStr; }
				l_GridBarSet.appendChild(l_GridBar);
				l_AccBarSpc += l_BarSpc;
			}
			l_Dom_Body.appendChild(l_GridBarSet);
		}
	}

	fShowHideGrid.Wse_RandClo = new nWse.tClo();	// 随机颜色

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 程序化布局

	var tPcdrLot;
	(function ()
	{
		tPcdrLot = nWse.fClass(nUi,
			/// 程序化布局
			function tPcdrLot()
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
					fClnPutTgt(this);					// 清理放置目标

					this.e_Cfg = null;					// 配置，保证不会修改！
					this.e_PutTgt = null;				// 放置目标
					this.e_PutSrc = null;				// 放置来源
					this.e_WidPct = null;				// 宽度百分比
					this.e_MinWid = 128;				// 最小宽度
					this.e_MaxWid = Number.MAX_VALUE;	// 最大宽度
					this.e_MinHgt = null;				// 最小高度
					this.e_BrkPntIdx = -1;				// 断点索引
					this.e_UseBrkPntWid = false;		// 使用断点宽

					this.e_Rsn = null;					// 原因
					this.e_DurCabk = false;				// 在回调期间
					this.e_PrnWidWhenRunBgn = 0;		// 运行开始时的父节点宽度
					this.e_RunCnt = 0;					// 运行计数
					this.e_RunAgn = false;				// 需要再次运行？
					this.e_DftEfc = null;				// 默认特效

					// 以下是和开发调试相关的字段
					this.e_ShowGrid = false;			// 显示栅格？
					this.e_fOnWndScrl = null;			// 当滚动时
					return this;
				}
				,
				/// 规划
				/// a_Cfg：Object，配置对象
				///	{
				///	c_PutTgt：String，放置目标的HTML元素ID，必须有效
				/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
				/// c_WidPct：Number，宽度百分比，若不指定则使用放置目标当前像素宽度
				/// c_MinWid，c_MaxWid：Number，最小最大宽度，默认128，Number.MAX_VALUE
				/// c_MinHgt：Number，最小高度，默认null表示window.innerHeight
				/// c_BrkPnts：Array，断点数组，示例：[0, 480, 960]，必须从0开始，且从小到大排列
				///	c_fBpc：void f(a_Lot)，断点回调函数
				cPlan : function (a_Cfg)
				{
					// 如果需要，首先重置
					if (this.e_Cfg)
					{ this.cRset(); }

					// 记录配置，修正一些参数
					if (! a_Cfg)
					{ return this; }

					this.e_Cfg = a_Cfg;
					this.e_PutSrc = document.getElementById(a_Cfg.c_PutSrc);	if (! this.e_PutSrc) { throw new Error("c_PutSrc无效！"); }
					this.e_PutTgt = document.getElementById(a_Cfg.c_PutTgt);	if (! this.e_PutTgt) { throw new Error("c_PutTgt无效！"); }
					this.e_WidPct = a_Cfg.c_WidPct || null;
					this.e_MinWid = a_Cfg.c_MinWid || 128;
					this.e_MaxWid = a_Cfg.c_MaxWid || Number.MAX_VALUE;
					this.e_MinHgt = a_Cfg.c_MinHgt || null;
					stCssUtil.cAddCssc(this.e_PutTgt, "cnWse_PutTgt");	// 默认的CSS类
					stCssUtil.cAddCssc(this.e_PutSrc, "cnWse_PutSrc");
					return this;
				}
				,
				/// 运行
				cRun : function ()
				{
					// 检查自身状态
					if (! this.e_PutTgt)
					{ throw new Error("cRun()之前必须调用cPlan()！"); }

					fRunOrRfl(this, false);
					return this;
				}
				,
				/// 重排
				cRfl : function ()
				{
					// 若尚未运行过则运行，否则重排
					if (0 == this.e_BoaAry.length)
					{ return this.cRun(); }

					fRunOrRfl(this, true);
					return this;
				}
				,
				/// 存取放置目标
				cAcsPutTgt : function () { return this.e_PutTgt || null; }
				,
				/// 获取放置目标宽度
				cGetPutTgtWid : function () { return this.e_PutTgt ? this.e_PutTgt.clientWidth : 0; }
				,
				/// 获取放置目标高度
				cGetPutTgtHgt : function () { return this.e_PutTgt ? this.e_PutTgt.clientHeight : 0; }
				,
				/// 获取断点索引
				cGetBrkPntIdx : function () { return this.e_BrkPntIdx; }
				,
				/// 获取断点宽度
				cGetBrkPntWid : function (a_BrkPntIdx)
				{
					a_BrkPntIdx = nWse.fIsUdfnOrNull(a_BrkPntIdx) ? this.e_BrkPntIdx : a_BrkPntIdx;
					return stNumUtil.cClmOnNum(this.e_Cfg.c_BrkPnts[a_BrkPntIdx], this.e_MinWid, this.e_MaxWid);
				}
				,
				/// 使用断点宽
				cTheUseBrkPntWid : function (a_Udfn$YesNo)
				{
					if (0 == arguments.length)
					{ return this.e_UseBrkPntWid; }

					this.e_UseBrkPntWid = !! a_Udfn$YesNo;
					return this;
				}
				,
				/// 获取这次布局运行的原因
				/// 返回：String$Number，∈{ "初始", "更新", 之前的断点索引 }
				cGetRsn : function () { return this.e_Rsn; }
				,
				/// 板
				/// a_Cfg：Object，配置对象
				///	{
				///	c_Id：String，HTML元素ID，必须有效
				/// c_HtmlTag：String，HTML标记，默认"section"
				/// c_Cssc：String，CSS类
				/// c_FxdAr：Number，固定宽高比，默认undefined
				/// c_ColDvd：Number[]，列划分，必须∈(0, 100]且总和≤100，所有null均分余下空间，默认[100]
				///	}
				cBoa : function (a_Cfg)
				{
					// 检查自身状态
					if (! this.e_DurCabk)
					{ throw new Error("cBoa()只能在断点回调函数里调用！"); }

					// 检查实参
					if (! a_Cfg.c_Id)
					{ throw new Error("板的c_Id无效！")}

					// 得到元素
					var l_Boa = fObtnBoaCol(this, a_Cfg, "cnWse_tPcdrLot_Boa", null, "section");
					l_Boa.Wse_PcdrLot.c_Cfg = a_Cfg;		// 记录配置
					l_Boa.Wse_PcdrLot.c_ColAry = [];		// 列数组
					l_Boa.Wse_PcdrLot.c_CssDim = {};		// CSS尺寸
					l_Boa.Wse_PcdrLot.c_Y = 0;				// Y
					l_Boa.Wse_PcdrLot.c_H = 0;				// 高
					l_Boa.Wse_PcdrLot.c_AlctdW = 0;			// 已分配宽
					fCalcBoaNullPct(this, l_Boa, a_Cfg);	// 计算null百分比
					this.e_BoaAry.push(l_Boa);				// 保存起来
					return this;
				}
				,
				/// 列
				/// a_Cfg：Object，配置对象
				///	{
				///	c_Id：String，HTML元素ID，若无效则设为“[板ID]_Col[Idx]”，Idx从0开始递增
				/// c_GridTot：Number，栅格总数，默认1
				/// c_HtmlTag：String，HTML标记，默认"div"
				/// c_VticAln：Number，垂直对齐百分比∈[0, 100]，默认0
				///	}
				cCol : function (a_Cfg)
				{
					// 取得板
					var l_Boa = fAcsBoa(this);
					nWse.fAst(l_Boa, "cCol()只能在cBoa()之后调用！");

					// 列已满？忽略这次调用
					if (l_Boa.Wse_PcdrLot.c_ColAry.length == l_Boa.Wse_PcdrLot.c_ColDvd.length)
					{ return this; }

					// 修正配置
					var l_ColIdx = l_Boa.Wse_PcdrLot.c_ColAry.length;
					var l_DftId = a_Cfg.c_Id || (l_Boa.id + "_Col" + l_ColIdx.toString());
					var l_GridTot = (nWse.fIsUdfnOrNull(a_Cfg.c_GridTot) || (a_Cfg.c_GridTot < 1)) ? 1 : a_Cfg.c_GridTot;
					var l_ColPct = l_Boa.Wse_PcdrLot.c_ColDvd[l_ColIdx];

					// 得到元素
					var l_Col = fObtnBoaCol(this, a_Cfg, "cnWse_tPcdrLot_Col", l_DftId, "div");
					l_Col.Wse_PcdrLot.c_Cfg = a_Cfg;				// 记录配置
					l_Col.Wse_PcdrLot.c_GridTot = l_GridTot;		// 栅格总数
					l_Col.Wse_PcdrLot.c_CssDim = {};				// CSS尺寸
					l_Col.Wse_PcdrLot.c_RowHgts = [];				// 行高数组
					l_Col.Wse_PcdrLot.c_PutAry = [];				// 放置数组
					l_Boa.Wse_PcdrLot.c_ColAry.push(l_Col);			// 保存起来
					return this;
				}
				,
				/// 放
				/// a_Cfg：Object，配置对象
				///	{
				///	c_Id：String，HTML元素ID，必须有效
				/// c_GridIdx：Number，栅格索引，默认当前行的右前沿，覆盖c_HrztAln
				/// c_GridOfst：Number，栅格偏移，将被加到c_GridIdx上
				/// c_GridCnt：Number，栅格条数，默认所属列的c_GridTot
				/// c_HrztAln：Number，水平对齐∈{ -1=左, 0=中, +1=右 }
				/// c_Cssc：String，CSS类，切换断点时将被移除
				/// c_fTgtArea：var f(tSara a_Rst, a_Bol, a_Col)，计算目标区，默认undefined，覆盖c_FxdAr
				/// c_FxdAr：Number，固定宽高比，默认undefined
				/// c_NewRow：Boolean，新起一行，默认undefined（false）
				/// c_VticCmpc：Boolean，垂直紧凑，默认undefined（false），覆盖c_VticAln和c_VticOfst
				/// c_VticAln：Number，垂直对齐百分比∈[0, 100]，默认0
				/// c_VticOfst：Number，垂直偏移百分比∈[0, 100]，默认0
				/// c_fAftRtn：void f(a_Put)，归还给来源后，此时a_Put在来源里
				///	}
				cPut : function (a_Cfg)
				{
					// 取得板和列
					var l_Boa = fAcsBoa(this);
					var l_Col = fAcsCol(this);
					nWse.fAst(l_Boa && l_Col, "cPut()只能在cCol()之后调用！");

					// 检查并修正配置
					if (! a_Cfg.c_Id)
					{ throw new Error("c_Id必需有效！"); }

					// 获取元素，若已有则忽略这次调用
					if (stAryUtil.cFind(this.e_AllPuts,
						function (a_All, a_PutIdx, a_Put) { return (a_Put.id == a_Cfg.c_Id); }) >= 0)
					{ return this; }

					var l_Put = fObtnPut(this, a_Cfg.c_Id);
					if (! l_Put)
					{ throw new Error("未能获取“id=" + a_Cfg.c_Id + "”的元素！"); }

					// 移除旧的CSS类
					//【注意】有必要这么做，因为元素未必会回到来源（如果回到，则在fRtnToSrc()里进行移除）
					var l_OldCssc = l_Put.Wse_PcdrLot.c_Cfg && l_Put.Wse_PcdrLot.c_Cfg.c_Cssc;
					if (l_OldCssc)
					{ stCssUtil.cRmvCssc(l_Put, l_OldCssc); }

					l_Put.Wse_PcdrLot.c_Cfg = a_Cfg;			// 记录配置
					if (! l_Put.Wse_PcdrLot.c_TgtArea) 			// 如果这是第一次
					{
						l_Put.Wse_PcdrLot.c_CssMgn = {};			// 外边距
						l_Put.Wse_PcdrLot.c_TgtArea = new tSara();	// 目标区域
					}

					l_Put.style.display = "block";				// 块级
					l_Put.style.position = "absolute";			// 绝对定位
					stCssUtil.cAddCssc(l_Put, "cnWse_tPcdrLot_Put");	// 默认的CSS类
					if (a_Cfg.c_Cssc)									// 添加定制的CSS类
					{ stCssUtil.cAddCssc(l_Put, a_Cfg.c_Cssc); }

					l_Col.Wse_PcdrLot.c_PutAry.push(l_Put);			// 保存起来
					this.e_AllPuts.push(l_Put);
					return this;
				}
				,
				/// 完毕，可以不调用（仅为改善代码易读性，无实际意义）
				cOver : function () { return this; }
				,
				/// 移除所有放
				/// a_Anmt：Boolean，动画？
				/// a_fCabk：void f(a_Lot)，当动画结束时的回调，若不动画则立即回调
				cRmvAllPuts : function (a_Anmt, a_fCabk)
				{
					if (this.e_PutTgt)
					{ fRmvAllPuts(this, a_Anmt, a_fCabk); }
					return this;
				}
				,
				/// 清理放置目标
				cClnPutTgt : function ()
				{
					if (this.e_PutTgt)
					{ fClnPutTgt(this); }
					return this;
				}
				,
				/// 存取默认特效
				cAcsDftEfc : function ()
				{
					if ((! this.e_DftEfc) && nUi.tEfc)
					{ this.e_DftEfc = new nUi.tEfc(null); }
					return this.e_DftEfc;
				}
				,
				/// 包含放置元素？
				cCtanPut : function (a_Elmt$Id)
				{
					a_Elmt$Id = nWse.fIsStr(a_Elmt$Id) ? document.getElementById(a_Elmt$Id) : a_Elmt$Id;
					return a_Elmt$Id ? (this.e_AllPuts.indexOf(a_Elmt$Id) >= 0) : false;
				}
				,
				/// 存取全部放置元素
				cAcsAllPuts : function () { return this.e_AllPuts; }
				,
				/// 获取所有放置元素，【警告】本函数使用“push”方法装入新元素，若不想累计则由调用者负责清零
				/// a_Rst：Object[]，若无效则新建，默认null
				/// 返回：a_Rst
				cGetAllPuts : function (a_Rst)
				{
					if (! a_Rst)
					{ a_Rst = []; }

					fForEachBoaColPut(this, null, null,
						function (a_This, a_Boa, a_Col, a_Put)
						{ if (a_Rst.indexOf(a_Put) < 0) { a_Rst.push(a_Put); } });	// 防止重复！
					return a_Rst;
				}
				,
				/// 按照渲染顺序排序全部放置元素，即先按z-index，后按位置
				/// 返回：a_AllPuts
				cSortAllPutsByRndOrd : function (a_AllPuts)
				{
					var l_This = this;
					a_AllPuts.sort(function (a_1, a_2)
					{
						var l_Z1 = stCssUtil.cGetZidx(a_1), l_Z2 = stCssUtil.cGetZidx(a_2);
						if (l_Z1 != l_Z2)
						{ return (l_Z1 - l_Z2); }
						var l_I1 = l_This.e_AllPuts.indexOf(a_1), l_I2 = l_This.e_AllPuts.indexOf(a_2);
						return (l_I1 - l_I2);
					});
					return a_AllPuts;
				}
				,
				/// 显示隐藏栅格用户界面
				cShowHideGridUi : function (a_Show)
				{
					function fHide(a_This)
					{
						var l_Dom_Div = document.getElementById("ok_ShowGrid");
						if (! l_Dom_Div)
						{ return this; }

						stDomUtil.cAcsBody().removeChild(l_Dom_Div);
						return this;
					}

					function fShow(a_This)
					{
						var l_Dom_Div = document.getElementById("ok_ShowGrid");
						if (l_Dom_Div)
						{ return this; }

						l_Dom_Div = document.createElement("div");
						l_Dom_Div.id = "ok_ShowGrid";

						var l_Dom_Input = document.createElement("input");
						l_Dom_Input.id = "ok_ShowGridChkBox";
						l_Dom_Input.type = "checkbox";
						l_Dom_Input.title = "控制栅格的显示";
						l_Dom_Input.onchange = function (a_Evt) { a_This.cShowHideGrid(a_Evt.target.checked); };
						l_Dom_Div.appendChild(l_Dom_Input);

						l_Dom_Div.appendChild(document.createTextNode("显示栅格"));
						stDomUtil.cAcsBody().appendChild(l_Dom_Div);
					}

					a_Show ? fShow(this) : fHide(this);
					return this;
				}
				,
				/// 显示隐藏栅格
				cShowHideGrid : function (a_Show)
				{
					// 更新显示？
					if (this.e_ShowGrid == a_Show)
					{
						if (a_Show)
						{ fShowHideGrid(this, a_Show); }
						return this;
					}

					// 如果需要，生成函数
					if (a_Show && (! this.e_fOnWndScrl))
					{
						this.e_fOnWndScrl = stFctnUtil.cBindThis(this,
							function() // 当滚动时
							{
								if (this.e_ShowGrid)
								{ fShowHideGrid(this, true); }
							});
					}

					// 滚动修正，1秒更新10次足够了
					if (this.e_fOnWndScrl)
					{
						a_Show
							? stDomUtil.cAddEvtHdlr_WndScrl(this.e_fOnWndScrl, 0.1)
							: stDomUtil.cRmvEvtHdlr_WndScrl(this.e_fOnWndScrl);
					}

					// 更新状态并显隐
					this.e_ShowGrid = a_Show;
					fShowHideGrid(this, a_Show);
					return this;
				}
			}
			,
			{
				/// 存取放置元素的目标区域，必须在"WidDtmnd"事件里或cRun/cRfl之后调用，不要修改！
				scAcsTgtAreaOfPut : function (a_Put) { return a_Put.Wse_PcdrLot && a_Put.Wse_PcdrLot.c_TgtArea; }
				,
				/// 存取放置元素的CSS外边距，必须在"WidDtmnd"事件里或cRun/cRfl之后调用，不要修改！
				scAcsCssMgnOfPut : function (a_Put) { return a_Put.Wse_PcdrLot && a_Put.Wse_PcdrLot.c_CssMgn; }
				,
				/// 获取放置元素的行索引
				scGetPutRowIdx : function (a_Put) { return a_Put.Wse_PcdrLot ? a_Put.Wse_PcdrLot.c_RowIdx : -1; }
				,
				/// 获取板内容宽度
				scGetBoaCtntWid : function (a_Boa) { return a_Boa.Wse_PcdrLot ? a_Boa.Wse_PcdrLot.c_CtntW : 0; }
				,
				/// 获取列内容宽度
				scGetColCtntWid : function (a_Col) { return a_Col.Wse_PcdrLot ? a_Col.Wse_PcdrLot.c_CtntW : 0; }
				,
				/// 触发放置事件 - 宽度已决定
				scTrgrPutEvt_WidDtmnd : function (a_Put)
				{
					if (! a_Put)
					{ return tPcdrLot; }

					var l_TgtArea = a_Put.Wse_PcdrLot && a_Put.Wse_PcdrLot.c_TgtArea;
					var l_CssMgn = a_Put.Wse_PcdrLot && a_Put.Wse_PcdrLot.c_CssMgn;
					s_EvtAgms_WidDtmnd[0] = a_Put;
					s_EvtAgms_WidDtmnd[1] = l_TgtArea ? l_TgtArea.c_W : 0;
					s_EvtAgms_WidDtmnd[2] = (l_TgtArea && l_CssMgn) ? (l_TgtArea.c_W - l_CssMgn.c_MgnLt - l_CssMgn.c_MgnRt) : 0;
					nUi.fTrgrPutEvt(a_Put, "WidDtmnd", s_EvtAgms_WidDtmnd);
					return tPcdrLot;
				}
			}
			,
			false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////