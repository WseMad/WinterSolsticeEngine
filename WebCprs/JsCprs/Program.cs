using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using System.Xml;

namespace JsCprs
{
	class Program
	{
		static void Main(string[] args)
		{
			// 读取运行配置
			tCprsr.tRunCfg l_Cfg = new tCprsr.tRunCfg();
			seReadCfg(l_Cfg);

			// 压缩合并器运行
			tCprsr l_Cprsr = new tCprsr(l_Cfg);
			l_Cprsr.cRun();


			//==========================================

			/////////////////////////////////////////////////////////////////////////////
			Console.WriteLine("\n===================================================\n");
			Console.ReadLine();
		}

		static void seReadCfg(tCprsr.tRunCfg a_Cfg)
		{
			XmlDocument l_Xml = new XmlDocument();
			l_Xml.Load("RunCfg.xml");
			XmlElement l_Root = l_Xml.DocumentElement;
			int l_Idx;

			l_Idx = seReadRunCfg_Find(l_Root, "输入输出");
			if (l_Idx >= 0)
			{
				var l_IptDiryNode = l_Root.ChildNodes[l_Idx];
				var l_Chds = l_IptDiryNode.ChildNodes;
				for (int i = 0; i < l_Chds.Count; ++i)
				{
					if (XmlNodeType.Element != l_Chds[i].NodeType)	// 跳过非元素节点
					{
						continue;
					}

					var l_Item = new tCprsr.tRunCfg.tIo();
					l_Item.c_IptDiry = l_Chds[i].Attributes["输入目录"].Value;
					l_Item.c_OptFile = l_Chds[i].Attributes["输出文件"].Value;
					l_Item.c_PseDpdt = ("是" == l_Chds[i].Attributes["解析依赖"].Value);
					l_Item.c_CmbnOnly = ("是" == l_Chds[i].Attributes["只合并"].Value);
					a_Cfg.c_IoList.Add(l_Item);
				}
			}

			l_Idx = seReadRunCfg_Find(l_Root, "宏");
			if (l_Idx >= 0)
			{
				var l_MacroNode = l_Root.ChildNodes[l_Idx];
				var l_Chds = l_MacroNode.ChildNodes;
				for (int i = 0; i < l_Chds.Count; ++i)
				{
					if (XmlNodeType.Element != l_Chds[i].NodeType)	// 跳过非元素节点
					{
						continue;
					}

					var l_Chd = l_Chds[i];
					if ("添加" == l_Chd.Name)
					{
						var l_K = l_Chd.Attributes["名称"].Value;
						var l_V = l_Chd.Attributes["替换"].Value;
						a_Cfg.c_MacroList.Add(new KeyValuePair<string, string>(l_K, l_V));
					}
				}
			}

			l_Idx = seReadRunCfg_Find(l_Root, "输出报告");
			if (l_Idx >= 0)
			{
				var l_OptRptNode = l_Root.ChildNodes[l_Idx];
				a_Cfg.c_OptRpt = ("是" == l_OptRptNode.Attributes["启用"].Value);
			}

			l_Idx = seReadRunCfg_Find(l_Root, "压缩");
			if (l_Idx >= 0)
			{
				var l_CprsNode = l_Root.ChildNodes[l_Idx];
				a_Cfg.c_CprsEnab = ("是" == l_CprsNode.Attributes["启用"].Value);

				var l_Chds = l_CprsNode.ChildNodes;
				for (int i = 0; i < l_Chds.Count; ++i)
				{
					if (XmlNodeType.Element != l_Chds[i].NodeType)	// 跳过非元素节点
					{
						continue;
					}

					var l_Chd = l_Chds[i];

					if ("注释" == l_Chd.Name)
					{
						var l_V = l_Chd.Attributes["模式"].Value;
						a_Cfg.c_CprsCmtMode = l_V;
					}
					else
					if ("形参和局部变量名" == l_Chd.Name)
					{
						var l_Attr = l_Chd.Attributes["启用"];
						if (null != l_Attr)
						{
							a_Cfg.c_CprsPrmAndLocName = ("是" == l_Attr.Value);
						}

						l_Attr = l_Chd.Attributes["替换名生成"];
						if (null != l_Attr)
						{
							a_Cfg.c_SbstNameGnrt = l_Attr.Value;
						}

						l_Attr = l_Chd.Attributes["序列号前缀"];
						if (null != l_Attr)
						{
							a_Cfg.c_SqncNumPfx = l_Attr.Value;
						}

						int l_LocFctnIdx = seReadRunCfg_Find(l_Chd, "局部函数名");
						if (l_LocFctnIdx >= 0)
						{
							var l_LocFctnNode = l_Chd.ChildNodes[l_LocFctnIdx];

							l_Attr = l_LocFctnNode.Attributes["启用"];
							if (null != l_Attr)
							{
								a_Cfg.c_CprsLocFctnName = ("是" == l_Attr.Value);
							}

							l_Attr = l_LocFctnNode.Attributes["保留"];
							if (null != l_Attr)
							{
								a_Cfg.c_PsrvRgx = new System.Text.RegularExpressions.Regex(l_Attr.Value);
							}
						}

						int l_PptyAcsIdx = seReadRunCfg_Find(l_Chd, "属性访问");
						if (l_PptyAcsIdx >= 0)
						{
							var l_PptyAcsNode = l_Chd.ChildNodes[l_PptyAcsIdx];

							l_Attr = l_PptyAcsNode.Attributes["启用"];
							if (null != l_Attr)
							{
								a_Cfg.c_CprsPptyAcs = ("是" == l_Attr.Value);
							}
						}
					}
				}
			}
		}

		private static int seReadRunCfg_Find(XmlNode a_Prn, string a_Name)
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
	} // Program
}
