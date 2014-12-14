/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tGsb)
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
// 通用滚动条

	var tGsb;
	(function ()
	{
		tGsb = nWse.fClass(nPick,
			/// 通用滚动条
			function tGsb()
			{
				this.cRset();
			}
			,
			null
			,
			{
				/// 重置
				cRset : function ()
				{
					this.c_SttPart = 0;
					this.c_Down_L = false;
					this.c_PrsBgn_L = false;
					this.c_DragThumb = false;
					this.c_TchBgnPos = 0;
				}
				,
				/// 输入复位
				cIptRset : function ()
				{
					this.cRset();
				}
				,
				/// 处理输入
				cHdlIpt : function (a_Ipt, a_DmntTchIdx, a_DmntTch,
									a_Hrzt,
									a_Dspl,
									a_AreaDim,
									a_VwptPos,
									a_VwptDim,
									a_GsbCpnts)
				{
					var l_Dta = 0;

					// 触点操作
					var l_TchPos = a_Hrzt ? a_DmntTch.c_GuiX : a_DmntTch.c_GuiY;
					var l_TchOfst = a_Hrzt ? a_DmntTch.c_GuiOfstX : a_DmntTch.c_GuiOfstY;

					// 判断触点所在部分
					var l_MinPos = a_GsbCpnts[2], l_MaxPos = a_GsbCpnts[1];

					var l_CrtPart = -1;
					if ((a_GsbCpnts[2] <= l_TchPos) && (l_TchPos < a_GsbCpnts[2] + a_GsbCpnts[3]))
					{ l_CrtPart = 2; }
					else
					if ((a_GsbCpnts[4] <= l_TchPos) && (l_TchPos < a_GsbCpnts[4] + a_GsbCpnts[5]))
					{ l_CrtPart = 4; }
					else
					if ((a_GsbCpnts[6] <= l_TchPos) && (l_TchPos < a_GsbCpnts[6] + a_GsbCpnts[7]))
					{ l_CrtPart = 6; }

					// 未拖动滑块，且不在滚动条范围内
					if ((! this.c_DragThumb) && (l_CrtPart < 0))
					{
						this.cRset();
						return l_Dta;
					}

					// 左键弹起时复位标志
					if (tFrmIpt.tKind.i_TchEnd == a_DmntTch.c_Kind)
					{
						this.cRset();
						a_DmntTch.c_Hdld = true;
						return l_Dta;
					}

					// 记录左键按下
					this.c_Down_L = true;//(tFrmIpt.tKind.i_TchEnd != a_DmntTch.c_Kind);

					// 如果左键敲击
					if (tFrmIpt.tKind.i_TchBgn == a_DmntTch.c_Kind)
					{
						// 记录开始按下的部分
						this.c_SttPart = l_CrtPart;

						// 左键按下开始
						this.c_PrsBgn_L = true;

						if (2 == l_CrtPart)
						{
							l_Dta = (l_TchPos - a_GsbCpnts[4]) / a_GsbCpnts[0];
							if (a_VwptPos + l_Dta < 0)
							{
								l_Dta = -a_VwptPos;
							}
						}
						else
						if (4 == l_CrtPart)
						{
							this.c_DragThumb = true;
							this.c_TchBgnPos = l_TchPos;
						}
						else
						if (6 == l_CrtPart)
						{
							l_Dta = (l_TchPos - a_GsbCpnts[4] - a_GsbCpnts[5]) / a_GsbCpnts[0];
							if (a_VwptPos + l_Dta > a_AreaDim - a_VwptDim)
							{
								l_Dta = a_AreaDim - a_VwptDim - a_VwptPos;
							}
						}
					}
					else	// 如果触点移动
					if (tFrmIpt.tKind.i_TchMove == a_DmntTch.c_Kind)
					{
						if (this.c_DragThumb)
						{
							var l_Ofst = l_TchPos - this.c_TchBgnPos;
							var l_UpDn = 0;
							if (a_GsbCpnts[4] + l_Ofst < l_MinPos)
							{
								l_Ofst = l_MinPos - a_GsbCpnts[4];
								l_UpDn = -1;
							}
							else
							if (a_GsbCpnts[4] + l_Ofst > l_MaxPos)
							{
								l_Ofst = l_MaxPos - a_GsbCpnts[4];
								l_UpDn = +1;
							}

							l_Dta = Math.floor(Math.abs(l_Ofst) / a_GsbCpnts[0] + 0.5);
							if (l_Ofst < 0)
							{
								l_Dta = -l_Dta;
							}

							if (l_Dta != 0)	// 如果有移动，重置拖动起始位置
							{
								this.c_TchBgnPos = l_TchPos;
							}

							//【注意】
							// 因为各零件位置尺寸对齐像素，导致误差存在，并在滑动过程中累计
							// 可能会出现这样的情况：滑块已达极限位置，但视口并未停靠到区域两端，在这里强制视口停靠
							if ((a_GsbCpnts[4] == l_MinPos) && (0 < a_VwptPos) && (l_UpDn < 0))	// 上极限
							{
								l_Dta = -a_VwptPos;
							}
							else
							if ((a_GsbCpnts[4] == l_MaxPos) && (a_VwptPos < a_AreaDim - a_VwptDim) && (l_UpDn > 0))	// 下极限
							{
								l_Dta = a_AreaDim - a_VwptDim - a_VwptPos;
							}
						}
						else
						{
							if ((! this.c_PrsBgn_L) || (l_CrtPart != this.c_SttPart))
							{
								this.c_PrsBgn_L = false;
								a_DmntTch.c_Hdld = true;
								return l_Dta;
							}
						}
					}

					//	console.log("位于" + l_CrtPart);
					a_DmntTch.c_Hdld = true;
					return l_Dta;
				}
			}
			,
			{
				sc_ :
				{
					/// 滑块最小尺寸，默认4
					sc_ThumbMinDim : 4
				}
				,
				/// 计算部件位置大小
				/// a_Rst为Number[]，各索引含义：
				/// [0]=PPI，每一项占据的单位数，即条长度/a_AreaDim；
				/// [1]=最大位置；
				/// [2],[3]=DecShfPos,DecShfDim，递减手柄位置和大小；
				/// [4],[5]=ThumbPos,ThumbDim，滑块位置和大小；
				/// [6],[7]=IncShfPos,IncShfDim，递增手柄位置和大小；
				scCalcCpntPosDim : function (a_Rst,
											 a_Hrzt,
											 a_Dspl,
											 a_AreaDim,
											 a_VwptPos,
											 a_VwptDim)
				{
					var l_DsplPos = a_Hrzt ? a_Dspl.c_X : a_Dspl.c_Y;
					var l_DsplDim = a_Hrzt ? a_Dspl.c_W : a_Dspl.c_H;
					var l_BarDim = l_DsplDim;
					var i_TMD = tGsb.sc_.sc_ThumbMinDim;

					a_Rst[0] = l_BarDim / a_AreaDim;
					a_Rst[4] = Math.floor(a_Rst[0] * a_VwptPos + l_DsplPos + 0.5);	// 对齐像素
					a_Rst[5] = Math.floor(a_VwptDim * a_Rst[0] + 0.5);	// 对齐像素

					var l_MinPos = l_DsplPos;
					var l_MaxPos = l_MinPos + l_BarDim - a_Rst[5];
					a_Rst[1] = l_MaxPos;

					if (a_Rst[5] < i_TMD) // 滑块尺寸低于最小值，重新计算比例和滑块位置尺寸
					{
						l_MaxPos = l_MinPos + l_BarDim - i_TMD;
						a_Rst[0] = (l_MaxPos - l_MinPos) / (a_AreaDim - a_VwptDim);
						a_Rst[4] = Math.floor(a_Rst[0] * a_VwptPos + l_DsplPos + 0.5);	// 对齐像素
						a_Rst[5] = i_TMD;
					}

					a_Rst[2] = l_MinPos;					a_Rst[3] = a_Rst[4] - l_MinPos;
					a_Rst[6] = a_Rst[4] + a_Rst[5];			a_Rst[7] = l_BarDim - a_Rst[3] - a_Rst[5];
				}
			}
			,
			false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 垂直滚动条

	var tVsb;
	(function ()
	{
		tVsb = nWse.fClass(nPick,
			/// 垂直滚动条
			function tVsb(a_Host)
			{
				this.odBase(tVsb).odCall(tInrName.i_Vsb, tRelLyr.i_InrMax, tRefFrm.i_Vwpt, tDockWay.i_RtDn);

				//---- 字段

				this.e_GsbCpnts = new Array(8);		// Gsb的各个组件
				this.e_Gsb = new tGsb();

				this.eUpdArea(a_Host);
				this.cAcsRndr().cSetBodyClo(tClo.i_Orange);
				this.cAcsRndr().cAcsBodyPath();
			}
			,
			tWgt
			,
			{
				/// 输入复位
				vcIptRset : function ()
				{
				//	this.odBase(f).odCall();
					tWgt.prototype.vcIptRset.call(this);

					// 输入复位
					this.e_Gsb.cIptRset();
				}
				,
				/// 刷新
				vdRfsh : function ()
				{
				//	this.odBase(f).odCall();
					tWgt.prototype.vdRfsh.call(this);

					this.eUpdArea(this.cAcsHost());
				}
				,
				eUpdArea : function (a_Host)
				{
					if (! a_Host) // 如果为空，稍后一定会再次被调用
					{ return; }

					var l_Dim = 4;
					this.cSetArea$Xywh(0, l_Dim, l_Dim, a_Host.cGetVwptH() - l_Dim);

					var l_DA = this.cAcsDsplArea();
					tGsb.scCalcCpntPosDim(this.e_GsbCpnts, false, l_DA, a_Host.cAcsArea().c_H, a_Host.cGetVwptY(), a_Host.cGetVwptH());
					//	console.log("eUpdArea : " + this.e_Area.c_H);
				}
				,
				/// 处理来自支配触点的输入
				/// a_DmntTchIdx：Number，支配触点索引
				/// a_DmntTch：Object，支配触点
				vdHdlIptFromDmntTch : function (a_Ipt, a_DmntTchIdx, a_DmntTch)
				{
				//	this.odBase(f).odCall(a_Ipt, a_DmntTchIdx, a_DmntTch);
					tWgt.prototype.vdHdlIptFromDmntTch.call(this, a_Ipt, a_DmntTchIdx, a_DmntTch);
					if (a_DmntTch.c_Hdld)
					{ return; }

					var l_DA = this.cAcsDsplArea();
					var l_Host = this.cAcsHost();
					var l_Dta = this.e_Gsb.cHdlIpt(a_Ipt, a_DmntTchIdx, a_DmntTch,
						false, l_DA, l_Host.cAcsArea().c_H, l_Host.cGetVwptY(), l_Host.cGetVwptH(), this.e_GsbCpnts);

					if (0 != l_Dta)
					{
						l_Host.cMoveVwpt(0, l_Dta);
					}
				}
			}
			,
			{
				//
			}
			,
			false);

		nWse.fClass(tVsb,
			/// 渲染器
			function tRndr(a_Wgt)
			{
				this.odBase(tRndr).odCall(a_Wgt);

				if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
				{
					this.e_ThumbPath = new nWse.n2d.tPath();
				}
			}
			,
			tWgt.tRndr
			,
			{
				/// 重建身体路径
				vdRcrtBodyPath : function ()
				{
					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();
					var l_Host = l_Wgt.cAcsHost();
					var l_Cpnts = l_Wgt.e_GsbCpnts;

					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						this.e_BodyPath.cRset()
							.cCaps(false, l_DA.c_X, l_DA.c_Y, l_DA.c_W, l_DA.c_H);

						this.e_ThumbPath.cRset()
							.cCaps(false, l_DA.c_X, l_Cpnts[4], l_DA.c_W, l_Cpnts[5]);
					}
				}
				,
				/// 当控件绘制时
				vdOnWgtDraw : function ()
				{
					var stGpuDvc = stFrmwk.cAcsGpuDvc();
					var stGpuPrt = stGpuDvc.cAcsGpuPrt();

					var l_Wgt = this.cAcsWgt();
					var l_DA = l_Wgt.cAcsDsplArea();
					//	var l_Host = l_Wgt.cAcsHost();

					// 基类版本
				//	this.odBase(f).odCall();
					tWgt.prototype.vdOnWgtDraw.call(this);

					// 绘制滑块
					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						stGpuDvc.cCfgDrawStl(tClo.i_Green);
						stGpuDvc.cSetGlbAph(this.cGetPsa_Aph());
						stGpuDvc.cDrawPath_GuiCs(this.e_ThumbPath);

						// 复位
						stGpuDvc.cSetGlbAph();
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
// 水平滚动条

	var tHsb;
	(function ()
	{
		tHsb = nWse.fClass(nPick,
			/// 水平滚动条
			function tHsb(a_Host)
			{
				this.odBase(tHsb).odCall(tInrName.i_Hsb, tRelLyr.i_InrMax, tRefFrm.i_Vwpt, tDockWay.i_RtDn);
				//	console.log("tHsb");
				//---- 字段

				this.e_GsbCpnts = new Array(8);		// Gsb的各个组件
				this.e_Gsb = new tGsb();

				this.eUpdArea(a_Host);
				this.cAcsRndr().cSetBodyClo(tClo.i_Orange);
				this.cAcsRndr().cAcsBodyPath();
			}
			,
			tWgt
			,
			{
				/// 输入复位
				vcIptRset : function ()
				{
				//	this.odBase(f).odCall();
					tWgt.prototype.vcIptRset.call(this);

					// 输入复位
					this.e_Gsb.cIptRset();
				}
				,
				/// 刷新
				vdRfsh : function ()
				{
				//	this.odBase(f).odCall();
					tWgt.prototype.vdRfsh.call(this);

					this.eUpdArea(this.cAcsHost());
				}
				,
				eUpdArea : function (a_Host)
				{
					if (! a_Host) // 如果为空，稍后一定会再次被调用
					{ return; }

					var l_Dim = 4;
					this.cSetArea$Xywh(l_Dim, 0, a_Host.cGetVwptW() - l_Dim, l_Dim);

					var l_DA = this.cAcsDsplArea();
					tGsb.scCalcCpntPosDim(this.e_GsbCpnts, true, l_DA, a_Host.cAcsArea().c_W, a_Host.cGetVwptX(), a_Host.cGetVwptW());
					//	console.log("eUpdArea : " + this.e_Area.c_H);
				}
				,
				/// 处理来自支配触点的输入
				/// a_DmntTchIdx：Number，支配触点索引
				/// a_DmntTch：Object，支配触点
				vdHdlIptFromDmntTch : function (a_Ipt, a_DmntTchIdx, a_DmntTch)
				{
				//	this.odBase(f).odCall(a_Ipt, a_DmntTchIdx, a_DmntTch);
					tWgt.prototype.vdHdlIptFromDmntTch.call(this, a_Ipt, a_DmntTchIdx, a_DmntTch);
					if (a_DmntTch.c_Hdld)
					{ return; }

					var l_DA = this.cAcsDsplArea();
					var l_Host = this.cAcsHost();
					var l_Dta = this.e_Gsb.cHdlIpt(a_Ipt, a_DmntTchIdx, a_DmntTch,
						true, l_DA, l_Host.cAcsArea().c_W, l_Host.cGetVwptX(), l_Host.cGetVwptW(), this.e_GsbCpnts);

					if (0 != l_Dta)
					{
						l_Host.cMoveVwpt(l_Dta, 0);
					}
				}
			}
			,
			{
				//
			}
			,
			false);

		nWse.fClass(tHsb,
			/// 渲染器
			function tRndr(a_Wgt)
			{
				this.odBase(tRndr).odCall(a_Wgt);

				if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
				{
					this.e_ThumbPath = new nWse.n2d.tPath();
				}
			}
			,
			tWgt.tRndr
			,
			{
				/// 重建身体路径
				vdRcrtBodyPath : function ()
				{
					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();
					var l_Host = l_Wgt.cAcsHost();
					var l_Cpnts = l_Wgt.e_GsbCpnts;

					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						this.e_BodyPath.cRset()
							.cCaps(false, l_DA.c_X, l_DA.c_Y, l_DA.c_W, l_DA.c_H);

						this.e_ThumbPath.cRset()
							.cCaps(false, l_Cpnts[4], l_DA.c_Y, l_Cpnts[5], l_DA.c_H);
					}
				}
				,
				/// 当控件绘制时
				vdOnWgtDraw : function ()
				{
					var stGpuDvc = stFrmwk.cAcsGpuDvc();
					var stGpuPrt = stGpuDvc.cAcsGpuPrt();

					var l_Wgt = this.cAcsWgt();
					var l_DA = l_Wgt.cAcsDsplArea();
					//	var l_Host = l_Wgt.cAcsHost();

					// 基类版本
				//	this.odBase(f).odCall();
					tWgt.prototype.vdOnWgtDraw.call(this);

					// 绘制滑块
					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						stGpuDvc.cCfgDrawStl(tClo.i_Green);
						stGpuDvc.cSetGlbAph(this.cGetPsa_Aph());
						stGpuDvc.cDrawPath_GuiCs(this.e_ThumbPath);

						// 复位
						stGpuDvc.cSetGlbAph();
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