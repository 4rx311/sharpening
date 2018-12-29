using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Globalization;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport;
using WSSC.V4.DMS.OMK.Reports.CommissionsExecutionReport.ObjectModel;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.Logging;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Класс, представляющий собой строчку поручения в отчёте о детализации
    /// </summary>
    public class DetalizationReportRow : IRPDataRow
    {
        /// <summary>
        /// Карточка поручения
        /// </summary>
        public DBItem Item { get; private set; }

        /// <summary>
        /// Инициализирует новый экземпляр класса DetalizationReportRow
        /// </summary>
        /// <param name="item">Карточка поручения</param>
        public DetalizationReportRow(DBItem item)
        {
            if (item == null)
                throw new ArgumentNullException("item");
            this.Item = item;
        }
    }

    /// <summary>
    /// Класс, отчечающий за построение отчёта детализации поручений по пользователю и категории
    /// </summary>
    public class CommissiongsExecutionReportDetalization : CommissionReport, IReportFilterConditions
    {
        /// <summary>
        /// Инициализирует новый экземпляр класса CommissiongsExecutionReportDetalization
        /// </summary>
        /// <param name="builder">Построитель табличной части отчёта</param>
        public CommissiongsExecutionReportDetalization(RPTableBuilder builder)
            : base(builder) { }

        private bool __init_Columns;
        private Columns _Columns;
        /// <summary>
        /// Столбцы отчёта.
        /// </summary>
        public override Columns Columns
        {
            get
            {
                if (!__init_Columns)
                {
                    _Columns = new Columns(base.CommissionReportSettings, new DBInfo(this.AppContext.Site), this);
                    __init_Columns = true;
                }
                return _Columns;
            }
        }



        private bool __init_Log = false;
        private Log _Log;
        /// <summary>
        /// Лог
        /// </summary>
        public Log Log
        {
            get
            {
                if (!__init_Log)
                {
                    _Log = new Log("WSSC.V4.DMS.OMK.Reports", VersionProvider.ModulName, this.AppContext.Site);
                    __init_Log = true;
                }
                return _Log;
            }
        }


        /// <summary>
        /// Метод, получающий карточки поручений для данного пользователя и данной категории
        /// </summary>
        /// <returns>Коллекцию подходящих карточек</returns>
        protected override IEnumerable<IRPDataRow> GetCustomSource()
        {
            StringBuilder queryBuilder = new StringBuilder();

            //Фильтруем по отчётному периоду
            SqlParameter startParameter = new SqlParameter("@startDate", this.StartDate);
            SqlParameter endParameter = new SqlParameter("@endDate", this.EndDate);
            SqlParameter[] sqlParameters = new[] { startParameter, endParameter };
            queryBuilder.Append(this.Column.BaseCondition);
            List<string> filters = new List<string>() {
            //Фильтруем по исполнителю
                this.ExecutorFilter,
            //Фильтруем по автору
                this.AuthorFilter,
            //Фильтруем по компании
                this.CompanyFilter,
            //Фильтруем по виду протокола
                this.ProtocolTypeFilter
            };

            if (!String.IsNullOrEmpty(this.PriorityFilter))
                filters.Add(this.PriorityFilter);

            foreach (string filter in filters)
            {
                if (!String.IsNullOrEmpty(filter))
                {
                    queryBuilder.AppendFormat(" AND ({0})", filter);
                }
            }

            //Определяем надо ли проверять доступ и тип разрезания
            DBListQueryParameters parameters = new DBListQueryParameters 
            { 
                CheckAccess = this.CommissionReportSettings.CheckAccess, 
                QueryDataType = this.Column.PartitionType
            };
            this.Log.Write(String.Format("Выполняем следующий запрос на получения карточек: {0}", queryBuilder.ToString()));
            DBItemCollection items = this.CommissionsList.GetItems(queryBuilder.ToString(), parameters, sqlParameters);
            this.Log.Write("Карточки извлечены ошибки не случилось");

            return items.Select(item => new DetalizationReportRow(item) as IRPDataRow);
        }

        private bool __init_ExecutorFilter;
        private string _ExecutorFilter;
        /// <summary>
        /// Фильтр по исполнителю.
        /// </summary>
        private string ExecutorFilter
        {
            get
            {
                if (!__init_ExecutorFilter)
                {
                    string selectCondition = this.ExecutorField.GetSelectCondition(new[] { this.UserID }, false, null,
                                                                            this.CommissionsList.TableInfo.GetName(
                                                                                this.Column.PartitionType), null,
                                                                                this.Column.PartitionType);

                    this.Log.Write(String.Format("Выдан следующий selectCondition для филььтра по исполнителю: {0}", selectCondition));
                    _ExecutorFilter = selectCondition;

                    __init_ExecutorFilter = true;
                }
                return _ExecutorFilter;
            }
        }

        private bool __init_AuthorFilter;
        private string _AuthorFilter;
        /// <summary>
        /// Фильтр по автору.
        /// </summary>
        public string AuthorFilter
        {
            get
            {
                if (!__init_AuthorFilter)
                {
                    if (this.AuthorIDs != null)
                        _AuthorFilter = String.Format("[{0}] IN ({1})",
                                                      _Consts.Lists.Commissions.Fields.Author,
                                                      String.Join(",", this.AuthorIDs));
                    __init_AuthorFilter = true;
                }
                return _AuthorFilter;
            }
        }

        private bool __init_CompanyFilter;
        private string _CompanyFilter;
        /// <summary>
        /// Фильтр по компании.
        /// </summary>
        public string CompanyFilter
        {
            get
            {
                if (!__init_CompanyFilter)
                {
                    if (this.CompanyIDs != null)
                        _CompanyFilter = String.Format("[{0}] IN ({1})",
                                                       _Consts.Lists.Commissions.Fields.Company,
                                                       String.Join(",",
                                                                   this.CompanyIDs));
                    __init_CompanyFilter = true;
                }
                return _CompanyFilter;
            }
        }

        private bool __init_ProtocolTypeFilter;
        private string _ProtocolTypeFilter;
        /// <summary>
        /// Фильтр по виду протокола.
        /// </summary>
        public string ProtocolTypeFilter
        {
            get
            {
                if (!__init_ProtocolTypeFilter)
                {
                    if (this.TypeIDs != null)
                        _ProtocolTypeFilter = String.Format("[{0}] IN ({1})",
                                                            _Consts.Lists.Commissions.Fields.ProtocolType,
                                                            String.Join(",",
                                                                        this.TypeIDs));
                    __init_ProtocolTypeFilter = true;
                }
                return _ProtocolTypeFilter;
            }
        }

        public virtual string PriorityFilter { get { return String.Empty; } }

        private bool __init_UserID = false;
        private int _UserID;
        /// <summary>
        /// ID пользователя, по которому строится детализация
        /// </summary>
        private int UserID
        {
            get
            {
                if (!__init_UserID)
                {
                    _UserID = this.AppContext.GetRequestValue<int>("user");
                    if (_UserID == default(int))
                        throw new DBException.EmptyParameter("user");
                    __init_UserID = true;
                }
                return _UserID;
            }
        }

        private bool __init_ExecutorField = false;
        private DBFieldLookupMulti _ExecutorField;
        /// <summary>
        /// Поле множественной подстановки "Исполнитель" в карточке поручения
        /// </summary>
        private DBFieldLookupMulti ExecutorField
        {
            get
            {
                if (!__init_ExecutorField)
                {
                    _ExecutorField = this.CommissionsList.GetField<DBFieldLookupMulti>(_Consts.Lists.Commissions.Fields.Executor, true);
                    __init_ExecutorField = true;
                }
                return _ExecutorField;
            }
        }

        private bool __init_StartDate = false;
        private DateTime _StartDate;
        /// <summary>
        /// Дата начала отчётного периода
        /// </summary>
        private DateTime StartDate
        {
            get
            {
                if (!__init_StartDate)
                {
                    string date = this.AppContext.GetRequestValue<string>("start");
                    if (String.IsNullOrEmpty(date))
                        throw new DBException.EmptyParameter("start");
                    DateTime.TryParseExact(date, "ddMMyyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out _StartDate);
                    if (_StartDate == default(DateTime))
                        throw new FormatException
                            ("Дата начала отчётного срока передана в неверном формате. Ожидаемый формат : ДДММГГГГ, передано: " + date);
                    __init_StartDate = true;
                }
                return _StartDate;
            }
        }

        private bool __init_EndDate = false;
        private DateTime _EndDate;
        /// <summary>
        /// Дата конца отчётного периода
        /// </summary>
        private DateTime EndDate
        {
            get
            {
                if (!__init_EndDate)
                {
                    string date = this.AppContext.GetRequestValue<string>("end");
                    if (String.IsNullOrEmpty(date))
                        throw new DBException.EmptyParameter("end");
                    DateTime.TryParseExact(date, "ddMMyyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out _EndDate);
                    if (_EndDate == default(DateTime))
                        throw new FormatException
                            ("Дата окончания отчётного срока передана в неверном формате. Ожидаемый формат : ДДММГГГГ, передано: " + date);
                    //Нам требуется dd.MM.yyyy 23:59:59, поэтому добавим день и вычтем секунду;
                    _EndDate = _EndDate.AddDays(1).AddSeconds(-1);
                    __init_EndDate = true;
                }
                return _EndDate;
            }
        }

        private bool __init_Column = false;
        private Column _Column;
        /// <summary>
        /// Колонка, по которой генерируется детализация
        /// </summary>
        private Column Column
        {
            get
            {
                if (!__init_Column)
                {
                    int id = this.AppContext.GetRequestValue<int>("colType");
                    if (id <= 0)
                        throw new DBException.EmptyParameter("colType");

                    _Column = this.Columns.GetColumnByTypeID(id);

                    if (_Column == null)
                        throw new Exception("В статическом словаре не найдена колонка с ID " + id);

                    __init_Column = true;
                }
                return _Column;
            }
        }

        private bool __init_AuthorIDs = false;
        private string[] _AuthorIDs;
        /// <summary>
        /// Массив, содержащий переданые ID пользователей из фильтра по автору поручения
        /// </summary>
        private string[] AuthorIDs
        {
            get
            {
                if (!__init_AuthorIDs)
                {
                    _AuthorIDs = this.GetIDArrayFromHexQuery("author");
                    __init_AuthorIDs = true;
                }
                return _AuthorIDs;
            }
        }

        private bool __init_TypeIDs = false;
        private string[] _TypeIDs;
        /// <summary>
        /// Массив, содержащий переданые ID видов протоколов из фильтра по виду протокола поручения
        /// </summary>
        private string[] TypeIDs
        {
            get
            {
                if (!__init_TypeIDs)
                {
                    _TypeIDs = this.GetIDArrayFromHexQuery("type");
                    __init_TypeIDs = true;
                }
                return _TypeIDs;
            }
        }

        private bool __init_CompanyIDs = false;
        private string[] _CompanyIDs;
        /// <summary>
        /// Массив, содержащий переданые ID компаний из фильтра по компании поручения
        /// </summary>
        private string[] CompanyIDs
        {
            get
            {
                if (!__init_CompanyIDs)
                {
                    _CompanyIDs = this.GetIDArrayFromHexQuery("company");
                    __init_CompanyIDs = true;
                }
                return _CompanyIDs;
            }
        }

        /// <summary>
        /// Возвращает массив целочисленных идентификаторов в 10СС из переданного массива идентификаторов в 16СС.
        /// </summary>
        /// <param name="queryParamName"></param>
        /// <returns></returns>
        protected string[] GetIDArrayFromHexQuery(string queryParamName)
        {
            if (String.IsNullOrEmpty(queryParamName))
                throw new ArgumentNullException("queryParamName");

            string[] result = null;
            string ids = this.AppContext.GetRequestValue<string>(queryParamName);
            if (!String.IsNullOrEmpty(ids))
            {
                string[] idArray = ids.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
                if (idArray.Length > 0)
                    result = idArray.Select(i =>
                                            {
                                                int id;
                                                if (!Int32.TryParse(i, NumberStyles.HexNumber, CultureInfo.InvariantCulture,
                                                                    out id))
                                                    throw new FormatException(i + " не является валидным значением ID");

                                                return id.ToString();
                                            }).ToArray();
            }
            return result;
        }

        private bool __init_CommissionsList;
        private DBList _CommissionsList;
        /// <summary>
        /// Список поручений.
        /// </summary>
        private DBList CommissionsList
        {
            get
            {
                if (!__init_CommissionsList)
                {
                    _CommissionsList = this.CommissionsWeb.GetList("Instructions", true);
                    __init_CommissionsList = true;
                }
                return _CommissionsList;
            }
        }

        private bool __init_CommissionsWeb;
        private DBWeb _CommissionsWeb;
        /// <summary>
        /// Узел поручений.
        /// </summary>
        private DBWeb CommissionsWeb
        {
            get
            {
                if (!__init_CommissionsWeb)
                {
                    _CommissionsWeb = this.Site.GetWeb("/dms/instructions", true);
                    __init_CommissionsWeb = true;
                }
                return _CommissionsWeb;
            }
        }

    }
}
