using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Workflow;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.MailSender;

using Const = WSSC.V4.DMS.MMV.Consts.Controls.ChangeFieldNotify;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify
{
    /// <summary>
    /// Менеджер отправки уведомления об изменении поля
    /// </summary>
    public class NotificationManager
    {
        #region Properties
        /// <summary>
        /// Создать менеджер уведомлений на основании элемента и описания измененных полей
        /// </summary>
        /// <param name="item">Элемент, для которого создается уведомление</param>
        /// <param name="changedFields">Измененные поля</param>
        public NotificationManager(DBItem item, List<JSClient.ChangesDescription> changedFields)
        {
            if (item == null)
            {
                throw new DBException.EmptyParameter("item");
            }
            this.Item = item;

            if (changedFields == null)
            {
                throw new DBException.EmptyParameter("changedFields");
            }
            this.ChangedFields = changedFields;
        }

        private DBItem Item { get; set; }
        private List<JSClient.ChangesDescription> ChangedFields { get; set; }

        #region Notification Exceptions Properties
        private bool __init_Site = false;
        private DBSite _Site;
        /// <summary>
        /// Сайт
        /// </summary>
        public DBSite Site
        {
            get
            {
                if (!__init_Site)
                {
                    _Site = this.Item.Site;
                    __init_Site = true;
                }
                return _Site;
            }
        }

        private int _processID;
        private bool __init_processID;
        /// <summary>
        /// ID процесса "Материалы к вопросу повестки заседания"
        /// </summary>
        private int processID
        {
            get
            {
                if (!__init_processID)
                {
                    DBList processes = this.Site.GetWeb("/").GetList(Const.ProcessesList);
                    _processID = processes.GetItem($"[{Const.ProcessListField}] = N'{Const.ProcessName}'").ID;
                    __init_processID = true;
                }
                return _processID;
            }
        }

        private DBList _NotifyExceptionsList;
        private bool __init_NotifyExceptionsList;
        /// <summary>
        /// Список "WSSC_Исключения оповещений"
        /// </summary>
        private DBList NotifyExceptionsList
        {
            get
            {
                if (!__init_NotifyExceptionsList)
                {
                    _NotifyExceptionsList = this.Site.GetWeb("/dms").GetList(Const.NotifyExceptionList);
                    __init_NotifyExceptionsList = true;
                }
                return _NotifyExceptionsList;
            }
        }

        private bool __init_NotifyExceptionsItem = false;
        private DBItem _NotifyExceptionsItem;
        /// <summary>
        /// Элемент списка "WSSC_Исключения оповещений" на процесс "Материалы к вопросу повестки заседания" 
        /// </summary>
        public DBItem NotifyExceptionsItem
        {
            get
            {
                if (!__init_NotifyExceptionsItem)
                {
                    string selectCondition = $"[{Const.NotifyExceptionField}] IN ({this.processID})";
                    _NotifyExceptionsItem = this.NotifyExceptionsList.GetItem(selectCondition);
                    __init_NotifyExceptionsItem = true;
                }
                return _NotifyExceptionsItem;
            }
        }

        private bool __init_NotifyRoles;
        private List<int> _NotifyRoles = new List<int>();
        /// <summary>
        /// Список ролей не попавших в "Исключения оповещений"
        /// </summary>
        private List<int> NotifyRoles
        {
            get
            {
                if (!__init_NotifyRoles)
                {
                    List<int> rolesList = new List<int>();
                    rolesList.Add(this.AutorRole.ID);
                    rolesList.Add(this.InitiatorRole.ID);
                    rolesList.Add(this.SecretaryRole.ID);

                    string rolesExceptions = this.NotifyExceptionsItem.GetStringValue(Const.NoNotifyRoles);
                    string[] rolesExceptionsArray = rolesExceptions.Split(new char[] { ';' });
                    foreach (string name in rolesExceptionsArray)
                    {
                        DMSRole role = this.Logic.RoleAdapter.GetObjectByField("[Name]", name);
                        if (role == null)
                        {
                            throw new DBException.MissingObject(String.Format("Роль {0} не найдена", name));
                        }
                        if (!rolesList.Contains(role.ID))
                            _NotifyRoles.Add(role.ID);
                    }
                    __init_NotifyRoles = true;
                }
                return _NotifyRoles;
            }
        }

        private bool __init_NoNotifySolutions;
        private List<DMSSolution> _NoNotifySolutions = new List<DMSSolution>();
        /// <summary>
        /// Список решений попавших в исключение рассылки
        /// </summary>
        private List<DMSSolution> NoNotifySolutions
        {
            get
            {
                if (!__init_NoNotifySolutions)
                {
                    string solutionsExceptions = this.NotifyExceptionsItem.GetStringValue(Const.NoNotifySolutions);
                    string[] solutionsExceptionsArray = solutionsExceptions.Split(new char[] { ';' });
                    foreach (string name in solutionsExceptionsArray)
                    {
                        DMSSolution solution = this.Logic.SolutionAdapter.GetObjectByField("[Name]", name);
                        if (solution == null)
                            throw new DBException.MissingObject(String.Format("Решение {0} не найдено", name));

                        _NotifyRoles.Add(solution.ID);
                    }

                    __init_NoNotifySolutions = true;
                }
                return _NoNotifySolutions;
            }
        }

        private bool __init_NoNotifyUsers;
        private List<int> _NoNotifyUsers = new List<int>();
        /// <summary>
        /// Список сотрудников попавших в исключение рассылки
        /// </summary>
        private List<int> NoNotifyUsers 
        {
            get
            {
                if (!__init_NoNotifyUsers)
                {
                    List<DBItem> users = this.NotifyExceptionsItem.GetLookupItems(Const.NoNotifyUsers);
                    foreach (DBItem user in users)
                        _NoNotifyUsers.Add(user.ID);
                    
                    __init_NoNotifyUsers = true;
                }
                return _NoNotifyUsers;
            }
        }
        #endregion

        private DMSLogic _Logic;
        private bool __init_Logic;
        /// <summary>
        /// Логика над элементом
        /// </summary>
        private DMSLogic Logic
        {
            get
            {
                if (!__init_Logic)
                {
                    _Logic = new DMSLogic(new DMSDocument(new DMSContext(this.Item.Web), this.Item));
                    __init_Logic = true;
                }
                return _Logic;
            }
        }

        private DMSRole _AutorRole;
        private bool __init_AutorRole;
        /// <summary>
        /// Роль документа "Автор материалов"
        /// </summary>
        private DMSRole AutorRole
        {
            get
            {
                if (!__init_AutorRole)
                {
                    _AutorRole = this.Logic.RoleAdapter.GetObjectByField("[Name]", 
                        Consts.Controls.ChangeFieldNotify.AutorRoleName);
                    if (_AutorRole == null)
                    {
                        throw new DBException.MissingObject(String.Format("Роль {0} не найдена", Consts.Controls.ChangeFieldNotify.AutorRoleName));
                    }
                    __init_AutorRole = true;
                }
                return _AutorRole;
            }
        }

        private DMSRole _InitiatorRole;
        private bool __init_InitiatorRole;
        /// <summary>
        /// Роль документа "Инициатор"
        /// </summary>
        private DMSRole InitiatorRole
        {
            get
            {
                if (!__init_InitiatorRole)
                {
                    _InitiatorRole = this.Logic.RoleAdapter.GetObjectByField("[Name]",
                        Consts.Controls.ChangeFieldNotify.InitiatorRoleName);
                    if (_InitiatorRole == null)
                    {
                        throw new DBException.MissingObject(String.Format("Роль {0} не найдена", Consts.Controls.ChangeFieldNotify.InitiatorRoleName));
                    }
                    __init_InitiatorRole = true;
                }
                return _InitiatorRole;
            }
        }

        private DMSRole _SecretaryRole;
        private bool __init_SecretaryRole;
        /// <summary>
        /// Роль документа "Секретарь заседания"
        /// </summary>
        private DMSRole SecretaryRole
        {
            get
            {
                if (!__init_SecretaryRole)
                {
                    _SecretaryRole = this.Logic.RoleAdapter.GetObjectByField("[Name]",
                        Consts.Controls.ChangeFieldNotify.SecretaryRoleName);
                    if (_SecretaryRole == null)
                    {
                        throw new DBException.MissingObject(String.Format("Роль {0} не найдена", Consts.Controls.ChangeFieldNotify.SecretaryRoleName));
                    }
                    __init_SecretaryRole = true;
                }
                return _SecretaryRole;
            }
        }

        private MailSender _MailManager;
        private bool __init_MailManager;
        /// <summary>
        /// Менеджер рассылки
        /// </summary>
        private MailSender MailManager
        {
            get
            {
                if (!__init_MailManager)
                {
                    _MailManager = new MailSender(this.Item.Site.SiteConnectionString);
                    __init_MailManager = true;
                }
                return _MailManager;
            }
        }

        private List<string> _UsersAddresses = new List<string>();
        private bool __init_UsersAddresses;
        /// <summary>
        /// Адреса заинтересованных пользователей
        /// </summary>
        private List<string> UsersAddresses
        {
            get
            {
                if (!__init_UsersAddresses)
                {
                    foreach (int roleID in this.NotifyRoles)
                        foreach (DBUser user in this.Logic.GetUsersInRole(roleID))
                        {
                            if (user.IsSystemAccount && !String.IsNullOrEmpty(user.EMail) && !this.NoNotifyUsers.Contains(user.ID))
                                _UsersAddresses.Add(user.EMail);
                        }

                    __init_UsersAddresses = true;


                    //Func<DBUser, bool> whereStatement = x => !x.IsSystemAccount && !String.IsNullOrEmpty(x.EMail);

                    //_UsersAddresses = new List<string>()
                    //    .Union(this.Logic.GetUsersInRole(this.AutorRole.ID).Where(whereStatement).Select(x => x.EMail))
                    //    .Union(this.Logic.GetUsersInRole(this.InitiatorRole.ID).Where(whereStatement).Select(x => x.EMail))
                    //    .Union(this.Logic.GetUsersInRole(this.SecretaryRole.ID).Where(whereStatement).Select(x => x.EMail))
                    //    .ToList();

                }
                return _UsersAddresses;
            }
        }

        private string _RegNumber;
        private bool __init_RegNumber;
        /// <summary>
        /// Регистрационный номер карточки
        /// </summary>
        private string RegNumber
        {
            get
            {
                if (!__init_RegNumber)
                {
                    _RegNumber = this.Item.GetStringValue(Consts.Controls.ChangeFieldNotify.RegNumberFieldName);
                    __init_RegNumber = true;
                }
                return _RegNumber;
            }
        }
        #endregion

        /// <summary>
        /// Метод производит рассылку уведомлений
        /// </summary>
        public void Send()
        {
            if (!this.NoNotifySolutions.Contains(this.Logic.Solution)) {
                StringBuilder bodyBuilder = new StringBuilder();
                string cardLink = this.Item.Site.Url + this.Item.DisplayUrl;
                bodyBuilder.AppendFormat("В карточку материала <a href=\"{0}\">{1}</a> были внесены изменения.<br />\r\n<br />\r\n", cardLink, this.RegNumber);
                bodyBuilder.AppendFormat("Текущий этап: {0}<br />\r\n", this.Logic.Stage.DisplayName);
                bodyBuilder.AppendFormat("Текущий статус: {0}<br />\r\n", this.Logic.Status.DisplayName);
                bodyBuilder.Append("<br />\r\nВ документе были изменены следующие поля:<br />\r\n");

                int num = 0;
                ChangeFieldsCompare changeFieldsComparer = new ChangeFieldsCompare();
                // Сортировка по принципу: сначала элементы, у которых можно вывести начальное и конечные значения, затем сортировка по названию поля
                this.ChangedFields.Sort(changeFieldsComparer);

                foreach (JSClient.ChangesDescription fieldChange in this.ChangedFields)
                {
                    if (0 <= num++)
                    {
                        bodyBuilder.AppendLine();
                    }

                    bodyBuilder.AppendFormat("{0}.<br />\r\n", fieldChange.FieldName);
                    if (fieldChange.ValueBefore != null || fieldChange.CurrentValue != null)
                    {
                        bodyBuilder.AppendFormat("Значение до изменений: {0}<br />\r\n", fieldChange.ValueBefore);
                        bodyBuilder.AppendFormat("Значение после изменений: {0}<br />\r\n", fieldChange.CurrentValue);
                    }
                }

                string subject = String.Format("В карточку материала {0} были внесены изменения.", this.RegNumber);
                string body = bodyBuilder.ToString();

                // Рассылка писем
                foreach (string email in this.UsersAddresses)
                {
                    this.MailManager.SendMail(email, subject, body);
                }
            }
        }

        /// <summary>
        /// Сортировка по принципу: сначала элементы, у которых можно вывести начальное и конечные значения, затем сортировка по названию поля
        /// </summary>
        public class ChangeFieldsCompare : IComparer<JSClient.ChangesDescription>
        {
            public int Compare(JSClient.ChangesDescription x, JSClient.ChangesDescription y)
            {
                if (x == null)
                {
                    if (y == null)
                    {
                        return 0;
                    }
                    else
                    {
                        return -1;
                    }
                }
                else
                {
                    if (y == null)
                    {
                        return 1;
                    }
                    else
                    {
                        if (x.ValueBefore != null || x.CurrentValue != null)
                        {
                            if (y.ValueBefore != null || y.CurrentValue != null)
                            {
                                return x.FieldName.CompareTo(y.FieldName);
                            }
                            else
                            {
                                return 1;
                            }
                        }
                        else
                        {
                            if (y.ValueBefore != null || y.CurrentValue != null)
                            {
                                return -1;
                            }
                            else
                            {
                                return x.FieldName.CompareTo(y.FieldName);
                            }
                        }
                    }
                }
            }
        }
    }
}
