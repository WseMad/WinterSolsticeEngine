/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tWgt)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nPick",
		[
			"(0)Pkup.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Wgt.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
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

	var s_TempSara0 = new tSara();

	function fSetDmntTchId(a_This, a_TchId)
	{
		a_This.e_DmntTchId = a_TchId || null;
	}

	function fLt(a_Tgt, a_Bss, a_ToLtUp)	{ }
	function fCt_X(a_Tgt, a_Bss, a_ToLtUp)	{ a_Tgt.c_X = a_ToLtUp ? (a_Tgt.c_X + (a_Bss.c_W - a_Tgt.c_W) / 2) : (a_Tgt.c_X - (a_Bss.c_W - a_Tgt.c_W) / 2); }
	function fRt(a_Tgt, a_Bss, a_ToLtUp)	{ a_Tgt.c_X = a_Bss.c_W - a_Tgt.c_X - a_Tgt.c_W; }

	function fUp(a_Tgt, a_Bss, a_ToLtUp)	{ }
	function fCt_Y(a_Tgt, a_Bss, a_ToLtUp)	{ a_Tgt.c_Y = a_ToLtUp ? (a_Tgt.c_Y + (a_Bss.c_H - a_Tgt.c_H) / 2) : (a_Tgt.c_Y - (a_Bss.c_H - a_Tgt.c_H) / 2); }
	function fDn(a_Tgt, a_Bss, a_ToLtUp)	{ a_Tgt.c_Y = a_Bss.c_H - a_Tgt.c_Y - a_Tgt.c_H; }

	/// 转换区域，a_Bss只会用到WH，不会使用XY
	function fCvtArea(a_Tgt, a_Bss, a_ToLtUp, a_DockWayVal)
	{
		// 首次执行时创建表格
		if (! fCvtArea.e_Tab)
		{
			fCvtArea.e_Tab =
				[
					{	c_fCvtX : fCt_X		, c_fCvtY : fCt_Y	},	// ·
					{	c_fCvtX : fRt		, c_fCvtY : fCt_Y	},	// →
					{	c_fCvtX : fRt		, c_fCvtY : fUp		},	// ↗
					{	c_fCvtX : fCt_X		, c_fCvtY : fUp		},	// ↑
					{	c_fCvtX : fLt		, c_fCvtY : fUp		},	// ↖
					{	c_fCvtX : fLt		, c_fCvtY : fCt_Y	},	// ←
					{	c_fCvtX : fLt		, c_fCvtY : fDn		},	// ↙
					{	c_fCvtX : fCt_X		, c_fCvtY : fDn		},	// ↓
					{	c_fCvtX : fRt		, c_fCvtY : fDn		}	// ↘
				];
		}

		if (a_DockWayVal >= fCvtArea.e_Tab.length)	// 其余停靠的转换规则同4
		{
			a_DockWayVal = 4;
		}

		var l_fCvt = fCvtArea.e_Tab[a_DockWayVal];
		l_fCvt.c_fCvtX(a_Tgt, a_Bss, a_ToLtUp);
		l_fCvt.c_fCvtY(a_Tgt, a_Bss, a_ToLtUp);
	}

	function fSendMsg_PrmrOver(a_Wgt)
	{
		var l_Msg = new tMsg(tMsg.tInrCode.i_PrprOver, a_Wgt.e_Host.e_Name, a_Wgt.e_Name);
		l_Msg.c_Who = a_Wgt;		// 自身
		a_Wgt.e_Host.vcHdlMsg(l_Msg);
	}

	function fSendMsg_AdedRmvd(a_Host, a_Wgt, a_Code)
	{
		if (stAryUtil.cIsEmt(a_Host.e_SubWgts))
		{
			return;
		}

		var l_Msg = new tMsg(a_Code, null, a_Host.e_Name);
		var l_Ary = a_Host.e_SubWgts, l_i = 0, l_Len = l_Ary.length;
		for ( ; l_i<l_Len; ++l_i)
		{
			if ((l_Ary[l_i] !== a_Wgt) && (l_Ary[l_i].e_RefFrm == a_Wgt.e_RefFrm))
			{
				l_Msg.c_Rcvr = l_Ary[l_i].e_Name;
				l_Ary[l_i].vcHdlMsg(l_Msg);
			}
		}
	}

	function fNewMsg_ChgPrmrSta(a_RcvrWgt, a_Sndr, a_New)
	{
		var l_Rst = new tMsg(tMsg.tInrCode.i_ChgPrmrSta, a_RcvrWgt.e_Name, a_Sndr);
		l_Rst.c_New = a_New;
		return l_Rst;
	}
	unKnl.fNewMsg_ChgPrmrSta = fNewMsg_ChgPrmrSta;

	function fFindWgtIstIdx(a_Ary, a_Wgt, a_ChkName)
	{
		// 先按相对层次排序，顺便检查存在性和名称冲突
		var l_Idx = -1, l_i = 0, l_Len = a_Ary.length;
		for (; l_i<l_Len; ++l_i)
		{
			// 已经存在
			if (a_Ary[l_i] === a_Wgt)
			{
				return l_i;
			}

			// 名称冲突？
			if (a_ChkName && (a_Ary[l_i].e_Name == a_Wgt.e_Name))
			{
				throw new Error("控件名称“" + a_Wgt.e_Name + "”冲突！");
			}

			// 如果尚未定位索引，且该处控件相对层次不大于指定控件，定位该处
			if ((l_Idx < 0) && (a_Ary[l_i].e_RelLyr <= a_Wgt.e_RelLyr))
			{
				l_Idx = l_i;
			}
		}

		if (l_Idx < 0)
		{
			l_Idx = a_Ary.length;
		}
		else
		{
			// 在同一层次里，再按主状态排序，为更好地支持多焦点，主状态的比较使用>=
			while ((l_Idx < a_Ary.length) &&
			(a_Ary[l_Idx].e_RelLyr == a_Wgt.e_RelLyr) &&
			(a_Ary[l_Idx].e_PrmrSta >= a_Wgt.e_PrmrSta))
			{
				++ l_Idx;
			}
		}

		return l_Idx;
	}
	unKnl.fFindWgtIstIdx = fFindWgtIstIdx;

	function fSortWgt(a_Ary, a_Idx)
	{
		// 先移除再重新添加
		var l_Wgt = a_Ary[a_Idx];
		a_Ary.splice(a_Idx, 1);

		var l_Idx = fFindWgtIstIdx(a_Ary, l_Wgt);
		a_Ary.splice(a_Idx, 0, l_Wgt);
	}
	unKnl.fSortWgt = fSortWgt;

	function fAdd(a_This, a_Wgt, a_Ifm) // 通知？
	{
		if (null == a_This.e_SubWgts)
		{
			a_This.e_SubWgts = [];
		}

		// 插入控件数组，设置宿主指针
		var l_Ary = a_This.e_SubWgts;
		var l_Idx = fFindWgtIstIdx(l_Ary, a_Wgt);
		a_This.e_SubWgts.splice(l_Idx, 0, a_Wgt);
		a_Wgt.e_Host = a_This;

		// 如果需要，通知相同参照系的其他控件
		if (a_Ifm)
		{
			fSendMsg_AdedRmvd(a_This, a_Wgt, tMsg.tInrCode.i_Aded);
		}
	}

	function fRmv(a_This, a_Wgt, a_Ifm)
	{
		var l_Idx = fFind(a_This, a_Wgt);
		if (l_Idx < 0)
		{
			return;
		}

		// 从控件数组擦除，清零宿主指针，标记
		a_This.e_SubWgts.splice(l_Idx, 1);
		a_Wgt.e_Host = null;
		fSetWgtFlag(a_Wgt, 14, true);		// 已被从宿主删除

		// 如果需要，通知相同参照系的其他控件
		if (a_Ifm)
		{
			fSendMsg_AdedRmvd(a_This, a_Wgt, tMsg.tInrCode.i_Rmvd);
		}
	}

	function fFind(a_This, a_Wgt)
	{
		return stAryUtil.cIsEmt(a_This.e_SubWgts) ? -1 : a_This.e_SubWgts.indexOf(a_Wgt);
	}

	function fGetWgtFlag(a_Wgt, a_Bit)
	{
		a_Wgt.e_Flag = stNumUtil.cGetBit(a_Wgt.e_Flag, a_Bit);
	}
	unKnl.fGetWgtFlag = fGetWgtFlag;

	function fSetWgtFlag(a_Wgt, a_Bit, a_Val)
	{
		a_Wgt.e_Flag = stNumUtil.cSetBit(a_Wgt.e_Flag, a_Bit, a_Val);
	}
	unKnl.fSetWgtFlag = fSetWgtFlag;

	function fTrvsWgtTree(a_Root, a_fCabk)
	{
		a_fCabk(a_Root);
		fTrvsWgtSubtree(a_Root, a_fCabk);
	}
	unKnl.fTrvsWgtTree = fTrvsWgtTree;

	function fTrvsWgtSubtree(a_Root, a_fCabk)
	{
		if (! a_Root.e_SubWgts)
		{ return; }

		var l_Ary = a_Root.e_SubWgts, i, l_Len = l_Ary.length;
		for (i=0; i<l_Len; ++i)
		{
			fTrvsWgtTree(l_Ary[i], a_fCabk);
		}
	}
	unKnl.fTrvsWgtSubtree = fTrvsWgtSubtree;

	function fEsmtScrlBar(a_This)
	{
		// 全视口？
		if (! a_This.e_Vwpt)
		{ return; }

		var l_Area = a_This.e_Area;
		var l_Vwpt = a_This.e_Vwpt;

		// 记录当前是否有滚动条
		var l_Hsb = a_This.cAcsSubWgtByName(tInrName.i_Hsb, false);
		var l_Vsb = a_This.cAcsSubWgtByName(tInrName.i_Vsb, false);

		// 添加或删除滚动条
		var l_AddHsb = false, l_AddVsb = false;
		var l_DltHsb = false, l_DltVsb = false;

		// 添加或复原水平滚动条
		if ((0 < l_Vwpt.c_W) && (l_Vwpt.c_W < l_Area.c_W))
		{
			if (! l_Hsb)
			{ l_AddHsb = true; }
			else
			if (tPrmrSta.i_Exit == l_Hsb.e_PrmrSta)
			{ l_Hsb.vcHdlMsg(fNewMsg_ChgPrmrSta(l_Hsb, a_This.e_Name, tPrmrSta.i_Wait)); }
		}
		else	// 移除水平滚动条
		if ((l_Vwpt.c_W >= l_Area.c_W) && l_Hsb)
		{
			l_DltHsb = true;
		}

		// 添加或复原垂直滚动条
		if ((0 < l_Vwpt.c_H) && (l_Vwpt.c_H < l_Area.c_H))
		{
			if (! l_Vsb)
			{ l_AddVsb = true; }
			else
			if (tPrmrSta.i_Exit == l_Vsb.e_PrmrSta)
			{ l_Vsb.vcHdlMsg(fNewMsg_ChgPrmrSta(l_Vsb, a_This.e_Name, tPrmrSta.i_Wait)); }
		}
		else	// 移除水平滚动条
		if ((l_Vwpt.c_H >= l_Area.c_H) && l_Vsb)
		{
			l_DltVsb = true;
		}

		function fHdlAddDltMsg(a_This, a_Code, a_Which)
		{
			var l_Msg = new tMsg(a_Code, a_This.e_Name, a_This.e_Name);
			l_Msg.c_Which = a_Which;
			a_This.vcHdlMsg(l_Msg);
		}

		if (l_AddHsb)
		{ fHdlAddDltMsg(a_This, tMsg.tInrCode.i_InrWgtAdd, tInrName.i_Hsb); }
		else
		if (l_DltHsb)
		{ fHdlAddDltMsg(a_This, tMsg.tInrCode.i_InrWgtDlt, tInrName.i_Hsb); }

		if (l_AddVsb)
		{ fHdlAddDltMsg(a_This, tMsg.tInrCode.i_InrWgtAdd, tInrName.i_Vsb); }
		else
		if (l_DltVsb)
		{ fHdlAddDltMsg(a_This, tMsg.tInrCode.i_InrWgtDlt, tInrName.i_Vsb); }
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 控件

	(function ()
	{
		nWse.fClass(nPick,
			/// 控件
			/// a_Name：String，名称
			/// a_RelLyr：Number，相对层次
			/// a_RefFrm：tRefFrm，参照系，默认宿主
			/// a_DockWay：tDockWay，停靠方式，默认tDockWay.i_LtUp
			function tWgt(a_Name, a_RelLyr, a_RefFrm, a_DockWay)
			{
			//	this.odBase(tWgt).odCall(a_Name);
				atPkup.call(this, a_Name, a_RelLyr, a_RefFrm, a_DockWay);	// IE8

				//---- 定义字段

				this.e_Host = null;					// 宿主，对于根为tPnl，其他为tWgt
				this.e_Flag = 0;					// 标志
				this.e_Area = new tSara();			// 区域，必有
				this.e_Vwpt = null;					// 视口，需要时才新建
				this.e_RelLyr = (a_RelLyr || 0).valueOf();	// 注意可能是枚举值，必须显示转换成数字
				this.e_RefFrm = a_RefFrm || tRefFrm.i_Host;
				this.e_DockWay = a_DockWay || tDockWay.i_LtUp;
				this.e_PrmrSta = tPrmrSta.i_Exit;
				this.e_SubWgts = null;				// 子控件数组，需要时才新建
			}
			,
			atPkup
			,
			{
				/// 处理消息
				/// a_Msg：tMsg
				vcHdlMsg : function (a_Msg)
				{
					// 验证消息接收者
					this.cVrfMsgRcvr(a_Msg);

					// 刷新？通知子控件？
					var l_Rfsh = false, l_NtfSubWgts = false;

					// 附加消息
					var l_AdnlHdlr = null, l_AdnlMsg = null;

					// 内部控件
					var l_InrWgt = null;

					var i_Code = tMsg.tInrCode;
					switch (a_Msg.c_Code)
					{
						//case i_Code.i_OnRbndMainCvs:	// 原因详见stFrmwk里的eSendMsg_OnRbndMainCvs()
						//	{
						//		l_NtfSubWgts = true;
						//	} break;

						case i_Code.i_PrprOver:
						{
							// 如果是子控件发来的
							if (this === a_Msg.c_Who.e_Host)
							{
								// 如果自身主状态不是i_Exit，移除子控件
								// 否则等待自己的宿主处理，若根为i_Exit表示离栈
								if (tPrmrSta.i_Exit != this.e_PrmrSta)
								{
									fRmv(this, a_Msg.c_Who, true);
									//	console.log("Rmv " + a_Msg.c_Who.e_Name);
								}
							}
							else // 怎么会收到？
							{
								throw new Error("意外收到i_PrprOver，c_Rcvr = " + a_Msg.c_Rcvr + "，c_Sndr = " + a_Msg.c_Sndr);
							}
						} break;

						case i_Code.i_Ent:
						case i_Code.i_Rsm:
						{
							l_Rfsh = true;
							l_NtfSubWgts = true;

							l_AdnlHdlr = this;
							l_AdnlMsg = fNewMsg_ChgPrmrSta(this, this.e_Name, tPrmrSta.i_Wait);
						} break;

						case i_Code.i_PrprLea:
						case i_Code.i_Lea:
						{
							l_NtfSubWgts = true;

							// 准备离开时，所有控件需要改变主状态
							if (i_Code.i_PrprLea == a_Msg.c_Code)
							{
								l_AdnlHdlr = this;
								l_AdnlMsg = fNewMsg_ChgPrmrSta(this, this.e_Name, tPrmrSta.i_Exit);
							}
						} break;

						case i_Code.i_AreaChgd :
						{
							l_Rfsh = true;
							l_NtfSubWgts = true;

							// 如果发送者是自己
							if (a_Msg.c_Sndr == this.e_Name)
							{
								// 如果有视口
								if (this.e_Vwpt)
								{
									// 检查视口是否超出区域，这是一种简便做法
									this.cMoveVwpt(0, 0);

									// 评估滚动条
									fEsmtScrlBar(this);
								}
							}
							else // 可能是先辈
							{
								//
							}
						} break;

						case i_Code.i_VwptChgd :
						{
							l_Rfsh = true;
							l_NtfSubWgts = true;

							// 如果发送者是自己
							if (a_Msg.c_Sndr == this.e_Name)
							{
								// 评估滚动条
								fEsmtScrlBar(this);
							}
							else // 可能是先辈
							{
								//
							}
						} break;

						case i_Code.i_InrWgtAdd:
						{
							//if (tInrName.i_Hsb == a_Msg.c_Which)
							//{ l_InrWgt = new nPick.tHsb(this); }
							//else
							//if (tInrName.i_Vsb == a_Msg.c_Which)
							//{ l_InrWgt = new nPick.tVsb(this); }

							if (l_InrWgt)
							{
								this.cAdd(l_InrWgt);

								// 如果自己的状态＞i_Hide，令新加入的内部控件等待
								if (this.e_PrmrSta > tPrmrSta.i_Hide)
								{ l_InrWgt.vcHdlMsg(fNewMsg_ChgPrmrSta(l_InrWgt, this.e_Name, tPrmrSta.i_Wait)); }
							}
						} break;

						case i_Code.i_InrWgtDlt:
						{
							l_InrWgt = this.cAcsSubWgtByName(a_Msg.c_Which);
							if (l_InrWgt)
							{ this.cAcsPnl().cChgWgtPrmrSta(l_InrWgt, tPrmrSta.i_Exit); }
						} break;

						case i_Code.i_ChgPrmrSta :
						{
							// 不在面板里或已被收集的控件，不再更新主状态
							if ((! this.cAcsPnl()) || stNumUtil.cGetBit(this.e_Flag, 14))
							{
								return;
							}

							var l_OldPS = this.e_PrmrSta;
							var l_NewPS = a_Msg.c_New;
							if (l_OldPS == l_NewPS) // 按理说不会相同，但为谨慎，还是检查一下……
							{
								return;
							}

							// 如果不是退出，且当前处于隐藏或禁用主状态，且锁定这两种主状态，则不响应这条消息
							if ((tPrmrSta.i_Exit != l_NewPS) &&
								(tPrmrSta.i_Hide <= l_OldPS) && (l_OldPS <= tPrmrSta.i_Dsab) &&
								stNumUtil.cGetBit(this.e_Flag, 9))
							{
								return;
							}

							// 改变主状态
							this.e_PrmrSta = l_NewPS;
							fSetWgtFlag(this, 1, true);		// 主状态动画中

							// 回调
							this.vdPrmrStaChgd(l_OldPS, l_NewPS);
						} break;
					}

					//// 渲染器
					//if (this.e_Rndr)
					//{
					//	if (i_Code.i_Ent == a_Msg.c_Code)
					//	{
					//		this.e_Rndr.vdOnWgtEnt();
					//	}
					//	else
					//	if (i_Code.i_Lea == a_Msg.c_Code)
					//	{
					//		this.e_Rndr.vdOnWgtLea();
					//	}
					//}

					// 刷新？
					if (l_Rfsh)
					{
						this.cRfsh();
					}

					// 附加消息？
					if (l_AdnlHdlr)
					{
						l_AdnlHdlr.vcHdlMsg(l_AdnlMsg);
					}

					// 如果需要，通告子控件
					if (l_NtfSubWgts && this.cIsHost())
					{
						this.dNtfSubWgts(a_Msg);
					}
					return this;
				}
				,
				/// 通告子控件，【注意】this.e_SubWgts对象必须存在（可以为空数组，但不能为null）
				dNtfSubWgts : function (a_Msg)
				{
					// 从前向后
					var l_Ary = this.e_SubWgts, i, l_Len = l_Ary.length;
					for (i=0; i<l_Len; ++i)
					{
						a_Msg.c_Rcvr = l_Ary[i].e_Name;
						l_Ary[i].vcHdlMsg(a_Msg);
					}
					return this;
				}
				,
				/// 输入复位
				vcIptRset : function ()
				{
					// 清除支配触点
					fSetDmntTchId(this, null);
					return this;
				}
				,
				/// 处理输入
				/// a_Ipt：tPntIpt
				vcHdlIpt : function (a_Ipt)
				{
					//【说明】这个函数之所以被调用，是因为this所指控件是所属面板的焦点

					var l_TchIdx;	// 触点索引

					// 如果有支配触点
					if (this.e_DmntTchId)
					{
						// 找到支配触点
						l_TchIdx = a_Ipt.cFindTchById(this.e_DmntTchId);

						//【注意】如果没有找到，证明“支配触点丢失”，
						// 按理不应发生，因为框架追踪所有活动触点，每个触点的输入和处理流程应是完整的，
						// 但是造成丢失的原因可能很复杂（程序内部因素或不可控外部因素），所以必须应对
						if (l_TchIdx < 0)
						{
							// 目前这里的做法是，简单地清除支配触点
							fSetDmntTchId(this, null);

							// 对输入不作处理
							return this;
						}
					}
					else // 尚无支配触点
					{
						// 找到最靠前的、拾取到自己的触点
						l_TchIdx = a_Ipt.cFindTchByPkdWgt(this);

						// 如果没有找到
						if (l_TchIdx < 0)
						{
							// 如果输入里含有i_TchBgn，则通知面板把自己从焦点里移除
							if (a_Ipt.cHasTchOfKind(tPntIpt.tKind.i_TchBgn))
							{
								this.cAcsPnl().cRmvFocs(this);
							}

							// 对输入不作处理
							return this;
						}

						// 如果找到，将这个触点选作自己的支配触点
						fSetDmntTchId(this, a_Ipt.c_Tchs[l_TchIdx].c_TchId);
					}

					// 现在l_TchIdx一定表示自己的支配触点索引
					// 通过虚函数转发输入处理
					this.vdHdlIptFromDmntTch(a_Ipt, l_TchIdx, a_Ipt.c_Tchs[l_TchIdx]);
					return this;
				}
				,
				/// 处理来自支配触点的输入
				/// a_DmntTchIdx：Number，支配触点索引
				/// a_DmntTch：Object，支配触点
				vdHdlIptFromDmntTch : function (a_Ipt, a_DmntTchIdx, a_DmntTch)
				{
					// 如果支配触点的输入种类是i_TchEnd，输入复位
					if (tPntIpt.tKind.i_TchEnd == a_DmntTch.c_Kind)
					{
						this.vcIptRset();

						// 已处理
						a_DmntTch.c_Hdld = true;
						return this;
					}

					return this;
				}
				,
				/// 刷新
				cRfsh : function ()
				{
					// 自己刷新
					this.vdRfsh();

					// 如果有渲染器
					if (this.e_Rndr)
					{
						this.e_Rndr.vdOnWgtRfsh();
					}
				}
				,
				/// 刷新
				vdRfsh : function ()
				{
					return this;
				}
				,
				/// 能否展示
				cCanShow : function ()
				{
					// 如果控件主状态在禁用以上，或正在执行主状态动画
					return ((tPrmrSta.i_Dsab <= this.e_PrmrSta) || stNumUtil.cGetBit(this.e_Flag, 1));
				}
				,
				/// 渲染
				vcRnd : function ()
				{
					// 如果不能展示，不绘制
					if (! this.cCanShow())
					{ return this; }

					// 如果有渲染器
					if (this.e_Rndr)
					{
						this.e_Rndr.vdOnWgtDraw();
					}

					// 如果有，渲染子控件
					if (this.cIsHost())
					{
						this.dRndSubWgts();
					}

					return this;
				}
				,
				/// 拾取
				/// a_Rpt：tPickRpt，拾取报告
				vcPick : function (a_Rpt)
				{
					// 如果不能展示，不拾取
					if (! this.cCanShow())
					{ return; }

					var l_IdClo;

					// 如果有渲染器
					if (this.e_Rndr)
					{
						l_IdClo = a_Rpt.cGnrtIdClo(this);
						if (l_IdClo)
						{
							// 拾取
							this.e_Rndr.vdOnWgtPick(l_IdClo);
						}
					}
				}
				,
				/// 有渲染器？
				cHasRndr : function ()
				{
					return (null != this.e_Rndr);
				}
				,
				/// 存取渲染器
				/// 如果还没有渲染器，在类里搜寻名为“tRndr”的类，若找到则新建一个实例
				/// 若未找到，则使用tWgt.tRndr新建一个实例
				cAcsRndr : function ()
				{
					if (! this.e_Rndr)
					{
						var l_tRndr = this.constructor["tRndr"];
						this.e_Rndr = l_tRndr ? (new l_tRndr(this)) : (new nPick.tWgt.tRndr(this));
					}
					return this.e_Rndr;
				}
				,
				/// 使用渲染器
				cUseRndr : function (a_Rndr)
				{
					this.e_Rndr = a_Rndr || null;
					if (this.e_Rndr)
					{
						this.e_Rndr.d_Wgt = this;	// 记录控件
					}
					return this;
				}
				,
				/// 渲染子控件，【注意】this.e_SubWgts对象必须存在（可以为空数组，但不能为null）
				dRndSubWgts : function ()
				{
					// 从后向前
					var l_Ary = this.e_SubWgts, i, l_Len = l_Ary.length;
					for (i=l_Len-1; i>=0; --i)
					{
						l_Ary[i].vcRnd();
					}
					return this;
				}
				,
				/// 主状态改变
				vdPrmrStaChgd : function (a_Old, a_New)
				{
					// 如果有渲染器
					if (this.e_Rndr)
					{
						// 进入呈现目标？
						if (tPrmrSta.i_Exit == a_Old)
						{
							this.e_Rndr.vdOnWgtEntPrstTgt();
						}

						this.e_Rndr.vdOnWgtPrmrStaChgd(a_Old, a_New);
					}

				//	console.log(this.cGetName() + ": " + a_New.toString() + " <- " + a_Old.toString());
					return this;
				}
				,
				/// 结束主状态动画，【警告】动画完成后必须调用！否则控件可能不会隐藏、移除……
				cFnshPrmrStaAnmt : function ()
				{
					if (! fGetWgtFlag(this, 1)) // 无效调用？
					{ return this; }

					fSetWgtFlag(this, 1, false);	// 主状态动画完

					// 如果此时主状态为i_Exit，通知宿主（一定存在，可为面板）
					if (tPrmrSta.i_Exit == this.e_PrmrSta)
					{
						fSendMsg_PrmrOver(this);

						// 如果有渲染器
						if (this.e_Rndr)
						{
							// 离开呈现目标
							this.e_Rndr.vdOnWgtLeaPrstTgt();
						}
					}
					return this;
				}
				,
				/// 存取面板
				cAcsPnl : function ()
				{
					// 面板没有e_Host
					var l_Pnl = this;
					while (l_Pnl.e_Host)
					{
						l_Pnl = l_Pnl.e_Host;
					}
					return (l_Pnl instanceof nPick.tPnl) ? l_Pnl : null; // 注意，如果宿主尚未加入到面板中，其e_Host为null
				}
				,
				/// 存取根
				cAcsRoot : function ()
				{
					return this.cAcsPnl().cAcsRoot();
				}
				,
				/// 存取宿主
				cAcsHost : function ()
				{
					return this.e_Host;
				}
				,
				/// 是否为根
				cIsRoot : function ()
				{
					return (this.e_Name == tInrName.i_Root);
				}
				,
				/// 是否为宿主
				cIsHost : function ()
				{
					return ! stAryUtil.cIsEmt(this.e_SubWgts);
				}
				,
				/// 存取区域
				cAcsArea : function ()
				{
					return this.e_Area;
				}
				,
				/// 设置区域
				cSetArea : function (a_Area)
				{
					if (a_Area)
					{
						return this.cSetArea$Xywh(a_Area.c_X, a_Area.c_Y, a_Area.c_W, a_Area.c_H);
					}
					else
					{
						var l_PTA = nPick.stFrmwk.cAcsPrstTgtArea();
						return this.cSetArea$Xywh(l_PTA.c_X, l_PTA.c_Y, l_PTA.c_W, l_PTA.c_H);
					}
				}
				,
				/// 设置区域
				cSetArea$Xywh : function (a_X, a_Y, a_W, a_H)
				{
					var l_OldArea = tSara.scCopy(this.e_Area);
				//	this.e_Area.cCrt(a_X, a_Y, a_W, a_H);	// 不要调用这个，tSara不允许null值，而控件使用null表自动计算
					this.e_Area.c_X = a_X;	this.e_Area.c_Y = a_Y;	this.e_Area.c_W = a_W;	this.e_Area.c_H = a_H;

					if (! tSara.scEq(this.e_Area, l_OldArea))
					{
						this.dHdlMsgFromSelf(tMsg.tInrCode.i_AreaChgd, l_OldArea);
					}

					return this;
				}
				,
				/// 设置区域位置
				cSetAreaPos : function (a_X, a_Y)
				{
					return this.cSetArea$Xywh(a_X, a_Y, this.e_Area.c_W, this.e_Area.c_H);
				}
				,
				/// 设置区域尺寸
				cSetAreaDim : function (a_W, a_H)
				{
					return this.cSetArea$Xywh(this.e_Area.c_X, this.e_Area.c_Y, a_W, a_H);
				}
				,
				/// 移动区域
				cMoveArea : function (a_OfstX, a_OfstY)
				{
					return this.cSetAreaPos(this.e_Area.c_X + a_OfstX, this.e_Area.c_Y + a_OfstY);
				}
				,
				/// 获取视口
				cGetVwpt : function ()
				{
					return this.e_Vwpt ? tSara.scCopy(this.e_Vwpt) : new tSara(0, 0, this.e_Area.c_W, this.e_Area.c_H);
				}
				,
				/// 获取视口X坐标
				cGetVwptX : function ()
				{
					return this.e_Vwpt ? this.e_Vwpt.c_X : 0;
				}
				,
				/// 获取视口Y坐标
				cGetVwptY : function ()
				{
					return this.e_Vwpt ? this.e_Vwpt.c_Y : 0;
				}
				,
				/// 获取视口宽度
				cGetVwptW : function ()
				{
					return (this.e_Vwpt || this.e_Area).c_W;
				}
				,
				/// 获取视口高度
				cGetVwptH : function ()
				{
					return (this.e_Vwpt || this.e_Area).c_H;
				}
				,
				/// 设置视口
				/// a_Vwpt：tSara，若为null则表示全视口（覆盖全区域）
				cSetVwpt : function (a_Vwpt)
				{
					if (a_Vwpt)
					{
						return this.cSetVwpt$Xywh(a_Vwpt.c_X, a_Vwpt.c_Y, a_Vwpt.c_W, a_Vwpt.c_H);
					}
					else
					{
						this.e_Vwpt = null;
						return this;
					}
				}
				,
				/// 设置视口
				cSetVwpt$Xywh : function (a_X, a_Y, a_W, a_H)
				{
					a_W = stNumUtil.cClmOnNum(a_W, 0, this.e_Area.c_W);
					a_H = stNumUtil.cClmOnNum(a_H, 0, this.e_Area.c_H);
					var l_NewVwpt = new tSara(a_X, a_Y, a_W, a_H);
					tSara.scBndPut$Wh(l_NewVwpt, this.e_Area.c_W, this.e_Area.c_H);	// 视口不能超出区域

					// 没有变化？
					var l_OldVwpt = this.cGetVwpt();
					if (tSara.scEq(l_OldVwpt, l_NewVwpt))
					{ return; }

					if (! this.e_Vwpt)
					{ this.e_Vwpt = l_NewVwpt; }
					else
					{ tSara.scAsn(this.e_Vwpt, l_NewVwpt); }

					this.dHdlMsgFromSelf(tMsg.tInrCode.i_VwptChgd, l_OldVwpt);
					return this;
				}
				,
				/// 设置视口位置
				cSetVwptPos : function (a_X, a_Y)
				{
					var l_VwptW = this.e_Area.c_W, l_VwptH = this.e_Area.c_H;
					if (this.e_Vwpt)
					{
						l_VwptW = this.e_Vwpt.c_W;
						l_VwptH = this.e_Vwpt.c_H;
					}
					return this.cSetVwpt$Xywh(a_X, a_Y, l_VwptW, l_VwptH);
				}
				,
				/// 设置视口尺寸
				cSetVwptDim : function (a_W, a_H)
				{
					var l_VwptX = 0, l_VwptY = 0;
					if (this.e_Vwpt)
					{
						l_VwptX = this.e_Vwpt.c_X;
						l_VwptY = this.e_Vwpt.c_Y;
					}
					return this.cSetVwpt$Xywh(l_VwptX, l_VwptY, a_W, a_H);
				}
				,
				/// 移动视口
				cMoveVwpt : function (a_OfstX, a_OfstY)
				{
					var l_VwptX = 0, l_VwptY = 0;
					if (this.e_Vwpt)
					{
						l_VwptX = this.e_Vwpt.c_X;
						l_VwptY = this.e_Vwpt.c_Y;
					}
					return this.cSetVwptPos(l_VwptX + a_OfstX, l_VwptY + a_OfstY);
				}
				,
				/// 设置区域视口
				cSetAreaVwpt : function (a_Area, a_Vwpt)
				{
					this.cSetArea(a_Area);
					this.cSetVwpt(a_Vwpt);
					return this;
				}
				,
				/// 获取相对层次
				cGetRelLyr : function ()
				{
					return this.e_RelLyr;
				}
				,
				/// 获取参照系
				cGetRefFrm : function ()
				{
					return this.e_RefFrm;
				}
				,
				/// 获取停靠方式
				cGetDockWay : function ()
				{
					return this.e_DockWay;
				}
				,
				/// 获取主状态
				cGetPrmrSta : function ()
				{
					return this.e_PrmrSta;
				}
				,
				/// 计算放置区域（含外边距、边框、内边距、内容），总是相对于宿主的呈现区，可用于CSS绝对定位和画布绘制定位
				/// 返回：a_Rst
				cCalcPutArea : function (a_Rst)
				{
					// 尺寸不变，位置平移
				//	tSara.scAsn(a_Rst, this.e_Area);	// 不要调用这个，可能会把null变成0
					a_Rst.c_X = this.e_Area.c_X;
					a_Rst.c_Y = this.e_Area.c_Y;

					// 如果有视口，显示区域的位置取决于e_Area.c_XY，尺寸取决于e_Vwpt.c_WH
					if (this.e_Vwpt)
					{
						a_Rst.c_W = this.e_Vwpt.c_W;
						a_Rst.c_H = this.e_Vwpt.c_H;
					}
					else
					{
						a_Rst.c_W = this.e_Area.c_W;
						a_Rst.c_H = this.e_Area.c_H;
					}

					var l_Host;
					if (tRefFrm.i_Prst == this.e_RefFrm)
					{
						// 根据框架的呈现目标区转换区域位置
						fCvtArea(a_Rst, nPick.stFrmwk.cAcsPrstTgtArea(), true, this.e_DockWay.valueOf());
					}
					else
					if (tRefFrm.i_Vwpt == this.e_RefFrm)
					{
						// 不受宿主视口影响，因为视口坐标系与CSS绝对定位完全吻合
						l_Host = this.e_Host;
						if (l_Host) // 注意宿主可能不存在！如控件尚未加入某个宿主或面板
						{
							// 注意宿主的视口可能不存在，可使用区域代替（不会用到XY）
							fCvtArea(a_Rst, l_Host.e_Vwpt || l_Host.e_Area, true, this.e_DockWay.valueOf());
						}
					}
					else
				//	if (tRefFrm.i_Host == this.e_RefFrm)
					{
						// 受宿主视口影响
						l_Host = this.e_Host;
						if (l_Host) // 注意宿主可能不存在！如控件尚未加入某个宿主或面板
						{
							// 根据宿主区域转换区域位置
							fCvtArea(a_Rst, l_Host.e_Area, true, this.e_DockWay.valueOf());
							if (l_Host.e_Vwpt)
							{
								a_Rst.c_X -= l_Host.e_Vwpt.c_X;
								a_Rst.c_Y -= l_Host.e_Vwpt.c_Y;
							}
						}
					}
					return a_Rst;
				}
				,
				/// 计算呈现区域（含外边距、边框、内边距、内容），总是相对于框架的呈现目标，主要用于拾取
				/// 返回：a_Rst
				cCalcPrstArea : function (a_Rst)
				{
					// 先计算CSS区域，总是相对于宿主的呈现区
					// 然后，非呈现坐标系时，累加宿主的呈现区
					this.cCalcPutArea(a_Rst);
					var l_HostPA;
					if ((tRefFrm.i_Prst != this.e_RefFrm) && this.e_Host)
					{
						l_HostPA = s_TempSara0;
						this.e_Host.cCalcPrstArea(l_HostPA);
						a_Rst.c_X += l_HostPA.c_X;
						a_Rst.c_Y += l_HostPA.c_Y;
					}
					return a_Rst;
				}
				,
				/// 添加控件
				cAdd : function (a_Wgt)
				{
					// 没有名称
					if (! a_Wgt.e_Name)
					{
						throw new Error("a_Wgt没有名称！");
					}

					// 已被收集？
					if (stNumUtil.cGetBit(a_Wgt.e_Flag, 14))
					{
						throw new Error("a_Wgt已被收集！");
					}

					fAdd(this, a_Wgt, true);
					return this;
				}
				,
				/// 根据名称存取子控件
				/// a_Rcur：Boolean，递归搜索子控件宿主？默认false
				cAcsSubWgtByName : function (a_Name, a_Rcur)
				{
					if (! this.cIsHost())
					{
						return null;
					}

					var l_Idx = stAryUtil.cFind(this.e_SubWgts, function (a_Ary, a_Idx, a_Wgt) { return (a_Wgt.e_Name == a_Name); });
					if (l_Idx >= 0)
					{
						return this.e_SubWgts[l_Idx];
					}

					var l_Rst = null;
					if (a_Rcur)
					{
						stAryUtil.cFind(this.e_SubWgts,
							function (a_Ary, a_Idx, a_Wgt)
							{
								l_Rst = a_Wgt.cAcsSubWgtByName(a_Name, true);
								return (null != l_Rst);
							});
					}
					return l_Rst;
				}
				,
				/// 是否为先辈
				cIsAncs : function (a_Wgt)
				{
					var l_Host = a_Wgt.e_Host;
					while (null != l_Host)
					{
						if (this === l_Host)
						{
							return true;
						}

						l_Host = l_Host.e_Host;
					}
					return false;
				}
				,
				/// 是否为后辈
				cIsDsdn : function (a_Wgt)
				{
					return a_Wgt.cIsAncs(this);
				}
				,
				/// 获取子控件总数
				cGetSubWgtsTot : function (a_Rcur)
				{
					if ((! this.e_SubWgts) || (0 == this.e_SubWgts.length))
					{ return 0; }

					var l_Rst = this.e_SubWgts.length;
					if (! a_Rcur)
					{ return l_Rst; }

					var i, l_Len = this.e_SubWgts.length;
					for (i=0; i<l_Len; ++i)
					{ l_Rst += this.e_SubWgts[i].cGetSubWgtsTot(a_Rcur); }
					return l_Rst;
				}
			}
			,
			{
				//sc_ :
				//{
				//	/// 区域最小尺寸，默认0.001，不要设为≤0的值
				//	sc_AreaMinDim : 0.001
				//}
			}
			,
			false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 根

	(function ()
	{
		nWse.fClass(nPick,
			/// 根
			/// a_Pnl：面板
			/// a_DockWay：tDockWay，停靠方式，默认tDockWay.i_LtUp
			function tRoot(a_Pnl, a_DockWay)
			{
			//	this.odBase(tRoot).odCall(tInrName.i_Root, tRelLyr.i_InrUprLmt, tRefFrm.i_Prst, a_DockWay);
				nPick.tWgt.call(this, tInrName.i_Root, tRelLyr.i_InrUprLmt, tRefFrm.i_Prst, a_DockWay);	// IE8

				//---- 定义字段

				//---- 初始化

				// 记录面板
				this.e_Host = a_Pnl;
			}
			,
			nPick.tWgt
			,
			{
				///// 处理消息
				///// a_Msg：tMsg
				//vcHdlMsg : function (a_Msg)
				//{
				////	this.odBase(f).odCall(a_Msg);
				//	nPick.tWgt.prototype.vcHdlMsg.call(this, a_Msg);
				//	return this;
				//}
				//,
				///// 处理输入
				///// a_Ipt：tIpt
				//vcHdlIpt : function f(a_Ipt)
				//{
				//	this.odBase(f).odCall(a_Ipt);
				//}
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