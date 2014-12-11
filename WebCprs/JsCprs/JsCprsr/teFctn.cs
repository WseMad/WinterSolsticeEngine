﻿using System;
using System.Collections.Generic;
//using System.Linq;
using System.Text;

partial class tCprsr
{
	//-------- 静态函数

	/// <summary>
	/// 找到配对括号
	/// </summary>
	private static Tuple<int, int> seFindPairBbp(List<teLex.tTkn> a_TknList, teLex.tTkn a_Bbp)
	{
		int l_PairIdx = -1;
		int l_Idx = a_TknList.IndexOf(a_Bbp);
		if (l_Idx < 0)
		{
			return new Tuple<int, int>(-1, -1);
		}

		int l_NestCnt = 1;	// 初始嵌套深度为1
		bool l_IsOpen = seIsOpenBbp(a_Bbp.c_Tmnl);

		if (l_IsOpen) // 向后找闭括号，比配对开括号大1
		{
			for (int i = l_Idx + 1; i < a_TknList.Count; ++i)
			{
				if (a_TknList[i].c_Tmnl == a_Bbp.c_Tmnl) // 再次遇到开括号，增加嵌套计数
				{
					++l_NestCnt;
				}
				else
					if (a_TknList[i].c_Tmnl == a_Bbp.c_Tmnl + 1) // 遇到闭括号，递减嵌套计数，降为0时配对
					{
						--l_NestCnt;
						if (0 == l_NestCnt)
						{
							l_PairIdx = i;
							break;
						}
					}
			}
		}
		else // 向前找开括号，比配对闭括号小1
		{
			if (!seIsClsBbp(a_Bbp.c_Tmnl))
				throw new ArgumentException("a_Bbp必须是（开/闭）括号");

			for (int i = l_Idx - 1; i >= 0; --i)
			{
				if (a_TknList[i].c_Tmnl == a_Bbp.c_Tmnl) // 再次遇到闭括号，增加嵌套计数
				{
					++l_NestCnt;
				}
				else
					if (a_TknList[i].c_Tmnl == a_Bbp.c_Tmnl - 1) // 遇到开括号，递减嵌套计数，降为0时配对
					{
						--l_NestCnt;
						if (0 == l_NestCnt)
						{
							l_PairIdx = i;
							break;
						}
					}
			}
		}
		return new Tuple<int, int>((l_IsOpen ? l_Idx : l_PairIdx), (l_IsOpen ? l_PairIdx : l_Idx));
	}

	/// <summary>
	/// 是否在括号里
	/// </summary>
	private static bool seInBbp(List<teLex.tTkn> a_TknList, teLex.tTkn a_Bbp, teLex.tTkn a_Tkn)
	{
		int l_Idx = a_TknList.IndexOf(a_Tkn);
		var l_BbpIdxPair = seFindPairBbp(a_TknList, a_Bbp);
		if ((l_BbpIdxPair.Item1 >= 0) && (l_Idx < l_BbpIdxPair.Item1))
			return false;

		if ((l_BbpIdxPair.Item2 >= 0) && (l_Idx > l_BbpIdxPair.Item2))
			return false;

		return true;
	}

	private static int seFindNextSmclnOrNewLineOrClsBrc(List<teLex.tTkn> a_TknList, int a_Bgn)
	{
		for (int i = a_Bgn; i < a_TknList.Count; ++i)
		{
			if ((teLex.tTmnl.i_Smcln == a_TknList[i].c_Tmnl) ||
				(teLex.tTmnl.i_NewLine == a_TknList[i].c_Tmnl) ||
				(teLex.tTmnl.i_RBrc == a_TknList[i].c_Tmnl))
			{
				return i;
			}
		}
		return -1;
	}

	private static int seFindByAttr(List<teLex.tTkn> a_TknList, int a_Bgn, string a_Attr)
	{
		return a_TknList.FindIndex(a_Bgn, (a_Tkn) => { return a_Attr == a_Tkn.c_Attr.ToString(); });
	}

	private static bool seIsFctnDfn(List<teLex.tTkn> a_TknList, int a_Idx)
	{
		// 函数定义的前一个词法单元可以是“{ } ;”，且函数定义一定有函数名
		// 其余的认为是函数表达式

		if (a_Idx < 1) // 没有前一个时认为是
		{
			return true;
		}

		if ((teLex.tTmnl.i_LBrc == a_TknList[a_Idx - 1].c_Tmnl) ||
			(teLex.tTmnl.i_RBrc == a_TknList[a_Idx - 1].c_Tmnl) ||
			(teLex.tTmnl.i_Smcln == a_TknList[a_Idx - 1].c_Tmnl))
		{
			return (teLex.tTmnl.i_Id == a_TknList[a_Idx + 1].c_Tmnl);	// 下一个词法单元是标识符
		}

		return false;
	}

	private static void seSkipToRbbp(List<teLex.tTkn> a_TknList, ref int a_Idx)
	{
		var l_PairIdx = seFindPairBbp(a_TknList, a_TknList[a_Idx]);
		a_Idx = l_PairIdx.Item2;
	}

