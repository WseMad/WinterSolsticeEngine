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
		a_This.d_DomText = null;
		a_This.d_DomOk = null;
		a_This.d_ClkOk = false;		// 这次触发事件是因为单击OK按钮引起的？
		a_This.d_TypedText = false;	// 键入过文本？
	}

	//【直接用浏览器的行了】
//	function fAddRmvPlchd(a_This, a_Add)
//	{
//		if (! a_This.d_DomText)
//		{ return; }
//
//		if (a_Add)
//		{
//			if (! a_This.d_DomText.value) // 为空时才添加
//			{
//				a_This.d_DomText.value = a_This.d_Cfg.c_Plchd || "";
//				stCssUtil.cAddCssc(a_This.d_DomText, "cnWse_tEdit_Plchd");
//			}
//		}
//		else
//		{
//			// 没键入过文本时才移除
//			if ((! a_This.d_TypedText))
//			{
//				a_This.d_DomText.value = "";
//				stCssUtil.cRmvCssc(a_This.d_DomText, "cnWse_tEdit_Plchd");
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
			/// c_fOnOk：void f(a_Edit, a_Text)，当确定时
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tEdit");	// CSS类

				var l_Kind = l_This.cGetKind();
				if (2 == l_Kind)
				{
					l_This.d_DomText = stDomUtil.cObtnOne(l_This.dGnrtQrySlc_PutSrc() + ">textarea",
						"textarea", null, null, null);
				}
				else
				{
					l_This.d_DomText = stDomUtil.cObtnOne(l_This.dGnrtQrySlc_PutSrc() + ">input[type=text]",
						"input", null, null, null);
					l_This.d_DomText.type = (0 == l_Kind) ? "password" : "text";
				}

				l_This.d_DomText.value = "";	// 清空文本
				if (a_Cfg.c_ReadOnly)	// 只读？
				{
					l_This.d_DomText.readOnly = true;
					l_This.d_DomText.addEventListener("focus", function ()
					{
						l_This.d_DomText.blur();	// 若得到焦点，立即放弃焦点
					});
				}

				if (a_Cfg.c_Plchd)	// 占位符
				{ l_This.d_DomText.setAttribute("placeholder", a_Cfg.c_Plchd); }

//				fAddRmvPlchd(l_This, true); // 占位符
//				l_This.d_DomText.addEventListener("focus", function ()
//				{
//					fAddRmvPlchd(l_This, false);
//				});
//				l_This.d_DomText.addEventListener("blur", function ()
//				{
//					fAddRmvPlchd(l_This, true);
//				});

				l_This.d_DomText.addEventListener("change", function ()
				{
					l_This.dUpdTypedText();		// 更新键入过文本
					l_This.dTrgrOkEvt();		// 触发事件
				});
				l_This.d_PutSrc.appendChild(l_This.d_DomText);	// 添加到放置来源
				l_This.dPutToTgt(l_This.d_DomText);	// 摆放到到放置目标

				l_This.d_DomOk = l_This.dAcsDomNodeByAttr("Wse_Ok");	// 取得确定按钮
				if (l_This.d_DomOk) // 摆放到到放置目标
				{
					if (2 == l_Kind)
					{
					//	l_This.d_DomOk.style.position = "";	// 多行时由CSS控制
					}
					else
					{
						l_This.d_DomOk.style.position = "absolute";	// 单行时绝对定位，为了在动画过程中总是停靠在右侧
					}

					l_This.dPutToTgt(l_This.d_DomOk);
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
				if (l_This.d_DomText)
				{
					// 如果在来源里，且是新建的，移除
					if (l_This.dIsPutInSrc(l_This.d_DomText) &&
						l_This.d_DomText.Wse_DomUtil && l_This.d_DomText.Wse_DomUtil.c_New)
					{
					//	l_This.dRmvWhenInSrc("d_DomText");
						l_This.d_DomText.parentNode.removeChild(l_This.d_DomText);
					}

					l_This.d_DomText = null;
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
						// 如果点中确定按钮
						if (l_This.d_DomOk === a_DmntTch.cAcsEvtTgt())
						{
							// 很难知道现在文本框是否是焦点，为了避免连续两次触发OK事件，设置一个标志
							l_This.d_ClkOk = true;
							l_This.d_DomText.blur();	// 清除焦点
							l_This.d_ClkOk = false;
							l_This.dTrgrOkEvt();		// 触发事件
						}

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

				if (l_This.d_DomText)		// 清除焦点
				{ l_This.d_DomText.blur(); }
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
				if ((! l_This.d_DomText) ||
					stCssUtil.cHasCssc(l_This.d_DomText, "cnWse_tEdit_Plchd"))	// 占位符？
				{ return ""; }

				return l_This.d_DomText.value;
			}
			,
			/// 设置文本
			cSetText: function (a_Text)
			{
				this.d_DomText.value = a_Text;
				this.dUpdTypedText();
				return this;
			}
			,
			/// 更新键入过文本
			dUpdTypedText : function ()
			{
				this.d_TypedText = !! this.d_DomText.value;	// 键入过文本？
				return this;
			}
			,
			/// 校准位置尺寸
			dRgltPosDim : function ()
			{
				var l_This = this;
				if (! l_This.d_PutSrc) // 尚未绑定？
				{ return this; }

				var l_CtntW = 0;
				var l_OkX = 0, l_OkY = 0, l_OkW = 0, l_OkH = 0;
				var l_TextW = 0;

				if (2 == l_This.cGetKind())
				{

				}
				else
				{
					// 文本框的宽度恰好让出确定按钮
					if (l_This.d_DomOk)
					{
						l_OkW = l_This.d_DomOk.offsetWidth;
					}

					l_CtntW = l_This.dGetPutTgtCtntWid();
					l_TextW = l_CtntW - l_OkW;
					stCssUtil.cSetDimWid(l_This.d_DomText, l_TextW);	// 利用放置目标内容宽度

					// 确定按钮垂直居中，高度同文本框
					if (l_This.d_DomOk)
					{
						l_OkX = l_This.dGetPutTgtWid() - tWgt.sd_PutTgtBdrThk.c_BdrThkRt - tWgt.sd_PutTgtPad.c_PadRt - l_OkW;
						l_OkH = l_This.d_DomText.offsetHeight;
						l_OkY = (l_This.d_PutTgt.offsetHeight - l_OkH) / 2;
						stCssUtil.cSetPos(l_This.d_DomOk, l_OkX, l_OkY);
						stCssUtil.cSetDimHgt(l_This.d_DomOk, l_OkH);
					}
				}

				return this;
			}
			,
			/// 触发确定事件
			dTrgrOkEvt : function ()
			{
				var l_This = this;
				if (l_This.d_ClkOk || (! l_This.d_Cfg.c_fOnOk) || (! l_This.cGetText()))
				{ return this; }

				l_This.d_Cfg.c_fOnOk(l_This, l_This.d_DomText.value);
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
				if ((! l_This.d_DomText) || (! l_This.cGetText()))
				{ return a_Kvo; }

				var l_Key = l_This.dChkKeyOnSrlz(a_Kvo);
				a_Kvo[l_Key] = l_This.d_DomText.value;
				return a_Kvo;
			}
			,
			/// 输入焦点
			vcIptFoc : function f(a_YesNo)
			{
				var l_This = this;
				if (l_This.d_DomText)
				{
					a_YesNo ? l_This.d_DomText.focus() : l_This.d_DomText.blur();
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