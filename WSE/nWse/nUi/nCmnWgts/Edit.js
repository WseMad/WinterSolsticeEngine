/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nGpuWgts && l_Glb.nWse.nUi.nGpuWgts.tEdit)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nGpuWgts",
		[
			"nWse:nUi/Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Edit.fOnIcld：" + a_Errs);

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
		a_This.d_DomText = null;
		a_This.d_DomSbmt = null;
	}

	function fAddRmvPlchd(a_This, a_Add)
	{
		if (! a_This.d_DomText)
		{ return; }

		if (a_Add)
		{
			if (! a_This.d_DomText.value) // 为空时才添加
			{
				a_This.d_DomText.value = a_This.d_Cfg.c_Plchd || "";
				stCssUtil.cAddCssc(a_This.d_DomText, "cnWse_tEdit_Plchd");
			}
		}
		else
		{
			if ((a_This.d_Cfg.c_Plchd || "") == a_This.d_DomText.value)	// 相等时才移除
			{
				a_This.d_DomText.value = "";
				stCssUtil.cRmvCssc(a_This.d_DomText, "cnWse_tEdit_Plchd");
			}
		}
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tEdit;
	(function ()
	{
		tEdit = nWse.fClass(nCmnWgts,
		/// 编辑
		function tEdit()
		{
			this.odBase(tEdit).odCall();	// 基类版本

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
			/// c_MltLine：Boolean，多行？默认false
			/// c_Plchd：String，占位符
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tEdit");	// CSS类

				if (a_Cfg.c_MltLine)
				{

				}
				else
				{
					l_This.d_DomText = document.createElement("input");
					l_This.d_DomText.type = "text";

				}

				fAddRmvPlchd(l_This, true); // 占位符
				l_This.d_DomText.onfocus = function ()
				{
					fAddRmvPlchd(l_This, false);
				};
				l_This.d_DomText.onblur = function ()
				{
					fAddRmvPlchd(l_This, true);
				};
				l_This.d_PutSrc.appendChild(l_This.d_DomText);	// 添加到放置来源
				l_This.dPutToTgt(l_This.d_DomText);	// 摆放到到放置目标

				l_This.d_DomSbmt = l_This.dAcsDomNodeByAttr("Wse_Sbmt");	// 取得提交按钮
				if (l_This.d_DomSbmt) // 摆放到到放置目标
				{
					l_This.dPutToTgt(l_This.d_DomSbmt);
				}

				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 重置
				fRset(this);

				// 基类版本，最后才调用！
				this.odBase(f).odCall();
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 校准位置尺寸
				l_This.dRgltPosDim();

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
					if (l_This.dIsTchEnd(a_DmntTch))
					{

						a_DmntTch.c_Hdld = true;		// 已处理
					}
				}

				// 如果点中的是本文框，必须交由浏览器处理！
				if (l_This.d_DomText === a_DmntTch.cAcsEvtTgt())
				{
					a_DmntTch.c_Hdld = false;
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
			/// 校准位置尺寸
			dRgltPosDim : function ()
			{
				var l_This = this;

				var l_CtntW = 0;
				var l_SbmtX = 0, l_SbmtY = 0, l_SbmtW = 0, l_SbmtH = 0;
				var l_TextW = 0;

				if (l_This.d_Cfg.c_MltLine)
				{

				}
				else
				{
					// 文本框的宽度恰好让出提交按钮
					if (l_This.d_DomSbmt)
					{
						l_SbmtW = l_This.d_DomSbmt.offsetWidth;
					}

					l_CtntW = l_This.dGetPutTgtCtntWid();
					l_TextW = l_CtntW - l_SbmtW;
					stCssUtil.cSetDimWid(l_This.d_DomText, l_TextW);	// 利用放置目标内容宽度

					// 提交按钮垂直居中，高度同文本框
					l_SbmtX = l_This.dGetPutTgtWid() - tWgt.sd_PutTgtBdrThk.c_BdrThkRt - tWgt.sd_PutTgtPad.c_PadRt - l_SbmtW;
					l_SbmtH = l_This.d_DomText.offsetHeight;
					l_SbmtY = (l_This.d_PutTgt.offsetHeight - l_SbmtH) / 2;
					stCssUtil.cSetPos(l_This.d_DomSbmt, l_SbmtX, l_SbmtY);
					stCssUtil.cSetDimHgt(l_This.d_DomSbmt, l_SbmtH);
				}

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