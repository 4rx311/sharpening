using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify.JSClient
{
    /// <summary>
    /// Структура данных, передаваемая на клиент при инициализации
    /// </summary>
    [DataContract]
    public class InitConsts
    {
        /// <summary>
        /// Названия полей
        /// </summary>
        [DataMember]
        public string[] FieldNames { get; set; }
        /// <summary>
        /// Описание файлов на момент открытия карточки
        /// </summary>
        [DataMember]
        public List<FileDescription> FilesOrigin { get; set; }
        /// <summary>
        /// Элемент управления работает или нет
        /// </summary>
        [DataMember]
        public bool Active { get; set; }
        /// <summary>
        /// Отклонить сохранение, если пользователь отказывается от отправки оповещения
        /// </summary>
        [DataMember]
        public bool RejectSave { get; set; }
    }
}
