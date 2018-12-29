using System.Collections.Generic;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;

namespace WSSC.V4.DMS.OMK.Reports.BiznessTripsReport
{
	/// <summary>
	/// класс формирующий часть "сложной" шапки про суммы за год и кварталы для коммандировок по России
	/// </summary>
	public class RussianBiznessTripsTableHeader
	{
		public Field CustomFieldSettings()
		{
			Field retField = new Field();
			List<string> title = new List<string>() { _Consts.BiznessTripsReport.ReportHeaders.Russia };
			List<string> subTitles = new List<string>(){
					 _Consts.BiznessTripsReport.ReportHeaders.Result,
					 _Consts.BiznessTripsReport.ReportHeaders.FirstQuarter,
					 _Consts.BiznessTripsReport.ReportHeaders.SecondQuarter,
					 _Consts.BiznessTripsReport.ReportHeaders.ThirdQuarter,
					 _Consts.BiznessTripsReport.ReportHeaders.FourthQuarter,
				};
			retField.titleTable.Add(title);
			retField.titleTable.Add(subTitles);
			return retField;
		}
	}
}