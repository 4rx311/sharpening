using System;
using System.Collections.Generic;
using System.Linq;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.Logging;

namespace WSSC.V4.DMS.OMK.Reports.BiznessTripsReport
{
	/// <summary>
	/// Класс описывающий создание кастомного отчета по заявкам на командирование
	/// </summary>
	public class BiznessTripsReportManager
	{
		#region Получение DBSite

		private bool __init_Site = false;
		private DBSite _Site;

		public DBSite Site
		{
			get
			{
				if (!__init_Site)
				{
					_Site = DBSite.Current;
					if (_Site == null)
						throw new Exception("Не удалось получить текущий DBSite");
					__init_Site = true;
				}
				return _Site;
			}
		}

		#endregion Получение DBSite

		#region Получение DBWeb

		private bool __init_Web = false;
		private DBWeb _Web;

		// так как URL узла используется только в одном месте и настроек больше нет совсем
		// было принято решение зашить код узла прямо в код, что бы не делать дополнительную настройку для отчета
		// и не заставлять настройщика формировать еще одину константу в списке констант
		public DBWeb Web
		{
			get
			{
				if (!__init_Web)
				{
					_Web = Site.GetWeb(_Consts.BiznessTripsReport.Filter.YearListWebUrl);
					if (_Web == null)
						throw new DBException.MissingWeb(Site, _Consts.BiznessTripsReport.Filter.YearListWebUrl);
					__init_Web = true;
				}
				return _Web;
			}
		}

		#endregion Получение DBWeb

		#region Получение DBList

		private bool __init_List = false;
		private DBList _List;

		public DBList List
		{
			get
			{
				if (!__init_List)
				{
					_List = Web.GetList(_Consts.BiznessTripsReport.Filter.YearListName);
					if (_List == null)
						throw new DBException.MissingList(Web, _Consts.BiznessTripsReport.Filter.YearListName);
					__init_List = true;
				}
				return _List;
			}
		}

		#endregion Получение DBList

		#region Инициализация лога

		private bool __init_Log = false;
		private Log _Log;

		public Log Log
		{
			get
			{
				if (!__init_Log)
				{
					_Log = new Log(_Consts.BiznessTripsReport.Log.Scope, VersionProvider.ModulName, Site);
					__init_Log = true;
				}
				return _Log;
			}
		}

		#endregion Инициализация лога

		#region Константные массивы для различных целей

		/// <summary>
		/// Перечень "Наименований статей", по которым необходимо строить отчет
		/// </summary>
		private string[] ItemsOfCosts = new string[] {
			_Consts.BiznessTripsReport.ItemFields.PurchasedPlaneTickets,
			_Consts.BiznessTripsReport.ItemFields.PurchasedTrainTickets,
			_Consts.BiznessTripsReport.ItemFields.CostOfPlaneTickets,
			_Consts.BiznessTripsReport.ItemFields.ServiceChargeForTickets,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForPlanesHanded,
			_Consts.BiznessTripsReport.ItemFields.CostOfTrainTickets,
			_Consts.BiznessTripsReport.ItemFields.ServiceFeeForTrainTickets,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForTrainTicketsHanded,
			_Consts.BiznessTripsReport.ItemFields.PriceHotels,
			_Consts.BiznessTripsReport.ItemFields.CommissionForHotels,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForCancellation,
			_Consts.BiznessTripsReport.ItemFields.Transfer,
			_Consts.BiznessTripsReport.ItemFields.CommissionForTransfer,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForCancellationOfTransfer,
			_Consts.BiznessTripsReport.ItemFields.Visa,
			_Consts.BiznessTripsReport.ItemFields.Insurance,
			_Consts.BiznessTripsReport.ItemFields.DeliveryOfDocuments,
			_Consts.BiznessTripsReport.ItemFields.RegistrationForTheConference,
			_Consts.BiznessTripsReport.ItemFields.ServiceFee
		};

