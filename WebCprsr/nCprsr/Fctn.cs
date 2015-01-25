using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Xml;
using System.Text.RegularExpressions;

namespace nWebCprsr.nCprsr
{
	partial class tLex
	{
		/// <summary>
		/// 函数
		/// </summary>
		class tFctn
		{
			/// <summary>
			/// 标识符名称映射
			/// </summary>
			private class teIdNameMap
			{
				public string c_Old;	// 旧名称
				public string c_New;	// 新名称

				public teIdNameMap(string a_Old, string a_New = null)
				{
					c_Old = a_Old;
					c_New = a_New;
				}
			}

			/// <summary>
			/// 作用域，支持函数和捕获，不支持with
			/// </summary>
			private class teScp
			{
				public teScp c_Prn;						// 父作用域
				public bool c_CprsLocFctnName;			// 压缩局部函数名，【警告】由于eval函数的存在，将禁用压缩
				public int c_SbstNameNum;				// 替换名编号

				// 词法单元相关
				public tLex.tTkn c_Tkn_Kwd;
				public tLex.tTkn c_Tkn_Bgn;
				public tLex.tTkn c_Tkn_End;
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
				public List<tLex.tTkn> c_LocRefs;		// 局部变量引用
				public List<List<tLex.tTkn>> c_PptyAcsTab;	// 属性访问表，记录每个属性访问词法单元及出现次数
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
					c_LocRefs = new List<tLex.tTkn>();
					c_PptyAcsTab = new List<List<tLex.tTkn>>();
					c_PptyNameMap = new Dictionary<string, string>();
					c_SubScps = new List<teScp>();
				}

				private void eDsabCprsLocFctnName()
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
					return l_FS; // null表示顶级作用域
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
					//		var l_a;		// 重复定义，没有效果
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

				public void cAddLocRefs(tLex.tTkn a_Tkn)
				{
					c_LocRefs.Add(a_Tkn);
				}

				public void cAddPptyAcs(tLex.tTkn a_Tkn)
				{
					// 如果长度≤2个字符，不用录入，后面会解释这是怎么算出来的
					var l_TknStr = a_Tkn.c_Attr.ToString();
					if (l_TknStr.Length <= 2)
					{
						return;
					}

					//【注意】添加的属性名变量一定放在var所在作用域
					var l_VarScp = this.cGetScpForLocDfnByVar();
					if (null == l_VarScp)
					{
						return;
					}

					int l_Idx = l_VarScp.c_PptyAcsTab.FindIndex((a_TL) => { return a_TL[0].c_Attr.ToString() == l_TknStr; });
					if (l_Idx < 0)
					{
						l_VarScp.c_PptyAcsTab.Add(new List<tLex.tTkn>());
						l_Idx = l_VarScp.c_PptyAcsTab.Count - 1;
					}

					l_VarScp.c_PptyAcsTab[l_Idx].Add(a_Tkn);

					// 如果确实能缩减总的代码量，那就录入新旧名映射
					// 计算方式为：假设要访问的属性名为“Ppty”，
					// 当访问一次时，Obj.Ppty -> var p="Ppty";Obj[p]，
					// 变化：((9 + 4) + 3 * 1) - (1 + 4) = +11，压缩后反而增加了11个字符；
					// 当访问两次时，Obj.Ppty;Obj.Ppty; -> var p="Ppty";Obj[p];Obj[p];，
					// 变化：((9 + 4) + 3 * 2) - (1 + 4) * 2 = +9，压缩后反而增加了9个字符；
					// ……每增加一次访问，就可以省(属性名的长度 - 2)个字符，故须保证l_TknStr.Length > 2
					var l_NoCprsChaAmt = (1 + l_TknStr.Length) * l_VarScp.c_PptyAcsTab[l_Idx].Count;
					var l_CprsChaAmt = (9 + l_TknStr.Length) + 3 * l_VarScp.c_PptyAcsTab[l_Idx].Count;
					if ((l_CprsChaAmt < l_NoCprsChaAmt) &&
						(!l_VarScp.c_PptyNameMap.ContainsKey(l_TknStr)))
					{
						l_VarScp.c_PptyNameMap.Add(l_TknStr, null);
					}
				}

