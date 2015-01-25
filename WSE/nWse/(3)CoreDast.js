/*
 *
 */


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.tLockAry)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"(2)LangUtil.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("(3)CoreDast.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var unKnl = nWse.unKnl;
	var stNumUtil = nWse.stNumUtil;
	var stAryUtil = nWse.stAryUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 带锁数组

	(function ()
	{
		function fFindOnRegUrg(a_Ary, a_Agms)
		{
			return stAryUtil.cFind(a_Ary, function (a_Tgt, a_Idx, a_Elmt) { return stAryUtil.cEq(a_Elmt, a_Agms); });
		}

		function fFind(a_This, a_Agms)
		{
			return (a_This.e_Ary && (a_This.e_Ary.length > 0)) ? a_This.e_fFind(a_This.e_Ary, a_Agms) : -1;
		}

		function fImdtReg(a_This, a_Agms)
		{
			if (! a_This.e_Ary)
			{ a_This.e_Ary = []; }

			var l_Idx = fFind(a_This, a_Agms);
			if (l_Idx < 0)
			{ a_This.e_fReg(a_This.e_Ary, a_Agms); }
			return a_This;
		}

		function fImdtUrg(a_This, a_Idx)
		{
			a_This.e_Ary.splice(a_Idx, 1);
			return a_This;
		}

		nWse.fClass(nWse,
			/// 带锁数组
			function tLockAry(a_fFind, a_fReg, a_fFor)
			{
				this.e_Lock = false;
				this.e_Ary = null;
				this.e_RegAry = null;
				this.e_UrgAry = null;
				this.e_fFind = a_fFind;
				this.e_fReg = a_fReg;
				this.e_fFor = a_fFor;
			}
			,
			null
			,
			{
				/// 锁定了？
				cIsLock : function ()
				{
					return this.e_Lock;
				}
				,
				/// 存取数组
				cAcsAry : function ()
				{
					return this.e_Ary;
				}
				,
				/// 存取元素
				cAcsElmt : function (a_Idx)
				{
					return this.cIsIdxVld(a_Idx) ? this.e_Ary[a_Idx] : undefined;
				}
				,
				/// 获取数量
				cGetAmt : function ()
				{
					return this.e_Ary ? this.e_Ary.length : 0;
				}
				,
				/// 为空？
				cIsEmt : function ()
				{
					return (0 == this.cGetAmt());
				}
				,
				/// 索引有效？
				cIsIdxVld : function (a_Idx)
				{
					return (0 <= a_Idx) && (a_Idx < this.cGetAmt());
				}
				,
				/// 查找
				cFind : function (a___)
				{
					return fFind(this, arguments);
				}
				,
				/// 注册
				cReg : function (a___)
				{
					// 如果锁定，延迟处理
					var l_Idx;
					if (this.e_Lock)
					{
						// 如果已在注销里，和这次相抵消
						l_Idx = fFindOnRegUrg(this.e_UrgAry, arguments);
						if (l_Idx >= 0)
						{
							this.e_UrgAry.splice(l_Idx, 1);
						}

						// 若不在注册里，则记录
						if (! this.e_RegAry)
						{ this.e_RegAry = []; }

						l_Idx = fFindOnRegUrg(this.e_RegAry, arguments);
						if (l_Idx < 0)
						{ this.e_RegAry.push(Array.prototype.slice.call(arguments, 0)); }
					}
					else // 立即处理
					{
						fImdtReg(this, arguments);
					}
					return this;
				}
				,
				/// 注销
				cUrg : function (a___)
				{
					// 如果锁定动画数组，延迟处理
					var l_Idx;
					if (this.e_Lock)
					{
						// 如果已在注册里，和这次相抵消
						l_Idx = fFindOnRegUrg(this.e_RegAry, arguments);
						if (l_Idx >= 0)
						{
							this.e_RegAry.splice(l_Idx, 1);
						}

						// 若不在注销里，则记录
						if (! this.e_UrgAry)
						{ this.e_UrgAry = []; }

						l_Idx = fFindOnRegUrg(this.e_UrgAry, arguments);
						if (l_Idx < 0)
						{ this.e_UrgAry.push(Array.prototype.slice.call(arguments, 0)); }
					}
					else // 立即处理
					{
						l_Idx = fFind(this, arguments);
						if (l_Idx >= 0)
						{ fImdtUrg(this, l_Idx); }
					}
					return this;
				}
				,
				/// 遍历
				cFor : function (a___)
				{
					//---- 遍历，注意当长度为0时不要立即返回，后面还有更新需要进行！

					if (this.e_Ary && (this.e_Ary.length > 0))
					{
						this.e_Lock = true;		// 锁定
						this.e_fFor(this.e_Ary, arguments);
						this.e_Lock = false;	// 解锁
					}


					//---- 更新动画数组

					// 先注销
					var l_Idx, i, l_Len;
					if (this.e_UrgAry && (this.e_UrgAry.length > 0))
					{
						l_Len = this.e_UrgAry.length;
						for (i=0; i<l_Len; ++i)
						{
							l_Idx = fFind(this, this.e_UrgAry[i]);
							if (l_Idx < 0)
							{ continue; }

							fImdtUrg(this, l_Idx);
						}
						this.e_UrgAry.length = 0;
					}

					// 后注册
					if (this.e_RegAry && (this.e_RegAry.length > 0))
					{
						l_Len = this.e_RegAry.length;
						for (i=0; i<l_Len; ++i)
						{
							fImdtReg(this, this.e_RegAry[i]);
						}
						this.e_RegAry.length = 0;
					}
				}
			}
			,
			{
				//
			}
			,
			false); // 不允许拷贝
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 事件处理器数组

	(function ()
	{
		nWse.fClass(nWse,
			/// 事件处理器数组
			function tEvtHdlrAry()
			{
				this.e_Ary = new nWse.tLockAry(
					function fFind(a_Ary, a_Agms)
					{
						return stAryUtil.cFind(a_Ary, function (a_Tgt, a_Idx, a_Elmt) { return (a_Elmt === a_Agms[0]); });
					},
					function fReg(a_Ary, a_Agms)
					{
						a_Ary.push(a_Agms[0]);
					},
					function fFor(a_Ary, a_Agms)
					{
						var i=0, l_Len = a_Ary.length;
						for (; i<l_Len; ++i)
						{
							a_Ary[i].apply(null, a_Agms || null);
						}
					});
			}
			,
			null
			,
			{
				/// 存取处理器
				cAcsHdlr : function (a_Idx)
				{
					return this.e_Ary ? this.cAcsElmt(a_Idx) : null;
				}
				,
				/// 获取数量
				cGetAmt : function ()
				{
					return this.e_Ary ? this.e_Ary.cGetAmt() : 0;
				}
				,
				/// 为空？
				cIsEmt : function ()
				{
					return (0 == this.cGetAmt());
				}
				,
				/// 索引有效？
				cIsIdxVld : function (a_Idx)
				{
					return this.cIsIdxVld(a_Idx);
				}
				,
				/// 查找
				cFind : function (a_fHdlr)
				{
					return this.e_Ary.cFind(a_fHdlr);
				}
				,
				/// 注册
				cReg : function (a_fHdlr)
				{
					this.e_Ary.cReg(a_fHdlr);
					return this;
				}
				,
				/// 注销
				cUrg : function (a_fHdlr)
				{
					this.e_Ary.cUrg(a_fHdlr);
					return this;
				}
				,
				/// 遍历
				cFor : function (a___)
				{
					this.e_Ary.cFor.apply(this.e_Ary, arguments);
					return this;
				}
			}
			,
			{
				//
			}
			,
			false); // // 不允许拷贝
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 对齐屏幕矩形区域

	(function ()
	{
		function fBndPut(a_Tgt, a_X, a_Y, a_W, a_H, a_DockWhenOvfl)
		{
			a_DockWhenOvfl = nWse.fIsUdfnOrNull(a_DockWhenOvfl) ? nWse.tSara.tBdrNum.i_LtUp : a_DockWhenOvfl;

			if (a_Tgt.c_W > a_W) // 水平溢出
			{
				if ((nWse.tSara.tBdrNum.i_LtUp == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_LtCt == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_LtDn == a_DockWhenOvfl))
				{
					a_Tgt.c_X = a_X;
				}
				else
				if ((nWse.tSara.tBdrNum.i_CtUp == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_CtCt == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_CtDn == a_DockWhenOvfl))
				{
					a_Tgt.c_X = a_X + (a_W - a_Tgt.c_W) / 2;
				}
				else
				{
					a_Tgt.c_X = a_X + a_W - a_Tgt.c_W;
				}
			}
			else
			{
				if (a_Tgt.c_X < a_X)
				{
					a_Tgt.c_X = a_X;
				}

				if (a_Tgt.c_X + a_Tgt.c_W > a_X + a_W)
				{
					a_Tgt.c_X = a_X + a_W - a_Tgt.c_W;
				}
			}

			if (a_Tgt.c_H > a_H) // 垂直溢出
			{
				if ((nWse.tSara.tBdrNum.i_LtUp == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_CtUp == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_RtUp == a_DockWhenOvfl))
				{
					a_Tgt.c_Y = a_Y;
				}
				else
				if ((nWse.tSara.tBdrNum.i_LtCt == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_CtCt == a_DockWhenOvfl) ||
					(nWse.tSara.tBdrNum.i_RtCt == a_DockWhenOvfl))
				{
					a_Tgt.c_Y = a_Y + (a_H - a_Tgt.c_H) / 2;
				}
				else
				{
					a_Tgt.c_Y = a_Y + a_H - a_Tgt.c_H;
				}
			}
			else
			{
				if (a_Tgt.c_Y < a_Y)
				{
					a_Tgt.c_Y = a_Y;
				}

				if (a_Tgt.c_Y + a_Tgt.c_H > a_Y + a_H)
				{
					a_Tgt.c_Y = a_Y + a_H - a_Tgt.c_H;
				}
			}

			return a_Tgt;
		}

		nWse.fClass(nWse,
			/// 对齐屏幕矩形区域
			/// 字段：
			/// c_X：Number，X坐标
			/// c_Y：Number，Y坐标
			/// c_W：Number，宽度
			/// c_H：Number，高度
			function tSara(a_X, a_Y, a_W, a_H)
			{
				this.cInit(a_X, a_Y, a_W, a_H);
			}
			,
			null
			,
			{
				/// 转成String
				toString : function toString()
				{
					return "(" + (this.c_X) + ", " + (this.c_Y) + ", " + (this.c_W) + ", " + (this.c_H) + ")";
				}
				,
				/// 初始化
				cInit : function (a_X, a_Y, a_W, a_H)
				{
					this.c_X = a_X || 0;	this.c_Y = a_Y || 0;	this.c_W = a_W || 0;	this.c_H = a_H || 0;
					return this;
				}
				,
				/// 初始化
				cInit$Wh : function (a_W, a_H)
				{
					this.c_X = 0;		this.c_Y = 0;		this.c_W = a_W || 0;		this.c_H = a_H || 0;
					return this;
				}
			}
			,
			{
				/// 拷贝
				/// a_Orig：原本
				/// 返回：副本
				scCopy : function (a_Orig)
				{
					nWse.tSara.oeVrfCopyOrig(a_Orig);

					var l_Rst = new nWse.tSara();
					l_Rst.c_X = a_Orig.c_X;		l_Rst.c_Y = a_Orig.c_Y;		l_Rst.c_W = a_Orig.c_W;		l_Rst.c_H = a_Orig.c_H;
					return l_Rst;
				}
				,
				/// 赋值
				/// a_Dst：目的
				/// a_Src：来源
				/// 返回：a_Dst
				scAsn : function (a_Dst, a_Src)
				{
					nWse.tSara.oeVrfAsnDstAndSrc(a_Dst, a_Src);

					a_Dst.c_X = a_Src.c_X;		a_Dst.c_Y = a_Src.c_Y;		a_Dst.c_W = a_Src.c_W;		a_Dst.c_H = a_Src.c_H;
					return a_Dst;
				}
				,
				/// 相等
				/// a_L：tSara，左运算数
				/// a_R：tSara，右运算数
				/// 返回：Boolean，是否
				scEq : function (a_L, a_R)
				{
					return (a_L.c_X == a_R.c_X) && (a_L.c_Y == a_R.c_Y) && (a_L.c_W == a_R.c_W) && (a_L.c_H == a_R.c_H);
				}
				,
				/// 从中心与半宽高初始化
				scInit$CtAwh : function(a_Tgt, a_Cx, a_Cy, a_Aw, a_Ah)
				{
					a_Tgt.c_X = a_Cx - a_Aw;	a_Tgt.c_Y = a_Cy - a_Ah;
					a_Tgt.c_W = a_Aw * 2;		a_Tgt.c_H = a_Ah * 2;
					return a_Tgt;
				}
				,
				/// 从两点初始化
				scInit$2Pnts : function(a_Tgt, a_X1, a_Y1, a_X2, a_Y2)
				{
					if (a_X1 <= a_X2)
					{
						a_Tgt.c_X = a_X1;
						a_Tgt.c_W = a_X2 - a_X1;
					}
					else
					{
						a_Tgt.c_X = a_X2;
						a_Tgt.c_W = a_X1 - a_X2;
					}

					if (a_Y1 <= a_Y2)
					{
						a_Tgt.c_Y = a_Y1;
						a_Tgt.c_H = a_Y2 - a_Y1;
					}
					else
					{
						a_Tgt.c_Y = a_Y2;
						a_Tgt.c_H = a_Y1 - a_Y2;
					}

					return a_Tgt;
				}
				,
				/// 从DOM客户区包围盒初始化
				scInit$DomBcr : function (a_Tgt, a_DomElmt)
				{
					var l_Bcr = a_DomElmt.getBoundingClientRect();
					a_Tgt.c_X = l_Bcr.left;
					a_Tgt.c_Y = l_Bcr.top;
					a_Tgt.c_W = l_Bcr.right - l_Bcr.left; // IE8没有width和height
					a_Tgt.c_H = l_Bcr.bottom - l_Bcr.top;
					return a_Tgt;
				}
				,
				/// 扩容到包含
				scExpdToCtan$Xy : function (a_Tgt, a_X, a_Y)
				{
					if (a_Tgt.c_X > a_X) { a_Tgt.c_X = a_X; }
					if (a_Tgt.c_Y > a_Y) { a_Tgt.c_Y = a_Y; }
					if (a_Tgt.c_X + a_Tgt.c_W < a_X) { a_Tgt.c_W = a_X - a_Tgt.c_X; }
					if (a_Tgt.c_Y + a_Tgt.c_H < a_Y) { a_Tgt.c_H = a_Y - a_Tgt.c_Y; }
					return a_Tgt;
				}
				,
				/// 扩容到包含
				scExpdToCtan$Sara : function (a_Tgt, a_S)
				{
					if (a_Tgt.c_X > a_S.c_X) { a_Tgt.c_X = a_S.c_X; }
					if (a_Tgt.c_Y > a_S.c_Y) { a_Tgt.c_Y = a_S.c_Y; }
					if (a_Tgt.c_X + a_Tgt.c_W < a_S.c_X + a_S.c_W) { a_Tgt.c_W = a_S.c_X + a_S.c_W - a_Tgt.c_X; }
					if (a_Tgt.c_Y + a_Tgt.c_H < a_S.c_Y + a_S.c_H) { a_Tgt.c_H = a_S.c_Y + a_S.c_H - a_Tgt.c_Y; }
					return a_Tgt;
				}
				,
				/// 计算中心
				/// a_Rst：tPnt
				scCalcCen : function (a_Rst, a_Tgt)
				{
					a_Rst.x = a_Tgt.c_X + a_Tgt.c_W / 2;
					a_Rst.y = a_Tgt.c_Y + a_Tgt.c_H / 2;
					return a_Rst;
				}
				,
				/// 平移
				/// a_T：tVct
				scTslt : function(a_Tgt, a_T)
				{
					a_Tgt.c_X += a_T.x;
					a_Tgt.c_Y += a_T.y;
					return a_Tgt;
				}
				,
				/// 平移
				scTslt$Xy : function(a_Tgt, a_Tx, a_Ty)
				{
					a_Tgt.c_X += a_Tx;
					a_Tgt.c_Y += a_Ty;
					return a_Tgt;
				}
				,
				/// 是否为空
				scIsEmt : function (a_Tgt)
				{
					return (0 == a_Tgt.c_W) && (0 == a_Tgt.c_H);
				}
				,
				/// 是否规则
				scIsRglr : function (a_Tgt)
				{
					return (a_Tgt.c_W > 0) && (a_Tgt.c_H > 0);
				}
				,
				/// 是否反转
				scIsRvsd : function (a_Tgt)
				{
					return (a_Tgt.c_W < 0) || (a_Tgt.c_H < 0);
				}
				,
				/// 至少多大
				scAtLst : function (a_Tgt, a_MinWH)
				{
					return (a_Tgt.c_W >= a_MinWH) && (a_Tgt.c_H >= a_MinWH);
				}
				,
				/// 包含
				/// a_P$S：tPnt$tSara
				scCtan : function (a_Tgt, a_P$S)
				{
					if (a_P$S instanceof nWse.tSara)
					{
						return	(a_Tgt.c_X <= a_P$S.c_X) && (a_P$S.c_X + a_P$S.c_W <= a_Tgt.c_X + a_Tgt.c_W) &&
								(a_Tgt.c_Y <= a_P$S.c_Y) && (a_P$S.c_Y + a_P$S.c_H <= a_Tgt.c_Y + a_Tgt.c_H);
					}
					else
					{
						return nWse.tSara.scCtan$Xy(a_Tgt, a_P.x, a_P.y);
					}
				}
				,
				/// 包含
				scCtan$Xy : function (a_Tgt, a_Px, a_Py)
				{
					return	(a_Tgt.c_X <= a_Px) && (a_Px < a_Tgt.c_X + a_Tgt.c_W) &&
							(a_Tgt.c_Y <= a_Py) && (a_Py < a_Tgt.c_Y + a_Tgt.c_H);
				}
				,
				/// 交叠
				/// a_Udfn$O：undefined$tSara，若有效则接收交叠区
				scOvlp : function (a_S1, a_S2, a_Udfn$O)
				{
					var l_Rst =	(nWse.tSara.scIsEmt(a_S1) || nWse.tSara.scIsEmt(a_S2) ||
						(a_S1.c_X + a_S1.c_W <= a_S2.c_X) ||
						(a_S1.c_Y + a_S1.c_H <= a_S2.c_Y) ||
						(a_S1.c_X >= a_S2.c_X + a_S2.c_W) ||
						(a_S1.c_Y >= a_S2.c_Y + a_S2.c_H))
						? false : true;

					if (l_Rst && a_Udfn$O)
					{
						if (a_S1.c_X < a_S2.c_X)
						{
							a_Udfn$O.c_X = a_S2.c_X;
							a_Udfn$O.c_W = Math.min(a_S1.c_X + a_S1.c_W - a_S2.c_X, a_S2.c_W);
						}
						else
						{
							a_Udfn$O.c_X = a_S1.c_X;
							a_Udfn$O.c_W = Math.min(a_S2.c_X + a_S2.c_W - a_S1.c_X, a_S1.c_W);
						}

						if (a_S1.c_Y < a_S2.c_Y)
						{
							a_Udfn$O.c_Y = a_S2.c_Y;
							a_Udfn$O.c_H = Math.min(a_S1.c_Y + a_S1.c_H - a_S2.c_Y, a_S2.c_H);
						}
						else
						{
							a_Udfn$O.c_Y = a_S1.c_Y;
							a_Udfn$O.c_H = Math.min(a_S2.c_Y + a_S2.c_H - a_S1.c_Y, a_S1.c_H);
						}
					}

					return l_Rst;
				}
				,
				/// 有界放置
				/// a_DockWhenOvfl：tBdrNum，当溢出时的停靠方式，默认i_LtUp
				scBndPut : function (a_Tgt, a_Bnd, a_DockWhenOvfl)
				{
					return fBndPut(a_Tgt, a_Bnd.c_X, a_Bnd.c_Y, a_Bnd.c_W, a_Bnd.c_H, a_DockWhenOvfl);
				}
				,
				/// 有界放置
				scBndPut$Wh : function (a_Tgt, a_W, a_H, a_DockWhenOvfl)
				{
					return fBndPut(a_Tgt, 0, 0, a_W, a_H, a_DockWhenOvfl);
				}
				,
				/// 停靠放置
				scDockPut : function (a_Tgt, a_Dock, a_BdrNum)
				{
					switch (a_BdrNum.valueOf())
					{
						case 0:// i_CtCt:
						{
							a_Tgt.c_X = a_Dock.c_X + (a_Dock.c_W - a_Tgt.c_W) / 2;
							a_Tgt.c_Y = a_Dock.c_Y + (a_Dock.c_H - a_Tgt.c_H) / 2;
						} break;

						case 1:// i_RtCt:
						{
							a_Tgt.c_X = a_Dock.c_X + a_Dock.c_W - a_Tgt.c_W;
							a_Tgt.c_Y = a_Dock.c_Y + (a_Dock.c_H - a_Tgt.c_H) / 2;
						} break;

						case 2:// i_RtUp:
						{
							a_Tgt.c_X = a_Dock.c_X + a_Dock.c_W - a_Tgt.c_W;
							a_Tgt.c_Y = a_Dock.c_Y;
						} break;

						case 3:// i_CtUp:
						{
							a_Tgt.c_X = a_Dock.c_X + (a_Dock.c_W - a_Tgt.c_W) / 2;
							a_Tgt.c_Y = a_Dock.c_Y;
						} break;

						//	case 4:// i_LtUp:
						default:
						{
							a_Tgt.c_X = a_Dock.c_X;
							a_Tgt.c_Y = a_Dock.c_Y;
						} break;

						case 5:// i_LtCt:
						{
							a_Tgt.c_X = a_Dock.c_X;
							a_Tgt.c_Y = a_Dock.c_Y + (a_Dock.c_H - a_Tgt.c_H) / 2;
						} break;

						case 6:// i_LtDn:
						{
							a_Tgt.c_X = a_Dock.c_X;
							a_Tgt.c_Y = a_Dock.c_Y + a_Dock.c_H - a_Tgt.c_H;
						} break;

						case 7:// i_CtDn:
						{
							a_Tgt.c_X = a_Dock.c_X + (a_Dock.c_W - a_Tgt.c_W) / 2;
							a_Tgt.c_Y = a_Dock.c_Y + a_Dock.c_H - a_Tgt.c_H;
						} break;

						case 8:// i_RtDn:
						{
							a_Tgt.c_X = a_Dock.c_X + a_Dock.c_W - a_Tgt.c_W;
							a_Tgt.c_Y = a_Dock.c_Y + a_Dock.c_H - a_Tgt.c_H;
						} break;
					}
				}
				,
				/// 线性插值
				/// a_PosOnly：Boolean，只插值位置，默认false
				scLnrItp : function (a_Rst, a_Bgn, a_End, a_Scl, a_PosOnly)
				{
					var l_f = nWse.stNumUtil.cLnrItp;
					a_Rst.c_X = l_f(a_Bgn.c_X, a_End.c_X, a_Scl);
					a_Rst.c_Y = l_f(a_Bgn.c_Y, a_End.c_Y, a_Scl);

					if (! a_PosOnly)
					{
						a_Rst.c_W = l_f(a_Bgn.c_W, a_End.c_W, a_Scl);
						a_Rst.c_H = l_f(a_Bgn.c_H, a_End.c_H, a_Scl);
					}
					return a_Rst;
				}
				,
				/// 对齐像素
				scAlnPxl : function (a_Tgt)
				{
					a_Tgt.c_X = Math.round(a_Tgt.c_X);
					a_Tgt.c_Y = Math.round(a_Tgt.c_Y);
					a_Tgt.c_W = Math.round(a_Tgt.c_W);
					a_Tgt.c_H = Math.round(a_Tgt.c_H);
					return a_Tgt;
				}
			}
			,
			false);

		nWse.fEnum(nWse.tSara,
		/// 边框编号
		function tBdrNum() {}, null,
		{
			/// 无效
			ui_Ivld : -1
			,
			/// 中中（·）
			i_CtCt : 0
			,
			/// 右中（→）
			i_RtCt : 1
			,
			/// 右上（↗）
			i_RtUp : 2
			,
			/// 中上（↑）
			i_CtUp : 3
			,
			/// 左上（↖）
			i_LtUp : 4
			,
			/// 左中（←）
			i_LtCt : 5
			,
			/// 左下（↙）
			i_LtDn : 6
			,
			/// 中下（↓）
			i_CtDn : 7
			,
			/// 右下（↘）
			i_RtDn : 8
		});

	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 颜色

	(function ()
	{
		nWse.fClass(nWse,
			/// 颜色
			/// 字段：
			/// r：Number，红色分量，浮点数
			/// g：Number，绿色分量，浮点数
			/// b：Number，蓝色分量，浮点数
			/// a：Number，不透明度，浮点数
			function tClo(a_R, a_G, a_B, a_A)
			{
				this.cInit(a_R, a_G, a_B, a_A);
			}
			,
			null
			,
			{
				/// 转成String
				toString : function toString()
				{
					return "(" + (this.r) + ", " + (this.g) + ", " + (this.b) + ", " + (this.a) + ")";
				}
				,
				/// 转成Number
				valueOf : function valueOf()
				{
					var l_B0 = nWse.tClo.scToCssRgbCpnt(this.r);
					var l_B1 = nWse.tClo.scToCssRgbCpnt(this.g);
					var l_B2 = nWse.tClo.scToCssRgbCpnt(this.b);
					var l_B3 = nWse.tClo.scToCssRgbCpnt(this.a);
					return nWse.stNumUtil.cCmbn4Bytes(l_B0, l_B1, l_B2, l_B3);
				}
				,
				/// 初始化
				cInit : function (a_R, a_G, a_B, a_A)
				{
					this.r = a_R || 0;	this.g = a_G || 0;	this.b = a_B || 0;	this.a = a_A || 1;
					return this;
				}
			}
			,
			{
				/// 从RGB新建，A初始化为1
				/// a_R：Number，红色分量，浮点数
				/// a_G：Number，绿色分量，浮点数
				/// a_B：Number，蓝色分量，浮点数
				/// 返回：tClo，新建的实例
				scNew$Rgb : function (a_R, a_G, a_B)
				{
					return nWse.tClo.scInit$Rgb(new nWse.tClo(), a_R, a_G, a_B);
				}
				,
				/// 从RGBA新建
				/// a_R：Number，红色分量，浮点数
				/// a_G：Number，绿色分量，浮点数
				/// a_B：Number，蓝色分量，浮点数
				/// a_A：Number，不透明度，浮点数
				/// 返回：tClo，新建的实例
				scNew$Rgba : function (a_R, a_G, a_B, a_A)
				{
					return nWse.tClo.scInit$Rgba(new nWse.tClo(), a_R, a_G, a_B, a_A);
				}
				,
				/// 从RGB初始化，A初始化为1
				/// a_Tgt：tClo，目标
				/// 返回：a_Tgt
				scInit$Rgb : function (a_Tgt, a_R, a_G, a_B)
				{
					a_Tgt.r = a_R;	a_Tgt.g = a_G;	a_Tgt.b = a_B;	a_Tgt.a = 1;
					return a_Tgt;
				}
				,
				/// 从RGBA初始化
				/// a_Tgt：tClo，目标
				/// 返回：a_Tgt
				scInit$Rgba : function (a_Tgt, a_R, a_G, a_B, a_A)
				{
					a_Tgt.r = a_R;	a_Tgt.g = a_G;	a_Tgt.b = a_B;	a_Tgt.a = a_A;
					return a_Tgt;
				}
				,
				/// 拷贝
				/// a_Orig：原本
				/// 返回：副本
				scCopy : function (a_Orig)
				{
					nWse.tClo.oeVrfCopyOrig(a_Orig);

					var l_Rst = new nWse.tClo();
					l_Rst.r = a_Orig.r;	l_Rst.g = a_Orig.g;	l_Rst.b = a_Orig.b;	l_Rst.a = a_Orig.a;
					return l_Rst;
				}
				,
				/// 赋值
				/// a_Dst：目的
				/// a_Src：来源
				/// 返回：a_Dst
				scAsn : function (a_Dst, a_Src)
				{
					nWse.tClo.oeVrfAsnDstAndSrc(a_Dst, a_Src);

					a_Dst.r = a_Src.r;	a_Dst.g = a_Src.g;	a_Dst.b = a_Src.b;	a_Dst.a = a_Src.a;
					return a_Dst;
				}
				,
				/// 相等
				/// a_L：tClo，左运算数
				/// a_R：tClo，右运算数
				/// a_Udfn$E：undefined$Number，误差
				/// 返回：Boolean，是否
				scEq : function (a_L, a_R, a_Udfn$E)
				{
					var l_f = nWse.stNumUtil.cEq;
					return	l_f(a_L.r, a_R.r, a_Udfn$E) && l_f(a_L.g, a_R.g, a_Udfn$E) && l_f(a_L.b, a_R.b, a_Udfn$E) && l_f(a_L.a, a_R.a, a_Udfn$E);
				}
				,
				/// 加法
				/// a_Tgt：tClo，目标
				/// a_Opd：tClo，运算数
				/// 返回：a_Tgt
				scAdd : function (a_Tgt, a_Opd)
				{
					a_Tgt.r += a_Opd.r;		a_Tgt.g += a_Opd.g;		a_Tgt.b += a_Opd.b;		a_Tgt.a += a_Opd.a;
					return a_Tgt;
				}
				,
				/// 减法
				/// a_Tgt：tClo，目标
				/// a_Opd：tClo，运算数
				/// 返回：a_Tgt
				scSub : function (a_Tgt, a_Opd)
				{
					a_Tgt.r -= a_Opd.r;		a_Tgt.g -= a_Opd.g;		a_Tgt.b -= a_Opd.b;		a_Tgt.a -= a_Opd.a;
					return a_Tgt;
				}
				,
				/// 乘法
				/// a_Tgt：tClo，目标
				/// a_Opd：Number$tClo，运算数，可以是标量，颜色
				/// 返回：a_Tgt
				scMul : function (a_Tgt, a_Opd)
				{
					if (a_Opd instanceof nWse.tClo)	// 颜色 * 颜色
					{
						a_Tgt.r *= a_Opd.r;		a_Tgt.g *= a_Opd.g;		a_Tgt.b *= a_Opd.b;		a_Tgt.a *= a_Opd.a;
					}
					else // 颜色 * 标量
					{
						a_Tgt.r *= a_Opd;		a_Tgt.g *= a_Opd;		a_Tgt.b *= a_Opd;		a_Tgt.a *= a_Opd;
					}

					return a_Tgt;
				}
				,
				/// 除法
				/// a_Tgt：tClo，目标
				/// a_Opd：Number$tClo，运算数，可以是标量，颜色
				/// 返回：a_Tgt
				scDiv : function (a_Tgt, a_Opd)
				{
					if (a_Opd instanceof nWse.tClo)	// 颜色 * 颜色
					{
						a_Tgt.r /= a_Opd.r;		a_Tgt.g /= a_Opd.g;		a_Tgt.b /= a_Opd.b;		a_Tgt.a /= a_Opd.a;
					}
					else // 颜色 * 标量
					{
						a_Tgt.r /= a_Opd;		a_Tgt.g /= a_Opd;		a_Tgt.b /= a_Opd;		a_Tgt.a /= a_Opd;
					}

					return a_Tgt;
				}
				,
				/// 互补色，即被1.0减，只影响RGB分量
				/// a_Tgt：tClo，目标
				/// 返回：a_Tgt
				scNgtv : function (a_Tgt)
				{
					a_Tgt.r = 1 - a_Tgt.r;		a_Tgt.g = 1 - a_Tgt.g;		a_Tgt.b = 1 - a_Tgt.b;
					return a_Tgt;
				}
				,
				/// 饱和色，即截断到[0, 1]
				/// a_Tgt：tClo，目标
				/// 返回：a_Tgt
				scStur : function (a_Tgt)
				{
					var l_f = stNumUtil.cClmOnNum;
					a_Tgt.r = l_f(a_Tgt.r, 0, 1);	a_Tgt.g = l_f(a_Tgt.g, 0, 1);	a_Tgt.b = l_f(a_Tgt.b, 0, 1);	a_Tgt.a = l_f(a_Tgt.a, 0, 1);
					return a_Tgt;
				}
				,
				/// 随机
				/// 返回：a_Tgt
				scRand : function (a_Tgt)
				{
					var l_f = stNumUtil.cRand;
					var l_Lmt = 1.000011;	// 为了分量能达到纯色，稍微比1大一点，即1.00001 / 0.999999
					a_Tgt.r = l_f(0, l_Lmt);	a_Tgt.g = l_f(0, l_Lmt);	a_Tgt.b = l_f(0, l_Lmt);	a_Tgt.a = l_f(0, l_Lmt);
					return nWse.tClo.scStur(a_Tgt);
				}
				,
				/// 线性插值
				scLnrItp : function (a_Rst, a_Bgn, a_End, a_Scl)
				{
					var l_f = nWse.stNumUtil.cLnrItp;
					a_Rst.r = l_f(a_Bgn.r, a_End.r, a_Scl);
					a_Rst.g = l_f(a_Bgn.g, a_End.g, a_Scl);
					a_Rst.b = l_f(a_Bgn.b, a_End.b, a_Scl);
					a_Rst.a = l_f(a_Bgn.a, a_End.a, a_Scl);
					return a_Rst;
				}
				,
				/// 转成CSS红绿蓝分量
				/// a_RgbCpnt：Number，红绿蓝分量，区间[0, 1]中的浮点数（若超出则被截断）
				/// 返回：Number，转换结果，区间[0, 255]中的整数
				scToCssRgbCpnt : function (a_RgbCpnt)
				{
					// 不要用Math.round，GPU总是使用floor
					return Math.floor(stNumUtil.cClmOnNum(a_RgbCpnt * 255, 0, 255));
				}
				,
				/// 转自CSS红绿蓝分量
				/// a_RgbCpnt：Number，红绿蓝分量，区间[0, 255]中的整数（若超出则被截断）
				/// 返回：Number，转换结果，区间[0, 1]中的浮点数
				scFromCssRgbCpnt : function (a_RgbCpnt)
				{
					return stNumUtil.cClmOnNum(a_RgbCpnt / 255, 0, 1);
				}
				,
				/// 转成CSS颜色字符串
				/// a_Tgt：tClo，目标
				/// 返回：String，CSS颜色字符串"rgba([0, 255]整数, [0, 255]整数, [0, 255]整数, [0, 1]浮点数)"
				scToCssCloStr : function (a_Tgt)
				{
					var l_R, l_G, l_B;
					l_R = nWse.tClo.scToCssRgbCpnt(a_Tgt.r);	l_G = nWse.tClo.scToCssRgbCpnt(a_Tgt.g);	l_B = nWse.tClo.scToCssRgbCpnt(a_Tgt.b);
					return (1 == a_Tgt.a)
						? "rgb(" + l_R + ", " + l_G + ", " + l_B + ")"
						: "rgba(" + l_R + ", " + l_G + ", " + l_B + ", " + a_Tgt.a + ")"; //【IE8不支持】
				}
				,
				/// 转自CSS颜色字符串
				/// a_Tgt：String，目标，支持CSS格式：#、rgb、rgba
				/// 返回：tClo，若a_Tgt不符合要求则返回null
				scFromCssCloStr : function (a_Tgt)
				{
					if ("transparent" == a_Tgt) // IE,FF
					{ return new nWse.tClo(); }

					// 规则见《HTML Canvas 2D Context, Level 2》“serialization of a color”
					// 在这里对标准进行扩展，以支持更随意的手写格式
					// 需要转义的字符：^ $ . * + ? = ! : | \ / ( ) [ ] { }
					var l_Rst = null;
					var i_RgxHash = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/;
					var i_RgxRgb  = /^rgb\(([0-9\.]+%?)\s*\,\s*([0-9\.]+%?)\s*\,\s*([0-9\.]+%?)\)$/;
					var i_RgxRgba = /^rgba\(([0-9\.]+%?)\s*\,\s*([0-9\.]+%?)\s*\,\s*([0-9\.]+%?)\s*\,\s*([0-9\.]+%?)\)$/;
					var l_Mch = i_RgxHash.exec(a_Tgt);
					if (l_Mch)
					{
						l_Rst = new nWse.tClo();
						l_Rst.r = nWse.tClo.scFromCssRgbCpnt(parseInt(l_Mch[1], 16));
						l_Rst.g = nWse.tClo.scFromCssRgbCpnt(parseInt(l_Mch[2], 16));
						l_Rst.b = nWse.tClo.scFromCssRgbCpnt(parseInt(l_Mch[3], 16));
						l_Rst.a = 1;
					}
					else
					if (l_Mch = i_RgxRgb.exec(a_Tgt))
					{
						l_Rst = new nWse.tClo();
						l_Rst.r = (37 == l_Mch[1].charCodeAt(l_Mch[1].length - 1)) ? (parseFloat(l_Mch[1]) / 100) : nWse.tClo.scFromCssRgbCpnt(parseFloat(l_Mch[1]));
						l_Rst.g = (37 == l_Mch[2].charCodeAt(l_Mch[2].length - 1)) ? (parseFloat(l_Mch[2]) / 100) : nWse.tClo.scFromCssRgbCpnt(parseFloat(l_Mch[2]));
						l_Rst.b = (37 == l_Mch[3].charCodeAt(l_Mch[3].length - 1)) ? (parseFloat(l_Mch[3]) / 100) : nWse.tClo.scFromCssRgbCpnt(parseFloat(l_Mch[3]));
						l_Rst.a = 1;
					}
					else
					if (l_Mch = i_RgxRgba.exec(a_Tgt))
					{
						l_Rst = new nWse.tClo();
						l_Rst.r = (37 == l_Mch[1].charCodeAt(l_Mch[1].length - 1)) ? (parseFloat(l_Mch[1]) / 100) : nWse.tClo.scFromCssRgbCpnt(parseFloat(l_Mch[1]));
						l_Rst.g = (37 == l_Mch[2].charCodeAt(l_Mch[2].length - 1)) ? (parseFloat(l_Mch[2]) / 100) : nWse.tClo.scFromCssRgbCpnt(parseFloat(l_Mch[2]));
						l_Rst.b = (37 == l_Mch[3].charCodeAt(l_Mch[3].length - 1)) ? (parseFloat(l_Mch[3]) / 100) : nWse.tClo.scFromCssRgbCpnt(parseFloat(l_Mch[3]));
						l_Rst.a = (37 == l_Mch[4].charCodeAt(l_Mch[4].length - 1)) ? (parseFloat(l_Mch[4]) / 100) : parseFloat(l_Mch[4]);
					}
					return l_Rst;
				}
			}
			,
			false);	// fClass提供的比较慢

		nWse.fClassBody(nWse.tClo, null,
		{
			/// 零
			i_Zero : new nWse.tClo()
			,
			/// 黑色
			i_Black : nWse.tClo.scNew$Rgba(0, 0, 0, 1)
			,
			/// 深灰色
			i_DarkGray : nWse.tClo.scNew$Rgba(0.250981, 0.250981, 0.250981, 1)
			,
			/// 中灰色
			i_MidGray : nWse.tClo.scNew$Rgba(0.501961, 0.501961, 0.501961, 1)
			,
			/// 浅灰色
			i_LgtGray : nWse.tClo.scNew$Rgba(0.752942, 0.752942, 0.752942, 1)
			,
			/// 白色
			i_White : nWse.tClo.scNew$Rgba(1, 1, 1, 1)
			,
			/// 红色
			i_Red : nWse.tClo.scNew$Rgba(1, 0, 0, 1)
			,
			/// 橙色
			i_Orange : nWse.tClo.scNew$Rgba(1, 0.501961, 0, 1)
			,
			/// 黄色
			i_Yellow : nWse.tClo.scNew$Rgba(1, 1, 0, 1)
			,
			/// 绿色
			i_Green : nWse.tClo.scNew$Rgba(0, 1, 0, 1)
			,
			/// 青色
			i_Cyan : nWse.tClo.scNew$Rgba(0, 1, 1, 1)
			,
			/// 蓝色
			i_Blue : nWse.tClo.scNew$Rgba(0, 0, 1, 1)
			,
			/// 紫色
			i_Purple : nWse.tClo.scNew$Rgba(0.501961, 0, 0.501961, 1)
			,
			/// 品红色
			i_Magenta : nWse.tClo.scNew$Rgba(1, 0, 1, 1)
			,
			/// 中蓝色
			i_MidBlue : nWse.tClo.scNew$Rgba(0, 0, 0.501961, 1)
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////