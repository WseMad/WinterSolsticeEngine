/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.tAjax)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"(3)CoreDast.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Ajax.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stAryUtil = nWse.stAryUtil;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fOnCplt(a_This)
	{
		var l_This = a_This;
		var l_Rs = l_This.e_Xhr.status;
		if (4 != l_This.e_Xhr.readyState)
		{ return; }

		if (((200 <= l_Rs) && (l_Rs < 300)) || (304 == l_Rs)) // 成功
		{
			if (l_This.e_Cfg.c_fOnSucc) // 回调
			{
				l_This.e_Cfg.c_fOnSucc(l_This);
			}
		}
		else // 失败
		{
			if (l_This.e_Cfg.c_fOnFail) // 回调
			{
				l_This.e_Cfg.c_fOnFail(l_This);
			}
		}
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tAjax;
	(function ()
	{
		tAjax = nWse.fClass(nWse,
		/// Ajax
		function tAjax()
		{
			this.cRset();
		}
		,
		null
		,
		{
			/// 重置
			cRset: function ()
			{
				var l_This = this;
				this.e_Xhr = null;
				return this;
			}
			,
			/// 打开
			/// a_Cfg：Object，配置
			/// {
			/// c_Mthd：String，方法，默认"GET"
			/// c_Url：String，URL，默认window.location.pathname
			/// c_Qry：String[]，查询字符串，偶数索引是键，奇数索引是值，仅用于GET方法
			/// c_Sync：Boolean，同步？默认false
			/// c_Hdrs：Object，请求头
			/// c_OnSucc：void f(a_Ajax)，当成功时
			/// c_OnFail：void f(a_Ajax)，当失败时
			/// }
			cOpen : function (a_Cfg)
			{
				var l_This = this;
				if (l_This.e_Xhr)
				{ l_This.cRset(); }

				var l_Mthd = a_Cfg.c_Mthd ? a_Cfg.c_Mthd.toUpperCase() : "GET";
				var l_Url = a_Cfg.c_Url || window.location.pathname;
				var l_Sync = !! a_Cfg.c_Sync;
				l_This.e_Cfg = a_Cfg;
				l_This.e_Mthd = l_Mthd;
				l_This.e_Url = l_Url;
				l_This.e_Sync = l_Sync;
				if (("GET" == l_Mthd) && a_Cfg.c_Qry)
				{
					stAryUtil.cFor(a_Cfg.c_Qry,
					function (a_Ary, a_Idx, a_KV)
					{
						if (0 == a_Idx % 2) // 键
						{ l_Url += (l_Url.indexOf("?") < 0) ? "?" : "&"; }
						else // 值
						{ l_Url += "="; }

						l_Url += encodeURIComponent(a_KV.toString());
					});
				}
				l_This.e_UrlWithQry = l_Url;
			//	console.log(l_Url);

				// 新建XHR实例
				l_This.e_Xhr = new XMLHttpRequest();
				l_This.e_fOnCplt = function () { fOnCplt(l_This); };
				if (! l_Sync)
				{ l_This.e_Xhr.addEventListener("readystatechange", l_This.e_fOnCplt); }

				// 打开
				l_This.e_Xhr.open(l_Mthd, l_Url, ! l_Sync);

				// 设置请求头
				var l_PN, l_Hdrs = a_Cfg.c_Hdrs || null;
				for (l_PN in l_Hdrs)
				{
					l_This.e_Xhr.setRequestHeader(l_PN,  l_Hdrs[l_PN]);
				}

				return this;
			}
			,
			/// 发送
			cSend : function (a_Data)
			{
				var l_This = this;

				// 发送
				l_This.e_Xhr.send(a_Data || null);

				// 如果同步，立即回调
				if (l_This.e_Sync)
				{ fOnCplt(l_This); }

				return this;
			}
			,
			/// 放弃
			cAbo : function ()
			{
				var l_This = this;
				if (! l_This.e_Xhr)
				{ return this; }

				l_This.e_Xhr.abort();
				return this;
			}
			,
			/// 存取XHR对象
			cAcsXhr : function ()
			{
				return this.e_Xhr;
			}
			,
			/// 获取响应状态码
			cGetResSta : function ()
			{
				return this.e_Xhr ? this.e_Xhr.status : 0;
			}
			,
			/// 获取响应数据
			cGetResData : function ()
			{
				return this.e_Xhr ? this.e_Xhr.responseText : null;
			}
			,
			/// 获取响应XML
			cGetResXml : function ()
			{
				return this.e_Xhr ? this.e_Xhr.responseXML : null;
			}
			,
			/// 获取响应JSON，注意每次都会创建新实例
			cGetResJson : function ()
			{
				return this.e_Xhr ? JSON.parse(this.e_Xhr.responseText) : null;
			}
			,
			/// 获取响应头
			cGetResHdr : function (a_Name)
			{
				return this.e_Xhr ? this.e_Xhr.getResponseHeader(a_Name) : null;
			}
			,
			/// 获取全部响应头
			cGetAllResHdrs : function ()
			{
				return this.e_Xhr ? this.e_Xhr.getAllResponseHeaders() : null;
			}
			,
			/// 设置请求头 - 表单提交
			cSetReqHdr_FormSbmt : function ()
			{
				this.e_Xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////