	private static bool seIsVarRef(List<teLex.tTkn> a_TknList, int a_Idx)
	{
		// 条件：
		// 1.必须是标识符，
		// 2.前一个词法单元不是“. function”，
		// 3.当前一个词法单元不是“?”时，后一个词法单元不是“:”

		if (!seIsId(a_TknList[a_Idx].c_Tmnl))
		{
			return false;
		}

		if ((a_Idx - 1 >= 0) &&
			((teLex.tTmnl.i_Dot == a_TknList[a_Idx - 1].c_Tmnl) ||
			(teLex.tTmnl.i_function == a_TknList[a_Idx - 1].c_Tmnl)))
		{
			return false;
		}

		if ((a_Idx - 1 >= 0) &&
			(teLex.tTmnl.i_Qstn != a_TknList[a_Idx - 1].c_Tmnl) &&
			(a_Idx + 1 < a_TknList.Count) &&
			(teLex.tTmnl.i_Cln == a_TknList[a_Idx + 1].c_Tmnl))
		{
			return false;
		}

		return true;
	}

	private static bool seIsPptyAcs(List<teLex.tTkn> a_TknList, int a_Idx)
	{
		// 前一个词法单元是“.”
		if ((a_Idx - 1 >= 0) &&
			((teLex.tTmnl.i_Dot == a_TknList[a_Idx - 1].c_Tmnl)))
		{
			return true;
		}

		return false;
	}

	//-------- 类型

	/// <summary>
	/// 函数压缩器
	/// </summary>
	private partial class teFctn
	{
		//-------- 接口

		public void cRun(tCprsr a_Ownr, StringBuilder a_RptBfr, ref List<teLex.tTkn> a_TknList)
		{
			// 记录实参
			e_Ownr = a_Ownr;
			e_RptBfr = a_RptBfr;

			// 复位一些字段
			e_TopIdNames = new List<string>();
			e_ScpList = new List<teScp>();

			// 收集顶级函数及顶级标识符名称
			bool l_GthLocVar = false;						// 正在收集局部变量？这里的初始值重要！
			teLex.tTmnl l_ByWhich = teLex.tTmnl.ui_None;	// 由const/let/var引发的？这里的初始值不要紧！
			int l_Idx = 0;
			while (l_Idx < a_TknList.Count)
			{
				eGthLocVars(a_TknList, 0, a_TknList.Count, ref l_Idx, ref l_GthLocVar, ref l_ByWhich, null);
			}

			// 压缩
			for (int s = 0; s < e_ScpList.Count; ++s)
			{
				eCprs(a_TknList, e_ScpList[s]);
			}

			// 没必要，最后生成代码时跳过即可，效率更高
			//// 可能会有tTkn.ui_None，移除它们
			//a_TknList.RemoveAll((a_Tkn) => { return (teLex.tTkn.ui_None == a_Tkn); });
		}

		//-------- 函数

		private void eCprs(List<teLex.tTkn> a_TknList, teScp a_Scp)
		{
			// 构建替换名
			eBldSbstName(a_TknList, a_Scp);

			// 替换局部变量名
			eSbstLocName(a_TknList, a_Scp);

			// 如果需要压缩属性访问
			if (e_Ownr.e_RunCfg.c_CprsPptyAcs)
			{
				eCprsPptyAcs(a_TknList, a_Scp);
			}
		}

		private void eBldSbstName(List<teLex.tTkn> a_TknList, teScp a_Scp)
		{
			// 顶级函数的替换名编号以0开始（始终指向下一个可用的编号），
			// 处于同一层级上的子函数从父函数的编号开始，继续递增，
			// 所以首先为父函数生成编号，再递归为子函数生成编号
			for (int d = 0; d < a_Scp.c_LocDfns.Count; ++d)
			{
				// 生成新名称
				//【警告】必须保证该名称没有与任何顶级标识符名重复，且能被作用域接受
				string l_NewName;
				bool l_Used = false;
				int l_SbstNameNum = a_Scp.c_SbstNameNum;
				do
				{
					l_NewName = eGnrtSbstName(ref l_SbstNameNum);
				} while ((e_TopIdNames.IndexOf(l_NewName) >= 0) || (!a_Scp.cAcpNewName(d, l_NewName, out l_Used)));

				// 若使用了新名称，则更新编号
				if (l_Used)
				{
					a_Scp.c_SbstNameNum = l_SbstNameNum;
				//	Console.WriteLine(l_SbstNameNum);
				}
			}

			// 如果需要压缩属性访问
			if (e_Ownr.e_RunCfg.c_CprsPptyAcs)
			{
				// 为属性名局部变量生成替换名
				string[] l_Keys = new string[a_Scp.c_PptyNameMap.Count];
				a_Scp.c_PptyNameMap.Keys.CopyTo(l_Keys, 0);
				for (int i = 0; i < l_Keys.Length; ++i)
				{
					// 首先尝试映射父作用域里的属性变量名
					string l_NewName = a_Scp.cMapPrnPptyAcsVar(l_Keys[i]);
					if (null != l_NewName)
					{
						//
					}
					else // 生成新名称
					{
						//【警告】必须保证该名称尚不可访问
						
						int l_SbstNameNum = a_Scp.c_SbstNameNum;
						do
						{
							l_NewName = eGnrtSbstName(ref l_SbstNameNum);
						} while ((e_TopIdNames.IndexOf(l_NewName) >= 0) || (a_Scp.cIsNameAcsbl(l_NewName)));

						// 更新编号
						a_Scp.c_SbstNameNum = l_SbstNameNum;
					}

					// 记录替换名
					a_Scp.c_PptyNameMap[l_Keys[i]] = l_NewName;
				}
			}

			// 递归
			for (int s = 0; s < a_Scp.c_SubScps.Count; ++s)
			{
				a_Scp.c_SubScps[s].c_SbstNameNum = a_Scp.c_SbstNameNum;
				eBldSbstName(a_TknList, a_Scp.c_SubScps[s]);
			}
		}

