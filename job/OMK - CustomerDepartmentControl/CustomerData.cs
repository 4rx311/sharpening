using System;
using System.Runtime.Serialization;
using WSSC.V4.SYS.Lib;

namespace WSSC.V4.DMS.OMK.Controls.CustomerDepartment
{
    /// <summary>
    /// Данные о заказчике, отправляемые на клиент
    /// </summary>
    [DataContract]
    class CustomerData : JSResult
    {
        /// <summary>
        /// id Подразделения
        /// </summary>
        [DataMember]
        public int CustomerDepartment { get; set; }

        /// <summary>
        /// id Зоны ответственности
        /// </summary>
        [DataMember]
        public int CustomerResponsibilityZone { get; set; }
    }
}
