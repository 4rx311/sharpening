using System;
using System.Web;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Lib;
using WSSC.V4.SYS.Fields.Lookup;

namespace WSSC.V4.DMS.OMK.Controls.CustomerResponsibilityZoneControl
{
    /// <summary>
    /// Обработчик проверки условий.
    /// </summary>
    public class ResponsibilityZoneHandler : IHttpHandler
    {
        public bool IsReusable
        {
            get
            {
                return false;
            }
        }
        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/json";

            JSResultString jsResult = new JSResultString();

            try
            {
                if (context.Request.Params["customer"] != null)
                {
                    string customer = context.Request["customer"];
                    string position = GetPosition(customer);
                    
                    if (position.Contains("Управляющий директор " + "АО \"ВМЗ\""))
                        jsResult.Value = "ВМЗ_вне дивизиона";
                    else if (position.Contains("Управляющий директор "))
                        jsResult.Value = position.Replace("Управляющий директор ", "");
                    else
                    {
                        string depid = GetDepartment(customer);
                        Scan(depid);

                        if (Result == "nothing")
                            jsResult.Value = "ВМЗ_вне дивизиона";
                        else if (Result != null)
                            jsResult.Value = Result;
                        else
                            jsResult.Value = "null";
                    }
                }
            }
            catch (Exception e)
            {
                jsResult.SetException(e, JSExceptionDisplayMode.FullInformation);
            }
            finally
            {
                string json = jsResult.Serialize();
                context.Response.Write(json);
            }
        }

        /// <summary>
        /// Возвращает должность пользователя
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns></returns>
        private string GetPosition(string idUser)
        {
            string _position = "";

            try
            {
                int id = Convert.ToInt32(idUser);

                // Подключаемся к БД
                DBSite site = this.Context.Site;
                DBList listUsers = site.UsersList;
                DBItem user = listUsers.GetItem(id);

                _position = user.GetValue("Должность").ToString();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _position;
        }

        /// <summary>
        /// Результирующая строка метода Scan().
        /// </summary>
        public static string Result = null;

        /// <summary>
        /// Метод поиска среди "Родительских подразделений" по условию.
        /// Результат поиска в свойстве Result.
        /// </summary>
        /// <param name="depid"></param>
        private void Scan(string depid)
        {
            DBSite site = this.Site;
            DBWeb web = site.GetWeb("/");
            DBList Deps = web.GetList("Departments");

            string newNode = GetParent(depid, Deps);
            while (Result == null)
            {
                newNode = GetParent(newNode, Deps);
            }
        }

        /// <summary>
        /// Проверяет по условию поле "Делопроизводственный индекс"
        /// </summary>
        /// <param name="departmentID"></param>
        /// <param name="depList"></param>
        /// <returns></returns>
        private static bool IndexCheck(string departmentID, DBList depList)
        {
            Console.WriteLine("Index check...");
            int id = Convert.ToInt32(departmentID);
            DBItem dep = depList.GetItem(id);
            string index = dep.GetStringValue("Делопроизводственный индекс");
            switch (index)
            {
                case "200044":
                    Result = "ВМЗ_ДЖДК";
                    return true;
                case "200045":
                    Result = "ВМЗ_ДНГПТ";
                    return true;
                case "200046":
                    Result = "ВМЗ_ДТБД";
                    return true;
                default:
                    return false;
            }
        }

        /// <summary>
        /// Проверяет наличие уловия, ищет "Родительские подразделения"
        /// </summary>
        /// <param name="level"></param>
        /// <param name="depList"></param>
        /// <returns></returns>
        private static string GetParent(string departmentID, DBList depList)
        {
            int result = 0;
            int id = Convert.ToInt32(departmentID);
            DBItem dep = depList.GetItem(id);
            if (dep != null)
            {
                object parentValue = dep.GetValue("Родительское подразделение");
                if (parentValue.ToString() == null || parentValue.ToString() == "АО \"ВМЗ\"")
                {
                    Result = "nothing";
                }
                else
                {
                    bool check = IndexCheck(departmentID, depList);
                    if (!check)
                    {
                        result = dep.GetLookupID("Родительское подразделение");
                    }
                }
            }
            return Convert.ToString(result);
        }

        private string GetDepartment(string idUser)
        {
            string _department = "";

            try
            {
                int id = Convert.ToInt32(idUser);

                // Подключаемся к БД
                DBSite site = this.Context.Site;
                DBList listUsers = site.UsersList;
                DBItem user = listUsers.GetItem(id);

                _department = user.GetLookupID("Подразделение").ToString();
            }
            catch (Exception ex)
            {
                throw ex;
            }
            return _department;
        }

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
                    DBWeb web = site.GetWeb("/");
                    DBList _Users = web.GetList("Users");
                    __init_Users = true;
                }
                return _Users;
            }
        }

        private bool __init_Deps = false;
        private DBList _Deps;
        /// <summary>
        /// Получает список всех подразделений
        /// </summary>
        public DBList Deps
        {
            get
            {
                if (!__init_Deps)
                {
                    DBSite site = this.Site;
                    DBWeb web = site.GetWeb("/");
                    _Deps = web.GetList("Departments");
                    __init_Deps = true;
                }
                return _Deps;
            }
        }
    }
}
