//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using WSSC.V4.SYS.DBFramework;
//using WSSC.V4.SYS.Fields.Lookup;


//namespace WSSC.V4.DMS.OMK.Controls.Obsolete
//{
//    class FilterManager
//    {
//        private DBItem _UserItem;

//        private bool _init_Context;
//        private DBAppContext _Context;
//        /// <summary>
//        /// Текущий контекст выполнения.
//        /// </summary>
//        internal DBAppContext Context
//        {
//            get
//            {
//                if (!_init_Context)
//                {
//                    _Context = DBAppContext.Current;
//                    if (_Context == null)
//                        throw new Exception("Не удалось получить контекст выполнения приложения");
//                    _init_Context = true;
//                }
//                return _Context;
//            }
//        }

//        private bool _init_Site;
//        private DBSite _Site;
//        /// <summary>
//        /// Сайт приложения.
//        /// </summary>
//        internal DBSite Site
//        {
//            get
//            {
//                if (!_init_Site)
//                {
//                    _Site = this.Context.Site;
//                    if (_Site == null)
//                        throw new Exception("Не удалось получить сайт из контекста выполнения приложения");
//                    _init_Site = true;
//                }
//                return _Site;
//            }
//        }

//        private bool __init_ListForm;
//        private DBListFormControl _ListForm;
//        /// <summary>
//        /// Форма карточки
//        /// </summary>
//        public DBListFormControl ListForm
//        {
//            get
//            {
//                if (!__init_ListForm)
//                {
//                    __init_ListForm = true;

//                    if (this.TypedPage != null)
//                        _ListForm = this.TypedPage.ListFormHolder.ListForm;
//                }
//                return _ListForm;
//            }
//        }

//        private bool __init_Deps = false;
//        private DBList _Deps;
//        /// <summary>
//        /// Получает список всех подразделений
//        /// </summary>
//        public DBList Deps
//        {
//            get
//            {
//                if (!__init_Deps)
//                {
//                    DBSite site = this.Site;
//                    DBWeb contractsWeb = site.GetWeb("/");
//                    DBList _Deps = contractsWeb.GetList("Departments");
//                    __init_Deps = true;
//                }
//                return _Deps;
//            }
//        }

//        /// <summary>
//        /// Возвращает строку для фильтрации, с id всех компаний до 4-ого уровня.
//        /// </summary>
//        /// <returns></returns>
//        public string GetListOfDepartments()
//        {
//            string selectCondition = null;
//            string result = null;
//            List<DBItem> lvlOne = new List<DBItem>();
//            selectCondition = "[Название] = N'Группа компаний \"ОМК\"'";
//            lvlOne.Add(Deps.GetItem(selectCondition));
//            foreach (var item in lvlOne)
//                result += item.ID + ",";

//            List<DBItem> lvlTwo = new List<DBItem>();
//            lvlTwo = GetChildren(lvlOne, Deps);
//            foreach (var item in lvlTwo)
//                result += item.ID + ",";

//            List<DBItem> lvlThree = new List<DBItem>();
//            lvlThree = GetChildren(lvlTwo, Deps);
//            foreach (var item in lvlThree)
//                result += item.ID + ",";

//            List<DBItem> lvlFour = new List<DBItem>();
//            lvlFour = GetChildren(lvlThree, Deps);
//            foreach (var item in lvlFour)
//                result += item.ID + ",";

//            return result.TrimEnd(',');
//        }

//        private static List<DBItem> GetChildren(List<DBItem> level, DBList depList)
//        {
//            DBItem dep;
//            List<DBItem> result = new List<DBItem>();
//            foreach (var item in level)
//            {
//                dep = depList.GetItem(item.ID);
//                string selectCondition = "[Родительское подразделение] IN (" + dep.ID + ")";
//                DBItemCollection collection = depList.GetItems(selectCondition);
//                foreach (var i in collection)
//                    result.Add(i);
//            }
//            return result;
//        }
//    }
//}
