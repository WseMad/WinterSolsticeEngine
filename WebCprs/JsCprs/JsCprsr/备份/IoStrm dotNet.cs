using System;
using System.Collections.Generic;
using System.Text;
using System.IO;


class tChaIptStrm
{
	//-------- 构造

	/// <summary>
	/// 构造
	/// </summary>
	/// <param name="a_Path">路径，必须有效</param>
	public tChaIptStrm(string a_Path)
	{
		e_Strm = new StreamReader(a_Path);
		e_Crnt = e_Next1 = e_Next2 = -2;
	}

	//-------- 接口

	/// <summary>
	/// 提取
	/// </summary>
	/// <param name="a_Crnt">当前字符</param>
	/// <returns>成功提取返回true，无可用字符返回false</returns>
	public bool	cFch(out char a_Crnt)
	{
		a_Crnt = '\0';

		if (-2 == e_Crnt)
		{
			eInit();
		}
		else
		{
			eUpd();
		}

		if (e_Crnt < 0)
			return false;

		a_Crnt = (char)e_Crnt;
		return true;
	}

	/// <summary>
	/// 向前看1个
	/// </summary>
	/// <param name="a_Next1">后面第一个字符</param>
	/// <returns>成功看到返回true，无可用字符返回false</returns>
	public bool	cAhd1(out char a_Next1)
	{
		a_Next1 = '\0';

		if (-2 == e_Crnt)
		{
			eInit();
		}

		if (e_Next1 < 0)
			return false;

		a_Next1 = (char)e_Next1;
		return true;
	}

	/// <summary>
	/// 向前看2个，主要用于JS的无符号右移“>>>”
	/// </summary>
	/// <param name="a_Next1">后面第一个字符</param>
	/// <param name="a_Next2">后面第二个字符</param>
	/// <returns>成功看到返回true，无可用字符返回false</returns>
	public bool	cAhd2(out char a_Next1, out char a_Next2)
	{
		a_Next1 = a_Next2 = '\0';

		if (-2 == e_Crnt)
		{
			eInit();
		}

		if (e_Next2 < 0)
			return false;

		a_Next1 = (char)e_Next1;
		a_Next2 = (char)e_Next2;
		return true;
	}

	public StreamReader		cGetStrm()
	{
		return e_Strm;
	}

	//-------- 函数

	private void	eInit()
	{
		// 第一次，连读三个字符，初始化三个字段
		e_Crnt = e_Strm.Read();
		e_Next1 = e_Strm.Read();
		e_Next2 = e_Strm.Read();
	}

	private void	eUpd()
	{
		// 后续，只读一个字符，更新三个字段
		e_Crnt = e_Next1;
		e_Next1 = e_Next2;
		e_Next2 = e_Strm.Read();
	}

	//-------- 数据

	private StreamReader	e_Strm;
	private int				e_Crnt;
	private int				e_Next1;
	private int				e_Next2;
}

class tChaOptStrm
{
	//-------- 构造

	/// <summary>
	/// 构造
	/// </summary>
	/// <param name="a_Path">路径，若为null则输出到内存</param>
	public tChaOptStrm(string a_Path)
	{
		if (string.IsNullOrEmpty(a_Path))
			e_Bldr = new StringBuilder();
		else
			e_Strm = new StreamWriter(a_Path);
	}

	//-------- 接口

	public void	cPut(char a_Cha)
	{
		if (null != e_Bldr)
			e_Bldr.Append(a_Cha);
		else
			e_Strm.Write(a_Cha);
	}

	public void	cPut(string a_Str)
	{
		if (null != e_Bldr)
			e_Bldr.Append(a_Str);
		else
			e_Strm.Write(a_Str);
	}

	public StringBuilder	cGetBldr()
	{
		return e_Bldr;
	}

	public StreamWriter		cGetStrm()
	{
		return e_Strm;
	}

	//-------- 数据

	private StringBuilder	e_Bldr;
	private StreamWriter	e_Strm;
}








/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////