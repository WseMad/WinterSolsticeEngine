/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tEdit)
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
		a_This.d_DomIpt = null;
		a_This.d_DomOk = null;
		a_This.d_DomPfx = null;
		a_This.d_DomSfx = null;
		a_This.d_ClkOk = false;			// 这次触发事件是因为单击OK按钮引起的？
	//	a_This.d_TypedText = false;		// 键入过文本？
		a_This.d_OldTypeText = "";		// 旧键入文本
		a_This.d_OldOkText = "";			// 旧OK文本
		a_This.d_PsesIptFoc = false;	// 拥有焦点
	}

	//【直接用浏览器的行了】
//	function fAddRmvPlchd(a_This, a_Add)
//	{
//		if (! a_This.d_DomIpt)
//		{ return; }
//
//		if (a_Add)
//		{
//			if (! a_This.d_DomIpt.value) // 为空时才添加
//			{
//				a_This.d_DomIpt.value = a_This.d_Cfg.c_Plchd || "";
//				stCssUtil.cAddCssc(a_This.d_DomIpt, "cnWse_tEdit_Plchd");
//			}
//		}
//		else
//		{
//			// 没键入过文本时才移除
//			if ((! a_This.d_TypedText))
//			{
//				a_This.d_DomIpt.value = "";
//				stCssUtil.cRmvCssc(a_This.d_DomIpt, "cnWse_tEdit_Plchd");
//			}
//		}
//	}

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
			/// c_Kind：Number，种类，-1=未知（尚未绑定），0=密码，1=单行（默认），2=多行
			/// c_Plchd：String，占位符
			/// c_ReadOnly：Boolean，只读？
			/// c_fOnType：void f(a_Edit, a_NewText, a_OldText)，当键入时
			/// c_fOnOk：void f(a_Edit, a_NewText, a_OldText)，当确定时
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tEdit");	// CSS类

				// 输入框
				var l_Kind = l_This.cGetKind();
				if (2 == l_Kind)
				{
					l_This.d_DomIpt = stDomUtil.cObtnOne(l_This.dGnrtQrySlc_PutSrc() + ">textarea",
						"textarea", null, null, null);
				}
				else
				{
					l_This.d_DomIpt = stDomUtil.cObtnOne(l_This.dGnrtQrySlc_PutSrc() + ">input[type=text]",
						"input", null, null, null);
					l_This.d_DomIpt.type = (0 == l_Kind) ? "password" : "text";
				}

				l_This.d_DomIpt.value = "";	// 清空文本

				if (a_Cfg.c_ReadOnly)	// 只读？
				{
					l_This.d_DomIpt.readOnly = true;
				}

				l_This.d_DomIpt.addEventListener("focus", // 得到焦点事件
					function ()
					{
						if (a_Cfg.c_ReadOnly)	// 只读？在这里再次处理一下更好，IE里即使只读光标也会闪烁！
						{
							l_This.d_DomIpt.blur();	// 若得到焦点，立即放弃焦点
						}
						else
						{
							l_This.d_PsesIptFoc = true;	// 拥有输入焦点
						}
					});

				l_This.d_DomIpt.addEventListener("blur", // 失去焦点事件
					function ()
					{
						l_This.d_PsesIptFoc = false;	// 没有输入焦点
					});

				if (a_Cfg.c_Plchd)	// 占位符
				{ l_This.d_DomIpt.setAttribute("placeholder", a_Cfg.c_Plchd); }

//				fAddRmvPlchd(l_This, true); // 占位符
//				l_This.d_DomIpt.addEventListener("focus", function ()
//				{
//					fAddRmvPlchd(l_This, false);
//				});
//				l_This.d_DomIpt.addEventListener("blur", function ()
//				{
//					fAddRmvPlchd(l_This, true);
//				});

				l_This.d_DomIpt.addEventListener("input",
				function ()
				{
				//	console.log("oninput");
					l_This.dTrgrTypeEvt();		// 触发事件
					l_This.dUpdOldTypeText();	// 更新旧文本，在触发事件后
				});

				l_This.d_DomIpt.addEventListener("change",
				function ()
				{
				//	l_This.dUpdTypedText();			// 更新键入过文本，【不用了，使用浏览器的占位符功能】
					if (! l_This.d_ClkOk)			// 当没有按OK按钮时
					{
						l_This.dTrgrOkEvt();		// 触发事件
						l_This.dUpdOldOkText();		// 更新旧文本，在触发事件后
					}
				});
				l_This.d_PutSrc.appendChild(l_This.d_DomIpt);	// 添加到放置来源

				// 尝试取得前缀
				l_This.d_DomPfx = l_This.dAcsDomNodeByAttr("Wse_Pfx");

				// 尝试取得确定按钮，没有时再尝试取得后缀
				var l_OkOrSfx = l_This.dAcsDomNodeByAttr("Wse_Ok");
				l_This.d_DomOk = l_OkOrSfx;
				l_This.d_DomSfx = null;
				if (! l_OkOrSfx)
				{
					l_OkOrSfx = l_This.dAcsDomNodeByAttr("Wse_Sfx");
					l_This.d_DomSfx = l_OkOrSfx;
				}

				//【不用了，但是OK或后缀可能在动画中掉落到下一行】
