using System;
using System.Web;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib;

using Consts = WSSC.V4.DMS.OMK._Consts.Controls.CustomerDepartmentControl;

namespace WSSC.V4.DMS.OMK.Controls.CustomerDepartmentControl
{
    /// <summary>
    /// Обработчик проверки условий.
    /// </summary>
    public class CustomerDepartmentHandler : IHttpHandler
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

            JSResult.ProcessRequest(context, () =>
            {
                CustomerData customer = new CustomerData();
                var request = this.Context.GetRequestValue<string>("customer");
                string position = GetPosition(request);

                customer.CustomerDepartment = CheckDepartment(request, position);
                customer.CustomerResponsibilityZone = CheckResponsibilityZone(request, position);

                string json = customer.Serialize();
                return jsResult;
            });

            //finally
            //{
            //    jsResult.Value
            //    string json = jsResult.Serialize();
            //    context.Response.Write(json);
            //}
        }

        /// <summary>
        /// Возвращает "Подразделение" по условию.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="position"></param>
        /// <returns>Возвращает подразделение пользователя</returns>
        public string CheckDepartment(string request, string position)
        {
            if (!position.Contains(Consts.PositionContains))
                return GetDepartment(request);
            else
                return request.Replace(Consts.PositionContains, "");
        }

        /// <summary>
        /// Возвращает "Зону ответственности" пользователя по условию.
        /// </summary>
        /// <param name="customer"></param>
        /// <param name="position"></param>
        /// <returns>Зону ответственности пользователя</returns>
        public string CheckResponsibilityZone(string customer, string position)
        {
            if (position.Contains(Consts.PositionContains + Consts.ParentDepValue))
                return Consts.CheckResult;
            else if (position.Contains(Consts.PositionContains))
                return position.Replace(Consts.PositionContains, "");
            else
            {
                string depid = GetDepartment(customer);
                Scan(depid);

                if (Result == "nothing")
                    return Consts.CheckResult;
                else if (Result != null)
                    return Result;
                else
                    return "null";
            }
        }

        public static string Result = null;
        /// <summary>
        /// Метод поиска среди "Родительских подразделений" по условию.
        /// Результат поиска в свойстве Result.
        /// </summary>
        /// <param name="depid"></param>
        private void Scan(string depid)
        {
            DBWeb web = this.Context.Site.GetWeb("/");
            DBList Deps = web.GetList(Consts.GetDBList);

            string newNode = GetParent(depid, Deps);
            while (Result == null)
            {
                newNode = GetParent(newNode, Deps);
            }
        }

        /// <summary>
        /// Проверяет наличие уcловия, ищет "Родительские подразделения"
        /// </summary>
        /// <param name="level"></param>
        /// <param name="depList"></param>
        /// <returns>id Родительского подразделения</returns>
        private static string GetParent(string departmentID, DBList depList)
        {
            int result = 0;
            bool b = int.TryParse("", out int id);
            if (!b)
                throw new FormatException();

            DBItem dep = depList.GetItem(id);

            if (dep != null)
            {
                string parentDepartmentName = dep.GetStringValue(Consts.FieldParentDep);

                if (parentDepartmentName == null || parentDepartmentName == Consts.ParentDepValue)
                {
                    Result = "nothing";
                }
                else
                {
                    bool check = IndexCheck(departmentID, depList);
                    if (!check)
                    {
                        result = dep.GetLookupID(Consts.FieldParentDep);
                    }
                }
            }
            return Convert.ToString(result);
        }

        /// <summary>
        /// Проверяет по условию поле "Делопроизводственный индекс"
        /// </summary>
        /// <param name="departmentID"></param>
        /// <param name="depList"></param>
        /// <returns>true/false - нашло/не_нашло</returns>
        private static bool IndexCheck(string departmentID, DBList depList)
        {            
            bool b = int.TryParse("", out int id);
            if (!b)
                throw new FormatException();

            DBItem dep = depList.GetItem(id);
            string index = dep.GetStringValue(Consts.FieldIndex);
            switch (index)
            {
                case Consts.IndexCase1:
                    Result = Consts.IndexCase1Valid;
                    return true;
                case Consts.IndexCase2:
                    Result = Consts.IndexCase2Valid;
                    return true;
                case Consts.IndexCase3:
                    Result = Consts.IndexCase3Valid;
                    return true;
                default:
                    return false;
            }
        }

        /// <summary>
        /// Возвращает должность пользователя.
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns>id должности</returns>
        private string GetPosition(string idUser)
        {
            string _position = "";

            bool b = int.TryParse("", out int id);
            if (!b)
                throw new FormatException();

            // Подключаемся к БД
            DBList listUsers = this.Context.Site.UsersList;
            DBItem user = listUsers.GetItem(id);

            _position = user.GetValue(Consts.FieldPosition).ToString();

            return _position;
        }

        /// <summary>
        /// Возвращает подразделение пользователя.
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns>id подразделения</returns>
        private string GetDepartment(string idUser)
        {
            string _department = "";

            bool b = int.TryParse("", out int id);
            if (!b)
                throw new FormatException();

            // Подключаемся к БД
            DBList listUsers = this.Context.Site.UsersList;
            DBItem user = listUsers.GetItem(id);
            
            _department = user.GetValue(Consts.FieldDepartment).ToString();

            return _department;
        }

        private bool _init_Context;
        private DBAppContext _Context;
        /// <summary>
        /// Текущий контекст выполнения.
        /// </summary>
        internal DBAppContext Context
        {
            get
            {
                if (!_init_Context)
                {
                    _Context = DBAppContext.Current;
                    if (_Context == null)
                        throw new Exception("Не удалось получить контекст выполнения приложения");
                    _init_Context = true;
                }
                return _Context;
            }
        }
    }
}
