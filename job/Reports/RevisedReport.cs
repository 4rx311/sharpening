using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.Logging;

namespace WSSC.V4.DMS.OMK.Reports
{
    //TODO: CR: Тряхов Дмитрий - Названия слишком общие RfTitle и ExternTitle (нужен либо namespace отчета по командировкам, либо другие названия)
	public class RfTitle
	{
		public Field CustomFieldSettings()
		{
			Field retField = new Field();
			List<string> title = new List<string>() { "Командировки РФ" };
			List<string> subTitles = new List<string>(){
					"Итого",
					"1 кв",
					"2 кв",
					"3 кв",
					"4 кв"
				};
			retField.titleTable.Add(title);
			retField.titleTable.Add(subTitles);
			return retField;
		}
	}

	public class ExternTitle
	{
        //TODO: CR: Тряхов Дмитрий - все тексты вынести в константы
		public Field CustomFieldSettings()
		{
			Field retField = new Field();
			List<string> title = new List<string>() { "Зарубежные командировки" };
			List<string> subTitles = new List<string>(){
					"Итого",
					"1 кв",
					"2 кв",
					"3 кв",
					"4 кв"
				};
			retField.titleTable.Add(title);
			retField.titleTable.Add(subTitles);
			return retField;
		}

	}

    //TODO: CR: Тряхов Дмитрий - название не такое Уточненный отчет по командировкам, название класса тоже нужно переделать
	/// <summary>
	/// Кастомный отчет "Уточненный отчет"
	/// </summary>
	public class RevisedReport
	{
		
		/// <summary>
		/// Логгер
		/// </summary>
        //TODO: CR: Тряхов Дмитрий - переделать на отложенную инициализацию, название модуля VersionProvider.ModuleName, скоуп еще нужен
		Log log = new Log("WSSC.V4.DMS.OMK", DBSite.Current);

		string[] IntegerItemsOfCost = new string[]{
			_Consts.SpecifiedReport.ReportFields.PurchasedPlaneTickets,
			_Consts.SpecifiedReport.ReportFields.PurchasedTrainTickets
		};
		/// <summary>
		/// Перечень "Наименований статей", по которым необходимо строить отчет
		/// </summary>
		string[] ItemsOfCosts = new string[] { 
			_Consts.SpecifiedReport.ReportFields.PurchasedPlaneTickets,
			_Consts.SpecifiedReport.ReportFields.PurchasedTrainTickets,
			_Consts.SpecifiedReport.ReportFields.CostOfPlaneTickets,
			_Consts.SpecifiedReport.ReportFields.ServiceChargeForTickets,
			_Consts.SpecifiedReport.ReportFields.PenaltyForPlanesHanded,
			_Consts.SpecifiedReport.ReportFields.CostOfTrainTickets,
			_Consts.SpecifiedReport.ReportFields.ServiceFeeForTrainTickets,
			_Consts.SpecifiedReport.ReportFields.PenaltyForTrainTicketsHanded,
			_Consts.SpecifiedReport.ReportFields.PriceHotels,
			_Consts.SpecifiedReport.ReportFields.CommissionForHotels,
			_Consts.SpecifiedReport.ReportFields.PenaltyForCancellation,
			_Consts.SpecifiedReport.ReportFields.Transfer,
			_Consts.SpecifiedReport.ReportFields.CommissionForTransfer,
			_Consts.SpecifiedReport.ReportFields.PenaltyForCancellationOfTransfer,
			_Consts.SpecifiedReport.ReportFields.Visa,
			_Consts.SpecifiedReport.ReportFields.Insurance,
			_Consts.SpecifiedReport.ReportFields.DeliveryOfDocuments,
			_Consts.SpecifiedReport.ReportFields.RegistrationForTheConference,
			_Consts.SpecifiedReport.ReportFields.ServiceFee
		};
		/// <summary>
		/// перечень статей, по которым необходимо посчитать общие суммы
		/// </summary>
		string[] ItemsOfCostsForMajorGroup = new string[] {
			_Consts.SpecifiedReport.ReportFields.CostOfPlaneTickets,
			_Consts.SpecifiedReport.ReportFields.ServiceChargeForTickets,
			_Consts.SpecifiedReport.ReportFields.PenaltyForPlanesHanded,
			_Consts.SpecifiedReport.ReportFields.CostOfTrainTickets,
			_Consts.SpecifiedReport.ReportFields.ServiceFeeForTrainTickets,
			_Consts.SpecifiedReport.ReportFields.PenaltyForTrainTicketsHanded,
			_Consts.SpecifiedReport.ReportFields.PriceHotels,
			_Consts.SpecifiedReport.ReportFields.CommissionForHotels,
			_Consts.SpecifiedReport.ReportFields.PenaltyForCancellation,
			_Consts.SpecifiedReport.ReportFields.Transfer,
			_Consts.SpecifiedReport.ReportFields.CommissionForTransfer,
			_Consts.SpecifiedReport.ReportFields.PenaltyForCancellationOfTransfer,
			_Consts.SpecifiedReport.ReportFields.Visa,
			_Consts.SpecifiedReport.ReportFields.Insurance,
			_Consts.SpecifiedReport.ReportFields.DeliveryOfDocuments,
			_Consts.SpecifiedReport.ReportFields.RegistrationForTheConference,
			_Consts.SpecifiedReport.ReportFields.ServiceFee
		};

