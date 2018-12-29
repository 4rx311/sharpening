using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.UI;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;

namespace WSSC.V4.DMS.OMK.Reports
{
    /// <summary>
    /// Блок печатной формы, отображающий динамическое название поля
    /// </summary>
    public class BusinessTripsCustomBlock
    {
        private DBSite _Site;
        /// <summary>
        /// Сайт приложения
        /// </summary>
        public DBSite Site
        {
            get
            {
                if (_Site == null)
                    throw new InvalidOperationException("Свойство Site не инициализировано на момент обращения");
                return _Site;
            }
            set
            {
                _Site = value;
            }
        }

        private bool __init_Settings = false;
        private CustomFieldNameSettings _Settings;
        /// <summary>
        /// Настройка соответствия названия зависимого поля значению управляющегл
        /// </summary>
        public CustomFieldNameSettings Settings
        {
            get
            {
                if (!__init_Settings)
                {
                    _Settings = new CustomFieldNameSettings(this.Site);
                    __init_Settings = true;
                }
                return _Settings;
            }
        }

        /// <summary>
        /// Точка входа класса
        /// </summary>
        /// <param name="html">Шаблон</param>
        /// <param name="item">Карточка</param>
        /// <returns>Разметку строки в таблице для соответствующего названия, либо пустую разметку</returns>
        public string GetBoundDocumentsHtml(string html, DBItem item)
        {
            this.Site = item.Site;

            if (html.IndexOf(_Consts.Reports.BusinesstripsCustomBlock.Marker) == -1)
                throw new Exception("В найстройке не указан элемент " + _Consts.Reports.BusinesstripsCustomBlock.Marker);

            string htmlFormat =
@"<tr>
    <td class='st50' width='50%'><b>{0}</b></td>
    <td class='st50'>{1}</td>
</tr>";
            string value = item.GetLookupText(this.Settings.ControllingFieldName);
            string controlledValue = item.GetStringValue(this.Settings.ControlledFieldName) ?? String.Empty;

            if (!String.IsNullOrEmpty(value) && this.Settings.ValueNameDictionary.ContainsKey(value))
            {
                return html.Replace(_Consts.Reports.BusinesstripsCustomBlock.Marker,
                    String.Format(htmlFormat, this.Settings.ValueNameDictionary[value], controlledValue));
            }
            else
            {
                return html.Replace(_Consts.Reports.BusinesstripsCustomBlock.Marker, String.Empty);
            }
        }
    }
}
