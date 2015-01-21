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
	/// <summary>
	/// 文件集记录
	/// </summary>
	public class tFileSetRcd
	{
		/// <summary>
		/// 来源记录
		/// </summary>
		public class tSrcRcd
		{
			public tRunCfg.tFileSet.tSrc c_Src; // 来源
			public bool c_IsWseDiry;	// WSE目录？
			public double c_TotLen; // 总长度

			// 以下几个列表都是对每个文件使用一个元素
			public List<string> c_PathList; // 路径列表
			public List<List<string>> c_DpdcTab; // 依赖表
			public List<string> c_DftLibDiryList; // 默认库目录列表
			public List<int> c_LenList; // 长度列表
			public List<StringBuilder> c_OptBfrList; // 输出缓冲列表
			public List<StringBuilder> c_RptBfrList; // 报告缓冲列表
			public List<int> c_SortIdx; // 排序索引

			/// <summary>
			/// 构造
			/// </summary>
			public tSrcRcd(tRunCfg.tFileSet.tSrc a_Src)
			{
				this.c_Src = a_Src;
				this.c_TotLen = 0;
				var l_Diry = a_Src.c_IptDiry;
				this.c_IsWseDiry =
					((l_Diry.Length - 6 >= 0) && l_Diry.ToLower().IndexOf("/nwse/") == l_Diry.Length - 6) ||
					((l_Diry.Length - 5 >= 0) && l_Diry.ToLower().IndexOf("/nwse") == l_Diry.Length - 5);

				this.c_PathList = new List<string>();
				this.c_DpdcTab = new List<List<string>>();
				this.c_DftLibDiryList = new List<string>();
				this.c_LenList = new List<int>();
				this.c_OptBfrList = new List<StringBuilder>();
				this.c_RptBfrList = new List<StringBuilder>();
				this.c_SortIdx = new List<int>();
			}
		}

		public tRunCfg.tFileSet c_FileSet; // 文件集
		public List<tSrcRcd> c_SrcRcdList;	// 来源记录列表
		public int c_Which;		// 那种？2=.js，3=.css

		public string c_PrmrOptDiry;	// 主输出目录
		public StringBuilder c_TotOptBfr; // 总输出缓冲
		public StringBuilder c_TotRptBfr; // 总报告缓冲

		/// <summary>
		/// 构造
		/// </summary>
		public tFileSetRcd(tRunCfg.tFileSet a_FileSet, int a_Which)
		{
			this.c_FileSet = a_FileSet;
			this.c_SrcRcdList = new List<tSrcRcd>();
			this.c_Which = a_Which;

			this.c_TotOptBfr = new StringBuilder();
			this.c_TotRptBfr = new StringBuilder();
		}
	}

	/// <summary>
	/// 压缩器
	/// </summary>
	class tCprsr
	{
		public tRunCfg c_RunCfg; // 运行配置

		private List<tFileSetRcd> e_JsFsrList;
		private List<tFileSetRcd> e_CssFsrList;

		/// <summary>
		/// 构造
		/// </summary>
		public tCprsr()
		{
			this.e_JsFsrList = new List<tFileSetRcd>();
			this.e_CssFsrList = new List<tFileSetRcd>();
		}

		/// <summary>
		/// 运行
		/// </summary>
		/// <param name="a_Cfg">配置</param>
		public void cRun(tRunCfg a_Cfg)
		{
			// 预备
			this.c_RunCfg = a_Cfg; // 记录配置

			// 列举来源文件名
			this.eEnumSrcFlnms(this.c_RunCfg.c_JsList, 2);
			this.eEnumSrcFlnms(this.c_RunCfg.c_CssList, 3);

			// 分析并压缩全部
			this.eAnlzAndCprsAll(this.e_JsFsrList, 2);
			this.eAnlzAndCprsAll(this.e_CssFsrList, 3);
		}

		private void eEnumSrcFlnms(List<tRunCfg.tFileSet> a_FSL, int a_Which)
		{
			var l_Which = a_Which;
			var l_FsrList = (2 == l_Which) ? this.e_JsFsrList : this.e_CssFsrList;

			// 对每一个文件集
			for (int fs = 0; fs < a_FSL.Count; ++fs)
			{
				// 生成文件集记录
				tFileSetRcd l_Fsr = new tFileSetRcd(a_FSL[fs], l_Which);

				// 对每一个来源
				var l_Sl = l_Fsr.c_FileSet.c_SrcList;
				for (int s = 0; s < l_Sl.Count; ++s)
				{
					// 生成来源记录，并列举目录所含文件，不空时录入
					var l_Sr = new tFileSetRcd.tSrcRcd(l_Sl[s]);
					if (l_Sr.c_Src.c_IptPathList.Count > 0) // 已经显示指定，不用列举
					{
						l_Sr.c_PathList = l_Sr.c_Src.c_IptPathList;
					}
					else
					{
						this.eEnumFiles(l_Sr.c_PathList, l_Sr.c_Src.c_IptDiry, l_Which);
					}
					
					if (l_Sr.c_PathList.Count > 0)
					{
						l_Fsr.c_SrcRcdList.Add(l_Sr);
					}
				}

				// 如果需要，创建输出目录
				for (int o=0; o<l_Fsr.c_FileSet.c_OptPathList.Count; ++o)
				{
					var l_OptPath = l_Fsr.c_FileSet.c_OptPathList[o];
					var l_OptDiry = Path.GetDirectoryName(l_OptPath);
					if (!Directory.Exists(l_OptDiry))
					{
						Directory.CreateDirectory(l_OptDiry);
					}

					if (0 == o)
					{
						l_Fsr.c_PrmrOptDiry = this.eEnsrDiry(ref l_OptDiry);
					}			
				}				

				// 加入列表
				// 注意，无论l_Fsr.c_SrcRcdList是否为空都要加入，因为必须产生输出文件，哪怕是空文件！
				l_FsrList.Add(l_Fsr);
			}
		}

		private string eEnsrDiry(ref string a_Diry)
		{
			var l_LastCha = a_Diry[a_Diry.Length - 1];
			if (('/' != l_LastCha) && ('\\' != l_LastCha))
			{
				a_Diry += '/';
			}
			return a_Diry;
		}

		private string eNmlzPath(ref string a_Path, bool a_Diry, bool a_ToLower = true)
		{
			a_Path = Path.GetFullPath(a_Path).Replace('\\', '/');
			if (a_ToLower)
			{
				a_Path = a_Path.ToLower();
			}

			if (a_Diry)
			{
				var l_LastCha = a_Path[a_Path.Length - 1];
				if (('/' != l_LastCha))// && ('\\' != l_LastCha))
				{
					a_Path += '/';
				}
			}
			return a_Path;
		}

		private void eEnumFiles(List<string> a_PathList, string a_Diry, int a_Which)
		{
			var l_AllFiles = Directory.EnumerateFiles(a_Diry);
			var l_Rst = l_AllFiles.ToArray();
			for (int i = 0; i < l_Rst.Length; ++i)
			{
				var l_Path = l_Rst[i].ToLower(); // 比较时统一用小写，但录入时恢复原始大小写
				if (2 == a_Which)
				{
					if ((l_Path.Length > 3) &&
						('.' == l_Path[l_Path.Length - 3]) &&
						('j' == l_Path[l_Path.Length - 2]) &&
						('s' == l_Path[l_Path.Length - 1]))
					{
						l_Path = l_Rst[i];
						l_Rst[i] = (eNmlzPath(ref l_Path, false, false));
					}
				}
				else
				{
					if ((l_Path.Length > 4) &&
						('.' == l_Path[l_Path.Length - 4]) &&
						('c' == l_Path[l_Path.Length - 3]) &&
						('s' == l_Path[l_Path.Length - 2]) &&
						('s' == l_Path[l_Path.Length - 1]))
					{
						l_Path = l_Rst[i];
						l_Rst[i] = (eNmlzPath(ref l_Path, false, false));
					}
				}
			}

			Array.Sort(l_Rst);
			a_PathList.AddRange(l_Rst);
		}

		private void eAnlzAndCprsAll(List<tFileSetRcd> a_FsrList, int a_Which)
		{
			var l_Which = a_Which;
			var l_FsrList = a_FsrList;

			// 对每一个文件集
			for (int fs = 0; fs < l_FsrList.Count; ++fs)
			{
				// 处理文件集
				this.eAnlzAndCprs_FileSet(l_FsrList, fs, a_Which);
			}

			Console.WriteLine("---------------------------------------------");
		}

		private void eAnlzAndCprs_FileSet(List<tFileSetRcd> a_FsrList, int a_Idx, int a_Which)
		{
			tFileSetRcd l_Fsr = a_FsrList[a_Idx];
			Console.WriteLine("正在处理合集：" + l_Fsr.c_FileSet.c_OptPathList[0]);	// 采用主路径

			// 对每一个来源
			var l_Srl = l_Fsr.c_SrcRcdList;
			for (int s = 0; s < l_Srl.Count; ++s)
			{
				// 处理路径列表
				this.eAnlzAndCprs_PathList(l_Srl[s], a_Which);
			}

			// 写入到文件里
			bool l_CtanWseDiry = false;
			for (int s = 0; s < l_Srl.Count; ++s)
			{
				// 注意，WSE目录需要特殊处理(0)Seed.js
				if (! l_CtanWseDiry)
				{
					if (l_Srl[s].c_IsWseDiry)
					{
						l_CtanWseDiry = true;

						// 信息
					//	Console.WriteLine("\t\t已处理：(0)Seed.js"); // 已转移
					}
				}

				// 如果解析依赖，写入预载入
				// 注意同一目录下各个文件使用的默认库目录应该是一致的，所以只使用首个文件的，索引为l_Srl[s].c_SortIdx[0]
				// 但要小心(0)Seed.js文件没有调用stAsynIcld的任何函数（该静态类就是在这个文件里定义的），故使用“nWse”。
				if ((2 == a_Which) && l_Srl[s].c_Src.c_PseDpdc)
				{
					l_Fsr.c_TotOptBfr.Append("(function(){var i_InNodeJs=(\"undefined\"==typeof self);var l_Glb=i_InNodeJs?global:self;");
					l_Fsr.c_TotOptBfr.Append("l_Glb.nWse.stAsynIcld.cPreLoad(\"" 
						+ (l_Srl[s].c_IsWseDiry ? "nWse" : l_Srl[s].c_DftLibDiryList[l_Srl[s].c_SortIdx[0]]) 
						+ "\", [");
					for (int p = 0; p < l_Srl[s].c_PathList.Count; ++p)
					{
						l_Fsr.c_TotOptBfr.Append("\"" + Path.GetFileName(l_Srl[s].c_PathList[p]) + "\"");
						if (p < l_Srl[s].c_PathList.Count - 1)
						{
							l_Fsr.c_TotOptBfr.Append(',');
						}
					}
					l_Fsr.c_TotOptBfr.Append("]);})();");
				}

				// 对每个输出缓冲
				for (int o = (l_Srl[s].c_IsWseDiry ? 1 : 0); o < l_Srl[s].c_OptBfrList.Count; ++o)
				{
					l_Fsr.c_TotOptBfr.Append(l_Srl[s].c_OptBfrList[l_Srl[s].c_SortIdx[o]].ToString());

					if (this.c_RunCfg.c_OptRpt)
					{
						l_Fsr.c_TotRptBfr.Append(l_Srl[s].c_RptBfrList[l_Srl[s].c_SortIdx[o]].ToString());
					}

					// 信息，移至压缩时，那里还没有排过序
				//	Console.WriteLine("\t\t已处理：" + Path.GetFileName(l_Srl[s].c_PathList[l_Srl[s].c_SortIdx[o]]));
				}
			}

			if (l_CtanWseDiry)
			{
				File.WriteAllText(l_Fsr.c_PrmrOptDiry + "(0)Seed.js", l_Srl[0].c_OptBfrList[0].ToString(), Encoding.UTF8);
			}

			for (int o=0; o<l_Fsr.c_FileSet.c_OptPathList.Count; ++o)
			{
				var l_OptPath = l_Fsr.c_FileSet.c_OptPathList[o];
				File.WriteAllText(l_OptPath, l_Fsr.c_TotOptBfr.ToString(), Encoding.UTF8);

				if ((0 == o) && (this.c_RunCfg.c_OptRpt)) // 报告
				{
					var l_RptPath = ((2 == a_Which) 
						? l_OptPath.Substring(0, l_OptPath.Length - 3)
						: l_OptPath.Substring(0, l_OptPath.Length - 4)) + "_压缩报告.txt";
					File.WriteAllText(l_RptPath, l_Fsr.c_TotRptBfr.ToString(), Encoding.UTF8);
				}
			}

			Console.WriteLine();
		}

		private void eAnlzAndCprs_PathList(tFileSetRcd.tSrcRcd a_SrcRcd, int a_Which)
		{
			Console.WriteLine("\t正在处理目录：" + a_SrcRcd.c_Src.c_IptDiry);

			// 对每一个文件名
			for (int n = 0; n < a_SrcRcd.c_PathList.Count; ++n)
			{
				// 处理文件
				this.eAnlzAndCprs_File(a_SrcRcd, n, a_Which);
			}

			// 排序输出
			this.eSortOpt(a_SrcRcd);
		}

		private void eAnlzAndCprs_File(tFileSetRcd.tSrcRcd a_SrcRcd, int a_Idx, int a_Which)
		{
			string l_Path = a_SrcRcd.c_PathList[a_Idx];
			string l_Flnm = Path.GetFileName(l_Path);

			// 信息
			Console.WriteLine("\t\t正在处理文件：" + l_Flnm);

			// 词法分析
			tLex l_Lex = new tLex();
			try
			{
				// 建立相关列表元素
				a_SrcRcd.c_DpdcTab.Add(new List<string>());
				a_SrcRcd.c_DftLibDiryList.Add("");
				a_SrcRcd.c_LenList.Add(0);
				a_SrcRcd.c_OptBfrList.Add(new StringBuilder());
				a_SrcRcd.c_RptBfrList.Add(new StringBuilder());

				// 词法分析
				l_Lex.cAnlzAndCprsFile(this, a_SrcRcd, a_Idx, a_Which);
			}
			catch (Exception a_Exc)
			{
				int l_Row = l_Lex.cGetRow();	// 帮助定位数组越界
				Console.WriteLine("【文件】" + l_Flnm + " (" + l_Row + ")\n" + "【异常】" + a_Exc.Message);
				throw; // 继续抛出
			}
		}

		private void eSortOpt(tFileSetRcd.tSrcRcd a_SrcRcd)
		{
			//【说明】这里的排序算法使得每个文件都将其依赖的全部文件插入到自己的前面

			// 临时数组
			List<string> l_Temp = new List<string>();
	
			// 对每个文件
			for (int p = 0; p < a_SrcRcd.c_PathList.Count; ++p)
			{
				// 若还未录入，装到最后
				// 注意依赖该文件的文件可能已把该文件装入到那个文件的前面
				int l_IdxInTemp = l_Temp.IndexOf(a_SrcRcd.c_PathList[p]);
				if (l_IdxInTemp < 0)
				{
					l_Temp.Add(a_SrcRcd.c_PathList[p]);
					l_IdxInTemp = l_Temp.Count - 1;
				}

				// 对依赖的每个文件
				var l_Dpdts = a_SrcRcd.c_DpdcTab[p];
				for (int d = 0; d < l_Dpdts.Count; ++d)
				{
					// 先找到在路径列表里的索引
					int l_DpdtIdx = eFindInSortIdxList(a_SrcRcd, l_Dpdts[d]); // 这个比较必须忽略大小写
					if (l_DpdtIdx < 0) // 未找到，说明是其他目录的，跳过
					{ continue; }

					var l_Lift = l_Temp.IndexOf(a_SrcRcd.c_PathList[l_DpdtIdx]);
					if (l_IdxInTemp < l_Lift) // 在当前文件后面，前提
					{		
						l_Temp.RemoveAt(l_Lift);
						l_Lift = -1;
					}

					if (l_Lift < 0) // 插入到自己的前面
					{
						l_Temp.Insert(l_IdxInTemp, a_SrcRcd.c_PathList[l_DpdtIdx]);
					}
				}
			}

			if (l_Temp.Count != a_SrcRcd.c_PathList.Count)
			{
				Console.WriteLine("依赖排序算法出错，数量不等！");
			}

			// 转换成索引
			for (int t=0; t<l_Temp.Count; ++t)
			{
				var l_Idx = a_SrcRcd.c_PathList.IndexOf(l_Temp[t]);
				if (l_Idx < 0)
				{
					Console.WriteLine("依赖排序算法出错，文件没录入？");
				}

				a_SrcRcd.c_SortIdx.Add(l_Idx);
			}
		}

		private int eFindInSortIdxList(tFileSetRcd.tSrcRcd a_SrcRcd, string a_Path)
		{
			for (int i = 0; i < a_SrcRcd.c_PathList.Count; ++i)
			{
				if (Path.GetFileName(a_SrcRcd.c_PathList[i]).Equals(a_Path, StringComparison.OrdinalIgnoreCase)) // 忽略大小写
				{
					return i;
				}
			}
			return -1;
		}
	}

	

	/// <summary>
	/// 词法分析
	/// </summary>
	partial class tLex
	{
		//-------- 类型

		/// <summary>
		/// 终结符
		/// </summary>
		public enum tTmnl
		{
			ui_Code = -2,		// 代码，【测试用】
			ui_None = -1,		// 无，【标记不存在的或无效的词法单元】

			i_NewLine,			// 换行

			i_PpcsDctv,			// 预处理指令，以“//#”开头【暂不支持】

			i_LineCmt,			// 行注释
			i_BlkCmt,			// 块注释

			// 标点运算符
			ui_PctuOpt_Bgn,

			ui_Pctu_Bgn = ui_PctuOpt_Bgn,	// 标点
			i_LBrc = ui_Pctu_Bgn,		// {
			i_RBrc,						// }
			i_LBrkt,					// [
			i_RBrkt,					// ]
			i_LPrth,					// (
			i_RPrth,					// )
			i_Dot,						// .
			i_Smcln,					// ;
			i_Cma,						// ,
			i_Qstn,						// ?
			i_Cln,						// :
			ui_Pctu_End = i_Cln,

			ui_Opt_Bgn,					// 运算符

			ui_PureUnrOpt_Bgn = ui_Opt_Bgn,				// 纯一元
			i_Inc = ui_PureUnrOpt_Bgn,	// ++
			i_Dec,						// --
			i_Not,						// !
			i_Ngt,						// ~
			ui_PureUnrOpt_End = i_Ngt,

			ui_PureBnrOpt_Bgn,			// 纯二元
			i_Lt = ui_PureBnrOpt_Bgn,	// <
			i_Gt,						// >
			i_Le,						// <=
			i_Ge,						// >=
			i_Eq,						// ==
			i_Ne,						// !=
			i_Seq,						// ===
			i_Sne,						// !==	
			i_Mul,						// *
			i_Div,						// /
			i_Mod,						// %	
			i_Lshf,						// <<
			i_Rshf,						// >>
			i_UsnRshf,					// >>>
			i_BtwsAnd,					// &
			i_BtwsOr,					// |
			i_BtwsXor,					// ^	
			i_And,						// &&
			i_Or,						// ||
			i_Asn,						// =
			i_AddAsn,					// +=
			i_SubAsn,					// -=
			i_MulAsn,					// *=
			i_DivAsn,					// /=
			i_ModAsn,					// %=
			i_LshfAsn,					// <<=
			i_RshfAsn,					// >>=
			i_UsnRshfAsn,				// >>>=
			i_BtwsAndAsn,				// &=
			i_BtwsOrAsn,				// |=
			i_BtwsXorAsn,				// ^=
			ui_PureBnrOpt_End = i_BtwsXorAsn,

			ui_SemiUnrBnrOpt_Bgn,			// 半一元二元
			i_Add = ui_SemiUnrBnrOpt_Bgn,	// +
			i_Sub,							// -
			ui_SemiUnrBnrOpt_End = i_Sub,

			ui_Opt_End = ui_SemiUnrBnrOpt_End,

			ui_PctuOpt_End = ui_Opt_End,

			// 字面值
			ui_Ltrl_Bgn,
			i_undefined = ui_Ltrl_Bgn,	// undefined
			i_null,						// null
			i_true,						// true
			i_false,					// false
			i_NumLtrl,					// 数字字面值
			i_StrLtrl,					// 字符串字面值
			i_RgxLtrl,					// 正则表达式字面值
			ui_Ltrl_End = i_RgxLtrl,

			// 关键字、将来保留字等
			ui_Krwd_Bgn,
			i_break = ui_Krwd_Bgn,
			i_do,
			i_instanceof,
			i_typeof,
			i_case,
			i_else,
			i_new,
			i_var,
			i_catch,
			i_finally,
			i_return,
			i_void,
			i_continue,
			i_for,
			i_switch,
			i_while,
			i_debugger,
			i_function,
			i_this,
			i_with,
			i_default,
			i_if,
			i_throw,
			i_delete,
			i_in,
			i_try,
			i_class,
			i_enum,
			i_extends,
			i_super,
			i_const,
			i_export,
			i_import,
			i_implements,
			i_let,
			i_private,
			i_public,
			i_yield,
			i_interface,
			i_package,
			i_protected,
			i_static,
			ui_Krwd_End = i_static,

			i_Id,				// 标识符
		};

		/* css3 media query 构造
		@media (min-width: 481px) and (max-width:768px) {
			body { }
		} 
		//*/

		/// <summary>
		/// 词法单元
		/// </summary>
		public class tTkn
		{
			public tTmnl c_Tmnl;	// 终结符
			public tTkn c_Ownr;		// 所属词法单元，仅用于左右花括号
			public object c_Attr;	// 特性
			public int c_Row;		// 行号
			public bool c_FlwByWhtSpc;	// 后跟空白？用于CSS

			public tTkn(tTmnl a_Tmnl, object a_Attr, int a_Row)
			{
				this.c_Tmnl = a_Tmnl;
				this.c_Ownr = null;
				this.c_Attr = a_Attr;
				this.c_Row = a_Row;
				this.c_FlwByWhtSpc = false;
			}

			public static tTkn ui_None = new tTkn(tTmnl.ui_None, null, -1);
		};

		//-------- 实用函数

		private static bool seIsInlnDoc(string a_Line)
		{
			return (a_Line.Length > 3) ? ('/' == a_Line[2]) : false;
		}

		private static bool seIsWhtSpc(char a_Cha)	// 是否为空白
		{
			return (' ' == a_Cha) || ('\t' == a_Cha);
		}

		private static bool seIsNewLine(char a_Cha)	// 是否为换行
		{
			return ('\r' == a_Cha) || ('\n' == a_Cha);
		}

		private static bool seIsHexDit(char a_Cha)	// 是否为十六进制数字
		{
			return (('0' <= a_Cha) && (a_Cha <= '9')) ||
					(('A' <= a_Cha) && (a_Cha <= 'F')) ||
					(('a' <= a_Cha) && (a_Cha <= 'f'));
		}

		private static bool seIs汉字(char a_Cha)	// 是否为汉字
		{
			const int i_ChnChaBgn = 0x4E00;
			const int i_ChnChaEnd = 0x9FA5;
			return (i_ChnChaBgn <= (int)a_Cha) && ((int)a_Cha <= i_ChnChaEnd);
		}

		private static bool seIsLangSpclCha(char a_Cha, int a_Which) // 是否为语言特殊字符，即“_”“$”“-”“@”
		{
			if (('_' == a_Cha))
			{
				return true;
			}

			if (2 == a_Which)
			{
				return ('$' == a_Cha);
			}
			else
			{
				return ('@' == a_Cha) || ('-' == a_Cha);
			}
		}

		private static bool seIsIdFstCha(char a_Cha, int a_Which) // 是否为标识符首字符
		{
			// 字母、Unicode
			return seIsLangSpclCha(a_Cha, a_Which) || char.IsLetter(a_Cha) || ((int)a_Cha > 255);
		}

		private static bool seIsIdCha(char a_Cha, int a_Which) // 是否为标识符字符
		{
			// 字母、数字、Unicode
			return seIsLangSpclCha(a_Cha, a_Which) || char.IsLetterOrDigit(a_Cha) || ((int)a_Cha > 255);
		}

		private static bool seIsNonDivPctuOptCha(char a_Cha, int a_Which) // 是否为非除号标点字符
		{
			return (!seIsLangSpclCha(a_Cha, a_Which)) && (char.IsPunctuation(a_Cha) || char.IsSymbol(a_Cha));
		}

		private static tLex.tTmnl seMapId(string a_Id)	// 映射标识符
		{
			switch (a_Id)
			{
				case "undefined": { return tLex.tTmnl.i_undefined; }
				case "null": { return tLex.tTmnl.i_null; }
				case "true": { return tLex.tTmnl.i_true; }
				case "false": { return tLex.tTmnl.i_false; }

				case "break": { return tLex.tTmnl.i_break; }
				case "do": { return tLex.tTmnl.i_do; }
				case "instanceof": { return tLex.tTmnl.i_instanceof; }
				case "typeof": { return tLex.tTmnl.i_typeof; }
				case "case": { return tLex.tTmnl.i_case; }
				case "else": { return tLex.tTmnl.i_else; }
				case "new": { return tLex.tTmnl.i_new; }
				case "var": { return tLex.tTmnl.i_var; }
				case "catch": { return tLex.tTmnl.i_catch; }
				case "finally": { return tLex.tTmnl.i_finally; }
				case "return": { return tLex.tTmnl.i_return; }
				case "void": { return tLex.tTmnl.i_void; }
				case "continue": { return tLex.tTmnl.i_continue; }
				case "for": { return tLex.tTmnl.i_for; }
				case "switch": { return tLex.tTmnl.i_switch; }
				case "while": { return tLex.tTmnl.i_while; }
				case "debugger": { return tLex.tTmnl.i_debugger; }
				case "function": { return tLex.tTmnl.i_function; }
				case "this": { return tLex.tTmnl.i_this; }
				case "with": { return tLex.tTmnl.i_with; }
				case "default": { return tLex.tTmnl.i_default; }
				case "if": { return tLex.tTmnl.i_if; }
				case "throw": { return tLex.tTmnl.i_throw; }
				case "delete": { return tLex.tTmnl.i_delete; }
				case "in": { return tLex.tTmnl.i_in; }
				case "try": { return tLex.tTmnl.i_try; }

				case "class": { return tLex.tTmnl.i_class; }
				case "enum": { return tLex.tTmnl.i_enum; }
				case "extends": { return tLex.tTmnl.i_extends; }
				case "super": { return tLex.tTmnl.i_super; }
				case "const": { return tLex.tTmnl.i_const; }
				case "export": { return tLex.tTmnl.i_export; }
				case "import": { return tLex.tTmnl.i_import; }
				case "implements": { return tLex.tTmnl.i_implements; }
				case "let": { return tLex.tTmnl.i_let; }
				case "private": { return tLex.tTmnl.i_private; }
				case "public": { return tLex.tTmnl.i_public; }
				case "yield": { return tLex.tTmnl.i_yield; }
				case "interface": { return tLex.tTmnl.i_interface; }
				case "package": { return tLex.tTmnl.i_package; }
				case "protected": { return tLex.tTmnl.i_protected; }
				case "static": { return tLex.tTmnl.i_static; }
			}

			return tLex.tTmnl.i_Id;
		}

		private static bool seIsPctuOpt(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_PctuOpt_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_PctuOpt_End);
		}

		private static bool seIsOpenBbp(tLex.tTmnl a_Tmnl)	// 是否为开括号，即“{”“[”“(”
		{
			return (tLex.tTmnl.i_LBrc == a_Tmnl) || (tLex.tTmnl.i_LBrkt == a_Tmnl) || (tLex.tTmnl.i_LPrth == a_Tmnl);
		}

		private static bool seIsClsBbp(tLex.tTmnl a_Tmnl)	// 是否为闭括号，即“}”“]”“)”
		{
			return (tLex.tTmnl.i_RBrc == a_Tmnl) || (tLex.tTmnl.i_RBrkt == a_Tmnl) || (tLex.tTmnl.i_RPrth == a_Tmnl);
		}

		private static bool seIsBbp(tLex.tTmnl a_Tmnl)	// 是否为括号
		{
			return seIsOpenBbp(a_Tmnl) || seIsClsBbp(a_Tmnl);
		}

		private static bool seIsSmcln(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.i_Smcln == a_Tmnl);
		}

		private static bool seIsPctu(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_Pctu_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_Pctu_End);
		}

		private static bool seNotClsBbpPctu(tLex.tTmnl a_Tmnl) // 非三种右括号的标点
		{
			return seIsPctu(a_Tmnl) && (!seIsClsBbp(a_Tmnl));
		}

		private static bool seIsPureUnrOpt(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_PureUnrOpt_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_PureUnrOpt_End);
		}

		private static bool seIsPureBnrOpt(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_PureBnrOpt_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_PureBnrOpt_End);
		}

		private static bool seIsSemiUnrBnrOpt(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_SemiUnrBnrOpt_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_SemiUnrBnrOpt_End);
		}

		private static bool seIsLtrl(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_Ltrl_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_Ltrl_End);
		}

		private static bool seIsKrwd(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.ui_Krwd_Bgn <= a_Tmnl) && (a_Tmnl <= tLex.tTmnl.ui_Krwd_End);
		}

		private static bool seIsId(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.i_Id == a_Tmnl);
		}

		private static bool seIsKrwdOrId(tLex.tTmnl a_Tmnl)
		{
			return (tLex.tTmnl.i_Id == a_Tmnl) || seIsKrwd(a_Tmnl);
		}

		private static bool seIsLtrlOrId(tLex.tTmnl a_Tmnl)
		{
			return seIsLtrl(a_Tmnl) || seIsId(a_Tmnl);
		}

		private static bool seIsKrwdOrLtrlOrId(tLex.tTmnl a_Tmnl)
		{
			return seIsKrwd(a_Tmnl) || seIsLtrl(a_Tmnl) || seIsId(a_Tmnl);
		}

		private static bool seIsNextNewLineFree(tLex.tTmnl a_Tmnl) // 无需后跟换行的词法单元
		{
			// 右括号以外的标点，注意右括号后接换行可能导致自动分号插入
			// 二元运算符
			// 半一元二元运算符
			if (seNotClsBbpPctu(a_Tmnl) || seIsPureBnrOpt(a_Tmnl) || seIsSemiUnrBnrOpt(a_Tmnl))
			{
				return true;
			}

			// 一些关键字，但不是……
			if ((tLex.tTmnl.i_break == a_Tmnl) ||
				(tLex.tTmnl.i_continue == a_Tmnl) ||
				(tLex.tTmnl.i_return == a_Tmnl) ||
				(tLex.tTmnl.i_throw == a_Tmnl))
			{
				return false;
			}

			return seIsKrwd(a_Tmnl);
		}

		private static bool seIsPrevNewLineFree(tLex.tTmnl a_Tmnl) // 无需前附换行的词法单元
		{
			// 左花以外的标点，注意左花用作块语句起始符号时，前面的赋值语句可能没有以分号结尾
			// 二元运算符
			// 半一元二元运算符
			return ((tLex.tTmnl.i_LBrc != a_Tmnl) && seIsPctu(a_Tmnl)) ||
					seIsPureBnrOpt(a_Tmnl) ||
					seIsSemiUnrBnrOpt(a_Tmnl);
		}

		/// <summary>
		/// 找到配对括号
		/// </summary>
		private static Tuple<int, int> seFindPairBbp(List<tLex.tTkn> a_TknList, tLex.tTkn a_Bbp)
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
		private static bool seInBbp(List<tLex.tTkn> a_TknList, tLex.tTkn a_Bbp, tLex.tTkn a_Tkn)
		{
			int l_Idx = a_TknList.IndexOf(a_Tkn);
			var l_BbpIdxPair = seFindPairBbp(a_TknList, a_Bbp);
			if ((l_BbpIdxPair.Item1 >= 0) && (l_Idx < l_BbpIdxPair.Item1))
				return false;

			if ((l_BbpIdxPair.Item2 >= 0) && (l_Idx > l_BbpIdxPair.Item2))
				return false;

			return true;
		}

		private static int seFindNextSmclnOrNewLineOrClsBrc(List<tLex.tTkn> a_TknList, int a_Bgn)
		{
			for (int i = a_Bgn; i < a_TknList.Count; ++i)
			{
				if ((tLex.tTmnl.i_Smcln == a_TknList[i].c_Tmnl) ||
					(tLex.tTmnl.i_NewLine == a_TknList[i].c_Tmnl) ||
					(tLex.tTmnl.i_RBrc == a_TknList[i].c_Tmnl))
				{
					return i;
				}
			}
			return -1;
		}

		private static int seFindByAttr(List<tLex.tTkn> a_TknList, int a_Bgn, string a_Attr)
		{
			return a_TknList.FindIndex(a_Bgn, (a_Tkn) => { return a_Attr == a_Tkn.c_Attr.ToString(); });
		}

		private static bool seIsFctnDfn(List<tLex.tTkn> a_TknList, int a_Idx)
		{
			// 函数定义的前一个词法单元可以是“{ } ;”，且函数定义一定有函数名
			// 其余的认为是函数表达式

			if (a_Idx < 1) // 没有前一个时认为是
			{
				return true;
			}

			if ((tLex.tTmnl.i_LBrc == a_TknList[a_Idx - 1].c_Tmnl) ||
				(tLex.tTmnl.i_RBrc == a_TknList[a_Idx - 1].c_Tmnl) ||
				(tLex.tTmnl.i_Smcln == a_TknList[a_Idx - 1].c_Tmnl))
			{
				return (tLex.tTmnl.i_Id == a_TknList[a_Idx + 1].c_Tmnl);	// 下一个词法单元是标识符
			}

			return false;
		}

		private static void seSkipToRbbp(List<tLex.tTkn> a_TknList, ref int a_Idx)
		{
			var l_PairIdx = seFindPairBbp(a_TknList, a_TknList[a_Idx]);
			a_Idx = l_PairIdx.Item2;
		}

		private static bool seIsVarRef(List<tLex.tTkn> a_TknList, int a_Idx)
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
				((tLex.tTmnl.i_Dot == a_TknList[a_Idx - 1].c_Tmnl) ||
				(tLex.tTmnl.i_function == a_TknList[a_Idx - 1].c_Tmnl)))
			{
				return false;
			}

			if ((a_Idx - 1 >= 0) &&
				(tLex.tTmnl.i_Qstn != a_TknList[a_Idx - 1].c_Tmnl) &&
				(a_Idx + 1 < a_TknList.Count) &&
				(tLex.tTmnl.i_Cln == a_TknList[a_Idx + 1].c_Tmnl))
			{
				return false;
			}

			return true;
		}

		private static bool seIsPptyAcs(List<tLex.tTkn> a_TknList, int a_Idx)
		{
			// 前一个词法单元是“.”
			if ((a_Idx - 1 >= 0) &&
				((tLex.tTmnl.i_Dot == a_TknList[a_Idx - 1].c_Tmnl)))
			{
				return true;
			}

			return false;
		}
	}
}
