using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;

class tProgram
{
	//-------- 主函数
	static void Main(string[] args)
	{
		////匹配：///#include ../Abc\Def/Ghi.js
		//string l_Ptn = @"^///#include\s+(.*)";
		//Regex l_Rgx = new Regex(l_Ptn);

		//string l_Str = @"///#include ../Abc\Def/Ghi.js";
		//Match l_Mch =  l_Rgx.Match(l_Str);
		//if (null != l_Mch)
		//{
		//	if (l_Mch.Captures.Count > 0)
		//		Console.WriteLine(l_Mch.Captures[0].Value);
		//	else
		//		Console.WriteLine("没有捕获");
		//}

		//tChaIptStrm l_Cis = new tChaIptStrm("Js/PCME.js");
		//char l_Cha;
		//int l_Cnt = 0;
		//while (l_Cis.cFch(out l_Cha))
		//{
		//	char l_N1, l_N2;
		//	l_Cis.cAhd2(out l_N1, out l_N2);

		//	++ l_Cnt;
		//	Console.Write(l_Cnt.ToString() + " ");
		//}

		//==========================================
		se_Src = "aaaaaa";
		se_Idx = 0;
		bool l_OK = eS();
		Console.WriteLine(l_OK);

		//==========================================

		/////////////////////////////////////////////////////////////////////////////
		Console.WriteLine("\n===================================================\n");
		Console.ReadLine();
	}

	static string se_Src;
	static int se_Idx;

	static bool eS()
	{
		// S -> aSa | aa

		// 如果已无输入
		if (se_Idx >= se_Src.Length)
			return false;

		// 记录当前索引
		int l_Idx = se_Idx;

		// aSa
		bool l_aSa_OK = false;
		if ('a' == se_Src[se_Idx])
		{
			++se_Idx;

			bool l_OK = eS();
			if (l_OK)
			{
				// 如果已无输入
				if (se_Idx >= se_Src.Length)
					return false;

				if ('a' == se_Src[se_Idx])
				{
					++se_Idx;
					l_aSa_OK = true;
				}
			}
		}

		// aa
		bool l_Rst = l_aSa_OK;
		if (! l_aSa_OK)
		{
			// 恢复索引
			se_Idx = l_Idx;

			if ('a' == se_Src[se_Idx])
			{
				++se_Idx;
			}

			// 如果已无输入
			if (se_Idx >= se_Src.Length)
				return false;

			if ('a' == se_Src[se_Idx])
			{
				++se_Idx;
				l_Rst = true;
			}
			else
			{
				// 恢复索引
				se_Idx = l_Idx;
			}
		}

		return l_Rst;
	}
}

