/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tAcod)
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
	console.log("Acod.fOnIcld：" + a_Errs);

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
		a_This.d_Tits = null;
		a_This.d_Ctnts = null;
		a_This.d_CtntPad = {};
	}

	var s_RtArwHtml = '<span class="cnWse_RtArw">＞</span>';
	var s_DnArwHtml = '<span class="cnWse_DnArw">∨</span>';

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tAcod;
	(function ()
	{
		tAcod = nWse.fClass(nCmnWgts,
		/// 折叠框
		function tAcod()
		{
			this.odBase(tAcod).odCall();	// 基类版本

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
			/// c_InitExpdAll：Boolean，初始展开全部标题？默认false
			/// c_InitExpd：Number[]，初始展开的标题索引数组，覆盖c_InitExpdAll
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tAcod");	// CSS类

				// 取得标题和内容
				l_This.d_Tits = l_This.dGetDomNodesByAttr("Wse_Tit", false);
				l_This.d_Ctnts = l_This.dGetDomNodesByAttr("Wse_Ctnt", false);

				l_This.dAddRmvCsscOf(true, true);	// CSS类
				l_This.dAddRmvCsscOf(false, true);

				// 给标题添加右箭头
				stAryUtil.cFor(l_This.d_Tits,
				function (a_Ary, a_Idx, a_Tit)
				{
					l_This.dSetTitArwHtml(a_Tit, true);
				});

				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				l_This.dAddRmvCsscOf(true, false);	// CSS类
				l_This.dAddRmvCsscOf(false, false);

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

				// 结束动画内容
				stAryUtil.cFor(l_This.d_Ctnts,
					function (a_Ary, a_Idx, a_Ctnt)
					{
						if ((! a_Ctnt.Wse_Acod) || (0 == a_Ctnt.Wse_Acod.c_Sta))
						{ return; }
						
						stCssUtil.cFnshAnmt(a_Ctnt, true, true);
					});
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 为了动画高度，先清除放置目标的高度，以使浏览器自动计算
				l_This.dClrPutTgtCssHgt();

				// 把标题摆放到目标（如果还没放的话）
				if (l_This.d_Tits && (l_This.d_Tits.length > 0) && (! l_This.dIsPutInTgt(l_This.d_Tits[0])))
				{
					stAryUtil.cFor(l_This.d_Tits,
					function (a_Ary, a_Idx, a_Tit)
					{
						l_This.dPutToTgt(a_Tit);
					});

					// 初始展开项
					if (l_This.d_Cfg.c_InitExpd && (l_This.d_Cfg.c_InitExpd.length > 0))
					{
						stAryUtil.cFind(l_This.d_Cfg.c_InitExpd,
						function (a_Ary, a_Idx, a_ItemIdx)
						{
							l_This.dExpdTit(a_ItemIdx, false);	// 【警告】不要再次进入时重排！
							return !! l_This.d_Cfg.c_ExpdOnlyOne;
						});
					}
					else
					if (l_This.d_Cfg.c_InitExpdAll)
					{
						if (l_This.d_Cfg.c_ExpdOnlyOne)	// 只展开一项时展开首项
						{
							l_This.dExpdTit(0, false);	// 【警告】不要再次进入时重排！
						}
						else
						{
							stAryUtil.cFor(l_This.d_Tits,
							function (a_Ary, a_Idx, a_Tit)
							{
								l_This.dExpdTit(a_Idx, false);	// 【警告】不要再次进入时重排！
							});
						}
					}
				}

				// 动画内容
				stAryUtil.cFor(l_This.d_Ctnts,
				function (a_Ary, a_Idx, a_Ctnt)
				{
					if ((! a_Ctnt.Wse_Acod) || (0 == a_Ctnt.Wse_Acod.c_Sta))
					{ return; }

					if (+1 == a_Ctnt.Wse_Acod.c_Sta)
					{
						// 插入到紧接着的下一个位置
						if (! l_This.dIsPutInTgt(a_Ctnt))
						{
							l_This.dPutToTgt(a_Ctnt, stDomUtil.cAcsSbl(l_This.d_Tits[a_Idx], +1));
						}
					}
				});

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 动画内容
				stAryUtil.cFor(l_This.d_Ctnts,
				function (a_Ary, a_Idx, a_Ctnt)
				{
					if ((! a_Ctnt.Wse_Acod) || (+1 != a_Ctnt.Wse_Acod.c_Sta))
					{ return; }

					if (! a_Ctnt.Wse_Acod.c_Hgt)	// 如果是0，更新记录
					{ a_Ctnt.Wse_Acod.c_Hgt = a_Ctnt.offsetHeight; }

					stCssUtil.cGetPad(l_This.d_CtntPad, a_Ctnt);	// 计算内边距

					// 设置动画起始值
					stCssUtil.cSetDimHgt(a_Ctnt, 0);
					a_Ctnt.style.paddingTop = "0px";
					a_Ctnt.style.paddingBottom = "0px";

					// 动画，注意结尾处的等号
					stCssUtil.cAnmt(a_Ctnt,
						{
							"height": a_Ctnt.Wse_Acod.c_Hgt.toString() + "px=",
							"paddingTop": l_This.d_CtntPad.c_PadUp.toString() + "px=",
							"paddingBottom": l_This.d_CtntPad.c_PadDn.toString() + "px="
						},
						{
							c_Dur: tAcod.sc_AnmtDur,
							c_fOnEnd: function ()
							{
								a_Ctnt.Wse_Acod.c_Sta = 0;	// 正常
							}
						});
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
				var l_EvtTgt = null, l_PkdTitIdx = -1, l_PkdTit = null;

				if (l_This.dIsTchBgn(a_DmntTch))
				{
					a_DmntTch.c_Hdld = true;		// 已处理
				}
				else
				if (l_This.dIsTchLostOrEnd(a_DmntTch))
				{
					if (l_This.dIsTchEnd(a_DmntTch))
					{
						// 找到选中的标题
						l_EvtTgt = a_DmntTch.cAcsEvtTgt();
						l_PkdTitIdx = l_This.dFindPkdTit(l_EvtTgt);
						if (l_PkdTitIdx >= 0)
						{
						//	console.log("选中 : " + l_PkdTit.textContent);

							// 转移内容
							l_This.dTsfrCtnt(l_PkdTitIdx, true);	// 允许进入时重排
						}
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
			/// 添加移除CSS类
			dAddRmvCsscOf : function (a_Tit, a_Add)
			{
				var l_This = this;
				var l_Cssc = (a_Tit ? "cnWse_tAcod_Tit" : "cnWse_tAcod_Ctnt");
				stAryUtil.cFor((a_Tit ? l_This.d_Tits : l_This.d_Ctnts),
					function (a_Ary, a_Idx, a_Elmt)
					{
						a_Add
						? stCssUtil.cAddCssc(a_Elmt, l_Cssc)
						: stCssUtil.cRmvCssc(a_Elmt, l_Cssc);
					});
			}
			,
			/// 查找拾取到的标题
			dFindPkdTit : function (a_EvtTgt)
			{
				if (! a_EvtTgt)
				{ return null; }

				var l_This = this;
				var l_Idx = stAryUtil.cFind(l_This.d_Tits,
				function (a_Ary, a_Idx, a_Tit)
				{
					return stDomUtil.cIsSelfOrAcst(a_Tit, a_EvtTgt);
				});
				return l_Idx;
			}
			,
			/// 转移内容
			/// a_RflLotOnEnt：Boolean，当进入时重排布局？
			dTsfrCtnt : function (a_TitIdx, a_RflLotOnEnt)
			{
				var l_This = this;
				if (! stAryUtil.cIsIdxVld(l_This.d_Tits, a_TitIdx))
				{ return this; }

				// 如果在来源里则放入目标，否则放回来源
				var l_Tit = l_This.d_Tits[a_TitIdx];
				var l_Ctnt = l_This.d_Ctnts[a_TitIdx];

				if (l_This.dIsPutInSrc(l_Ctnt)) // 在来源里
				{
					l_This.dExpdTit(a_TitIdx, a_RflLotOnEnt);

					if (l_This.d_Cfg.c_ExpdOnlyOne)	// 只展开一项？
					{ l_This.dFoldAllBut(a_TitIdx); }
				}
				else // 在目标里
				{
					l_This.dFoldTit(a_TitIdx);
				}

				return this;
			}
			,
			/// 折叠全部除了
			dFoldAllBut : function (a_ButIdx)
			{
				var l_This = this;
				stAryUtil.cFor(l_This.d_Tits,
				function (a_Ary, a_Idx, a_Tit)
				{
					if (a_Idx == a_ButIdx)
					{ return; }

					l_This.dFoldTit(a_Idx);
				});
			}
			,
			/// 展开标题
			dExpdTit: function (a_TitIdx, a_RflLotOnEnt)
			{
				var l_This = this;
				if (! stAryUtil.cIsIdxVld(l_This.d_Tits, a_TitIdx))
				{ return this; }

				var l_Tit = l_This.d_Tits[a_TitIdx];
				var l_Ctnt = l_This.d_Ctnts[a_TitIdx];

				// 已在目标里？
				if (l_This.dIsPutInTgt(l_Ctnt))
				{ return this; }

				// 展开
				stCssUtil.cAddCssc(l_Tit, "cnWse_tAcod_TitExpd");	// 标题CSS类
				l_This.dSetTitArwHtml(l_Tit, false);

				// 在内容上簿记
				if (! l_Ctnt.Wse_Acod)
				{ l_Ctnt.Wse_Acod = {}; }

				//	l_Ctnt.Wse_Acod.c_Hgt = l_Ctnt.offsetHeight;	// 记录内容高度，【注意】可能是0（从vcRfshBefLot调用本函数时）
				l_Ctnt.Wse_Acod.c_Sta = +1;		// 进入

				// 重排
				if (a_RflLotOnEnt && stFrmwk)
				{ stFrmwk.cRflLot(); }

				return this;
			}
			,
			/// 折叠标题
			dFoldTit: function (a_TitIdx)
			{
				var l_This = this;
				if (! stAryUtil.cIsIdxVld(l_This.d_Tits, a_TitIdx))
				{ return this; }

				var l_Tit = l_This.d_Tits[a_TitIdx];
				var l_Ctnt = l_This.d_Ctnts[a_TitIdx];

				// 已在来源里？
				if (l_This.dIsPutInSrc(l_Ctnt))
				{ return this; }

				// 在内容上簿记
				if (! l_Ctnt.Wse_Acod)
				{ l_Ctnt.Wse_Acod = {}; }

				l_Ctnt.Wse_Acod.c_Sta = -1;		// 离开

				// 动画，注意结尾处的等号
				stCssUtil.cAnmt(l_Ctnt,
					{
						"height": "0px=",
						"paddingTop": "0px=",
						"paddingBottom": "0px="
					},
					{
						c_Dur: tAcod.sc_AnmtDur,
						c_fOnEnd: function ()
						{
							stCssUtil.cRmvCssc(l_Tit, "cnWse_tAcod_TitExpd");	// 标题CSS类
							l_This.dSetTitArwHtml(l_Tit, true);

							l_Ctnt.Wse_Acod.c_Sta = 0;	// 正常
							l_This.dRtnToSrc(l_Ctnt);	// 还给来源

							// 重排
							if (stFrmwk)
							{ stFrmwk.cRflLot(); }
						}
					});

				return this;
			}
			,
			/// 设置标题箭头HTML
			dSetTitArwHtml : function (a_Tit, a_RtArw)
			{
				if (! a_Tit.Wse_Acod)
				{
					a_Tit.Wse_Acod = {};
					a_Tit.Wse_Acod.c_OrigInrHtml = a_Tit.innerHTML;
				}

				var l_ArwHtml = a_RtArw ? s_RtArwHtml : s_DnArwHtml;
				a_Tit.innerHTML = l_ArwHtml + a_Tit.Wse_Acod.c_OrigInrHtml;
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