				/// <summary>
				/// 名称已使用？
				/// </summary>
				public bool cIsNameUsed(int a_LocDfnIdx, string a_NewName)
				{
					// 检查是否与源代码定义的局部变量名（旧名＆新名）相同
					//【注意1】由于这次调用可能是由属性访问引发，而压缩属性访问是在压缩局部变量之后进行的
					// 所以无法保证局部变量新名不与属性访问新名冲突，故必须检查这两个名字！c_New为空不妨碍
					//【注意2】不能只是搜索this，还必须向上找，直至函数作用域（var定义到的作用域）！
					//【BUG】兄弟作用域会不会也用了？！
					//var l_VarScp = this.cGetScpForLocDfnByVar();
					//var l_Scp = this;
					//int l_Idx;
					//do
					//{
					//	l_Idx = l_Scp.c_LocDfns.FindIndex(
					//		(a_Map) => { return (a_Map.c_Old == a_NewName) || (a_Map.c_New == a_NewName); });
					//	if (l_Idx >= 0)
					//	{
					//		return true;
					//	}

					//	if (l_Scp == l_VarScp)
					//	{
					//		break;
					//	}
					//	else
					//	{
					//		l_Scp = l_Scp.c_Prn;
					//	}
					//} while ((null != l_Scp));
					var l_Scp = this;
					int l_Idx = l_Scp.c_LocDfns.FindIndex(
							(a_Map) => { return (a_Map.c_Old == a_NewName) || (a_Map.c_New == a_NewName); });
					if (l_Idx >= 0)
					{
						return true;
					}

					//【不用了，子函数名应该已被加入到this.c_LocDfns】
					//// 检查是否与源代码定义的函数名（位于子作用域）相同
					//l_Idx = this.c_SubScps.FindIndex((a_S) => { return (a_S.c_Name == a_NewName); });
					//if (l_Idx >= 0)
					//{
					//	return true;
					//}

					//【警告】这里不能轻易认定尚未使用，因为可能会发生名称访问的“隔代拦截”：
					// 设有作用域：S0{ var AA; S1{ var BB; S2{ AA; } } } }
					// 先将S0.AA->A，后将S1.BB->A，因S1里局部引用并未访问AA，
					// 但S2.AA本应访问S0.AA，却访问到了S1.BB，即替换后：
					// S0{ var A; S1{ var A; S2{ A; } } } }
					// 解决办法是，除了遍历当前作用域的局部引用，还要搜索子作用域的，只要有一个名称相同就算已经使用！
					// 但是，IE8还有一个BUG要解决：具名函数表达式的名字似乎会覆盖掉所在作用域里的同名变量！

					// 沿着作用域链向上回溯，注意到顶级标识符名在调用本函数之前就已被检查过
					// 对于祖先作用域里的局部变量名，应使用新名（他们已被替换！）进行比对
					var l_VarScp = this.cGetScpForLocDfnByVar();	// var定义到的作用域
					l_Scp = this.c_Prn;
					while (null != l_Scp)
					{
						l_Idx = l_Scp.c_LocDfns.FindIndex(
							(a_Map) =>
							{
								// 如果找到一个新名相同的，但是若子树作用域没有引用该新名对应的旧名，也可以使用该新名
								if (a_Map.c_New == a_NewName)
								{
									//【解决IE8的BUG】
									if ((a_LocDfnIdx >= 0) &&  // 若调用者提供了索引，表示这是为某个局部变量生成替换名
										(1 == this.c_ScpCtgr) &&  // 如果本作用域是函数表达式作用域
										(! String.IsNullOrEmpty(this.c_Name) && // 且具名
										(this.c_LocDfns[a_LocDfnIdx].c_Old == this.c_Name))) // 且正为函数名生成替换名
									{
										return true; // 已用
									}

									//【判断后代作用域是否访问了先辈的这一变量名
									// 注意使用的是l_VarScp，因为这是a_NewName定义到的作用域！】
									return seIsScpSubtreeUseName(l_VarScp, a_Map.c_Old);
									//return (l_VarScp.c_LocRefs.FindIndex((a_Tkn) =>
									//{ return a_Tkn.c_Attr.ToString() == a_Map.c_Old; }) >= 0);
								}
								return false;
							});
						if (l_Idx >= 0)
						{
							return true;
						}

						//【不用了】
						//l_Idx = l_Scp.c_SubScps.FindIndex((a_S) => { return (a_S.c_Name == a_NewName); });
						//if (l_Idx >= 0)
						//{
						//	return true;
						//}

						l_Scp = l_Scp.c_Prn;	// 向上
					}

					return false;
				}

