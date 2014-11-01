/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tGpuSldPlr)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nCmnWgts",
		[
			"Cmb.js",

			"nWse:nGpu/2dPath.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("GpuSldPlr.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;
	var tSara = nWse.tSara;
	var tClo = nWse.tClo;

	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;
	var tPntIptKind = tPntIpt.tKind;
	var tPntIptTch = tPntIpt.tTch;

	var nUi = nWse.nUi;
	var tWgt = nUi.tWgt;
	var stFrmwk = nUi.stFrmwk || null;

	var nGpu = nWse.nGpu;
	var t2dCtxt = nGpu.t2dCtxt;
	var tPath = t2dCtxt.tPath;

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

	var s_PostAry = [];

	function fRset(a_This)
	{
		a_This.d_Cvs = null;
		a_This.d_2dCtxt = null;
		a_This.d_Path = null;

		a_This.d_Ar = 1;			// 宽高比，默认1:1
		a_This.d_ArIdx = -1;		// 宽高比索引
		a_This.d_ArStr = "";		// 宽高比字符串
		a_This.d_ImgAry = null;		// 图像数组

		// 控件集
		a_This.d_WgtSet = null;
		a_This.d_DivCvsDta = -1;	// -1表示待计算

		// 张贴，拷贝一份
		a_This.d_PostAry = s_PostAry.slice(0);
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tGpuSldPlr;
	(function ()
	{
		tGpuSldPlr = nWse.fClass(nCmnWgts,
		/// GPU幻灯片播放器
		function tGpuSldPlr()
		{
			this.odBase(tGpuSldPlr).odCall();	// 基类版本

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
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tGpuSldPlr");			// CSS类

				// 取得所有宽高比组
				l_This.d_ArAry = l_This.dGetDomNodesByAttr("Wse_Ar", false);

				// 新建画布，面板，控件集
				l_This.dNewCvs();
				l_This.dNewPnl();
				l_This.dNewWgtSet();

				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function ()
					{
						// 修正放置目标和画布尺寸
						var l_OfstWid = l_This.dGetPutTgtOfstWid();
						l_This.dFixPutTgtAndCvsDim(l_OfstWid);

						// 修正控件位置尺寸
						l_This.dFixWgtsPosDim(l_OfstWid);

						// 贴图
						l_This.dMap();
					};

					l_This.dRegPutTgtEvtHdlr_WidDtmnd(l_This.d_fOnWidDtmnd);
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

				// 把画布和面板摆放到目标
				if (l_This.d_Cvs)
				{
					l_This.dPutToTgt(l_This.d_Cvs);
				}

//				if (l_This.d_Pnl)
//				{
//					l_This.dPutToTgt(l_This.d_Pnl);
//				}

				// 各个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						l_This.dPutToTgt(a_Wgt.cAcsPutTgt());
						a_Wgt.vcRfshBefLot();
					});

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 各个控件
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						a_Wgt.vcRfshAftLot();
					});
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
//				if (l_This.d_NumIpt === a_DmntTch.cAcsEvtTgt())
//				{
//				//	a_DmntTch.c_Hdld = false;
//					return this;
//				}
//				else
//				if (l_This.d_NumIpt)
//				{
//					l_This.d_NumIpt.blur();
//				}

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
			,
			/// 使用宽高比
			/// a_ArStr：String，宽高比，形如“400:300”，以冒号分隔两个正整数
			cUseAr : function (a_ArStr)
			{
				// 在来源里搜索指定的宽高比
				var l_This = this;
				var l_ArAry = l_This.d_ArAry;
				if (0 == l_ArAry.length)
				{ return this; }

				var l_Idx = a_ArStr ? stAryUtil.cFind(l_ArAry,
				function (a_Ary, a_Idx, a_Elmt)
				{
					var l_AV = a_Elmt.getAttribute("data-Wse_Ar");
					return (l_AV == a_ArStr);
				}) : -1;

				if (l_Idx < 0) // 若未找到
				{
					if (l_This.d_ArIdx >= 0) // 若已设置，则保持不变
					{ return this; }

					l_Idx = 0;	// 选择[0]
				}

				if (l_This.d_ArIdx == l_Idx) // 没变？
				{ return this; }

				// 计算宽高比
				l_This.d_ArIdx = l_Idx;		// 记录宽高比索引
				l_This.d_ArStr = a_ArStr;	// 记录宽高比字符串
				var l_ColonIdx = a_ArStr.indexOf(":");
				var l_W = parseInt(a_ArStr.slice(0, l_ColonIdx));
				var l_H = parseInt(a_ArStr.slice(l_ColonIdx + 1, a_ArStr.length));
				l_This.d_Ar = l_W / l_H;

				// 取得这一组的图像源路径，发出请求
				l_This.d_ImgSrcNodeAry = stDomUtil.cQryAll(l_This.dGnrtQrySlc_PutSrc() +
					">[data-Wse_Ar=\"" + a_ArStr + "\"]>*[data-Wse_Src]");//, l_ArAry[l_This.d_ArIdx]);
				l_This.dSetNumTot(l_This.d_ImgSrcNodeAry.length);	// 设置总数

				if (l_This.d_ImgSrcNodeAry.length > 0)
				{
					l_This.d_ImgAry = new Array(l_This.d_ImgSrcNodeAry.length);
					stAryUtil.cFor(l_This.d_ImgAry,
					function (a_ImgAry, a_ImgIdx, a_Null)
					{
						var l_Img = new Image();
						l_Img.src = l_This.d_ImgSrcNodeAry[a_ImgIdx].getAttribute("data-Wse_Src");
						l_This.d_ImgAry[a_ImgIdx] = l_Img;
					});
				}
				else
				{
					l_This.d_ImgAry = null;
				}

				// 若尚未建立画布，立即返回，等到建立后再修正
				if (! l_This.d_Cvs)
				{ return this; }

				// 画布已建立……
				// 修正放置目标和画布尺寸
				var l_OfstWid = l_This.d_Cvs.width;	// 保持宽度不变
				l_This.dFixPutTgtAndCvsDim(l_OfstWid);

				// 修正控件位置尺寸
				l_This.dFixWgtsPosDim(l_OfstWid);
				return this;
			}
			,
			/// 存取张贴数组
			cAcsPostAry : function ()
			{
				return this.d_PostAry;
			}
			,
			/// 新建画布
			dNewCvs : function ()
			{
				var l_This = this;

				l_This.d_Cvs = document.createElement("canvas");
				l_This.dApdToSrc(l_This.d_Cvs);				// 放入来源
				l_This.d_2dCtxt = new t2dCtxt();			// 创建上下文
				l_This.d_2dCtxt.cBindCvs(l_This.d_Cvs);		// 绑定画布
				l_This.d_Path = new tPath();				// 创建路径

				return this;
			}
			,
			/// 新建面板
			dNewPnl : function ()
			{
				var l_This = this;
//				l_This.d_Pnl = document.createElement("div");
//				l_This.dApdToSrc(l_This.d_Pnl);				// 放入来源
//				stCssUtil.cAddCssc(l_This.d_Pnl, "cnWse_tGpuSldPlr_Pnl");	// CSS类
				return this;
			}
			,
			/// 新建控件集
			dNewWgtSet : function ()
			{
				var l_This = this;

				// 控件集
				l_This.d_WgtSet = new nUi.tWgtSet();
				l_This.eNewNumIpt();
				l_This.eNewBtn("Prev", "＜");
				l_This.eNewBtn("Next", "＞");
				l_This.eNewBtn("Auto", "►", true);
				l_This.eNewBtn("Rand", "※", true);
				l_This.d_Auto.cUpDown(false);
				l_This.d_Rand.cUpDown(false);
				l_This.eNewCmb();
				return this;
			}
			,
			// 新建按钮
			eNewBtn : function (a_Name, a_Text, a_UpDown, a_fOnClk)
			{
				var l_This = this;
				l_This.dGnrtSubWgtId(a_Name);
				var l_Div = stDomUtil.cObtnOne(null, "div", tWgt.sd_SubWgtPutSrcId, null, l_This.d_PutSrc);
				var l_Span = document.createElement("span");
				l_Span.setAttribute("data-Wse_Tit", "data-Wse_Tit");
				l_Span.textContent = a_Text || "";
				l_Div.appendChild(l_Span);

				var l_Wgt = new nCmnWgts.tBtn();
				l_Wgt.vcBind({
					c_PutTgt: tWgt.sd_SubWgtPutTgtId,
					c_PutSrc: tWgt.sd_SubWgtPutSrcId
					,c_UpDown : a_UpDown
					,c_Shp : nCmnWgts.tBtn.tShp.i_Cir
					,c_TitVcen : true
				//	,c_TxtrLyr : 1		// 纹理层
					,c_fOnClk : a_fOnClk
				});
				l_This["d_" + a_Name] = l_Wgt;
				l_This.d_WgtSet.cAdd(l_Wgt);
				nWse.stCssUtil.cAddCssc(l_Wgt.cAcsPutTgt(), "cnWse_tGpuSldPlr_" + a_Name);	// CSS类
			//	nWse.stCssUtil.cAddCssc(l_Wgt.cAcsPutTgt(), "cnWse_Skin_Metal");
			//	l_This.d_Pnl.appendChild(l_Wgt.cAcsPutTgt());	// 放入到面板里
				return l_Wgt;
			}
			,
			/// 新建数字框
			eNewNumIpt : function ()
			{
				var l_This = this;

				l_This.dGnrtSubWgtId("NumIpt");
				var l_Div = stDomUtil.cObtnOne(null, "div", tWgt.sd_SubWgtPutSrcId, null, l_This.d_PutSrc);
				l_Div.innerHTML = "<span data-Wse_Sfx>&nbsp;/&nbsp;0</span>";

				l_Wgt = new nCmnWgts.tEdit();
				l_Wgt.vcBind({
					c_PutTgt: tWgt.sd_SubWgtPutTgtId,
					c_PutSrc: tWgt.sd_SubWgtPutSrcId
					,c_fOnOk: function (a_Wgt, a_Text)
					{
//						var l_DivIdx = a_Text.indexOf("/");
//						if (l_DivIdx >= 0)
//						{ a_Text = a_Text.slice(0, l_DivIdx).trim(); }
//
//						a_Text += " / " + "999";
//						a_Wgt.cSetText(a_Text);
					}
				});
				l_This.d_NumIpt = l_Wgt;
				l_This.d_WgtSet.cAdd(l_Wgt);
			//	l_This.d_Pnl.appendChild(l_Wgt.cAcsPutTgt());	// 放入到面板里
				return this;
			}
			,
			/// 设置总数
			dSetNumTot : function (a_Tot)
			{
				var l_This = this;
				if (! l_This.d_NumIpt)
				{ return this; }

				l_This.d_NumIpt.cAcsDomSfx().innerHTML = "&nbsp;/&nbsp;" + a_Tot.toString();	// ／

				// 刷新
				l_This.d_NumIpt.cRfsh();
				return this;
			}
			,
			/// 新建组合框
			eNewCmb : function ()
			{
				var l_This = this;
				l_This.dGnrtSubWgtId("Post");
				var l_Div = stDomUtil.cObtnOne(null, "div", tWgt.sd_SubWgtPutSrcId, null, l_This.d_PutSrc);

				var l_Wgt = new nCmnWgts.tCmb();
				l_Wgt.vcBind({
					c_PutTgt: tWgt.sd_SubWgtPutTgtId,
					c_PutSrc: tWgt.sd_SubWgtPutSrcId
					,c_SlcOnly : true
					,c_fOnOk : function (a_Wgt, a_Text)
					{
						//
					}
				});
				l_This.d_Post = l_Wgt;
				l_This.d_WgtSet.cAdd(l_Wgt);
			//	l_This.d_Pnl.appendChild(l_Wgt.cAcsPutTgt());	// 放入到面板里

				// 把张贴数组里的名称装入
				l_This.dLoadCmbFromPostAry();
				return this;
			}
			,
			/// 修正放置目标和画布尺寸
			dFixPutTgtAndCvsDim : function (a_OfstWid)
			{
				a_OfstWid = Math.round(a_OfstWid);

				var l_This = this;
				if ((! l_This.d_Cvs) || (l_This.d_Cvs.width == a_OfstWid)) // 无变化
				{ return l_This; }

				if (l_This.d_Cvs.width != a_OfstWid)
				{
					l_This.d_Cvs.width = a_OfstWid;
				}

				var l_CvsH = Math.round(a_OfstWid / l_This.d_Ar);
				if (l_This.d_Cvs.height != l_CvsH)
				{
					l_This.d_Cvs.height = l_CvsH;
				}

				// 放置目标的高度不能低于画布
				if (l_This.d_PutTgt.offsetHeight < l_CvsH)
				{
					stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_CvsH);
				}

				// 清屏，用哪个？
			//	l_This.d_2dCtxt.cClr();
				l_This.d_2dCtxt.cFill();//null, tClo.i_White);	// 黑白？
				return this;
			}
			,
			/// 修正控件位置尺寸
			dFixWgtsPosDim : function (a_OfstWid)
			{
				a_OfstWid = Math.round(a_OfstWid);

				var l_This = this;
				if (! l_This.d_WgtSet)
				{ return this; }

				l_This.d_PnlW = a_OfstWid;	// 面板宽

				// 先计算各个控件的尺寸，触发各个控件的“WidDtmnd”事件
				var l_EvtAgms = [0, 1, 2];
				stAryUtil.cFor(l_This.d_WgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						var l_PutTgt = a_Wgt.cAcsPutTgt();
						l_EvtAgms[0] = l_PutTgt;
						l_EvtAgms[1] = l_PutTgt.offsetWidth;
						l_EvtAgms[2] = l_PutTgt.offsetWidth;
						nUi.fTrgrPutEvt(l_PutTgt, "WidDtmnd", l_EvtAgms);
					});

				// 计算整个放置目标的高度

				// 计算<div>与<canvas>的差量，以此确定面板Y
				if (l_This.d_DivCvsDta < 0)
				{
					l_This.d_DivCvsDta = Math.max(0, l_This.d_PutTgt.offsetHeight - l_This.d_Cvs.height);
				//	console.log("l_This.d_DivCvsDta = " + l_This.d_DivCvsDta)
				}

				l_This.d_PnlY = l_This.d_Cvs.height + l_This.d_DivCvsDta;

				// 修正位置，即排版……
				l_This.dCalcEachDim();
				l_This.dFlowNumIpt();
				l_This.dFlowBtns();
				l_This.dFlowPost();

				// 修正放置目标的高度
				var l_TotH = l_This.d_PnlY + l_This.d_RowHgt1 + l_This.d_RowHgt2 + l_This.d_RowHgt3;
				stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_TotH);

				return this;
			}
			,
			/// 计算各个尺寸
			dCalcEachDim : function ()
			{
				var l_This = this;
				if (! l_This.d_Prev)
				{
					l_This.d_BtnDim = l_This.d_NumIptW = 0;
					return this;
				}

				// 按钮宽度
				var l_PutTgt = l_This.d_Prev.cAcsPutTgt();
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, l_PutTgt, null, true);
				l_This.d_BtnDim = l_PutTgt.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;

				// 数字框
				l_PutTgt = l_This.d_NumIpt.cAcsPutTgt();
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, l_PutTgt, null, true);
				l_This.d_NumIptW = l_PutTgt.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;
				l_This.d_NumIptH = l_PutTgt.offsetHeight + tWgt.sd_PutTgtMgn.c_MgnUp + tWgt.sd_PutTgtMgn.c_MgnDn;

				// 贴图模式
				l_PutTgt = l_This.d_Post.cAcsPutTgt();
				stCssUtil.cGetMgn(tWgt.sd_PutTgtMgn, l_PutTgt, null, true);
				l_This.d_PostW = l_PutTgt.offsetWidth + tWgt.sd_PutTgtMgn.c_MgnLt + tWgt.sd_PutTgtMgn.c_MgnRt;
				l_This.d_PostH = l_PutTgt.offsetHeight + tWgt.sd_PutTgtMgn.c_MgnUp + tWgt.sd_PutTgtMgn.c_MgnDn;

				// 确定排成几行，和每行高度
				l_This.d_RowAmt = 1;
				l_This.d_RowHgt1 = Math.max(l_This.d_NumIptH, l_This.d_BtnDim, l_This.d_PostH);
				l_This.d_RowHgt2 = l_This.d_RowHgt3 = 0;
				if (l_This.d_NumIptW + l_This.d_BtnDim * 4 + l_This.d_PostW > l_This.d_PnlW) // 一行摆不开
				{
					l_This.d_RowAmt = 2;
					l_This.d_RowHgt1 = Math.max(l_This.d_NumIptH, l_This.d_BtnDim);
					if (l_This.d_PostW + l_This.d_BtnDim > l_This.d_PnlW)	// 两行摆不开
					{
						l_This.d_RowAmt = 3;
						l_This.d_RowHgt2 = l_This.d_BtnDim;
						l_This.d_RowHgt3 = l_This.d_PostH;
					}
					else
					{
						l_This.d_RowHgt2 = Math.max(l_This.d_BtnDim, l_This.d_PostH);
						l_This.d_RowHgt3 = 0;
					}
				}

				return this;
			}
			,
			/// 排列数字输入
			dFlowNumIpt : function ()
			{
				var l_This = this;
				var l_PutTgt = l_This.d_NumIpt.cAcsPutTgt();
				var l_Y = l_This.d_PnlY + (l_This.d_RowHgt1 - l_This.d_NumIptH) / 2;
				stCssUtil.cSetPos(l_PutTgt, 0, l_Y);
				return this;
			}
			,
			/// 排列按钮
			dFlowBtns : function ()
			{
				var l_This = this;
				var l_PnlAW = l_This.d_PnlW / 2;
				var l_PutTgt, l_X, l_Y, l_AutoX, l_RandX;

				if (1 == l_This.d_RowAmt)
				{
					// 随机
					l_RandX = l_This.d_PnlW - l_This.d_PostW - l_This.d_BtnDim;
					l_PutTgt = l_This.d_Rand.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_RandX, l_This.d_PnlY);

					// 自动
					l_AutoX = l_PnlAW;
					if (l_AutoX + l_This.d_BtnDim >= l_RandX) // 与随机重叠，向左推
					{
						l_AutoX = l_RandX - l_This.d_BtnDim;
					}
					l_PutTgt = l_This.d_Auto.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_AutoX, l_This.d_PnlY);

					// 后，前
					l_PutTgt = l_This.d_Next.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_AutoX - l_This.d_BtnDim, l_This.d_PnlY);
					l_PutTgt = l_This.d_Prev.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_AutoX - l_This.d_BtnDim * 2, l_This.d_PnlY);
				}
				else
				if (2 == l_This.d_RowAmt)
				{
					// 随机
					l_RandX = l_This.d_PnlW - l_This.d_PostW - l_This.d_BtnDim;
					l_PutTgt = l_This.d_Rand.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_RandX, l_This.d_PnlY + l_This.d_RowHgt1);

					// 自动
					l_AutoX = l_PnlAW;
				//	if (l_AutoX - l_This.d_BtnDim * 2 < 0 + l_This.d_NumIptW) // 与数字框重叠，向右至尽头
					{
						l_AutoX = l_This.d_PnlW - l_This.d_BtnDim;	//【还是摆在右头吧】
					}
					l_PutTgt = l_This.d_Auto.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_AutoX, l_This.d_PnlY);

					// 后，前
					l_PutTgt = l_This.d_Next.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_AutoX - l_This.d_BtnDim, l_This.d_PnlY);
					l_PutTgt = l_This.d_Prev.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_AutoX - l_This.d_BtnDim * 2, l_This.d_PnlY);
				}
				else // 3
				{
					// 前，后
					l_X = l_This.d_PnlW - l_This.d_BtnDim * 2;
					l_PutTgt = l_This.d_Prev.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_X, l_This.d_PnlY);
					l_PutTgt = l_This.d_Next.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_X + l_This.d_BtnDim, l_This.d_PnlY);

					// 自动，随机
					l_Y = l_This.d_PnlY + l_This.d_RowHgt1;
					l_PutTgt = l_This.d_Auto.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_X, l_Y);
					l_PutTgt = l_This.d_Rand.cAcsPutTgt();
					stCssUtil.cSetPos(l_PutTgt, l_X + l_This.d_BtnDim, l_Y);
				}

				return this;
			}
			,
			/// 排列贴图模式
			dFlowPost : function ()
			{
				var l_This = this;
				var l_PutTgt = l_This.d_Post.cAcsPutTgt();
				var l_X = l_This.d_PnlW - l_This.d_PostW;
				var l_Y = l_This.d_PnlY;
				if (2 == l_This.d_RowAmt)
				{
					l_Y += l_This.d_RowHgt1;
				}
				else
				if (3 == l_This.d_RowAmt)
				{
					l_Y += l_This.d_RowHgt1 + l_This.d_RowHgt2;
				}
				stCssUtil.cSetPos(l_PutTgt, l_X, l_Y);
				return this;
			}
			,
			/// 从张贴数组装载组合框
			dLoadCmbFromPostAry : function ()
			{
				var l_This = this;
				var l_Ul = l_This.d_Post.cAcsDomUl();
				stAryUtil.cFor(l_This.d_PostAry,
					function (a_PostAry, a_PostIdx, a_Post)
					{
						var l_Li = document.createElement("li");
						l_Li.textContent = a_Post.cGetName();
						l_Ul.appendChild(l_Li);
					});

				// 一开始选中首个
				if (! l_This.d_Post.cGetText())
				{
					l_This.d_Post.cSlcItem(0);
				}

				return this;
			}
			,
			/// 贴图
			dMap : function ()
			{
				var l_This = this;
				tSara.scEnsrTemps(2);
				var l_DstSara = tSara.sc_Temps[0], l_SrcSara = tSara.sc_Temps[1];
				l_This.d_2dCtxt.cMap(null, l_This.d_ImgAry[0], null, null);
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fClass(tGpuSldPlr,
		/// 张贴
		function atPost(a_Name)
		{
			this.e_Name = a_Name;
		},
		null,
		{
			cGetName : function ()
			{
				return this.e_Name;
			}
		});

		nWse.fClass(tGpuSldPlr,
		function tPost_飞入()
		{
			this.odBase(tPost_飞入).odCall("飞入");	// 基类版本
		},
		tGpuSldPlr.atPost,
		{
			//
		});
		s_PostAry.push(new tGpuSldPlr.tPost_飞入());

		nWse.fClass(tGpuSldPlr,
		function tPost_渐显()
		{
			this.odBase(tPost_渐显).odCall("渐显");	// 基类版本
		},
		tGpuSldPlr.atPost,
		{
			//
		});
		s_PostAry.push(new tGpuSldPlr.tPost_渐显());

		nWse.fClass(tGpuSldPlr,
		function tPost_百叶窗()
		{
			this.odBase(tPost_百叶窗).odCall("百叶窗");	// 基类版本
		},
		tGpuSldPlr.atPost,
		{
			//
		});
		s_PostAry.push(new tGpuSldPlr.tPost_百叶窗());

		nWse.fClass(tGpuSldPlr,
		function tPost_阶梯()
		{
			this.odBase(tPost_阶梯).odCall("阶梯");	// 基类版本
		},
		tGpuSldPlr.atPost,
		{
			//
		});
		s_PostAry.push(new tGpuSldPlr.tPost_阶梯());

		nWse.fClass(tGpuSldPlr,
		function tPost_六边形泛填充()
		{
			this.odBase(tPost_六边形泛填充).odCall("六边形泛填充");	// 基类版本
		},
		tGpuSldPlr.atPost,
		{
			//
		});
		s_PostAry.push(new tGpuSldPlr.tPost_六边形泛填充());

//		nWse.fClass(tGpuSldPlr,
//		function tPost_()
//		{
//			this.odBase(tPost_).odCall("");	// 基类版本
//		},
//		tGpuSldPlr.atPost,
//		{
//			//
//		});
//		s_PostAry.push(new tGpuSldPlr.tPost_());

	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////