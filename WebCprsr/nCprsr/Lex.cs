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

		/// <summary>
		/// 构造
		/// </summary>
		public tLex()
		{
			
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
			if (! a_SrcRcd.c_Src.c_Cprs)
			{
				this.e_OptBfr.Append(this.e_SrcText);
				this.e_OptBfr.AppendLine();	// 追加一个换行，以防文件最后一行是行注释，导致下一个文件的首行被注释掉
				return;
			}

			// 扫描
			this.eScan();
		}

		public int cGetRow()
		{
			return 0;
		}

		private void eScan()
		{

		}
	}
}
