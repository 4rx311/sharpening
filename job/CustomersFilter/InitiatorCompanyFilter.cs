using System;
using WSSC.V4.SYS.DBFramework;
using System.Collections.Generic;
using WSSC.V4.SYS.Fields.Lookup;

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

        private bool __init_Users = false;
        private DBList _Users;
        /// <summary>
        /// Получает список всех польхователей
        /// </summary>
        public DBList Users
        {
            get
            {
                if (!__init_Users)
                {
                    DBSite site = this.Site;
                    DBWeb contractsWeb = site.GetWeb("/");
                    DBList _Users = contractsWeb.GetList("Users");
                    __init_Users = true;
                }
                return _Users;
            }
        }

        /// <summary>
        /// Возвращает строку для фильтрации, с id всех компаний до 4-ого уровня.
        /// </summary>
        /// <returns></returns>
        public string GetListOfDepartments()
        {
            DBSite site = this.Site;
            DBWeb web = site.GetWeb("/");
            DBList Deps = web.GetList("Departments");

            string selectCondition = null;
            string result = null;
            List<DBItem> lvlOne = new List<DBItem>();
            selectCondition = "[Название] = N'Группа компаний \"ОМК\"'";
            lvlOne.Add(Deps.GetItem(selectCondition));
            foreach (var item in lvlOne)
                result += item.ID + ",";

            List<DBItem> lvlTwo = new List<DBItem>();
            lvlTwo = GetChildren(lvlOne, Deps);
            foreach (var item in lvlTwo)
                result += item.ID + ",";

            List<DBItem> lvlThree = new List<DBItem>();
            lvlThree = GetChildren(lvlTwo, Deps);
            foreach (var item in lvlThree)
                result += item.ID + ",";

            List<DBItem> lvlFour = new List<DBItem>();
            lvlFour = GetChildren(lvlThree, Deps);
            foreach (var item in lvlFour)
                result += item.ID + ",";

            return result.TrimEnd(',');
        }

        /// <summary>
        /// Ищет родительские подразделения.
        /// </summary>
        /// <returns></returns>
        private static List<DBItem> GetChildren(List<DBItem> level, DBList depList)
        {
            DBItem dep;
            List<DBItem> result = new List<DBItem>();
            foreach (var item in level)
            {
                dep = depList.GetItem(item.ID);
                string selectCondition = "[Родительское подразделение] IN (" + dep.ID + ")";
                DBItemCollection collection = depList.GetItems(selectCondition);
                foreach (var i in collection)
                    result.Add(i);
            }
            return result;
        }

        /// <summary>
        /// Возвращает id компании по номеру пользователя
        /// </summary>
        /// <param name="initiatorID"></param>
        /// <returns></returns>
        public int GetCompany(int initiatorID)
        {
            DBSite site = this.Context.Site;
            DBList usersList = site.UsersList;
            DBItem user = usersList.GetItem(initiatorID);
            int result = 0;
            if (user != null)
            {
                result = user.GetLookupID("Компания");
                return result;
            }
            else
                return result;
        }

        /// <summary>
        /// Получение строки условия
        /// </summary>        
        public string GetQueryString()
        {
            int initiatorID = this.Context.GetRequestValue("initiatorID", 0);

            int companyID = GetCompany(initiatorID);
            string depList = GetListOfDepartments();

            string resultCondition = $"[Компания] IN ({companyID}) AND [Подразделение] IN ({depList})";
            
            return resultCondition;
        }
    }
}

