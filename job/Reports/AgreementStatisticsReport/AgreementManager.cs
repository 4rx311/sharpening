using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.DMS.Reports;
using Consts = WSSC.V4.DMS.OMK._Consts.Reports.AgreementStatisticsReport;

namespace WSSC.V4.DMS.OMK.Reports.AgreementReportData
{
    /// <summary>
    /// Менеджер создания отчета по договорам
    /// </summary>
    class AgreementManager
    {
        /// <summary>
        /// Набор документов для формирования строк отчета
        /// </summary>
        private IEnumerable<DBItem> Items;

        /// <summary>
        /// Класс, обрабатывающий документы, выбранные для формирования отчета
        /// </summary>
        /// <param name="items">Набор документов</param>
        public AgreementManager(IEnumerable<DBItem> items)
        {
            if (items == null)
                throw new ArgumentNullException("items");

            Items = items;
        }

        /// <summary>
        /// Получение строк таблицы отчета
        /// </summary>
        /// <returns>Коллекция строк таблицы отчета</returns>
        public List<IRPDataRow> GetAgreementRows()
        {
            Dictionary<KeyValuePair<string, string>, IRPDataRow> agreementRowsDict = new Dictionary<KeyValuePair<string, string>, IRPDataRow>();

            //Получение списков в выборке, и проставление режима прямой загрузки
            string[] fieldNames = {Consts.Fields.CompanyFieldName,
                                          Consts.Fields.DepartmentFieldName,
                                          Consts.Fields.DocTypeFieldName,
                                          Consts.Fields.FinSourceFieldName,
                                          Consts.Fields.FormFieldName,
                                          Consts.Fields.OuterInnerFieldName,
                                          Consts.Fields.StageFieldName};

            foreach (DBList list in Items.Select(x => x.List).Distinct())
                this.SetFieldsDirectLoad(list, fieldNames);

            foreach (DBItem item in Items)
            {
                //Создание объекта договора
                AgreementData agreement = new AgreementData(item);
                KeyValuePair<string, string> keyPair = new KeyValuePair<string, string>(agreement.Company, agreement.Department);

                //Проверка существования строки и запись значения договора
                IRPDataRow row;
                if (!agreementRowsDict.TryGetValue(keyPair, out row))
                {
                    row = new AgreementRow(item);
                    agreementRowsDict.Add(keyPair, row);
                }
                ((AgreementRow)row).Agreements.Add(agreement);
            }

            return agreementRowsDict.Values.ToList();
        }

        /// <summary>
        /// Получение кол-ва договоров, удовлетворяющих условиям маски
        /// </summary>
        /// <param name="agreements">Список договоров строки</param>
        /// <param name="mask">Объект маски</param>
        /// <returns></returns>
        public static int GetAgreementAmountByMask(List<AgreementData> agreements, AgreementMask mask)
        {
            int agrAmount = 0;

            //Проверка соответствия полей договоров и маски
            foreach (AgreementData agreement in agreements)
            {
                if (agreement.DocType != mask.DocType && !string.IsNullOrEmpty(mask.DocType))
                    continue;

                if (agreement.Stage != mask.Stage && !string.IsNullOrEmpty(mask.Stage))
                    continue;

                if (agreement.FinSource != mask.FinSource && !string.IsNullOrEmpty(mask.FinSource))
                    continue;

                if (agreement.Form != mask.Form && !string.IsNullOrEmpty(mask.Form))
                    continue;

                if (agreement.OuterInner != mask.OuterInner && !string.IsNullOrEmpty(mask.OuterInner))
                    continue;

                if (mask.DisagreementProtocol && agreement.DisagreementProtocol != mask.DisagreementProtocol)
                    continue;

                agrAmount++;
            }
            return agrAmount;
        }

        /// <summary>
        /// Простановка режима прямой загрузки значений полей подстановки
        /// </summary>
        /// <param name="list"></param>
        private void SetFieldsDirectLoad(DBList list, string[] fieldNames)
        {
            if (list == null)
                throw new ArgumentNullException("list");

            if (fieldNames == null)
                throw new ArgumentNullException("fields");

            foreach (string fieldName in fieldNames)
                list.GetField(fieldName, true).ValueLoadingType = DBFieldValueIOType.Directly;

        }
    }
}
