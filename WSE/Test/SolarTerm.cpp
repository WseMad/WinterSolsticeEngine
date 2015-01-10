// SolarTerm.cpp : Defines the entry point for the console application.
//

#include "stdafx.h"

#include <time.h>

#include <iostream>
using namespace std;


// ------------------------------------------------------------------------
//
// 儒略日转换为格历日
//
// dbGD[IN]：儒略日
// year[OUT]：年
// month[OUT]：月
// day[OUT]：日
// hour[OUT]：时
// minute[OUT]：分
// second[OUT]：秒
// ------------------------------------------------------------------------
void w_JDToGD(const double &dbJD, int &year, int &month, int &day, int &hour, int &minute, int &second)
{
	double dJDM = dbJD + 0.5;
	unsigned long ulZ = static_cast<unsigned long>(floor(dJDM));
	double dF = dJDM - floor(dJDM);
	unsigned long ulA, ulB, ulC, ulD;
	int nE, nQ;
	if (dbJD < 2299161)
		ulA = ulZ;
	else
	{
		nQ = static_cast<int>((ulZ - 1867216.25) / 36524.25);
		ulA = ulZ + 1 + nQ - static_cast<int>(nQ >> 2);
	}
	ulB = ulA + 1524;
	ulC = static_cast<int>((ulB - 122.1) / 365.25);
	ulD = static_cast<int>(365.25 * ulC);
	nE = static_cast<int>((ulB - ulD) / 30.6001);
	// 计算日
	day = ulB - ulD - int(30.6001 * nE);
	// 计算时
	hour = static_cast<int>(floor(dF * 24.0));
	// 计算分
	minute = static_cast<int>(((dF * 24.0) - floor(dF * 24.0)) * 60.0);
	// 计算秒
	second = static_cast<int>((((dF * 24.0) * 60.0) - floor((dF * 24.0) * 60.0)) * 60.0);
	// 计算月
	if (nE < 14)
		month = nE - 1;
	if (nE == 14 || nE == 15)
		month = nE - 13;
	// 计算年
	if (month > 2)
		year = ulC - 4716;
	if (month == 1 || month == 2)
		year = ulC - 4715;
}

// ------------------------------------------------------------------------
//
// 格历日转换为儒略日
//
// year[IN]：年
// month[IN]：月
// day[IN]：日
// hour[IN]：时
// minute[IN]：分
// second[IN]：秒
//
// 返回对应的儒略日
// ------------------------------------------------------------------------
double w_GDToJD(const int &year, const int &month, const int &day, const int &hour, const int &minute, const int &second)
{
	int nY = year, nM = month;
	double dD = static_cast<double>(day)+hour / 24.0 + (minute / 60.0) / 24.0 + ((second / 60.0) / 60.0) / 24.0;
	if (month == 1 || month == 2)
	{
		nY = year - 1;
		nM = month + 12;
	}
	int nA = nY / 100;
	int nB = 2 - nA + (nA >> 2);
	return static_cast<double>(static_cast<int>(365.25 * (nY + 4716)) + static_cast<int>(30.6001 * (nM + 1)) + dD + nB - 1524.5);
}

// ------------------------------------------------------------------------
//
// 调整角度到 0-360 之间
//
// dbDegrees[IN]：角度
//
// 返回调整后的角度
// ------------------------------------------------------------------------
double w_MapTo0To360Range(const double &dbDegrees)
{
	double dbValue = dbDegrees;
	// map it to the range 0 - 360
	while (dbValue < 0.0)
		dbValue += 360.0;
	while (dbValue > 360.0)
		dbValue -= 360.0;
	return dbValue;
}

//
// 圆周率
const double PI = 3.1415926535897932384626433832795;
//
// 一度代表的弧度
const double dbUnitRadian = PI / 180.0;
//
// 计算太阳黄经赤纬所需类型变量
typedef struct
{
	double dA;
	double dB;
	double dC;
} VSOP87COEFFICIENT, *PVSOP87COEFFICIENT;

// 二次修正黄经赤纬所需的天体章动系数类型变量
typedef struct
{
	int   nD;
	int   nM;
	int   nMprime;
	int   nF;
	int   nOmega;
	int   nSincoeff1;
	double dSincoeff2;
	int   nCoscoeff1;
	double dCoscoeff2;
} NUTATIONCOEFFICIENT, *PNUTATIONCOEFFICIENT;
//
// 节气枚举
enum SOLARTERMS
{
	ST_VERNAL_EQUINOX = 0,    // 春分
	ST_CLEAR_AND_BRIGHT = 15,   // 清明
	ST_GRAIN_RAIN = 30,     // 谷雨
	ST_SUMMER_BEGINS = 45,    // 立夏
	ST_GRAIN_BUDS = 60,     // 小满
	ST_GRAIN_IN_EAR = 75,    // 芒种
	ST_SUMMER_SOLSTICE = 90,   // 夏至
	ST_SLIGHT_HEAT = 105,    // 小暑
	ST_GREAT_HEAT = 120,    // 大暑
	ST_AUTUMN_BEGINS = 135,    // 立秋
	ST_STOPPING_THE_HEAT = 150,   // 处暑
	ST_WHITE_DEWS = 165,    // 白露
	ST_AUTUMN_EQUINOX = 180,   // 秋分
	ST_COLD_DEWS = 195,     // 寒露
	ST_HOAR_FROST_FALLS = 210,   // 霜降
	ST_WINTER_BEGINS = 225,    // 立冬
	ST_LIGHT_SNOW = 240,    // 小雪
	ST_HEAVY_SNOW = 255,    // 大雪
	ST_WINTER_SOLSTICE = 270,   // 冬至
	ST_SLIGHT_COLD = 285,    // 小寒
	ST_GREAT_COLD = 300,    // 大寒
	ST_SPRING_BEGINS = 315,    // 立春
	ST_THE_RAINS = 330,     // 雨水
	ST_INSECTS_AWAKEN = 345    // 惊蛰
};