        //TODO: CR: Тряхов Дмитрий - много лишних операций требуется переработать метод
		/// <summary>
		/// Получение отчетного года из фильтра
		/// </summary>
		/// <param name="filters">список фильтров</param>
		/// <returns>год как целое число</returns>
		public int GetReportYear(List<PFilterValue> filters)
		{
			PFilterValue yearFilter = filters.FirstOrDefault(x => x.Filter.Name == _Consts.SpecifiedReport.FilterConstants.Name);
			if (yearFilter == null)
				throw new Exception(string.Format("Для формирования отчета необходимо указать значение в фильтре \"{0}\"", _Consts.SpecifiedReport.FilterConstants.Name));
			string yearIdString = string.Empty;
			if (!yearFilter.Filter.IsTypeOfLookup())
				throw new Exception(string.Format("Фильтр <{0}> должен быть подстановкой", _Consts.SpecifiedReport.FilterConstants.Name));
			yearIdString = yearFilter.InputValue;

			int yearId;
			if (!int.TryParse(yearIdString, out yearId))
				throw new Exception("Не удалось получить значение года из фильтра");

			DBSite dbSite = DBSite.Current;
			if (dbSite == null)
				throw new Exception("Не удалось получить текущий DBSite");
			DBList dbList = dbSite.GetList(_Consts.SpecifiedReport.FilterConstants.YearListId);
			if (dbList == null)
				throw new DBException.MissingList(dbSite, _Consts.SpecifiedReport.FilterConstants.YearListId);

			DBItem dbItem = dbList.GetItem(yearId);
			if (dbItem == null)
				throw new DBException.MissingItem(dbList, yearId);
			string yearString = dbItem.GetValue<string>(_Consts.SpecifiedReport.FilterConstants.YearListDisplayFieldName);
			if (string.IsNullOrEmpty(yearString))
				throw new Exception(string.Format("Не удалось получить значение подстановки поля подстановки {0}", _Consts.SpecifiedReport.FilterConstants.YearListDisplayFieldName));
			int year;
			if (!int.TryParse(yearString, out year))
				throw new Exception("Не удалось получить значение года из фильтра");

			return year;
		}


        //TODO: CR: Тряхов Дмитрий - это  по сути и есть метод формирования отчета, поменять описание
		/// <summary>
		/// Базовый метод вызываемый WSS Docs для формирования таблицы отчета
		/// </summary>
		/// <param name="itemsToProcess">Перечень элементов для отчета</param>
		/// <param name="filters">Перечень фильтров для отчета</param>
		/// <returns>Таблица отчета</returns>

		/// <summary>
		/// Метод получает последовательно поля сумм для отчета (пример: "Всего РФ", "1-ый квартал", "2-ый квартал", "3-ый квартал", "4-ый квартал",)
		/// </summary>
		/// <param name="summ">Словарь, содержащий суммы по кварталам и общие суммы</param>
		/// <returns>Список сумм в определенной последовательности</returns>
		private List<DataField> GetSums(Dictionary<int, double> summ, string currentCostItem = "")
		{
			List<DataField> summs = new List<DataField>();
			for (int i = 0; i <= Quarters.Count; i++)
			{
				bool inetgerItemOfCost = IntegerItemsOfCost.Contains(currentCostItem);
				DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes typeOfCurrentCell;
				if (inetgerItemOfCost)
					typeOfCurrentCell = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._integer;
				else
					typeOfCurrentCell = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._number;

				DataField summField = null;

				if (summ.ContainsKey(i))
				{
                    //TODO: CR: Тряхов Дмитрий - убрать проверку

					if (inetgerItemOfCost)
					{

					}
					summField = new DataField()
					{
						type = typeOfCurrentCell,
						value = summ[i].ToString()
					};

				}
				else
				{
					summField = new DataField()
					{
						type = typeOfCurrentCell,
						value = "0"
					};
				}
				summs.Add(summField);
			}
			return summs;
		}

