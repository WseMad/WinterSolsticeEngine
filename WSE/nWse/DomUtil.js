/*
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

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fAddEvtHdlr(a_Evt, a_fCabk, a_Dly)
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

		window.addEventListener(a_Evt, a_fCabk.Wse_fOn);
	}

	function fRmvEvtHdlr(a_Evt, a_fCabk)
	{
		window.removeEventListener(a_Evt, a_fCabk.Wse_fOn);
	}

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

		//======== 公有函数

		/// 存取<body>
		stDomUtil.cAcsBody = function ()
		{
			if (! e_Dom_Body)
			{ e_Dom_Body = document.getElementsByTagName("body")[0]; }
			return e_Dom_Body;
		};

		/// 根据CSS类获取元素
		/// 返回：Array
		stDomUtil.cGetElmtsByCssc = function (a_Cssc)
		{
			return Array.prototype.slice.call(l_Glb.document.getElementsByClassName(a_Cssc), 0);
		};

//		/// 根据CSS类存取第一个子节点	【无用】
//		stDomUtil.cAcs1stChdByCssc = function (a_Prn, a_Cssc)
//		{
//			var l_Nl = a_Prn.childNodes, n = 0, l_Len = l_Nl.length, l_CN;
//			for (; n<l_Len; ++n)
//			{
//				l_CN = l_Nl[n].className;
//				if (l_CN && (l_CN.indexOf(a_Cssc) >= 0))
//				{ return l_Nl[n]; }
//			}
//			return null;
//		};

		/// 查询一个
		/// a_Slc：String，选择器
		/// a_Root：Node，查询的根节点，返回的元素为其后代，默认undefined
		/// 返回：Node，不存在时返回null
		stDomUtil.cQryOne = function (a_Slc, a_Root)
		{
			var l_Rst = l_Glb.document.querySelector(a_Slc);
			return a_Root ? (stDomUtil.cIsAcst(a_Root, l_Rst) ? l_Rst : null) : l_Rst;
		};

		/// 查询全部
		/// a_Slc：String，选择器
		/// a_Root：Node，查询的根节点，返回的元素为其后代，默认undefined
		/// 返回：Node[]，不存在时返回空数组
		stDomUtil.cQryAll = function (a_Slc, a_Root)
		{
			var l_Rst = Array.prototype.slice.call(l_Glb.document.querySelectorAll(a_Slc));
			if (a_Root)
			{
				stAryUtil.cErsAll(l_Rst,
				function (a_Ary, a_Idx, a_DomElmt)
				{ return ! stDomUtil.cIsAcst(a_Root, a_DomElmt); });
			}
			return l_Rst;
		};

		/// 获取全部子节点
		stDomUtil.cGetAllChds = function (a_DomPrn)
		{
			return Array.prototype.slice.call(a_DomPrn.childNodes);
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

		/// 获取指定标记的子节点
		stDomUtil.cGetChdsOfTag = function (a_DomPrn, a_Tag, a_1st)
		{
			a_Tag = a_Tag.toUpperCase();
			var l_Rst = a_1st ? null : [];
			var l_Nl = a_DomPrn.childNodes, n = 0, l_Len = l_Nl.length;
			for (; n<l_Len; ++n)
			{
				if ((1 == l_Nl[n].nodeType) && (l_Nl[n].tagName == a_Tag))
				{
					if (a_1st)
					{
						l_Rst = l_Nl[n];
						break;
					}

					l_Rst.push(l_Nl[n]);
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
			a_Tag = a_Tag.toUpperCase();
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


		/// 添加事件处理器 - 窗口调整大小
		/// a_Dly：Number，延迟（秒），推荐0.1
		stDomUtil.cAddEvtHdlr_WndRsz = function (a_fCabk, a_Dly)
		{
			fAddEvtHdlr("resize", a_fCabk, a_Dly);
			return stDomUtil;
		};

		/// 移除事件处理器 - 窗口调整大小
		stDomUtil.cRmvEvtHdlr_WndRsz = function (a_fCabk)
		{
			fRmvEvtHdlr("resize", a_fCabk);
			return stDomUtil;
		};

		/// 添加事件处理器 - 窗口滚动
		/// a_Dly：Number，延迟（秒），推荐0.1
		stDomUtil.cAddEvtHdlr_WndScrl = function (a_fCabk, a_Dly)
		{
			fAddEvtHdlr("scroll", a_fCabk, a_Dly);
			return stDomUtil;
		};

		/// 移除事件处理器 - 窗口滚动
		stDomUtil.cRmvEvtHdlr_WndScrl = function (a_fCabk)
		{
			fRmvEvtHdlr("scroll", a_fCabk);
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

							l_Anmt.c_FrmItvl = Math.max(l_AppNow - l_Anmt.c_LastTime, 0.016666667);	// 限制每秒60帧
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

	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////