//
// 计算太阳黄经用参数
const VSOP87COEFFICIENT Earth_SLG0[64] =
{
	{ 175347046.0, 0.0000000, 000000.0000000 },
	{ 3341656.0, 4.6692568, 6283.0758500 },
	{ 34894.0, 4.6261000, 12566.1517000 },
	{ 3497.0, 2.7441000, 5753.3849000 },
	{ 3418.0, 2.8289000, 3.5231000 },
	{ 3136.0, 3.6277000, 77713.7715000 },
	{ 2676.0, 4.4181000, 7860.4194000 },
	{ 2343.0, 6.1352000, 3930.2097000 },
	{ 1324.0, 0.7425000, 11506.7698000 },
	{ 1273.0, 2.0371000, 529.6910000 },
	{ 1199.0, 1.1096000, 1577.3435000 },
	{ 990.0, 5.2330000, 5884.9270000 },
	{ 902.0, 2.0450000, 26.2980000 },
	{ 857.0, 3.5080000, 398.1490000 },
	{ 780.0, 1.1790000, 5223.6940000 },
	{ 753.0, 2.5330000, 5507.5530000 },
	{ 505.0, 4.5830000, 18849.2280000 },
	{ 492.0, 4.2050000, 775.5230000 },
	{ 357.0, 2.9200000, 000000.0670000 },
	{ 317.0, 5.8490000, 11790.6290000 },
	{ 284.0, 1.8990000, 796.2880000 },
	{ 271.0, 0.3150000, 10977.0790000 },
	{ 243.0, 0.3450000, 5486.7780000 },
	{ 206.0, 4.8060000, 2544.3140000 },
	{ 205.0, 1.8690000, 5573.1430000 },
	{ 202.0, 2.4580000, 6069.7770000 },
	{ 156.0, 0.8330000, 213.2990000 },
	{ 132.0, 3.4110000, 2942.4630000 },
	{ 126.0, 1.0830000, 20.7750000 },
	{ 115.0, 0.6450000, 000000.9800000 },
	{ 103.0, 0.6360000, 4694.0030000 },
	{ 102.0, 0.9760000, 15720.8390000 },
	{ 102.0, 4.2670000, 7.1140000 },
	{ 99.0, 6.2100000, 2146.1700000 },
	{ 98.0, 0.6800000, 155.4200000 },
	{ 86.0, 5.9800000, 161000.6900000 },
	{ 85.0, 1.3000000, 6275.9600000 },
	{ 85.0, 3.6700000, 71430.7000000 },
	{ 80.0, 1.8100000, 17260.1500000 },
	{ 79.0, 3.0400000, 12036.4600000 },
	{ 75.0, 1.7600000, 5088.6300000 },
	{ 74.0, 3.5000000, 3154.6900000 },
	{ 74.0, 4.6800000, 801.8200000 },
	{ 70.0, 0.8300000, 9437.7600000 },
	{ 62.0, 3.9800000, 8827.3900000 },
	{ 61.0, 1.8200000, 7084.9000000 },
	{ 57.0, 2.7800000, 6286.6000000 },
	{ 56.0, 4.3900000, 14143.5000000 },
	{ 56.0, 3.4700000, 6279.5500000 },
	{ 52.0, 0.1900000, 12139.5500000 },
	{ 52.0, 1.3300000, 1748.0200000 },
	{ 51.0, 0.2800000, 5856.4800000 },
	{ 49.0, 0.4900000, 1194.4500000 },
	{ 41.0, 5.3700000, 8429.2400000 },
	{ 41.0, 2.4000000, 19651.0500000 },
	{ 39.0, 6.1700000, 10447.3900000 },
	{ 37.0, 6.0400000, 10213.2900000 },
	{ 37.0, 2.5700000, 1059.3800000 },
	{ 36.0, 1.7100000, 2352.8700000 },
	{ 36.0, 1.7800000, 6812.7700000 },
	{ 33.0, 0.5900000, 17789.8500000 },
	{ 30.0, 0.4400000, 83996.8500000 },
	{ 30.0, 2.7400000, 1349.8700000 },
	{ 25.0, 3.1600000, 4690.4800000 }
};
const VSOP87COEFFICIENT Earth_SLG1[34] =
{
	{ 628331966747.0, 0.000000, 00000.0000000 },
	{ 206059.0, 2.678235, 6283.0758500 },
	{ 4303.0, 2.635100, 12566.1517000 },
	{ 425.0, 1.590000, 3.5230000 },
	{ 119.0, 5.796000, 26.2980000 },
	{ 109.0, 2.966000, 1577.3440000 },
	{ 93.0, 2.590000, 18849.2300000 },
	{ 72.0, 1.140000, 529.6900000 },
	{ 68.0, 1.870000, 398.1500000 },
	{ 67.0, 4.410000, 5507.5500000 },
	{ 59.0, 2.890000, 5223.6900000 },
	{ 56.0, 2.170000, 155.4200000 },
	{ 45.0, 0.400000, 796.3000000 },
	{ 36.0, 0.470000, 775.5200000 },
	{ 29.0, 2.650000, 7.1100000 },
	{ 21.0, 5.430000, 00000.9800000 },
	{ 19.0, 1.850000, 5486.7800000 },
	{ 19.0, 4.970000, 213.3000000 },
	{ 17.0, 2.990000, 6275.9600000 },
	{ 16.0, 0.030000, 2544.3100000 },
	{ 16.0, 1.430000, 2146.1700000 },
	{ 15.0, 1.210000, 10977.0800000 },
	{ 12.0, 2.830000, 1748.0200000 },
	{ 12.0, 3.260000, 5088.6300000 },
	{ 12.0, 5.270000, 1194.4500000 },
	{ 12.0, 2.080000, 4694.0000000 },
	{ 11.0, 0.770000, 553.5700000 },
	{ 10.0, 1.300000, 6286.6000000 },
	{ 10.0, 4.240000, 1349.8700000 },
	{ 9.0, 2.700000, 242.7300000 },
	{ 9.0, 5.640000, 951.7200000 },
	{ 8.0, 5.300000, 2352.8700000 },
	{ 6.0, 2.650000, 9437.7600000 },
	{ 6.0, 4.670000, 4690.4800000 }
};
const VSOP87COEFFICIENT Earth_SLG2[20] =
{
	{ 52919.0, 0.0000, 00000.0000 },
	{ 8720.0, 1.0721, 6283.0758 },
	{ 309.0, 0.8670, 12566.1520 },
	{ 27.0, 0.0500, 3.5200 },
	{ 16.0, 5.1900, 26.3000 },
	{ 16.0, 3.6800, 155.4200 },
	{ 10.0, 0.7600, 18849.2300 },
	{ 9.0, 2.0600, 77713.7700 },
	{ 7.0, 0.8300, 775.5200 },
	{ 5.0, 4.6600, 1577.3400 },
	{ 4.0, 1.0300, 7.1100 },
	{ 4.0, 3.4400, 5573.1400 },
	{ 3.0, 5.1400, 796.3000 },
	{ 3.0, 6.0500, 5507.5500 },
	{ 3.0, 1.1900, 242.7300 },
	{ 3.0, 6.1200, 529.6900 },
	{ 3.0, 0.3100, 398.1500 },
	{ 3.0, 2.2800, 553.5700 },
	{ 2.0, 4.3800, 5223.6900 },
	{ 2.0, 3.7500, 00000.9800 }
};
const VSOP87COEFFICIENT Earth_SLG3[7] =
{
	{ 289.0, 5.844, 6283.076 },
	{ 35.0, 0.000, 00000.000 },
	{ 17.0, 5.490, 12566.150 },
	{ 3.0, 5.200, 155.420 },
	{ 1.0, 4.720, 3.520 },
	{ 1.0, 5.300, 18849.230 },
	{ 1.0, 5.970, 242.730 }
};
const VSOP87COEFFICIENT Earth_SLG4[3] =
{
	{ 114.0, 3.142, 00000.00 },
	{ 8.0, 4.130, 6283.08 },
	{ 1.0, 3.840, 12566.15 }
};
const VSOP87COEFFICIENT Earth_SLG5[1] =
{
	{ 1.0, 3.14, 0.0 }
};
// ------------------------------------------------------------------------
//
// 计算太阳在黄道面上的经度（单位：度）
//
// dbJD[IN]：儒略日（计算该时刻太阳在黄道面上的经度）
//
// 返回太阳黄经度数
// ------------------------------------------------------------------------
double w_GetSunLongitude(const double & dbJD)
{
	// 计算τ
	double dt = (dbJD - 2451545.0) / 365250.0;
	double dL = 0.0, dL0 = 0.0, dL1 = 0.0, dL2 = 0.0, dL3 = 0.0, dL4 = 0.0, dL5 = 0.0;
	// L0 38x3
	for (int i = 0; i < sizeof(Earth_SLG0) / sizeof(VSOP87COEFFICIENT); i++)
		dL0 += (Earth_SLG0[i].dA * cos((Earth_SLG0[i].dB + Earth_SLG0[i].dC * dt)));
	// L1 16x3
	for (int i = 0; i < sizeof(Earth_SLG1) / sizeof(VSOP87COEFFICIENT); i++)
		dL1 += (Earth_SLG1[i].dA * cos((Earth_SLG1[i].dB + Earth_SLG1[i].dC * dt)));
	// L2 10x3
	for (int i = 0; i < sizeof(Earth_SLG2) / sizeof(VSOP87COEFFICIENT); i++)
		dL2 += (Earth_SLG2[i].dA * cos((Earth_SLG2[i].dB + Earth_SLG2[i].dC * dt)));
	// L3 8x3
	for (int i = 0; i < sizeof(Earth_SLG3) / sizeof(VSOP87COEFFICIENT); i++)
		dL3 += (Earth_SLG3[i].dA * cos((Earth_SLG3[i].dB + Earth_SLG3[i].dC * dt)));
	// L4 6x3
	for (int i = 0; i < sizeof(Earth_SLG4) / sizeof(VSOP87COEFFICIENT); i++)
		dL4 += (Earth_SLG4[i].dA * cos((Earth_SLG4[i].dB + Earth_SLG4[i].dC * dt)));
	// L5 1x3
	for (int i = 0; i < sizeof(Earth_SLG5) / sizeof(VSOP87COEFFICIENT); i++)
		dL5 += (Earth_SLG5[i].dA * cos((Earth_SLG5[i].dB + Earth_SLG5[i].dC * dt)));
	// 计算 L = ( L0 + L1 * τ^1 + L2 * τ^2 + L3 * τ^3 + L4 * τ^4 + L5 * τ^5 ) / 10^8 ;（单位弧度）
	dL = (dL0 + (dL1 * dt) + (dL2 * (dt * dt)) + (dL3 * (dt * dt * dt)) * (dL4 * (dt * dt * dt * dt)) + (dL5 * (dt * dt * dt * dt * dt))) / 100000000.0;
	// 转化为度θ = L + 180 （单位度）;
	return (w_MapTo0To360Range(w_MapTo0To360Range(dL / dbUnitRadian) + 180.0));
}

