using System;
using System.Collections.Generic;
using System.Linq;
using System.Xml.Linq;
using WSSC.V4.SYS.DBFramework;

using Const = WSSC.V4.DMS.OMK._Consts.Reports.VersionHistory;

namespace WSSC.V4.DMS.OMK.Reports.VersionsHistory
{
    /// <summary>
    /// Настройки из XML
    /// </summary>
    internal class Settings
    {
        internal Settings(DBItem item) => this.Item = item ?? throw new ArgumentNullException(nameof(item));

        private DBItem Item { get; set; }

        private bool _InitSetting;
        private XElement _Setting;
        /// <summary>
        /// Настрока из системных констант
        /// </summary>
        private XElement Setting
        {
            get
            {
                if (!_InitSetting)
                {
                    XDocument xml = this.Item.Site.ConfigParams.GetXDocument(Const.SettingName);
                    if (xml == null)
                        throw new Exception(string.Format("Не удалось получить константу '{0}'", Const.SettingName));

                    _Setting = xml.Element("Settings").Element("Lists")
                               ?? throw new Exception(string.Format("Не удалось получить xml-узел '{0}' из константы '{1}'", "Lists", Const.SettingName));
                    _InitSetting = true;
                }
                return _Setting;
            }
        }

        private bool _InitSettingList;
        private XElement _SettingList;
        /// <summary>
        /// Настройка для текущего списка
        /// </summary>
        internal XElement SettingList
        {
            get
            {
                if (!_InitSettingList)
                {
                    IEnumerable<XElement> xmlList = this.Setting.Elements("List");
                    if (xmlList == null)
                        throw new Exception(string.Format("Не удалось получить xml-узлы '{0}' из константы '{1}'", "List", Const.SettingName));

                    _SettingList = xmlList.FirstOrDefault(t => t.Attribute("name").Value == this.Item.List.Name)
                                   ?? throw new Exception(string.Format("Не удалось получить настройку для списка '{0}' из константы '{1}'",
                                                          this.Item.List.Name, Const.SettingName));

                    _InitSettingList = true;
                }
                return _SettingList;
            }
        }

        private bool _InitSettingFields;
        private List<string> _SettingFields;
        /// <summary>
        /// Названия полей которые участвуют в истории версий
        /// </summary>
        internal List<string> SettingFields
        {
            get
            {
                if (!_InitSettingFields)
                {
                    _SettingFields = new List<string>();
                    XElement fieldsRoot = this.SettingList.Element("Fields")
                                   ?? throw new Exception(string.Format("Некорректная настройка для списка '{0}' из константы '{1}'",
                                                                        this.Item.List.Name, Const.SettingName));

                    _SettingFields.AddRange(fieldsRoot.Elements()?.Where(node => node.Name == "Field" || node.Name == "TableElement").Select(node => node.Attribute("name")?.Value));

                    _InitSettingFields = true;
                }
                return _SettingFields;
            }
        }

        private bool _InitTableElementName;
        private string _TableElementName;
        /// <summary>
        /// Название табличного элемента фигурирующего в истории (TableElement)
        /// </summary>
        internal string TableElementName
        {
            get
            {
                if (!_InitTableElementName)
                {
                    //Получаем узлы с табличными элементами
                    List<XElement> tableElements = this.SettingList?.Element("Fields")?.Elements("TableElement")?.ToList();
                    if (tableElements.Count > 1)
                        throw new Exception(string.Format("Количество табличных элементов не может быть более одного. Ошибочная настройка для списка: '{0}'", this.Item.List.Name));

                    //Название табличного элемента
                    _TableElementName = tableElements.FirstOrDefault()?.Attribute("name")?.Value;

                    _InitTableElementName = true;

                }
                return _TableElementName;
            }
        }

        private bool _InitFieldsHistory;
        private List<string> _FieldsHistory;
        /// <summary>
        /// Название полей который попадут в историю (из Field)
        /// </summary>
        internal List<string> FieldsHistory
        {
            get
            {
                if (!_InitFieldsHistory)
                {
                    _FieldsHistory = new List<string>();

                    foreach (XElement xmlField in this.SettingList.Element("Fields").Elements("Field"))
                    {
                        string field = xmlField.Attribute("name") != null ? xmlField.Attribute("name").Value : string.Empty;
                        if (string.IsNullOrEmpty(field))
                            throw new Exception(string.Format("Некорректная настрока для '{0}' ", xmlField.Value));

                        _FieldsHistory.Add(field);
                    }

                    _FieldsHistory = _FieldsHistory.Distinct().ToList();
                    _InitFieldsHistory = true;

                }
                return _FieldsHistory;
            }
        }

        private bool __init_GroupInterval = false;
        private double _GroupInterval;
        /// <summary>
        /// Интервал группировки
        /// </summary>
        internal double GroupInterval
        {
            get
            {
                if (!__init_GroupInterval)
                {
                    _GroupInterval = 0d;

                    //это не обязательная настройка
                    XElement element = this.SettingList.Element("GroupSetting");
                    if (element != null)
                    {
                        string value = element.Attribute("Interval")?.Value;
                        if (!string.IsNullOrEmpty(value))
                            if (!double.TryParse(value, out _GroupInterval))
                                throw new Exception($"Не удалось преобразовать '{value}' в дробное число: '{element.Value}'");

                    }


                    __init_GroupInterval = true;
                }
                return _GroupInterval;
            }

        }

        private bool __init_GroupForceElements = false;
        private int _GroupForceElements;
        /// <summary>
        /// Насильно группировать первые XXX элементов
        /// </summary>
        internal int GroupForceElements
        {
            get
            {
                if (!__init_GroupForceElements)
                {
                    _GroupForceElements = 0;

                    //это не обязательная настройка
                    XElement element = this.SettingList.Element("GroupSetting");
                    if (element != null)
                    {
                        string value = element.Attribute("ForceGroupFirst")?.Value;
                        if (!string.IsNullOrEmpty(value))
                            if (!int.TryParse(value, out _GroupForceElements))
                                throw new Exception($"Не удалось преобразовать '{value}' в целое число: '{element.Value}'");

                    }

                    __init_GroupForceElements = true;
                }
                return _GroupForceElements;
            }

        }
    }
}
