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

	var s_TempRst = null;

	function fBtnRset(a_This)
	{
		a_This.d_Body = null;
		a_This.d_DomTit = null;
	}

	function fImgBtnRset(a_This)
	{
		a_This.d_ImgAr = 1;				// 图像宽高比？
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
			fBtnRset(this);
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
			/// c_UpDown：Boolean，弹起按下？初始弹起，单击变按下，再单击变弹起，以此类推
			/// c_Shp：tShp，形状，若为i_Cir则覆盖c_FxdAr（圆的宽高比总是1）
			/// c_FxdAr：Number，固定宽高比
			/// c_TitVcen：Boolean，标题垂直居中？仅当有标题时才有效
			/// c_TxtrLyr：Number，纹理层，默认0
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn");			// CSS类
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn_Hole");		// CSS类

				l_This.d_DomTit = l_This.dAcsDomNodeByAttr("Wse_Tit");		// 取得标题
				if (l_This.d_DomTit)
				{ stCssUtil.cAddCssc(l_This.d_DomTit, "cnWse_tBtn_Tit"); }	// CSS类

				// 创建身体，放入纹理层和标题
				l_This.d_Body = document.createElement("div");
				stCssUtil.cAddCssc(l_This.d_Body, "cnWse_tBtn_Body");			// CSS类

				if (a_Cfg.c_TxtrLyr) // 纹理层
				{
					l_This.d_Txtr = document.createElement("div");
					stCssUtil.cAddCssc(l_This.d_Txtr, "cnWse_tBtn_Txtr");			// CSS类
					l_This.d_Body.appendChild(l_This.d_Txtr);
					l_This.dRgltTxtrLyr();
				}

				if (l_This.d_DomTit) // 标题
				{
					l_This.d_Body.appendChild(l_This.d_DomTit);
				}
				else // 没有标题时，使用文本节点
				if (l_This.d_PutSrc.textContent)
				{
					l_This.d_Body.appendChild(document.createTextNode(l_This.d_PutSrc.textContent));
				}

				l_This.dApdToSrc(l_This.d_Body);	// 先追加到来源，刷新时再摆放到目标


				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function (a_Put, a_TotWid, a_OfstWid)
					{
						// 修正高度和形状
						if (("c_FxdAr" in l_This.d_Cfg) || ("c_Shp" in l_This.d_Cfg))
						{ l_This.dFixHgtAndShp(a_OfstWid); }
					};

					l_This.dRegPutTgtEvtHdlr_OnWidDtmnd(l_This.d_fOnWidDtmnd);
				}

				if (l_This.d_Cfg.c_TitVcen && l_This.d_DomTit && (! l_This.d_fOnAnmtUpdEnd))
				{
					l_This.d_fOnAnmtUpdEnd = function (a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
					{
						// 标题垂直居中
						l_This.dTitVcen();
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
				if (! l_This.d_PutSrc)
				{ return this; }

				// 标题，身体和纹理层
				if (l_This.d_DomTit)
				{
					stCssUtil.cRmvCssc(l_This.d_DomTit, "cnWse_tBtn_Tit");	// CSS类
					l_This.d_PutSrc.appendChild(l_This.d_DomTit);
					l_This.d_DomTit = null;
				}

				if (l_This.d_Body)
				{
					l_This.dRmvWhenInSrc("d_Body");
				}

				if (l_This.d_Txtr)
				{
					l_This.dRmvWhenInSrc("d_Txtr");
				}

				// 事件处理器
				if (l_This.d_fOnWidDtmnd)
				{
					l_This.dUrgPutTgtEvtHdlr_OnWidDtmnd(l_This.d_fOnWidDtmnd);
					l_This.d_fOnWidDtmnd = null;
				}

				if (l_This.d_fOnAnmtUpdEnd)
				{
					l_This.dUrgPutTgtEvtHdlr_OnAnmtUpdEnd(l_This.d_fOnAnmtUpdEnd);
					l_This.d_fOnAnmtUpdEnd = null;
				}

				// 重置
				fBtnRset(this);

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

				// 身体摆放到目标
				if (l_This.d_Body)
				{ l_This.dPutToTgt(l_This.d_Body); }
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
			/// 拾取
			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
			vcPick : function f(a_Bbox, a_Picker)
			{
				// 用身体进行拾取
				var l_This = this;
				if (! l_This.d_Body)
				{ return this; }

				// 计算包围盒
				if (a_Bbox)
				{
					// 扩容至包含身体
					tSara.scEnsrTemps(1);
					tSara.scCrt$DomBcr(tSara.sc_Temps[0], l_This.d_Body);
					tSara.scExpdToCtan$Sara(a_Bbox, tSara.sc_Temps[0]);
					return this;
				}

				// 先拾取身体，未拾取到时再拾取底座
				l_This.dPickDomElmtByPathPnt(l_This.d_Body, a_Picker);
				if (a_Picker.cIsOver())
				{ return this; }

				l_This.dPickPutTgtByPathPnt(a_Picker);
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

				// 点中身体或身体的子节点
				var l_ClkBody = stDomUtil.cIsSelfOrAcst(l_This.d_Body, a_DmntTch.cAcsEvtTgt());

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
						// 如果开关，先进行切换样式类，后回调！
						if (l_ClkBody && l_This.d_Cfg.c_UpDown)
						{
							stCssUtil.cTglCssc(l_This.d_Body, "cnWse_tBtn_Down");
						}

						if (l_ClkBody && l_This.d_Cfg.c_fOnClk)	// 回调
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
			/// 存取身体
			cAcsBody : function ()
			{
				return this.d_Body;
			}
			,
			/// 存取DOM - 标题
			cAcsTit : function ()
			{
				return this.d_DomTit;
			}
			,
			/// 弹起？当配置里的项c_UpDown为true时才有效
			cIsUp : function ()
			{
				return this.d_Cfg.c_UpDown ? (! this.cIsDown()) : true;
			}
			,
			/// 按下？当配置里的项c_UpDown为true时才有效
			cIsDown : function ()
			{
				return this.d_Cfg.c_UpDown ? stCssUtil.cHasCssc(this.d_Body, "cnWse_tBtn_Down") : false;
			}
			,
			/// 弹起按下，当配置里的项c_UpDown为true时才有效
			cUpDown : function (a_Up)
			{
				var l_This = this;
				if (! l_This.d_Cfg.c_UpDown)
				{ return this; }

				a_Up
					? stCssUtil.cRmvCssc(l_This.d_Body, "cnWse_tBtn_Down")
					: stCssUtil.cAddCssc(l_This.d_Body, "cnWse_tBtn_Down");
				return this;
			}
			,
			/// 修正高度和形状
			dFixHgtAndShp : function (a_OfstWid)
			{
				a_OfstWid = Math.round(a_OfstWid);		// 规整

				var l_This = this;
				var l_FxdAr = l_This.d_Cfg.c_FxdAr;
				var tShp = tBtn.tShp;
				if (tShp.i_Cir == l_This.d_Cfg.c_Shp)	// 圆形时必须为1
				{
					l_FxdAr = 1;
				}

				// 注意放置目标上内边距的存在
				var l_Pad = l_This.dGetPutTgtPad();
				var l_BdrRdsStr = "";	// 由样式表控制
				var l_PutTgtH = l_This.d_PutTgt.offsetHeight;
				if (l_FxdAr)
				{
					l_PutTgtH = (Math.round(a_OfstWid / l_FxdAr));
					stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_PutTgtH);
					stCssUtil.cSetDimHgt(l_This.d_Body, l_PutTgtH - l_Pad.c_PadUp - l_Pad.c_PadDn);
				}

				// 调整形状
				if (! l_This.d_Cfg.c_Shp)
				{ return this; }

				if (tShp.i_Rect == l_This.d_Cfg.c_Shp)
				{
				//	l_BdrRdsStr = "";	// 由样式表控制
					stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn_Shp_Rect");	// CSS类
				}
				else
				if (tShp.i_Cir == l_This.d_Cfg.c_Shp)
				{
					l_BdrRdsStr = Math.round(a_OfstWid / 2).toString() + "px";
					stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn_Shp_Cir");	// CSS类
				}
				else
				if (tShp.i_Elps == l_This.d_Cfg.c_Shp)
				{
					l_BdrRdsStr = Math.round(a_OfstWid / 2).toString() + "px/" + Math.round(l_PutTgtH / 2).toString() + "px";
					stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn_Shp_Elps");	// CSS类
				}
				else
				if (tShp.i_Caps == l_This.d_Cfg.c_Shp)
				{
					if (a_OfstWid > l_PutTgtH) // 横放
					{ l_BdrRdsStr = Math.round(l_PutTgtH / 2).toString() + "px"; }
					else // 竖放
					{ l_BdrRdsStr = Math.round(a_OfstWid / 2).toString() + "px"; }

					stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tBtn_Shp_Caps");	// CSS类
				}

				l_This.d_PutTgt.style.borderRadius = l_BdrRdsStr;
				l_This.d_Body.style.borderRadius = l_BdrRdsStr;

				if (l_This.d_Txtr) // 如果有，同时校准纹理层
				{
					l_This.d_Txtr.style.borderRadius = l_BdrRdsStr;
				}

				// 标题垂直居中
				if (l_This.d_Cfg.c_TitVcen && l_This.d_DomTit)
				{
					l_This.dTitVcen();
				}
				return this;
			}
			,
			/// 标题垂直对齐
			dTitVcen : function ()
			{
				var l_This = this;
				if (! l_This.d_DomTit)
				{ return this; }

				if (! s_TempRst)
				{ s_TempRst = {}; }

				var l_CtntH = stCssUtil.cGetCtntHgt(s_TempRst, l_This.d_Body).c_CtntHgt;
				stCssUtil.cSetPosUp(l_This.d_DomTit, (l_CtntH - l_This.d_DomTit.offsetHeight) / 2);
				return this;
			}
			,
			/// 校准纹理层
			dRgltTxtrLyr : function ()
			{
				var l_This = this;
				if (! l_This.d_Txtr)
				{ return this; }

			//	stCssUtil.cSetDim(l_This.d_Txtr, l_This.d_Body.offsetWidth, l_This.d_Body.offsetHeight);
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fEnum(tBtn,
		/// 形状
		function tShp() {},
		null,
		{
			/// 长方形（默认）
			i_Rect: 0
			,
			/// 圆形
			i_Cir : 1
			,
			/// 椭圆
			i_Elps : 2
			,
			/// 囊形
			i_Caps : 3
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tImgBtn;
	(function ()
	{
		tImgBtn = nWse.fClass(nCmnWgts,
		/// 图像按钮
		function tImgBtn()
		{
			this.odBase(tImgBtn).odCall();	// 基类版本

			var l_This = this;
			fImgBtnRset(this);
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
			/// c_ImgSrc：String，图像来源地址
			/// c_ImgAr：Number，图像宽高比，默认1
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tImgBtn");	// CSS类

				l_This.d_ImgAr = a_Cfg.c_ImgAr || 1;
				l_This.d_Img = new Image();
				l_This.d_Img.src = a_Cfg.c_ImgSrc;
				l_This.d_PutTgt.style.backgroundImage = "url(" + a_Cfg.c_ImgSrc + ")";

				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 重置
				fImgBtnRset(this);

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

				return this;
			}
			,
			/// 拾取
			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
			vcPick : function f(a_Bbox, a_Picker)
			{
				if (a_Bbox)
				{
					return this;
				}

				var l_This = this;
				if (! l_This.d_PutTgt)
				{ return this; }

				var l_Bbox = a_Picker.cAcsBbox();
				var l_Ctxt = a_Picker.cAcs2dCtxt();
				a_Picker.cPickBgn(l_This, a_Picker.i_MapClo);

				l_Ctxt.cSetCpstOp_AphMap();
				l_Ctxt.cMap(l_Bbox, l_This.d_Img, null, null);

				a_Picker.cPickEnd(l_This, l_This.d_PutTgt);
				if (a_Picker.cIsOver())
				{ return this; }

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