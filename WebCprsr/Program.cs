using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Xml;
using System.Text.RegularExpressions;

namespace nWebCprsr
{
	class tProgram
	{
		static void Main(string[] args)
		{
			// 开始
			var l_RunCfg = new tRunCfg();
			l_RunCfg.cLoadFromXml("./RunCfg.xml");

			var l_Cprsr = new nCprsr.tCprsr();
			l_Cprsr.cRun(l_RunCfg);

			Console.WriteLine("全部完成！");

			/////////////////////////////////////////////////////////////////////////////
			Console.WriteLine("\n===================================================\n");
			Console.ReadLine();
		}
	}

	/// <summary>
	/// 运行配置
	/// </summary>
	public class tRunCfg
	{
		/// <summary>
		/// 文件集
		/// </summary>
		public class tFileSet
		{
			/// <summary>
			/// 来源
			/// </summary>
			public class tSrc
			{
				public string c_IptDiry;	// 输入目录
				public List<string> c_IptPathList; // 输入路径列表
				public bool c_PseDpdc;	// 解析依赖？
				public bool c_Cprs;		// 压缩？
				public bool c_SprtSeed;	// 分离种子？（仅用于nWse目录）

				public tSrc(string a_IptDiry, bool a_PseDpdc, bool a_Cprs, bool a_SprtSeed)
				{
					this.c_IptPathList = new List<string>();
					this.c_IptDiry = a_IptDiry;
					this.c_PseDpdc = a_PseDpdc;
					this.c_Cprs = a_Cprs;
					this.c_SprtSeed = a_SprtSeed;
				}
			}

			public List<string> c_OptPathList;	// 输出路径列表
			public List<tSrc> c_SrcList;	// 来源列表

			/// <summary>
			/// 构造
			/// </summary>
			public tFileSet()
			{
				this.c_OptPathList = new List<string>();
				this.c_SrcList = new List<tSrc>();
			}

			public void cAddOptPath(string a_OptPath)
			{
				this.c_OptPathList.Add(a_OptPath);
			}

			public tSrc cAddIptDiry(string a_IptDiry, bool a_PseDpdc, bool a_Cprs, bool a_SprtSeed)
			{
				// 确保目录以（正反）斜杠结尾
				if (('/' != a_IptDiry[a_IptDiry.Length - 1]) && ('\\' != a_IptDiry[a_IptDiry.Length - 1]))
				{
					a_IptDiry += '/';
				}

				this.c_SrcList.Add(new tSrc(a_IptDiry, a_PseDpdc, a_Cprs, a_SprtSeed));
				return this.c_SrcList[this.c_SrcList.Count - 1];
			}
		}

		public List<tFileSet> c_JsList;		// Js列表
		public List<tFileSet> c_CssList;	// Css列表

		public bool c_OptRpt;	// 输出报告？
		public bool c_Cprs;		// 压缩？
		public bool c_PrmsAndLocs;	// 形参和局部变量名？
		public Regex c_PsrvPal;		// 保留形参和局部变量名
		public string c_SbstNameGnrt; // 替换名生成
		public string c_SnPfx;	// 序列号前缀
		public bool c_LocFctnName;	// 局部函数名？
		public Regex c_PsrvLfn; // 保留局部函数名
		public bool c_PptyAcs;	// 属性访问？
		public bool c_Ecry;		// 加密？
		public bool c_EcdStrLtrlByUtf16;	// 以UTF16编码字符串字面值

		/// <summary>
		/// 构造
		/// </summary>
		public tRunCfg()
		{
			this.c_JsList = new List<tFileSet>();
			this.c_CssList = new List<tFileSet>();
			this.c_OptRpt = false;
			this.c_Cprs = false;
			this.c_PrmsAndLocs = false;
			this.c_PsrvPal = null;
			this.c_SbstNameGnrt = null;
			this.c_SnPfx = null;
			this.c_LocFctnName = false;
			this.c_PsrvLfn = null;
			this.c_PptyAcs = false;
			this.c_Ecry = false;
			this.c_EcdStrLtrlByUtf16 = false;
		}