		private string eGnrtSbstName(ref int a_SbstNameNum)
		{
			string l_Rst;

			// 序列号生成？
			if ("字母汉字" == e_Ownr.e_RunCfg.c_SbstNameGnrt)
			{
				// 首次
				if (0 == a_SbstNameNum)
				{
					a_SbstNameNum = 65;	// A
				}

				l_Rst = new string((char)a_SbstNameNum, 1);

				// 自增
				// 已到Z，跳至a
				if (90 == a_SbstNameNum)
				{
					a_SbstNameNum = 97;
				}
				else // 已到z，跳至汉字，UTF8/16 汉字范围：[0x4E00, 0x9FA5]
					if (122 == a_SbstNameNum)
					{
						a_SbstNameNum = 0x4E00;
					}
					else
					{
						++a_SbstNameNum;
					}

				// 检查溢出
				if (a_SbstNameNum > 0x9FA5)
				{
					throw new Exception("替换变量名溢出！");
				}
			}
			else // 序列号
			{
				l_Rst = e_Ownr.e_RunCfg.c_SqncNumPfx + a_SbstNameNum;
				++a_SbstNameNum;
			}

			return l_Rst;
		}

		private void eSbstLocName(List<teLex.tTkn> a_TknList, teScp a_Scp)
		{
			// 替换局部变量引用
			for (int r = 0; r < a_Scp.c_LocRefs.Count; ++r)
			{
				// 匹配，未匹配时跳过
				teIdNameMap l_Map = eMchLocName(a_TknList, a_Scp, a_Scp.c_LocRefs[r].c_Attr.ToString());
				if (null == l_Map)
				{
					//	Console.WriteLine("未匹配：" + a_Scp.c_LocRefs[r].c_Attr.ToString());	// 测试
					continue;
				}

				// 改成新名
				a_Scp.c_LocRefs[r].c_Attr = l_Map.c_New;
			}

			// 递归
			for (int s = 0; s < a_Scp.c_SubScps.Count; ++s)
			{
				a_Scp.c_SubScps[s].c_SbstNameNum = a_Scp.c_SbstNameNum;
				eSbstLocName(a_TknList, a_Scp.c_SubScps[s]);
			}
		}

		private void eCprsPptyAcs(List<teLex.tTkn> a_TknList, teScp a_Scp)
		{
			// 如果有属性访问，定义属性变量，成功时处理该作用域
			if ((a_Scp.c_PptyAcs.Count > 0) && eDfnPptyVar(a_TknList, a_Scp))
			{
				// 压缩每一个属性访问
				for (int a = 0; a < a_Scp.c_PptyAcs.Count; ++a)
				{
					ePptyAcsBrkt(a_TknList, a_Scp, a_Scp.c_PptyAcs[a]);
				}
			}

			// 递归
			for (int s = 0; s < a_Scp.c_SubScps.Count; ++s)
			{
				eCprsPptyAcs(a_TknList, a_Scp.c_SubScps[s]);
			}
		}

		private bool eDfnPptyVar(List<teLex.tTkn> a_TknList, teScp a_Scp)
		{
			// 取得变量定义作用域，若为顶级作用域，立即退出
			// 这是为了避免污染顶级作用域
			var l_VarScp = a_Scp.cGetScpForLocDfnByVar();
			if (null == l_VarScp)
			{
				return false;
			}

			var l_Map = a_Scp.c_PptyNameMap;
			if (0 == l_Map.Count)
			{
				return false;
			}

			// 逐个定义变量
			int l_ScpBgn = -1, l_VarIdx = l_ScpBgn;
			string[] l_Keys = new string[l_Map.Count];
			l_Map.Keys.CopyTo(l_Keys, 0);
			for (int i = 0; i < l_Keys.Length; ++i)
			{
				// 跳过已在父作用域里定义过的
				if (null != a_Scp.cMapPrnPptyAcsVar(l_Keys[i]))
				{
					// 如果这是最后一个，且是逗号，换成分号
					if ((i == l_Keys.Length - 1) && (l_VarIdx >= 0) && (teLex.tTmnl.i_Cma == a_TknList[l_VarIdx].c_Tmnl))
					{
						a_TknList[l_VarIdx].c_Tmnl = teLex.tTmnl.i_Smcln;
						a_TknList[l_VarIdx].c_Attr = ";";
					}
					continue;
				}

				// 如果需要，在变量定义作用域开头插入“var”
				if (l_ScpBgn < 0)
				{
					l_ScpBgn = a_TknList.IndexOf(l_VarScp.c_Tkn_Bgn);
					l_VarIdx = l_ScpBgn;
					a_TknList.Insert(++ l_VarIdx, new teLex.tTkn(teLex.tTmnl.i_var, "var", -1));	// 行号设为无效值-1
				}

				// 定义并赋予初始值
				var l_Key = l_Keys[i];

				//if ("c_OnCplt" == l_Key)
				//{
				//	int zz=0;
				//}

				a_TknList.Insert(++ l_VarIdx, new teLex.tTkn(teLex.tTmnl.i_Id, l_Map[l_Key], -1));
				a_TknList.Insert(++ l_VarIdx, new teLex.tTkn(teLex.tTmnl.i_Asn, "=", -1));
				a_TknList.Insert(++ l_VarIdx, new teLex.tTkn(teLex.tTmnl.i_StrLtrl, '"' + l_Key + '"', -1));

				// 继续（,）或完结（;）
				var l_Tmnl = (i < l_Keys.Length - 1) ? teLex.tTmnl.i_Cma : teLex.tTmnl.i_Smcln;
				var l_Attr = (i < l_Keys.Length - 1) ? "," : ";";
				a_TknList.Insert(++ l_VarIdx, new teLex.tTkn(l_Tmnl, l_Attr, -1));
			}

			return true;
		}

