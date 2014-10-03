/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tMenu)
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
	console.log("Menu.fOnIcld：" + a_Errs);

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
	var tEfc = nUi.tEfc || null;
	var stEfcMgr = nUi.stEfcMgr || null;

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
		// 每个<ul>的Wse_Menu.c_Sta：-1=退出，0=正常，1=进入

		a_This.d_Mode = "Expd";			// Expd=扩展式，Ovlp=层叠式
		a_This.d_RootUl = null;			// 根<ul>
		a_This.d_SlcLi = null;			// 选中的<li>
		a_This.d_ExpdDir = +1;			// 展开方向，默认向右，-1向左
		a_This.d_StkDist = 4;			// 堆叠距离
		a_This.d_fOnAnmtUpd = null;		// 当动画更新时
	}

	function fNullWse_Menu(a_Ary, a_Idx, a_Ul)
	{
		if (a_Ul.Wse_Menu)
		{ a_Ul.Wse_Menu = null; }
	}

	var s_LtArwHtml = '<div class="cnWse_LtArw">＜</div>';
	var s_RtArwHtml = '<div class="cnWse_RtArw">＞</div>';
	var s_UpArwHtml = '<div class="cnWse_UpArw">∧</div>';
	var s_DnArwHtml = '<div class="cnWse_DnArw">∨</div>';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tMenu;
	(function ()
	{
		tMenu = nWse.fClass(nCmnWgts,
		/// 按钮
		function tMenu()
		{
			this.odBase(tMenu).odCall();	// 基类版本

			var l_This = this;
			fRset(this);

//			if (tEfc)						// 特效，【先不用】
//			{
//				this.d_Efc = new tEfc();
//			}
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
			/// c_fLoadUl：void f(String a_Errs, String a_Html)，加载<ul>
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tMenu");		// CSS类

				// 得到各个DOM节点
				l_This.dObtnDomNodes();

				// 注册放置目标事件处理器 - 当动画更新时
				if (! l_This.d_fOnAnmtUpd)
				{
					// 展开式时必须校准位置
					l_This.d_fOnAnmtUpd = function (a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
					{
						// 校准各级列表位置
						if (l_This.cIsExpdMode())	// Expd在布局后校准次级列表，注意现在只更新即可！
						{ l_This.dRgltListsPos_ExpdMode(l_This.d_RootUl, null, true); }
					};

					nUi.fRegPutEvtHdlr(l_This.d_PutTgt, "AnmtUpd", l_This.d_fOnAnmtUpd);
				}

			//	l_This.d_PutTgt
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 簿记
				var l_PutSrcUlAry = stDomUtil.cGetChdsOfTag(l_This.d_PutSrc, "UL");
				var l_PutTgtUlAry = stDomUtil.cGetChdsOfTag(l_This.d_PutTgt, "UL");
				stAryUtil.cFor(l_PutSrcUlAry, fNullWse_Menu);
				stAryUtil.cFor(l_PutTgtUlAry, fNullWse_Menu);

				// CSS类
				l_This.dAddRmvCsscOfRoot(false);
				l_This.dAddRmvCsscOfNexts(false);

				// 注销放置目标事件处理器 - 当动画更新时
				if (l_This.d_fOnAnmtUpd)
				{
					nUi.fUrgPutEvtHdlr(l_This.d_PutTgt, "AnmtUpd", l_This.d_fOnAnmtUpd);
					l_This.d_fOnAnmtUpd = null;
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

				// 结束动画次级<ul>
				var l_Nexts = l_This.dGetListsInPutTgt();
				stAryUtil.cFor(l_Nexts,
					function (a_Ary, a_Idx, a_Next)
					{
						if ((! a_Next.Wse_Menu) || (0 == a_Next.Wse_Menu.c_Sta))
						{ return; }

						stCssUtil.cFnshAnmt(a_Next, true, true);
					});
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 应用模式的样式
				if (l_This.cIsExpdMode())
				{ l_This.dRplcCsscForPutTgt("cnWse_tMenu_Ovlp", "cnWse_tMenu_Expd", true); }
				else
				{ l_This.dRplcCsscForPutTgt("cnWse_tMenu_Expd", "cnWse_tMenu_Ovlp", true); }

				// 摆放根
				l_This.cAcsDomRoot();
				if (l_This.d_RootUl)
				{
					l_This.dPutToTgt(l_This.d_RootUl);
				}

				// 校准各级列表位置
				if (l_This.cIsExpdMode())	// Expd在布局前校准根列表
				{
					l_This.dRgltRootUl_ExpdMode();
				}
				else
			//	if (l_This.cIsOvlpMode())	// Ovlp在布局前校准
				{
					l_This.dRgltListsPos_OvlpMode(l_This.d_RootUl);
				}
				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 校准各级列表位置
				if (l_This.cIsExpdMode())	// Expd在布局后校准次级列表
				{ l_This.dRgltListsPos_ExpdMode(l_This.d_RootUl); }
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
						//if (l_This.d_Cfg.c_fOnClk)	// 回调
						//{ l_This.d_Cfg.c_fOnClk(l_This); }

						// 处理输入
						l_This.dHdlIptFromDmntTch_Mode(a_DmntTch, l_This.cIsExpdMode());
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
//				if (l_This.cIsExpdMode())	// 展开式时隐藏全部，【算了，这样就无法在两种模式切换期间维系状态】
//				{ l_This.dHideNexts(); }
				return this;
			}
			,
			/// 展开式？
			cIsExpdMode : function ()
			{
				return ("Expd" == this.d_Mode);
			}
			,
			/// 层叠式？
			cIsOvlpMode : function ()
			{
				return ("Ovlp" == this.d_Mode);
			}
			,
			/// 设置模式，【注意】如果修改了模式，需调用刷新函数！
			/// a_Mode：String，Expd（扩展式），Ovlp（层叠式），不区分大小写
			cSetMode : function (a_Mode)
			{
				a_Mode = a_Mode.toLowerCase();
				var l_NewMode;
				if ("expd" == a_Mode)
				{ l_NewMode = "Expd"; }
				else
				if ("ovlp" == a_Mode)
				{ l_NewMode = "Ovlp"; }

				if (this.d_Mode == l_NewMode)
				{ return this; }

				this.vcFnshAnmt();	// 改变模式前，先结束动画

				this.d_Mode = l_NewMode;
				return this;
			}
			,
			/// 获取堆叠距离
			/// 返回：Number
			cGetStkDist : function ()
			{
				return this.d_StkDist;
			}
			,
			/// 设置堆叠距离，仅用于扩展式
			cSetStkDist : function (a_Dist)
			{
				this.d_StkDist = a_Dist;
				return this;
			}
			,
			/// 存取DOM - 根
			cAcsDomRoot : function ()
			{
				if (! this.d_RootUl)
				{ this.d_RootUl = stDomUtil.cQryOne(this.dGnrtQrySlc_PutSrc() + ">[data-Wse_Root]"); }
				return this.d_RootUl;
			}
			,
			/// 得到DOM节点
			dObtnDomNodes : function ()
			{
				// 根必须存在，并作为初始顶级列表
				var l_This = this;
				l_This.cAcsDomRoot();
				stDomUtil.cRmvNonElmtChds(l_This.d_RootUl);		// 移除非元素子节点

				// CSS类
				l_This.dAddRmvCsscOfRoot(true);
			//	l_This.dAddRmvCsscOfNexts(true);

				// 隐藏次级列表
				l_This.dHideNexts();
				return this;
			}
			,
			/// 添加移除根的CSS类
			dAddRmvCsscOfRoot : function (a_Add)
			{
				if (this.d_RootUl)
				{
					a_Add
					? stCssUtil.cAddCssc(this.d_RootUl, "cnWse_tMenu_Root")
					: stCssUtil.cRmvCssc(this.d_RootUl, "cnWse_tMenu_Root");
				}
				return this;
			}
			,
			/// 有下一级<ul>？
			dHasNextUl : function (a_Li)
			{
				var l_CrntUl = a_Li.parentNode;
				var l_NextId = a_Li.getAttribute("data-Wse_Next");
				return !! l_NextId;
			}
			,
			/// 存取<li>的下一级<ul>
			dAcsNextUlOfLi : function (a_Li)
			{
				var l_This = this;
				var l_CrntUl = a_Li.parentNode;
				var l_NextId = a_Li.getAttribute("data-Wse_Next");
				var l_Rst = l_NextId ? document.getElementById(l_NextId) : null;
				if ((! l_Rst) && l_NextId) // 尚不在来源里，但却有下一级，可能需要动态异步加载
				{
					l_Rst = l_This.dNewPlchdUl(a_Li, l_NextId);	// 创建占位<ul>

					if (l_This.d_Cfg.c_fLoadUl) // 通知装载<ul>
					{
						l_This.d_Cfg.c_fLoadUl(l_NextId,
						function fOnCplt(a_Errs, a_Html)
						{
							// 替换占位<ul>的<li>
							// 注意若直接写入l_Rst.innerHTML会破坏已有子节点
							var l_Idx = stAryUtil.cFind(l_Rst.childNodes,
								function (a_Ary, a_Idx, a_Li)
								{ return  (a_Li.Wse_Menu && a_Li.Wse_Menu.c_IsWait); });
							if (l_Idx < 0)
							{ throw new Error("占位<li>去哪了？"); }

							var l_PlchdLi = l_Rst.childNodes[l_Idx];
							if (a_Errs) // 如果发生错误，提示并返回
							{
								l_PlchdLi.innerHTML = a_Errs.toString();
								l_PlchdLi.Wse_Menu.c_IsWait = false;
								l_PlchdLi.Wse_Menu.c_IsFail = true;
								return;
							}

							l_Rst.removeChild(l_PlchdLi); // 移除

							var l_TempDiv = document.createElement("div");
							l_TempDiv.innerHTML = a_Html;
							if (l_TempDiv.firstChild)
							{
								stDomUtil.cCopyAttrs(l_Rst, l_TempDiv.firstChild, ["id", "class"]);	// 拷贝部分特性
								while (l_TempDiv.firstChild.childNodes.length > 0)
								{
									l_Rst.appendChild(l_TempDiv.firstChild.childNodes[0]);
								}
							}

							l_This.dInitUl(l_Rst, a_Li);		// 初始化
							stCssUtil.cRmvCssc(l_Rst, "cnWse_tMenu_Plchd");	// 移除占位样式类
							l_Rst.Wse_Menu.c_IsPlchd = false;	// 不再是占位<ul>

							// 附加<ul>放入来源
							// 注意控件可能已解绑，导致d_PutSrc为null
							if (l_This.d_PutSrc)
							{
								while (l_TempDiv.childNodes.length > 1)
								{
									l_This.d_PutSrc.appendChild(l_TempDiv.childNodes[1]);
								}
							}

							// 层叠式时匹配放置目标高度，注意需要重新计算顶<ul>，因可能已变
							if (l_This.cIsOvlpMode())
							{ l_This.dMchPutTgtHgtWithTopUl(null); }

							// 重排布局，因为<ul>内容发生了变化！
							if (l_This.d_PutTgt && stFrmwk)
							{ stFrmwk.cRflLot(); }
						});
					}
				}

				if (l_Rst)
				{
					l_This.dInitUl(l_Rst,  a_Li);
				}
				return l_Rst;
			}
			,
			/// 初始化<ul>
			dInitUl : function (a_Ul, a_Li)
			{
				stCssUtil.cAddCssc(a_Ul, "cnWse_tMenu_Next");	// CSS类
				stDomUtil.cRmvNonElmtChds(a_Ul);				// 移除非元素子节点

				// 簿记：每个<ul>所属的上一级<li>
				if (! a_Ul.Wse_Menu)
				{ a_Ul.Wse_Menu = {}; }

				a_Ul.Wse_Menu.c_PrnLi = a_Li;
				return this;
			}
			,
			/// 新建占位<ul>
			dNewPlchdUl : function (a_Li, a_NextId)
			{
				var l_This = this;
				if (! l_This.d_PutSrc) // 已解绑？
				{ return l_This; }

				var l_Rst = document.createElement("ul");
				l_Rst.id = a_NextId;
				l_Rst.className = "cnWse_tMenu_Plchd";
				l_Rst.Wse_Menu = {};
				l_Rst.Wse_Menu.c_PrnLi = a_Li;
				l_Rst.Wse_Menu.c_IsPlchd = true;

				var l_Li = document.createElement("li");
				l_Li.Wse_Menu = {};
				l_Li.Wse_Menu.c_IsWait = true;
				l_Li.innerHTML = "Please wait……";
				l_Rst.appendChild(l_Li);

				l_This.d_PutSrc.appendChild(l_Rst);	// 必须放入来源
				return l_Rst;
			}
			,
			/// 存取<ul>里展开的<li>，跳过正在退出的
			dAcsExpdLiOfUl : function (a_Ul, a_Nexts)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				var l_Idx = stAryUtil.cFind(a_Nexts,
				function (a_Ary, a_Idx, a_Next)
				{ return (a_Next.Wse_Menu && (-1 != a_Next.Wse_Menu.c_Sta) && (a_Next.Wse_Menu.c_PrnLi.parentNode === a_Ul)); });
				return (l_Idx < 0) ? null : a_Nexts[l_Idx].Wse_Menu.c_PrnLi;
			}
			,
			/// 获取放置目标里的列表
			dGetListsInPutTgt : function ()
			{
			//	return stDomUtil.cQryAll(this.dGnrtQrySlc_PutTgt() + ">ul");
				return stDomUtil.cGetChdsOfTag(this.d_PutTgt, "UL");
			}
			,
			/// 存取顶端<ul>
			dAcsTopUl : function (a_Nexts)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				var l_Rst = (a_Nexts.length > 0) ? a_Nexts[a_Nexts.length - 1] : l_This.d_RootUl;
				var l_Zidx = l_Rst.style.zIndex ? parseInt(l_Rst.style.zIndex) : 0;
				nWse.fAst((a_Nexts.length - 1 == l_Zidx), "顶端<ul>不是最后一个次级<ul>！");
				return l_Rst;
			}
			,
			/// 是否为先辈<ul>
			dIsAcstUl : function (a_UlA, a_UlD)
			{
				var l_PrnLi = a_UlD.Wse_Menu && a_UlD.Wse_Menu.c_PrnLi;
				var l_PrnUl = l_PrnLi && l_PrnLi.parentNode;
				while (l_PrnUl)
				{
					if (l_PrnUl === a_UlA)
					{ return true; }

					l_PrnLi = l_PrnUl.Wse_Menu && l_PrnUl.Wse_Menu.c_PrnLi;
					l_PrnUl = l_PrnLi && l_PrnLi.parentNode;
				}
				return false;
			}
			,
			/// 有<ul>正在动画？
			dHasUlInAnmt : function (a_Nexts)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				return (stAryUtil.cFind(a_Nexts,
					function (a_Ary, a_Idx, a_Next)
					{ return a_Next.Wse_Menu && (0 != a_Next.Wse_Menu.c_Sta); }) >= 0);
			}
			,
			/// 处理输入
			dHdlIptFromDmntTch_Mode : function (a_DmntTch, a_ExpdMode)
			{
				var l_This = this;

				// 如果有正在动画的，吃掉这个输入
				var l_Nexts = l_This.dGetListsInPutTgt();
				if (l_This.dHasUlInAnmt(l_Nexts))
				{ return l_This; }

				// 如果未拾取到，或不是放置目标后代，收起来或不作处理
				var l_EvtTgt = a_DmntTch.cAcsEvtTgt();
				if ((! l_EvtTgt) || (! l_This.dIsDsdtOfPutTgt(l_EvtTgt)))
				{
				//	return a_ExpdMode ? l_This.dHideNexts() : l_This;
					return l_This;	// 不收了，直接返回即可
				}

				// 如果点中了<ul>，否则不作处理
				if ("UL" == l_EvtTgt.tagName)
				{
					return l_This;
				}

				//…… 点中了某个<li>或其后代，需展开下一级，或触发事件

				// 首先找到点中的<li>，继而取得所在<ul>，检查是否重复点击已展开的<li>
				var l_PkdLi = stDomUtil.cSrchSelfAndAcstForTag(l_EvtTgt, "LI");
				var l_PkdUl = l_PkdLi && l_PkdLi.parentNode;
				if ((l_This.dAcsExpdLiOfUl(l_PkdUl, l_Nexts) === l_PkdLi))	// 重复点击，收起来，注意层叠式不可能重复点击
				{
					l_This.dHideNexts(l_PkdUl, l_Nexts, true);	// 重排布局，因为有动画要做
					return l_This;
				}

				var l_NextUl = l_This.dAcsNextUlOfLi(l_PkdLi);
				if (l_NextUl)	// 有下一级，从l_PkdUl开始收起，摆放到目标，校准位置
				{
					l_This.dShowNextUl_Mode(l_PkdUl, l_NextUl, l_Nexts, a_ExpdMode);
				}
				else // 点中后退按钮
				if (l_PkdUl.Wse_Menu && (l_PkdLi === l_PkdUl.Wse_Menu.c_BackLi))
				{
					// 后退一级，重排布局
					l_This.dHideNexts(l_PkdUl.Wse_Menu.c_PrnLi.parentNode, l_Nexts, true);
				}
				else // 点中占位<ul>
				if (l_PkdUl.Wse_Menu && l_PkdUl.Wse_Menu.c_IsPlchd)
				{
					//
				}
				else // 无下一级，触发
				{
					// 记录选中的<li>，但先不要回调事件处理器，而是等到动画结束时
					l_This.d_SlcLi = l_PkdLi;

					// 隐藏全部，需要立即重排布局以返回根<ul>，
					// 注意重排布局应该在最后进行，所以这句调用后不要再修改位置、尺寸等属性了！
					l_This.dHideNexts(null, l_Nexts, true);

					// 如果没有<ul>正在动画，触发事件
				//	console.log("触发：" + l_PkdLi.textContent);
					if (! l_This.dHasUlInAnmt(null))
					{
						l_This.dTrgrSlcEvt();
					}
				}
				return this;
			}
			,
			/// 触发选中事件
			dTrgrSlcEvt : function ()
			{
				var l_This = this;
				if ((! l_This.d_SlcLi) || (! l_This.d_Cfg.c_fOnSlc))
				{ return this; }

				l_This.d_Cfg.c_fOnSlc(l_This, l_This.d_SlcLi);
				l_This.d_SlcLi = null;	// 复位
				return this;
			}
			,
			/// 隐藏次级列表
			dHideNexts : function (a_Root, a_Nexts, a_RflLot)
			{
				var l_This = this;
				if (! a_Root)
				{ a_Root = l_This.d_RootUl; }
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				stAryUtil.cFor(a_Nexts,
					function (a_Ary, a_Idx, a_Next)
					{
						if (l_This.dIsAcstUl(a_Root, a_Next))
						{
							//	l_This.dRtnToSrc(a_Next);
							a_Next.Wse_Menu.c_Sta = -1;	// 退出
						}
					});

				if (l_This.cIsExpdMode() && (l_This.d_RootUl === a_Root)) // 展开式时，移除根<ul>展开<li>的样式类
				{ l_This.dAddRmvExpdLiCsscOfRootUl(null); }

				if (a_RflLot && stFrmwk)	// 重排布局？
				{ stFrmwk.cRflLot(); }
				return this;
			}
			,
			/// 显示下一级<ul>
			dShowNextUl_Mode : function (a_TopUl, a_NextUl, a_Nexts, a_ExpdMode)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				if (a_ExpdMode) // 扩展式，隐藏同级可能已经展开的<ul>
				{
					l_This.dHideNexts(a_TopUl, a_Nexts);
				}
				else // 重叠式，需插入一个新<li>用来返回上级<ul>
				{
				//	l_This.dIstBackLi(a_NextUl);	// 【不用了，已移至校准】
				}

				// 递增z-index，摆放到目标
				a_NextUl.style.zIndex = (a_TopUl.style.zIndex ? parseInt(a_TopUl.style.zIndex) : 0) + 1;
				l_This.dPutToTgt(a_NextUl);
				a_Nexts = l_This.dGetListsInPutTgt();	// 更新a_Nexts
				a_NextUl.Wse_Menu.c_Sta = +1;	// 进入

				if (a_ExpdMode)	// 展开式应校准各级<ul>位置
				{
					l_This.dRgltListsPos_ExpdMode(a_TopUl, a_Nexts);
				}
				else // 层叠式应重排布局
				{
					if (stFrmwk)
					{ stFrmwk.cRflLot(); }
				}
				return this;
			}
			,
			/// 插入移除下一级箭头
			dIstRmvNextArw : function (a_Ul)
			{
				var l_This = this;
				stAryUtil.cFor(a_Ul.childNodes,
				function (a_Ary, a_Idx, a_DomNode)
				{
					// 只处理<li>
					if ((1 != a_DomNode.nodeType) || ("LI" != a_DomNode.tagName))
					{ return; }

					// 有下一级且已经有箭头且箭头方向未变，或无下一级且无箭头，返回
					var l_HasNextUl = l_This.dHasNextUl(a_DomNode);
					var l_HasNextArw = !! (a_DomNode.Wse_Menu && a_DomNode.Wse_Menu.c_ArwDir);
					var l_NewArwDir = (l_This.cIsExpdMode() && (l_This.d_RootUl === a_Ul)) ? 4 : 2;	// 1左2右3上4下
					if (l_HasNextUl == l_HasNextArw)	//【注意】false和null不相等！所以上行代码用了两个叹号
					{
						if ((! l_HasNextArw) || (a_DomNode.Wse_Menu.c_ArwDir == l_NewArwDir))
						{ return; }
					}

					// 已经有则删
					if (l_HasNextArw)
					{
						a_DomNode.innerHTML = a_DomNode.Wse_Menu.c_OrigHtml;
						a_DomNode.Wse_Menu.c_OrigHtml = null;
						a_DomNode.Wse_Menu.c_ArwDir = 0;

						if (! l_HasNextUl)	// 没有下一级就返回
						{ return; }
					}

					// 新建
					if (! a_DomNode.Wse_Menu)
					{ a_DomNode.Wse_Menu = {}; }

					a_DomNode.Wse_Menu.c_OrigHtml = a_DomNode.innerHTML;
					a_DomNode.Wse_Menu.c_ArwDir = l_NewArwDir;
					var l_ArwHtml = (4 == l_NewArwDir)
						? s_DnArwHtml
						: s_RtArwHtml;
					a_DomNode.innerHTML = a_DomNode.innerHTML + l_ArwHtml;
				//	a_DomNode.innerHTML = l_ArwHtml + a_DomNode.innerHTML;
				});
			}
			,
			/// 插入返回<li>
			dIstBackLi : function (a_Ul)
			{
				var l_This = this;
				if (l_This.d_RootUl === a_Ul)
				{ return this; }

				var l_PrnLi = a_Ul.Wse_Menu && a_Ul.Wse_Menu.c_PrnLi;
				if ((! l_PrnLi) || a_Ul.Wse_Menu.c_BackLi)
				{ return this; }

				var l_BackLi = document.createElement("li");
				l_BackLi.className = "cnWse_tMenu_BackLi";

				var l_PrnLiHtml = l_PrnLi.Wse_Menu ? l_PrnLi.Wse_Menu.c_OrigHtml : l_PrnLi.innerHTML;
				var l_ArwHtml = s_LtArwHtml;
				l_BackLi.innerHTML = l_ArwHtml + l_PrnLiHtml;

				a_Ul.insertBefore(l_BackLi, a_Ul.firstChild);
				a_Ul.Wse_Menu.c_BackLi = l_BackLi;	// 簿记
				return this;
			}
			,
			/// 移除返回<li>
			dRmvBackLi : function (a_Ul)
			{
				// 如果有返回<li>，删除它
				if (a_Ul.Wse_Menu && a_Ul.Wse_Menu.c_BackLi)
				{
					a_Ul.removeChild(a_Ul.Wse_Menu.c_BackLi);
					a_Ul.Wse_Menu.c_BackLi = null;
				}
				return this;
			}
			,
			/// 添加移除根<ul>展开<li>的样式类
			/// a_ExpdLi：null表示移除，指向某个<li>表示添加
			dAddRmvExpdLiCsscOfRootUl : function (a_ExpdLi)
			{
				if (a_ExpdLi)
				{
					stCssUtil.cAddCssc(a_ExpdLi, "cnWse_tMenu_ExpdLi");
					return this;
				}

				var l_ExpdLi = stDomUtil.cQryOne("#" + this.d_RootUl.id + ">li.cnWse_tMenu_ExpdLi");
				stCssUtil.cRmvCssc(l_ExpdLi, "cnWse_tMenu_ExpdLi");
				return this;
			}
			,
			/// 是一级<ul>？
			dIsLev1Ul : function (a_Ul)
			{
				return a_Ul.Wse_Menu && a_Ul.Wse_Menu.c_PrnLi && (this.d_RootUl === a_Ul.Wse_Menu.c_PrnLi.parentNode);
			}
			,
			/// 校准根<ul>
			dRgltRootUl_ExpdMode : function ()
			{
				var l_This = this;
				if (! l_This.d_RootUl)
				{ return this; }

				// 如果是根<ul>，将放置目标的高度设为空串
				// 这是用来应对从层叠式改成展开式，因为层叠式放置目标的高度被设置成像素了，而展开式要求自动计算
				if (l_This.d_PutTgt.style.height)
				{ l_This.d_PutTgt.style.height = ""; }

				// 根<ul>的宽高自动
				if (l_This.d_RootUl.style.width)
				{ l_This.d_RootUl.style.width = ""; }
				if (l_This.d_RootUl.style.height)
				{ l_This.d_RootUl.style.height = ""; }
				return this;
			}
			,
			/// 校准列表位置
			/// a_UpdOnly：Boolean，只更新？
			dRgltListsPos_ExpdMode : function (a_Root, a_Nexts, a_UpdOnly)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				l_This.d_ExpdDir = +1;	// 从向右开始
				l_This.eRgltListsPos_ExpdMode(a_Root, a_Nexts);

				if (a_UpdOnly)	// 若只更新则返回，否则……
				{ return this; }

				// 此时可能还有其他正在退出的，必须处理他们！
				stAryUtil.cFor(a_Nexts,
				function (a_Ary, a_Idx, a_Next)
				{
					if ((! a_Next.Wse_Menu) || (-1 != a_Next.Wse_Menu.c_Sta))
					{ return; }

				//	console.log("-1 : " + a_Next.id);

					var l_NextUl = a_Next;
					var l_AnmtEnd = null, l_fOnEnd = null;
					var l_Lev1 = l_This.dIsLev1Ul(a_Next);
					l_AnmtEnd = l_Lev1
					? {
						"top": "0px"
					}
					: {
						"left": (l_NextUl.offsetLeft - l_NextUl.offsetWidth).toString() + "px"
					};

					l_fOnEnd = function ()
					{
						l_NextUl.Wse_Menu.c_Sta = 0;	// 正常
						l_This.dRtnToSrc(l_NextUl);	// 结束时放回来源

						// 如果根<ul>没有展开的<li>，移除根<ul>展开<li>的样式类
						var l_Nexts = l_This.dGetListsInPutTgt();	// 注意应重新计算！
						if (! l_This.dAcsExpdLiOfUl(l_This.d_RootUl, l_Nexts))
						{ l_This.dAddRmvExpdLiCsscOfRootUl(null); }

						// 如果有选中的<li>，且只剩根<ul>
						if (l_This.d_SlcLi && (1 == l_Nexts.length))
						{
							l_This.dTrgrSlcEvt();
						}
					};

					stCssUtil.cAnmt(l_NextUl,
						l_AnmtEnd,
						{
							c_Dur: tMenu.sc_AnmtDur,
							c_fEsn: function (a_Scl)
							{
								//	return a_Scl;
								return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.5, a_Scl, false);
							},
							c_fOnEnd : l_fOnEnd
						});
				});

				return this;
			}
			,
			eRgltListsPos_ExpdMode : function (a_Root, a_Nexts)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				// 移除返回<li>，插入移除下一级箭头
				l_This.dRmvBackLi(a_Root);
				l_This.dIstRmvNextArw(a_Root);

				// 取得展开的<li>
				var l_ExpdLi = l_This.dAcsExpdLiOfUl(a_Root, a_Nexts);
				if (l_This.d_RootUl === a_Root)	// 添加根<ul>展开<li>的样式类
				{ l_This.dAddRmvExpdLiCsscOfRootUl(l_ExpdLi); }

				if (! l_ExpdLi) // 若无则返回
				{ return l_This; }

				// 取得下一级<ul>
				//【注意】立即改成绝对定位，使得l_NextUl的宽度=最宽的子元素宽度；
				// 若不这么做，后面访问offsetWidth时得到的是所属容器的宽度，因为块级元素默认填充容器！
				var l_NextUl = l_This.dAcsNextUlOfLi(l_ExpdLi);
			//	l_NextUl.style.position = "absolute";	//（已移至样式表）

				// 由于可能从层叠式突然跳过来，所以重复设置一遍……
				//【注意】必须在下面的位置计算之前进行，因为位置的计算依赖于宽度
				if (l_NextUl.style.width)				// 宽度自动
				{ l_NextUl.style.width = ""; }
