/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.tPntIptTrkr)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
		//	"(3)CoreDast.js"
			"DomUtil.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("PntIptTrkr.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stAryUtil = nWse.stAryUtil;
	var stFctnUtil = nWse.stFctnUtil;
	var stDomUtil = nWse.stDomUtil;

	var tPntIptTrkr, tPntIpt, tPntIptKind, tTch;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	// 鼠标键盘触点ID
	var i_TchId_Kbd = "K", i_TchId_Mos = "M";

	function fRsetMos(a_This)
	{
		a_This.e_MosDown = false;
		a_This.e_IgnrMosEvt = false;	// 复位：接受鼠标事件
	}

	function fIsKindOfMosMoveSrs(a_Kind)
	{
		return (a_Kind.valueOf() < tPntIptKind.i_MosMove.valueOf());
	}

	function eRegPageEvtHdlr(a_This)
	{
		// 由于采用各种技术检测“触点丢失”，不需要这些事件了
		//document.addEventListener("focus", eOnFoc, false);	// 按理说不应该冒泡，但火狐……
		//document.addEventListener("focusin", eOnFocIn, false);
		//document.addEventListener("focusout", eOnFocOut, false);

		if (a_This.e_fOnMosMove)
		{ return; }

		a_This.e_fOnMosMove = function (a_Evt)
		{
			a_Evt = a_Evt || window.event;

			// 【BUG】IE11在鼠标离开文档后就不再触发鼠标事件给document
			// 而不用调用preventDefault()就OK，但其他浏览器会开始拖选文字……
		//	console.log("mousemove");

			var l_This = a_This;
			var l_Kind = tPntIptKind.i_TchMove;
			if (! l_This.e_MosDown)		// 未按下时忽略
			{
			//	l_This.e_IgnrMosEvt = false;	// 复位：接受鼠标事件，【不要加上这句，Chrome模拟器会连续触发】

				if (l_This.e_HdlMosMove) // 如果要处理鼠标移动
				{ l_Kind = tPntIptKind.i_MosMove; }
				else
				{ return false; }
			}

			if (l_This.e_IgnrMosEvt)	// 忽略？
			{
				l_This.e_MosDown = false;	// 复位
				return false;
			}

			return ePushMosIpt(l_This, l_Kind, a_Evt);
		};

		a_This.e_fOnMosBtnDown = function (a_Evt)
		{
			a_Evt = a_Evt || window.event;

			if (0 != a_Evt.button)	// 只响应主键，其他按键以默认方式处理（不返回false）
			{ return; }

			var l_This = a_This;
			if (l_This.e_IgnrMosEvt)	// 忽略？
			{
				l_This.e_MosDown = false;		// 复位
				return false;
			}

			l_This.e_MosDown = true;
			return ePushMosIpt(l_This, tPntIptKind.i_TchBgn, a_Evt);
		};

		a_This.e_fOnMosBtnUp = function (a_Evt)
		{
			a_Evt = a_Evt || window.event;

			if (0 != a_Evt.button)	// 只响应主键，其他按键以默认方式处理（不返回false）
			{ return; }

			var l_This = a_This;
			if (l_This.e_IgnrMosEvt)	// 忽略？
			{
				l_This.e_IgnrMosEvt = false;	// 复位：接受鼠标事件
				l_This.e_MosDown = false;		// 复位
				return false;
			}

			fRsetMos(l_This); // 谨慎的做法……
			return ePushMosIpt(l_This, tPntIptKind.i_TchEnd, a_Evt);
		};

		stDomUtil.cAddEvtHdlr(window, "mousemove", a_This.e_fOnMosMove, false);
		stDomUtil.cAddEvtHdlr(window, "mousedown", a_This.e_fOnMosBtnDown, false);
		stDomUtil.cAddEvtHdlr(window, "mouseup", a_This.e_fOnMosBtnUp, false);

		var l_fOnMosEnt, l_fOnMosLea;
		if (a_This.e_HdlMosEntLea) // 如果还需要处理mouseover（Ent)和mouseout（Lea）
		{
			a_This.e_fOnMosEnt = function (a_Evt)
			{
				a_Evt = a_Evt || window.event;
				return ePushMosIpt(l_This, tPntIptKind.i_MosEnt, a_Evt);
			};

			a_This.e_fOnMosLea = function (a_Evt)
			{
				a_Evt = a_Evt || window.event;
				return ePushMosIpt(l_This, tPntIptKind.i_MosLea, a_Evt);
			};

			stDomUtil.cAddEvtHdlr(window, "mouseover", a_This.e_fOnMosEnt, false);
			stDomUtil.cAddEvtHdlr(window, "mouseout", a_This.e_fOnMosLea, false);
		}


		a_This.e_fOnTchMove = function (a_Evt)
		{
			a_Evt = a_Evt || window.event;

			var l_This = a_This;
			l_This.e_IgnrMosEvt = true;		// 忽略鼠标事件
			return ePushTchIpt(l_This, tPntIptKind.i_TchMove, a_Evt);

//			//【调试iPad】
//			var l_TestOpt = document.getElementById("k_TestOpt");
//			if (l_TestOpt)
//			{ l_TestOpt.textContent = a_Evt.touches[0].identifier + ", " + a_Evt.touches[0].clientX + ", " + a_Evt.touches[0].clientY; }
		};

		a_This.e_fOnTchDown = function (a_Evt)
		{
			a_Evt = a_Evt || window.event;

			var l_This = a_This;
			l_This.e_IgnrMosEvt = true;		// 忽略鼠标事件
			return ePushTchIpt(l_This, tPntIptKind.i_TchBgn, a_Evt);
		};

		a_This.e_fOnTchUp = function (a_Evt)
		{
			a_Evt = a_Evt || window.event;

			var l_This = a_This;
			l_This.e_IgnrMosEvt = true;		// 忽略鼠标事件
			return ePushTchIpt(l_This, tPntIptKind.i_TchEnd, a_Evt);
		};

		stDomUtil.cAddEvtHdlr(window, "touchmove", a_This.e_fOnTchMove, false);
		stDomUtil.cAddEvtHdlr(window, "touchstart", a_This.e_fOnTchDown, false);
		stDomUtil.cAddEvtHdlr(window, "touchend", a_This.e_fOnTchUp, false);
	}

	function eUrgPageEvtHdlr(a_This)
	{
		if (! a_This.e_fOnMosMove)
		{ return; }

		stDomUtil.cRmvEvtHdlr(window, "mousemove", a_This.e_fOnMosMove, false);
		stDomUtil.cRmvEvtHdlr(window, "mousedown", a_This.e_fOnMosBtnDown, false);
		stDomUtil.cRmvEvtHdlr(window, "mouseup", a_This.e_fOnMosBtnUp, false);
		a_This.e_fOnMosMove = null;
		a_This.e_fOnMosBtnDown = null;
		a_This.e_fOnMosBtnUp = null;

		stDomUtil.cRmvEvtHdlr(window, "touchmove", a_This.e_fOnTchMove, false);
		stDomUtil.cRmvEvtHdlr(window, "touchstart", a_This.e_fOnTchDown, false);
		stDomUtil.cRmvEvtHdlr(window, "touchend", a_This.e_fOnTchUp, false);
		a_This.e_fOnTchMove = null;
		a_This.e_fOnTchDown = null;
		a_This.e_fOnTchUp = null;
	}

	function ePushMosIpt(a_This, a_Kind, a_Evt)
	{
		// 处理结果，默认继续处理
		var l_Rst = true;

		// 立即处理或立即并缓冲？此时只有一个触点
		var l_PntIpt;
		if (0 != a_This.e_HdlMode)
		{
			if (a_This.e_fImdtHdlr)
			{
				l_PntIpt = a_This.e_ImdtPntIpt;
				l_PntIpt.c_Tchs[0].cCrt(i_TchId_Mos, a_Kind, a_Evt.clientX, a_Evt.clientY, a_Evt);
				eActTchsReg(a_This, a_This.e_ImdtActTchs, l_PntIpt);	// 注册活动触点
				l_Rst = a_This.e_fImdtHdlr(l_PntIpt);		// 处理
				eActTchsUrg(a_This, a_This.e_ImdtActTchs, l_PntIpt);	// 注销活动触点
				l_PntIpt.c_Tchs[0].eRspsByDomEvtFlag();		// 响应事件标志
			}
		}

		// 把输入缓冲起来
		if (1 != a_This.e_HdlMode)
		{
			if (! fIsKindOfMosMoveSrs(a_Kind)) // 如果不是鼠标移动系列
			{
				eTrgrTch(a_This, i_TchId_Mos, a_Kind, a_Evt.clientX, a_Evt.clientY, a_Evt);
				l_Rst = false; // 已处理
			}
		}

		// 返回
		return l_Rst;
	}

	function ePushTchIpt(a_This, a_Kind, a_Evt)
	{
		// 处理结果，默认继续处理
		var l_Rst = true;

		// 当前正在追踪的触点在touches，但是触摸结束时这些触点就从该数组删除，此时应使用changedTouches
//		var l_EvtTchs = a_Evt.touches;
//		if ((tPntIptKind.i_TchEnd == a_Kind))
//		{
//			l_EvtTchs = Array.prototype.concat.call(a_Evt.touches, a_Evt.changedTouches);
//		}
		var l_EvtTchs = (tPntIptKind.i_TchEnd == a_Kind) ? a_Evt.changedTouches : a_Evt.touches;

		// 立即处理或立即并缓冲？
		var l_PntIpt;
		if (0 != a_This.e_HdlMode)
		{
			if (a_This.e_fImdtHdlr)
			{
				l_PntIpt = new tPntIpt(0);
				stAryUtil.cFor(l_EvtTchs,
					function (a_EvtTchs, a_EvtTchIdx, a_EvtTch)
					{
						l_PntIpt.eAddTch(a_EvtTch.identifier, a_Kind, a_EvtTch.clientX, a_EvtTch.clientY, a_Evt, a_EvtTch);
					});
				eActTchsReg(a_This, a_This.e_ImdtActTchs, l_PntIpt);	// 注册活动触点
				l_Rst = a_This.e_fImdtHdlr(l_PntIpt);		// 处理
				eActTchsUrg(a_This, a_This.e_ImdtActTchs, l_PntIpt);	// 注销活动触点
				stAryUtil.cFor(l_PntIpt.c_Tchs,
					function (a_Tchs, a_TchIdx, a_Tch)
					{
						a_Tch.eRspsByDomEvtFlag();		// 响应事件标志
					});
			}
		}

		// 把输入缓冲起来
		if (1 != a_This.e_HdlMode)
		{
			stAryUtil.cFor(l_EvtTchs,
				function (a_EvtTchs, a_EvtTchIdx, a_EvtTch)
				{
					eTrgrTch(a_This, a_EvtTch.identifier, a_Kind, a_EvtTch.clientX, a_EvtTch.clientY, a_EvtTch);
				});
		}

		// 返回
		return l_Rst;
	}

	function eAcsQueTail(a_This)
	{
		return (a_This.e_PntIptQue.length > 0) ? a_This.e_PntIptQue[a_This.e_PntIptQue.length - 1] : null;
	}

	function eTrgrTch(a_This, a_TchId, a_Kind, a_X, a_Y, a_Evt)
	{
		var l_X = a_X, l_Y = a_Y;
		var l_FrmNum = a_This.e_RltmAfx ? a_This.e_RltmAfx.cGetFrmNum() : 0;	// 这一帧编号（从1开始）

		// 压入空输入？
		if (! a_TchId)
		{
			a_This.e_PntIptQue.push(new tPntIpt(l_FrmNum));
			return;
		}

		// 取得字符串表示
		a_TchId = a_TchId.toString();

		// 帧编号与队尾的是否相同？
		// 如果未启用帧编号，或两者不同，直接压入
		var l_TailPntIpt, l_TchIdx, l_Tch;
		if ((l_FrmNum <= 0) || (0 == a_This.e_PntIptQue.length) || (eAcsQueTail(a_This).c_FrmNum != l_FrmNum))
		{
			l_PntIpt = new tPntIpt(l_FrmNum);
			l_PntIpt.eAddTch(a_TchId, a_Kind, l_X, l_Y, a_Evt);
			a_This.e_PntIptQue.push(l_PntIpt);
		}
		else // 相同，根据触点ID增加、替换、丢弃
		{
			l_TailPntIpt = eAcsQueTail(a_This);
			l_TchIdx = l_TailPntIpt.cFindTchById(a_TchId);
			if (l_TchIdx < 0) // 未找到时增加
			{
				l_TailPntIpt.eAddTch(a_TchId, a_Kind, l_X, l_Y, a_Evt);
			}
			else // 找到时，i_TchBgn和i_TchEnd替换，其余丢弃
			if ((tPntIptKind.i_TchBgn == a_Kind) || (tPntIptKind.i_TchEnd == a_Kind))
			{
				l_Tch = l_TailPntIpt.c_Tchs[l_TchIdx];
				l_Tch.c_Kind = a_Kind;
				l_Tch.c_X = l_X;
				l_Tch.c_Y = l_Y;
				l_Tch.c_Evt = a_Evt;
			}
		}
	}

	//-------- 活动触点相关

	function eActTchsClr(a_This)
	{
		if (a_This.e_ActTchs)
		{ a_This.e_ActTchs.length = 0; }

		if (a_This.e_ImdtActTchs)
		{ a_This.e_ImdtActTchs.length = 0; }
	}

	function eActTchsFind(a_This, a_ActTchs, a_TchId)
	{
		return stAryUtil.cFind(a_ActTchs, function (a_Ary, a_Idx, a_AT) { return a_AT.c_TchId == a_TchId; });
	}

	function eActTchsReg(a_This, a_ActTchs, a_Ipt)
	{
		// 首先，对于a_ActTchs里有的触点，若a_Ipt里没有则补充i_TchCtnu输入，否则更新坐标
		stAryUtil.cFor(a_ActTchs,
			function (a_Ary, a_Idx, a_AT)
			{
				var l_IdxInIpt = a_Ipt.cFindTchById(a_AT.c_TchId);
				var l_TchInIpt;
				if (l_IdxInIpt < 0)
				{
					a_Ipt.eAddTch(a_AT.c_TchId, tPntIptKind.i_TchCtnu, a_AT.c_X, a_AT.c_Y, a_AT.c_Evt);
				}
				else
				{
					// 计算偏移量和累计偏移距离，并更新记录
					l_TchInIpt = a_Ipt.c_Tchs[l_IdxInIpt];
					l_TchInIpt.c_OfstX = l_TchInIpt.c_X - a_AT.c_X;
					l_TchInIpt.c_OfstY = l_TchInIpt.c_Y - a_AT.c_Y;
					a_AT.c_X = l_TchInIpt.c_X;
					a_AT.c_Y = l_TchInIpt.c_Y;
					a_AT.c_AccOfstDistX += Math.abs(l_TchInIpt.c_OfstX);
					a_AT.c_AccOfstDistY += Math.abs(l_TchInIpt.c_OfstY);

					// 复制记录
					l_TchInIpt.c_BgnX = a_AT.c_BgnX;
					l_TchInIpt.c_BgnY = a_AT.c_BgnY;
					l_TchInIpt.c_AccOfstDistX = a_AT.c_AccOfstDistX;
					l_TchInIpt.c_AccOfstDistY = a_AT.c_AccOfstDistY;

//					//【调试iPad】
//					var l_TestOpt = document.getElementById("k_TestOpt");
//					if (l_TestOpt)// && (tPntIptKind.i_TchMove == l_TchInIpt.c_Kind))
//					{ l_TestOpt.textContent = l_TchInIpt.c_TchId + ", " + l_TchInIpt.c_AccOfstDistX + ", " + l_TchInIpt.c_AccOfstDistY; }
				}
			});

		// 然后，对于a_Ipt里种类为i_TchBgn的输入，若a_ActTchs里没有，注册
		stAryUtil.cFor(a_Ipt.c_Tchs,
			function (a_Ary, a_Idx, a_Tch)
			{
				//【说明】
				// 若触点的位置离开文档，将种类换成i_TchLost，以应对“触点丢失”
				if (fIsTchLost(a_Tch))
				{
					a_Tch.c_Kind = tPntIptKind.i_TchLost;
					//	console.log("触点丢失：" + a_Tch.c_TchId);
				}
				else
				if ((tPntIptKind.i_TchBgn == a_Tch.c_Kind) && (eActTchsFind(a_This, a_ActTchs, a_Tch.c_TchId) < 0))
				{
					a_ActTchs.push({				// 注意这里不需要c_Kind
						c_TchId : a_Tch.c_TchId,	// 触点ID
						c_X : a_Tch.c_X,			// 客户区坐标系位置
						c_Y : a_Tch.c_Y,
						c_BgnX : a_Tch.c_X,			// 追踪触摸屏的滑屏
						c_BgnY : a_Tch.c_Y,
						c_AccOfstDistX : 0,
						c_AccOfstDistY : 0,
						c_Evt : a_Tch.c_Evt			// 事件
					});
				}
			});
	}

	function eActTchsUrg(a_This, a_ActTchs, a_Ipt)
	{
		// 对于a_Ipt里种类为i_TchEnd的输入，若a_ActTchs里有，注销
		stAryUtil.cFor(a_Ipt.c_Tchs,
			function (a_Ary, a_Idx, a_Tch)
			{
				var l_Idx;
				if (tPntIptKind.i_TchEnd == a_Tch.c_Kind)
				{
					//	console.log("i_TchEnd：" + a_Tch.c_TchId);

					l_Idx = eActTchsFind(a_This, a_ActTchs, a_Tch.c_TchId);
					if (l_Idx >= 0)
					{
						//	console.log("ers");
						a_ActTchs.splice(l_Idx, 1);
					}
				}
			});
	}

	function fIsTchLost(a_Tch) // 触点丢失？
	{
//		var l_MainnPick.tLotCltBbox = stRltmAfx.cAcsMainnPick.tLotCltBbox();
//		var l_CltX = a_Tch.c_nPick.tLotX + l_MainnPick.tLotCltBbox.c_X;
//		var l_CltY = a_Tch.c_nPick.tLotY + l_MainnPick.tLotCltBbox.c_Y;
		var l_CltX = a_Tch.c_X;
		var l_CltY = a_Tch.c_Y;
		var l_DocElmt = document.documentElement;
		return	(l_CltX < l_DocElmt.clientLeft) || (l_DocElmt.clientLeft + l_DocElmt.clientWidth  <= l_CltX) ||
				(l_CltY < l_DocElmt.clientTop)  || (l_DocElmt.clientTop  + l_DocElmt.clientHeight <= l_CltY);
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 点输入追踪器

	(function ()
	{
		tPntIptTrkr = nWse.fClass(nWse,
		/// 点输入追踪器
		function tPntIptTrkr()
		{
			//【不用了，由外界调用cInit()】
		//	this.cRset();
		}
		,
		null
		,
		{
			/// 重置
			cRset : function ()
			{
				var l_This = this;
				eUrgPageEvtHdlr(l_This);		// 注销页面事件处理器
				l_This.e_PntIptQue = [];		// 点输入队列
				l_This.e_PcdrTrgrTch = [];		// 程序触发触摸
				l_This.e_ActTchs = [];			// 活动触点
				l_This.e_ImdtActTchs = [];		// 立即活动触点
				l_This.e_MosDown = false;		// 鼠标按下？
				l_This.e_IgnrMosEvt = false;	// 忽略鼠标事件？
				l_This.e_HdlMode = 0;			// 处理模式
				l_This.e_fImdtHdlr = null;		// 立即处理函数
				return l_This;
			}
			,
			/// 初始化
			/// a_Cfg：Object
			/// {
			/// c_HdlMode：Number，处理模式，0（默认）=缓冲，1=立即，2=立即并缓冲
			/// c_HdlMosMove：Boolean，处理鼠标移动？默认false，仅适用于立即处理模式
			/// c_HdlMosEntLea：Boolean，处理鼠标进入离开？默认false，仅适用于立即处理模式
			/// c_RltmAfx：tRltmAfx，实时应用程序框架，默认null
			/// }
			cInit : function (a_Cfg)
			{
				var l_This = this;
				this.cRset();
				this.e_Cfg = a_Cfg;
				this.e_HdlMode = a_Cfg.c_HdlMode || 0;
				this.e_RltmAfx = a_Cfg.c_RltmAfx || null;
				this.e_HdlMosMove = (0 != this.e_HdlMode) && (a_Cfg.c_HdlMosMove || false);
				this.e_HdlMosEntLea = (0 != this.e_HdlMode) && (a_Cfg.c_HdlMosEntLea || false);

				if (0 != this.e_HdlMode) // 立即处理或立即并缓冲
				{
					// 创建一个专用于立即处理的点输入，参数随意
					l_This.e_ImdtPntIpt = new tPntIpt(0);
					l_This.e_ImdtPntIpt.eAddTch(null, tPntIptKind.i_TchEnd, 0, 0, null);
				}

				// 注册页面事件处理器
				eRegPageEvtHdlr(this);
				return this;
			}
			,
			/// 输入复位，用于应对“触点丢失”
			cIptRset : function ()
			{
				// 清空活动触点
				this.cClrActTchs();
				return this;
			}
			,
			/// 获取立即处理器
			cGetImdtHdlr : function (a_fHdl)
			{
				return this.e_fImdtHdlr;
			}
			,
			/// 设置立即处理器
			cSetImdtHdlr : function (a_fHdl)
			{
				this.e_fImdtHdlr = a_fHdl || null;
				return this;
			}
			,
			/// 有活动触点？
			cHasActTch : function ()
			{
				return this.e_ActTchs.length > 0;
			}
			,
			/// 存取活动触点
			cAcsActTchs : function ()
			{
				return this.e_ActTchs;
			}
			,
			/// 清空活动触点
			cClrActTchs : function ()
			{
				eActTchsClr(this);
				return this;
			}
			,
			/// 注册活动触点
			cRegActTchs : function (a_Ipt)
			{
				eActTchsReg(this, this.e_ActTchs, a_Ipt);
				return this;
			}
			,
			/// 注销活动触点
			cUrgActTchs : function (a_Ipt)
			{
				eActTchsUrg(this, this.e_ActTchs, a_Ipt);
				return this;
			}
			,
			/// 触发触摸
			cTrgrTch : function (a_TchId, a_Kind, a_X, a_Y, a_Evt)
			{
				eTrgrTch(this, a_TchId, a_Kind, a_X, a_Y, a_Evt);
				return this;
			}
			,
			/// 存取点输入队列
			cAcsPntIptQue : function ()
			{
				return this.e_PntIptQue;
			}
		}
		,
		{
			/// 触点ID - 键盘
			i_TchId_Kbd : i_TchId_Kbd
			,
			/// 触点ID - 鼠标
			i_TchId_Mos : i_TchId_Mos
		}
		,
		false);
	})();

	(function ()
	{
		tPntIpt = nWse.fClass(tPntIptTrkr,
		/// 点输入
		/// —— 字段 ——
		/// c_FrmNum：Number，帧编号，从1开始
		/// c_Tchs：tTch[]，触点数组
		function tPntIpt(a_FrmNum)
		{
			this.c_FrmNum = a_FrmNum || 0;	// 帧编号
			this.c_Tchs = [];				// 触点数组
		}
		,
		null
		,
		{
			eAddTch : function (a_TchId, a_Kind, a_X, a_Y, a_Evt, a_EvtTch)
			{
				this.c_Tchs.push(new tPntIpt.tTch(a_TchId, a_Kind, a_X, a_Y, a_Evt, a_EvtTch));
				return this;
			}
			,
			/// 遍历触点
			cForTchs : function (a_fCabk)
			{
				var l_Tchs = this.c_Tchs, l_Tch;
				var i, l_Len = l_Tchs.length;
				for (i=0; i<l_Len; ++i)
				{
					l_Tch = l_Tchs[i];
					a_fCabk(l_Tchs, i, l_Tch);
				}
				return this;
			}
			,
			/// 根据种类遍历触点
			/// a_SkipHdld：Boolean，是否跳过已被处理的，默认false
			/// a_fCabk：Function，undefined f(触点数组, 索引, 触点)
			cForTchsByKind : function (a_Kind, a_SkipHdld, a_fCabk)
			{
				var l_Tchs = this.c_Tchs, l_Tch;
				var i, l_Len = l_Tchs.length;
				for (i=0; i<l_Len; ++i)
				{
					l_Tch = l_Tchs[i];
					if ((l_Tch.c_Kind != a_Kind) || (a_SkipHdld && l_Tch.c_Hdld))
					{ continue; }

					a_fCabk(l_Tchs, i, l_Tch);
				}
				return this;
			}
			,
			/// 遍历未处理的触点
			/// a_fCabk：Function，undefined f(触点数组, 索引, 触点)
			cForUhdlTchs : function (a_fCabk)
			{
				var l_Tchs = this.c_Tchs, l_Tch;
				var i, l_Len = l_Tchs.length;
				for (i=0; i<l_Len; ++i)
				{
					l_Tch = l_Tchs[i];
					if (l_Tch.c_Hdld)
					{ continue; }

					a_fCabk(l_Tchs, i, l_Tch);
				}
				return this;
			}
			,
			/// 存取触点 - 鼠标
			cAcsTch_Mos : function ()
			{
				var l_Idx = this.cFindTchById(i_TchId_Mos);
				return (l_Idx < 0) ? null : this.c_Tchs[l_Idx];
			}
			,
			/// 根据ID查找触点
			cFindTchById : function (a_TchId)
			{
				return stAryUtil.cFind(this.c_Tchs, function (a_Ary, a_Idx, a_Tch) { return a_Tch.c_TchId == a_TchId; });
			}
			,
			/// 根据拾取到的控件查找触点
			/// a_fMap：Object f(Object a_PkdWgt)，将输入控件映射成另一个对象（比如控件→放置目标）再进行比较，默认null
			cFindTchByPkdWgt : function (a_PkdWgt, a_fMap)
			{
				return a_PkdWgt ? stAryUtil.cFind(this.c_Tchs,
					function (a_Ary, a_Idx, a_Tch)
					{
						if (! a_fMap)
						{ return a_Tch.c_PkdWgt === a_PkdWgt; }

						var l_D = a_fMap(a_Tch.c_PkdWgt), l_A = a_fMap(a_PkdWgt);
						return nWse.stDomUtil.cIsSelfOrAcst(l_A, l_D);
					}) : -1;
			}
			,
			/// 根据拾取到的面板查找触点（仅用于nPick)
			eFindTchByPkdPnl : function (a_PkdPnl)
			{
				return a_PkdPnl ? stAryUtil.cFind(this.c_Tchs, function (a_Ary, a_Idx, a_Tch) { return a_Tch.c_PkdPnl == a_PkdPnl; }) : -1;
			}
			,
			/// 有未处理触点？
			cHasUhdlTch : function ()
			{
				return (stAryUtil.cFind(this.c_Tchs, function (a_Ary, a_Idx, a_Tch) { return (! a_Tch.c_Hdld); }) >= 0);
			}
			,
			/// 设置触点已处理
			cSetTchsHdld : function (a_YesNo)
			{
				stAryUtil.cFor(this.c_Tchs, function (a_Ary, a_Idx, a_Tch) { return a_Tch.c_Hdld = a_YesNo; });
				return this;
			}
			,
			/// 有给定种类的触点？
			cHasTchOfKind : function (a_Kind)
			{
				return (stAryUtil.cFind(this.c_Tchs, function (a_Ary, a_Idx, a_Tch) { return (a_Tch.c_Kind == a_Kind); }) >= 0);
			}
			,
			/// 有i_TchBgn或i_TchEnd两种触点？
			cHasTchBgnOrEnd : function ()
			{
				return (stAryUtil.cFind(this.c_Tchs, function (a_Ary, a_Idx, a_Tch)
					{ return (a_Tch.c_Kind == tPntIptKind.i_TchBgn) || (a_Tch.c_Kind == tPntIptKind.i_TchEnd); }) >= 0);
			}
			,
			/// 需要拾取？若含有i_TchBgn、i_TchEnd，需要
			cNeedPick : function ()
			{
				return (stAryUtil.cFind(this.c_Tchs,
					function (a_Ary, a_Idx, a_Tch)
					{
						return (tPntIptKind.i_TchBgn == a_Tch.c_Kind) || (tPntIptKind.i_TchEnd == a_Tch.c_Kind);
					}) >= 0);
			}
			,
			/// 准备处理
			cRdyToHdl : function ()
			{
				var i, l_Len = this.c_Tchs.length, l_Tch;
				for (i=0; i<l_Len; ++i)
				{
					// 尚未被处理，记录拾取到的面板
					l_Tch = this.c_Tchs[i];
					l_Tch.c_Hdld = false;
					l_Tch.c_PkdPnl = l_Tch.c_PkdWgt ? l_Tch.c_PkdWgt.cAcsPnl() : null;
				}
				return this;
			}
		});

	tPntIptKind = nWse.fEnum(tPntIpt,
		/// 种类
		function tKind() {}, null,
		{
			/// 触摸开始
			i_TchBgn : 0
			,
			/// 触摸继续
			i_TchCtnu : 1
			,
			/// 触摸移动
			i_TchMove : 2
			,
			/// 触摸结束
			i_TchEnd : 3
			,
			/// 触摸丢失
			i_TchLost : 4
			,
			/// 鼠标移动
			i_MosMove : 12
			,
			/// 鼠标进入
			i_MosEnt : 13
			,
			/// 鼠标离开
			i_MosLea : 14
		});

		tTch = nWse.fClass(tPntIpt,
		/// 触点
		/// —— 字段 ——
		/// c_TchId：String，触点ID
		/// c_Kind：tPntIpt.tKind，种类
		/// c_X，c_Y：Number，客户区坐标系位置
		/// c_OfstX，c_OfstY：Number，客户区坐标系偏移量
		/// c_Hdld：Boolean，已处理？默认false
		/// c_Evt：Event，DOM事件
		/// c_EvtTch：Touch，DOM事件的触点信息
		/// c_EvtTgt：HTMLElement，事件目标，可能不同于c_Evt.target
		/// c_PvtDft：Boolean，仅用于立即处理，阻止默认动作？默认false
		/// c_StopPpgt：Boolean，仅用于立即处理，停止传播？默认false
		/// c_StopImdtPpgt：Boolean，仅用于立即处理，停止立即传播？默认false
		function tTch(a_TchId, a_Kind, a_X, a_Y, a_Evt, a_EvtTch, a_EvtTgt)
		{
			this.cCrt(a_TchId, a_Kind, a_X, a_Y, a_Evt, a_EvtTch, a_EvtTgt);
		}
		,
		null
		,
		{
			/// 创建
			cCrt : function (a_TchId, a_Kind, a_X, a_Y, a_Evt, a_EvtTch, a_EvtTgt)
			{
				this.c_TchId = a_TchId;
				this.c_Kind = a_Kind;
				this.c_X = a_X;
				this.c_Y = a_Y;
				this.c_OfstX = 0;
				this.c_OfstY = 0;
				this.c_Hdld = false;
				this.c_Evt = a_Evt || null;
				this.c_EvtTch = a_EvtTch || null;
				this.c_EvtTgt = a_EvtTgt || (this.c_Evt && (this.c_Evt.target || this.c_Evt.srcElement));
				this.c_PvtDft = false;
				this.c_StopPpgt = false;
				this.c_StopImdtPpgt = false;

				if (tPntIptKind.i_TchBgn == a_Kind) // 记录起点坐标，累计偏移距离
				{
					this.c_BgnX = a_X;
					this.c_BgnY = a_Y;
					this.c_AccOfstDistX = 0;
					this.c_AccOfstDistY = 0;
				}

				return this;
			}
			,
			/// 设置DOM事件标志
			cSetDomEvtFlag : function (a_PvtDft, a_StopPpgt, a_StopImdtPpgt)
			{
				this.c_PvtDft = !! a_PvtDft;
				this.c_StopPpgt = !! a_StopPpgt;
				this.c_StopImdtPpgt = !! a_StopImdtPpgt;
				return this;
			}
			,
			/// 存取事件目标
			cAcsEvtTgt : function ()
			{
				return this.c_EvtTgt || (this.c_Evt && (this.c_Evt.target || this.c_Evt.srcElement));
			}
			,
			/// 当前位置偏离起始点？
			cIsDvtFromBgn : function ()
			{
				return Math.max(Math.abs(this.c_X - this.c_BgnX), Math.abs(this.c_Y - this.c_BgnY)) > tTch.sc_DvtThrhd;
			}
			,
			/// 发生滑动？
			cHasSldn : function ()
			{
				return this.cIsDvtFromBgn() || (Math.max(this.c_AccOfstDistX, this.c_AccOfstDistY) > tTch.sc_DvtThrhd);
			}
			,
			eRspsByDomEvtFlag : function ()
			{
				if ((! this.c_Evt) || (! this.c_Evt.preventDefault))
				{ return this; }

				if (this.c_Hdld || this.c_PvtDft)		{ this.c_Evt.preventDefault(); }
				if (this.c_Hdld || this.c_StopPpgt)		{ this.c_Evt.stopPropagation(); }
				if (this.c_Hdld || this.c_StopImdtPpgt)	{ this.c_Evt.stopImmediatePropagation(); }
				return this;
			}
		}
		,
		{
			/// 偏离阈值
			/// 当水平和垂直偏移量绝对值皆≤时，cIsDvtFromBgn()返回false，否则返回true
			/// 当水平和垂直累计偏移距离皆≤时，cHasSldn()返回false，否则返回true
			sc_DvtThrhd : 4
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////