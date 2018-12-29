using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.DMS.EDMS;
using WSSC.V4.DMS.Jobs;
using WSSC.V4.DMS.Reports;
using WSSC.V4.DMS.Workflow;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Представляет объект данных для строки деализированного отчета.
    /// </summary>
    public class UserAgreementDelails : IRPDataRow
    {
        /// <summary>
        /// К-тор.
        /// </summary>
        /// <param name="item">Документ.</param>
        /// <param name="reportBuilder">Построитель детализированного отчета.</param>
        /// <param name="agrStat">Список статистики по документам на согласовании.</param>
        internal UserAgreementDelails(DBItem item, AgreementTermDetalizationBuilder reportBuilder, List<DMSAgrPersonStatistics> agrStat, List<UserDocumentDelay> userDelays)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            if (reportBuilder == null)
                throw new ArgumentNullException("reportBuilder");

            if (agrStat == null)
                throw new ArgumentNullException("agrStat");

            if (userDelays == null)
                throw new ArgumentNullException("userDelays");

            this.AgrStatList = agrStat;
            this.UserDelays = userDelays;
            this.ReportBuilder = reportBuilder;
            this.Item = item;
        }

        /// <summary>
        /// Документ.
        /// </summary>
        public DBItem Item { get; private set; }

        /// <summary>
        /// Построитель отчета.
        /// </summary>
        private AgreementTermDetalizationBuilder ReportBuilder { get; set; }

        /// <summary>
        /// Список статистики по документам на согласовании.
        /// </summary>
        internal List<DMSAgrPersonStatistics> AgrStatList { get; private set; }

        /// <summary>
        /// Список статистики просрочки по пользователю.
        /// </summary>
        internal List<UserDocumentDelay> UserDelays { get; set; }

        private bool __init_Logic = false;
        private DMSLogic _Logic;
        /// <summary>
        /// DMS-логика.
        /// </summary>
        public DMSLogic Logic
        {
            get
            {
                if (!__init_Logic)
                {
                    DMSContext context = new DMSContext(this.Item.Web);
                    DMSDocument doc = new DMSDocument(context, this.Item);
                    _Logic = new DMSLogic(doc);
                    __init_Logic = true;
                }
                return _Logic;
            }
        }

        private bool __init_AgrLogic = false;
        private DMSAgreementBlockLogic _AgrLogic;
        /// <summary>
        /// Логика блока согласования.
        /// </summary>
        public DMSAgreementBlockLogic AgrLogic
        {
            get
            {
                if (!__init_AgrLogic)
                {
                    _AgrLogic = new DMSAgreementBlockLogic(this.Logic);
                    __init_AgrLogic = true;
                }
                return _AgrLogic;
            }
        }

        private bool __init_ControlTimeInfoDict = false;
        private Dictionary<int, AgrPersonControlTimeInfo> _ControlTimeInfoDict;
        /// <summary>
        /// Словарь данных контроля сроков.
        /// Ключ-идентификатор записи статистики по согласующему.
        /// </summary>
        public Dictionary<int, AgrPersonControlTimeInfo> ControlTimeInfoDict
        {
            get
            {
                if (!__init_ControlTimeInfoDict)
                {
                    _ControlTimeInfoDict = new Dictionary<int, AgrPersonControlTimeInfo>();

                    ControlTimeOnAgrStageManager manager = this.ReportBuilder.GetControlTimeManager(this.Item.Web);
                    AgrPersonStatus status = AgrPersonStatus.Agree;

                    foreach (DMSAgrPersonStatistics agrPersonStat in this.AgrStatList)
                    {
                        //настройки контроля сроков
                        ControlTimeSetting controlTimeSetting = manager.GetControlTimeSettingsByDocStatus(this.AgrLogic, agrPersonStat, status).FirstOrDefault();
                        if (controlTimeSetting == null)
                            continue;

                        double limitTime = agrPersonStat.MatrixLimitTime > 0 ? agrPersonStat.MatrixLimitTime : controlTimeSetting.LimitTime;
                        AgrPersonControlTimeInfo controlTimeInfo = new AgrPersonControlTimeInfo(agrPersonStat, limitTime, controlTimeSetting.NotifyBeforeLimitTime, this.AgrLogic, controlTimeSetting.RoleID);
                        _ControlTimeInfoDict.Add(agrPersonStat.Id, controlTimeInfo);
                    }

                    __init_ControlTimeInfoDict = true;
                }
                return _ControlTimeInfoDict;
            }
        }
    }
}