//				if (l_OkOrSfx)
//				{
//					if (2 == l_Kind)
//					{
//					//	l_OkOrSfx.style.position = "";	// 多行时由CSS控制
//					}
//					else
//					{
//						l_OkOrSfx.style.position = "absolute";	// 单行时绝对定位，为了在动画过程中总是停靠在右侧
//					}
//				}

				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function ()
					{
						// 修正位置和尺寸
						l_This.dRgltPosDim();
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

				// 文本框
				if (l_This.d_DomIpt)
				{
//					// 如果在来源里，且是新建的，移除
//					if (l_This.dIsPutInSrc(l_This.d_DomIpt) &&
//						l_This.d_DomIpt.Wse_DomUtil && l_This.d_DomIpt.Wse_DomUtil.c_New)
//					{
//						l_This.d_DomIpt.parentNode.removeChild(l_This.d_DomIpt);
//					}
//
//					l_This.d_DomIpt = null;
					l_This.dUbndFld("d_DomIpt", true);
				}

				// 事件处理器
				if (l_This.d_fOnWidDtmnd)
				{
					l_This.dUrgPutTgtEvtHdlr_WidDtmnd(l_This.d_fOnWidDtmnd);
					l_This.d_fOnWidDtmnd = null;
				}

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

				// 把各个组成部分摆放到到放置目标
				if (l_This.d_DomPfx) // 前缀
				{
					l_This.dPutToTgt(l_This.d_DomPfx);
				}

				if (l_This.d_DomIpt) // 输入
				{
					l_This.dPutToTgt(l_This.d_DomIpt);
				}

				if (l_This.d_DomOk) // OK
				{
					l_This.dPutToTgt(l_This.d_DomOk);
				}
				else
				if (l_This.d_DomSfx) // 后缀
				{
					l_This.dPutToTgt(l_This.d_DomSfx);
				}

				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				this.odBase(f).odCall();	// 基类版本

				var l_This = this;

				// 校准位置尺寸
			//	l_This.dRgltPosDim();	//【在WidDtmnd事件处理器里进行】
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
						// 如果点中确定按钮
						if (l_This.d_DomOk === a_DmntTch.cAcsEvtTgt())
						{
							// 很难知道现在文本框是否是焦点，为了避免连续两次触发OK事件，设置一个标志
							l_This.d_ClkOk = true;
							l_This.d_DomIpt.blur();		// 清除焦点
							l_This.d_ClkOk = false;
							l_This.dTrgrOkEvt();		// 触发事件
							l_This.dUpdOldOkText();		// 更新旧文本，在触发事件后
						}

						a_DmntTch.c_Hdld = true;		// 已处理
					}
				}

				// 如果点中的是本文框，必须交由浏览器处理！
				if (l_This.d_DomIpt === a_DmntTch.cAcsEvtTgt())
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

				if (l_This.d_DomIpt)			// 清除焦点
				{ l_This.d_DomIpt.blur(); }

			//	l_This.d_PsesIptFoc = false;	// 没有输入焦点，【onblur会进行】
				return this;
			}
			,
			/// 获取种类
			cGetKind : function ()
			{
				var l_Cfg = this.d_Cfg;
				return l_Cfg ? (("c_Kind" in l_Cfg) ? l_Cfg.c_Kind : 1) : -1;
			}
			,
			/// 为空？
			cIsEmt : function ()
			{
				return ! this.cGetText();
			}
			,
			/// 获取文本
			cGetText: function ()
			{
				var l_This = this;
				if ((! l_This.d_DomIpt) ||
					stCssUtil.cHasCssc(l_This.d_DomIpt, "cnWse_tEdit_Plchd"))	// 占位符？
				{ return ""; }

				return l_This.d_DomIpt.value;
			}
			,
			/// 获取旧键入文本
			cGetOldTypeText: function ()
			{
				return this.d_OldTypeText;
			}
			,
			/// 获取旧OK文本
			cGetOldOkText: function ()
			{
				return this.d_OldOkText;
			}
			,
			/// 设置文本
			cSetText: function (a_Text)
			{
				this.d_DomIpt.value = a_Text.toString();
			//	this.dUpdTypedText();	//【不用了】
				this.dUpdOldOkText();	// 更新旧文本
				return this;
			}
			,
			/// 拥有输入焦点？
			cPsesIptFoc : function ()
			{
				return this.d_PsesIptFoc;
			}
			,
			/// 存取DOM节点 - 输入
			cAcsDomIpt : function ()
			{
				return this.d_DomIpt;
			}
			,
			/// 存取DOM节点 - OK按钮
			cAcsDomOk : function ()
			{
				return this.d_DomOk;
			}
			,
			/// 存取DOM节点 - 前缀
			cAcsDomPfx : function ()
			{
				return this.d_DomPfx;
			}
			,
			/// 存取DOM节点 - 后缀
			cAcsDomSfx : function ()
			{
				return this.d_DomSfx;
			}
			,
			/// 更新键入过文本
			dUpdTypedText : function ()
			{
			//	this.d_TypedText = !! this.d_DomIpt.value;	// 键入过文本？
				return this;
			}
			,
			/// 更新旧键入文本
			dUpdOldTypeText : function ()
			{
				this.d_OldTypeText = this.cGetText();
				return this;
			}
			,
			/// 更新旧OK文本
			dUpdOldOkText : function ()
			{
				this.d_OldOkText = this.cGetText();
				return this;
			}
			,
			/// 校准位置尺寸
			dRgltPosDim : function ()
			{
				var l_This = this;
				if (! l_This.d_PutSrc) // 尚未绑定？
				{ return this; }

				var l_OkOrSfx = l_This.d_DomOk || l_This.d_DomSfx;
				var l_CtntW = 0;
				var l_PfxW = 0;
				var l_OkX = 0, l_OkY = 0, l_OkW = 0, l_OkH = 0;
				var l_IptW = 0;
			//	var l_PutH = l_This.d_DomIpt.offsetHeight;	// 放置目标的高度

				if (2 == l_This.cGetKind())
				{

				}
				else
				{
					// 文本框的宽度恰好让出前缀、确定按钮或后缀
					if (l_This.d_DomPfx)
					{
						l_PfxW = l_This.d_DomPfx.offsetWidth + 1;	// 为防动画停止时发生掉落，再加1像素
					}

					if (l_OkOrSfx)
					{
						l_OkW = l_OkOrSfx.offsetWidth + 1;	// 为防动画停止时发生掉落，再加1像素
					}

					l_CtntW = Math.floor(l_This.dGetPutTgtCtntWid());
					l_IptW = Math.floor(Math.max(l_CtntW - l_PfxW - l_OkW, 16));
					stCssUtil.cSetDimWid(l_This.d_DomIpt, l_IptW);	// 利用放置目标内容宽度

					//【不用了，但是OK或后缀可能在动画中掉落到下一行】
					// 确定按钮或文本垂直居中，高度同文本框
//					if (l_OkOrSfx)
//					{
//						l_OkX = l_This.dGetPutTgtWid() - tWgt.sd_PutTgtBdrThk.c_BdrThkRt - tWgt.sd_PutTgtPad.c_PadRt - l_OkW;
//
//						// l_This.d_DomIpt.offsetTop在动画过程中可能会变！
//					//	l_OkH = l_This.d_DomIpt.offsetHeight;	// 和输入框同高
//					//	l_OkY = (l_This.d_PutTgt.offsetHeight - l_OkH) / 2;
//					//	l_OkY = l_This.d_DomIpt.offsetTop;		// 对齐输入框
//						l_OkY = l_This.d_DomIpt.offsetTop + (l_This.d_DomIpt.offsetHeight - l_OkOrSfx.offsetHeight) / 2;
//					//	console.log("* =" + l_This.d_DomIpt.offsetTop + ", " + l_This.d_DomIpt.offsetHeight + ", " + l_OkOrSfx.offsetHeight)
//						stCssUtil.cSetPos(l_OkOrSfx, l_OkX, l_OkY);
//					//	stCssUtil.cSetPosLt(l_OkOrSfx, l_OkX);
//					//	stCssUtil.cSetDimHgt(l_OkOrSfx, l_OkH);	//【算了】
//					}
				}

				return this;
			}
			,
			/// 触发键入事件
			dTrgrTypeEvt : function ()
			{
				var l_This = this;
				if ((! l_This.d_Cfg.c_fOnType))
				{ return this; }

				l_This.d_Cfg.c_fOnType(l_This, l_This.d_DomIpt.value, l_This.d_OldTypeText);
				return this;
			}
			,
			/// 触发确定事件
			dTrgrOkEvt : function ()
			{
				var l_This = this;
				if (l_This.d_ClkOk || (! l_This.d_Cfg.c_fOnOk))
				{ return this; }

				l_This.d_Cfg.c_fOnOk(l_This, l_This.d_DomIpt.value, l_This.d_OldOkText);
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fClassItfcImp(tEdit,
		nUi.itForm,
		{
			/// 序列化
			/// a_Kvo：Object，若为null则新建一个对象
			/// 返回：a_Kvo
			vcSrlz : function f(a_Kvo)
			{
				if (! a_Kvo)
				{ a_Kvo = {}; }

				var l_This = this;
				if ((! l_This.d_DomIpt) || (! l_This.cGetText()))
				{ return a_Kvo; }

				var l_Key = l_This.dChkKeyOnSrlz(a_Kvo);
				a_Kvo[l_Key] = l_This.d_DomIpt.value;
				return a_Kvo;
			}
			,
			/// 输入焦点
			vcIptFoc : function f(a_YesNo)
			{
				var l_This = this;
				if (l_This.d_DomIpt)
				{
					a_YesNo ? l_This.d_DomIpt.focus() : l_This.d_DomIpt.blur();
				}
				return this;
			}
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////