		/// <summary>
		/// Этот метод создает строку в отчете, с суммами по всем расходам, перечисленым в itemsOfCost
		/// </summary>
		/// <param name="itemsOfCost">Список расходов</param>
		/// <param name="groupResultRows">Список типизированных элементов для постоения отчета</param>
		/// <returns></returns>
		private List<DataField> GetMaxGroupResult(string[] itemsOfCost, Dictionary<string, ResultRow> groupResultRows)
		{
			Dictionary<int, double> summsRf = new Dictionary<int, double>();
			Dictionary<int, double> summsExtern = new Dictionary<int, double>();

            //TODO: CR: Тряхов Дмитрий - не прозрачна логика + отсутствуют комментарии, что за словари словарей?
			foreach (string itemOfCost in itemsOfCost)
			{
				ResultRow.SummDictionaries(groupResultRows[itemOfCost].SummsExtern, summsExtern);
				ResultRow.SummDictionaries(groupResultRows[itemOfCost].SummsRf, summsRf);
			}

			List<DataField> fields = new List<DataField>();
			DataField nameOfCostItemField = new DataField()
			{
				type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
				value = "Расходы на командировки, всего:"
			};
			fields.Add(nameOfCostItemField);
			DataField mvzItemField = new DataField()
			{
				type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
				value = "Все МВЗ"
			};
			fields.Add(mvzItemField);
			DataField subdivisionItemField = new DataField()
			{
				type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
				value = "Все подразделения"
			};
			fields.Add(subdivisionItemField);
			List<DataField> summsRfFields = GetSums(summsRf);
			List<DataField> summsExternFields = GetSums(summsExtern);
			fields.AddRange(summsRfFields);
			fields.AddRange(summsExternFields);
			return fields;
		}

		/// <summary>
		/// Этот метод формирует таблицу для отображения
		/// </summary>
		/// <param name="groupResultRows">Перечень элементов, на базе которых строится список</param>
		/// <returns>Таблица для отображения</returns>
		private List<List<DataField>> GetTable(Dictionary<string, ResultRow> groupResultRows)
		{
			List<List<DataField>> dataTable = new List<List<DataField>>();
			foreach (KeyValuePair<string, ResultRow> item in groupResultRows)
			{
				List<DataField> fildsRow = new List<DataField>();

				DataField nameOfCostItemField = new DataField()
				{
					type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
					value = item.Key
				};
				fildsRow.Add(nameOfCostItemField);
				DataField mvzItemField = new DataField()
				{
					type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
					value = "Все МВЗ"
				};
				fildsRow.Add(mvzItemField);
				DataField subdivisionItemField = new DataField()
				{
					type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
					value = "Все подразделения"
				};
				fildsRow.Add(subdivisionItemField);
				List<DataField> sumsRf = GetSums(item.Value.SummsRf, item.Key);
				List<DataField> sumsExtern = GetSums(item.Value.SummsExtern, item.Key);
				fildsRow.AddRange(sumsRf);
				fildsRow.AddRange(sumsExtern);
				dataTable.Add(fildsRow);
				foreach (DataRow childItem in item.Value.ChildRows)
				{
					fildsRow = new List<DataField>();
					fildsRow.Add(nameOfCostItemField);
					mvzItemField = new DataField()
					{
						type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
						value = childItem.Mvz
					};
					fildsRow.Add(mvzItemField);
					subdivisionItemField = new DataField()
					{
						type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
						value = childItem.SubDivision
					};
					fildsRow.Add(subdivisionItemField);
					sumsRf = GetSums(childItem.SummsRf, item.Key);
					sumsExtern = GetSums(childItem.SummsExtern, item.Key);
					fildsRow.AddRange(sumsRf);
					fildsRow.AddRange(sumsExtern);
					dataTable.Add(fildsRow);
				}
				if (item.Key == _Consts.SpecifiedReport.ReportFields.PurchasedTrainTickets)
				{
					List<DataField> majorResultString = GetMaxGroupResult(ItemsOfCostsForMajorGroup, groupResultRows);
					dataTable.Add(majorResultString);
				}
			}
			return dataTable;
		}

		/// <summary>
		/// Кварталы
		/// </summary>
		private List<Quarter> Quarters;

