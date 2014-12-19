/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tLot)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nPick",
		[
			"Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Lot.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stStrUtil = nWse.stStrUtil;
	var stObjUtil = nWse.stObjUtil;
	var stFctnUtil = nWse.stFctnUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;

	var nPick = nWse.nPick;
	var unKnl = nPick.unKnl;
	var tInrName = nPick.tInrName;
	var tMsg = nPick.tMsg;
	var atPkup = nPick.atPkup;
	var tRelLyr = nPick.tRelLyr;
	var tRefFrm = nPick.tRefFrm;
	var tDockWay = nPick.tDockWay;
	var tPrmrSta = nPick.tPrmrSta;
	var tWgt = nPick.tWgt;
	var tRoot = nPick.tRoot;
//	var stFrmwk = nPick.stFrmwk;	// 尚未创建

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_TempSara0 = new tSara();

	// 查找断点
	function fFindBrkPnt(a_This, a_W)
	{
		var l_Rst = stAryUtil.cRvsFind(a_This.e_Cfg.c_BrkPnts, function (a_Tgt, a_Idx, a_Elmt) { return (a_W >= a_Elmt); });
		return (l_Rst < 0) ? 0 : l_Rst;
	}

	//// 创建DOM元素
	//function fCrtDomElmt(a_This, a_Cfg, a_OrigCssc, a_DftId, a_DftHtmlTag)
	//{
	////	var l_Rst = stDomUtil.cObtnOne("#", (a_Cfg.c_HtmlTag || a_DftHtmlTag), (a_Cfg.c_Id || a_DftId), stStrUtil.cCcat(a_OrigCssc, " ", a_Cfg.c_Cssc), null);
	//	var l_Rst = document.createElement(a_Cfg.c_HtmlTag || a_DftHtmlTag);
	//	l_Rst.id = a_Cfg.c_Id || a_DftId;
	//	stCssUtil.cSetCssc(l_Rst, stStrUtil.cCcat(a_OrigCssc, " ", a_Cfg.c_Cssc));	// CSS样式类
	//	l_Rst.Wse_PcdrLot =		// WSE数据
	//	{
	//		c_From : 0 		// 0=新建；1=先前的；2=正在移除（暂不支持）
	//	};
	////	console.log("创建“" + (a_Cfg.c_Id || a_DftId) + "”");
	//	return l_Rst;
	//}
	//
	//// 获取DOM元素
	//function fGetDomElmt(a_This, a_Cfg, a_OrigCssc, a_DftId)
	//{
	//	var l_Rst = document.getElementById(a_Cfg.c_Id || a_DftId);
	//	if (l_Rst)
	//	{
	//		stCssUtil.cSetCssc(l_Rst, stStrUtil.cCcat(a_OrigCssc, " ", a_Cfg.c_Cssc));	// CSS样式类
	//		l_Rst.Wse_PcdrLot =	// WSE数据
	//		{
	//			c_From : 1
	//		}
	//	}
	//	return l_Rst;
	//}

	// 得到板列
	function fObtnBoaCol(a_This, a_Cfg, a_OrigCssc, a_DftId, a_DftHtmlTag)
	{
		var l_Tag = (a_Cfg.c_HtmlTag || a_DftHtmlTag);
		var l_Id = (a_Cfg.c_HtmlId || a_DftId);
		var l_Cssc = stStrUtil.cCcat(a_OrigCssc, " ", a_Cfg.c_Cssc);
		var l_Rst = stDomUtil.cObtnOne(null, l_Tag, l_Id, l_Cssc, null);

		// 簿记，c_From：0=新建；1=先前的；2=正在移除
		if (! l_Rst.Wse_PcdrLot)
		{ l_Rst.Wse_PcdrLot = {}; }

		l_Rst.Wse_PcdrLot.c_From = (l_Rst.Wse_DomUtil && l_Rst.Wse_DomUtil.c_New) ? 0 : 1;
		return l_Rst;
	}

	// 得到放
	function fObtnPut(a_This, a_WgtName)
	{
		// 找到子控件
		var l_Wgt = a_This.cAcsWgt().cAcsSubWgtByName(a_WgtName);
		if (! l_Wgt)
		{ return null; }

		// 先从e_RmvdPutAry里找，再从文档里找
		var l_Idx = stAryUtil.cFind(a_This.e_RmvdPutAry,
			function (a_Ary, a_Idx, a_Put) { return (a_Put === l_Wgt); });

		var l_OldFrom = -1;
		var l_From = (l_Idx < 0) ? -1 : 1;	// 0=来源；1=先前的；2=正在移除
		var l_PutTgt = ((l_From < 0) ? l_Wgt : a_This.e_RmvdPutAry[l_Idx]).cAcsRndr().cAcsPutTgt();
		if (l_PutTgt)
		{
			if (l_PutTgt.Wse_PcdrLot)	// 记录旧的
			{ l_OldFrom = l_PutTgt.Wse_PcdrLot.c_From; }

			if (l_From < 0) // 位于正在移除地带或放置来源
			{ l_From = (a_This.e_DomRmvd === l_PutTgt.parentNode) ? 2 : 0; }

			l_PutTgt.Wse_PcdrLot
				? (l_PutTgt.Wse_PcdrLot.c_From = l_From)
				: (l_PutTgt.Wse_PcdrLot = { c_From : l_From });	// 来自？

			if (0 == l_From) // 如果来自源，记录父节点
			{
				if (! l_PutTgt.Wse_Put) // 簿记
				{ l_PutTgt.Wse_Put = {}; }

				l_PutTgt.Wse_Put.c_OrigPrn = l_PutTgt.parentNode;
			}
			else
			if (1 == l_From) // 来自e_RmvdPutAry，注销
			{ a_This.e_RmvdPutAry.splice(l_Idx, 1); }
			else
			if (2 == l_From) // 来自e_DomRmvd，注销
			{ a_This.e_DomRmvd.removeChild(l_PutTgt); }

			if (a_This.e_RunCnt > 1)	// 第二次运行时不要修改c_From
			{ l_PutTgt.Wse_PcdrLot.c_From = l_OldFrom; }
		}
		return l_Wgt;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	(function ()
	{
		nWse.fClass(nPick,
			/// 布局
			function atLot(a_Wgt)
			{
				this.e_Wgt = a_Wgt;
			}
			,
			null
			,
			{
				/// 存取控件
				cAcsWgt: function ()
				{
					return this.e_Wgt;
				}
				,
				/// 规划
				/// a_Cfg：Object，配置
				/// {
				/// }
				vcPlan : function (a_Cfg)
				{
					return this;
				}
				,
				/// 运行
				/// a_Prms：Object，参数
				vcRun : function (a_Prms)
				{
					var l_This = this;
					if (! l_This.e_Wgt)
					{ return this; }

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
//
	(function ()
	{
		nWse.fClass(nPick,
			/// 程序化布局
			function tPcdrLot(a_Wgt)
			{
				nPick.atLot.call(this, a_Wgt);
			}
			,
			nPick.atLot
			,
			{
				/// 规划
				/// a_Cfg：Object，配置
				///	{
				/// c_MinWid，c_MaxWid：Number，最小最大宽度，默认128，Number.MAX_VALUE		×这两个直接作用在呈现目标上！
				/// c_MinHgt：Number，最小高度，默认null表示stDomUtil.cGetVwptHgt()			×
				/// c_BrkPnts：Array，断点数组，示例：[0, 640, 960]，必须从0开始，且从小到大排列
				///	c_fBpc：void f(a_Lot)，断点回调函数
				/// }
				vcPlan : function (a_Cfg)
				{
					return this;
				}
				,
				/// 运行
				/// a_Prms：Object，参数
				/// {
				/// c_Env：HTMLElement，环境，将DOM节点添加至此，不要试图获取位置尺寸等几何信息
				/// c_Wid：Number，宽度，布局的要诀在于——只需要知道宽度就够了！
				/// }
				vcRun : function (a_Prms)
				{
					var l_This = this;
					if (! l_This.e_Wgt)
					{ return this; }

					//var l_SubWgts = l_This.e_Wgt.cAcsSubWgts();
					//var i, l_Len = l_SubWgts.length;
					//var l_SubWgt, l_SubWgtRndr;
					//for (i = 0; i<l_Len; ++i)
					//{
					//	l_SubWgt = l_SubWgts[i];
					//	l_SubWgtRndr = l_SubWgt.cAcsRndr();
					//	if (! l_SubWgtRndr) // 跳过没有渲染器的
					//	{ continue; }
					//
					//	// 摆放控件
					//	fLotPutWgt(l_SubWgt, l_SubWgtRndr);
					//}

					return this;
				}
				,
				vcXXX : function ()
				{
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