using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.UI;
using System.Xml;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Files;
using WSSC.V4.SYS.Lib.Logging;
using WSSC.V4.SYS.Lib.SPXObjects;

namespace WSSC.V4.DMS.OMK.Reports.VoteSheet
{
    /// <summary>
    /// Кастомный лист голосования.
    /// </summary>
    public class VoteTableBuilder
    {
        /// <summary>
        /// ctor.
        /// </summary>
        public VoteTableBuilder()
        {
        }

        /*
         * Добавлен один метод из РД1.
         * Добавлена обработка блоков с определенным названием.
         * Остальное - коробка.
         */

        /// <summary>
        /// Получает HTML разметку кастомного листа согласования
        /// </summary>
        /// <param name="context">Контекст запроса</param>
        /// <param name="item">Карточка</param>
        /// <param name="settingItem">Настроечная карточка</param>
        public string GetCustomAgreementTableHtml(DBContext context, DBItem item, DBItem settingItem)
        {
            this.Item = item;
            this.WebContext = context;

            ReportRowInfo reportRowInfo = this.AgreementTableHeaderRow();
            return this.DrawWFContent();
        }

        private DBContext _WebContext;
        public DBContext WebContext
        {
            get { return _WebContext ?? (_WebContext = this.Item.Site.Context); }

            set
            {
                _WebContext = value;
            }
        }

        private Page _Page;
        public Page Page
        {
            get { return _Page ?? (_Page = this.WebContext.Page); }
            set
            {
                _Page = value;
            }
        }

        public DBWeb ItemWeb { get { return this.Item.Web; } }

        public DBList ItemList { get { return this.Item.List; } }

        private bool __init_EdmsWebUrl;
        private string _EdmsWebUrl;
        /// <summary>
        /// Адрес узла общих настроек процесса
        /// </summary>
        public string EdmsWebUrl
        {
            get
            {
                if (!__init_EdmsWebUrl)
                {
                    _EdmsWebUrl = this.LinkParams["edmsWebUrl"];
                    __init_EdmsWebUrl = true;
                }
                return _EdmsWebUrl;
            }
        }

        private bool __init_ShowFactUserPosition;
        private bool _ShowFactUserPosition;
        public bool ShowFactUserPosition
        {
            get
            {
                if (!__init_ShowFactUserPosition)
                {
                    if (this.WebContext != null)
                    {
                        string value = this.LinkParams["ShowFactUserPosition"];
                        _ShowFactUserPosition = !string.IsNullOrEmpty(value) && value.ToLower() == "true";
                    }
                    __init_ShowFactUserPosition = true;
                }
                return _ShowFactUserPosition;
            }
        }

        private bool __init_FactUserInBrackets;
        private bool _FactUserInBrackets;
        public bool FactUserInBrackets
        {
            get
            {
                if (!__init_FactUserInBrackets)
                {
                    string value = this.LinkParams["FactUserInBrackets"];
                    _FactUserInBrackets = !string.IsNullOrEmpty(value) && value.ToLower() == "true";

                    __init_FactUserInBrackets = true;
                }
                return _FactUserInBrackets;
            }
        }

        private DBItem _Item;
        public DBItem Item
        {
            get
            {
                if (_Item == null) throw new Exception("Не удалось найти документ.");
                return _Item;
            }
            set
            {
                _Item = value;
            }
        }

        public DBSite Site { get { return this.Item.Site; } }

        #region Props

        private DMSContext _DMSContext;
        public DMSContext DMSContext
        {
            get { return _DMSContext ?? (_DMSContext = new DMSContext(this.Item.Web.Url)); }
        }

        private DMSDocument _DMSDocument;
        public DMSDocument DMSDocument
        {
            get { return _DMSDocument ?? (_DMSDocument = new DMSDocument(this.DMSContext, this.Item)); }
        }

        private DMSLogic _DMSLogic;
        public DMSLogic DMSLogic
        {
            get { return _DMSLogic ?? (_DMSLogic = new DMSLogic(this.DMSDocument)); }
        }

        private DBWeb _EDMSWeb;
        /// <summary>
        /// Узел настроек отчетов
        /// </summary>
        public DBWeb EDMSWeb
        {
            get
            {
                if (_EDMSWeb == null)
                {
                    //если задан адрес узла edms явно в параметрах ссылки
                    //то получаем узел EDMS по этому адрему
                    //иначе получение узла EDMS осующествляется по логике процесса документа
                    if (string.IsNullOrEmpty(this.EdmsWebUrl))
                    {
                        if (this.DMSLogic != null && this.DMSLogic.Process != null
                            && this.DMSLogic.Process.EDMSWeb != null)
                            _EDMSWeb = this.DMSLogic.Process.EDMSWeb;

                        if (_EDMSWeb == null)
                            throw new Exception("Для документа не удалось найти узел СЭД.");
                    }
                    else
                    {
                        _EDMSWeb = this.Site.GetWeb(this.EdmsWebUrl);
                        if (_EDMSWeb == null)
                            throw new DBException.MissingWeb(this.Site, this.EdmsWebUrl);
                    }
                }
                return _EDMSWeb;
            }
        }

        /// <summary>
        /// Список сотрудников
        /// </summary>
        public DBList Users { get { return this.Item.Site.UsersList; } }

        private Log _Log;
        public Log Log
        {
            get { return _Log ?? (_Log = new Log("Reports", "WSSC.V4.DMS.Reports.AgreementSheet", this.Site)); }
        }