		/// <summary>
		/// получение "типизированного" элемента для списка, по которому в итоге будет строиться отчет
		/// </summary>
		/// <param name="item"></param>
		/// <param name="itemOfCost"></param>
		/// <returns></returns>
		private DataRow GetDataRow(DBItem item, string itemOfCost)
		{
            //TODO: CR: Тряхов Дмитрий - нужно избегать копипастов, сделай отдельную функцию в которой проверяешь LookupText
			string currentMvz = item.GetLookupText(_Consts.SpecifiedReport.ItemFields.Mvz);
			if (string.IsNullOrEmpty(currentMvz))
				throw new Exception(string.Format("Не удалось определить значение поля подстановки {0} для элемента {1} списка {2}", _Consts.SpecifiedReport.ItemFields.Mvz, item.ID, item.List.ID));

			DBFieldLookupValue lookupValue = item.GetLookupValue(_Consts.SpecifiedReport.ItemFields.Subdivision);
			if (lookupValue == null)
				throw new Exception(string.Format("Не удалось обнаружить элемент подстановки в поле {0} элемента {1} таблицы {2}", _Consts.SpecifiedReport.ItemFields.Subdivision, item.ID, item.List.DisplayName));
			string currentSubDivision = lookupValue.LookupText;
			if (string.IsNullOrEmpty(currentSubDivision))
				throw new Exception(string.Format("Не удалось определить значение поля подстановки {0} для элемента {1} списка {2}", _Consts.SpecifiedReport.ItemFields.Subdivision, item.ID, item.List.DisplayName));

			string currentTripType = item.GetLookupText(_Consts.SpecifiedReport.ItemFields.TripType);
			if (string.IsNullOrEmpty(currentTripType))
				throw new Exception(string.Format("Не удалось определить значение поля подстановки {0} для элемента {1} списка {2}", _Consts.SpecifiedReport.ItemFields.TripType, item.ID, item.List.ID));

			DateTime currentTripStartDate = item.GetValue<DateTime>(_Consts.SpecifiedReport.ItemFields.StartTripDate);
			if (currentTripStartDate == DateTime.MinValue || currentTripStartDate == null)
				throw new Exception(string.Format("Не удалось получить дату и время из поля {0} для записи {1} таблицы {2}", _Consts.SpecifiedReport.ItemFields.StartTripDate, item.ID, item.List.ID));

			Quarter currentQuarterObj = Quarters.FirstOrDefault(x => x.Start <= currentTripStartDate && currentTripStartDate < x.End);

			if (currentQuarterObj == null)
				return null;

			int currentQuarter = currentQuarterObj.Number;
			DataRow row = new DataRow()
			{
				Mvz = currentMvz,
				SubDivision = currentSubDivision,
				SummsExtern = new Dictionary<int, double>(),
				SummsRf = new Dictionary<int, double>()
			};
			double value = 0;
			object valueObj = item.GetValue(itemOfCost);
			try
			{
				value = Convert.ToDouble(valueObj);
			}
			catch (Exception ex)
			{
				throw new Exception(string.Format("не удалось преобразовать поле {0} к числовому типу данных", itemOfCost), ex);
			}

			switch (currentTripType)
			{
                //TODO: CR: Тряхов Дмитрий - тексты вынести в константы
				case "По России":
					row.SummsRf.Add(currentQuarter, value);
					row.SummsRf.Add(0, value);
					break;
				case "За пределы РФ":
					row.SummsExtern.Add(currentQuarter, value);
					row.SummsExtern.Add(0, value);
					break;
				default:
					throw new Exception(string.Format("Не удалось определить тип командировки для записи {0} списка {1}", item.ID, item.List.ID));
			}
			return row;
		}

