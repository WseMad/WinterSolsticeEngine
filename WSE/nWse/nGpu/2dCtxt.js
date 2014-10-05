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

	var nGpu = nWse.nGpu;
	var unKnl = nGpu.unKnl;
	var t4dVct = nGpu.t4dVct;
	var t4dMtx = nGpu.t4dMtx;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_VtxOnCirX, s_VtxOnCirY;

	var i_MinFontHgt = 12;			// 最小字体高度，目前已知Chrome要求≥12px
	var s_DockSara, s_LineDstSara, s_DstXySara;

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
			if (! s_DstXySara)
			{ s_DstXySara = new tSara(); }

			s_DstXySara.c_X = a_DstSara$DstX;
			s_DstXySara.c_Y = a_DockWay$DstY;
			a_DstSara$DstX = s_DstXySara;
			a_DockWay$DstY = -1;	// 不用停靠
		}

		// 如果需要，裁剪
		if (a_ClipPath)
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
			if (! s_DstXySara)
			{ s_DstXySara = new tSara(); }

			s_DstXySara.c_X = a_DstSara$DstX;
			s_DstXySara.c_Y = a_DockWay$DstY;
			a_DstSara$DstX = s_DstXySara;
			a_DockWay$DstY = -1;	// 不用停靠
		}

		// 如果需要，裁剪
		if (a_ClipPath)
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
			if (! s_DockSara)
			{ s_DockSara = new tSara(); }

			eMesrText(a_This, a_Text, a_LineGap, true);	// a_Text已经OK
			s_DockSara.c_W = a_This.e_MesrTextRst.c_W;
			s_DockSara.c_H = a_This.e_MesrTextRst.c_H;
			tSara.scDockPut(s_DockSara, a_DstSara$DstX, a_DockWay$DstY);
			l_1stLineY = s_DockSara.c_Y;
		}

		// 然后对每一行进行处理
		// 注意水平方向由a_DstSara$DstX决定，而垂直方向由l_1stLineY和s_DockSara.c_H决定
		// Y确定好之后，应该抹除中下停靠，全部按上停靠处理
		var l_LineAry = stStrUtil.cSplToLines(a_Text);
		var l_FontHgt = eGetFontHgt(a_This);
		var l_LineHgt = l_FontHgt + a_LineGap;

		if (! s_LineDstSara)
		{ s_LineDstSara = new tSara(); }
		s_LineDstSara.c_X = a_DstSara$DstX.c_X;
		s_LineDstSara.c_W = a_DstSara$DstX.c_W;
		s_LineDstSara.c_H = l_LineHgt;

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
				s_LineDstSara.c_Y = l_1stLineY + a_Idx * l_LineHgt;
				eRunDrawTextLine(a_This, a_Line, null, s_LineDstSara, a_DockWay$DstY, a_Mtx);
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
			if (! s_DockSara)
			{ s_DockSara = new tSara(); }

			eMesrTextLine(a_This, a_Line, true);	// a_Line已经OK
			s_DockSara.c_W = a_This.e_MesrTextRst.c_W;
			s_DockSara.c_H = a_This.e_MesrTextRst.c_H;
			tSara.scDockPut(s_DockSara, a_DstSara, a_DockWay);
			l_AgmX = s_DockSara.c_X;
			l_AgmY = s_DockSara.c_Y;
		}

		(0 == e_DrawMthd) ? l_Ctxt.strokeText(a_Line, l_AgmX, l_AgmY) : l_Ctxt.fillText(a_Line, l_AgmX, l_AgmY);
	}

	function fBldPath(a_This, a_Path, a_Mtx)
	{
		if (a_Mtx)
		{ fSetTsfm(a_This, a_Mtx); }

		nWse.stAryUtil.cFor(a_Path.e_StepAry,
			function (a_Tgt, a_Idx, a_Step)
			{ a_Step.c_fMthd(a_This, a_Path, a_Idx, a_Mtx); });

		if (a_Mtx)
		{ fRsetTsfm(a_This); }
	}

	function fLineToSp(a_Path, a_LineToSp, a_SPx, a_SPy)
	{
		// 移动到起点，画布默认直线到起点
		if (! a_LineToSp)
		{ a_Path.cMoveTo(a_SPx, a_SPy); }
		else // 直线到起点，由于下面不会调用画布的rect，所以这里也要自己画
		{ a_Path.cLineTo(a_SPx, a_SPy); }
	}

	function fCalcVtxOnCir(a_Idx, a_Cx, a_Cy, a_InrR, a_OtrR, a_BgnRad, a_DtaRad)
	{
		var l_Rad = a_BgnRad + a_DtaRad * a_Idx;
		var l_Cos = Math.cos(l_Rad), l_Sin = Math.sin(l_Rad);
		var l_R = (a_Idx % 2) ? a_InrR : a_OtrR;
		s_VtxOnCirX = a_Cx + l_R * l_Cos;
		s_VtxOnCirY = a_Cy + l_R * l_Sin;
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
			/// 裁剪路径
			/// a_Path：tPath，路径，若为null则假定已经建立，只绘制
			/// a_Mtx：t4dMtx，变换阵，默认单位阵
			cClipPath : function (a_Path, a_Mtx)
			{
				var l_Ctxt = this.cAcs();
				if (a_Path)
				{ fBldPath(this, a_Path, a_Mtx); }

				l_Ctxt.clip();
				return this;
			}
			,
			/// 绘制路径
			/// a_Path：tPath，路径，若为null则假定已经建立，只绘制
			/// a_Mtx：t4dMtx，变换阵，默认单位阵
			cDrawPath : function (a_Path, a_Mtx)
			{
				var l_Ctxt = this.cAcs();
				if (a_Path)
				{ fBldPath(this, a_Path, a_Mtx); }

				(0 == this.e_DrawMthd) ? l_Ctxt.stroke() : l_Ctxt.fill();
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
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 路径

	var tPath;
	(function ()
	{
		tPath = nWse.fClass(t2dCtxt,
		/// 路径
		function tPath()
		{
			this.cRset();
		}
		,
		null
		,
		{
			//======== 受保护

			/// 存取步骤数组
			/// 返回：Array，每个元素是Object
			/// {
			/// c_fMthd(a_Ctxt, a_Path, a_Idx, a_Mtx)：Function，方法，将要发出的图形指令
			/// c_Arv：tPnt，抵达，这一步完成后画笔的位置（路径空间）【暂不支持】
			/// }
			dAcsStepAry: function () { return this.e_StepAry; }

			//======== 公有
			,
			/// 是否为空
			/// 返回：Boolean
			cIsEmt: function ()
			{ return (this.e_StepAry.length <= 1); }	// cRset时会压入一步
			,
			/// 重置
			cRset: function ()
			{
				// 步骤数组
				this.e_StepAry = [];

				// 第一步：开始新路径，并移动到原点
				var l_Step = {};//{ c_Arv : new tPnt() };
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{
					a_Ctxt.cAcs().beginPath();
					a_Ctxt.cAcs().moveTo(0, 0);		// 移动到原点
				};

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 闭合
			cCls: function ()
			{
				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().closePath(); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 移动到
			cMoveTo: function (a_X, a_Y)
			{
				var l_Step = {};//, c_Arv : tPnt.scNew(a_X, a_Y) };
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().moveTo(a_X, a_Y); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 直线到
			cLineTo: function (a_X, a_Y)
			{
				var l_Step = {};//, c_Arv : tPnt.scNew(a_X, a_Y) };
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().lineTo(a_X, a_Y); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 圆弧
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_Cx，a_Cy：Number，圆心（Center）坐标
			/// a_R：Number，半径（Radius）
			/// a_BgnRad，a_EndRad：Number，起始和终止弧度
			cArc: function (a_LineToSp, a_Cx, a_Cy, a_R, a_BgnRad, a_EndRad)
			{
				// 环？
				var l_DtaRad = Math.abs(a_EndRad - a_BgnRad);
				if (l_DtaRad >= Math.PI * 2)
				{
					if (a_BgnRad < a_EndRad)
					{
						a_BgnRad = 0;
						a_EndRad = Math.PI * 2;
					}
					else
					{
						a_BgnRad = Math.PI * 2;
						a_EndRad = 0;
					}
				}

				// 移动到起点，画布默认直线到起点
				var l_Cos, l_Sin, l_STPx, l_STPy;
				if (!a_LineToSp)
				{
					l_Cos = Math.cos(a_BgnRad); l_Sin = Math.sin(a_BgnRad);
					l_STPx = a_Cx + a_R * l_Cos; l_STPy = a_Cy + a_R * l_Sin;
					this.cMoveTo(l_STPx, l_STPy);
				}

				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().arc(a_Cx, a_Cy, a_R, a_BgnRad, a_EndRad, (a_BgnRad > a_EndRad)); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 椭圆弧
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_Cx，a_Cy：Number，圆心（Center）坐标
			/// a_HL：Number，横轴长（Horizontal Length）
			/// a_VL：Number，竖轴长（Vertical Length）
			/// a_BgnRad，a_EndRad：Number，起始和终止弧度
			cElpsArc: function (a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad)
			{
				// 环？
				var l_DtaRad = Math.abs(a_EndRad - a_BgnRad);
				if (l_DtaRad >= Math.PI * 2)
				{
					if (a_BgnRad < a_EndRad)
					{
						a_BgnRad = 0;
						a_EndRad = Math.PI * 2;
					}
					else
					{
						a_BgnRad = Math.PI * 2;
						a_EndRad = 0;
					}
				}

				// 移动到起点，画布默认直线到起点
				if (! a_LineToSp)
				{
					l_Cos = Math.cos(a_BgnRad); l_Sin = Math.sin(a_BgnRad);
					l_STPx = a_Cx + a_HL * l_Cos; l_STPy = a_Cy + a_VL * l_Sin;
					this.cMoveTo(l_STPx, l_STPy);
				}

				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{
					//【注意】变换阵3·变换阵2·变换阵1·列向量
					var l_Ctxt = a_Ctxt.cAcs();
					l_Ctxt.translate(a_Cx, a_Cy);
					l_Ctxt.scale(a_HL, a_VL);
					l_Ctxt.arc(0, 0, 1, a_BgnRad, a_EndRad, (a_BgnRad > a_EndRad));
					fSetTsfm(a_Ctxt, a_Mtx);	// 恢复变换，因为上面修改了变换
				};

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 扇
			cFan : function (a_LineToSp, a_Cx, a_Cy, a_R, a_BgnRad, a_EndRad)
			{
				return this.cElpsFan(a_LineToSp, a_Cx, a_Cy, a_R, a_R, a_BgnRad, a_EndRad);
			}
			,
			/// 椭圆扇
			cElpsFan : function (a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad)
			{
				// 椭圆？
				var l_DtaRad = Math.abs(a_EndRad - a_BgnRad);
				if (l_DtaRad >= Math.PI * 2)
				{
					this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad);
					return this;
				}

				this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad);
				this.cLineTo(a_Cx, a_Cy);
				return this;
			}
			,
			/// 圆环弧
			/// a_Thkns：Number，厚度，＞0向外延伸，＜0向内收缩
			cRingArc : function (a_LineToSp, a_Cx, a_Cy, a_R, a_BgnRad, a_EndRad, a_Thkns)
			{
				return this.cElpsRingArc(a_LineToSp, a_Cx, a_Cy, a_R, a_R, a_BgnRad, a_EndRad, a_Thkns);
			}
			,
			/// 椭圆环弧
			/// a_Thkns：Number，厚度，＞0向外延伸，＜0向内收缩
			cElpsRingArc : function (a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad, a_Thkns)
			{
				// 退化成椭圆弧？
				if (! a_Thkns)
				{ return this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad); }

				// 退化成椭圆扇？
				var l_HL2 = a_HL + a_Thkns, l_VL2 = a_VL + a_Thkns;
				if ((l_HL2 <= 0) || (l_VL2 <= 0))
				{ return this.cElpsFan(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad); }

				// 椭圆环？
				var l_DtaRad = Math.abs(a_EndRad - a_BgnRad);
				if (l_DtaRad >= Math.PI * 2)
				{
					this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad);
					this.cElpsArc(false, a_Cx, a_Cy, l_HL2, l_VL2, a_EndRad, a_BgnRad);
					return this;
				}

				// 计算四个端点
				var l_CosBgn, l_SinBgn, l_P0x, l_P0y;
				l_CosBgn = Math.cos(a_BgnRad);		l_SinBgn = Math.sin(a_BgnRad);
				l_P0x = a_Cx + a_HL * l_CosBgn; 	l_P0y = a_Cy + a_VL * l_SinBgn;
				this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_BgnRad, a_EndRad);
				this.cElpsArc(true, a_Cx, a_Cy, l_HL2, l_VL2, a_EndRad, a_BgnRad);
				this.cLineTo(l_P0x, l_P0y);
				return this;
			}
			,
			/// 圆弧到
			/// a_Ix，a_Iy：Number，拐点（Inflection）坐标
			/// a_Ox，a_Oy：Number，出点（Outgoing）坐标
			/// a_R：Number，半径
			cArcTo: function (a_Ix, a_Iy, a_Ox, a_Oy, a_R)
			{
				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().arcTo(a_Ix, a_Iy, a_Ox, a_Oy, a_R); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 贝塞尔到
			/// a_C1x，a_C1y：Number，控制点（Control）1坐标
			/// a_C2x，a_C2y：Number，控制点坐标
			/// a_Ex，a_Ey：Number，终点（End）x坐标
			cBzrTo: function (a_C1x, a_C1y, a_C2x, a_C2y, a_Ex, a_Ey)
			{
				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().bezierCurveTo(a_C1x, a_C1y, a_C2x, a_C2y, a_Ex, a_Ey); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 抛物线到
			/// a_Cx，a_Cy：Number，控制点（Control）x坐标
			/// a_Ex，a_Ey：Number，终点（End）x坐标
			cQdrTo: function (a_Cx, a_Cy, a_Ex, a_Ey)
			{
				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{ a_Ctxt.cAcs().quadraticCurveTo(a_Cx, a_Cy, a_Ex, a_Ey); };

				this.e_StepAry.push(l_Step);
				return this;
			}
			,
			/// 多边形
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_VtxAry：Array，顶点数组，每个元素含有x，y字段，数量必须≥2，＝2时退化成线段
			cPlgn: function (a_LineToSp, a_VtxAry)
			{
				var l_Vtx0 = a_VtxAry[0], l_Vtx;
				fLineToSp(this, a_LineToSp, l_Vtx0.x, l_Vtx0.y);

				var i, l_Len = a_VtxAry.length;
				for (i = 1; i < l_Len; ++i)
				{
					l_Vtx = a_VtxAry[i];
					this.cLineTo(l_Vtx.x, l_Vtx.y);
				}

				if (l_Len >= 3)
				{
					this.cLineTo(l_Vtx0.x, l_Vtx0.y);
				}
				return this;
			}
			,
			/// 三角形
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_V0x, a_V0y, a_V1x, a_V1y, a_V2x, a_V2y：Number，顶点坐标
			cTrg: function (a_LineToSp, a_V0x, a_V0y, a_V1x, a_V1y, a_V2x, a_V2y)
			{
				fLineToSp(this, a_LineToSp, a_V0x, a_V0y);

				// 直角
				this.cLineTo(a_V1x, a_V1y);
				this.cLineTo(a_V2x, a_V2y);
				this.cLineTo(a_V0x, a_V0y);
				return this;
			}
			,
			/// 圆
			cCir: function (a_LineToSp, a_Cx, a_Cy, a_R)
			{ return this.cArc(a_LineToSp, a_Cx, a_Cy, a_R, 0, Math.PI * 2); }
			,
			/// 圆环
			cRing : function (a_LineToSp, a_Cx, a_Cy, a_R, a_Thkns)
			{ return this.cRingArc(a_LineToSp, a_Cx, a_Cy, a_R, a_Thkns); }
			,
			/// 椭圆
			cElps: function (a_LineToSp, a_Cx, a_Cy, a_HL, a_VL)
			{ return this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, 0, Math.PI * 2); }
			,
			/// 椭圆环
			cElpsRing : function (a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, a_Thkns)
			{ return this.cElpsRingArc(a_LineToSp, a_Cx, a_Cy, a_HL, a_VL, 0, Math.PI * 2, a_Thkns); }
			,
			/// 囊形
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_X，a_Y：Number，起点坐标
			/// a_W：Number，有符号宽，＜0时向-X方向增长，若＞|a_H|则水平摆放（直径＝a_H），＝时退化成圆
			/// a_H：Number，有符号高，＜0时向-Y方向增长，若＞|a_W|则垂直摆放（直径＝a_W），＝时退化成圆
			cCaps: function (a_LineToSp, a_X, a_Y, a_W, a_H)
			{
				var l_AbsW = Math.abs(a_W), l_AbsH = Math.abs(a_H);
				var l_Cmpr = nWse.stNumUtil.cCmpr(l_AbsW, l_AbsH);
				var l_SR, l_R;
				if (0 == l_Cmpr) // 退化成圆
				{
					l_SR = a_W / 2; l_R = Math.abs(l_SR);
					return this.cCir(a_LineToSp, a_X + l_SR, a_Y + l_SR, l_R);
				}

				var l_Hrzt = (l_Cmpr > 0);
				l_SR = l_Hrzt ? a_H / 2 : a_W / 2; l_R = Math.abs(l_SR);
				fLineToSp(this, a_LineToSp, a_X + l_SR, a_Y);

				// 圆角
				this.cArcTo(a_X + a_W, a_Y, a_X + a_W, a_Y + a_H, l_R);
				this.cArcTo(a_X + a_W, a_Y + a_H, a_X, a_Y + a_H, l_R);
				this.cArcTo(a_X, a_Y + a_H, a_X, a_Y, l_R);
				this.cArcTo(a_X, a_Y, a_X + a_W, a_Y, l_R);
				return this;
			}
			,
			/// 矩形
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_X，a_Y：Number，起点坐标
			/// a_W：Number，有符号宽，＜0时向-X方向增长
			/// a_H：Number，有符号高，＜0时向-Y方向增长
			cRect: function (a_LineToSp, a_X, a_Y, a_W, a_H)
			{
				// 宽高符号控制环绕方向
				var l_SignW = nWse.stNumUtil.cSign(a_W);//, l_SignH = nWse.stNumUtil.cSign(a_H);
				fLineToSp(this, a_LineToSp, a_X, a_Y);

				// 直角
				this.cLineTo(a_X + a_W, a_Y);
				this.cLineTo(a_X + a_W, a_Y + a_H);
				this.cLineTo(a_X, a_Y + a_H);
				this.cLineTo(a_X, a_Y);
				return this;
			}
			,
			/// 圆角矩形（Round Corner Rectangle）
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_X，a_Y：Number，起点坐标
			/// a_W：Number，有符号宽，＜0时向-X方向增长
			/// a_H：Number，有符号高，＜0时向-Y方向增长
			/// a_R：Number，角半径，≤0表示直角，＞0表示圆角，若过大可能退化成囊形，但绝不会超出矩形范围
			cRcRect: function (a_LineToSp, a_X, a_Y, a_W, a_H, a_R)
			{
				// 圆角矩形
				var l_RC = (a_R > 0);
				if (l_RC)
				{
					// 如果退化成囊形
					if (a_R * 2 >= Math.min(Math.abs(a_W), Math.abs(a_H)))
					{ return this.cCaps(a_LineToSp, a_X, a_Y, a_W, a_H); }
				}
				else // 直角矩形
				{ return this.cRect(a_LineToSp, a_X, a_Y, a_W, a_H); }

				// 宽高符号控制环绕方向
				var l_SignW = nWse.stNumUtil.cSign(a_W);//, l_SignH = nWse.stNumUtil.cSign(a_H);
				fLineToSp(this, a_LineToSp, a_X + l_SignW * a_R, a_Y);

				// 圆角
				this.cArcTo(a_X + a_W, a_Y, a_X + a_W, a_Y + a_H, a_R);
				this.cArcTo(a_X + a_W, a_Y + a_H, a_X, a_Y + a_H, a_R);
				this.cArcTo(a_X, a_Y + a_H, a_X, a_Y, a_R);
				this.cArcTo(a_X, a_Y, a_X + a_W, a_Y, a_R);
				return this;
			}
			,
			/// 箭头
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_Sx, a_Sy, a_Tx, a_Ty：Number，起点和终点坐标
			/// a_HL, a_HR, a_BR：Number，头部长度，头部半径，身体半径
			cArw: function (a_LineToSp, a_Sx, a_Sy, a_Tx, a_Ty, a_HL, a_HR, a_BR)
			{
				var l_DtaX = (a_Tx - a_Sx), l_DtaY = (a_Ty - a_Sy);
				var l_AL = Math.sqrt(l_DtaX * l_DtaX + l_DtaY * l_DtaY);
				if (nWse.stNumUtil.cIz(l_AL)) // 长度为0
				{ return this; }

				var l_DirX = l_DtaX / l_AL, l_DirY = l_DtaY / l_AL;		// 方向
				var l_PerpX = -l_DirY, l_PerpY = l_DirX;				// 垂直方向
				var l_BL = Math.max(l_AL - a_HL, 0);	// 如果头比整个箭头都长，退化成三角形

				var l_BgnX = a_Sx - l_PerpX * a_BR, l_BgnY = a_Sy - l_PerpY * a_BR;
				var l_BodyEndX = l_BgnX + l_DirX * l_BL, l_BodyEndY = l_BgnY + l_DirY * l_BL;
				var l_HeadBgnX = l_BodyEndX - l_PerpX * (a_HR - a_BR), l_HeadBgnY = l_BodyEndY - l_PerpY * (a_HR - a_BR);
				var l_MirHeadBgnX = l_HeadBgnX + l_PerpX * a_HR * 2, l_MirHeadBgnY = l_HeadBgnY + l_PerpY * a_HR * 2;
				var l_MirBodyEndX = l_BodyEndX + l_PerpX * a_BR * 2, l_MirBodyEndY = l_BodyEndY + l_PerpY * a_BR * 2;
				var l_EndX = a_Sx + l_PerpX * a_BR, l_EndY = a_Sy + l_PerpY * a_BR;
				fLineToSp(this, a_LineToSp, l_BgnX, l_BgnY);

				// 直角
				this.cLineTo(l_BodyEndX, l_BodyEndY);
				this.cLineTo(l_HeadBgnX, l_HeadBgnY);
				this.cLineTo(a_Tx, a_Ty);
				this.cLineTo(l_MirHeadBgnX, l_MirHeadBgnY);
				this.cLineTo(l_MirBodyEndX, l_MirBodyEndY);
				this.cLineTo(l_EndX, l_EndY);
				this.cLineTo(l_BgnX, l_BgnY);
				return this;
			}
			,
			/// 等边多边形（Equilateral Polygon）
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_Cx, a_Cy：Number，圆心（Center）坐标
			/// a_R：Number，半径（Radius）
			/// a_BgnRad：Number，起始弧度
			/// a_N：Number，边数，必须≥2，＝2时退化成线段
			cEqlaPlgn: function (a_LineToSp, a_Cx, a_Cy, a_R, a_BgnRad, a_N)
			{
				// 移动到起点
				var l_Cos = Math.cos(a_BgnRad), l_Sin = Math.sin(a_BgnRad);
				var l_SPx = a_Cx + a_R * l_Cos, l_SPy = a_Cy + a_R * l_Sin;
				fLineToSp(this, a_LineToSp, l_SPx, l_SPy);

				// 对每个顶点
				var l_VtxIdx = 1;
				for (; l_VtxIdx < a_N; ++l_VtxIdx)
				{
					fCalcVtxOnCir(l_VtxIdx, a_Cx, a_Cy, a_R, a_R, a_BgnRad, 2 * Math.PI / a_N);
					this.cLineTo(s_VtxOnCirX, s_VtxOnCirY);
				}

				// 回到起点
				if (a_N >= 3)
				{ this.cLineTo(l_SPx, l_SPy); }
				return this;
			}
			,
			/// 星形多边形（Star Polygon）
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_Cx, a_Cy：Number，圆心（Center）坐标
			/// a_InrR：Number，内半径（Inner Radius）
			/// a_OtrR：Number，外半径（Outer Radius）
			/// a_BgnRad：Number，起始弧度
			/// a_N：Number，边数，必须≥2，＝2时退化成线段
			cStarPlgn : function (a_LineToSp, a_Cx, a_Cy, a_InrR, a_OtrR, a_BgnRad, a_N)
			{
				// 直径
				if (a_N <= 2)
				{ return this.cEqlaPlgn(a_LineToSp, a_Cx, a_Cy, a_OtrR, a_BgnRad, a_N); }

				// 移动到起点
				var l_Cos = Math.cos(a_BgnRad), l_Sin = Math.sin(a_BgnRad);
				var l_SPx = a_Cx + a_OtrR * l_Cos, l_SPy = a_Cy + a_OtrR * l_Sin;
				fLineToSp(this, a_LineToSp, l_SPx, l_SPy);

				// 对每个顶点
				var l_N = a_N * 2;
				var l_VtxIdx = 1;
				for (; l_VtxIdx < l_N; ++l_VtxIdx)
				{
					fCalcVtxOnCir(l_VtxIdx, a_Cx, a_Cy, a_InrR, a_OtrR, a_BgnRad, 2 * Math.PI / l_N);
					this.cLineTo(s_VtxOnCirX, s_VtxOnCirY);
				}

				// 回到起点
				this.cLineTo(l_SPx, l_SPy);
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