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
	function eChkAdpDimChg(a_This)
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
		if (a_This.e_App.vdOnInit)
		{ a_This.e_App.vdOnInit(); }

		// 如果要求，自适应
		if (tRltmAfx.tAdpMode.i_None != a_This.e_AdpMode)
		{
			eAdpPrstTgt();
		}

		// 当呈现目标复位时
		fOn(a_This, tRltmAfx.tFlowStg.i_PrstTgtRset, true);
		if (a_This.e_App.vdOnInit)
		{ a_This.e_App.vdOnPrstTgtRset(); }
	}

	// 停止
	function fStop(a_This)
	{

	}

	// 运行
	function fRun(a_This)
	{

	}

	// 一帧
	function fOneFrm(a_FrmTime, a_FrmItvl, a_FrmNum)
	{

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


					// 自适应窗口宽高，变化状态
					this.e_AdpWid = 0;
					this.e_AdpHgt = 0;
					this.e_AdpDimChgSta = 0;
					this.e_ChgAdp = -1;
					this.e_OldWid = 0;
					this.e_OldHgt = 0;

					// 其他
					this.e_InLoop = false;		// 在循环里？
					this.e_RqsStop = false;		// 请求停止？
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

					return this;
				}
				,
				/// 停止
				cStop : function ()
				{
					var l_This = this;


					return this;
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
				/// 填充父元素
				i_FillPrn : 1,
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