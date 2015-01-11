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
	/// 字符输入流
	/// </summary>
	public class tChaIptStrm
	{
		//-------- 构造

		/// <summary>
		/// 构造
		/// </summary>
		/// <param name="a_Text">文本，不能为空</param>
		public tChaIptStrm(string a_Text)
		{
			if (string.IsNullOrEmpty(a_Text))
			{
				throw new ArgumentException("a_Text为空");
			}

			this.e_Src = a_Text;
			this.e_Idx = 0;
			eUpdNext(false);
		}

		//-------- 接口

		/// <summary>
		/// 是否溢出
		/// </summary>
		/// <param name="a_Rmn">保留</param>
		/// <returns>是否</returns>
		public bool cIsOvfl(int a_Rmn = 0)
		{
			return (this.e_Idx >= this.e_Src.Length - a_Rmn);
		}

		/// <summary>
		/// 提取，【警告】必须保证尚未溢出！
		/// </summary>
		/// <param name="a_IgnrUes">是否忽略Unicode转义序列</param>
		/// <returns>字符</returns>
		public char cFch(bool a_IgnrUes = false)
		{
			int l_Ofst = 1;
			if ((!a_IgnrUes) && ('\\' == this.e_Src[this.e_Idx]))	//“\u????”
			{
				l_Ofst = 6;
			}

			this.e_Idx = Math.Min(this.e_Idx + l_Ofst, this.e_Src.Length);
			eUpdNext(a_IgnrUes);
			return e_Next;
		}

		/// <summary>
		/// 提取直到行终止，【注意】忽略Unicode转义序列
		/// </summary>
		/// <param name="a_Line">提取的行，不包含换行符</param>
		/// <returns>长度</returns>
		public int cFchUtlLineTmnt(out string a_Line)
		{
			a_Line = null;
			if (this.e_Idx >= this.e_Src.Length)
			{
				return 0;
			}

			StringBuilder l_Bfr = new StringBuilder();
			for (; this.e_Idx < this.e_Src.Length; ++this.e_Idx)
			{
				var l_Cha = this.e_Src[this.e_Idx];
				if (('\r' == l_Cha) || ('\n' == l_Cha))
				{
					break;
				}
				else
				{
					l_Bfr.Append(l_Cha);
				}
			}

			eUpdNext(true);	// 接下来是换行符，无所谓true/false

			if (0 == l_Bfr.Length)
			{
				return 0;
			}

			a_Line = l_Bfr.ToString();
			return a_Line.Length;
		}

		/// <summary>
		/// 跳过换行，【注意】忽略Unicode转义序列
		/// </summary>
		/// <returns>跳过的数量</returns>
		public int cSkipNewLine()
		{
			int l_Bgn = this.e_Idx;
			if ((this.e_Idx < this.e_Src.Length) && ('\r' == this.e_Src[this.e_Idx]))
			{
				++this.e_Idx;
			}
			//【注意】这里不要加else，使得“\r\n”也能被识别！
			if ((this.e_Idx < this.e_Src.Length) && ('\n' == this.e_Src[this.e_Idx]))
			{
				++this.e_Idx;
			}

			eUpdNext(false);	// 后面的内容需要考虑
			return this.e_Idx - l_Bgn;
		}

		/// <summary>
		/// 检查下一个
		/// </summary>
		public bool cChkNext(char a_Next1)
		{
			if (cIsOvfl(0))
			{
				return false;
			}

			//if (this.e_Src.Length - this.e_Idx < 1)
			//{
			//	return false;
			//}

			return (e_Next == a_Next1);
		}

		/// <summary>
		/// 检查下两个
		/// </summary>
		public bool cChkNext2(char a_Next1, char a_Next2, bool a_IgnrUes = false)
		{
			if (cIsOvfl(1))
			{
				return false;
			}

			int l_OldIdx = e_Idx;		// 以备还原
			char l_OldNext = e_Next;	// 以备还原
			char l_Next2 = cFch(a_IgnrUes);

			bool l_Rst = (l_OldNext == a_Next1) && (l_Next2 == a_Next2);
			e_Idx = l_OldIdx;
			e_Next = l_OldNext;
			return l_Rst;
		}

		/// <summary>
		/// 检查下三个
		/// </summary>
		public bool cChkNext3(char a_Next1, char a_Next2, char a_Next3, bool a_IgnrUes = false)
		{
			if (cIsOvfl(2))
			{
				return false;
			}

			int l_OldIdx = e_Idx;		// 以备还原
			char l_OldNext = e_Next;	// 以备还原
			char l_Next2 = cFch(a_IgnrUes);
			char l_Next3 = cFch(a_IgnrUes);

			bool l_Rst = (l_OldNext == a_Next1) && (l_Next2 == a_Next2) && (l_Next3 == a_Next3);
			e_Idx = l_OldIdx;
			e_Next = l_OldNext;
			return l_Rst;
		}

		/// <summary>
		/// 检查下四个
		/// </summary>
		public bool cChkNext4(char a_Next1, char a_Next2, char a_Next3, char a_Next4, bool a_IgnrUes = false)
		{
			if (cIsOvfl(3))
			{
				return false;
			}

			int l_OldIdx = e_Idx;		// 以备还原
			char l_OldNext = e_Next;	// 以备还原
			char l_Next2 = cFch(a_IgnrUes);
			char l_Next3 = cFch(a_IgnrUes);
			char l_Next4 = cFch(a_IgnrUes);

			bool l_Rst = (l_OldNext == a_Next1) && (l_Next2 == a_Next2) && (l_Next3 == a_Next3) && (l_Next4 == a_Next4);
			e_Idx = l_OldIdx;
			e_Next = l_OldNext;
			return l_Rst;
		}

		/// <summary>
		/// 下两个是数字？为了解决以小数点开头的数字，如“.123”
		/// </summary>
		public bool cIsNext2_Num(bool a_IgnrUes = false)
		{
			if (cIsOvfl(1))
			{
				return false;
			}

			int l_OldIdx = e_Idx;		// 以备还原
			char l_OldNext = e_Next;	// 以备还原
			char l_Next2 = cFch(a_IgnrUes);

			bool l_Rst = char.IsDigit(l_Next2);
			e_Idx = l_OldIdx;
			e_Next = l_OldNext;
			return l_Rst;
		}

		/// <summary>
		/// 移动
		/// </summary>
		/// <param name="a_OfstToCrnt">偏移量，相对于cGetOfst()，将被截断到合理范围</param>
		/// <returns>实际移动量</returns>
		public int cMove(int a_OfstToCrnt = +1, bool a_IgnrUes = false)
		{
			int l_Rst = 0;
			if (a_OfstToCrnt < 0)
			{
				throw new NotSupportedException("为了支持Unicode转义序列，现已禁止向前移动！");
			}
			else
				if (a_OfstToCrnt > 0)
				{
					while (!cIsOvfl())
					{
						cFch(a_IgnrUes);

						++l_Rst;
						if (l_Rst >= a_OfstToCrnt)
						{
							break;
						}
					}
				}
			return l_Rst;
		}

		/// <summary>
		/// 移动到
		/// </summary>
		/// <param name="a_OfstToZero">偏移量，相对于0，将被截断到合理范围</param>
		/// <returns>实际移动量</returns>
		public int cMoveTo(int a_OfstToZero)
		{
			if (a_OfstToZero < 0)
			{
				a_OfstToZero = 0;
			}
			else
				if (a_OfstToZero > this.e_Src.Length)
				{
					a_OfstToZero = this.e_Src.Length;
				}

			return cMove(a_OfstToZero - this.e_Idx);
		}

		/// <summary>
		/// 获取偏移量
		/// </summary>
		/// <returns>偏移量，相对于0</returns>
		public int cGetOfst()
		{
			return this.e_Idx;
		}

		/// <summary>
		/// 获取长度
		/// </summary>
		/// <returns>长度，即字符数</returns>
		public int cGetLen()
		{
			return this.e_Src.Length;
		}

		/// <summary>
		/// 获取下一个字符
		/// </summary>
		/// <returns>下一个字符</returns>
		public char cGetNextCha()
		{
			return e_Next;
		}

		//-------- 函数

		/// <summary>
		/// 更新下一个，【注意】按理，每次修改e_Idx都要调用，但在有十足把握时也可以多次修改后再调用一次。
		/// </summary>
		private char eUpdNext(bool a_IgnrUes)
		{
			if (cIsOvfl())
			{
				e_Next = '\0';
			}
			else
			{
				e_Next = this.e_Src[this.e_Idx];
				if ((!a_IgnrUes) && ('\\' == e_Next))
				{
					// 剩余不足6个字符时，不要引发异常，因为这次调用可能是由cChk……发起，检查不应导致异常！
					if (cIsOvfl(6))
					{
						e_Next = '\0';
					}
					else
					{
						char l_C2 = this.e_Src[this.e_Idx + 2];
						char l_C3 = this.e_Src[this.e_Idx + 3];
						char l_C4 = this.e_Src[this.e_Idx + 4];
						char l_C5 = this.e_Src[this.e_Idx + 5];
						int l_3 = (l_C2 <= '9') ? (l_C2 - '0') : (l_C2 - 'A');
						int l_2 = (l_C3 <= '9') ? (l_C3 - '0') : (l_C3 - 'A');
						int l_1 = (l_C4 <= '9') ? (l_C4 - '0') : (l_C4 - 'A');
						int l_0 = (l_C5 <= '9') ? (l_C5 - '0') : (l_C5 - 'A');
						int l_CV = l_3 * 4096 + l_2 * 256 + l_1 * 16 + l_0;
						e_Next = (char)l_CV; //【警告】在这里强制转换有没有问题？
					}
				}
			}

			return e_Next;
		}

		//-------- 数据

		private string e_Src;
		private int e_Idx;	// 指向下一个要读的位置
		private char e_Next;	// 下一个字符，解决“\u????”
	}

	/// <summary>
	/// 字符输出流
	/// </summary>
	public class tChaOptStrm
	{
		//-------- 构造

		/// <summary>
		/// 构造
		/// </summary>
		/// <param name="a_Path">路径，若为null则输出到内存</param>
		public tChaOptStrm(string a_Path = null)
		{
			if (string.IsNullOrEmpty(a_Path))
				e_Bldr = new StringBuilder();
			else
				e_Strm = new StreamWriter(a_Path);
		}

		//-------- 接口

		public void cPut(char a_Cha)
		{
			if (null != e_Bldr)
				e_Bldr.Append(a_Cha);
			else
				e_Strm.Write(a_Cha);
		}

		public void cPut(string a_Str)
		{
			if (null != e_Bldr)
				e_Bldr.Append(a_Str);
			else
				e_Strm.Write(a_Str);
		}

		public void cPutNewLine()
		{
			if (null != e_Bldr)
				e_Bldr.Append(Environment.NewLine);
			else
				e_Strm.Write(Environment.NewLine);
		}

		public override string ToString()
		{
			if (null != e_Bldr)
				return e_Bldr.ToString();
			else
				throw new NotSupportedException("没法取得已写入的字符！");
		}

		public StringBuilder cGetBldr()
		{
			return e_Bldr;
		}

		public StreamWriter cGetStrm()
		{
			return e_Strm;
		}

		public int cGetLen()
		{
			if (null != e_Bldr)
				return e_Bldr.Length;
			else
				throw new NotSupportedException("没法计算长度！");
		}

		//-------- 数据

		private StringBuilder e_Bldr;
		private StreamWriter e_Strm;
	}
}
