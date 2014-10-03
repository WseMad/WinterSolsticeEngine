/*
*
*/

// cd /d F:/DvlpSiteRoot/WSE/Test
// node Server.js
// .load Server.js

var aaa = 999;

(function ()
{
	//var nWse = require('../nWse/(0)Seed.js');
	//var nApp = nWse.g_.g_Glb.nApp;
	//require('../nWse/(1)ObjOrtd.js');
	//require('../nWse/(2)LangUtil.js');

	var l_NL1 = require("./NodeLib.js");
	var l_NL2 = require("./NodeLib2.js");
	

	console.log(l_NL1.c_Xyz);
	console.log(l_NL2.c_Xyz);
	console.log(l_NL1 === l_NL2);
	

	/*
	console.log("fClass : " + (typeof nWse.fClass));
	console.log("stNumUtil : " + (typeof nWse.stNumUtil));
	console.log(nWse.stNumUtil.cClmOnNum(-5, 3, 7));


	// 继续
	var tAbc = nWse.fClass(nApp,
	function tAbc(a_Name, a_Age, a_Gen)
	{
		this.c_Name = a_Name;
		console.log(Array.prototype.slice.call(arguments).toString());
	}
	,
	null
	,
	{
		//
	}
	,
	{
		//
	}
	,
	true);

	console.log((new nApp.tAbc("My Name Is Abc", 33, 10)).c_Name);

	nWse.fEnum(nApp,
		function tDef() { }, null,
		"i_0", "i_1", ["i_5", 5], "i_6");

	console.log("EnumVal : " + nApp.tDef.i_.i_5.toString());
	//*/
})();

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////