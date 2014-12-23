/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tCmb)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nCmnWgts",
		[
			"Btn.js",
			"Edit.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Cmb.fOnIcld：" + a_Errs);

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
		a_This.d_ListShow = false;	// 列表显示？
		a_This.d_Val = "";			// 值
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tCmb;
	(function ()
	{
		tCmb = nWse.fClass(nCmnWgts,
		/// ？
		function tCmb()
		{
			this.odBase(tCmb).odCall();	// 基类版本

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
			/// c_Plchd：String，占位符
			/// c_SlcOnly：Boolean，只选？
			/// c_InitSlc：Number$String，初始选项索引或文本
			/// c_SlcAllOnActv：Boolean，当激活时全选？
			/// c_fOnType：void f(a_Edit, a_NewText, a_OldText)，当键入时
			/// c_fOnOk：void f(a_Edit, a_NewText, a_OldText)，当确定时
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tCmb");			// CSS类

				// 生成编辑框
				l_This.dGnrtSubWgtId("Edit");
				l_This.d_PutSrcId_Edit = tWgt.sd_SubWgtPutSrcId;
				l_This.d_PutTgtId_Edit = tWgt.sd_SubWgtPutTgtId;
				l_This.d_PutSrc_Edit = stDomUtil.cObtnOne(null, "div", l_This.d_PutSrcId_Edit, null, l_This.d_PutSrc);
				l_This.d_Edit = new nCmnWgts.tEdit();
				l_This.dAcsSubWgtSet().cAdd(l_This.d_Edit);	// 添加到子控件集
				l_This.d_Edit.vcBind({
					c_PutTgt: l_This.d_PutTgtId_Edit,
					c_PutSrc: l_This.d_PutSrcId_Edit,
					c_ReadOnly: a_Cfg.c_SlcOnly,
					c_Plchd: a_Cfg.c_SlcOnly ? (a_Cfg.c_Plchd || "—— 未选择 ——") : a_Cfg.c_Plchd,
					c_SlcAllOnActv : a_Cfg.c_SlcAllOnActv,
					c_fOnType : function (a_Edit, a_NewText, a_OldText)
					{
						l_This.dSetVal(a_NewText);	// 设置值
						l_This.dTrgrTypeEvt();		// 触发键入事件
					},
					c_fOnOk : function (a_Edit, a_NewText, a_OldText)
					{
						l_This.dSetVal(a_NewText);	// 设置值
						l_This.dTrgrOkEvt();		// 触发确定事件
					}
				});

				var l_LiAry;
				if ("c_InitSlc" in a_Cfg) // 设置初始文本
				{
					if (nWse.fIsNum(a_Cfg.c_InitSlc))
					{
						l_LiAry = stDomUtil.cQryAll(l_This.dGnrtQrySlc_PutSrc() + ">ul>li");
						if ((0 <= a_Cfg.c_InitSlc) && (a_Cfg.c_InitSlc < l_LiAry.length))
						{
							l_This.dSetText(l_This.dGetTextOfLi(l_LiAry[a_Cfg.c_InitSlc]));
						}
					}
					else
					if (nWse.fIsStr(a_Cfg.c_InitSlc))
					{
						l_This.dSetText(a_Cfg.c_InitSlc);
					}
				}

				// 生成按钮
				l_This.dGnrtSubWgtId("Btn");
				l_This.d_PutSrcId_Btn = tWgt.sd_SubWgtPutSrcId;
				l_This.d_PutTgtId_Btn = tWgt.sd_SubWgtPutTgtId;
				l_This.d_PutSrc_Btn = stDomUtil.cObtnOne(null, "div", l_This.d_PutSrcId_Btn, null, l_This.d_PutSrc);
				l_This.d_PutSrc_Btn.textContent = "▼";
				l_This.d_Btn = new nCmnWgts.tBtn();
				l_This.dAcsSubWgtSet().cAdd(l_This.d_Btn);	// 添加到子控件集
				l_This.d_Btn.vcBind({
					c_PutTgt: l_This.d_PutTgtId_Btn,
					c_PutSrc: l_This.d_PutSrcId_Btn,
					c_UpDown: true,
					c_Shp : nCmnWgts.tBtn.tShp.i_Cir,
					c_TitVcen: true,
					c_fOnClk : function (a_Btn)
					{
						// 切换显示列表，但不要更新按钮（否则会连续切换两次按钮的状态）
						l_This.d_Btn.cIsUp() ? l_This.dHideList() : l_This.dShowList();
					}
				});

				// 当窗口滚动时，调整列表位置
				if (stFrmwk)
				{
					stFrmwk.cRegEvtHdlr("WndScrl",
						function()
						{
							l_This.dAjsListPos();
						});
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

				// 清除编辑框和按钮
				if (l_This.d_Edit)
				{
					l_This.dUbndFld("d_Edit");
				}

				if (l_This.d_Btn)
				{
					l_This.dUbndFld("d_Btn");
				}

				// 清空子控件集
				l_This.dAcsSubWgtSet().cClr();

				// 把<ul>还给来源
				l_This.dRtnUlToSrc();

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

				// 结束动画<ul>
				if (l_This.d_Ul)
				{
					stCssUtil.cFnshAnmt(l_This.d_Ul, true, true);	// 跳到最后，回调
				}
				return this;
			}
			,
			/// 拾取
			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
			vcPick : function f(a_Bbox, a_Picker)
			{
				// 包围盒使用放置目标的即可（初始值）
				if (a_Bbox)
				{
					return this;
				}

				// 拾取编辑
				var l_This = this;
				if (l_This.d_Edit)
				{
					l_This.d_Edit.vcPick(a_Bbox, a_Picker);
					if (a_Picker.cIsOver())
					{ return this; }
				}

				// 拾取按钮
				if (l_This.d_Btn)
				{
					l_This.d_Btn.vcPick(a_Bbox, a_Picker);
					if (a_Picker.cIsOver())
					{ return this; }
				}

				// 拾取放置目标
				l_This.dPickPutTgtByPathPnt(a_Picker, l_This.d_PutTgt);
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 摆放编辑框和按钮，并刷新
				if (l_This.d_Edit)
				{
					l_This.dPutToTgt(l_This.d_Edit.cAcsPutTgt());
					l_This.dPutToTgt(l_This.d_Btn.cAcsPutTgt());
					l_This.d_Edit.vcRfshBefLot();
					l_This.d_Btn.vcRfshBefLot();
				}

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 刷新编辑框和按钮
				if (l_This.d_Edit)
				{
					l_This.d_Edit.vcRfshAftLot();
					l_This.d_Btn.vcRfshAftLot();
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
						// 如果列表显示，处理选取
						if (l_This.cIsListShow())
						{
							l_This.dHdlSlc(a_DmntTch);
						}

						a_DmntTch.c_Hdld = true;		// 已处理
					}
				}
				return this;
			}
			,
			/// 当放置目标宽度已决定
			vdOnPutTgtWidDtmnd : function f()
			{
				this.odBase(f).odCall();	// 基类版本，粘贴后取消注释！
				var l_This = this;

				// 校准位置尺寸
				l_This.dRgltPosDim(l_This.dGetPutTgtOfstWid());
				return this;
			}
			,
			/// 获得焦点
			vcGainFoc : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 通知编辑和按钮
				if (l_This.d_Edit)
				{
					l_This.d_Edit.vcGainFoc();
					l_This.d_Btn.vcGainFoc();
				}

				return this;
			}
			,
			/// 失去焦点
			vcLoseFoc : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 通知编辑和按钮
				if (l_This.d_Edit)
				{
					l_This.d_Edit.vcLoseFoc();
					l_This.d_Btn.vcLoseFoc();
				}

				// 隐藏列表，【不要隐藏，会导致输入无法正确处理，有关的代码是“Wgt.js”里“a_Ipt.cFindTchByPkdWgt(this);”这句】
			//	l_This.cHideList();
				return this;
			}
			,
			/// 获取文本
			cGetText : function ()
			{
				return this.d_Edit ? this.d_Edit.cGetText() : "";
			}
			,
			/// 获取旧键入文本
			cGetOldTypeText: function ()
			{
				return this.d_Edit ? this.d_Edit.cGetOldTypeText() : "";
			}
			,
			/// 获取旧OK文本
			cGetOldOkText: function ()
			{
				return this.d_Edit ? this.d_Edit.cGetOldOkText() : "";
			}
			,
			/// 获取值
			cGetVal : function ()
			{
				// 如果没有文本，值也为空
				if (! this.cGetText())
				{ this.dSetVal(); }

				return this.d_Val;
			}
			,
			/// 设置文本
			cSetText : function (a_Text)
			{
				// 只选时不允许任意文本
				if (this.d_Cfg.c_SlcOnly)
				{
					throw new Error("只选模式下，不能设置任意文本，请调用cSlcItem()");
				}

				return this.dSetText(a_Text);
			}
			,
			/// 设置值
			cSetVal : function (a_Val)
			{
				return this.dSetVal(a_Val);
			}
			,
			/// 获取选项数量
			cGetItemAmt : function ()
			{
				var l_Ul = this.cAcsDomUl();
				return stDomUtil.cGetChdAmtOfTag(l_Ul, "LI");
			}
			,
			/// 选取选项
			cSlcItem : function (a_Idx)
			{
				return this.dSlcLi(a_Idx);
			}
			,
			/// 获取选取索引，若编辑框里的文字不与任何选项相同则返回-1
			cGetSlcIdx : function ()
			{
				var l_This = this;
				var l_Text = l_This.cGetText();
				if (! l_Text)
				{ return -1; }

				var l_Ul = this.cAcsDomUl();
				var l_LiAry = stDomUtil.cGetChdsOfTag(l_Ul, "LI");
				return stAryUtil.cFind(l_LiAry,
					function (a_Ary, a_Idx, a_Li)
					{ return (l_Text == l_This.dGetTextOfLi(a_Li)); });
			}
			,
			/// 列表显示？
			cIsListShow : function ()
			{
				// 注意不要用这个，因为渐隐动画结束时才会把它设为null
			//	return !! this.d_Ul;
				return this.d_ListShow;	// 还是增加一个变量比较靠谱
			}
			,
			/// 显示列表
			cShowList : function ()
			{
				return this.dShowList();
			}
			,
			/// 隐藏列表
			cHideList : function ()
			{
				return this.dHideList();
			}
			,
			/// 存取<ul>
			cAcsDomUl : function ()
			{
				var l_This = this;
				if (! l_This.d_PutSrc) // 未绑定？
				{ return null; }

				// 若已经存在则立即返回
				if (l_This.d_Ul)
				{ return l_This.d_Ul; }

				// 尝试从来源或目标中提取
				var l_Ul = stDomUtil.cQryOne(l_This.dGnrtQrySlc_PutSrc() + ">ul") ||
							stDomUtil.cQryOne(l_This.dGnrtQrySlc_PutTgt() + ">ul");
				if (l_Ul)
				{ return l_Ul; }

				// 新建，存入来源
				l_Ul = stDomUtil.cObtnOne(null, "ul", null, null, l_This.d_PutSrc);
				return l_Ul;
			}
			,
			/// 校准位置尺寸
			dRgltPosDim : function (a_OfstWid)
			{
				var l_This = this;
				if (! l_This.d_Edit)
				{ return this; }

				// 设置编辑框和按钮的宽度
				var l_EditPutTgt = l_This.d_Edit.cAcsPutTgt();
				var l_BtnPutTgt = l_This.d_Btn.cAcsPutTgt();
				var l_BtnWid = l_EditPutTgt.offsetHeight;	// 按钮是圆形
				var l_EditWid = a_OfstWid - l_BtnWid;
				stCssUtil.cSetDimWid(l_EditPutTgt, l_EditWid);
				stCssUtil.cSetDimWid(l_BtnPutTgt, l_BtnWid);

				// 设置按钮的位置
				stCssUtil.cSetPosLt(l_BtnPutTgt, l_EditWid);

				// 触发编辑框和按钮的事件
				var l_EvtAgms = [0, 1, 2];
				l_EvtAgms[0] = l_EditPutTgt;
				l_EvtAgms[1] = l_EditWid;
				l_EvtAgms[2] = l_EditWid;
				nUi.fTrgrPutEvt(l_EditPutTgt, "WidDtmnd", l_EvtAgms);

				l_EvtAgms[0] = l_BtnPutTgt;
				l_EvtAgms[1] = l_BtnWid;
				l_EvtAgms[2] = l_BtnWid;
				nUi.fTrgrPutEvt(l_BtnPutTgt, "WidDtmnd", l_EvtAgms);

				// 令放置目标的高度对齐
				stCssUtil.cSetDimHgt(l_This.d_PutTgt, l_EditPutTgt.offsetHeight);
				return this;
			}
			,
			/// 显示列表
			dShowList : function ()
			{
				var l_This = this;
				if (l_This.cIsListShow())
				{ return this; }

				l_This.d_ListShow = true;	// 设置标志
				l_This.d_Btn.cUpDown(false);	// 按钮按下

				// 把<ul>从来源摆放到目标，注意l_This.d_Ul可能已存在
				if (! l_This.d_Ul)
				{
					l_This.d_Ul = stDomUtil.cQryOne(l_This.dGnrtQrySlc_PutSrc() + ">ul");
					if (! l_This.d_Ul)
					{ return this; }

					l_This.dPutToTgt(l_This.d_Ul);
				}

				l_This.dAjsListPos();	// 校准列表位置

				// 渐现
				// 首先设置初值，当未曾设置过或者为1时，设为0
				if ((! l_This.d_Ul.style.opacity) || ("1" == l_This.d_Ul.style.opacity))
				{
					l_This.d_Ul.style.opacity = "0";
				}

				stCssUtil.cAnmt(l_This.d_Ul,
					{
						"opacity": 1
					},
					{
						c_Dur: 0.3	// 匹配按钮按下
					});
				return this;
			}
			,
			/// 隐藏列表
			dHideList : function ()
			{
				var l_This = this;
				if (! l_This.cIsListShow())
				{ return this; }

				l_This.d_ListShow = false;	// 设置标志
				l_This.d_Btn.cUpDown(true);	// 按钮弹起

				// 渐隐
				stCssUtil.cAnmt(l_This.d_Ul,
					{
						"opacity": 0
					},
					{
						c_Dur: 0.3,	// 匹配按钮弹起
						c_fOnEnd: function ()
						{
							// 把<ul>还给来源
							l_This.dRtnUlToSrc();
						}
					});
				return this;
			}
			,
			/// 调整列表位置
			dAjsListPos : function ()
			{
				var l_This = this;
				if (! l_This.cIsListShow()) // 仅当显示时
				{ return this; }

				// 计算客户区和列表的包围盒
				tSara.scEnsrTemps(3);
				var l_CltSara = tSara.sc_Temps[0], l_UlSara = tSara.sc_Temps[1];
				l_CltSara.cCrt$Wh(stDomUtil.cGetVwptWid(), document.documentElement.scrollHeight);	// 使用文档元素的垂直空间
				tSara.scCrt$DomBcr(l_UlSara, l_This.d_Ul);

				// 若下方能放开则放在下方，否则放在空间更大的地方
				var l_PtSara = tSara.sc_Temps[2];
				tSara.scCrt$DomBcr(l_PtSara, l_This.d_PutTgt);
				var l_UpSpc = l_PtSara.c_Y - l_CltSara.c_Y;
				var l_DnSpc = l_CltSara.c_Y + l_CltSara.c_H - (l_PtSara.c_Y + l_PtSara.c_H);
				if ((l_DnSpc < l_UlSara.c_H) && (l_UpSpc > l_DnSpc)) // 放上方
				{
					stCssUtil.cSetPosTp(l_This.d_Ul, -l_UlSara.c_H);
				}
				else // 放下方
				{
					stCssUtil.cSetPosTp(l_This.d_Ul, l_PtSara.c_H);
				}
				
				return this;
			}
			,
			/// 把<ul>还给来源
			dRtnUlToSrc : function ()
			{
				var l_This = this;
				if (! l_This.d_Ul)
				{ return this; }

				l_This.dRtnToSrc(l_This.d_Ul);
				l_This.d_Ul = null;		// 清null
				return this;
			}
			,
			/// 处理选取
			dHdlSlc : function (a_DmntTch)
			{
				var l_This = this;
				if (! l_This.d_Ul)
				{ return this; }

				// 若发生滑动，不处理
				if (a_DmntTch.cHasSldn())
				{
					return this;
				}

				// 找到点中的<li>，没有点中时不作处理
				var l_EvtTgt = a_DmntTch.cAcsEvtTgt();
				var l_PkdLi = stDomUtil.cSrchSelfAndAcstForTag(l_EvtTgt, "LI");
				if (! l_PkdLi)
				{ return this; }

				// 选中<li>
				l_This.dSlcLi(null, l_PkdLi);

				// 隐藏列表
				l_This.dHideList();

				// 触发确定事件
				l_This.dTrgrOkEvt();
				return this;
			}
			,
			/// 选中<li>
			dSlcLi : function (a_Idx, a_Li)
			{
				var l_This = this;
				var l_Ul = l_This.cAcsDomUl();
				if (! a_Li)
				{
					a_Li = stDomUtil.cGetChdsOfTag(l_Ul, "LI", a_Idx);
					if (! a_Li) // 没有？可能索引无效
					{ return this; }
				}

				// 设置文本和值
				l_This.dSetText(l_This.dGetTextOfLi(a_Li));
				l_This.dSetVal(a_Li.getAttribute("value") || l_This.cGetText());
				return this;
			}
			,
			/// 设置文本
			dSetText : function (a_Text)
			{
				if (this.d_Edit)
				{ this.d_Edit.cSetText(a_Text); }

				return this;
			}
			,
			/// 设置值
			dSetVal : function (a_Val)
			{
				this.d_Val = a_Val ? a_Val.toString() : "";
				return this;
			}
			,
			/// 获取<li>的文本
			dGetTextOfLi : function (a_Li)
			{
				// 优选特性，没有时采用<li>.textContent
				var l_TextTag = stDomUtil.cQryAll("[data-Wse_Text]", a_Li);
				l_TextTag = (l_TextTag.length > 0) ? l_TextTag[0] : a_Li;
				return l_TextTag.getAttribute("data-Wse_Text") || l_TextTag.textContent;
			}
			,
			/// 触发键入事件
			dTrgrTypeEvt : function ()
			{
				var l_This = this;
				if ((! l_This.d_Cfg.c_fOnType))
				{ return this; }

				l_This.d_Cfg.c_fOnType(l_This, l_This.cGetText(), l_This.cGetOldTypeText());
				return this;
			}
			,
			/// 触发确定事件
			dTrgrOkEvt : function ()
			{
				var l_This = this;
				if ((! l_This.d_Cfg.c_fOnOk))
				{ return this; }

				l_This.d_Cfg.c_fOnOk(l_This, l_This.cGetText(), l_This.cGetOldOkText());
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fClassItfcImp(tCmb,
		nUi.itForm,
		{
			/// 序列化
			/// a_Kvo：Object，键值对象
			/// 返回：a_Kvo
			vcSrlz : function f(a_Kvo)
			{
				// 保存值
				var l_This = this;
				var l_Key = l_This.dChkKeyOnSrlz(a_Kvo);
				if (l_This.cGetVal())
				{
					a_Kvo[l_Key] = l_This.cGetVal();
				}

				// 也保存文本，以便反序列化
				if (l_This.cGetText())
				{
					nWse.stObjUtil.cDfnDataPpty(a_Kvo, nUi.itForm.scGnrtInrKey(l_Key),
						false, false, false, l_This.cGetText());
				}

				return this;
			}
			,
			/// 反序列化
			/// a_Kvo：Object，键值对象
			vcDsrlz : function f(a_Kvo)
			{
				var l_This = this;
				var l_Key = l_This.dGetKeyOfSrlz();
				if (! l_Key)
				{ return this; }

				// 载入值
				l_This.cSetVal(a_Kvo[l_Key]);

				// 载入文本
				l_This.cSetText(a_Kvo[nUi.itForm.scGnrtInrKey(l_Key)]);
				return this;
			}
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////