		private void ePptyAcsBrkt(List<teLex.tTkn> a_TknList, teScp a_Scp, teLex.tTkn a_PptyNameTkn)
		{
			// 前一个词法单元一定是“.”，改成“[”
			int l_Idx = a_TknList.IndexOf(a_PptyNameTkn);
			a_TknList[l_Idx - 1].c_Tmnl = teLex.tTmnl.i_LBrkt;
			a_TknList[l_Idx - 1].c_Attr = "[";
			a_TknList[l_Idx - 1].c_Row = -1;

			// 名称替换成局部变量名
			a_TknList[l_Idx].c_Tmnl = teLex.tTmnl.i_Id;
			a_TknList[l_Idx].c_Attr = a_Scp.c_PptyNameMap[a_PptyNameTkn.c_Attr.ToString()];
			a_TknList[l_Idx].c_Row = -1;

			// 后面插入一个“]”
			a_TknList.Insert(l_Idx + 1, new teLex.tTkn(teLex.tTmnl.i_RBrkt, "]", -1));
		}

		private teIdNameMap eMchLocName(List<teLex.tTkn> a_TknList, teScp a_Scp, string a_Name)
		{
			var l_LocDfns = a_Scp.c_LocDfns;
			for (int i = 0; i < l_LocDfns.Count; ++i)
			{
				if (l_LocDfns[i].c_Old == a_Name)
				{
					return l_LocDfns[i];
				}
			}

			// 如果有，向上一层递归
			if (null != a_Scp.c_Prn)
			{
				return eMchLocName(a_TknList, a_Scp.c_Prn, a_Name);
			}

			return null;
		}

		private void eChgVarToCma(List<teLex.tTkn> a_TknList, int a_Idx = -1) // 把var改成逗号
		{
			if (a_Idx < 0)
			{
				a_Idx = a_TknList.Count - 1;	// 默认最后一个
			}

			if ((teLex.tTmnl.i_var != a_TknList[a_Idx].c_Tmnl) &&
				(teLex.tTmnl.i_let != a_TknList[a_Idx].c_Tmnl) &&
				(teLex.tTmnl.i_const != a_TknList[a_Idx].c_Tmnl))
			{
				throw new InvalidOperationException("不是“var、let、const”，不能换成逗号！");
			}

			var l_OldAttrStr = a_TknList[a_Idx].c_Attr.ToString();
			var l_Row = a_TknList[a_Idx].c_Row;
			a_TknList[a_Idx].c_Tmnl = teLex.tTmnl.i_Cma;
			a_TknList[a_Idx].c_Attr = ",";

			e_RptBfr.AppendLine("行(" + l_Row + ")：“" + l_OldAttrStr
								+ "”被替换成逗号，前面的分号或换行被移除！");
		}

