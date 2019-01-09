using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify.JSClient
{
    /// <summary>
    /// Структура параметров запроса на отправку уведомления
    /// </summary>
    public class SendNotificationRequest
    {
        /// <summary>
        /// Описание измененных полей
        /// </summary>
        public List<ChangesDescription> ChangedFields { get; set; }
        /// <summary>
        /// Идентификатор списка, в котором находится элемент
        /// </summary>
        public int ListID { get; set; }
        /// <summary>
        /// Идентификатор элемента
        /// </summary>
        public int ItemID { get; set; }
    }
}