//
// 计算太阳黄纬用参数
const VSOP87COEFFICIENT Earth_SLT0[5] =
{
	{ 280.0, 3.199, 84334.662 },
	{ 102.0, 5.422, 5507.553 },
	{ 80.0, 3.880, 5223.690 },
	{ 44.0, 3.700, 2352.870 },
	{ 32.0, 4.000, 1577.340 }
};
const VSOP87COEFFICIENT Earth_SLT1[2] =
{
	{ 9.0, 3.90, 5507.55 },
	{ 6.0, 1.73, 5223.69 }
};
const VSOP87COEFFICIENT Earth_SLT2[4] =
{
	{ 22378.0, 3.38509, 10213.28555 },
	{ 282.0, 0.00000, 00000.00000 },
	{ 173.0, 5.25600, 20426.57100 },
	{ 27.0, 3.87000, 30639.86000 }
};
const VSOP87COEFFICIENT Earth_SLT3[4] =
{
	{ 647.0, 4.992, 10213.286 },
	{ 20.0, 3.140, 00000.000 },
	{ 6.0, 0.770, 20426.570 },
	{ 3.0, 5.440, 30639.860 }
};
const VSOP87COEFFICIENT Earth_SLT4[1] =
{
	{ 14.0, 0.32, 10213.29 }
};
// ------------------------------------------------------------------------
//
// 计算太阳在黄道面上的纬度（单位：度）
//
// dbJD[IN]：儒略日（计算该时刻太阳在黄道面上的纬度）
//
// 返回太阳黄纬度数
// ------------------------------------------------------------------------
double w_GetSunLatitude(const double & dbJD)
{
	// 计算τ
	double dbt = (dbJD - 2451545.0) / 365250.0;
	double dbB = 0.0, dbB0 = 0.0, dbB1 = 0.0, dbB2 = 0.0, dbB3 = 0.0, dbB4 = 0.0;
	// B0 5x3
	for (int i = 0; i < sizeof(Earth_SLT0) / sizeof(VSOP87COEFFICIENT); i++)
		dbB0 += (Earth_SLT0[i].dA * cos((Earth_SLT0[i].dB + Earth_SLT0[i].dC * dbt)));
	// B1 2x3
	for (int i = 0; i < sizeof(Earth_SLT1) / sizeof(VSOP87COEFFICIENT); i++)
		dbB1 += (Earth_SLT1[i].dA * cos((Earth_SLT1[i].dB + Earth_SLT1[i].dC * dbt)));
	// B2 4x3
	for (int i = 0; i < sizeof(Earth_SLT2) / sizeof(VSOP87COEFFICIENT); i++)
		dbB2 += (Earth_SLT2[i].dA * cos((Earth_SLT2[i].dB + Earth_SLT2[i].dC * dbt)));

	// B3 4x3
	for (int i = 0; i < sizeof(Earth_SLT3) / sizeof(VSOP87COEFFICIENT); i++)
		dbB3 += (Earth_SLT3[i].dA * cos((Earth_SLT3[i].dB + Earth_SLT3[i].dC * dbt)));

	// B4 1x3
	for (int i = 0; i < sizeof(Earth_SLT4) / sizeof(VSOP87COEFFICIENT); i++)
		dbB4 += (Earth_SLT4[i].dA * cos((Earth_SLT4[i].dB + Earth_SLT4[i].dC * dbt)));

	// 计算 B = ( B0 + B1 * τ^1 + B2 * τ^2 + B3 * τ^3 + B4 * τ^4 ) / 10^8 ;（单位弧度）
	dbB = (dbB0 + (dbB1 * dbt) + (dbB2 * (dbt * dbt)) + (dbB3 * (dbt * dbt * dbt)) * (dbB4 * (dbt * dbt * dbt * dbt))) / 100000000.0;
	// 计算 θ（单位度）;
	return -(dbB / dbUnitRadian);
}