				private static bool seIsScpSubtreeUseName(teScp a_Scp, string a_Old)
				{
					if (a_Scp.c_LocRefs.FindIndex((a_Tkn) => { return a_Tkn.c_Attr.ToString() == a_Old; }) >= 0)
					{
						return true;
					}

					for (int s = 0; s < a_Scp.c_SubScps.Count; ++s)
					{
						if (seIsScpSubtreeUseName(a_Scp.c_SubScps[s], a_Old))
						{
							return true;
						}
					}

					return false;
				}

				/// <summary>
				/// 接受新名称
				/// </summary>
				public bool cAcpNewName(int a_LocDfnIdx, string a_NewName, Regex a_PsrvPla, out bool a_Used)
				{
					// 先假定未使用传入的新名称
					a_Used = false;

					// 如果新名称已指定，表示不用替换
					if (null != c_LocDfns[a_LocDfnIdx].c_New)
					{
						return true;
					}

					// 旧名是否匹配要保留的正则表达式？未匹配表示允许压缩
					// 如果匹配，或禁止压缩，或本来就只有一个字符，不用压缩
					if ((!c_CprsLocFctnName) || // 禁止（可能由于eval函数存在）
						(1 == c_LocDfns[a_LocDfnIdx].c_Old.Length) || // 不用
						a_PsrvPla.Match(c_LocDfns[a_LocDfnIdx].c_Old).Success) // 匹配
					{
						c_LocDfns[a_LocDfnIdx].c_New = c_LocDfns[a_LocDfnIdx].c_Old;	// 新名称 = 旧名称
						return true;
					}

					// 名称已使用？是的话不能接受这个，告知调用者换一个新名继续尝试！
					if (cIsNameUsed(a_LocDfnIdx, a_NewName))
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
				public void cRcurBld(tCprsr a_Cprsr, tFctn a_Fctn, List<tLex.tTkn> a_TknList, ref int a_TknIdx)
				{
					// 记录关键字词法单元，这一步非常关键，因为后来校准索引时需要用到该词法单元
					c_Tkn_Kwd = a_TknList[a_TknIdx];

					// 根据关键字词法单元校准索引
					int l_Idx_Kwd = -1;
					int l_Idx_Id = -1, l_Idx_LPrth = -1, l_Idx_RPrth = -1, l_Idx_LBrc = -1, l_Idx_RBrc = -1;
					int l_Idx_ScpBgn = -1, l_Idx_ScpEnd = -1;

					// 如果是function，catch
					if ((tLex.tTmnl.i_function == c_Tkn_Kwd.c_Tmnl) ||
						(tLex.tTmnl.i_catch == c_Tkn_Kwd.c_Tmnl))
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

						//if ("fEnum" == c_Name)
						//{
						//	int z=0;
						//}

						// 如果尚未初始化，分辨类别
						if (c_ScpCtgr < 0)
						{
							if (tLex.tTmnl.i_function == a_TknList[l_Idx_Kwd].c_Tmnl)
							{
								c_ScpCtgr = seIsFctnDfn(a_TknList, a_TknIdx) ? 0 : 1;
							}
							else
								if (tLex.tTmnl.i_catch == a_TknList[l_Idx_Kwd].c_Tmnl)
								{
									c_ScpCtgr = 2;
								}
						}
					}
					else // for (var ...)，for (let ...)
						if (tLex.tTmnl.i_for == c_Tkn_Kwd.c_Tmnl)
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
							if (tLex.tTmnl.i_LBrc == c_Tkn_Kwd.c_Tmnl)
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
						if (cOfFctn() && a_Cprsr.c_RunCfg.c_LocFctnName && (null != c_Prn) && (l_Idx_Id >= 0))
						{
							// 是否匹配要保留的正则表达式？未匹配表示允许压缩
							bool l_Mch = a_Cprsr.c_RunCfg.c_PsrvLfn.Match(c_Name).Success;

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
					tLex.tTmnl l_ByWhich = tLex.tTmnl.ui_None;	// 由const/let/var引发的？这里的初始值不要紧！
					int l_Idx = l_Idx_ScpBgn + 1;		// 从左花或左圆的下一个位置开始
					while (l_Idx < l_Idx_ScpEnd)		// 到右花或右圆为止
					{
						a_Fctn.eGthLocVars(a_TknList, l_Idx_ScpBgn + 1, l_Idx_ScpEnd, ref l_Idx, ref l_GthLocVar, ref l_ByWhich, this);
					} // while

					// 当尚未禁用压缩局部变量和函数名时，搜索“eval”和“new Function”，若存在则禁用
					if (c_CprsLocFctnName)
					{
						for (int i = l_Idx_ScpBgn; i <= l_Idx_ScpEnd; ++i)
						{
							if ((tLex.tTmnl.i_Id == a_TknList[i].c_Tmnl) &&
								(
									("eval" == a_TknList[i].c_Attr.ToString()) ||
									(
										("Function" == a_TknList[i].c_Attr.ToString()) &&
										(i > 0) && (tLex.tTmnl.i_new == a_TknList[i - 1].c_Tmnl)
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

			//-------- 数据

			private tCprsr e_Cprsr;
			private tLex e_Lex;
			private List<teScp> e_ScpList;
			private List<string> e_TopIdNames;

			/// <summary>
			/// 构造
			/// </summary>
			public tFctn()
			{

			}

			/// <summary>
			/// 分析并压缩函数
			/// </summary>
			public void cAnlzAndCprsFctn(tLex a_Lex, ref List<tLex.tTkn> a_TknList)
			{
				// 记录
				e_Lex = a_Lex;
				e_Cprsr = a_Lex.e_Cprsr;

				// 复位一些字段
				e_TopIdNames = new List<string>();
				e_ScpList = new List<teScp>();

				// 收集顶级函数及顶级标识符名称
				bool l_GthLocVar = false;						// 正在收集局部变量？这里的初始值重要！
				tLex.tTmnl l_ByWhich = tLex.tTmnl.ui_None;	// 由const/let/var引发的？这里的初始值不要紧！
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

				// 可能会有tTkn.ui_None，移除它们
				a_TknList.RemoveAll((a_Tkn) => { return (tLex.tTkn.ui_None == a_Tkn); });
			}

			private void eCprs(List<tLex.tTkn> a_TknList, teScp a_Scp)
			{
				// 构建替换名
				eBldSbstName(a_TknList, a_Scp);

				// 替换局部变量名
				eSbstLocName(a_TknList, a_Scp);

				// 如果需要压缩属性访问
				if (e_Cprsr.c_RunCfg.c_PptyAcs)
				{
					eCprsPptyAcs(a_TknList, a_Scp);
				}
			}

			private void eBldSbstName(List<tLex.tTkn> a_TknList, teScp a_Scp)
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
					} while ((e_TopIdNames.IndexOf(l_NewName) >= 0) || 
						(!a_Scp.cAcpNewName(d, l_NewName, this.e_Cprsr.c_RunCfg.c_PsrvPal, out l_Used)));

					// 若使用了新名称，则更新编号
					if (l_Used)
					{
						a_Scp.c_SbstNameNum = l_SbstNameNum;
						//	Console.WriteLine(l_SbstNameNum);
					}
				}

				// 如果需要压缩属性访问
				if (e_Cprsr.c_RunCfg.c_PptyAcs)
				{
				//	if ("tReg0" == a_Scp.c_Name) //【DEBUG】
				////	if ("apply" == l_Keys[i])
				//	{
				//		int z = 0;
				//	}

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
							//【警告】必须保证该名称尚未使用

							var l_VarScp = a_Scp.cGetScpForLocDfnByVar(); // 用这个作用域的编号，因为要放到那里
							int l_SbstNameNum = Math.Max(a_Scp.c_SbstNameNum, l_VarScp.c_SbstNameNum); // 取更大的
							do
							{
								l_NewName = eGnrtSbstName(ref l_SbstNameNum);
							} while ((e_TopIdNames.IndexOf(l_NewName) >= 0) || (a_Scp.cIsNameUsed(-1, l_NewName)));

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
					//【没有必要继续计数，复位到0即可。】
					a_Scp.c_SubScps[s].c_SbstNameNum = 0;
				//	a_Scp.c_SubScps[s].c_SbstNameNum = a_Scp.c_SbstNameNum;
					eBldSbstName(a_TknList, a_Scp.c_SubScps[s]);
				}
			}

			private string eGnrtSbstName(ref int a_SbstNameNum)
			{
				string l_Rst;

				// 序列号生成？
				if ("字母汉字" == e_Cprsr.c_RunCfg.c_SbstNameGnrt)
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
					l_Rst = e_Cprsr.c_RunCfg.c_SnPfx + a_SbstNameNum;
					++a_SbstNameNum;
				}

				return l_Rst;
			}

			private void eSbstLocName(List<tLex.tTkn> a_TknList, teScp a_Scp)
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
					eSbstLocName(a_TknList, a_Scp.c_SubScps[s]);
				}
			}

			private void eCprsPptyAcs(List<tLex.tTkn> a_TknList, teScp a_Scp)
			{
				// 如果有属性访问，定义属性变量，成功时处理该作用域
				if ((a_Scp.c_PptyAcsTab.Count > 0) && eDfnPptyVar(a_TknList, a_Scp))
				{
					// 压缩每一个属性访问
					for (int a = 0; a < a_Scp.c_PptyAcsTab.Count; ++a)
					{
						// 跳过只访问一次的属性
						if (1 == a_Scp.c_PptyAcsTab[a].Count)
						{
							continue;
						}

						for (int t = 0; t < a_Scp.c_PptyAcsTab[a].Count; ++t)
						{
							ePptyAcsBrkt(a_TknList, a_Scp, a_Scp.c_PptyAcsTab[a][t]);
						}	
					}
				}

				// 递归
				for (int s = 0; s < a_Scp.c_SubScps.Count; ++s)
				{
					eCprsPptyAcs(a_TknList, a_Scp.c_SubScps[s]);
				}
			}

			private bool eDfnPptyVar(List<tLex.tTkn> a_TknList, teScp a_Scp)
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
						if ((i == l_Keys.Length - 1) && (l_VarIdx >= 0) && (tLex.tTmnl.i_Cma == a_TknList[l_VarIdx].c_Tmnl))
						{
							a_TknList[l_VarIdx].c_Tmnl = tLex.tTmnl.i_Smcln;
							a_TknList[l_VarIdx].c_Attr = ";";
						}
						continue;
					}