		/// <summary>
		/// Идентификация "целочисленных" наименований статей расхода
		/// Необходимо для определения в каких местах необходимо проставлять
		/// тип значения ячейки эксель как целочисленный
		/// П.с. вынесено в отдельный массив потомучто 2 строки меньше чем 16
		/// </summary>
		private string[] IntegerItemsOfCost = new string[]{
			_Consts.BiznessTripsReport.ItemFields.PurchasedPlaneTickets,
			_Consts.BiznessTripsReport.ItemFields.PurchasedTrainTickets
		};

		/// <summary>
		/// перечень статей расхода, по которым необходимо посчитать общий подитог
		/// (исключает целочисленные столбцы)
		/// </summary>
		private string[] ItemsOfCostsForMajorGroup = new string[] {
			_Consts.BiznessTripsReport.ItemFields.CostOfPlaneTickets,
			_Consts.BiznessTripsReport.ItemFields.ServiceChargeForTickets,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForPlanesHanded,
			_Consts.BiznessTripsReport.ItemFields.CostOfTrainTickets,
			_Consts.BiznessTripsReport.ItemFields.ServiceFeeForTrainTickets,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForTrainTicketsHanded,
			_Consts.BiznessTripsReport.ItemFields.PriceHotels,
			_Consts.BiznessTripsReport.ItemFields.CommissionForHotels,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForCancellation,
			_Consts.BiznessTripsReport.ItemFields.Transfer,
			_Consts.BiznessTripsReport.ItemFields.CommissionForTransfer,
			_Consts.BiznessTripsReport.ItemFields.PenaltyForCancellationOfTransfer,
			_Consts.BiznessTripsReport.ItemFields.Visa,
			_Consts.BiznessTripsReport.ItemFields.Insurance,
			_Consts.BiznessTripsReport.ItemFields.DeliveryOfDocuments,
			_Consts.BiznessTripsReport.ItemFields.RegistrationForTheConference,
			_Consts.BiznessTripsReport.ItemFields.ServiceFee
		};

		#endregion Константные массивы для различных целей

		/// <summary>
		/// Кварталы для года заданного в фильтре
		/// </summary>
		private List<Quarter> Quarters;

		/// <summary>
		/// Метод, возвращающий кастомную таблицу отчета, обрабатываемый коробочным функционалом
		/// </summary>
		/// <param name="itemsToProcess">Перечень элементов для отчета</param>
		/// <param name="filters">Перечень фильтров для отчета</param>
		/// <returns>Таблица отчета</returns>
		public List<List<DataField>> CustomTableValue(List<DBItem> itemsToProcess, List<PFilterValue> filters)
		{
			// Получение года, и если его получить не удалось отображение причины, почему его получить не удалось
			int year = 0;
			try
			{
				year = GetReportYear(filters);
			}
			catch (Exception ex)
			{
				DataField exText = new DataField()
				{
					type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
					value = ex.Message
				};
				List<List<DataField>> report = new List<List<DataField>>() { new List<DataField>() { exText } };
				return report;
			}
			// Получение кваталов для года, заданного в мнимом фильтре
			Quarters = GetQuarters(year);
			// Инициализация списка, содержаещего под итоги для каждой статьи расходов и сведения о
			// расходах каждого МВЗ и подразделения
			Dictionary<string, ResultForCostItem> groupResultRows = new Dictionary<string, ResultForCostItem>();
			// Цикл перебора по отмеченным галкой элементам списка
			foreach (DBItem item in itemsToProcess)
			{
				CheckFieldExistenceAndUpdateIoType(item, _Consts.BiznessTripsReport.ItemFields.Mvz);
				CheckFieldExistenceAndUpdateIoType(item, _Consts.BiznessTripsReport.ItemFields.Subdivision);
				CheckFieldExistenceAndUpdateIoType(item, _Consts.BiznessTripsReport.ItemFields.TripType);

				foreach (string itemOfCost in this.ItemsOfCosts)
				{
					CheckFieldExistence(item, itemOfCost);

					ResultForMvzAndDepartment summsForCurrentDbItem = null;
					try
					{
						summsForCurrentDbItem = GetSummForItemOfCostForMvzAndDepartment(item, itemOfCost);
					}
					catch (Exception ex)
					{
						Log.WriteError(ex.ToString());
						continue;
					}

					if (summsForCurrentDbItem != null)
					{
						if (!groupResultRows.ContainsKey(itemOfCost))
							groupResultRows.Add(itemOfCost, new ResultForCostItem());
						groupResultRows[itemOfCost].AddChildResult(summsForCurrentDbItem);
					}
				}
			}
			List<List<DataField>> dataFields = GetTable(groupResultRows);
			return dataFields;
		}