// ------------------------------------------------------------------------
//
// 修正某时刻太阳在黄道上的经度（黄经）
//
// dbSrcLongitude[IN]：黄经
// dbSrcLatitude[IN]：黄纬
// dbJD[IN]：儒略日（修正在该时刻太阳的黄经）
//
// 返回太阳黄经度数
// ------------------------------------------------------------------------
double w_CorrectionCalcSunLongitude(const double &dbSrcLongitude, const double &dbSrcLatitude, const double &dbJD)
{
	double dbT = (dbJD - 2451545.0) / 36525.0;
	double dbLdash = dbSrcLongitude - 1.397 * dbT - 0.00031 * dbT * dbT;
	// 转换为弧度
	dbLdash *= dbUnitRadian;
	return (-0.09033 + 0.03916 * (cos(dbLdash) + sin(dbLdash)) * tan(dbSrcLatitude * dbUnitRadian)) / 3600.0;
}

double fCrctSunLat(double dbSrcLongitude, double dbSrcLatitude, double dbJD)
{
	double dbT = (dbJD - 2451545.0) / 36525.0;
	double dbLdash = dbSrcLongitude - 1.397 * dbT - 0.00031 * dbT * dbT;
	// 转换为弧度
	dbLdash *= dbUnitRadian;	// π/180
	double l_Rst = (+0.03916 * (cos(dbLdash) - sin(dbLdash))) / 3600;	// 得到的是秒，度分秒系统里的秒，÷3600转成度
	return l_Rst;
}

//
// 二次修正黄经黄纬所需的天体章动系数
const NUTATIONCOEFFICIENT Nutation_Gene[63] =
{
	{ 0, 0, 0, 0, 1, -171996, -174.2, 92025, 8.9 },
	{ -2, 0, 0, 2, 2, -13187, -1.6, 5736, -3.1 },
	{ 0, 0, 0, 2, 2, -2274, -0.2, 977, -0.5 },
	{ 0, 0, 0, 0, 2, 2062, 0.2, -895, 0.5 },
	{ 0, 1, 0, 0, 0, 1426, -3.4, 54, -0.1 },
	{ 0, 0, 1, 0, 0, 712, 0.1, -7, 0 },
	{ -2, 1, 0, 2, 2, -517, 1.2, 224, -0.6 },
	{ 0, 0, 0, 2, 1, -386, -0.4, 200, 0 },
	{ 0, 0, 1, 2, 2, -301, 0, 129, -0.1 },
	{ -2, -1, 0, 2, 2, 217, -0.5, -95, 0.3 },
	{ -2, 0, 1, 0, 0, -158, 0, 0, 0 },
	{ -2, 0, 0, 2, 1, 129, 0.1, -70, 0 },
	{ 0, 0, -1, 2, 2, 123, 0, -53, 0 },
	{ 2, 0, 0, 0, 0, 63, 0, 0, 0 },
	{ 0, 0, 1, 0, 1, 63, 0.1, -33, 0 },
	{ 2, 0, -1, 2, 2, -59, 0, 26, 0 },
	{ 0, 0, -1, 0, 1, -58, -0.1, 32, 0 },
	{ 0, 0, 1, 2, 1, -51, 0, 27, 0 },
	{ -2, 0, 2, 0, 0, 48, 0, 0, 0 },
	{ 0, 0, -2, 2, 1, 46, 0, -24, 0 },
	{ 2, 0, 0, 2, 2, -38, 0, 16, 0 },
	{ 0, 0, 2, 2, 2, -31, 0, 13, 0 },
	{ 0, 0, 2, 0, 0, 29, 0, 0, 0 },
	{ -2, 0, 1, 2, 2, 29, 0, -12, 0 },
	{ 0, 0, 0, 2, 0, 26, 0, 0, 0 },
	{ -2, 0, 0, 2, 0, -22, 0, 0, 0 },
	{ 0, 0, -1, 2, 1, 21, 0, -10, 0 },
	{ 0, 2, 0, 0, 0, 17, -0.1, 0, 0 },
	{ 2, 0, -1, 0, 1, 16, 0, -8, 0 },
	{ -2, 2, 0, 2, 2, -16, 0.1, 7, 0 },
	{ 0, 1, 0, 0, 1, -15, 0, 9, 0 },
	{ -2, 0, 1, 0, 1, -13, 0, 7, 0 },
	{ 0, -1, 0, 0, 1, -12, 0, 6, 0 },
	{ 0, 0, 2, -2, 0, 11, 0, 0, 0 },
	{ 2, 0, -1, 2, 1, -10, 0, 5, 0 },
	{ 2, 0, 1, 2, 2, -8, 0, 3, 0 },
	{ 0, 1, 0, 2, 2, 7, 0, -3, 0 },
	{ -2, 1, 1, 0, 0, -7, 0, 0, 0 },
	{ 0, -1, 0, 2, 2, -7, 0, 3, 0 },
	{ 2, 0, 0, 2, 1, -7, 0, 3, 0 },
	{ 2, 0, 1, 0, 0, 6, 0, 0, 0 },
	{ -2, 0, 2, 2, 2, 6, 0, -3, 0 },
	{ -2, 0, 1, 2, 1, 6, 0, -3, 0 },
	{ 2, 0, -2, 0, 1, -6, 0, 3, 0 },
	{ 2, 0, 0, 0, 1, -6, 0, 3, 0 },
	{ 0, -1, 1, 0, 0, 5, 0, 0, 0 },
	{ -2, -1, 0, 2, 1, -5, 0, 3, 0 },
	{ -2, 0, 0, 0, 1, -5, 0, 3, 0 },
	{ 0, 0, 2, 2, 1, -5, 0, 3, 0 },
	{ -2, 0, 2, 0, 1, 4, 0, 0, 0 },
	{ -2, 1, 0, 2, 1, 4, 0, 0, 0 },
	{ 0, 0, 1, -2, 0, 4, 0, 0, 0 },
	{ -1, 0, 1, 0, 0, -4, 0, 0, 0 },
	{ -2, 1, 0, 0, 0, -4, 0, 0, 0 },
	{ 1, 0, 0, 0, 0, -4, 0, 0, 0 },
	{ 0, 0, 1, 2, 0, 3, 0, 0, 0 },
	{ 0, 0, -2, 2, 2, -3, 0, 0, 0 },
	{ -1, -1, 1, 0, 0, -3, 0, 0, 0 },
	{ 0, 1, 1, 0, 0, -3, 0, 0, 0 },
	{ 0, -1, 1, 2, 2, -3, 0, 0, 0 },
	{ 2, -1, -1, 2, 2, -3, 0, 0, 0 },
	{ 0, 0, 3, 2, 2, -3, 0, 0, 0 },
	{ 2, -1, 0, 2, 2, -3, 0, 0, 0 }
};
// ------------------------------------------------------------------------
//
// 计算天体章动
// 二次修正某时刻太阳在黄道上的纬度（单位：度）
// 使用天体章动系数修正，消除扰动影响
//
// dbJD[IN]：儒略日（计算该时刻天体章动补偿量）
//
// 返回天体扰动干扰量
// ------------------------------------------------------------------------
double w_GetNutationJamScalar(const double &dbJD)
{
	double dbT = (dbJD - 2451545.0) / 36525.0;
	double dbTsquared = dbT * dbT;
	double dbTcubed = dbTsquared * dbT;
	double dbD = 297.85036 + 445267.111480 * dbT - 0.0019142 * dbTsquared + dbTcubed / 189474.0;
	dbD = w_MapTo0To360Range(dbD);
	double dbM = 357.52772 + 35999.050340 * dbT - 0.0001603 * dbTsquared - dbTcubed / 300000.0;
	dbM = w_MapTo0To360Range(dbM);
	double dbMprime = 134.96298 + 477198.867398 * dbT + 0.0086972 * dbTsquared + dbTcubed / 56250.0;
	dbMprime = w_MapTo0To360Range(dbMprime);
	double dbF = 93.27191 + 483202.017538 * dbT - 0.0036825 * dbTsquared + dbTcubed / 327270.0;
	dbF = w_MapTo0To360Range(dbF);
	double dbOmega = 125.04452 - 1934.136261 * dbT + 0.0020708 * dbTsquared + dbTcubed / 450000.0;
	dbOmega = w_MapTo0To360Range(dbOmega);
	double dbResulte = 0.0;
	for (int i = 0; i < sizeof(Nutation_Gene) / sizeof(NUTATIONCOEFFICIENT); i++)
	{
		double dbRadargument = (Nutation_Gene[i].nD * dbD + Nutation_Gene[i].nM * dbM + Nutation_Gene[i].nMprime * dbMprime + Nutation_Gene[i].nF * dbF + Nutation_Gene[i].nOmega * dbOmega) * dbUnitRadian;
		dbResulte += (Nutation_Gene[i].nSincoeff1 + Nutation_Gene[i].dSincoeff2 * dbT) * sin(dbRadargument) * 0.0001;
	}
	return dbResulte; // 秒（度分秒）
}

