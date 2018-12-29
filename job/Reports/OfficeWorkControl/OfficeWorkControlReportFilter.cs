using System;
using System.Collections.Generic;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using WSSC.V4.DMS.Publishing;
using WSSC.V4.DMS.Reports;
using WSSC.V4.SYS.DBFramework;
using Const = WSSC.V4.DMS.OMK._Consts.Reports.OfficeWorkControlReport;

namespace WSSC.V4.DMS.OMK.Reports.OfficeWorkControl
{
    /// <summary>
    /// Класс, содержащий значения фильтров картотеки
    /// </summary>
    internal class OfficeWorkControlReportFilter
    {
        private readonly PQuery _PQuery;
        private readonly DBSite _Site;
       
        private Func<Exception> _FilterExceptionFactory = () =>
            new RPCustomException(new RPCustomExceptionData
            {
                AlertText = Const.AlertText,
                CloseWindow = true
            });

        /// <summary>
        /// Инициализирует новый экземпляр класса OfficeWorkControlReportFilter
        /// </summary>
        /// <param name="pQuery">Запрос картотеки</param>
        /// <param name="site">Сайт приложения</param>
        internal OfficeWorkControlReportFilter(PQuery pQuery, DBSite site)
        {
            if ((_PQuery = pQuery) == null)
                throw new ArgumentNullException("pQuery");
            if ((_Site = site) == null)
                throw new ArgumentNullException("site");            
        }

        private DBUser _AgreementPerson;
        /// <summary>
        /// Выбранный согласующий
        /// </summary>
        internal DBUser AgreementPerson
        {
            get
            {
                if (_AgreementPerson == null)
                {
                    PFilterValue agreementPersonFilterValue = _PQuery.GetFilterValue(Const.AgreementPersonsFilterName);
                    if (agreementPersonFilterValue == null)
                        throw _FilterExceptionFactory();
                    if (agreementPersonFilterValue.MultiValue.Count != 1)
                        throw _FilterExceptionFactory();
                    int userId = agreementPersonFilterValue.MultiValue[0].LookupID;
                    _AgreementPerson = _Site.GetUser(userId);
                    if (_AgreementPerson == null)
                        throw new Exception(String.Format("Не найден пользователь с ID = {0}, указанный в фильтре '{1}'", userId, Const.AgreementPersonsFilterName));
                }
                return _AgreementPerson;
            }
        }

        private PFilterValue _PeriodFilterValue;
        /// <summary>
        /// Значения фильтра периода
        /// </summary>
        private PFilterValue PeriodFilterValue
        {
            get
            {
                if (_PeriodFilterValue == null)
                {
                    _PeriodFilterValue = _PQuery.GetFilterValue(Const.AgreementDateFilterName);
                    if (_PeriodFilterValue == null)
                        throw _FilterExceptionFactory();                    
                }
                return _PeriodFilterValue;
            }
        }

        private bool __init_StartPeriod;
        private DateTime _StartPeriod;
        /// <summary>
        /// Дата начала периода
        /// </summary>
        internal DateTime StartPeriod
        {
            get
            {
                if (!__init_StartPeriod)
                {
                    _StartPeriod = this.PeriodFilterValue.SingleValue.DateStart;

                    if (_StartPeriod == default(DateTime))
                        throw _FilterExceptionFactory();

                    if (_StartPeriod < SqlDateTime.MinValue.Value)
                        _StartPeriod = SqlDateTime.MinValue.Value;

                    __init_StartPeriod = true;
                }
                return _StartPeriod;
            }
        }

        private bool __init_EndPeriod;
        private DateTime _EndPeriod;
        /// <summary>
        /// Дата конца периода
        /// </summary>
        internal DateTime EndPeriod
        {
            get
            {
                if (!__init_EndPeriod)
                {
                    _EndPeriod = this.PeriodFilterValue.SingleValue.DateEnd;
                    if (_EndPeriod == default(DateTime))
                        throw _FilterExceptionFactory();

                    if (_EndPeriod > SqlDateTime.MaxValue.Value)
                        _EndPeriod = SqlDateTime.MaxValue.Value;

                    if (_EndPeriod < this.StartPeriod)
                        throw new Exception("Дата окончания периода меньше даты начала.");

                    __init_EndPeriod = true;
                }
                return _EndPeriod;
            }
        }
    }
}
