/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick && l_Glb.nWse.nPick.tRndr)
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
	console.log("Rndr.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var stStrUtil = nWse.stStrUtil;

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

	function fMapAphEnd(a_Rndr, a_New)
	{
		var l_Wgt = a_Rndr.e_Wgt;
		var l_RootRndr = l_Wgt.cAcsRoot().cAcsRndr();

		if ((tPrmrSta.i_Exit <= a_New) && (a_New <= tPrmrSta.i_Hide)) { return 0; }
		else if (tPrmrSta.i_Dsab == a_New) { return l_RootRndr.cGetPsa_AphOnWait(); }	// Dsab和Wait的不透明度相同
		else if (tPrmrSta.i_Wait == a_New) { return l_RootRndr.cGetPsa_AphOnWait(); }
		else if (tPrmrSta.i_Rdy == a_New) { return l_RootRndr.cGetPsa_AphOnRdy(); }
		else if (tPrmrSta.i_Semi == a_New) { return l_RootRndr.cGetPsa_AphOnSemi(); }
		else //if (tPrmrSta.i_Foc == a_New)
		{ return l_RootRndr.cGetPsa_AphOnFoc(); }
	}

	// 主状态动画函数，确保只有一个实例
	function fPrmrStaAnmt(a_FrmTime, a_FrmItvl, a_FrmIdx)
	{
		var l_Rst = true;
		var l_Wgt = this.e_Wgt;
		var l_RootRndr = l_Wgt.cAcsRoot().cAcsRndr();
		var l_Dur = l_RootRndr.cGetPsaDur();
		var l_Scl;

		this.e_Psa_AphTimer += a_FrmItvl;

		// 完成
		if (this.e_Psa_AphTimer > l_Dur)
		{
			l_Scl = 1;
			this.e_Psa_AphTimer = 0;
			this.e_Psa_Aph = this.e_Psa_AphEnd;
			l_Rst = false;

			//unKnl.fSetWgtFlag(l_Wgt, 1, false);		// 主状态动画中
			//
			//// 如果此时主状态为i_Exit，通知宿主（一定存在，可为面板）
			//if (tPrmrSta.i_Exit == l_Wgt.e_PrmrSta)
			//{
			//	fSendMsg_PrmrOver(l_Wgt);
			//}
		}
		else // 继续
		{
			l_Scl = this.e_Psa_AphTimer / l_Dur;
			this.e_Psa_Aph = stNumUtil.cPrbItp(this.e_Psa_AphBgn, this.e_Psa_AphEnd, l_Scl, false);
		}
		return l_Rst;
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 控件渲染器

	(function ()
	{
		nWse.fClass(tWgt,
			/// 渲染器
			function tRndr(a_Wgt)
			{
				// 记录控件
				this.e_Wgt = a_Wgt || null;

				// 主状态动画相关字段
				this.e_Psa_Aph = 0;
				this.e_Psa_AphBgn = 0;
				this.e_Psa_AphEnd = 0;
				this.e_Psa_AphTimer = 0;
			}
			,
			null
			,
			{
				/// 存取控件
				cAcsWgt : function ()
				{
					return this.e_Wgt;
				}
				,
				/// 当控件主状态改变时
				vdOnWgtPrmrStaChgd : function f(a_Old, a_New)
				{
					// 主状态动画
					this.dPrmrStaAnmt(a_Old, a_New);
				}
				,
				/// 主状态动画
				dPrmrStaAnmt : function (a_Old, a_New)
				{
					this.e_Psa_AphBgn = this.e_Psa_Aph;
					this.e_Psa_AphEnd = fMapAphEnd(this, a_New);
					this.e_Psa_AphTimer = 0;

					// 对于主状态动画，确保只有一个实例
					stFrmwk.cAcsAnmtMgr().cAdd(this, fPrmrStaAnmt, true);
					unKnl.fSetWgtFlag(this.e_Wgt, 1, true);		// 主状态动画中
				}
				,
				/// 当控件刷新时
				vdOnWgtRfsh : function f()
				{
					// 重建身体路径
					if (this.e_BodyPath)
					{
						this.vdRcrtBodyPath();
					}

					// 重建身体渐变，或更新身体图案变换阵
					if (this.e_BodyDrawStl)
					{
						if (this.e_BodyDrawStl instanceof nWse.n2d.tGrad)
						{
							this.dCrtBodyGrad();
						}
						else
						if (this.e_BodyDrawStl instanceof nWse.n2d.tPten)
						{
							this.dUpdBodyPtenCsm();
						}
					}
				}
				,
				/// 重建身体路径
				vdRcrtBodyPath : function f()
				{
					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();
					var l_RcRds = this.cGetRcRds();

					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						this.e_BodyPath.cRset().cRcRect(false, l_DA.c_X, l_DA.c_Y, l_DA.c_W, l_DA.c_H, l_RcRds);
					}
				}
				,
				/// 当控件裁剪时
				vdOnWgtClip : function ()
				{
					var stGpuDvc = stFrmwk.cAcsGpuDvc();
					var l_Wgt = this.e_Wgt;
					var l_Host, l_HostRndr;

					// 不用裁剪
					if (tRefFrm.i_Dspl == l_Wgt.e_RefFrm)
					{
						//
					}
					else // 同宿主的裁剪路径
					if (tRefFrm.i_Vwpt == l_Wgt.e_RefFrm)
					{
						l_Host = l_Wgt.e_Host;
						if (l_Host && l_Host.cHasRndr())
						{
							l_HostRndr = l_Host.cAcsRndr();
							l_HostRndr.vdOnWgtClip();
						}
					}
					else // 宿主的裁剪路径∩宿主的身体路径
					//	if (tRefFrm.i_Host == l_Wgt.e_RefFrm)
					{
						l_Host = l_Wgt.e_Host;
						if (l_Host && l_Host.cHasRndr())
						{
							l_HostRndr = l_Host.cAcsRndr();
							l_HostRndr.vdOnWgtClip();

							if (l_HostRndr.cHasBodyPath())
							{
								if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
								{
									stGpuDvc.cClipPath_GuiCs(l_HostRndr.cAcsBodyPath());
								}
							}
						}
					}

					return this;
				}
				,
				/// 当控件绘制时
				vdOnWgtDraw : function f()
				{
					// 如果需要，绘制身体
					if (this.e_BodyPath)
					{
						this.dDrawBody();
					}
				}
				,
				/// 绘制身体
				dDrawBody : function ()
				{
					var stGpuDvc = stFrmwk.cAcsGpuDvc();
					var sc_;

					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();

					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						// 身体路径？
						if (this.e_BodyPath)
						{
							stGpuDvc.cCfgDrawStl(this.e_BodyDrawStl);

							// 阴影？
							if (this.e_CastShdw)
							{
								sc_ = tWgt.tRndr.sc_;
								stGpuDvc.cSetShdwClo(sc_.sc_ShdwClo);
								stGpuDvc.cSetShdwBlur(sc_.sc_ShdwBlur);
								stGpuDvc.cSetShdwOfst(sc_.sc_ShdwOfstX, sc_.sc_ShdwOfstY);
							}

							stGpuDvc.cSetGlbAph(this.e_Psa_Aph);
							stGpuDvc.cDrawPath_GuiCs(this.e_BodyPath);

							// 复位
							stGpuDvc.cSetGlbAph();
							if (this.e_CastShdw)
							{
								stGpuDvc.cClrShdw();
							}
						}
					}
				}
				,
				/// 当控件拾取时
				/// a_IdClo：tClo，标识符颜色
				vdOnWgtPick : function f(a_IdClo)
				{
					var stGpuDvc = stFrmwk.cAcsGpuDvc();

					if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
					{
						stGpuDvc.cCfgDrawStl(a_IdClo);

						if (this.e_BodyPath)
						{
							stGpuDvc.cDrawPath_GuiCs(this.e_BodyPath);
						}
						else
						{
							//	console.log("**********************************************cDrawSara_GuiCs");
							stGpuDvc.cDrawSara_GuiCs(this.e_Wgt.cAcsDsplArea());
						}

						//	console.log("vdOnWgtPick : " + this.e_Wgt.e_Name);
					}
				}
				,
				/// 存取身体绘制风格
				cAcsBodyDrawStl : function ()
				{
					return this.e_BodyDrawStl;
				}
				,
				/// 设置身体色，注意身体渐变和身体图案将被停用
				cSetBodyClo : function (a_Clo)
				{
					this.e_BodyDrawStl = a_Clo ? tClo.scCopy(a_Clo) : null;
					return this;
				}
				,
				/// 创建身体渐变
				dCrtBodyGrad : function (a_Dir)
				{
					// 重建？
					if (this.e_BodyDrawStl && this.e_BodyDrawStl.ue_Dir)
					{
						a_Dir = this.e_BodyDrawStl.ue_Dir;
					}
					else // 新建
					{
						this.e_BodyDrawStl = new nWse.n2d.tGrad();
						this.e_BodyDrawStl.ue_Dir = a_Dir || 7;		// 记录方向，默认7
					}

					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();

					var l_Sx, l_Sy, l_Tx, l_Ty;
					var l_DirVal = a_Dir.valueOf();
					switch (l_DirVal)
					{
						case 1: { l_Sx = l_DA.c_X; l_Sy = l_DA.c_Y; l_Tx = l_DA.c_X + l_DA.c_W; l_Ty = l_DA.c_Y; } break;
						case 2: { l_Sx = l_DA.c_X; l_Sy = l_DA.c_Y + l_DA.c_H; l_Tx = l_DA.c_X + l_DA.c_W; l_Ty = l_DA.c_Y; } break;
						case 3: { l_Sx = l_DA.c_X; l_Sy = l_DA.c_Y + l_DA.c_H; l_Tx = l_DA.c_X; l_Ty = l_DA.c_Y; } break;
						case 4: { l_Sx = l_DA.c_X + l_DA.c_W; l_Sy = l_DA.c_Y + l_DA.c_H; l_Tx = l_DA.c_X; l_Ty = l_DA.c_Y; } break;
						case 5: { l_Sx = l_DA.c_X + l_DA.c_W; l_Sy = l_DA.c_Y; l_Tx = l_DA.c_X; l_Ty = l_DA.c_Y; } break;
						case 6: { l_Sx = l_DA.c_X + l_DA.c_W; l_Sy = l_DA.c_Y; l_Tx = l_DA.c_X; l_Ty = l_DA.c_Y + l_DA.c_H; } break;
						default: { l_Sx = l_DA.c_X; l_Sy = l_DA.c_Y; l_Tx = l_DA.c_X; l_Ty = l_DA.c_Y + l_DA.c_H; } break;
						case 8: { l_Sx = l_DA.c_X; l_Sy = l_DA.c_Y; l_Tx = l_DA.c_X + l_DA.c_W; l_Ty = l_DA.c_Y + l_DA.c_H; } break;
					}

					this.e_BodyDrawStl.cCrtLnr(l_Sx, l_Sy, l_Tx, l_Ty, true);
					return this;
				}
				,
				/// 设置身体渐变，注意身体色和身体图案将被停用
				/// a_Dir：Number，取值同tSara.tBdrNum，非1到8的值表示停用
				cSetBodyGrad : function (a_Dir)
				{
					if (! a_Dir)
					{
						this.e_BodyDrawStl = null;	// 停用
					}
					else
					{
						if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
						{
							this.dCrtBodyGrad(a_Dir);
						}
					}
					return this;
				}
				,
				/// 更新身体图案变换阵
				dUpdBodyPtenCsm : function ()
				{
					var l_Wgt = this.e_Wgt;
					var l_DA = l_Wgt.cAcsDsplArea();
					var l_PtenCsm = this.e_BodyDrawStl.cAcsCsm();
					l_PtenCsm.cIdty();
					if (! this.e_BodyDrawStl.cGetMchPxl()) // 不匹配像素时，拉伸以覆盖整个显示区域
					{
						l_PtenCsm.cScl(l_DA.c_W, l_DA.c_H)
					}
					l_PtenCsm.cTslt(l_DA.c_X, l_DA.c_Y); // 移至显示区域左上角
				}
				,
				/// 设置身体图案，注意身体色和身体渐变将被停用
				/// a_Udfn$Rpt：若a_Udfn$MchPxl为true则为n2d.tPtenRpt.i_XY，否则为n2d.tPtenRpt.i_No
				cSetBodyPten : function (a_Img$Cvs$Vid$Uri, a_Udfn$Rpt, a_Udfn$MchPxl)
				{
					if (! a_Img$Cvs$Vid$Uri)
					{
						this.e_BodyDrawStl = null;	// 停用
					}
					else
					{
						if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
						{
							this.e_BodyDrawStl = new nWse.n2d.tPten();
							this.e_BodyDrawStl.cCrt(a_Img$Cvs$Vid$Uri,
								a_Udfn$MchPxl ? nWse.n2d.tPtenRpt.i_XY : nWse.n2d.tPtenRpt.i_No, a_Udfn$MchPxl);
						}
					}
					return this;
				}
				,
				/// 获取投射阴影
				cGetCastShdw : function ()
				{
					return this.e_CastShdw;
				}
				,
				/// 设置投射阴影
				/// a_Rcur：Boolean，递归？
				cSetCastShdw : function (a_YesNo, a_Rcur)
				{
					a_YesNo = !! a_YesNo;
					this.e_CastShdw = a_YesNo;

					if (a_Rcur)
					{
						unKnl.fTrvsWgtSubtree(this.cAcsWgt(),
							function (a_Wgt)
							{
								if (a_Wgt.cAcsRndr())
								{
									a_Wgt.cAcsRndr().cSetCastShdw(a_YesNo, a_Rcur);
								}
							});
					}
					return this;
				}
				,
				/// 有身体路径？
				cHasBodyPath : function ()
				{
					return (null != this.e_BodyPath);
				}
				,
				/// 存取身体路径
				cAcsBodyPath : function ()
				{
					if (! this.e_BodyPath)
					{
						if (2 == stFrmwk.cGetGpuDvcDim()) // 2d
						{
							this.cUseBodyPath(new nWse.n2d.tPath());
						}
					}
					return this.e_BodyPath;
				}
				,
				/// 使用身体路径
				cUseBodyPath : function (a_Path)
				{
					this.e_BodyPath = a_Path || null;
					return this;
				}
				,
				/// 获取圆角半径
				cGetRcRds : function ()
				{
					return this.e_RcRds || 0;
				}
				,
				/// 设置圆角半径
				cSetRcRds : function (a_Rds)
				{
					this.e_RcRds = a_Rds || 0;
					return this;
				}
				,
				/// 获取主状态动画 -- 不透明度
				cGetPsa_Aph : function ()
				{
					return this.e_Psa_Aph;
				}
			}
			,
			{
				/// 公有静态字段
				sc_ :
				{
					/// 阴影色，默认rgba(0, 0, 0, 0.7)
					sc_ShdwClo : tClo.scNew$Rgba(0, 0, 0, 0.7)
					,
					/// 阴影偏移量X，默认0
					sc_ShdwOfstX : 0
					,
					/// 阴影偏移量Y，默认4
					sc_ShdwOfstY : 4
					,
					/// 阴影模糊因子，默认8
					sc_ShdwBlur : 8
					,
					/// 身体掩膜色
					sc_MaskClo : tClo.scNew$Rgba(0.3, 0.3, 0.3, 0.7)
				}
			}
			,
			false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 根渲染器

	(function ()
	{
		nWse.fClass(tRoot,
			/// 渲染器
			function tRndr(a_Wgt)
			{
				this.odBase(tRndr).odCall(a_Wgt);

				// 主状态动画
				this.e_PsaDur = 0.4;
				this.e_Psa_GrayOnDsab = 0.3;
				this.e_Psa_AphOnWait = 0.7;
				this.e_Psa_AphOnRdy = 1;
				this.e_Psa_AphOnSemi = 1;
				this.e_Psa_AphOnFoc = 1
			}
			,
			tWgt.tRndr
			,
			{
				/// 获取主状态动画时长
				cGetPsaDur : function () { return this.e_PsaDur; }
				,
				/// 设置主状态动画时长
				cSetPsaDur : function (a_Dur) { this.e_PsaDur = a_Dur; return this; }
				,
				/// 获取禁用时灰度
				cGetPsa_GrayOnDsab : function () { return this.e_Psa_GrayOnDsab; }
				,
				/// 设置主状态动画时长
				cSetPsa_GrayOnDsab : function (a_Gray) { this.e_Psa_GrayOnDsab = a_Gray; return this; }
				,
				/// 获取等待时不透明度
				cGetPsa_AphOnWait : function () { return this.e_Psa_AphOnWait; }
				,
				/// 设置等待时不透明度
				cSetPsa_AphOnWait : function (a_Aph) { this.e_Psa_AphOnWait = a_Aph; return this; }
				,
				/// 获取就绪时不透明度
				cGetPsa_AphOnRdy : function () { return this.e_Psa_AphOnRdy; }
				,
				/// 设置就绪时不透明度
				cSetPsa_AphOnRdy : function (a_Aph) { this.e_Psa_AphOnRdy = a_Aph; return this; }
				,
				/// 获取半焦点时不透明度
				cGetPsa_AphOnSemi : function () { return this.e_Psa_AphOnSemi; }
				,
				/// 设置半焦点时不透明度
				cSetPsa_AphOnSemi : function (a_Aph) { this.e_Psa_AphOnSemi = a_Aph; return this; }
				,
				/// 获取焦点时不透明度
				cGetPsa_AphOnFoc : function () { return this.e_Psa_AphOnFoc; }
				,
				/// 设置焦点时不透明度
				cSetPsa_AphOnFoc : function (a_Aph) { this.e_Psa_AphOnFoc = a_Aph; return this; }
			}
			,
			{
				// 静态
			}
			,
			false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////