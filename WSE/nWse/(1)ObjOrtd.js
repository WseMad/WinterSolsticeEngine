/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;

	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.fClass)
	{
		//@ 避免重复执行相同的初始化代码
	//	console.log("避免重复：(1)ObjOrtd.js");
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		null
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("(1)ObjOrtd.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var unKnl = nWse.unKnl;
	var fGetFctnName = unKnl.fGetFctnName;
//	var fGetFctnInfo = unKnl.fGetFctnInfo;
	var fDfnDataPpty = unKnl.fDfnDataPpty;
	var fShlwAsn = unKnl.fShlwAsn;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fObjFor(a_Tgt, a_fCabk)
	{
		var l_PptyName;
		for (l_PptyName in a_Tgt)
		{ a_fCabk(a_Tgt, l_PptyName, a_Tgt[l_PptyName]); }
	}

	function fAryFor(a_Tgt, a_fCabk)
	{
		var i, l_Len = a_Tgt.length;
		for (i=0; i<l_Len; ++i)
		{ a_fCabk(a_Tgt, i, a_Tgt[i]); }
	}

	/// 绑定this
	/// a_This：Object，this
	/// a_fTgt：Function，目标函数
	/// 返回：Function，已绑定this的函数
	function fBindThis(a_This, a_fTgt)
	{
		return function () { return a_fTgt.apply(a_This, arguments); };
	}
	unKnl.fBindThis = fBindThis;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 类，枚举，标志

	(function ()
	{
		// 新建并连接原型
		function fNewAndLinkPttp(a_Pttp)
		{
			function fLink() { }
			fLink.prototype = a_Pttp;
			return new fLink();
		}

		// 继承原型
		function fIhrtPttp(a_tD, a_tB)
		{
			var l_Link = fNewAndLinkPttp(a_tB.prototype);
			l_Link.constructor = a_tD;
			a_tD.prototype = l_Link;
		}

		// 虚函数？注意，Object.prototype里的函数都被认为是虚函数，而“constructor”不是！
		function fIsVtuFctn(a_FctnName)
		{
			var i_Rgx = /^[ou]?v/;
			return ("constructor" != a_FctnName) && (i_Rgx.test(a_FctnName) || nWse.fIsFctn(Object.prototype[a_FctnName]));
		}

		/// 类头
		/// a_nHost$tHost：宿主名字空间$宿主类型，默认宿主名字空间为“全局.nApp”
		/// a_fCtor：Function，构造函数
		/// a_tBase：基类，默认Object
		/// 返回：新定义的类
		nWse.fClassHead = function (a_nHost$tHost, a_fCtor, a_tBase)
		{
			// 调整实参
			if (! a_nHost$tHost)
			{
				a_nHost$tHost = l_Glb.nApp;
			}

			if (! a_tBase)
			{
				a_tBase = Object;
			}
			else
			if ((Object !== a_tBase) && (! nWse.fIsClass(a_tBase)))
			{
				throw new Error("基类要么是Object，要么是经由nWse.fClassHead定义的类！");
			}

			// 基类是Object？
			var l_BaseIsObject = (Object === a_tBase);

			// 取得类名
			var l_ClassName = fGetFctnName(a_fCtor);
			if (! l_ClassName)
			{
				throw new Error("构造函数名即为类名，不能为空！");
			}

			// 如果基类非Object，检查构造函数是否调用了基类的构造函数
			var l_ChkRgx;
			if ((! l_BaseIsObject))
			{
				l_ChkRgx = /\bthis\s*\.\s*odBase\s*\(/;	// this . odBase (
				if (! l_ChkRgx.test(a_fCtor.toString()))
				{
					nWse.stLog.cPutLine("◆【警告】类“" + a_nHost$tHost.ocBldFullName(l_ClassName) + "”的构造函数可能没有调用基类的构造函数！");
				}
			}

			// 在宿主名字空间还是宿主类型里？
			var l_IsHostSpc = nWse.fIsNmspc(a_nHost$tHost);

			/// 类（构造函数）
			function tClass()
			{
				if (undefined === this.odBase) // 如果尚未定义，添加odBase至this
				{
					fDfnDataPpty(this, "odBase", false, false, true, null);
				}

				if (undefined === a_tBase.Wse_fPrev) // 如果尚未定义，添加Wse_fPrev至a_tBase
				{
					fDfnDataPpty(a_tBase, "Wse_fPrev", false, false, true, null);
				}

				a_tBase.Wse_fPrev = this.odBase;	// 簿记前一个函数，形成单链表
				this.odBase = a_tBase;				// 压入基类版本
				try
				{
					tClass.Wse_fOrigCtor.apply(this, arguments); // 调用被包装的构造函数
				}
				finally
				{
					this.odBase = this.odBase.Wse_fPrev;	// 弹出基类版本
				}
			}

			tClass.Wse_fOrigCtor = a_fCtor;		// 记录原始构造函数
			a_fCtor = tClass;					// 令传入的构造函数指向包装函数！
		
			// 继承原型
			fIhrtPttp(a_fCtor, a_tBase);
			var l_Pttp = a_fCtor.prototype;

			// 添加odBase至原型
			//fDfnDataPpty(l_Pttp, "odBase", false, false, false,
			//	function odBase(a_fCaller)
			//	{
			//		// 没有提供调用者时，尝试读取caller属性，若引发异常由引擎用户负责
			//		if (! a_fCaller)
			//		{
			//			a_fCaller = l_Pttp.odBase.caller;
			//		}
			//
			//		// 如果调用者是类（构造函数）
			//		if (nWse.fIsClass(a_fCaller))
			//		{
			//			fDfnDataPpty(this, "odCall", true, false, true,
			//				(a_fCaller.oc_tBase !== Object) ? a_fCaller.oc_tBase : nWse.fVoid);
			//		}
			//		else // 方法
			//		{
			//			fDfnDataPpty(this, "odCall", true, false, true,
			//				a_fCaller.Wse_dBase);
			//		}
			//
			//		// 返回自己，实现链式调用
			//		return this;
			//	});

			// 添加odDfnFlds至原型
			fDfnDataPpty(l_Pttp, "odDfnFlds", false, false, false,
				function odDfnFlds(a_Flds$Key, a_Udfn$Val)
				{
					var l_Name = a_Flds$Key;
					if (nWse.fIsStr(l_Name)) // String
					{
						if (l_Name in this) // 如果已定义
						{ throw new Error(a_fCtor.oc_FullName + "：字段“" + l_Name + "”重定义！"); }

						this[l_Name] = a_Udfn$Val;	// 赋予
					}
					else // Object
					{
						for (l_Name in a_Flds$Key)
						{
							if (l_Name in this) // 如果已定义
							{ throw new Error(a_fCtor.oc_FullName + "：字段“" + l_Name + "”重定义！"); }

							this[l_Name] = a_Flds$Key[l_Name];	// 赋予
						}
					}

					// 返回自己，实现链式调用
					return this;
				});

			// 在构造函数上记录构造器
			fDfnDataPpty(a_fCtor, "constructor", false, false, false, nWse.fClassHead);

			//【不要覆盖，需要获取函数源代码！】
			// 覆盖构造函数的toString以返回类型名
		//	fDfnDataPpty(a_fCtor, "toString", false, false, false, function() { return l_ClassName; });

			// 在构造函数上记录名字空间，类型名，全类型名，基类
			fDfnDataPpty(a_fCtor, l_IsHostSpc ? "oc_nHost" : "oc_tHost", false, false, false, a_nHost$tHost);
			fDfnDataPpty(a_fCtor, "oc_Name", false, false, false, l_ClassName);
			fDfnDataPpty(a_fCtor, "oc_FullName", false, false, false, a_nHost$tHost.ocBldFullName(l_ClassName));
			a_fCtor.oc_tBase = a_tBase;

			// 为构造函数添加ocBldFullName
			fDfnDataPpty(a_fCtor, "ocBldFullName", false, false, false, 
				/// 构建全名
				function ocBldFullName(a_Name) { return a_fCtor.oc_FullName + "." + a_Name; });

			// 在原型上添加toString以返回全类型名
			l_Pttp.toString = 
				/// 获取类型名
				function toString() { return a_fCtor.oc_FullName; };

			// 加入宿主名字空间或宿主类型
			a_nHost$tHost[l_ClassName] = a_fCtor;

			// 返回构造函数作为类头
			return a_fCtor;
		};

		/// 类体
		/// a_tClassHead：类头，必须是nWse.fClassHead函数的返回值
		/// a_IstnMthds：Object，实例方法，各个字段将作为实例方法处理，默认null
		/// a_StacPptys：Object，静态属性，各个字段将作为静态属性处理，默认null
		/// a_AddCmnStacMthd：Boolean$Object，是否添加或要添加的公共静态方法，默认false
		/// 返回：a_tClassHead
		nWse.fClassBody = function (a_tClassHead, a_IstnMthds, a_StacPptys, a_AddCmnStacMthd)
		{
			// 基类和原型
			var l_tBase = a_tClassHead.oc_tBase;
			var l_Pttp = a_tClassHead.prototype;

			// 添加静态属性至类头（构造函数）
			if (a_StacPptys)
			{
				fShlwAsn(a_tClassHead, a_StacPptys);
			}

			// 添加公共静态方法至类头（构造函数）
			(function ()
			{
				// 两个核对函数
				if (! a_tClassHead.oeVrfCopyOrig)
				{
					/// 核对拷贝原本
					/// a_Orig：原本
					///【异常】未通过时抛出异常
					a_tClassHead.oeVrfCopyOrig = function (a_Orig)
					{
						if (! (a_Orig instanceof a_tClassHead))
						{
							throw new Error("（深）拷贝时发生错误，期望的原本类型是“" + a_tClassHead.oc_FullName + 
											"”，实际却是“" + a_Orig.constructor.oc_FullName + "”！");
						}
					}
				}

				if (! a_tClassHead.oeVrfAsnDstAndSrc)
				{
					/// 核对赋值目的和来源
					/// a_Dst：目的
					/// a_Src：来源
					///【异常】未通过时抛出异常
					a_tClassHead.oeVrfAsnDstAndSrc = function (a_Dst, a_Src)
					{
						if (! (a_Dst instanceof a_tClassHead))
						{
							throw new Error("（深）赋值时发生错误，期望的目的类型是“" + a_tClassHead.oc_FullName + 
											"”，实际却是“" + a_Dst.constructor.oc_FullName + "”！");
						}

						if (! (a_Src instanceof a_tClassHead))
						{
							throw new Error("（深）赋值时发生错误，期望的来源类型是“" + a_tClassHead.oc_FullName + 
											"”，实际却是“" + a_Src.constructor.oc_FullName + "”！");
						}
					}
				}

				if (! a_tClassHead.oeVrfEqLopdAndRopd)
				{
					/// 核对相等左操作数和右操作数
					/// a_L：左操作数
					/// a_R：右操作数
					///【异常】未通过时抛出异常
					a_tClassHead.oeVrfEqLopdAndRopd = function (a_L, a_R)
					{
						if (! (a_L instanceof a_tClassHead))
						{
							throw new Error("（深）相等时发生错误，期望的目的类型是“" + a_tClassHead.oc_FullName +
								"”，实际却是“" + a_L.constructor.oc_FullName + "”！");
						}

						if (! (a_R instanceof a_tClassHead))
						{
							throw new Error("（深）相等时发生错误，期望的来源类型是“" + a_tClassHead.oc_FullName +
								"”，实际却是“" + a_R.constructor.oc_FullName + "”！");
						}
					}
				}

				/// （深）拷贝
				/// a_Orig：原本
				///【注意】对于a_Orig的为函数的字段，进行浅赋值，以保证函数可能带有的闭包正确运作
				/// 返回：副本
				function scCopy(a_Orig)
				{
					a_tClassHead.oeVrfCopyOrig(a_Orig);

					return a_tClassHead.scAsn(new a_tClassHead(), a_Orig);
				}

				/// （深）赋值
				/// a_Dst：目的
				/// a_Src：来源
				/// a_Udfn$Doa和a_Udfn$Soa：Array of Object，调用者请忽略，
				/// 类的实现者必须以“a_Udfn$Doa || [], a_Udfn$Soa || []”的形式传给类类型字段的类的scAsn
				///【注意】对于a_Src的为函数的字段，进行浅赋值，以保证函数可能带有的闭包正确运作
				/// 返回：a_Dst
				function scAsn(a_Dst, a_Src, a_Udfn$Doa, a_Udfn$Soa)
				{
					a_tClassHead.oeVrfAsnDstAndSrc(a_Dst, a_Src);

					fAsnObjectIstn(a_Dst, a_Src, a_Udfn$Doa || [], a_Udfn$Soa || []);
					return a_Dst;
				}

				/// （深）相等
				/// a_L：左操作数
				/// a_R：右操作数
				/// a_S：Boolean，使用严格相等比较各个字段？
				function scEq(a_L, a_R, a_S)
				{
					a_tClassHead.oeVrfEqLopdAndRopd(a_L, a_R);

					return fEqObjectIstn(a_L, a_R, a_S);
				}

				// 当要求，且尚不存在同名函数时添加
				if (a_AddCmnStacMthd)
				{
					if (true === a_AddCmnStacMthd)
					{ a_AddCmnStacMthd = nWse.fClassBody.oc_DftPrms.a_AddCmnStacMthd; }

					if (a_AddCmnStacMthd.c_CopyAndAsn)
					{
						if (! a_tClassHead.scCopy)
						{ a_tClassHead.scCopy = scCopy; }

						if (! a_tClassHead.scAsn)
						{ a_tClassHead.scAsn = scAsn; }
					}

					if (a_AddCmnStacMthd.c_Eq)
					{
						if (! a_tClassHead.scEq)
						{ a_tClassHead.scEq = scEq; }
					}
				}
			})();

			// 检查基类的非虚函数是否被覆写
			var l_BasePttp = l_tBase.prototype;
			var l_IstnMthdName;
			if (l_tBase !== Object)	// 基类是Object，不要检查
			{
				for (l_IstnMthdName in a_IstnMthds)
				{
					// 跳过虚函数
					if (fIsVtuFctn(l_IstnMthdName))
					{
						continue;
					}

					// 如果在基类中已经存在
					if (l_BasePttp[l_IstnMthdName])
					{
						throw new Error(a_tClassHead.oc_FullName + "：非虚函数“" + l_IstnMthdName + "”已在基类中定义！");
					}
				}
			}

			// 添加实例方法至原型，并包装虚函数
			if (a_IstnMthds)
			{
				fObjFor(a_IstnMthds,
					function (a_Tgt, a_MthdName, a_fMthd)
					{
						var l_fMthd = a_fMthd;
						var l_BaseMthd;
						if (fIsVtuFctn(a_MthdName)) // 对于虚函数
						{
							//fDfnDataPpty(a_fMthd, "Wse_dBase", false, false, false,
							//	l_tBase.prototype[a_MthdName] || nWse.fVoid);

							// 如果基类版本不存在，补充一个空函数
							l_BaseMthd = l_BasePttp[a_MthdName] || (function(){});
							l_fMthd = function ()
							{
								l_BaseMthd.Wse_fPrev = this.odBase;	// 簿记前一个函数，形成单链表
								this.odBase = l_BaseMthd;			// 压入基类版本
								try
								{
									l_fMthd.Wse_fOrigVtu.apply(this, arguments); // 调用被包装的虚函数
								}
								finally
								{
									this.odBase = this.odBase.Wse_fPrev || null;	// 弹出基类版本
								}
							};
							l_fMthd.Wse_fOrigVtu = a_fMthd; // 记录原始虚函数
						}

						l_Pttp[a_MthdName] = l_fMthd;
					});
			}

			// 返回类头（构造函数）
			return a_tClassHead;
		};

		// scAsn 深赋值的实现，装入内核空间
		function fAsnClassIstn(a_Dst, a_Src, a_Doa, a_Soa)
		{
			var l_tSrc = a_Src.constructor;
			if (l_tSrc.scAsn)
			{
				return l_tSrc.scAsn(a_Dst, a_Src, a_Doa, a_Soa);
			}

			// 有的类可能禁止拷贝、赋值、相等！
			throw new Error("类“" + l_tSrc.oc_FullName + "”不支持深赋值！");
		}

		function fAsnArrayIstn(a_Dst, a_Src, a_Doa, a_Soa)
		{
			fAryFor(a_Src,
				function (a_Tgt, a_Idx, a_Elmt)
				{
					var l_MapIdx;

					if (nWse.fIsAry(a_Elmt))	//  数组
					{
						l_MapIdx = a_Soa.indexOf(a_Elmt);
						if (l_MapIdx < 0)
						{
							a_Dst[a_Idx] = (0 == a_Elmt.length) ? [] : new Array(a_Elmt.length);	// 在这里新建一个
							a_Soa.push(a_Elmt);
							a_Doa.push(a_Dst[a_Idx]);

							if (a_Elmt.length > 0)
							{
								fAsnArrayIstn(a_Dst[a_Idx], a_Elmt, a_Doa, a_Soa);
							}
						}
						else
						{
							a_Dst[a_Idx] = a_Doa[l_MapIdx];
						}
					}
					else
					if (nWse.fIsClassIstn(a_Elmt))	// 类实例
					{
						l_MapIdx = a_Soa.indexOf(a_Elmt);
						if (l_MapIdx < 0)
						{
							a_Dst[a_Idx] = new a_Elmt.constructor();	// 在这里新建一个
							a_Soa.push(a_Elmt);
							a_Doa.push(a_Dst[a_Idx]);

							fAsnClassIstn(a_Dst[a_Idx], a_Elmt, a_Doa, a_Soa);
						}
						else
						{
							a_Dst[a_Idx] = a_Doa[l_MapIdx];
						}
					}
					else
					if (a_Elmt && (! nWse.fIsFctn(a_Elmt)) && nWse.fIsObj(a_Elmt))	// 非数组非类实例非null非函数的对象
					{
						l_MapIdx = a_Soa.indexOf(a_Elmt);
						if (l_MapIdx < 0)
						{
							a_Dst[a_Idx] = { };	// 在这里新建一个
							a_Soa.push(a_Elmt);
							a_Doa.push(a_Dst[a_Idx]);

							fAsnObjectIstn(a_Dst[a_Idx], a_Elmt, a_Doa, a_Soa);
						}
						else
						{
							a_Dst[a_Idx] = a_Doa[l_MapIdx];
						}
					}
					else // undefined, null, Boolean, Number, String, Function
					{
						a_Dst[a_Idx] = a_Elmt;
					}
				});
			return a_Dst;
		}

		function fAsnObjectIstn(a_Dst, a_Src, a_Doa, a_Soa)
		{
			fObjFor(a_Src,
				function (a_Tgt, a_PN, a_PV)
				{
					var l_MapIdx;

					if (nWse.fIsAry(a_PV))	//  数组
					{
						l_MapIdx = a_Soa.indexOf(a_PV);
						if (l_MapIdx < 0)
						{
							a_Dst[a_PN] = (0 == a_PV.length) ? [] : new Array(a_PV.length);	// 在这里新建一个
							a_Soa.push(a_PV);
							a_Doa.push(a_Dst[a_PN]);

							if (a_PV.length > 0)
							{
								fAsnArrayIstn(a_Dst[a_PN], a_PV, a_Doa, a_Soa);
							}
						}
						else
						{
							a_Dst[a_PN] = a_Doa[l_MapIdx];
						}
					}
					else
					if (nWse.fIsClassIstn(a_PV))	// 类实例
					{
						l_MapIdx = a_Soa.indexOf(a_PV);
						if (l_MapIdx < 0)
						{
							a_Dst[a_PN] = new a_PV.constructor();	// 在这里新建一个
							a_Soa.push(a_PV);
							a_Doa.push(a_Dst[a_PN]);

							fAsnClassIstn(a_Dst[a_PN], a_PV, a_Doa, a_Soa);
						}
						else
						{
							a_Dst[a_PN] = a_Doa[l_MapIdx];
						}
					}
					else
					if (a_PV && (! nWse.fIsFctn(a_PV)) && nWse.fIsObj(a_PV))	// 非数组非类实例非null非函数的对象
					{
						l_MapIdx = a_Soa.indexOf(a_PV);
						if (l_MapIdx < 0)
						{
							a_Dst[a_PN] = { };	// 在这里新建一个
							a_Soa.push(a_PV);
							a_Doa.push(a_Dst[a_PN]);

							fAsnObjectIstn(a_Dst[a_PN], a_PV, a_Doa, a_Soa);
						}
						else
						{
							a_Dst[a_PN] = a_Doa[l_MapIdx];
						}
					}
					else // undefined, null, Boolean, Number, String, Function
					{
						a_Dst[a_PN] = a_PV;
					}
				});
			return a_Dst;
		}

		unKnl.fAsnArrayIstn = fAsnArrayIstn;
		unKnl.fAsnClassIstn = fAsnClassIstn;
		unKnl.fAsnObjectIstn = fAsnObjectIstn;

		// scEq 深相等的实现，装入内核空间
		function fEqClassIstn(a_L, a_R, a_S)
		{
			var l_tSrc = a_L.constructor;
			if (l_tSrc.scEq)
			{
				return l_tSrc.scEq(a_L, a_R, a_S);
			}

			// 有的类可能禁止拷贝、赋值、相等！
			throw new Error("类“" + l_tSrc.oc_FullName + "”不支持深相等！");
		}

		function fEqArrayIstn(a_L, a_R, a_S)
		{
			if (a_L.length != a_R.length)
			{ return false; }

			var i = 0, l_Len = a_L.length;
			for (; i < l_Len; ++i)
			{
				if (nWse.fIsAry(a_L[i]))	//  数组
				{
					if ((! nWse.fIsAry(a_R[i])) || (! fEqArrayIstn(a_L[i], a_R[i], a_S)))
					{ return false; }
				}
				else
				if (nWse.fIsClassIstn(a_L[i]))	// 类实例
				{
					if ((! nWse.fIsClassIstn(a_R[i])) || (! fEqClassIstn(a_L[i], a_R[i], a_S)))
					{ return false; }
				}
				else
				if (a_L[i] && (! nWse.fIsFctn(a_L[i])) && nWse.fIsObj(a_L[i]))	// 非数组非类实例非null非函数的对象
				{
					if ((typeof a_L[i] != typeof a_R[i]) || (! fEqObjectIstn(a_L[i], a_R[i], a_S)))
					{ return false; }
				}
				else // undefined, null, Boolean, Number, String, Function
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
			}
			return true;
		}

		function fEqObjectIstn(a_L, a_R, a_S)
		{
			// 先比较两者的字段是否一致
			var l_LPN, l_RPN;
			for (l_LPN in a_L)
			{
				if (! (l_LPN in a_R))
				{ return false; }
			}

			for (l_RPN in a_R)
			{
				if (! (l_RPN in a_L))
				{ return false; }
			}

			// 再逐个比较各个字段
			var l_LPV, l_RPV;
			for (l_LPN in a_L)
			{
				l_LPV = a_L[l_LPN];
				l_RPV = a_R[l_RPN];

				if (nWse.fIsAry(l_LPV))	//  数组
				{
					if ((! nWse.fIsAry(l_RPV)) || (! fEqArrayIstn(l_LPV, l_RPV, a_S)))
					{ return false; }
				}
				else
				if (nWse.fIsClassIstn(l_LPV))	// 类实例
				{
					if ((! nWse.fIsClassIstn(l_RPV)) || (! fEqClassIstn(l_LPV, l_RPV, a_S)))
					{ return false; }
				}
				else
				if (l_LPV && (! nWse.fIsFctn(l_LPV)) && nWse.fIsObj(l_LPV))	// 非数组非类实例非null非函数的对象
				{
					if ((typeof l_LPV != typeof l_RPV) || (! fEqObjectIstn(l_LPV, l_RPV, a_S)))
					{ return false; }
				}
				else // undefined, null, Boolean, Number, String, Function
				{
					if (a_S)
					{
						if (l_LPV !== l_RPV)
						{ return false; }
					}
					else
					{
						if (l_LPV != l_RPV)
						{ return false; }
					}
				}
			}
			return true;
		}

		unKnl.fEqArrayIstn = fEqArrayIstn;
		unKnl.fEqClassIstn = fEqClassIstn;
		unKnl.fEqObjectIstn = fEqObjectIstn;


		// 默认参数
		nWse.fClassBody.oc_DftPrms =
		{
			/// 要添加的公共静态方法
			a_AddCmnStacMthd :
			{
				/// 深拷贝和深赋值
				c_CopyAndAsn : true
				,
				/// 相等
				c_Eq : true
			}
		};

		/// 类
		/// a_nHost$tHost：宿主名字空间$宿主类型，默认宿主名字空间为l_Glb.nApp
		/// a_fCtor：Function，构造函数
		/// a_tBase：基类，默认Object
		/// a_IstnMthds：Object，实例方法，各个字段将作为实例方法处理，默认null
		/// a_StacPptys：Object，静态属性，各个字段将作为静态属性处理，默认null
		/// a_AddCmnStacMthd：Boolean$Object，是否添加或要添加的公共静态方法，默认false
		/// 返回：新定义的类
		nWse.fClass = function (a_nHost$tHost, a_fCtor, a_tBase, a_IstnMthds, a_StacPptys, a_AddCmnStacMthd)
		{
			return nWse.fClassBody(nWse.fClassHead(a_nHost$tHost, a_fCtor, a_tBase), a_IstnMthds, a_StacPptys, a_AddCmnStacMthd);
		};

		nWse.fClass.oc_DftPrms = nWse.fClassBody.oc_DftPrms;

		/// 是否为类？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsClass = function (a_Any)
		{
			return a_Any && (a_Any.constructor === nWse.fClassHead);
		};

		/// 是否为类实例？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsClassIstn = function (a_Any)
		{
			return a_Any && a_Any.constructor && (a_Any.constructor.constructor === nWse.fClass);
		};


		/// 接口头
		/// a_nHost$tHost：宿主名字空间$宿主类型，默认宿主名字空间为l_Glb.nApp
		/// a_fCtor：Function，构造函数，不会调用，只使用函数名
		/// a_itBase$BaseAry：接口$Array，继承基接口的全部纯虚函数
		/// 返回：新定义的接口
		nWse.fItfcHead = function (a_nHost$tHost, a_fCtor, a_itBase$BaseAry)
		{
			if (! a_nHost$tHost)
			{
				a_nHost$tHost = l_Glb.nApp;
			}

			// 取得接口名
			var l_ItfcName = unKnl.fGetFctnName(a_fCtor);
			if (! l_ItfcName)
			{
				throw new Error("构造函数名即为接口名，不能为空！");
			}

			// 在宿主名字空间还是宿主类型里？
			var l_IsHostSpc = nWse.fIsNmspc(a_nHost$tHost);

			// 将基接口数组的纯虚函数加入构造函数
			if (a_itBase$BaseAry)
			{
				if (nWse.fIsAry(a_itBase$BaseAry))
				{
					fAryFor(a_itBase$BaseAry,
						function (a_Ary, a_Idx, a_itItfc)
						{
							fObjFor(a_itItfc,
								function (a_Tgt, a_PN, a_PV)
								{
									if (! fIsVtuFctn(a_PN))	// 跳过非虚函数
									{
										return;
									}

									a_fCtor[a_PN] = a_PV;
								});
						});
				}
				else
				{
					fObjFor(a_itBase$BaseAry,
						function (a_Tgt, a_PN, a_PV)
						{
							if (! fIsVtuFctn(a_PN))	// 跳过非虚函数
							{
								return;
							}

							a_fCtor[a_PN] = a_PV;
						});
				}
			}

			// 在构造函数上记录构造器
			fDfnDataPpty(a_fCtor, "constructor", false, false, false, nWse.fItfcHead);

			//【不要覆盖，需要获取函数源代码！】
			// 覆盖构造函数的toString以返回类型名
			//	fDfnDataPpty(a_fCtor, "toString", false, false, false, function() { return l_ItfcName; });

			// 在构造函数上记录名字空间，类型名，全类型名
			fDfnDataPpty(a_fCtor, l_IsHostSpc ? "oc_nHost" : "oc_tHost", false, false, false, a_nHost$tHost);
			fDfnDataPpty(a_fCtor, "oc_Name", false, false, false, l_ItfcName);
			fDfnDataPpty(a_fCtor, "oc_FullName", false, false, false, a_nHost$tHost.ocBldFullName(l_ItfcName));

			// 加入绑定解绑函数
			function fBindUbnd(a_Bind, a_tClass)
			{
				var l_tClass = a_tClass;
				var l_Pttp = l_tClass.prototype;		// 原型
				var l_ItfcAry = l_tClass.uoe_ItfcAry;
				var l_ItfcImpAry = l_tClass.uoe_ItfcImpAry;
				var l_Idx = (l_ItfcAry && l_ItfcImpAry) ? l_ItfcAry.indexOf(a_fCtor) : -1;	// 找到本接口索引
				if (l_Idx < 0)
				{ return false; }

				// 将纯虚函数实现添加至原型
				var l_itItfc = l_ItfcAry[l_Idx];
				var l_ItfcImp = l_ItfcImpAry[l_Idx];
				var l_PN;
				for (l_PN in l_itItfc)	// 列举接口，不要列举实现！为了检查是否有未实现的纯虚
				{
					if (! fIsVtuFctn(l_PN))	// 跳过非虚函数
					{
						continue;
					}

					// 绑定时，若不是undefined，警告并跳过（类本身的方法理应覆盖接口同名方法实现！）
					if (a_Bind && (! nWse.fIsUdfn(l_Pttp[l_PN])))
					{
						if (l_Pttp[l_PN]) // 若有效，标记不要解绑
						{ l_Pttp[l_PN].Wse_DontUbnd = true; }

						nWse.stLog.cPutLine("◆【警告】类“" + l_tClass.oc_FullName + "”的虚函数“" + l_PN + "”遮蔽了接口实现！");
						continue;
					}

					if (a_Bind) // 绑定
					{
						l_Pttp[l_PN] = l_ItfcImp[l_PN];
						if (! l_Pttp[l_PN]) // 若不存在则补充抛出异常
						{
							// 注意这里的l_PN可能会变！
							(function (a_PN)
							{
								l_Pttp[a_PN] = function () { nWse.fThrowNotImpPureVtu(a_fCtor.oc_FullName + "." + a_PN); };
							})(l_PN);
						}
						//【待定】存在时，是否提供包装，使得odBase指向基类对同一接口同一虚函数的实现？
					}
					else
					if (l_Pttp[l_PN]) // 解绑，若有效
					{
						if (l_Pttp[l_PN].Wse_DontUbnd) // 若标记不要解绑，跳过
						{ continue; }

						l_Pttp[l_PN] = undefined;	// 设为undefined
					}
					// 解绑，无效，不作处理
				}
				return true;
			}

			// 定义ocBindUbnd至构造函数
			fDfnDataPpty(a_fCtor, "ocBindUbnd", false, false, false,
				/// 绑定解绑实例
				/// a_tClass：类，若为null则取a_Istn.constructor，否则该类必须实现本接口，不能与a_Istn同时为null
				/// a_Istn：类实例，所属类必须实现本接口，若a_tClass有效则忽略，否则必须有效
				/// a_fCabk：void f(a_tClass, a_Istn)，回调函数
				function (a_tClass, a_Istn, a_fCabk)
				{
					if (! a_tClass)
					{ a_tClass = a_Istn.constructor; }

					if (! fBindUbnd(true, a_tClass))	// 没有实现本接口时立即返回
					{ return a_fCtor; }

					try
					{
						a_fCabk(a_tClass, a_Istn);
					}
					finally
					{
						fBindUbnd(false, a_tClass);
					}
					return a_fCtor;
				});

			// 加入宿主名字空间或宿主类型
			a_nHost$tHost[l_ItfcName] = a_fCtor;
			return a_fCtor;
		};

		/// 接口体
		/// a_tItfcHead：接口头，必须是nWse.fItfcHead函数的返回值
		/// a_PureVtuMthds：Object，纯虚方法，默认null
		/// a_StacPptys：Object，静态属性，各个字段将作为静态属性处理，默认null
		/// 返回：a_tItfcHead
		nWse.fItfcBody = function (a_tItfcHead, a_PureVtuMthds, a_StacPptys)
		{
			// 添加静态属性至类头（构造函数）
			if (a_StacPptys)
			{
				fShlwAsn(a_tItfcHead, a_StacPptys);
			}

			// 添加纯虚方法至接口头（构造函数）
			var l_PN;
			if (a_PureVtuMthds)
			{
				for (l_PN in a_PureVtuMthds)
				{
					if (! fIsVtuFctn(l_PN))	// 跳过非需函数
					{
						continue;
					}

					a_tItfcHead[l_PN] = a_PureVtuMthds[l_PN];
				}
			}

			// 返回接口头（构造函数）
			return a_tItfcHead;
		};

		/// 接口
		/// a_nHost$tHost：宿主名字空间$宿主类型，默认宿主名字空间为l_Glb.nApp
		/// a_fCtor：Function，构造函数，不会调用，只使用函数名
		/// a_itBase$BaseAry：接口$Array，继承基接口的全部纯虚函数
		/// a_tItfcHead：接口头，必须是nWse.fItfcHead函数的返回值
		/// a_PureVtuMthds：Object，纯虚方法，默认null
		/// a_StacPptys：Object，静态属性，各个字段将作为静态属性处理，默认null
		/// 返回：新定义的接口
		nWse.fItfc = function (a_nHost$tHost, a_fCtor, a_itBase$BaseAry, a_PureVtuMthds, a_StacPptys)
		{
			return nWse.fItfcBody(nWse.fItfcHead(a_nHost$tHost, a_fCtor, a_itBase$BaseAry), a_PureVtuMthds, a_StacPptys);
		};

		/// 是否为接口？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsItfc = function (a_Any)
		{
			return a_Any && (a_Any.constructor === nWse.fItfcHead);
		};

		/// 抛出未实现纯虚函数异常
		/// a_FctnName：String，函数名
		nWse.fThrowNotImpPureVtu = function (a_FctnName)
		{
			throw new Error("调用了没有实现的纯虚函数" + (a_FctnName ? ("“" + a_FctnName + "”！" ) : "！"));
		};

		/// 类接口实现
		/// a_tClassHead：类头，必须是nWse.fClassHead函数的返回值
		/// a_itItfc$ItfcAry：接口$Array，要实现的（全部）接口
		/// a_Imp$ImpAry：Object$Array，包含对相应接口纯虚函数的实现，必须与a_itItfc$ItfcAry匹配
		/// 返回：a_tClassHead
		nWse.fClassItfcImp = function (a_tClassHead, a_itItfc$ItfcAry, a_Imp$ImpAry)
		{
			if (! a_itItfc$ItfcAry)
			{ return a_tClassHead; }

			// 记录到类头上
			if (nWse.fIsAry(a_itItfc$ItfcAry))
			{
				if ((! nWse.fIsAry(a_itItfc$ItfcAry)) || (a_itItfc$ItfcAry.length != a_Imp$ImpAry.length))
				{ throw new Error("a_itItfc$ItfcAry与a_Imp$ImpAry不匹配"); }

				a_tClassHead.uoe_ItfcAry = a_itItfc$ItfcAry.slice(0);
				a_tClassHead.uoe_ItfcImpAry = a_Imp$ImpAry.slice(0);
			}
			else
			{
				if ((! a_Imp$ImpAry))
				{ throw new Error("a_itItfc$ItfcAry与a_Imp$ImpAry不匹配"); }

				a_tClassHead.uoe_ItfcAry = [a_itItfc$ItfcAry];
				a_tClassHead.uoe_ItfcImpAry = [a_Imp$ImpAry];
			}

			return a_tClassHead;
		};


		/// 枚举头
		/// a_nHost$tHost：宿主名字空间$宿主类型，默认宿主名字空间为l_Glb.nApp
		/// a_fCtor：Function，构造函数，不会调用，只使用函数名
		/// a_tBase$BaseAry：枚举$Array，继承基枚举的全部值
		/// 返回：新定义的枚举
		nWse.fEnumHead = function (a_nHost$tHost, a_fCtor, a_tBase$BaseAry)
		{
			if (! a_nHost$tHost)
			{
				a_nHost$tHost = l_Glb.nApp;
			}
			
			// 取得枚举名
			var l_EnumName = unKnl.fGetFctnName(a_fCtor);
			if (! l_EnumName)
			{
				throw new Error("构造函数名即为枚举名，不能为空！");
			}

			// 在宿主名字空间还是宿主类型里？
			var l_IsHostSpc = nWse.fIsNmspc(a_nHost$tHost);

			// 将基枚举数组的枚举值加入构造函数
			if (a_tBase$BaseAry)
			{
				if (nWse.fIsAry(a_tBase$BaseAry))
				{
					fAryFor(a_tBase$BaseAry,
						function (a_Ary, a_Idx, a_tEnum)
						{
							fObjFor(a_tEnum,
								function (a_Tgt, a_PN, a_PV)
								{
									if (! (a_PV instanceof Number))	// 跳过非Number类型
									{
										return;
									}

									a_fCtor[a_PN] = a_PV;
								});
						});
				}
				else
				{
					fObjFor(a_tBase$BaseAry,
						function (a_Tgt, a_PN, a_PV)
						{
							if (! (a_PV instanceof Number))	// 跳过非Number类型
							{
								return;
							}

							a_fCtor[a_PN] = a_PV;
						});
				}
			}

			// 在构造函数上记录构造器
			fDfnDataPpty(a_fCtor, "constructor", false, false, false, nWse.fEnumHead);

			//【不要覆盖，需要获取函数源代码！】
			// 覆盖构造函数的toString以返回类型名
		//	fDfnDataPpty(a_fCtor, "toString", false, false, false, function() { return l_EnumName; });

			// 在构造函数上记录名字空间，类型名，全类型名
			fDfnDataPpty(a_fCtor, l_IsHostSpc ? "oc_nHost" : "oc_tHost", false, false, false, a_nHost$tHost);
			fDfnDataPpty(a_fCtor, "oc_Name", false, false, false, l_EnumName);
			fDfnDataPpty(a_fCtor, "oc_FullName", false, false, false, a_nHost$tHost.ocBldFullName(l_EnumName));

			// 在构造函数上添加根据枚举值获取枚举名
			fDfnDataPpty(a_fCtor, "ocGetNameByVal", false, false, false, 
				/// 根据枚举值获取枚举名
				/// a_Val：Number，值
				/// 返回：String，未找到则返回null
				function ocGetNameByVal(a_Val)
				{
					var l_Name;
					for (l_Name in a_fCtor)
					{
						if (a_fCtor[l_Name].valueOf() == a_Val)
						{
							return l_Name;
						}
					}
					return null;
				});

			// 加入宿主名字空间或宿主类型
			a_nHost$tHost[l_EnumName] = a_fCtor;
			return a_fCtor;
		};

		// 获取最大枚举值
		function fGetMaxEnum(a_tHead)
		{
			var l_Max = Number.MIN_VALUE;			// 枚举值可以是任何数字
			var l_AtLeastOne = false;
			fObjFor(a_tHead,
				function (a_Tgt, a_PN, a_PV)
				{
					if (! (a_PV instanceof Number))	// 跳过非Number类型
					{
						return;
					}

					l_Max = Math.max(l_Max, a_PV);
					l_AtLeastOne = true;
				});
			return l_AtLeastOne ? l_Max : -1;		// 返回-1下面会＋1
		}

		/// 枚举体
		/// a_tEnumHead：枚举头，必须是nWse.fEnumHead函数的返回值
		/// a___：[String, Number]$String，若为String，值为前一项的值＋1，第一项的值为0；不能为Object
		nWse.fEnumBody = function (a_tEnumHead, a___)
		{
			var l_NextVal = fGetMaxEnum(a_tEnumHead) + 1;	// 上面返回-1这里会成为0

			// 添加全部枚举值至枚举头
			var l_AgmLen = arguments.length;
			var i, l_Agm, l_IsAry, l_Name;
			for (i=1; i<l_AgmLen; ++i)
			{
				l_Agm = arguments[i];
				l_IsAry = nWse.fIsAry(l_Agm);

				// String$[String, 非Number]
				if ((! l_IsAry) || (! nWse.fIsNum(l_Agm[1])))
				{
					l_Name = l_IsAry ? l_Agm[0] : l_Agm;
					a_tEnumHead[l_Name] = new Number(l_NextVal);
					++ l_NextVal;
				}
				else // [String, Number]
				{
					l_Name = l_Agm[0];
					a_tEnumHead[l_Name] = new Number(l_Agm[1]);
					l_NextVal = l_Agm[1] + 1;
				}

				// 覆写toString，返回名称
				(function (a_Name)
				{
					a_tEnumHead[a_Name].toString = function toString() { return a_Name; }
				})(l_Name);
			}

			// 返回枚举头（构造函数）
			return a_tEnumHead;
		};

		/// 枚举
		/// a_nHost$tHost：宿主名字空间$宿主类型，默认宿主名字空间为l_Glb.nApp
		/// a_fCtor：Function，构造函数，不会调用，只使用函数名
		/// a_tBase$BaseAry：枚举$Array，继承基枚举的全部值
		/// a___$Obj：[String, Number]$String$Object，若为String，值为前一项的值＋1，第一项的值为0；若为Object，必须显示指定属性值，并忽略继承
		/// 返回：新定义的枚举
		nWse.fEnum = function fEnum(a_nHost$tHost, a_fCtor, a_tBase$BaseAry, a___$Obj)
		{
			var l_tHead = nWse.fEnumHead(a_nHost$tHost, a_fCtor, a_tBase$BaseAry);
			var l_Agms;

			// Array或String
			if (nWse.fIsAry(a___$Obj) || nWse.fIsStr(a___$Obj))
			{
				l_Agms = [l_tHead];
				l_Agms.push.apply(l_Agms, Array.prototype.slice.call(arguments, 3, arguments.length));
				nWse.fEnumBody.apply(nWse, l_Agms);
			}
			else // Object
			{
				fObjFor(a___$Obj,
					function (a_Tgt, a_PN, a_PV)
					{
						a_fCtor[a_PN] = new Number(a_PV);

						// 覆写toString，返回名称
						a_fCtor[a_PN].toString = function toString() { return a_PN; }
					});
			}

			return a_fCtor;
		};

		/// 是否为枚举？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsEnum = function (a_Any)
		{
			return a_Any && (a_Any.constructor === nWse.fEnumHead);
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 公有实用函数

	(function ()
	{
		/// 空函数
		nWse.fVoid = function () { };

		/// 包含JavaScript
		/// a_Path：String，绝对路径或相对于发出调用的文件嵌入到的html文件的路径
		nWse.fIcldJs = function (a_Path)
		{
			if (i_InNodeJs) { return; }
			
			var l_Dom_script = l_Glb.document.createElement("script");
			l_Dom_script.type = "text/javascript";
			l_Dom_script.src = a_Path;
			l_Glb.document.getElementsByTagName("head")[0].appendChild(l_Dom_script);
		};

		/// 导入CSS
		/// a_Path：String，绝对路径或相对于发出调用的文件嵌入到的html文件的路径
		nWse.fImptCss = function (a_Path)
		{
			if (i_InNodeJs) { return; }
			
			var l_Dom_link = l_Glb.document.createElement("link");
			l_Dom_link.rel = "stylesheet";
			l_Dom_link.type = "text/css";
			l_Dom_link.href = a_Path;
			l_Glb.document.getElementsByTagName("head")[0].appendChild(l_Dom_link);
		};

		/// 是否为undefined？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsUdfn = function (a_Any)
		{
			return (undefined === a_Any);
		};

		/// 是否为null？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsNull = function (a_Any)
		{
			return (null === a_Any);
		};

		/// 是否为undefined或null？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsUdfnOrNull = function (a_Any)
		{
			return ((undefined === a_Any) || (null === a_Any));
		};

		/// 是否为Boolean？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsBool = function (a_Any)
		{
			return ("[object Boolean]" == Object.prototype.toString.call(a_Any));
		};

		/// 是否为Number？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsNum = function (a_Any)
		{
			return ("[object Number]" == Object.prototype.toString.call(a_Any));
		};

		/// 是否为String？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsStr = function (a_Any)
		{
			return ("[object String]" == Object.prototype.toString.call(a_Any));
		};

		/// 是否为Object？【注意】Function也是Object，但null不是
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsObj = function (a_Any)
		{
			return (a_Any && (("object" == typeof a_Any) || nWse.fIsFctn(a_Any)));
		};

		/// 是否为Date？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsDate = function (a_Any)
		{
			return ("[object Date]" == Object.prototype.toString.call(a_Any));
		};

		/// 是否为Array？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsAry = function (a_Any)
		{
			return ("[object Array]" == Object.prototype.toString.call(a_Any));
		};

		/// 是否为Function？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsFctn = function (a_Any)
		{
			return ("[object Function]" == Object.prototype.toString.call(a_Any));
		};

		/// 是否为RegExp？
		/// a_Any：任意
		/// 返回：Boolean，是否
		nWse.fIsRgx = function (a_Any)
		{
			return ("[object RegExp]" == Object.prototype.toString.call(a_Any));
		};
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////