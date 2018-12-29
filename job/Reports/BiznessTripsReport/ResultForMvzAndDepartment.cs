using System.Collections.Generic;

namespace WSSC.V4.DMS.OMK.Reports.BiznessTripsReport
{
	/// <summary>
	/// Класс описывающий суммарные расходы МВЗ и Подразделения
	/// Примечание: из экземпляров этих классов строится список строк отчета
	/// </summary>
	internal class ResultForMvzAndDepartment
	{
		// МВЗ
		internal string Mvz { get; set; }

		// Подразделение
		internal string Department { get; set; }

		// Суммы потраченные на командировки в России, ключи 0 - год, остальные соответствуют кварталам
		internal Dictionary<BiznessTripsReportManager.QuarterEnum, double> SummsForRussianBiznessTrips { get; set; }

		// Суммы потраченные на командировки за рубежом, ключи 0 - год, остальные соответствуют кварталам
		internal Dictionary<BiznessTripsReportManager.QuarterEnum, double> SummsForAbroadBiznessTrips { get; set; }

		public ResultForMvzAndDepartment()
		{
			SummsForRussianBiznessTrips = new Dictionary<BiznessTripsReportManager.QuarterEnum, double>();
			SummsForAbroadBiznessTrips = new Dictionary<BiznessTripsReportManager.QuarterEnum, double>();
		}
	}
}