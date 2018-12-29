using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Fields.TableSection;

namespace WSSC.V4.DMS.OMK.ComplexReports
{
    public class StationeryReport
    {
        #region props
        private bool __init_CompaniesList;
        private DBList _CompaniesList;
        public DBList CompaniesList
        {
            get
            {
                if (!__init_CompaniesList)
                {
                    _CompaniesList = Site.RootWeb.GetList(_Consts.Lists.Companies.ListName);
                    __init_CompaniesList = true;
                }
                return _CompaniesList;
            }
        }

        private DBSite Site;

        #endregion

        /// <summary>
        /// Таблица значений отчета.
        /// </summary>
        /// <param name="itemsToProcess"></param>
        /// <param name="filters"></param>
        /// <returns></returns>
        public List<List<DataField>> CustomTableValue(List<DBItem> itemsToProcess, List<PFilterValue> filters)
        {
            if (itemsToProcess.Count > 0)
            {
                this.Site = itemsToProcess[0].Site;
                //Ключ - ID компании, value - элементы отчета 
                Dictionary<int, List<MVZReportItem>> stationeryForCompanies = GetStationeryForCompanies(itemsToProcess);

                //строим таблицу отчета
                List<List<DataField>> customTable = GetTable(stationeryForCompanies);
                return customTable;
            }
            //если в картотеке не выбраны карточки, то и таблицу строить не нужно
            else
            {
                return new List<List<DataField>>();
            }
        }


        //Проходим по всем выбранным в картотеке элементам, считываем табличную секцию и формируем словарь ID компании / канцтовары из табличной секции
        public Dictionary<int, List<MVZReportItem>> GetStationeryForCompanies(List<DBItem> itemsToProcess)
        {
            //<ID компании, элементы>
            Dictionary<int, List<MVZReportItem>> recordsForCompanies = new Dictionary<int, List<MVZReportItem>>();

            foreach (DBItem item in itemsToProcess)
            {
                int companyID = item.GetLookupID(_Consts.Lists.CommonFields.Company);
                if (!recordsForCompanies.Keys.Contains(companyID))
                {
                    recordsForCompanies.Add(companyID, new List<MVZReportItem>());
                }
                string mvzName = "";

                DBItem MvzItem = item.GetLookupItem(_Consts.CustomReports.StationeryReport.Mvz);
                if (MvzItem != null)
                {
                    mvzName = MvzItem.DisplayName;
                }
                else
                {
                    mvzName = _Consts.CustomReports.StationeryReport.MvzNameIsNotSet;
                }
                WSSC.V4.SYS.Lib.Logging.Log log = new SYS.Lib.Logging.Log("WSSC.V4.DMS.OMK", Site);
                log.Write("Получение поля " + _Consts.CustomReports.StationeryReport.TotalAmount);
                double count = item.GetValue<double>(_Consts.CustomReports.StationeryReport.TotalAmount);
                log.Write("Сумма: "+count.ToString() );
                MVZReportItem MVZReportItem = new MVZReportItem(mvzName, count);
                recordsForCompanies[companyID].Add(MVZReportItem);
            }
            return recordsForCompanies;
        }


        //Построение таблицы отчета
        public List<List<DataField>> GetTable(Dictionary<int, List<MVZReportItem>> stationeryForCompanies)
        {
            List<List<DataField>> table = new List<List<DataField>>();

            //Проходим по всем компаниям и выводим для них значения
            foreach (int companyID in stationeryForCompanies.Keys)
            {
                string companyName = string.Empty;
                if (companyID != 0)
                {
                    DBItem companyItem = this.CompaniesList.GetItem(companyID);
                    companyName = companyItem.GetStringValue(_Consts.Lists.Companies.Fields.Name); ;
                }
                //Если компания не указана - название секции по умолчанию
                else
                {
                    companyName = _Consts.CustomReports.StationeryReport.CompanyNameIsNotSet;
                }

                //Элементы этой компании
                List<MVZReportItem> stationeryItems = stationeryForCompanies[companyID];

                // List<MVZReportItem> combinedItems = CombineItems(stationeryItems);

                List<MVZReportItem> combinedItems = CombineItems(stationeryItems);
                //Количество элементов для данной компании (таким образом делаем подобие rowspan)
                int elementCount = combinedItems.Count;
                if (elementCount != 0)
                {
                    DataField companyDataField = new DataField();
                    companyDataField.value = companyName;
                    //DataField companyDataField = GetCompanyDataField(companyName, elementCount);
                    DataField elementField = GetStationeryDataField(combinedItems);
                    double companySum = GetTotalAmount(combinedItems);
                    DataField sumField = new DataField();
                    sumField.value = companySum.ToString("0.00");

                    table.Add(new List<DataField> { companyDataField, elementField, sumField });

                }
            }
            return table;
        }

        private double GetTotalAmount(List<MVZReportItem> MVZReportItems)
        {
            double totalAmount = 0;
            foreach (MVZReportItem MVZReportItem in MVZReportItems)
            {
                totalAmount += MVZReportItem.Amount;
            }
            return totalAmount;
        }


        private List<MVZReportItem> CombineItems(List<MVZReportItem> MVZReportItems)
        {
            Dictionary<string, MVZReportItem> Dictionary = new Dictionary<string, MVZReportItem>();

            //Суммируем столбцы суммы и к-ва для элементов с одинаковым артикулом
            foreach (MVZReportItem item in MVZReportItems)
            {
                if (!Dictionary.ContainsKey(item.MVZ))
                {
                    Dictionary.Add(item.MVZ, item);
                }
                else
                {
                    Dictionary[item.MVZ].Amount += item.Amount;
                }
            }


            //Строки с уникальностью по артикулам и просуммированными значениями столбцов
            List<MVZReportItem> resultMVZReportItems = new List<MVZReportItem>();

            foreach (var c in Dictionary)
            {
                resultMVZReportItems.Add(c.Value);
            }

            return resultMVZReportItems;
        }

        public DataField GetStationeryDataField(List<MVZReportItem> MVZReportItems)
        {
            //Строки ячейки - по одной строке на каждую запись
            List<List<string>> rows = new List<List<string>>();

            //Ячейка содержит в себе строки и столбцы
            DataField elementsDataField = new DataField();
            elementsDataField.isTableField = true;

            foreach (var MVZReportItem in MVZReportItems)
            {
                //Формируем строку для элемента
                //Столбцы строки. По одному столбцу на каждое свойство
                List<string> row = GetTableRow(MVZReportItem);
                rows.Add(row);
            }
            elementsDataField.table = rows;
            return elementsDataField;
        }


        public string GetCell(TSRow tsRow, string tTSColumnName)
        {
            return tsRow[tTSColumnName];
        }

        public List<string> GetTableRow(MVZReportItem recordObject)
        {
            List<string> row = new List<string>();

            row.Add(recordObject.MVZ);
            row.Add(recordObject.Amount.ToString("0.00"));
            return row;

        }

        public DataField GetCell(object value)
        {
            DataField dataField = new DataField();
            dataField.value = value.ToString();

            return dataField;
        }
    }
}