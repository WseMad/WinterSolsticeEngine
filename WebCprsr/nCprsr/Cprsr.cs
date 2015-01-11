using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

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
			}
		}

		public tRunCfg.tFileSet c_FileSet; // 文件集
		public List<tSrcRcd> c_SrcRcdList;	// 来源记录列表
	}

	/// <summary>
	/// 压缩器
	/// </summary>
	class tCprsr
	{
		public tRunCfg c_RunCfg; // 运行配置

		/// <summary>
		/// 构造
		/// </summary>
		public tCprsr()
		{

		}

		/// <summary>
		/// 运行
		/// </summary>
		/// <param name="a_Cfg">配置</param>
		public void cRun(tRunCfg a_Cfg)
		{
			this.c_RunCfg = a_Cfg; // 记录配置


		}
	}
}
