/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tBtn)
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
	console.log(".fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;

	var nPick = nWse.nPick;
	var unKnl = nPick.unKnl;
	var tFrmIpt = nPick.tFrmIpt;
	var tInrName = nPick.tInrName;
	var tMsg = nPick.tMsg;
	var atPkup = nPick.atPkup;
	var tRelLyr = nPick.tRelLyr;
	var tRefFrm = nPick.tRefFrm;
	var tDockWay = nPick.tDockWay;
	var tPrmrSta = nPick.tPrmrSta;
	var stFrmwk = nPick.stFrmwk;
	var tWgt = nPick.tWgt;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 按钮

	var tBtn;
	(function ()
	{
		tBtn = nWse.fClass(nPick,
			/// 按钮
			function tBtn(a_Name, a_RelLyr, a_RefFrm, a_DockWay)
			{
				this.odBase(tBtn).odCall(a_Name, a_RelLyr, a_RefFrm, a_DockWay);

				//---- 字段

				this.e_Prsn = false;	// 按压？
			}
			,
			tWgt
			,
			{
				/// 输入复位
				vcIptRset : function ()
				{
					//【为了支持IE8，用后一种的写法】
				//	this.odBase(f).odCall();
					this.constructor.oc_tBase.prototype.vcIptRset.call(this);

					this.e_Prsn = false;
				}
				,
				///// 处理输入
				///// a_Ipt：tIpt
				///// 返回：Number，0=完成；1=继续
				//vcHdlIpt : function f(a_Ipt)
				//{
				//	return 0;
				//}
				//,
				/// 处理来自支配触点的输入
				/// a_DmntTchIdx：Number，支配触点索引
				/// a_DmntTch：Object，支配触点
				vdHdlIptFromDmntTch : function (a_Ipt, a_DmntTchIdx, a_DmntTch)
				{
				//	this.odBase(f).odCall(a_Ipt, a_DmntTchIdx, a_DmntTch);
					this.constructor.oc_tBase.prototype.vdHdlIptFromDmntTch.call(this, a_Ipt, a_DmntTchIdx, a_DmntTch);
					if (a_DmntTch.c_Hdld)
					{ return; }

					if (tFrmIpt.tKind.i_TchBgn == a_DmntTch.c_Kind)
					{
						this.e_Prsn = true;
					}
					//else // 不用了，已在基类处理，并回调vcIptRset
					//if (tFrmIpt.tKind.i_TchEnd == a_DmntTch.c_Kind)
					//{
					//	this.e_Prsn = true;
					//}
				}
				,
				/// 正在按压？
				cIsPrsn : function ()
				{
					return this.e_Prsn;
				}
			}
			,
			{
				//
			}
			,
			false);

		nWse.fClass(tBtn,
			/// 渲染器
			function tRndr(a_Wgt)
			{
				this.odBase(tRndr).odCall(a_Wgt);
			}
			,
			tWgt.tRndr
			,
			{
				/// 当控件绘制时
				vdOnWgtDraw : function ()
				{
					var stGpuDvc = stFrmwk.cAcsGpuDvc();
					var stGpuPrt = stGpuDvc.cAcsGpuPrt();

					var l_Wgt = this.cAcsWgt();
					var l_CastShdw = this.cGetCastShdw();

					if (l_Wgt.cIsPrsn())
					{
						var sc_ = tWgt.tRndr.sc_;
						stGpuDvc.cAcsWldCsm().cTslt(0, sc_.sc_ShdwOfstY);
						this.cSetCastShdw(false);
					}

					// 基类版本
				//	this.odBase(f).odCall();
					this.constructor.oc_tBase.prototype.vdOnWgtDraw.call(this);

					if (l_Wgt.cIsPrsn())
					{
						stGpuDvc.cUseWldCsm();
						this.cSetCastShdw(l_CastShdw);
					}

					// 按压时绘制掩膜
					if (l_Wgt.cIsPrsn() && this.cHasBodyPath())
					{
						stGpuDvc.cCfgDrawStl(tWgt.tRndr.sc_.sc_MaskClo);
						stGpuDvc.cSetGlbAph(this.cGetPsa_Aph());
						stGpuDvc.cDrawPath_GuiCs(null);//this.cAcsBodyPath()); // 身体路径应该已在基类版本构建完

						// 复位
						stGpuDvc.cSetGlbAph();
					}
				}
				,
				/// 重建身体路径
				vdRcrtBodyPath : function ()
				{
					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();
					var l_RcRds = this.cGetRcRds();

					var sc_ = tWgt.tRndr.sc_;

					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						this.e_BodyPath.cRset().cRcRect(false, l_DA.c_X, l_DA.c_Y, l_DA.c_W, l_DA.c_H - sc_.sc_ShdwOfstY, l_RcRds);
					}
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