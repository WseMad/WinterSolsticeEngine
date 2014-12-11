using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using System.IO;


/// <summary>
/// 压缩器
/// </summary>
partial class tCprsr
{
	//-------- 类型

	public class tRunCfg
	{
		public class tIo
		{
			public string	c_IptDiry;				// 输入目录
			public string	c_OptFile;				// 输出文件
			public bool		c_PseDpdt;				// 解析依赖
			public bool		c_CmbnOnly;				// 只合并
		}
		public List<tIo>	c_IoList;		// IO列表

		//public List<string> c_IptDiryList;			// 输入目录列表
		//public List<string> c_OptFileList;			// 输出文件列表

		public List<KeyValuePair<string, string>> c_MacroList;			// 宏列表

		public bool	c_OptRpt;				// 输出报告
		public bool c_CprsEnab;				// 压缩启用
		public string c_CprsCmtMode;		// 压缩注释模式
		public bool c_CprsPrmAndLocName;	// 压缩形参和局部变量名
		public string c_SbstNameGnrt;		// 替换名生成
		public string c_SqncNumPfx;			// 序列号前缀
		public bool	c_CprsLocFctnName;		// 压缩局部函数名
		public bool	c_CprsPptyAcs;			// 压缩属性访问
		public Regex c_PsrvRgx;				// 保留正则表达式

		public tRunCfg()
		{
			c_IoList = new List<tIo>();

			c_MacroList = new List<KeyValuePair<string, string>>();

			c_CprsEnab = false;
			c_CprsCmtMode = "保留全部";
			c_CprsPrmAndLocName = false;
			c_SbstNameGnrt = "字母汉字";
			c_SqncNumPfx = "";
			c_CprsLocFctnName = false;
			c_CprsPptyAcs = false;
			c_PsrvRgx = null;
		}
	}


	//-------- 构造
	public tCprsr(tRunCfg a_Cfg)
	{
		e_RunCfg = a_Cfg;
		e_CmbndPaths = new List<string>();
		e_Lex = new teLex();
		e_Fctn = new teFctn();

		for (int i=0; i<e_RunCfg.c_IoList.Count; ++i)
		{
			var l_Path = e_RunCfg.c_IoList[i].c_IptDiry;
			seNmlzPath(ref l_Path, false, false);	// 保留原始大小写
			e_RunCfg.c_IoList[i].c_IptDiry = l_Path;

			l_Path = e_RunCfg.c_IoList[i].c_OptFile;
			seNmlzPath(ref l_Path, false, false);	// 保留原始大小写
			e_RunCfg.c_IoList[i].c_OptFile = l_Path;
		}
	}

	//-------- 接口

