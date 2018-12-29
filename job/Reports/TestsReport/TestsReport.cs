using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using WSSC.V4.DMS.Fields.TableItems;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.DBObjects;

namespace WSSC.V4.DMS.OMK.Reports.TestsReport
{
    /// <summary>
    /// Отчет по тестам.
    /// </summary>
    class TestsReport : RPCustomBuilder
    {
        /// <summary>
        /// Отчет по тестам.
        /// </summary>
        /// <param name="builder"></param>
        public TestsReport(RPTableBuilder builder) : base(builder)
        {
        }

        /// <summary>
        /// Создает заголовок для колонки пользователей.
        /// </summary>
        /// <param name="tableCell"></param>
        /// <param name="userRole"></param>
        private static void CreateUserColumnHeader(RPTableCell tableCell, string userRole)
        {
            if (tableCell == null) {
                throw new ArgumentNullException("tableCell");
            }

            RPRow row = tableCell.CreateRow();

            // Заголовок с ролью пользователя.
            RPCell cell = row.CreateCell(1, _Consts.Reports.TestsReport.NumberOfUserColumns);
            cell.SetValue(userRole, RPCellFormatType.Text);

            row = tableCell.CreateRow();

            // Заголовок "ФИО".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.FIO, RPCellFormatType.Text);
            // Заголовок "Табельный номер".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.PersonnelNumber, RPCellFormatType.Text);
            // Заголовок "Должность".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.Position, RPCellFormatType.Text);
            // Заголовок "Орг. единица".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.OrgUnit, RPCellFormatType.Text);
            // Заголовок "Юр. лицо".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.LegalEntity, RPCellFormatType.Text);
        }

        // Заголовок столбца "Разработчик теста".
        [RPCustomHeader]
        public void TestDeveloperHeader(RPTableCell tableCell)
        {
            CreateUserColumnHeader(tableCell, _Consts.Lists.Tests.Fields.TestDeveloper);
        }

        // Заголовок столбца "Менеджер по электронному тестированию".
        [RPCustomHeader]
        public void ETestManagerHeader(RPTableCell tableCell)
        {
            CreateUserColumnHeader(tableCell, _Consts.Reports.TestsReport.ETestManager);
        }

        // Заголовок столбца "Эксперт/Согласующий ".
        [RPCustomHeader]
        public void ExpertHeader(RPTableCell tableCell)
        {
            CreateUserColumnHeader(tableCell, _Consts.Reports.TestsReport.Expert);
        }

        // Заголовок столбца "Руководитель (Подписант)".
        [RPCustomHeader]
        public void ManagerSignerHeader(RPTableCell tableCell)
        {
            CreateUserColumnHeader(tableCell, _Consts.Reports.TestsReport.ManagerSigner);
        }

        // Заголовок столбца "Специалист УОРП".
        [RPCustomHeader]
        public void UorpSpecialistHeader(RPTableCell tableCell)
        {
            //CreateUserColumnHeader(tableCell, _Consts.Reports.TestsReport.UorpSpecialist);
            CreateUserColumnHeader(tableCell, _Consts.Reports.TestsReport.TsorpSpecialist);
        }

        // Заголовок столбца "Даты".
        [RPCustomHeader]
        public void DatesHeader(RPTableCell tableCell)
        {
            if (tableCell == null) {
                throw new ArgumentNullException("tableCell");
            }

            RPRow row = tableCell.CreateRow();

            // Заголовок "Даты".
            RPCell cell = row.CreateCell(1, _Consts.Reports.TestsReport.NumberOfDateColumns);
            cell.SetValue(_Consts.Reports.TestsReport.Dates, RPCellFormatType.Text);

            row = tableCell.CreateRow();
            // Заголовок "Утверждение НРД".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.NRDAffirmationDate, RPCellFormatType.Text);
            // Заголовок "Создание карточки теста".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.TestCardCreationDate, RPCellFormatType.Text);
            // Заголовок "Разработка содержания теста".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.TestContentDevelopmentDate, RPCellFormatType.Text);
            // Заголовок "Согласование теста".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.TestAgreementDate, RPCellFormatType.Text);
            // Заголовок "Подписание теста".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.TestSigningDate, RPCellFormatType.Text);
            // Заголовок "Создание курса/теста".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.TestCreationDate, RPCellFormatType.Text);
        }

