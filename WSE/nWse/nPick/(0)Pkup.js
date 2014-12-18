/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nPick)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nPick",
		[
			"nWse:PntIptTrkr.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("(0)Pkup.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;
	var tClo = nWse.tClo;
	var tSara = nWse.tSara;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// nPick

	// 创建名字空间nWse.nPick，nWse.nPick.unKnl
	var nPick = nWse.fNmspc(nWse,
		/// 拾取
		function nPick(){});

	var unKnl = nWse.fNmspc(nPick,
		/// 内核
		function unKnl(){});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_TempSara0 = new tSara();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 内部名称

	(function ()
	{
		nWse.fClass(nPick,
			/// 内部名称
			function tInrName()
			{
			},
			null,
			{},
			{
				i_Frmwk: "框架",
				i_Root: "根",
				i_AreaBdr: "区域边框",
				i_VwptBdr: "视口边框",
				i_Hsb: "水平滚动条",
				i_Vsb: "垂直滚动条",
				i_Tib: "标题栏",
				i_Icon: "图标",
				i_Cptn: "标题",
				i_Minz: "最小化",
				i_Nmlz: "常规化",
				i_Maxz: "最大化",
				i_Cls: "关闭",
				i_AnyPkup: "任何拾取物"
			},
			false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 消息

	(function ()
	{
		nWse.fClass(nPick,
			/// 消息
			function tMsg(a_Code, a_Rcvr, a_Sndr)
			{
				this.c_Code = nWse.fIsUdfnOrNull(a_Code) ? nPick.tMsg.tInrCode.i_Ivld : a_Code;
				this.c_Rcvr = a_Rcvr || null;
				this.c_Sndr = a_Sndr || null;
			}
			,
			null
			,
			{
				//
			}
			,
			{
				//
			}
			,
			false);

		nWse.fEnum(nPick.tMsg, function tInrCode() {}, null,
			["ui_GlbBgn", -9999],
			["i_BrsrMsg", -9999],		// 浏览器消息
			"i_OnRbndMainCanv",			// 当重绑主画布时
			["ui_GlbEnd", -9000],
			["ui_FrmwkBgn", -8999],
			["i_PrprOver", -8999],		// 准备完毕，c_Who：atPkup，谁
			"i_UpdName",
			"i_Clctd",
			"i_ManuPickBgn",
			"i_ManuPickEnd",
			"i_AutoPickBgn",
			"i_AutoPickEnd",
			"i_PcdrPickBgn",
			"i_PcdrPickEnd",
			"i_RndPnlsOver",
			"i_TypeArea",
			"i_TypeCtnt",
			["ui_FrmwkEnd", -8000],
			["ui_PnlBgn", -7999],
			["i_Ent", -7999],			// 进栈
			"i_Rsm",					// 恢复（准备离栈期间又被恢复）
			"i_PrprLea",				// 准备离栈
			"i_Lea",					// 离栈
			"i_Ocpy",					// 占据
			"i_Rtrt",					// 后退
			"i_ClsRoot",
			["ui_PnlEnd", -1000],
			["ui_WgtBgn", -999],
			["i_ChgPrmrSta", -999],		// 改变主状态，c_New：tPrmrSta，新主状态
			"i_ChgRelLyr",
			"i_ChgRefFrm",
			"i_ChgDockWay",
			"i_ChgShowMode",
			"i_SetFlag",
			"i_AreaBdr",
			"i_AreaChgd",				// c_Data：tSara，旧区域
			"i_VwptChgd",				// c_Data：tSara，旧视口
			"i_Aded",
			"i_Rmvd",
			"i_InrWgtAdd",				// c_Which：String，名称
			"i_InrWgtDlt",				// c_Which：String，名称
			"i_InrWgtMsg",				// c_Which：String，名称
			["ui_WgtEnd", -100],
			["ui_SpclBgn", -99],
			["i_Any", -99],
			"i_Save",
			"i_Load",
			["i_Ivld", -1],
			["ui_SpclEnd", -1]
		);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 各个枚举

	(function ()
	{
		nWse.fEnum(nPick,
			/// 相对层次
			function tRelLyr() { }
			,
			null
			,
			{
				/// 全部
				i_All : -32768
				,
				/// 最低
				i_Min : -30000
				,
				/// 最高
				i_Max : +30000
				,
				/// 内部最低
				i_InrMin : -30001
				,
				/// 内部最高
				i_InrMax : +30001
				,
				/// 内部下极限
				i_InrLwrLmt : -32767
				,
				/// 内部上极限
				i_InrUprLmt : +32767
			});

		nWse.fEnum(nPick,
			/// 参照系
			function tRefFrm() { }
			,
			null
			,
			{
				/// 呈现坐标系
				i_Prst : 0
				,
				/// 宿主坐标系
				i_Host : 1
				,
				/// 视口坐标系
				i_Vwpt : 2
			});

		var tSBN_i_ = tSara.tBdrNum;
		nWse.fEnum(nPick,
			/// 停靠方式
			function tDockWay() { }
			,
			null
			,
			{
				/// 中中（·）
				i_CtCt : tSBN_i_.i_CtCt.valueOf()
				,
				/// 右中（→）
				i_RtCt : tSBN_i_.i_RtCt.valueOf()
				,
				/// 右上（↗）
				i_RtUp : tSBN_i_.i_RtUp.valueOf()
				,
				/// 中上（↑）
				i_CtUp : tSBN_i_.i_CtUp.valueOf()
				,
				/// 左上（↖）
				i_LtUp : tSBN_i_.i_LtUp.valueOf()
				,
				/// 左中（←）
				i_LtCt : tSBN_i_.i_LtCt.valueOf()
				,
				/// 左下（↙）
				i_LtDn : tSBN_i_.i_LtDn.valueOf()
				,
				/// 中下（↓）
				i_CtDn : tSBN_i_.i_CtDn.valueOf()
				,
				/// 右下（↘）
				i_RtDn : tSBN_i_.i_RtDn.valueOf()
				,
				/// 浮动
				i_Fltg : 9
				,
				/// 水平填充
				i_FillX : 10
				,
				/// 垂直填充
				i_FillY : 11
				,
				/// 水平垂直填充
				i_FillXY : 12
			});

		nWse.fEnum(nPick,
			/// 主状态
			function tPrmrSta() { }
			,
			null
			,
			{
				/// 退出
				i_Exit : -1
				,
				/// 隐藏（不参与布局）
				i_Hide : 0
				,
				/// 不可见（参与布局）
				i_Ivsb : 1
				,
				/// 禁用
				i_Dsab : 2
				,
				/// 等待
				i_Wait : 3
				,
				/// 就绪
				i_Rdy : 4
				,
				/// 焦点
				i_Foc : 5
			});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 拾取物

	var atPkup;
	(function ()
	{
		atPkup = nWse.fClass(nPick,
			/// 拾取物
			/// a_Name：String，名称
			function atPkup(a_Name)
			{
				this.e_Name = a_Name || "";
			}
			,
			null
			,
			{
				/// 验证消息接收者
				cVrfMsgRcvr : function (a_Msg)
				{
					if ((this.e_Name != a_Msg.c_Rcvr) && (nPick.tInrName.i_AnyPkup != a_Msg.c_Rcvr))
					{
						throw new Error("意外接收到消息：c_Code = "
						+ a_Msg.c_Code.toString() + "，c_Rcvr = " + a_Msg.c_Rcvr + "，c_Sndr = " + a_Msg.c_Sndr
						+ "；而实际接收者 = " + this.e_Name);
					}
				}
				,
				/// 处理消息
				/// a_Msg：tMsg
				/// 返回：Number，0=完成；1=继续
				vcHdlMsg : function (a_Msg)
				{
					return 0;
				}
				,
				/// 输入复位
				vcIptRset : function ()
				{
					return this;
				}
				,
				/// 处理输入
				/// a_Ipt：tIpt
				/// 返回：Number，0=完成；1=继续
				vcHdlIpt : function (a_Ipt)
				{
					return 0;
				}
				,
				/// 渲染
				vcRnd : function ()
				{
					return this;
				}
				,
				/// 获取名称
				cGetName : function ()
				{
					return this.e_Name;
				}
				,
				/// 处理自己发送的消息
				dHdlMsgFromSelf : function (a_Code, a_Data)
				{
					var l_Msg = new nPick.tMsg(a_Code, this.e_Name, this.e_Name);
					if (undefined !== a_Data)
					{
						l_Msg.c_Data = a_Data;
					}
					this.vcHdlMsg(l_Msg);
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
// 拾取报告

	var tPickRpt;
	(function ()
	{
		tPickRpt = nWse.fClass(nPick,
			/// 报告
			function tPickRpt()
			{
				this.e_CanvWid = 0;
				this.e_CavnHgt = 0;

				this.e_IdClo = tClo.i_White; // rgba(1, 1, 1, 1)

				this.e_FrmIdx = -1;
				this.e_Tchs = null;

				//	this.e_Wgts = [];	// 一次只拾取一个，不用数组
				this.e_Wgt = null;

				this.e_CanvPrstArea = new tSara();
			}
			,
			null
			,
			{
				eInit : function (a_FrmIdx, a_Tchs)
				{
					this.e_FrmIdx = a_FrmIdx;
					this.e_Tchs = a_Tchs;

					var l_This = this;
					stAryUtil.cFor(a_Tchs,
						function (a_Ary, a_Idx, a_Tch)
						{
							// 补充几个字段
							a_Tch.c_InCanv = l_This.eIsTchInCanv(a_Tch.c_CanvX, a_Tch.c_CanvY);
							a_Tch.c_PkdWgt = null;
							a_Tch.e_CanPick = false; // 只在这个控件拾取期间有效，下一个控件将会覆盖
						});

					//	this.e_Wgts.length = 0;
					this.e_Wgt = null;
				}
				,
				eIsTchInCanv : function (a_CanvX, a_CanvY)
				{
					return	(0 <= a_CanvX) && (a_CanvX < this.e_CanvWid) && (0 <= a_CanvY) && (a_CanvY < this.e_CanvHgt);
				}
				,
				eCanPick : function (a_PrstArea)
				{
					//var l_CanvPrstArea = this.e_CanvPrstArea;
					//tSara.scAsn(l_CanvPrstArea, a_GuiPrstArea);
					//nPick.stFrmwk.cDoCanvFromGui(l_CanvPrstArea, true);

					var l_Rst = false;
					stAryUtil.cFor(this.e_Tchs,
						function (a_Ary, a_Idx, a_Tch)
						{
							// 该触点必须在画布里，且当前尚未拾取到任何控件，且显示区包含该触点
							a_Tch.e_CanPick = a_Tch.c_InCanv && (null == a_Tch.c_PkdWgt) &&
												tSara.scCtan$Xy(a_PrstArea, a_Tch.c_X, a_Tch.c_Y);
							if (a_Tch.e_CanPick)
							{
								l_Rst = true;
							}
						});
					return l_Rst;
				}
				,
				/// 生成标识符颜色
				///【说明】若返回null表示不可能被拾取到，否则使用返回的颜色进行绘制
				cGnrtIdClo : function (a_Wgt)
				{
					var l_PA = s_TempSara0;
					a_Wgt.cCalcPrstArea(l_PA);
					if (! this.eCanPick(l_PA))
					{
						return null;
					}

					// 可能被拾取到，记录
					//	this.e_Wgts.push(a_Wgt);
					this.e_Wgt = a_Wgt;
					return this.e_IdClo;

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
// 控件拾取器

	(function ()
	{
		var tWgtPkr = nWse.fClass(unKnl,
			/// 动画管理器
			function tWgtPkr()
			{
				//	console.log("创建tWgtPkr");

				this.e_PnlStk = null;			// 面板栈
				this.e_Mode = 0;				// 模式
				this.e_Rpt = new tPickRpt();	// 报告
				this.e_PendTchs = [];			// 待定触点
				this.e_Rsts = [];				// 结果 { c_TchId, c_PkdWgt }

				this.eOnPrstTgtLost();
			}
			,
			null
			,
			{
				eOnPrstTgtLost : function ()
				{
					//// 标识符画布
					//var l_MainCanv = stRltmAfx.cAcsMainCanv();
					//if (this.e_IdCanv && (this.e_IdCanv.width == l_MainCanv.width) && (this.e_IdCanv.height == l_MainCanv.height))
					//{
					//	return;
					//}
					//
					//this.e_IdCanv = document.createElement("canvas");
					//this.e_IdCanv.width = l_MainCanv.width;
					//this.e_IdCanv.height = l_MainCanv.height;
					//
					//if (2 == nPick.stFrmwk.cGetGpuDvcDim())
					//{
					//	this.e_IdCtxt = this.e_IdCanv.getContext("2d");
					//}
					//
					//// 报告记录宽高
					//this.e_Rpt.e_CanvWid = l_MainCanv.width;
					//this.e_Rpt.e_CanvHgt = l_MainCanv.height;
				}
				,
				/// 获取帧号
				cGetFrmNum : function ()
				{
					return this.e_Rpt.e_FrmIdx;
				}
				,
				/// 存取结果
				cAcsRsts : function ()
				{
					return this.e_Rsts;
				}
				,
				/// 拾取开始
				///【警告】内部直接引用a_Tchs和a_Pnls，不要修改它们！
				/// a_Tchs类型是Array，元素类型是Object，需含有字段c_CanvX，c_CanvY
				/// 返回：false=没有拾取到，true=待定
				ePickBgn : function (a_FrmIdx, a_Tchs)
				{
					// 已经开始？
					if (1 == this.e_Mode)
					{
						// 先结束
						this.ePickEnd(false);
					}

					// 检查实参
					if (stAryUtil.cIsEmt(a_Tchs))
					{
						return false;
					}

					// 检查面板栈
					this.e_PnlStk = nPick.stFrmwk.cAcsPnlStk();
					if (0 == this.e_PnlStk.length)
					{
						return false;
					}

					// 初始化报告，记录待定触点
					this.e_Rpt.eInit(a_FrmIdx, a_Tchs);

					var l_PendTchs = this.e_PendTchs;
					l_PendTchs.length = 0;
					stAryUtil.cFor(this.e_Rpt.e_Tchs,
						function (a_Ary, a_Idx, a_Tch) { if (a_Tch.c_InCanv) { l_PendTchs.push(a_Tch); } });
					if (0 == l_PendTchs.length)
					{
						return false;
					}

					// 拾取！
					if (! this.ePick())
					{
						return false;
					}

					// 开始
					this.e_Mode = 1;
					return true;
				}
				,
				/// 拾取结束
				/// 返回：Boolean，成败，用来轮询结果
				ePickEnd : function (a_Rdbk)
				{
					// 尚未开始？
					if (0 == this.e_Mode)
					{
						return true;
					}

					// 回读
					if (a_Rdbk)
					{
						if (! this.eRdbk())
						{
							return false;
						}
					}
					else // 丢弃
					{
						// 清空结果
						this.eClrRsts();
					}

					// 未正在拾取
					this.e_Mode = 0;
					return true;
				}
				,
				ePick : function ()
				{
					// 切换画布
					var stGpuDvc = nPick.stFrmwk.cAcsGpuDvc();
					var l_OldCanv = stGpuDvc.cAcsCanv();
					stGpuDvc.cBindCanv(this.e_IdCanv);

					// 设置裁剪区
					//	stGpuDvc.cPushCanvCtxtSta();	// 不用复杂逻辑
					var l_IdCtxt = stGpuDvc.cAcsCtxt();
					l_IdCtxt.save();
					l_IdCtxt.beginPath();
					stAryUtil.cFor(this.e_PendTchs,
						function (a_Ary, a_Idx, a_Tch) { l_IdCtxt.rect(a_Tch.c_CanvX, a_Tch.c_CanvY, 1, 1); });
					l_IdCtxt.clip();

					// 清理，注意是在裁剪后进行这一步，因为只需要清理触点所在的像素
					l_IdCtxt.clearRect(0, 0, this.e_IdCanv.width, this.e_IdCanv.height);

					//【注意】拾取顺序与渲染顺序恰好相反！！
					// 栈顶→栈底
					var i, l_Len = this.e_PnlStk.length;
					for (i=l_Len-1; i>=0; --i)
					{
						this.ePickWgtTree(this.e_PnlStk[i].cAcsRoot());

						// 没有待定触点了？
						if (0 == this.e_PendTchs.length)
						{
							break;
						}
					}

					// 清除裁剪区
					//	stGpuDvc.cPopCanvCtxtSta();	// 不用复杂逻辑
					l_IdCtxt.restore();

					// 还原画布
					stGpuDvc.cBindCanv(l_OldCanv);
					return true;
				}
				,
				ePickWgtTree : function (a_Root)
				{
					//---- 2d，以下代码
					//	if (2 == nPick.stFrmwk.cGetGpuDvcDim())

					// 子控件
					if (a_Root.cIsHost())
					{
						// 从前向后
						var l_Ary = a_Root.e_SubWgts, i, l_Len = l_Ary.length;
						for (i=0; i<l_Len; ++i)
						{
							this.ePickWgtTree(l_Ary[i]); // 递归

							// 没有待定触点了？
							if (0 == this.e_PendTchs.length)
							{
								return;
							}
						}
					}

					// 拾取子树的根
					this.ePickWgt(a_Root);
				}
				,
				ePickWgt : function (a_Wgt)
				{
					// 拾取
					a_Wgt.vcPick(this.e_Rpt);

					// 如果不可能被拾取到
					if (! this.e_Rpt.e_Wgt)
					{
						return;
					}

					// 现在可能被拾取到，由于一次只拾取一个，立即回读
					var stGpuDvc = nPick.stFrmwk.cAcsGpuDvc();
					var l_IdCtxt = stGpuDvc.cAcsCtxt();
					var l_PendTchs = this.e_PendTchs, i, l_Len = l_PendTchs.length, l_PendTch;
					var l_ImgData = null;
					for (i=0; i<l_Len; ++i)
					{
						// 跳过不可能拾取到的触点
						l_PendTch = l_PendTchs[i];
						if (! l_PendTch.e_CanPick)
						{ continue; }

						// 检索图像数据，如果像素的a分量≥128，就认为被拾取到！
						l_ImgData = l_IdCtxt.getImageData(l_PendTch.c_CanvX, l_PendTch.c_CanvY, 1, 1);
						//	console.log(l_ImgData.data[0]);
						if (l_ImgData.data[3] >= 128)
						{
							// 记录触点，并从待定触点数组中移除
							l_PendTch.c_PkdWgt = a_Wgt;
							l_PendTchs.splice(i, 1);
							//	console.log("拾取到：" + a_Wgt.cAcsPnl().e_Name + " -> " + a_Wgt.e_Name);
							break;
						}
					}
				}
				,
				eClrRsts : function ()
				{
					if (this.e_Rsts.length > 0)
					{
						this.e_Rsts.length = 0;
					}
				}
				,
				eRdbk : function ()
				{
					// 由于一次只拾取一个，在ePickWgt里就已回读，所以这个函数总是返回成功

					var l_Rsts = this.e_Rsts;
					l_Rsts.length = 0;

					stAryUtil.cFor(this.e_Rpt.e_Tchs,
						function (a_Ary, a_Idx, a_Tch)
						{
							l_Rsts.push({
								c_TchId : a_Tch.c_TchId,
								c_Kind : a_Tch.c_Kind,
								c_CanvX : a_Tch.c_CanvX,
								c_CanvY : a_Tch.c_CanvY,
								c_InCanv : a_Tch.c_InCanv,
								c_PkdWgt : a_Tch.c_PkdWgt
							});
						});

					return true;
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