		/// <summary>
		/// Получение значения "отчетный год" из мнимого фильтра
		/// </summary>
		/// <param name="filters">список фильтров</param>
		/// <returns>год как целое число</returns>
		private int GetReportYear(List<PFilterValue> filters)
		{
			PFilterValue yearFilter = filters.FirstOrDefault(x => x.Filter.Name == _Consts.BiznessTripsReport.Filter.Name);
			if (yearFilter == null || string.IsNullOrEmpty(yearFilter.InputValue))
				throw new Exception(string.Format("Для формирования отчета необходимо указать значение в фильтре \"{0}\"", _Consts.BiznessTripsReport.Filter.Name));

			int yearId;
			if (!int.TryParse(yearFilter.InputValue, out yearId))
				throw new Exception("Не удалось получить значение идентификатора подстановки года из фильтра");

			DBItem dbItem = List.GetItem(yearId);
			if (dbItem == null)
				throw new DBException.MissingItem(List, yearId);

			string yearString = dbItem.GetValue<string>(_Consts.BiznessTripsReport.Filter.YearListDisplayFieldName);
			if (string.IsNullOrEmpty(yearString))
				throw new Exception(string.Format("Не удалось получить значение подстановки поля подстановки {0}", _Consts.BiznessTripsReport.Filter.YearListDisplayFieldName));

			int year;
			if (!int.TryParse(yearString, out year))
				throw new Exception("Не удалось получить значение года из фильтра");

			return year;
		}

		/// <summary>
		/// Получение списка квАрталов для года, заданного мнимым фильтром
		/// </summary>
		/// <param name="year">Год, по которому нужно построить границы кварталов</param>
		/// <returns>списка квАрталов для года, заданного мнимым фильтром</returns>
		private List<Quarter> GetQuarters(int year)
		{
			List<Quarter> quarters = new List<Quarter>();
			// Номер и границы [01.01.XXXX - 01.04.XXXX) для 1го квартала
			quarters.Add(new Quarter() { Number = QuarterEnum.FirstQuarter, Start = new DateTime(year, 1, 1), End = new DateTime(year, 4, 1) });
			// Номер и границы [04.01.XXXX - 01.07.XXXX) для 2го квартала
			quarters.Add(new Quarter() { Number = QuarterEnum.SecondQuarter, Start = new DateTime(year, 4, 1), End = new DateTime(year, 7, 1) });
			// Номер и границы [07.01.XXXX - 01.10.XXXX) для 3го квартала
			quarters.Add(new Quarter() { Number = QuarterEnum.ThirdQuarter, Start = new DateTime(year, 7, 1), End = new DateTime(year, 10, 1) });
			// Номер и границы [01.10.XXXX - 01.01.XXXX + 1) для 4го квартала
			quarters.Add(new Quarter() { Number = QuarterEnum.FourthQuarter, Start = new DateTime(year, 10, 1), End = new DateTime(year + 1, 1, 1) });
			return quarters;
		}

