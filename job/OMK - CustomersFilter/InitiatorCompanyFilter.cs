using System;
using WSSC.V4.SYS.DBFramework;
using System.Collections.Generic;
using WSSC.V4.SYS.Fields.Lookup;

using Consts = WSSC.V4.DMS.OMK._Consts.Controls.InitiatorCompanyFilterControl;

namespace WSSC.V4.DMS.OMK.Controls.CustomersFilter
{
    /// <summary>
    /// Контрол фильтрации позиций по конкурсу
    /// </summary>
    public class InitiatorCompanyFilter
    {
        private bool __init_Context = false;
        private DBAppContext _Context;
        /// <summary>
        /// Контекст выполнения кода.
        /// </summary>
        public DBAppContext Context
        {
            get
            {
                if (!__init_Context)
                {
                    if (!DBAppContext.HasCurrent)
                        throw new Exception("Операция возможна только в рамках контекста выполнения кода");

                    _Context = DBAppContext.Current;
                    __init_Context = true;
                }
                return _Context;
            }
        }

        private bool __init_Site = false;
        private DBSite _Site;
        /// <summary>
        /// Сайт.
        /// </summary>
        public DBSite Site
        {
            get
            {
                if (!__init_Site)
                {
                    _Site = this.Context.Site;
                    __init_Site = true;
                }
                return _Site;
            }
        }

        /// <summary>
        /// Возвращает строку для фильтрации, с id всех компаний до 4-ого уровня.
        /// </summary>
        /// <returns></returns>
        public string GetListOfDepartments()
        {
            DBWeb web = this.Site.GetWeb("/");
            if (web == null)
                throw new Exception("Узел не найден");

            DBList departmentsList = web.GetList(Consts.DepartmentsList);
            if (departmentsList == null)
                throw new Exception($"Не найден список по имени '{Consts.DepartmentsList}'");

            string selectCondition = null;
            string result = null;
            List<DBItem> lvlOne = new List<DBItem>();
            selectCondition = "[Название] = "+ Consts.DepartmentLevelQuery;
            lvlOne.Add(departmentsList.GetItem(selectCondition));
            foreach (DBItem item in lvlOne)
                result += item.ID + ",";

            List<DBItem> lvlTwo = new List<DBItem>();
            lvlTwo = this.GetChildren(lvlOne, departmentsList);
            foreach (DBItem item in lvlTwo)
                result += item.ID + ",";

            List<DBItem> lvlThree = new List<DBItem>();
            lvlThree = this.GetChildren(lvlTwo, departmentsList);
            foreach (DBItem item in lvlThree)
                result += item.ID + ",";

            List<DBItem> lvlFour = new List<DBItem>();
            lvlFour = this.GetChildren(lvlThree, departmentsList);
            foreach (DBItem item in lvlFour)
                result += item.ID + ",";

            return result.TrimEnd(',');
        }

        /// <summary>
        /// Ищет родительские подразделения.
        /// </summary>
        /// <returns></returns>
        private List<DBItem> GetChildren(List<DBItem> level, DBList depList)
        {
            if (level == null)
                throw new ArgumentNullException(nameof(level));

            if (depList == null)
                throw new ArgumentNullException(nameof(depList));

            List<DBItem> result = new List<DBItem>();
            string parentsIDs = "";

            foreach (DBItem item in level)
            {
                parentsIDs += item.ID + ",";
            }
            parentsIDs = parentsIDs.TrimEnd(',');

            string selectCondition = $"[Родительское подразделение] IN ({parentsIDs})";
            DBItemCollection collection = depList.GetItems(selectCondition);
            result.AddRange(collection);

            return result;
        }

        /// <summary>
        /// Возвращает id компании по номеру пользователя
        /// </summary>
        /// <param name="initiatorID"></param>
        /// <returns></returns>
        public int GetCompany(int initiatorID)
        {
            int result = 0;

            DBList usersList = this.Context.Site.UsersList;
            DBItem user = usersList.GetItem(initiatorID);
            if (user == null)
                throw new ArgumentNullException(nameof(user));

            result = user.GetLookupID(Consts.FieldCompany);
            return result;
        }

        /// <summary>
        /// Получение строки условия
        /// </summary>        
        public string GetQueryString()
        { 
            int initiatorID = this.Context.GetRequestValue("initiatorID", 0);
            if (initiatorID == 0)
                throw new ArgumentNullException(nameof(initiatorID));

            int companyID = this.GetCompany(initiatorID);
            if (companyID == 0)
                throw new ArgumentNullException(nameof(companyID));

            string departmentsList = this.GetListOfDepartments();
            if (departmentsList == null)
                throw new ArgumentNullException(nameof(departmentsList));

            string resultCondition = $"[Компания] IN ({companyID}) AND [Подразделение] IN ({departmentsList})";
            
            return resultCondition;
        }
    }
}

