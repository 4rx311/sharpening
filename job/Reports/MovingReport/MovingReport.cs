using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.TableSection;
using WSSC.V4.SYS.Lib.DBObjects;
using Consts = WSSC.V4.DMS.OMK._Consts.Reports.MovingReport;

namespace WSSC.V4.DMS.OMK.Reports.MovingReport
{
    /// <summary>
    /// Класс построения отчетов перемещения
    /// </summary>
    class MovingReport : RPCustomBuilder
    {
        public MovingReport(RPTableBuilder builder) : base(builder) { }

        private readonly Dictionary<DBWeb, DMSContext> Contexts = new Dictionary<DBWeb,DMSContext>();
        private readonly Dictionary<DBItem, DMSLogic> Logics = new Dictionary<DBItem,DMSLogic>();
        //private readonly Dictionary<DBItem, List<SolutionsHistory>> Solutions = new Dictionary<DBItem, List<SolutionsHistory>>();

        private bool _init_Solutions = false;
        private Dictionary<DBItem, List<SolutionsHistory>> _Solutions;
        private Dictionary<DBItem, List<SolutionsHistory>> Solutions
        {
            get
            {
                if (!_init_Solutions)
                {
                    _Solutions = new Dictionary<DBItem,List<SolutionsHistory>>();

                    List<DBItem> items = this.PublishingQuery.ResultItems;

                    if (items.FirstOrDefault() == null)
                        throw new Exception("Отсутствуют элементы");

                    int listID = items.First().List.ID;

                    if (!items.All(x => x.List.ID == listID))
                        throw new Exception("Выбраны элементы из разных списков");

                    DBObjectAdapter<SolutionsHistory> solutionsAdapter = new DBObjectAdapter<SolutionsHistory>(this.Site.SiteConnectionString);
                    string[] itemIDs = items.Select(x => x.ID.ToString()).ToArray();
                    List<SolutionsHistory> solutions = solutionsAdapter.GetObjects(string.Format("[ListID] = {0} AND [ItemID] IN ({1})", listID, string.Join(",", itemIDs)));

                    foreach (DBItem item in items)
                    {
                        IEnumerable<SolutionsHistory> itemSolutions = solutions.Where(x => x.ItemID == item.ID);

                        if (itemSolutions == null || !itemSolutions.Any())
                        {
                            _Solutions.Add(item, new List<SolutionsHistory>());
                            continue;
                        }

                        _Solutions.Add(item, itemSolutions.ToList());
                    } 
                   
                    _init_Solutions = true;
                }
                return _Solutions;
            }
        }
        
        /// <summary>
        /// Заполнение столбца "Наименование ТМЦ"
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void MovedTMC(RPTableCell tableCell)
        {
            RPRow row = tableCell.CreateRow();
            RPCell cell = row.CreateCell();

            DBItem currentItem = tableCell.TableRow.Item;

            TSField tmcField = currentItem.List.GetField<TSField>(Consts.Fields.TMCField.FieldName, true);

            TSRowCollection tmcRows = tmcField.GetTableSectionValue(currentItem);
            
            if (tmcRows == null || tmcRows.Count == 0)
                return;

            StringBuilder cellText = new StringBuilder();

            string emDash = " " + (char)0x2014 + " ";

            foreach (TSRow tmcRow in tmcRows)
            {
                string name = tmcRow.GetValue(Consts.Fields.TMCField.NameColumnName);
                string count = tmcRow.GetValue(Consts.Fields.TMCField.CountColumnName);

                if (string.IsNullOrEmpty(name))
                    continue;

                cellText.Append(name + emDash);

                if (string.IsNullOrEmpty(count))
                    count = "0";

                cellText.Append(count + " шт.\r\n");                    
            }

            cell.SetValue(cellText.ToString(), RPCellFormatType.Text);
        }

