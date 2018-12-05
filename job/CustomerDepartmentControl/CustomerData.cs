using System;
using System.Runtime.Serialization;
using WSSC.V4.SYS.Lib;

namespace WSSC.V4.DMS.OMK.Controls.CustomerDepartmentControl
{
    [DataContract]
    class CustomerData : JSResult
    {
        [DataMember]
        public string CustomerDepartment { get; set; }

        [DataMember]
        public string CustomerResponsibilityZone { get; set; }
    }
}