	public void cRun()
	{
		// 对每一个目录
		for (int i = 0; i < e_RunCfg.c_IoList.Count; ++i)
		{
			// 初始化输出和报告缓冲
			e_OptBfrList = new List<StringBuilder>();
			e_RptBfrList = new List<StringBuilder>();

			// 列举目标文件，取得对应的输出路径
			string l_IptDiry = e_RunCfg.c_IoList[i].c_IptDiry;
			e_TgtFiles = seEnumFiles(l_IptDiry);

			// WSE目录？
			bool l_WseDiry = 
				((l_IptDiry.Length - 5 >= 0) && l_IptDiry.ToLower().IndexOf("nwse/") == l_IptDiry.Length - 5) ||
				((l_IptDiry.Length - 4 >= 0) && l_IptDiry.ToLower().IndexOf("nwse") == l_IptDiry.Length - 4);

			// 如果需要，创建输出目录
			var l_OptPath = e_RunCfg.c_IoList[i].c_OptFile;
			var l_OptDiry = Path.GetDirectoryName(l_OptPath);
			if (! Directory.Exists(l_OptDiry))
			{
				Directory.CreateDirectory(l_OptDiry);
			}

			// 如果存在，删除输出文件
			if (File.Exists(l_OptPath))
			{
				File.Delete(l_OptPath);
			}

			// 总长度
			double l_TotLen = 0; // 该目录下所有文件的总字符数

			// 依赖列表
			e_DpdtList = new List<KeyValuePair<string,List<string>>>();
			string l_DftLibDiry = null;

			// 对每一个文件
			for (int j = 0; j < e_TgtFiles.Length; ++j)
			{
				// 跳过WSE的种子文件
				if (l_WseDiry && (e_TgtFiles[j].ToLower().IndexOf("seed.js") >= 0))
				{ continue; }

				e_OptBfrList.Add(new StringBuilder());
				e_RptBfrList.Add(new StringBuilder());
				
				try
				{
					// 词法分析
					List<string> l_DpdtFlnms = e_RunCfg.c_IoList[i].c_PseDpdt ? new List<string>() : null;	// 解析依赖？
					e_Lex.cRun(this, e_TgtFiles[j], e_RunCfg.c_IoList[i].c_CmbnOnly, ref l_DftLibDiry, l_DpdtFlnms, ref l_TotLen, 
						e_OptBfrList[e_OptBfrList.Count - 1], e_RptBfrList[e_RptBfrList.Count - 1]);

					e_DpdtList.Add(new KeyValuePair<string,List<string>>(Path.GetFileName(e_TgtFiles[j]), l_DpdtFlnms));
				}
				catch (Exception a_Exc)
				{
					int l_Row = e_Lex.cGetRow();	// 帮助定位数组越界
					Console.WriteLine("【文件】" + e_TgtFiles[j] + " (" + l_Row + ")\n" +
						"【异常】" + a_Exc.Message);
					return;
				}
			}

			// 排序输出
			eSortOpt(e_RunCfg.c_IoList[i].c_PseDpdt);

			// 汇总输出
			e_TotOptBfr = new StringBuilder();
			e_TotRptBfr = new StringBuilder();

			if (e_RunCfg.c_IoList[i].c_PseDpdt)
			{
				e_TotOptBfr.Append("(function(){var i_InNodeJs = (\"undefined\" == typeof self);var l_Glb = i_InNodeJs ? global : self;");
				e_TotOptBfr.Append("l_Glb.nWse.stAsynIcld.cPreLoad(\"" + l_DftLibDiry + "\", [");
				for (int s=0; s<e_SortOpt.Count; ++s)
				{
					e_TotOptBfr.Append("\"" + e_SortOpt[s].c_Flnm + "\"");
					if (s < e_SortOpt.Count - 1)
					{
						e_TotOptBfr.Append(',');
					}
				}
				e_TotOptBfr.Append("]);})();");
			}

			for (int s=0; s<e_SortOpt.Count; ++s)
			{
				e_TotOptBfr.Append(e_SortOpt[s].c_OptBfr);
				e_TotRptBfr.Append(e_SortOpt[s].c_RptBfr);
			}

			// 输出压缩合并后的文件和压缩报告
			File.WriteAllText(l_OptPath, e_TotOptBfr.ToString(), Encoding.UTF8);

			var l_RptPath = l_OptPath.Substring(0, l_OptPath.Length - 3) + "_压缩报告.txt";
			
			double l_Rat = (double)e_TotOptBfr.Length / l_TotLen;
			l_Rat = Math.Floor(l_Rat * 10000 + 0.5) / 100;

			e_TotRptBfr.AppendLine("【总压缩效果】：");
			e_TotRptBfr.AppendLine((long)l_TotLen + " → " + e_TotOptBfr.Length + "，比例 = " + l_Rat + "％");
			e_TotRptBfr.AppendLine();

			if (e_RunCfg.c_OptRpt)
			{
				File.WriteAllText(l_RptPath, e_TotRptBfr.ToString(), Encoding.UTF8);
			}
		} // 对每个目录
	}

	//-------- 函数