        // Заголовок столбца "Распространение и вид ознакомления".
        [RPCustomHeader]
        public void DistributionHeader(RPTableCell tableCell)
        {
            if (tableCell == null) {
                throw new ArgumentNullException("tableCell");
            }

            RPRow row = tableCell.CreateRow();

            // Заголовок "Распространение и вид ознакомления".
            RPCell cell = row.CreateCell(1, _Consts.Reports.TestsReport.NumberOfDistributionColumns);
            cell.SetValue(_Consts.Reports.TestsReport.DistributionAndFamiliarizationType, RPCellFormatType.Text);

            row = tableCell.CreateRow();
            // Заголовок "Вид назначения".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.AssignmentType, RPCellFormatType.Text);
            // Заголовок "Вид распространения".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.DistributionType, RPCellFormatType.Text);
            // Заголовок "Функция 1 го уровня".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.FirstLevelFunction, RPCellFormatType.Text);
            // Заголовок "Функция 2 го уровня".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.SecondLevelFunction, RPCellFormatType.Text);
            // Заголовок "Функция 3 го уровня".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.ThirdLevelFunction, RPCellFormatType.Text);
            // Заголовок "Функция 4 го уровня".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.FourthLevelFunction, RPCellFormatType.Text);
            // Заголовок "Действия".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.Actions, RPCellFormatType.Text);
            // Заголовок "БЕ".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.BE, RPCellFormatType.Text);
            // Заголовок "Подразделение".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.Department, RPCellFormatType.Text);
            // Заголовок "Категория сотрудников".
            cell = row.CreateCell();
            cell.SetValue(_Consts.Reports.TestsReport.EmployeeCategory, RPCellFormatType.Text);
        }

        // Столбец "Разработчик теста".
        [RPCustomColumn]
        public void TestDeveloperColumn(RPTableCell tableCell)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            DBItem currentItem = tableCell.Item;

            DBItem testDeveloper = currentItem.GetLookupItem(_Consts.Lists.Tests.Fields.TestDeveloper);

            if (testDeveloper == null) {
                CreateEmptyRow(tableCell, _Consts.Reports.TestsReport.NumberOfUserColumns);
                return;
            }

            CreateUserRow(tableCell, testDeveloper);
        }

        // Столбец "Эксперт/Согласующий".
        [RPCustomColumn]
        public void ExpertColumn(RPTableCell tableCell)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            DBItem currentItem = tableCell.Item;

            List<DBItem> experts = currentItem.GetLookupItems(_Consts.Lists.Tests.Fields.AddedToExpertise);

            if (experts.Count == 0) {
                CreateEmptyRow(tableCell, _Consts.Reports.TestsReport.NumberOfUserColumns);
                return;
            }