		public void cLoadFromXml(string a_Path)
		{
			XmlDocument l_Xml = new XmlDocument();
			l_Xml.Load(a_Path);
			XmlElement l_Root = l_Xml.DocumentElement;
			int l_Idx;

			l_Idx = this.eFindChd(l_Root, "js");
			if (l_Idx >= 0)
			{
				this.eLoadJsCss(this.c_JsList, l_Root.ChildNodes[l_Idx]);
			}

			l_Idx = this.eFindChd(l_Root, "css");
			if (l_Idx >= 0)
			{
				this.eLoadJsCss(this.c_CssList, l_Root.ChildNodes[l_Idx]);
			}

			l_Idx = this.eFindChd(l_Root, "输出报告");
			if (l_Idx >= 0)
			{
				XmlElement l_Elmt = (XmlElement)l_Root.ChildNodes[l_Idx];
				this.c_OptRpt = ("是" == l_Elmt.GetAttribute("启用"));
			}

			l_Idx = this.eFindChd(l_Root, "压缩");
			if (l_Idx >= 0)
			{
				XmlElement l_CprsElmt = (XmlElement)l_Root.ChildNodes[l_Idx];
				this.c_Cprs = ("是" == l_CprsElmt.GetAttribute("启用"));

				l_Idx = this.eFindChd(l_CprsElmt, "形参和局部变量名");
				if (l_Idx >= 0)
				{
					XmlElement l_PrmsAndLocsElmt = (XmlElement)l_CprsElmt.ChildNodes[l_Idx];
					this.c_PrmsAndLocs = ("是" == l_PrmsAndLocsElmt.GetAttribute("启用"));
					this.c_SbstNameGnrt = l_PrmsAndLocsElmt.GetAttribute("替换名生成");
					this.c_SnPfx = l_PrmsAndLocsElmt.GetAttribute("序列号前缀");
					if (!String.IsNullOrEmpty(l_PrmsAndLocsElmt.GetAttribute("保留")))
					{
						this.c_PsrvPal = new Regex(l_PrmsAndLocsElmt.GetAttribute("保留"));
					}

					l_Idx = this.eFindChd(l_PrmsAndLocsElmt, "局部函数名");
					if (l_Idx >= 0)
					{
						XmlElement l_LocFctnNameElmt = (XmlElement)l_PrmsAndLocsElmt.ChildNodes[l_Idx];
						this.c_LocFctnName = ("是" == l_LocFctnNameElmt.GetAttribute("启用"));
						if (!String.IsNullOrEmpty(l_LocFctnNameElmt.GetAttribute("保留")))
						{
							this.c_PsrvLfn = new Regex(l_LocFctnNameElmt.GetAttribute("保留"));
						}
					}

					l_Idx = this.eFindChd(l_PrmsAndLocsElmt, "属性访问");
					if (l_Idx >= 0)
					{
						XmlElement l_PptyAcsElmt = (XmlElement)l_PrmsAndLocsElmt.ChildNodes[l_Idx];
						this.c_PptyAcs = ("是" == l_PptyAcsElmt.GetAttribute("启用"));
					}
				}
			}

			l_Idx = this.eFindChd(l_Root, "加密");
			if (l_Idx >= 0)
			{
				XmlElement l_EcryElmt = (XmlElement)l_Root.ChildNodes[l_Idx];
				this.c_Ecry = ("是" == l_EcryElmt.GetAttribute("启用"));

				l_Idx = this.eFindChd(l_EcryElmt, "以UTF16编码字符串字面值");
				if (l_Idx >= 0)
				{
					XmlElement l_EcdElmt = (XmlElement)l_EcryElmt.ChildNodes[l_Idx];
					this.c_EcdStrLtrlByUtf16 = ("是" == l_EcdElmt.GetAttribute("启用"));
				}
			}
		}

		private int eFindChd(XmlNode a_Prn, string a_Name)
		{
			for (int i = 0; i < a_Prn.ChildNodes.Count; ++i)
			{
				if (XmlNodeType.Element != a_Prn.ChildNodes[i].NodeType)
				{
					continue;
				}

				if (a_Name == a_Prn.ChildNodes[i].Name)
				{
					return i;
				}
			}
			return -1;
		}

		private void eLoadJsCss(List<tFileSet> a_List, XmlNode a_Node)
		{
			XmlElement l_JsCss = (XmlElement)a_Node;
			for (int c = 0; c < l_JsCss.ChildNodes.Count; ++c)
			{
				if (XmlNodeType.Element != l_JsCss.ChildNodes[c].NodeType)
				{
					continue;
				}

				XmlElement l_SetElmt = (XmlElement)l_JsCss.ChildNodes[c];

				tFileSet l_FS = new tFileSet();
				for (int s = 0; s < l_SetElmt.ChildNodes.Count; ++s)
				{
					if (XmlNodeType.Element != l_SetElmt.ChildNodes[s].NodeType)
					{
						continue;
					}

					XmlElement l_SrcElmt = (XmlElement)l_SetElmt.ChildNodes[s];
					if ("输出" == l_SrcElmt.Name)
					{
						if (String.IsNullOrEmpty(l_SrcElmt.GetAttribute("路径")))
						{
							continue;
						}

						l_FS.cAddOptPath(l_SrcElmt.GetAttribute("路径"));
					}
					else if ("输入" == l_SrcElmt.Name)
					{
						if (String.IsNullOrEmpty(l_SrcElmt.GetAttribute("目录")))
						{
							continue;
						}

						var l_Src = l_FS.cAddIptDiry(l_SrcElmt.GetAttribute("目录"),
							("是" == l_SrcElmt.GetAttribute("解析依赖")),
							("是" == l_SrcElmt.GetAttribute("压缩")),
							("是" == l_SrcElmt.GetAttribute("分离种子")));

						for (int f = 0; f < l_SrcElmt.ChildNodes.Count; ++f)
						{
							if (XmlNodeType.Element != l_SrcElmt.ChildNodes[f].NodeType)
							{
								continue;
							}

							XmlElement l_FlnmElmt = (XmlElement)l_SrcElmt.ChildNodes[f];
							if ("文件" == l_FlnmElmt.Name)
							{
								if (String.IsNullOrEmpty(l_FlnmElmt.GetAttribute("名称")))
								{
									continue;
								}

								l_Src.c_IptPathList.Add(l_Src.c_IptDiry + l_FlnmElmt.GetAttribute("名称"));
							}
						}
					}
				}

				if ((l_FS.c_OptPathList.Count > 0) && (l_FS.c_SrcList.Count > 0))
				{
					a_List.Add(l_FS);
				}
			}
		}
	}
}
