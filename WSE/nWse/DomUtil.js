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
		function eEnsrAnmtFctn(a_DomElmt)
		{
			if ((! a_DomElmt.Wse_DomUtil) || (! a_DomElmt.Wse_DomUtil.c_fAnmt))
			{
				if (! a_DomElmt.Wse_DomUtil)
				{ a_DomElmt.Wse_DomUtil = {}; }

				a_DomElmt.Wse_DomUtil.c_fAnmt = eGnrtAnmtFctn(a_DomElmt);
			}
		}

		// 跳到动画最后
		function eJumpToAnmtEnd(a_DomElmt, a_Rvs)
		{
			var l_fAnmt = a_DomElmt.Wse_DomUtil.c_fAnmt;
			var l_PN, l_Item, l_SV;
			for (l_PN in l_fAnmt.Wse_Items)
			{
				l_Item = l_fAnmt.Wse_Items[l_PN];
				l_SV = a_Rvs ? l_Item.c_Bgn : l_Item.c_End;
				eAsnAnmtVal(a_DomElmt, l_PN, l_SV);
			}
		}

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
			return function fDomElmtAnmt(a_FrmTime, a_FrmItvl, a_FrmNum)
			{
				var l_fAnmt = a_DomElmt.Wse_DomUtil.c_fAnmt;
				var l_Cfg = l_fAnmt.Wse_Cfg;
				var l_Ifnt = l_Cfg.c_Dur && (l_Cfg.c_Dur < 0);
				var l_Loop = l_Ifnt ? false : (l_Cfg.c_Tot && (l_Cfg.c_Tot < 0));
				var l_Cnt = l_Ifnt ? 0 : l_fAnmt.Wse_Cnt;
				var l_Dur = l_Ifnt ? 0 : (l_Cfg.c_Dur || 1);
				var l_Tot = (l_Ifnt || l_Loop) ? 0 : (l_Cfg.c_Tot || 1);
				var l_NmlScl = l_Ifnt ? 0 : (a_FrmTime / l_Dur);
				var l_EsnScl = l_Ifnt ? 0 : (l_Cfg.c_fEsn ? l_Cfg.c_fEsn(l_NmlScl) : l_NmlScl);
				var l_Ctnu = l_Ifnt || (a_FrmTime < l_Dur);

				var l_EvenCnt = (0 == l_Cnt % 2);
				var l_Rvs = (l_Loop || (l_Tot > 1)) && l_EvenCnt && (l_Cfg.c_EvenCntRvs || false);
				var l_Bgn, l_End;

				var l_PN, l_Item, l_V, l_M;
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

						l_V = l_M = stNumUtil.cLnrItp(l_Bgn, l_End, l_EsnScl);
						eAsnAnmtVal(a_DomElmt, l_PN, l_V);
					}

					// 更新回调
					if (l_Cfg.c_fOnUpd)
					{
						l_Cfg.c_fOnUpd(a_DomElmt, l_NmlScl, l_EsnScl, a_FrmTime, a_FrmItvl, a_FrmNum);
					}
				}
				else // 循环，或未达播放总数
				if (l_Loop || ((1 < l_Tot) && (l_Cnt < l_Tot)))
				{
					eJumpToAnmtEnd(a_DomElmt, l_Rvs);			// 跳到最后
					stDomUtil.cRegAnmtOrRsetAnmtTime(l_fAnmt);	// 重置动画时间
					++ l_fAnmt.Wse_Cnt;							// 递增一次计数
				}
				else // 结束
				{
					stDomUtil.cFnshAnmtPpty(a_DomElmt, true, true, l_Rvs);	// 结束动画
				}
			};
		}

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
			stDomUtil.eAnmtPpty_Shr(a_DomElmt, a_End, a_Cfg, "Wse_DomUtil", eAnmtPpty_NoDly);
			return stDomUtil;
		};

		// 这个函数与stCssUtil共享
		stDomUtil.eAnmtPpty_Shr = function (a_DomElmt, a_End, a_Cfg, a_Which, a_fNoDly)
		{
			// 检查实参
			if ((! a_DomElmt) || (! a_End) || (! a_Cfg))
			{ return; }

			// 如果正在延期，取消计时器
			if (a_DomElmt[a_Which] && (! nWse.fIsUdfnOrNull(a_DomElmt[a_Which].c_DlyTmrId)))
			{
				clearTimeout(a_DomElmt[a_Which].c_DlyTmrId);
				a_DomElmt[a_Which].c_DlyTmrId = null;
			}

			// 延期？
			if (a_Cfg.c_Dly)
			{
				if (! a_DomElmt[a_Which])
				{ a_DomElmt[a_Which] = {}; }

				a_DomElmt[a_Which].c_DlyTmrId = setTimeout(function ()
				{
					a_DomElmt[a_Which].c_DlyTmrId = null;
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
			// 准备
			eEnsrAnmtFctn(a_DomElmt);		// 确保动画函数

			// 初始化
			var l_fAnmt = a_DomElmt.Wse_DomUtil.c_fAnmt;
			l_fAnmt.Wse_Items = {};		// 要动画的各项之记录
			l_fAnmt.Wse_Cfg = a_Cfg;
			l_fAnmt.Wse_Cnt = 1;		// 从1开始计数

			// 设定起始值和结束值
			var l_IsEmt = true;
			var l_PN, l_PV;
			var l_Item = null;
			for (l_PN in a_End)
			{
				// 跳过不存在的属性
				if (! (l_PN in a_DomElmt))
				{ continue; }

				// 根据值的类型决定，跳过undefined和null
				l_PV = a_End[l_PN];
				if (nWse.fIsUdfnOrNull(l_PV))
				{ continue; }

				l_Item = {};

				if (nWse.fIsNum(l_PV)) // [1]Number
				{
					l_Item.c_TypeIdx = 1;
					l_Item.c_End = l_PV;
				}
				else // 无效类型，跳过
				{
					continue;
				}

				l_Item.c_Bgn = a_DomElmt[l_PN];

				if (l_Item.c_TypeIdx)	// 当类型索引有效时录入，【注意】0也认为无效！
				{
					// 如果起始值和结束值相同，跳过
					if ((! a_Cfg.c_PsrvIdtcBesPpty) && (l_Item.c_Bgn == l_Item.c_End))
					{
						continue;
						//	console.log("BS == ES，但未跳过！");
					}

					l_fAnmt.Wse_Items[l_PN] = l_Item;
					l_IsEmt = false;	// 至少有一个项需要动画，不空
				}
			}

			// 为空或时长为0时立即结束，否则注册或重置
			(l_IsEmt || (0 === a_Cfg.c_Dur) || (0 === a_Cfg.c_Tot))
				? stDomUtil.cFnshAnmtPpty(a_DomElmt, (! l_IsEmt), true, false)
				: stDomUtil.cRegAnmtOrRsetAnmtTime(l_fAnmt);
			return stDomUtil;
		}

		/// 结束动画属性
		/// 参数含义同stCssUtil.cFnshAnmt
		stDomUtil.cFnshAnmtPpty = function (a_DomElmt, a_SkipToEnd, a_Cabk, a_Rvs)
		{
			// 率先注销
			var l_fAnmt = a_DomElmt.Wse_DomUtil && a_DomElmt.Wse_DomUtil.c_fAnmt;
			if ((! l_fAnmt) || (! l_fAnmt.Wse_Items))
			{ return stDomUtil; }

			var l_Idx = stDomUtil.cFindAnmt(l_fAnmt);
			if (l_Idx < 0)
			{ return stDomUtil; }

			stDomUtil.cUrgAnmtByIdx(l_Idx);

			// 跳到最后
			if (a_SkipToEnd)
			{ eJumpToAnmtEnd(a_DomElmt, a_Rvs); }

			// 结束回调
			if (a_Cabk && l_fAnmt.Wse_Cfg.c_fOnEnd)
			{ l_fAnmt.Wse_Cfg.c_fOnEnd(a_DomElmt); }

			return stDomUtil;
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