		private void eGthLocVars(List<teLex.tTkn> a_TknList, int a_Bgn, int a_Lmt,
									ref int a_Idx, ref bool a_GthLocVar, ref teLex.tTmnl a_ByWhich, teScp a_Scp)
		{
			// a_ByWhich：0=const，1=let，2=var

			// function，catch，for，左花
			if ((teLex.tTmnl.i_function == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_catch == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_for == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_LBrc == a_TknList[a_Idx].c_Tmnl))
			{
				if (null == a_Scp) // 顶级作用域？
				{
					// 新建作用域，并递归构建
					teScp l_TopScp = new teScp(null);	// 顶级
					l_TopScp.cRcurBld(e_Ownr, e_RptBfr, a_TknList, ref a_Idx);
					e_ScpList.Add(l_TopScp);

					if (null != l_TopScp.c_Name) // 如果有名称
					{
						e_TopIdNames.Add(l_TopScp.c_Name);
					}
				}
				else
				{
					// 构建
					teScp l_SubScp = new teScp(a_Scp);	// 子
					l_SubScp.cRcurBld(e_Ownr, e_RptBfr, a_TknList, ref a_Idx);
					a_Scp.c_SubScps.Add(l_SubScp);
				}
			}
			else // 收集局部变量开始，遇到“var let”时……
			if ((teLex.tTmnl.i_var == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_let == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_const == a_TknList[a_Idx].c_Tmnl))
			{
				a_GthLocVar = true;						// 开始收集
				a_ByWhich = a_TknList[a_Idx].c_Tmnl;	// 由谁引起？

				// 下一个一定是标识符
				++a_Idx;
				if (!seIsId(a_TknList[a_Idx].c_Tmnl))
				{
					throw new Exception("行(" + a_TknList[a_Idx].c_Row + ")：“var”后面必须是标识符！");
				}

				//a_RptBfr.AppendLine("行(" + a_TknList[a_Idx].c_Row + ")：发现局部变量“"
				//	+ a_TknList[a_Idx].c_Attr.ToString() + "”！");

				if (null == a_Scp) // 顶级作用域？
				{
					e_TopIdNames.Add(a_TknList[a_Idx].c_Attr.ToString());
				}
				else
				{
					a_Scp.cAddLocDfns(new teIdNameMap(a_TknList[a_Idx].c_Attr.ToString()), (teLex.tTmnl.i_var == a_ByWhich), e_TopIdNames);
					a_Scp.cAddLocRefs(a_TknList[a_Idx]);
				}

				++a_Idx;	// 下一个
			}
			else // 收集局部变量继续，遇到逗号时……
			if (a_GthLocVar &&
				(teLex.tTmnl.i_Cma == a_TknList[a_Idx].c_Tmnl))
			{
				// 下一个一定是标识符
				++a_Idx;
				if (!seIsId(a_TknList[a_Idx].c_Tmnl))
				{
					throw new Exception("行(" + a_TknList[a_Idx].c_Row + ")：“,”后面必须是标识符！");
				}

				//a_RptBfr.AppendLine("行(" + a_TknList[a_Idx].c_Row + ")：发现局部变量“"
				//	+ a_TknList[a_Idx].c_Attr.ToString() + "”！");

				if (null == a_Scp) // 顶级作用域？
				{
					e_TopIdNames.Add(a_TknList[a_Idx].c_Attr.ToString());
				}
				else
				{
					a_Scp.cAddLocDfns(new teIdNameMap(a_TknList[a_Idx].c_Attr.ToString()), (teLex.tTmnl.i_var == a_ByWhich), e_TopIdNames);
					a_Scp.cAddLocRefs(a_TknList[a_Idx]);
				}

				++a_Idx;	// 下一个
			}
			else // 收集局部变量继续，遇到左括号时（逗号可以出现在其中）……
			if (a_GthLocVar &&
				seIsOpenBbp(a_TknList[a_Idx].c_Tmnl))
			{
				// 跳至配对括号处
				var l_Bgn = a_Idx + 1;	// 左花或左圆的下一个
				seSkipToRbbp(a_TknList, ref a_Idx);
				var l_Lmt = a_Idx;		// 右花或右圆

				if (null == a_Scp) // 顶级作用域？
				{
					e_TopIdNames.Add(a_TknList[a_Idx].c_Attr.ToString());
				}
				else
				{
					// 但是仍要收集局部变量引用和属性访问
					for (int i = l_Bgn; i < l_Lmt; ++i)
					{
						if (seIsVarRef(a_TknList, i))
						{
							a_Scp.cAddLocRefs(a_TknList[i]);
						}
						else
							if (seIsPptyAcs(a_TknList, i))
							{
								a_Scp.cAddPptyAcs(a_TknList[i]);
							}
					}
				}

				++a_Idx;	// 下一个
			}
			else // 正在收集局部变量期间，如果遇到“; } 换行”，停止收集
			if (a_GthLocVar &&
				((teLex.tTmnl.i_Smcln == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_RBrc == a_TknList[a_Idx].c_Tmnl) ||
				(teLex.tTmnl.i_NewLine == a_TknList[a_Idx].c_Tmnl)))	// 理论上，换行依然可能存在
			{
				// 如果是分号或者换行，且下一个词法单元还是“const/let/var”
				// 将其替换成逗号，继续收集
				if ((a_Idx + 1 < a_Lmt)
					&&
					((teLex.tTmnl.i_Smcln == a_TknList[a_Idx].c_Tmnl) ||
					(teLex.tTmnl.i_NewLine == a_TknList[a_Idx].c_Tmnl))
					&&
					(a_ByWhich == a_TknList[a_Idx + 1].c_Tmnl))
				{
					// 为使下一次迭代时将会遇到逗号，修改下一个词法单元，而把当前词法单元设为ui_None
					a_TknList[a_Idx] = teLex.tTkn.ui_None;
					e_Ownr.e_Fctn.eChgVarToCma(a_TknList, a_Idx + 1);
				}
				else
				{
					a_GthLocVar = false;
				}

				++a_Idx;	// 下一个
			}
			else // 局部变量引用
			if (seIsVarRef(a_TknList, a_Idx))
			{
				if (null == a_Scp) // 顶级作用域？
				{
					//
				}
				else
				{
					a_Scp.cAddLocRefs(a_TknList[a_Idx]);
				}

				++a_Idx;	// 下一个
			}
			else // 属性访问
			if (seIsPptyAcs(a_TknList, a_Idx))
			{
				if (null == a_Scp) // 顶级作用域？
				{
					//
				}
				else
				{
					a_Scp.cAddPptyAcs(a_TknList[a_Idx]);
				}

				++a_Idx;	// 下一个
			}
			else
			{
				// 下一个
				++a_Idx;
			}
		}

