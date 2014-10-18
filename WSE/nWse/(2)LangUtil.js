/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.stLog)
	{
		//@ 避免重复执行相同的初始化代码
	//	console.log("避免重复：(2)LangUtil.js");
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"(1)ObjOrtd.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("(2)LangUtil.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var unKnl = nWse.unKnl;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 日志静态类

	(function ()
	{
		/// 日志
		var stLog = function () { };
		nWse.stLog = stLog;
		stLog.onHost = nWse;
		stLog.oc_FullTpnm = nWse.ocBldFullName("stLog");

		/// 构建全名
		stLog.ocBldFullName = function (a_Name)
		{
			return stLog.oc_FullTpnm + "." + a_Name;
		};

		//======== 私有字段

		// 缓冲
		var e_Bfr = "";

		//======== 私有函数

		function eOpt(a_Str)
		{
			if (nWse.stStrUtil.cHasMltLines(a_Str))
			{
				var l_LineAry = nWse.stStrUtil.cSplToLines(a_Str);
				nWse.stAryUtil.cFor(l_LineAry, function (a_Tgt, a_Idx, a_Line) { console.log(a_Line); });
			}
			else
			{
				console.log(a_Str);
			}
		}

		//======== 公有函数

		/// 缓冲放入
		/// a_Any：任意
		stLog.cBfrPut = function (a_Any)
		{
			if (! nWse.fIsUdfnOrNull(a_Any))
			{ e_Bfr += a_Any.toString(); }
			return stLog;
		};

		/// 缓冲放入一行
		/// a_Any：任意
		stLog.cBfrPutLine = function (a_Any)
		{
			if (! nWse.fIsUdfnOrNull(a_Any))
			{ e_Bfr += a_Any.toString(); }		
			e_Bfr += "\n";
			return stLog;
		};

		/// 刷新缓冲
		stLog.cFluBfr = function ()
		{
			if (0 == e_Bfr.length)
			{ return stLog; }

			eOpt(e_Bfr);
			e_Bfr = "";
			return stLog;
		};

		/// 放入一行
		/// a_Any：任意
		stLog.cPutLine = function (a_Any)
		{
			if (e_Bfr.length > 0)
			{ stLog.cFluBfr(); }

			if (! nWse.fIsUdfnOrNull(a_Any))
			{ eOpt(a_Any.toString()); }
			else
			{ console.log(); }
			return stLog;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 数字实用静态类

	(function ()
	{
		/// 数字实用
		var stNumUtil = function () { };
		nWse.stNumUtil = stNumUtil;
		stNumUtil.onHost = nWse;
		stNumUtil.oc_FullTpnm = nWse.ocBldFullName("stNumUtil");

		/// 构建全名
		stNumUtil.ocBldFullName = function (a_Name)
		{
			return stNumUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 私有字段

		//======== 公有字段

		/// log(10)
		stNumUtil.i_Log10 = Math.log(10);

		/// π
		stNumUtil.i_Pi = Math.PI;

		/// 2π
		stNumUtil.i_2Pi = Math.PI * 2;

		/// π/2
		stNumUtil.i_PiBy2 = Math.PI / 2;

		/// 双精度浮点数误差，默认10^-6
		stNumUtil.c_DblErr = 1e-6;

		//======== 公有函数

		/// 获取位
		/// a_Num：Number，数字
		/// a_Idx：Number，索引，最低位是0
		/// 返回：Boolean，若a_Idx位是1则返回true，否则返回false
		stNumUtil.cGetBit = function (a_Num, a_Idx)
		{
			return (0 != (a_Num & (0x01 << a_Idx)));
		};

		/// 设置位
		/// a_Num：Number，数字
		/// a_Idx：Number，索引，最低位是0
		/// a_Val：Boolean，a_Idx位的值，false=0，true=1
		/// 返回：Number，设置后的数字
		stNumUtil.cSetBit = function (a_Num, a_Idx, a_Val)
		{
			return a_Val ? (a_Num | (0x01 << a_Idx)) : (a_Num & ~(0x01 << a_Idx));
		};

		/// 翻转位
		/// a_Num：Number，数字
		/// a_Idx：Number，索引，最低位是0
		/// 返回：Number，翻转后的数字
		stNumUtil.cFlipBit = function (a_Num, a_Idx)
		{
			return (a_Num ^ (0x01 << a_Idx));
		};

		/// 合并4字节
		/// a_Byte0：Number，字节0
		/// a_Byte1：Number，字节1
		/// a_Byte2：Number，字节2
		/// a_Byte3：Number，字节3
		/// 返回：Number，32位无符号整数，最低字节是a_Byte0，最高字节是a_Byte3
		stNumUtil.cCmbn4Bytes = function (a_Byte0, a_Byte1, a_Byte2, a_Byte3)
		{
			return ((a_Byte3 << 24) + (a_Byte2 << 16) + (a_Byte1 << 8) + a_Byte0);
		};

		/// 分解4字节
		/// a_4Bytes：Number，32位无符号整数
		/// 返回：Array，[字节0，字节1，字节2，字节3]，最低字节是[0]，最高字节是[3]
		stNumUtil.cSpl4Bytes = function (a_4Bytes)
		{
			var l_Rst = new Array(4);
			l_Rst[0] = a_4Bytes & 0xFF;
			l_Rst[1] = (a_4Bytes >> 8) & 0xFF;
			l_Rst[2] = (a_4Bytes >> 16) & 0xFF;
			l_Rst[3] = (a_4Bytes >> 32) & 0xFF;
			return l_Rst;
		};

		/// 是否为2的幂？
		/// a_Num：Number，数字，必须是四字节整数
		/// 返回：Boolean，是否
		stNumUtil.cIsPowOf2 = function (a_Num)
		{
			var l_Bit = 0;
			var l_Int = 1;
			for (; l_Bit<32; ++l_Bit)
			{
				if (l_Int == a_Num)
				{ return true; }

				l_Int <<= 1;
			}
			return false;
		};

		/// 相等
		/// a_L：Number，左运算数
		/// a_R：Number，右运算数
		/// a_Udfn$E：undefined$Number，误差
		/// 返回：Boolean，差的绝对值是否≤误差
		stNumUtil.cEq = function (a_L, a_R, a_Udfn$E)
		{
			if (nWse.fIsUdfnOrNull(a_Udfn$E))
			{ a_Udfn$E = stNumUtil.c_DblErr; }
			return (Math.abs(a_L - a_R) <= a_Udfn$E);
		};

		/// 不等
		stNumUtil.cNe = function (a_L, a_R, a_Udfn$E)
		{
			return (! stNumUtil.cEq(a_L, a_R, a_Udfn$E));
		};

		/// 为0
		stNumUtil.cIz = function (a_Tgt, a_Udfn$E)
		{
			return stNumUtil.cEq(a_Tgt, 0, a_Udfn$E);
		};

		/// 非0
		stNumUtil.cNz = function (a_Tgt, a_Udfn$E)
		{
			return (! stNumUtil.cEq(a_Tgt, 0, a_Udfn$E));
		};

		/// 比较
		/// 返回：Number，-1表示左＜右，0表示左＝右，+1表示左＞右
		stNumUtil.cCmpr = function (a_L, a_R)
		{
			return (a_L < a_R) ? -1 : ((a_L > a_R) ? +1 : 0);
		};

		/// 符号
		/// 返回：a_Tgt若＜0为-1，＞0为+1，＝0为0
		stNumUtil.cSign = function (a_Tgt)
		{
			return (a_Tgt < 0) ? -1 : ((a_Tgt > 0) ? +1 : 0);
		};

		/// 数量级
		/// a_Tgt：Number，目标，0的数量级为0，＜0时同相反数的数量级
		/// 返回：Number，数量级
		stNumUtil.cOrdOfMag = function (a_Tgt)
		{
			return (0 == a_Tgt) ? 0 : Math.floor(Math.log(Math.abs(a_Tgt)) / stNumUtil.i_Log10);
		};

		/// 进一舍入
		/// 返回：进一舍入后的数字，若a_Tgt＜0则向-∞方向舍入，如-3.0→-3，-3.1→-4
		stNumUtil.cRound01 = function (a_Tgt)
		{
			var l_Int;
			if (a_Tgt < 0)
			{
				l_Int = Math.ceil(a_Tgt);
				return (l_Int == a_Tgt) ? l_Int : (l_Int - 1);
			}
			else
			{
				l_Int = Math.floor(a_Tgt);
				return (l_Int == a_Tgt) ? l_Int : (l_Int + 1);
			}
		};

		/// 四舍五入
		/// 返回：四舍五入后的数字，若a_Tgt＜0则向-∞方向舍入，如-3.1→-3，-3.5→-4
		stNumUtil.cRound45 = function (a_Tgt)
		{
			return Math.round(a_Tgt);
		//	return (a_Tgt < 0) ? Math.ceil(a_Tgt - 0.5) : Math.floor(a_Tgt + 0.5);
		};

		/// 四舍五入整数部分
		/// a_Cnt：Number，保留多少位整数（从最高位向右计数），必须≥0
		/// 返回：四舍五入后的数字，若a_Tgt＜0则向-∞方向舍入，如a_Cnt=1时-11→-10，-15→-20
		stNumUtil.cRoundInt45 = function (a_Tgt, a_Cnt)
		{
			var l_Oom = stNumUtil.cOrdOfMag(a_Tgt);	// 取得数量级
			var l_IntTot = l_Oom + 1;	// 整数部分总位数＝数量级＋1
			if (l_IntTot <= a_Cnt)		// 整数部分总位数不多于要求保留的位数，无需舍入
			{ return a_Tgt; }

			var l_Pow = Math.pow(10, l_IntTot - a_Cnt);
			return stNumUtil.cRound45(a_Tgt / l_Pow) * l_Pow;
		};

		/// 四舍五入小数部分
		/// a_Cnt：Number，保留多少位小数（从十分之一位向右计数），必须≥0
		/// 返回：四舍五入后的数字，若a_Tgt＜0则向-∞方向舍入，如a_Cnt=1时-3.11→-3.1，-3.56→-3.6
		stNumUtil.cRoundDec45 = function (a_Tgt, a_Cnt)
		{
			var l_Pow = Math.pow(10, a_Cnt);
			return stNumUtil.cRound45(a_Tgt * l_Pow) / l_Pow;
		};

		/// 是否在开区间里
		/// 返回：Boolean，是否
		stNumUtil.cInOpenItvl = function (a_Tgt, a_Min, a_Max)
		{
			return (a_Min < a_Tgt) && (a_Tgt < a_Max);
		};

		/// 是否在闭区间里
		/// 返回：Boolean，是否
		stNumUtil.cInClsdItvl = function (a_Tgt, a_Min, a_Max)
		{
			return (a_Min <= a_Tgt) && (a_Tgt <= a_Max);
		};

		/// 是否在左开右闭区间里
		/// 返回：Boolean，是否
		stNumUtil.cInLoRcItvl = function (a_Tgt, a_Min, a_Max)
		{
			return (a_Min < a_Tgt) && (a_Tgt <= a_Max);
		};

		/// 是否在左闭右开区间里
		/// 返回：Boolean，是否
		stNumUtil.cInLcRoItvl = function (a_Tgt, a_Min, a_Max)
		{
			return (a_Min <= a_Tgt) && (a_Tgt < a_Max);
		};

		/// 是否有交叠？
		/// 返回：Boolean，是否
		stNumUtil.cHasOvlp = function (a_Min1, a_Max1, a_Min2, a_Max2)
		{
			return (a_Min1 <= a_Max2) && (a_Min2 <= a_Max1);
		};

		/// 截断关于数字
		/// a_Num：Number，数字
		/// a_Min：Number，最小值
		/// a_Max：Number，最大值
		/// 返回：Number，截断后的数字
		stNumUtil.cClmOnNum = function (a_Num, a_Min, a_Max)
		{
			return (a_Num < a_Min) ? a_Min : Math.min(a_Num, a_Max);
		};

		/// 关于字符串
		/// a_Rst：若a_Udfn$Amt为null或undefined则忽略，否则为Object，
		/// {
		/// c_Bgn：Number，截断后的起始索引
		/// c_Amt：Number，截断后的数量
		/// }
		/// a_Str：String，字符串
		/// a_Bgn：Number，起始索引
		/// a_Udfn$Amt：undefined$Number，数量
		/// 返回：若a_Udfn$Amt为null或undefined则返回截断后的起始索引，否则返回a_Rst
		stNumUtil.cClmOnStr = function (a_Rst, a_Str, a_Bgn, a_Udfn$Amt)
		{
			// 只会访问length属性，String也有
			return stNumUtil.cClmOnAry(a_Rst, a_Str, a_Bgn, a_Udfn$Amt);
		};

		/// 关于数组
		/// a_Rst：若a_Udfn$Amt为null或undefined则忽略，否则为Object，
		/// {
		/// c_Bgn：Number，截断后的起始索引
		/// c_Amt：Number，截断后的数量
		/// }
		/// a_Ary：Array，数组，若为空则a_Bgn=-1，a_Udfn$Amt=0
		/// a_Bgn：Number，起始索引
		/// a_Udfn$Amt：undefined$Number，数量
		/// 返回：若a_Udfn$Amt为null或undefined则返回截断后的起始索引，否则返回a_Rst
		stNumUtil.cClmOnAry = function (a_Rst, a_Ary, a_Bgn, a_Udfn$Amt)
		{
			if ((! a_Ary) || (0 === a_Ary.length))
			{
				if (nWse.fIsUdfnOrNull(a_Udfn$Amt))
				{ return -1; }

				a_Rst.c_Bgn = -1;
				a_Rst.c_Amt = 0;
				return a_Rst;
			}

			if (a_Bgn < 0)
			{ a_Bgn = 0; }
			else
			if (a_Bgn > a_Ary.length - 1)
			{ a_Bgn = a_Ary.length - 1; }

			if (nWse.fIsUdfnOrNull(a_Udfn$Amt))
			{ return a_Bgn; }

			if (a_Bgn + a_Udfn$Amt > a_Ary.length)
			{ a_Udfn$Amt = a_Ary.length - a_Bgn; }

			a_Rst.c_Bgn = a_Bgn;
			a_Rst.c_Amt = a_Udfn$Amt;
			return a_Rst;
		};


		/// 随机
		/// a_Min：Number，最小值
		/// a_Lmt：Number，极限值，取不到
		/// 返回：Number，∈[a_Min, a_Lmt)
		stNumUtil.cRand = function (a_Min, a_Lmt)
		{
			return a_Min + Math.random() * (a_Lmt - a_Min);	// random()∈[0, 1)
		};

		/// 随机整数
		/// a_Min：Number，最小值
		/// a_Max：Number，最大值，可以取到
		/// 返回：Number，∈[a_Min, a_Max]
		stNumUtil.cRandInt = function (a_Min, a_Max)
		{
			return Math.floor(a_Min + Math.random() * (a_Max - a_Min + 1));
		};

		/// 弧度从角度
		/// 返回：Number，弧度
		stNumUtil.cRadFromDeg = function (a_Tgt)
		{
			return a_Tgt * Math.PI / 180;
		};

		/// 弧度从角度
		/// 返回：Number，弧度
		stNumUtil.cDegFromRad = function (a_Tgt)
		{
			return a_Tgt * 180 / Math.PI;
		};

		/// 标准化弧度
		/// a_Udfn$Signed：undefined$Boolean，有符号，默认为false
		/// 返回：Number，弧度，a_Udfn$Signed为false时∈[0, 2π)，为true时∈(-π, π]
		stNumUtil.cNmlzRad = function (a_Tgt, a_Udfn$Signed)
		{
			var l_Mltp = Math.floor(a_Tgt / stNumUtil.i_2Pi);
			var l_Rst = a_Tgt - stNumUtil.i_2Pi * l_Mltp;
			if (a_Udfn$Signed && (l_Rst > Math.PI))
			{ l_Rst -= stNumUtil.i_2Pi; }
			return l_Rst;
		};

		/// 标准化角度
		/// a_Udfn$Signed：undefined$Boolean，有符号，默认为false
		/// 返回：Number，角度，a_Signed为false时∈[0, 360)，为true时∈(-180, 180]
		stNumUtil.cNmlzDeg = function (a_Tgt, a_Udfn$Signed)
		{
			var l_Mltp = Math.floor(a_Tgt / 360);
			var l_Rst = a_Tgt - 360 * l_Mltp;
			if (a_Udfn$Signed && (l_Rst > 180))
			{ l_Rst -= 360; }
			return l_Rst;
		};

		/// 线性插值
		/// a_Bgn：Number，起始值
		/// a_End：Number，结束值
		/// a_Scl：Number，比例∈[0, 1]
		/// 返回：Number
		stNumUtil.cLnrItp = function (a_Bgn, a_End, a_Scl)
		{
			return a_Bgn + (a_End - a_Bgn) * a_Scl;
		};

		/// 抛物插值
		/// a_Bgn：Number，起始值
		/// a_End：Number，结束值
		/// a_Scl：Number，比例∈[0, 1]
		/// a_SlowToFast：Boolean，先慢后快（开口向上）
		/// 返回：Number
		stNumUtil.cPrbItp = function (a_Bgn, a_End, a_Scl, a_SlowToFast)
		{
			var l_a, l_b;
			if (a_SlowToFast)
			{
				l_a = a_End - a_Bgn;
				l_b = 0;
			}
			else
			{
				l_a = a_Bgn - a_End;
				l_b = -2.0 * l_a;
			}
			return	(l_a * a_Scl * a_Scl + l_b * a_Scl + a_Bgn);
		};

		/// 抛物插值（溢出）
		/// a_Bgn：Number，起始值
		/// a_End：Number，结束值
		/// a_Top：Number，顶点值
		/// a_Scl：Number，比例∈[0, 1]
		/// a_SlowToFast：Boolean，先慢后快（开口向上）
		/// 返回：Number
		stNumUtil.cPrbItp$Ovfl = function (a_Bgn, a_End, a_Top, a_Scl, a_SlowToFast)
		{
			// a_Top不能在a_Bgn与a_End之间
			if ((a_Bgn < a_Top && a_Top < a_End) || (a_End < a_Top && a_Top < a_Bgn) || (a_Bgn == a_Top))
			{ return	stNumUtil.cPrbItp(a_Bgn, a_End, a_Scl, a_SlowToFast); }

			var l_a, l_b, l_m;
			if (a_Bgn == a_End)
			{
				l_m = 0.5;
			}
			else
			if (a_End == a_Top)
			{
				l_m = 1.0;
			}
			else
			{
				var l_k = (a_End - a_Bgn) / (a_Top - a_Bgn);
				if (l_k > 1.0)
				{ return	stNumUtil.cPrbItp(a_Bgn, a_End, a_Scl, a_SlowToFast); }

				l_m = (1.0 - Math.sqrt(1.0 - l_k)) / l_k;
			}

			l_a = (a_Bgn - a_Top) / (l_m * l_m);
			l_b = -2.0 * l_a * l_m;
			return	(l_a * a_Scl * a_Scl + l_b * a_Scl + a_Bgn);
		};

		/// 点乘 - 二维
		stNumUtil.cDot_2d = function (a_Lx, a_Ly, a_Rx, a_Ry)
		{
			return (a_Lx * a_Rx) + (a_Ly * a_Ry);
		};

		/// 行列式 - 二阶
		stNumUtil.cDet_2o = function (a_11, a_12, a_21, a_22)
		{
			return (a_11 * a_22) - (a_12 * a_21);
		};

		/// 求解线性方程组 - 二元一次
		/// a_Rst：Object，
		/// {
		/// c_11：Number，不可解时为NaN
		/// c_21：Number，不可解时为NaN
		/// }
		/// A * X = B，其中A为系数矩阵，X为未知数矩阵，B为值矩阵
		/// 返回：a_Rst
		stNumUtil.cSlvLnrSys_2u1o = function (a_Rst, a_A11, a_A12, a_A21, a_A22, a_B11, a_B21, a_Udfn$E)
		{
			var l_Det = stNumUtil.cDet_2o(a_A11, a_A12, a_A21, a_A22);
			if (stNumUtil.cIz(l_Det, a_Udfn$E))
			{
				a_Rst.c_11 = NaN;
				a_Rst.c_21 = NaN;
				return a_Rst;
			}

			var l_1ByDet = 1.0 / l_Det;
			a_Rst.c_11 = stNumUtil.cDet_2o(a_B11, a_A12, a_B21, a_A22) * l_1ByDet;
			a_Rst.c_21 = stNumUtil.cDet_2o(a_A11, a_B11, a_A21, a_B21) * l_1ByDet;
			return a_Rst;
		};

		/// 求解多项式根 - 二阶
		/// a_Rst：Object，
		/// {
		/// c_Rmin：Number，较小根，不可解时为NaN
		/// c_Rmax：Number，较大根，不可解时为NaN
		/// }
		/// a_A * x^2 + a_B * x + a_C = 0
		/// 返回：a_Rst
		stNumUtil.cSlvPlnmRoot_2o = function (a_Rst, a_A, a_B, a_C)
		{
			var l_Dta = a_B * a_B - 4 * a_A * a_C;
			if (l_Dta < 0)
			{
				a_Rst.c_Rmin = NaN;
				a_Rst.c_Rmax = NaN;
				return a_Rst;
			}

			var l_SqrtDta = Math.sqrt(l_Dta);
			var l_2A = 2 * a_A;
			a_Rst.c_Rmin = (-a_B - l_SqrtDta) / l_2A;
			a_Rst.c_Rmax = (-a_B + l_SqrtDta) / l_2A;
			return a_Rst;
		};

		/// 二维贝塞尔
		/// a_Rst：t2dPnt
		/// {
		/// x，y：Number，坐标
		/// }
		/// a_Cps：t2dPnt[]，控制点数组，取前四个
		/// a_T：Number，∈[0, 1]
		stNumUtil.c2dBzr = function (a_Rst, a_Cps, a_T)
		{
			var l_T = a_T,  l_T_2o = l_T * l_T,  l_T_3o = l_T_2o * l_T;
			var l_1SubT = 1 - a_T, l_1SubT_2o = l_1SubT * l_1SubT, l_1SubT_3o = l_1SubT_2o * l_1SubT;
			var l_C0 = l_1SubT_3o, l_C1 = 3 * l_T * l_1SubT_2o, l_C2 = 3 * l_T_2o * l_1SubT, l_C3 = l_T_3o;
			a_Rst.x = l_C0 * a_Cps[0].x + l_C1 * a_Cps[1].x + l_C2 * a_Cps[2].x + l_C3 * a_Cps[3].x;
			a_Rst.y = l_C0 * a_Cps[0].y + l_C1 * a_Cps[1].y + l_C2 * a_Cps[2].y + l_C3 * a_Cps[3].y;
			return a_Rst;
		};

		/// 单位化四元数
		/// a_Tgt：Object { x, y, z, w }
		/// 返回：a_Tgt
		stNumUtil.cUnitQtn = function (a_Tgt)
		{
			a_Tgt.x = a_Tgt.y = a_Tgt.z = 0;	a_Tgt.w = 1;
			return a_Tgt;
		};

		/// 共轭化四元数
		/// a_Tgt：Object { x, y, z, w }
		/// 返回：a_Tgt
		stNumUtil.cConjQtn = function (a_Tgt)
		{
			a_Tgt.x = -a_Tgt.x;		a_Tgt.y = -a_Tgt.y;		a_Tgt.z = -a_Tgt.z;
			return a_Tgt;
		};

		/// 四元数模
		stNumUtil.cQtnMag = function (a_Tgt)
		{
			return Math.sqrt(a_Tgt.x * a_Tgt.x + a_Tgt.y * a_Tgt.y + a_Tgt.z * a_Tgt.z + a_Tgt.w * a_Tgt.w);
		};

		/// 标准化四元数
		stNumUtil.cNmlzQtn = function (a_Tgt)
		{
			var l_Mag = stNumUtil.cQtnMag(a_Tgt);
			if (0 != l_Mag)
			{ a_Tgt.x /= l_Mag;	a_Tgt.y /= l_Mag;	a_Tgt.z /= l_Mag;	a_Tgt.w /= l_Mag; }
			return a_Tgt;
		};

		/// 创建四元数 - 三维向量
		/// a_Vx, a_Vy, a_Vz：Number，三维向量的三个分量，不能同时为0
		/// 返回：a_Rst，Object { x, y, z, w }
		stNumUtil.cCrtQtn$3dVct = function (a_Rst, a_Vx, a_Vy, a_Vz)
		{
			a_Rst.x = a_Vx;		a_Rst.y = a_Vy;		a_Rst.z = a_Vz;		a_Rst.w = 0;
			return a_Rst;
		};

		/// 创建四元数 - 任意轴弧度
		/// a_Ax, a_Ay, a_Az, a_Rad：Number，轴的三个分量，绕该轴旋转的弧度
		/// 返回：a_Rst，Object { x, y, z, w }
		stNumUtil.cCrtQtn$AaRad = function (a_Rst, a_Ax, a_Ay, a_Az, a_Rad)
		{
			var l_Sin = Math.sin(a_Rad / 2), l_Cos = Math.cos(a_Rad / 2);
			a_Rst.x = l_Sin * a_Ax;		a_Rst.y = l_Sin * a_Ay;		a_Rst.z = l_Sin * a_Az;		a_Rst.w = l_Cos;
			return a_Rst;
		};

		/// 创建四元数 - 主轴弧度
		/// a_Rx, a_Ry, a_Rz：Number，依次绕三主轴（X、Y、Z）旋转的弧度
		/// 返回：a_Rst，Object { x, y, z, w }
		stNumUtil.cCrtQtn$PaRad = function (a_Rst, a_Rx, a_Ry, a_Rz)
		{
			var l_Sin0 = Math.sin(a_Rx / 2), l_Cos0 = Math.cos(a_Rx / 2);
			var l_Sin1 = Math.sin(a_Ry / 2), l_Cos1 = Math.cos(a_Ry / 2);
			var l_Sin2 = Math.sin(a_Rz / 2), l_Cos2 = Math.cos(a_Rz / 2);
			a_Rst.x =  l_Sin0 * l_Cos1 * l_Cos2 + l_Cos0 * l_Sin1 * l_Sin2;
			a_Rst.y = -l_Sin0 * l_Cos1 * l_Sin2 + l_Cos0 * l_Sin1 * l_Cos2;
			a_Rst.z =  l_Cos0 * l_Cos1 * l_Sin2 + l_Sin0 * l_Sin1 * l_Cos2;
			a_Rst.w =  l_Cos0 * l_Cos1 * l_Cos2 - l_Sin0 * l_Sin1 * l_Sin2;
			return a_Rst;
		};

		/// 从四元数取得轴弧度，若是单位四元数则a_Rst各分量全为0
		/// 返回：a_Rst，Object { x, y, z, w }，xyz=轴向量，w=弧度
		stNumUtil.cAxisRadFromQtn = function (a_Rst, a_Qtn)
		{
			var l_RadBy2 = Math.acos(stNumUtil.cClmOnNum(a_Qtn.w, -1, +1)), l_Sin = Math.sin(l_RadBy2);
			if (Math.abs(l_Sin) < 0.00001)
			{ a_Rst.x = a_Rst.y = a_Rst.z = a_Rst.w = 0; }
			else
			{ a_Rst.x = a_Qtn.x / l_Sin;	a_Rst.y = a_Qtn.y / l_Sin;	a_Rst.z = a_Qtn.z / l_Sin;	a_Rst.w = l_RadBy2 * 2; }
			return a_Rst;
		};

		/// 四元数乘法，当使用单位q变换p时：p' = q^ * p * q，q^ = q的共轭
		/// a_Tgt, a_Opd：Object { x, y, z, w }
		/// 返回：a_Tgt
		stNumUtil.cQtnMul = function (a_Tgt, a_Opd)
		{
			var l_Tw = a_Tgt.w * a_Opd.w - a_Tgt.x * a_Opd.x - a_Tgt.y * a_Opd.y - a_Tgt.z * a_Opd.z;
			var l_Tx = a_Tgt.w * a_Opd.x + a_Tgt.x * a_Opd.w + a_Tgt.y * a_Opd.z - a_Tgt.z * a_Opd.y;
			var l_Ty = a_Tgt.w * a_Opd.y - a_Tgt.x * a_Opd.z + a_Tgt.y * a_Opd.w + a_Tgt.z * a_Opd.x;
			var l_Tz = a_Tgt.w * a_Opd.z + a_Tgt.x * a_Opd.y - a_Tgt.y * a_Opd.x + a_Tgt.z * a_Opd.w;
			a_Tgt.x = l_Tx;		a_Tgt.y = l_Ty;		a_Tgt.z = l_Tz;		a_Tgt.w = l_Tw;
			return a_Tgt;
		};

		/// 四元数球面线性插值
		/// 返回：a_Rst
		stNumUtil.cQtnSlerp = function (a_Rst, a_Bgn, a_End, a_Scl)
		{
			// 以下算法详见《3D数学基础——图形与游戏开发》P166
			var l_x0 = a_Bgn.x, l_y0 = a_Bgn.y, l_z0 = a_Bgn.z, l_w0 = a_Bgn.w;
			var l_x1 = a_End.x, l_y1 = a_End.y, l_z1 = a_End.z, l_w1 = a_End.w;
			var l_Cos = l_x0 * l_x1 + l_y0 * l_y1 + l_z0 * l_z1 + l_w0 * l_w1;
			if (l_Cos < 0)
			{
				l_x1 = -l_x1;	l_y1 = -l_y1;	l_z1 = -l_z1;	l_w1 = -l_w1;
				l_Cos = -l_Cos;
			}

			var l_k0, l_k1, l_Sin, l_Omg;
			if (l_Cos > 0.999999)
			{
				l_k0 = 1 - a_Scl;
				l_k1 = a_Scl;
			}
			else
			{
				l_Sin = Math.sqrt(1 - l_Cos * l_Cos);
				l_Omg = Math.atan2(l_Sin, l_Cos);
				l_k0 = Math.sin((1 - a_Scl) * l_Omg) / l_Sin;
				l_k1 = Math.sin(a_Scl * l_Omg) / l_Sin;
			}

			a_Rst.x = l_k0 * l_x0 + l_k1 * l_x1;
			a_Rst.y = l_k0 * l_y0 + l_k1 * l_y1;
			a_Rst.z = l_k0 * l_z0 + l_k1 * l_z1;
			a_Rst.w = l_k0 * l_w0 + l_k1 * l_w1;
			return a_Rst;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 字符串实用静态类

	(function ()
	{
		/// 字符串实用
		var stStrUtil = function () { };
		nWse.stStrUtil = stStrUtil;
		stStrUtil.onHost = nWse;
		stStrUtil.oc_FullTpnm = nWse.ocBldFullName("stStrUtil");

		/// 构建全名
		stStrUtil.ocBldFullName = function (a_Name)
		{
			return stStrUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 私有字段

		var i_Spc1 = " ";
		var i_Spc4 = "    ";
		var i_Rgx_NewLine = /[\r\n]/;
		var i_Rgx_Lines = /\r?\n|\r\n?/g;

		//======== 公有函数

		/// 是否为空？
		/// a_Tgt：String，目标，若为undefined或null则返回true
		/// 返回：Boolean，是否
		stStrUtil.cIsEmt = function (a_Tgt)
		{
			return (! a_Tgt) || (0 === a_Tgt.length);
		};

		/// 查找空白符
		/// a_Udfn$Bgn：Number，起始索引
		/// 返回：Number，索引
		stStrUtil.cFindWhtSpc = function (a_Tgt, a_Udfn$Bgn)
		{
			var i = a_Udfn$Bgn || 0, l_Len = a_Tgt.length;
			for (; i<l_Len; ++i)
			{
				if (stStrUtil.cIsWhtSpc(a_Tgt, i))
				{ return i; }
			}
			return -1;
		};

		/// 是否为空白符，包括水平制表、换行、回车、空格
		/// a_Idx：Number，字符索引
		/// 返回：Boolean
		stStrUtil.cIsWhtSpc = function (a_Tgt, a_Idx)
		{
			var l_CC = a_Tgt.charCodeAt(a_Idx);
			return (9 == l_CC) || (10 == l_CC) || (13 == l_CC) || (32 == l_CC);
		};

		/// 是否为数位
		/// a_Idx：Number，字符索引
		/// 返回：Boolean
		stStrUtil.cIsDgt = function (a_Tgt, a_Idx)
		{
			var l_CC = a_Tgt.charCodeAt(a_Idx);
			return (48 <= l_CC) && (l_CC <= 57);
		};

		/// 有多行
		/// 返回：Boolean
		stStrUtil.cHasMltLines = function (a_Tgt)
		{
			return i_Rgx_NewLine.test(a_Tgt);
		};

		/// 拆分成行，换行符包括“\r”，“\n”，和“\r\n”
		/// 返回：Array，行数组，每个元素是String
		stStrUtil.cSplToLines = function (a_Tgt)
		{
			return a_Tgt.split(i_Rgx_Lines);
		};

		/// 获取行数
		/// 返回：Number，行数
		stStrUtil.cGetLineAmt = function (a_Tgt)
		{
			var l_Ary = a_Tgt.match(i_Rgx_Lines);
			return l_Ary ? (l_Ary.length + 1) : 1;
		};

		/// 展开制表符
		/// 返回：String，每个制表符都被替换成4个空格符
		stStrUtil.cExpdTab = function (a_Tgt)
		{
			return a_Tgt.replace("\t", i_Spc4);
		};

		/// 保留数字小数位
		/// a_Num：Number，数字
		/// a_Cnt：Number，小数位数，若为0则结果以“.”结尾
		/// 返回：String，带有a_Cnt个小数位
		stStrUtil.cPsrvNumDec = function (a_Num, a_Cnt)
		{
			var l_Rst = nWse.stNumUtil.cRoundDec45(a_Num, a_Cnt).toString();	// 该函数返回的数字带有的小数不一定是a_Cnt个（浮点误差）
			var l_DotIdx = l_Rst.indexOf(".");
			var l_Tmp = "", l_Dta, i;
			if (l_DotIdx < 0)
			{
				l_Tmp = ".";
				for (i=0; i<a_Cnt; ++i)
				{ l_Tmp += "0"; }

				l_Rst += l_Tmp;
			}
			else
			if (l_Rst.length - l_DotIdx - 1 < a_Cnt)	// 现有小数位＜要求
			{
				l_Dta = a_Cnt + l_DotIdx + 1 - l_Rst.length;
				for (i=0; i<l_Dta ; ++i)
				{ l_Tmp += "0"; }

				l_Rst += l_Tmp;
			}
			else
			if (l_Rst.length - l_DotIdx - 1 > a_Cnt)	// 现有小数位＞要求
			{
				l_Rst = l_Rst.slice(0, l_DotIdx + 1 + a_Cnt);	// 直接截断，不要再次尝试四舍五入（cRoundDec45已经做过）
			}
			return l_Rst;
		};
		
		/// 优化数字显示
		/// a_Num：Number，数字
		/// 返回：String，优化后的数字字符串
		stStrUtil.cOpmzNumDspl = function (a_Num)
		{
			var i_Rgx_0  = /[Ee]-(?:[789]|[1-9][0-9]+)/;
			var i_Rgx_45 = /\.([0-9]*?)(?:0{7}|9{7})/;
			var l_Str = a_Num.toString();
			var l_Mch, l_Len, l_Pow;

			if (i_Rgx_0.test(l_Str))
			{
				return "0";
			}
			else
			if (l_Mch = i_Rgx_45.exec(l_Str))
			{
				if (l_Mch[1])
				{
					l_Len = l_Mch[1].length;
					l_Pow = Math.pow(10, l_Len);
					a_Num *= l_Pow;
				}

				a_Num = nWse.stNumUtil.cRound45(a_Num);

				if (l_Len)
				{ a_Num /= l_Pow; }
				return a_Num.toString();
			}		
			return l_Str;
		};

		/// 补白
		/// a_Tgt：String，目标
		/// a_Cnt：Number，空格数，＜0左边补白，＞0右边补白
		/// 返回：String，补白后的字符串
		stStrUtil.cPad = function (a_Tgt, a_Cnt)
		{
			var l_Spc = "";
			var i;
			for (i=0; i<Math.abs(a_Cnt); ++i)
			{ l_Spc += i_Spc1; }

			// 左边补白
			if (a_Cnt < 0)
			{ return l_Spc + a_Tgt; }
			else // 右边补白
			{ return a_Tgt + l_Spc; }
		};

		/// 格式化
		stStrUtil.cFmt = function (a_Tmp, a___)
		{
			var i_RgxInfo = /^(\+?[1-9][0-9]*?)\:?([+-]?[1-9][0-9]*?)?\}$/;

			var l_Rst = "";
			var l_Sta = 0, l_RtBrace, l_Info, l_Mch, l_Wid, l_LtAln = true, l_Agm, l_AgmStr;
			var i, l_Len = a_Tmp.length, l_Cha;
			for (i=0; i<l_Len; ++i)
			{
				l_Cha = a_Tmp.charAt(i);

				// 正常
				if (0 == l_Sta)
				{
					if ("{" == l_Cha)
					{
						if (i == l_Len - 1)
						{ throw new Error("字符串格式化语法错误：有一个“{”没有闭合！"); }

						// “{{”算作转义
						if ("{" == a_Tmp.charAt(i + 1))
						{
							// 跳过这个
							++ i;
						}
						else
						{
							// 转换状态
							l_Sta = 1;
							continue;
						}
					}

					// 录入
					l_Rst += l_Cha;
				}
				else // 遇到“{”
				if (1 == l_Sta)
				{
					// 首先找到“}”，然后提取信息
					l_RtBrace = a_Tmp.indexOf("}", i);
					if (l_RtBrace < 0)
					{ throw new Error("字符串格式化语法错误：有一个“{”没有闭合！"); }

					l_Info = a_Tmp.substring(i, l_RtBrace + 1);	// 以“}”结尾，方便正则表达式匹配

					// 获取匹配
					l_Mch = i_RgxInfo.exec(l_Info);
					if ((! l_Mch) || (! l_Mch[1]))
					{ throw new Error("字符串格式化语法错误：正确格式为“{实参索引:宽度}”，其中冒号以后是可选的。"); }

					var l_AgmIdx = parseInt(l_Mch[1]);
					var l_PstvSign = (43 == l_Mch[1].charCodeAt(0));
					l_Agm = arguments[l_AgmIdx];
					l_AgmStr = l_Agm.toString();

					var l_IsNum = nWse.fIsNum(l_Agm);
					if (l_IsNum && l_PstvSign && (l_Agm > 0))	// 需要前附“+”
					{ l_AgmStr = "+" + l_AgmStr; }

					// 如果指定了宽度
					if (l_Mch[2])
					{
						l_Wid = parseInt(l_Mch[2], 10);

						// 右对齐？
						if (l_Wid < 0)
						{
							l_LtAln = false;
							l_Wid = -l_Wid;
						}
						else // 宽度为0，不显示
						if (0 == l_Wid)
						{
							l_AgmStr = null;
						}

						// 如果空间不足，适当截断
						if (l_AgmStr && (l_AgmStr.length > l_Wid))
						{
							if (l_IsNum) // 数字需要特殊处理
							{
								// 为精确，暂时由调用者控制，已提供许多方法控制数字的显示格式
							//	l_AgmStr = fTrunNumStr(l_Agm, l_AgmStr, l_Wid);
							}
							else // 其它类型一律截断到指定的字符数量
							{ l_AgmStr = l_AgmStr.slice(0, l_Wid); }
						}
						else // 空间过大，适当补白
						if (l_AgmStr && (l_AgmStr.length < l_Wid))
						{
							// 如果左对齐，右边补白
							if (l_LtAln)
							{ l_AgmStr = stStrUtil.cPad(l_AgmStr,  (l_Wid - l_AgmStr.length)); }
							else // 右对齐，左边补白
							{ l_AgmStr = stStrUtil.cPad(l_AgmStr, -(l_Wid - l_AgmStr.length)); }
						}
					}

					// 录入
					if (l_AgmStr)
					{ l_Rst += l_AgmStr; }

					// 跳到“}”
					i = l_RtBrace;

					// 转换状态
					l_Sta = 0;
				//	continue;
				}
			}

			return l_Rst;
		};

		/// 插入
		/// a_Dst：String，目的
		/// a_Idx：Number，目的索引
		/// a_Src：String，来源
		/// 返回：结果
		stStrUtil.cIst = function (a_Dst, a_Idx, a_Src)
		{
			if (! a_Dst)
			{ return a_Src; }
			else
			if (a_Idx <= 0)
			{ return a_Src + a_Dst; }
			else
			if (a_Dst.length <= a_Idx)
			{ return a_Dst + a_Src; }

			return (a_Dst.slice(0, a_Idx) + a_Src + a_Dst.slice(a_Idx));
		};

		/// 拼接字符串，空子串将被跳过
		/// a___：String，各个子串
		/// 返回：String
		stStrUtil.cCcat = unKnl.fCcat;

		/// 确保是目录，即确保以“/”或“\”结尾
		/// a_Path：String，路径
		/// 返回：String
		stStrUtil.cEnsrDiry = unKnl.fEnsrDiry;

		/// 确保是JavaScript文件，即确保以“.js”结尾
		/// a_Path：String，路径，若为null则返回null
		/// 返回：String
		stStrUtil.fEnsrJs = unKnl.fEnsrJs;
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 对象实用静态类

	(function ()
	{
		/// 对象实用
		var stObjUtil = function () { };
		nWse.stObjUtil = stObjUtil;
		stObjUtil.onHost = nWse;
		stObjUtil.oc_FullTpnm = nWse.ocBldFullName("stObjUtil");

		/// 构建全名
		stObjUtil.ocBldFullName = function (a_Name)
		{
			return stObjUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 公有函数

		/// 定义数据属性，如不支持Object.defineProperty，则以赋值方式定义，并放弃设置特性
		/// a_Tgt：Object，目标
		/// a_PptyName：String，属性名
		/// a_Cfgbl：Boolean，是否可配置
		/// a_Enmbl：Boolean，是否可列举
		/// a_Wrtbl：Boolean，是否可写
		/// a_Val：任意类型，属性值
		stObjUtil.cDfnDataPpty = unKnl.fDfnDataPpty;

		/// 定义存取器属性，如不支持Object.defineProperty，则抛出异常
		/// a_Tgt：Object，目标
		/// a_PptyName：String，属性名
		/// a_Cfgbl：Boolean，是否可配置
		/// a_Enmbl：Boolean，是否可列举
		/// a_fGet：Function，获取函数
		/// a_fSet：Function，设置函数
		stObjUtil.cDfnAcsrPpty = function (a_Tgt, a_PptyName, a_Cfgbl, a_Enmbl, a_fGet, a_fSet)
		{
			// IE8以前会抛出异常！
		//	try
		//	{
				Object.defineProperty(a_Tgt, a_PptyName,
					{
						configurable : a_Cfgbl,
						enumerable : a_Enmbl,
						get : a_fGet,
						set : a_fSet
					});
		//	}
		//	catch (a_Exc)
		//	{ }
		};

		/// 遍历
		/// a_Tgt：Object，目标
		/// a_fCabk：Function，undefined f(对象, 属性名, 属性值)
		stObjUtil.cFor = function (a_Tgt, a_fCabk)
		{
			var l_PptyName;
			for (l_PptyName in a_Tgt)
			{ a_fCabk(a_Tgt, l_PptyName, a_Tgt[l_PptyName]); }
		};

		/// 浅拷贝
		/// a_Orig：Object，原本，可以为null
		/// 返回：Object，副本
		stObjUtil.cShlwCopy = function (a_Orig)
		{
			var l_Rst = { };
			return a_Orig ? stObjUtil.cShlwAsn(l_Rst, a_Orig) : l_Rst;
		};

		/// （深）拷贝
		/// a_Orig：Object，原本，可以为null，Array，但不能是Boolean，Number，String，Function
		///【注意】对于a_Orig的为函数的字段，进行浅拷贝，以保证函数可能带有的闭包正确运作
		/// 返回：Object，副本，若a_Orig为null则返回null
		stObjUtil.cCopy = function (a_Orig)
		{
			// null
			if (! a_Orig)
			{ return null; }

			// Function
			if (nWse.fIsFctn(a_Orig))
			{ throw new Error("a_Orig不能是Function！"); }

			// 非Object
			if (! nWse.fIsObj(a_Orig))
			{ throw new Error("a_Orig必须是Object（Function除外）！"); }

			var l_Rst = null;

			// Array
			if (nWse.fIsAry(a_Orig))
			{
				l_Rst = (0 == a_Orig.length) ? [] : new Array(a_Orig.length);	// 在这里新建一个
			}
			else // Class
			if (nWse.fIsClass(a_Orig.constructor))
			{
				l_Rst = new a_Orig.constructor();
			}
			else // Object
			{
				l_Rst = { };
			}

			// 深赋值
			stObjUtil.cAsn(l_Rst, a_Orig);
			return l_Rst;
		};

		/// 浅赋值
		/// a_Dst：Object，目的
		/// a___：Object，来源，将跳过undefined字段
		/// 返回：a_Dst
		stObjUtil.cShlwAsn = unKnl.fShlwAsn;

		/// （深）赋值
		/// a_Dst：Object，目的
		/// a_Src：Object，来源，可以为null，Array，但不能是Boolean，Number，String，Function
		/// a_Udfn$Doa和a_Udfn$Soa：Array of Object，调用者请忽略，
		/// 类的实现者必须以“a_Udfn$Doa || [], a_Udfn$Soa || []”的形式传给类类型字段的类的scAsn
		///【注意】对于a_Src的为函数的字段，进行浅赋值，以保证函数可能带有的闭包正确运作
		/// 返回：a_Dst，若a_Src为null则不进行赋值
		stObjUtil.cAsn = function (a_Dst, a_Src, a_Udfn$Doa, a_Udfn$Soa)
		{
			// null
			if (! a_Src)
			{ return a_Dst; }

			// 类型检查
			if ((typeof a_Dst) != (typeof a_Src))
			{ throw new Error("a_Dst和a_Src的类型不一致！"); }

			// Function
			if (nWse.fIsFctn(a_Src))
			{ throw new Error("a_Src不能是Function！"); }

			// 非Object
			if (! nWse.fIsObj(a_Src))
			{ throw new Error("a_Src必须是Object（Function除外）！"); }

			// Array
			if (nWse.fIsAry(a_Src))
			{ return unKnl.fAsnArrayIstn(a_Dst, a_Src, a_Udfn$Doa || [], a_Udfn$Soa || []); }

			// Class
			if (nWse.fIsClass(a_Src.constructor))
			{ return unKnl.fAsnClassIstn(a_Dst, a_Src, a_Udfn$Doa || [], a_Udfn$Soa || []); }

			// Object
			unKnl.fAsnObjectIstn(a_Dst, a_Src, a_Udfn$Doa || [], a_Udfn$Soa || []);
			return a_Dst;
		};

		/// （深）相等
		/// a_L：左操作数，可以为null，Array，Function，但不能是Boolean，Number，String
		/// a_R：右操作数，要求同a_L
		/// a_S：Boolean，使用严格相等比较各个字段？
		stObjUtil.cEq = function (a_L, a_R, a_S)
		{
			if (a_S)
			{
				// 已经相等？
				if (a_L === a_R)
				{ return true; }
			}
			else
			{
				// 已经相等？
				if (a_L == a_R)
				{ return true; }
			}

			// 类型检查
			if (typeof a_L != typeof a_R)
			{ return false; }

			// 非Object
			if (! nWse.fIsObj(a_L))
			{ throw new Error("a_L和a_R必须是Object！"); }

			// Array
			if (nWse.fIsAry(a_L))
			{ return nWse.fIsAry(a_R) ? unKnl.fEqArrayIstn(a_L, a_R, a_S) : false; }

			// Class
			if (nWse.fIsClass(a_L.constructor))
			{ return (a_L.constructor === a_R.constructor) ? unKnl.fEqClassIstn(a_L, a_R, a_S) : false; }

			// Object
			return unKnl.fEqObjectIstn(a_L, a_R, a_S);
		};

		/// 查找属性名
		/// a_Tgt：Object，目标
		/// a_fCabk：Function，Boolean f(对象, 属性名, 属性值)
		/// 返回：返回找到的属性名，若未找到返回null
		stObjUtil.cFindPptyName = function (a_Tgt, a_fCabk)
		{
			var l_PptyName;
			for (l_PptyName in a_Tgt)
			{
				if (a_fCabk(a_Tgt, l_PptyName, a_Tgt[l_PptyName]))
				{ return l_PptyName; }
			}
			return null;
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 数组实用静态类

	(function ()
	{
		/// 数组实用
		var stAryUtil = function () { };
		nWse.stAryUtil = stAryUtil;
		stAryUtil.onHost = nWse;
		stAryUtil.oc_FullTpnm = nWse.ocBldFullName("stAryUtil");

		/// 构建全名
		stAryUtil.ocBldFullName = function (a_Name)
		{
			return stAryUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 公有函数

		/// 是否为空？
		/// a_Tgt：Array，目标，若为undefined或null则返回true
		/// 返回：Boolean，是否
		stAryUtil.cIsEmt = function (a_Tgt)
		{
			return (! a_Tgt) || (0 === a_Tgt.length);
		};

		/// 是否索引有效？
		/// a_Tgt：Array，目标
		/// a_Idx：Number，索引
		/// 返回：Boolean，是否
		stAryUtil.cIsIdxVld = function (a_Tgt, a_Idx)
		{
			return (0 <= a_Idx) && (a_Idx < a_Tgt.length);
		};

		/// 获取有效元素
		/// a_Tgt：Array，目标
		/// a_Idx：Number，索引，将被截断到有效范围
		/// 返回：数组元素
		stAryUtil.cGetVldElmt = function (a_Tgt, a_Idx)
		{
			return a_Tgt[nWse.stNumUtil.cClmAry(a_Tgt, a_Idx)];
		};

		/// 浅拷贝
		/// a_Orig：Array，原本
		/// 返回：Array，副本
		stAryUtil.cCopy = function (a_Orig)
		{
			return a_Orig && a_Orig.slice(0, a_Orig.length);
		};

		/// （深）拷贝
		/// a_Orig：Array，原本
		/// 返回：Array，副本
		stAryUtil.cCopy = function (a_Orig)
		{
			// 直接转交stObjUtil
			return nWse.stObjUtil.cCopy(a_Orig);
		};

		/// 浅赋值
		/// a_Dst：Array，目的
		/// a_Src：Array，来源
		/// 返回：a_Dst
		stAryUtil.cShlwAsn = function (a_Dst, a_Src)
		{
			if ((! a_Src) || (0 == a_Src.length))
			{ return a_Dst; }

			if (! a_Dst)
			{ a_Dst = new Array(a_Src.length); }
			else
			if (a_Dst.length != a_Src.length)
			{ a_Dst.length = a_Src.length; }

			var i = 0, l_Len = a_Src.length;
			for (; i<l_Len; ++i)
			{ a_Dst[i] = a_Src[i]; }
			return a_Dst;
		};

		/// （深）赋值
		/// a_Dst：Array，目的
		/// a_Src：Array，来源
		/// 返回：a_Dst
		stAryUtil.cAsn = function (a_Dst, a_Src)
		{
			// 直接转交stObjUtil
			return nWse.stObjUtil.cAsn(a_Dst, a_Src);
		};

		/// 初始化
		/// a_Tgt：Array，目标
		/// a_Val：任意，值
		/// 返回：a_Tgt
		stAryUtil.cInit = function (a_Tgt, a_Val)
		{
			var i, l_Len = a_Tgt.length;
			for (i=0; i<l_Len; ++i)
			{ a_Tgt[i] = a_Val; }
			return a_Tgt;
		};

		/// 插入
		/// a_Tgt：Array，目标
		/// a_Idx：Number，索引，若无效则压入到最后
		/// a_Elmt：任意，元素
		/// 返回：a_Tgt
		stAryUtil.cIst = function (a_Tgt, a_Idx, a_Elmt)
		{
			if ((a_Idx < 0) || (a_Tgt.length <= a_Idx))
			{ a_Tgt.push(a_Elmt); }
			else
			{ a_Tgt.splice(a_Idx, 0, a_Elmt); }
			return a_Tgt;
		};

		/// 擦除
		/// a_Tgt：Array，目标
		/// a_Idx：Number，索引，若无效则压入到最后
		/// a_Cnt：Number，个数，默认1
		/// 返回：a_Tgt
		stAryUtil.cErs = function (a_Tgt, a_Idx, a_Cnt)
		{
			if ((a_Idx < 0) || (a_Tgt.length <= a_Idx) || (0 === a_Cnt))
			{ return a_Tgt; }

			a_Cnt = (undefined == a_Cnt) ? 1 : a_Cnt;
			a_Tgt.splice(a_Idx, a_Cnt);
			return a_Tgt;
		};

		/// 相等？
		/// a_L，a_R：Array，左右操作数
		/// a_S：Boolean，严格比较？
		stAryUtil.cEq = function (a_L, a_R, a_S)
		{
			var l_LL = a_L ? a_L.length : 0;
			var l_RL = a_R ? a_R.length : 0;
			if (l_LL != l_RL)
			{ return false; }

			var i;
			for (i=0; i<l_LL; ++i)
			{
				if (a_S)
				{
					if (a_L[i] !== a_R[i])
					{ return false; }
				}
				else
				{
					if (a_L[i] != a_R[i])
					{ return false; }
				}
			}
			return true;
		};

		/// 遍历
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，undefined f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cFor = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return stAryUtil; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Bgn; i<l_Lmt; ++i)
			{ a_fCabk(a_Tgt, i, a_Tgt[i]); }
			return stAryUtil;
		};

		/// 反向遍历
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，undefined f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cRvsFor = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return stAryUtil; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Lmt-1; i>=l_Bgn; --i)
			{ a_fCabk(a_Tgt, i, a_Tgt[i]); }
			return stAryUtil;
		};

		/// 查找
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，Boolean f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：索引，若未找到返回-1
		stAryUtil.cFind = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return -1; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Bgn; i<l_Lmt; ++i)
			{
				if (a_fCabk(a_Tgt, i, a_Tgt[i]))
				{ return i; }
			}
			return -1;
		};

		/// 反向查找
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，Boolean f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：索引，若未找到返回-1
		stAryUtil.cRvsFind = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return -1; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Lmt-1; i>=l_Bgn; --i)
			{
				if (a_fCabk(a_Tgt, i, a_Tgt[i]))
				{ return i; }
			}
			return -1;
		};

		/// 查找最小值
		/// a_Tgt：Array，目标
		/// a_Udfn$fEvlt：Function，Number f(数组, 索引, 元素)，求值函数，若不传则调用元素的valueOf
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：索引，若未找到返回-1
		stAryUtil.cFindMin = function (a_Tgt, a_Udfn$fEvlt, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return -1; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			var l_Idx = l_Bgn, l_Min = a_Udfn$fEvlt ? a_Udfn$fEvlt(a_Tgt, l_Bgn, a_Tgt[l_Bgn]) : a_Tgt[l_Bgn].valueOf(), l_Val;
			for (i=l_Bgn+1; i<l_Lmt; ++i)
			{
				l_Val = a_Udfn$fEvlt ? a_Udfn$fEvlt(a_Tgt, i, a_Tgt[i]) : a_Tgt[i].valueOf();
				if (l_Val < l_Min)
				{
					l_Idx = i;
					l_Min = l_Val;
				}
			}
			return l_Idx;
		};

		/// 查找最大值
		/// a_Tgt：Array，目标
		/// a_Udfn$fEvlt：Function，Number f(数组, 索引, 元素)，求值函数，若不传则调用元素的valueOf
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：索引，若未找到返回-1
		stAryUtil.cFindMax = function (a_Tgt, a_Udfn$fEvlt, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return -1; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			var l_Idx = l_Bgn, l_Max = a_Udfn$fEvlt ? a_Udfn$fEvlt(a_Tgt, l_Bgn, a_Tgt[l_Bgn]) : a_Tgt[l_Bgn].valueOf(), l_Val;
			for (i=l_Bgn+1; i<l_Lmt; ++i)
			{
				l_Val = a_Udfn$fEvlt ? a_Udfn$fEvlt(a_Tgt, i, a_Tgt[i]) : a_Tgt[i].valueOf();
				if (l_Val > l_Max)
				{
					l_Idx = i;
					l_Max = l_Val;
				}
			}
			return l_Idx;
		};

		/// 获取空位索引
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，Boolean f(数组, 索引, 元素)，可以为null
		/// 返回：索引，若未找到则追加一个null元素并返回a_Tgt.length
		stAryUtil.cGetEmtIdx = function (a_Tgt, a_fCabk)
		{
			var i, l_Len = a_Tgt.length;
			for (i=0; i<l_Len; ++i)
			{
				if ((null == a_Tgt[i]) || (a_fCabk && a_fCabk(a_Tgt, i, a_Tgt[i])))
				{ return i; }
			}
			a_Tgt.push(null);
			return l_Len;
		};

		/// 擦除第一个
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，Boolean f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cErsFirst = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return stAryUtil; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Bgn; i<l_Lmt; ++i)
			{
				if (a_fCabk(a_Tgt, i, a_Tgt[i]))
				{
					a_Tgt.splice(i, 1);
					break;
				}
			}
			return stAryUtil;
		};

		/// 擦除最后一个
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，Boolean f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cErsLast = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return stAryUtil; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Lmt-1; i>=l_Bgn; --i)
			{
				if (a_fCabk(a_Tgt, i, a_Tgt[i]))
				{
					a_Tgt.splice(i, 1);
					break;
				}
			}
			return stAryUtil;
		};

		/// 擦除全部
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，Boolean f(数组, 索引, 元素)
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cErsAll = function (a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return stAryUtil; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Bgn; i<l_Lmt; ++i)
			{
				if (a_fCabk(a_Tgt, i, a_Tgt[i]))
				{
					a_Tgt.splice(i, 1);
					-- i;
					-- l_Lmt;
				}
			}
			return stAryUtil;
		};

		/// 求和
		/// a_Init：任意，起始值
		/// a_Tgt：Array，目标
		/// a_fCabk：Function，任意 f(和，数组, 索引, 元素)，null表示作加法运算
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cSum = function (a_Init, a_Tgt, a_fCabk, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return a_Init; }

			var l_Rst = a_Init;
			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Bgn; i<l_Lmt; ++i)
			{ l_Rst = a_fCabk ? a_fCabk(l_Rst, a_Tgt, i, a_Tgt[i]) : (l_Rst + a_Tgt[i]); }
			return l_Rst;
		};

		/// 应用
		/// a_Tgt：Array，目标
		/// a_Udfn$This：undefined$Object，this
		/// a_Udfn$Agms：undefined$Array，实参
		/// a_Udfn$Bgn：undefined$Number，起始索引（默认0）
		/// a_Udfn$Amt：undefined$Number，数量（默认a_Tgt.length）
		/// 返回：stAryUtil
		stAryUtil.cApl = function (a_Tgt, a_Udfn$This, a_Udfn$Agms, a_Udfn$Bgn, a_Udfn$Amt)
		{
			if (stAryUtil.cIsEmt(a_Tgt) || (0 === a_Udfn$Amt))
			{ return stAryUtil; }

			var l_Bgn = Math.max(a_Udfn$Bgn || 0, 0);
			var l_Lmt = Math.min(l_Bgn + (a_Udfn$Amt || a_Tgt.length), a_Tgt.length);
			var i;
			for (i=l_Bgn; i<l_Lmt; ++i)
			{ a_Tgt[i].apply(a_Udfn$This, a_Udfn$Agms); }
			return stAryUtil;
		}

	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 函数实用静态类

	(function ()
	{
		/// 函数实用
		var stFctnUtil = function () { };
		nWse.stFctnUtil = stFctnUtil;
		stFctnUtil.onHost = nWse;
		stFctnUtil.oc_FullTpnm = nWse.ocBldFullName("stFctnUtil");

		/// 构建全名
		stFctnUtil.ocBldFullName = function (a_Name)
		{
			return stFctnUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 公有函数

		/// 获取名称
		/// a_fTgt：Function，目标函数
		/// 返回：String，函数名
		stFctnUtil.cGetName = unKnl.fGetFctnName;

		/// 获取信息
		/// a_fTgt：Function，目标函数
		/// a_Name：Boolean，是否获取名称
		/// a_Prms：Boolean，是否获取形参
		/// a_Body：Boolean，是否获取函数体
		/// 注意：若不传a_Name，a_Prms，a_Body，则认为全部是true
		/// 返回：Object，
		/// {
		/// c_Name：String，名称
		/// c_Prms：Array，参数数组
		/// c_Body：String，函数体
		/// }
		stFctnUtil.cGetInfo = unKnl.fGetFctnInfo;

		/// 绑定this
		/// a_This：Object，this
		/// a_fTgt：Function，目标函数
		/// 返回：Function，已绑定this的函数
		stFctnUtil.cBindThis = unKnl.fBindThis;

		/// 绑定this和实参
		/// a_This：Object，this
		/// a_fTgt：Function，目标函数
		/// a_Agms：Array，实参数组
		/// 返回：Function，已绑定this的函数
		stFctnUtil.cBindThisAndAgms = function (a_This, a_fTgt, a_Agms)
		{
			return function ()
			{
				var l_Agms = a_Agms || [];
				if (arguments.length > 0)
				{
					l_Agms = a_Agms.concat(Array.prototype.slice.call(arguments));	// 注意concat接受数组，但arguments不是数组
				}
				return a_fTgt.apply(a_This, l_Agms);
			};
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 正则表达式实用静态类

	(function ()
	{
		/// 正则表达式实用
		var stRgxUtil = function () { };
		nWse.stRgxUtil = stRgxUtil;
		stRgxUtil.onHost = nWse;
		stRgxUtil.oc_FullTpnm = nWse.ocBldFullName("stRgxUtil");

		/// 构建全名
		stRgxUtil.ocBldFullName = function (a_Name)
		{
			return stRgxUtil.oc_FullTpnm + "." + a_Name;
		};

		//======== 公有函数
		
		/// 获取全部匹配连带捕获
		/// a_Rgx：RegExp，正则表达式
		/// a_Str：String，字符串
		/// 返回：Array，每个元素是一次匹配，并带有捕获
		stRgxUtil.cGetAllMchWithCptr = function (a_Rgx, a_Str)
		{
			var l_Rst = [];
			var l_Mch = null;

			if (a_Rgx.global)
			{
				while (null !== (l_Mch = a_Rgx.exec(a_Str)))
				{ l_Rst.push(l_Mch); }
			}
			else
			{
				if (null !== (l_Mch = a_Rgx.exec(a_Str)))
				{ l_Rst.push(l_Mch); }
			}
			return l_Rst;
		}
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////