		/// <summary>
		/// получение "типизированного" элемента для списка, по которому в итоге будет строиться отчет
		/// </summary>
		/// <param name="item"></param>
		/// <param name="itemOfCost"></param>
		/// <returns></returns>
		private ResultForMvzAndDepartment GetSummForItemOfCostForMvzAndDepartment(DBItem item, string itemOfCost)
		{
			string currentMvz = LocalGetLookupText(item, _Consts.BiznessTripsReport.ItemFields.Mvz);
			string currentSubDivision = LocalGetLookupText(item, _Consts.BiznessTripsReport.ItemFields.Subdivision);
			string currentTripType = LocalGetLookupText(item, _Consts.BiznessTripsReport.ItemFields.TripType);

			DateTime currentTripStartDate = item.GetValue<DateTime>(_Consts.BiznessTripsReport.ItemFields.StartTripDate);
			if (currentTripStartDate == DateTime.MinValue || currentTripStartDate == null)
				throw new Exception(string.Format("Не удалось получить дату и время из поля {0} для записи {1} таблицы {2}", _Consts.BiznessTripsReport.ItemFields.StartTripDate, item.ID, item.List.ID));

			Quarter currentQuarterObj = Quarters.FirstOrDefault(x => x.Start <= currentTripStartDate && currentTripStartDate < x.End);
			if (currentQuarterObj == null)
				return null;
			QuarterEnum currentQuarter = currentQuarterObj.Number;

			ResultForMvzAndDepartment mvzDepartmentSumm = new ResultForMvzAndDepartment()
			{
				Mvz = currentMvz,
				Department = currentSubDivision,
				SummsForAbroadBiznessTrips = new Dictionary<QuarterEnum, double>(),
				SummsForRussianBiznessTrips = new Dictionary<QuarterEnum, double>()
			};
			double value = 0;
			object valueObj = item.GetValue(itemOfCost);
			try
			{
				value = Convert.ToDouble(valueObj);
			}
			catch (Exception ex)
			{
				throw new Exception(string.Format("Не удалось преобразовать поле {0} к числовому типу данных", itemOfCost), ex);
			}

			switch (currentTripType)
			{
				case _Consts.BiznessTripsReport.ItemFieldsValues.TripTypeValueForRussia:
					mvzDepartmentSumm.SummsForRussianBiznessTrips.Add(currentQuarter, value);
					mvzDepartmentSumm.SummsForRussianBiznessTrips.Add(0, value);
					break;

				case _Consts.BiznessTripsReport.ItemFieldsValues.TripTypeValueForAbroad:
					mvzDepartmentSumm.SummsForAbroadBiznessTrips.Add(currentQuarter, value);
					mvzDepartmentSumm.SummsForAbroadBiznessTrips.Add(0, value);
					break;

				default:
					throw new Exception(string.Format("Не удалось определить тип командировки для записи {0} списка {1}", item.ID, item.List.ID));
			}
			return mvzDepartmentSumm;
		}

