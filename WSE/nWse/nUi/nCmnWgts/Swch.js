/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tSwch)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nCmnWgts",
		[
			"nWse:nUi/Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Swch.fOnIcld：" + a_Errs);

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
		a_This.d_Blk = null;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tSwch;
	(function ()
	{
		tSwch = nWse.fClass(nCmnWgts,
		/// 开关
		function tSwch()
		{
			this.odBase(tSwch).odCall();	// 基类版本

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
			/// c_fOnTgl：void f(a_This)，当切换时
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tSwch");	// CSS类

				// 创建滑块，灯，杆
				var l_Blk = document.createElement("div");
				stCssUtil.cSetCssc(l_Blk, "cnWse_tSwch_Blk");
				l_This.d_Blk = l_Blk;
				l_This.d_PutSrc.appendChild(l_Blk);		// 放入来源

				var l_Lgt = document.createElement("div");
				stCssUtil.cSetCssc(l_Lgt, "cnWse_tSwch_Lgt");
				l_This.d_Lgt = l_Lgt;
				l_This.d_Blk.appendChild(l_Lgt);		// 放入滑块

				var l_Bar = document.createElement("div");
				stCssUtil.cSetCssc(l_Bar, "cnWse_tSwch_Bar");
				l_This.d_Bar = l_Bar;
				l_This.d_PutSrc.appendChild(l_Bar);		// 放入来源

				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function (a_Put, a_TotWid, a_OfstWid)
					{
						// 根据宽高比修正高度
						if (l_This.d_Cfg.c_FxdAr)
						{ l_This.dFixHgtByAr(a_OfstWid); }
					};

					l_This.dRegPutTgtEvtHdlr_OnWidDtmnd(l_This.d_fOnWidDtmnd);
				}

				if (! l_This.d_fOnAnmtUpdEnd)
				{
					// 展开式时必须校准位置
					l_This.d_fOnAnmtUpdEnd = function (a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
					{
						// 校准滑块位置
						l_This.dRgltBlkX();
					};

					l_This.dRegPutTgtEvtHdlr_OnAnmtUpdEnd(l_This.d_fOnAnmtUpdEnd);
				}
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 注销放置目标事件处理器
				if (l_This.d_fOnAnmtUpdEnd)
				{
					l_This.dUrgPutTgtEvtHdlr_OnAnmtUpdEnd(l_This.d_fOnAnmtUpdEnd);
					l_This.d_fOnAnmtUpdEnd = null;
				}

				// 重置
				fRset(this);

				// 基类版本，最后才调用！
				this.odBase(f).odCall();
				return this;
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				var l_This = this;

				// 结束动画
				stCssUtil.cFnshAnmt(l_This.d_Blk, false, false);	// 不要跳，不回调

				// 校准滑块位置
				l_This.dRgltBlkX();
				return this;
			}
			,
			/// 序列化
			/// a_Kvo：Object，若为null则新建一个对象
			/// 返回：a_Kvo
			vcSrlz : function f(a_Kvo)
			{
				if (! a_Kvo)
				{ a_Kvo = {}; }

				var l_This = this;

				// 0=关，1=开
				var l_Key = l_This.dChkKeyOnSrlz(a_Kvo);
				var l_Val = l_This.cIsOn() ? "1" : "0";
				a_Kvo[l_Key] = l_Val;
				return a_Kvo;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 把滑块放入目标
				l_This.dPutToTgt(l_This.d_Blk);
				l_This.dPutToTgt(l_This.d_Bar);
				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

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
					if ((a_DmntTch.c_PkdWgt === l_This) && l_This.dIsTchEnd(a_DmntTch))	// 点中自己时才处理
					{
						l_This.dAnmtTgl();				// 动画切换

						if (l_This.d_Cfg.c_fOnTgl)		// 触发事件
						{ l_This.d_Cfg.c_fOnTgl(l_This); }

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
			/// 打开？
			cIsOn : function ()
			{
				return stCssUtil.cHasCssc(this.d_PutTgt, "cnWse_tSwch_On");
			}
			,
			/// 打开关闭
			cOnOff : function (a_On)
			{
				var l_This = this;
				a_On
				? stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tSwch_On")
				: stCssUtil.cRmvCssc(l_This.d_PutTgt, "cnWse_tSwch_On");
				l_This.dRgltBlkX();	// 校准滑块位置
				return this;
			}
			,
			/// 切换
			cTgl : function ()
			{
				return this.cOnOff(! this.cIsOn());
			}
			,
			/// 动画切换
			dAnmtTgl : function ()
			{
				var l_This = this;

				var l_BlkX;
				var l_LeftEnd;
				if (l_This.cIsOn())
				{
					stCssUtil.cRmvCssc(l_This.d_PutTgt, "cnWse_tSwch_On");
					l_BlkX = 0;
					l_LeftEnd = "0px";
				}
				else
				{
					stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tSwch_On");
					l_BlkX = l_This.dCalcBlkX();
					l_LeftEnd = l_BlkX.toString() + "px";
				}

				// 动画位置
				stCssUtil.cAnmt(l_This.d_Blk,
					{
						"left": l_LeftEnd
					},
					{
						c_Dur: 0.2,
						c_fEsn: function (a_Scl)
						{
							return a_Scl;
						}
					});
				return this;
			}
			,
			/// 计算滑块位置
			dCalcBlkX : function ()
			{
				var l_This = this;
				if (l_This.cIsOn())
				{
					// 注意去掉边框
					return l_This.d_PutTgt.clientWidth - l_This.d_Blk.offsetWidth;
				}
				else
				{
					return 0;
				}
			}
			,
			/// 校准滑块位置
			dRgltBlkX : function ()
			{
				var l_This = this;
				stCssUtil.cSetPosLt(l_This.d_Blk, l_This.dCalcBlkX());
				return this;
			}
			,
			/// 根据宽高比修正高度
			dFixHgtByAr : function (a_OfstWid)
			{
				// 如果固定了宽高比，根据a_OfstWid计算高度
				var l_This = this;
				if (! l_This.d_Cfg.c_FxdAr)
				{ return; }

				var l_MinH = 32;	// 覆盖CSS里的min-height，选用2em
				if (! l_This.d_PutTgt.style.minHeight)
				{ l_This.d_PutTgt.style.minHeight = l_MinH.toString() + "px"; }

				var l_H = Math.max(Math.round(a_OfstWid / l_This.d_Cfg.c_FxdAr), l_MinH);
				stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_H);
			//	stCssUtil.cSetDimHgt(l_This.d_Blk, l_This.d_PutTgt.clientHeight);	// 没有必要，样式表里设为100%
				var l_BlkH = l_This.d_PutTgt.clientHeight;

				// 同时修改放置目标、滑块、灯泡的边框及半径
				l_This.d_PutTgt.style.borderRadius = (l_H / 2).toString() + "px";
				l_This.d_Blk.style.borderWidth = Math.round(l_BlkH / 4).toString() + "px";
				l_This.d_Blk.style.borderRadius = (l_BlkH / 2).toString() + "px";
				// 没有必要处理灯泡，样式表里设为100%


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