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

			// 以下几个列表都是对每个文件使用一个元素
			public List<string> c_FlnmList; // 文件名列表
			public List<List<string>> c_DpdcTab; // 依赖表
			public List<string> c_DftLibDiryList; // 默认库目录列表
			public List<int> c_LenList; // 长度列表
			public List<StringBuilder> c_OptBfrList; // 输出缓冲列表
			public List<StringBuilder> c_RptBfrList; // 报告缓冲列表

			/// <summary>
			/// 构造
			/// </summary>
			public tSrcRcd(tRunCfg.tFileSet.tSrc a_Src)
			{
				this.c_Src = a_Src;
				this.c_FlnmList = new List<string>();
				this.c_DpdcTab = new List<List<string>>();
				this.c_DftLibDiryList = new List<string>();
				this.c_LenList = new List<int>();
				this.c_OptBfrList = new List<StringBuilder>();
				this.c_RptBfrList = new List<StringBuilder>();

				var l_Diry = a_Src.c_IptDiry;
				this.c_IsWseDiry =
					((l_Diry.Length - 5 >= 0) && l_Diry.ToLower().IndexOf("nwse/") == l_Diry.Length - 5) ||
					((l_Diry.Length - 4 >= 0) && l_Diry.ToLower().IndexOf("nwse") == l_Diry.Length - 4);
			}
		}

		public tRunCfg.tFileSet c_FileSet; // 文件集
		public List<tSrcRcd> c_SrcRcdList;	// 来源记录列表
		public int c_Which;		// 那种？2=.js，3=.css

		/// <summary>
		/// 构造
		/// </summary>
		public tFileSetRcd(tRunCfg.tFileSet a_FileSet, int a_Which)
		{
			this.c_FileSet = a_FileSet;
			this.c_SrcRcdList = new List<tSrcRcd>();
			this.c_Which = a_Which;
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
			this.eEnumSrcFlnms(this.c_RunCfg.c_JsList, ".js");
			this.eEnumSrcFlnms(this.c_RunCfg.c_CssList, ".css");
		}

		private void eEnumSrcFlnms(List<tRunCfg.tFileSet> a_FSL, string a_Sfx)
		{
			var l_Which = (".js" == a_Sfx) ? 2 : 3;
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
					this.eEnumFiles(l_Sr.c_FlnmList, l_Sr.c_Src.c_IptDiry, l_Which);
					if (l_Sr.c_FlnmList.Count > 0)
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
			var l_FileSet = Directory.EnumerateFiles(a_Diry);
			var l_Rst = l_FileSet.ToArray();
			for (int i = 0; i < l_Rst.Length; ++i)
			{
				var l_Flnm = l_Rst[i];
				if ((l_Flnm.Length > 3) &&
					('.' == l_Flnm[l_Flnm.Length - 3]) && ('j' == l_Flnm[l_Flnm.Length - 2]) && ('s' == l_Flnm[l_Flnm.Length - 1]))
				{
					l_Rst[i] = (eNmlzPath(ref l_Flnm, false, false));
				}
			}

			Array.Sort(l_Rst);
			a_FlnmList.AddRange(l_Rst);
		}
	}
}
