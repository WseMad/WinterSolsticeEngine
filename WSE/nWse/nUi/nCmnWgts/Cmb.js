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
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tCmb");			// CSS类

				var l_ThisPutSrcId = l_This.d_PutSrc.id;

				// 生成编辑框
				l_This.d_PutSrcId_Edit =  "o" + l_ThisPutSrcId + "_Edit";
				l_This.d_PutTgtId_Edit =  "o" + l_ThisPutSrcId + "_PutTgt_Edit";
				l_This.d_PutSrc_Edit = stDomUtil.cObtnOne(null, "div", l_This.d_PutSrcId_Edit, null, l_This.d_PutSrc);
				l_This.d_Edit = new nCmnWgts.tEdit();
				l_This.d_Edit.vcBind({
					c_PutTgt: l_This.d_PutTgtId_Edit,
					c_PutSrc: l_This.d_PutSrcId_Edit,
					c_ReadOnly: a_Cfg.c_SlcOnly,
					c_Plchd: a_Cfg.c_SlcOnly ? (a_Cfg.c_Plchd || "—— 未选择 ——") : a_Cfg.c_Plchd
				});

				var l_Lis;
				if ("c_InitSlc" in a_Cfg) // 设置初始文本
				{
					if (nWse.fIsNum(a_Cfg.c_InitSlc))
					{
						l_Lis = stDomUtil.cQryAll(l_This.dGnrtQrySlc_PutSrc() + ">ul>li");
						if ((0 <= a_Cfg.c_InitSlc) && (a_Cfg.c_InitSlc < l_Lis.length))
						{
							l_This.d_Edit.cSetText(l_This.dGetTextOfLi(l_Lis[a_Cfg.c_InitSlc]));
						}
					}
					else
					if (nWse.fIsStr(a_Cfg.c_InitSlc))
					{
						l_This.d_Edit.cSetText(a_Cfg.c_InitSlc);
					}
				}

				// 生成按钮
				l_This.d_PutSrcId_Btn =  "o" + l_ThisPutSrcId + "_Btn";
				l_This.d_PutTgtId_Btn =  "o" + l_ThisPutSrcId + "_PutTgt_Btn";
				l_This.d_PutSrc_Btn = stDomUtil.cObtnOne(null, "div", l_This.d_PutSrcId_Btn, null, l_This.d_PutSrc);
				l_This.d_PutSrc_Btn.textContent = "▼";
				l_This.d_Btn = new nCmnWgts.tBtn();
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

				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function (a_Put, a_TotWid, a_OfstWid)
					{
						// 校准位置尺寸
						l_This.dRgltPosDim(a_OfstWid);
					};

					l_This.dRegPutTgtEvtHdlr_OnWidDtmnd(l_This.d_fOnWidDtmnd);
				}

//				if (! l_This.d_fOnAnmtUpdEnd)	//【不用了】
//				{
//					// 展开式时必须校准位置
//					l_This.d_fOnAnmtUpdEnd = function (a_DomElmt, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
//					{
//						// 校准列表位置
//						if (l_This.cIsListShow())
//						{
//						//	l_This.dRgltListPos();
//						}
//					};
//
//					l_This.dRegPutTgtEvtHdlr_OnAnmtUpdEnd(l_This.d_fOnAnmtUpdEnd);
//				}
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;
				if (! l_This.d_PutSrc)
				{ return this; }

				// 注销放置目标事件处理器
				if (l_This.d_fOnWidDtmnd)
				{
					l_This.dUrgPutTgtEvtHdlr_OnWidDtmnd(l_This.d_fOnWidDtmnd);
					l_This.d_fOnWidDtmnd = null;
				}

//				if (l_This.d_fOnAnmtUpdEnd)	//【不用了】
//				{
//					l_This.dUrgPutTgtEvtHdlr_OnAnmtUpdEnd(l_This.d_fOnAnmtUpdEnd);
//					l_This.d_fOnAnmtUpdEnd = null;
//				}

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
			/// 设置文本
			cSetText : function (a_Text)
			{
				if (this.d_Edit)
				{ this.d_Edit.cSetText(a_Text); }

				return this;
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
			/// 校准列表位置
			dRgltListPos : function ()
			{
				var l_This = this;
				if (! l_This.d_Ul)
				{ return this; }

				var l_EditPutTgt = l_This.d_Edit.cAcsPutTgt();
				var l_Y = l_EditPutTgt.offsetHeight;
				stCssUtil.cSetPos(l_This.d_Ul, 0, l_Y);
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

				l_This.dRgltListPos();	// 校准列表位置

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

//				// 把<ul>还给来源，【动画后再进行】
//				l_This.dRtnToSrc(l_This.d_Ul);
//				l_This.d_Ul = null;		// 清null

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
							l_This.dRtnToSrc(l_This.d_Ul);
							l_This.d_Ul = null;		// 清null
						}
					});
				return this;
			}
			,
			/// 处理选取
			dHdlSlc : function (a_DmntTch)
			{
				var l_This = this;
				if (! l_This.d_Ul)
				{ return this; }

				// 找到点中的<li>，没有点中时不作处理
				var l_EvtTgt = a_DmntTch.cAcsEvtTgt();
				var l_PkdLi = stDomUtil.cSrchSelfAndAcstForTag(l_EvtTgt, "LI");
				if (! l_PkdLi)
				{ return this; }

				// 设置文本
				l_This.cSetText(l_This.dGetTextOfLi(l_PkdLi));

				// 隐藏列表
				l_This.dHideList();
				return this;
			}
			,
			/// 获取<li>的文本
			dGetTextOfLi : function (a_Li)
			{
				// 优选特性，没有时采用<li>.textContent
				var l_TextTag = stDomUtil.cQryAll("[data-Wse_Text]", a_Li);
				l_TextTag = (l_TextTag.length > 0) ? l_TextTag[0] : a_Li;
				return l_TextTag.textContent;
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