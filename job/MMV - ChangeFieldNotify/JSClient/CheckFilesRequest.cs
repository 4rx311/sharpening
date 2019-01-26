using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify.JSClient
{
    /// <summary>
    /// Структура параметров запроса 
    /// </summary>
    public class CheckFilesRequest
    {
        /// <summary>
        /// Названия полей, содержащих файлы
        /// </summary>
        public List<string> FieldNames { get; set; }
        /// <summary>
        /// Идентификатор списка
        /// </summary>
        public int ListID { get; set; }
        /// <summary>
        /// Идентификатор элемента
        /// </summary>
        public int ItemID { get; set; }
    }
}
