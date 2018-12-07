using System;
using System.Web;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib;
using WSSC.V4.SYS.Lib.Base;
using Consts = WSSC.V4.DMS.OMK._Consts.Controls.CustomerDepartmentControl;

namespace WSSC.V4.DMS.OMK.Controls.CustomerDepartment
{
    /// <summary>
    /// Обработчик проверки условий.
    /// </summary>
    public class CustomerDepartmentHandler : IHttpHandler
    {
        /// <summary>
        /// Поле проставляемое в зависимости от результата поиска методом Scan()
        /// </summary>
        public static string Result = null;

        public bool IsReusable
        {
            get
            {
                return false;
            }
        }

        #region Lazy Properties

        private bool __init_UserID = false;
        private int _UserID;
        /// <summary>
        /// ID Заказчика
        /// </summary>
        public int UserID
        {
            get
            {
                if (!__init_UserID)
                {
                    _UserID = this.Context.GetRequestValue<int>("customer");
                    if (_UserID == null)
                        throw new Exception("Не передан ID пользователя");
                    __init_UserID = true;
                }
                return _UserID;
            }
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
        #endregion

        public void ProcessRequest(HttpContext context)
        {
            context.Response.ContentType = "text/json";

            CustomerData customerObject = new CustomerData();

            JSResult.ProcessRequest(context, () =>
            {
                string position = this.GetPosition();

                customerObject.CustomerDepartment = this.ConvertDepartmentNameToID(this.CheckDepartment(position));
                customerObject.CustomerResponsibilityZone = this.CheckResponsibilityZone(position);

                string json = DataSerializer.SerializeJSON(customerObject);
                Result = null;

                return customerObject;
            });
        }

        /// <summary>
        /// Возвращает "Подразделение" по условию.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="position"></param>
        /// <returns>Возвращает подразделение пользователя</returns>
        public string CheckDepartment(string position)
        {
            if (!position.Contains(Consts.PositionContains))
                return this.GetDepartment();
            else
                return position.Replace(Consts.PositionContains, "");
        }

        #region CheckResponsibilityZone() Methods

        /// <summary>
        /// Ищет "Подразделение" по условиюи возвращает соответствующую ему "Зону ответственности".
        /// </summary>
        /// <param name="customer"></param>
        /// <param name="position"></param>
        /// <returns>Зону ответственности пользователя</returns>
        public int CheckResponsibilityZone(string position)
        {
            if (position.Contains(Consts.PositionContains + Consts.ParentDepValue))
                return this.ConvertResponsibilityZoneNameToID(Consts.CheckResult);
            else if (position.Contains(Consts.PositionContains))
                return this.ConvertResponsibilityZoneNameToID(position.Replace(Consts.PositionContains, ""));
            else
            {
                string departmentID = this.GetDepartmentID();
                this.Scan(departmentID);

                if (Result == "ao_vmz" || Result == "nothing")
                    return this.ConvertResponsibilityZoneNameToID(Consts.CheckResult);
                else if (Result != null)
                    return this.ConvertResponsibilityZoneNameToID(Result);
                else
                    return 0;
            }
        }

        /// <summary>
        /// Метод поиска среди "Родительских подразделений" по условию.
        /// Результат поиска в свойстве Result.
        /// </summary>
        /// <param name="depid"></param>
        private void Scan(string departmentID)
        {
            if (string.IsNullOrEmpty(departmentID))
            {
                throw new ArgumentException("message", nameof(departmentID));
            }

            DBWeb web = this.Site.GetWeb("/");
            DBList Deps = web.GetList(Consts.GetDBList);

            string newNode = this.GetParent(departmentID, Deps);
            while (Result == null)
            {
                newNode = this.GetParent(newNode, Deps);
            }
        }

        /// <summary>
        /// Проверяет наличие уcловия, ищет "Родительские подразделения"
        /// </summary>
        /// <param name="level"></param>
        /// <param name="depList"></param>
        /// <returns>id Родительского подразделения</returns>
        private string GetParent(string departmentID, DBList departmentsList)
        {
            int result = 0;

            bool b = int.TryParse(departmentID, out int id);
            if (!b)
                throw new FormatException("Передан неверный id подразделения");

            DBItem departments = departmentsList.GetItem(id);

            if (departments != null)
            {
                string parentDepartmentName = departments.GetStringValue(Consts.FieldParentDep);

                if (parentDepartmentName == Consts.FirstLevel)
                    Result = this.GetDepartmentNameByID(departmentID);
                else if (parentDepartmentName == null)
                    Result = "nothing";
                else if (parentDepartmentName == Consts.ParentDepValue)
                    Result = "ao_vmz";
                else
                {
                    bool check = this.IndexCheck(departmentID, departmentsList);
                    if (!check)
                    {
                        result = departments.GetLookupID(Consts.FieldParentDep);
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
        private bool IndexCheck(string departmentID, DBList depList)
        {
            bool b = int.TryParse(departmentID, out int id);
            if (!b)
                throw new FormatException("Передан неверный departmentID");

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
        #endregion

        #region Get[Value]() Methods

        /// <summary>
        /// Возвращает имя подразделения по его id
        /// </summary>
        /// <param name="departmentID"></param>
        /// <returns></returns>
        private string GetDepartmentNameByID(string departmentID)
        {
            bool b = int.TryParse(departmentID, out int id);
            if (!b)
                throw new FormatException("Передан неверный id подразделения");

            DBWeb web = this.Site.GetWeb("/");
            DBList listDeps = web.GetList("Departments");
            DBItem department = listDeps.GetItem(id);
            return department.GetStringValue("Название");
        }

        /// <summary>
        /// Возвращает ID подразделения пользователя.
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns>id подразделения</returns>
        private string GetDepartmentID()
        {
            DBList listUsers = this.Site.UsersList;
            DBItem user = listUsers.GetItem(this.UserID);
            string _department = "";

            _department = user.GetLookupID(Consts.FieldDepartment).ToString();

            return _department;
        }
        
        /// <summary>
        /// Возвращает должность пользователя.
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns>id должности</returns>
        private string GetPosition()
        {
            DBList listUsers = this.Site.UsersList;
            DBItem user = listUsers.GetItem(this.UserID);
            string _position = "";

            _position = user.GetValue(Consts.FieldPosition).ToString();

            return _position;
        }

        /// <summary>
        /// Возвращает подразделение пользователя.
        /// </summary>
        /// <param name="idUser"></param>
        /// <returns>id подразделения</returns>
        private string GetDepartment()
        {
            DBList listUsers = this.Site.UsersList;
            DBItem user = listUsers.GetItem(this.UserID);
            string _department = "";
            
            _department = user.GetValue(Consts.FieldDepartment).ToString();

            return _department;
        }
        #endregion

        #region Convert[Value]() Methods

        /// <summary>
        /// Возвращает id по названию подразделения.
        /// </summary>
        /// <param name="zoneName"></param>
        /// <returns>id для поля "Подразделение-заказчик"</returns>
        private int ConvertDepartmentNameToID(string departmentName)
        {
            if (departmentName == null)
                throw new ArgumentNullException(nameof(departmentName));
            
            
            DBWeb web = this.Site.GetWeb("/");
            DBList listDeps = web.GetList("Departments");

            string selectCondition = $"[Название] = N'{departmentName}'";
            DBItem department = listDeps.GetItem(selectCondition);
            if (department == null)
                throw new Exception("Подразделение не найдено");
            return department.ID;
        }

        /// <summary>
        /// Возвращает id по названию зоны ответственности.
        /// </summary>
        /// <param name="zoneName"></param>
        /// <returns>id для поля "Зона ответственности"</returns>
        private int ConvertResponsibilityZoneNameToID(string zoneName)
        {
            if (zoneName == null)
                throw new ArgumentNullException(nameof(zoneName));

            DBWeb web = this.Site.GetWeb("/dms/InvestmentInitiatives");
            DBList listRespZones = web.GetList("ResponsibilityZones");

            string selectCondition = $"[Название] = N'{zoneName}'";
            DBItem responsibilityZone = listRespZones.GetItem(selectCondition);

            if (responsibilityZone == null)
                throw new Exception("Зона ответственности не найдена");

            return responsibilityZone.ID;
        }
        #endregion
    }
}