//
// 计算太阳向量半径用参数
const VSOP87COEFFICIENT Earth_SRV0[40] =
{
	{ 100013989, 0, 0 },
	{ 1670700, 3.0984635, 6283.0758500 },
	{ 13956, 3.05525, 12566.15170 },
	{ 3084, 5.1985, 77713.7715 },
	{ 1628, 1.1739, 5753.3849 },
	{ 1576, 2.8469, 7860.4194 },
	{ 925, 5.453, 11506.770 },
	{ 542, 4.564, 3930.210 },
	{ 472, 3.661, 5884.927 },
	{ 346, 0.964, 5507.553 },
	{ 329, 5.900, 5223.694 },
	{ 307, 0.299, 5573.143 },
	{ 243, 4.273, 11790.629 },
	{ 212, 5.847, 1577.344 },
	{ 186, 5.022, 10977.079 },
	{ 175, 3.012, 18849.228 },
	{ 110, 5.055, 5486.778 },
	{ 98, 0.89, 6069.78 },
	{ 86, 5.69, 15720.84 },
	{ 86, 1.27, 161000.69 },
	{ 65, 0.27, 17260.15 },
	{ 63, 0.92, 529.69 },
	{ 57, 2.01, 83996.85 },
	{ 56, 5.24, 71430.70 },
	{ 49, 3.25, 2544.31 },
	{ 47, 2.58, 775.52 },
	{ 45, 5.54, 9437.76 },
	{ 43, 6.01, 6275.96 },
	{ 39, 5.36, 4694.00 },
	{ 38, 2.39, 8827.39 },
	{ 37, 0.83, 19651.05 },
	{ 37, 4.90, 12139.55 },
	{ 36, 1.67, 12036.46 },
	{ 35, 1.84, 2942.46 },
	{ 33, 0.24, 7084.90 },
	{ 32, 0.18, 5088.63 },
	{ 32, 1.78, 398.15 },
	{ 28, 1.21, 6286.60 },
	{ 28, 1.90, 6279.55 },
	{ 26, 4.59, 10447.39 }
};
const VSOP87COEFFICIENT Earth_SRV1[10] =
{
	{ 103019, 1.107490, 6283.075850 },
	{ 1721, 1.0644, 12566.1517 },
	{ 702, 3.142, 0 },
	{ 32, 1.02, 18849.23 },
	{ 31, 2.84, 5507.55 },
	{ 25, 1.32, 5223.69 },
	{ 18, 1.42, 1577.34 },
	{ 10, 5.91, 10977.08 },
	{ 9, 1.42, 6275.96 },
	{ 9, 0.27, 5486.78 }
};
const VSOP87COEFFICIENT Earth_SRV2[6] =
{
	{ 4359, 5.7846, 6283.0758 },
	{ 124, 5.579, 12566.152 },
	{ 12, 3.14, 0 },
	{ 9, 3.63, 77713.77 },
	{ 6, 1.87, 5573.14 },
	{ 3, 5.47, 18849.23 }
};
const VSOP87COEFFICIENT Earth_SRV3[2] =
{
	{ 145, 4.273, 6283.076 },
	{ 7, 3.92, 12566.15 }
};
const VSOP87COEFFICIENT Earth_SRV4[1] =
{
	{ 4, 2.56, 6283.08 }
};
// ------------------------------------------------------------------------
//
// 计算某时刻太阳半径向量
// 三次修正某时刻太阳在黄道上的经度（单位：弧度）
//
// dbJD[IN]：儒略日（计算该时刻太阳半径向量）
//
// 返回太阳半径向量
// ------------------------------------------------------------------------
double w_GetSunRadiusVector(const double &dbJD)
{
	// 计算τ
	double dbt = (dbJD - 2451545.0) / 365250.0;
	double dbR = 0.0, dbR0 = 0.0, dbR1 = 0.0, dbR2 = 0.0, dbR3 = 0.0, dbR4 = 0.0;
	// R0 40x3
	for (int i = 0; i < sizeof(Earth_SRV0) / sizeof(VSOP87COEFFICIENT); i++)
		dbR0 += (Earth_SRV0[i].dA * cos((Earth_SRV0[i].dB + Earth_SRV0[i].dC * dbt)));
	// R1 10x3
	for (int i = 0; i < sizeof(Earth_SRV1) / sizeof(VSOP87COEFFICIENT); i++)
		dbR1 += (Earth_SRV1[i].dA * cos((Earth_SRV1[i].dB + Earth_SRV1[i].dC * dbt)));
	// R2 6x3
	for (int i = 0; i < sizeof(Earth_SRV2) / sizeof(VSOP87COEFFICIENT); i++)
		dbR2 += (Earth_SRV2[i].dA * cos((Earth_SRV2[i].dB + Earth_SRV2[i].dC * dbt)));
	// R3 2x3
	for (int i = 0; i < sizeof(Earth_SRV3) / sizeof(VSOP87COEFFICIENT); i++)
		dbR3 += (Earth_SRV3[i].dA * cos((Earth_SRV3[i].dB + Earth_SRV3[i].dC * dbt)));
	// R4 1x3
	for (int i = 0; i < sizeof(Earth_SRV4) / sizeof(VSOP87COEFFICIENT); i++)
		dbR4 += (Earth_SRV4[i].dA * cos((Earth_SRV4[i].dB + Earth_SRV4[i].dC * dbt)));
	// 计算 R = ( R0 + R1 * τ^1 + R2 * τ^2 + R3 * τ^3 + R4 * τ^4 ) / 10^8 ;（单位弧度）
	return ((dbR0 + (dbR1 * dbt) + (dbR2 * (dbt * dbt)) + (dbR3 * (dbt * dbt * dbt)) * (dbR4 * (dbt * dbt * dbt * dbt))) / 100000000.0);
}

