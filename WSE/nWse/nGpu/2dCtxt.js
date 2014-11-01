/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nGpu && l_Glb.nWse.nGpu.t2dCtxt)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nGpu",
		[
			"(0)GpuMath.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("2dCtxt.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var tSara = nWse.tSara;
	var tClo = nWse.tClo;

	var nGpu = nWse.nGpu;
	var unKnl = nGpu.unKnl;
	var t4dVct = nGpu.t4dVct;
	var t4dMtx = nGpu.t4dMtx;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var i_MinFontHgt = 12;			// 最小字体高度，目前已知Chrome要求≥12px
	var s_TempSara0, s_TempSara1, s_TempSara2;

	function fIsSrcImgAvlb(a_SrcImg)
	{
		if (! a_SrcImg)
		{ return false; }

		if ((a_SrcImg instanceof Image))
		{
			return a_SrcImg.complete;
		}
		return true;
	}

	unKnl.fGpuCtxt = function (a_tCtxt)
	{
		nWse.fClassBody(a_tCtxt,
			{
				/// 绑定画布
				/// a_Cvs：HTMLCanvasElement，画布
				cBindCvs: function (a_Cvs)
				{
					// 重绑？
					if (this.e_Cvs === a_Cvs)
					{ return this.cRbndCvs(); }

					// 先解绑以前的
					var l_OldCvs = this.e_Cvs;
					if (this.e_Cvs)
					{ this.cUbndCvs(); }

					// 记录画布并取得上下文
					this.e_Cvs = a_Cvs;
					this.e_Ctxt = this.e_Cvs.getContext("2d");

					// 当重绑画布时
					this.eOnRbndCvs();
					return this;
				}
				,
				/// 重绑画布
				///【警告】如果应用程序修改了画布的属性，必须调用本函数！
				cRbndCvs : function ()
				{
					// 当重绑画布时
					this.eOnRbndCvs();
					return this;
				}
				,
				/// 解绑画布
				cUbndCvs : function ()
				{
					if (null == this.e_Cvs)
					{ return; }

					// 清零
					this.e_Cvs = null;
					this.e_Ctxt = null;

					// 当重绑画布时
					this.eOnRbndCvs();
					return this;
				}
				,
				/// 存取画布
				cAcsCvs : function () { return this.e_Cvs; }
				,
				/// 存取
				cAcs : function () { return this.e_Ctxt; }
				,
				/// 设置画布尺寸
				/// a_Wid：Number，宽度（像素）
				/// a_Hgt：Number，高度（像素）
				cSetCvsDim : function (a_Wid, a_Hgt)
				{
					var l_WidChgd = (this.e_Cvs.width != a_Wid);
					var l_HgtChgd = (this.e_Cvs.height != a_Hgt);
					if (l_WidChgd) { this.e_Cvs.width = a_Wid; }
					if (l_HgtChgd) { this.e_Cvs.height = a_Hgt; }

					// 重绑画布
					return (l_WidChgd || l_HgtChgd) ? this.cRbndCvs() : this;
				}
				,
				/// 获取画布宽度
				cGetCvsWid : function () { return this.e_Cvs.width; }
				,
				/// 获取画布高度
				cGetCvsHgt : function () { return this.e_Cvs.height; }
			});
	};

	function fRsetTsfm(a_This)
	{
		a_This.cAcs().setTransform(1, 0, 0, 1, 0, 0);
	}

	function fSetTsfm(a_This, a_Mtx)
	{
		a_Mtx
			? a_This.cAcs().setTransform(a_Mtx.c_11, a_Mtx.c_12, a_Mtx.c_21, a_Mtx.c_22, a_Mtx.c_41, a_Mtx.c_42)
			: fRsetTsfm(a_This);
	}
	unKnl.fSetTsfm = fSetTsfm;

	function eGetFontHgt(a_This)
	{
		var l_Ctxt = a_This.cAcs();
		var l_Idx_px = l_Ctxt.font.indexOf("px");
		return (l_Idx_px >= 0) ? parseInt(l_Ctxt.font.substr(0, l_Idx_px), 10) : 0;
	}

	function eMesrTextLine(a_This, a_Line, a_LineOK)
	{
		a_This.e_MesrTextRst.c_W = a_This.e_MesrTextRst.c_H = 0;

		if (! a_LineOK)
		{
			a_Line = a_Line.toString();
			if (0 == a_Line.length)
			{ return a_This.e_MesrTextRst; }

			a_Line = nWse.stStrUtil.cExpdTab(a_Line);	// 展开制表符
		}

		a_This.e_MesrTextRst.c_W = a_This.cAcs().measureText(a_Line).width;
		a_This.e_MesrTextRst.c_H = eGetFontHgt(a_This);
		return a_This.e_MesrTextRst;
	}

	function eMesrText(a_This, a_Text, a_LineGap, a_TextOK)
	{
		a_This.e_MesrTextRst.c_W = a_This.e_MesrTextRst.c_H = 0;

		if (! a_TextOK)
		{
			a_Text = a_Text.toString();
			if (0 == a_Text.length)
			{ return a_This.e_MesrTextRst; }

			a_Text = stStrUtil.cExpdTab(a_Text);	// 展开制表符
		}

		// 对每一行进行处理
		var l_LineAry = stStrUtil.cSplToLines(a_Text);
		var l_Idx = stAryUtil.cFindMax(l_LineAry,
			function (a_Tgt, a_Idx, a_Line)
			{
				var l_Rst = 0;
				var i, l_Len = a_Line.length;
				for (i=0; i<l_Len; ++i)
				{
					// ASCII字符占一个位置，Unicode字符占两个
					l_Rst += (a_Line.charCodeAt(i) < 256) ? 1 : 2;
				}
				return l_Rst;
			});

		// 宽度为最宽那行的宽度，高度为行高（包括间距）×行数
		a_This.e_MesrTextRst.c_W = a_This.cAcs().measureText(l_LineAry[l_Idx]).width;
		a_This.e_MesrTextRst.c_H = (eGetFontHgt(a_This) + a_LineGap) * l_LineAry.length - a_LineGap;
		return a_This.e_MesrTextRst;
	}

	function fFixText(a_Text)
	{
		a_Text = a_Text.toString();
		if (0 < a_Text.length)
		{
			a_Text = nWse.stStrUtil.cExpdTab(a_Text);	// 展开制表符
		}
		return a_Text;
	}

	function eDrawTextLine(a_This, a_Line, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx)
	{
		a_Line = fFixText(a_Line);
		if (0 == a_Line.length)
		{ return a_This; }

		if (a_DstSara$DstX instanceof tSara) // tSara, Number
		{
			a_DockWay$DstY = a_DockWay$DstY.valueOf();
		}
		else // Number, Number
		{
			if (! s_TempSara2)
			{ s_TempSara2 = new tSara(); }

			s_TempSara2.c_X = a_DstSara$DstX;
			s_TempSara2.c_Y = a_DockWay$DstY;
			a_DstSara$DstX = s_TempSara2;
			a_DockWay$DstY = -1;	// 不用停靠
		}

		// 如果需要，裁剪
		if (a_ClipPath && a_This.cClipPath)
		{
			a_This.cAcs().save();
			a_This.cClipPath(a_ClipPath, null);	// 和变换阵无关
		}

		// 重置文本对齐和基线
		eRsetTextAlnBsln(a_This);

		// 运行绘制
		if (a_Mtx)
		{ fSetTsfm(a_This, a_Mtx); }

		eRunDrawTextLine(a_This, a_Line, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx);

		if (a_Mtx)
		{ fRsetTsfm(a_This); }

		// 清理
		if (a_ClipPath)
		{
			a_This.cAcs().restore();
		}
		return a_This;
	}

	function eDrawText(a_This, a_Text, a_LineGap, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx)
	{
		a_Text = fFixText(a_Text);
		if (0 == a_Text.length)
		{ return a_This; }

		if (a_DstSara$DstX instanceof tSara) // tSara, Number
		{
			a_DockWay$DstY = a_DockWay$DstY.valueOf();
		}
		else // Number, Number
		{
			if (! s_TempSara2)
			{ s_TempSara2 = new tSara(); }

			s_TempSara2.c_X = a_DstSara$DstX;
			s_TempSara2.c_Y = a_DockWay$DstY;
			a_DstSara$DstX = s_TempSara2;
			a_DockWay$DstY = -1;	// 不用停靠
		}

		// 如果需要，裁剪
		if (a_ClipPath && a_This.cClipPath)
		{
			a_This.cAcs().save();
			a_This.cClipPath(a_ClipPath, null);	// 和变换阵无关
		}

		// 重置文本对齐和基线
		eRsetTextAlnBsln(a_This);

		// 首先进行整体停靠，确定第一行的Y坐标
		var l_1stLineY = a_DstSara$DstX.c_Y;
		if ((a_DstSara$DstX.c_W > 0) && (a_DstSara$DstX.c_H > 0) && (0 <= a_DockWay$DstY) && (a_DockWay$DstY <= 8)) // 需要停靠
		{
			if (! s_TempSara0)
			{ s_TempSara0 = new tSara(); }

			eMesrText(a_This, a_Text, a_LineGap, true);	// a_Text已经OK
			s_TempSara0.c_W = a_This.e_MesrTextRst.c_W;
			s_TempSara0.c_H = a_This.e_MesrTextRst.c_H;
			tSara.scDockPut(s_TempSara0, a_DstSara$DstX, a_DockWay$DstY);
			l_1stLineY = s_TempSara0.c_Y;
		}

		// 然后对每一行进行处理
		// 注意水平方向由a_DstSara$DstX决定，而垂直方向由l_1stLineY和s_DockSara.c_H决定
		// Y确定好之后，应该抹除中下停靠，全部按上停靠处理
		var l_LineAry = stStrUtil.cSplToLines(a_Text);
		var l_FontHgt = eGetFontHgt(a_This);
		var l_LineHgt = l_FontHgt + a_LineGap;

		if (! s_TempSara1)
		{ s_TempSara1 = new tSara(); }
		s_TempSara1.c_X = a_DstSara$DstX.c_X;
		s_TempSara1.c_W = a_DstSara$DstX.c_W;
		s_TempSara1.c_H = l_LineHgt;

		switch (a_DockWay$DstY)
		{
			case 1:
			case 8:
			{ a_DockWay$DstY = 2; } break;
			case 5:
			case 6:
			{ a_DockWay$DstY = 4; } break;
			case 0:
			case 7:
			{ a_DockWay$DstY = 3; } break;
		}

		if (a_Mtx)
		{ fSetTsfm(a_This, a_Mtx); }

		nWse.stAryUtil.cFor(l_LineAry,
			function (a_Tgt, a_Idx, a_Line)
			{
				s_TempSara1.c_Y = l_1stLineY + a_Idx * l_LineHgt;
				eRunDrawTextLine(a_This, a_Line, null, s_TempSara1, a_DockWay$DstY, a_Mtx);
			});

		if (a_Mtx)
		{ fRsetTsfm(a_This); }

		// 清理
		if (a_ClipPath)
		{
			a_This.cAcs().restore();
		}
		return a_This;
	}

	function eRsetTextAlnBsln(a_This)
	{
		var l_Ctxt = a_This.cAcs();
		l_Ctxt.textAlign = "start";
		l_Ctxt.textBaseline = "top";
	}

	function eRunDrawTextLine(a_This, a_Line, a_ClipPath, a_DstSara, a_DockWay, a_Mtx)
	{
		var l_Ctxt = a_This.cAcs();

		// 定位
		var l_AgmX = a_DstSara.c_X, l_AgmY = a_DstSara.c_Y;
		if ((a_DstSara.c_W > 0) && (a_DstSara.c_H > 0) && (0 <= a_DockWay) && (a_DockWay <= 8)) // 需要停靠
		{
			if (! s_TempSara0)
			{ s_TempSara0 = new tSara(); }

			eMesrTextLine(a_This, a_Line, true);	// a_Line已经OK
			s_TempSara0.c_W = a_This.e_MesrTextRst.c_W;
			s_TempSara0.c_H = a_This.e_MesrTextRst.c_H;
			tSara.scDockPut(s_TempSara0, a_DstSara, a_DockWay);
			l_AgmX = s_TempSara0.c_X;
			l_AgmY = s_TempSara0.c_Y;
		}

		(0 == e_DrawMthd) ? l_Ctxt.strokeText(a_Line, l_AgmX, l_AgmY) : l_Ctxt.fillText(a_Line, l_AgmX, l_AgmY);
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var t2dCtxt;
	(function ()
	{
		t2dCtxt = nWse.fClassHead(nGpu,
		/// 二维上下文
		function t2dCtxt()
		{
			this.e_DrawMthd = 0;		// 绘制方法
			this.e_MesrTextRst = { c_W : 0, c_H : 0 };	// 测量文本结果
		}
		,
		null);

		unKnl.fGpuCtxt(t2dCtxt);

		nWse.fClassBody(t2dCtxt,
		{
			// 当重绑画布时
			eOnRbndCvs : function ()
			{
				//
			}
			,
			/// 重置变换阵
			cRsetTsfmMtx : function () { fRsetTsfm(this); return this; }
			,
			/// 获取绘制方法
			/// 返回：Number，0=描边，1=填充
			cGetDrawMthd : function () { return this.e_DrawMthd; }
			,
			/// 设置绘制方法
			/// a_Mthd：Number，0=描边（默认），1=填充
			cSetDrawMthd : function (a_Mthd) { this.e_DrawMthd = a_Mthd || 0; return this; }
			,
			/// 清空
			cClr : function (a_Sara)
			{
				var l_Ctxt = this.cAcs();
				a_Sara
				? l_Ctxt.clearRect(a_Sara.c_X, a_Sara.c_Y, a_Sara.c_W, a_Sara.c_H)
				: l_Ctxt.clearRect(0, 0, this.cGetCvsWid(), this.cGetCvsHgt());
				return this;
			}
			,
			/// 填充
			cFill : function (a_Sara, a_Clo)
			{
				var l_Ctxt = this.cAcs();
				l_Ctxt.fillStyle = a_Clo ? tClo.scToCssCloStr(a_Clo) : "rgba(0, 0, 0, 1)";
				a_Sara
					? l_Ctxt.fillRect(a_Sara.c_X, a_Sara.c_Y, a_Sara.c_W, a_Sara.c_H)
					: l_Ctxt.fillRect(0, 0, this.cGetCvsWid(), this.cGetCvsHgt());
				return this;
			}
			,
			/// 设置字体
			/// a_Fam：String，字体名，如"Arial"（默认）
			/// a_Hgt：Number，高度，如16（默认）
			/// a_Wgt：Number，粗细，如400（默认），700
			/// a_Stl：String，风格，如"normal"（默认），"italic"，"oblique"
			cSetFont : function (a_Fam, a_Hgt, a_Wgt, a_Stl)
			{
				//	"normal 400 20px Arial";
				this.cAcs().font = (a_Stl || "normal") + " " + (a_Wgt || 400) + " " + (a_Hgt || 16) + "px " + (a_Fam || "Arial");
				return this;
			}
			,
			/// 获取字体高度
			cGetFontHgt : function () { return eGetFontHgt(this); }
			,
			/// 测量文本行，忽略换行
			/// a_Line：String，文本行
			/// a_Rst：Object { c_W, c_H }
			/// 返回：a_Rst
			cMesrTextLine : function (a_Rst, a_Line)
			{
				eMesrTextLine(this, a_Line);
				a_Rst.c_W = this.e_MesrTextRst.c_W;		a_Rst.c_H = this.e_MesrTextRst.c_H;
				return a_Rst;
			}
			,
			/// 测量文本，考虑换行
			/// a_Text：String，文本
			/// a_LineGap：Number，行间距
			/// a_Rst：Object { c_W, c_H }
			/// 返回：a_Rst
			cMesrText : function (a_Rst, a_Text, a_LineGap)
			{
				eMesrText(this, a_Text, a_LineGap);
				a_Rst.c_W = this.e_MesrTextRst.c_W;		a_Rst.c_H = this.e_MesrTextRst.c_H;
				return a_Rst;
			}
			,
			/// 绘制文本行
			/// a_Line：String，文本行
			/// a_ClipPath：tPath，裁剪路径，可为null
			/// a_DstSara$DstX：tSara$Number，目的区域$目的x坐标
			/// a_DockWay$DstY：tSara.tBdrNum$Number，停靠方式$目的y坐标
			/// a_Mtx：t4dMtx，变换阵，默认单位阵
			cDrawTextLine : function (a_Line, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx)
			{ return eDrawTextLine(this, a_Line, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx); }
			,
			/// 绘制文本
			/// a_Text：String，文本
			/// a_LineGap：Number，行间距
			/// a_ClipPath：tPath，裁剪路径，可为null
			/// a_DstSara$DstX：tSara$Number，目的区域$目的x坐标
			/// a_DockWay$DstY：tSara.tBdrNum$Number，停靠方式$目的y坐标
			/// a_Mtx：t4dMtx，变换阵，默认单位阵
			cDrawText : function (a_Text, a_LineGap, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx)
			{ return eDrawText(this, a_Text, a_LineGap, a_ClipPath, a_DstSara$DstX, a_DockWay$DstY, a_Mtx); }
			,
			/// 设置透明度
			cSetAph : function (a_Aph)
			{
				this.e_Ctxt.globalAlpha = a_Aph;
				return this;
			}
			,
			/// 设置合成操作 - 透明贴图
			cSetCpstOp_AphMap : function ()
			{
				this.e_Ctxt.globalCompositeOperation = "source-over";
				return this;
			}
			,
			/// 图像是否可用？
			/// a_Img：Image$HTMLCanvasElement$HTMLVideoElement，图像
			cIsImgAvlb : function (a_Img)
			{
				return fIsSrcImgAvlb(a_Img);
			}
			,
			/// 贴图
			/// a_DstSara：tSara，目的区域，null表示整个画布
			/// a_SrcImg：Image$HTMLCanvasElement$HTMLVideoElement，来源图像，若不可用则忽略这次调用
			/// a_SrcSara：tSara，来源矩形，位于图像平面（像素），null表示全图像，若c_W＜0则水平翻转，若c_H＜0则垂直翻转
			/// a_Mtx：t4dMtx，变换阵，默认单位阵
			cMap : function (a_DstSara, a_SrcImg, a_SrcSara, a_Mtx)
			{
				// 不可用时立即返回
				if (! fIsSrcImgAvlb(a_SrcImg))
				{ return; }

				// 修正实参
				if (! a_DstSara)
				{
					if (! s_TempSara0)
					{ s_TempSara0 = new tSara(); }

					s_TempSara0.cCrt$Wh(this.cGetCvsWid(), this.cGetCvsHgt());
					a_DstSara = s_TempSara0;
				}

				var l_FlipX = false, l_FlipY = false;	// 翻转？
				if (! a_SrcSara)
				{
					if (! s_TempSara1)
					{ s_TempSara1 = new tSara(); }

					s_TempSara1.cCrt$Wh(a_SrcImg.width, a_SrcImg.height);
					a_SrcSara = s_TempSara1;
				}
				else
				{
					if (! s_TempSara1)
					{ s_TempSara1 = new tSara(); }

					a_SrcSara = tSara.scAsn(s_TempSara1, a_SrcSara);
					if (a_SrcSara.c_W < 0)
					{
						a_SrcSara.c_W = -a_SrcSara.c_W;
						l_FlipX = true;
					}

					if (a_SrcSara.c_H < 0)
					{
						a_SrcSara.c_H = -a_SrcSara.c_H;
						l_FlipY = true;
					}
				}

				// 设置变换，绘制，恢复变换
				// 注意变换顺序是倒着的（最后一行代码的变换最先进行）！
				fSetTsfm(this, a_Mtx);

				var l_DstAW = a_DstSara.c_W / 2, l_DstAH = a_DstSara.c_H / 2;
				var l_DstCx = a_DstSara.c_X + l_DstAW, l_DstCy = a_DstSara.c_Y + l_DstAH;
				this.e_Ctxt.translate(l_DstCx, l_DstCy);	// 最后平移回原位

				if (l_FlipX && l_FlipY)						// 然后翻转（镜像）变换
				{ this.e_Ctxt.scale(-1, -1); }
				else
				if (l_FlipX)
				{ this.e_Ctxt.scale(-1, 1); }
				else
				if (l_FlipY)
				{ this.e_Ctxt.scale(1, -1); }

				this.e_Ctxt.translate(-l_DstCx, -l_DstCy);	// 首先平移至源区域的中心

				this.e_Ctxt.drawImage(a_SrcImg,
									a_SrcSara.c_X, a_SrcSara.c_Y, a_SrcSara.c_W, a_SrcSara.c_H,
									a_DstSara.c_X, a_DstSara.c_Y, a_DstSara.c_W, a_DstSara.c_H);

				fRsetTsfm(this);
				return this;
			}
			,
			/// 清除阴影
			cClrShdw : function ()
			{
				var l_Ctxt = this.cAcs();
				l_Ctxt.shadowColor = "rgba(0, 0, 0, 0)";
				l_Ctxt.shadowOffsetX = 0;
				l_Ctxt.shadowOffsetY = 0;
				l_Ctxt.shadowBlur = 0;
				return this;
			}
			,
			/// 保存配置
			cSaveCfg : function ()
			{
				this.cAcs().save();
				return this;
			}
			,
			/// 还原配置
			cRstoCfg : function ()
			{
				this.cAcs().restore();
				return this;
			}
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////