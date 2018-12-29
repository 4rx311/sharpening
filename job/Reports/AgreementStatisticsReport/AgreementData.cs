using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Fields.Choice;
using WSSC.V4.DMS.Reports;

namespace WSSC.V4.DMS.OMK.Reports.AgreementReportData
{
    /// <summary>
    /// Модель данных карточки договора, необходимых для отчета
    /// </summary>
    public class AgreementData
    {
        /// <summary>
        /// Конструктор по карточке
        /// </summary>
        /// <param name="item">Карточка документа</param>
        public AgreementData(DBItem item)
        {
            if (item == null)
                throw new ArgumentNullException("item");

            this.Item = item;
        }

        public DBItem Item { get; private set; }

        private bool _init_Company = false;
        private string _Company;
        /// <summary>
        /// Значение поля "Компания"
        /// </summary>
        public string Company
        {
            get
            {
                if (!_init_Company)
                {
                    _Company = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.CompanyFieldName);

                    _init_Company = true;
                }
                return _Company;
            }
        }

        private bool _init_Department = false;
        private string _Department;
        /// <summary>
        /// Значение поля "Подразделение"
        /// </summary>
        public string Department
        {
            get
            {
                if (!_init_Department)
                {
                    _Department = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.DepartmentFieldName);

                    _init_Department = true;
                }
                return _Department;
            }
        }

        private bool _init_Stage = false;
        private string _Stage;
        /// <summary>
        /// Значение поля "Этап"
        /// </summary>
        public string Stage
        {
            get
            {
                if (!_init_Stage)
                {
                    _Stage = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.StageFieldName);

                    _init_Stage = true;
                }
                return _Stage;
            }
        }

        private bool _init_DocType = false;
        private string _DocType;
        /// <summary>
        /// Значение поля "Вид документа"
        /// </summary>
        public string DocType
        {
            get
            {
                if (!_init_DocType)
                {
                    _DocType = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.DocTypeFieldName);

                    _init_DocType = true;
                }
                return _DocType;
            }
        }

        private bool _init_FinSource = false;
        private string _FinSource;
        /// <summary>
        /// Значение поля "Источник финансирования"
        /// </summary>
        public string FinSource
        {
            get
            {
                if (!_init_FinSource)
                {
                    _FinSource = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.FinSourceFieldName);

                    _init_FinSource = true;
                }
                return _FinSource;
            }
        }

        private bool _init_Form = false;
        private string _Form;
        /// <summary>
        /// Значение поля "Форма договоров"
        /// </summary>
        public string Form
        {
            get
            {
                if (!_init_Form)
                {
                    _Form = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.FormFieldName);

                    _init_Form = true;
                }
                return _Form;
            }
        }

        private bool _init_OuterInner = false;
        private string _OuterInner;
        /// <summary>
        /// Значение поля "Внешнеэкономический/Внутренний"
        /// </summary>
        public string OuterInner
        {
            get
            {
                if (!_init_OuterInner)
                {
                    _OuterInner = Item.GetLookupText(_Consts.Reports.AgreementStatisticsReport.Fields.OuterInnerFieldName);

                    _init_OuterInner = true;
                }
                return _OuterInner;
            }
        }

        private bool _init_DisagreementProtocol;
        private bool _DisagreementProtocol;
        /// <summary>
        /// Значение поля "Имеется протокол разногласий"
        /// </summary>
        public bool DisagreementProtocol
        {
            get
            {
                if (!_init_DisagreementProtocol)
                {
                    _DisagreementProtocol = Item.GetValue<bool>(_Consts.Reports.AgreementStatisticsReport.Fields.DisagrProtocolFieldName);

                    _init_DisagreementProtocol = true;
                }
                return _DisagreementProtocol;
            }
        }
    }
}