		//-------- 数据

		private tCprsr e_Ownr;
		private StringBuilder e_RptBfr;
		private List<teScp> e_ScpList;
		private List<string> e_TopIdNames;

		private class teIdNameMap // 标识符名称映射
		{
			public string c_Old;	// 旧名称
			public string c_New;	// 新名称

			public teIdNameMap(string a_Old, string a_New = null)
			{
				c_Old = a_Old;
				c_New = a_New;
			}
		}

		private class teScp // 作用域，支持函数和捕获，不支持with
		{
			public teScp	c_Prn;						// 父作用域
			public bool		c_CprsLocFctnName;			// 压缩局部函数名，【警告】由于eval函数的存在，将禁用压缩
			public int		c_SbstNameNum;				// 替换名编号

			// 词法单元相关
			public teLex.tTkn c_Tkn_Kwd;
			public teLex.tTkn c_Tkn_Bgn;
			public teLex.tTkn c_Tkn_End;
			//public int			l_Idx_Kwd;
			//public int			l_Idx_Id;						// 匿名函数为-1
			//public int			l_Idx_LPrth;
			//public int			l_Idx_RPrth;
			//public int			l_Idx_LBrc;
			//public int			l_Idx_RBrc;
			//public int			l_Idx_ScpBgn;
			//public int			l_Idx_ScpEnd;
			public string c_Name;						// 名称
			public int c_ScpCtgr;						// 作用域类别：0=函数定义，1=函数表达式，2=捕获，3=其他块


			public List<teIdNameMap> c_LocDfns;		// 局部变量定义
			public List<teLex.tTkn> c_LocRefs;		// 局部变量引用
			public List<teLex.tTkn> c_PptyAcs;		// 属性访问
			public Dictionary<string, string> c_PptyNameMap;	// 属性名映射
			public List<teScp> c_SubScps;		// 子函数块列表

			public teScp(teScp a_Prn)
			{
				c_Prn = a_Prn;
				c_CprsLocFctnName = true;
				c_SbstNameNum = 0;

				c_Tkn_Kwd = null;
				c_Tkn_Bgn = null;
				c_Tkn_End = null;
				c_Name = null;
				c_ScpCtgr = -1;

				c_LocDfns = new List<teIdNameMap>();
				c_LocRefs = new List<teLex.tTkn>();
				c_PptyAcs = new List<teLex.tTkn>();
				c_PptyNameMap = new Dictionary<string, string>();
				c_SubScps = new List<teScp>();
			}

			private void	eDsabCprsLocFctnName()
			{
				// 从该作用域起向上，全部禁用
				c_CprsLocFctnName = false;

				if (null != c_Prn)
				{
					c_Prn.eDsabCprsLocFctnName();
				}
			}

			public teScp cGetScpForLocDfnByVar()
			{
				teScp l_FS = this;
				while (null != l_FS)
				{
					if (l_FS.cOfFctn()) // 若是函数作用域
					{
						break;
					}

					l_FS = l_FS.c_Prn;
				}
				return l_FS;
			}

			public bool cOfFctn()
			{
				return (0 == c_ScpCtgr) || (1 == c_ScpCtgr);
			}

			public string cMapPrnPptyAcsVar(string a_PptyName)
			{
				teScp l_Prn = this.c_Prn;
				while (null != l_Prn)
				{
					if (l_Prn.c_PptyNameMap.ContainsKey(a_PptyName))
					{
						return l_Prn.c_PptyNameMap[a_PptyName];
					}

					l_Prn = l_Prn.c_Prn;
				}
				return null;
			}

			public void cAddLocDfns(teIdNameMap a_Map, bool a_ByVar, List<string> a_TopIdNames)
			{
				// 如果用“var”定义，添加至function/catch产生的作用域
				teScp l_FS = a_ByVar ? cGetScpForLocDfnByVar() : this;

				// 可能一直到顶级都没遇到，比如
				// 文件开始
				// ①
				//	{
				//		{
				//			var l_a;	// 可拿到①处
				//		}
				//	}
				//
				// 另外注意同一个变量在同一作用域内可能被定义多次
				if (null == l_FS)
				{
					if (a_TopIdNames.IndexOf(a_Map.c_Old) < 0)
					{
						a_TopIdNames.Add(a_Map.c_Old);
					}
				}
				else
				{
					if (l_FS.c_LocDfns.FindIndex((a_M) => { return a_M.c_Old == a_Map.c_Old; }) < 0)
					{
						l_FS.c_LocDfns.Add(a_Map);
					}
				}
			}

			public void cAddLocRefs(teLex.tTkn a_Tkn)
			{
				c_LocRefs.Add(a_Tkn);
			}

			public void cAddPptyAcs(teLex.tTkn a_Tkn)
			{
				c_PptyAcs.Add(a_Tkn);

				if (!c_PptyNameMap.ContainsKey(a_Tkn.c_Attr.ToString()))
				{
					c_PptyNameMap.Add(a_Tkn.c_Attr.ToString(), null);
				}
			}