// ------------------------------------------------------------------------
//
// 计算某时刻太阳黄经黄纬	//@这个函数根本没调用！
//
// dbJD[IN]：儒略日（计算该时刻太阳在黄道面上的经度和纬度）
// dbLongitude[OUT]：黄经
// dbLatitude[OUT]：黄纬
// ------------------------------------------------------------------------
//void w_CalcEclipticLongLat(const double & dbJD, double &dbLongitude, double &dbLatitude)
//{
//	// 计算太阳黄经
//	dbLongitude = w_GetSunLongitude(dbJD);	// 角度
//	// 计算太阳黄纬
//	dbLatitude = w_GetSunLatitude(dbJD);	// 角度
//	// 一次校正经度
//	dbLongitude += w_CorrectionCalcSunLongitude(dbLongitude, dbLatitude, dbJD);
//
//	//@ 校正纬度
//	dbLatitude += fCrctSunLat(dbLongitude, dbLatitude, dbJD);
//
//	// 二次校正天体章动
//	dbLongitude += w_GetNutationJamScalar(dbJD) / 3600.0;
//	// 三次校正太阳半径向量
//	dbLongitude -= (20.4898 / w_GetSunRadiusVector(dbJD)) / 3600.0;
//	// 校正太阳黄纬
////@	dbLatitude += w_CorrectionCalcSunLatitude(dbLongitude, dbJD);	//没有？
//}

// ------------------------------------------------------------------------
//
// 计算节气
//
// year[IN]：公历年份（计算该年份，指定节气的时间）
// ST_SolarTerms[IN]：节气指定的节气
//
// 返回指定节气的儒略日时间
// ------------------------------------------------------------------------

double fGetSunEclipticLongitudeECDegree(double a_JD, SOLARTERMS ST_SolarTerms)
{
	// 计算太阳黄经
	double dbLongitude = w_GetSunLongitude(a_JD);
	// 一次校正经度
	dbLongitude += w_CorrectionCalcSunLongitude(dbLongitude, w_GetSunLatitude(a_JD), a_JD);
	// 二次校正天体章动
	dbLongitude += w_GetNutationJamScalar(a_JD) / 3600.0;
	// 三次校正太阳半径向量
	//	dbLongitude -= (20.4898 / w_GetSunRadiusVector(a_JD)) / 3600.0;
	dbLongitude -= (20.49552 / w_GetSunRadiusVector(a_JD)) / 3600.0 / (20 * PI);	//@ 20*PI 文档中还除了这一项！

	// 由于春分这天黄经为 0 度，比较特殊，因此专门判断（如不加以特殊对待则会导致计算范围覆盖整个 360 度角）
	dbLongitude = ((ST_SolarTerms == ST_VERNAL_EQUINOX) && (dbLongitude > 345.0)) ? -dbLongitude : dbLongitude;
	return dbLongitude;
}

double w_CalcSolarTerms(const int &year, const SOLARTERMS &ST_SolarTerms)
{
	// 节气月份
	int SolarTermsMonth = static_cast<int>(ceil(static_cast<double>((ST_SolarTerms + 90.0) / 30.0)));
	SolarTermsMonth = SolarTermsMonth > 12 ? SolarTermsMonth - 12 : SolarTermsMonth;
	// 节令的发生日期基本都在每月 4 - 9 号间
	int LowerLimitSolarTermsDay = ST_SolarTerms % 15 == 0 && ST_SolarTerms % 30 != 0 ? 1 : 15;//4 : 16;
	// 节气的发生日期基本都在每月 16 - 24 号间
	int UpperLimitSolarTermsDay = ST_SolarTerms % 15 == 0 && ST_SolarTerms % 30 != 0 ? 16 : 28;//9 : 24;
	// 采用二分法逼近计算
	double dbLowerLinit = w_GDToJD(year, SolarTermsMonth, LowerLimitSolarTermsDay, 0, 0, 0);
	double dbUpperLinit = w_GDToJD(year, SolarTermsMonth, UpperLimitSolarTermsDay, 23, 59, 59);
	// 二分法分界点日期
	double dbDichotomyDivisionDayJD = 0;
	// 太阳黄经角度
	double dbLongitude = 0;
	// 对比二分法精度是否达到要求
	for (; fabs(dbLongitude - static_cast<double>(ST_SolarTerms)) >= 0.0000001;)
	{
		if (dbUpperLinit <= dbLowerLinit)
		{
			break;
		}


		dbDichotomyDivisionDayJD = ((dbUpperLinit - dbLowerLinit) / 2.0) + dbLowerLinit;

		/*
		// 计算太阳黄经
		dbLongitude = w_GetSunLongitude(dbDichotomyDivisionDayJD);
		// 一次校正经度
		dbLongitude += w_CorrectionCalcSunLongitude(dbLongitude, w_GetSunLatitude(dbDichotomyDivisionDayJD), dbDichotomyDivisionDayJD);
		// 二次校正天体章动
		dbLongitude += w_GetNutationJamScalar(dbDichotomyDivisionDayJD) / 3600.0;
		// 三次校正太阳半径向量
		//	dbLongitude -= (20.4898 / w_GetSunRadiusVector(dbDichotomyDivisionDayJD)) / 3600.0;
		dbLongitude -= (20.49552 / w_GetSunRadiusVector(dbDichotomyDivisionDayJD)) / 3600.0 / (20 * PI);	//@ 20*PI 文档中还除了这一项！

		// 由于春分这天黄经为 0 度，比较特殊，因此专门判断（如不加以特殊对待则会导致计算范围覆盖整个 360 度角）
		dbLongitude = ((ST_SolarTerms == ST_VERNAL_EQUINOX) && (dbLongitude > 345.0)) ? -dbLongitude : dbLongitude;
		//*/

		dbLongitude = fGetSunEclipticLongitudeECDegree(dbDichotomyDivisionDayJD, ST_SolarTerms);


		// 调整二分法上下限
		(dbLongitude > static_cast<double>(ST_SolarTerms)) ? dbUpperLinit = dbDichotomyDivisionDayJD : dbLowerLinit = dbDichotomyDivisionDayJD;
	}
	return dbDichotomyDivisionDayJD;
}

