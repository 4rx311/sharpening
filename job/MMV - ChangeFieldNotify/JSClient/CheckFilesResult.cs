using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using WSSC.V4.SYS.Lib;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify.JSClient
{
    /// <summary>
    /// Структура ответа на запрос получения текущих версий файлов
    /// </summary>
    public class CheckFilesResult : JSResult
    {
        /// <summary>
        /// Текущие версии файлов
        /// </summary>
        [DataMember]
        public List<FileDescription> CurrentFiles { get; set; }
    }
}
