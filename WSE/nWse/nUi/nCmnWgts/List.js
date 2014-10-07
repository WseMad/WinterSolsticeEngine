﻿/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nGpuWgts && l_Glb.nWse.nUi.nGpuWgts.tList)
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
	console.log("List.fOnIcld：" + a_Errs);

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
		a_This.d_Ul = null;
		a_This.d_LiAry = null;
		a_This.d_SlcAll = null;
		a_This.d_SlcRvs = null;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tList;
	(function ()
	{
		tList = nWse.fClass(nCmnWgts,
		/// 列表
		function tList()
		{
			this.odBase(tList).odCall();	// 基类版本

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
			///	c_PutTgt：String，放置目标的HTML元素ID，若不存在则选择来源里的<ul>
			/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
			/// c_MltSlc：Boolean，多选？默认false
			/// c_AlwNone：Boolean，允许不选？默认false
			/// c_Sprt：String，分隔符，序列化时使用，默认逗号","
			/// }
			vcBind : function f(a_Cfg)
			{
			//	tWgt.sd_PutTgtSlc = ">ul";		// 放置目标选择器
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tList");	// CSS类
				stCssUtil.cAddCssc(l_This.d_PutTgt, (a_Cfg.c_MltSlc ? "cnWse_MltSlc" : "cnWse_SglSlc"));

				l_This.d_Ul = stDomUtil.cQryOne(l_This.dGnrtQrySlc_PutSrc() + ">ul");		// 取得<ul>
				l_This.d_LiAry = stDomUtil.cQryAll(l_This.dGnrtQrySlc_PutSrc() + ">ul>li"); // 取得所有<li>
				l_This.dIstBtns();		// 为他们插入按钮

				// 如果是多选，添加两个辅助按钮
				if (l_This.d_Cfg.c_MltSlc)
				{
					l_This.dAddAsisBtns();
				}

				// 如果是单选，且不允许不选，默认选中首个
				if ((! l_This.d_Cfg.c_MltSlc) && (! l_This.d_Cfg.c_AlwNone))
				{
					l_This.cSlcItem(0);
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
			/// 序列化
			/// a_Kvo：Object，若为null则新建一个对象
			/// 返回：a_Kvo
			vcSrlz : function f(a_Kvo)
			{
				if (! a_Kvo)
				{ a_Kvo = {}; }

				var l_This = this;

				// 收集每个选中项的值
				var l_Val = "", l_Sprt = l_This.d_Cfg.c_Sprt || ",";
				stAryUtil.cFor(l_This.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{
						if (! l_This.cIsItemSlcd$Li(a_Li))
						{ return; }

						// 优先使用value特性（注意不要以属性方式访问），没有时选用textContent，最后选用text
						var l_Str = (a_Li.getAttribute("value") || a_Li.textContent || a_Li.text);
						if (! l_Str)
						{ return; }

						if (l_Val)
						{ l_Val += l_Sprt; }
						l_Val += l_Str.toString();
					});

				if (! l_Val)
				{ return a_Kvo; }

				var l_Key = l_This.dChkKeyOnSrlz(a_Kvo);
				a_Kvo[l_Key] = l_Val;
				return a_Kvo;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

			//	l_This.dUpdUlHgt();	//【见这个函数的解释】

				// <ul>摆放到目标
				l_This.dPutToTgt(l_This.d_Ul);

				// 辅助按钮摆放到目标
				if (l_This.d_SlcAll)
				{
					l_This.dPutToTgt(l_This.d_SlcAll);
					l_This.dPutToTgt(l_This.d_SlcRvs);
				}
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
					if (l_This.dIsTchEnd(a_DmntTch))
					{
						l_This.dSlc(a_DmntTch);	// 选取

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
			/// 存取选项
			/// 返回：<li>[]
			cAcsItems : function ()
			{
				return this.d_LiAry;
			}
			,
			/// 选取选项
			cSlcItem : function (a_Idx)
			{
				var l_This = this;
				if (! stAryUtil.cIsIdxVld(l_This.d_LiAry, a_Idx))
				{ return this; }

				// 如果是单选，取消其他
				if (! l_This.d_Cfg.c_MltSlc)
				{
					l_This.dCclSlcOth(l_This.d_LiAry[a_Idx]);
				}

				// 添加
				stCssUtil.cAddCssc(l_This.d_LiAry[a_Idx], "cnWse_tList_Slcd");
				return this;
			}
			,
			/// 取消选取选项，单选且不允许不选时忽略
			cCclSlcItem : function (a_Idx)
			{
				var l_This = this;
				if ((! l_This.d_Cfg.c_MltSlc) && (! l_This.d_Cfg.c_AlwNone))
				{
					return this;
				}

				if (! stAryUtil.cIsIdxVld(l_This.d_LiAry, a_Idx))
				{ return this; }

				// 移除
				stCssUtil.cRmvCssc(l_This.d_LiAry[a_Idx], "cnWse_tList_Slcd");
				return this;
			}
			,
			/// 选取全部选项，单选时只选第一个
			cSlcAllItems : function ()
			{
				var l_This = this;
				if (! l_This.d_Cfg.c_MltSlc)
				{ return this.cSlcItem(0); }

				stAryUtil.cFor(l_This.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{
						// 添加
						stCssUtil.cAddCssc(a_Li, "cnWse_tList_Slcd");
					});
				return this;
			}
			,
			/// 反选全部选项，单选时忽略
			cRvsSlcAllItems : function ()
			{
				var l_This = this;
				if (! l_This.d_Cfg.c_MltSlc)
				{
					return this;
				}

				stAryUtil.cFor(l_This.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{
						// 切换
						stCssUtil.cTglCssc(a_Li, "cnWse_tList_Slcd");
					});
				return this;
			}
			,
			/// 取消选取全部选项，单选且不允许不选时忽略
			cCclSlcAllItems : function ()
			{
				var l_This = this;
				if ((! l_This.d_Cfg.c_MltSlc) && (! l_This.d_Cfg.c_AlwNone))
				{
					return this;
				}

				stAryUtil.cFor(l_This.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{
						// 移除
						stCssUtil.cRmvCssc(a_Li, "cnWse_tList_Slcd");
					});
				return this;
			}
			,
			/// 有选中的项？
			cHasSlcdItem : function ()
			{
				return (stAryUtil.cFind(this.d_LiAry,
						function (a_Ary, a_Idx, a_Li)
						{ return stCssUtil.cHasCssc(a_Li, "cnWse_tList_Slcd"); }) >= 0);
			}
			,
			/// 有没选中的项？
			cHasUslcItem : function ()
			{
				return (stAryUtil.cFind(this.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{ return ! stCssUtil.cHasCssc(a_Li, "cnWse_tList_Slcd"); }) >= 0);
			}
			,
			/// 项是否被选中
			cIsItemSlcd$Li : function (a_Li)
			{
				return stCssUtil.cHasCssc(a_Li, "cnWse_tList_Slcd");
			}
			,
			/// 项是否被选中
			cIsItemSlcd$Idx : function (a_Idx)
			{
				return stAryUtil.cIsIdxVld(this.d_LiAry, a_Idx) && this.cIsItemSlcd$Li(this.d_LiAry[a_Idx]);
			}
			,
			/// 获取全部选中的项
			cGetAllSlcdItems : function ()
			{
				var l_Rst = [];
				var l_This = this;
				stAryUtil.cFor(l_This.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{
						if (l_This.cIsItemSlcd$Li(a_Li))
						{ l_Rst.push(a_Li); }
					});
				return l_Rst;
			}
			,
			/// 插入按钮
			dIstBtns : function ()
			{
				var l_This = this;
				stAryUtil.cFor(l_This.d_LiAry,
				function (a_Ary, a_Idx, a_Li)
				{
					var l_Dom = document.createElement("span");
					stCssUtil.cSetCssc(l_Dom, "cnWse_tList_Btn");
					a_Li.insertBefore(l_Dom, a_Li.firstChild);	// 插入到前方

					// 簿记
					if (! a_Li.Wse_List)
					{ a_Li.Wse_List = {}; }

					a_Li.Wse_List.c_DomBtn = l_Dom;
				});
				return this;
			}
			,
			/// 添加辅助按钮
			dAddAsisBtns : function ()
			{
				var l_This = this;
				var l_SlcAll = document.createElement("div");
				stCssUtil.cSetCssc(l_SlcAll, "cnWse_tList_SlcAll");
				l_SlcAll.textContent = "全选";
				l_SlcAll.addEventListener("click",
					function ()
					{
						if (l_This.cHasUslcItem())	// 有未选中的时，全选
						{
							l_This.cSlcAllItems();
						}
						else // 否则，取消全选
						{
							l_This.cCclSlcAllItems();
						}
					});
				l_This.d_SlcAll = l_SlcAll;
				l_This.d_PutSrc.appendChild(l_SlcAll);	// 放到来源

				var l_SlcRvs = document.createElement("div");
				stCssUtil.cSetCssc(l_SlcRvs, "cnWse_tList_SlcRvs");
				l_SlcRvs.textContent = "反选";
				l_SlcRvs.addEventListener("click",
					function ()
					{
						l_This.cRvsSlcAllItems();	// 反选
					});
				l_This.d_SlcRvs = l_SlcRvs;
				l_This.d_PutSrc.appendChild(l_SlcRvs);	// 放到来源

				return this;
			}
			,
			/// 更新<ul>高度
			dUpdUlHgt : function ()
			{
				//【不太好办，第一次执行时，由于尚未布局，<ul>（即放置目标）还没有放入布局的放置目标，
				// 导致dGetLiHgt()总是返回0，还是改用像素定高吧！】
				var l_This = this;
//				var l_ShowAmt = l_This.d_ShowAmt;
//				if (l_ShowAmt)
//				{
//					// 计算边框和内边距
//					var l_BdrThk = tWgt.sd_PutTgtBdrThk, l_Pad = tWgt.sd_PutTgtPad;
//					stCssUtil.cGetBdrThk(l_BdrThk, l_This.d_PutTgt);
//					stCssUtil.cGetPad(l_Pad, l_This.d_PutTgt);
//
//					l_ShowAmt = stNumUtil.cClmOnNum(l_ShowAmt, 1, l_This.d_LiAry.length);
//					var l_Hgt = l_This.dGetLiHgt() * l_ShowAmt +
//						l_BdrThk.c_BdrThkUp + l_BdrThk.c_BdrThkDn + l_Pad.c_PadUp + l_Pad.c_PadDn;
//					stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_Hgt);
//				}
//				else
//				{
//					// 由样式表决定
//					if (l_This.d_PutTgt.style.height)
//					{ l_This.d_PutTgt.style.height = ""; }
//				}
				return this;
			}
			,
			/// 获取<li>高度
			dGetLiHgt : function ()
			{
				var l_This = this;
				return l_This.d_LiAry[0].offsetHeight;
			}
			,
			/// 选取
			dSlc : function (a_DmntTch)
			{
				var l_This = this;

				// 如果未拾取到，或不是放置目标或其后代，不作处理
				var l_EvtTgt = a_DmntTch.cAcsEvtTgt();
				if ((! l_EvtTgt) || (! l_This.dIsSelfOrDsdtOfPutTgt(l_EvtTgt)))
				{
					return l_This;
				}

				// 如果点中了<ul>，否则不作处理
				if ("UL" == l_EvtTgt.tagName)
				{
					return l_This;
				}

				// 找到点中的<li>，施加样式
				var l_PkdLi = stDomUtil.cSrchSelfAndAcstForTag(l_EvtTgt, "LI");
				if (! l_PkdLi)	// 以防万一
				{ return this; }

			//	console.log(l_PkdLi.textContent)

				// 如果是单选，取消其他
				if (! l_This.d_Cfg.c_MltSlc)
				{
					l_This.dCclSlcOth(l_PkdLi);

					// 如果是当前选中项，但不允许不选，返回
					if ((! l_This.d_Cfg.c_AlwNone) && l_This.cIsItemSlcd$Li(l_PkdLi))
					{
						return this;
					}
				}

				// 切换
				stCssUtil.cTglCssc(l_PkdLi, "cnWse_tList_Slcd");
				return this;
			}
			,
			/// 取消选取其他
			/// a_EcldLi：<li>，排除，默认null
			dCclSlcOth : function (a_EcldLi)
			{
				var l_This = this;
				stAryUtil.cFor(l_This.d_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{
						if (a_Li !== a_EcldLi)
						{ stCssUtil.cRmvCssc(a_Li, "cnWse_tList_Slcd"); }
					});
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