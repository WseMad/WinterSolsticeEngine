/*
*
* 表单验证：http://m.w3cschool.cc/jquery/jquery-plugin-validate.html
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.nUi && l_Glb.nWse.nUi.nCmnWgts && l_Glb.nWse.nUi.nCmnWgts.t$$$)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse:nUi",
		[
			"Wgt.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Form.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;
	var stNumUtil = nWse.stNumUtil;
	var stStrUtil = nWse.stStrUtil;
	var stAryUtil = nWse.stAryUtil;
	var stDomUtil = nWse.stDomUtil;
	var stCssUtil = nWse.stCssUtil;
	var tSara = nWse.tSara;

	var tPntIptTrkr = nWse.tPntIptTrkr;
	var tPntIpt = tPntIptTrkr.tPntIpt;
	var tPntIptKind = tPntIpt.tKind;
	var tPntIptTch = tPntIpt.tTch;

	var nUi = nWse.nUi;
	var tWgt = nUi.tWgt;
	var stFrmwk = nUi.stFrmwk || null;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 名字空间

	if (! nUi.nCmnWgts)
	{
		nWse.fNmspc(nUi,
			/// 公共控件
			function nCmnWgts() {});
	}
	var nCmnWgts = nUi.nCmnWgts;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

	function fRset(a_This)
	{
		//
	}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
	var tForm;
	(function ()
	{
		tForm = nWse.fClass(nUi,
		/// 表单
		function tForm()
		{
			this.odBase(tForm).odCall();	// 基类版本

			this.dAcsSubWgtSet();	// 新建子控件集
		}
		,
		tWgt
		,
		{
			/// 绑定
			/// a_Cfg：Object，配置
			/// {
			///	c_PutTgt：String，放置目标的HTML元素ID，若不存在则自动创建带有指定ID的<div>，作为c_PutSrc的前一个兄弟节点
			/// c_PutSrc：String，放置来源的HTML元素ID，必须有效
			/// }
			vcBind : function f(a_Cfg)
			{
				this.odBase(f).odCall(a_Cfg);	// 基类版本

				var l_This = this;
				stCssUtil.cAddCssc(l_This.d_PutTgt, "cnWse_tForm");	// CSS类

				// 注册放置目标事件处理器
				if (! l_This.d_fOnWidDtmnd)
				{
					l_This.d_fOnWidDtmnd = function ()
					{
						// 通知子控件
						if (l_This.d_SubWgtSet)
						{ l_This.d_SubWgtSet.cTrgrPutEvt_WidDtmnd(); }
					};

					l_This.dRegPutTgtEvtHdlr_WidDtmnd(l_This.d_fOnWidDtmnd);
				}
				return this;
			}
			,
			/// 解绑
			vcUbnd : function f()
			{
				var l_This = this;
				if (! l_This.d_PutSrc)
				{ return this; }

				// 注销放置目标事件处理器
				if (l_This.d_fOnWidDtmnd)
				{
					l_This.dUrgPutTgtEvtHdlr_WidDtmnd(l_This.d_fOnWidDtmnd);
					l_This.d_fOnWidDtmnd = null;
				}

				// 重置
				fRset(this);

				// 基类版本，最后才调用！
				this.odBase(f).odCall();
				return this;
			}
			,
			/// 结束动画
			vcFnshAnmt : function f()
			{
				var l_This = this;
				if (l_This.d_SubWgtSet)
				{ l_This.d_SubWgtSet.cFnshAnmt(); }
				return this;
			}
			,
			/// 刷新在布局之前
			vcRfshBefLot : function f()
			{
				var l_This = this;
				if (l_This.d_SubWgtSet)
				{ l_This.d_SubWgtSet.cRfshBefLot(); }
				return this;
			}
			,
			/// 刷新在布局之后
			vcRfshAftLot : function f()
			{
				var l_This = this;
				if (l_This.d_SubWgtSet)
				{ l_This.d_SubWgtSet.cRfshAftLot(); }
				return this;
			}
			,
			/// 拾取
			/// a_Bbox：tSara，包围盒，若非null则初始为放置目标的包围盒，可以更新，此时a_Picker为null
			/// a_Picker：tPicker，拾取器，当a_Bbox为null时才有效
			vcPick : function f(a_Bbox, a_Picker)
			{
				if (a_Bbox)
				{
					return this; // 直接使用初始值（放置目标的）就可以了
				}

				// 拾取表单里的各个控件
				var l_This = this;
				stAryUtil.cFind(l_This.d_SubWgtSet.cAcsWgts(),
					function (a_Wgts, a_Idx, a_Wgt)
					{
						a_Wgt.vcPick(null, a_Picker);
						return a_Picker.cIsOver();
					});

				if (a_Picker.cIsOver())
				{ return this; }

				// 最后拾取放置目标（如果有）
				if (l_This.d_PutTgt)
				{
					l_This.dPickPutTgtByPathPnt(a_Picker, l_This.d_PutTgt);
				}
				return this;
			}
			,
			/// 输入复位
			vcIptRset : function f()
			{
				var l_This = this;
				if (l_This.d_SubWgtSet)
				{ l_This.d_SubWgtSet.cIptRset(); }
				return this;
			}
			,
			/// 存取控件集
			cAcsWgtSet : function ()
			{
				return this.d_SubWgtSet;
			}
			,
			/// 存取控件数组
			cAcsWgts : function ()
			{
				return this.d_SubWgtSet && this.d_SubWgtSet.cAcsWgts();
			}
//			,
//			/// 清空
//			cClr : function ()
//			{
//				if (this.d_SubWgtSet)
//				{ this.d_SubWgtSet.cClr(); }
//				return this;
//			}
			,
			/// 序列化
			/// a_Kvo：Object，若为null则新建一个对象
			/// 返回：a_Kvo
			cSrlz : function (a_Kvo)
			{
				if (! a_Kvo)
				{ a_Kvo = {}; }

				// 对每个控件
				var l_This = this;
				if (! l_This.d_SubWgtSet)
				{ return a_Kvo; }

				stAryUtil.cFor(l_This.d_SubWgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						nUi.itForm.ocBindUbnd(a_Wgt, function (a_Istn) { a_Istn.vcSrlz(a_Kvo); });
					});
				return a_Kvo;
			}
			,
			/// 反序列化
			/// a_Kvo：Object，键值对象
			cDsrlz : function (a_Kvo)
			{
				if (! a_Kvo)
				{ return this; }

				// 对每个控件
				var l_This = this;
				if (! l_This.d_SubWgtSet)
				{ return this; }

				stAryUtil.cFor(l_This.d_SubWgtSet.cAcsWgts(),
					function (a_Ary, a_Idx, a_Wgt)
					{
						nUi.itForm.ocBindUbnd(a_Wgt, function (a_Istn) { a_Istn.vcDsrlz(a_Kvo); });
					});
				return this;
			}
		}
		,
		{
			//
		}
		,
		false);

		nWse.fItfc(nUi,
		/// 表单接口
		function itForm()
		{ }
		,
		null
		,
		{
			/// 序列化
			/// a_Kvo：Object，键值对象
			vcSrlz : function f(a_Kvo)
			{
				return this;
			}
			,
			/// 反序列化
			/// a_Kvo：Object，键值对象
			vcDsrlz : function f(a_Kvo)
			{
				return this;
			}
		}
		,
		{
			/// 生成内部键
			scGnrtInrKey : function (a_Key)
			{
				return "Wse_" + a_Key;
			}
		});
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////