	private void eSortOpt(bool a_PseDpdt)
	{
		e_SortOpt = new List<tSortOpt>();

		// 先记录与输出缓冲的联系
		for (int d=0; d<e_DpdtList.Count; ++d)
		{
			var l_SO = new tSortOpt();
			l_SO.c_Flnm = e_DpdtList[d].Key;
			l_SO.c_Dpdts = e_DpdtList[d].Value;
			l_SO.c_OptBfr = e_OptBfrList[d];
			l_SO.c_RptBfr = e_RptBfrList[d];
			e_SortOpt.Add(l_SO);
		}

		if (! a_PseDpdt)
		{ return; }

		// 后排序
		List<tSortOpt> l_Temp = new List<tSortOpt>();
		for (int s=0; s<e_SortOpt.Count; ++s)
		{
			// 若还未录入
			if (l_Temp.IndexOf(e_SortOpt[s]) < 0)
			{
				l_Temp.Add(e_SortOpt[s]);
			}

			// 对依赖的每个文件，若还未加入l_Temp则加入到当前文件之前，否则前提
			var l_Dpdts = e_SortOpt[s].c_Dpdts;
			for (int d=0; d<l_Dpdts.Count; ++d)
			{
				int l_Idx = eFindInSortOpt(l_Dpdts[d]);
				if (l_Idx < 0) // 跳过其他目录的
				{ continue; }

				var l_Lift = l_Temp.IndexOf(e_SortOpt[l_Idx]);
				if (l_Temp.IndexOf(e_SortOpt[s]) < l_Lift)
				{
					l_Temp.RemoveAt(l_Lift);
				}
				else
				if (l_Lift < 0)
				{
					l_Temp.Insert(l_Temp.IndexOf(e_SortOpt[s]), e_SortOpt[l_Idx]);
				}
			}
		}

		e_SortOpt = l_Temp;	// OK
	//	var zzz=0;
	}

	private int	eFindInSortOpt(string a_Flnm)
	{
		for (int i=0; i<e_SortOpt.Count; ++i)
		{
			if (e_SortOpt[i].c_Flnm.Equals(a_Flnm, StringComparison.OrdinalIgnoreCase))
			{
				return i;
			}
		}
		return -1;
	}

	//-------- 数据

	private tRunCfg e_RunCfg;
	private string[] e_TgtFiles;
	private List<string> e_CmbndPaths;		// 已合并的文件路径
	private teLex e_Lex;					// 词法分析器
	private teFctn e_Fctn;					// 函数压缩器
	private List<StringBuilder>	e_OptBfrList;	// 输出缓冲列表
	private List<StringBuilder>	e_RptBfrList;	// 报告缓冲列表
	private StringBuilder e_TotOptBfr;		// 总输出缓冲
	private StringBuilder e_TotRptBfr;		// 总报告缓冲
	
	private class tSortOpt
	{
		public string			c_Flnm;
		public List<string>		c_Dpdts;
		public StringBuilder	c_OptBfr;
		public StringBuilder	c_RptBfr;
	}
	private List<KeyValuePair<string, List<string>>>	e_DpdtList;	// 依赖列表
	private List<tSortOpt>	e_SortOpt;	// 排序输出


	//-------- 静态函数

	private static string seNmlzPath(ref string a_Path, bool a_Diry, bool a_ToLower = true)
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

	private static string[] seEnumFiles(string a_Diry)
	{
		var l_FileSet = Directory.EnumerateFiles(a_Diry);
		var l_Rst = l_FileSet.ToArray();
		for (int i = 0; i < l_Rst.Length; ++i)
		{
			var l_Flnm = l_Rst[i];
			if ((l_Flnm.Length > 3) &&
				('.' == l_Flnm[l_Flnm.Length - 3]) && ('j' == l_Flnm[l_Flnm.Length - 2]) && ('s' == l_Flnm[l_Flnm.Length - 1]))
			{
				l_Rst[i] = (seNmlzPath(ref l_Flnm, false, false));
			}
		}

		Array.Sort(l_Rst);
		return l_Rst;
	}

	/// <summary>
	/// 是否为内联文档
	/// </summary>
	/// <param name="a_Line">行，假定前两个字符是“//”</param>
	/// <returns>是否</returns>
	private static bool seIsIlnDoc(string a_Line)
	{
		return (a_Line.Length > 3) ? ('/' == a_Line[2]) : false;
	}

	private static bool seIsWhiteSpc(char a_Cha)	// 是否为空白
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

	private static bool seIsIdFstCha(char a_Cha) // 是否为标识符首字符
	{
		// 下划线、$、字母、Unicode
		return ('_' == a_Cha) || ('$' == a_Cha) || char.IsLetter(a_Cha) || ((int)a_Cha > 255);
	}