            foreach (DBItem expert in experts) {
                CreateUserRow(tableCell, expert);
            }
        }

        // Столбец "Менеджер по электронному тестированию".
        [RPCustomColumn]
        private void ETestManagerColumn(RPTableCell tableCell)
        {
            // Берем данные из блока согласования, а не из истории, т.к. роль "Менеджер по ЭТ"
            // отображается в истории, как обычный "Согласующий".
            //SetUserData(tableCell, CheckETestManager);
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            RowData data = (RowData)tableCell.TableRow.DataRow;
            DBItem item = data.Item;

            DMSAgreementBlockLogic agreementBlock = new DMSAgreementBlockLogic(item.DMSLogic());
            DMSAdapter<DMSRole> roleAdapter = item.DMSLogic().RoleAdapter;
            if (agreementBlock.ProcessObj != null && agreementBlock.ProcessObj.Stages != null) {
                foreach (ProcessStage stage in agreementBlock.ProcessObj.Stages) {
                    if (stage.ProcessBlocks != null) {
                        foreach (ProcessBlock processBlock in stage.ProcessBlocks) {
                            if (processBlock.ProcessUsers != null) {
                                foreach (ProcessUser user in processBlock.ProcessUsers) {
                                    if (user != null && user.MatrixPerson !=null) {
                                        // Получаем ID роли, по которой пользователь был добавлен в блок согласования.
                                        int roleID = user.MatrixPerson.RoleID;
                                        DMSRole role = roleAdapter.GetObjectByID(roleID);
                                        
                                        if (role != null && role.Name == _Consts.Lists.Tests.Roles.ETManager &&
                                           (user.SolutionResult == _Consts.Reports.TestsReport.Agreed ||
                                            user.SolutionResult == _Consts.Reports.TestsReport.AgreedWithComments)) 
                                        {
                                            DBUser etManagerUser = item.Site.GetUser(user.FactUserID);
                                            if (etManagerUser != null && etManagerUser.UserItem != null) {
                                                CreateUserRow(tableCell, etManagerUser.UserItem);
                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            CreateEmptyRow(tableCell, _Consts.Reports.TestsReport.NumberOfUserColumns);
        }

        // Столбец "Руководитель (Подписант)".
        [RPCustomColumn]
        private void ManagerSignerColumn(RPTableCell tableCell)
        {
            SetUserData(tableCell, CheckManagerSigner);
        }

        // Столбец "Специалист УОРП".
        [RPCustomColumn]
        private void UorpSpecialistColumn(RPTableCell tableCell)
        {
            SetUserData(tableCell, CheckUorpSpecialist);
        }

        /// <summary>
        /// Проверка условий для пользователя.
        /// </summary>
        /// <param name="eventData"></param>
        /// <returns></returns>
        private delegate bool CheckConditions(SolutionEventData eventData);

        /*/// <summary>
        /// Проверяет условия для менеджера по электронному тестированию.
        /// </summary>
        /// <param name="eventData"></param>
        /// <returns></returns>
        private bool CheckETestManager(SolutionEventData eventData)
        {
            if (eventData.Role == _Consts.Lists.Tests.Roles.ETManager &&
               (eventData.SolutionName == _Consts.Lists.Tests.Solutions.Agree ||
                eventData.SolutionName == _Consts.Lists.Tests.Solutions.AgreeWithComments)) 
            {
                return true;
            }
            return false;
        }
        /**/

        /// <summary>
        /// Проверяет условия для эксперта/согласующего.
        /// </summary>
        /// <param name="eventData"></param>
        /// <returns></returns>
        private bool CheckExpert(SolutionEventData eventData)
        {
            if (eventData.Role == _Consts.Lists.Tests.Fields.AddedToExpertise) {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Проверяет условия для руководителя/подписанта.
        /// </summary>
        /// <param name="eventData"></param>
        /// <returns></returns>
        private bool CheckManagerSigner(SolutionEventData eventData)
        {
            if (eventData.Role == _Consts.Lists.Tests.Roles.Signer &&
                eventData.SolutionName == _Consts.Lists.Tests.Solutions.Sign) {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Проверяет условия для специалиста УОРП.
        /// </summary>
        /// <param name="eventData"></param>
        /// <returns></returns>
        private bool CheckUorpSpecialist(SolutionEventData eventData)
        {
            if (eventData.Role == _Consts.Reports.TestsReport.UorpSpecialist &&
                eventData.SolutionName == _Consts.Lists.Tests.Solutions.Executed) {
                return true;
            }
            return false;
        }

        /// <summary>
        /// Устанавливает значения по пользователю в ячейку таблицы.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы.</param>
        /// <param name="checkData">Метод, проверяющий выполнение условий пользователя.</param>
        private static void SetUserData(RPTableCell tableCell, CheckConditions checkData)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            RowData data = (RowData)tableCell.TableRow.DataRow;

            foreach (SolutionEventData eventData in data.SolutionEventDataCollection) {
                if (checkData(eventData)) {
                    CreateUserRow(tableCell, eventData);
                    break;
                }
            }

            if (tableCell.Rows.Count == 0) {
                CreateEmptyRow(tableCell, _Consts.Reports.TestsReport.NumberOfUserColumns);
            }
        }

        // Столбец "Даты".
        [RPCustomColumn]
        public void DatesColumn(RPTableCell tableCell)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            RowData data = (RowData)tableCell.TableRow.DataRow;

            RPRow row = tableCell.CreateRow();
            
            // Утверждение НРД.
            RPCell nrdAffirmationDateCell = row.CreateCell();
            // Дата создания карточки теста.
            RPCell testCardCreationDateCell = row.CreateCell();
            testCardCreationDateCell.SetValue(data.Item.TimeCreated, RPCellFormatType.DateTime);
            // Дата разработки содержания теста.
            RPCell testContentDevelopmentDateCell = row.CreateCell();
            // Дата согласования теста.
            RPCell testAgreementDateCell = row.CreateCell();
            // Дата подписание теста.
            RPCell testSigningDateCell = row.CreateCell();
            // Дата создания курса/теста.
            RPCell testCreationDateCell = row.CreateCell();

            foreach (SolutionEventData eventData in data.SolutionEventDataCollection) {
                switch (eventData.SolutionName) {
                    case _Consts.Lists.Tests.Solutions.Sign:
                        if (nrdAffirmationDateCell.CellValue.ToString() == "") {
                            nrdAffirmationDateCell.SetValue(eventData.SolutionDate, RPCellFormatType.DateTime);
                        }
                        if (testSigningDateCell.CellValue.ToString() == "") {
                            testSigningDateCell.SetValue(eventData.SolutionDate, RPCellFormatType.DateTime);
                        }
                        break;
                    case _Consts.Lists.Tests.Solutions.SendToAgreement:
                        if (testContentDevelopmentDateCell.CellValue.ToString() == "") {
                            testContentDevelopmentDateCell.SetValue(eventData.SolutionDate, RPCellFormatType.DateTime);
                        }
                        break;
                    case _Consts.Lists.Tests.Solutions.Agree:
                        if (testAgreementDateCell.CellValue.ToString() == "") {
                            testAgreementDateCell.SetValue(eventData.SolutionDate, RPCellFormatType.DateTime);
                        }
                        break;
                    case _Consts.Lists.Tests.Solutions.Executed:
                        if (testCreationDateCell.CellValue.ToString() == "") {
                            testCreationDateCell.SetValue(eventData.SolutionDate, RPCellFormatType.DateTime);
                        }
                        break;
                }
            }
        }

        // Столбец "Распространение и вид ознакомления".
        [RPCustomColumn]
        public void DistributionColumn(RPTableCell tableCell)
        {
            if (tableCell == null) throw new ArgumentNullException("tableCell");
            RowData data = (RowData)tableCell.TableRow.DataRow;

            DBItem item = data.Item;
            // Получаем карточку НРД.
            DBItem nrdCard = item.GetLookupItem(_Consts.Lists.Tests.Fields.LinkToNRDCard);
            if (nrdCard == null) {
                CreateEmptyRow(tableCell, _Consts.Reports.TestsReport.NumberOfDistributionColumns);
                // Устанавливем в первые две ячейки ряда значения полей "Вид назначения" и "Вид распространения"
                tableCell.Rows[0].Cells[0].SetValue(item.GetStringValue(_Consts.Reports.TestsReport.AssignmentType), RPCellFormatType.Text);
                tableCell.Rows[0].Cells[1].SetValue(item.GetStringValue(_Consts.Reports.TestsReport.DistributionType), RPCellFormatType.Text);
                return;
            }

            TIFDocument tableDocument = nrdCard.TIFDocument(_Consts.Reports.TestsReport.NRDAssignment);
            IList<TIFRow> tableRows = tableDocument.Rows;

            if (tableRows.Count == 0) {
                CreateEmptyRow(tableCell, _Consts.Reports.TestsReport.NumberOfDistributionColumns);
                // Устанавливем в первые две ячейки ряда значения полей "Вид назначения" и "Вид распространения"
                tableCell.Rows[0].Cells[0].SetValue(item.GetStringValue(_Consts.Reports.TestsReport.AssignmentType), RPCellFormatType.Text);
                tableCell.Rows[0].Cells[1].SetValue(item.GetStringValue(_Consts.Reports.TestsReport.DistributionType), RPCellFormatType.Text);
                return;
            }

            foreach (TIFRow tifRow in tableRows) {
                RPRow row = tableCell.CreateRow();
                // Для первого ряда создаем две ячейки с RowSpan, равным количеству рядов в табличном элементе. 
                if (tableCell.Rows.Count == 1) {
                    // Ячейка "Вид назначения".
                    RPCell assignmentTypeCell = row.CreateCell(tableRows.Count);
                    assignmentTypeCell.SetValue(item.GetStringValue(_Consts.Reports.TestsReport.AssignmentType), RPCellFormatType.Text);
                    // Ячейка "Вид распространения".
                    RPCell distributionTypeCell = row.CreateCell(tableRows.Count);
                    distributionTypeCell.SetValue(item.GetStringValue(_Consts.Reports.TestsReport.DistributionType), RPCellFormatType.Text);
                }
                RPCell firstLevelFunctionCell = row.CreateCell();
                RPCell secondLevelFunctionCell = row.CreateCell();
                RPCell thirdLevelFunctionCell = row.CreateCell();
                RPCell fourthLevelFunctionCell = row.CreateCell();
                RPCell actionsCell = row.CreateCell();
                RPCell beCell = row.CreateCell();
                RPCell departmentCell = row.CreateCell();
                RPCell employeeCategoryCell = row.CreateCell();

                // Вставляем значения ячеек ряда табличного элемента в соответствующие ячейки ряда таблицы отчета.
                foreach (TIFCell tifCell in tifRow.Cells) {
                    switch (tifCell.ColumnName) {
                        case _Consts.Reports.TestsReport.FirstLevelFunction:
                            firstLevelFunctionCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.SecondLevelFunction:
                            secondLevelFunctionCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.ThirdLevelFunction:
                            thirdLevelFunctionCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.FourthLevelFunction:
                            fourthLevelFunctionCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.Action:
                            actionsCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.BE:
                            beCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.Department:
                            departmentCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        case _Consts.Reports.TestsReport.EmployeeCategory:
                            employeeCategoryCell.SetValue(tifCell.GetStringValue(), RPCellFormatType.Text);
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        /// <summary>
        /// Создает и заполняет ряд для пользователя, сделавшего решение.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы.</param>
        /// <param name="eventData">Данные по решению.</param>
        private static void CreateUserRow(RPTableCell tableCell, SolutionEventData eventData)
        {
            RPRow row = tableCell.CreateRow();
            // ФИО.
            RPCell cell = row.CreateCell();
            cell.SetValue(eventData.UserName, RPCellFormatType.Text);
            // Табельный номер.
            cell = row.CreateCell();
            cell.SetValue(eventData.PersonnelNumber, RPCellFormatType.Text);
            // Должность.
            cell = row.CreateCell();
            cell.SetValue(eventData.Position, RPCellFormatType.Text);
            // Орг. единица.
            cell = row.CreateCell();
            cell.SetValue(eventData.Department, RPCellFormatType.Text);
            // Юр. лицо.
            cell = row.CreateCell();
            cell.SetValue(eventData.Company, RPCellFormatType.Text);
        }

        /// <summary>
        /// Создает и заполняет ряд для пользователя из карточки пользователя.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы.</param>
        /// <param name="userItem">Данные по решению.</param>
        private static void CreateUserRow(RPTableCell tableCell, DBItem userItem)
        {
            RPRow row = tableCell.CreateRow();
            // ФИО.
            RPCell cell = row.CreateCell();
            cell.SetValue(userItem.GetStringValue(_Consts.Reports.TestsReport.UserName), RPCellFormatType.Text);
            // Табельный номер.
            cell = row.CreateCell();
            cell.SetValue(userItem.GetStringValue(_Consts.Reports.TestsReport.PersonnelNumber), RPCellFormatType.Text);
            // Должность.
            cell = row.CreateCell();
            cell.SetValue(userItem.GetStringValue(_Consts.Reports.TestsReport.Position), RPCellFormatType.Text);
            // Орг. единица.
            cell = row.CreateCell();
            cell.SetValue(userItem.GetStringValue(_Consts.Reports.TestsReport.Department), RPCellFormatType.Text);
            // Юр. лицо.
            cell = row.CreateCell();
            cell.SetValue(userItem.GetStringValue(_Consts.Reports.TestsReport.Company), RPCellFormatType.Text);
        }

        /// <summary>
        /// Создает пустой ряд с заданным количеством ячеек.
        /// </summary>
        /// <param name="tableCell">Ячейка таблицы.</param>
        /// <param name="numberOfCells">Количество ячеек в ряду.</param>
        private static void CreateEmptyRow(RPTableCell tableCell, int numberOfCells)
        {
            RPRow row = tableCell.CreateRow();
            for (int i = 0; i < numberOfCells; i++) {
                RPCell cell = row.CreateCell();
            }
        }

        private bool __init_SolutionsHistoryAdapter;
        private DBObjectAdapter<SolutionsHistory> _SolutionsHistoryAdapter;
        /// <summary>
        /// Адаптер истории решений.
        /// </summary>
        private DBObjectAdapter<SolutionsHistory> SolutionsHistoryAdapter
        {
            get {
                if (!__init_SolutionsHistoryAdapter) {
                    _SolutionsHistoryAdapter = new DBObjectAdapter<SolutionsHistory>(this.Site.SiteConnectionString);
                    __init_SolutionsHistoryAdapter = true;
                }
                return _SolutionsHistoryAdapter;
            }
        }

        /// <summary>
        /// Возвращает кастомные строки для построения отчёта.
        /// </summary>
        /// <returns>Кастомные строки для построения отчёта.</returns>
        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            if (this.Items == null || this.Items.Count == 0)
                return null;

            return this.Items.Select(item =>
                new RowData(
                    item,
                    this.SolutionsHistoryAdapter,
                    this.Site.Users)).Cast<IRPDataRow>();
        }
    }
}