					// 如果需要，在变量定义作用域开头插入“var”
					if (l_ScpBgn < 0)
					{
						l_ScpBgn = a_TknList.IndexOf(l_VarScp.c_Tkn_Bgn);
						l_VarIdx = l_ScpBgn;
						a_TknList.Insert(++l_VarIdx, new tLex.tTkn(tLex.tTmnl.i_var, "var", -1));	// 行号设为无效值-1
					}

					// 定义并赋予初始值
					var l_Key = l_Keys[i];
					a_TknList.Insert(++l_VarIdx, new tLex.tTkn(tLex.tTmnl.i_Id, l_Map[l_Key], -1));
					a_TknList.Insert(++l_VarIdx, new tLex.tTkn(tLex.tTmnl.i_Asn, "=", -1));
					a_TknList.Insert(++l_VarIdx, new tLex.tTkn(tLex.tTmnl.i_StrLtrl, '"' + l_Key + '"', -1));

					// 继续（,）或完结（;）
					var l_Tmnl = (i < l_Keys.Length - 1) ? tLex.tTmnl.i_Cma : tLex.tTmnl.i_Smcln;
					var l_Attr = (i < l_Keys.Length - 1) ? "," : ";";
					a_TknList.Insert(++l_VarIdx, new tLex.tTkn(l_Tmnl, l_Attr, -1));
				}

