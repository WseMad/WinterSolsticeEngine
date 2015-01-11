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
			public List<StringBuilder> c_SortOptBfrList; // 排序输出缓冲列表

			/// <summary>
			/// 构造
			/// </summary>
			public tSrcRcd(tRunCfg.tFileSet.tSrc a_Src)
			{
				this.c_Src = a_Src;
				this.c_TotLen = 0;
				var l_Diry = a_Src.c_IptDiry;
				this.c_IsWseDiry =
					((l_Diry.Length - 5 >= 0) && l_Diry.ToLower().IndexOf("nwse/") == l_Diry.Length - 5) ||
					((l_Diry.Length - 4 >= 0) && l_Diry.ToLower().IndexOf("nwse") == l_Diry.Length - 4);

				this.c_PathList = new List<string>();
				this.c_DpdcTab = new List<List<string>>();
				this.c_DftLibDiryList = new List<string>();
				this.c_LenList = new List<int>();
				this.c_OptBfrList = new List<StringBuilder>();
				this.c_RptBfrList = new List<StringBuilder>();
				this.c_SortOptBfrList = new List<StringBuilder>();
			}
		}

		public tRunCfg.tFileSet c_FileSet; // 文件集
		public List<tSrcRcd> c_SrcRcdList;	// 来源记录列表
		public int c_Which;		// 那种？2=.js，3=.css

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
			for (int fs=0; fs<a_FSL.Count; ++fs)
			{
				// 生成文件集记录
				tFileSetRcd l_Fsr = new tFileSetRcd(a_FSL[fs], l_Which);
				
				// 对每一个来源
				var l_Sl = l_Fsr.c_FileSet.c_SrcList;
				for (int s=0; s<l_Sl.Count; ++s)
				{
					// 生成来源记录，并列举目录所含文件，不空时录入
					var l_Sr = new tFileSetRcd.tSrcRcd(l_Sl[s]);
					this.eEnumFiles(l_Sr.c_PathList, l_Sr.c_Src.c_IptDiry, l_Which);
					if (l_Sr.c_PathList.Count > 0)
					{
						l_Fsr.c_SrcRcdList.Add(l_Sr);
					}
				}		

				// 如果需要，创建输出目录
				var l_OptPath = l_Fsr.c_FileSet.c_OptFile;
				var l_OptDiry = Path.GetDirectoryName(l_OptPath);
				if (! Directory.Exists(l_OptDiry))
				{
					Directory.CreateDirectory(l_OptDiry);
				}

				// 加入列表
				// 注意，无论l_Fsr.c_SrcRcdList是否为空都要加入，因为必须产生输出文件，哪怕是空文件！
				l_FsrList.Add(l_Fsr);
			}
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

		private void eEnumFiles(List<string> a_FlnmList, string a_Diry, int a_Which)
		{
			var l_AllFiles = Directory.EnumerateFiles(a_Diry);
			var l_Rst = l_AllFiles.ToArray();
			for (int i = 0; i < l_Rst.Length; ++i)
			{
				var l_Flnm = l_Rst[i].ToLower(); // 比较时统一用小写，但录入时恢复原始大小写
				if (2 == a_Which)
				{
					if ((l_Flnm.Length > 3) &&
						('.' == l_Flnm[l_Flnm.Length - 3]) && 
						('j' == l_Flnm[l_Flnm.Length - 2]) && 
						('s' == l_Flnm[l_Flnm.Length - 1]))
					{
						l_Flnm = l_Rst[i];
						l_Rst[i] = (eNmlzPath(ref l_Flnm, false, false));
					}
				}
				else
				{
					if ((l_Flnm.Length > 4) &&
						('.' == l_Flnm[l_Flnm.Length - 4]) &&
						('c' == l_Flnm[l_Flnm.Length - 3]) && 
						('s' == l_Flnm[l_Flnm.Length - 2]) && 
						('s' == l_Flnm[l_Flnm.Length - 1]))
					{
						l_Flnm = l_Rst[i];
						l_Rst[i] = (eNmlzPath(ref l_Flnm, false, false));
					}
				}
			}

			Array.Sort(l_Rst);
			a_FlnmList.AddRange(l_Rst);
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

			// 对每一个来源
			var l_Srl = l_Fsr.c_SrcRcdList;
			for (int s = 0; s < l_Srl.Count; ++s)
			{
				// 处理路径列表
				this.eAnlzAndCprs_PathList(l_Srl[s]);
			}

			//【调试】
			for (int s = 0; s < l_Srl.Count; ++s)
			{
				l_Fsr.c_TotOptBfr.Append(l_Srl[s].c_OptBfrList.ToArray());
				//	l_Fsr.c_TotRptBfr.Append(e_SortOpt[s].c_RptBfr);
			}

			File.WriteAllText(l_Fsr.c_FileSet.c_OptFile, l_Fsr.c_TotOptBfr.ToString(), Encoding.UTF8);
			///////////
		}

		private void eAnlzAndCprs_PathList(tFileSetRcd.tSrcRcd a_SrcRcd)
		{
			Console.WriteLine("正在处理目录：" + a_SrcRcd.c_Src.c_IptDiry);

			// 对每一个文件名
			for (int n = 0; n < a_SrcRcd.c_PathList.Count; ++n)
			{
				// 处理文件
				this.eAnlzAndCprs_File(a_SrcRcd, n);
			}

			Console.WriteLine();
		}

		private void eAnlzAndCprs_File(tFileSetRcd.tSrcRcd a_SrcRcd, int a_Idx)
		{
			string l_Path = a_SrcRcd.c_PathList[a_Idx];
			string l_Flnm = Path.GetFileName(l_Path);

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
				l_Lex.cAnlzAndCprsFile(this, a_SrcRcd, a_Idx);
			}
			catch (Exception a_Exc)
			{
				int l_Row = l_Lex.cGetRow();	// 帮助定位数组越界
				Console.WriteLine("【文件】" + l_Flnm + " (" + l_Row + ")\n" + "【异常】" + a_Exc.Message);
				return;
			}

			// 排序输出
			//

			// 完成
			Console.WriteLine("\t已处理：" + l_Flnm);
		}
	}
}