		/// <summary>
		/// Этот метод создает строку в отчете, с суммами по всем расходам, перечисленым в ItemsOfCostsForMajorGroup
		/// Примечание: Метод позволяет обойтись суммированием только под итогов статей расхода,
		///             указанных в массиве ItemsOfCostsForMajorGroup
		/// </summary>
		/// <param name="itemsOfCost">Список расходов</param>
		/// <param name="groupResultRows">Список типизированных элементов для постоения отчета</param>
		/// <returns>
		/// Строку в отчете, с суммами по всем расходам, перечисленым в ItemsOfCostsForMajorGroup
		/// Примечание: Подитог для большой группы статей расхода в виде строки таблицы отчета
		/// </returns>
		private List<DataField> GetMaxGroupResult(Dictionary<string, ResultForCostItem> groupResultRows)
		{
			// Суммы по кварталам и за год для всех статей расходов из ItemsOfCostsForMajorGroup для командировок по РФ
			Dictionary<QuarterEnum, double> summsForRussianBiznessTrips = new Dictionary<QuarterEnum, double>();
			// Суммы по кварталам и за год для всех статей расходов из ItemsOfCostsForMajorGroup для зарубежных командировок
			Dictionary<QuarterEnum, double> summsForAbroadBiznessTrips = new Dictionary<QuarterEnum, double>();

			// В цикле высчитыаются суммы по каждому элементу словаря groupResultRows
			// Примечание: groupResultRows - Ключ = наименование статьи расходов
			// Значение = словарь с суммами подитога 0 - целыйгод, 1 = 1ый квартал, 2 = второй...
			// В конечном итоге в словарях summsForRussianBiznessTrips и summsForAbroadBiznessTrips
			// окажется сумма сумм под итогов по каждой статье расходов из ItemsOfCostsForMajorGroup
			foreach (string itemOfCost in ItemsOfCostsForMajorGroup)
			{
				ResultForCostItem.AddSummToResultDictionary(groupResultRows[itemOfCost].SummsForAbroadBiznessTrips, summsForAbroadBiznessTrips);
				ResultForCostItem.AddSummToResultDictionary(groupResultRows[itemOfCost].SummsForRussianBiznessTrips, summsForRussianBiznessTrips);
			}

			List<DataField> fields = new List<DataField>();
			DataField nameOfCostItemField = new DataField()
			{
				type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
				value = _Consts.BiznessTripsReport.ReportValues.AllCosts
			};
			fields.Add(nameOfCostItemField);
			DataField mvzItemField = new DataField()
			{
				type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
				value = _Consts.BiznessTripsReport.ReportValues.AllMvz
			};
			fields.Add(mvzItemField);
			DataField subdivisionItemField = new DataField()
			{
				type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
				value = _Consts.BiznessTripsReport.ReportValues.AllDepartments
			};
			fields.Add(subdivisionItemField);
			List<DataField> summsForRussianBiznessTripsFields = GetSums(summsForRussianBiznessTrips);
			List<DataField> summsForAbroadBiznessTripsFields = GetSums(summsForAbroadBiznessTrips);
			fields.AddRange(summsForRussianBiznessTripsFields);
			fields.AddRange(summsForAbroadBiznessTripsFields);
			return fields;
		}

