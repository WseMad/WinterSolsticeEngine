/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nGpu && l_Glb.nWse.nGpu.t2dCtxt && l_Glb.nWse.nGpu.t2dCtxt.tPath)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nGpu",
		[
			"2dCtxt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("2dPath.fOnIcld：" + a_Errs);

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
	var t2dCtxt = nGpu.t2dCtxt;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	var s_VtxOnCirX, s_VtxOnCirY;

	function fBldPath(a_This, a_Path, a_Mtx)
	{
		if (a_Mtx)
		{ unKnl.fSetTsfm(a_This, a_Mtx); }

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
// t2dCtxt补充

	(function ()
	{
		nWse.fClassBody(t2dCtxt,
		{
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
			/// 点在路径里吗？【注意】不受当前变换影响！
			/// a_Path：tPath，路径，若为null则假定已经建立，只绘制
			/// a_X, a_Y：Number，点坐标
			cIsPntInPath : function (a_Path, a_X, a_Y)
			{
				var l_Ctxt = this.cAcs();
				if (a_Path)
				{ fBldPath(this, a_Path, null); }

				return l_Ctxt.isPointInPath(a_X, a_Y);
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
			{ return (! this.e_StepAry) || (1 == this.e_StepAry.length); }	// cRset时会压入一步
			,
			/// 重置
			cRset: function ()
			{
				// 重复调用？
				if (this.e_StepAry && (1 == this.e_StepAry.length))
				{ return this; }

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
			/// a_HR：Number，横轴半径（Horizontal Radius）
			/// a_VR：Number，竖轴半径（Vertical Radius）
			/// a_BgnRad，a_EndRad：Number，起始和终止弧度
			cElpsArc: function (a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad)
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
					l_STPx = a_Cx + a_HR * l_Cos; l_STPy = a_Cy + a_VR * l_Sin;
					this.cMoveTo(l_STPx, l_STPy);
				}

				var l_Step = {};
				l_Step.c_fMthd = function (a_Ctxt, a_Path, a_Idx, a_Mtx)
				{
					//【注意】变换阵3·变换阵2·变换阵1·列向量
					var l_Ctxt = a_Ctxt.cAcs();
					l_Ctxt.translate(a_Cx, a_Cy);
					l_Ctxt.scale(a_HR, a_VR);
					l_Ctxt.arc(0, 0, 1, a_BgnRad, a_EndRad, (a_BgnRad > a_EndRad));
					unKnl.fSetTsfm(a_Ctxt, a_Mtx);	// 恢复变换，因为上面修改了变换
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
			cElpsFan : function (a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad)
			{
				// 椭圆？
				var l_DtaRad = Math.abs(a_EndRad - a_BgnRad);
				if (l_DtaRad >= Math.PI * 2)
				{
					this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad);
					return this;
				}

				this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad);
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
			cElpsRingArc : function (a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad, a_Thkns)
			{
				// 退化成椭圆弧？
				if (! a_Thkns)
				{ return this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad); }

				// 退化成椭圆扇？
				var l_HL2 = a_HR + a_Thkns, l_VL2 = a_VR + a_Thkns;
				if ((l_HL2 <= 0) || (l_VL2 <= 0))
				{ return this.cElpsFan(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad); }

				// 椭圆环？
				var l_DtaRad = Math.abs(a_EndRad - a_BgnRad);
				if (l_DtaRad >= Math.PI * 2)
				{
					this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad);
					this.cElpsArc(false, a_Cx, a_Cy, l_HL2, l_VL2, a_EndRad, a_BgnRad);
					return this;
				}

				// 计算四个端点
				var l_CosBgn, l_SinBgn, l_P0x, l_P0y;
				l_CosBgn = Math.cos(a_BgnRad);		l_SinBgn = Math.sin(a_BgnRad);
				l_P0x = a_Cx + a_HR * l_CosBgn; 	l_P0y = a_Cy + a_VR * l_SinBgn;
				this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_BgnRad, a_EndRad);
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
			cElps: function (a_LineToSp, a_Cx, a_Cy, a_HR, a_VR)
			{ return this.cElpsArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, 0, Math.PI * 2); }
			,
			/// 椭圆环
			cElpsRing : function (a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, a_Thkns)
			{ return this.cElpsRingArc(a_LineToSp, a_Cx, a_Cy, a_HR, a_VR, 0, Math.PI * 2, a_Thkns); }
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
			/// a_R：Number$Number[]，角半径，≤0表示直角，＞0表示圆角，若过大可能退化成囊形；数组时遵从CSS3标准
			cRcRect: function (a_LineToSp, a_X, a_Y, a_W, a_H, a_R)
			{
				// CSS3风格，[↖，↗，↘，↙]
				var l_AbsW = Math.abs(a_W), l_AbsH = Math.abs(a_H);
				var l_R0, l_R1, l_R2, l_R3, l_r0, l_r1, l_r2, l_r3;
				if (nWse.fIsNum(a_R)) // 等半径圆角矩形
				{
					// 直角
					if (a_R <= 0)
					{ return this.cRect(a_LineToSp, a_X, a_Y, a_W, a_H); }

					// 退化成囊形
					if (a_R * 2 >= Math.min(l_AbsW, l_AbsH))
					{ return this.cCaps(a_LineToSp, a_X, a_Y, a_W, a_H); }

					// 记录半径
					l_R0 = l_R1 = l_R2 = l_R3 = a_R;
				}
				else
				if (nWse.fIsAry(a_R)) // 不等半径圆角矩形
				{
					// 记录半径，溢出时等比例缩小
					l_R0 = a_R[0];	l_R1 = a_R[1];	l_R2 = a_R[2];	l_R3 = a_R[3];

					if (l_R0 + l_R1 > l_AbsW)	// 上边溢出
					{
						l_r0 = l_AbsW / (l_R0 + l_R1) * l_R0;
						l_r1 = l_AbsW / (l_R0 + l_R1) * l_R1;
						l_R0 = l_r0;
						l_R1 = l_r1;
					}

					if (l_R1 + l_R2 > l_AbsH)	// 右边溢出
					{
						l_r1 = l_AbsH / (l_R1 + l_R2) * l_R1;
						l_r2 = l_AbsH / (l_R1 + l_R2) * l_R2;
						l_R1 = l_r1;
						l_R2 = l_r2;
					}

					if (l_R2 + l_R3 > l_AbsW)	// 下边溢出
					{
						l_r2 = l_AbsW / (l_R2 + l_R3) * l_R2;
						l_r3 = l_AbsW / (l_R2 + l_R3) * l_R3;
						l_R2 = l_r2;
						l_R3 = l_r3;
					}

					if (l_R3 + l_R0 > l_AbsH)	// 左边溢出
					{
						l_r3 = l_AbsH / (l_R3 + l_R0) * l_R3;
						l_r0 = l_AbsH / (l_R3 + l_R0) * l_R0;
						l_R3 = l_r3;
						l_R0 = l_r0;
					}
				}
				else // 按直角矩形处理
				{
					return this.cRect(a_LineToSp, a_X, a_Y, a_W, a_H);
				}

				// 宽高符号控制环绕方向
				var l_SignW = nWse.stNumUtil.cSign(a_W);//, l_SignH = nWse.stNumUtil.cSign(a_H);
				fLineToSp(this, a_LineToSp, a_X + l_SignW * l_R0, a_Y);

				// 圆角
				this.cArcTo(a_X + a_W, a_Y, a_X + a_W, a_Y + a_H, l_R1);
				this.cArcTo(a_X + a_W, a_Y + a_H, a_X, a_Y + a_H, l_R2);
				this.cArcTo(a_X, a_Y + a_H, a_X, a_Y, l_R3);
				this.cArcTo(a_X, a_Y, a_X + a_W, a_Y, l_R0);
				return this;
			}
			,
			/// 椭圆角矩形（Elliptical Corner Rectangle）
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_X，a_Y：Number，起点坐标
			/// a_W：Number，有符号宽，＜0时向-X方向增长
			/// a_H：Number，有符号高，＜0时向-Y方向增长
			/// a_HR：Number$Number[]，角水平半径，≤0表示直角，＞0表示圆角，若过大可能退化成椭圆；数组时遵从CSS3标准
			/// a_VR：Number$Number[]，角垂直半径，≤0表示直角，＞0表示圆角，若过大可能退化成椭圆；数组时遵从CSS3标准
			///【注意】a_HR和a_VR的类型必须相同！即要么都是Number，要么都是Number[]
			cEcRect: function (a_LineToSp, a_X, a_Y, a_W, a_H, a_HR, a_VR)
			{
				// CSS3风格，[↖，↗，↘，↙]
				var l_AbsW = Math.abs(a_W), l_AbsH = Math.abs(a_H);
				var l_HR0, l_HR1, l_HR2, l_HR3, l_hr0, l_hr1, l_hr2, l_hr3;
				var l_VR0, l_VR1, l_VR2, l_VR3, l_vr0, l_vr1, l_vr2, l_vr3;
				if (nWse.fIsNum(a_HR)) // 两方向各自等半径椭圆角矩形
				{
					// 直角
					if ((a_HR <= 0) || (a_VR <= 0))
					{ return this.cRect(a_LineToSp, a_X, a_Y, a_W, a_H); }

					// 退化成椭圆
					if ((a_HR * 2 >= l_AbsW) && (a_VR * 2 >= l_AbsH))
					{ return this.cElps(a_LineToSp, a_X + a_W / 2, a_Y + a_H / 2, a_W / 2, a_H / 2); }

					// 记录半径
					l_HR0 = l_HR1 = l_HR2 = l_HR3 = a_HR;
					l_VR0 = l_VR1 = l_VR2 = l_VR3 = a_VR;
				}
				else
				if (nWse.fIsAry(a_HR)) // 不等半径椭圆角矩形
				{
					// 记录半径，溢出时等比例缩小
					l_HR0 = a_HR[0];	l_HR1 = a_HR[1];	l_HR2 = a_HR[2];	l_HR3 = a_HR[3];
					l_VR0 = a_VR[0];	l_VR1 = a_VR[1];	l_VR2 = a_VR[2];	l_VR3 = a_VR[3];

					if (l_HR0 + l_HR1 > l_AbsW)	// 上边溢出
					{
						l_hr0 = l_AbsW / (l_HR0 + l_HR1) * l_HR0;
						l_hr1 = l_AbsW / (l_HR0 + l_HR1) * l_HR1;
						l_HR0 = l_hr0;
						l_HR1 = l_hr1;
					}

					if (l_VR1 + l_VR2 > l_AbsH)	// 右边溢出
					{
						l_vr1 = l_AbsH / (l_VR1 + l_VR2) * l_VR1;
						l_vr2 = l_AbsH / (l_VR1 + l_VR2) * l_VR2;
						l_VR1 = l_vr1;
						l_VR2 = l_vr2;
					}

					if (l_HR2 + l_HR3 > l_AbsW)	// 下边溢出
					{
						l_hr2 = l_AbsW / (l_HR2 + l_HR3) * l_HR2;
						l_hr3 = l_AbsW / (l_HR2 + l_HR3) * l_HR3;
						l_HR2 = l_hr2;
						l_HR3 = l_hr3;
					}

					if (l_VR3 + l_VR0 > l_AbsH)	// 左边溢出
					{
						l_vr3 = l_AbsH / (l_VR3 + l_VR0) * l_VR3;
						l_vr0 = l_AbsH / (l_VR3 + l_VR0) * l_VR0;
						l_VR3 = l_vr3;
						l_VR0 = l_vr0;
					}
				}
				else // 按直角矩形处理
				{
					return this.cRect(a_LineToSp, a_X, a_Y, a_W, a_H);
				}

				// 宽高符号控制环绕方向
				if (a_W < 0)
				{
					if (a_H < 0) // 右下角开始，顺时针
					{
						fLineToSp(this, a_LineToSp, a_X + l_AbsW - l_HR2, a_Y + l_AbsH);
						this.cLineTo(a_X + l_HR3, a_Y + l_AbsH);
						this.cElpsArc(true, a_X + l_HR3, a_Y + l_AbsH - l_VR3, l_HR3, l_VR3, -Math.PI * 3 / 2, -Math.PI);
						this.cLineTo(a_X, a_Y + l_VR0);
						this.cElpsArc(true, a_X + l_HR0, a_Y + l_VR0, l_HR0, l_VR0, -Math.PI, -Math.PI / 2);
						this.cLineTo(a_X + l_AbsW - l_HR1, a_Y);
						this.cElpsArc(true, a_X + l_AbsW - l_HR1, a_Y + l_VR1, l_HR1, l_VR1, -Math.PI / 2, 0);
						this.cLineTo(a_X + l_AbsW, a_Y + l_AbsH - l_VR2);
						this.cElpsArc(true, a_X + l_AbsW - l_HR2, a_Y + l_AbsH - l_VR2, l_HR2, l_VR2, 0, Math.PI / 2);
					}
					else // 右上角开始，逆时针
					{
						fLineToSp(this, a_LineToSp, a_X + l_AbsW - l_HR1, a_Y);
						this.cLineTo(a_X + l_HR0, a_Y);
						this.cElpsArc(true, a_X + l_HR0, a_Y + l_VR0, l_HR0, l_VR0, Math.PI * 3 / 2, Math.PI);
						this.cLineTo(a_X, a_Y + l_AbsH - l_VR3);
						this.cElpsArc(true, a_X + l_HR3, a_Y + l_AbsH - l_VR3, l_HR3, l_VR3, Math.PI, Math.PI / 2);
						this.cLineTo(a_X + l_AbsW - l_HR2, a_Y + l_AbsH);
						this.cElpsArc(true, a_X + l_AbsW - l_HR2, a_Y + l_AbsH - l_VR2, l_HR2, l_VR2, +Math.PI / 2, 0);
						this.cLineTo(a_X + l_AbsW, a_Y + l_VR1);
						this.cElpsArc(true, a_X + l_AbsW - l_HR1, a_Y + l_VR1, l_HR1, l_VR1, 0, -Math.PI / 2);
					}
				}
				else
				{
					if (a_H < 0) // 左下角开始，逆时针
					{
						fLineToSp(this, a_LineToSp, a_X + l_HR0, a_Y + l_AbsH);
						this.cLineTo(a_X + l_AbsW - l_HR2, a_Y + l_AbsH);
						this.cElpsArc(true, a_X + l_AbsW - l_HR2, a_Y + l_AbsH - l_VR2, l_HR2, l_VR2, +Math.PI / 2, 0);
						this.cLineTo(a_X + l_AbsW, a_Y + l_VR1);
						this.cElpsArc(true, a_X + l_AbsW - l_HR1, a_Y + l_VR1, l_HR1, l_VR1, 0, -Math.PI / 2);
						this.cLineTo(a_X + l_HR0, a_Y);
						this.cElpsArc(true, a_X + l_HR0, a_Y + l_VR0, l_HR0, l_VR0, -Math.PI / 2, -Math.PI);
						this.cLineTo(a_X, a_Y + l_AbsH - l_VR3);
						this.cElpsArc(true, a_X + l_HR3, a_Y + l_AbsH - l_VR3, l_HR3, l_VR3, -Math.PI, -Math.PI * 3 / 2);
					}
					else // 左上角开始，顺时针
					{
						fLineToSp(this, a_LineToSp, a_X + l_HR0, a_Y);
						this.cLineTo(a_X + l_AbsW - l_HR1, a_Y);
						this.cElpsArc(true, a_X + l_AbsW - l_HR1, a_Y + l_VR1, l_HR1, l_VR1, -Math.PI / 2, 0);
						this.cLineTo(a_X + l_AbsW, a_Y + l_AbsH - l_VR2);
						this.cElpsArc(true, a_X + l_AbsW - l_HR2, a_Y + l_AbsH - l_VR2, l_HR2, l_VR2, 0, +Math.PI / 2);
						this.cLineTo(a_X + l_HR3, a_Y + l_AbsH);
						this.cElpsArc(true, a_X + l_HR3, a_Y + l_AbsH - l_VR3, l_HR3, l_VR3, +Math.PI / 2, Math.PI);
						this.cLineTo(a_X, a_Y + l_VR0);
						this.cElpsArc(true, a_X + l_HR0, a_Y + l_VR0, l_HR0, l_VR0, Math.PI, Math.PI * 3 / 2);
					}
				}
				return this;
			}
			,
			/// 箭头
			/// a_LineToSp：Boolean，若为false则直线到起点，若为true则移动到起点
			/// a_Sx, a_Sy, a_Tx, a_Ty：Number，起点和终点坐标
			/// a_HR, a_HR, a_BR：Number，头部长度，头部半径，身体半径
			cArw: function (a_LineToSp, a_Sx, a_Sy, a_Tx, a_Ty, a_HL, a_HR, a_BR)
			{
				var l_DtaX = (a_Tx - a_Sx), l_DtaY = (a_Ty - a_Sy);
				var l_AL = Math.sqrt(l_DtaX * l_DtaX + l_DtaY * l_DtaY);
				if (nWse.stNumUtil.cIz(l_AL)) // 长度为0
				{ return this; }

				var l_DirX = l_DtaX / l_AL, l_DirY = l_DtaY / l_AL;	// 方向
				var l_PerpX = -l_DirY, l_PerpY = l_DirX;			// 垂直方向
				var l_BL = Math.max(l_AL - a_HL, 0);				// 如果头比整个箭头都长，退化成三角形

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