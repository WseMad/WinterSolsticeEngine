/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tBtn)
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
	console.log("Btn.fOnIcld：" + a_Errs);

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
		a_This.d_DoVticOfst = false;	// 进行垂直偏移？
		a_This.d_DtaY = 0;
		a_This.d_DomTit = null;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tBtn;
	(function ()
	{
		tBtn = nWse.fClass(nCmnWgts,
		/// 按钮
		function tBtn()
		{
			this.odBase(tBtn).odCall();	// 基类版本

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
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn");			// CSS类
				stCssUtil.cAddCssc(l_This.cAcsDomTit(), "cnWse_tBtn_Tit");	// CSS类
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				stCssUtil.cRmvCssc(l_This.cAcsDomTit(), "cnWse_tBtn_Tit");	// CSS类

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

				// 把标题摆放到目标
				if (l_This.cAcsDomTit())
				{
					l_This.dPutToTgt(l_This.d_DomTit);
				}
				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 垂直位移？
				var l_Y;
				if (l_This.d_DoVticOfst)
				{
					l_This.d_DoVticOfst = false;
					l_Y = stCssUtil.cGetPosUp(l_This.d_PutTgt);
					stCssUtil.cSetPosUp(l_This.d_PutTgt, l_Y + l_This.d_DtaY);
				}
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
					// 加入一点垂直位移效果
					//【注意】只设置标志，不要在这里设置位置，表现相关的工作放在刷新里进行！
					l_This.d_DtaY = Math.max(8, l_This.d_PutTgt.offsetHeight * 0.3);
					l_This.d_DoVticOfst = true;
					l_This.cRfsh();
				//	stCssUtil.cSetPosUp(l_This.d_PutTgt, stCssUtil.cGetPosUp(l_This.d_PutTgt) + l_This.d_DtaY);

					a_DmntTch.c_Hdld = true;		// 已处理
				}
				else
				if (l_This.dIsTchLostOrEnd(a_DmntTch))
				{
					l_This.dRstoPos();	// 恢复原位

					var l_Cabk = (a_DmntTch.c_PkdWgt === l_This);
					var l_Sara;

//					if (l_This.dIsTchLost(a_DmntTch))
//					{
//						//
//					}
//					else
					if (l_This.dIsTchEnd(a_DmntTch))
					{
						if (! l_Cabk) // 注意，由于按钮会向下移动，所以导致点击最上方时落空
						{
							tSara.scEnsrTemps(1);
							l_Sara = tSara.scCrt$DomBcr(tSara.sc_Temps[0], l_This.d_PutTgt);
							l_Sara.c_Y -= l_This.d_DtaY;	// 回到原位，进行包含测试
							l_Cabk = tSara.scCtan$Xy(l_Sara, a_DmntTch.c_X, a_DmntTch.c_Y);
						}

						if (l_Cabk && l_This.d_Cfg.c_fOnClk)	// 回调
						{ l_This.d_Cfg.c_fOnClk(l_This); }

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
				l_This.dRstoPos();	// 恢复原位
				return this;
			}
			,
			/// 失去焦点
			vcLoseFoc : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;
				l_This.dRstoPos();	// 恢复原位
				return this;
			}
			,
			/// 存取DOM - 标题
			cAcsDomTit : function ()
			{
				if (! this.d_DomTit)
				{ this.d_DomTit = this.dAcsDomNodeByAttr("Wse_Tit"); }
				return this.d_DomTit;
			}
			,
			/// 恢复原位
			dRstoPos : function ()
			{
				var l_Y = (this.d_PutTgt && this.d_DtaY) ? stCssUtil.cGetPosUp(this.d_PutTgt) : null;
				if ((! isNaN(l_Y)) && (this.d_DtaY > 0))
				{
					stCssUtil.cSetPosUp(this.d_PutTgt, l_Y - this.d_DtaY);
					this.d_DtaY = 0;
					this.cRfsh();		// 刷新
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