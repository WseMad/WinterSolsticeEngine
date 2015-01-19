/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态函数

	/// 添加事件处理器
	function fAddEvtHdlr(a_Elmt, a_EvtName, a_fHdl)
	{
		if (a_Elmt.addEventListener)
		{ a_Elmt.addEventListener(a_EvtName, a_fHdl, false); }
		else
		if (a_Elmt.attachEvent)
		{ a_Elmt.attachEvent("on" + a_EvtName, a_fHdl); }
		else
		{ a_Elmt["on" + a_EvtName] = a_fHdl; }

		return stPageInit;
	}

	/// 移除事件处理器
	function fRmvEvtHdlr(a_Elmt, a_EvtName, a_fHdl)
	{
		if (a_Elmt.removeEventListener)
		{ a_Elmt.removeEventListener(a_EvtName, a_fHdl, false); }
		else
		if (a_Elmt.detachEvent)
		{ a_Elmt.detachEvent("on" + a_EvtName, a_fHdl); }
		else
		{ a_Elmt["on" + a_EvtName] = null; }

		return stPageInit;
	}

	/// 获取名称
	/// a_fTgt：Function，目标函数
	/// 返回：String，函数名
	function fGetFctnName(a_fTgt)
	{
		// 除IE以外的浏览器普遍具有name属性
		if (a_fTgt.name)
		{ return a_fTgt.name; }

		// 若无，使用正则表达式匹配之
		// function、函数名、(，之间可有行注释，块注释，空白
		var i_Rgx = /^function(?:\/\/.*?\r?\n|\/\*[\S\s]*?\*\/|\s)*([^\/\s\(]*)/;
		var l_Str = a_fTgt.toString();
		var l_Mch = i_Rgx.exec(l_Str);
		return (l_Mch && l_Mch[1]) ? l_Mch[1] : "";
	}

	/// 获取信息
	/// a_fTgt：Function，目标函数
	/// a_Name：Boolean，是否获取名称
	/// a_Prms：Boolean，是否获取形参
	/// a_Body：Boolean，是否获取函数体
	/// 注意：若不传a_Name，a_Prms，a_Body，则认为全部是true
	/// 返回：Object，
	/// {
	/// c_Name：String，名称
	/// c_Prms：String[]，形参名数组
	/// c_Body：String，函数体
	/// }
	function fGetFctnInfo(a_fTgt, a_Name, a_Prms, a_Body)
	{
		// 如果三个实参皆无则默认为true
		if (1 == arguments.length)
		{ a_Name = a_Prms = a_Body = true; }

		// 结果初始化
		var l_Rst = { "c_Name": "", "c_Prms": null, "c_Body": "" };

		// 如果只要求名称
		if (a_Name && (! a_Prms) && (! a_Body))
		{
			l_Rst.c_Name = fGetFctnName(a_fTgt);
			return l_Rst;
		}

		// 对于其他获取方式，需要完全匹配三部分
		// 使用fInit，确保复杂的正则表达式只被创建一次，在首次使用时
		function fInit()
		{
			var l_Ptn_CmtAndSpc = "(?:\\/\\/.*?\\r?\\n|\\/\\*[\\S\\s]*?\\*\\/|\\s)*";
			var l_Ptn_Id = "[^\\/\\s\\(\\)]*";
			var l_Ptn_Name = "(" + l_Ptn_Id + ")";
			var l_Ptn_Prms = "\\(" + l_Ptn_CmtAndSpc + "((?:" + l_Ptn_Id + l_Ptn_CmtAndSpc + ",?" + l_Ptn_CmtAndSpc + ")*)\\)";
			var l_Ptn_Body = "{([\\S\\s]*)}$";
			var l_RgxStr = "^function" + l_Ptn_CmtAndSpc + l_Ptn_Name + l_Ptn_CmtAndSpc + l_Ptn_Prms + l_Ptn_CmtAndSpc + l_Ptn_Body;
			fInit.c_RgxMch = new RegExp(l_RgxStr);
			fInit.c_RgxRmv = new RegExp(l_Ptn_CmtAndSpc, "g");
		}

		if (! fInit.c_RgxMch)
		{ fInit(); }

		var l_Str = a_fTgt.toString();
		var l_Mch = fInit.c_RgxMch.exec(l_Str);
		if (! l_Mch)
		{
			if (a_Name)	// 未匹配时假定toString返回的就是函数名
			{ l_Rst.c_Name = l_Str;	}
		}
		else
		{
			if (l_Mch[1] && a_Name)
			{ l_Rst.c_Name = l_Mch[1]; }

			if (l_Mch[2] && a_Prms)
			{ l_Rst.c_Prms = l_Mch[2].replace(fInit.c_RgxRmv, "").split(","); }

			if (l_Mch[3] && a_Body)
			{ l_Rst.c_Body = l_Mch[3]; }
		}
		return l_Rst;
	}

	/// 定义数据属性，如不支持Object.defineProperty，则以赋值方式定义，并放弃设置特性
	/// a_Tgt：Object，目标
	/// a_PptyName：String，属性名
	/// a_Cfgbl：Boolean，是否可配置
	/// a_Enmbl：Boolean，是否可列举
	/// a_Wrtbl：Boolean，是否可写
	/// a_Val：任意类型，属性值
	function fDfnDataPpty(a_Tgt, a_PptyName, a_Cfgbl, a_Enmbl, a_Wrtbl, a_Val)
	{
		try
		{ Object.defineProperty(a_Tgt, a_PptyName, { configurable : a_Cfgbl, enumerable : a_Enmbl, writable : a_Wrtbl, value : a_Val }); }
		catch (a_Exc) // IE8
		{ a_Tgt[a_PptyName] = a_Val; }
	}

	/// 浅赋值
	/// a_Dst：Object，目的
	/// a___：Object，来源，将跳过undefined字段
	/// 返回：a_Dst
	function fShlwAsn(a_Dst, a___)
	{
		var i = 1, l_Len = arguments.length, l_Agm, l_PN, l_PV;
		for (; i<l_Len; ++i)
		{
			l_Agm = arguments[i];
			for (l_PN in l_Agm)
			{
				l_PV = l_Agm[l_PN];
				if (undefined !== l_PV)
				{ a_Dst[l_PN] = l_PV; }
			}
		}
		return a_Dst;
	}

	/// 拼接字符串，空子串将被跳过
	/// a___：String，各个子串
	/// 返回：String
	function fCcat(a___)
	{
		var l_Rst = "";
		var i = 0, l_Len = arguments.length;
		for (; i<l_Len; ++i)
		{
			if (arguments[i])
			{ l_Rst += arguments[i]; }
		}
		return l_Rst;
	}

	/// 确保是目录，即确保以“/”或“\”结尾
	/// a_Path：String，路径，若为null则返回null
	/// 返回：String
	function fEnsrDiry(a_Path)
	{
		var i_Rgx = /[\/\\]$/;
		return a_Path ? (i_Rgx.test(a_Path) ? a_Path : (a_Path + "/")) : null;
	}

	/// 确保是JavaScript文件，即确保以“.js”结尾
	/// a_Path：String，路径，若为null则返回null
	/// 返回：String
	function fEnsrJs(a_Path)
	{
		var i_Rgx = /\.js$/i; 
		return a_Path ? (i_Rgx.test(a_Path) ? a_Path : (a_Path + ".js")) : null;
	}

	// 为IE8添加Array.prototype.indexOf
	if (! Array.prototype.indexOf)
	{
		Array.prototype.indexOf = function(a_Elmt, a_Bgn)
		{
			var l_Len = this.length || 0;
			var l_Idx = Number(arguments[1]) || 0;
			l_Idx = (l_Idx < 0) ? Math.ceil(l_Idx) : Math.floor(l_Idx);
			if (l_Idx < 0)
			{ l_Idx += l_Len; }

			for (; l_Idx < l_Len; ++l_Idx)
			{
				if ((l_Idx in this) && (this[l_Idx] === a_Elmt))
				{ return l_Idx; }
			}
			return -1;
		};
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 名字空间

	// 默认定义的三个名字空间
	var nWse, nApp, unKnl;

	function fNmspc(a_nPrnSpc, a_fCtor)
	{
		// 默认父空间为l_Glb
		if (! a_nPrnSpc)
		{ a_nPrnSpc = l_Glb; }

		// 取得空间名
		var l_SpcName = fGetFctnName(a_fCtor);
		if (! l_SpcName)
		{ throw new Error("构造函数名即为空间名，不能为空！"); }

		/// 父空间
		a_fCtor.oc_nPrnSpc = a_nPrnSpc;

		/// 名称，如"nSelf"
		a_fCtor.oc_Name = l_SpcName;

		/// 全名，如"nWse.nSelf"
		a_fCtor.oc_FullName = (function ()
		{
			var l_Rst = l_SpcName;
			var l_nPrnSpc = a_nPrnSpc;
			while (l_nPrnSpc.oc_Name)
			{
				l_Rst = l_nPrnSpc.oc_Name + "." + l_Rst;
				l_nPrnSpc = l_nPrnSpc.oc_nPrnSpc;
			}
			return l_Rst;
		})();

		/// 构建全名，如"nWse.nSelf.tClass"
		/// a_Name：名称
		/// 返回：全名
		a_fCtor.ocBldFullName = function (a_Name)
		{ return a_fCtor.oc_FullName + "." + a_Name; };

		// 作为父空间的字段添加
		a_nPrnSpc[l_SpcName] = a_fCtor;
		return a_fCtor;
	}

	// 定义名字空间nWse和nApp，记录全局变量
	nWse = fNmspc(l_Glb,
		/// 冬至引擎
		function nWse(){ return nWse; });
	nApp = fNmspc(l_Glb,
		/// 应用程序
		function nApp(){ return nApp; });

	/// Boolean，是否在浏览器里
	nWse.i_InBrsr = ! i_InNodeJs;

	/// 是否在线浏览？
	/// a_HostRgx：RegExp，主机正则表达式，若为null则不参与比较，若有效将与小写形式的location.hostname匹配
	/// a_Port：Number，端口，80和443总是认为是，默认80
	/// 返回：Boolean，若两个参数都与location里对应字段相等则返回true
	nWse.fIsOnlnBrs = function (a_HostRgx, a_Port)
	{
		if ((! nWse.i_InBrsr) || 
			(! ((80 == l_Glb.location.port) || (443 == l_Glb.location.port) || ((a_Port || 80) == l_Glb.location.port))))
		{ return false; }

		return a_HostRgx ? a_HostRgx.test(l_Glb.location.hostname.toLowerCase()) : true;
	};

	/// Number，异步延迟（秒），用于模拟异步请求时的网络延迟，应仅用于开发时！
	nWse.g_AsynDly = 0;

	/// 是否异步延迟？
	nWse.fIsAsynDly = function ()
	{
		return (! nWse.fIsOnlnBrs()) && (nWse.g_AsynDly > 0);
	};

	/// 名字空间
	/// a_nPrnSpc：父空间，默认为l_Glb
	/// a_fCtor：a_fCtor：Function，构造函数，不会调用，只使用函数名
	/// 返回：新定义的名字空间
	nWse.fNmspc = function (a_nPrnSpc, a_fCtor)
	{
		// 建立，并在构造函数上记录构造器
		fNmspc(a_nPrnSpc, a_fCtor);
		fDfnDataPpty(a_fCtor, "constructor", false, false, false, nWse.fNmspc);
		return a_fCtor;
	};

	// 在nWse和nApp构造函数上记录构造器
	fDfnDataPpty(nWse, "constructor", false, false, false, nWse.fNmspc);
	fDfnDataPpty(nApp, "constructor", false, false, false, nWse.fNmspc);

	/// 是否为名字空间？
	/// a_Any：任意
	/// 返回：Boolean，是否
	nWse.fIsNmspc = function (a_Any)
	{
		return a_Any && (a_Any.constructor === nWse.fNmspc);
	};

	// 定义内核空间，并装配之
	unKnl = nWse.fNmspc(nWse, function unKnl() { });
	unKnl.fAddEvtHdlr = fAddEvtHdlr;
	unKnl.fRmvEvtHdlr = fRmvEvtHdlr;
	unKnl.fGetFctnName = fGetFctnName;
	unKnl.fGetFctnInfo = fGetFctnInfo;
	unKnl.fDfnDataPpty = fDfnDataPpty;
	unKnl.fShlwAsn = fShlwAsn;
	unKnl.fCcat = fCcat;
	unKnl.fEnsrDiry = fEnsrDiry;
	unKnl.fEnsrJs = fEnsrJs;

	/// 断言
	/// a_Expr：Boolean，表达式
	/// a_Info：String，信息
	nWse.fAst = function (a_Expr, a_Info)
	{
		if (! a_Expr)
		{ throw new Error(a_Info || "断言失败！"); }
	};

	/// 可能是非Html5浏览器
	nWse.fMaybeNonHtml5Brsr = function ()
	{
		return (! document.getElementsByClassName);	// IE8以前都没有这个函数
	};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 页面初始化

	var stPageInit;
	(function ()
	{
		/// 页面初始化
		stPageInit = function () { };
		nWse.stPageInit = stPageInit;
		stPageInit.oc_nHost = nWse;
		stPageInit.oc_FullName = nWse.ocBldFullName("stPageInit");

		/// 构建全名
		stPageInit.ocBldFullName = function (a_Name)
		{ return stPageInit.oc_FullName + "." + a_Name; };

		//======== 私有字段

		var e_OnDocRdy = [];
		var e_OnWndLoad = [];

		//======== 私有函数

		function eOnDocRdy()
		{
			if ((! e_OnDocRdy))
			{ return; }

			var i;
			for (i = 0; i<e_OnDocRdy.length; ++i)
			{
				e_OnDocRdy[i]();
			}

			e_OnDocRdy = null;	// 完成后立即清除
		}

		function eOnDocRdy_NH5()
		{
			if (("interactive" != document.readyState) && ("complete" != document.readyState))
			{ return; }

			fRmvEvtHdlr(document, "readystatechange", eOnDocRdy_NH5);
			eOnDocRdy();
		}

		function eOnWndLoad()
		{
			if (e_OnDocRdy) // 如果还没有被清除，现在回调
			{ eOnDocRdy(); }

			if ((! e_OnWndLoad))
			{ return; }

			var i;
			for (i = 0; i<e_OnWndLoad.length; ++i)
			{
				e_OnWndLoad[i]();
			}

			e_OnWndLoad = null;	// 完成后立即清除
		}

		//======== 公有函数

		// 注册两个事件处理器
		if (nWse.fMaybeNonHtml5Brsr()) // IE8
		{ fAddEvtHdlr(document, "readystatechange", eOnDocRdy_NH5); }
		else // H5
		{ fAddEvtHdlr(document, "DOMContentLoaded", eOnDocRdy); }

		fAddEvtHdlr(window, "load", eOnWndLoad);

		/// 添加事件处理器 - 文档就绪
		stPageInit.cAddEvtHdlr_DocRdy = function (a_fCabk)
		{
			// 存在时录入，不存在时立即回调
			e_OnDocRdy ? e_OnDocRdy.push(a_fCabk) : a_fCabk();
			return stPageInit;
		};

		/// 添加事件处理器 - 窗口加载
		stPageInit.cAddEvtHdlr_WndLoad = function (a_fCabk)
		{
			// 存在时录入，不存在时立即回调
			e_OnWndLoad ? e_OnWndLoad.push(a_fCabk) : a_fCabk();
			return stPageInit;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 异步导入

	var stAsynImpt;
	(function ()
	{
		/// 异步导入（样式表）
		stAsynImpt = function () { };
		nWse.stAsynImpt = stAsynImpt;
		stAsynImpt.oc_nHost = nWse;
		stAsynImpt.oc_FullName = nWse.ocBldFullName("stAsynImpt");

		/// 构建全名
		stAsynImpt.ocBldFullName = function (a_Name)
		{
			return stAsynImpt.oc_FullName + "." + a_Name;
		};

		//======== 私有字段

		//======== 私有函数

		//======== 公有函数

		/// 按序并行，一次发出全部请求，同时保证每个文件按数组顺序加入到文档
		/// a_Paths：String[]，路径数组，每个路径指向一个CSS文件
		/// a_fCabk：void f(a_Errs)，回调，a_Errs记录出错的文件路径
		stAsynImpt.cPrllInOdr = function (a_Paths, a_fCabk)
		{
			var l_Len = a_Paths ? a_Paths.length : 0;
			if (! l_Len) // 没有时立即回调
			{
				a_fCabk(null);
				return stAsynImpt;
			}

			var l_Dom_Head = l_Glb.document.documentElement.firstChild;	// <head>
			var l_Dom_CssJs;
			var l_Idx = 0, l_Cnt = 0;
			for (; l_Idx<l_Len; ++l_Idx)
			{
				l_Dom_CssJs = l_Glb.document.createElement("link");
				l_Dom_CssJs.rel="stylesheet";
				l_Dom_CssJs.type = "text/css";
				l_Dom_CssJs.onerror = fOnErr;
				("onload" in l_Dom_CssJs) ? (l_Dom_CssJs.onload = fOnLoad) : (l_Dom_CssJs.onreadystatechange = fOnLoad);
				l_Dom_CssJs.href = l_Dom_CssJs.Wse_Path = a_Paths[l_Idx]; // 记录路径并赋予
				l_Dom_Head.appendChild(l_Dom_CssJs); // 加入文档
			}

			function fOnErr()
			{
				// 记录错误
				a_fCabk.Wse_Errs ? a_fCabk.Wse_Errs.push(this.Wse_Path) : (a_fCabk.Wse_Errs = [this.Wse_Path]);

				// 累计一个
				fAccOne();
			}

			function fOnLoad()
			{
				// IE8
				if (nWse.fMaybeNonHtml5Brsr())
				{
					// 继续等待
					if (("loaded" != this.readyState) && ("complete" != this.readyState))
					{ return; }
				}

				// 累计一个
				fAccOne();
			}

			function fAccOne()
			{
				// 加一个
				++ l_Cnt;
				if (l_Cnt < l_Len) // 还有
				{
					// 继续
				}
				else // 完成
				{
					// 回调
					a_fCabk(a_fCabk.Wse_Errs || null);
				}
			}

			return stAsynImpt;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 异步加载

	var stAsynLoad;
	(function ()
	{
		/// 异步加载（脚本）
		stAsynLoad = function () { };
		nWse.stAsynLoad = stAsynLoad;
		stAsynLoad.oc_nHost = nWse;
		stAsynLoad.oc_FullName = nWse.ocBldFullName("stAsynLoad");

		/// 构建全名
		stAsynLoad.ocBldFullName = function (a_Name)
		{
			return stAsynLoad.oc_FullName + "." + a_Name;
		};

		//======== 私有字段

		//======== 私有函数

		//======== 公有函数

		/// 按序串行，一个接一个地发出请求，保证每个文件按数组顺序加入到文档
		/// a_Paths：String[]，路径数组，每个路径指向一个JS文件
		/// a_fCabk：void f(a_Errs)，回调，a_Errs记录出错的文件路径
		stAsynLoad.cSrilInOdr = function (a_Paths, a_fCabk)
		{
			var l_Len = a_Paths ? a_Paths.length : 0;
			if (! l_Len) // 没有时立即回调
			{
				a_fCabk(null);
				return stAsynLoad;
			}

			var l_Dom_Head = l_Glb.document.documentElement.firstChild;	// <head>
			var l_Idx = 0;
			function fLoadOne()
			{
				var l_Dom_CssJs = l_Glb.document.createElement("script");
				l_Dom_CssJs.type = "text/javascript";
				l_Dom_CssJs.onerror = fOnErr;
				("onload" in l_Dom_CssJs) ? (l_Dom_CssJs.onload = fOnLoad) : (l_Dom_CssJs.onreadystatechange = fOnLoad);
				l_Dom_CssJs.src = l_Dom_CssJs.Wse_Path = a_Paths[l_Idx]; // 记录路径并赋予
				l_Dom_Head.appendChild(l_Dom_CssJs); // 加入文档
			}

			function fOnErr()
			{
				// 记录错误
				a_fCabk.Wse_Errs ? a_fCabk.Wse_Errs.push(this.Wse_Path) : (a_fCabk.Wse_Errs = [this.Wse_Path]);

				// 下一个
				fNext();
			}

			function fOnLoad()
			{
				// IE8
				if (nWse.fMaybeNonHtml5Brsr())
				{
					// 继续等待
					if (("loaded" != this.readyState) && ("complete" != this.readyState))
					{ return; }
				}

				// 下一个
				fNext();
			}

			function fNext()
			{
				// 下一个
				++ l_Idx;
				if (l_Idx < l_Len) // 还有
				{
					// 继续
					fLoadOne();
				}
				else // 完成
				{
					// 回调
					a_fCabk(a_fCabk.Wse_Errs || null);
				}
			}

			// 开始加载
			fLoadOne();
			return stAsynLoad;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 异步包含

	var stAsynIcld;
	(function ()
	{
		///  异步包含
		stAsynIcld = function () { };
		nWse.stAsynIcld = stAsynIcld;
		stAsynIcld.oc_nHost = nWse;
		stAsynIcld.oc_FullName = nWse.ocBldFullName("stAsynIcld");

		/// 构建全名
		stAsynIcld.ocBldFullName = function (a_Name)
		{ return stAsynIcld.oc_FullName + "." + a_Name; };

		//======== 私有字段

		// 库目录映射
		var e_LibDiryMap = { "nWse": "../nWse/", "cnWse": "../cnWse/" };
		eInitLibDiryMap();

		var e_CpltRgtr = {};							// 注册表
		var e_FromLibQue = null;						// 调用队列

		//======== 私有函数

		// 初始化库目录映射
		function eInitLibDiryMap()
		{
			//if (i_InNodeJs) // 如常处理
			//{ return; }

			var l_Doms = l_Glb.document.getElementsByTagName("script");
			var l_Src = (l_Doms.length > 0) && l_Doms[l_Doms.length - 1].getAttribute("src");	// 取最后一个，即为当前脚本
			var l_Idx = l_Src ? l_Src.toLowerCase().indexOf("/nwse/(0)seed.js") : -1;
			var l_Diry;
			if (l_Idx >= 0)
			{
				l_Diry = l_Src.slice(0, l_Idx);
				e_LibDiryMap["nWse"] = l_Diry + "/nWse/";
				e_LibDiryMap["cnWse"] = l_Diry + "/cnWse/";	// 假定这两个目录并列
			}
		}

		// 新建完成条目
		function eNewCpltEtr(a_LwrPath, a_Sta, a_Dom_Script, a_fCabk)
		{
			return (e_CpltRgtr[a_LwrPath] = {
				c_Sta : a_Sta,	// c_Sta：-1=出错；0=未发出；1=待定；2=未回调；3=完成
				c_Dom_Script : a_Dom_Script || null,
				c_fCabk : a_fCabk || null
			});
		}

		// 替换库路径
		function eSbstLibPath(a_LibPath, a_Idx)
		{
			var l_Idx = (undefined === a_Idx) ? a_LibPath.indexOf(":") : a_Idx;
			return (l_Idx < 0) ? e_LibDiryMap[a_LibPath] : fCcat(e_LibDiryMap[a_LibPath.slice(0, l_Idx)], a_LibPath.slice(l_Idx + 1));
		}

		// 生成默认目录
		function eGnrtDftDiry(a_DftLibDiry)
		{
			return a_DftLibDiry ? fEnsrDiry(eSbstLibPath(a_DftLibDiry)) : e_LibDiryMap["nWse"];
		}

		// 生成路径，a_LibPath没有“:”时采用默认目录
		function eGnrtPath(a_DftDiry, a_LibPath)
		{
			var l_Idx = a_LibPath.indexOf(":");
			return (l_Idx < 0) ? fCcat(a_DftDiry, a_LibPath) : eSbstLibPath(a_LibPath, l_Idx);
		}

		// 统计包含三函数
		function eIcldByAry(a_AsynAry, a_DftDiry, a_Paths)
		{
			var i = 0, l_Len = a_Paths ? a_Paths.length : 0;
			var l_Key;
			for (; i<l_Len; ++i)
			{
				l_Key = a_Paths[i];
				if (l_Key)
				{ eIcldKey(a_AsynAry, a_DftDiry, fEnsrJs(l_Key)); }
			}
		}

		function eIcldKey(a_AsynAry, a_DftDiry, a_Key)
		{
			// 如果已登记，立即返回
			var l_Path = eGnrtPath(a_DftDiry, a_Key);
			var l_LwrPath = l_Path.toLowerCase();
			var l_Sta;
			if (l_LwrPath in e_CpltRgtr)
			{
				// 如果状态为-1、3，立即返回
				l_Sta = e_CpltRgtr[l_LwrPath].c_Sta;
				if ((-1 == l_Sta) || (3 == l_Sta))
				{ return; }
			}

			// Node.js里使用require函数同步加载
			if (i_InNodeJs)
			{
				require(l_Path);
				e_CpltRgtr[l_LwrPath] = { c_Sta : 3 };		// 完成
			}
			else // 浏览器里异步加载
			{
				a_AsynAry.push(l_Path);
			}
		}

		// 异步
		function fAsyn(a_fRoot, a_fCabk)
		{
			var l_Dom_Head = l_Glb.document.documentElement.firstChild;	// <head>
			var i = 0, l_Len = a_fCabk.Wse_Dpdts.length;
			var l_Path, l_LwrPath;
			var l_Dom_Script = null;
			for (; i < l_Len; ++i)
			{
				l_Path = a_fCabk.Wse_Dpdts[i];
				l_LwrPath = l_Path.toLowerCase();

				(function (a_Idx, a_Path, a_LwrPath, a_RegItem)
				{
					// 如果已登记
					if (a_RegItem)
					{
						// 此时状态必为0、1、2，非2时添加事件处理器，2时只需等待回调树
						nWse.fAst((0 <= a_RegItem.c_Sta) || (a_RegItem.c_Sta <= 2), "状态应该是0、1、2");
						if (2 != a_RegItem.c_Sta)
						{ a_RegItem.c_OnCplt.push(fOnCplt); }
					}
					else // 生成脚本标记，并登记
					{
						l_Dom_Script = l_Glb.document.createElement("script");
						l_Dom_Script.type = "text/javascript";
						l_Dom_Script.onerror = fOnErr;
						("onload" in l_Dom_Script) ? (l_Dom_Script.onload = fOnLoad) : (l_Dom_Script.onreadystatechange = fOnLoad);
						l_Dom_Script.src = a_Path;
						a_RegItem = eNewCpltEtr(a_LwrPath, 1, l_Dom_Script, null);	// 待定
						a_RegItem.c_OnCplt = [fOnCplt];								// 当完成时
						l_Dom_Head.appendChild(l_Dom_Script);						// 加入文档
					}

					function fOnErr()
					{
						a_RegItem.c_Sta = -1;		// 出错

						// 记录错误
						a_fCabk.Wse_Errs ? a_fCabk.Wse_Errs.push(a_Path) : (a_fCabk.Wse_Errs = [a_Path]);

						// 通知完成
						fNtfCplt(false);
					}

					function fOnLoad()
					{
						// IE8
						if (nWse.fMaybeNonHtml5Brsr())
						{
							// 继续等待
							if (("loaded" != this.readyState) && ("complete" != this.readyState))
							{ return; }
						}

						a_RegItem.c_Sta = 2;		// 就绪

						// 将缓存的实参转储到注册项里，
						// 若队列为空，说明未调用，表示这一分支不存在依赖，此时保持初始值
						var l_Agms = null;
						if (e_FromLibQue.length > 0)
						{
							l_Agms = e_FromLibQue.shift();
							a_RegItem.c_fCabk = l_Agms.c_fCabk;
							a_RegItem.c_AsynAry = l_Agms.c_AsynAry;
						}

						// 通知完成
						fNtfCplt(true);
					}

					function fNtfCplt(a_OnLoad)
					{
						var l_Ary = a_RegItem.c_OnCplt, i=0, l_Len = l_Ary.length;
						for (; i<l_Len; ++i)
						{
							// 如果返回true，表示整个过程完结，立即跳出
							if (l_Ary[i](a_OnLoad))
							{ break; }
						}
					}

					function fOnCplt(a_OnLoad)
					{
						if (a_OnLoad) // onload
						{
							// 递归构建依赖树，注意这里的路径都已计算好，故不需要默认目录
							eBldDpdtTree(a_fRoot, null, a_RegItem.c_AsynAry, a_RegItem.c_fCabk);
						}
						else // onerror
						{
							//
						}

						// 从根开始遍历回调树
						return eCabkTree(a_fRoot, a_fRoot);
					}
				})(i, l_Path, l_LwrPath, e_CpltRgtr[l_LwrPath]);
			}
		}

		// 构建依赖树，返回true表示回调完成
		function eBldDpdtTree(a_fRoot, a_DftDiry, a_Paths, a_fCabk)
		{
			// 空回调函数？
			if ((! a_fCabk))
			{ return true; }

			// 需要异步加载的文件名存入这里
			var l_AsynAry = [];
			eIcldByAry(l_AsynAry, a_DftDiry, a_Paths);

			// 如果有需要异步加载的文件
			if (l_AsynAry.length > 0)
			{
				// 记录依赖，异步
				a_fCabk.Wse_Dpdts = l_AsynAry;
				fAsyn(a_fRoot, a_fCabk);
				return false;
			}
			else // 没有，立即回调
			{
				return eCabkTree(a_fRoot, a_fCabk);
			}
		}

		// 回调树，返回bool，表示子树是否已回调完
		function eCabkTree(a_fRoot, a_fCabk)
		{
			// 已回调过？
			if (a_fCabk.Wse_Called)
			{ return true; }

			// 如果有依赖
			var l_SubtreeRdy = true, l_RtnVal;
			var l_Dpdts, l_LwrPath, i, l_Len, l_RegItem;
			if (a_fCabk.Wse_Dpdts)
			{
				l_Dpdts = a_fCabk.Wse_Dpdts;
				l_Len = l_Dpdts.length;
				for (i=0; i<l_Len; ++i)
				{
					// 取得注册项
					// 若不存在，可能暗示立即从缓存加载（fOnLoad()触发过快，以致还未生成后面的注册项），暂且跳过；
					// 若存在，则状态不可能为0；
					// 遇到状态为1的表示子树未就绪，暂且跳过；
					// 跳过状态为-1、3的，或无回调的
					l_LwrPath = l_Dpdts[i].toLowerCase();
					l_RegItem = e_CpltRgtr[l_LwrPath];

					if ((! l_RegItem) || (1 == l_RegItem.c_Sta))
					{
						l_SubtreeRdy = false;
						continue;
					}

					if ((-1 == l_RegItem.c_Sta) || (3 == l_RegItem.c_Sta) || (! l_RegItem.c_fCabk))
					{ continue; }

					nWse.fAst((a_fCabk !== l_RegItem.c_fCabk), "逻辑保证不应相等！");

					// 递归，然后检查子树是否已回调完
					l_RtnVal = eCabkTree(a_fRoot, l_RegItem.c_fCabk);
					if (l_RtnVal)
					{ eClrRegItem(l_RegItem); }		// 清理注册项
					else
					{ l_SubtreeRdy = false; }		// 子树尚未就绪
				}
			}

			// 如果子树都回调完，就可以回调a_fCabk
			if (l_SubtreeRdy)
			{
				try
				{ a_fCabk(a_fCabk.Wse_Errs || null); }
				finally
				{ a_fCabk.Wse_Called = true; }
			}
			return l_SubtreeRdy;
		}

		function eClrRegItem(a_RegItem)
		{
			a_RegItem.c_Sta = 3;		// 完成
			a_RegItem.c_Dom_Script.onerror = null;
			("onload" in a_RegItem.c_Dom_Script) ? (a_RegItem.c_Dom_Script.onload = null) : (a_RegItem.c_Dom_Script.onreadystatechange = null);
			delete a_RegItem.c_Dom_Script;
			delete a_RegItem.c_fCabk;
			delete a_RegItem.c_OnCplt;
			delete a_RegItem.c_AsynAry;
		}

		//======== 公有函数

		/// 库目录映射
		stAsynIcld.cLibDiryMap = function (a_Map)
		{
			for (var l_PN in a_Map) { e_LibDiryMap[l_PN] = fEnsrDiry(a_Map[l_PN]); }
			return stAsynIcld;
		};

		/// 解析路径，即将所含的库目录替换成实际目录
		stAsynIcld.cPsePath = function (a_Path)
		{
			var l_Idx = a_Path.indexOf(":");
			if (l_Idx < 0)
			{ return a_Path; }

			var l_LibDiry = a_Path.slice(0, l_Idx);
			var l_ActuDiry = e_LibDiryMap[l_LibDiry];
			if (! l_ActuDiry)
			{ throw new Error("库目录“" + l_LibDiry + "”没有注册！"); }

			return fCcat(l_ActuDiry, a_Path.slice(l_Idx + 1));
		};

		/// 来自App
		stAsynIcld.cFromApp = function (a_DftLibDiry, a_LibPaths, a_fCabk)
		{
			a_fCabk = a_fCabk || function (a_Errs) {}; // 回调函数必须存在，若未提供则补充一个空函数
			if (! a_DftLibDiry) // 无效时立即回调
			{
				eCabkTree(a_fCabk, a_fCabk);
				return stAsynIcld;
			}

			// 首次调用，创建队列
			if (! e_FromLibQue)
			{ e_FromLibQue = []; }

			// 构建依赖树
			eBldDpdtTree(a_fCabk, eGnrtDftDiry(a_DftLibDiry), a_LibPaths, a_fCabk);
			return stAsynIcld;
		};

		/// 来自库
		stAsynIcld.cFromLib = function (a_DftLibDiry, a_LibPaths, a_fCabk)
		{
			a_fCabk = a_fCabk || function (a_Errs) {}; // 回调函数必须存在，若未提供则补充一个空函数
			if (! a_DftLibDiry) // 无效时立即回调
			{
				eCabkTree(a_fCabk, a_fCabk);
				return stAsynIcld;
			}

			var l_DftDiry = eGnrtDftDiry(a_DftLibDiry);

			// 需要异步加载的文件名存入这里
			var l_AsynAry = [];
			eIcldByAry(l_AsynAry, l_DftDiry, a_LibPaths);

			// 如果调用过cFromApp则压入实参至队列，否则立即回调
			if (e_FromLibQue)
			{ e_FromLibQue.push({ c_fCabk : a_fCabk, c_AsynAry : (l_AsynAry.length > 0) ? l_AsynAry : null }); }
			else
			{ eCabkTree(null, a_fCabk); }

			return stAsynIcld;
		};

		/// 预载入
		stAsynIcld.cPreLoad = function (a_DftLibDiry, a_LibPaths)
		{
			if (! a_DftLibDiry) // 无效时立即返回
			{ return stAsynIcld; }

			var l_DftDiry = eGnrtDftDiry(a_DftLibDiry);

			var i = 0, l_Len = a_LibPaths ? a_LibPaths.length : 0;
			var l_Path, l_LwrPath, l_Dom_Script, l_Sta;
			for (; i<l_Len; ++i)
			{
				if (! a_LibPaths[i])
				{ continue; }

				// 登记
				l_LwrPath = eGnrtPath(l_DftDiry, fEnsrJs(a_LibPaths[i])).toLowerCase();
				if (! e_CpltRgtr[l_LwrPath])
				{ e_CpltRgtr[l_LwrPath] = { }; }

				e_CpltRgtr[l_LwrPath].c_Sta = 3;	// 完成
			}
			return stAsynIcld;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

	if (i_InNodeJs)
	{
		module.exports = nWse;
	}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////