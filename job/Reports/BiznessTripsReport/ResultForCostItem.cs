using System;
using System.Collections.Generic;
using System.Linq;

namespace WSSC.V4.DMS.OMK.Reports.BiznessTripsReport
{
	/// <summary>
	/// Класс описывающий под итог для одной статьи расхода содержит в себе так же сведения о всех
	/// МВЗ и подразделениях и их расходах на данную статью расхода с делением по кварталам и общую
	/// сумму за год
	/// </summary>
	internal class ResultForCostItem
	{
		/// <summary>
		/// Суммы за командировки по РФ: Ключ 0 - Год Ключ 1 - 1 ый квартал Ключ 2 - 2 ой квартал
		/// Ключ 3 - 3 ий квартал Ключ 4 - 4 ый квартал
		/// </summary>
		internal Dictionary<BiznessTripsReportManager.QuarterEnum, double> SummsForRussianBiznessTrips { get; set; }

		/// <summary>
		/// Суммы за зарубежные командировки: Ключ 0 - Год, Ключ 1 - 1 ый квартал, Ключ 2 - 2 ой
		/// квартал, Ключ 3 - 3 ий квартал, Ключ 4 - 4 ый квартал
		/// </summary>
		internal Dictionary<BiznessTripsReportManager.QuarterEnum, double> SummsForAbroadBiznessTrips { get; set; }

		/// <summary>
		/// Список сведений о всех МВЗ и подразделениях и их расходах на данную статью расхода с делением
		/// по кварталам и общую сумму за год
		/// </summary>
		internal List<ResultForMvzAndDepartment> MvzAndDepartmentResults { get; set; }

		/// <summary>
		/// В конструкторе просто инициализируем списки
		/// </summary>
		internal ResultForCostItem()
		{
			MvzAndDepartmentResults = new List<ResultForMvzAndDepartment>();
			SummsForRussianBiznessTrips = new Dictionary<BiznessTripsReportManager.QuarterEnum, double>();
			SummsForAbroadBiznessTrips = new Dictionary<BiznessTripsReportManager.QuarterEnum, double>();
		}

		/// <summary>
		/// Добавление сумм в подитог + добавление сведений и сумм в Список сведений о всех МВЗ и
		/// подразделениях и их расходах на данную статью расхода
		/// </summary>
		/// <param name="childRow">
		/// Элемент содержащий в себе сведения о подразделении и МВЗ и их расходах на статью
		/// расходов, которой принадлежит экземляр класса
		/// </param>
		internal void AddChildResult(ResultForMvzAndDepartment childRow)
		{
			if (childRow == null)
				throw new ArgumentNullException("childRow");
			// Добавление сумм в подитог на статью расхода
			if (childRow.SummsForRussianBiznessTrips != null)
				AddSummToResultDictionary(childRow.SummsForRussianBiznessTrips, this.SummsForRussianBiznessTrips);

			if (childRow.SummsForAbroadBiznessTrips != null)
				AddSummToResultDictionary(childRow.SummsForAbroadBiznessTrips, this.SummsForAbroadBiznessTrips);
			// Добавление сумм и сведений в список сведений о всех МВЗ и
			// подразделениях и их расходах
			ResultForMvzAndDepartment localChildRow = this.MvzAndDepartmentResults.FirstOrDefault(x => x.Mvz == childRow.Mvz && x.Department == childRow.Department);
			if (localChildRow == null)
				this.MvzAndDepartmentResults.Add(childRow);
			else
			{
				if (childRow.SummsForRussianBiznessTrips != null)
					AddSummToResultDictionary(childRow.SummsForRussianBiznessTrips, localChildRow.SummsForRussianBiznessTrips);

				if (childRow.SummsForAbroadBiznessTrips != null)
					AddSummToResultDictionary(childRow.SummsForAbroadBiznessTrips, localChildRow.SummsForAbroadBiznessTrips);
			}
		}

		/// <summary>
		/// Метод суммирования расходов по каммандировкам
		/// </summary>
		/// <param name="source">
		/// Источник сумм: Словарь содержит в себе сведения о расходах: Ключ 0 - Год, Ключ 1 - 1 ый
		/// квартал, Ключ 2 - 2 ой квартал, Ключ 3 - 3 ий квартал, Ключ 4 - 4 ый квартал. Значение
		/// содержит в себе сумму расходов.
		/// </param>
		/// <param name="dest">
		/// Аккумулятор сумм: Словарь содержит в себе сведения о расходах: Ключ 0 - Год, Ключ 1 - 1
		/// ый квартал, Ключ 2 - 2 ой квартал, Ключ 3 - 3 ий квартал, Ключ 4 - 4 ый квартал, Значение
		/// содержит в себе сумму расходов.
		/// </param>

		public static void AddSummToResultDictionary(Dictionary<BiznessTripsReportManager.QuarterEnum, double> source, Dictionary<BiznessTripsReportManager.QuarterEnum, double> dest)
		{
			if (source == null)
				throw new ArgumentNullException("source");
			if (dest == null)
				throw new ArgumentNullException("dest");

			foreach (KeyValuePair<BiznessTripsReportManager.QuarterEnum, double> summ in source)
			{
				if (dest.ContainsKey(summ.Key))
					dest[summ.Key] += summ.Value;
				else
					dest.Add(summ.Key, summ.Value);
			}
		}
	}
}