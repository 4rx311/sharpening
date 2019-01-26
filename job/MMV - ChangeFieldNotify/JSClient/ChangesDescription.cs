using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify.JSClient
{
    /// <summary>
    /// Структура, описывающее измененное поле
    /// </summary>
    public class ChangesDescription
    {
        /// <summary>
        /// Название поля
        /// </summary>
        public string FieldName { get; set; }
        /// <summary>
        /// Текстовое представление значения до изменения. Если null, то не используется
        /// </summary>
        public string ValueBefore { get; set; }
        /// <summary>
        /// Текстовое представление значения после изменения. Если null, то не используется
        /// </summary>
        public string CurrentValue { get; set; }
    }
}
