using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports.InstructionsReportExcel;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Fields.TableSection;
using WSSC.V4.SYS.Lib.Logging;

namespace WSSC.V4.DMS.OMK.ComplexReports
{


    public class GeneralStationeryReport
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
                //Ключ - ID компании, value - элементы отчета канцелярии
                Dictionary<int, List<ReportItem>> stationeryForCompanies = GetStationeryForCompanies(itemsToProcess);

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
        public Dictionary<int, List<ReportItem>> GetStationeryForCompanies(List<DBItem> itemsToProcess)
        {
            //<ID компании, элементы канцтоваров>
            Dictionary<int, List<ReportItem>> recordsForCompanies = new Dictionary<int, List<ReportItem>>();

            foreach (DBItem item in itemsToProcess)
            {
                int companyID = item.GetLookupID("Компания");

                if (!recordsForCompanies.Keys.Contains(companyID))
                {
                    recordsForCompanies.Add(companyID, new List<ReportItem>());
                }

                TSField tsField = item.List.GetField<TSField>("Итого выдано");
                TSRowCollection tsRowCollection = tsField.GetTableSectionValue(item);

                //Проходим по элементам табличной секции и заполняем для данной компании канцтовары
                foreach (TSRow tsRow in tsRowCollection)
                {
                    ReportItem reportItem = CreateReportItemFromTSRow(tsRow, tsField);
                    recordsForCompanies[companyID].Add(reportItem);
                }
            }

            return recordsForCompanies;
        }

        public ReportItem CreateReportItemFromTSRow(TSRow tsRow, TSField tsField)
        {
            TSColumn NameColumn = tsField.GetColumn("LookupSingle");
            DataField NameCell = new DataField();

            DBList itemList = NameColumn.LookupSettings.LookupList;
            //ID канцтовара
            int itemID = Convert.ToInt32(tsRow[NameColumn.Name]);
            DBItem lookupItem = itemList.GetItem(itemID);
            //Наименование канцтовара
            string name = lookupItem.GetStringValue(_Consts.CustomReports.StationeryReport.Name);

            int quantity = 0;
            Int32.TryParse(GetCell(tsRow, _Consts.CustomReports.StationeryReport.TableSectionCountColumn), out quantity);

            string article = lookupItem.GetStringValue(_Consts.CustomReports.StationeryReport.TableSectionArticleColumn);

            double cost = lookupItem.GetValue<double>(_Consts.CustomReports.StationeryReport.TableSectionPriceColumn);

            double amount = 0;
            string amountCell = GetCell(tsRow, _Consts.CustomReports.StationeryReport.TableSectionSummColumn);
            amountCell = amountCell.Replace('.', ',');
            if (string.IsNullOrEmpty(amountCell))
            {
                amount = 0;
            }
            else
            {
                if(!Double.TryParse(amountCell, out amount))
                {
                    Log.WriteError(string.Format("Не удалось преобразовать значение {0} к типу Double.", amountCell),"GeneralStationeryReport",VersionProvider.ModulName, this.Site);
                    amount = 0;
                }

            }
            ReportItem reportItem = new ReportItem(name, article, quantity, cost, amount);

            return reportItem;
        }


        //Построение таблицы отчета
        public List<List<DataField>> GetTable(Dictionary<int, List<ReportItem>> stationeryForCompanies)
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
                List<ReportItem> stationeryItems = stationeryForCompanies[companyID];

                List<ReportItem> combinedItems = CombineItems(stationeryItems);


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

        private double GetTotalAmount(List<ReportItem> reportItems)
        {
            double totalAmount = 0;
            foreach (ReportItem reportItem in reportItems)
            {
                totalAmount += reportItem.Amount;
            }
            return totalAmount;
        }


        private List<ReportItem> CombineItems(List<ReportItem> reportItems)
        {
            Dictionary<string, ReportItem> Dictionary = new Dictionary<string, ReportItem>();

            //Суммируем столбцы суммы и к-ва для элементов с одинаковым артикулом
            foreach (ReportItem item in reportItems)
            {
                if (!Dictionary.ContainsKey(item.Article))
                {
                    Dictionary.Add(item.Article, item);
                }
                else
                {
                    Dictionary[item.Article].Amount += item.Amount;
                    Dictionary[item.Article].Count += item.Count;

                }
            }

            //Строки с уникальностью по артикулам и просуммированными значениями столбцов
            List<ReportItem> resultReportItems = new List<ReportItem>();

            foreach (var c in Dictionary)
            {
                resultReportItems.Add(c.Value);
            }

            return resultReportItems;

        }
        public DataField GetStationeryDataField(List<ReportItem> reportItems)
        {
            //Строки ячейки - по одной строке на каждую запись
            List<List<string>> rows = new List<List<string>>();

            //Ячейка содержит в себе строки и столбцы
            DataField elementsDataField = new DataField();
            elementsDataField.isTableField = true;

            foreach (var reportItem in reportItems)
            {
                //Формируем строку для элемента
                //Столбцы строки. По одному столбцу на каждое свойство
                List<string> row = GetTableRow(reportItem);
                rows.Add(row);

            }


            elementsDataField.table = rows;
            return elementsDataField;
        }


        public string GetCell(TSRow tsRow, string tTSColumnName)
        {
            return tsRow[tTSColumnName];
        }

        public List<string> GetTableRow(ReportItem recordObject)
        {
            List<string> row = new List<string>();

            row.Add(recordObject.Name);
            row.Add(recordObject.Article);
            row.Add(recordObject.Count.ToString());
            row.Add(recordObject.Price.ToString("0.00"));
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