/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi",
		[
			"nWse:DomUtil.js",
			"nWse:CssUtil.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("(0)Plmvc.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 名字空间

	var nUi = nWse.fNmspc(nWse,
		/// 用户界面
		function nUi() {});

	var unKnl = nWse.fNmspc(nUi,
		function unKnl() {});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 内核函数

	unKnl.fObtnPutSrc = function (a_PutSrcId)
	{
		// 获取，若不存在则返回
		var l_Rst = a_PutSrcId ? document.getElementById(a_PutSrcId) : null;
		if (! l_Rst)
		{ return null; }

		// 簿记
		if (! l_Rst.Wse_PutSrc)
		{ l_Rst.Wse_PutSrc = {}; }

		// 记录原始CSS类，添加cnWse_PutSrc
		l_Rst.Wse_PutSrc.c_OrigCssc = l_Rst.className;
		stCssUtil.cAddCssc(l_Rst, "cnWse_PutSrc");
		return l_Rst;
	};

	unKnl.fAbdnPutSrc = function (a_PutSrc)
	{
		if (! a_PutSrc.Wse_PutSrc)
		{ return; }

		a_PutSrc.className = a_PutSrc.Wse_PutSrc.c_OrigCssc;	// CSS类
		a_PutSrc.Wse_PutSrc = null;								// 簿记
	};

	unKnl.fObtnPutTgt = function (a_PutTgtId, a_PutSrc, a_PutTgtSlc)
	{
		// 获取，若不存在则新建
		var l_Rst = null;
		if (a_PutTgtId)
		{
			l_Rst = document.getElementById(a_PutTgtId);
		}

		if ((! l_Rst) && a_PutTgtSlc)
		{
			l_Rst = stDomUtil.cQryOne("#" + a_PutSrc.id + a_PutTgtSlc);
			l_Rst.id = a_PutTgtId;	// 记录ID
		}

		if ((! l_Rst))
		{
			l_Rst = document.createElement("div");
			l_Rst.id = a_PutTgtId;	// 记录ID
			a_PutSrc.parentNode.insertBefore(l_Rst, a_PutSrc);	// 作为前一个兄弟节点
		}

		// 簿记
		if (! l_Rst.Wse_PutTgt)
		{ l_Rst.Wse_PutTgt = {}; }

		// 记录原始CSS类，添加cnWse_PutTgt
		l_Rst.Wse_PutTgt.c_OrigCssc = l_Rst.className;		// 记录原始CSS类
		stCssUtil.cAddCssc(l_Rst, "cnWse_PutTgt");
		return l_Rst;
	};

	unKnl.fAbdnPutTgt = function (a_PutTgt)
	{
		if (! a_PutTgt.Wse_PutTgt)
		{ return; }

		a_PutTgt.className = a_PutTgt.Wse_PutTgt.c_OrigCssc;	// CSS类
		a_PutTgt.Wse_PutTgt = null;								// 簿记
	};

	unKnl.fIsPutInTgt = function (a_PutTgt, a_Put)
	{
		return (a_PutTgt === a_Put.parentNode);
	};

	unKnl.fPutToTgt = function (a_PutTgt, a_PutSrc, a_PutInSrc, a_Bef, a_Vrf)
	{
		// 已经在了？
		if (a_PutTgt === a_PutInSrc.parentNode)
		{ return; }

		// 验证
		if (a_Vrf && (! stDomUtil.cIsAcst(a_PutSrc, a_PutInSrc)))
		{ throw new Error("“" + a_PutInSrc.id + "”不是“" + a_PutSrc.id + "”的后代节点！"); }

		// 簿记原始父节点
		if (! a_PutInSrc.Wse_Put)
		{ a_PutInSrc.Wse_Put = {}; }

		a_PutInSrc.Wse_Put.c_OrigPrn = a_PutInSrc.parentNode;

		// 插入或追加
		a_Bef
		? a_PutTgt.insertBefore(a_PutInSrc, a_Bef)
		: a_PutTgt.appendChild(a_PutInSrc);
	};

	function fObtnOrigPrnOfPut(a_PutSrc, a_Put)
	{
		return (a_Put.Wse_Put && a_Put.Wse_Put.c_OrigPrn) || a_PutSrc;
	}

	unKnl.fIsPutInSrc = function (a_PutSrc, a_Put)
	{
		var l_Prn = fObtnOrigPrnOfPut(a_PutSrc, a_Put);
		return (l_Prn === a_Put.parentNode);
	};

	unKnl.fApdToSrc = function (a_PutSrc, a_Put)
	{
		a_PutSrc.appendChild(a_Put);
	};

	unKnl.fRtnToSrc = function (a_PutTgt, a_PutSrc, a_PutInTgt, a_Bef, a_Vrf)
	{
		// 已经在了？
		var l_Prn = fObtnOrigPrnOfPut(a_PutSrc, a_PutInTgt);
		if (l_Prn === a_PutInTgt.parentNode)
		{ return; }

		// 验证
		if (a_Vrf && (! stDomUtil.cIsAcst(a_PutTgt, a_PutInTgt)))
		{ throw new Error("“" + a_PutInTgt.id + "”不是“" + a_PutTgt.id + "”的后代节点！"); }

		// 插入或追加
		a_Bef
		? l_Prn.insertBefore(a_PutInTgt, a_Bef)
		: l_Prn.appendChild(a_PutInTgt);
	};

	unKnl.fClnPutTgt = function (a_PutTgt, a_PutSrc)
	{
		var l_PutTgt = a_PutTgt;
		var l_Nl = l_PutTgt.childNodes, n = 0, l_Len = l_Nl.length;
		for (; n<l_Len; ++n)
		{
			// 如果是摆放过来的，归还回去
			if (l_Nl[n].Wse_Put && l_Nl[n].Wse_Put.c_OrigPrn)
			{
				unKnl.fRtnToSrc(a_PutTgt, a_PutSrc, l_Nl[n], null, false);
				-- n;
				-- l_Len;
			}
		}
	};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	/// 注册放置元素事件处理器，【注意】不允许重复注册！
	/// a_EvtName：String，∈{ "AnmtUpd", "AnmtEnd" }
	nUi.fRegPutEvtHdlr = function (a_Put, a_EvtName, a_fHdlr)
	{
		// 簿记
		if (! a_Put.Wse_Put)
		{ a_Put.Wse_Put = {}; }

		if (! a_Put.Wse_Put.c_EvtSys)
		{ a_Put.Wse_Put.c_EvtSys = {}; }

		if (! a_Put.Wse_Put.c_EvtSys[a_EvtName])
		{ a_Put.Wse_Put.c_EvtSys[a_EvtName] = new nWse.tEvtHdlrAry(); }

		if (a_Put.Wse_Put.c_EvtSys[a_EvtName].cFind(a_fHdlr) < 0)
		{ a_Put.Wse_Put.c_EvtSys[a_EvtName].cReg(a_fHdlr); }
	};

	/// 注销放置元素事件处理器
	nUi.fUrgPutEvtHdlr = function (a_Put, a_EvtName, a_fHdlr)
	{
		if ((! a_Put.Wse_Put) || (! a_Put.Wse_Put.c_EvtSys) ||
			(! a_Put.Wse_Put.c_EvtSys[a_EvtName]) || (a_Put.Wse_Put.c_EvtSys[a_EvtName].cFind(a_fHdlr) < 0))
		{ return; }

		a_Put.Wse_Put.c_EvtSys[a_EvtName].cUrg(a_fHdlr);
	};

	/// 有放置元素事件处理器？
	nUi.fHasPutEvtHdlr = function (a_Put, a_EvtName)
	{
		if ((! a_Put.Wse_Put) || (! a_Put.Wse_Put.c_EvtSys) ||
			(! a_Put.Wse_Put.c_EvtSys[a_EvtName]))
		{ return false; }

		return ! a_Put.Wse_Put.c_EvtSys[a_EvtName].cIsEmt();
	};

	/// 触发放置元素事件
	/// a_Agms：Array，实参数组，默认null，【注意】必须是数组或null！
	nUi.fTrgrPutEvt = function (a_Put, a_EvtName, a_Agms)
	{
		if ((! a_Put.Wse_Put) || (! a_Put.Wse_Put.c_EvtSys) ||
			(! a_Put.Wse_Put.c_EvtSys[a_EvtName]))
		{ return; }

		a_Put.Wse_Put.c_EvtSys[a_EvtName].cFor.apply(a_Put.Wse_Put.c_EvtSys[a_EvtName], a_Agms);
	};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////