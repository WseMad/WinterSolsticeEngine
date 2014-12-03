/*
*
*/

#pragma once

//=============================================================
// 【编译器宏】
//=============================================================

// 程序位数
#ifdef WIN64
#define	WSE_Pgm64	1
#else
#define	WSE_Pgm32	1
#endif

// 调试或发布
#ifdef _DEBUG
#define WSE_Dbg		1
#else
#define WSE_Rls		1
#endif

// 动态链接库导入导出
#ifdef CORE_EXPORTS
#define	WSE_Dll		__declspec(dllexport)
#else
#define	WSE_Dll		__declspec(dllimport)
#endif

//WIN32
//_DEBUG
//_WINDOWS
//_USRDLL
//CORE_EXPORTS

// 文件和行号
#define	WSE____LINE__(a_Line)		#a_Line
#define	WSE___LINE__(a_Line)		WSE____LINE__(a_Line)
#define	WSE__Wchar(a_Str)			L##a_Str
#define	WSE_Wchar(a_Str)			WSE__Wchar(a_Str)
#define	WSE_FileLine(a_Text)		(WSE_Wchar(__FILE__) L"(" WSE_Wchar(WSE___LINE__(__LINE__)) L"):" a_Text)

// 编译消息
#define	WSE_CmplMsg(a_Text)			message(__FILE__ "(" WSE___LINE__(__LINE__) "):" #a_Text)

// 对齐
#define	WSE_Aln(a_Num)				__declspec(align(a_Num))


//=============================================================
// 【引擎宏】
//=============================================================

// 引擎主版本＆副版本＆更新号
#define	WSE_MjrVer					2
#define	WSE_MnrVer					0
#define	WSE_UpdNum					0

// nWse命名空间
#define	WSE_nWse_Bgn				namespace	nWse	{
#define	WSE_nWse_End				}

// 内核命名空间
#define	WSE_unKnl_Bgn				namespace	unKnl	{
#define	WSE_unKnl_End				}

// 文件命名空间
#define	WSE_n_Bgn					namespace			{
#define	WSE_n_End					}


//=============================================================
// 【内建类型别名】
//=============================================================

WSE_nWse_Bgn

// 字节，字，双字，四字，64位有符号整数
typedef	unsigned char				tByte;
typedef	unsigned short				tWord;
typedef	unsigned int				tDword;
typedef	unsigned long long			tQword;
typedef long long					tInt64;

WSE_nWse_End

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////