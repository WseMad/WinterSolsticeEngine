﻿/*
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
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stStrUtil = nWse.stStrUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;

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

	// tLot摆放控件
	function fLotPutWgt(a_Wgt, a_Rndr)
	{

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
				/// 运行
				vcRun : function (a_Cfg)
				{
					var l_This = this;
					if (! l_This.e_Wgt)
					{ return this; }

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
				/// 存取控件
				cAcsWgt: function ()
				{
					return this.e_Wgt;
				}
				,
				/// 运行
				/// a_Cfg：Object，配置对象
				///	{
				/// c_MinWid，c_MaxWid：Number，最小最大宽度，默认128，Number.MAX_VALUE
				/// c_MinHgt：Number，最小高度，默认null表示stDomUtil.cGetVwptHgt()
				/// c_BrkPnts：Array，断点数组，示例：[0, 480, 960]，必须从0开始，且从小到大排列
				///	c_fBpc：void f(a_Lot)，断点回调函数
				vcRun : function ()
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