			/// <summary>
			/// 名称可访问？
			/// </summary>
			public bool cIsNameAcsbl(string a_NewName)
			{
				// 检查是否与源代码定义的局部变量名相同
				var l_Idx = c_LocDfns.FindIndex((a_Map) => { return a_Map.c_Old == a_NewName; });
				if (l_Idx >= 0)
				{
					return true;
				}

				// 检查是否与能够访问到的源代码函数名相同，
				// 注意父函数名的检查在向上后进行，而顶级标识符名在调用本函数之前就已被检查过
				teScp l_Scp = this;
				while (null != l_Scp)
				{
					l_Idx = l_Scp.c_SubScps.FindIndex((a_S) => { return (a_S.c_Name == a_NewName); });

					if (l_Idx >= 0)
					{
						return true;
					}

					l_Scp = l_Scp.c_Prn;	// 向上
				}

				return false;
			}

			/// <summary>
			/// 接受新名称
			/// </summary>
			public bool cAcpNewName(int a_LocDfnIdx, string a_NewName, out bool a_Used)
			{
				// 先假定未使用传入的新名称
				a_Used = false;

				// 如果新名称已指定，表示不用替换
				if (null != c_LocDfns[a_LocDfnIdx].c_New)
				{
					return true;
				}

				// 如果禁止压缩，或本来就只有一个字符，不用压缩
				if ((! c_CprsLocFctnName) || (1 == c_LocDfns[a_LocDfnIdx].c_Old.Length))
				{
					c_LocDfns[a_LocDfnIdx].c_New = c_LocDfns[a_LocDfnIdx].c_Old;	// 新名称 = 旧名称
					return true;
				}

				// 名称可访问？
				if (cIsNameAcsbl(a_NewName))
				{
					return false;
				}

				// 现在允许接受新名称，但是……
				// 若新名称比旧名称短，使用新名称，否则保持不变
				if (a_NewName.Length < c_LocDfns[a_LocDfnIdx].c_Old.Length)
				{
					c_LocDfns[a_LocDfnIdx].c_New = a_NewName;
					a_Used = true;	// 已用传入的新名称
				}
				else
				{
					c_LocDfns[a_LocDfnIdx].c_New = c_LocDfns[a_LocDfnIdx].c_Old;	// 设为旧名称
				}

				return true;
			}

