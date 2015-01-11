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
			var l_RunCfg = new tRunCfg();
			l_RunCfg.cLoadFromXml("./RunCfg.xml");

			var l_Cprsr = new nCprsr.tCprsr();
			l_Cprsr.cRun(l_RunCfg);

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
				public bool c_PseDpdc;	// 解析依赖？
				public bool c_Cprs;		// 压缩？

				public tSrc(string a_IptDiry, bool a_PseDpdc, bool a_Cprs)
				{
					this.c_IptDiry = a_IptDiry;
					this.c_PseDpdc = a_PseDpdc;
					this.c_Cprs = a_Cprs;
				}
			}

			public string c_OptFile;	// 输出文件
			public List<tSrc> c_SrcList;	// 来源列表

			/// <summary>
			/// 构造
			/// </summary>
			public tFileSet()
			{
				this.c_SrcList = new List<tSrc>();
			}

			public void cAdd(string a_IptDiry, bool a_PseDpdc, bool a_Cprs)
			{
				this.c_SrcList.Add(new tSrc(a_IptDiry, a_PseDpdc, a_Cprs));
			}
		}

		public List<tFileSet> c_JsList;		// Js列表
		public List<tFileSet> c_CssList;	// Css列表

		public bool c_OptRpt;	// 输出报告？
		public bool c_Cprs;		// 压缩？
		public bool c_PrmsAndLocs;	// 形参和局部变量名？
		public string c_SbstNameGnrt; // 替换名生成
		public string c_SnPfx;	// 序列号前缀
		public bool c_LocFctnName;	// 局部函数名？
		public Regex c_Psrv; // 保留
		public bool c_PptyAcs;	// 属性访问？

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
			this.c_SbstNameGnrt = null;
			this.c_SnPfx = null;
			this.c_LocFctnName = false;
			this.c_Psrv = null;
			this.c_PptyAcs = false;
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
				this.eLoadJsCss(l_Root.ChildNodes[l_Idx]);
			}

			l_Idx = this.eFindChd(l_Root, "css");
			if (l_Idx >= 0)
			{
				this.eLoadJsCss(l_Root.ChildNodes[l_Idx]);
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

					l_Idx = this.eFindChd(l_PrmsAndLocsElmt, "局部函数名");
					if (l_Idx >= 0)
					{
						XmlElement l_LocFctnNameElmt = (XmlElement)l_PrmsAndLocsElmt.ChildNodes[l_Idx];
						this.c_LocFctnName = ("是" == l_LocFctnNameElmt.GetAttribute("启用"));
						if (! String.IsNullOrEmpty(l_LocFctnNameElmt.GetAttribute("保留")))
						{
							this.c_Psrv = new Regex(l_LocFctnNameElmt.GetAttribute("保留"));
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

		private void eLoadJsCss(XmlNode a_Node)
		{
			XmlElement l_JsCss = (XmlElement)a_Node;
			for (int c = 0; c < l_JsCss.ChildNodes.Count; ++c)
			{
				if (XmlNodeType.Element != l_JsCss.ChildNodes[c].NodeType)
				{
					continue;
				}

				XmlElement l_SetElmt = (XmlElement)l_JsCss.ChildNodes[c];
				if (String.IsNullOrEmpty(l_SetElmt.GetAttribute("输出文件")))
				{
					continue;
				}

				tFileSet l_FS = new tFileSet();
				l_FS.c_OptFile = l_SetElmt.GetAttribute("输出文件");

				for (int s = 0; s < l_SetElmt.ChildNodes.Count; ++s)
				{
					if (XmlNodeType.Element != l_SetElmt.ChildNodes[s].NodeType)
					{
						continue;
					}

					XmlElement l_SrcElmt = (XmlElement)l_SetElmt.ChildNodes[s];
					if (String.IsNullOrEmpty(l_SrcElmt.GetAttribute("输入目录")))
					{
						continue;
					}

					l_FS.cAdd(l_SrcElmt.GetAttribute("输入目录"),
						("是" == l_SrcElmt.GetAttribute("解析依赖")),
						("是" == l_SrcElmt.GetAttribute("压缩")));
				}

				if (l_FS.c_SrcList.Count > 0)
				{
					this.c_JsList.Add(l_FS);
				}
			}
		}
	}
}