				return true;
			}

			private void ePptyAcsBrkt(List<tLex.tTkn> a_TknList, teScp a_Scp, tLex.tTkn a_PptyNameTkn)
			{
				// 如果未录入映射，立即返回
				if (! a_Scp.c_PptyNameMap.ContainsKey(a_PptyNameTkn.c_Attr.ToString()))
				{
					return;
				}

				// 前一个词法单元一定是“.”，改成“[”
				int l_Idx = a_TknList.IndexOf(a_PptyNameTkn);
				a_TknList[l_Idx - 1].c_Tmnl = tLex.tTmnl.i_LBrkt;
				a_TknList[l_Idx - 1].c_Attr = "[";
				a_TknList[l_Idx - 1].c_Row = -1;

				// 名称替换成局部变量名
				a_TknList[l_Idx].c_Tmnl = tLex.tTmnl.i_Id;
				a_TknList[l_Idx].c_Attr = a_Scp.c_PptyNameMap[a_PptyNameTkn.c_Attr.ToString()];
				a_TknList[l_Idx].c_Row = -1;

				// 后面插入一个“]”
				a_TknList.Insert(l_Idx + 1, new tLex.tTkn(tLex.tTmnl.i_RBrkt, "]", -1));
			}

			private teIdNameMap eMchLocName(List<tLex.tTkn> a_TknList, teScp a_Scp, string a_Name)
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

