using System;
using System.Collections.Generic;
using System.Text;
using System.IO;

/// <summary>
/// 输入流
/// </summary>
public sealed class tIptStrm
	: IDisposable
{
	//------------------------ 构造

	/// <summary>
	/// 构造
	/// </summary>
	public tIptStrm()
	{
		//
	}

	//------------------------ 接口

	/// <summary>
	/// 处置
	/// </summary>
	public void Dispose()
	{
		// 关闭
		cCls();
	}


	/// <summary>
	/// 有效
	/// </summary>
	/// <returns>是否</returns>
	public bool cIsVld()
	{
		return cIsIptFromMmr() || cIsIptFromFile();
	}

	/// <summary>
	/// 关闭
	/// </summary>
	public void cCls()
	{
		cClsIptFromMmr();
		cClsIptFromFile();
	}

	/// <summary>
	/// 输入自内存
	/// </summary>
	/// <param name="a_Sto">存储区</param>
	/// <param name="a_Bgn">起始索引</param>
	/// <param name="a_Len">长度</param>
	public void cIptFromMmr(byte[] a_Sto, int a_Bgn = 0, int a_Len = 0)
	{
		// 检查并调整实参
		if ((a_Bgn < 0) || (a_Sto.Length <= a_Bgn))
			throw new ArgumentException();

		if ((a_Len <= 0) || (a_Bgn + a_Len > a_Sto.Length))
			a_Len = a_Sto.Length - a_Bgn;

		// 关闭
		cCls();

		// 记录
		m_MmrStrm = new MemoryStream(a_Sto, a_Bgn, a_Len);
		m_Bgn = a_Bgn;
		m_Len = a_Len;
	}

	/// <summary>
	/// 输入自内存
	/// </summary>
	/// <returns>是否</returns>
	public bool cIsIptFromMmr()
	{
		return (null != m_MmrStrm);
	}

	/// <summary>
	/// 关闭输入自内存
	/// </summary>
	public void cClsIptFromMmr()
	{
		if (!cIsIptFromMmr())
			return;

		m_MmrStrm.Close();

		eZeroData();
	}

	/// <summary>
	/// 输入自文件
	/// </summary>
	/// <param name="a_FileStrm">文件流，若非null则文件必须可读，忽略a_Path，若为null则a_Path必须有效</param>
	/// <param name="a_Path">路径，若a_FileStrm为null则必须有效，内部以只读共享模式打开，若a_FileStrm非null则忽略</param>
	public void cIptFromFile(FileStream a_FileStrm, string a_Path = null)
	{
		// 检查并调整实参
		if ((null == a_FileStrm) && string.IsNullOrEmpty(a_Path))
			throw new ArgumentException("文件流与路径均无效");

		// 关闭
		cCls();

		// 记录
		if (null != a_FileStrm)
		{
			if (string.IsNullOrEmpty(a_FileStrm.Name))
				throw new ArgumentException("文件流未打开");

			if (!a_FileStrm.CanRead)
				throw new ArgumentException("文件流不可读");

			m_FileStrm = a_FileStrm;
			m_ClsFile = false;
		}
		else
		{
			m_FileStrm = new FileStream(a_Path, FileMode.Open, FileAccess.Read, FileShare.Read);
			m_ClsFile = true;
		}

		m_Bgn = m_FileStrm.Position;
		m_Len = m_FileStrm.Length;
	}

	/// <summary>
	/// 输入自文件
	/// </summary>
	/// <returns>是否</returns>
	public bool cIsIptFromFile()
	{
		return (null != m_FileStrm);
	}

	/// <summary>
	/// 关闭输入自文件
	/// </summary>
	public void cClsIptFromFile()
	{
		if (!cIsIptFromFile())
			return;

		if (m_ClsFile)
			m_FileStrm.Close();

		eZeroData();
	}

	/// <summary>
	/// 获取起始索引
	/// </summary>
	/// <returns>起始索引</returns>
	public long cGetBgn()
	{
		return m_Bgn;
	}

	/// <summary>
	/// 获取长度
	/// </summary>
	/// <returns>长度</returns>
	public long cGetLen()
	{
		return m_Len;
	}

	/// <summary>
	/// 获取偏移量
	/// </summary>
	/// <returns>偏移量</returns>
	public long cGetOfst()
	{
		return cIsIptFromMmr() ? m_MmrStrm.Position - m_Bgn : m_FileStrm.Position - m_Bgn;
	}

	/// <summary>
	/// 溢出
	/// </summary>
	/// <param name="a_RmnSize">剩余大小</param>
	/// <returns>是否</returns>
	public bool cIsOvfl(long a_RmnSize = 0)
	{
		return (m_Bgn + cGetOfst() >= m_Len - a_RmnSize);
	}

	/// <summary>
	/// 移动
	/// </summary>
	/// <param name="a_Ofst">偏移量，若＜0则回溯，若＞0则推进</param>
	public void cMove(long a_Ofst)
	{
		if (0 == a_Ofst)
			return;

		long l_Ofst = cGetOfst();

		if (a_Ofst < 0)
		{
			if (l_Ofst + a_Ofst < 0)
				a_Ofst = -l_Ofst;
		}
		else
		{
			if (l_Ofst + a_Ofst > m_Len)
				a_Ofst = m_Len - l_Ofst;
		}

		if (cIsIptFromMmr())
			m_MmrStrm.Position = m_Bgn + l_Ofst + a_Ofst;
		else
			m_FileStrm.Position = m_Bgn + l_Ofst + a_Ofst;
	}

	/// <summary>
	/// 移动至
	/// </summary>
	/// <param name="a_OfstToBgn">距离起始索引的偏移量，∈[0, cGetLen()]</param>
	public void cMoveTo(long a_OfstToBgn)
	{
		if ((a_OfstToBgn < 0) || (m_Len < a_OfstToBgn))
			throw new ArgumentException();

		long l_Ofst = cGetOfst();

		if (cIsIptFromMmr())
			m_MmrStrm.Position = m_Bgn + a_OfstToBgn;
		else
			m_FileStrm.Position = m_Bgn + a_OfstToBgn;
	}

	/// <summary>
	/// 提取
	/// </summary>
	/// <param name="a_Bfr">缓冲</param>
	/// <param name="a_Size">大小，提取的字节数</param>
	/// <returns>实际提取大小</returns>
	public int cFch(ref byte[] a_Bfr, int a_Size)
	{
		if (a_Size <= 0)
			throw new ArgumentException("a_Size必须为正整数");

		if ((null == a_Bfr) || (a_Bfr.Length < a_Size))
			a_Bfr = new byte[a_Size];

		if (cIsIptFromMmr())
			return m_MmrStrm.Read(a_Bfr, 0, a_Bfr.Length);
		else
			return m_FileStrm.Read(a_Bfr, 0, a_Bfr.Length);
	}

	/// <summary>
	/// 提取
	/// </summary>
	/// <param name="a_Rst">结果</param>
	public void cFch(out char a_Rst)
	{
		cFch(ref m_FchBfr, sizeof(char));
		a_Rst = BitConverter.ToChar(m_FchBfr, 0);
	}


	/// <summary>
	/// 流
	/// </summary>
	public Stream mStrm
	{
		get
		{
			if (cIsIptFromMmr())
				return m_MmrStrm;
			else
				if (cIsIptFromFile())
					return m_FileStrm;
				else
					return null;
		}
	}

	/// <summary>
	/// 内存流
	/// </summary>
	public MemoryStream mMmrStrm
	{
		get { return m_MmrStrm; }
	}

	/// <summary>
	/// 文件流
	/// </summary>
	public FileStream mFileStrm
	{
		get { return m_FileStrm; }
	}


	//------------------------ 函数

	// 清零数据
	private void eZeroData()
	{
		m_MmrStrm = null;
		m_FileStrm = null;
		m_Bgn = 0;
		m_Len = 0;
		m_ClsFile = false;
	}

	//------------------------ 数据

	private MemoryStream m_MmrStrm;
	private FileStream m_FileStrm;
	private bool m_ClsFile;
	private long m_Bgn;
	private long m_Len;
	private byte[] m_FchBfr;
}

