/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.stVtuCsl)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"DomUtil.js",
			"CssUtil.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("VtuCsl.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 虚拟控制台

	var stVtuCsl;
	(function ()
	{
		/// 虚拟控制台
		stVtuCsl = function () { };
		nWse.stVtuCsl = stVtuCsl;
		stVtuCsl.oc_nHost = nWse;
		stVtuCsl.oc_FullName = nWse.ocBldFullName("stVtuCsl");

		/// 构建全名
		stVtuCsl.ocBldFullName = function (a_Name)
		{
			return stVtuCsl.oc_FullName + "." + a_Name;
		};

		//======== 类型

		nWse.fEnum(stVtuCsl,
		/// 处理模式
		function tHdlMode() {},
		null,
		{
			/// 执行
			i_Excu : 0
			,
			/// 帮助
			i_Help : 1
		});

		//======== 私有字段

		var e_HdlrMap = { };					// 处理器映射
		var e_fOpt = fApdCmdToOptBox;			// 输出函数
		var e_RcdAllIpt = false;				// 记录全部输入？【警告】慎用，会使输出框越来越大！
		var e_DftCmd = null;					// 缺省命令
		var e_UrlHashChg = [];					// URL#变化数组

		//======== 私有函数

		function eExtrIstrFromCmd(a_Cmd, a_WhtSpcIdx)
		{
			var l_WhtSpcIdx = nWse.fIsUdfnOrNull(a_WhtSpcIdx) ? stStrUtil.cFindWhtSpc(a_Cmd) : a_WhtSpcIdx;
			var l_IptIstr = (l_WhtSpcIdx < 0) ? a_Cmd : a_Cmd.substring(0, l_WhtSpcIdx);
			return l_IptIstr;
		}

		function eSkipWhtSpc(a_Obj)
		{
			var l_Agms = a_Obj.c_Agms;
			while ((a_Obj.c_Idx < l_Agms.length) && stStrUtil.cIsWhtSpc(l_Agms, a_Obj.c_Idx))
			{
				++ a_Obj.c_Idx;
			}
		}

		function eExtrNmb(a_Ary, a_Obj)
		{
			// 至第一个空白符为止
			var l_Agms = a_Obj.c_Agms;
			var l_Prm;
			var l_WhtSpcIdx = stStrUtil.cFindWhtSpc(l_Agms, a_Obj.c_Idx);
			if (l_WhtSpcIdx < 0)
			{
				l_Prm = l_Agms.substring(a_Obj.c_Idx);
			}
			else
			{
				l_Prm = l_Agms.substr(a_Obj.c_Idx, l_WhtSpcIdx - a_Obj.c_Idx);
			}

			// 录入，解析成数字
			var l_Num = parseFloat(l_Prm);
			a_Ary.push(l_Num);
			a_Obj.c_Idx += l_Prm.length;
			return true;
		}

		function eExtrStr(a_Ary, a_Obj)
		{
			var l_Agms = a_Obj.c_Agms;
			var l_BgnCC = l_Agms.charCodeAt(a_Obj.c_Idx);
			var l_CC;

			// 跳过开始引号
			++ a_Obj.c_Idx;

			// 已完结？
			if (a_Obj.c_Idx >= l_Agms.length)
			{
				stVtuCsl.cOptLine("字符串参数不完整。");
				return false;
			}

			// 对每个字符
			var l_Bfr = "";
			while (true)
			{
				l_CC = l_Agms.charCodeAt(a_Obj.c_Idx);

				// 遇到结束引号
				if (l_BgnCC == l_CC)
				{
					// 跳过结束引号
					++ a_Obj.c_Idx;
					break;
				}

				// 转义字符：“\\”“\'”“\"”“\t”“\r”“\n”“\\\r\n”
				if (92 == l_CC)	// “\”
				{
					// 跳过“\\”
					++ a_Obj.c_Idx;

					// 已完结？
					if (a_Obj.c_Idx >= l_Agms.length)
					{
						stVtuCsl.cOptLine("字符串参数不完整。");
						return false;
					}

					l_CC = l_Agms.charCodeAt(a_Obj.c_Idx);

					if (92 == l_CC)	// “\”
					{
						l_Bfr += '\\';
					}
					else
					if (39 == l_CC)	// “'”
					{
						l_Bfr += '\'';
					}
					else
					if (34 == l_CC)	// “"”
					{
						l_Bfr += '\"';
					}
					else
					if (116 == l_CC)	// “t”
					{
						l_Bfr += '\t';
					}
					else
					if (114 == l_CC)	// “r”
					{
						l_Bfr += '\r';
					}
					else
					if (110 == l_CC)	// “n”
					{
						l_Bfr += '\n';
					}
					else
					if (10 == l_CC) // “\\\n”
					{
						// 跳过
					}
					else
					if (13 == l_CC) // “\\\r”
					{
						// 跳过

						// 如果下一个是“\n”，一并跳过
						if ((a_Obj.c_Idx + 1 < l_Agms.length) && (10 == l_Agms.charCodeAt(a_Obj.c_Idx + 1)))
						{
							++ a_Obj.c_Idx;
						}
					}
					else // 其他
					{
						stVtuCsl.cOptLine("无效转义字符“\\" + l_Agms.charAt(a_Obj.c_Idx) + "”。");
						return false;
					}
				} // 92
				else // 其他
				{
					// 记录
					l_Bfr += l_Agms.charAt(a_Obj.c_Idx);
				}

				// 下一个
				++ a_Obj.c_Idx;

				// 已完结？
				if (a_Obj.c_Idx >= l_Agms.length)
				{
					stVtuCsl.cOptLine("字符串参数不完整。");
					return false;
				}
			} // while

			// 录入
			a_Ary.push(l_Bfr);
			return true;
		}

		function eExtrLtrl(a_Ary, a_Obj)
		{
			var l_Agms = a_Obj.c_Agms;
			var l_Bgn = a_Obj.c_Idx;

			// 直到第一个空白或结束
			while (a_Obj.c_Idx < l_Agms.length)
			{
				if (stStrUtil.cIsWhtSpc(l_Agms, a_Obj.c_Idx))
				{ break; }

				++ a_Obj.c_Idx;	// 下一个
			}

			// 录入
			var l_Bfr = l_Agms.slice(l_Bgn, a_Obj.c_Idx);
			a_Ary.push(l_Bfr);
			return true;
		}

		function eExtrAgms(a_Ary, a_Prms)
		{
			var l_Obj = { c_Agms : a_Prms, c_Idx : 0 };
			var l_Rst = true;
			var l_CC;

			while (true)
			{
				l_CC = a_Prms.charCodeAt(l_Obj.c_Idx);

				// 如果是数字
				if ((43 == l_CC) ||		// +
					(45 == l_CC) ||		// -
					(46 == l_CC) ||		// .
					stStrUtil.cIsDgt(a_Prms, l_Obj.c_Idx))	// 数字
				{
					l_Rst = eExtrNmb(a_Ary, l_Obj);
					if (! l_Rst)
					{
						return false;
					}
				}
				else // 字符串
				if ((34 == l_CC) ||		// "
					(39 == l_CC))		// '
				{
					l_Rst = eExtrStr(a_Ary, l_Obj);
					if (! l_Rst)
					{
						return false;
					}
				}
				else // 字面值
				{
					l_Rst = eExtrLtrl(a_Ary, l_Obj);
					if (! l_Rst)
					{
						return false;
					}
				}

				// 已完成？
				if (l_Obj.c_Idx >= a_Prms.length)
				{
					break;
				}

				// 现在一定停在空白符处
				if (! stStrUtil.cIsWhtSpc(a_Prms, l_Obj.c_Idx))
				{
					var l_Pa = a_Ary.cGetAmt();
					var l_Pb = l_Pa + 1;
					stVtuCsl.cOptLine("参数" + l_Pa.toString() + "与参数" + l_Pb.toString() + "之间必须以空白符分隔。");
					return false;
				}

				// 跳过空白符
				eSkipWhtSpc(l_Obj);
			} // while

			return true;
		}

		//======== 公有函数

		/// 注册
		/// a_Istr：String，指令，忽略大小写
		/// a_fHdl：Function，void f(tHdlMode a_Mode, String a_Cmd, String[] a_Agms)
		/// a_Udfn$Idx：Number，插入索引，默认最后
		/// 返回：this
		stVtuCsl.cReg = function (a_Istr, a_fHdl, a_Udfn$Idx)
		{
			a_Istr = a_Istr.toLowerCase();

			var l_fHdl$Ary = e_HdlrMap[a_Istr];
			if (l_fHdl$Ary)
			{
				var l_Idx = nWse.fIsUdfnOrNull(a_Udfn$Idx) ? -1 : a_Udfn$Idx;
				if (nWse.fIsAry(l_fHdl$Ary))
				{ nWse.stAryUtil.cIst(l_fHdl$Ary, l_Idx, a_fHdl); }
				else
				{
					if (0 == l_Idx)
					{ e_HdlrMap[a_Istr] = new Array(a_fHdl, l_fHdl$Ary); }
					else
					{ e_HdlrMap[a_Istr] = new Array(l_fHdl$Ary, a_fHdl); }
				}
			}
			else
			{ e_HdlrMap[a_Istr] = a_fHdl; }
			return this;
		};

		/// 注销
		/// a_Istr：String，指令
		/// a_fHdl：为传入cReg的函数，若不提供则注销指定指令的全部处理器
		/// 返回：this
		stVtuCsl.cUrg = function (a_Istr, a_fHdl)
		{
			a_Istr = a_Istr.toLowerCase();

			var l_fHdl$Ary = e_HdlrMap[a_Istr];
			if (! l_fHdl$Ary)
			{ return this; }

			var l_DltPpty = false;
			if (a_fHdl)
			{
				if (nWse.fIsAry(l_fHdl$Ary))
				{
					var l_Idx = l_fHdl$Ary.indexOf(a_fHdl);
					if (l_Idx >= 0)
					{ l_fHdl$Ary.splice(l_Idx, 1); }

					l_DltPpty = (0 == l_fHdl$Ary.length);
				}
				else
				{
					if (l_fHdl$Ary === a_fHdl)
					{ l_DltPpty = true; }
				}
			}
			else
			{ l_DltPpty = true; }

			if (l_DltPpty)
			{ delete e_HdlrMap[a_Istr]; }

			return this;
		};

		/// 是否已注册
		/// 返回：Boolean
		stVtuCsl.cIsReg = function (a_Istr, a_fHdl)
		{
			a_Istr = a_Istr.toLowerCase();

			var l_fHdl$Ary = e_HdlrMap[a_Istr];
			if (! l_fHdl$Ary)
			{ return false; }

			if (! a_fHdl)
			{ return true; }

			if (nWse.fIsAry(l_fHdl$Ary))
			{ return (l_fHdl$Ary.indexOf(a_fHdl) >= 0); }
			else
			{ return (l_fHdl$Ary === a_fHdl); }
		};

		/// 获取处理器
		/// 返回：Function$Array
		stVtuCsl.cGetHdlr = function (a_Istr)
		{ return e_HdlrMap[a_Istr.toLowerCase()]; };

		/// 输入
		/// a_Cmd：String，命令
		stVtuCsl.cIpt = function (a_Cmd)
		{
			// 输出提示符
			if (e_DomOptBox && e_DomOptBox.value)
			{ stVtuCsl.cOptLine(); }
			stVtuCsl.cOptLine("<<");
			stVtuCsl.cOptLine(a_Cmd);
			stVtuCsl.cOptLine(">>");

			// 检查参数
			if ((null == a_Cmd) || (0 == a_Cmd.length))
			{
				stVtuCsl.cOptLine("命令为空。");
				return stVtuCsl;
			}

			// 除去命令两端空白
			var l_Cmd = a_Cmd.trim();
			if (0 == l_Cmd.length)
			{
				stVtuCsl.cOptLine("命令为空。");
				return stVtuCsl;
			}

			// 查找第一个空白符，以此分割指令和参数
			var l_WhtSpcIdx = stStrUtil.cFindWhtSpc(l_Cmd);
			var l_IptIstr = eExtrIstrFromCmd(l_Cmd, l_WhtSpcIdx);
			var l_LwrIstr = l_IptIstr.toLowerCase();

			// 根据指令取得处理函数
			var l_fHdl$Ary = e_HdlrMap[l_LwrIstr];
			if (! l_fHdl$Ary)
			{
				stVtuCsl.cOptLine("未能识别指令“" + l_IptIstr + "”。");
				return stVtuCsl;
			}

			// 取得参数，除去参数前导空白
			var l_Agms = (l_WhtSpcIdx < 0) ? null : l_Cmd.substring(l_WhtSpcIdx + 1).trim();
			var l_AgmAry = [l_IptIstr];

			// 提取参数
			if (l_Agms && (l_Agms.length > 0))
			{
				if (! eExtrAgms(l_AgmAry, l_Agms))
				{ return stVtuCsl; }
			}

			// 处理
			var i;
			if (nWse.fIsAry(l_fHdl$Ary))
			{
				// 结果是主处理器的结果
				for (i=0; i<l_fHdl$Ary.length; ++i)
				{
					l_fHdl$Ary[i](stVtuCsl.tHdlMode.i_Excu, l_Cmd, l_AgmAry);
				}
			}
			else
			{
				l_fHdl$Ary(stVtuCsl.tHdlMode.i_Excu, l_Cmd, l_AgmAry);
			}
			return stVtuCsl;
		};


		/// 输出换行
		/// a_Fdbk：String，回馈
		/// 返回：Boolean
		stVtuCsl.cOptLine = function (a_Fdbk)
		{
			return stVtuCsl.cOpt((a_Fdbk || "").toString() + "\r\n");
		};

		/// 输出
		/// a_Fdbk：String，回馈
		/// 返回：Boolean
		stVtuCsl.cOpt = function (a_Fdbk)
		{
			if (! e_fOpt)
			{ return false; }

			if ("\r\n" == a_Fdbk)
			{ return fOptLine(); }

			a_Fdbk = (a_Fdbk || "").toString();
			if (0 == a_Fdbk.length)
			{ return true; }

			var l_Lines;
			if (stStrUtil.cHasMltLines(a_Fdbk))
			{
				l_Lines = nWse.stStrUtil.cSplToLines(a_Fdbk);
				stAryUtil.cFor(l_Lines, function (a_Ary, a_Idx, a_Line)
				{
					if (a_Idx < a_Ary.length - 1)	// 中间各行最后需要追加换行
					{ fOptLine(a_Line); }
					else
					{ fOpt(a_Line); }
				});
			}
			else
			{
				fOpt(a_Fdbk);
			}

			return true;
		};

		function fOpt(a_Fdbk)
		{
			e_fOpt((a_Fdbk || "").toString());
		}

		function fOptLine(a_Fdbk)
		{
			e_fOpt((a_Fdbk || "").toString() + "\r\n");
		}


		/// 确保参数是字符串
		stVtuCsl.cEnsrAgmIsStr = function (a_Agms, a_Idx, a_Dft)
		{
			a_Agms[a_Idx] = a_Agms[a_Idx] ? a_Agms[a_Idx].toString() : (a_Dft || "").toString();
			return stVtuCsl;
		};

		/// 解析参数成数字，【注意】本函数用于命令处理器
		/// a_Agms：String[]，参数数组
		/// a_Idx：Number，索引，无效时选用a_Dft
		/// a_Dft：Number，当a_Idx无效时选用的默认值，默认0
		/// 返回：Number
		stVtuCsl.cPseAgmToNum = function (a_Agms, a_Idx, a_Dft)
		{
			var l_Rst = a_Dft || 0;
			if ((0 <= a_Idx) && (a_Idx < a_Agms.length))
			{
				l_Rst = a_Agms[a_Idx];
				if (nWse.fIsStr(l_Rst))
				{
					l_Rst = parseFloat(l_Rst);
					if (isNaN(l_Rst))
					{ l_Rst = a_Dft; }
				}
			}
			return l_Rst;
		};


		/// 监视URL#变化
		/// a_Enab：Boolean，启用？
		/// a_DftCmd：String，缺省命令，当URL#为空时输入这条命令
		stVtuCsl.cMonUrlHashChg = function (a_Enab, a_DftCmd)
		{
			function fEnab()
			{
				if (eOnHashChg.Wse_On)
				{ return; }

				window.addEventListener("hashchange", eOnHashChg);
				eOnHashChg.Wse_On = true;
				e_UrlHashChg.length = 0;	// 清零
			}

			function fDsab()
			{
				if (! eOnHashChg.Wse_On)
				{ return; }

				window.removeEventListener("hashchange", eOnHashChg);
				eOnHashChg.Wse_On = false;
				e_UrlHashChg.length = 0;	// 清零
			}

			e_DftCmd = a_DftCmd || "";
			a_Enab ? fEnab() : fDsab();
			return stVtuCsl;
		};

		function eOnHashChg()
		{
		//	console.log("onhashchange : " + window.location.hash);

			// 检查当前的URL#是不是由cSyncUrlHash改变的，是的话不要输入
			var l_Idx;
			if (e_UrlHashChg.length > 0)
			{
				l_Idx = e_UrlHashChg.indexOf(window.location.hash.toLowerCase());
				if (l_Idx >= 0)
				{
					e_UrlHashChg.splice(l_Idx, 1);	// 匹配掉
					return;
				}
			}

			// 输入URL#
			stVtuCsl.cIptUrlHash();
		}

		/// 输入URL#
		/// a_UrlHash：String，默认取window.location.hash
		stVtuCsl.cIptUrlHash = function (a_UrlHash)
		{
			var l_Hash = a_UrlHash || window.location.hash;
			if (! l_Hash)	// 没有时取默认命令
			{ return stVtuCsl.cIpt(e_DftCmd); }

			var l_Ctnt = (35 == l_Hash.charCodeAt(0)) ? l_Hash.slice(1) : l_Hash;
			if (! l_Ctnt)	// 只有“#”时取默认命令
			{ return stVtuCsl.cIpt(e_DftCmd); }

			var l_Cmd = l_Ctnt;
			if (l_Ctnt.indexOf("/") >= 0)
			{ l_Cmd = l_Ctnt.split("/").join(" "); }

			var l_Istr = eExtrIstrFromCmd(l_Cmd);	// 指令无效时取默认命令
			if (! stVtuCsl.cGetHdlr(l_Istr))
			{ return stVtuCsl.cIpt(e_DftCmd); }

			stVtuCsl.cIpt(l_Cmd);	// 处理这条命令
			return stVtuCsl;
		};

		/// 同步URL#
		/// a_Agms：String[]，命令处理器接收到的参数
		stVtuCsl.cSyncUrlHash = function (a_Agms)
		{
			var l_Ctnt, l_Hash;
			if ((! a_Agms) || (0 == a_Agms.length))
			{
				l_Ctnt = "";
				l_Hash = "";
			}
			else
			{
				l_Ctnt = a_Agms.join("/");
				l_Hash = "#" + l_Ctnt;
			}

			// 如果有历史API
			var l_LwrHash = l_Hash.toLowerCase();	// 总是用小写
			if (window.history.replaceState)
			{
				window.history.replaceState(null, null, l_LwrHash);
				return stVtuCsl;
			}

			// 压入新的URL#，这种方案的缺点是后退按钮没有尽头！
			var l_CrntHash = (e_UrlHashChg.length > 0) ? e_UrlHashChg[e_UrlHashChg.length - 1] : window.location.hash;
			if (l_CrntHash.toLowerCase() != l_LwrHash)
			{
				e_UrlHashChg.push(l_LwrHash);
				window.location.hash = l_Hash;
			}
			return stVtuCsl;
		};


		//===================================================== UI

		// 字段
		var e_DomPane = null, e_DomTib = null, e_DomCptn = null, e_DomClsBtn = null,
			e_DomOptDiv = null, e_DomIptDiv = null, e_DomOptBox = null, e_DomIptBox = null, e_DomSbmtBtn = null;
		var e_PaneId = "ok_VtuCsl";
		var e_PaneWid = 0, e_PaneHgt = 0, e_TibHgt = 32, e_BdrWid = 2, e_BtnPad = 2;
		var e_IoBoxPad = 4, e_IoBoxBdr = 1, e_IoDivHgt = 0, e_IoLineHgt = 20;
		var e_Dragging = false, e_DragX = 0, e_DragY = 0;
		var e_ClsBtnText = "╳";
		var e_DftWid = 520, e_DftHgt = 460, e_MinWid = 360, e_MinHgt = 300;
		fCalcDim(e_DftWid, e_DftHgt);	// 初始值

		function fCalcDim(a_PaneWid, a_PaneHgt)
		{
			if (a_PaneWid <= e_MinWid) { a_PaneWid = e_MinWid; }
			if (a_PaneHgt <= e_MinHgt) { a_PaneHgt = e_MinHgt; }

			e_PaneWid = a_PaneWid;
			e_PaneHgt = a_PaneHgt + e_TibHgt * 2;
			e_IoDivHgt = a_PaneHgt / 2 - e_IoBoxBdr;
		}

		function fIsUiShow()
		{
			return !! (e_DomPane && e_DomPane.parentElement);
		}

		function fStopDrag()
		{
			if (! e_Dragging)
			{ return; }

			e_Dragging = false;
		//	console.log("false");

			// 拖动结束，恢复焦点给输入框
			if (e_DomIptBox)
			{ e_DomIptBox.focus(); }
		}

		function fSetPanePos(a_X, a_Y)
		{
			if (! e_DomPane)
			{ return; }

			var l_TotBdrWid = e_BdrWid * 2;
			if (e_PaneWid + l_TotBdrWid < window.innerWidth)
			{
				if (nWse.fIsUdfnOrNull(a_X)) { a_X = parseFloat(e_DomPane.style.left); }
				a_X = stNumUtil.cClmOnNum(a_X, 0, window.innerWidth - e_PaneWid - l_TotBdrWid);
			}
			else
			{
				a_X = 0;
			}

			if (e_TibHgt + l_TotBdrWid < window.innerHeight)
			{
				if (nWse.fIsUdfnOrNull(a_Y)) { a_Y = parseFloat(e_DomPane.style.top); }
				a_Y = stNumUtil.cClmOnNum(a_Y, 0, window.innerHeight - e_TibHgt - e_BdrWid);
			}
			else
			{
				a_Y = 0;
			}

			stCssUtil.cSetPos(e_DomPane, a_X, a_Y);
		}

		function fInitOptTextArea(a_Dom)
		{
			fInitDomElmt(a_Dom);
			a_Dom.style.backgroundColor = "black";
			a_Dom.style.color = "white";
			a_Dom.style.fontSize = "16px";
			a_Dom.style.lineHeight = "20px";
			a_Dom.style.fontFamily = "宋体";
		}

		function fCrtTextArea(a_Dom_Div, a_ReadOnly)
		{
			var l_Dom_Ta = document.createElement("textarea");
			fInitOptTextArea(l_Dom_Ta);
			stCssUtil.cSetPad(l_Dom_Ta, e_IoBoxPad, e_IoBoxPad);
			l_Dom_Ta.readOnly = !! a_ReadOnly;

			a_Dom_Div.appendChild(l_Dom_Ta);
			return l_Dom_Ta;
		}

		function fApdCmdToOptBox(a_Cmd)
		{
			if (! e_DomOptBox)
			{ return true; }

			if ((! e_RcdAllIpt) && (! fIsUiShow()))
			{ return true; }

			// 追加命令
			e_DomOptBox.value += a_Cmd;

			// 滚动到底部
			fScrlToBtm();
			return true;
		}

		function fScrlToBtm()
		{
			var l_LineAmt = nWse.stStrUtil.cGetLineAmt(e_DomOptBox.value);
			var l_TotHgt = l_LineAmt * e_IoLineHgt;
			if (l_TotHgt > e_DomOptBox.clientHeight)
			{
				var l_ShowCpct = Math.floor(e_DomOptBox.clientHeight / e_IoLineHgt);
				e_DomOptBox.scrollTop = Math.max(0, l_TotHgt - (l_ShowCpct) * e_IoLineHgt);
			}
		}

		function fSbmtCmd()
		{
			// 取得命令并剪切到输出框
			var l_Cmd = e_DomIptBox.value;
			e_DomIptBox.value = "";

			// 提交
			stVtuCsl.cIpt(l_Cmd);

			// 一次提交结束后输出空行，
			// 除非指令是“clr”，此时输出框为空
			if (e_DomOptBox.childNodes.length > 0)
			{
				stVtuCsl.cOptLine();
			}
		}

		function fInitDomElmt(a_Dom)
		{
			stCssUtil.cZeroMbp(a_Dom);
			a_Dom.style.boxSizing = "content-box";
		}

		function fSetPosDim()
		{
			if (! e_DomPane)
			{ return; }

			stCssUtil.cSetDim(e_DomPane, e_PaneWid, e_PaneHgt);
			stCssUtil.cSetDim(e_DomTib, "100%", e_TibHgt);
			stCssUtil.cSetDim(e_DomClsBtn, e_TibHgt - e_BtnPad * 2, e_TibHgt - e_BtnPad * 2);
			stCssUtil.cSetPos(e_DomClsBtn, e_PaneWid - e_TibHgt + e_BtnPad, e_BtnPad);
			stCssUtil.cSetDim(e_DomOptDiv, "auto", e_IoDivHgt);
			stCssUtil.cSetDim(e_DomIptDiv, "auto", e_IoDivHgt);
			stCssUtil.cSetDim(e_DomOptBox, e_PaneWid - e_IoBoxPad * 2, e_IoDivHgt - e_IoBoxPad * 2);
			stCssUtil.cSetDim(e_DomIptBox, e_PaneWid - e_IoBoxPad * 2, e_IoDivHgt - e_IoBoxPad * 2);
			stCssUtil.cSetDim(e_DomSbmtBtn, "100%", e_TibHgt);
		}

		function fInitUi()
		{
			//-------- 窗格

			e_DomPane = document.createElement("div");
			e_DomPane.id = e_PaneId;
			fInitDomElmt(e_DomPane);

			e_DomPane.style.position = "fixed";
			e_DomPane.style.overflow = "hidden";
			e_DomPane.style.backgroundColor = "rgb(0, 0, 0)";
			e_DomPane.style.borderStyle = "solid";
			e_DomPane.style.borderColor = "rgb(255, 0, 255)";
			e_DomPane.style.zIndex = "2147483647";	// 7FFFFFFF
			stCssUtil.cSetBdrWid(e_DomPane, e_BdrWid);

			var l_BbWid = e_BdrWid + e_BtnPad;
			fSetPanePos(window.innerWidth - e_PaneWid - l_BbWid,
					window.innerHeight - e_PaneHgt - l_BbWid);	// 右下角

			//-------- 标题栏

			e_DomTib = document.createElement("div");
			fInitDomElmt(e_DomTib);
			e_DomTib.style.cursor = "move";
			e_DomTib.style.backgroundColor = "rgb(0, 128, 255)";

			// 当拖动标题栏时追踪鼠标
			// 注意鼠标移动消息注册到文档上，为了及时追踪
			e_DomTib.addEventListener("mousedown",
				function (a_Evt)
				{
					if ((e_DomTib !== a_Evt.target) && (e_DomCptn !== a_Evt.target))
					{ return; }

					e_Dragging = true;
					e_DragX = a_Evt.screenX - e_DomPane.offsetLeft;
					e_DragY = a_Evt.screenY - e_DomPane.offsetTop;
					//	console.log("true");
				});

			e_DomTib.addEventListener("mouseup", fStopDrag);
			e_DomTib.addEventListener("focus", fStopDrag);
			e_DomTib.addEventListener("blur", fStopDrag);

			document.addEventListener("mousemove",
				function (a_Evt)
				{
					if (e_Dragging)
					{
						fSetPanePos(a_Evt.screenX - e_DragX, a_Evt.screenY - e_DragY);
						a_Evt.preventDefault();
						a_Evt.stopPropagation();
					}
				});

			// 为标题栏添加标题
			e_DomCptn = document.createElement("div");
			fInitDomElmt(e_DomCptn);
			e_DomCptn.style.cursor = "move";
			e_DomCptn.style.color = "white";
			e_DomCptn.style.display = "inline-block";
			e_DomCptn.style.fontSize = "16px";
			stCssUtil.cSetPad(e_DomCptn, 8);
			e_DomCptn.textContent = "虚拟控制台";
			e_DomTib.appendChild(e_DomCptn);

			// 为标题栏添加按钮
			e_DomClsBtn = document.createElement("button");
			fInitDomElmt(e_DomClsBtn);
			e_DomClsBtn.style.position = "absolute";
			e_DomClsBtn.style.backgroundColor = "rgb(255, 255, 255)";

			e_DomClsBtn.style.fontFamily = "宋体";
			e_DomClsBtn.style.fontSize = "20px";
			e_DomClsBtn.textContent = e_ClsBtnText;

			e_DomClsBtn.addEventListener("click", function (a_Evt) { stVtuCsl.cShowHideUi(false); });

			e_DomTib.appendChild(e_DomClsBtn);

			// 加入窗格
			e_DomPane.appendChild(e_DomTib);

			//-------- 输出框

			e_DomOptDiv = document.createElement("div");
			fInitDomElmt(e_DomOptDiv);
			stCssUtil.cSetBdrWid(e_DomOptDiv, 0, 0, e_IoBoxBdr, 0);
			e_DomOptDiv.style.borderStyle = "solid";
			e_DomOptDiv.style.borderColor = "rgb(0, 192, 0)";
			e_DomOptDiv.style.overflow = "hidden";

			e_DomOptBox = fCrtTextArea(e_DomOptDiv, true);

			// 加入窗格
			e_DomPane.appendChild(e_DomOptDiv);

			//-------- 输入框

			e_DomIptDiv = document.createElement("div");
			fInitDomElmt(e_DomIptDiv);
			stCssUtil.cSetBdrWid(e_DomIptDiv, e_IoBoxBdr, 0, 0, 0);
			e_DomIptDiv.style.borderStyle = "solid";
			e_DomIptDiv.style.borderColor = e_DomOptDiv.style.borderColor;
			e_DomIptDiv.style.overflow = "hidden";

			e_DomIptBox = fCrtTextArea(e_DomIptDiv);

			e_DomIptBox.onkeydown = function (a_Evt)
			{
				// ctrl + 回车
				if ((13 == a_Evt.keyCode) && a_Evt.ctrlKey)
				{
					// 阻止默认行为和继续传播
					a_Evt.preventDefault();
					a_Evt.stopPropagation();

					// 提交命令
					fSbmtCmd();
				}
			};

			// 加入窗格
			e_DomPane.appendChild(e_DomIptDiv);

			//-------- 提交按钮

			e_DomSbmtBtn = document.createElement("button");
			fInitDomElmt(e_DomSbmtBtn);
			e_DomSbmtBtn.style.backgroundColor = "rgb(0, 128, 255)";
			e_DomSbmtBtn.style.color = "white";
			e_DomSbmtBtn.style.fontFamily = "宋体";
			e_DomSbmtBtn.style.fontSize = "16px";
			e_DomSbmtBtn.textContent = "提 交";

			e_DomSbmtBtn.onclick = function (a_Evt)
			{
				// 提交命令
				fSbmtCmd();
			};

			// 设置位置尺寸
			fSetPosDim();

			// 加入窗格
			e_DomPane.appendChild(e_DomSbmtBtn);
		}

		/// 用户界面快捷键
		stVtuCsl.cHotKeyUi = function (a_Enab)
		{
			document.removeEventListener("keydown", fOnKeyDown);	// 先尝试移除
			if (a_Enab)	// 如果需要，再添加
			{ document.addEventListener("keydown", fOnKeyDown); }
		};

		function fOnKeyDown(a_Evt)
		{
			if (113 == a_Evt.keyCode)	// F2
			{
				a_Evt.preventDefault();
				a_Evt.stopPropagation();
				stVtuCsl.cShowHideUi(! fIsUiShow());	// 切换
			}
		}

		/// 显示隐藏用户界面
		/// a_Show：Boolean，true=展示，false=隐藏
		/// 返回：this
		stVtuCsl.cShowHideUi = function (a_Show)
		{
			// 如果尚未初始化
			if (! e_DomPane)
			{
				if (! a_Show)
				{ return this; }

				fInitUi();
			}

			function fHide()
			{
				if (! fIsUiShow())
				{ return; }

				// 从文档移除
				var l_Dom_body = document.getElementsByTagName("body")[0];
				l_Dom_body.removeChild(e_DomPane);
			}

			function fShow()
			{
				var l_Dom_body;
				if (! fIsUiShow())
				{
					// 加入到文档
					l_Dom_body = document.getElementsByTagName("body")[0];
					l_Dom_body.appendChild(e_DomPane);

					// 滚动到底部
					fScrlToBtm();
				}

				// 校准位置，令输入框成为焦点
				fSetPanePos();
				e_DomIptBox.focus();
			}

			a_Show ? fShow() : fHide();
		};

		//-------- 内建命令

		(function ()
		{
			stVtuCsl.cReg("clr", function (a_Mode, a_Cmd, a_Agms, a_Rst)
			{
				if (stVtuCsl.tHdlMode.i_Help == a_Mode)
				{
					stVtuCsl.cOptLine(a_Agms[0] + " —— 功能：本界面清屏。");
					return;
				}

				// 仅当显示GUI时有效
				if (! fIsUiShow())
				{ return; }

				e_DomOptBox.value = "";
			});

			stVtuCsl.cReg("help", function (a_Mode, a_Cmd, a_Agms)
			{
				if (stVtuCsl.tHdlMode.i_Help == a_Mode)
				{
					stVtuCsl.cOptLine(a_Agms[0] + " —— 功能：显示指定的或全部已注册的指令及其用法；"
						+ "\n参数："
						+ "\nString，指令名，若不提供则列出全部。");
					return;
				}

				if (a_Agms.length > 1)
				{
					var l_LwrIstr = a_Agms[1] && a_Agms[1].toLowerCase();
					var l_fHdl = l_LwrIstr ? e_HdlrMap[l_LwrIstr] : null;
					if (l_fHdl)
					{ l_fHdl(stVtuCsl.tHdlMode.i_Help, null, [l_LwrIstr]); }
					else
					{ stVtuCsl.cOptLine("未能找到指令“" + a_Agms[1] + "”。"); }
				}
				else
				{
					// 以字母顺序通知其他处理器显示帮助信息
					var l_Istr, l_IstrAry = [];
					for (l_Istr in e_HdlrMap)
					{ l_IstrAry.push([l_Istr]); }

					l_IstrAry.sort();

					var l_Agms = [null];
					stAryUtil.cFor(l_IstrAry, function (a_Ary, a_Idx, a_Istr)
					{
						l_Agms[0] = a_Istr;
						e_HdlrMap[a_Istr](stVtuCsl.tHdlMode.i_Help, null, l_Agms);
					});
				}
			});

			stVtuCsl.cReg("dim", function (a_Mode, a_Cmd, a_Agms)
			{
				if (stVtuCsl.tHdlMode.i_Help == a_Mode)
				{
					stVtuCsl.cOptLine(a_Agms[0] + " —— 功能：设置本界面宽高；"
						+ "\n参数："
						+ "\nNumber，宽度，若不提供则使用默认值；"
						+ "\nNumber，高度，若不提供则使用默认值。");
					return;
				}

				// 仅当显示GUI时有效
				if (! fIsUiShow())
				{ return; }

				var l_Wid = stVtuCsl.cPseAgmToNum(a_Agms, 1, e_DftWid);
				var l_Hgt = stVtuCsl.cPseAgmToNum(a_Agms, 2, e_DftHgt);
				fCalcDim(l_Wid, l_Hgt);
				fSetPosDim();
				fSetPanePos();
				stVtuCsl.cOptLine("OK!");
			});
		})();	// 内建命令
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////