			/// <summary>
			/// 递归构建
			/// </summary>
			public void cRcurBld(tCprsr a_Ownr, StringBuilder a_RptBfr, List<teLex.tTkn> a_TknList, ref int a_TknIdx)
			{
				// 记录关键字词法单元，这一步非常关键，因为后来校准索引时需要用到该词法单元
				c_Tkn_Kwd = a_TknList[a_TknIdx];

				// 根据关键字词法单元校准索引
				int l_Idx_Kwd = -1;
				int l_Idx_Id = -1, l_Idx_LPrth = -1, l_Idx_RPrth = -1, l_Idx_LBrc = -1, l_Idx_RBrc = -1;
				int l_Idx_ScpBgn = -1, l_Idx_ScpEnd = -1;

				// 如果是function，catch
				if ((teLex.tTmnl.i_function == c_Tkn_Kwd.c_Tmnl) ||
					(teLex.tTmnl.i_catch == c_Tkn_Kwd.c_Tmnl))
				{
					l_Idx_Kwd = a_TknIdx;
					l_Idx_Id = seIsId(a_TknList[a_TknIdx + 1].c_Tmnl) ? (a_TknIdx + 1) : -1;
					l_Idx_LPrth = (l_Idx_Id < 0) ? (a_TknIdx + 1) : (a_TknIdx + 2);
					l_Idx_RPrth = seFindPairBbp(a_TknList, a_TknList[l_Idx_LPrth]).Item2;
					l_Idx_LBrc = l_Idx_RPrth + 1;
					l_Idx_RBrc = seFindPairBbp(a_TknList, a_TknList[l_Idx_LBrc]).Item2;
					l_Idx_ScpBgn = l_Idx_LBrc;
					l_Idx_ScpEnd = l_Idx_RBrc;

					// 如果尚未初始化，且有名字，记录
					if ((null == c_Name) && (l_Idx_Id >= 0))
					{
						c_Name = a_TknList[l_Idx_Id].c_Attr.ToString();
					}

					// 如果尚未初始化，分辨类别
					if (c_ScpCtgr < 0)
					{
						if (teLex.tTmnl.i_function == a_TknList[l_Idx_Kwd].c_Tmnl)
						{
							c_ScpCtgr = seIsFctnDfn(a_TknList, a_TknIdx) ? 0 : 1;
						}
						else
						if (teLex.tTmnl.i_catch == a_TknList[l_Idx_Kwd].c_Tmnl)
						{
							c_ScpCtgr = 2;
						}
					}
				}
				else // for (var ...)，for (let ...)
				if (teLex.tTmnl.i_for == c_Tkn_Kwd.c_Tmnl)
				{
					l_Idx_Kwd = a_TknIdx;
					l_Idx_LPrth = a_TknIdx + 1;
					l_Idx_RPrth = seFindPairBbp(a_TknList, a_TknList[l_Idx_LPrth]).Item2;
					l_Idx_LBrc = l_Idx_RPrth + 1;
					l_Idx_RBrc = seFindPairBbp(a_TknList, a_TknList[l_Idx_LBrc]).Item2;
					l_Idx_ScpBgn = l_Idx_LPrth;		//【注意】从左圆到右花
					l_Idx_ScpEnd = l_Idx_RBrc;

					// 如果尚未初始化，分辨类别
					if (c_ScpCtgr < 0)
					{
						c_ScpCtgr = 3;
					}
				}
				else // { ... }
				if (teLex.tTmnl.i_LBrc == c_Tkn_Kwd.c_Tmnl)
				{
					// 只需花括号索引
					l_Idx_LBrc = a_TknIdx;
					l_Idx_RBrc = seFindPairBbp(a_TknList, a_TknList[l_Idx_LBrc]).Item2;
					l_Idx_ScpBgn = l_Idx_LBrc;
					l_Idx_ScpEnd = l_Idx_RBrc;

					// 如果尚未初始化，分辨类别
					if (c_ScpCtgr < 0)
					{
						c_ScpCtgr = 3;
					}
				}

				// 记录起始结束词法单元
				c_Tkn_Bgn = a_TknList[l_Idx_ScpBgn];
				c_Tkn_End = a_TknList[l_Idx_ScpEnd];

				// 索引移至结束的下一个位置
				a_TknIdx = l_Idx_ScpEnd + 1;

				// 如果是function/catch
				if (3 != c_ScpCtgr)
				{
					// 如果是函数且不是顶级函数，收集当前函数名（如果有的话），因为在函数内亦可以访问它，
					// 但顶级函数名相当于全局变量，不要修改！
					if (cOfFctn() && a_Ownr.e_RunCfg.c_CprsLocFctnName && (null != c_Prn) && (l_Idx_Id >= 0))
					{
						// 是否匹配要保留的正则表达式？未匹配表示允许压缩
						bool l_Mch = a_Ownr.e_RunCfg.c_PsrvRgx.Match(c_Name).Success;

						// 对于子函数定义，其函数名也是父函数的局部变量，故添加到父函数的局部变量里，
						// 但是对于子函数表达式，其函数名只在其内可见，父函数不可把它作为局部变量，
						// 注意不要两个都添加，父函数修改了子函数名，子函数也会以闭包形式受到影响！
						if (0 == c_ScpCtgr)
						{
							c_Prn.c_LocDfns.Add(new teIdNameMap(c_Name, l_Mch ? c_Name : null));
							c_Prn.c_LocRefs.Add(a_TknList[l_Idx_Id]);
						}
						else // 1, 2
						{
							c_LocDfns.Add(new teIdNameMap(c_Name, l_Mch ? c_Name : null));
							c_LocRefs.Add(a_TknList[l_Idx_Id]);
						}
					}
					//【警告：不要随意修改函数名！】
					// 因为JavaScript程序可能调用函数的“toString”取得函数的源代码，
					// 继而提取函数名以作他用，事实上，WSE就用到了这项技术，
					// 这说明即使在函数内嵌套定义的函数，也可以跨越函数边界，将其源代码传至另一个作用域，
					// 既然另一个作用域可以访问函数名，为安全起见，函数名维持原状。

					// 收集函数或捕获的形参
					for (int i = l_Idx_LPrth + 1; i < l_Idx_RPrth; ++i)
					{
						// 只能是逗号或标识符
						if (seIsId(a_TknList[i].c_Tmnl))
						{
							c_LocDfns.Add(new teIdNameMap(a_TknList[i].c_Attr.ToString()));
							c_LocRefs.Add(a_TknList[i]);
						}
					}
				}

				// 收集函数体里的局部变量定义和引用
				bool l_GthLocVar = false;						// 正在收集局部变量？这里的初始值重要！
				teLex.tTmnl l_ByWhich = teLex.tTmnl.ui_None;	// 由const/let/var引发的？这里的初始值不要紧！
				int l_Idx = l_Idx_ScpBgn + 1;		// 从左花或左圆的下一个位置开始
				while (l_Idx < l_Idx_ScpEnd)		// 到右花或右圆为止
				{
					a_Ownr.e_Fctn.eGthLocVars(a_TknList, l_Idx_ScpBgn + 1, l_Idx_ScpEnd, ref l_Idx, ref l_GthLocVar, ref l_ByWhich, this);
				} // while

				// 当尚未禁用压缩局部变量和函数名时，搜索“eval”和“new Function”，若存在则禁用
				if (c_CprsLocFctnName)
				{
					for (int i=l_Idx_ScpBgn; i<=l_Idx_ScpEnd; ++i)
					{
						if ((teLex.tTmnl.i_Id == a_TknList[i].c_Tmnl) && 
							(
								("eval" == a_TknList[i].c_Attr.ToString()) ||
								(
									("Function" == a_TknList[i].c_Attr.ToString()) &&
									(i > 0) && (teLex.tTmnl.i_new == a_TknList[i - 1].c_Tmnl)
								)
							)
						)
						{
							eDsabCprsLocFctnName();
							break;
						}
					}
				}
			}

		}	// teScp

	}
}

