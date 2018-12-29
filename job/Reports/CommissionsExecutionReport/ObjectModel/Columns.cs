using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.Lib.Data;

namespace WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel
{
    /// <summary>
    /// Столбцы отчёта.
    /// </summary>
    public class Columns : ICollection<Column>
    {
        /// <summary>
        /// Информация о БД.
        /// </summary>
        public DBInfo DBInfo { get; private set; }

        /// <summary>
        /// Источник фильтрации.
        /// </summary>
        public IReportFilterConditions ReportFilters { get; private set; }

        /// <summary>
        /// Настройки отчёта.
        /// </summary>
        public CommissionReportSettings Settings { get; private set; }

        public Columns(CommissionReportSettings settings, DBInfo dbInfo, IReportFilterConditions reportFilters)
        {
            if (settings == null)
                throw new ArgumentNullException("settings");
            if (dbInfo == null)
                throw new ArgumentNullException("dbInfo");
            if (reportFilters == null)
                throw new ArgumentNullException("reportFilters");


            this.DBInfo = dbInfo;
            this.ReportFilters = reportFilters;
            this.Settings = settings;
        }

        private bool __init_ColumnsDict;
        private Dictionary<ColumnType, Column> _ColumnsDict;
        /// <summary>
        /// Словарь столбцов по типу.
        /// </summary>
        private Dictionary<ColumnType, Column> ColumnsDict
        {
            get
            {
                if (!__init_ColumnsDict)
                {
                    _ColumnsDict = this.InitColumns().ToDictionary(c => c.Type, c => c);

                    __init_ColumnsDict = true;
                }
                return _ColumnsDict;
            }
        }

        private bool __init_FilterCondition;
        private string _FilterCondition;
        /// <summary>
        /// Условие по фильтрам.
        /// </summary>
        internal string FilterCondition
        {
            get
            {
                if (!__init_FilterCondition)
                {
                    List<string> filters = new List<string>();

                    if (!String.IsNullOrEmpty(this.ReportFilters.CompanyFilter))
                        filters.Add(String.Format("({0})", this.ReportFilters.CompanyFilter));

                    if (!String.IsNullOrEmpty(this.ReportFilters.AuthorFilter))
                        filters.Add(String.Format("({0})", this.ReportFilters.AuthorFilter));

                    if (!String.IsNullOrEmpty(this.ReportFilters.ProtocolTypeFilter))
                        filters.Add(String.Format("({0})", this.ReportFilters.ProtocolTypeFilter));

                    if (!String.IsNullOrEmpty(this.ReportFilters.PriorityFilter))
                        filters.Add(String.Format("({0})", this.ReportFilters.PriorityFilter));

                    _FilterCondition = String.Join(" AND ", filters.ToArray());

                    __init_FilterCondition = true;
                }
                return _FilterCondition;
            }
        }

        /// <summary>
        /// Инициализирует столбцы.
        /// </summary>
        /// <returns></returns>
        protected virtual List<Column> InitColumns()
        {
            List<Column> columns = new List<Column>();

            int executionStageID = this.DBInfo.GetStageID(_Consts.Reports.CommissionsExecutionReport.Execution);
            int executedStatusID = this.DBInfo.GetStatusID(_Consts.Reports.CommissionsExecutionReport.Executed);
            int executedAndAgreedStatusID =
                this.DBInfo.GetStatusID(_Consts.Reports.CommissionsExecutionReport.ExecutedAndAgreed);
            int completedStatusID = this.DBInfo.GetStatusID(_Consts.Reports.CommissionsExecutionReport.Completed);
            string statusesGroup1 = executedStatusID + "," + executedAndAgreedStatusID + "," + completedStatusID;
            string notAnnulStage = "Статус <> " +
                                   this.DBInfo.GetStatusID(_Consts.Reports.CommissionsExecutionReport.Annul);

            string subquery =
                "((Поручено<=@endDate AND Поручено>=@startDate) OR (Поручено<@startDate AND (Исполнено is null OR Исполнено >@startDate)))";

            //4 Всего выдано в отчетном периоде
            string totalOut = String.Format("{0} AND {1} AND Статус <> {2}", notAnnulStage, subquery, this.DBInfo.GetStatusID(_Consts.Reports.CommissionsExecutionReport.Preparing));
            Column totalOutColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.TotalOut, DBPartitionDataType.All, totalOut, ColumnType.TotalOut);
            columns.Add(totalOutColumn);

            //5 Срок не наступил
            string notYetCondition = String.Format("{0} AND Этап={1} AND {2} AND [Исполнить до]>@endDate",
                                                   notAnnulStage,
                                                   executionStageID,
                                                   subquery);
            Column notYetColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.TimeNotYet, DBPartitionDataType.All, notYetCondition, ColumnType.NotYet);
            columns.Add(notYetColumn);

