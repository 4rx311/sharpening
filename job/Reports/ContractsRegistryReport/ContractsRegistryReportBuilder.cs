using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib;
using WSSC.V4.SYS.Lib.DBObjects;
using WFConsts = WSSC.V4.DMS.Workflow.Consts;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет построитель кастомной части отчета "Реестр договоров".
    /// </summary>
    public class ContractsRegistryReportBuilder : RPCustomBuilder
    {
        public ContractsRegistryReportBuilder(RPTableBuilder builder)
            : base(builder)
        { }

        private bool __init_StatisticsAdapter = false;
        private DBObjectAdapter<DMSStatistics> _StatisticsAdapter;
        /// <summary>
        /// Адаптер данных статистики документов на этапах.
        /// </summary>
        public DBObjectAdapter<DMSStatistics> StatisticsAdapter
        {
            get
            {
                if (!__init_StatisticsAdapter)
                {
                    _StatisticsAdapter = new DBObjectAdapter<DMSStatistics>(this.Site.SiteConnectionString);
                    __init_StatisticsAdapter = true;
                }
                return _StatisticsAdapter;
            }
        }

        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            DateTime now = DateTime.Now;

            List<ContractsRegistryDataRow> source = new List<ContractsRegistryDataRow>();
            Dictionary<string, List<DMSStatistics>> allAgrStatistics = new Dictionary<string, List<DMSStatistics>>();
            Dictionary<string, List<DMSStatistics>> allSignStatistics = new Dictionary<string, List<DMSStatistics>>();

            //получаем всю статистику по документам разом
            Dictionary<int, List<DBItem>> itemsDicit = this.Items.GroupBy(x => x.List.ID).ToDictionary(gr => gr.Key, y => y.ToList());
            foreach (KeyValuePair<int, List<DBItem>> pair in itemsDicit)
            {
                //получаем списки и идентификаторы этапов
                DBList list = this.Site.GetList(pair.Key, true);

                DBList stagesList = list.Web.GetList(WFConsts.listName_Stages, true);
                DBItem agrStageItem = stagesList.GetItem(WFConsts.list_Stages_col_Name, _Consts.Lists.Stages.Agreement);
                DBItem signStageItem = stagesList.GetItem(WFConsts.list_Stages_col_Name, _Consts.Lists.Stages.Signing);

                //на всякий случай обрабатываем по 1000 документов
                List<List<DBItem>> itemsCollections = pair.Value.Slice(1000);
                foreach (List<DBItem> items in itemsCollections)
                {
                    //находим статистику на согласовании
                    if (agrStageItem != null)
                    {
                        string query = string.Format("[ItemID] in ({0}) AND [ListID] = {1} AND [StageID] = {2}",
                            String.Join(",", items.Select(x => x.ID.ToString()).ToArray()),
                            pair.Key,
                            agrStageItem.ID);

                        List<DMSStatistics> stageStatCol = this.StatisticsAdapter.GetObjects(query);
                        Dictionary<int, List<DMSStatistics>> itemsStatCol = stageStatCol.GroupBy(x => x.ItemID).ToDictionary(gr => gr.Key, val => val.ToList());
                        foreach (KeyValuePair<int, List<DMSStatistics>> kvp in itemsStatCol)
                        {
                            //заполняем словарь по уникальному ключу документа
                            string itemKey = String.Format("{0}_{1}", pair.Key, kvp.Key);
                            allAgrStatistics.Add(itemKey, kvp.Value);
                        }

                    }

                    //находим статистику на подписании
                    if (signStageItem != null)
                    {
                        string query = string.Format("[ItemID] in ({0}) AND [ListID] = {1} AND [StageID] = {2}",
                            String.Join(",", items.Select(x => x.ID.ToString()).ToArray()),
                            pair.Key,
                            signStageItem.ID);

                        List<DMSStatistics> stageStatCol = this.StatisticsAdapter.GetObjects(query);
                        Dictionary<int, List<DMSStatistics>> itemsStatCol = stageStatCol.GroupBy(x => x.ItemID).ToDictionary(gr => gr.Key, val => val.ToList());
                        foreach (KeyValuePair<int, List<DMSStatistics>> kvp in itemsStatCol)
                        {
                            //заполняем словарь по уникальному ключу документа
                            string itemKey = String.Format("{0}_{1}", pair.Key, kvp.Key);
                            allSignStatistics.Add(itemKey, kvp.Value);
                        }
                    }
                }
            }

            //формируем для каждого документа строку данных
            foreach (DBItem item in this.Items)
            {
                ContractsRegistryDataRow itemRow = new ContractsRegistryDataRow(item);
                string itemKey = String.Format("{0}_{1}", item.List.ID, item.ID);

                //устанавливаем срок на согласовании
                if (allAgrStatistics.ContainsKey(itemKey))
                {
                    foreach (DMSStatistics agrStatistic in allAgrStatistics[itemKey])
                    {
                        DateTime dateEnd = agrStatistic.DateEnd != DateTime.MinValue && agrStatistic.DateEnd != SqlDateTime.MaxValue.Value ? agrStatistic.DateEnd : now;
                        double hoursOnStage = WorkTimeServices.GetWorkHours(agrStatistic.DateStart, dateEnd, true);
                        itemRow.AgrWorkHours += hoursOnStage;
                    }
                }

                //устанавливаем срок на подписании
                if (allSignStatistics.ContainsKey(itemKey))
                {
                    foreach (DMSStatistics signStatistic in allSignStatistics[itemKey])
                    {
                        DateTime dateEnd = signStatistic.DateEnd != DateTime.MinValue && signStatistic.DateEnd != SqlDateTime.MaxValue.Value ? signStatistic.DateEnd : now;
                        double hoursOnStage = WorkTimeServices.GetWorkHours(signStatistic.DateStart, dateEnd, true);
                        itemRow.SignWorkHours += hoursOnStage;
                    }
                }

                source.Add(itemRow);
            }

            return source.Select(x => (IRPDataRow)x);
        }


        /// <summary>
        /// Кол-во часов этапе согласования.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetAgrStageHours(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            RPCell cell = tableCell.CreateRow().CreateCell();
            ContractsRegistryDataRow info = tableCell.TableRow.DataRow as ContractsRegistryDataRow;
            if (info.AgrWorkHours > 0)
                cell.SetValue(info.AgrWorkHours, RPCellFormatType.Number);

        }

        /// <summary>
        /// Кол-во часов этапе подписания.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы отчёта.</param>
        [RPCustomColumn]
        public void GetSignStageHours(RPTableCell tableCell)
        {
            RPCell cell = tableCell.CreateRow().CreateCell();
            ContractsRegistryDataRow info = tableCell.TableRow.DataRow as ContractsRegistryDataRow;
            if (info.SignWorkHours > 0)
                cell.SetValue(info.SignWorkHours, RPCellFormatType.Number);
        }
    }
}
