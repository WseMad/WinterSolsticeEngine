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
	var tSara = nWse.tSara;

	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;
	var tPntIptKind = tPntIpt.tKind;
	var tPntIptTch = tPntIpt.tTch;

	var nUi = nWse.nUi;

	var nGpu, t2dCtxt, tPath;

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
		var e_GlbWgtSet = null;		// 全局控件集
		var e_StaWgtSet = null;		// 状态控价集
		var e_Focs = [];			// 焦点数组
		var e_EvtSys = {};			// 事件系统

		var e_EnabPick = false;		// 启用拾取？
		var e_PickFrqc = 0.2;		// 拾取频率：默认每秒5次
		var e_PickTmrId = null;		// 计时器ID
		var e_CltSara = null;		// 客户区
		var e_PickCvs = null;		// 拾取画布
		var e_PickCtxt = null;		// 拾取上下文
		var e_PickAllPuts = null;	// 全部放置元素
		var e_Picker = null;		// 拾取器
		var e_RcRectRds = null;		// 圆角矩形半径
		var e_ElmtBbox = null;		// 元素包围盒
		function ePickTmrRset()		// 拾取计时复位
		{
			e_PickTmrId = null;		// 复位
		}

		// 临时变量
		var e_Temp_CssUtilRst = null;
		var e_Temp_TgtArea = null;

		//======== 私有函数

		// 初始化
		function eInit()
		{
			e_PntIptTrkr = new tPntIptTrkr();
			e_PntIptTrkr.cInit(true);
			e_PntIptTrkr.cSetImdtHdlr(fIptHdlr);

			// —— 窗口事件 ——

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

			// 响应窗口滚动
			stDomUtil.cAddEvtHdlr_WndScrl(
				function ()
				{
					// 触发事件
					var l_Hdlrs = e_EvtSys["WndScrl"];
					if (l_Hdlrs)
					{ l_Hdlrs.cFor(); }
				}, 0.1);	// 1秒更新10次足够了
		}
		eInit();

		function eObtnWgtByDomElmt(a_DomElmt)
		{
			var l_DomSA = stDomUtil.cSrchSelfAndAcst(a_DomElmt,
				function (a_DomSA) { return a_DomSA.Wse_Wgt && a_DomSA.Wse_Wgt.c_Wgt; });
			return (l_DomSA && l_DomSA.Wse_Wgt) ? l_DomSA.Wse_Wgt.c_Wgt : null;
		}

		// 得到顶层控件，因为a_Foc可能是某个子控件
		function fObtnTopWgt(a_Wgt)
		{
			return a_Wgt;
		//	return nUi.tWgt.scObtnTopWgtByPutTgt(a_Wgt);	//【不要用这个，影响输入处理】
		}

		function fAddFoc(a_Foc)
		{
			if ((! a_Foc) || (e_Focs.indexOf(a_Foc) >= 0))
			{ return; }

			// 首先插入至适当位置
			e_Focs.push(a_Foc);

			// 然后通知，注意控件的选择
			(a_Foc).vcGainFoc();
		}

		function fRmvFoc(a_Foc)
		{
			var l_Idx = a_Foc ? e_Focs.indexOf(a_Foc) : -1;
			if (l_Idx < 0)
			{ return; }

			// 首先通知，注意控件的选择
			(a_Foc).vcLoseFoc();

			// 然后擦除
			e_Focs.splice(l_Idx, 1);
		}

		function fClrFocs()
		{
			// 首先通知，注意控件的选择
			stAryUtil.cFor(e_Focs, function (a_Ary, a_Idx, a_Foc) { (a_Foc).vcLoseFoc(); });

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

		// 初始化拾取系统
		function eInitPickSys()
		{
			// 客户区
			if (! e_CltSara)
			{
				e_CltSara = new tSara();
			}

			// 创建拾取画布，对齐页面客户区
			if (! e_PickCvs)
			{
				e_PickCvs = document.createElement("canvas");
				eUpdPickCvsDim();

				// 上下文
				if (! e_PickCtxt)
				{ e_PickCtxt = new t2dCtxt(); }

				e_PickCtxt.cBindCvs(e_PickCvs);
				e_PickCtxt.cSetDrawMthd(1);
			}

			// 拾取全部放置元素数组
			if (! e_PickAllPuts)
			{
				e_PickAllPuts = [];
			}

			// 拾取器
			if (! e_Picker)
			{
				e_Picker = {
					e_PendTchs : []
					,
					e_Bbox : new tSara()
					,
					e_Path : new tPath()
					,
					/// 路径点
					i_PathPnt : 0
					,
					/// 路径色
					i_PathClo : 1
					,
					/// 贴图色
					i_MapClo : 2
					,
					e_Mthd : 0
					,
					eSkipWgt : function (a_Put, a_Wgt)
					{
						var l_This = this;
						l_This.e_Path.cRset();						// 重置路径

						// 计算包围盒
						tSara.scCrt$DomBcr(l_This.e_Bbox, a_Put);	// 默认是放置目标的包围盒
						a_Wgt.vcPick(l_This.e_Bbox, null);			// 回调以允许覆盖

						// 若不包含任何一个待定触点，跳过
						return (stAryUtil.cFind(l_This.e_PendTchs,
							function (a_Tchs, a_TchIdx, a_Tch)
							{ return tSara.scCtan$Xy(l_This.e_Bbox, a_Tch.c_X, a_Tch.c_Y); }) < 0);
					}
					,
					/// 存取包围盒
					cAcsBbox : function () { return this.e_Bbox; }
					,
					/// 存取上下文
					cAcs2dCtxt : function () { return e_PickCtxt; }
					,
					/// 存取路径
					cAcs2dPath : function () { return this.e_Path; }
					,
					/// 拾取开始
					/// a_Wgt：tWgt，要拾取的控件
					/// a_Mthd：方法∈a_Picker.{ i_PathPnt（默认）, i_PathClo, i_MapClo }
					cPickBgn: function (a_Wgt, a_Mthd)
					{
						if (this.cIsOver()) // 已结束？
						{ return this; }

						// 记录方法
						this.e_Mthd = a_Mthd || this.i_PathPnt;

						// 对于颜色拾取，清空画布
						if (this.i_PathPnt != this.e_Mthd)
						{ e_PickCtxt.cClr(); }

						return this;
					}
					,
					/// 拾取结束
					/// a_Wgt：tWgt，要拾取的控件
					/// a_EvtTgt：Node，事件目标，默认a_Wgt.cAcsPutTgt()
					cPickEnd: function (a_Wgt, a_EvtTgt)
					{
						if (this.cIsOver()) // 已结束？
						{ return this; }

						var l_This = this;
						var l_Mthd = l_This.e_Mthd;

						// 对每个待定触点
						var l_ImgData;
						var l_PendTchs = l_This.e_PendTchs, i, l_Tch, l_Pkd;
						for (i = 0; i<l_PendTchs.length; ++i)
						{
							l_Tch = l_PendTchs[i];
							if (l_This.i_PathPnt == l_Mthd) // 包含拾取
							{
								l_Pkd = (e_PickCtxt.cIsPntInPath(l_This.e_Path, l_Tch.c_X, l_Tch.c_Y));
							}
							else // 颜色拾取
							{
								// 回读颜色，如果像素的a分量≥128，就认为被拾取到！
								l_ImgData = e_PickCtxt.cAcs().getImageData(l_Tch.c_X, l_Tch.c_Y, 1, 1);
								l_Pkd = (l_ImgData.data[3] >= 128);
							}

							// 如果拾取到
							if (l_Pkd)
							{
								// 记录触点和事件目标，但是注意：
								// 若c_EvtTgt是c_Evt.target的祖先节点，则仍保持后者，为了更细粒度地拾取！
								l_Tch.c_PkdWgt = (a_Wgt);
							//	l_Tch.c_PkdWgt = fObtnTopWgt(a_Wgt);	//【不要用这个，影响输入处理】
								l_Tch.c_EvtTgt = a_EvtTgt || a_Wgt.cAcsPutTgt();
								if (stDomUtil.cIsAcst(l_Tch.c_EvtTgt, l_Tch.c_Evt.target))
								{
									l_Tch.c_EvtTgt = l_Tch.c_Evt.target;
								}

								// 从待定触点数组中移除
								l_PendTchs.splice(i, 1);
								-- i;
							}
						}
						return this;
					}
					,
					/// 完毕？
					cIsOver : function ()
					{
						return (0 == this.e_PendTchs.length);
					}
				};
			}
		}

		// 拾取
		function ePick(a_Ipt)
		{
			// 如果含有i_TchBgn或i_TchEnd，必须进行拾取，清除计时器
			if (a_Ipt.cHasTchBgnOrEnd())
			{
				if (e_PickTmrId)
				{
					clearTimeout(e_PickTmrId);
					e_PickTmrId = null;
				}
			}
			else // 只有i_TchMove，时间到了时才拾取
			if (e_PickTmrId)
			{
				return;
			}

			// 如果需要，初始化拾取系统
			if (! e_PickCvs)
			{ eInitPickSys(); }
			else // 更新拾取画布尺寸
			{ eUpdPickCvsDim(); }

			// 计算客户区
			e_CltSara.cCrt$Wh(e_PickCvs.width, e_PickCvs.height);

			// 记录待定触点
			stAryUtil.cShlwAsn(e_Picker.e_PendTchs, a_Ipt.c_Tchs);

			// 首先取得所有放置元素，然后装入全局控件的放置目标，最后按渲染先后顺序排序
			e_PickAllPuts.length = 0;	// 清空
			e_Lot.cGetAllPuts(e_PickAllPuts);
			stAryUtil.cFor(e_GlbWgtSet.cAcsWgts(), function (a_Wgts, a_Idx, a_Wgt) { e_PickAllPuts.push(a_Wgt.cAcsPutTgt()); });
			e_Lot.cSortAllPutsByRndOrd(e_PickAllPuts);

			try
			{
				// 设置裁剪区为所有触点
				e_PickCtxt.cAcs().save();			// 保存
				e_PickCtxt.cAcs().beginPath();
				stAryUtil.cFor(a_Ipt.c_Tchs,
					function (a_Tchs, a_TchIdx, a_Tch)
					{ e_PickCtxt.cAcs().rect(a_Tch.c_X, a_Tch.c_Y, 1, 1); });
				e_PickCtxt.cAcs().clip();

				// 设置拾取色，由于是一个一个拾取，所以只要不透明就可以
				e_PickCtxt.cAcs().fillStyle = "rgba(255, 255, 255, 1)";
				e_PickCtxt.cAcs().strokeStyle = e_PickCtxt.cAcs().fillStyle;

				// 拾取控件
				ePickWgts();
			}
			finally
			{
				e_PickCtxt.cAcs().restore();		// 还原
			}

			// 设置计时
			e_PickTmrId = setTimeout(ePickTmrRset, e_PickFrqc * 1000);
		}

		function ePickWgts()
		{
			// 反序遍历，即最后渲染的最先拾取
			var i, l_Len = e_PickAllPuts.length, l_Put, l_Wgt;
			for (i = l_Len - 1; i>=0; --i)
			{
				// 根据放置目标取得所属控件
				l_Put = e_PickAllPuts[i];
				l_Wgt = eObtnWgtByDomElmt(l_Put);
				if ((! l_Wgt) || e_Picker.eSkipWgt(l_Put, l_Wgt))	// 跳过？
				{ continue; }

				// 拾取控件
				l_Wgt.vcPick(null, e_Picker);

				// 如果已经全部拾取完，立即跳出
				if (e_Picker.cIsOver())
				{ break; }
			}

			// 如果还有待定触点，说明他们什么都没拾取到
			if (! e_Picker.cIsOver())
			{
				stAryUtil.cFor(e_Picker.e_PendTchs,
					function (a_Tchs, a_TchIdx, a_Tch)
					{
						a_Tch.c_PkdWgt = null;						// 未拾取到控件
						a_Tch.c_EvtTgt = stDomUtil.cAcsBody();		// 由<body>触发
					});
				e_Picker.e_PendTchs.length = 0;	// 清空
			}
		}

		// 更新拾取画布尺寸
		function eUpdPickCvsDim()
		{
			if (! e_PickCvs)
			{ return; }

			if (e_PickCvs.width != window.innerWidth)
			{ e_PickCvs.width = window.innerWidth; }

			if (e_PickCvs.height != window.innerHeight)
			{ e_PickCvs.height = window.innerHeight; }
		}

		// 输入处理器
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
				// 如果浏览器报告没有点中任何HTML元素
				var l_EvtTgt = a_Tch.cAcsEvtTgt();
				if (! l_EvtTgt)
				{
					a_Tch.c_PkdWgt = null; // 清null，返回
					return;
				}

				// 点中了某个HTML元素，记录之
				var l_Wgt = eObtnWgtByDomElmt(l_EvtTgt);
				a_Tch.c_PkdWgt = (l_Wgt);
			//	a_Tch.c_PkdWgt = fObtnTopWgt(l_Wgt);	//【不要用这个，影响输入处理】

				// 如果拾取到某个控件且开启拾取，则进行像素拾取
				if (l_Wgt && e_EnabPick)
				{
					ePick(a_Ipt);
				}

			//	if (a_Tch.c_PkdWgt) { console.log("拾取到：" + a_Tch.c_PkdWgt.cAcsPutSrc().id); }
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

				//	console.log("stFrmwk Foc: " + l_Foc.cAcsPutSrc().id);

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
			if (e_GlbWgtSet)
			{ e_GlbWgtSet.cRfshBefLot(); }

			if (e_StaWgtSet)
			{ e_StaWgtSet.cRfshBefLot(); }

			// 布局运行或重排
			if (e_Lot)
			{ a_Rfl ? e_Lot.cRfl() : e_Lot.cRun(); }

			// 刷新在布局之后
			if (e_StaWgtSet)
			{ e_StaWgtSet.cRfshAftLot(); }

			if (e_GlbWgtSet)
			{ e_GlbWgtSet.cRfshAftLot(); }

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

		/// 存取全局控件集
		stFrmwk.cAcsGlbWgtSet = function ()
		{
			if (! e_GlbWgtSet)
			{ e_GlbWgtSet = new nUi.tWgtSet(); }

			return e_GlbWgtSet;
		};

		/// 存取状态控件集
		stFrmwk.cAcsStaWgtSet = function ()
		{
			return e_StaWgtSet;
		};

		/// 设置状态控件集
		stFrmwk.cSetStaWgtSet = function (a_WgtSet)
		{
			if (e_StaWgtSet === a_WgtSet)
			{ return stFrmwk; }

			// 清空焦点
			fClrFocs();

			// 设置
			e_StaWgtSet = a_WgtSet || null;
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

		/// 是焦点？
		/// a_OrAcst：Boolean，若为true则a_Wgt是焦点的祖先时也返回true，默认false
		stFrmwk.cIsFoc = function (a_Wgt, a_OrAcst)
		{
			if (! a_OrAcst)
			{
				return (e_Focs.indexOf(a_Wgt) >= 0);
			}

			return (stAryUtil.cFind(e_Focs,
			function (a_Focs, a_Idx, a_Foc)
			{
				return nUi.tWgt.scIsSelfOrAcst(a_Wgt, a_Foc);
			}) >= 0);
		};

		/// 存取放置元素的目标区域，必须在"WidDtmnd"事件里或vcRfshAftLot里调用，不要修改！
		/// a_Put：HTMLElement，放置元素，若不在布局里则使用offsetLTWH
		/// a_NoMgn：Boolean，是否不含外边距，默认false，即包含了外边距
		stFrmwk.cAcsTgtAreaOfPut = function (a_Put, a_NoMgn)
		{
			if (! a_Put)
			{ return null; }

			// 如果没有布局或放置元素不在布局里，使用offsetLTWH
			if ((! e_Lot) || (! e_Lot.cCtanPut(a_Put)))
			{
				if (! e_Temp_CssUtilRst)
				{
					e_Temp_CssUtilRst = {};
					e_Temp_TgtArea = new tSara();
				}

				if (! a_NoMgn)
				{
					stCssUtil.cGetMgn(e_Temp_CssUtilRst, a_Put);
				}

				e_Temp_TgtArea.cCrt(
					a_Put.offsetLeft - (a_NoMgn ? 0 : e_Temp_CssUtilRst.c_MgnLt),
					a_Put.offsetTop - (a_NoMgn ? 0 : e_Temp_CssUtilRst.c_MgnUp),
					a_Put.offsetWidth + (a_NoMgn ? 0 : (e_Temp_CssUtilRst.c_MgnLt + e_Temp_CssUtilRst.c_MgnRt)),
					a_Put.offsetHeight + (a_NoMgn ? 0 : (e_Temp_CssUtilRst.c_MgnUp + e_Temp_CssUtilRst.c_MgnDn)));
				return e_Temp_TgtArea;
			}

			// 在布局里……
			var l_scAcs = e_Lot.constructor.scAcsTgtAreaOfPut || null;
			var l_Rst = l_scAcs && l_scAcs(a_Put);
			if (! l_Rst) // 若没有，使用父元素的全宽，而高度保持a_Put的
			{
				throw new Error("stFrmwk.cAcsTgtAreaOfPut：在布局里时，不应该没有！");

//				if (! e_Temp_CssUtilRst)
//				{
//					e_Temp_CssUtilRst = {};
//					e_Temp_TgtArea = new tSara();
//				}
//
//				stCssUtil.cGetCtntWid(e_Temp_CssUtilRst, a_Put.parentNode);
//				l_Rst = e_Temp_TgtArea.cCrt$Wh(e_Temp_CssUtilRst.c_CtntWid, a_Put.offsetHeight);
			}

			var l_Mgn = a_NoMgn && stFrmwk.cAcsCssMgnOfPut(a_Put);
			if (l_Mgn)
			{
				if (! e_Temp_CssUtilRst)
				{
					e_Temp_CssUtilRst = {};
					e_Temp_TgtArea = new tSara();
				}

				l_Rst = e_Temp_TgtArea.cCrt(
					l_Rst.c_X + l_Mgn.c_MgnLt,
					l_Rst.c_Y + l_Mgn.c_MgnUp,
					l_Rst.c_W - (l_Mgn.c_MgnLt + l_Mgn.c_MgnRt),
					l_Rst.c_H - (l_Mgn.c_MgnUp + l_Mgn.c_MgnDn)
				)
			}
			return l_Rst;
		};

		/// 存取放置元素的CSS外边距，必须在"WidDtmnd"事件里或cRfshAftLot里调用，不要修改！
		stFrmwk.cAcsCssMgnOfPut = function (a_Put)
		{
			if (! e_Lot)
			{ return null; }

			var l_scAcs = e_Lot.constructor.scAcsCssMgnOfPut || null;
			return l_scAcs && l_scAcs(a_Put);
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


		/// 拾取开启？
		stFrmwk.cIsPickEnab = function ()
		{
			return e_EnabPick;
		};

		/// 开启拾取，【注意】由调用者负责载入nGpu库的“2dPath.js”文件
		stFrmwk.cEnabPick = function ()
		{
			if ((! nWse.nGpu))
			{ throw new Error("nGpu库尚未载入，不能启用拾取！"); }

			if (! nGpu)	// 如果需要，初始化
			{
				nGpu = nWse.nGpu;
				t2dCtxt = nGpu && nGpu.t2dCtxt;
				tPath = t2dCtxt && t2dCtxt.tPath;
			}

			e_EnabPick = true;
			return stFrmwk;
		};

		/// 关闭拾取
		stFrmwk.cDsabPick = function ()
		{
			e_EnabPick = false;
			return stFrmwk;
		};

		/// 拾取频率，即两次拾取之间至少间隔多少秒，默认0.2（每秒5次）
		stFrmwk.cThePickFrqc = function (a_Frqc)
		{
			if (0 == arguments.length)
			{ return e_PickFrqc; }

			e_PickFrqc = a_Frqc;
			return stFrmwk;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////