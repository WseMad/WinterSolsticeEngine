/*
*
*/


(function ()
{
	//@ 全局对象，同时支持页面主线程，WebWorker线程，和Node.js
	var i_InNodeJs = ("undefined" == typeof self);
	var l_Glb = i_InNodeJs ? global : self;
	
	//@ 如果本文件已经包含过
	if (l_Glb.nWse && l_Glb.nWse.tFsm)
	{
		//@ 避免重复执行相同的初始化代码
		return;
	}

	//@ 包含
	l_Glb.nWse.stAsynIcld.cFromLib("nWse",
		[
			"(1)ObjOrtd.js",
			"(2)LangUtil.js",
			"(3)CoreDast.js"
		]
		,
		fOnIcld);

function fOnIcld(a_Errs)
{
	console.log("Fsm.fOnIcld：" + a_Errs);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// using

	var nWse = l_Glb.nWse;

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 静态变量

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 有限状态机

	var tFsm, atSta;
	(function ()
	{
		tFsm = nWse.fClass(nWse,
		/// 有限状态机
		function tFsm()
		{
			this.cRset();
		}
		,
		null
		,
		{
			/// 重置
			cRset : function ()
			{
				this.e_StaAry = [];
				this.e_CrntSta = null;
				this.e_NextStaNameAry = [];
				return this;
			}
			,
			// 查找状态
			eFindSta : function (a_Name)
			{
				if (! a_Name)
				{ return -1; }

				a_Name = a_Name.toLowerCase();	// 不区分大小写
				return nWse.stAryUtil.cFind(this.e_StaAry,
					function(a_Ary, a_Idx, a_Elmt){ return (a_Elmt.e_Name.toLowerCase() == a_Name); });
			}
			,
			/// 存取状态数组
			cAcsStaAry : function ()
			{
				return this.e_StaAry;
			}
			,
			/// 存取状态
			/// a_Name：String，名称，不区分大小写，若无效则返回当前状态
			cAcsSta : function (a_Name)
			{
				if (! a_Name)
				{ return this.e_CrntSta; }

				var l_Idx = this.eFindSta(a_Name);
				return (l_Idx < 0) ? null : this.e_StaAry[l_Idx];
			}
			,
			/// 注册状态
			cRegSta : function (a_Sta)
			{
				this.e_StaAry.push(a_Sta);
				a_Sta.e_Fsm = this;
				return this;
			}
			,
			/// 注销状态
			cUrgSta : function (a_Name)
			{
				var l_Idx = this.eFindSta(a_Name);
				if (l_Idx >= 0)
				{
					this.e_StaAry[l_Idx].e_Fsm = null;
					this.e_StaAry.splice(l_Idx, 1);
				}
				return this;
			}
			,
			/// 更新
			cUpd : function ()
			{
				// 如果需要切换
				while (this.e_NextStaNameAry.length > 0)
				{
					this.eSwchSta();
				}

				// 更新状态
				if (this.e_CrntSta)
				{
					this.e_CrntSta.vcUpd();
				}
				return this;
			}
			,
			/// 渲染
			cRnd : function ()
			{
				// 渲染状态
				if (this.e_CrntSta)
				{
					this.e_CrntSta.vcRnd();
				}
				return this;
			}
			,
			/// 转换
			cTsit : function (a_Name)
			{
				if (this.eFindSta(a_Name) < 0)	// 没有找到时立即返回
				{ return this; }

				a_Name = a_Name.toLowerCase();	// 不区分大小写
				if ((0 == this.e_NextStaNameAry.length) &&	// 如果尚无下一个状态
					this.e_CrntSta &&						// 且有当前状态
					(this.e_CrntSta.e_Name.toLowerCase() == a_Name))	// 且当前状态就是要转换的状态
				{
					return this;	// 立即返回
				}

				this.e_NextStaNameAry.push(a_Name);	// 暂存下来
				return this;
			}
			,
			// 切换状态
			eSwchSta : function ()
			{
				// 离开
				var l_Next = this.cAcsSta(this.e_NextStaNameAry[0]);
				if (this.e_CrntSta)
				{
					this.e_CrntSta.vcLea(l_Next);
				}

				// 更新
				var l_Prev = this.e_CrntSta;
				this.e_CrntSta = l_Next;

				// 进入
				if (this.e_CrntSta)
				{
					this.e_CrntSta.vcEnt(l_Prev);
				}

				// 弹出
				this.e_NextStaNameAry.shift();
				return this;
			}
		}
		,
		null
		,
		false);

		atSta = nWse.fClass(tFsm,
		/// 状态
		/// a_Name：String，名称，不区分大小写
		function atSta(a_Name)
		{
			this.e_Fsm = null;
			this.e_Name = a_Name || null;
		}
		,
		null
		,
		{
			/// 存取有限状态机
			cAcsFsm : function ()
			{
				return this.e_Fsm;
			}
			,
			/// 获取名称
			cGetName : function ()
			{
				return this.e_Name;
			}
			,
			/// 设置名称
			cSetName : function (a_Name)
			{
				this.e_Name = a_Name;
			}
			,
			/// 进入
			/// a_Prev：atSta，前一个状态
			vcEnt : function (a_Prev)
			{
				//
			}
			,
			/// 离开
			/// a_Next：atSta，后一个状态
			vcLea : function (a_Next)
			{
				//
			}
			,
			/// 更新
			vcUpd : function ()
			{
				//
			}
			,
			/// 渲染
			vcRnd : function ()
			{
				//
			}
		}
		,
		null
		,
		false);
	})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Over

}
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////