            //6 Выполнено - Всего
            string totalCompletedCondition = String.Format("Статус IN({0}) AND Исполнено<=@endDate AND Исполнено>=@startDate AND [Исполнить до]>@startDate",
                statusesGroup1);
            Column totalCompleted = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.CompletedAtAll, DBPartitionDataType.All, totalCompletedCondition, ColumnType.TotalCompleted);
            columns.Add(totalCompleted);

            //7 Выполнено – из них в срок – первоначальный срок
            string completedInFirstTime = String.Format(@"
Статус IN({0}) 
AND Исполнено<=@endDate 
AND Исполнено>=@startDate 
AND [Исполнить до]>=@startDate 
AND ([Перенесен срок]<>1 OR [Перенесен срок]IS NULL) 
AND Исполнено<=[Исполнить до]", statusesGroup1);

            Column completedInFirstTimeColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.CompletedInFirstTime, DBPartitionDataType.All, completedInFirstTime, ColumnType.CompletedInFirstTime);
            columns.Add(completedInFirstTimeColumn);

            //8 Выполнено – из них в срок – скорректированный срок (перенос срока)
            string completedCorrected = String.Format(@"
Статус IN({0}) 
AND Исполнено<=@endDate 
AND Исполнено>=@startDate
AND [Исполнить до]>=@startDate 
AND [Перенесен срок] = 1 
AND Исполнено<=[Исполнить до]", statusesGroup1);
            Column completedCorrectedColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.CompletedInCorrectTime, DBPartitionDataType.All, completedCorrected, ColumnType.CompletedCorrected);
            columns.Add(completedCorrectedColumn);

            //9 Выполнено - из них не в срок (первоначальный срок)
            string completedNotInFirstTime = String.Format("{0} AND ([Перенесен срок]=0 OR [Перенесен срок]IS NULL) AND Исполнено>[Исполнить до] AND [Исполнить до]>=@startDate", totalCompletedCondition);
            Column completedNotInFirstTimeColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.CompletedNotInFirstTime, DBPartitionDataType.All,
                           completedNotInFirstTime, ColumnType.CompletedNotInFirstTime);
            columns.Add(completedNotInFirstTimeColumn);

            //10 Выполнено – из них не в срок (перенесенный срок)
            string completedNotInCorrect =
                String.Format(@"
Статус IN({0}) 
AND Исполнено<=@endDate 
AND Исполнено>=@startDate 
AND [Исполнить до]>=@startDate 
AND [Перенесен срок]=1 
AND Исполнено>[Исполнить до]
", statusesGroup1);
            Column completedNotInCorrectColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.CompletedNotInCorrectedTime,
                           DBPartitionDataType.All, completedNotInCorrect, ColumnType.CompletedIncorrect);
            columns.Add(completedNotInCorrectColumn);

            //11 Всего поручений, находящихся в работе за отчетный период
            string totalCommissionCondition = String.Format("Этап={0} AND Поручено<=@endDate",
                executionStageID);
            Column totalCommissions = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.TotalCommissionsAtWork,
                           DBPartitionDataType.All,
                           totalCommissionCondition, ColumnType.TotalCommissions);
            columns.Add(totalCommissions);

            //12 На исполнении – срок истек на конец отчетного периода
            string onexecutionexpired = String.Format("Этап={0} AND ([Перенесен срок]=0 OR [Перенесен срок]IS NULL) AND [Исполнить до]<@endDate",
                executionStageID);
            Column onExecutionExpiredColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.OnExecutionExpired,
                           DBPartitionDataType.Primary,
                           onexecutionexpired, ColumnType.OnExecutionExpired);
            columns.Add(onExecutionExpiredColumn);

            //13 На исполнении –скорректированный срок (перенос срока истек)
            string onexeuctionCorrected = String.Format("Этап={0} AND [Перенесен срок]=1 AND [Исполнить до] < @endDate",
                executionStageID);
            Column onExecutionCorrected = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.OnExecutionCorrectedTime,
                           DBPartitionDataType.Primary,
                           onexeuctionCorrected, ColumnType.OnExecutionCorrected);
            columns.Add(onExecutionCorrected);

            //14 Поручения, находящиеся на контроле у Автора в статусе "исполнено", "исполнено и подтверждено"
            string controller = string.Format("Этап={0} AND Контролер is null AND Поручено <= @endDate",
                this.DBInfo.GetStageID(_Consts.Reports.CommissionsExecutionReport.OffControl));
            Column controllerColumn = new Column(_Consts.Reports.CommissionsExecutionReport.Columns.InAuthorControl,
                                                 DBPartitionDataType.Primary,
                                                 controller, ColumnType.Controller);
            columns.Add(controllerColumn);
            return columns;
        }

        /// <summary>
        /// Returns an enumerator that iterates through the collection.
        /// </summary>
        /// <returns>
        /// A <see cref="T:System.Collections.Generic.IEnumerator`1"/> that can be used to iterate through the collection.
        /// </returns>
        public IEnumerator<Column> GetEnumerator()
        {
            return this._ColumnsDict.Values.GetEnumerator();
        }

        /// <summary>
        /// Returns an enumerator that iterates through a collection.
        /// </summary>
        /// <returns>
        /// An <see cref="T:System.Collections.IEnumerator"/> object that can be used to iterate through the collection.
        /// </returns>
        IEnumerator IEnumerable.GetEnumerator()
        {
            return this.GetEnumerator();
        }

        internal Column this[ColumnType type]
        {
            get
            {
                if (!this.ColumnsDict.ContainsKey(type))
                    throw new Exception("В словаре отсутствует столбец переданного типа: " + type);

                return this.ColumnsDict[type];
            }
        }

        public Column this[int index]
        {
            get { return this.ColumnsDict.ElementAt(index).Value; }
        }

        public Column GetColumnByTypeID(int columnTypeID)
        {
            ColumnType colType;
            try
            {
                colType = (ColumnType)columnTypeID;
            }
            catch (InvalidCastException ex)
            {
                throw new Exception("Передан некорректный ID типа столбца: " + columnTypeID, ex);
            }

            return this[colType];
        }

        /// <summary>
        /// Adds an item to the <see cref="T:System.Collections.Generic.ICollection`1"/>.
        /// </summary>
        /// <param name="item">The object to add to the <see cref="T:System.Collections.Generic.ICollection`1"/>.</param><exception cref="T:System.NotSupportedException">The <see cref="T:System.Collections.Generic.ICollection`1"/> is read-only.</exception>
        public void Add(Column item)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Removes all items from the <see cref="T:System.Collections.Generic.ICollection`1"/>.
        /// </summary>
        /// <exception cref="T:System.NotSupportedException">The <see cref="T:System.Collections.Generic.ICollection`1"/> is read-only. </exception>
        public void Clear()
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Determines whether the <see cref="T:System.Collections.Generic.ICollection`1"/> contains a specific value.
        /// </summary>
        /// <returns>
        /// true if <paramref name="item"/> is found in the <see cref="T:System.Collections.Generic.ICollection`1"/>; otherwise, false.
        /// </returns>
        /// <param name="item">The object to locate in the <see cref="T:System.Collections.Generic.ICollection`1"/>.</param>
        public bool Contains(Column item)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Copies the elements of the <see cref="T:System.Collections.Generic.ICollection`1"/> to an <see cref="T:System.Array"/>, starting at a particular <see cref="T:System.Array"/> index.
        /// </summary>
        /// <param name="array">The one-dimensional <see cref="T:System.Array"/> that is the destination of the elements copied from <see cref="T:System.Collections.Generic.ICollection`1"/>. The <see cref="T:System.Array"/> must have zero-based indexing.</param>
        /// <param name="arrayIndex">The zero-based index in <paramref name="array"/> at which copying begins.</param>
        /// <exception cref="T:System.ArgumentNullException"><paramref name="array"/> is null.</exception>
        /// <exception cref="T:System.ArgumentOutOfRangeException"><paramref name="arrayIndex"/> is less than 0.</exception>
        /// <exception cref="T:System.ArgumentException">The number of elements in the source <see cref="T:System.Collections.Generic.ICollection`1"/> is greater than the available space from <paramref name="arrayIndex"/> to the end of the destination <paramref name="array"/>.</exception>
        public void CopyTo(Column[] array, int arrayIndex)
        {
            this.ColumnsDict.Values.CopyTo(array, arrayIndex);
        }

        /// <summary>
        /// Removes the first occurrence of a specific object from the <see cref="T:System.Collections.Generic.ICollection`1"/>.
        /// </summary>
        /// <returns>
        /// true if <paramref name="item"/> was successfully removed from the <see cref="T:System.Collections.Generic.ICollection`1"/>; otherwise, false. This method also returns false if <paramref name="item"/> is not found in the original <see cref="T:System.Collections.Generic.ICollection`1"/>.
        /// </returns>
        /// <param name="item">The object to remove from the <see cref="T:System.Collections.Generic.ICollection`1"/>.</param><exception cref="T:System.NotSupportedException">The <see cref="T:System.Collections.Generic.ICollection`1"/> is read-only.</exception>
        public bool Remove(Column item)
        {
            throw new NotImplementedException();
        }

        /// <summary>
        /// Gets the number of elements contained in the <see cref="T:System.Collections.Generic.ICollection`1"/>.
        /// </summary>
        /// <returns>
        /// The number of elements contained in the <see cref="T:System.Collections.Generic.ICollection`1"/>.
        /// </returns>
        public int Count
        {
            get { return this.ColumnsDict.Count; }
        }

        /// <summary>
        /// Gets a value indicating whether the <see cref="T:System.Collections.Generic.ICollection`1"/> is read-only.
        /// </summary>
        /// <returns>
        /// true if the <see cref="T:System.Collections.Generic.ICollection`1"/> is read-only; otherwise, false.
        /// </returns>
        public bool IsReadOnly
        {
            get { throw new NotImplementedException(); }
        }
    }
}
