/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nGpu)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nGpu",
		[
			"nWse:(3)CoreDast.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("(0)GpuMath.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
//	var stDomUtil = nWse.stDomUtil;
//	var stCssUtil = nWse.stCssUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 名字空间

	var nGpu = nWse.fNmspc(nWse,
		/// 图形处理器
		function nGpu() {});

	var unKnl = nWse.fNmspc(nGpu,
		function unKnl() {});

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fDet_3o(
		a_11, a_12, a_13,
		a_21, a_22, a_23,
		a_31, a_32, a_33)
	{
		var l_f = stNumUtil.cDet_2o;
		return	+a_11 * l_f(a_22, a_23, a_32, a_33	)
				-a_12 * l_f(a_21, a_23, a_31, a_33	)
				+a_13 * l_f(a_21, a_22, a_31, a_32	);
	}

	//function fDot_4d(a_Lx, a_Ly, a_Lz, a_Lw, a_Rx, a_Ry, a_Rz, a_Rw)
	//{
	//	return a_Lx * a_Rx + a_Ly * a_Ry + a_Lz * a_Rz + a_Lw * a_Rw;
	//}

	function f2dLen(a_x, a_y) 			{ return Math.sqrt((a_x * a_x) + (a_y * a_y)); }
	function f3dLen(a_x, a_y, a_z)		{ return Math.sqrt((a_x * a_x) + (a_y * a_y) + (a_z * a_z)); }

	function fCrsX(a_x, a_y, a_z, a_V)	{ return stNumUtil.cDet_2o(a_y, a_z, a_V.y, a_V.z); }
	function fCrsY(a_x, a_y, a_z, a_V)	{ return stNumUtil.cDet_2o(a_z, a_x, a_V.z, a_V.x); }
	function fCrsZ(a_x, a_y, a_z, a_V)	{ return stNumUtil.cDet_2o(a_x, a_y, a_V.x, a_V.y); }

	function fCrsX$NVxyz(a_NV, a_x, a_y, a_z) { return stNumUtil.cDet_2o(-a_NV.y, -a_NV.z, a_y, a_z); }
	function fCrsY$NVxyz(a_NV, a_x, a_y, a_z) { return stNumUtil.cDet_2o(-a_NV.z, -a_NV.x, a_z, a_x); }
	function fCrsZ$NVxyz(a_NV, a_x, a_y, a_z) { return stNumUtil.cDet_2o(-a_NV.x, -a_NV.y, a_x, a_y); }

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 四维向量

	var t4dVct;
	(function ()
	{
		t4dVct = nWse.fClass(nGpu,
		/// 四维向量，构造函数生成零向量
		function t4dVct()
		{
			this.x = 0;	this.y = 0;	this.z = 0;	this.w = 0;
		}
		,
		null
		,
		{
			/// 转成String
			toString : function toString()
			{
				return "(" + (this.x) + ", " + (this.y) + ", " + (this.z) + ", " + (this.w) + ")";
			}
			,
			/// 初始化
			/// 若不传实参，则同(0, 0, 0)
			/// 其他，必须传入三个Number
			cAs3dPnt_Init : function (a_Udfn$x, a_Udfn$y, a_Udfn$z)
			{
				if (0 == arguments.length)
				{ this.x = 0;	this.y = 0;	this.z = 0;  }
				else
				{ this.x = a_Udfn$x;	this.y = a_Udfn$y;	this.z = a_Udfn$z; }

				this.w = 1;
				return this;
			}
			,
			/// t3dPnt *= t4dMtx
			cAs3dPnt_Mul$4dMtx : function (a_M)
			{
				this.cAs3dVct_Mul$4dMtx(a_M);
				this.x += a_M.c_41;		this.y += a_M.c_42;		this.z += a_M.c_43;
				return this;
			}

			,
			/// 创建
			/// 若不传实参，则同(0, 0, 0)
			/// 若传入一个实参，则必须是t4dVct
			/// 若传入两个实参，则必须是t4dVct，t4dVct
			/// 其他，必须传入三个Number
			cAs3dVct_Init : function (a_Udfn$x$P1, a_Udfn$y$P2, a_Udfn$z)
			{
				if (0 == arguments.length)
				{ this.x = 0;	this.y = 0;	this.z = 0;  }
				else
				if (1 == arguments.length)
				{ this.x = a_Udfn$x$P1.x;	this.y = a_Udfn$x$P1.y;	this.z = a_Udfn$x$P1.z; }
				else
				if (2 == arguments.length)
				{ this.x = a_Udfn$y$P2.x - a_Udfn$x$P1.x;	this.y = a_Udfn$y$P2.y - a_Udfn$x$P1.y;	this.z = a_Udfn$y$P2.z - a_Udfn$x$P1.z; }
				else
				{ this.x = a_Udfn$x$P1;	this.y = a_Udfn$y$P2;	this.z = a_Udfn$z; }

				this.w = 0;
				return this;
			}
			,
			/// t3dVct += t3dVct
			cAs3dVct_Add : function (a_V)
			{
				this.x += a_V.x;	this.y += a_V.y;	this.z += a_V.z;
				return this;
			}
			,
			/// t3dVct -= t3dVct
			cAs3dVct_Sub : function (a_V)
			{
				this.x -= a_V.x;	this.y -= a_V.y;	this.z -= a_V.z;
				return this;
			}
			,
			/// t3dVct *= Number
			cAs3dVct_Mul$Num : function (a_S)
			{
				this.x *= a_S;	this.y *= a_S;	this.z *= a_S;
				return this;
			}
			,
			/// t3dVct *= t4dMtx
			cAs3dVct_Mul$4dMtx : function (a_M)
			{
				var l_x = this.x, l_y = this.y, l_z = this.z;
				this.x = l_x * a_M.c_11 + l_y * a_M.c_21 + l_z * a_M.c_31;
				this.y = l_x * a_M.c_12 + l_y * a_M.c_22 + l_z * a_M.c_32;
				this.z = l_x * a_M.c_13 + l_y * a_M.c_23 + l_z * a_M.c_33;
				return this;
			}
			,
			/// t3dVct /= Number
			cAs3dVct_Div$Num : function (a_S)
			{
				return this.cAs3dVct_Mul$Num(1 / a_S);
			}
			,
			/// 计算长度平方
			cAs3dVct_cCalcLenSqr : function ()
			{
				return (this.x * this.x) + (this.y * this.y) + (this.z * this.z);
			}
			,
			/// 计算长度
			cAs3dVct_cCalcLen : function ()
			{
				return f3dLen(this.x, this.y, this.z);
			}
			,
			/// 标准化
			cAs3dVct_Nmlz : function ()
			{
				return this.cAs3dVct_SclTo(1);
			}
			,
			/// 缩放到
			cAs3dVct_SclTo : function (a_Len)
			{
				var l_Len = this.cAs3dVct_cCalcLen();
				return (l_Len > 0) ? this.cAs3dVct_Mul$Num(a_Len / l_Len) : this;
			}
			,
			/// t3dVct ×= t3dVct
			cAs3dVct_Crs : function (a_V)
			{
				// y1 z1  z1 x1  x1 y1
				// y2 z2  z2 x2  x2 y2

				var l_x = this.x, l_y = this.y, l_z = this.z;
				this.x = fCrsX(l_x, l_y, l_z, a_V);
				this.y = fCrsY(l_x, l_y, l_z, a_V);
				this.z = fCrsZ(l_x, l_y, l_z, a_V);
				return this;
			}

			,
			/// 初始化
			cInit : function (a_x, a_y, a_z, a_w)
			{
				this.x = a_x || 0;	this.y = a_y || 0;	this.z = a_z || 0;	this.w = a_w || 0;
				return this;
			}
			,
			/// t4dVct *= Number
			cMul$Num : function (a_S)
			{
				this.cAs3dVct_Mul$Num();
				this.w *= a_S;
				return this;
			}
			,
			/// t4dVct *= t4dMtx
			cMul$4dMtx : function (a_M)
			{
				var l_x = this.x, l_y = this.y, l_z = this.z, l_w = this.w;
				this.cAs3dVct_Mul$4dMtx(a_M);
				this.x += l_w * a_M.c_41;		this.y += l_w * a_M.c_42;		this.z += l_w * a_M.c_43;
				this.w = l_x * a_M.c_14 + l_y * a_M.c_24 + l_z * a_M.c_34 + l_w * a_M.c_44;
				return this;
			}
			,
			/// t4dVct /= Number
			cDiv$Num : function (a_S)
			{
				return this.cMul$Num(1 / a_S);
			}
		}
		,
		{
			/// 拷贝
			scCopy : function (a_Orig)
			{
				t4dVct.oeVrfCopyOrig(a_Orig);

				return t4dVct.scAsn(new t4dVct(), a_Orig);
			}
			,
			/// 赋值
			scAsn : function (a_Dst, a_Src, a_Udfn$Doa, a_Udfn$Soa)
			{
				t4dVct.oeVrfAsnDstAndSrc(a_Dst, a_Src);

				a_Dst.x = a_Src.x;	a_Dst.y = a_Src.y;	a_Dst.z = a_Src.z;	a_Dst.w = a_Src.w;
				return a_Dst;
			}
			,
			/// 相等
			scEq : function (a_L, a_R, a_Udfn$E)
			{
				var l_f = nWse.stNumUtil.cEq;
				return	l_f(a_L.x, a_R.x, a_Udfn$E) && l_f(a_L.y, a_R.y, a_Udfn$E) && l_f(a_L.z, a_R.z, a_Udfn$E) && l_f(a_L.w, a_R.w, a_Udfn$E);
			}
			,
			/// 是否为零向量
			scIz : function (a_Tgt, a_Udfn$E)
			{
				var l_f = nWse.stNumUtil.cIz;
				return	l_f(a_Tgt.x, a_Udfn$E) && l_f(a_Tgt.y, a_Udfn$E) && l_f(a_Tgt.z, a_Udfn$E) && l_f(a_Tgt.w, a_Udfn$E);
			}
			,
			/// 点乘
			scDot : function (a_V1, a_V2)
			{
				return (a_V1.x * a_V2.x) + (a_V1.y * a_V2.y) + (a_V1.z * a_V2.z) + (a_V1.w * a_V2.w);
			}
		}
		,
		false);

	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 四维矩阵

	var t4dMtx;
	(function ()
	{
		t4dMtx = nWse.fClass(nGpu,
		/// 四维矩阵，构造函数生成单位矩阵
		function t4dMtx()
		{
			this.cIdty();
		}
		,
		null
		,
		{
			/// 转成String
			toString : function toString()
			{
				return	"┌" + (this.c_11) + ", " + (this.c_12) + ", " + (this.c_13) + ", " + (this.c_14) + "┐\n" +
						"│" + (this.c_21) + ", " + (this.c_22) + ", " + (this.c_23) + ", " + (this.c_24) + "│\n" +
						"│" + (this.c_31) + ", " + (this.c_32) + ", " + (this.c_33) + ", " + (this.c_34) + "│\n" +
						"└" + (this.c_41) + ", " + (this.c_42) + ", " + (this.c_43) + ", " + (this.c_44) + "┘";
			}
			,
			/// 单位化
			cIdty : function ()
			{
				this.c_11 = 1;	this.c_12 = 0;	this.c_13 = 0;	this.c_14 = 0;
				this.c_21 = 0;	this.c_22 = 1;	this.c_23 = 0;	this.c_24 = 0;
				this.c_31 = 0;	this.c_32 = 0;	this.c_33 = 1;	this.c_34 = 0;
				this.c_41 = 0;	this.c_42 = 0;	this.c_43 = 0;	this.c_44 = 1;
				return this;
			}
			,
			/// 初始化绕任意轴公旋
			/// a_U：t4dVct，必须是三维单位向量
			cInitRotAA : function (a_U, a_R)
			{
				var l_Cos = Math.cos(a_R), l_Sin = Math.sin(a_R), l_1NC = 1 - l_Cos;
				var l_UxUx = a_U.x * a_U.x, l_UxUy = a_U.x * a_U.y, l_UxUz = a_U.x * a_U.z,
					l_UyUy = a_U.y * a_U.y, l_UyUz = a_U.y * a_U.z,
					l_UzUz = a_U.z * a_U.z;

				this.c_11 = l_UxUx * l_1NC + l_Cos;			this.c_12 = l_UxUy * l_1NC + a_U.z * l_Sin;	this.c_13 = l_UxUz * l_1NC - a_U.y * l_Sin;	this.c_14 = 0;
				this.c_21 = l_UxUy * l_1NC - a_U.z * l_Sin;	this.c_22 = l_UyUy * l_1NC + l_Cos;			this.c_23 = l_UyUz * l_1NC + a_U.z * l_Sin;	this.c_24 = 0;
				this.c_31 = l_UxUz * l_1NC + a_U.y * l_Sin;	this.c_32 = l_UyUz * l_1NC - a_U.z * l_Sin;	this.c_33 = l_UzUz * l_1NC + l_Cos;			this.c_34 = 0;
				this.c_41 = 0;								this.c_42 = 0;								this.c_43 = 0;								this.c_44 = 1;
				return this;
			}
			,
			/// t4dMtx *= t4dMtx
			cMul : function (a_M)
			{
				var l_r1 = this.c_11, l_r2 = this.c_12, l_r3 = this.c_13, l_r4 = this.c_14;
				this.c_11 = l_r1 * a_M.c_11 + l_r2 * a_M.c_21 + l_r3 * a_M.c_31 + l_r4 * a_M.c_41;
				this.c_12 = l_r1 * a_M.c_12 + l_r2 * a_M.c_22 + l_r3 * a_M.c_32 + l_r4 * a_M.c_42;
				this.c_13 = l_r1 * a_M.c_13 + l_r2 * a_M.c_23 + l_r3 * a_M.c_33 + l_r4 * a_M.c_43;
				this.c_14 = l_r1 * a_M.c_14 + l_r2 * a_M.c_24 + l_r3 * a_M.c_34 + l_r4 * a_M.c_44;

				l_r1 = this.c_21; l_r2 = this.c_22; l_r3 = this.c_23; l_r4 = this.c_24;
				this.c_21 = l_r1 * a_M.c_11 + l_r2 * a_M.c_21 + l_r3 * a_M.c_31 + l_r4 * a_M.c_41;
				this.c_22 = l_r1 * a_M.c_12 + l_r2 * a_M.c_22 + l_r3 * a_M.c_32 + l_r4 * a_M.c_42;
				this.c_23 = l_r1 * a_M.c_13 + l_r2 * a_M.c_23 + l_r3 * a_M.c_33 + l_r4 * a_M.c_43;
				this.c_24 = l_r1 * a_M.c_14 + l_r2 * a_M.c_24 + l_r3 * a_M.c_34 + l_r4 * a_M.c_44;

				l_r1 = this.c_31; l_r2 = this.c_32; l_r3 = this.c_33; l_r4 = this.c_34;
				this.c_31 = l_r1 * a_M.c_11 + l_r2 * a_M.c_21 + l_r3 * a_M.c_31 + l_r4 * a_M.c_41;
				this.c_32 = l_r1 * a_M.c_12 + l_r2 * a_M.c_22 + l_r3 * a_M.c_32 + l_r4 * a_M.c_42;
				this.c_33 = l_r1 * a_M.c_13 + l_r2 * a_M.c_23 + l_r3 * a_M.c_33 + l_r4 * a_M.c_43;
				this.c_34 = l_r1 * a_M.c_14 + l_r2 * a_M.c_24 + l_r3 * a_M.c_34 + l_r4 * a_M.c_44;

				l_r1 = this.c_41; l_r2 = this.c_42; l_r3 = this.c_43; l_r4 = this.c_44;
				this.c_41 = l_r1 * a_M.c_11 + l_r2 * a_M.c_21 + l_r3 * a_M.c_31 + l_r4 * a_M.c_41;
				this.c_42 = l_r1 * a_M.c_12 + l_r2 * a_M.c_22 + l_r3 * a_M.c_32 + l_r4 * a_M.c_42;
				this.c_43 = l_r1 * a_M.c_13 + l_r2 * a_M.c_23 + l_r3 * a_M.c_33 + l_r4 * a_M.c_43;
				this.c_44 = l_r1 * a_M.c_14 + l_r2 * a_M.c_24 + l_r3 * a_M.c_34 + l_r4 * a_M.c_44;
				return this;
			}
			,
			/// 作为三维标架，放置
			/// 若不传实参，则同(0, 0, 0)
			/// 若传入一个实参，则必须是t4dVct
			/// 其他，必须传入三个Number
			cAs3dFrm_Put : function (a_Udfn$O$Ox, a_Udfn$Oy, a_Udfn$Oz)
			{
				if (0 == arguments.length)
				{ this.c_41 = 0;	this.c_42 = 0;	this.c_43 = 0; }
				else
				if (1 == arguments.length)
				{ this.c_41 = a_Udfn$O$Ox.x;	this.c_42 = a_Udfn$Oy.y;	this.c_43 = a_Udfn$Oy.z; }
				else
				{ this.c_41 = a_Udfn$O$Ox;		this.c_42 = a_Udfn$Oy;		this.c_43 = a_Udfn$Oy; }
				return this;
			}
			,
			/// 作为三维标架，沿X轴缩放
			cAs3dFrm_SclXA : function (a_Sx)
			{
				this.c_11 *= a_Sx;		this.c_12 *= a_Sx;		this.c_13 *= a_Sx;
				return this;
			}
			,
			/// 作为三维标架，沿Y轴缩放
			cAs3dFrm_SclYA : function (a_Sy)
			{
				this.c_21 *= a_Sy;		this.c_22 *= a_Sy;		this.c_23 *= a_Sy;
				return this;
			}
			,
			/// 作为三维标架，沿Z轴缩放
			cAs3dFrm_SclZA : function (a_Sz)
			{
				this.c_31 *= a_Sz;		this.c_32 *= a_Sz;		this.c_33 *= a_Sz;
				return this;
			}
			,
			/// 作为三维标架，均匀缩放
			cAs3dFrm_UniScl : function (a_S)
			{
				return this.cAs3dFrm_SclXA(a_S).cAs3dFrm_SclYA(a_S).cAs3dFrm_SclZA(a_S);
			}
			,
			/// 作为三维标架，沿三主轴缩放
			cAs3dFrm_SclPA : function (a_Sx, a_Sy, a_Sz)
			{
				return this.cAs3dFrm_SclXA(a_Sx).cAs3dFrm_SclYA(a_Sy).cAs3dFrm_SclZA(a_Sz);
			}
			,
			/// 作为三维标架，计算沿X轴缩放量
			cAs3dFrm_CalcSx : function ()
			{
				return f3dLen(this.c_11, this.c_12, this.c_13);
			}
			,
			/// 作为三维标架，计算沿Y轴缩放量
			cAs3dFrm_CalcSy : function ()
			{
				return f3dLen(this.c_21, this.c_22, this.c_23);
			}
			,
			/// 作为三维标架，计算沿Z轴缩放量
			cAs3dFrm_CalcSz : function ()
			{
				return f3dLen(this.c_31, this.c_32, this.c_33);
			}
			,
			/// 作为三维标架，绕X轴公旋
			cAs3dFrm_RotXA : function (a_R)
			{
				var l_42 = this.c_42, l_43 = this.c_43;
				this.cAs3dFrm_SpinXA(a_R);
				this.c_42 = l_42 * this.e_Cos - l_43 * this.e_Sin;		this.c_43 = l_42 * this.e_Sin + l_43 * this.e_Cos;
				return this;
			}
			,
			/// 作为三维标架，绕Y轴公旋
			cAs3dFrm_RotYA : function (a_R)
			{
				var l_41 = this.c_41, l_43 = this.c_43;
				this.cAs3dFrm_SpinYA(a_R);
				this.c_41 = l_41 * this.e_Cos + l_43 * this.e_Sin;		this.c_43 = -l_41 * this.e_Sin + l_43 * this.e_Cos;
				return this;
			}
			,
			/// 作为三维标架，绕Z轴公旋
			cAs3dFrm_RotZA : function (a_R)
			{
				var l_41 = this.c_41, l_42 = this.c_42;
				this.cAs3dFrm_SpinZA(a_R);
				this.c_41 = l_41 * this.e_Cos - l_42 * this.e_Sin;		this.c_42 = l_41 * this.e_Sin + l_42 * this.e_Cos;
				return this;
			}
			,
			/// 作为三维标架，绕X轴自旋
			cAs3dFrm_SpinXA : function (a_R)
			{
				this.e_Cos = Math.cos(a_R);		this.e_Sin = Math.sin(a_R);
				var l_12 = this.c_12, l_13 = this.c_13,
					l_22 = this.c_22, l_23 = this.c_23,
					l_32 = this.c_32, l_33 = this.c_33;

				this.c_12 = l_12 * this.e_Cos - l_13 * this.e_Sin;		this.c_13 = l_12 * this.e_Sin + l_13 * this.e_Cos;
				this.c_22 = l_22 * this.e_Cos - l_23 * this.e_Sin;		this.c_23 = l_22 * this.e_Sin + l_23 * this.e_Cos;
				this.c_32 = l_32 * this.e_Cos - l_33 * this.e_Sin;		this.c_33 = l_32 * this.e_Sin + l_33 * this.e_Cos;
				return this;
			}
			,
			/// 作为三维标架，绕Y轴自旋
			cAs3dFrm_SpinYA : function (a_R)
			{
				this.e_Cos = Math.cos(a_R);		this.e_Sin = Math.sin(a_R);
				var l_11 = this.c_11, l_13 = this.c_13,
					l_21 = this.c_21, l_23 = this.c_23,
					l_31 = this.c_31, l_33 = this.c_33;

				this.c_11 = l_11 * this.e_Cos + l_13 * this.e_Sin;		this.c_13 = -l_11 * this.e_Sin + l_13 * this.e_Cos;
				this.c_21 = l_21 * this.e_Cos + l_23 * this.e_Sin;		this.c_23 = -l_21 * this.e_Sin + l_23 * this.e_Cos;
				this.c_31 = l_31 * this.e_Cos + l_33 * this.e_Sin;		this.c_33 = -l_31 * this.e_Sin + l_33 * this.e_Cos;
				return this;
			}
			,
			/// 作为三维标架，绕Z轴自旋
			cAs3dFrm_SpinZA : function (a_R)
			{
				this.e_Cos = Math.cos(a_R);		this.e_Sin = Math.sin(a_R);
				var l_11 = this.c_11, l_12 = this.c_12,
					l_21 = this.c_21, l_22 = this.c_22,
					l_31 = this.c_31, l_32 = this.c_32;

				this.c_11 = l_11 * this.e_Cos - l_12 * this.e_Sin;		this.c_12 = l_11 * this.e_Sin + l_12 * this.e_Cos;
				this.c_21 = l_21 * this.e_Cos - l_22 * this.e_Sin;		this.c_22 = l_21 * this.e_Sin + l_22 * this.e_Cos;
				this.c_31 = l_31 * this.e_Cos - l_32 * this.e_Sin;		this.c_32 = l_31 * this.e_Sin + l_32 * this.e_Cos;
				return this;
			}
			,
			/// 作为三维标架，平移
			cAs3dFrm_Tslt : function (a_Tx, a_Ty, a_Tz)
			{
				this.c_41 += a_Tx;		this.c_42 += a_Ty;		this.c_43 += a_Tz;
				return this;
			}
			,
			/// 作为三维标架，瞄准
			cAs3dFrm_Aim : function (a_Pnt)
			{
				var l_Px = a_Pnt.x, l_Py = a_Pnt.y, l_Pz = a_Pnt.z;

				var l_f = stNumUtil.cEq;
				if (l_f(this.c_41, l_Px) && l_f(this.c_42, l_Py) && l_f(this.c_43, l_Pz))
				{ return this; }

				a_Pnt.x -= this.c_41;	a_Pnt.y -= this.c_42;	a_Pnt.z -= this.c_43;
				a_Pnt.cAs3dVct_Nmlz();
				this.cAs3dFrm_Face(a_Pnt);

				a_Pnt.x = l_Px;		a_Pnt.y = l_Py;		a_Pnt.z = l_Pz;
				return this;
			}
			,
			/// 作为三维标架，头朝给定方向
			/// a_U：t4dVct，必须是三维单位向量，位于当前标架所在空间
			cAs3dFrm_Head : function (a_U)
			{
				if (t4dVct.scIz(a_U))
				{ return this; }

				function fUpdZA(a_U)
				{
					this.c_31 = fCrsX(this.c_11, this.c_12, this.c_13, a_U);
					this.c_32 = fCrsY(this.c_11, this.c_12, this.c_13, a_U);
					this.c_33 = fCrsZ(this.c_11, this.c_12, this.c_13, a_U);
					var l_1ByL = 1 / f3dLen(this.c_31, this.c_32, this.c_33);
					this.c_31 *= l_1ByL;	this.c_32 *= l_1ByL;	this.c_33 *= l_1ByL;
				}

				var l_Sx, l_Sy, l_Sz;
				var l_1ByL;

				// ±Y轴
				if (stNumUtil.cEq(Math.abs(a_U.y), +1))
				{
					// 如果自身X轴与所属Y轴对齐，绕自身Z轴自旋±90°
					if (stNumUtil.cIz(this.c_11) && stNumUtil.cIz(this.c_13))
					{
						var l_Sign = stNumUtil.cSign(a_U.y * this.c_12);
						this.cAs3dFrm_SpinZA(-l_Sign * stNumUtil.i_PiBy2);
					}
					else // 将自身X轴沿所属Y轴投影，作为新的自身X轴
					{
						// 暂存缩放
						l_Sx = this.cAs3dFrm_CalcSx();
						l_Sy = this.cAs3dFrm_CalcSy();
						l_Sz = this.cAs3dFrm_CalcSz();

						// YA = U
						this.c_21 = a_U.x;	this.c_22 = a_U.y;	this.c_23 = a_U.z;

						// XA向OXY投影
						this.c_12 = 0;
						l_1ByL = 1 / f2dLen(this.c_11, this.c_13);
						this.c_11 *= l_1ByL;		this.c_13 *= l_1ByL;

						// ZA = XA × YA
						fUpdZA.call(this, a_U);

						// 还原缩放
						this.cAs3dFrm_SclPA(l_Sx, l_Sy, l_Sz);
					}
				}
				else // 将方向沿所属Y轴投影，绕所属Z轴旋转+90°，作为新的自身X轴
				{
					// 暂存缩放
					l_Sx = this.cAs3dFrm_CalcSx();
					l_Sy = this.cAs3dFrm_CalcSy();
					l_Sz = this.cAs3dFrm_CalcSz();

					// YA = U
					this.c_21 = a_U.x;	this.c_22 = a_U.y;	this.c_23 = a_U.z;

					// XA绕所属Z轴旋转+90°
					this.c_11 = a_U.z;	this.c_12 = 0;		this.c_13 = -a_U.x;
					l_1ByL = 1 / f2dLen(this.c_11, this.c_13);
					this.c_11 *= l_1ByL;					this.c_13 *= l_1ByL;

					// ZA = XA × YA
					fUpdZA.call(this, a_U);

					// 还原缩放
					this.cAs3dFrm_SclPA(l_Sx, l_Sy, l_Sz);
				}
				return this;
			}
			,
			/// 作为三维标架，面朝给定方向
			/// a_U：t4dVct，必须是三维单位向量，位于当前标架所在空间
			cAs3dFrm_Face : function (a_U)
			{
				if (t4dVct.scIz(a_U))
				{ return this; }

				function fUpdYA(a_NU)
				{
					this.c_21 = fCrsX$NVxyz(a_NU, this.c_11, this.c_12, this.c_13);
					this.c_22 = fCrsY$NVxyz(a_NU, this.c_11, this.c_12, this.c_13);
					this.c_23 = fCrsZ$NVxyz(a_NU, this.c_11, this.c_12, this.c_13);
					var l_1ByL = 1 / f3dLen(this.c_21, this.c_22, this.c_23);
					this.c_21 *= l_1ByL;	this.c_22 *= l_1ByL;	this.c_23 *= l_1ByL;
				}

				var l_Sx, l_Sy, l_Sz;
				var l_1ByL;

				// ±Y轴
				if (stNumUtil.cEq(Math.abs(a_U.y), +1))
				{
					// 如果自身X轴与所属Y轴对齐，绕自身Z轴自旋±90°
					if (stNumUtil.cIz(this.c_11) && stNumUtil.cIz(this.c_13))
					{
						var l_Sign = stNumUtil.cSign(-a_U.y * this.c_12);
						this.cAs3dFrm_SpinYA(+l_Sign * stNumUtil.i_PiBy2);
					}
					else // 将自身X轴沿所属Y轴投影，作为新的自身X轴
					{
						// 暂存缩放
						l_Sx = this.cAs3dFrm_CalcSx();
						l_Sy = this.cAs3dFrm_CalcSy();
						l_Sz = this.cAs3dFrm_CalcSz();

						// ZA = -U
						this.c_31 = -a_U.x;	this.c_32 = -a_U.y;	this.c_33 = -a_U.z;

						// XA向OXY投影
						this.c_12 = 0;
						l_1ByL = 1 / f2dLen(this.c_11, this.c_13);
						this.c_11 *= l_1ByL;		this.c_13 *= l_1ByL;

						// YA = ZA × XA
						fUpdYA.call(this, a_U);

						// 还原缩放
						this.cAs3dFrm_SclPA(l_Sx, l_Sy, l_Sz);
					}
				}
				else // 将方向沿所属Y轴投影，绕所属Z轴旋转+90°，作为新的自身X轴
				{
					// 暂存缩放
					l_Sx = this.cAs3dFrm_CalcSx();
					l_Sy = this.cAs3dFrm_CalcSy();
					l_Sz = this.cAs3dFrm_CalcSz();

					// ZA = -U
					this.c_31 = -a_U.x;	this.c_32 = -a_U.y;	this.c_33 = -a_U.z;

					// XA绕所属Z轴旋转+90°
					this.c_11 = -a_U.z;	this.c_12 = 0;		this.c_13 = a_U.x;
					l_1ByL = 1 / f2dLen(this.c_11, this.c_13);
					this.c_11 *= l_1ByL;					this.c_13 *= l_1ByL;

					// YA = ZA × XA
					fUpdYA.call(this, a_U);

					// 还原缩放
					this.cAs3dFrm_SclPA(l_Sx, l_Sy, l_Sz);
				}
				return this;
			}
			,
			/// 计算行列式
			cCalcDet : function ()
			{
				this.e_AC_11 = +fDet_3o(this.c_22, this.c_23, this.c_24, this.c_32, this.c_33, this.c_34, this.c_42, this.c_43, this.c_44);
				this.e_AC_12 = -fDet_3o(this.c_21, this.c_23, this.c_24, this.c_31, this.c_33, this.c_34, this.c_41, this.c_43, this.c_44);
				this.e_AC_13 = +fDet_3o(this.c_21, this.c_22, this.c_24, this.c_31, this.c_32, this.c_34, this.c_41, this.c_42, this.c_44);
				this.e_AC_14 = -fDet_3o(this.c_21, this.c_22, this.c_23, this.c_31, this.c_32, this.c_33, this.c_41, this.c_42, this.c_43);
				return	this.c_11 * this.e_AC_11 + this.c_12 * this.e_AC_12 + this.c_13 * this.e_AC_13 + this.c_14 * this.e_AC_14;
			}
			,
			/// 取逆
			cIvs : function ()
			{
				var l_Det = this.cCalcDet();
				if (0 == l_Det)
				{ throw new Error("cIvs：行列式为0，无法取逆！"); }

				var l_AC_21 = -fDet_3o(this.c_12, this.c_13, this.c_14, this.c_32, this.c_33, this.c_34, this.c_42, this.c_43, this.c_44);
				var l_AC_22 = +fDet_3o(this.c_11, this.c_13, this.c_14, this.c_31, this.c_33, this.c_34, this.c_41, this.c_43, this.c_44);
				var l_AC_23 = -fDet_3o(this.c_11, this.c_12, this.c_14, this.c_31, this.c_32, this.c_34, this.c_41, this.c_42, this.c_44);
				var l_AC_24 = +fDet_3o(this.c_11, this.c_12, this.c_13, this.c_31, this.c_32, this.c_33, this.c_41, this.c_42, this.c_43);

				var l_AC_31 = +fDet_3o(this.c_12, this.c_13, this.c_14, this.c_22, this.c_23, this.c_24, this.c_42, this.c_43, this.c_44);
				var l_AC_32 = -fDet_3o(this.c_11, this.c_13, this.c_14, this.c_21, this.c_23, this.c_24, this.c_41, this.c_43, this.c_44);
				var l_AC_33 = +fDet_3o(this.c_11, this.c_12, this.c_14, this.c_21, this.c_22, this.c_24, this.c_41, this.c_42, this.c_44);
				var l_AC_34 = -fDet_3o(this.c_11, this.c_12, this.c_13, this.c_21, this.c_22, this.c_23, this.c_41, this.c_42, this.c_43);

				var l_AC_41 = -fDet_3o(this.c_12, this.c_13, this.c_14, this.c_22, this.c_23, this.c_24, this.c_32, this.c_33, this.c_34);
				var l_AC_42 = +fDet_3o(this.c_11, this.c_13, this.c_14, this.c_21, this.c_23, this.c_24, this.c_31, this.c_33, this.c_34);
				var l_AC_43 = -fDet_3o(this.c_11, this.c_12, this.c_14, this.c_21, this.c_22, this.c_24, this.c_31, this.c_32, this.c_34);
				var l_AC_44 = +fDet_3o(this.c_11, this.c_12, this.c_13, this.c_21, this.c_22, this.c_23, this.c_31, this.c_32, this.c_33);

				var l_1ByDet = 1 / l_Det;
				this.c_11 = this.e_AC_11 * l_1ByDet;	this.c_12 = l_AC_21 * l_1ByDet;	this.c_13 = l_AC_31 * l_1ByDet;	this.c_14 = l_AC_41 * l_1ByDet;
				this.c_21 = this.e_AC_12 * l_1ByDet;	this.c_22 = l_AC_22 * l_1ByDet;	this.c_23 = l_AC_32 * l_1ByDet;	this.c_24 = l_AC_42 * l_1ByDet;
				this.c_31 = this.e_AC_13 * l_1ByDet;	this.c_32 = l_AC_23 * l_1ByDet;	this.c_33 = l_AC_33 * l_1ByDet;	this.c_34 = l_AC_43 * l_1ByDet;
				this.c_41 = this.e_AC_14 * l_1ByDet;	this.c_42 = l_AC_24 * l_1ByDet;	this.c_43 = l_AC_34 * l_1ByDet;	this.c_44 = l_AC_44 * l_1ByDet;
				return this;
			}
		}
		,
		{
			/// 拷贝
			scCopy : function (a_Orig)
			{
				t4dMtx.oeVrfCopyOrig(a_Orig);

				return t4dMtx.scAsn(new t4dMtx(), a_Orig);
			}
			,
			/// 赋值
			scAsn : function (a_Dst, a_Src, a_Udfn$Doa, a_Udfn$Soa)
			{
				t4dMtx.oeVrfAsnDstAndSrc(a_Dst, a_Src);

				a_Dst.c_11 = a_Src.c_11;	a_Dst.c_12 = a_Src.c_12;	a_Dst.c_13 = a_Src.c_13;	a_Dst.c_14 = a_Src.c_14;
				a_Dst.c_21 = a_Src.c_21;	a_Dst.c_22 = a_Src.c_22;	a_Dst.c_23 = a_Src.c_23;	a_Dst.c_24 = a_Src.c_24;
				a_Dst.c_31 = a_Src.c_31;	a_Dst.c_32 = a_Src.c_32;	a_Dst.c_33 = a_Src.c_33;	a_Dst.c_34 = a_Src.c_34;
				a_Dst.c_41 = a_Src.c_41;	a_Dst.c_42 = a_Src.c_42;	a_Dst.c_43 = a_Src.c_43;	a_Dst.c_44 = a_Src.c_44;
				return a_Dst;
			}
			,
			/// 相等
			scEq : function (a_L, a_R, a_Udfn$E)
			{
				var l_f = nWse.stNumUtil.cEq;
				return	l_f(a_L.c_11, a_R.c_11, a_Udfn$E) && l_f(a_L.c_12, a_R.c_12, a_Udfn$E) && l_f(a_L.c_13, a_R.c_13, a_Udfn$E) && l_f(a_L.c_14, a_R.c_14, a_Udfn$E) &&
						l_f(a_L.c_21, a_R.c_21, a_Udfn$E) && l_f(a_L.c_22, a_R.c_22, a_Udfn$E) && l_f(a_L.c_23, a_R.c_23, a_Udfn$E) && l_f(a_L.c_24, a_R.c_24, a_Udfn$E) &&
						l_f(a_L.c_31, a_R.c_31, a_Udfn$E) && l_f(a_L.c_32, a_R.c_32, a_Udfn$E) && l_f(a_L.c_33, a_R.c_33, a_Udfn$E) && l_f(a_L.c_34, a_R.c_34, a_Udfn$E) &&
						l_f(a_L.c_41, a_R.c_41, a_Udfn$E) && l_f(a_L.c_42, a_R.c_42, a_Udfn$E) && l_f(a_L.c_43, a_R.c_43, a_Udfn$E) && l_f(a_L.c_44, a_R.c_44, a_Udfn$E);
			}
		}
		,
		false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////