        private bool __init_AssemblyName;
        private string _AssemblyName;
        public string AssemblyName
        {
            get
            {
                if (!__init_AssemblyName)
                {
                    __init_AssemblyName = true;
                    if (this.SettingItem != null && this.SettingsList.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.AgreementTableAssembly))
                        _AssemblyName = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.AgreementTableAssembly);
                }
                return _AssemblyName;
            }
        }

        private bool __init_ClassName;
        private string _ClassName;
        public string ClassName
        {
            get
            {
                if (!__init_ClassName)
                {
                    __init_ClassName = true;
                    if (this.SettingItem != null && this.SettingsList.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.AgreementTableClass))
                        _ClassName = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.AgreementTableClass);
                }
                return _ClassName;
            }
        }

        private bool __init_BoundDocumentsAssemblyName;
        private string _BoundDocumentsAssemblyName;
        public string BoundDocumentsAssemblyName
        {
            get
            {
                if (!__init_BoundDocumentsAssemblyName)
                {
                    try
                    {
                        if (this.SettingItem != null && this.SettingsList.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.BoundDocumentsAssembly))
                            _BoundDocumentsAssemblyName = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.BoundDocumentsAssembly);
                    }
                    catch (Exception ex)
                    {
                        Log.WriteError(ex.Message, "WSSC.V4.DMS.Reports", this.Site);
                    }
                    __init_BoundDocumentsAssemblyName = true;
                }
                return _BoundDocumentsAssemblyName;
            }
        }

        private bool __init_BoundDocumentsClassName;
        private string _BoundDocumentsClassName;
        public string BoundDocumentsClassName
        {
            get
            {
                if (!__init_BoundDocumentsClassName)
                {
                    __init_BoundDocumentsClassName = true;
                    if (this.SettingItem != null && this.SettingsList.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.BoundDocumentsClass))
                        _BoundDocumentsClassName = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.BoundDocumentsClass);
                }
                return _BoundDocumentsClassName;
            }
        }

        private bool __init_ReportHelper;
        private ReportHelper _ReportHelper;
        /// <summary>
        /// Шаблонизатор отчетов
        /// </summary>
        public ReportHelper ReportHelper
        {
            get
            {
                if (!__init_ReportHelper)
                {
                    __init_ReportHelper = true;
                    _ReportHelper = new ReportHelper(this.WebContext, _currentUser);
                }
                return _ReportHelper;
            }
        }

        private bool __init_RenderToFile;
        private bool _RenderToFile;
        /// <summary>
        /// Генерировать файл отчета
        /// </summary>
        public bool RenderToFile
        {
            get
            {
                if (!__init_RenderToFile)
                {
                    string value = this.LinkParams["renderToFile"];
                    _RenderToFile = !string.IsNullOrEmpty(value) && value.ToLower() == "true";

                    __init_RenderToFile = true;
                }
                return _RenderToFile;
            }
        }

        private bool __init_ShowSignFilesLinks;
        private ShowSignFilesLinks _ShowSignFilesLinks;
        /// <summary>
        /// Признак: показывать ли ссылки на согласованные версии файлов
        /// </summary>
        public ShowSignFilesLinks ShowSignFilesLinks
        {
            get
            {
                if (!__init_ShowSignFilesLinks)
                {
                    _ShowSignFilesLinks = ShowSignFilesLinks.InvalidValue;
                    string showSignFilesLinksValue = this.LinkParams["ShowSignFilesLinks"];

                    if (string.IsNullOrEmpty(showSignFilesLinksValue))
                    {
                        _ShowSignFilesLinks = ShowSignFilesLinks.None;
                    }
                    else
                    {
                        showSignFilesLinksValue = showSignFilesLinksValue.ToLower();

                        if (showSignFilesLinksValue == "filename")
                        {
                            _ShowSignFilesLinks = ShowSignFilesLinks.FileName;
                        }
                        if (showSignFilesLinksValue == "onlyindex")
                        {
                            _ShowSignFilesLinks = ShowSignFilesLinks.OnlyIndex;
                        }
                    }
                    if (_ShowSignFilesLinks == ShowSignFilesLinks.InvalidValue)
                        throw new Exception("Параметр адресной строки 'ShowSignFilesLinks' должен иметь значение 'FileName' или 'OnlyIndex'");

                    __init_ShowSignFilesLinks = true;
                }
                return _ShowSignFilesLinks;
            }
            set
            {
                _ShowSignFilesLinks = value;
                __init_ShowSignFilesLinks = true;
            }
        }

        public ReportRowInfo DefaultAgreementTableHeaderRow
        {
            get
            {
                Dictionary<string, string> columnProperties = new Dictionary<string, string>();
                Dictionary<string, string> columnValues = new Dictionary<string, string>();

                columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.Agreementers, "width='231' valign='center' class='headerFirst head0'");
                columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.Agreementers, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.Agreementers));

                columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.FIO, "width='115' valign='center' class='headerOther head1'");
                columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.FIO, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.FIO));

                columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.StartDate, " width='85' valign='center' class='headerOther head2'");
                columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.StartDate, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.StartDate));

                columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.AgreementDate, "width='100' valign='center' class='headerOther head3'");
                columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.AgreementDate, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.AgreementDate));

                columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.AgreementResult, "width='107' valign='center' class='headerOther head4'");
                columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.AgreementResult, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.AgreementResult));

                columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.Comments, "width='107' valign='center' class='headerOther head5'");
                columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.Comments, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.Comments));

                if (this.ShowSignFilesLinks != ShowSignFilesLinks.None)
                {
                    columnProperties.Add(_ReportConsts.Reports.AgreementSheet.Columns.FileVersion, "width='107' valign='center' class='headerOther head6'");
                    columnValues.Add(_ReportConsts.Reports.AgreementSheet.Columns.FileVersion, this.Site.Translator.Translate(_ReportConsts.Reports.AgreementSheet.Columns.FileVersion));
                }

                return new ReportRowInfo(columnProperties, columnValues);
            }
        }

        private DBField _FaximileField;
        public DBField FaximileField
        {
            get
            {
                if (_FaximileField == null)
                {
                    string fieldName = this.Site.ConfigParams.GetStringValue(_ReportConsts.ConfigSettingsKeys.Faximile.FaximileFeild_ConstName);
                    if (!string.IsNullOrEmpty(fieldName))
                        _FaximileField = this.Site.UsersList.GetField(fieldName);
                }
                return _FaximileField;
            }
        }

        private bool _initShowFIO_InMatrixOnRoles;
        private bool _ShowFIO_InMatrixOnRoles;
        /// <summary>
        /// Простановка первого согласующего для роли (матрица согласования наролях)
        /// </summary>
        public bool ShowFIO_InMatrixOnRoles
        {
            get
            {
                if (!_initShowFIO_InMatrixOnRoles)
                {
                    _initShowFIO_InMatrixOnRoles = true;
                    _ShowFIO_InMatrixOnRoles = this.DMSContext.ConfigSettings.GetFlagValue(Consts.DMSMatrix.MatrixOnRoles_ShowFIOKey);
                }
                return _ShowFIO_InMatrixOnRoles;
            }
        }

        private bool _initShowAllFIO_InMatrixOnRoles;
        private bool _ShowAllFIO_InMatrixOnRoles;
        /// <summary>
        /// Простановка всех согласующего для роли (матрица согласования наролях)
        /// </summary>
        public bool ShowAllFIO_InMatrixOnRoles
        {
            get
            {
                if (!_initShowAllFIO_InMatrixOnRoles)
                {
                    _initShowAllFIO_InMatrixOnRoles = true;
                    _ShowAllFIO_InMatrixOnRoles = this.DMSContext.ConfigSettings.GetFlagValue(Consts.DMSMatrix.MatrixOnRoles_ShowAllFIOKey);
                }
                return _ShowAllFIO_InMatrixOnRoles;
            }
        }

        private NameValueCollection _LinkParams;
        /// <summary>
        /// Параметры ссылки из системной константы "ListForms_Links"
        /// </summary>
        private NameValueCollection LinkParams
        {
            get
            {
                if (_LinkParams == null)
                {
                    string linkParamStr = this.WebContext.GetRequestValue<string>("settingName");
                    if (!string.IsNullOrEmpty(linkParamStr))
                    {
                        _LinkParams = new NameValueCollection();
                        //Если отчет запустили из ссылке на карточке, то берем параметры из Request'a
                        foreach (string name in this.Page.Request.Params.AllKeys)
                            _LinkParams.Add(name, this.Page.Request.Params[name]);
                    }
                    else
                    {
                        //Если отчет запустли по ок, для выгрузки в Word, то берем параметры из системной константы в ручную
                        XmlDocument listFormsLinks = this.Site.ConfigParams.GetXmlDocument(DMS.Controls._Consts.DocumentForm.DocLinks.DocLinksSettingName);
                        XmlElement linkElement = (XmlElement)listFormsLinks.SelectSingleNode(string.Format("links/web[@url='{0}']/list[@name='{1}']/link[@isAgreementSheet='true']", this.ItemWeb.RelativeUrl, this.ItemList.Name));
                        if (linkElement != null)
                        {
                            string url = linkElement.GetAttribute("url");
                            _LinkParams = HttpUtility.ParseQueryString(url.Substring(url.IndexOf('?', 0)));
                        }
                    }
                }
                return _LinkParams;
            }
        }

        private bool __init_SettingsList;
        private DBList _SettingsList;
        /// <summary>
        /// Список настроек отчетов
        /// </summary>
        public DBList SettingsList
        {
            get
            {
                if (!__init_SettingsList)
                {
                    __init_SettingsList = true;

                    if (this.EDMSWeb != null)
                        _SettingsList = this.EDMSWeb.GetList(_ReportConsts.Lists.SettingLists.ReportSettings.ListName);

                    if (_SettingsList == null)
                        throw new Exception(string.Format("Не удалось найти список '{0}' на узле '{1}'",
                            _ReportConsts.Lists.SettingLists.ReportSettings.ListName, this.EDMSWeb.Url));
                }
                return _SettingsList;
            }
        }

        private bool __init_SettingName;
        private string _SettingName;
        /// <summary>
        /// Название настройки отчета
        /// </summary>
        public string SettingName
        {
            get
            {
                if (!__init_SettingName)
                {
                    _SettingName = this.LinkParams["settingName"];
                    __init_SettingName = true;
                }
                return _SettingName;
            }
        }

        private bool __init_SettingItem;
        private DBItem _SettingItem;
        /// <summary>
        /// Настройки отчета
        /// </summary>
        public DBItem SettingItem
        {
            get
            {
                if (!__init_SettingItem)
                {
                    __init_SettingItem = true;

                    string query = string.Format("[{0}] = N'{1}'",
                        _ReportConsts.Lists.SettingLists.ReportSettings.Fields.Title, this.SettingName);

                    _SettingItem = this.SettingsList.GetItem(query);

                    if (_SettingItem == null)
                        throw new Exception(string.Format("В списке '{0}' на узле '{1}' не найдена настройка отчета с названием '{2}'",
                            this.SettingsList.Name, this.EDMSWeb.Url, this.SettingName));
                }
                return _SettingItem;
            }
        }

        private bool __init_Template;
        private string _Template;
        /// <summary>
        /// Шаблон html
        /// </summary>
        public string Template
        {
            get
            {
                if (!__init_Template)
                {
                    __init_Template = true;

                    if (!this.SettingsList.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.HtmlTemplate))
                        throw new Exception(string.Format("В списке '{0}' на узле '{1}' не найдено поле '{2}'",
                            this.SettingsList.Name,
                            this.EDMSWeb.Url,
                            _ReportConsts.Lists.SettingLists.ReportSettings.Fields.HtmlTemplate));

                    _Template = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.HtmlTemplate);
                }
                return _Template;
            }
        }

        private bool __init_Styles;
        private string _Styles;
        /// <summary>
        /// Стили отчета
        /// </summary>
        public string Styles
        {
            get
            {
                if (!__init_Styles)
                {
                    if (this.SettingsList.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.Styles))
                        _Styles = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.Styles);
                    __init_Styles = true;
                }
                return _Styles;
            }
        }

        #endregion Props

        /// <summary>
        /// Обновление ФИО пользователя
        /// </summary>
        /// <param name="processUser"></param>
        private void UpdateFIOInProcessUser(ProcessUser processUser)
        {
            if (processUser == null || processUser.MatrixPerson == null ||
                processUser.MatrixPerson.RoleID <= 0) return;

            //простановка первого согласующего для роли в процессе согласования
            if (this.ShowFIO_InMatrixOnRoles) this.DMSLogic.Matrix_ProcessUser_FIO(processUser.MatrixPerson.RoleID, processUser);

            //простановка всех согласующего для роли в процессе согласования
            if (this.ShowAllFIO_InMatrixOnRoles) this.DMSLogic.Matrix_ProcessUser_AllFIO(processUser.MatrixPerson.RoleID, processUser);

            if (!this.ShowFIO_InMatrixOnRoles && !this.ShowAllFIO_InMatrixOnRoles && processUser.MatrixPerson.RoleID > 0)
            {
                DMSRole dmsRole = this.DMSLogic.RoleAdapter.GetObjectByID(processUser.MatrixPerson.RoleID);
                processUser.UserFIO = dmsRole != null ? dmsRole.DisplayName : "";
            }
        }

        private StringBuilder DrawWorkFlowTable(ReportRowInfo rowInfo)
        {
            StringBuilder content = new StringBuilder(4096);

            try
            {
                DMSAgreementBlockLogic agrBlockLogic = new DMSAgreementBlockLogic(this.DMSLogic);
                ProcessPassageObject processPassageObj = agrBlockLogic.ProcessObj;

                if (processPassageObj != null && processPassageObj.Stages != null
                    && processPassageObj.Stages.Count > 0)
                {
                    ProcessStage processStage = processPassageObj.Stages[0];

                    List<ProcessUser> realUsersList = new List<ProcessUser>();
                    foreach (ProcessBlock processBlock in processStage.ProcessBlocks)
                    {
                        if (processBlock.BlockName != _Consts.CustomFields.VoteField.Name || processBlock.ProcessUsers == null) continue;
                        foreach (ProcessUser processUser in processBlock.ProcessUsers)
                        {
                            this.UpdateFIOInProcessUser(processUser);
                            realUsersList.Add(processUser);
                        }
                    }

                    //отрисовка подэтапов
                    foreach (ProcessUser realUser in realUsersList)
                    {
                        this.FillAgreementRowValues(rowInfo, realUser);
                        content.Append(rowInfo.BuildRow());
                    }
                }
            }
            catch (Exception ex)
            {
                string errorMessage = string.Format("Ошибка при выводе таблицы согласующих: {0}", ex);
                this.Log.WriteError(errorMessage);
                throw new Exception(errorMessage, ex);
            }

            return content;
        }

        private void FillAgreementRowValues(ReportRowInfo rowInfo, ProcessUser processUser)
        {
            if (processUser == null) return;
            rowInfo.RowProperties = "style='mso-yfti-irow:3'";

            DBItem userItem = null;
            if (processUser.UserID > 0)
                userItem = this.Users.GetItem(processUser.UserID);
            DBItem factUserItem = null;

            if (!string.IsNullOrEmpty(processUser.FactUserLogin))
            {
                string query = string.Format("[{0}] = N'{1}'",
                    _ReportConsts.Lists.EmployeesList.Fields.Login, processUser.FactUserID);
                DBItemCollection factUserItems = this.Users.GetItems(query);
                if (factUserItems.Count > 0)
                    factUserItem = factUserItems[0];
            }

            bool usersContainsPositionField = this.Users.ContainsField(_ReportConsts.Lists.EmployeesList.Fields.Position);
            string position = string.Empty;
            if (usersContainsPositionField) position = userItem != null ? userItem.GetValue<string>(_ReportConsts.Lists.EmployeesList.Fields.Position) : processUser.UserPosition;

            string blockUserFIO = this.GetProcessUserFIO(processUser);
            string displayUserFIO = blockUserFIO;

            if (processUser.IsPassed && !string.IsNullOrEmpty(processUser.Solution))
            {
                string factDisplayUserFIO = this.GetFactUserFIO(processUser);

                displayUserFIO = factDisplayUserFIO;

                if (this.ShowFactUserPosition && !this.FactUserInBrackets)
                {
                    if (factUserItem != null && usersContainsPositionField)
                        position = factUserItem.GetValue<string>(_ReportConsts.Lists.EmployeesList.Fields.Position);
                }
                else
                    if (this.FactUserInBrackets && !this.ShowFactUserPosition)
                    {
                        //режим вывода фактического согласующего в скобках, если они отличаются
                        if (factUserItem != null && usersContainsPositionField)
                        {
                            string factUserPosition = factUserItem.GetStringValue(_ReportConsts.Lists.EmployeesList.Fields.Position);
                            if (position != factUserPosition)
                                position = StringHelper.Normalize(position) + "<br/>(" + StringHelper.Normalize(factUserPosition) + ")";
                        }
                        if (blockUserFIO != factDisplayUserFIO)
                            displayUserFIO = StringHelper.Normalize(blockUserFIO) + "<br/>(" + StringHelper.Normalize(factDisplayUserFIO) + ")";
                    }

                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.Agreementers] = position;
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.FIO] = displayUserFIO;

                //start date
                string startDate = string.Empty;
                if (processUser.StartDate != DateTime.MinValue)
                    startDate = string.Format("{0:dd.MM.yyyy HH:mm}", processUser.StartDate);

                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.StartDate] = startDate;

                //end date
                string endDate = string.Empty;
                if (processUser.EndDate != DateTime.MinValue)
                    endDate = string.Format("{0:dd.MM.yyyy HH:mm}", processUser.EndDate);
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.AgreementDate] = endDate;

                string agreementResult = userItem == null ? this.GetProcessUserSolutionResult(processUser) : this.GetSolutionResult(processUser) + this.GetFaximile(userItem);
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.AgreementResult] = agreementResult;

                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.Comments] = processUser.Comment.Replace("\r\n", "<br />");
            }
            else
            {
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.Agreementers] = position;
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.FIO] = displayUserFIO;

                if (processUser.StartDate != DateTime.MinValue)
                    rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.StartDate] = string.Format("{0:dd.MM.yyyy HH:mm}", processUser.StartDate);
                else
                    rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.StartDate] = string.Empty;

                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.AgreementDate] = string.Empty;
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.AgreementResult] = string.Empty;
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.Comments] = string.Empty;
            }
            //ссылка на согласованную версию файла
            if (this.ShowSignFilesLinks == ShowSignFilesLinks.FileName)
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.FileVersion] = this.DrawFileVersionLink(processUser);

            if (this.ShowSignFilesLinks == ShowSignFilesLinks.OnlyIndex)
                rowInfo.ColumnValues[_ReportConsts.Reports.AgreementSheet.Columns.FileVersion] = this.DrawFileVersionLinkIndex(processUser);
        }

        private string GetProcessUserSolutionResult(ProcessUser processUser)
        {
            DBItem userItems = this.GetProcessUserItem(processUser);
            string solutionResult = this.GetSolutionResult(processUser) + this.GetFaximile(userItems);
            return solutionResult;
        }

        private DBItem GetProcessUserItem(ProcessUser processUser)
        {
            if (processUser == null) return null;
            if (processUser.MatrixPerson == null || processUser.MatrixPerson.RoleID == 0)
            {
                return null;
            }
            if (string.IsNullOrEmpty(processUser.UserFIO))
            {
                return null;
            }

            DBItem tmpUserFIO = null;

            string[] tmpUserFIOPart = processUser.UserFIO.Split(new[] { ";#" }, StringSplitOptions.None);
            if (tmpUserFIOPart.Length > 1)
            {
                tmpUserFIO = this.GetUserItem(Convert.ToInt32(tmpUserFIOPart[0]));
            }

            return tmpUserFIO;
        }

        private DBItem GetUserItem(int userID)
        {
            DBItem userItem = null;
            if (userID > 0)
                userItem = this.DMSContext.Site.UsersList.GetItem(userID);

            return userItem;
        }

        private string GetFaximile(DBItem userItem)
        {
            if (userItem != null && this.FaximileField != null && this.FaximileField.IsTypeOfFiles())
            {
                List<SPXFile> files = userItem.GetFiles(this.FaximileField.Name);
                if (files != null && files.Count > 0)
                    return string.Format("<br/><img src=\"{0}/UserFaximile.aspx?userID={1}&faximileFieldID={2}&rnd={3}\" />", this.Site.Url + VersionProvider.ModulePath
                                                                                                                            , userItem.ID
                                                                                                                            , this.FaximileField.ID
                                                                                                                            , new Random().NextDouble());
            }
            return string.Empty;
        }

        #region Отрисовка столбца - ссылки на согласованные версии файлов

        private readonly Dictionary<string, Dictionary<int, ReportFileVersInfo>> _FilesVersionsDic = new Dictionary<string, Dictionary<int, ReportFileVersInfo>>();
        /// <summary>
        /// Словарь с версиями файлов, которые нужно вывести в лист согласования
        /// Ключ - fileListID ; fileItemID
        /// Значение - словарь с версиями файлов, ключ - id версии
        /// </summary>
        public Dictionary<string, Dictionary<int, ReportFileVersInfo>> FilesVersionsDic
        {
            get
            {
                return _FilesVersionsDic;
            }
        }

        private readonly Dictionary<int, DBFieldFilesValueCollection> _FilesFieldValuesDic = new Dictionary<int, DBFieldFilesValueCollection>();
        /// <summary>
        /// Словарь со значениями полей фалов
        /// Ключ - id поля файлов
        /// </summary>
        public Dictionary<int, DBFieldFilesValueCollection> FilesFieldValuesDic
        {
            get
            {
                return _FilesFieldValuesDic;
            }
        }

        private string DrawFileVersionLinkIndex(ProcessUser processUser)
        {
            //если пользователь не пройден, то согласованных версий файлов нет
            if (!processUser.IsPassed) return string.Empty;
            if (processUser.EndDate == DateTime.MinValue) return "-";

            List<FileVersionAgreement> fileVersAgreements = this.GetFileVersionAgreement(processUser);
            if (fileVersAgreements == null || fileVersAgreements.Count == 0)
                return string.Empty;

            //разметка для вывода ссылок на согласованные версии файлов
            StringBuilder fullFileVersHtml = new StringBuilder(4096);

            List<FileVersionAgreement> temp = this.SortFilesByFileListIDThenByDate(fileVersAgreements);
            List<string> processedFiles = new List<string>();

            //записи о согласовании версии файлов
            foreach (FileVersionAgreement fileVersAgr in temp)
            {
                //id поля файлов
                int fileFldID = fileVersAgr.FieldID;

                string fileItemKey = fileVersAgr.FileListID + ";" + fileVersAgr.FileItemID;

                if (processedFiles.Contains(fileItemKey)) continue;
                else processedFiles.Add(fileItemKey);

                if (!this.FilesFieldValuesDic.ContainsKey(fileFldID))
                {
                    //обработка значений полей файлов
                    DBField dbFld = this.ItemList.GetField(fileFldID);
                    if (dbFld == null) continue;
                    DBFieldFilesValueCollection filesValCol = this.GetFilesValueCollection(dbFld);
                    //добавляем в словарь значение поля файлы
                    this.FilesFieldValuesDic.Add(fileFldID, filesValCol);

                    if (filesValCol != null)
                    {
                        foreach (DBFieldFilesValue filesVal in filesValCol)
                        {
                            SYS.Lib.SharePoint.SPFile spFile = filesVal.SharePointFile;
                            SPXListItem xFileItem = filesVal.File.Item;
                            int currentVersionID = xFileItem.VersionID;

                            //нет файла SharePoint
                            if (spFile == null) continue;

                            string tmpFileItemKey = string.Format("{0};{1}", xFileItem.ParentList.ID, xFileItem.ID);
                            //в словаре нет данных о версиях данного файла
                            if (!this.FilesVersionsDic.ContainsKey(tmpFileItemKey))
                            {
                                Dictionary<int, ReportFileVersInfo> tmpFileVersDic = new Dictionary<int, ReportFileVersInfo>();

                                if (spFile.Versions != null && spFile.Versions.Count != 0)
                                {
                                    SYS.Lib.SharePoint.SPFileVersionCollection spFileVersCol = spFile.Versions;
                                    foreach (SYS.Lib.SharePoint.SPFileVersion spFileVer in spFileVersCol)
                                        tmpFileVersDic.Add(spFileVer.ID, new ReportFileVersInfo(spFileVer));
                                }
                                tmpFileVersDic.Add(currentVersionID, new ReportFileVersInfo(spFile));
                                this.FilesVersionsDic.Add(tmpFileItemKey, tmpFileVersDic);
                            }
                        }
                    }
                }

                //смотрим, есть ли данный файл в словаре
                if (this.FilesVersionsDic.ContainsKey(fileItemKey))
                {
                    Dictionary<int, ReportFileVersInfo> singleFileversDic = this.FilesVersionsDic[fileItemKey];
                    if (singleFileversDic != null && singleFileversDic.ContainsKey(fileVersAgr.FileVersionID))
                    {
                        ReportFileVersInfo reportFileInfo = singleFileversDic[fileVersAgr.FileVersionID];
                        if (fullFileVersHtml.Length != 0) fullFileVersHtml.Append("<br/><br/>");

                        if (this.ReportHelper.FilesDictionary.ContainsKey(fileFldID))
                        {
                            //Получаем список файлов для поля
                            List<AgreementSheetFileInfo> fieldFiles = this.ReportHelper.FilesDictionary[fileFldID];
                            if (fieldFiles == null || fieldFiles.Count == 0)
                                continue;

                            IEnumerable<AgreementSheetFileInfo> fi = fieldFiles.Where(x => x.FileName == reportFileInfo.Name);

                            //Получаем файл
                            if (fi.First() != null)
                                fullFileVersHtml.AppendFormat("<a href='{0}' class='rep-link' target='{2}'>{3}.\tВер. {1}</a>", reportFileInfo.FileUrl
                                                                                                                              , reportFileInfo.Version
                                                                                                                              , (reportFileInfo.IsCurrentVersion ? "_new" : "_self")
                                                                                                                              , fi.First().FileIndex);
                        }
                        else
                        {
                            fullFileVersHtml = new StringBuilder("<p style='color:#FF0000'>Требуется задать вывод названий файлов в шапке отчета, так как установлена опция ShowSignFilesLinks=OnlyIndex (выводить только версии файлов без названий)</p>");
                        }
                    }
                }
            }
            //отрисовка ячейки со ссылкой на файл
            return fullFileVersHtml.ToString();
        }

        public DBFieldFilesValueCollection GetFilesValueCollection(DBField dbFld)
        {
            DBFieldFiles dbFilesFld = dbFld.As<DBFieldFiles>();
            DBFieldFilesValueCollection filesValCol = dbFilesFld.GetFilesValue(this.Item);
            return filesValCol;
        }

        private string DrawFileVersionLink(ProcessUser processUser)
        {
            //если пользователь не пройден, то согласованных версий файлов нет
            if (!processUser.IsPassed) return string.Empty;
            if (processUser.EndDate == DateTime.MinValue) return "-";

            List<FileVersionAgreement> fileVersAgreements = this.GetFileVersionAgreement(processUser);
            if (fileVersAgreements == null || fileVersAgreements.Count == 0)
                return string.Empty;

            //разметка для вывода ссылок на согласованные версии файлов
            StringBuilder fullFileVersHtml = new StringBuilder(4096);

            List<FileVersionAgreement> temp = this.SortFilesByFileListIDThenByDate(fileVersAgreements);

            List<string> processedFiles = new List<string>();

            //записи о согласовании версии файлов
            foreach (FileVersionAgreement fileVersAgr in temp)
            {
                //id поля файлов
                int fileFldID = fileVersAgr.FieldID;

                string fileItemKey = fileVersAgr.FileListID + ";" + fileVersAgr.FileItemID;

                if (processedFiles.Contains(fileItemKey)) continue;
                else processedFiles.Add(fileItemKey);

                if (!this.FilesFieldValuesDic.ContainsKey(fileFldID))
                {
                    DBField dbFld = this.ItemList.GetField(fileFldID);
                    if (dbFld == null) continue;
                    DBFieldFilesValueCollection filesValCol = this.GetFilesValueCollection(dbFld);
                    //добавляем в словарь значение поля файлы
                    this.FilesFieldValuesDic.Add(fileFldID, filesValCol);

                    if (filesValCol != null)
                    {
                        foreach (DBFieldFilesValue filesVal in filesValCol)
                        {
                            SYS.Lib.SharePoint.SPFile spFile = filesVal.SharePointFile;
                            SPXListItem xFileItem = filesVal.File.Item;
                            int currentVersionID = xFileItem.VersionID;

                            //нет файла SharePoint
                            if (spFile == null) continue;

                            string tmpFileItemKey = string.Format("{0};{1}", xFileItem.ParentList.ID, xFileItem.ID);
                            //в словаре нет данных о версиях данного файла
                            if (!this.FilesVersionsDic.ContainsKey(tmpFileItemKey))
                            {
                                Dictionary<int, ReportFileVersInfo> tmpFileVersDic = new Dictionary<int, ReportFileVersInfo>();

                                if (spFile != null && spFile.Versions != null && spFile.Versions.Count != 0)
                                {
                                    SYS.Lib.SharePoint.SPFileVersionCollection spFileVersCol = spFile.Versions;
                                    foreach (SYS.Lib.SharePoint.SPFileVersion spFileVer in spFileVersCol)
                                    {
                                        tmpFileVersDic.Add(spFileVer.ID, new ReportFileVersInfo(spFileVer));
                                    }
                                }
                                tmpFileVersDic.Add(currentVersionID, new ReportFileVersInfo(spFile));
                                this.FilesVersionsDic.Add(tmpFileItemKey, tmpFileVersDic);
                            }
                        }
                    }
                }

                //смотрим, есть ли данный файл в словаре
                if (this.FilesVersionsDic.ContainsKey(fileItemKey))
                {
                    Dictionary<int, ReportFileVersInfo> singleFileversDic = this.FilesVersionsDic[fileItemKey];
                    if (singleFileversDic != null && singleFileversDic.ContainsKey(fileVersAgr.FileVersionID))
                    {
                        ReportFileVersInfo reportFileInfo = singleFileversDic[fileVersAgr.FileVersionID];
                        if (fullFileVersHtml.Length != 0) fullFileVersHtml.Append("<br/><br/>");
                        fullFileVersHtml.AppendFormat("<a href='{0}' class='rep-link' target='{3}'>{1} {2}</a>", reportFileInfo.FileUrl
                                                                                                               , reportFileInfo.Version
                                                                                                               , reportFileInfo.Name
                                                                                                               , (reportFileInfo.IsCurrentVersion ? "_new" : "_self"));
                    }
                }
            }
            //отрисовка ячейки со ссылкой на файл
            return fullFileVersHtml.ToString();
        }

        private List<FileVersionAgreement> SortFilesByFileListIDThenByDate(List<FileVersionAgreement> fileVersAgreements)
        {
            List<FileVersionAgreement> temp = new List<FileVersionAgreement>();
            temp.AddRange(fileVersAgreements.OrderBy(x => x.FileListID).ThenBy(x => x.FileItemID).ThenByDescending(x => x.Date));
            return temp;
        }

        private List<FileVersionAgreement> GetFileVersionAgreement(ProcessUser processUser)
        {
            //дата начала согласования
            SqlParameter startDateParam =
                new SqlParameter("@startDateParam", SqlDbType.DateTime) { Value = processUser.StartDate };
            //дата окончания согласования
            SqlParameter endDateParam =
                new SqlParameter("@endDateParam", SqlDbType.DateTime) { Value = processUser.EndDate.AddSeconds(1) };

            SqlParameter[] sqlParams = new SqlParameter[2];
            sqlParams[0] = startDateParam;
            sqlParams[1] = endDateParam;

            //смотрим по таблице записей о согласовании/подписании, какие файлы подписывал пользователь
            string query = string.Format("[SolutionName]=N'{0}' AND UserID={1} AND ListID={2} and ItemID={3} and [Date] >= @startDateParam and [Date] <= @endDateParam",
                processUser.Solution, processUser.FactUserID, this.Item.List.ID, this.Item.ID);

            return this.DMSLogic.FileVersAgrAdapter.DBFileVersionAgreementAdapter.GetObjects(query, "ORDER BY [Date] DESC", -1, sqlParams);
        }

        #endregion Отрисовка столбца - ссылки на согласованные версии файлов

        /// <summary>
        /// Формирует строку заголовка таблицы согласования
        /// </summary>
        public ReportRowInfo AgreementTableHeaderRow()
        {
            ReportRowInfo result = null;

            try
            {
                string xml = "";

                if (this.SettingItem != null && this.SettingItem.List.ContainsField(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.TableHeaders))
                {
                    xml = this.SettingItem.GetStringValue(_ReportConsts.Lists.SettingLists.ReportSettings.Fields.TableHeaders);
                }

                if (!string.IsNullOrEmpty(xml))
                {
                    XmlDocument xDoc = new XmlDocument();
                    xDoc.LoadXml(xml);

                    XmlNodeList cols = xDoc.SelectNodes("columns/column");
                    Dictionary<string, string> columnProperties = new Dictionary<string, string>();
                    Dictionary<string, string> columnValues = new Dictionary<string, string>();

                    if (cols != null)
                    {
                        foreach (XmlNode col in cols)
                        {
                            XmlAttribute ttlAttr = col.Attributes["title"];

                            if (ttlAttr == null
                                || string.IsNullOrEmpty(ttlAttr.Value)
                                || (ttlAttr.Value == _ReportConsts.Reports.AgreementSheet.Columns.FileVersion && this.ShowSignFilesLinks == ShowSignFilesLinks.None)) continue;

                            XmlAttribute nameAttr = col.Attributes["name"];
                            string columnSysName = nameAttr != null && !string.IsNullOrEmpty(nameAttr.Value) ? nameAttr.Value : ttlAttr.Value;

                            XmlAttribute widthAttr = col.Attributes["width"];
                            string width = widthAttr != null ? string.Format("width='{0}'", widthAttr.Value) : string.Empty;

                            string cssClass = columnProperties.Count > 0 ? "headerOther head" + columnProperties.Count : "headerFirst head" + columnProperties.Count;

                            columnProperties.Add(columnSysName, string.Format("class='{0}' {1}", cssClass, width));
                            columnValues.Add(columnSysName, this.Site.Translator.Translate(ttlAttr.Value));
                        }
                        string wrongColumn = this.CheckColumnNames(columnValues.Keys.ToList());

                        if (!string.IsNullOrEmpty(wrongColumn))
                            throw new Exception(string.Format("В настройках отчета листа согласования {0} указана неизвестная колонка '{1}'", this.SettingName, wrongColumn));

                        result = new ReportRowInfo(columnProperties, columnValues);
                    }
                }
                else
                    result = this.DefaultAgreementTableHeaderRow;
            }
            catch (Exception ex)
            {
                string errorMsg = string.Format("Ошибка при получении html для заголовка таблицы согласующих. Текст ошибки: {0}", ex);
                this.Log.WriteError(errorMsg);
                throw new Exception(errorMsg, ex);
            }
            return result;
        }

        /// <summary>
        /// Проверяет наличие неизвестных имен колонок в настройках отчета листа согласования
        /// </summary>
        /// <returns>Возвращает имя неизвестной колонки.</returns>
        private string CheckColumnNames(List<string> columns)
        {
            if (columns == null) return string.Empty;

            string result = string.Empty;

            foreach (string column in columns)
            {
                if (column == _ReportConsts.Reports.AgreementSheet.Columns.Agreementers
                    || column == _ReportConsts.Reports.AgreementSheet.Columns.FIO
                    || column == _ReportConsts.Reports.AgreementSheet.Columns.StartDate
                    || column == _ReportConsts.Reports.AgreementSheet.Columns.AgreementDate
                    || column == _ReportConsts.Reports.AgreementSheet.Columns.AgreementResult
                    || column == _ReportConsts.Reports.AgreementSheet.Columns.Comments
                    || column == _ReportConsts.Reports.AgreementSheet.Columns.FileVersion)
                    continue;

                result = column;
                break;
            }
            return result;
        }

        private string GetSolutionResult(ProcessUser processUser)
        {
            DMSSolution dmsSolution = null;
            if (!string.IsNullOrEmpty(processUser.Solution))
                dmsSolution = this.DMSLogic.SolutionAdapter.GetObjectByField("Name", processUser.Solution);

            //для решения "Делегировать" вычисляем  перевод
            if (processUser.Solution == Consts.Delegation.DelegationSolution) return this.DMSLogic.GetTranslateDelegateSolutionResult(processUser);

            string solutionResult = "";
            bool solutionResultWasSet = false;
            if (dmsSolution != null)
            {
                solutionResult = dmsSolution.GetTranslateProperty(this.DMSLogic.CurrentLangCode, "SolutionResultText");
                solutionResultWasSet = true;
            }
            //значение результата решения напрямую
            if (!solutionResultWasSet)
            {
                solutionResult = processUser.SolutionResult;
            }
            return solutionResult;
        }

        private string GetFactUserFIO(ProcessUser processUser)
        {
            DBUser factUser = null;
            if (processUser.FactUserID > 0)
                factUser = this.DMSContext.Site.GetUser(processUser.FactUserID);
            else
                if (string.IsNullOrEmpty(processUser.FactUserLogin))
                    factUser = this.DMSContext.Site.GetUser(processUser.FactUserLogin);
            if (factUser == null) return "";
            if (factUser.UserItem == null) return "";
            DBItem factUserItem = factUser.UserItem;
            return factUserItem.GetValue<string>(Consts.list_AllUsers_col_FIO);
        }

        private string GetUserFIO(int userID)
        {
            DBUser user = null;
            if (userID > 0)
                user = this.DMSContext.Site.GetUser(userID);
            if (user == null) return "";
            if (user.UserItem == null) return "";
            DBItem userItem = user.UserItem;
            return userItem.GetValue<string>(Consts.list_AllUsers_col_FIO);
        }

        private string GetProcessUserFIO(ProcessUser processUser)
        {
            string userFIO = "";
            if (processUser == null) return "";
            if (processUser.MatrixPerson == null || processUser.MatrixPerson.RoleID == 0)
            {
                //получаем ФИО пользователя
                return this.GetUserFIO(processUser.UserID);
            }
            if (string.IsNullOrEmpty(processUser.UserFIO)) return "";
            string[] userFIOParts = processUser.UserFIO.Split(new[] { "_#_" }, StringSplitOptions.None);
            foreach (string userFIOPart in userFIOParts)
            {
                string tmpUserFIO = "";
                string[] tmpUserFIOPart = userFIOPart.Split(new[] { ";#" }, StringSplitOptions.None);
                if (tmpUserFIOPart.Length > 1)
                {
                    tmpUserFIO = this.GetUserFIO(Convert.ToInt32(tmpUserFIOPart[0]));
                }
                else
                {
                    //выводим переводимое название роли
                    DMSRole dmsRole = this.DMSLogic.RoleAdapter.GetObjectByID(processUser.MatrixPerson.RoleID);
                    if (dmsRole != null)
                        tmpUserFIO = dmsRole.GetTranslateDisplayName(this.DMSLogic.CurrentLangCode);
                }
                if (userFIO != "") userFIO += "<br/>";
                userFIO += tmpUserFIO;
            }
            return userFIO;
        }

        private readonly DBUser _currentUser;

        /// <summary>
        /// Конструктор.
        /// </summary>
        /// <param name="item"></param>
        /// <param name="currentUser"></param>
        public VoteTableBuilder(DBItem item, DBUser currentUser)
        {
            if (item == null)
                throw new ArgumentNullException("item");
            if (currentUser == null)
                throw new ArgumentNullException("currentUser");

            this.Item = item;
            _currentUser = currentUser;
        }

        /// <summary>
        /// Метод добавлен из РД1+.
        /// </summary>
        /// <returns></returns>
        private string DrawWFContent()
        {
            string wfContent = string.Empty;

            ReportRowInfo reportRowInfo = this.DefaultAgreementTableHeaderRow;
            string reportHeader = reportRowInfo.BuildRow();
            // переностроем аттрибуты ячеек
            int i = 0;
            foreach (string key in reportRowInfo.ColumnValues.Keys)
                if (i == 0)
                    reportRowInfo.ColumnProperties[key] = string.Format("valign='top' class='cellFirst col{0}'", i++);
                else
                    reportRowInfo.ColumnProperties[key] = string.Format("valign='top' class='cellOther col{0}'", i++);

            string tableContent = this.DrawWorkFlowTable(reportRowInfo).ToString();
            if (!string.IsNullOrEmpty(tableContent))
            {
                wfContent = string.Format("<div id='{2}'><table class='MsoNormalTable' border='0' cellspacing='0' cellpadding='0'>{0}{1}</table></div>"
                    , reportHeader
                    , tableContent
                    , _ReportConsts.Reports.AgreementSheet.WorkflowTableID);
            }

            return wfContent;
        }
    }
}