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
	/// 词法分析
	/// </summary>
	partial class tLex
	{
		private tCprsr e_Cprsr;
		private tFileSetRcd.tSrcRcd e_SrcRcd;
		private int e_PathIdx;
		private int e_Which;

		private string e_Path;
		private string e_SrcText;

		private List<string> e_DpdcList;
		private StringBuilder e_OptBfr;
		private StringBuilder e_RptBfr;

		// 扫描时使用的字段
		private tChaIptStrm e_IptStrm;		// 输入流
		private tChaOptStrm e_OptStrm;		// 输出流
		private int e_NewLineCnt;	// 换行计数
		private bool e_HasPpcsDctv;	// 有预处理指令？
		private List<tTkn> e_TknList;		// 词法单元列表

		/// <summary>
		/// 构造
		/// </summary>
		public tLex()
		{
			// 扫描时再处理最后几个字段
		}

		/// <summary>
		/// 获取行数
		/// </summary>
		/// <returns>行数</returns>
		public int cGetRow()
		{
			return this.e_NewLineCnt + 1;
		}

		/// <summary>
		/// 分析并压缩文件
		/// </summary>
		public void cAnlzAndCprsFile(tCprsr a_Cprsr, tFileSetRcd.tSrcRcd a_SrcRcd, int a_PathIdx, int a_Which)
		{
			// 簿记属于该文件的各个记录，便于访问
			this.e_Cprsr = a_Cprsr;
			this.e_SrcRcd = a_SrcRcd;
			this.e_PathIdx = a_PathIdx;
			this.e_Which = a_Which;
			this.e_Path = a_SrcRcd.c_PathList[a_PathIdx];

			this.e_DpdcList = a_SrcRcd.c_DpdcTab[a_SrcRcd.c_DpdcTab.Count - 1];
			this.e_OptBfr = a_SrcRcd.c_OptBfrList[a_SrcRcd.c_OptBfrList.Count - 1];
			this.e_RptBfr = a_SrcRcd.c_RptBfrList[a_SrcRcd.c_RptBfrList.Count - 1];

			// 读取文件成字符串，若发生异常交由调用者处理
			this.e_SrcText = File.ReadAllText(a_SrcRcd.c_PathList[a_PathIdx], Encoding.UTF8);
			if (string.IsNullOrEmpty(this.e_SrcText)) // 若为空立即返回
			{
				return;
			}

			a_SrcRcd.c_LenList[a_SrcRcd.c_LenList.Count - 1] = this.e_SrcText.Length; // 记录长度

			// 如果不压缩，立即输出并返回
			if (!a_SrcRcd.c_Src.c_Cprs)
			{
				this.e_OptBfr.Append(this.e_SrcText);
				this.e_OptBfr.AppendLine();	// 追加一个换行，以防文件最后一行是行注释，导致下一个文件的首行被注释掉
				return;
			}

			// 扫描
			this.eScan();

			// 预处理
			if (this.e_HasPpcsDctv)
			{
				this.ePpcs();
			}

			// JavaScript
			if (2 == this.e_Which)
			{
				// 修剪换行
				// 在扫描后进行这一步是有意义的，因为此时能够看到换行符所在的完整的上下文
				// 不像添加词法单元时，只能看前面的，看不到后面的，从而只能采取较保守的策略
				this.eTrimNewLine();

				// 如果还需要压缩形参和局部变量名
				if (this.e_Cprsr.c_RunCfg.c_PrmsAndLocs)
				{
					// 交由函数压缩器处理
					tFctn l_Fctn = new tFctn();
					l_Fctn.cAnlzAndCprsFctn(this, ref this.e_TknList);
				}

				// 如果要解析依赖
				if (a_SrcRcd.c_Src.c_PseDpdc)
				{
					this.ePseDpdc();
				}
			}
			else // CSS
			{
				//int z=0;
			}

			// 输出
			this.eOpt();
		}

		/// <summary>
		/// 扫描
		/// </summary>
		private void eScan()
		{
			// 构造源流，复位一些数据
			e_IptStrm = new tChaIptStrm(e_SrcText);
			e_NewLineCnt = 0;
			e_HasPpcsDctv = false;
			e_TknList = new List<tTkn>();

			// 提取每一个字符，直到溢出
			while (!e_IptStrm.cIsOvfl())
			{
				// 扫描状态机
				eScan_StaMchn();
			}

			// 如果最后一个是换行符
			if ((e_TknList.Count > 0) && eIsLastTknNewLine(e_TknList))
			{
				if (2 == this.e_Which)
				{
					// 如果倒数第二个是分号，移除，否则将其替换成分号或空格
					// 替换而不丢弃的原因是为了下一个文件能从行尾立即跟上
					if (eIsLastTknSmcln(e_TknList, e_TknList.Count - 1))
					{
						eRmvLastTkn(e_TknList);
					}
					else
					{
						eChgNewLineToSmcln(null, e_TknList);
					}
				}
				else
				{
					eRmvLastTkn(e_TknList);
					eScan_FlwByWhtSpc(); // 通知当前最后一个词法单元后跟空白
				}		
			}
		}

		private void eScan_StaMchn()
		{
			//【注意】
			// 在字符串字面值，正则表达式字面值，和标识符里，任何字符也可以被表示成一个Unicode转义序列

			// 空白
			if (seIsWhtSpc(e_IptStrm.cGetNextCha()))
			{
				eScan_FlwByWhtSpc(); // 通知当前最后一个词法单元后跟空白

				// 跳过
				e_IptStrm.cFch(true);
			}
			else // 换行
			if (seIsNewLine(e_IptStrm.cGetNextCha()))
			{
				eScan_FlwByWhtSpc(); // 通知当前最后一个词法单元后跟空白

				eAddTkn_NewLine(e_TknList);
				e_IptStrm.cSkipNewLine();
				++e_NewLineCnt;
			}
			else // 注释，除法，除法赋值，正则表达式字面值
			if ('/' == e_IptStrm.cGetNextCha())
			{
				// 行注释
				if (e_IptStrm.cChkNext2('/', '/', true))
				{
					eScan_FlwByWhtSpc(); // 通知当前最后一个词法单元后跟空白

					eScan_StaMchn_LineCmt();
				}
				else // 块注释
				if (e_IptStrm.cChkNext2('/', '*', true))
				{
					eScan_FlwByWhtSpc(); // 通知当前最后一个词法单元后跟空白

					eScan_StaMchn_BlkCmt();
				}
				else // 除法，除法赋值，正则表达式字面值
				{
					eScan_StaMchn_Div();
				}
			}
			else // 数字字面值，【注意】允许以“.”开头，详见标准中文版P25
			if (char.IsDigit(e_IptStrm.cGetNextCha()) ||
				(('.' == e_IptStrm.cGetNextCha()) && e_IptStrm.cIsNext2_Num(false)))
			{
				eScan_StaMchn_NumLtrl();
			}
			else // 字符串字面值
			if (('\'' == e_IptStrm.cGetNextCha()) || ('"' == e_IptStrm.cGetNextCha()))
			{
				eScan_StaMchn_StrLtrl();
			}
			else // 标点符号
			if (seIsNonDivPctuOptCha(e_IptStrm.cGetNextCha(), this.e_Which))
			{
				eScan_StaMchn_NonDivPctu();
			}
			else // 关键字，保留字，标识符
			if (seIsIdFstCha(e_IptStrm.cGetNextCha(), this.e_Which))
			{
				eScan_StaMchn_Id();
			}
			else // 其他
			{
				throw new Exception(e_Path + " (" + (1 + e_NewLineCnt) + ") 未识别的字符“" + e_IptStrm.cGetNextCha() + "”。");
			}
		}

		private void eScan_FlwByWhtSpc()
		{
			// 通知当前最后一个词法单元后跟空白
			if (e_TknList.Count > 0)
			{
				e_TknList[e_TknList.Count - 1].c_FlwByWhtSpc = true;
			}
		}

		private void eScan_StaMchn_LineCmt()
		{
			string l_Line;
			e_IptStrm.cFchUtlLineTmnt(out l_Line);

			// 如果是预处理指令
			if ((l_Line.Length > 3) && ('#' == l_Line[2]))
			{
				// 提取指令名
				for (int i = 3; i < l_Line.Length; ++i)
				{
					if (!seIsIdCha(l_Line[i], this.e_Which))
					{
						eAddTkn(e_TknList, tTmnl.i_PpcsDctv, l_Line.Substring(3, i - 3));
						e_HasPpcsDctv = true;	// 有预处理指令
						break;
					}
				}
			}
			else
			{
				// 如何处理注释？【总是剪掉】
				bool l_Add = false;
				//if (e_Cprsr.c_RunCfg.c_Cprs && ("删除全部" == e_Cprsr.c_RunCfg.c_CprsCmtMode))
				//{
				//	//
				//}
				//else
				//	if (e_Cprsr.c_RunCfg.c_Cprs && ("保留全部" == e_Cprsr.c_RunCfg.c_CprsCmtMode))
				//	{
				//		l_Add = true;
				//	}
				//	else
				//		if (e_Cprsr.c_RunCfg.c_Cprs && ("保留内联文档" == e_Cprsr.c_RunCfg.c_CprsCmtMode))
				//		{
				//			l_Add = seIsInlnDoc(l_Line);
				//		}

				if (l_Add)
				{
					eAddTkn(e_TknList, tTmnl.i_LineCmt, l_Line);
				}
			}

			// 如果尚未完结，则接下来一定是换行符
			if (!e_IptStrm.cIsOvfl())
			{
				eAddTkn_NewLine(e_TknList);
				e_IptStrm.cSkipNewLine();
				++e_NewLineCnt;
			}
		}

		private void eScan_StaMchn_BlkCmt()
		{
			// 先读入“/*”
			e_IptStrm.cMove(+2, true);
			StringBuilder l_Bfr = new StringBuilder("/*");

			// 读取直到“*/”或溢出
			bool l_HasNewLine = false;
			while (!e_IptStrm.cIsOvfl())
			{
				// 如果遇到换行，依照ECMAScript规范，必须把整个块注释当成一个换行
				if (seIsNewLine(e_IptStrm.cGetNextCha()))
				{
					l_Bfr.Append(Environment.NewLine);
					l_HasNewLine = true;
					e_IptStrm.cSkipNewLine();
					++e_NewLineCnt;
				}
				else // 结束
					if (e_IptStrm.cChkNext2('*', '/', true))
					{
						l_Bfr.Append("*/");
						e_IptStrm.cMove(+2, true);
						break;
					}
					else // 其他
					{
						l_Bfr.Append(e_IptStrm.cFch(true));	// 注释里忽略UES
					}
			}

			// 如何处理注释？
			if (false)//e_Cprsr.c_RunCfg.c_Cprs && ("保留全部" == e_Cprsr.c_RunCfg.c_CprsCmtMode))
			{
				//	eAddTkn(e_TknList, tTmnl.i_BlkCmt, l_Bfr.ToString());
			}
			else // 其他情况下，如同遇到一个换行
				if (l_HasNewLine)
				{
					eAddTkn_NewLine(e_TknList);
				}
		}

		private void eScan_StaMchn_Div()
		{
			// 以下情况下 一定是 除法或除法赋值（表示二元运算）：
			// 1. “]”后
			// 2. “)”后
			// 4. 字面值后
			// 5. 标识符后

			// 以下情况下 一定是 正则表达式字面值：
			// 1. “{”
			// 2. “}”后
			// 3. “[”后
			// 4. “(”后
			// 5. “. ; , ? :”后
			// 注意，上面5种情况就是除“] )”外的所有标点，而运算符不能是运算数，所以可借助seIsPctuOpt判断


			// 取得前一个非换行词法单元
			var l_LastTkn = eGetLastNonNewLineTkn(e_TknList);// eGetLastTmnl eGetLastNonNewLineTmnl

			if ((tTmnl.i_RBrkt == l_LastTkn.c_Tmnl) || (tTmnl.i_RPrth == l_LastTkn.c_Tmnl) ||
				seIsLtrlOrId(l_LastTkn.c_Tmnl))
			{
				e_IptStrm.cFch(true);	// 读入“/”

				if ('=' == e_IptStrm.cGetNextCha())	// 是“/=”
				{
					e_IptStrm.cFch(true);
					eAddTkn(e_TknList, tTmnl.i_DivAsn, "/=");
				}
				else
				{
					eAddTkn(e_TknList, tTmnl.i_Div, "/");
				}
			}
			else
				if (seIsPctuOpt(l_LastTkn.c_Tmnl))	// 执行到这里说明已经不是“] )”
				{
					// 报告
					e_RptBfr.AppendLine("行(" + (e_NewLineCnt + 1) + ")：发现正则表达式！");

					//【注意】在正则表达式字面值里，虽然ECMAScript规范允许使用UES，
					// 但压缩器不会尝试进行转义，而是原样输出，
					// 不必担心结尾的斜杠，因为它不能被表示成UES，详见标准中文版P17
					// 在字符串字面值，正则表达式字面值，和标识符里，任何字符（编码单位）也可以被表示成一个Unicode转义序列，
					// 其由六个字符构成，也就是\u后跟四个十六进制数字。
					// 在注释里，这样的转义序列作为注释的一部分而被忽略。
					// 在字符串字面值或正则表达式字面值里，Unicode转义序列为字面值贡献一个值。
					// 在标识符里，转义序列为标识符贡献一个字符。


					StringBuilder l_Bfr = new StringBuilder("/");
					e_IptStrm.cFch(true);	// 读入“/”
					char l_FstCha = e_IptStrm.cIsOvfl() ? '\0' : e_IptStrm.cGetNextCha();

					while (!e_IptStrm.cIsOvfl())
					{
						// 压缩器不进行转义
						if ('\\' == e_IptStrm.cGetNextCha())
						{
							l_Bfr.Append(e_IptStrm.cGetNextCha());
							l_Bfr.Append(e_IptStrm.cFch(true));	// 正则表达式字面值里忽略UES
							e_IptStrm.cFch(true);
						}
						else // 遇到结束斜杠
							if ('/' == e_IptStrm.cGetNextCha())
							{
								l_Bfr.Append('/');
								e_IptStrm.cFch(true);	// 结束斜杠也不能是UES

								// 主体结束后，还可以有三个标志
								while (!e_IptStrm.cIsOvfl())
								{
									if (('g' == e_IptStrm.cGetNextCha()) ||
										('i' == e_IptStrm.cGetNextCha()) ||
										('m' == e_IptStrm.cGetNextCha()))
									{
										l_Bfr.Append(e_IptStrm.cGetNextCha());
										e_IptStrm.cFch(true);
									}
									else
									{
										break;
									}
								}

								break;
							}
							else // 其他字符直接装入
							{
								l_Bfr.Append(e_IptStrm.cGetNextCha());
								e_IptStrm.cFch(true);	// 字符串字面值里忽略UES
							}
					}

					eAddTkn(e_TknList, tTmnl.i_RgxLtrl, l_Bfr.ToString());
				}
				else
				{
					throw new Exception(e_Path + " (" + (1 + e_NewLineCnt) +
						") 无法判断“/”表示除号还是正则表达式字面值，前一个非换行终结符是“" + l_LastTkn.c_Tmnl + "”！");
				}
		}

		private void eScan_StaMchn_NumLtrl()
		{
			//【注意】数字前的±单独作为一个词法单元，因为在它们和数字之间可以加入空白符

			StringBuilder l_Bfr = new StringBuilder();

			// 以“0”开头可能是十六进制整数，也可能是十进制数字
			if ('0' == e_IptStrm.cGetNextCha())
			{
				l_Bfr.Append('0');
				e_IptStrm.cFch(false);
			}

			// 0xFF 0XFF
			if ((!e_IptStrm.cIsOvfl()) &&
				(('X' == e_IptStrm.cGetNextCha()) || ('x' == e_IptStrm.cGetNextCha())))
			{
				l_Bfr.Append(e_IptStrm.cGetNextCha());
				e_IptStrm.cFch(false);

				while (!e_IptStrm.cIsOvfl())
				{
					if (!seIsHexDit(e_IptStrm.cGetNextCha()))
					{
						break;
					}
					else
					{
						l_Bfr.Append(e_IptStrm.cGetNextCha());
						e_IptStrm.cFch(false);
					}
				}
			}
			else // 987. 12.34e56	12.34e+56	12.34e-56 .3
			{
				while (!e_IptStrm.cIsOvfl())
				{
					if (('E' == e_IptStrm.cGetNextCha()) || ('e' == e_IptStrm.cGetNextCha()))
					{
						l_Bfr.Append(e_IptStrm.cGetNextCha());
						e_IptStrm.cFch(false);
					}
					else
						if (('+' == e_IptStrm.cGetNextCha()) || ('-' == e_IptStrm.cGetNextCha()))
						{
							// 如果前一个字符是“E”或“e”
							if (('E' == l_Bfr[l_Bfr.Length - 1]) || ('e' == l_Bfr[l_Bfr.Length - 1]))
							{
								l_Bfr.Append(e_IptStrm.cGetNextCha());
								e_IptStrm.cFch(false);
							}
							else // “1.2+”，可能是运算的一部分
							{
								break;
							}
						}
						else
							if ((!char.IsDigit(e_IptStrm.cGetNextCha())) && ('.' != e_IptStrm.cGetNextCha()))
							{
								break;
							}
							else
							{
								l_Bfr.Append(e_IptStrm.cGetNextCha());
								e_IptStrm.cFch(false);
							}
				}
			}

			// 添加
			eAddTkn(e_TknList, tTmnl.i_NumLtrl, l_Bfr.ToString());
		}

		private void eScan_StaMchn_StrLtrl()
		{
			//【注意】在字符串字面值里，虽然ECMAScript规范允许使用UES，
			// 但压缩器不会尝试进行转义，而是原样输出，
			// 不必担心结尾的引号，因为它不能被表示成UES，详见标准中文版P17

			char l_BgnQuo = e_IptStrm.cGetNextCha();
			StringBuilder l_Bfr = new StringBuilder();
			l_Bfr.Append(l_BgnQuo);

			e_IptStrm.cFch(true);		// 起始引号不能是UES

			while (!e_IptStrm.cIsOvfl())
			{
				// 压缩器不进行转义，但会处理续行符
				if ('\\' == e_IptStrm.cGetNextCha())
				{
					// 续行符？
					if (e_IptStrm.cChkNext2('\\', '\r', true) || e_IptStrm.cChkNext2('\\', '\n', true))
					{
						e_IptStrm.cMove(+1, true);
						//	eAddTkn_NewLine(); //【注意】字符串字面值里的续行符不算换行！
						e_IptStrm.cSkipNewLine();
						++e_NewLineCnt;
					}
					else
					{
						l_Bfr.Append(e_IptStrm.cGetNextCha());
						l_Bfr.Append(e_IptStrm.cFch(true));	// 字符串字面值里忽略UES
						e_IptStrm.cFch(true);
					}
				}
				else // 遇到结束（单/双）引号
					if (l_BgnQuo == e_IptStrm.cGetNextCha())
					{
						l_Bfr.Append(l_BgnQuo);
						e_IptStrm.cFch(true);	// 结束引号也不能是UES
						break;
					}
					else // 其他字符直接装入
					{
						l_Bfr.Append(e_IptStrm.cGetNextCha());
						e_IptStrm.cFch(true);	// 字符串字面值里忽略UES
					}
			}

			// 添加
			eAddTkn(e_TknList, tTmnl.i_StrLtrl, l_Bfr.ToString());
		}

		private void eScan_StaMchn_NonDivPctu()
		{
			if (e_IptStrm.cChkNext2('<', '=')) { eAddTkn(e_TknList, tTmnl.i_Le, "<="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('>', '=')) { eAddTkn(e_TknList, tTmnl.i_Ge, ">="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('=', '=')) { eAddTkn(e_TknList, tTmnl.i_Eq, "=="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('!', '=')) { eAddTkn(e_TknList, tTmnl.i_Ne, "!="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext3('=', '=', '=')) { eAddTkn(e_TknList, tTmnl.i_Seq, "==="); e_IptStrm.cMove(+3); }
			else if (e_IptStrm.cChkNext3('!', '=', '=')) { eAddTkn(e_TknList, tTmnl.i_Sne, "!=="); e_IptStrm.cMove(+3); }
			else if (e_IptStrm.cChkNext2('+', '+')) { eAddTkn(e_TknList, tTmnl.i_Inc, "++"); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('-', '-')) { eAddTkn(e_TknList, tTmnl.i_Inc, "--"); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('<', '<')) { eAddTkn(e_TknList, tTmnl.i_Lshf, "<<"); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('>', '>')) { eAddTkn(e_TknList, tTmnl.i_Rshf, ">>"); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext3('>', '>', '>')) { eAddTkn(e_TknList, tTmnl.i_UsnRshf, ">>>"); e_IptStrm.cMove(+3); }
			else if (e_IptStrm.cChkNext2('&', '&')) { eAddTkn(e_TknList, tTmnl.i_And, "&&"); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('|', '|')) { eAddTkn(e_TknList, tTmnl.i_Or, "||"); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('+', '=')) { eAddTkn(e_TknList, tTmnl.i_AddAsn, "+="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('-', '=')) { eAddTkn(e_TknList, tTmnl.i_SubAsn, "-="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('*', '=')) { eAddTkn(e_TknList, tTmnl.i_MulAsn, "*="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('%', '=')) { eAddTkn(e_TknList, tTmnl.i_ModAsn, "%="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext3('<', '<', '=')) { eAddTkn(e_TknList, tTmnl.i_LshfAsn, "<<="); e_IptStrm.cMove(+3); }
			else if (e_IptStrm.cChkNext3('>', '>', '=')) { eAddTkn(e_TknList, tTmnl.i_RshfAsn, ">>="); e_IptStrm.cMove(+3); }
			else if (e_IptStrm.cChkNext4('>', '>', '>', '=')) { eAddTkn(e_TknList, tTmnl.i_UsnRshfAsn, ">>>="); e_IptStrm.cMove(+4); }
			else if (e_IptStrm.cChkNext2('&', '=')) { eAddTkn(e_TknList, tTmnl.i_BtwsAndAsn, "&="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('|', '=')) { eAddTkn(e_TknList, tTmnl.i_BtwsOrAsn, "|="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext2('^', '=')) { eAddTkn(e_TknList, tTmnl.i_BtwsXorAsn, "^="); e_IptStrm.cMove(+2); }
			else if (e_IptStrm.cChkNext('{')) { eAddTkn(e_TknList, tTmnl.i_LBrc, "{"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('}')) { eAddTkn(e_TknList, tTmnl.i_RBrc, "}"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('[')) { eAddTkn(e_TknList, tTmnl.i_LBrkt, "["); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext(']')) { eAddTkn(e_TknList, tTmnl.i_RBrkt, "]"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('(')) { eAddTkn(e_TknList, tTmnl.i_LPrth, "("); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext(')')) { eAddTkn(e_TknList, tTmnl.i_RPrth, ")"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('.')) { eAddTkn(e_TknList, tTmnl.i_Dot, "."); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext(';')) { eAddTkn(e_TknList, tTmnl.i_Smcln, ";"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext(',')) { eAddTkn(e_TknList, tTmnl.i_Cma, ","); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('<')) { eAddTkn(e_TknList, tTmnl.i_Lt, "<"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('>')) { eAddTkn(e_TknList, tTmnl.i_Gt, ">"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('+')) { eAddTkn(e_TknList, tTmnl.i_Add, "+"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('-')) { eAddTkn(e_TknList, tTmnl.i_Sub, "-"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('*')) { eAddTkn(e_TknList, tTmnl.i_Mul, "*"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('%')) { eAddTkn(e_TknList, tTmnl.i_Mod, "%"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('&')) { eAddTkn(e_TknList, tTmnl.i_BtwsAnd, "&"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('|')) { eAddTkn(e_TknList, tTmnl.i_BtwsOr, "|"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('^')) { eAddTkn(e_TknList, tTmnl.i_BtwsXor, "^"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('!')) { eAddTkn(e_TknList, tTmnl.i_Not, "!"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('~')) { eAddTkn(e_TknList, tTmnl.i_Ngt, "~"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('?')) { eAddTkn(e_TknList, tTmnl.i_Qstn, "?"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext(':')) { eAddTkn(e_TknList, tTmnl.i_Cln, ":"); e_IptStrm.cMove(+1); }
			else if (e_IptStrm.cChkNext('=')) { eAddTkn(e_TknList, tTmnl.i_Asn, "="); e_IptStrm.cMove(+1); }
			else
			{
				// 就剩“/”“/=”
				var l_Cha = e_IptStrm.cFch(false);
				throw new Exception("未捕捉的标点符号“" + l_Cha + "”。");
			}
		}

		private void eScan_StaMchn_Id()
		{
			StringBuilder l_Bfr = new StringBuilder();

			while (!e_IptStrm.cIsOvfl())
			{
				if (seIsIdCha(e_IptStrm.cGetNextCha(), this.e_Which))
				{
					l_Bfr.Append(e_IptStrm.cGetNextCha());
					e_IptStrm.cFch(false);
				}
				else
				{
					break;
				}
			}

			var l_IdName = l_Bfr.ToString();
			eAddTkn(e_TknList, seMapId(l_IdName), l_IdName);
		}

		/// <summary>
		/// 预处理
		/// </summary>
		private void ePpcs()
		{
			List<tTkn> l_Tmp = new List<tTkn>();
			ePpcs_Add(l_Tmp, 0, e_TknList.Count);
			e_TknList = l_Tmp;
		}

		private void ePpcs_Add(List<tTkn> a_Tmp, int a_Bgn, int a_Lmt)
		{
			int l_Idx = a_Bgn;		// 从a_Bgn开始
			while (l_Idx < a_Lmt)	// 止于a_Lmt
			{
				// 预处理指令
				if (tTmnl.i_PpcsDctv == e_TknList[l_Idx].c_Tmnl)
				{
					var l_DctvName = e_TknList[l_Idx].c_Attr.ToString();
					if ("include" == l_DctvName)
					{
						ePpcs_Add_include(a_Tmp, ref l_Idx);
					}
					else
					{
						throw new Exception("未知的预处理指令“" + l_DctvName + "”！");
					}
				}
				else // 换行，注意，当预处理结束后，可能会留下多余的换行，调用eAddTkn_NewLine重新添加
					if (tTmnl.i_NewLine == e_TknList[l_Idx].c_Tmnl)
					{
						eAddTkn_NewLine(a_Tmp, e_TknList[l_Idx].c_Row - 1);	// 保持行信息
						++l_Idx;						// 下一个词法单元
					}
					else
					{
						a_Tmp.Add(e_TknList[l_Idx]);	// 这一个词法单元
						++l_Idx;						// 下一个词法单元
					}
			}
		}

		private void ePpcs_Add_include(List<tTkn> a_Tmp, ref int a_Idx)
		{
			++a_Idx;	// 跳过include

			// 寻找预处理指令“endinclude”
			var l_EndIdx = seFindByAttr(e_TknList, a_Idx, "endinclude");
			if (l_EndIdx < 0)
			{
				throw new Exception("缺失预处理指令“endinclude”！");
			}

			//【说明】
			// 还是强制按照文件名合并吧！以便容易知道在一个名字空间里哪些文件是最基本的

			// 下一个
			a_Idx = l_EndIdx + 1;
		}

		/// <summary>
		/// 修剪换行
		/// </summary>
		private void eTrimNewLine()
		{
			List<tTkn> l_Tmp = new List<tTkn>();
			eTrimNewLine_Add(l_Tmp, 0, e_TknList.Count, true);
			e_TknList = l_Tmp;
		}

		private void eTrimNewLine_Add(List<tTkn> a_Tmp, int a_Bgn, int a_Lmt, bool a_MidPsrv)
		{
			//【修剪换行模式】
			//1		换行，是否保留参考但不取决于a_MidPsrv
			//2		do{...}while(...);
			//3		case LtrlOrId:表达式;
			//		case LtrlOrId:表达式;break;
			//		case LtrlOrId:{...}
			//		case LtrlOrId:{...}break;
			//4		else if
			//		else 表达式;
			//		else{...}
			//5		catch(...){...}
			//6		finally{...}
			//7		for(...)表达式;
			//		for(...){...}
			//8		switch(...){...}
			//9		while(...)表达式;
			//		while(...){...}
			//10	=function LtrlOrId(...){...}	——具名函数表达式赋值
			//		=function(...){...}				——匿名函数表达式赋值
			//		function LtrlOrId(...){...}		——具名函数定义，前面只能是“{ } ;”，其他的说明这是函数表达式
			//		function(...){...}				——匿名函数定义
			//11	with(...){...}
			//12	default:表达式;
			//		default:表达式;break;
			//		default:{...}
			//		default:{...}break;
			//13	if(...)表达式;
			//		if(...){...}
			//14	try{...}
			//15	={...}		——对象字面值赋值
			//		[{...}		——对象字面值属性存取
			//		({...}		——对象字面值实参
			//		,{...}		——对象字面值实参
			//		{...}		——块语句
			//16	Id(...)		——函数调用
			//		(Id)(...)
			//		Id[Id](...)

			tTkn l_Tkn_Kwd = null;

			int l_Idx = a_Bgn;		// 从a_Bgn开始
			while (l_Idx < a_Lmt)	// 止于a_Lmt
			{
				//if ( <= l_Idx)	// 帮助定位数组越界
				//{
				//	int z=0;
				//}

				// 1
				if (tTmnl.i_NewLine == e_TknList[l_Idx].c_Tmnl)
				{
					// 如果中间的建议保留
					if (a_MidPsrv)
					{
						bool l_Add = true;

						// 如果前一个词法单元是字面值或标识符，或数组元素，或子表达式
						// 此时下一个词法单元一定不是无需前附换行的词法单元，把这个换行替换成分号
						if ((l_Idx > 0) &&
							(seIsLtrlOrId(e_TknList[l_Idx - 1].c_Tmnl) ||
							(tTmnl.i_RBrkt == e_TknList[l_Idx - 1].c_Tmnl) ||
							(tTmnl.i_RPrth == e_TknList[l_Idx - 1].c_Tmnl)))
						{
							l_Add = false;
							eChgNewLineToSmcln(a_Tmp, e_TknList, l_Idx);

							if ((l_Idx + 1 < e_TknList.Count) &&
								seIsPrevNewLineFree(e_TknList[l_Idx + 1].c_Tmnl))
							{
								var l_Row = e_TknList[l_Idx].c_Row;
								throw new Exception("行(" + l_Row + ")：无需前附换行的词法单元的前面发现换行符！");
							}
						}
						else // 如果前一个词法单元是“++ --”
							if ((l_Idx > 0) &&
								((tTmnl.i_Inc == e_TknList[l_Idx - 1].c_Tmnl) || (tTmnl.i_Dec == e_TknList[l_Idx - 1].c_Tmnl)))
							{
								l_Add = false;

								// 如果更前方是字面值或标识符，一定是后缀，替换分号
								if (seIsLtrlOrId(e_TknList[l_Idx - 2].c_Tmnl))
								{
									eChgNewLineToSmcln(a_Tmp, e_TknList, l_Idx);
								}
								else // 否则一定是前缀，只需移除换行，但不要替换分号！
								{
									//
								}
							}

						if (l_Add)
						{
							a_Tmp.Add(e_TknList[l_Idx]);	// 添加这一个词法单元
						}
					}

					++l_Idx;						// 进入下一个词法单元
				}
				else // 2
				if (tTmnl.i_do == e_TknList[l_Idx].c_Tmnl)
				{
					eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_do, tTmnl.i_LBrc, true, true);		// do{...}
					eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_while, tTmnl.i_LPrth, false, false);	// while(...);
					a_Tmp.Add(e_TknList[l_Idx++]);			// ;
					eTrimNewLine_SkipNewLine(ref l_Idx);	// 跳过换行
				}
				else // 3
				if (tTmnl.i_case == e_TknList[l_Idx].c_Tmnl)
				{
					eTrimNewLine_Add_CaseDefault(a_Tmp, ref l_Idx, true);
				}
				else // 4
				if (tTmnl.i_else == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = e_TknList[l_Idx++];	// else
					a_Tmp.Add(l_Tkn_Kwd);

					if (tTmnl.i_if != e_TknList[l_Idx].c_Tmnl)	// 若是if，留给下一次迭代if的分支处理
					{
						eTrimNewLine_Add_ExpOrBlk(a_Tmp, ref l_Idx, l_Tkn_Kwd);	// 表达式或{...}
					}
				}
				else // 5
				if (tTmnl.i_catch == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_catch, tTmnl.i_LPrth, false, true);	// catch(...)
					eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, l_Tkn_Kwd, tTmnl.i_LBrc, true, true);						// {...}
				}
				else // 6
				if (tTmnl.i_finally == e_TknList[l_Idx].c_Tmnl)
				{
					eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_finally, tTmnl.i_LBrc, true, true);	// finally{...}
				}
				else // 7
				if (tTmnl.i_for == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_for, tTmnl.i_LPrth, false, true);		// for(...)
					eTrimNewLine_Add_ExpOrBlk(a_Tmp, ref l_Idx, l_Tkn_Kwd);													// 表达式或{...}
				}
				else // 8
				if (tTmnl.i_switch == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_switch, tTmnl.i_LPrth, false, true);	// switch(...)
					eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, l_Tkn_Kwd, tTmnl.i_LBrc, true, true);						// {...}
				}
				else // 9
				if (tTmnl.i_while == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_while, tTmnl.i_LPrth, false, true);	// while(...)
					eTrimNewLine_Add_ExpOrBlk(a_Tmp, ref l_Idx, l_Tkn_Kwd);													// 表达式或{...}
				}
				else // 10
				if (tTmnl.i_function == e_TknList[l_Idx].c_Tmnl)
				{
					bool l_FexpAsn = (l_Idx > 0) && (tTmnl.i_Asn == e_TknList[l_Idx - 1].c_Tmnl);	// 函数表达式赋值？

					l_Tkn_Kwd = e_TknList[l_Idx++];
					a_Tmp.Add(l_Tkn_Kwd);			// function
					eTrimNewLine_SkipNewLine(ref l_Idx);	// 跳过换行

					if (seIsId(e_TknList[l_Idx].c_Tmnl))	// 具名
					{
						a_Tmp.Add(e_TknList[l_Idx++]);			// Id
						eTrimNewLine_SkipNewLine(ref l_Idx);	// 跳过换行
					}

					// 函数表达式赋值的右花后确保有分号或逗号
					eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, l_Tkn_Kwd, tTmnl.i_LPrth, false, true);			// (...)
					eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, l_Tkn_Kwd, tTmnl.i_LBrc, true, (!l_FexpAsn));	// {...}
				}
				else // 11
				if (tTmnl.i_with == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_with, tTmnl.i_LPrth, false, true);	// with(...)
					eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, l_Tkn_Kwd, tTmnl.i_LBrc, true, true);						// {...}
				}
				else // 12
				if (tTmnl.i_default == e_TknList[l_Idx].c_Tmnl)
				{
					eTrimNewLine_Add_CaseDefault(a_Tmp, ref l_Idx, false);
				}
				else // 13
				if (tTmnl.i_if == e_TknList[l_Idx].c_Tmnl)
				{
					l_Tkn_Kwd = eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_if, tTmnl.i_LPrth, false, true);	// if(...)
					eTrimNewLine_Add_ExpOrBlk(a_Tmp, ref l_Idx, l_Tkn_Kwd);												// 表达式或{...}
				}
				else // 14
				if (tTmnl.i_try == e_TknList[l_Idx].c_Tmnl)
				{
					eTrimNewLine_Add_KwdPairBbp(a_Tmp, ref l_Idx, tTmnl.i_try, tTmnl.i_LBrc, true, true);	// try{...}
				}
				else // 15
				if (tTmnl.i_LBrc == e_TknList[l_Idx].c_Tmnl)
				{
					// 对象字面值里不需要分号（若字段的值是函数，则递归解决），所以不必保留换行，可大胆移除
					// 至于右花后的换行，除非调用者要求直接跳过换行，否则确保以分号逗号右花结束
					bool l_ObjLtrl = (l_Idx > 0) &&
					((tTmnl.i_Asn == e_TknList[l_Idx - 1].c_Tmnl) ||		// ={...}
					(tTmnl.i_LBrkt == e_TknList[l_Idx - 1].c_Tmnl) ||		// [{...}
					(tTmnl.i_LPrth == e_TknList[l_Idx - 1].c_Tmnl) ||		// ({...}
					(tTmnl.i_Cma == e_TknList[l_Idx - 1].c_Tmnl));			// ,{...}
					bool l_LtrlAsn = (l_Idx > 0) && (tTmnl.i_Asn == e_TknList[l_Idx - 1].c_Tmnl);
				//	eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, null, tTmnl.i_LBrc, !l_ObjLtrl, ((!l_LtrlAsn) || a_MidPsrv));//【待定】似乎下面的正确！为什么？
					eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, null, tTmnl.i_LBrc, !l_ObjLtrl, ((!l_LtrlAsn) || (!a_MidPsrv)));

					// 是什么？
					if (l_ObjLtrl)
					{
						//
					}
					else // 块语句
					{
						//
					}
				}
				else // 16
				if (tTmnl.i_LPrth == e_TknList[l_Idx].c_Tmnl)
				{
					// Id(...)
					// (Id)(...)
					// Id[Id](...)
					// 注意不会是换行，因为左圆属于无需前附换行的词法单元
					if ((l_Idx > 0) &&
					(a_Tmp[a_Tmp.Count - 1] == e_TknList[l_Idx - 1]) && // 若前一个已被添加至a_Tmp，即没有发生换行移除、分号替换等
					((seIsId(e_TknList[l_Idx - 1].c_Tmnl)) ||
					(tTmnl.i_RBrkt == e_TknList[l_Idx - 1].c_Tmnl) ||
					(tTmnl.i_RPrth == e_TknList[l_Idx - 1].c_Tmnl)))
					{
						//	e_RptBfr.AppendLine("函数调用	" + + e_TknList[l_Idx - 1].c_Row + ", " + e_TknList[l_Idx - 1].c_Attr.ToString());

						// 右圆后若是换行，确保分号，虽然可以后跟其他符号，如左圆，
						// 但那些符号都是无需前附换行的词法单元，但却出现了换行，说明不是那些符号
						eTrimNewLine_Add_PairBbp(a_Tmp, ref l_Idx, null, tTmnl.i_LPrth, false, false);	// (...)
					}
					else // 其他，直接添加
					{
						a_Tmp.Add(e_TknList[l_Idx]);	// 添加这一个词法单元
						++l_Idx;						// 进入下一个词法单元
					}
				}
				else // 其他，直接添加
				{
					a_Tmp.Add(e_TknList[l_Idx]);	// 添加这一个词法单元
					++l_Idx;						// 进入下一个词法单元
				}
			}

			// 如果最后一个是换行，移除
			if (tTmnl.i_NewLine == a_Tmp[a_Tmp.Count - 1].c_Tmnl)
			{
				//	a_Tmp.RemoveAt(a_Tmp.Count - 1);	//【应该不是】
				Console.WriteLine("最后一个词法单元应该不会是换行！！！");
			}
		}

		private void eTrimNewLine_Add_CaseDefault(List<tTkn> a_Tmp, ref int a_Idx, bool a_Case)
		{
			tTkn l_Tkn_Kwd = e_TknList[a_Idx++];	// case/default
			a_Tmp.Add(l_Tkn_Kwd);
			eTrimNewLine_SkipNewLine(ref a_Idx);	// 跳过换行

			if (a_Case)
			{
				eAstTkn(seIsLtrlOrId, "seIsLtrlOrId", a_Idx);	// 一定是字面值或标识符
				a_Tmp.Add(e_TknList[a_Idx++]);					// LtrlOrId
			}

			eAstTkn(tTmnl.i_Cln, a_Idx);						// 一定是冒号
			a_Tmp.Add(e_TknList[a_Idx++]);						// :
			eTrimNewLine_Add_ExpOrBlk(a_Tmp, ref a_Idx, l_Tkn_Kwd);		// 表达式或{...}
		}

		private void eTrimNewLine_Add_ExpOrBlk(List<tTkn> a_Tmp, ref int a_Idx, tTkn a_Tkn_Kwd)
		{
			if (tTmnl.i_LBrc == e_TknList[a_Idx].c_Tmnl)	// 如果是{
			{
				eTrimNewLine_Add_PairBbp(a_Tmp, ref a_Idx, a_Tkn_Kwd, tTmnl.i_LBrc, true, true);	// {...}
			}
			else // 表达式
			{
				int l_SNC = seFindNextSmclnOrNewLineOrClsBrc(e_TknList, a_Idx);
				if (tLex.tTmnl.i_Smcln == e_TknList[l_SNC].c_Tmnl)		// 表达式 ;
				{
					// 什么都不做，因为行没有在这里中断
				}
				else
					if (tLex.tTmnl.i_NewLine == e_TknList[l_SNC].c_Tmnl)	// 表达式 换行
					{
						eChgNewLineToSmcln(null, e_TknList, l_SNC);	// 把换行改成分号
					}
					else
						if (tLex.tTmnl.i_RBrc == e_TknList[l_SNC].c_Tmnl)		// 表达式 }
						{
							// 这个右花交给所属结构顶级关键字（如if、switch）的分支处理！
						}
			}
		}

		private tTkn eTrimNewLine_Add_KwdPairBbp(List<tTkn> a_Tmp, ref int a_Idx, tTmnl a_Kwd, tTmnl a_OpenBbp,
							bool a_MidPsrv, bool a_EndSkip)	// 中间的换行保留？结尾的跳过还是确保分号？
		{
			eAstTkn(a_Kwd, a_Idx);											// 现在一定是a_Kwd
			var l_Tkn_Kwd = e_TknList[a_Idx++];
			a_Tmp.Add(l_Tkn_Kwd);											// a_Kwd
			eTrimNewLine_SkipNewLine(ref a_Idx);							// 跳过换行
			eTrimNewLine_Add_PairBbp(a_Tmp, ref a_Idx, l_Tkn_Kwd, a_OpenBbp, a_MidPsrv, a_EndSkip);	// 左括号...右括号
			return l_Tkn_Kwd;
		}

		private void eTrimNewLine_Add_PairBbp(List<tTkn> a_Tmp, ref int a_Idx, tTkn a_Ownr, tTmnl a_OpenBbp,
							bool a_MidPsrv, bool a_EndSkip)
		{
			eAstTkn(a_OpenBbp, a_Idx);										// 现在一定是左括号
			var l_PairIdx = seFindPairBbp(e_TknList, e_TknList[a_Idx]);		// 找到配对的右括号
			a_Tmp.Add(e_TknList[l_PairIdx.Item1]);							// 左括号
			eTrimNewLine_Add(a_Tmp, l_PairIdx.Item1 + 1, l_PairIdx.Item2, a_MidPsrv);	// 间接递归添加
			a_Tmp.Add(e_TknList[l_PairIdx.Item2]);							// 右括号
			a_Idx = l_PairIdx.Item2 + 1;									// 右括号后的词法单元

			if (a_EndSkip)
			{
				eTrimNewLine_SkipNewLine(ref a_Idx);	// 跳过换行
			}
			else
			{
				eTrimNewLine_EnsrSmcln(ref a_Idx);		// 确保分号
			}

			// 如果是左花
			if (tTmnl.i_LBrc == a_OpenBbp)
			{
				e_TknList[l_PairIdx.Item1].c_Ownr = a_Ownr;
				e_TknList[l_PairIdx.Item2].c_Ownr = a_Ownr;
			}
		}

		private void eTrimNewLine_SkipNewLine(ref int a_Idx)
		{
			if ((a_Idx < e_TknList.Count) && (tTmnl.i_NewLine == e_TknList[a_Idx].c_Tmnl))
			{
				++a_Idx;
			}
		}

		private void eTrimNewLine_EnsrSmcln(ref int a_Idx)
		{
			if ((a_Idx < e_TknList.Count) && (tTmnl.i_NewLine == e_TknList[a_Idx].c_Tmnl))
			{
				eChgNewLineToSmcln(null, e_TknList, a_Idx); // 把换行改成分号
			}
		}

		private void eAstTkn(tTmnl a_Tmnl, int a_Idx)
		{
			if (a_Tmnl != e_TknList[a_Idx].c_Tmnl)
			{
				throw new Exception("eAstTkn：应该是“" + a_Tmnl.ToString() + "”，实际却是“" + e_TknList[a_Idx].c_Tmnl.ToString() + "”！");
			}
		}

		private void eAstTkn(Func<tTmnl, bool> a_fAst, string a_Name, int a_Idx)
		{
			if (!a_fAst(e_TknList[a_Idx].c_Tmnl))
			{
				throw new Exception("eAstTkn：“bool " + a_Name + "(tTmnl)”返回false！");
			}
		}

		/// <summary>
		/// 解析依赖
		/// </summary>
		private void ePseDpdc()
		{
			// 查找“stAsynIcld”
			int l_AsynIcldIdx = 0;
			for (; l_AsynIcldIdx < e_TknList.Count; ++l_AsynIcldIdx)
			{
				if ((tTmnl.i_Id == e_TknList[l_AsynIcldIdx].c_Tmnl) && ("stAsynIcld" == e_TknList[l_AsynIcldIdx].c_Attr.ToString()))
				{
					break;
				}
			}

			if (l_AsynIcldIdx < e_TknList.Count)
			{
				// 序列：stAsynIcld . cFromLib ( "?" , [ ... ] , a_fCabk ...
				var l_Tkn_Dot = (l_AsynIcldIdx + 1 < e_TknList.Count) ? e_TknList[l_AsynIcldIdx + 1] : null;
				var l_Tkn_LPrth = (l_AsynIcldIdx + 3 < e_TknList.Count) ? e_TknList[l_AsynIcldIdx + 3] : null;
				var l_Tkn_Cma = (l_AsynIcldIdx + 5 < e_TknList.Count) ? e_TknList[l_AsynIcldIdx + 5] : null;
				var l_Tkn_LBrkt = (l_AsynIcldIdx + 6 < e_TknList.Count) ? e_TknList[l_AsynIcldIdx + 6] : null;
				if ((null != l_Tkn_Dot) && (l_Tkn_Dot.c_Tmnl == tTmnl.i_Dot) &&
					(null != l_Tkn_LPrth) && (l_Tkn_LPrth.c_Tmnl == tTmnl.i_LPrth) &&
					(null != l_Tkn_Cma) && (l_Tkn_Cma.c_Tmnl == tTmnl.i_Cma) &&
					(null != l_Tkn_LBrkt) && (l_Tkn_LBrkt.c_Tmnl == tTmnl.i_LBrkt))
				{
					// 默认目录，剪掉两端的引号
					var l_DftLibDiry = e_TknList[l_AsynIcldIdx + 4].c_Attr.ToString();
					l_DftLibDiry = l_DftLibDiry.Substring(1, l_DftLibDiry.Length - 2);

					var l_PairBrkt = seFindPairBbp(e_TknList, l_Tkn_LBrkt); // 找到配对右方括号
					for (int l_FlnmIdx = l_PairBrkt.Item1 + 1; l_FlnmIdx < l_PairBrkt.Item2; ++l_FlnmIdx)
					{
						if (e_TknList[l_FlnmIdx].c_Tmnl != tTmnl.i_StrLtrl) // 跳过非字符串字面值
						{ continue; }

						string l_Flnm = e_TknList[l_FlnmIdx].c_Attr.ToString();
						if (l_Flnm.IndexOf(':') < 0) // 只考虑本目录
						{
							// 注意，起始结尾都是引号！
							this.e_DpdcList.Add(l_Flnm.Substring(1, l_Flnm.Length - 2));
						}
					}
				}
			}
		}

		/// <summary>
		/// 输出
		/// </summary>
		private void eOpt()
		{
			e_OptStrm = new tChaOptStrm();

			// 用于压缩器改进
			List<int> l_NewLineTknIdxAry = new List<int>();

			// 用于判断是否位于CSS选择器里
			int l_LBrcCnt = 0;

			// 对每个词法单元
			for (int i = 0; i < e_TknList.Count; ++i)
			{
				// 可能会有tTkn.ui_None
				if (tTkn.ui_None == e_TknList[i])
				{
					continue;
				}

				// 根据自动分号插入第一条规则，右花前的分号可省，详见标准中文版P33
				if ((2 == this.e_Which) &&
					(tTmnl.i_Smcln == e_TknList[i].c_Tmnl) &&
					(i + 1 < e_TknList.Count) && (tTmnl.i_RBrc == e_TknList[i + 1].c_Tmnl))
				{
					continue;
				}

				// CSS选择器判断
				if (3 == this.e_Which)
				{
					// 左花？
					if (tTmnl.i_LBrc == e_TknList[i].c_Tmnl)
					{
						++l_LBrcCnt; // 递增计数
					}
					else // 右花？
					if (tTmnl.i_RBrc == e_TknList[i].c_Tmnl)
					{
						--l_LBrcCnt; // 递减计数
					}
				}		

				// 取得词法单元的源代码
				string l_Code = e_TknList[i].c_Attr.ToString();	// 调用虚函数ToString，类型不一定是Object

				// 如果是换行，记录并输出报告，表示还可以继续改进
				if (tTmnl.i_NewLine == e_TknList[i].c_Tmnl)
				{
					l_NewLineTknIdxAry.Add(i);
				}
				else
				if (2 == this.e_Which) // JS
				{
					// 如果“关键保留字字面值标识符”后面仍是“关键保留字字面值标识符”，跟上一个空格
					if ((i + 1 < e_TknList.Count) &&
						seIsKrwdOrLtrlOrId(e_TknList[i].c_Tmnl) &&
						seIsKrwdOrLtrlOrId(e_TknList[i + 1].c_Tmnl))
					{
						l_Code += ' ';
					}
				}
				else
				if (3 == this.e_Which) // CSS
				{
					// 当词法单元后跟空白
					// 如果在选择器里，且当前非“,:>}”，且下一个非“{(>”
					if (e_TknList[i].c_FlwByWhtSpc)
					{
						if (0 == l_LBrcCnt)
						{
							if ((tTmnl.i_Cma != e_TknList[i].c_Tmnl) &&
								(tTmnl.i_Cln != e_TknList[i].c_Tmnl) &&
								(tTmnl.i_Gt != e_TknList[i].c_Tmnl) &&
								(tTmnl.i_RBrc != e_TknList[i].c_Tmnl) &&
								(i + 1 < e_TknList.Count) &&
								(tTmnl.i_LBrc != e_TknList[i + 1].c_Tmnl) &&
								(tTmnl.i_LPrth != e_TknList[i + 1].c_Tmnl) &&
								(tTmnl.i_Gt != e_TknList[i + 1].c_Tmnl))
							{
								l_Code += ' ';
							}
						}
					}
				}

				// 先写入输出流
				this.e_OptStrm.cPut(l_Code);
			}

			// 提交输出给压缩器
			e_OptBfr.Append(e_OptStrm.ToString());

			// 输出压缩效果
			double l_Rat = (double)e_OptStrm.cGetLen() / (double)e_SrcText.Length;
			l_Rat = Math.Floor(l_Rat * 10000 + 0.5) / 100;

			e_RptBfr.AppendLine();
			e_RptBfr.AppendLine("《压缩效果》");
			e_RptBfr.AppendLine(e_SrcText.Length + " → " + e_OptStrm.cGetLen() + "，比例 = " + l_Rat + "％");
			e_RptBfr.AppendLine();

			// 压缩器改进建议：找出所有换行，并输出前后的词法单元
			e_RptBfr.AppendLine("《压缩器改进建议》");

			if (l_NewLineTknIdxAry.Count > 0)
			{
				e_RptBfr.AppendLine("在以下地方发现换行：");

				for (int n = 0; n < l_NewLineTknIdxAry.Count; ++n)
				{
					var l_Idx = l_NewLineTknIdxAry[n];
					var l_PrevTkn = e_TknList[l_Idx - 1]; // 第一个词法单元肯定不是换行
					var l_NextTkn = (l_Idx + 1 < e_TknList.Count) ? e_TknList[l_Idx + 1] : null;
					var l_Ctnt = "行(" + e_TknList[l_Idx].c_Row + ")\t";

					l_Ctnt += l_PrevTkn.c_Tmnl.ToString() + "＝" + l_PrevTkn.c_Attr.ToString() + "，←┘，";
					if (null != l_NextTkn)
					{
						l_Ctnt += l_NextTkn.c_Tmnl.ToString() + "＝" + l_NextTkn.c_Attr.ToString();
					}
					e_RptBfr.AppendLine(l_Ctnt);
				}
			}
			else
			{
				e_RptBfr.AppendLine("无");
			}
			e_RptBfr.AppendLine();
		}

		//-------- 函数

		/// <summary>
		/// 查找词法单元
		/// </summary>
		private int eFindTkn(List<tTkn> a_TknList, tTkn a_Tkn)
		{
			return a_TknList.LastIndexOf(a_Tkn);	// 从后向前找
		}

		/// <summary>
		/// 获取前一个词法单元
		/// </summary>
		private tTkn eGetLastTkn(List<tTkn> a_TknList, int a_Idx = -1)
		{
			if (a_Idx < 0)
			{
				a_Idx = a_TknList.Count;	// 即将加入的索引恰为当前数量
			}

			return (a_Idx < 0) ? tTkn.ui_None : a_TknList[a_Idx - 1];
		}

		/// <summary>
		/// 获取前一个非换行词法单元
		/// </summary>
		private tTkn eGetLastNonNewLineTkn(List<tTkn> a_TknList, int a_Idx = -1)
		{
			if (a_Idx < 0)
			{
				a_Idx = a_TknList.Count;	// 即将加入的索引恰为当前数量
			}

			for (int i = a_Idx - 1; i >= 0; --i)
			{
				if (tTmnl.i_NewLine != a_TknList[i].c_Tmnl)
				{
					return a_TknList[i];
				}
			}
			return tTkn.ui_None;
		}

		/// <summary>
		/// 前一个词法单元是换行？
		/// </summary>
		private bool eIsLastTknNewLine(List<tTkn> a_TknList, int a_Idx = -1)
		{
			if (a_Idx < 0)
			{
				a_Idx = a_TknList.Count;	// 即将加入的索引恰为当前数量
			}

			return (a_Idx <= 0) ? false : (tTmnl.i_NewLine == a_TknList[a_Idx - 1].c_Tmnl);
		}

		/// <summary>
		/// 前一个词法单元是分号？
		/// </summary>
		private bool eIsLastTknSmcln(List<tTkn> a_TknList, int a_Idx = -1)
		{
			if (a_Idx < 0)
			{
				a_Idx = a_TknList.Count;	// 即将加入的索引恰为当前数量
			}

			return (a_Idx <= 0) ? false : (tTmnl.i_Smcln == a_TknList[a_Idx - 1].c_Tmnl);
		}

		private void eRmvLastTkn(List<tTkn> a_TknList, int a_Idx = -1)
		{
			if (a_Idx < 0)
			{
				a_Idx = a_TknList.Count;	// 即将加入的索引恰为当前数量
			}

			if (a_Idx - 1 >= 0)
			{
				a_TknList.RemoveAt(a_Idx - 1);
			}
		}

		private void eChgNewLineToSmcln(List<tTkn> a_Dst, List<tTkn> a_Src, int a_Idx = -1) // 把换行改成分号
		{
			if (a_Idx < 0)
			{
				a_Idx = a_Src.Count - 1;	// 默认最后一个
			}

			if (tTmnl.i_NewLine != a_Src[a_Idx].c_Tmnl)
			{
				throw new InvalidOperationException("不是换行，不能换成分号！");
			}

			var l_Row = a_Src[a_Idx].c_Row;
			if (null != a_Dst)
			{
				a_Dst.Add(new tTkn(tTmnl.i_Smcln, ";", l_Row));
			}
			else
			{
				a_Src[a_Idx].c_Tmnl = tTmnl.i_Smcln;
				a_Src[a_Idx].c_Attr = ";";
			}

			e_RptBfr.AppendLine("行(" + l_Row + ")：换行被替换成分号！");
		}

		private void eAddTkn(List<tTkn> a_TknList, tTmnl a_Tmnl, object a_Attr, int a_NewLineCnt = -1)
		{
			if (a_NewLineCnt < 0)
			{
				a_NewLineCnt = e_NewLineCnt;
			}

			// 新行，转交
			if (tTmnl.i_NewLine == a_Tmnl)
			{
				eAddTkn_NewLine(a_TknList, a_NewLineCnt);
				return;
			}

			// 如果前一个词法单元是换行，根据情况进行移除
			if (eIsLastTknNewLine(a_TknList))
			{
				// 取得前一个非换行词法单元
				var l_LastNonNewLineTkn = eGetLastNonNewLineTkn(a_TknList);

				// 如果现在是无需前附换行的词法单元
				if (seIsPrevNewLineFree(a_Tmnl))
				{
					eRmvLastTkn(a_TknList);
				}
				else // 如果前一个非换行词法单元是三个右括号
					if (seIsClsBbp(l_LastNonNewLineTkn.c_Tmnl))
					{
						// 如果现在是分号，就可以移除换行！
						if ((tTmnl.i_Smcln == a_Tmnl))
						{
							eRmvLastTkn(a_TknList);
						}
						else // 连续两个右花也可以紧连在一起！自动分号插入第一条规则，详见标准中文版P33
							if ((tTmnl.i_RBrc == a_Tmnl) && (tTmnl.i_RBrc == l_LastNonNewLineTkn.c_Tmnl))
							{
								eRmvLastTkn(a_TknList);
							}
					}
					else
						// 现在前面的词法单元不是三个右括号，确保这一点非常重要：
						// 三个右括号可能括起某个可以赋予或运算的东西，如
						// }：赋值或字段定义里的对象字面值或函数表达式
						// ]：运算里的数组元素运算数
						// )：运算里的子表达式
						// 当新来的词法单元是二元运算符时，上面的seIsPureBnrOpt分支就能将这个换行移除

						// 如果现在是标点，移除换行
						if (seIsPctu(a_Tmnl))
						{
							// 注意左花用作块语句起始符号时，前面的赋值语句可能没有以分号结尾
							// 这种情况可以留到后来的修剪过程再处理
							if (tTmnl.i_LBrc != a_Tmnl)
							{
								eRmvLastTkn(a_TknList);
							}
						}
						else // 如果现在是关键保留字
							if (seIsKrwd(a_Tmnl))
							{
								// 如果前一个非换行词法单元是除三种右括号以外的标点，或关键保留字		
								if (seNotClsBbpPctu(l_LastNonNewLineTkn.c_Tmnl) ||
									seIsKrwd(l_LastNonNewLineTkn.c_Tmnl))
								{
									eRmvLastTkn(a_TknList);
								}
								else // 若现在是else，右花也行
									if ((tTmnl.i_else == a_Tmnl) && (tTmnl.i_RBrc == l_LastNonNewLineTkn.c_Tmnl))
									{
										eRmvLastTkn(a_TknList);
									}
							}
							else // 如果现在是字面值或标识符
								if (seIsLtrlOrId(a_Tmnl))
								{
									// 如果前一个非换行词法单元是除三种右括号以外的标点
									// 注意，关键保留字不行，因此时可能有自动分号插入，详见标准中文版P33
									if (seNotClsBbpPctu(l_LastNonNewLineTkn.c_Tmnl))
									{
										eRmvLastTkn(a_TknList);
									}
									//else // 前一个是++，--	【不行】还要看更前面的是什么！若是标识符，说明是后缀，留到修剪过程再处理
									//if ((tTmnl.i_Inc == l_LastNonNewLineTkn.c_Tmnl) || (tTmnl.i_Dec == l_LastNonNewLineTkn.c_Tmnl))
									//{
									//	// 应该作为前缀，移除换行
									//	eRmvLastTkn(a_TknList);
									//}
									else // 前一个是半一元二元
										if (seIsSemiUnrBnrOpt(l_LastNonNewLineTkn.c_Tmnl))
										{
											// 如果向前数第二个非换行词法单元是字面值或标识符，证明是二元，此时可移除换行
											int l_LastNonNewLineTknIdx = eFindTkn(a_TknList, l_LastNonNewLineTkn);
											tTkn l_LastNonNewLineTkn2 = eGetLastNonNewLineTkn(a_TknList, l_LastNonNewLineTknIdx);
											if (seIsLtrlOrId(l_LastNonNewLineTkn2.c_Tmnl))
											{
												eRmvLastTkn(a_TknList);
											}
										}
								}
			}

			// 现在前一个词法单元仍然可能是换行……

			// 跳过连续多个分号，但“for ( 表达式 ; ; )”除外
			if (seIsSmcln(a_Tmnl) && seIsSmcln(eGetLastTkn(a_TknList).c_Tmnl))
			{
				// 这里的算法是：
				// 1. 向前找到for，若未找到，直接返回
				// 2. 找到后，for的下一个词法单元一定是“(”（若有换行，则在加入左圆时已被移除），
				// 3. 找到配对的“)”，若未找到，说明正在for的条件里，不要返回，否则返回
				// 简言之，当最后的分号不在for的圆括号里时，返回

				var l_ForIdx = a_TknList.FindLastIndex(a_TknList.Count - 1, (a_Tkn) => { return tTmnl.i_for == a_Tkn.c_Tmnl; });
				if (l_ForIdx < 0)
				{
					return;
				}

				if (tTmnl.i_LPrth != a_TknList[l_ForIdx + 1].c_Tmnl)
				{
					throw new Exception("for的下一个词法单元一定是“(”");
				}

				if (!seInBbp(a_TknList, a_TknList[l_ForIdx + 1], eGetLastTkn(a_TknList)))
				{
					return;
				}
			}

			// 添加新的词法单元
			a_TknList.Add(new tTkn(a_Tmnl, a_Attr, a_NewLineCnt + 1));
		}

		private void eAddTkn_NewLine(List<tTkn> a_TknList, int a_NewLineCnt = -1)
		{
			// 复位换行计数
			if (a_NewLineCnt < 0)
			{
				a_NewLineCnt = e_NewLineCnt;
			}

			// 对于CSS，换行总是可以替换成空格
			if (3 == this.e_Which)
			{
				eScan_FlwByWhtSpc();
				return;
			}

			// 不需要在首行就是换行
			if (0 == a_TknList.Count)
			{
				return;
			}

			// 如果前一个词法单元是换行，不用添加
			if (eIsLastTknNewLine(a_TknList))
			{
				return;
			}

			// 现在一定是非换行
			var l_LastTkn = eGetLastTkn(a_TknList);

			// 如果前一个词法单元是无需后跟换行的词法单元，不用添加
			if (seIsNextNewLineFree(l_LastTkn.c_Tmnl))
			{
				return;
			}

			//-------- 【自动分号插入】，这里是替换，详见标准中文版P33

			if ((tTmnl.i_break == l_LastTkn.c_Tmnl) ||
				(tTmnl.i_continue == l_LastTkn.c_Tmnl) ||
				(tTmnl.i_return == l_LastTkn.c_Tmnl) ||
				(tTmnl.i_throw == l_LastTkn.c_Tmnl))
			{
				a_TknList.Add(new tTkn(tTmnl.i_Smcln, ";", a_NewLineCnt + 1));
				e_RptBfr.AppendLine("行(" + (a_NewLineCnt + 1) + ")：换行被替换成分号！");
				return;
			}

			if (seIsPureUnrOpt(l_LastTkn.c_Tmnl))
			{
				// “++ --”
				if ((tTmnl.i_Inc == l_LastTkn.c_Tmnl) || (tTmnl.i_Dec == l_LastTkn.c_Tmnl))
				{
					// 不要作任何处理！因为此时还看不到接下来的词法单元
					// 留到看全时（修剪换行阶段）再做处理

					//// 如果更前面是字面值或标识符，说明是后缀，则替换
					//if (seIsLtrlOrId(eGetLastTkn(a_TknList, a_TknList.Count - 1).c_Tmnl))
					//{
					//	a_TknList.Add(new tTkn(tTmnl.i_Smcln, ";"));
					//	e_RptBfr.AppendLine("行(" + (a_NewLineCnt + 1) + ")：换行被替换成分号！");
					//}
					//else // 说明是前缀，返回
					//{
					//	return;
					//}
				}
				else // “! ~”，返回
				{
					return;
				}
			}

			// 添加新的词法单元，注意，换行的属性并非简单的字符串
			a_TknList.Add(new tTkn(tTmnl.i_NewLine, Environment.NewLine, a_NewLineCnt + 1));
		}
	}
}