			private void eChgVarToCma(List<tLex.tTkn> a_TknList, int a_Idx = -1) // 把var改成逗号
			{
				if (a_Idx < 0)
				{
					a_Idx = a_TknList.Count - 1;	// 默认最后一个
				}

				if ((tLex.tTmnl.i_var != a_TknList[a_Idx].c_Tmnl) &&
					(tLex.tTmnl.i_let != a_TknList[a_Idx].c_Tmnl) &&
					(tLex.tTmnl.i_const != a_TknList[a_Idx].c_Tmnl))
				{
					throw new InvalidOperationException("不是“var、let、const”，不能换成逗号！");
				}

				var l_OldAttrStr = a_TknList[a_Idx].c_Attr.ToString();
				var l_Row = a_TknList[a_Idx].c_Row;
				a_TknList[a_Idx].c_Tmnl = tLex.tTmnl.i_Cma;
				a_TknList[a_Idx].c_Attr = ",";

				e_Lex.e_RptBfr.AppendLine("行(" + l_Row + ")：“" + l_OldAttrStr
									+ "”被替换成逗号，前面的分号或换行被移除！");
			}

			private void eGthLocVars(List<tLex.tTkn> a_TknList, int a_Bgn, int a_Lmt,
										ref int a_Idx, ref bool a_GthLocVar, ref tLex.tTmnl a_ByWhich, teScp a_Scp)
			{
				// a_ByWhich：0=const，1=let，2=var

				// function，catch，for，左花
				if ((tLex.tTmnl.i_function == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_catch == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_for == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_LBrc == a_TknList[a_Idx].c_Tmnl))
				{
					if (null == a_Scp) // 顶级作用域？
					{
						// 新建作用域，并递归构建
						teScp l_TopScp = new teScp(null);	// 顶级
						l_TopScp.cRcurBld(e_Cprsr, this, a_TknList, ref a_Idx);
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
						l_SubScp.cRcurBld(e_Cprsr, this, a_TknList, ref a_Idx);
						a_Scp.c_SubScps.Add(l_SubScp);
					}
				}
				else // 收集局部变量开始，遇到“var let”时……
				if ((tLex.tTmnl.i_var == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_let == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_const == a_TknList[a_Idx].c_Tmnl))
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
						a_Scp.cAddLocDfns(new teIdNameMap(a_TknList[a_Idx].c_Attr.ToString()), (tLex.tTmnl.i_var == a_ByWhich), e_TopIdNames);
						a_Scp.cAddLocRefs(a_TknList[a_Idx]);
					}

					++a_Idx;	// 下一个
				}
				else // 收集局部变量继续，遇到逗号时……
				if (a_GthLocVar &&
					(tLex.tTmnl.i_Cma == a_TknList[a_Idx].c_Tmnl))
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
						a_Scp.cAddLocDfns(new teIdNameMap(a_TknList[a_Idx].c_Attr.ToString()), (tLex.tTmnl.i_var == a_ByWhich), e_TopIdNames);
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
					((tLex.tTmnl.i_Smcln == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_RBrc == a_TknList[a_Idx].c_Tmnl) ||
					(tLex.tTmnl.i_NewLine == a_TknList[a_Idx].c_Tmnl)))	// 理论上，换行依然可能存在
				{
					// 如果是分号或者换行，且下一个词法单元还是“const/let/var”
					// 将其替换成逗号，继续收集
					if ((a_Idx + 1 < a_Lmt)
						&&
						((tLex.tTmnl.i_Smcln == a_TknList[a_Idx].c_Tmnl) ||
						(tLex.tTmnl.i_NewLine == a_TknList[a_Idx].c_Tmnl))
						&&
						(a_ByWhich == a_TknList[a_Idx + 1].c_Tmnl))
					{
						// 为使下一次迭代时将会遇到逗号，修改下一个词法单元，而把当前词法单元设为ui_None
						a_TknList[a_Idx] = tLex.tTkn.ui_None;
						eChgVarToCma(a_TknList, a_Idx + 1);
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
						// 不作压缩处理
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
		}
	}
	
}