//				if (l_NextUl.style.height)				// 高度自动【应该一直没改过高度】
//				{ l_NextUl.style.height = ""; }

				tSara.scEnsrTemps(2);
			//	var l_PtBbox = l_This.dCalcPutTgtBbox(tSara.sc_Temps[0]);
				var l_PtBbox = tSara.sc_Temps[0].cCrt(0, 0, window.innerWidth, window.innerHeight);	// 这个更好！
				var l_UlSara = tSara.sc_Temps[1];
				var l_LoopCnt = 0, l_LtSpc = 0, l_RtSpc = 0;
				var l_StkDist = l_This.d_StkDist;		// 堆叠距离

				if (l_This.d_RootUl === a_Root)	// 如果是根，摆到下方
				{
					l_UlSara.cCrt(
						l_ExpdLi.offsetLeft,
						l_ExpdLi.offsetTop + l_ExpdLi.offsetHeight,
						l_NextUl.offsetWidth,
						l_NextUl.offsetHeight);
				}
				else // 非根，放到左或右空间足够的一方
				{
					while (l_LoopCnt < 3)	// 最多迭代三次
					{
						if (2 == l_LoopCnt)	// 最后一次迭代，哪侧空间大就放哪侧
						{
							l_This.d_ExpdDir = (l_LtSpc > l_RtSpc) ? -1 : +1;
						}

						if (l_This.d_ExpdDir < 0)	// 向左
						{
							l_UlSara.cCrt(
								a_Root.offsetLeft - l_NextUl.offsetWidth + l_StkDist,
								a_Root.offsetTop + l_ExpdLi.offsetTop + l_StkDist,
								l_NextUl.offsetWidth,
								l_NextUl.offsetHeight);

							if (l_LoopCnt < 2)	// 前两次迭代，记录两侧空间
							{ l_LtSpc = a_Root.offsetLeft; }

							if (l_UlSara.c_X >= 0)	// 能放得下就跳出
							{ break; }
							else // 否则改变方向再次尝试
							{ l_This.d_ExpdDir = -l_This.d_ExpdDir; }
						}
						else // 向右
						{
							l_UlSara.cCrt(
								a_Root.offsetLeft + a_Root.offsetWidth - l_StkDist,
								a_Root.offsetTop + l_ExpdLi.offsetTop + l_StkDist,
								l_NextUl.offsetWidth,
								l_NextUl.offsetHeight);

							if (l_LoopCnt < 2)	// 前两次迭代，记录两侧空间
							{ l_RtSpc = l_PtBbox.c_W - l_UlSara.c_X; }

							if (l_PtBbox.c_W - l_UlSara.c_X - l_UlSara.c_W >= l_UlSara.c_W)	// 能放得下就跳出
							{ break; }
							else // 否则改变方向再次尝试
							{ l_This.d_ExpdDir = -l_This.d_ExpdDir; }
						}

						++ l_LoopCnt;
					}
				}

				tSara.scBndPut(l_UlSara, l_PtBbox);		// 最后仍要有界放置

				// 动画定位
				var l_Anmt = true, l_AnmtEnd = null, l_fOnEnd = null;
				var l_Lev1 = l_This.dIsLev1Ul(l_NextUl);	// 一级<ul>？
				if (-1 == l_NextUl.Wse_Menu.c_Sta)
				{
					l_Anmt = false;
					//【已移至dRgltListsPos_ExpdMode】
//					l_AnmtEnd = l_Lev1
//					? {
//						"top": "0px"
//					}
//					: {
//						"left": "0px"
//					};
//
//					l_fOnEnd = function ()
//					{
//						l_NextUl.Wse_Menu.c_Sta = 0;	// 正常
//						l_This.dRtnToSrc(l_NextUl);	// 结束时放回来源
//
//						if (l_This.d_RootUl === a_Root)	// 移除根<ul>展开<li>的样式类
//						{ l_This.dAddRmvExpdLiCsscOfRootUl(null); }
//					};

				}
				else
				if (0 == l_NextUl.Wse_Menu.c_Sta)
				{
					// 由于可能从层叠式突然跳过来，所以重复设置一遍……
					stCssUtil.cSetPos(l_NextUl, l_UlSara.c_X, l_UlSara.c_Y);
				}
				else
				if (+1 == l_NextUl.Wse_Menu.c_Sta)
				{
					l_AnmtEnd = l_Lev1
					? {
						"top": l_UlSara.c_Y.toString() + "px"
					}
					: {
						"left": l_UlSara.c_X.toString() + "px"
					};

					l_fOnEnd = function ()
					{
						l_NextUl.Wse_Menu.c_Sta = 0;	// 正常
					};

					// 没在动画中时，设置动画初值
					if (! stCssUtil.cIsDurAnmt(l_NextUl))
					{
						l_Lev1
						? stCssUtil.cSetPos(l_NextUl, l_UlSara.c_X, 0)
						: stCssUtil.cSetPos(l_NextUl, l_UlSara.c_X - l_UlSara.c_W, l_UlSara.c_Y);
					}
				}

				if (l_Anmt)
				{
					stCssUtil.cAnmt(l_NextUl,
					l_AnmtEnd,
					{
						c_Dur: tMenu.sc_AnmtDur,
						c_fEsn: function (a_Scl)
						{
							//	return a_Scl;
							return nWse.stNumUtil.cPrbItp$Ovfl(0, 1, 1.5, a_Scl, false);
						},
						c_fOnEnd : l_fOnEnd
					});
				}

				// 递归
				l_This.eRgltListsPos_ExpdMode(l_NextUl, a_Nexts);
				return this;
			}
			,
			/// 校准列表位置
			dRgltListsPos_OvlpMode : function (a_Root, a_Nexts)
			{
				var l_This = this;
				if (! a_Nexts)
				{ a_Nexts = l_This.dGetListsInPutTgt(); }

				// 移除根<ul>展开<li>的样式类
				if (l_This.d_RootUl === a_Root)
				{ l_This.dAddRmvExpdLiCsscOfRootUl(null); }

				// 插入移除下一级箭头，插入返回<li>
				var l_TopUl = l_This.dAcsTopUl(a_Nexts);
				l_This.dIstRmvNextArw(l_TopUl);
				l_This.dIstBackLi(l_TopUl);

				// 只显示a_Nexts里的最后一个，即最顶
				if (l_TopUl === l_This.d_RootUl)	// 如果是根
				{
					// 不用定位，但要把放置目标的高度设为空串（因其是绝对定位，高度将由所含元素，即根<ul>决定）
					if (l_This.d_PutTgt.style.height)
					{ l_This.d_PutTgt.style.height = ""; }
					return this;
				}

				// 对中间的<ul>，由于可能从展开式突然跳过来，所以重复设置一遍……
				// 但是，若已经有选中的<li>，则直接将它们放回来源
				stAryUtil.cFor(a_Nexts,
					function (a_Ary, a_Idx, a_Next)
					{
						if ((l_This.d_RootUl === a_Next) || (l_TopUl === a_Next))
						{ return; }

						if (l_This.d_SlcLi)
						{
							a_Next.Wse_Menu.c_Sta = 0;	// 正常
							l_This.dRtnToSrc(a_Next);	// 结束时放回来源
							return;
						}

						// 插入移除下一级箭头，插入返回<li>
						l_This.dIstRmvNextArw(a_Next);
						l_This.dIstBackLi(a_Next);

						// 定位
						stCssUtil.cSetPos(a_Next, 0, 0);
						stCssUtil.cSetDimWid(a_Next, "100%");
					});

				// 动画定位
				var l_AnmtEnd = null, l_fOnEnd = null;
				if (-1 == l_TopUl.Wse_Menu.c_Sta)
				{
					l_AnmtEnd = l_This.d_SlcLi
					? {
						"top": (-l_This.d_RootUl.offsetHeight).toString() + "px"
					}
					: {
						"left": l_This.d_RootUl.offsetWidth.toString() + "px"
					};

					l_fOnEnd = function ()
					{
						l_TopUl.Wse_Menu.c_Sta = 0;	// 正常
						l_This.dRtnToSrc(l_TopUl);	// 结束时放回来源

						// 匹配放置目标高度，注意需要重新计算顶<ul>，因已不再是l_TopUl
						l_This.dMchPutTgtHgtWithTopUl(null);

						// 触发事件
						l_This.dTrgrSlcEvt();

						// 重排，因为放置目标高度变了
						// 注意这里不会无限递归，因为动画只在c_Sta非0时才会被引发，而现在已将其设为0
						if (stFrmwk)
						{ stFrmwk.cRflLot(); }
					};
				}
				else
				if (0 == l_TopUl.Wse_Menu.c_Sta)
				{
					// 由于可能从展开式突然跳过来，所以重复设置一遍……
					l_This.dMchPutTgtHgtWithTopUl(l_TopUl);	// 匹配放置目标高度
					stCssUtil.cSetPos(l_TopUl, 0, 0);
					stCssUtil.cSetDimWid(l_TopUl, "100%");
				}
				else
				if (+1 == l_TopUl.Wse_Menu.c_Sta)
				{
					l_AnmtEnd = {
						"left": "0px"
					};

					l_fOnEnd = function ()
					{
						l_TopUl.Wse_Menu.c_Sta = 0;	// 正常
					};

					// 匹配放置目标高度
					l_This.dMchPutTgtHgtWithTopUl(l_TopUl);

					// 没在动画中时，设置动画初值
					if (! stCssUtil.cIsDurAnmt(l_TopUl))
					{
						stCssUtil.cSetPos(l_TopUl, l_This.d_RootUl.offsetWidth, 0);	// 放在右外侧
						stCssUtil.cSetDimWid(l_TopUl, "100%");
					}
				}

				stCssUtil.cAnmt(l_TopUl,
					l_AnmtEnd,
					{
						c_Dur: tMenu.sc_AnmtDur,
						c_fOnEnd : l_fOnEnd
					});

//				if (l_This.d_Efc) // 如果有特效
//				{
//					l_This.d_Efc.cSetUniDur(tMenu.sc_AnmtDur);
//					l_This.d_Efc.cClrItems();
//					stEfcMgr.cBind(l_This.d_Efc)
//						.cCssEntBgn_FromRt();
//
//					stEfcMgr.cIsuCssAnmt(true,
//						l_This.d_PutTgt, l_TopUl,
//						1, l_This.d_Efc, null,
//						{ // 注意这里最后面的“=”，至关重要！
//							"left": "0px",
//							"top": "0px",
//							"width": l_This.d_PutTgt.offsetWidth.toString() + "px=100%",
//							"height": l_TopUl.offsetHeight.toString() + "px="
//						}, null);
//				}
//				else
//				{
//				//	l_TopUl.style.position = "absolute";		// 立即改成绝对定位（已移至样式表）
//					stCssUtil.cSetPos(l_TopUl, 0, 0);			// 位于原点
//					stCssUtil.cSetDimWid(l_TopUl, "100%");		// 宽度填充放置目标
//				}
				return this;
			}
			,
			/// 匹配放置目标高度与顶<ul>
			dMchPutTgtHgtWithTopUl : function (a_TopUl)
			{
				a_TopUl = a_TopUl || this.dAcsTopUl();
				stCssUtil.cSetDimHgt(this.d_PutTgt, a_TopUl.offsetHeight);
				return this;
			}
		}
		,
		{
			/// 动画时长
			sc_AnmtDur : 0.3
		}
		,
		false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////