        /// <summary>
        /// Построение шапки столбцов по операциям, выполненным участниками процесса для внутризаводского перемещения
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomHeader]
        public void IntraFactoryMovementHeader(RPTableCell tableCell)
        {
            string topLevelText = Consts.TopLevelHeaderText;

            List<string> midLevelTexts = new List<string>() { Consts.Stages.Preparation, Consts.Stages.Agreement, Consts.Stages.KPP_OUT, Consts.Stages.KPP_IN, Consts.Stages.OOPRAnalysis };
            List<string> lowLevelTexts = new List<string>() { Consts.Roles.InitiatorColumn, Consts.Roles.Agreer, Consts.Roles.Guard, Consts.Roles.Guard, Consts.Roles.OOPR };

            this.FillCustomHeader(tableCell, topLevelText, midLevelTexts, lowLevelTexts);
        }

        /// <summary>
        /// Построение шапки столбцов по операциям, выполненным участниками процесса для перемещения ТМЦ, принадлежащих сторонней организации и перемещения ТМЦ по форме 4
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomHeader]
        public void ThirdPartyMovementHeader(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            string topLevelText = Consts.TopLevelHeaderText;

            List<string> midLevelTexts = new List<string>() { Consts.Stages.Preparation, Consts.Stages.Agreement, Consts.Stages.Execution, Consts.Stages.DeliveryConfirmation, Consts.Stages.OOPRAnalysis };
            List<string> lowLevelTexts = new List<string>() { Consts.Roles.InitiatorColumn, Consts.Roles.Agreer, Consts.Roles.Guard, Consts.Roles.Receiver, Consts.Roles.OOPR };

            this.FillCustomHeader(tableCell, topLevelText, midLevelTexts, lowLevelTexts);
        }

        /// <summary>
        /// Построение шапки столбцов по операциям, выполненным участниками процесса для перемещения ТМЦ по форме 6
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomHeader]
        public void Form6MovementHeader(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            string topLevelText = Consts.TopLevelHeaderText;

            List<string> midLevelTexts = new List<string>() { Consts.Stages.Preparation, Consts.Stages.Agreement, Consts.Stages.MovingIn, Consts.Stages.Loading, Consts.Stages.MovingOut, Consts.Stages.OOPRAnalysis };
            List<string> lowLevelTexts = new List<string>() { Consts.Roles.InitiatorColumn, Consts.Roles.Agreer, Consts.Roles.Guard, Consts.Roles.MOL, Consts.Roles.Guard, Consts.Roles.OOPR };

            this.FillCustomHeader(tableCell, topLevelText, midLevelTexts, lowLevelTexts);
        }

        /// <summary>
        /// Заполнение ячеек столбцов операций, выполненных участниками процесса для перемещения ТМЦ внутри завода
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void IntraFactoryMovement(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            DBItem currentItem = tableCell.TableRow.Item;

            if (currentItem == null)
                throw new Exception("Ошибка получения элемента, отображаемого в строке таблицы");

            OrderedDictionary rolesOnStages = new OrderedDictionary();

            rolesOnStages.Add(Consts.Stages.Preparation, Consts.Roles.Initiator);
            rolesOnStages.Add(Consts.Stages.Agreement, Consts.Roles.Agreer);
            rolesOnStages.Add(Consts.Stages.KPP_OUT, Consts.Roles.Guard);
            rolesOnStages.Add(Consts.Stages.KPP_IN, Consts.Roles.Guard);
            rolesOnStages.Add(Consts.Stages.OOPRAnalysis, Consts.Roles.OOPR);

            IEnumerable<SolutionsHistory> solutions = this.GetSolutionsForProcess(currentItem, rolesOnStages);

            List<string> cellTexts = this.GetCellTexts(solutions);

            this.FillCells(tableCell, cellTexts);
        }

        /// <summary>
        /// Заполнение ячеек столбцов операций, выполненных участниками процесса для перемещения ТМЦ, принадлежащих сторонней организации и перемещения ТМЦ по форме 4
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void ThirdPartyMovement(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            DBItem currentItem = tableCell.TableRow.Item;

            if (currentItem == null)
                throw new Exception("Ошибка получения элемента, отображаемого в строке таблицы");

            OrderedDictionary rolesOnStages = new OrderedDictionary();

            rolesOnStages.Add(Consts.Stages.Preparation, Consts.Roles.Initiator);
            rolesOnStages.Add(Consts.Stages.Agreement, Consts.Roles.Agreer);
            rolesOnStages.Add(Consts.Stages.Execution, Consts.Roles.Guard);
            rolesOnStages.Add(Consts.Stages.DeliveryConfirmation, Consts.Roles.Receiver);
            rolesOnStages.Add(Consts.Stages.OOPRAnalysis, Consts.Roles.OOPR);

            List<SolutionsHistory> solutions = this.GetSolutionsForProcess(currentItem, rolesOnStages, true).ToList();

            List<string> cellTexts = this.GetCellTexts(solutions);

            this.FillCells(tableCell, cellTexts);
        }

        /// <summary>
        /// Заполнение ячеек столбцов операций, выполненных участниками процесса для перемещения ТМЦ по форме 6
        /// </summary>
        /// <param name="tableCell"></param>
        [RPCustomColumn]
        public void Form6Movement(RPTableCell tableCell)
        {
            if (tableCell == null)
                throw new ArgumentNullException("tableCell");

            DBItem currentItem = tableCell.TableRow.Item;

            if (currentItem == null)
                throw new Exception("Ошибка получения элемента, отображаемого в строке таблицы");

            OrderedDictionary rolesOnStages = new OrderedDictionary();

            rolesOnStages.Add(Consts.Stages.Preparation, Consts.Roles.Initiator);
            rolesOnStages.Add(Consts.Stages.Agreement, Consts.Roles.Agreer);
            rolesOnStages.Add(Consts.Stages.MovingIn, Consts.Roles.Guard);
            rolesOnStages.Add(Consts.Stages.Loading, Consts.Roles.MOL);
            rolesOnStages.Add(Consts.Stages.MovingOut, Consts.Roles.Guard);
            rolesOnStages.Add(Consts.Stages.OOPRAnalysis, Consts.Roles.OOPR);

            IEnumerable<SolutionsHistory> solutions = this.GetSolutionsForProcess(currentItem, rolesOnStages);

            List<string> cellTexts = this.GetCellTexts(solutions);

            this.FillCells(tableCell, cellTexts);
        }

        private void FillCustomHeader (RPTableCell originalCell, string topLevelText, IEnumerable<string> midLevelTexts, IEnumerable<string> lowLevelTexts)
        {
            if (originalCell == null)
                throw new ArgumentNullException("originalCell");

            if (string.IsNullOrEmpty(topLevelText))
                throw new ArgumentNullException("topLevelText");

            if (midLevelTexts == null || !midLevelTexts.Any())
                throw new ArgumentNullException("midLevelTexts");

            if (lowLevelTexts == null || !lowLevelTexts.Any())
                throw new ArgumentNullException("lowLevelTexts");

            RPRow topHeaderRow = originalCell.CreateRow();

            int colSpan = midLevelTexts.Count();
            RPCell topHeaderCell = topHeaderRow.CreateCell(colSpan: colSpan);
            topHeaderCell.SetValue(topLevelText, RPCellFormatType.Text);


            RPRow midHeaderRow = originalCell.CreateRow();

            foreach (string text in midLevelTexts)
            {
                RPCell cell = midHeaderRow.CreateCell();
                cell.SetValue(text, RPCellFormatType.Text);
            }

            RPRow lowHeaderRow = originalCell.CreateRow();

            foreach (string text in lowLevelTexts)
            {
                RPCell cell = lowHeaderRow.CreateCell();
                cell.SetValue(text, RPCellFormatType.Text);
            }
        }

        private void FillCells (RPTableCell originalCell, IEnumerable<string> texts)
        {
            if (originalCell == null)
                throw new ArgumentNullException("originalCell");

            if (texts == null)
                throw new ArgumentNullException("texts");

            RPRow row = originalCell.CreateRow();

            foreach (string text in texts)
            {
                RPCell cell = row.CreateCell();
                cell.SetValue(text, RPCellFormatType.Text);
            }
        }

        private IEnumerable<SolutionsHistory> GetSolutionsForProcess (DBItem item, OrderedDictionary rolesOnStages, bool doubleRole = false)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            if (rolesOnStages == null)
                throw new ArgumentNullException("rolesOnStages");

            if (rolesOnStages.Count == 0)
                throw new Exception("Коллекция ролей на этапах rolesOnStages не может быть пустой");

            List<SolutionsHistory> returnList = new List<SolutionsHistory>();

            foreach (DictionaryEntry dicEntry in rolesOnStages)
            {
                string roleName = (string)dicEntry.Value;
                string stageName = (string)dicEntry.Key;

                SolutionsHistory solution = this.GetSolutionInfo(item, roleName, stageName);

                if (doubleRole && solution == null && roleName == Consts.Roles.Receiver && stageName == Consts.Stages.DeliveryConfirmation)
                {
                    solution = this.GetSolutionInfo(item, Consts.Roles.Initiator, stageName);
                }

                returnList.Add(solution);
            }

            return returnList;
        }

        private SolutionsHistory GetSolutionInfo (DBItem item, string roleName, string stageName)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            if (string.IsNullOrEmpty(roleName))
                throw new ArgumentNullException("roleName");

            if (!this.Contexts.ContainsKey(item.List.Web))
            {
               this.Contexts.Add(item.List.Web, new DMSContext(item.List.Web));
            }

            DMSContext context = this.Contexts[item.List.Web];

            if (context == null)
                throw new Exception("Невозможно получить контекст для узла " + item.List.Web.Title);

            if (!this.Logics.ContainsKey(item))
            {
                DMSDocument doc = new DMSDocument(context, item);
                
                if (doc == null)
                    throw new Exception("Невозможно получить информацию документа для элемента " + item.ID + " списка " + item.List.Name);

                this.Logics.Add(item, new DMSLogic(doc));
            }

            DMSLogic logic = this.Logics[item];

            if (logic == null)
                throw new Exception("Ошибка получения DMSLogic элемента " + item.ID + " списка " + item.List.Name);

            DMSStage stage = logic.StageAdapter.GetObjectByField("Name", stageName);

            if (stage == null)
                return null;//throw new Exception(string.Format("Отсутствует этап \"{0}\" в настройке процесса \"{1}\"", stageName, logic.Process.SettingName));

            DMSRole roleOnStage = logic.RoleAdapter.GetObjectByField("Name", roleName);

            if (roleOnStage == null)
                return null; //throw new Exception(string.Format("Отсутствует роль \"{0}\" на этапе \"{1}\".", roleName, stageName));

            List<SolutionsHistory> solutions = this.Solutions[item];

            if (solutions == null || solutions.Count == 0)
                return null;

            IEnumerable<SolutionsHistory> solutionsByKeyUsers =
                solutions.Where(x => x.Roles.Contains(roleName) && x.OldStageID == stage.ID && !x.IsSystem);

            if (solutionsByKeyUsers != null && solutionsByKeyUsers.Any())
            {
                return solutionsByKeyUsers.OrderByDescending(x => x.Date).First();
            }

            return null;
        }

        private List<string> GetCellTexts (IEnumerable<SolutionsHistory> solutions)
        {
            if (solutions == null)
                throw new ArgumentNullException("solutions");

            List<string> cellsText = new List<string>();

            foreach (SolutionsHistory solution in solutions)
            {
                if (solution == null)
                    cellsText.Add(string.Empty);
                else
                    cellsText.Add(this.GetCellText(solution));                
            }

            return cellsText;
        }

        private string GetCellText (SolutionsHistory solution)
        {
            if (solution == null)
                throw new ArgumentNullException("solution");

            DBUser user = this.Site.GetUser(solution.UserID);

            if (user == null)
                throw new Exception("Отсутствует пользователь с ID = " + solution.UserID);

            StringBuilder cellText = new StringBuilder();

            string userOccupation = user.UserItem.GetStringValue(Consts.Fields.Occupation);

            if (!string.IsNullOrEmpty(userOccupation))
                cellText.AppendLine(userOccupation);

            cellText.AppendLine(user.Name);
            cellText.AppendLine(solution.SolutionDisplayName);
            cellText.AppendLine(solution.Date.ToString("dd/MM/yyyy HH:mm:ss"));

            return cellText.ToString();
        }
    }
}