        //TODO: CR: Тряхов Дмитрий - если не используется, то не нужно оставлять мусор
		#region Вспомогательные методы и классы
		/*public class ComissionsTitle
		{
			public Field CustomFieldSettings()
			{
				Field field = new Field();
				List<string> titleRow = new List<string>();
				if (!NoCommissions)
				{
					titleRow.Add(Translate("Поручения"));
					field.titleTable.Add(titleRow);
				}
				titleRow = new List<string>();
				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.Processed))
					titleRow.Add(Translate("Выполнено"));
				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.InWork))
					titleRow.Add(Translate("В работе"));
				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.Delayed))
				{
					titleRow.Add(Translate("Просрочено, кол-во"));
					titleRow.Add(Translate("Просрочено, %"));
				}


				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.TotalDelay))
					titleRow.Add(Translate("Общая задержка, часов"));

				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.TotalDaysDelay))
					titleRow.Add(Translate("Общая задержка, дней"));

				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.AvgDelay))
					titleRow.Add(Translate("Средняя задержка, часов"));

				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.AvgDaysDelay))
					titleRow.Add(Translate("Средняя задержка, дней"));

				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.Returned))
				{
					titleRow.Add(Translate("С возвратом на доработку, кол-во"));
					titleRow.Add(Translate("С возвратом на доработку, %"));
				}
				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.Transfered))
				{
					titleRow.Add(Translate("С переносом срока, кол-во"));
					titleRow.Add(Translate("С переносом срока, %"));
				}
				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.ProcessTime)
				|| ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.ProcessTimeOld))
					titleRow.Add(Translate("Средний срок обработки, часов"));
				if (ColumnsToDisplay.Contains(_ReportConsts.ComplexReports.UserEfficiencyReport.ReportColumns.Commissions.ProcessTimeDays))
					titleRow.Add(Translate("Средний срок обработки, дней"));

				field.titleTable.Add(titleRow);
				return field;
			}
		}*/

        //TODO: CR: Тряхов Дмитрий - вынести в отдельный файл, сделать комментарии к свойствам и методам
		internal class ResultRow
		{
			internal Dictionary<int, double> SummsRf { get; set; }
			internal Dictionary<int, double> SummsExtern { get; set; }
			internal List<DataRow> ChildRows { get; set; }

			internal ResultRow()
			{
				ChildRows = new List<DataRow>();
				SummsRf = new Dictionary<int, double>();
				SummsExtern = new Dictionary<int, double>();
			}

			internal void AddChildRow(DataRow childRow)
			{
				if (childRow.SummsRf != null)
					SummDictionaries(childRow.SummsRf, this.SummsRf);

				if (childRow.SummsExtern != null)
					SummDictionaries(childRow.SummsExtern, this.SummsExtern);

				DataRow localChildRow = this.ChildRows.FirstOrDefault(x => x.Mvz == childRow.Mvz && x.SubDivision == childRow.SubDivision);
				if (localChildRow == null)
					this.ChildRows.Add(childRow);
				else
				{
					if (childRow.SummsRf != null)
						SummDictionaries(childRow.SummsRf, localChildRow.SummsRf);

					if (childRow.SummsExtern != null)
						SummDictionaries(childRow.SummsExtern, localChildRow.SummsExtern);
				}
			}

            //TODO: CR: Тряхов Дмитрий - не очень понятно зачем копирование словарей
			public static void SummDictionaries(Dictionary<int, double> source, Dictionary<int, double> dest)
			{
				if (source == null)
					throw new ArgumentNullException("source");
				if (dest == null)
					throw new ArgumentNullException("dest");

				foreach (KeyValuePair<int, double> summ in source)
				{
					if (dest.ContainsKey(summ.Key))
						dest[summ.Key] += summ.Value;
					else
						dest.Add(summ.Key, summ.Value);
				}
			}
		}

        //TODO: CR: Тряхов Дмитрий - не удачное название класса, нет комментариев, вынести в отдельный файл мелкие классы
		internal class DataRow
		{
			internal string Mvz { get; set; }
			internal string SubDivision { get; set; }
			internal Dictionary<int, double> SummsRf { get; set; }
			internal Dictionary<int, double> SummsExtern { get; set; }

			public DataRow()
			{
				SummsRf = new Dictionary<int, double>();
				SummsExtern = new Dictionary<int, double>();
			}
		}

		internal class Quarter
		{
			internal int Number { get; set; }
			internal DateTime Start { get; set; }
			internal DateTime End { get; set; }
		}

        //TODO: CR: Тряхов Дмитрий - магические цифры 1,4,7, нужны комментарии 1-ый квартал с 1-го января по 31 марта и т.п.
		private List<Quarter> GetQuarters(int year)
		{
			List<Quarter> quarters = new List<Quarter>();
			quarters.Add(new Quarter() { Number = 1, Start = new DateTime(year, 1, 1), End = new DateTime(year, 4, 1) });
			quarters.Add(new Quarter() { Number = 1, Start = new DateTime(year, 4, 1), End = new DateTime(year, 7, 1) });
			quarters.Add(new Quarter() { Number = 1, Start = new DateTime(year, 7, 1), End = new DateTime(year, 10, 1) });
			quarters.Add(new Quarter() { Number = 1, Start = new DateTime(year, 10, 1), End = new DateTime(year + 1, 1, 1) });
			return quarters;
		}
		#endregion

	}
}
