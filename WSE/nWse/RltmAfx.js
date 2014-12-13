/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.tRltmAfx)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"DomUtil.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("RltmAfx.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stFctnUtil = nWse.stFctnUtil;
	var stDomUtil = nWse.stDomUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	// 单位数组三函数
	function fUnitAryFind(a_Ary, a_Agms)
	{
		return stAryUtil.cFind(a_Ary, function (a_Tgt, a_Idx, a_Elmt) { return (a_Elmt === a_Agms[0]); });
	}

	function fUnitAryReg(a_Ary, a_Agms)
	{
		// 按优先级从小到大插入，没有时压入到最后
		var l_fCabk = a_Agms[0];
		if (nWse.fIsUdfnOrNull(l_fCabk.Wse_Prio))
		{
			a_Ary.push(l_fCabk);
			return;
		}

		var l_Idx, l_Len = a_Ary.length;
		for (l_Idx=0; l_Idx<l_Len; ++l_Idx)
		{
			if (a_Ary[l_Idx].Wse_Prio > l_fCabk.Wse_Prio)
			{ break; }
		}
		stAryUtil.cIst(a_Ary, l_Idx, l_fCabk);
	}

	function fUnitAryFor(a_Ary, a_Agms)
	{
		var i, l_Len = a_Ary.length;
		var l_Fwd = a_Agms[0];
		if (l_Fwd) // 正向
		{
			for (i=0; i<l_Len; ++i)
			{ a_Ary[i].apply(null, null); }
		}
		else // 反向
		{
			for (i = l_Len - 1; i>=0; --i)
			{ a_Ary[i].apply(null, null); }
		}
	}

	// 检查自适应尺寸变化
	function fChkAdpDimChg(a_This)
	{
		var l_Cfg = a_This.e_Cfg;
		var l_PrstTgt = a_This.e_PrstTgt;
		var l_AdpModeNum = a_This.e_AdpMode.valueOf();
		if (0 == l_AdpModeNum)
		{
			return false;
		}
		else
		if (1 == l_AdpModeNum)
		{
			//var l_Prn = l_PrstTgt.parentElement;
			//return (e_AdpWid != l_Prn.offsetWidth) || (e_AdpHgt != l_Prn.offsetHeight);
			return (a_This.e_AdpWid != l_PrstTgt.offsetWidth) || (a_This.e_AdpHgt != l_PrstTgt.offsetHeight);
		}
		else
		if (2 == l_AdpModeNum)
		{
			return (a_This.e_AdpWid != stDomUtil.cGetVwptWid()) || (a_This.e_AdpHgt != stDomUtil.cGetVwptHgt());
		}
	}

	// 更新自适应尺寸
	function fUpdAdpDim(a_This)
	{
		var l_Cfg = a_This.e_Cfg;
		var l_PrstTgt = a_This.e_PrstTgt;
		var l_AdpModeNum = a_This.e_AdpMode.valueOf();
		if (0 == l_AdpModeNum)
		{
			//
		}
		else
		if (1 == l_AdpModeNum)
		{
			//var l_Prn = l_PrstTgt.parentElement;
			//e_AdpWid = l_Prn.offsetWidth;		e_AdpHgt = l_Prn.offsetHeight;
			a_This.e_AdpWid = l_PrstTgt.offsetWidth;	a_This.e_AdpHgt = l_PrstTgt.offsetHeight;
		}
		else
		if (2 == l_AdpModeNum)
		{
			//	e_AdpWid = l_Glb.outerWidth;		e_AdpHgt = l_Glb.outerHeight;
			a_This.e_AdpWid = stDomUtil.cGetVwptWid();		a_This.e_AdpHgt = stDomUtil.cGetVwptHgt();
		}
	}

	function fAdpPrstTgt(a_This)
	{
		// 注意DOM元素的宽高和画布的宽高是两个概念
		// 为使两者匹配（否则会发生拉伸），必须通过代码设置画布的宽高属性

		var l_Cfg = a_This.e_Cfg;
		var l_PrstTgt = a_This.e_PrstTgt;
		var l_AdpModeNum = a_This.e_AdpMode.valueOf();
		var l_W, l_H;

		function f1()
		{
			// 首先定位元素，拜托浏览器计算位置
			if (l_PrstTgt.style.position)// && ("static" != l_PrstTgt.style.position))
			{
				l_PrstTgt.style.position = "";
				l_PrstTgt.style.left = "";
				l_PrstTgt.style.top = "";
			}

			// 然后……

			// 如果有记录（比如从全屏回来）
			if ((a_This.e_OldWid > 0) && (a_This.e_OldHgt > 0))
			{
				// 使用记录的宽高，并将记录清零，以备下面的分支有机会执行
				l_W = a_This.e_OldWid;
				l_H = a_This.e_OldHgt;
				a_This.e_OldWid = 0;
				a_This.e_OldHgt = 0;
			}
			else // 没有记录，说明通过其他方式引发自适应
			{
				// 理想情况下，浏览器已经正确设置了主画布的宽高，所以直接用这个就行了！
				l_W = Math.max(l_PrstTgt.offsetWidth, (l_Cfg.c_PrstTgtMinWid || 128));
				l_H = Math.max(l_PrstTgt.offsetHeight, (l_Cfg.c_PrstTgtMinHgt || 128));
			}
		}

		function f2()
		{
			// 首先定位元素，从浏览器客户区左上角开始
			if ("fixed" != l_PrstTgt.style.position)
			{
				l_PrstTgt.style.position = "fixed";
				l_PrstTgt.style.left = "0px";
				l_PrstTgt.style.top = "0px";
			}

			// 然后，填充整个浏览器客户区，因为使用固定定位，不会出现滚动条
			var l_RefW = stDomUtil.cGetVwptWid(), l_RefH = stDomUtil.cGetVwptHgt();
			l_W = Math.max(l_RefW, (l_Cfg.c_PrstTgtMinWid || 128));
			l_H = Math.max(l_RefH, (l_Cfg.c_PrstTgtMinHgt || 128));
		}

		if (1 == l_AdpModeNum)
		{
			f1();
			l_PrstTgt.style.width  = "";
			l_PrstTgt.style.height = "";
		}
		else
		if (2 == l_AdpModeNum)
		{
			f2();
			l_PrstTgt.style.width  = (l_W).toString() + "px";
			l_PrstTgt.style.height = (l_H).toString() + "px";
		}

		// 自适应完成回调
		if ((0 != l_AdpModeNum) && l_Cfg.c_fOnAdpPrstTgtCplt)
		{ l_Cfg.c_fOnAdpPrstTgtCplt.call(null, l_W, l_H); }
	}

	// 当……时
	function fOn(a_This, a_FlowStg, a_Fwd)
	{
		a_This.e_UnitGrp[a_FlowStg.valueOf()].cFor(a_Fwd);
	}

	// 初始化
	function fInit(a_This)
	{
		// 如果在循环里
		if (a_This.e_InLoop)
		{ throw new Error("初始化失败，必须首先停止"); }

		// 记录呈现目标，自适应模式
		var l_Cfg = a_This.e_Cfg;
		a_This.e_PrstTgt = nWse.fIsStr(l_Cfg.c_PrstTgt) ? document.getElementById(l_Cfg.c_PrstTgt) : l_Cfg.c_PrstTgt;
		if (! a_This.e_PrstTgt)
		{ throw new Error("初始化失败，呈现目标无效"); }

		a_This.e_AdpMode = l_Cfg.c_AdpMode || tRltmAfx.tAdpMode.i_None;

		// 当初始化时
		fOn(a_This, tRltmAfx.tFlowStg.i_Init, true);
		if (a_This.e_App)
		{ a_This.e_App.vdOnInit(); }

		// 如果要求，自适应，更新
		if (tRltmAfx.tAdpMode.i_None != a_This.e_AdpMode)
		{
			fAdpPrstTgt(a_This);
			fUpdAdpDim(a_This);
		}

		// 当呈现目标复位时
		fOn(a_This, tRltmAfx.tFlowStg.i_PrstTgtRset, true);
		if (a_This.e_App)
		{ a_This.e_App.vdOnPrstTgtRset(); }
	}

	// 停止
	function fStop(a_This)
	{
		// 如果在循环里
		if (a_This.e_InLoop)
		{
			// 先不要停止，而是请求停止
			a_This.e_RqsStop = true;
			return;
		}

		// 当呈现目标丢失时
		fOn(a_This, tRltmAfx.tFlowStg.i_PrstTgtLost, false); // 反向
		if (a_This.e_App)
		{ a_This.e_App.vdOnPrstTgtLost(); }

		// 当退出时
		fOn(a_This, tRltmAfx.tFlowStg.i_Exit, false); // 反向
		if (a_This.e_App)
		{ a_This.e_App.vdOnExit(); }

		// 重置数据
		fRsetData(a_This);
	}

	function fRsetData(a_This)
	{
		// 自适应窗口宽高，变化状态
		a_This.e_AdpWid = 0;
		a_This.e_AdpHgt = 0;
		a_This.e_AdpDimChgSta = 0;
		a_This.e_ChgAdp = -1;	// -1表示无变化
		a_This.e_OldWid = 0;
		a_This.e_OldHgt = 0;

		// 循环
		a_This.e_InLoop = false;		// 在循环里？
		a_This.e_RqsStop = false;		// 请求停止？
		a_This.e_PauUpd = 0;
		a_This.e_PauRnd = 0;

		a_This.e_FrmTime = 0;
		a_This.e_FrmItvl = 0;
		a_This.e_FrmNum = 0;
	}

	// 运行
	function fRun(a_This)
	{
		// 如果在循环里
		if (a_This.e_InLoop)
		{ return; }

		// 进入循环，发出动画第一帧
		a_This.e_InLoop = true;
		stDomUtil.cRegAnmt(stFctnUtil.cBindThis(a_This, fOneFrm));
	}

	// 是否暂停更新
	function fIsPauUpd(a_This)
	{ return (a_This.e_PauUpd > 0); }

	// 是否暂停渲染
	function fIsPauRnd(a_This)
	{ return (a_This.e_PauRnd > 0); }

	// 暂停更新
	function fPauUpd(a_This)
	{ ++ a_This.e_PauUpd; }

	// 暂停渲染
	function fPauRnd(a_This)
	{ ++ e_PauRnd; }

	/// 继续更新
	function fRsmUpd(a_This)
	{ -- a_This.e_PauUpd; }

	// 继续渲染
	function fRsmRnd(a_This)
	{ -- a_This.e_PauRnd; }

	// 一帧
	function fOneFrm(a_FrmTime, a_FrmItvl, a_FrmNum)
	{
		var l_This = this;

		// 如果请求停止
		if (l_This.e_RqsStop)
		{
			// 循环终止
			l_This.e_InLoop = false;

			// 停止
			l_This.cStop();
			return;
		}

		// 更新帧时间
		l_This.e_FrmTime = a_FrmTime;
		l_This.e_FrmItvl = a_FrmItvl;
		l_This.e_FrmNum = a_FrmNum;

		// 检查自适应尺寸变化
		var l_PrstTgt = l_This.e_PrstTgt;
		var l_AdpDimChg = fChkAdpDimChg(l_This);

		// 自适应尺寸变化状态机
		if (0 == l_This.e_AdpDimChgSta)	// 无变化
		{
			// 如果程序要求改变自适应模式
			if (l_This.e_ChgAdp >= 0)
			{
				// 如果从窗口进入全屏，记录画布当前宽高，以备将来从全屏模式还原
				if (1 == l_This.e_ChgAdp) // 从全屏进入窗口
				{
					//
				}
				else // 2，从窗口进入全屏
				{
					l_This.e_OldWid = l_PrstTgt.width;
					l_This.e_OldHgt = l_PrstTgt.height;
				}

				l_This.e_AdpMode = l_This.e_ChgAdp;		// 改变
				l_This.e_ChgAdp = -1;					// 复位
				l_AdpDimChg = true;						// 发生变化
			}

			// 如果发生变化
			if (l_AdpDimChg)
			{
				console.log("***************************** 自适应尺寸变化");

				// 更新记录
				fUpdAdpDim(l_This);

				// 暂停更新
				fPauUpd(l_This);

				// 转换状态
				l_This.e_AdpDimChgSta = 1;
			}
		}
		else
		if (1 == l_This.e_AdpDimChgSta)	// 上一帧发生变化
		{
			// 如果这一帧再次发生变化
			if (l_AdpDimChg)
			{
				// 更新记录
				fUpdAdpDim(l_This);

				// 停留在该状态，下一帧继续检查
			}
			else // 这一帧没有变化
			{
				// 先不要自适应呈现目标（可能是画布），经过多个浏览器测试发现，此时DOM数据不稳定
				// 这里预期下一帧DOM数据会稳定，所以再等待一帧

				// 转换状态
				l_This.e_AdpDimChgSta = 2;
			}
		}
		else
		if (2 == l_This.e_AdpDimChgSta) // 准备自适应主画布
		{
			// 如果要求，自适应
			if (tRltmAfx.tAdpMode.i_None != l_This.e_AdpMode)
			{
				fAdpPrstTgt(l_This);
			}

			// 继续更新
			fRsmUpd(l_This);

			// 转换状态
			l_This.e_AdpDimChgSta = 0;
		}

		// 当更新时
		fOn(l_This, tRltmAfx.tFlowStg.i_Upd, true);
		if (l_This.e_App)
		{ l_This.e_App.vdOnUpd(); }

		// 当更新到渲染时
		fOn(l_This, tRltmAfx.tFlowStg.i_UpdToRnd, true);
		if (l_This.e_App)
		{ l_This.e_App.vdOnUpdToRnd(); }

		// 当渲染时
		fOn(l_This, tRltmAfx.tFlowStg.i_Rnd, false); // 反向
		if (l_This.e_App)
		{ l_This.e_App.vdOnRnd(); }
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	// 流程分为7个阶段：
	// 		Init（初始化）
	// 		↓
	// 	↑→PrstTgtRset（呈现目标复位）
	//	↑		↓
	// 	↑	↑→Upd（更新），一帧开始
	//	↑	↑	↓
	//	↑	↑	UpdToRnd（更新到渲染）
	//	↑	↑	↓
	// 	↑	↑←Rnd（渲染），一帧结束
	//	↑		↓
	// 	↑←PrstTgtLost（呈现目标丢失）
	//		↓
	// 		Exit（退出）

	var tRltmAfx;
	(function ()
	{
		tRltmAfx = nWse.fClass(nWse,
			/// 实时应用程序框架
			function tRltmAfx()
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
					// 单位组
					var l_This = this;
					this.e_StgTot = 7;
					this.e_UnitGrp = new Array(l_This.e_StgTot);
					stAryUtil.cFor(l_This.e_UnitGrp,
					function (a_Grp, a_StgIdx, a_UnitAry)
					{ a_Grp[a_StgIdx] = new nWse.tLockAry(fUnitAryFind, fUnitAryReg, fUnitAryFor); });

					// 重置数据
					fRsetData(this);

					// 其他
					this.e_App = null;			// 应用程序

					return this;
				}
				,
				/// 注册单位
				/// a_FlowStg：tFlowStg，流程阶段
				/// a_fCabk：void f()，回调
				/// a_Prio：Number，优先级，若不提供则放到最后
				cRegUnit : function (a_FlowStg, a_fCabk, a_Prio)
				{
					a_fCabk.Wse_Prio = a_Prio;	// 记录优先级

					var l_StgIdx = a_FlowStg.valueOf();
					this.e_UnitGrp[l_StgIdx].cReg(a_fCabk);
					return this;
				}
				,
				/// 注销单位
				cUrgUnit : function (a_FlowStg, a_fCabk)
				{
					var l_StgIdx = a_FlowStg.valueOf();
					this.e_UnitGrp[l_StgIdx].cUrg(a_fCabk);
					return this;
				}
				,
				/// 初始化
				/// a_Cfg：Object，
				/// {
				/// c_PrstTgt：HTMLElement$String，呈现目标或元素ID，必须是块级元素
				/// c_AdpMode：tAdpMode，自适应模式，默认i_None
				/// c_PrstTgtMinWid，c_PrstTgtMinHgt：Number，呈现目标最小尺寸，自适应时使用
				/// c_fOnAdpPrstTgtCplt：void f(a_Wid, a_Hgt)，当自适应呈现目标完成时
				/// c_App：类，必须继承自tRltmAfx.atApp，默认null
				/// }
				cInit : function (a_Cfg)
				{
					var l_This = this;
					l_This.e_Cfg = a_Cfg;
					fInit(l_This);
					return this;
				}
				,
				/// 运行
				cRun : function ()
				{
					var l_This = this;
					fRun(l_This);
					return this;
				}
				,
				/// 停止
				cStop : function ()
				{
					var l_This = this;
					fStop(l_This);
					return this;
				}
				,
				/// 存取呈现目标
				cAcsPrstTgt : function ()
				{
					return this.e_PrstTgt;
				}
				,
				/// 获取自适应模式
				/// a_Udfn$Next：Boolean，false（默认）=当前设置，true=下一个设置
				cGetAdpMode : function (a_Udfn$Next)
				{
					return a_Udfn$Next ? this.e_ChgAdp : this.e_AdpMode;
				}
				,
				/// 设置自适应模式，【注意】这是异步方法，调用后不会立即生效
				cSetAdpMode : function (a_Mode)
				{
					this.e_ChgAdp = (this.e_AdpMode == a_Mode) ? -1 : a_Mode;
					return this;
				}
				,
				/// 获取帧时间
				cGetFrmTime : function ()
				{
					return this.e_FrmTime;
				}
				,
				/// 获取帧间隔
				cGetFrmItvl: function ()
				{
					return this.e_FrmItvl;
				}
				,
				/// 获取帧号
				cGetFrmNum: function ()
				{
					return this.e_FrmNum;
				}
			}
			,
			{
				//
			}
			,
			false);

		nWse.fEnum(tRltmAfx,
			/// 流程阶段
			function tFlowStg() {},
			null,
			{
				/// 初始化
				i_Init : 0,
				/// 退出
				i_Exit : 1,
				/// 呈现目标复位
				i_PrstTgtRset : 2,
				/// 呈现目标丢失
				i_PrstTgtLost : 3,
				/// 更新
				i_Upd : 4,
				/// 更新到渲染
				i_UpdToRnd : 5,
				/// 渲染
				i_Rnd : 6
			});

		nWse.fEnum(tRltmAfx,
			/// 自适应模式
			function tAdpMode() {},
			null,
			{
				/// 无（默认）
				i_None : 0,
				/// CSS驱动
				i_CssDrv : 1,
				/// 全屏（客户区）
				i_FullScrn : 2
				/// 自定义（回调）
			//	,i_Cstm : 3	//【暂不支持】
			});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////