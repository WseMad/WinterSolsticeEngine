/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.stFrmwk)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nPick",
		[
			"nWse:RltmAfx.js"

			,"Pnl.js"
			,"Rndr.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Frmwk.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var tRltmAfx = nWse.tRltmAfx;
	var tPntIptTrkr = nWse.tPntIptTrkr;

	var nPick = nWse.nPick;
	var unKnl = nPick.unKnl;
	var tInrName = nPick.tInrName;
	var tMsg = nPick.tMsg;
	var atPkup = nPick.atPkup;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var i_UnitPrio = -1000;				// 单元优先级
	var stFrmwk;						// 框架

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 动画管理器

	var tAnmtMgr;
	(function ()
	{
		tAnmtMgr = nWse.fClass(unKnl,
			/// 动画管理器
			function tAnmtMgr()
			{
				this.e_ThisCabks = []; // 回调数组
			}
			,
			null
			,
			{
				/// 查找
				cFind : function (a_This, a_fCabk)
				{
					return stAryUtil.cFind(this.e_ThisCabks,
						function (a_Ary, a_Idx, a_ThisCabk)
						{ return a_ThisCabk && (a_ThisCabk.c_This === a_This) && (a_ThisCabk.c_fCabk === a_fCabk); });
				}
				,
				/// 添加
				/// a_This：this
				/// a_fCabk：Function，Boolean f(a_FrmTime, a_FrmItvl, a_FrmIdx)，返回true=继续，false=完成，【警告】不要用匿名函数！
				/// a_EnsrSgl：Boolean，确保唯一？当a_This和a_fCabk都绝对相等时才认为相同
				/// 返回：Number，索引
				cAdd : function (a_This, a_fCabk, a_EnsrSgl)
				{
					var l_Idx = a_EnsrSgl ? this.cFind(a_This, a_fCabk) : -1;
					if (l_Idx >= 0)
					{
						return l_Idx;
					}

					l_Idx = stAryUtil.cGetEmtIdx(this.e_ThisCabks);
					this.e_ThisCabks[l_Idx] = { c_This : a_This, c_fCabk : a_fCabk };
					return l_Idx;
				}
				,
				/// 更新
				eUpd : function (a_FrmTime, a_FrmItvl, a_FrmIdx)
				{
					stAryUtil.cFor(this.e_ThisCabks,
						function (a_Ary, a_Idx, a_ThisCabk)
						{
							// 若已完成则清null
							if (a_ThisCabk && (! a_ThisCabk.c_fCabk.call(a_ThisCabk.c_This, a_FrmTime, a_FrmItvl, a_FrmIdx)))
							{ a_Ary[a_Idx] = null; }
						});
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
// 框架

	(function ()
	{
		/// 框架
		stFrmwk = function () { };
		nPick.stFrmwk = stFrmwk;
		stFrmwk.onHost = nPick;
		stFrmwk.oc_FullTpnm = nPick.ocBldFullName("stFrmwk");

		/// 构建全名
		stFrmwk.ocBldFullName = function (a_Name)
		{
			return stFrmwk.oc_FullTpnm + "." + a_Name;
		};

		//======== 私有字段

		var e_RltmAfx = null;				// 实时应用程序框架
		var e_PrstTgtArea = new tSara();		// 视区

		var e_WgtPkr = null;				// 控件拾取器
		var e_AnmtMgr = null;				// 动画管理器

		var e_PnlReg;			// 面板注册
		var e_PnlStk;			// 面板栈
		var e_LockPnlStk;		// 锁定面板栈？
		var e_OpenPnls;			// 要打开的面板
		var e_ClsPnls;			// 要关闭的面板

		var e_PcdrTrgrTch;		// 程序触发触摸
		var e_PntIptTrkr;		// 点输入追踪器

	//	var e_fOnRndPnlsOver;		// 当渲染面板结束

		//======== 私有函数

		//-------- 输入处理

		function eRegPageEvtHdlr()
		{
			// 由于采用各种技术检测“触点丢失”，不需要这些事件了
			//document.addEventListener("focus", eOnFoc, false);	// 按理说不应该冒泡，但火狐……
			//document.addEventListener("focusin", eOnFocIn, false);
			//document.addEventListener("focusout", eOnFocOut, false);

			//document.addEventListener("mousemove", eOnMosMove, false);
			//document.addEventListener("mousedown", eOnMosBtnDown, false);
			//document.addEventListener("mouseup", eOnMosBtnUp, false);
		}

		function eTrgrTch(a_TchId, a_Kind, a_X, a_Y)
		{
			e_PntIptTrkr.cTrgrTch(a_TchId, a_Kind, a_X, a_Y, null);
		}

		// 初始化
		function eInit()
		{
			e_PnlReg = [];
			e_PnlStk = [];
			e_LockPnlStk = false;
			e_OpenPnls = [];
			e_ClsPnls = [];

			e_PcdrTrgrTch = [];
			e_PntIptTrkr = new nWse.tPntIptTrkr();

		//	e_fOnRndPnlsOver = null;

			// 注册页面事件处理器
			eRegPageEvtHdlr();
		}
		eInit();

		function eFindPnlInRegByName(a_Name)
		{
			return nWse.stAryUtil.cFind(e_PnlReg, function (a_Ary, a_Idx, a_Elmt) { return a_Elmt.e_Name == a_Name; });
		}

		function eFindPnlInStkByName(a_Name)
		{
			return nWse.stAryUtil.cFind(e_PnlStk, function (a_Ary, a_Idx, a_Elmt) { return a_Elmt.e_Name == a_Name; });
		}

		function eAcsStkTopIdx()
		{
			return e_PnlStk.length - 1;
		}

		function eAcsStkTop()
		{
			return (e_PnlStk.length > 0) ? e_PnlStk[e_PnlStk.length - 1] : null;
		}

		function fIsPnlClsn(a_Pnl)
		{
			return (nPick.tPrmrSta.i_Exit == a_Pnl.cAcsRoot().e_PrmrSta); // 根处于退出状态？
		}

		function eSendMsg_Ent(a_Pnl)
		{
			var l_Msg = new tMsg(tMsg.tInrCode.i_Ent, a_Pnl.e_Name, nPick.tInrName.i_Frmwk);
			a_Pnl.vcHdlMsg(l_Msg);
		}

		function eSendMsg_Rsm(a_Pnl)
		{
			var l_Msg = new tMsg(tMsg.tInrCode.i_Rsm, a_Pnl.e_Name, nPick.tInrName.i_Frmwk);
			a_Pnl.vcHdlMsg(l_Msg);
		}

		function eSendMsg_PrprLea(a_Pnl)
		{
			var l_Msg = new tMsg(tMsg.tInrCode.i_PrprLea, a_Pnl.e_Name, nPick.tInrName.i_Frmwk);
			a_Pnl.vcHdlMsg(l_Msg);
		}

		function eSendMsg_Lea(a_Pnl)
		{
			var l_Msg = new tMsg(tMsg.tInrCode.i_Lea, a_Pnl.e_Name, nPick.tInrName.i_Frmwk);
			a_Pnl.vcHdlMsg(l_Msg);
		}

		function eSendMsg_Ocpy()
		{
			var l_Top = eAcsStkTop();
			var l_Msg = new tMsg(tMsg.tInrCode.i_Ocpy, l_Top.e_Name, nPick.tInrName.i_Frmwk);
			l_Top.vcHdlMsg(l_Msg);
		}

		function eSendMsg_Rtrt(a_Pnl)
		{
			var l_Msg = new tMsg(tMsg.tInrCode.i_Rtrt, a_Pnl.e_Name, nPick.tInrName.i_Frmwk);
			a_Pnl.vcHdlMsg(l_Msg);
		}

		function eSendMsg_OnRbndMainCvs()
		{
			//【注意】
			// GUI系统真正应该响应的是相机视域及视口变化！
			// 因为根据设计，当前系统和画布尺寸无关，但却和相机视域及视口紧密相关，
			// 不过考虑到在一个真实的应用程序里，相机视域及视口通常是固定不变的，所以暂时不作响应。

			//// 锁定面板栈
			//e_LockPnlStk = true;

			//// 栈顶→栈底
			//var l_Msg = new tMsg(tMsg.tInrCode.i_OnRbndMainCvs, null, tInrName.i_Frmwk);
			//stAryUtil.cRvsFor(e_PnlStk,
			//	function (a_Ary, a_Idx, a_Pnl)
			//	{
			//		l_Msg.c_Rcvr = a_Pnl.e_Name;
			//		a_Pnl.vcHdlMsg(l_Msg);
			//	});

			//// 解锁面板栈
			//e_LockPnlStk = false;
		}

		function eUpdAnmtMgr()
		{
			var l_FrmTime = 0, l_FrmItvl = 0, l_FrmNum = 0;
			l_FrmTime = e_RltmAfx.cGetFrmTime();
			l_FrmItvl = e_RltmAfx.cGetFrmItvl();
			l_FrmNum = e_RltmAfx.cGetFrmIdx();
			e_AnmtMgr.eUpd(l_FrmTime, l_FrmItvl, l_FrmNum);
		}

		function eRndPnls()
		{
			// 锁定面板栈
			e_LockPnlStk = true;

			// 栈底→栈顶
			var i, l_Len = e_PnlStk.length;
			for (i=0; i<l_Len; ++i)
			{
				e_PnlStk[i].vcRnd();
			}

			// 解锁面板栈
			e_LockPnlStk = false;
		}

		function eDfrdOpenClsPnls()
		{
			// 首先关闭不在打开之列的面板
			stAryUtil.cFor(e_ClsPnls,
				function (a_Ary, a_Idx, a_Name)
				{
					if (e_OpenPnls.indexOf(a_Name) < 0)
					{
						stFrmwk.cClsPnl(a_Name);
					}
				});

			// 然后打开面板
			stAryUtil.cFor(e_OpenPnls,
				function (a_Ary, a_Idx, a_Name)
				{
					stFrmwk.cOpenPnl(a_Name);
				});

			// 清空
			e_OpenPnls.length = 0;
			e_ClsPnls.length = 0;
		}

		// 处理输入和拾取
		function eHdlIptAndPick()
		{
			// 锁定面板栈
			e_LockPnlStk = true;

			// 如果有程序触发拾取
			if (e_PcdrTrgrTch.length > 0)
			{
				stAryUtil.cFor(e_PcdrTrgrTch,
					function (a_Ary, a_Idx, a_Tch)
					{ eTrgrTch(a_Tch.c_TchId, a_Tch.c_Kind, a_Tch.c_CvsX, a_Tch.c_CvsY); });

				e_PcdrTrgrTch.length = 0;
			}

			// 如果有活动触点，但队列为空，压入一个空输入，稍后的循环里会使用
			var l_PntIptQue = e_PntIptTrkr.cAcsPntIptQue();
			if (e_PntIptTrkr.cHasActTch() && (0 == l_PntIptQue.length))
			{
				eTrgrTch(null);
			}

			////#if 调试
			//(function (){if (e_FrmIptQue.length > 0){
			////	console.log("IptQueLen = " + e_FrmIptQue.length);
			//	var l_Str = "", i=0;
			//	for (; i<e_FrmIptQue.length; ++i) { l_Str += e_FrmIptQue[i].c_Tchs[0].c_Kind.toString() + ", "; } console.log(l_Str);
			//}})();//#endif

			//-------- 2d
			//	if (2 == s_GpuDvcDim)

			var l_PickBgn;
			var l_PntIpt;
			while (l_PntIptQue.length > 0)
			{
				l_PickBgn = false;

				// 取得并弹出队头帧输入
				l_PntIpt = l_PntIptQue.shift();

				// 注册活动触点
				e_PntIptTrkr.cRegActTchs(l_PntIpt);

				// 需要拾取？
				if ((l_PntIpt.c_FrmNum != stFrmwk.cAcsWgtPkr().cGetFrmNum()) && l_PntIpt.cNeedPick())
				{
				//	e_WgtPkr.ePickBgn(l_PntIpt.c_FrmNum, l_PntIpt.c_Tchs);
					l_PickBgn = true;
				}

				// 立即结束
				if (l_PickBgn)
				{
				//	e_WgtPkr.ePickEnd(true);
				}

				//#if
				if (0 == l_PntIpt.c_Tchs.length)
				{
					console.log("stFrmwk：哪来的空输入？");
				}//#endif

				// 准备处理
				l_PntIpt.cRdyToHdl();

				// 处理输入
				eHdlIpt(l_PntIpt);

				// 注销活动触点
				e_PntIptTrkr.cUrgActTchs(l_PntIpt);
			}

			// 解锁面板栈
			e_LockPnlStk = false;
		}

		//-------- 处理输入

		function eHdlIpt(a_Ipt)
		{
			// 首先交由面板栈处理
			// 栈顶→栈底
			var l_HasUhdlTch;
			var i, l_Len = e_PnlStk.length;
			for (i=l_Len-1; i>=0; --i)
			{
				e_PnlStk[i].vcHdlIpt(a_Ipt);

				// 如果已经没有未处理的触点，跳出
				l_HasUhdlTch = a_Ipt.cHasUhdlTch();
				if (! l_HasUhdlTch)
				{ break; }
			}

		//	console.log(a_Ipt.c_Tchs[0].c_Kind.toString());	//【调试】

			// 如果还有未处理的触点，自己处理
			if (l_HasUhdlTch)
			{
				eSelfHdlIpt(a_Ipt);
			}
		}

		function eSelfHdlIpt(a_Ipt)
		{
			//
		}

		//-------- 活动触点相关

		function eOnPrstTgtLost()
		{
			// 通知控件拾取器
			if (e_WgtPkr)
			{
				e_WgtPkr.eOnPrstTgtLost();
			}

			// 输入复位
			stFrmwk.cIptRset();

			// 通知栈里的面板
			eSendMsg_OnRbndMainCvs();
		}

		function eOnFrmBgn()
		{
			// 处理输入和拾取
			eHdlIptAndPick();
		}

		function eOnUpdToRnd()
		{
			//
		}

		function eOnFrmEnd()
		{
			// 如果有面板需要打开关闭，此时进行
			// 这应该在更新动画之前进行，因为打开或关闭通常伴随着动画效果
			if ((e_OpenPnls.length > 0) || (e_ClsPnls.length > 0))
			{
				eDfrdOpenClsPnls();
			}

			/* 【不需要实时更新渲染，由各个控件自行决定】
			// 更新动画管理器
			// 这应该在渲染面板之前进行，因为希望动画过程在这一帧里立即可见
			if (e_AnmtMgr)
			{
				eUpdAnmtMgr();
			}

			// 渲染面板
			if ((0 < e_PnlStk.length))
			{
				eRndPnls();
			}
			//*/

			//// 回调
			//if (e_fOnRndPnlsOver)
			//{
			//	e_fOnRndPnlsOver();
			//}

		}

		function eRegOn()
		{
			e_RltmAfx.cRegUnit(tRltmAfx.tFlowStg.i_PrstTgtLost, eOnPrstTgtLost, i_UnitPrio);
			e_RltmAfx.cRegUnit(tRltmAfx.tFlowStg.i_Upd, eOnFrmBgn, i_UnitPrio);
			e_RltmAfx.cRegUnit(tRltmAfx.tFlowStg.i_Rnd, eOnFrmEnd, i_UnitPrio);
		}

		function eUrgOn()
		{
			e_RltmAfx.cUrgUnit(tRltmAfx.tFlowStg.i_PrstTgtLost, eOnPrstTgtLost);
			e_RltmAfx.cUrgUnit(tRltmAfx.tFlowStg.i_Upd, eOnFrmBgn);
			e_RltmAfx.cUrgUnit(tRltmAfx.tFlowStg.i_Rnd, eOnFrmEnd);
		}

		//======== 公有函数

		/// 绑定实时应用程序框架
		stFrmwk.cBindRltmAfx = function (a_RltmAfx)
		{
			// 如果切换，需要通知所有已注册的面板及其控件
			if (null != e_RltmAfx)
			{
				//【TODO】 通知……

				// 解绑
				stFrmwk.cUbndRltmAfx();
			}

			// 绑定新的，注册
			e_RltmAfx = a_RltmAfx;
			eRegOn();

			// 初始化点输入追踪器
			e_PntIptTrkr.cInit({
				c_RltmAfx: e_RltmAfx	// 指定实时应用程序框架
			});
			return stFrmwk;
		};

		/// 解绑实时应用程序框架
		stFrmwk.cUbndRltmAfx = function ()
		{
			if (! e_RltmAfx)
			{
				return stFrmwk;
			}

			// 复位点输入追踪器
			e_PntIptTrkr.cRset();

			// 注销，解绑
			eUrgOn();
			e_RltmAfx = null;
			return stFrmwk;
		};

		/// 存取实时应用程序框架
		stFrmwk.cAcsRltmAfx = function ()
		{
			return e_RltmAfx;
		};

		// 存取呈现目标区
		stFrmwk.cAcsPrstTgtArea = function ()
		{
			var l_PrstTgt = e_RltmAfx.cAcsPrstTgt();
			e_PrstTgtArea.c_W = (l_PrstTgt ? l_PrstTgt.offsetWidth : 0);
			e_PrstTgtArea.c_H = (l_PrstTgt ? l_PrstTgt.offsetHeight : 0);
			return e_PrstTgtArea;
		};


		/// 存取控件拾取器
		stFrmwk.cAcsWgtPkr = function ()
		{
			if (! e_WgtPkr)
			{
				e_WgtPkr = new unKnl.tWgtPkr();
			}
			return e_WgtPkr;
		};

		/// 存取动画管理器
		stFrmwk.cAcsAnmtMgr = function ()
		{
			if (! e_AnmtMgr)
			{
				e_AnmtMgr = new tAnmtMgr();
			}
			return e_AnmtMgr;
		};



		/// 处理消息
		stFrmwk.cHdlMsg = function (a_Msg)
		{
			var i_Code = tMsg.tInrCode;
			switch (a_Msg.c_Code)
			{
				case i_Code.i_PrprOver:
				{
					// 在栈中找到面板
					var l_Idx = e_PnlStk.indexOf(a_Msg.c_Who);
					if (l_Idx >= 0)
					{
						// 如果已锁定
						//【说明】收到这条消息的唯一时机是在动画管理器更新时，此时面板栈不会被锁定
						if (e_LockPnlStk)
						{
							throw new Error("框架准备擦除面板，但面板栈却被锁定！");
						}

						// 擦除
						e_PnlStk.splice(l_Idx, 1);
					}
					else
					{
						throw new Error("框架收到了i_PrprOver，但在面板栈中却没有找到“" + a_Msg.c_Sndr + "”！");
					}
				} break;
			}

			return 0;
		};

		/// 注册面板
		stFrmwk.cRegPnl = function (a_Pnl)
		{
			if (! a_Pnl.e_Name)
			{
				throw new Error("要注册的面板还没有名称！");
			}

			if (! stFrmwk.cIsPnlReg(a_Pnl.e_Name))
			{
				e_PnlReg.push(a_Pnl);
			}
			return stFrmwk;
		};

		/// 注销面板
		stFrmwk.cUrgPnl = function (a_Name)
		{
			var l_Idx = eFindPnlInRegByName(a_Name);
			if (l_Idx >= 0)
			{
				e_PnlReg.splice(l_Idx, 1);
			}
			return stFrmwk;
		};

		/// 面板已注册？
		stFrmwk.cIsPnlReg = function (a_Name)
		{
			return (eFindPnlInRegByName(a_Name) >= 0);
		};

		/// 存取面板
		stFrmwk.cAcsPnl = function (a_Name)
		{
			var l_Idx = eFindPnlInRegByName(a_Name);
			return (l_Idx >= 0) ? e_PnlReg[l_Idx] : null;
		};

		/// 面板在栈中？
		stFrmwk.cIsPnlInStk = function (a_Name)
		{
			return (eFindPnlInStkByName(a_Name) >= 0);
		};

		/// 面板位于栈顶？
		stFrmwk.cIsPnlAtStkTop = function (a_Name)
		{
			return (eAcsStkTop().e_Name == a_Name);
		};

		/// 面板已打开？
		stFrmwk.cIsPnlOpen = function (a_Name)
		{
			var l_Idx = eFindPnlInStkByName(a_Name);
			return (l_Idx >= 0) && (! fIsPnlClsn(e_PnlStk[l_Idx])); // 在栈中，且未正在关闭
		};

		/// 面板正在关闭？
		stFrmwk.cIsPnlClsn = function (a_Name)
		{
			var l_Idx = eFindPnlInStkByName(a_Name);
			return (l_Idx < 0) ? false : fIsPnlClsn(e_PnlStk[l_Idx]);
		};

		/// 存取面板栈，【警告】不要修改！
		stFrmwk.cAcsPnlStk = function ()
		{
			return e_PnlStk;
		};

		/// 打开面板，【注意】若面板栈当前被锁定则延迟打开，并忽略a_Udfn$Idx
		/// a_Udfn$Idx：Number，插入索引，默认栈顶
		stFrmwk.cOpenPnl = function (a_Name, a_Udfn$Idx)
		{
			// 已锁定？
			if (e_LockPnlStk)
			{
				e_OpenPnls.push(a_Name);	// 记录，忽略插入索引
				return stFrmwk;
			}

			// 找到面板
			var l_Idx = eFindPnlInStkByName(a_Name);
			if (l_Idx >= 0) // 已在栈中？
			{
				// 若正在准备离栈，恢复，否则忽略这次调用
				if (fIsPnlClsn(e_PnlStk[l_Idx]))
				{
					eSendMsg_Rsm(e_PnlStk[l_Idx]);
				}
				return stFrmwk;
			}

			l_Idx = eFindPnlInRegByName(a_Name);
			if (l_Idx < 0) // 尚未注册？
			{
				throw new Error("要打开的面板“" + a_Name + "”尚未注册！");
			}

			// 确保有根
			var l_NewPnl = e_PnlReg[l_Idx];
			if (! l_NewPnl.cAcsRoot())
			{
				throw new Error("要打开的面板“" + a_Name + "”缺少根控件！");
			}

			// 压入至适当位置
			var l_OldTop = eAcsStkTop();
			var l_NewAtTop;
			if (nWse.fIsUdfnOrNull(a_Udfn$Idx) ||
				(! stAryUtil.cIsIdxVld(e_PnlStk, a_Udfn$Idx)))
			{
				e_PnlStk.push(l_NewPnl);
				l_NewAtTop = true;
			}
			else
			{
				e_PnlStk.splice(a_Udfn$Idx, 0, l_NewPnl);
				l_NewAtTop = false;
			}

			// 通知后退、进栈、占据
			if (l_OldTop)
			{
				eSendMsg_Rtrt(l_OldTop);
			}

			eSendMsg_Ent(l_NewPnl);

			if (l_NewAtTop)
			{
				eSendMsg_Ocpy();
			}

			return stFrmwk;
		};

		/// 关闭面板，【注意】若面板栈当前被锁定则延迟关闭
		stFrmwk.cClsPnl = function (a_Name)
		{
			// 已锁定？
			if (e_LockPnlStk)
			{
				e_ClsPnls.push(a_Name);	// 记录
				return stFrmwk;
			}

			// 找到面板
			var l_Idx = eFindPnlInStkByName(a_Name);
			if (l_Idx < 0) // 不在栈中？
			{
				return stFrmwk;
			}

			// 如果正在关闭（根的主状态为i_Exit），忽略这次调用
			var l_Pnl = e_PnlStk[l_Idx];
			if (fIsPnlClsn(l_Pnl))
			{
				console.log("cClsPnl：重复关闭，忽略");
				return stFrmwk;
			}

			// 通知准备离栈
			eSendMsg_PrprLea(l_Pnl);
			return stFrmwk;
		};

		/// 触发触摸，【注意】如果触发拾取，将在下一帧进行
		/// a_TchId：String，触点ID，键盘是“K”，鼠标是“M”，触摸点是“0……”
		/// a_Kind：tPntIpt.tKind，种类，触发拾取的是i_TchBgn和i_TchEnd
		/// a_CvsX：Number，触点相对于主画布的x坐标
		/// a_CvsY：Number，触点相对于主画布的y坐标
		stFrmwk.cTrgrTch = function (a_TchId, a_Kind, a_CvsX, a_CvsY)
		{
			if ((! a_TchId) || (0 == a_TchId.length))
			{
				throw new Error("cTrgrTch：a_TchId必须有效");
			}

			a_TchId = a_TchId.toString();
			e_PcdrTrgrTch.push({ c_TchId : a_TchId, c_Kind : a_Kind, c_CvsX : a_CvsX, c_CvsY : a_CvsY });
			return stFrmwk;
		};

		/// 输入复位，用于应对“触点丢失”
		stFrmwk.cIptRset = function ()
		{
			// 锁定面板栈
			e_LockPnlStk = true;

			// 栈顶→栈底，所有面板输入复位
			stAryUtil.cRvsFor(e_PnlStk,
				function (a_Ary, a_Idx, a_Pnl)
				{
					a_Pnl.vcIptRset();
				});

			// 解锁面板栈
			e_LockPnlStk = false;

			// 清空活动触点
			e_PntIptTrkr.cClrActTchs();
		};

		///// 获取当渲染面板结束
		//stFrmwk.cGetOnRndPnlsOver = function ()
		//{
		//	return e_fOnRndPnlsOver;
		//};
		//
		///// 设置当渲染面板结束
		//stFrmwk.cSetOnRndPnlsOver = function (a_fOn)
		//{
		//	e_fOnRndPnlsOver = a_fOn;
		//	return stFrmwk;
		//};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////