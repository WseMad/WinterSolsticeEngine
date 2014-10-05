/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.stFrmwk)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi",
		[
			"Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Frmwk.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;

	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;
	var tPntIptKind = tPntIpt.tKind;
	var tPntIptTch = tPntIpt.tTch;

	var nUi = nWse.nUi;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 框架

	var stFrmwk;
	(function ()
	{
		/// 框架
		stFrmwk = function () { };
		nUi.stFrmwk = stFrmwk;
		stFrmwk.oc_nHost = nUi;
		stFrmwk.oc_FullName = nUi.ocBldFullName("stFrmwk");

		/// 构建全名
		stFrmwk.ocBldFullName = function (a_Name)
		{
			return stFrmwk.oc_FullName + "." + a_Name;
		};

		//======== 私有字段

		var e_PntIptTrkr = null;	// 点输入追踪器
		var e_Lot = null;			// 布局
		var e_DurLot = false;		// 在布局期间？
		var e_WgtSet = null;		// 控件集合
		var e_Focs = [];			// 焦点数组
		var e_EvtSys = {};			// 事件系统

		//======== 私有函数

		// 初始化
		function eInit()
		{
			e_PntIptTrkr = new tPntIptTrkr();
			e_PntIptTrkr.cInit(true);
			e_PntIptTrkr.cSetImdtHdlr(fIptHdlr);

			// 响应窗口尺寸变化
			stDomUtil.cAddEvtHdlr_WndRsz(
				function ()
				{
					// 触发事件
					var l_Hdlrs = e_EvtSys["WndRszBefLot"];
					if (l_Hdlrs)
					{ l_Hdlrs.cFor(); }

					// 运行布局
					stFrmwk.cRunLot();

					// 触发事件
					l_Hdlrs = e_EvtSys["WndRszAftLot"];
					if (l_Hdlrs)
					{ l_Hdlrs.cFor(); }
				}, 0.1);	// 1秒更新10次足够了
		}
		eInit();

		function eObtnWgtByEvtTgt(a_EvtTgt)
		{
			var l_DomSA = stDomUtil.cSrchSelfAndAcst(a_EvtTgt,
				function (a_DomSA) { return a_DomSA.Wse_Wgt && a_DomSA.Wse_Wgt.c_Wgt; });
			return (l_DomSA && l_DomSA.Wse_Wgt) ? l_DomSA.Wse_Wgt.c_Wgt : null;
		}

		function fAddFoc(a_Foc)
		{
			if ((! a_Foc) || (e_Focs.indexOf(a_Foc) >= 0))
			{ return; }

			// 首先插入至适当位置
			e_Focs.push(a_Foc);

			// 然后通知
			a_Foc.vcGainFoc();
		}

		function fRmvFoc(a_Foc)
		{
			var l_Idx = a_Foc ? e_Focs.indexOf(a_Foc) : -1;
			if (l_Idx < 0)
			{ return; }

			// 首先通知
			a_Foc.vcLoseFoc();

			// 然后擦除
			e_Focs.splice(l_Idx, 1);
		}

		function fClrFocs()
		{
			// 首先通知
			stAryUtil.cFor(e_Focs, function (a_Ary, a_Idx, a_Foc) { a_Foc.vcLoseFoc(); });

			// 然后清空
			e_Focs.length = 0;
		}

		function fAddFocs(a_Foc$Focs)
		{
			// 只一个？
			if (! nWse.fIsAry(a_Foc$Focs))
			{ return fAddFoc(a_Foc$Focs); }

			// 逐个添加
			stAryUtil.cFor(a_Foc$Focs, function (a_Ary, a_Idx, a_Foc) { fAddFoc(a_Foc); });
		}

		function fRmvFocs(a_Foc$Focs)
		{
			// 只一个？
			if (! nWse.fIsAry(a_Foc$Focs))
			{ return fRmvFoc(a_Foc$Focs); }

			// 逐个添加
			stAryUtil.cFor(a_Foc$Focs, function (a_Ary, a_Idx, a_Foc) { fRmvFoc(a_Foc); });
		}

		function fSetFocs(a_Foc$Focs)
		{
			// 清空、添加
			fClrFocs();
			fAddFocs(a_Foc$Focs);
		}

		function fIsFoc(a_Wgt)
		{
			return a_Wgt && (e_Focs.indexOf(a_Wgt) >= 0);
		}

		stFrmwk.eRmvFoc = function (a_Ipt, a_Wgt)
		{
			stAryUtil.cFor(a_Ipt.c_Tchs,
			function (a_Ary, a_Idx, a_Tch)
			{
				if (a_Tch.c_FocWgt === a_Wgt)
				{ a_Tch.c_FocWgt = null; }
			});
		};

		function fIptHdlr(a_Ipt)
		{
//			nWse.stAryUtil.cFor(a_Ipt.c_Tchs,
//			function (a_TchAry, a_TchIdx, a_Tch)
//			{
//				console.log(a_Tch.c_Kind.toString());
////				console.log("TchX, TchY, TchOfstX, TchOfstY = " + a_Tch.c_X + ", " + a_Tch.c_Y + ", " + a_Tch.c_OfstX + ", " + a_Tch.c_OfstY)
//			});

			/////////////////////////////////////

			// 记录拾取到的控件
			a_Ipt.cForTchs(function (a_Tchs, a_Idx, a_Tch)
			{
				var l_EvtTgt = a_Tch.cAcsEvtTgt();
				if (! l_EvtTgt)
				{
					a_Tch.c_PkdWgt = null;
					return;
				}

				var l_Wgt = eObtnWgtByEvtTgt(l_EvtTgt);
//				if ("CANVAS" == l_EvtTgt.tagName)
//				{
//				//	console.log("picked <canvas>!!!");
//					l_Wgt = null;
//				}

				a_Tch.c_PkdWgt = l_Wgt;
			});

			//【注意】下面的算法即使在没有焦点的情况下也能正确处理！

			// 确保每个焦点处理且仅处理一次
			// 注意在处理期间焦点可能发生变化，如增加新的焦点，
			// 为使新加入的焦点也有机会处理输入，使用迭代式算法
			var l_IterLmt = 32, l_IterCnt = 0;	// 为了安全，对迭代次数施加一个硬限制
			var l_HdldWgts = [];				// 已处理过的控件记录在这里
			var l_Loop;							// 循环标志
			var i, l_Len, l_Foc, l_Focs = e_Focs;
			do
			{
				l_Loop = false;					// 清除循环标志
				l_Len = l_Focs.length;			// 重设长度，可能会变
				for (i=0; i<l_Len; ++i)
				{
					// 跳过已处理过的控件
					l_Foc = l_Focs[i];
					if (l_HdldWgts.indexOf(l_Foc) >= 0)
					{ continue; }

					l_Loop = true;				// 发现一个尚未处理过的控件，设置循环标志，因为接下来的处理可能引入新的焦点
					l_Foc.vcHdlIpt(a_Ipt);
					l_HdldWgts.push(l_Foc);
					break;						// 重新开始内循环
				}

				// 如果这次迭代没有发现尚未处理过的控件，但仍有未处理的触点，自身处理
				if ((! l_Loop) && a_Ipt.cHasUhdlTch())
				{
					l_Loop = eSelfHdlIpt(a_Ipt);	// 返回值指示是否继续迭代！
				}

				++ l_IterCnt;
			} while (l_Loop && (l_IterCnt < l_IterLmt));

			if (l_IterCnt >= l_IterLmt)
			{ console.log("nUi.stFrmwk.fIptHdlr：迭代法被强制终结"); }
		}

		function eSelfHdlIpt(a_Ipt)
		{
			var l_This = this;
			var l_FocsAded = false;		// 添加新焦点？

			// 对于尚未处理的i_TchBgn，把焦点传给属于自己的、但还不是焦点的、拾取到的控件
			a_Ipt.cForTchsByKind(tPntIptKind.i_TchBgn, true,	// 跳过已处理的触点
				function (a_Tchs, a_Idx, a_Tch)
				{
					// 注意第二个比较对于正确设置l_FocsAded至关重要！
					// 因当a_Tch.c_PkdWgt已是焦点时，cAddFocs调用没有效果（相当于没增加新的），此时不应设置标志
					if (//(a_Tch.c_PkdPnl === l_This) && 	//【nPick】
						a_Tch.c_PkdWgt &&					//【nUi】
						(! fIsFoc(a_Tch.c_PkdWgt)))
					{
						fAddFoc(a_Tch.c_PkdWgt);
						l_FocsAded = true;
						//	console.log(a_Tch.c_PkdWgt.e_Name);
					}
				});

			// 如果没有添加新焦点，结束循环，否则继续处理，以给新焦点处理输入的机会
			return l_FocsAded;
		}

		// 运行或重排布局
		function eRunOrRflLot(a_Rfl)
		{
			// 设置标志
			e_DurLot = true;

			// 刷新在布局之前
			if (e_WgtSet)
			{ e_WgtSet.cRfshBefLot(); }

			// 布局运行或重排
			if (e_Lot)
			{ a_Rfl ? e_Lot.cRfl() : e_Lot.cRun(); }

			// 刷新在布局之后
			if (e_WgtSet)
			{ e_WgtSet.cRfshAftLot(); }

			// 清除标志
			e_DurLot = false;
		}

		//======== 公有函数

		/// 输入复位
		stFrmwk.cIptRset = function ()
		{
			// 所有焦点输入复位
			stAryUtil.cFor(e_Focs, function (a_Ary, a_Idx, a_Foc) { a_Foc.vcIptRset(); });
			return stFrmwk;
		};

		/// 存取布局
		stFrmwk.cAcsLot = function ()
		{
			return e_Lot;
		};

		/// 设置布局
		/// a_Lot：itLot，布局接口
		stFrmwk.cSetLot = function (a_Lot)
		{
			e_Lot = a_Lot || null;
			return stFrmwk;
		};

		/// 是否在布局期间？
		stFrmwk.cIsDurLot = function ()
		{
			return e_DurLot;
		};

		/// 运行布局
		stFrmwk.cRunLot = function ()
		{
			eRunOrRflLot(false);
			return stFrmwk;
		};

		/// 重排布局
		stFrmwk.cRflLot = function ()
		{
			eRunOrRflLot(true);
			return stFrmwk;
		};

		/// 存取控件集合
		stFrmwk.cAcsWgtSet = function ()
		{
			return e_WgtSet;
		};

		/// 设置控件集合
		stFrmwk.cSetWgtSet = function (a_WgtSet)
		{
			fClrFocs();		// 清空焦点

			e_WgtSet = a_WgtSet || null;
			return stFrmwk;
		};

		/// 清空焦点
		stFrmwk.cClrFocs = function ()
		{
			fClrFocs();
			return stFrmwk;
		};

		/// 添加焦点
		/// a_Foc$Focs：tWgt$tWgt[]，焦点
		stFrmwk.cAddFocs = function (a_Foc$Focs)
		{
			if (a_Foc$Focs)
			{ fAddFocs(a_Foc$Focs); }
			return stFrmwk;
		};

		/// 移除焦点
		/// a_Foc$Focs：tWgt$tWgt[]，焦点
		stFrmwk.cRmvFocs = function (a_Foc$Focs)
		{
			if (a_Foc$Focs)
			{ fRmvFocs(a_Foc$Focs); }

		//	console.log("stFrmwk.cRmvFocs");
			return stFrmwk;
		};

		/// 存取放置元素的目标区域，必须在cRfshAftLot里调用，不要修改！
		stFrmwk.cAcsPutTgtArea = function (a_Put)
		{
			if (! e_Lot)
			{ return null; }

			var l_scAcsPutTgtArea = e_Lot.constructor.scAcsPutTgtArea || null;
			return l_scAcsPutTgtArea && l_scAcsPutTgtArea(a_Put);
		};

		/// 注册事件处理器
		/// a_EvtName：String，∈{ "" }
		stFrmwk.cRegEvtHdlr = function (a_EvtName, a_fHdlr)
		{
			if (! e_EvtSys[a_EvtName])
			{ e_EvtSys[a_EvtName] = new nWse.tEvtHdlrAry(); }

			if (e_EvtSys[a_EvtName].cFind(a_fHdlr) < 0)
			{ e_EvtSys[a_EvtName].cReg(a_fHdlr); }
			return stFrmwk;
		};

		/// 注销事件处理器
		stFrmwk.cUrgEvtHdlr = function (a_EvtName, a_fHdlr)
		{
			if ((! e_EvtSys[a_EvtName]) || (e_EvtSys[a_EvtName].cFind(a_fHdlr) < 0))
			{ return stFrmwk; }

			e_EvtSys[a_EvtName].cUrg(a_fHdlr);
			return stFrmwk;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////