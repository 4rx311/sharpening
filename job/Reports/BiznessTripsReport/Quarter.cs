using System;

namespace WSSC.V4.DMS.OMK.Reports.BiznessTripsReport
{
	/// <summary>
	/// Класс описывающий квартал года
	/// </summary>
	internal class Quarter
	{
		/// <summary>
		/// Номер квартала по счету
		/// </summary>
		internal BiznessTripsReportManager.QuarterEnum Number { get; set; }

		/// <summary>
		/// Дата начала квартала
		/// </summary>
		internal DateTime Start { get; set; }

		/// <summary>
		/// Дата конца квартала
		/// </summary>
		internal DateTime End { get; set; }
	}
}