double fEstmInitGuess(int a_Year, SOLARTERMS a_Ang)
{
	/*
	二十四节气
	春分0° 3月20——21日 玄鸟至、雷乃发声、始电
	清明15° 4月4——6日 桐始华、鼠化为鴽、虹始见
	谷雨30° 4月19——21日 萍始生、鸣鸠拂其羽、戴胜降于桑
	立夏45° 5月5——7日 蝼蝈鸣、蚯蚓出、王瓜生
	小满60° 5月20——22日 苦菜秀、靡草死、麦秋至
	芒种75° 6月5——7日 螳螂生、鹏始鸣、反舌无声
	夏至90° 6月21——22日 鹿角解、蜩始鸣、半夏生
	小暑105° 7月6——8日温风至、蟋蟀居宇、鹰始鸷
	大暑120° 7月22——24日 腐草为萤、土润溽暑、大雨时行
	立秋135° 8月7——9日 凉风至、白露生、寒蝉鸣
	处暑150° 8月22——24日 鹰乃祭鸟、天地始肃、禾乃登
	白露165° 9月7——9日 鸿雁来、玄鸟归、群鸟养羞
	秋分180° 9月22——24日 雷始收声、蛰虫坯户、水始涸
	寒露195° 10月8——9日 鸿雁来宾、雀入水为蛤、菊有黄华
	霜降210° 10月23——24日 豺乃祭兽、草木黄落、蛰虫咸俯
	立冬225° 11月7——8日 水始冰、地始冻、雉入大水为蜃
	小雪240° 11月22——23日 虹藏不见、天气上升、闭塞成冬
	大雪255° 12月6——8日 鹃鸥不鸣、虎始交、荔挺出
	冬至270° 12月21——23日 （苗历新年） 蚯蚓结、糜角解、水泉动
	小寒285° 1月5——7日 雁北乡、鹊始巢、雉始鸲
	大寒300° 1月20——21日 鸡始乳、征鸟厉疾、水泽腹坚
	立春315° 2月3——5日 东风解冻、蛰虫始振、鱼上冰
	雨水330° 2月18——20日 獭祭鱼、鸿雁来、草木萌动
	惊蛰345° 3月5——7日桃始华、仓庚鸣、鹰化为鸠

	关于七十二候详情，见词条“七十二候”。
	*/

	double l_Rst;
	switch (a_Ang)
	{
	case ST_VERNAL_EQUINOX:
		l_Rst = w_GDToJD(a_Year, 3, 20, 0, 0, 0);
		break;
	case ST_CLEAR_AND_BRIGHT:
		l_Rst = w_GDToJD(a_Year, 4, 4, 0, 0, 0);
		break;
	case ST_GRAIN_RAIN:
		l_Rst = w_GDToJD(a_Year, 4, 19, 0, 0, 0);
		break;
	case ST_SUMMER_BEGINS:
		l_Rst = w_GDToJD(a_Year, 5, 5, 0, 0, 0);
		break;
	case ST_GRAIN_BUDS:
		l_Rst = w_GDToJD(a_Year, 5, 20, 0, 0, 0);
		break;
	case ST_GRAIN_IN_EAR:
		l_Rst = w_GDToJD(a_Year, 6, 5, 0, 0, 0);
		break;
	case ST_SUMMER_SOLSTICE:
		l_Rst = w_GDToJD(a_Year, 6, 21, 0, 0, 0);
		break;
	case ST_SLIGHT_HEAT:
		l_Rst = w_GDToJD(a_Year, 7, 6, 0, 0, 0);
		break;
	case ST_GREAT_HEAT:
		l_Rst = w_GDToJD(a_Year, 7, 22, 0, 0, 0);
		break;
	case ST_AUTUMN_BEGINS:
		l_Rst = w_GDToJD(a_Year, 8, 7, 0, 0, 0);
		break;
	case ST_STOPPING_THE_HEAT:
		l_Rst = w_GDToJD(a_Year, 8, 22, 0, 0, 0);
		break;
	case ST_WHITE_DEWS:
		l_Rst = w_GDToJD(a_Year, 9, 7, 0, 0, 0);
		break;
	case ST_AUTUMN_EQUINOX:
		l_Rst = w_GDToJD(a_Year, 9, 22, 0, 0, 0);
		break;
	case ST_COLD_DEWS:
		l_Rst = w_GDToJD(a_Year, 10, 8, 0, 0, 0);
		break;
	case ST_HOAR_FROST_FALLS:
		l_Rst = w_GDToJD(a_Year, 10, 23, 0, 0, 0);
		break;
	case ST_WINTER_BEGINS:
		l_Rst = w_GDToJD(a_Year, 11, 7, 0, 0, 0);
		break;
	case ST_LIGHT_SNOW:
		l_Rst = w_GDToJD(a_Year, 11, 22, 0, 0, 0);
		break;
	case ST_HEAVY_SNOW:
		l_Rst = w_GDToJD(a_Year, 12, 6, 0, 0, 0);
		break;
	case ST_WINTER_SOLSTICE:
		l_Rst = w_GDToJD(a_Year, 12, 21, 0, 0, 0);
		break;
	case ST_SLIGHT_COLD:
		l_Rst = w_GDToJD(a_Year, 1, 5, 0, 0, 0);
		break;
	case ST_GREAT_COLD:
		l_Rst = w_GDToJD(a_Year, 1, 20, 0, 0, 0);
		break;
	case ST_SPRING_BEGINS:
		l_Rst = w_GDToJD(a_Year, 2, 3, 0, 0, 0);
		break;
	case ST_THE_RAINS:
		l_Rst = w_GDToJD(a_Year, 2, 18, 0, 0, 0);
		break;
	case ST_INSECTS_AWAKEN:
		l_Rst = w_GDToJD(a_Year, 3, 5, 0, 0, 0);
		break;
	}

	return l_Rst;
}