	private static bool seIsIdCha(char a_Cha) // 是否为标识符字符
	{
		// 下划线、$、字母、数字、Unicode
		return ('_' == a_Cha) || ('$' == a_Cha) || char.IsLetterOrDigit(a_Cha) || ((int)a_Cha > 255);
	}

	private static bool seIsNonDivPctuOptCha(char a_Cha) // 是否为非除号标点字符
	{
		return ('_' != a_Cha) && ('$' != a_Cha) && (char.IsPunctuation(a_Cha) || char.IsSymbol(a_Cha));
	}

	private static teLex.tTmnl seMapId(string a_Id)	// 映射标识符
	{
		switch (a_Id)
		{
			case "undefined": { return teLex.tTmnl.i_undefined; }
			case "null": { return teLex.tTmnl.i_null; }
			case "true": { return teLex.tTmnl.i_true; }
			case "false": { return teLex.tTmnl.i_false; }

			case "break": { return teLex.tTmnl.i_break; }
			case "do": { return teLex.tTmnl.i_do; }
			case "instanceof": { return teLex.tTmnl.i_instanceof; }
			case "typeof": { return teLex.tTmnl.i_typeof; }
			case "case": { return teLex.tTmnl.i_case; }
			case "else": { return teLex.tTmnl.i_else; }
			case "new": { return teLex.tTmnl.i_new; }
			case "var": { return teLex.tTmnl.i_var; }
			case "catch": { return teLex.tTmnl.i_catch; }
			case "finally": { return teLex.tTmnl.i_finally; }
			case "return": { return teLex.tTmnl.i_return; }
			case "void": { return teLex.tTmnl.i_void; }
			case "continue": { return teLex.tTmnl.i_continue; }
			case "for": { return teLex.tTmnl.i_for; }
			case "switch": { return teLex.tTmnl.i_switch; }
			case "while": { return teLex.tTmnl.i_while; }
			case "debugger": { return teLex.tTmnl.i_debugger; }
			case "function": { return teLex.tTmnl.i_function; }
			case "this": { return teLex.tTmnl.i_this; }
			case "with": { return teLex.tTmnl.i_with; }
			case "default": { return teLex.tTmnl.i_default; }
			case "if": { return teLex.tTmnl.i_if; }
			case "throw": { return teLex.tTmnl.i_throw; }
			case "delete": { return teLex.tTmnl.i_delete; }
			case "in": { return teLex.tTmnl.i_in; }
			case "try": { return teLex.tTmnl.i_try; }

			case "class": { return teLex.tTmnl.i_class; }
			case "enum": { return teLex.tTmnl.i_enum; }
			case "extends": { return teLex.tTmnl.i_extends; }
			case "super": { return teLex.tTmnl.i_super; }
			case "const" : { return teLex.tTmnl.i_const; }
			case "export": { return teLex.tTmnl.i_export; }
			case "import": { return teLex.tTmnl.i_import; }
			case "implements": { return teLex.tTmnl.i_implements; }
			case "let": { return teLex.tTmnl.i_let; }
			case "private": { return teLex.tTmnl.i_private; }
			case "public": { return teLex.tTmnl.i_public; }
			case "yield" : { return teLex.tTmnl.i_yield; }
			case "interface": { return teLex.tTmnl.i_interface; }
			case "package" : { return teLex.tTmnl.i_package; }
			case "protected" : { return teLex.tTmnl.i_protected; }
			case "static": { return teLex.tTmnl.i_static; }
		}

		return teLex.tTmnl.i_Id;
	}

