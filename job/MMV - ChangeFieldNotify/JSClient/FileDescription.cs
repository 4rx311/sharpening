using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify.JSClient
{
    /// <summary>
    /// Структура данных, описывающая сохраненный на сервере файл
    /// </summary>
    [DataContract]
    public class FileDescription
    {
        /// <summary>
        /// Идентификатор поля, в котором хранится файл
        /// </summary>
        [DataMember]
        public int FieldID { get; set; }
        /// <summary>
        /// Идентификатор файла
        /// </summary>
        [DataMember]
        public int FileID { get; set; }
        /// <summary>
        /// Версия файла
        /// </summary>
        [DataMember]
        public int Version { get; set; }
    }
}