double fCalcSolarTerms_Newton(const int &year, const SOLARTERMS &ST_SolarTerms)
{
	double l_JD0, l_JD1, l_Lon, l_LonDrv;
	double l_Ang = (double)ST_SolarTerms;

	l_JD1 = fEstmInitGuess(year, ST_SolarTerms);
	int l_Cnt = 0;
	do
	{
		l_JD0 = l_JD1;

		// 计算太阳黄经
		l_Lon = fGetSunEclipticLongitudeECDegree(l_JD0, ST_SolarTerms) - l_Ang;
		l_LonDrv = (fGetSunEclipticLongitudeECDegree(l_JD0 + 0.000005, ST_SolarTerms) - 
			fGetSunEclipticLongitudeECDegree(l_JD0 - 0.000005, ST_SolarTerms)) / 0.00001;

		l_JD1 = l_JD0 - l_Lon / l_LonDrv;

		++l_Cnt;
	} while ((fabs(l_JD1 - l_JD0) > 0.0000001) && (l_Cnt < 100)); // 最多迭代100次
	cout << "牛顿迭代次数 = " << l_Cnt << endl;
	return l_JD1;
}

/*
功能：计算一年中指定月份的天数
*/
int w_GetDaysOfMonth(int year, int month)
{
	const int daysOfMonth[] = { 0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };

	if (month == 2 && ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0))
	{
		return daysOfMonth[month] + 1;
	}
	else
	{
		return daysOfMonth[month];
	}
}

// ------------------------------------------------------------------------
//
// 格林威治时间转本地时间（以格里历表示本地时间）
//
// ------------------------------------------------------------------------
void w_UTCToLST(int &year, int &month, int &day, int &hour, int &minute, int &second)
{
	_tzset();
	// 计算本地时间和标准时间的时差（单位：秒）
	long l_timezone;	_get_timezone(&l_timezone);
	int nDifference_hour = static_cast<int>(l_timezone / 3600);
	int nDifference_minute = static_cast<int>((l_timezone - nDifference_hour * 3600) / 60);
	int nDifference_second = static_cast<int>((l_timezone - nDifference_hour * 3600) - nDifference_minute * 60);
	// 格林威治时间 + 时差 = 本地时间
	// 秒
	second = second - nDifference_second;
	if (second >= 60 || second < 0)
	{
		minute = second > 0 ? minute + 1 : minute - 1;
		second = abs(abs(second) - 60);
	}
	// 分
	minute = minute - nDifference_minute;
	if (minute >= 60 || minute < 0)
	{
		hour = minute > 0 ? hour + 1 : hour - 1;
		minute = abs(abs(minute) - 60);
	}
	// 时
	hour = hour - nDifference_hour;
	if (hour >= 24 || hour < 0)
	{
		day = (hour >= 24 || hour == 0) ? day + 1 : day - 1;
		hour = abs(abs(hour) - 24);
	}
	// 日
	int nDaysOfMonth = w_GetDaysOfMonth(year, month);
	if (day > nDaysOfMonth || day <= 0)
	{
		if (day > nDaysOfMonth)
			month++;
		if (day < nDaysOfMonth || day <= 0)
			month--;
		day = abs(abs(day) - nDaysOfMonth);
	}
	// 月
	if (month > 12 || month <= 0)
	{
		year = month > 0 ? year + 1 : year - 1;
		month = month > 0 ? abs(month - 12) : abs(12 + month);
	}
}
// ------------------------------------------------------------------------
//
// 本地时间转格林威治时间（以格里历表示）
//
// ------------------------------------------------------------------------
void w_LSTToUTC(int &year, int &month, int &day, int &hour, int &minute, int &second)
{
	_tzset();
	// 计算本地时间和标准时间的时差（单位：秒）
	long l_timezone;	_get_timezone(&l_timezone);
	int nDifference_hour = static_cast<int>(l_timezone / 3600);
	int nDifference_minute = static_cast<int>((l_timezone - nDifference_hour * 3600) / 60);
	int nDifference_second = static_cast<int>((l_timezone - nDifference_hour * 3600) - nDifference_minute * 60);
	// 本地时间 - 时差 = 格林威治时间
	// 秒
	second = second + nDifference_second;
	if (second >= 60 || second < 0)
	{
		minute = second > 0 ? minute + 1 : minute - 1;
		second = abs(abs(second) - 60);
	}
	// 分
	minute = minute + nDifference_minute;
	if (minute >= 60 || minute < 0)
	{
		hour = minute > 0 ? hour + 1 : hour - 1;
		minute = abs(abs(minute) - 60);
	}
	// 时
	hour = hour + nDifference_hour;
	if (hour >= 24 || hour < 0)
	{
		day = (hour >= 24 || hour == 0) ? day + 1 : day - 1;
		hour = abs(abs(hour) - 24);
	}
	// 日
	int nDaysOfMonth = w_GetDaysOfMonth(year, month);
	if (day > nDaysOfMonth || day <= 0)
	{
		if (day > nDaysOfMonth)
			month++;
		if (day < nDaysOfMonth || day <= 0)
			month--;
		day = abs(abs(day) - nDaysOfMonth);
	}
	// 月
	if (month > 12 || month <= 0)
	{
		year = month > 0 ? year + 1 : year - 1;
		month = month > 0 ? abs(month - 12) : abs(12 + month);
	}
}

int _tmain(int argc, _TCHAR* argv[])
{
	// ST_SPRING_BEGINS ST_WINTER_SOLSTICE
	// 2021年冬至，偏多35秒，成22号（百度算是21号）。
//	double l_JD = w_CalcSolarTerms(2012, ST_WINTER_SOLSTICE);
	double l_JD = fCalcSolarTerms_Newton(2012, ST_WINTER_SOLSTICE);

	int l_Year, l_Mon, l_Day, l_Hour, l_Min, l_Sec;
	w_JDToGD(l_JD, l_Year, l_Mon, l_Day, l_Hour, l_Min, l_Sec);
	cout << "格林威治时间：" << l_Year << ", " << l_Mon << ", " << l_Day << ", " << l_Hour << ", " << l_Min << ", " << l_Sec << endl;
	w_UTCToLST(l_Year, l_Mon, l_Day, l_Hour, l_Min, l_Sec);
	cout << "本地时间：" << l_Year << ", " << l_Mon << ", " << l_Day << ", " << l_Hour << ", " << l_Min << ", " << l_Sec << endl;

	/////////////////////////////////////////////////////////////////////////
	cout << endl << "===============================================" << endl;
	cin.get();
	return 0;
}