		/// <summary>
		/// Этот метод формирует таблицу для отображения
		/// </summary>
		/// <param name="groupResultRows">Перечень элементов, на базе которых строится таблица для отображения</param>
		/// <returns>Таблица для отображения</returns>
		private List<List<DataField>> GetTable(Dictionary<string, ResultForCostItem> groupResultRows)
		{
			List<List<DataField>> dataTable = new List<List<DataField>>();
			foreach (KeyValuePair<string, ResultForCostItem> item in groupResultRows)
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
					value = _Consts.BiznessTripsReport.ReportValues.AllMvz
				};
				fildsRow.Add(mvzItemField);
				DataField subdivisionItemField = new DataField()
				{
					type = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._string,
					value = _Consts.BiznessTripsReport.ReportValues.AllDepartments
				};
				fildsRow.Add(subdivisionItemField);
				List<DataField> summsForRussianBiznessTrips = GetSums(item.Value.SummsForRussianBiznessTrips, item.Key);
				List<DataField> summsForAbroadBiznessTrips = GetSums(item.Value.SummsForAbroadBiznessTrips, item.Key);
				fildsRow.AddRange(summsForRussianBiznessTrips);
				fildsRow.AddRange(summsForAbroadBiznessTrips);
				dataTable.Add(fildsRow);
				foreach (ResultForMvzAndDepartment childItem in item.Value.MvzAndDepartmentResults)
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
						value = childItem.Department
					};
					fildsRow.Add(subdivisionItemField);
					summsForRussianBiznessTrips = GetSums(childItem.SummsForRussianBiznessTrips, item.Key);
					summsForAbroadBiznessTrips = GetSums(childItem.SummsForAbroadBiznessTrips, item.Key);
					fildsRow.AddRange(summsForRussianBiznessTrips);
					fildsRow.AddRange(summsForAbroadBiznessTrips);
					dataTable.Add(fildsRow);
				}
				if (item.Key == _Consts.BiznessTripsReport.ItemFields.PurchasedTrainTickets)
				{
					List<DataField> majorResultString = GetMaxGroupResult(groupResultRows);
					dataTable.Add(majorResultString);
				}
			}
			return dataTable;
		}

		/// <summary>
		/// Метод возвращает последовательно поля сумм для отчета (пример: "Всего РФ", "1-ый квартал", "2-ый квартал", "3-ый квартал", "4-ый квартал",)
		/// 0 - сумма за год
		/// 1 - первый квартал
		/// 2 - второй квартал
		/// 3 - первый квартал
		/// 4 - первый квартал
		/// </summary>
		/// <param name="summ">Словарь, содержащий суммы по кварталам и общие суммы</param>
		/// <returns>Список сумм в определенной последовательности</returns>
		private List<DataField> GetSums(Dictionary<QuarterEnum, double> summ, string currentCostItem = "")
		{
			List<DataField> summs = new List<DataField>();
			Array enumMembers = Enum.GetValues(typeof(QuarterEnum));
			foreach (QuarterEnum currentQuarter in enumMembers)
			{
				bool inetgerItemOfCost = IntegerItemsOfCost.Contains(currentCostItem);
				DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes typeOfCurrentCell;
				if (inetgerItemOfCost)
					typeOfCurrentCell = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._integer;
				else
					typeOfCurrentCell = DMS.Reports._ReportConsts.Reports.InstructionReport.CellTypes._number;

				DataField summField = null;

				if (summ.ContainsKey(currentQuarter))
				{
					summField = new DataField()
					{
						type = typeOfCurrentCell,
						value = summ[currentQuarter].ToString()
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

		#region Вспомогательные методы
		// Наименования кварталов
		internal enum QuarterEnum : int
		{
			Year = 0,			// год
			FirstQuarter,		// 1ый квартал
			SecondQuarter,		// 2ой квартал
			ThirdQuarter,		// 3ий квартал
			FourthQuarter		// 4ый квартал
		}

		/// <summary>
		/// Проверка существования поля и задание ему получения значений подстановки при запросе элемента
		/// </summary>
		/// <param name="item">
		/// Элемент списка для которого необходимо проверить существование поля
		/// </param>
		/// <param name="fieldName">
		/// Имя поля, существование которого необходимо проверить и задать тип получения данных
		/// </param>
		private void CheckFieldExistenceAndUpdateIoType(DBItem item, string fieldName)
		{
			if (item.List.ContainsField(fieldName))
			{
				DBField field = item.List.GetField(fieldName);
				if (field.ValueLoadingType == DBFieldValueIOType.OnDemand)
					field.ValueLoadingType = DBFieldValueIOType.Directly;
			}
			else
			{
				throw new DBException.MissingField(item.List, fieldName);
			}
		}

		/// <summary>
		/// Проверка существования поля
		/// </summary>
		/// <param name="item">
		/// Элемент списка для которого необходимо проверить существование поля
		/// </param>
		/// <param name="fieldName">
		/// Имя поля, существование которого необходимо проверить
		/// </param>
		private void CheckFieldExistence(DBItem item, string fieldName)
		{
			if (item.List.ContainsField(fieldName))
			{
				DBField field = item.List.GetField(fieldName);
			}
			else
			{
				throw new DBException.MissingField(item.List, fieldName);
			}
		}

		/// <summary>
		/// получение текста подстановки с проверкой на его существование
		/// </summary>
		/// <param name="item">Элемент списка для которого необходимо получить значение текста подстановки</param>
		/// <param name="fieldName">Имя поля, значение текста подстановки которого необходимо получить</param>
		/// <returns>текст подстановки</returns>
		private string LocalGetLookupText(DBItem item, string fieldName)
		{
			string retString = item.GetLookupText(fieldName);
			if (string.IsNullOrEmpty(retString))
				throw new Exception(string.Format("Не удалось определить значение поля подстановки {0} для элемента {1} списка {2}", fieldName, item.ID, item.List.ID));
			return retString;
		}

		#endregion Вспомогательные методы
	}
}