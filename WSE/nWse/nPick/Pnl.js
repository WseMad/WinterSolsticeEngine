/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tPnl)
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
	console.log("Pnl.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stStrUtil = nWse.stStrUtil;
	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;

	var nPick = nWse.nPick;
	var unKnl = nPick.unKnl;
	var tInrName = nPick.tInrName;
	var tMsg = nPick.tMsg;
	var atPkup = nPick.atPkup;
	var tRelLyr = nPick.tRelLyr;
	var tRefFrm = nPick.tRefFrm;
	var tDockWay = nPick.tDockWay;
	var tPrmrSta = nPick.tPrmrSta;
//	var stFrmwk = nPick.stFrmwk;	// 尚未创建

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fVrfFoc(a_This, a_Foc)
	{
		if (a_This !== a_Foc.cAcsPnl())
		{
			throw new Error("控件“" + a_Foc.e_Name + "”不属于面板“" + a_This.e_Name +  "”，不能成为其焦点！");
		}
	}

	function fAddFoc(a_This, a_Foc)
	{
		if (fFindInFocs(a_This.e_Focs, a_Foc) >= 0)
		{
			return;
		}

		// 首先插入至适当位置
		var l_Idx = unKnl.fFindWgtIstIdx(a_This.e_Focs, a_Foc);
		a_This.e_Focs.splice(l_Idx, 0, a_Foc);

		// 然后通知
		fSendMsgOnAddFoc(a_This, a_Foc);
	}

	function fRmvFoc(a_This, a_Foc)
	{
		var l_Idx = fFindInFocs(a_This.e_Focs, a_Foc);
		if (l_Idx < 0)
		{
			return;
		}

		// 首先通知
		fSendMsgOnRmvFoc(a_This, l_Idx, false);

		// 然后擦除
		a_This.e_Focs.splice(l_Idx, 1);
	}

	function fClrFocs(a_This)
	{
		stAryUtil.cFor(a_This.e_Focs,
			function (a_Ary, a_Idx, a_Foc)
			{
				// 首先通知
				fSendMsgOnRmvFoc(a_This, a_Idx, true);
			});

		// 然后清空
		a_This.e_Focs.length = 0;
	}

	function fSetFocs(a_This, a_Foc$Focs)
	{
		// 清空焦点
		fClrFocs(a_This);

		// 只一个？
		if (a_Foc$Focs instanceof nPick.tWgt)
		{
			return fAddFoc(a_This, a_Foc$Focs);
		}

		// 逐个添加
		stAryUtil.cFor(a_Foc$Focs,
			function (a_Ary, a_Idx, a_Foc)
			{
				fAddFoc(a_This, a_Foc);
			});
	}

	function fSendMsgOnAddFoc(a_This, a_Foc)
	{
		// 对于所有先辈宿主，若在就需以下，进入半焦点
		var l_Msg = new tMsg(tMsg.tInrCode.i_ChgPrmrSta, null, a_This.e_Name);
		l_Msg.c_New = tPrmrSta.i_Semi;

		fTrvsAncs(a_Foc,
			function (a_Host)
			{
				if (a_Host.e_PrmrSta < l_Msg.c_New)
				{
					l_Msg.c_Rcvr = a_Host.e_Name;
					a_Host.vcHdlMsg(l_Msg);
				}
				return true;
			});

		// 对于焦点，进入焦点
		l_Msg.c_Rcvr = a_Foc.e_Name;
		l_Msg.c_New = tPrmrSta.i_Foc;
		a_Foc.vcHdlMsg(l_Msg);
	}

	function fSendMsgOnRmvFoc(a_This, a_Idx, a_Clr)
	{
		var l_Foc = a_This.e_Focs[a_Idx];

		// 对于焦点，退回等待
		var l_Msg = new tMsg(tMsg.tInrCode.i_ChgPrmrSta, l_Foc.e_Name, a_This.e_Name);
		l_Msg.c_New = tPrmrSta.i_Wait;
		l_Foc.vcHdlMsg(l_Msg);

		// 对于所有先辈宿主，当清空，或它既不是焦点、也不是其余某个焦点的宿主时，退回等待
		fTrvsAncs(l_Foc,
			function (a_Host)
			{
				if ((! a_Clr) &&
					(fIsFoc(a_This, a_Host) || fIsAncsOfFocs(a_Host, a_This.e_Focs, a_Idx)))
				{
					return true; // 继续
				}

				if (l_Msg.c_New != a_Host.e_PrmrSta) // 需要改变主状态？
				{
					l_Msg.c_Rcvr = a_Host.e_Name;
					a_Host.vcHdlMsg(l_Msg);
				}
				return true; // 继续
			});
	}

	function fTrvsAncs(a_Wgt, a_fCabk) // 返回true表示继续，false停止
	{
		var l_Host = a_Wgt.e_Host;
		while (! (l_Host instanceof nPick.tPnl))	// 根的宿主是面板
		{
			if (! a_fCabk(l_Host))
			{
				return;
			}
			l_Host = l_Host.e_Host;
		}
	}

	function fIsFoc(a_This, a_Wgt)
	{
		return (fFindInFocs(a_This.e_Focs, a_Wgt) >= 0);
	}

	function fIsAncsOfFocs(a_Host, a_Focs, a_ExcIdx)
	{
		var l_Rst = false;
		stAryUtil.cFind(a_Focs, function (a_Ary, a_Idx, a_Foc) { l_Rst = (a_Idx != a_ExcIdx) && a_Host.cIsAncs(a_Foc); });
		return l_Rst;
	}

	function fFindInFocs(a_Focs, a_Wgt)
	{
		return a_Focs.indexOf(a_Wgt);
	}

	function fFindByNameInFocs(a_Focs, a_Name)
	{
		return stAryUtil.cFind(a_Focs, function (a_Ary, a_Idx, a_Foc) { return a_Foc.e_Name == a_Name; });
	}

	function fAcsHostCanBeFoc(a_This, a_Wgt)
	{
		var l_Host = a_Wgt.e_Host;
		while ((! l_Host.cIsRoot()) && (l_Host.e_PrmrSta < tPrmrSta.i_Wait)) // 非根，且主状态＜等待，继续上溯
		{ l_Host = l_Host.e_Host; }
		return l_Host;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 面板

	var tPnl;
	(function ()
	{
		tPnl = nWse.fClass(nPick,
			/// 面板
			/// a_Name：String，名称
			function tPnl(a_Name)
			{
				this.odBase(tPnl).odCall(a_Name);

				//---- 定义字段

				this.e_Root = null;		// 根
				this.e_Focs = [];		// 焦点数组
			}
			,
			atPkup
			,
			{
				/// 处理消息
				/// a_Msg：tMsg
				vcHdlMsg : function (a_Msg)
				{
					var l_NtfRoot = false, l_NtfFocs = false;
					var l_RootFoc = false, l_ClrFocs = false;

					var i_Code = tMsg.tInrCode;
					switch (a_Msg.c_Code)
					{
						//case i_Code.i_OnRbndMainCvs:	// 原因详见stFrmwk里的eSendMsg_OnRbndMainCvs()
						//	{
						//		l_NtfRoot = true;
						//	} break;

						case i_Code.i_PrprOver:
						{
							// 如果是根发来的，转发框架
							if (this.e_Root === a_Msg.c_Who)
							{
								a_Msg.c_Rcvr = tInrName.i_Frmwk;
								a_Msg.c_Sndr = this.e_Name;
								a_Msg.c_Who = this;		// 自身
								nPick.stFrmwk.cHdlMsg(a_Msg);
							}
							else // 还会有谁？
							{
								throw new Error("意外收到i_PrprOver，c_Rcvr = " + a_Msg.c_Rcvr + "，c_Sndr = " + a_Msg.c_Sndr);
							}
						} break;

						case i_Code.i_Ent:
						case i_Code.i_Rsm:
						{
							l_NtfRoot = true;
							l_RootFoc = true;		// 根成为焦点
						} break;

						case i_Code.i_PrprLea:
						case i_Code.i_Lea:
						{
							l_NtfRoot = true;
							l_ClrFocs = true;		// 清空焦点
						} break;
					}

					// 如果需要，清空焦点
					// 注意这应在通知根前进行！
					if (l_ClrFocs)
					{
						this.cClrFocs();
					}

					// 如果需要，通知根
					if (l_NtfRoot && this.e_Root)
					{
						a_Msg.c_Rcvr = this.e_Root.e_Name;
						this.e_Root.vcHdlMsg(a_Msg);
					}

					// 如果需要，根成为焦点
					// 注意这应在通知根后进行！
					if (l_RootFoc)
					{
						this.cSetFocs(this.e_Root);
					}
				}
				,
				/// 输入复位
				vcIptRset : function ()
				{
					// 所有焦点输入复位
					stAryUtil.cFor(this.e_Focs,
						function (a_Ary, a_Idx, a_Foc)
						{
							a_Foc.vcIptRset();
						});
				}
				,
				/// 处理输入
				/// a_Ipt：tPntIpt
				vcHdlIpt : function (a_Ipt)
				{
					//【注意】下面的算法即使在没有焦点的情况下也能正确处理！

					// 确保每个焦点处理且仅处理一次
					// 注意在处理期间焦点可能发生变化，如增加新的焦点，
					// 为使新加入的焦点也有机会处理输入，使用迭代式算法
					var l_IterLmt = 32, l_IterCnt = 0;	// 为了安全，对迭代次数施加一个硬限制
					var l_HdldWgts = [];				// 已处理过的控件记录在这里
					var l_Loop;							// 循环标志
					var i, l_Len, l_Foc, l_Focs = this.e_Focs;
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
							l_Loop = this.dSelfHdlIpt(a_Ipt);	// 返回值指示是否继续迭代！
						}

						++ l_IterCnt;
					} while (l_Loop && (l_IterCnt < l_IterLmt));

					if (l_IterCnt >= l_IterLmt)
					{ console.log("tPnl.vcHdlIpt：迭代法被强制终结"); }
				}
				,
				/// 自身处理输入
				/// 返回：Boolean，true=继续处理输入，false=停止处理输入
				dSelfHdlIpt : function (a_Ipt)
				{
					var l_This = this;
					var l_FocsAded = false;		// 添加新焦点？

					// 对于尚未处理的i_TchBgn，把焦点传给属于自己的、但还不是焦点的、拾取到的控件
					a_Ipt.cForTchsByKind(tPntIpt.tKind.i_TchBgn, true,	// 跳过已处理的触点
						function (a_Tchs, a_Idx, a_Tch)
						{
							// 注意第二个比较对于正确设置l_FocsAded至关重要！
							// 因当a_Tch.c_PkdWgt已是焦点时，cAddFocs调用没有效果（相当于没增加新的），此时不应设置标志
							if ((a_Tch.c_PkdPnl === l_This) && (! fIsFoc(l_This, a_Tch.c_PkdWgt)))
							{
								l_This.cAddFocs(a_Tch.c_PkdWgt);
								l_FocsAded = true;
								//	console.log(a_Tch.c_PkdWgt.e_Name);
							}
						});

					// 如果没有添加新焦点，结束循环，否则继续处理，以给新焦点处理输入的机会
					return l_FocsAded;
				}
				,
				/// 渲染
				vcRnd : function ()
				{
					// 渲染控件树
					if (this.e_Root)
					{
						this.e_Root.vcRnd();
					}

					////#if 追踪栈顶面板的焦点控件
					//var l_This = this;
					//(function ()
					//{
					//	if (! nPick.stFrmwk.cIsPnlAtStkTop(l_This.e_Name))
					//		return;
					//
					//	var l_WgtsTot = l_This.cAcsRoot().cGetSubWgtsTot(true);
					//
					//	var stGpuDvc = nPick.stFrmwk.cAcsGpuDvc();
					//	var stGpuPrt = stGpuDvc.cAcsGpuPrt();
					//	stGpuDvc.cCfgDrawStl(tClo.i_Magenta);
					//	stGpuPrt.cUseFont();
					//	var l_PrtDstSara = tSara.scCopy(nPick.stFrmwk.cAcsPrstTgtArea());
					//	l_PrtDstSara.c_H -= 2;
					//	if (l_This.e_Focs.length > 0)
					//	{
					//		var l_FocNames = [];
					//		stAryUtil.cFor(l_This.e_Focs,
					//			function (a_Ary, a_Idx, a_Foc) { l_FocNames.push(a_Foc.e_Name); });
					//
					//		//	stGpuPrt.cFillTextLine_CvsCs(l_FocNames.toString(), 0, -4, "C", "D");
					//
					//		stGpuPrt.cDrawTextLine_GuiCs(l_FocNames.toString() + ", " + l_WgtsTot, null, l_PrtDstSara, 7);
					//	}
					//	else
					//	{
					//		//	stGpuPrt.cFillTextLine_CvsCs("无焦点", 0, -4, "C", "D");
					//		stGpuPrt.cDrawTextLine_GuiCs("无焦点" + ", " + l_WgtsTot, null, l_PrtDstSara, 7);
					//	}
					//})();//#endif
				}
				,
				/// 存取根
				cAcsRoot : function ()
				{
					return this.e_Root;
				}
				,
				/// 新建根
				cNewRoot : function (a_Area, a_Vwpt, a_DockWay)
				{
					var l_NewRoot = new nPick.tRoot(this, a_DockWay);
					l_NewRoot.cSetAreaVwpt(a_Area, a_Vwpt);
					return this.cUseRoot(l_NewRoot);
				}
				,
				/// 使用根
				cUseRoot : function (a_Root)
				{
					// 双向记录
					this.e_Root = a_Root || null;
					if (this.e_Root)
					{
						this.e_Root.e_Host = this;
					}

					// 清空全部焦点，不用通知
					if (this.e_Focs.length > 0)
					{
						this.e_Focs.length = 0;
					}

					return this;
				}
				,
				/// 清空焦点
				cClrFocs : function (a_Foc$Focs)
				{
					fClrFocs(this);
					return this;
				}
				,
				/// 设置焦点
				cSetFocs : function (a_Foc$Focs)
				{
					fSetFocs(this, a_Foc$Focs);
					return this;
				}
				,
				/// 添加焦点
				cAddFocs : function (a_Foc$Focs)
				{
					// 只一个？
					if (a_Foc$Focs instanceof nPick.tWgt)
					{
						fAddFoc(this, a_Foc$Focs);
					}
					else
					{
						// 逐个添加
						stAryUtil.cFor(a_Foc$Focs,
							function (a_Ary, a_Idx, a_Foc)
							{
								fAddFoc(this, a_Foc);
							});
					}
					return this;
				}
				,
				/// 移除焦点
				cRmvFocs : function (a_Foc$Focs)
				{
					// 只一个？
					if (a_Foc$Focs instanceof nPick.tWgt)
					{
						fRmvFoc(this, a_Foc$Focs);
					}
					else
					{
						// 逐个移除
						stAryUtil.cFor(a_Foc$Focs,
							function (a_Ary, a_Idx, a_Foc)
							{
								fRmvFoc(this, a_Foc);
							});
					}
					return this;
				}
				,
				/// 是否为焦点
				cIsFoc : function (a_Wgt)
				{
					return (this === a_Wgt.cAcsPnl()) && fIsFoc(this, a_Wgt);
				}
				,
				/// 存取控件
				cAcsWgt : function (a_Name)
				{
					if (tInrName.i_Root == a_Name)
					{
						return this.e_Root;
					}
					return this.e_Root ? this.e_Root.cAcsSubWgt(a_Name, true) : null;
				}
				,
				/// 改变控件主状态
				/// a_Wgt：tWgt，必须是本面板的控件，且不能为根
				/// a_New：tPrmrSta，新主状态，不能是i_Semi和i_Foc
				cChgWgtPrmrSta : function (a_Wgt, a_New)
				{
					// 检查实参
					if (this !== a_Wgt.cAcsPnl())
					{ throw new Error("a_Wgt所属面板必须是this！"); }

					if (a_Wgt.cIsRoot())
					{ throw new Error("a_Wgt不能是根！"); }

					if (tPrmrSta.i_Semi <= a_New)
					{ throw new Error("a_New不能是i_Semi和i_Foc！"); }

					if ((a_Wgt.e_PrmrSta == a_New) || stNumUtil.cGetBit(a_Wgt.e_Flag, 14))
					{ return; }

					// 如果是焦点，上传给可成为焦点的宿主
					var l_FocHost = fAcsHostCanBeFoc(this, a_Wgt);

					// 发送消息
					var l_Msg = unKnl.fNewMsg_ChgPrmrSta(a_Wgt, this.e_Name, a_New);
					a_Wgt.vcHdlMsg(l_Msg);
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