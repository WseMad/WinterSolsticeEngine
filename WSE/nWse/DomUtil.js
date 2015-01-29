﻿/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.stDomUtil)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"(3)CoreDast.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("DomUtil.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var unKnl = nWse.unKnl;
	var stAryUtil = nWse.stAryUtil;
	var stNumUtil = nWse.stNumUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// DOM实用静态类

	var stDomUtil;
	(function ()
	{
		/// DOM实用
		stDomUtil = function () { };
		nWse.stDomUtil = stDomUtil;
		stDomUtil.onHost = nWse;
		stDomUtil.oc_FullTpnm = nWse.ocBldFullName("stDomUtil");

		/// 构建全名
		stDomUtil.ocBldFullName = function (a_Name)
		{
			return stDomUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 私有字段

		// <body>
		var e_Dom_Body = null;

		// 动画
		var e_fRAF = l_Glb.requestAnimationFrame ||
					l_Glb.webkitRequestAnimationFrame ||
					l_Glb.mozRequestAnimationFrame ||
					l_Glb.oRequestAnimationFrame ||
					l_Glb.msRequestAnimationFrame ||
					function (a_fCabk) { l_Glb.setTimeout(a_fCabk, 15); };
		var e_IsuRAF = false;
		var e_AnmtLockAry = null;

		//======== 私有函数

		function fAddWndEvtHdlr(a_Evt, a_fCabk, a_Dly)
		{
			var l_STID = null;
			a_fCabk.Wse_fOn = function()
			{
				if (! l_STID)
				{
					l_STID = setTimeout(function ()
					{
						a_fCabk();
						l_STID = null;
					}, a_Dly * 1000);
				}
			};

			stDomUtil.cAddEvtHdlr(window, a_Evt, a_fCabk.Wse_fOn);
		}

		function fRmvWndEvtHdlr(a_Evt, a_fCabk)
		{
			stDomUtil.cRmvEvtHdlr(window, a_Evt, a_fCabk.Wse_fOn);
		}

		function eGetTimeNow()
		{
			return Date.now() / 1000;
		}

		function eRsetAnmtTime(a_Anmt)
		{
			a_Anmt.c_LastTime = eGetTimeNow();
			a_Anmt.c_FrmTime = 0;
			a_Anmt.c_FrmItvl = 0;
			a_Anmt.c_FrmNum = 0;
			a_Anmt.c_Pau = false;
		}

		function eOneAnmtFrm()
		{
			// 遍历
			e_AnmtLockAry.cFor();

			// 如果已空
			if (e_AnmtLockAry.cIsEmt())
			{
				e_IsuRAF = false;		// 不再发出
			}
			else // 还有动画
			{
				e_fRAF(eOneAnmtFrm);	// 继续下一帧
			}
		}

		// 确保动画函数
		stDomUtil.eEnsrAnmtFctn_Shr = function (a_CssUtil, a_DomElmt, a_fGnrt)
		{
			var l_Util = a_CssUtil ? "Wse_CssUtil" : "Wse_DomUtil";
			if ((! a_DomElmt[l_Util]) || (! a_DomElmt[l_Util].c_fAnmt))
			{
				if (! a_DomElmt[l_Util])
				{ a_DomElmt[l_Util] = {}; }

				a_DomElmt[l_Util].c_fAnmt = a_fGnrt(a_DomElmt);
			}
		};

		// 跳到动画最后
		function eJumpToAnmtEnd(a_DomElmt, a_Rvs)
		{
			stDomUtil.eJumpToAnmtEnd_Shr(false, a_DomElmt, a_Rvs,
				function (a_DomElmt, a_PN, a_Item)
				{
					var l_PV = a_Rvs ? a_Item.c_Bgn : a_Item.c_End;
					eAsnAnmtVal(a_DomElmt, a_PN, l_PV);
				});
		}

		stDomUtil.eJumpToAnmtEnd_Shr = function (a_CssUtil, a_DomElmt, a_Rvs, a_fAsn)
		{
			var l_Bkpn = a_CssUtil ? a_DomElmt.Wse_CssUtil : a_DomElmt.Wse_DomUtil;
			var l_fAnmt = l_Bkpn.c_fAnmt;
			var l_PN, l_Item;
			for (l_PN in l_fAnmt.Wse_Items)
			{
				l_Item = l_fAnmt.Wse_Items[l_PN];
				a_fAsn(a_DomElmt, l_PN, l_Item);
			}
		};

		function eAsnAnmtVal(a_DomElmt, a_PN, a_Val)
		{
			// 特殊处理window.scrollX，window.scrollY
			if (a_DomElmt === window)
			{
				if ("scrollX" == a_PN)
				{
					window.scrollTo(a_Val, stDomUtil.cGetScrlY());
					return;
				}
				else
				if ("scrollY" == a_PN)
				{
					window.scrollTo(stDomUtil.cGetScrlX(), a_Val);
					return;
				}
			}

			a_DomElmt[a_PN] = a_Val;
		}

		function eGnrtAnmtFctn(a_DomElmt)
		{
			return stDomUtil.eGnrtAnmtFctn_Shr(false, a_DomElmt, null,
				function (a_DomElmt, a_fAnmt, a_PN, a_Bgn, a_End,
						  a_Cfg, a_Item, a_Ifnt, a_Rvs, a_Cnt, a_Dur, a_NmlScl, a_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum)
				{
					var l_V = stNumUtil.cLnrItp(a_Bgn, a_End, a_EsnScl);
					eAsnAnmtVal(a_DomElmt, a_PN, l_V);
				},
				null, eJumpToAnmtEnd, stDomUtil.cFnshAnmtPpty);
		}

		stDomUtil.eGnrtAnmtFctn_Shr = function (a_CssUtil, a_DomElmt, a_fSpclBef, a_fItp, a_fSpclAft, a_fJump, a_fFnsh)
		{
			return function fDomElmtAnmt(a_FrmTime, a_FrmItvl, a_FrmNum)
			{
				var l_Bkpn = a_CssUtil ? a_DomElmt.Wse_CssUtil : a_DomElmt.Wse_DomUtil;
				var l_fAnmt = l_Bkpn.c_fAnmt;
				var l_Cfg = l_fAnmt.Wse_Cfg;
				var l_Ifnt = l_Cfg.c_Dur && (l_Cfg.c_Dur < 0);
				var l_Loop = l_Ifnt ? false : (l_Cfg.c_Tot && (l_Cfg.c_Tot < 0));
				var l_Cnt = l_Ifnt ? 0 : l_fAnmt.Wse_Cnt;
				var l_Dur = l_Ifnt ? 0 : (l_Cfg.c_Dur || 1);
				var l_Tot = (l_Ifnt || l_Loop) ? 0 : (l_Cfg.c_Tot || 1);
				var l_NmlScl = l_Ifnt ? 0 : (a_FrmTime / l_Dur);
				var l_EsnScl = l_Ifnt ? 0 : (l_Cfg.c_fEsn ? l_Cfg.c_fEsn(l_NmlScl) : l_NmlScl);
				var l_Ctnu = l_Ifnt || (a_FrmTime < l_Dur);

				//var l_X, l_Y;
				//if (a_CssUtil)
				//{
				//	l_X = l_fAnmt.Wse_Sp.x;
				//	l_Y = l_fAnmt.Wse_Sp.y;
				//}
				if (a_CssUtil)
				{
					a_fSpclBef(a_DomElmt, l_fAnmt);
				}

				var l_EvenCnt = (0 == l_Cnt % 2);
				var l_Rvs = (l_Loop || (l_Tot > 1)) && l_EvenCnt && (l_Cfg.c_EvenCntRvs || false);
				var l_Bgn, l_End;

				var l_PN, l_Item;//, l_V, l_M;
				if (l_Ctnu) // 继续，考虑无限，不算循环
				{
					// 对每个项
					for (l_PN in l_fAnmt.Wse_Items)
					{
						l_Item = l_fAnmt.Wse_Items[l_PN];
						if (l_Rvs)	// 需要反转始终值
						{
							l_Bgn = l_Item.c_End;
							l_End = l_Item.c_Bgn;
						}
						else
						{
							l_Bgn = l_Item.c_Bgn;
							l_End = l_Item.c_End;
						}

						//if (eIsWse_Css_TypeIdx(l_Item.c_TypeIdx))	// 冬至引擎扩展CSS
						//{
						//	eAnmtWse_CssExtd(a_DomElmt, l_Cfg, l_Item, l_Ifnt, l_Rvs, l_Cnt, l_Dur, l_NmlScl, l_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
						//}
						//else
						//if (6 == l_Item.c_TypeIdx)	// 颜色
						//{
						//	l_V = tClo.scLnrItp(s_TempClo0, l_Bgn, l_End, l_EsnScl);
						//	a_DomElmt.style[l_PN] = tClo.scToCssCloStr(l_V);
						//}
						//else // 其他
						//{
						//	l_V = l_M = stNumUtil.cLnrItp(l_Bgn, l_End, l_EsnScl);
						//	if ((2 == l_Item.c_TypeIdx) || (3 == l_Item.c_TypeIdx)) // 像素和百分比的中间过程皆用像素
						//	{ l_V = l_V.toString() + "px"; }
						//	a_DomElmt.style[l_PN] = l_V.toString();
						//
						//	// 如果有left和/或top，更新当前值
						//	if (l_fAnmt.Wse_HasLeft && ("left" == l_PN))
						//	{ l_X = l_M; }
						//	else
						//	if (l_fAnmt.Wse_HasTop && ("top" == l_PN))
						//	{ l_Y = l_M; }
						//}
						a_fItp(a_DomElmt, l_fAnmt, l_PN, l_Bgn, l_End,
							l_Cfg, l_Item, l_Ifnt, l_Rvs, l_Cnt, l_Dur, l_NmlScl, l_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
					}

					if (a_CssUtil)
					{
						a_fSpclAft(a_DomElmt, l_fAnmt, l_Cfg, l_Item, l_Ifnt, l_Rvs, l_Cnt, l_Dur, l_NmlScl, l_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
					}
					//// 专门处理left和top
					//if (l_fAnmt.Wse_HasDplc)
					//{
					//	l_fAnmt.Wse_Pos.x = l_X;	// 从当前位置开始
					//	l_fAnmt.Wse_Pos.y = l_Y;
					//	if (l_Cfg.c_fDplc)			// 可以被c_fDplc改写
					//	{
					//		l_Cfg.c_fDplc(l_fAnmt.Wse_Pos, a_DomElmt,
					//			(l_Rvs ? l_fAnmt.Wse_Tp : l_fAnmt.Wse_Sp),
					//			(l_Rvs ? l_fAnmt.Wse_Sp : l_fAnmt.Wse_Tp),
					//			l_NmlScl, l_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
					//	}
					//
					//	a_DomElmt.style["left"] = l_fAnmt.Wse_Pos.x.toString() + "px";
					//	a_DomElmt.style["top"]  = l_fAnmt.Wse_Pos.y.toString() + "px";
					//}

					// 更新回调
					if (l_Cfg.c_fOnUpd)
					{
						l_Cfg.c_fOnUpd(a_DomElmt, l_NmlScl, l_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
					}
				}
				else // 循环，或未达播放总数
				if (l_Loop || ((1 < l_Tot) && (l_Cnt < l_Tot)))
				{
				//	eJumpToAnmtEnd(a_DomElmt, l_Rvs);			// 跳到最后
					a_fJump(a_DomElmt, l_Rvs);					// 跳到最后
					stDomUtil.cRegAnmtOrRsetAnmtTime(l_fAnmt);	// 重置动画时间
					++ l_fAnmt.Wse_Cnt;							// 递增一次计数
				}
				else // 结束
				{
				//	stCssUtil.cFnshAnmt(a_DomElmt, true, true, l_Rvs);	// 结束动画
					a_fFnsh(a_DomElmt, true, true, l_Rvs);	// 结束动画
				}
			};
		};

		//======== 公有函数

		/// 获取视口宽度
		stDomUtil.cGetVwptWid = function ()
		{
			return window.innerWidth || document.documentElement.clientWidth;
		};

		/// 获取视口高度
		stDomUtil.cGetVwptHgt = function ()
		{
			return window.innerHeight || document.documentElement.clientHeight;
		};

		/// 获取滚动X坐标
		stDomUtil.cGetScrlX = function ()
		{
			return (document.documentElement.scrollLeft || 0) + (document.body.scrollLeft || 0);
		};

		/// 获取滚动Y坐标
		stDomUtil.cGetScrlY = function ()
		{
			return (document.documentElement.scrollTop || 0) + (document.body.scrollTop || 0);
		};

		/// 存取<body>
		stDomUtil.cAcsBody = function ()
		{
			if (! e_Dom_Body)
			{ e_Dom_Body = document.getElementsByTagName("body")[0]; }
			return e_Dom_Body;
		};

		/// 存取3D<body>
		stDomUtil.cAcs3dBody = function ()
		{
			return document.getElementById("ok_3dBody");
		};

		/// 获取文档宽度
		stDomUtil.cGetDocWid = function ()
		{
			return Math.max(document.documentElement.scrollWidth, document.documentElement.clientWidth);
		};

		/// 获取文档高度
		stDomUtil.cGetDocHgt = function ()
		{
			return Math.max(document.documentElement.scrollHeight, document.documentElement.clientHeight);
		};

		/// 转储成数组
		/// a_NodeList：NodeList，节点列表
		stDomUtil.cDumpToAry = function (a_NodeList)
		{
			if ((! a_NodeList) || (0 == a_NodeList.length))
			{ return []; }

			var l_Rst, i, l_Len;
			if (nWse.fMaybeNonHtml5Brsr()) // IE8不允许使用数组方法拷贝NodeList
			{
				l_Len = a_NodeList.length;
				l_Rst = new Array(l_Len);
				for (i = 0; i<l_Len; ++i)
				{ l_Rst[i] = a_NodeList[i]; }
			}
			else
			{
				l_Rst = Array.prototype.slice.call(a_NodeList);
			}
			return l_Rst;
		};

		/// 根据CSS类获取元素
		/// 返回：Array
		stDomUtil.cGetElmtsByCssc = function (a_Cssc)
		{
			return document.getElementsByClassName
				? stDomUtil.cDumpToAry(document.getElementsByClassName(a_Cssc))
				: stDomUtil.cQryAll("." + a_Cssc);
		};

		/// 得到一个，首先获取，若没有则新建
		/// a_Slc：String，选择器，默认为："#" + a_Id，若与a_Id同时为空则总是新建
		/// a_Tag：String，标记，新建时使用，必须有效
		/// a_Id：String，元素ID，若与a_Slc同时为空则总是新建
		/// a_Cssc：String，CSS类，新建时使用，可以为空
		/// a_Prn：Node，父节点，新建时使用，可以为空
		/// 返回：Node，仅当Boolean Wse_DomUtil.c_New字段为true时表示新建（未必存在相关字段）
		stDomUtil.cObtnOne = function (a_Slc, a_Tag, a_Id, a_Cssc, a_Prn)
		{
			a_Tag = a_Tag.toLowerCase(); // 这里应是小写
			var l_Rst = (a_Slc || a_Id) && stDomUtil.cQryOne(a_Slc || ("#" + a_Id));
			if (! l_Rst)
			{
				l_Rst = document.createElement(a_Tag);
				l_Rst.Wse_DomUtil = { c_New : true };	// 新建
				if (a_Id)	{ l_Rst.id = a_Id; }
				if (a_Cssc)	{ l_Rst.className = a_Cssc; }
				if (a_Prn)	{ a_Prn.appendChild(l_Rst); }
			}
			return l_Rst;
		};

		/// 查询一个
		/// a_Slc：String，选择器
		/// a_Root：Node，查询的根节点，返回的元素为其后代，默认undefined
		/// a_PrnOnly：Boolean，只考虑a_Root作为父节点的情况，默认false
		/// 返回：Node，不存在时返回null
		stDomUtil.cQryOne = function (a_Slc, a_Root, a_PrnOnly)
		{
			var l_Rst;
			if (a_Root) // 如果提供了根，先把所有元素都找出，再选第一个
			{
				l_Rst = stDomUtil.cQryAll(a_Slc, a_Root, a_PrnOnly);
				return (l_Rst.length > 0) ? l_Rst[0] : null;
			}

			if (! document.querySelector)
			{
				if (l_Glb.jQuery)
				{ l_Rst = l_Glb.jQuery(a_Slc); }

				l_Rst = (l_Rst && (l_Rst.length > 0)) ? l_Rst.get(0) : null;
			}
			else
			{
				l_Rst = document.querySelector(a_Slc);
			}
			return l_Rst;
		};

		/// 查询全部
		/// a_Slc：String，选择器
		/// a_Root：Node，查询的根节点，返回的元素为其后代，默认undefined
		/// a_PrnOnly：Boolean，只考虑a_Root作为父节点的情况，默认false
		/// 返回：Node[]，不存在时返回空数组
		stDomUtil.cQryAll = function (a_Slc, a_Root, a_PrnOnly)
		{
			var l_Rst;
			if (! document.querySelectorAll)
			{
				if (l_Glb.jQuery)
				{ l_Rst = l_Glb.jQuery(a_Slc); }

				l_Rst = (l_Rst && (l_Rst.length > 0)) ? l_Rst.get() : [];
			}
			else
			{
				l_Rst = stDomUtil.cDumpToAry(document.querySelectorAll(a_Slc));
			}
			
			if (a_Root)
			{
				stAryUtil.cErsAll(l_Rst,
				function (a_Ary, a_Idx, a_DomElmt)
				{ return a_PrnOnly ? (a_Root !== a_DomElmt.parentNode) : (! stDomUtil.cIsAcst(a_Root, a_DomElmt)); });
			}
			return l_Rst;
		};

		/// 获取全部子节点
		stDomUtil.cGetAllChds = function (a_DomPrn)
		{
			return stDomUtil.cDumpToAry(a_DomPrn.childNodes);
		};

		/// 获取全部元素子节点
		stDomUtil.cGetAllElmtChds = function (a_DomPrn)
		{
			var l_Rst = [];
			var l_Nl = a_DomPrn.childNodes, n = 0, l_Len = l_Nl.length;
			for (; n<l_Len; ++n)
			{
				if ((1 == l_Nl[n].nodeType))
				{ l_Rst.push(l_Nl[n]); }
			}
			return l_Rst;
		};

		/// 获取指定标记的子元素数量
		stDomUtil.cGetChdAmtOfTag = function (a_DomPrn, a_Tag)
		{
			a_Tag = a_Tag.toUpperCase();	// 这里应是大写
			var l_Rst = 0;
			var l_Nl = a_DomPrn && a_DomPrn.childNodes, n = 0, l_Len = l_Nl ? l_Nl.length : 0;
			for (; n<l_Len; ++n)
			{
				if ((1 == l_Nl[n].nodeType) && (l_Nl[n].tagName == a_Tag))
				{
					++ l_Rst;
				}
			}
			return l_Rst;
		};

		/// 获取指定标记的子元素
		/// a_Idx：Number，索引，若有效则返回指定的子节点
		/// 返回：HTMLElement$HTMLElement[]
		stDomUtil.cGetChdsOfTag = function (a_DomPrn, a_Tag, a_Idx)
		{
			a_Tag = a_Tag.toUpperCase();	// 这里应是大写
			var l_IdxVld = nWse.fIsNum(a_Idx);
			var l_Cnt = 0;
			var l_Rst = l_IdxVld ? null : [];
			var l_Nl = a_DomPrn && a_DomPrn.childNodes, n = 0, l_Len = l_Nl ? l_Nl.length : 0;
			for (; n<l_Len; ++n)
			{
				if ((1 == l_Nl[n].nodeType) && (l_Nl[n].tagName == a_Tag))
				{
					if (l_IdxVld)
					{
						if (l_Cnt ++ == a_Idx)
						{
							l_Rst = l_Nl[n];
							break;
						}
					}
					else
					{
						l_Rst.push(l_Nl[n]);
					}
				}
			}
			return l_Rst;
		};

		/// 移除全部子节点
		stDomUtil.cRmvAllChds = function (a_DomPrn)
		{
			var l_Nl = a_DomPrn.childNodes;
			while (l_Nl.length > 0)
			{ a_DomPrn.removeChild(l_Nl[l_Nl.length - 1]); }
			return stDomUtil;
		};

		/// 移除非元素子节点
		stDomUtil.cRmvNonElmtChds = function (a_DomPrn)
		{
//			Node.ELEMENT_NODE (1)
//			Node.ATTRIBUTE_NODE (2)
//			Node.TEXT_NODE (3)
//			Node.CDATA_SECTION_NODE (4)
//			Node.ENTITY_REFERENCE_NODE (5)
//			Node.ENTITY_NODE (6)
//			Node.PROCESSING_INSTRUCTION_NODE (7)
//			Node.COMMENT_NODE (8)
//			Node.DOCUMENT_NODE (9)
//			Node.DOCUMENT_TYPE_NODE (10)
//			Node.DOCUMENT_FRAGMENT_NODE (11)
//			Node.NOTATION_NODE (12)

			var l_Nl = a_DomPrn.childNodes, n = 0, l_Len = l_Nl.length;
			for (; n<l_Len; ++n)
			{
				if (1 != l_Nl[n].nodeType)
				{
					a_DomPrn.removeChild(l_Nl[n]);
					-- n;
					-- l_Len;
				}
			}
			return stDomUtil;
		};

		/// 查找子节点
		/// 返回：索引，未找到返回-1
		stDomUtil.cFindChd = function (a_DomPrn, a_DomChd)
		{
			var l_Nl = a_DomPrn.childNodes, n = 0, l_Len = l_Nl.length;
			for (; n<l_Len; ++n)
			{
				if (l_Nl[n] === a_DomChd)
				{ return n; }
			}
			return -1;
		};

		/// 设置全部子节点
		/// a_Rmvd：Node[]，移除的原来子节点
		stDomUtil.cSetAllChds = function (a_Prn, a_Chds, a_Rmvd)
		{
			// 首先，现有布局里的某些元素可能不在新布局里，将他们挑出
			var l_Nl, b, n;
			l_Nl = a_Prn.childNodes;
			for (n = 0; n < l_Nl.length; ++n)		// 注意长度可能会变
			{
				if (a_Chds.indexOf(l_Nl[n]) < 0)
				{
					if (a_Rmvd)
					{ a_Rmvd.push(l_Nl[n]); }

					a_Prn.removeChild(l_Nl[n]);
					--n;	// 因为移除了当前元素，抵消掉下次迭代开始时的递增
				}
			}

			// 然后，若子节点已空则直接追加
			if (0 == l_Nl.length)
			{
				fApdChdsToPrn(a_Prn, a_Chds);
			}
			else // 否则……
			{
				// 现在l_Nl里的元素全在a_Chds里，所以前者的length<=后者的
				n = b = 0;	// n用来步进l_Nl，b用来步进a_Chds
				while ((n < l_Nl.length) && (b < a_Chds.length))
				{
					// 插入位于l_Nl[n]之前的新元素
					while ((b < a_Chds.length) && (l_Nl[n] !== a_Chds[b]))
					{
						a_Prn.insertBefore(a_Chds[b], l_Nl[n]);
						++ n;
						++ b;
					}

					// 跳过l_Nl[n]，继续
					++ n;
					++ b;
				}

				// 追加剩余的
				for (; b < a_Chds.length; ++b)
				{ a_Prn.appendChild(a_Chds[b]); }
			}
			return stDomUtil;
		};

		function fApdChdsToPrn(a_Prn, a_Chds)
		{
			var i, l_Len = a_Chds.length;
			for (i = 0; i<l_Len; ++i)
			{ a_Prn.appendChild(a_Chds[i]); }
		}

		/// 存取兄弟节点
		/// a_Ofst：Number，偏移量，-1表前一个，+1表后一个，以此类推
		stDomUtil.cAcsSbl = function (a_DomElmt, a_Ofst)
		{
			if (! a_Ofst)
			{ return null; }

			var l_Idx = stDomUtil.cFindChd(a_DomElmt.parentNode, a_DomElmt);
			l_Idx += a_Ofst;
			var l_Cn = a_DomElmt.parentNode.childNodes;
			return stAryUtil.cIsIdxVld(l_Cn, l_Idx) ? l_Cn[l_Idx] : null;
		};

		/// 是否为先辈？
		stDomUtil.cIsAcst = function (a_DomA, a_DomD)
		{
			if ((a_DomA === a_DomD) || (document.documentElement === a_DomD))
			{ return false; }

			var l_Prn = a_DomD;
			while (l_Prn && (l_Prn !== document.documentElement))
			{
				l_Prn = l_Prn.parentNode;
				if (l_Prn === a_DomA)
				{ return true; }
			}
			return false;
		};

		/// 是否为自己或先辈？
		stDomUtil.cIsSelfOrAcst = function (a_DomA, a_DomD)
		{
			return (a_DomA === a_DomD) || stDomUtil.cIsAcst(a_DomA, a_DomD);
		};

		///// 搜索先辈
		///// a_fCabk：Boolean f(a_DomA)，返回true时停止
		//stDomUtil.cSrchAcst = function (a_DomD, a_fCabk)
		//{
		//	var l_Prn = a_DomD && a_DomD.parentNode;
		//	while (l_Prn)// !== document.documentElement)
		//	{
		//		if (a_fCabk(l_Prn))
		//		{ return l_Prn; }

		//		l_Prn = l_Prn.parentNode;
		//	}
		//	return null;
		//};

		/// 搜索自己和先辈
		/// a_fCabk：Boolean f(a_DomA)，返回true时停止
		stDomUtil.cSrchSelfAndAcst = function (a_DomD, a_fCabk)
		{
			var l_Prn = a_DomD;
			while (l_Prn)// !== document.documentElement)
			{
				if (a_fCabk(l_Prn))
				{ return l_Prn; }

				l_Prn = l_Prn.parentNode;
			}
			return null;
		};

		/// 搜索自己和先辈为找到标记
		stDomUtil.cSrchSelfAndAcstForTag = function (a_DomD, a_Tag)
		{
			a_Tag = a_Tag.toUpperCase();	// 这里应是大写
			var l_Prn = a_DomD;
			while (l_Prn)// !== document.documentElement)
			{
				if (a_Tag == l_Prn.tagName)
				{ return l_Prn; }

				l_Prn = l_Prn.parentNode;
			}
			return null;
		};

		/// 拷贝特性
		/// a_DomD，a_DomS：HTMLElement，目的和来源
		/// a_Skip：String[]，要跳过的特性名数组，注意大小写！
		stDomUtil.cCopyAttrs = function (a_DomD, a_DomS, a_Skip)
		{
			var l_Attrs = a_DomS.attributes, i = 0, l_Len = l_Attrs.length, l_Item;
			for (; i<l_Len; ++i)
			{
				l_Item = l_Attrs.item(i);
				if (a_Skip && (a_Skip.indexOf(l_Item.nodeName) >= 0))
				{ continue; }

				a_DomD.setAttribute(l_Item.nodeName, l_Item.nodeValue);
			}
			return stDomUtil;
		};

		/// 获取文本内容
		stDomUtil.cGetTextCtnt = function (a_Elmt)
		{
			return ("textContent" in a_Elmt) ? a_Elmt.textContent : a_Elmt.innerText;
		};

		/// 设置文本内容
		stDomUtil.cSetTextCtnt = function (a_Elmt, a_Ctnt)
		{
			("textContent" in a_Elmt) ? (a_Elmt.textContent = a_Ctnt) : (a_Elmt.innerText = a_Ctnt);
			return stDomUtil;
		};


		/// 添加事件处理器
		stDomUtil.cAddEvtHdlr = function (a_Elmt, a_EvtName, a_fHdl)
		{
			unKnl.fAddEvtHdlr(a_Elmt, a_EvtName, a_fHdl);
			return stDomUtil;
		};

		/// 移除事件处理器
		stDomUtil.cRmvEvtHdlr = function (a_Elmt, a_EvtName, a_fHdl)
		{
			unKnl.fRmvEvtHdlr(a_Elmt, a_EvtName, a_fHdl);
			return stDomUtil;
		};

		/// 添加事件处理器 - 窗口调整大小
		/// a_Dly：Number，延迟（秒），推荐0.1
		stDomUtil.cAddEvtHdlr_WndRsz = function (a_fCabk, a_Dly)
		{
			fAddWndEvtHdlr("resize", a_fCabk, a_Dly);
			return stDomUtil;
		};

		/// 移除事件处理器 - 窗口调整大小
		stDomUtil.cRmvEvtHdlr_WndRsz = function (a_fCabk)
		{
			fRmvWndEvtHdlr("resize", a_fCabk);
			return stDomUtil;
		};

		/// 添加事件处理器 - 窗口滚动
		/// a_Dly：Number，延迟（秒），推荐0.1
		stDomUtil.cAddEvtHdlr_WndScrl = function (a_fCabk, a_Dly)
		{
			fAddWndEvtHdlr("scroll", a_fCabk, a_Dly);
			return stDomUtil;
		};

		/// 移除事件处理器 - 窗口滚动
		stDomUtil.cRmvEvtHdlr_WndScrl = function (a_fCabk)
		{
			fRmvWndEvtHdlr("scroll", a_fCabk);
			return stDomUtil;
		};


		/// 获取动画数量
		stDomUtil.cGetAnmtAmt = function ()
		{
			return e_AnmtLockAry ? e_AnmtLockAry.cGetAmt() : 0;
		};

		/// 查找动画
		/// 返回：Number，索引
		stDomUtil.cFindAnmt = function (a_fCabk)
		{
			return (e_AnmtLockAry && a_fCabk) ? e_AnmtLockAry.cFind(a_fCabk) : -1;
		};

		/// 注册动画
		/// a_fCabk：Function，void f(a_FrmTime, a_FrmItvl, a_FrmNum)
		///				a_FrmTime：Number，帧时间，动画执行经过的总时间
		///				a_FrmItvl：Number，帧间隔，距离上一帧经过的时间
		///				a_FrmNum：Number，帧编号，第一次回调时为1，之后递增
		stDomUtil.cRegAnmt = function (a_fCabk)
		{
			if (! e_AnmtLockAry)
			{
				e_AnmtLockAry = new nWse.tLockAry(
					function fFind(a_Ary, a_Agms)
					{
						return stAryUtil.cFind(a_Ary, function (a_Tgt, a_Idx, a_Elmt) { return (a_Elmt.c_fCabk === a_Agms[0]); });
					},
					function fReg(a_Ary, a_Agms)
					{
						var l_Anmt = { c_fCabk : a_Agms[0] };
						eRsetAnmtTime(l_Anmt);
						a_Ary.push(l_Anmt);

						// 如果尚未发出
						if (! e_IsuRAF)
						{
							e_IsuRAF = true;
							e_fRAF(eOneAnmtFrm);
						}
					},
					function fFor(a_Ary, a_Agms)
					{
						var l_AppNow = eGetTimeNow();
						var i=0, l_Len = a_Ary.length, l_Anmt;
						for (; i<l_Len; ++i)
						{
							// 跳过暂停的，计算时间，回调
							l_Anmt = a_Ary[i];
							if (l_Anmt.c_Pau)
							{ continue; }

							l_Anmt.c_FrmItvl = Math.min(l_AppNow - l_Anmt.c_LastTime, 1);	// 限制每秒1帧
							l_Anmt.c_LastTime = l_AppNow;
							l_Anmt.c_FrmTime += l_Anmt.c_FrmItvl;
							++ l_Anmt.c_FrmNum;
							l_Anmt.c_fCabk(l_Anmt.c_FrmTime, l_Anmt.c_FrmItvl, l_Anmt.c_FrmNum);
						}
					});
			}
			
			e_AnmtLockAry.cReg(a_fCabk);
			return stDomUtil;
		};

		/// 注销动画
		stDomUtil.cUrgAnmt = function (a_fCabk)
		{
			if ((! e_AnmtLockAry) || (! a_fCabk))
			{ return stDomUtil; }

			e_AnmtLockAry.cUrg(a_fCabk);
			return stDomUtil;
		};

		/// 注销动画根据索引
		stDomUtil.cUrgAnmtByIdx = function (a_Idx)
		{
			if ((! e_AnmtLockAry) || (! e_AnmtLockAry.cIsIdxVld(a_Idx)))
			{ return stDomUtil; }

			var l_Anmt = e_AnmtLockAry.cAcsElmt(a_Idx);
			e_AnmtLockAry.cUrg(l_Anmt.c_fCabk);
			return stDomUtil;
		};

		/// 根据索引重置动画时间，如果动画已被要求注销但尚未注销，则不再注销
		stDomUtil.cRsetAnmtTimeByIdx = function (a_Idx)
		{
			if ((! e_AnmtLockAry) || (! e_AnmtLockAry.cIsIdxVld(a_Idx)))
			{ return stDomUtil; }

			var l_Anmt = e_AnmtLockAry.cAcsElmt(a_Idx);
			eRsetAnmtTime(l_Anmt);
			e_AnmtLockAry.cReg(l_Anmt.c_fCabk);	// 再次注册即可
			return stDomUtil;
		};

		/// 注册动画或重置动画时间
		/// 返回：索引，若为-1表示进行了注册，否则进行了重置
		stDomUtil.cRegAnmtOrRsetAnmtTime = function (a_fCabk)
		{
			if ((! a_fCabk))
			{ return -1; }

			var l_AnmtIdx = stDomUtil.cFindAnmt(a_fCabk);
			if (l_AnmtIdx >= 0)
			{ stDomUtil.cRsetAnmtTimeByIdx(l_AnmtIdx); }
			else
			{ stDomUtil.cRegAnmt(a_fCabk); }
			return l_AnmtIdx;
		};

		/// 暂停继续动画
		stDomUtil.cPauRsmAnmt = function (a_fCabk, a_Pau)
		{
			var l_AnmtIdx = a_fCabk ? stDomUtil.cFindAnmt(a_fCabk) : -1;
			if (l_AnmtIdx < 0)
			{ return stDomUtil; }

			var l_Anmt = e_AnmtLockAry.cAcsElmt(l_AnmtIdx);
			if (l_Anmt.c_Pau == a_Pau)
			{ return stDomUtil; }

			if (a_Pau)
			{
				l_Anmt.c_Pau = true;
				l_Anmt.c_FrmItvl = 0;	// 经过的时间清零
			}
			else
			{
				l_Anmt.c_Pau = false;
				l_Anmt.c_LastTime = eGetTimeNow();	// 重置上一次时间
			}
			return stDomUtil;
		};

		/// 动画暂停？
		stDomUtil.cIsAnmtPau = function (a_fCabk)
		{
			var l_AnmtIdx = a_fCabk ? stDomUtil.cFindAnmt(a_fCabk) : -1;
			if (l_AnmtIdx < 0)
			{ return stDomUtil; }

			var l_Anmt = e_AnmtLockAry.cAcsElmt(l_AnmtIdx);
			return l_Anmt.c_Pau;
		};

		/// 动画属性，与stCssUtil.cAnmt的区别是，这里动画的是DOM对象之属性，而非DOM对象的style对象之属性
		/// 支持在window对象上动画scrollX和scrollY属性！
		/// 参数含义同stCssUtil.cAnmt
		stDomUtil.cAnmtPpty = function (a_DomElmt, a_End, a_Cfg)
		{
			stDomUtil.eAnmtPpty_Shr(false, a_DomElmt, a_End, a_Cfg, eAnmtPpty_NoDly);
			return stDomUtil;
		};

		// 这个函数与stCssUtil共享
		stDomUtil.eAnmtPpty_Shr = function (a_CssUtil, a_DomElmt, a_End, a_Cfg, a_fNoDly, a_fGnrt)
		{
			// 检查实参
			if ((! a_DomElmt) || (! a_End) || (! a_Cfg))
			{ return; }

			var l_Bkpn = a_CssUtil ? a_DomElmt.Wse_CssUtil : a_DomElmt.Wse_DomUtil;

			// 如果正在延期，取消计时器
			if (l_Bkpn && (! nWse.fIsUdfnOrNull(l_Bkpn.c_DlyTmrId)))
			{
				clearTimeout(l_Bkpn.c_DlyTmrId);
				l_Bkpn.c_DlyTmrId = null;
			}

			// 延期？
			if (a_Cfg.c_Dly)
			{
				if (! l_Bkpn)
				{ a_CssUtil ? (l_Bkpn = a_DomElmt.Wse_CssUtil = {}) : (l_Bkpn = a_DomElmt.Wse_DomUtil = {}); }

				l_Bkpn.c_DlyTmrId = setTimeout(function ()
				{
					l_Bkpn.c_DlyTmrId = null;
					a_fNoDly(a_DomElmt, a_End, a_Cfg);
				}, a_Cfg.c_Dly * 1000);
			}
			else
			{
				// 立即执行
				a_fNoDly(a_DomElmt, a_End, a_Cfg);
			}
		};

		function eAnmtPpty_NoDly(a_DomElmt, a_End, a_Cfg)
		{
			//// 准备
			//stDomUtil.eEnsrAnmtFctn_Shr(false, a_DomElmt, eGnrtAnmtFctn);	// 确保动画函数
			//
			//// 初始化
			//var l_fAnmt = a_DomElmt.Wse_DomUtil.c_fAnmt;
			//l_fAnmt.Wse_Items = {};		// 要动画的各项之记录
			//l_fAnmt.Wse_Cfg = a_Cfg;
			//l_fAnmt.Wse_Cnt = 1;		// 从1开始计数
			//
			//// 设定起始值和结束值
			//var l_IsEmt = true;
			//var l_PN, l_PV;
			//var l_Item = null;
			//for (l_PN in a_End)
			//{
			//	// 跳过不存在的属性
			//	if (! (l_PN in a_DomElmt))
			//	{
			//		// 支持动画window.scrollX，window.scrollY
			//		if ((a_DomElmt === window) && ("scrollX" != l_PN) && ("scrollY" != l_PN))
			//		{ continue; }
			//	}
			//
			//	// 根据值的类型决定，跳过undefined和null
			//	l_PV = a_End[l_PN];
			//	if (nWse.fIsUdfnOrNull(l_PV))
			//	{ continue; }
			//
			//	l_Item = {};
			//
			//	if (nWse.fIsNum(l_PV)) // [1]Number
			//	{
			//		l_Item.c_TypeIdx = 1;
			//		l_Item.c_End = l_PV;
			//	}
			//	else // 无效类型，跳过
			//	{
			//		continue;
			//	}
			//
			//	l_Item.c_Bgn = a_DomElmt[l_PN] || 0;	// 起始值如果不存在，取0
			//
			//	if (l_Item.c_TypeIdx)	// 当类型索引有效时录入，【注意】0也认为无效！
			//	{
			//		// 如果起始值和结束值相同，跳过
			//		if ((! a_Cfg.c_PsrvIdtcBesPpty) && (l_Item.c_Bgn == l_Item.c_End))
			//		{
			//			continue;
			//			//	console.log("BS == ES，但未跳过！");
			//		}
			//
			//		l_fAnmt.Wse_Items[l_PN] = l_Item;
			//		l_IsEmt = false;	// 至少有一个项需要动画，不空
			//	}
			//}
			//
			//// 为空或时长为0时立即结束，否则注册或重置
			//(l_IsEmt || (0 === a_Cfg.c_Dur) || (0 === a_Cfg.c_Tot))
			//	? stDomUtil.cFnshAnmtPpty(a_DomElmt, (! l_IsEmt), true, false)
			//	: stDomUtil.cRegAnmtOrRsetAnmtTime(l_fAnmt);

			stDomUtil.eAnmtPpty_NoDly_Shr(false, a_DomElmt, a_End, a_Cfg,
				function () { stDomUtil.eEnsrAnmtFctn_Shr(false, a_DomElmt, eGnrtAnmtFctn); }, // 准备
				null, // 初始化
				function (a_DomElmt, a_PN) // 跳过
				{
					if (! (a_PN in a_DomElmt))
					{
						// 支持动画window.scrollX，window.scrollY
						if ((a_DomElmt === window) && ("scrollX" != a_PN) && ("scrollY" != a_PN))
						{ return true; }
					}
					return false;
				},
				function (a_DomElmt, a_fAnmt, a_PN, a_PV, a_Item) // 计算始末值
				{
					if (nWse.fIsNum(a_PV)) // [1]Number
					{
						a_Item.c_TypeIdx = 1;
						a_Item.c_End = a_PV;
					}
					else // 无效类型，跳过
					{
						return false;
					}

					a_Item.c_Bgn = a_DomElmt[a_PN] || 0;	// 起始值如果不存在，取0
					return true;
				},
				function (a_DomElmt, a_fAnmt, a_PN, a_PV, a_Item) // 不要录入？
				{
					// 如果起始值和结束值相同，跳过
					return ((! a_fAnmt.Wse_Cfg.c_PsrvIdtcBesPpty) && (a_Item.c_Bgn == a_Item.c_End));
					//if ((! a_fAnmt.Wse_Cfg.c_PsrvIdtcBesPpty) && (a_Item.c_Bgn == a_Item.c_End))
					//{
					//	return true;
					//	//	console.log("BS == ES，但未跳过！");
					//}
					//return false;
				},
				null, stDomUtil.cFnshAnmtPpty);
			return stDomUtil;
		}

		stDomUtil.eAnmtPpty_NoDly_Shr = function (a_CssUtil, a_DomElmt, a_End, a_Cfg,
												  a_fRdy, a_fInit, a_fSkip, a_fCalcBgnEnd, a_fDontRcd, a_fAftRcd, a_fFnsh)
		{
			// 准备
			//e_DomPrn = a_DomElmt.parentNode;
			//e_BgnStl = e_PrnStl = null;
			//stDomUtil.eEnsrAnmtFctn_Shr(true, a_DomElmt, eGnrtAnmtFctn);	// 确保动画函数
			a_fRdy(a_DomElmt);

			// 初始化
			var l_Bkpn = a_CssUtil ? a_DomElmt.Wse_CssUtil : a_DomElmt.Wse_DomUtil;
			var l_fAnmt = l_Bkpn.c_fAnmt;
			l_fAnmt.Wse_Items = {};		// 要动画的各项之记录
			l_fAnmt.Wse_Cfg = a_Cfg;
			l_fAnmt.Wse_Cnt = 1;		// 从1开始计数
			//l_fAnmt.Wse_HasDplc = !! (a_Cfg.c_fDplc);
			//l_fAnmt.Wse_HasLeft = false;
			//l_fAnmt.Wse_HasTop = false;
			//if (! l_fAnmt.Wse_Pos)
			//{
			//	l_fAnmt.Wse_Pos = { x:0, y:0 };
			//	l_fAnmt.Wse_Sp = { x:0, y:0 };
			//	l_fAnmt.Wse_Tp = { x:0, y:0 };
			//}
			if (a_CssUtil)
			{ a_fInit(a_DomElmt, l_fAnmt); }

			// 设定起始值和结束值
			var l_IsEmt = ! l_fAnmt.Wse_HasDplc;	// 只要动画位置就不空
			var l_PN, l_PV;
			var l_Item = null, l_EndStr = null, l_BgnStr = null, l_EqIdx = -1, l_LtIdx = -1;
			for (l_PN in a_End)
			{
				// 如果是扩展动画
				if (0 == l_PN.indexOf("Wse_"))
				{
					l_IsEmt = eExtdAnmt(a_DomElmt, l_PN, a_End[l_PN]) && l_IsEmt;	// 一旦是false，就不能改回true
					continue;
				}

				//// 跳过不存在的属性
				//if (! (l_PN in a_DomElmt.style))
				//{ continue; }
				if (a_fSkip(a_DomElmt, l_PN))
				{ continue; }

				// 根据值的类型决定，跳过undefined和null
				l_PV = a_End[l_PN];
				if (nWse.fIsUdfnOrNull(l_PV))
				{ continue; }

				l_Item = {};

//				if (nWse.fIsNum(l_PV)) // [1]Number
//				{
//					l_Item.c_TypeIdx = 1;
//					l_Item.c_End = l_PV;
//				}
//				else if (nWse.fIsStr(l_PV))	// 字符串
//				{
//					l_LtIdx = l_PV.indexOf("<");	// 带有起始字符串？
//					if (l_LtIdx >= 0)
//					{
//						l_BgnStr = (l_LtIdx == l_PV.length - 1) ? "" : l_PV.substring(l_LtIdx + 1, l_PV.length);
//						l_PV = l_PV.substring(0, l_LtIdx);
//					}
//
//					l_EqIdx = l_PV.indexOf("=");	// 带有结束字符串？
//					if (l_EqIdx >= 0)
//					{
//						l_EndStr = (l_EqIdx == l_PV.length - 1) ? "" : l_PV.substring(l_EqIdx + 1, l_PV.length);
//						l_PV = l_PV.substring(0, l_EqIdx);
//					}
//
//					if ((l_PV.length - 2 >= 0) && (l_PV.indexOf("px") == l_PV.length - 2)) // [2]像素
//					{
//						l_Item.c_TypeIdx = 2;
//						l_Item.c_End = parseFloat(l_PV);
//					}
//					else if ((l_PV.length - 1 >= 0) && (l_PV.indexOf("%") == l_PV.length - 1)) // [3]百分比
//					{
//						if (! e_PrnStl)
//						{
//							e_PrnStl = stCssUtil.cGetCmptStl(e_DomPrn);
//						}
//
//						l_Item.c_TypeIdx = 3;
//						l_Item.c_End = parseFloat(e_PrnStl[l_PN]);
//						if (isNaN(l_Item.c_End))
//						{ l_Item.c_End = e_DomPrn.offsetWidth; }
//
//						l_Item.c_End *= (parseFloat(l_PV) / 100);
//					}
////					else
////					if ((l_PV.length - 2 >= 0) && (l_PV.indexOf("em") == l_PV.length - 2)) // [4]em
////					{
////						l_Item.c_TypeIdx = 4;
////					}
////					else
////					if ((l_PV.length - 3 >= 0) && (l_PV.indexOf("rem") == l_PV.length - 3)) // [5]rem
////					{
////						l_Item.c_TypeIdx = 5;
////					}
//					else if ((l_PV.indexOf("rgb") == 0) || (l_PV.indexOf("#") == 0))	// [6]颜色
//					{
//						l_Item.c_TypeIdx = 6;
//						l_Item.c_End = tClo.scFromCssCloStr(l_PV);
//					}
//					else // 按Number处理
//					{
//						l_Item.c_TypeIdx = 1;
//						l_Item.c_End = parseFloat(l_PV);
//						if (isNaN(l_Item.c_End))	// 若解析失败则跳过
//						{ continue; }
//					}
//				}
//				else // 无效类型，跳过
//				{
//					continue;
//				}
//
//				eCalcBgnPV(l_Item.c_TypeIdx, a_DomElmt, l_PN);
//				l_Item.c_Bgn = e_Rst_CalcBgnPV.c_Bgn;
//				l_Item.c_BgnStr = (l_LtIdx >= 0) ? l_BgnStr : e_Rst_CalcBgnPV.c_BgnStr;
//				l_Item.c_EndStr = (l_EqIdx >= 0) ? l_EndStr : l_PV.toString();
				if (! a_fCalcBgnEnd(a_DomElmt, l_fAnmt, l_PN, l_PV, l_Item)) // 计算始末值，若无效则跳过
				{ continue; }

				if (l_Item.c_TypeIdx)	// 当类型索引有效时录入，【注意】0也认为无效！
				{
					//// 如果起始串和结束串相同，除非是“left、top”且提供了c_fDplc，否则跳过
					//if ((! a_Cfg.c_PsrvIdtcBesPpty) && (l_Item.c_BgnStr == l_Item.c_EndStr))
					//{
					//	if (! (l_fAnmt.Wse_HasDplc && (("left" == l_PN) || ("top" == l_PN))))
					//	{ continue; }
					//
					//	//	console.log("BS == ES，但未跳过！");
					//}
					if (a_fDontRcd(a_DomElmt, l_fAnmt, l_PN, l_PV, l_Item))
					{ continue; }

					l_fAnmt.Wse_Items[l_PN] = l_Item;
					l_IsEmt = false;	// 至少有一个项需要动画，不空

					//// 如果需要动画位置，检查left和/或top是否存在，是的话记录起始和结束值
					//if (l_fAnmt.Wse_HasDplc)
					//{
					//	if ((! l_fAnmt.Wse_HasLeft) && ("left" == l_PN))
					//	{
					//		l_fAnmt.Wse_HasLeft = true;
					//		l_fAnmt.Wse_Sp.x = l_Item.c_Bgn;
					//		l_fAnmt.Wse_Tp.x = l_Item.c_End;
					//	}
					//	else
					//	if ((! l_fAnmt.Wse_HasTop) && ("top" == l_PN))
					//	{
					//		l_fAnmt.Wse_HasTop = true;
					//		l_fAnmt.Wse_Sp.y = l_Item.c_Bgn;
					//		l_fAnmt.Wse_Tp.y = l_Item.c_End;
					//	}
					//}
					if (a_CssUtil)
					{
						a_fAftRcd(a_DomElmt, l_fAnmt, l_PN, l_PV, l_Item);
					}
				}
			}

			//// 如果需要动画位置，计算left和/或top缺省的起始和结束值（此时相同，皆为当前值）
			//if (l_fAnmt.Wse_HasDplc)
			//{
			//	if (! l_fAnmt.Wse_HasLeft)
			//	{ l_fAnmt.Wse_Sp.x = l_fAnmt.Wse_Tp.x = eCalcBgnPV(2, a_DomElmt, "left").c_Bgn; }
			//
			//	if (! l_fAnmt.Wse_HasTop)
			//	{ l_fAnmt.Wse_Sp.y = l_fAnmt.Wse_Tp.y = eCalcBgnPV(2, a_DomElmt, "top").c_Bgn; }
			//}
			if (a_CssUtil)
			{
				a_fAftEnum(a_DomElmt, l_fAnmt);
			}

			// 为空或时长为0时立即结束，否则注册或重置
			(l_IsEmt || (0 === a_Cfg.c_Dur) || (0 === a_Cfg.c_Tot))
				? a_fFnsh(a_DomElmt, (! l_IsEmt), true, false)
				: stDomUtil.cRegAnmtOrRsetAnmtTime(l_fAnmt);
		};

		/// 结束动画属性
		/// 参数含义同stCssUtil.cFnshAnmt
		stDomUtil.cFnshAnmtPpty = function (a_DomElmt, a_SkipToEnd, a_Cabk, a_Rvs)
		{
			//// 率先注销
			//var l_fAnmt = a_DomElmt.Wse_DomUtil && a_DomElmt.Wse_DomUtil.c_fAnmt;
			//if ((! l_fAnmt) || (! l_fAnmt.Wse_Items))
			//{ return stDomUtil; }
			//
			//var l_Idx = stDomUtil.cFindAnmt(l_fAnmt);
			//if (l_Idx < 0)
			//{ return stDomUtil; }
			//
			//stDomUtil.cUrgAnmtByIdx(l_Idx);
			//
			//// 跳到最后
			//if (a_SkipToEnd)
			//{ eJumpToAnmtEnd(a_DomElmt, a_Rvs); }
			//
			//// 结束回调
			//if (a_Cabk && l_fAnmt.Wse_Cfg.c_fOnEnd)
			//{ l_fAnmt.Wse_Cfg.c_fOnEnd(a_DomElmt); }

			stDomUtil.eFnshAnmtPpty_Shr(false, a_DomElmt, a_SkipToEnd, a_Cabk, a_Rvs, eJumpToAnmtEnd);
			return stDomUtil;
		};

		stDomUtil.eFnshAnmtPpty_Shr = function (a_CssUtil, a_DomElmt, a_SkipToEnd, a_Cabk, a_Rvs, a_fJump)
		{
			var l_Bkpn = a_CssUtil ? a_DomElmt.Wse_CssUtil : a_DomElmt.Wse_DomUtil;

			// 率先注销
			var l_fAnmt = l_Bkpn && l_Bkpn.c_fAnmt;
			if ((! l_fAnmt) || (! l_fAnmt.Wse_Items))
			{ return; }

			var l_Idx = stDomUtil.cFindAnmt(l_fAnmt);
			if (l_Idx < 0)
			{ return; }

			stDomUtil.cUrgAnmtByIdx(l_Idx);

			// 跳到最后
			if (a_SkipToEnd)
			{ a_fJump(a_DomElmt, a_Rvs); }

			// 结束回调
			if (a_Cabk && l_fAnmt.Wse_Cfg.c_fOnEnd)
			{ l_fAnmt.Wse_Cfg.c_fOnEnd(a_DomElmt); }
		};

		/// 在动画属性期间？
		stDomUtil.cIsDurAnmtPpty = function (a_DomElmt)
		{
			var l_fAnmt = a_DomElmt.Wse_DomUtil && a_DomElmt.Wse_DomUtil.c_fAnmt;
			return l_fAnmt ? (stDomUtil.cFindAnmt(l_fAnmt) >= 0) : false;
		};

		/// 暂停继续动画属性
		stDomUtil.cPauRsmAnmtPpty = function (a_DomElmt, a_Pau)
		{
			var l_fAnmt = a_DomElmt.Wse_DomUtil && a_DomElmt.Wse_DomUtil.c_fAnmt;
			stDomUtil.cPauRsmAnmt(l_fAnmt, a_Pau);
			return stDomUtil;
		};

		/// 动画属性暂停？
		stDomUtil.cIsAnmtPptyPau = function (a_DomElmt)
		{
			var l_fAnmt = a_DomElmt.Wse_DomUtil && a_DomElmt.Wse_DomUtil.c_fAnmt;
			return stDomUtil.cIsAnmtPau(l_fAnmt);
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////