	private static bool seIsPctuOpt(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_PctuOpt_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_PctuOpt_End);
	}

	private static bool seIsOpenBbp(teLex.tTmnl a_Tmnl)	// 是否为开括号，即“{”“[”“(”
	{
		return (teLex.tTmnl.i_LBrc == a_Tmnl) || (teLex.tTmnl.i_LBrkt == a_Tmnl) || (teLex.tTmnl.i_LPrth == a_Tmnl);
	}

	private static bool seIsClsBbp(teLex.tTmnl a_Tmnl)	// 是否为闭括号，即“}”“]”“)”
	{
		return (teLex.tTmnl.i_RBrc == a_Tmnl) || (teLex.tTmnl.i_RBrkt == a_Tmnl) || (teLex.tTmnl.i_RPrth == a_Tmnl);
	}

	private static bool seIsBbp(teLex.tTmnl a_Tmnl)	// 是否为括号
	{
		return seIsOpenBbp(a_Tmnl) || seIsClsBbp(a_Tmnl);
	}

	private static bool seIsSmcln(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.i_Smcln == a_Tmnl);
	}

	private static bool seIsPctu(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_Pctu_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_Pctu_End);
	}

	private static bool seNotClsBbpPctu(teLex.tTmnl a_Tmnl) // 非三种右括号的标点
	{
		return seIsPctu(a_Tmnl) && (! seIsClsBbp(a_Tmnl));
	}

	private static bool seIsPureUnrOpt(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_PureUnrOpt_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_PureUnrOpt_End);
	}

	private static bool seIsPureBnrOpt(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_PureBnrOpt_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_PureBnrOpt_End);
	}

	private static bool seIsSemiUnrBnrOpt(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_SemiUnrBnrOpt_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_SemiUnrBnrOpt_End);
	}

	private static bool seIsLtrl(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_Ltrl_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_Ltrl_End);
	}

	private static bool seIsKrwd(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.ui_Krwd_Bgn <= a_Tmnl) && (a_Tmnl <= teLex.tTmnl.ui_Krwd_End);
	}

	private static bool seIsId(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.i_Id == a_Tmnl);
	}

	private static bool seIsKrwdOrId(teLex.tTmnl a_Tmnl)
	{
		return (teLex.tTmnl.i_Id == a_Tmnl) || seIsKrwd(a_Tmnl);
	}

	private static bool seIsLtrlOrId(teLex.tTmnl a_Tmnl)
	{
		return seIsLtrl(a_Tmnl) || seIsId(a_Tmnl);
	}

	private static bool seIsKrwdOrLtrlOrId(teLex.tTmnl a_Tmnl)
	{
		return seIsKrwd(a_Tmnl) || seIsLtrl(a_Tmnl) || seIsId(a_Tmnl);
	}

	private static bool seIsNextNewLineFree(teLex.tTmnl a_Tmnl) // 无需后跟换行的词法单元
	{
		// 右括号以外的标点，注意右括号后接换行可能导致自动分号插入
		// 二元运算符
		// 半一元二元运算符
		if (seNotClsBbpPctu(a_Tmnl) || seIsPureBnrOpt(a_Tmnl) || seIsSemiUnrBnrOpt(a_Tmnl))
		{
			return true;
		}

		// 一些关键字，但不是……
		if ((teLex.tTmnl.i_break == a_Tmnl) ||
			(teLex.tTmnl.i_continue == a_Tmnl) ||
			(teLex.tTmnl.i_return == a_Tmnl) ||
			(teLex.tTmnl.i_throw == a_Tmnl))
		{
			return false;
		}

		return seIsKrwd(a_Tmnl);
	}

	private static bool seIsPrevNewLineFree(teLex.tTmnl a_Tmnl) // 无需前附换行的词法单元
	{
		// 左花以外的标点，注意左花用作块语句起始符号时，前面的赋值语句可能没有以分号结尾
		// 二元运算符
		// 半一元二元运算符
		return	((teLex.tTmnl.i_LBrc != a_Tmnl) && seIsPctu(a_Tmnl)) ||
				seIsPureBnrOpt(a_Tmnl) ||
				seIsSemiUnrBnrOpt(a_Tmnl);
	}

	//-------- 词法分析器的另一部分，放在这里是为了平衡两个文件的大小

	private partial class teLex
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

			i_PpcsDctv,			// 预处理指令，以“//#”开头

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

		public class tTkn
		{
			public tTmnl	c_Tmnl;
			public tTkn		c_Ownr;		// 所属词法单元，仅用于左右花括号
			public object	c_Attr;
			public int		c_Row;

			public tTkn(tTmnl a_Tmnl, object a_Attr, int a_Row)
			{
				c_Tmnl = a_Tmnl;
				c_Ownr = null;
				c_Attr = a_Attr;
				c_Row = a_Row;
			}

			public static tTkn ui_None = new tTkn(tTmnl.ui_None, null, -1);
		};

	};
}