class tChaIptStrm
{
	internal tIptStrm m_Strm;
	internal int m_ChaTot;
	internal int m_ChaIdx;
	internal char m_Next1;
	internal char m_Next2;

	public tChaIptStrm(tIptStrm a_Strm)
	{
		eInit(a_Strm);
	}

	public static tChaIptStrm operator ++(tChaIptStrm a_This)
	{
		a_This.eStepFowd();
		return a_This;
	}

	public static implicit operator char(tChaIptStrm a_This)
	{
		return a_This.m_Next1;
	}

	public bool cIsOvfl(int a_RmnCha = 0)
	{
		return (m_ChaIdx >= m_ChaTot - a_RmnCha);
	}

	public bool cChkCha1(char a_Cha1)
	{
		return (m_Next1 == a_Cha1);
	}

	public bool cChkCha2(char a_Cha1, char a_Cha2)
	{
		return cIsOvfl(1) ? false : ((m_Next1 == a_Cha1) && (m_Next2 == a_Cha2));
	}

	private void eInit(tIptStrm a_Strm)
	{
		m_Strm = a_Strm;
		m_ChaTot = (int)((m_Strm.cGetLen() - a_Strm.cGetOfst()) / sizeof(char));
		m_ChaIdx = 0;

		eUpdNext1();

		// 如果以“\n???”开头，前插成“\r\n???”
		if ('\n' == m_Next1)
		{
			m_Next1 = '\r';
			m_Next2 = '\n';
			++m_ChaTot;
		}
		else
		{
			eUpdNext2();
		}
	}

	private void eUpdNext1()
	{
		m_Strm.cFch(out m_Next1);
	}

	private void eUpdNext2()
	{
		m_Strm.cFch(out m_Next2);
	}

	// 1:\r?，则在后面追加\n，并++m_ChaTot
	// 2:?\n，则在前面插入\r，并++m_ChaTot
	// 3:其他，一切如常
	private void eStepFowd()
	{
		if (('\r' == m_Next1) && ('\n' != m_Next2))	// 1:
		{
			m_Next1 = '\n';
			++m_ChaTot;
		}
		else
			if (('\r' != m_Next1) && ('\n' == m_Next2))	// 2:
			{
				m_Next1 = '\r';
				++m_ChaTot;
			}
			else // 3:
			{
				m_Next1 = m_Next2;
				eUpdNext2();
			}

		++m_ChaIdx;
	}
}

class tChaOptStrm
{
	//-------- 构造

	public tChaOptStrm(string a_Path)
	{
		e_Strm = new StreamWriter(a_Path);
	}

	//-------- 接口

	public void	cPut(char a_Cha)
	{
		e_Strm.Write(a_Cha);
	}

	public void	cPut(string a_Str)
	{
		e_Strm.Write(a_Str);
	}

	//-------- 数据

	private StreamWriter	e_Strm;
}








/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////