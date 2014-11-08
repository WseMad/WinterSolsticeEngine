/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.tSignLog)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi/nCmnWgts",
		[
			"nWse:nUi/Form.js",
			"Btn.js",
			"Edit.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("SignLog.fOnIcld：" + a_Errs);

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
	var tForm = nUi.tForm;
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
		a_This.d_Show = 0;					// 0=隐藏；1=注册；2=登录
	//	a_This.d_Form = new nUi.tForm();	// 表单

		// 当窗口调整大小时，校准位置尺寸
		if (stFrmwk)
		{
			stFrmwk.cRegEvtHdlr("WndRszBefLot",
				function()
				{
				//	a_This.d_Form.cRfsh();	// 刷新表单
					a_This.cRfsh();
				});
		}
	}

	function fInitWgt_Mail(a_This)
	{
		var l_Plchd = a_This.d_Cfg.c_MailPlchd || "邮箱：";
		var l_Wgt = a_This.cAcsWgtSet().cAcsByPutSrcId(a_This.d_PutSrcId_Mail);
		if (! l_Wgt)
		{
			l_Wgt = new nCmnWgts.tEdit();
			l_Wgt.vcBind({
				c_PutTgt: a_This.d_PutTgtId_Mail,
				c_PutSrc: a_This.d_PutSrcId_Mail,
				//	c_Plchd: l_Plchd,	//【不用了，不好看】
				c_fOnOk: function (a_Wgt, a_Text)
				{
					// 下一个得到输入焦点
					//	a_This.d_Form.cIptFoc(a_This.d_PutSrcId_Pswd, true);
				}
			});
			//	a_This.d_Form.cAcsWgtSet().cAdd(l_Wgt);
			a_This.cAcsWgtSet().cAdd(l_Wgt);
		}

		a_This.d_PutTgt.appendChild(document.createTextNode(l_Plchd));
		a_This.dPutToTgt(l_Wgt.cAcsPutTgt());
		return l_Wgt;
	}

	function fInitWgt_Pswd(a_This, a_Cfm)
	{
		var l_Plchd = a_Cfm ? "确认密码：" : (a_This.d_Cfg.c_PswdPlchd || "密码（6-20个字符）：");
		var l_PutSrcId = a_Cfm ? a_This.d_PutSrcId_CfmPswd : a_This.d_PutSrcId_Pswd;
		var l_Wgt = a_This.cAcsWgtSet().cAcsByPutSrcId(l_PutSrcId);
		if (! l_Wgt)
		{
			l_Wgt = new nCmnWgts.tEdit();
			l_Wgt.vcBind({
				c_PutTgt: a_Cfm ? a_This.d_PutTgtId_CfmPswd : a_This.d_PutTgtId_Pswd,
				c_PutSrc: l_PutSrcId,
				//	c_Plchd: l_Plchd,	//【不用了，不好看】
				c_Kind: 0,
				c_fOnOk: function (a_Wgt, a_Text)
				{
					if (1 == a_This.d_Show) // 注册时把焦点转交下一个
					{
						if (a_Cfm)
						{
							// 撤销自己的输入焦点
							//	a_This.d_Form.cIptFoc(a_This.d_PutSrcId_CfmPswd, false);

							// 提交
							//	fSbmt(a_This);	//【会连续提交两次？！】
						}
						else
						{
							// 下一个得到输入焦点
							//	a_This.d_Form.cIptFoc(a_This.d_PutSrcId_CfmPswd, true);
						}
					}
					else // 登录时
					{
						// 撤销自己的输入焦点
						//	a_This.d_Form.cIptFoc(a_This.d_PutSrcId_Pswd, false);

						// 提交
						//	fSbmt(a_This);		//【会连续提交两次？！】
					}
				}
			});
			//	a_This.d_Form.cAcsWgtSet().cAdd(l_Wgt);
			a_This.cAcsWgtSet().cAdd(l_Wgt);
		}

		a_This.d_PutTgt.appendChild(document.createTextNode(l_Plchd));
		a_This.dPutToTgt(l_Wgt.cAcsPutTgt());
		return l_Wgt;
	}

	function fInitWgt_Cls(a_This)
	{
		var l_Wgt = a_This.cAcsWgtSet().cAcsByPutSrcId(a_This.d_PutSrcId_Cls);
		if (! l_Wgt)
		{
			a_This.d_Dom_Cls.textContent = "关 闭";

			l_Wgt = new nCmnWgts.tBtn();
			l_Wgt.vcBind({
				c_PutTgt: a_This.d_PutTgtId_Cls,
				c_PutSrc: a_This.d_PutSrcId_Cls,
				c_fOnClk: function (a_Wgt, a_Text)
				{
					a_This.cHideDlgBox();
				}
			});
			stCssUtil.cAddCssc(l_Wgt.cAcsPutTgt(), "cnWse_tSignLog_Cls");
		//	a_This.d_Form.cAcsWgtSet().cAdd(l_Wgt);
			a_This.cAcsWgtSet().cAdd(l_Wgt);
		}

		a_This.dPutToTgt(l_Wgt.cAcsPutTgt());
		return l_Wgt;
	}

	function fInitWgt_Sbmt(a_This)
	{
		var l_Wgt = a_This.cAcsWgtSet().cAcsByPutSrcId(a_This.d_PutSrcId_Sbmt);
		if (! l_Wgt)
		{
			a_This.d_Dom_Sbmt.textContent = "提 交";

			l_Wgt = new nCmnWgts.tBtn();
			l_Wgt.vcBind({
				c_PutTgt: a_This.d_PutTgtId_Sbmt,
				c_PutSrc: a_This.d_PutSrcId_Sbmt,
				c_fOnClk: function (a_Wgt, a_Text)
				{
					fSbmt(a_This);
				}
			});
			stCssUtil.cAddCssc(l_Wgt.cAcsPutTgt(), "cnWse_tSignLog_Sbmt");
		//	a_This.d_Form.cAcsWgtSet().cAdd(l_Wgt);
			a_This.cAcsWgtSet().cAdd(l_Wgt);
		}

		a_This.dPutToTgt(l_Wgt.cAcsPutTgt());
		return l_Wgt;
	}

	// 提交
	function fSbmt(a_This)
	{
	//	var l_Kvo = a_This.d_Form.cSrlz(null);
		var l_Kvo = a_This.cSrlz(null);
		var l_Ueq = nWse.tAjax.scUrlEcdQry(null, l_Kvo);
		console.log("表单序列化：");
		console.log("<UEQ> = " + l_Ueq);
		console.log("<JSON> = " + JSON.stringify(l_Kvo));
		console.log();
	}

	// 初始化 - 登录
	function fInit_LogIn(a_This)
	{
		// 得到子控件所需标记，插入到放置来源里
		a_This.d_Dom_Mail = fObtnDom(a_This, "Mail", "Mail");
		a_This.d_Dom_Pswd = fObtnDom(a_This, "Pswd", "Pswd");
		a_This.d_Dom_Cls = fObtnDom(a_This, "Cls");
		a_This.d_Dom_Sbmt = fObtnDom(a_This, "Sbmt");
		stCssUtil.cAddCssc(a_This.d_Dom_Cls, "cnWse_tSignLog_Cls");
		stCssUtil.cAddCssc(a_This.d_Dom_Sbmt, "cnWse_tSignLog_Sbmt");

		// 新建子控件
		fInitWgt_Mail(a_This);
		fInitWgt_Pswd(a_This);
		fInitWgt_Cls(a_This);
		fInitWgt_Sbmt(a_This);
	}

	// 初始化 - 注册
	function fInit_SignIn(a_This)
	{
		// 得到子控件所需标记，插入到放置来源里
		a_This.d_Dom_Mail = fObtnDom(a_This, "Mail", "Mail");
		a_This.d_Dom_Pswd = fObtnDom(a_This, "Pswd", "Pswd");
		a_This.d_Dom_CfmPswd = fObtnDom(a_This, "CfmPswd", "CfmPswd");
		a_This.d_Dom_Cls = fObtnDom(a_This, "Cls");
		a_This.d_Dom_Sbmt = fObtnDom(a_This, "Sbmt");
		stCssUtil.cAddCssc(a_This.d_Dom_Cls, "cnWse_tSignLog_Cls");
		stCssUtil.cAddCssc(a_This.d_Dom_Sbmt, "cnWse_tSignLog_Sbmt");

		// 新建子控件
		fInitWgt_Mail(a_This);
		fInitWgt_Pswd(a_This);
		fInitWgt_Pswd(a_This, true);
		fInitWgt_Cls(a_This);
		fInitWgt_Sbmt(a_This);
	}

	function fObtnDom(a_This, a_Key, a_Name)
	{
		a_This.dGnrtSubWgtId(a_Key);
		var l_DomPutSrcId = tWgt.sd_SubWgtPutSrcId;
		var l_DomPutTgtId = tWgt.sd_SubWgtPutTgtId;
		var l_Rst = stDomUtil.cObtnOne(null, "div", l_DomPutSrcId, null, a_This.d_PutSrc);
		a_This["d_PutSrcId_" + a_Key] = l_DomPutSrcId;
		a_This["d_PutTgtId_" + a_Key] = l_DomPutTgtId;

		// 记录名字，序列化时使用
		if (a_Name)
		{
			l_Rst.setAttribute("data-Wse_Name", a_Name);
		}

		return l_Rst;
	}

	// 显示对话框
	function fShowDlgBox(a_This, a_Kind)
	{
		var l_This = a_This;
		if (l_This.cIsDlgBoxShow())
		{
			if (a_Kind == l_This.d_Show)
			{ return l_This; }

			l_This.cHideDlgBox();
		}

		// 注意顺序，否则元素显示不正确
		l_This.d_PutTgt.style.display = "block";		// 1.显示放置目标

		(1 == a_Kind)									// 2.初始化
		? fInit_SignIn(l_This)
		: fInit_LogIn(l_This);

	//	l_This.d_Form.cRfsh();					// 3.刷新表单
		l_This.cRfsh();

		stCssUtil.cSetPos(l_This.d_PutTgt,				// 4.放置目标摆放到屏幕中间
				(window.innerWidth - l_This.d_PutTgt.offsetWidth) / 2,
				(window.innerHeight - l_This.d_PutTgt.offsetHeight) / 2);

		// 输入焦点
	//	l_This.d_Form.cIptFoc(a_This.d_PutSrcId_Mail, true);
		l_This.cIptFoc(a_This.d_PutSrcId_Mail, true);

		// 记录
		l_This.d_Show = a_Kind;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tSignLog;
	(function ()
	{
		tSignLog = nWse.fClass(nCmnWgts,
		/// 注册登录
		function tSignLog()
		{
			this.odBase(tSignLog).odCall();	// 基类版本

			var l_This = this;
			fRset(this);
		}
		,
		tForm		// 从表单派生
		,
		{
			/// 绑定
			/// a_Cfg：Object，配置
			/// {
			///	c_PutTgt：String，放置目标的HTML元素ID，若不存在则自动创建带有指定ID的<div>，作为c_PutSrc的前一个兄弟节点
			/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
			/// c_DomPrn：Node，父节点，默认<body>
			/// c_MailPlchd：String，邮箱占位符，默认"邮箱："
			/// c_PswdPlchd：String，密码占位符，默认"密码（6-20个字符）："
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tSignLog");	// CSS类

				var l_Prn = a_Cfg.c_DomPrn || stDomUtil.cAcsBody();		// 加入到文档
				l_Prn.appendChild(l_This.d_PutTgt);

				// 注册放置目标事件处理器
//				if (! l_This.d_fOnWidDtmnd)
//				{
//					l_This.d_fOnWidDtmnd = function ()
//					{
//						// 刷新表单
//						if (l_This.d_Form)
//						{ l_This.d_Form.cAcsWgtSet().cTrgrPutEvt_WidDtmnd(); }
//					};
//
//					l_This.dRegPutTgtEvtHdlr_WidDtmnd(l_This.d_fOnWidDtmnd);
//				}
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;

				// 事件处理器
//				if (l_This.d_fOnWidDtmnd)
//				{
//					l_This.dUrgPutTgtEvtHdlr_WidDtmnd(l_This.d_fOnWidDtmnd);
//					l_This.d_fOnWidDtmnd = null;
//				}

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

				return this;
			}
//			,
//			/// 拾取
//			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
//			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
//			vcPick : function f(a_Bbox, a_Picker)
//			{
//				if (a_Bbox)
//				{
//					return this;
//				}
//
//				// 转交表单
//				var l_This = this;
//				l_This.d_Form.vcPick(a_Bbox, a_Picker);
//				if (a_Picker.cIsOver())
//				{ return this; }
//
//				// 拾取放置目标
//				l_This.dPickPutTgtByPathPnt(a_Picker, l_This.d_PutTgt);
//				return this;
//			}
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
			,
			/// 对话框显示？
			cIsDlgBoxShow : function ()
			{
				return (0 != this.d_Show);
			}
			,
			/// 隐藏对话框
			cHideDlgBox : function ()
			{
				var l_This = this;
				if ((! l_This.d_PutTgt) || (! l_This.d_PutTgt.style.display) || (0 == l_This.d_Show))
				{ return this; }

				l_This.d_PutTgt.style.display = "";		// 隐藏放置目标
				l_This.cClnPutTgt();					// 清空放置目标
				stDomUtil.cRmvAllChds(l_This.d_PutTgt);	// 移除剩余（文本）节点
//				l_This.d_Form.cAcsWgtSet().cClnPutTgt();
//				l_This.d_Form.cClr();					// 表单清空
			//	l_This.cClnPutTgt();
			//	l_This.cClr();	// 不要调用！


				l_This.d_Show = 0;						// 隐藏
				return this;
			}
			,
			/// 显示对话框 - 注册
			cShowDlgBox_SignIn : function ()
			{
				var l_This = this;
				fShowDlgBox(l_This, 1);
				return this;
			}
			,
			/// 显示对话框 - 登录
			cShowDlgBox_LogIn : function ()
			{
				var l_This = this;
				fShowDlgBox(l_This, 2);
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