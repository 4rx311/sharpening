using System;
using System.Collections;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Xml.Linq;
using WSSC.V4.DMS.Fields.TableItems;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Lookup;
using WSSC.V4.SYS.Lib.Data;

using Const = WSSC.V4.DMS.OMK._Consts.Reports.VersionHistory;

namespace WSSC.V4.DMS.OMK.Reports.VersionsHistory
{
    /// <summary>
    /// Класс создания отчета об измененных полях документа
    /// </summary>
    class HistoryBuilder
    {
        #region Properties

        /// <summary>
        /// Карточка документа
        /// </summary>
        private DBItem Item { get; set; }

        private bool __init_ItemVersions;
        private List<DBItemVersion> _ItemVersions;
        /// <summary>
        /// Версии карточки в обратном порядке
        /// </summary>
        private List<DBItemVersion> ItemVersions
        {
            get
            {
                if (!__init_ItemVersions)
                {
                    _ItemVersions = this.Item.Versions != null ? this.Item.Versions.Reverse().ToList() : new List<DBItemVersion>();
                    __init_ItemVersions = true;
                }
                return _ItemVersions;
            }
        }

        private bool __init_Settings = false;
        private Settings _Settings;
        /// <summary>
        /// Настройки из XML
        /// </summary>
        private Settings Settings
        {
            get
            {
                if (!__init_Settings)
                {
                    _Settings = new Settings(this.Item);
                    __init_Settings = true;
                }
                return _Settings;
            }
        }

        private bool _InitFieldsVersioned;
        private List<DBField> _FieldsVersioned;
        /// <summary>
        /// Версионные поля для xml-узлов Field 
        /// </summary>
        private List<DBField> FieldsVersioned
        {
            get
            {
                if (!_InitFieldsVersioned)
                {
                    _FieldsVersioned = new List<DBField>();

                    //получаем все поля для истории, однако если поле не версионное - генерим ошибку
                    foreach (string fieldName in this.Settings.FieldsHistory)
                    {
                        DBField field = this.Item.List.GetField(fieldName, true);
                        if (!field.Versioned)
                            throw new Exception(string.Format("Поле '{0}' не является версионным", fieldName));

                        //Если регистр не совпадает
                        if (field.Name != fieldName)
                            throw new Exception(string.Format("В настройке для списка'{0}' поле '{1}' должно иметь название '{2}'", this.Item.List, fieldName, field.Name));

                        _FieldsVersioned.Add(field);
                    }

                    _InitFieldsVersioned = true;
                }
                return _FieldsVersioned;
            }
        }

        private bool _InitFieldsValue;
        private Dictionary<string, string[]> _FieldsValue;
        /// <summary>
        /// Значения полей для xml-узлов Field которые попадают в историю
        /// </summary>
        private Dictionary<string, string[]> FieldsValue
        {
            get
            {
                if (!_InitFieldsValue)
                {
                    _FieldsValue = this.GetFieldsValues(this.FieldsVersioned, this.ItemVersions);
                    _InitFieldsValue = true;
                }
                return _FieldsValue;
            }
        }

        private HashSet<int> DeletedTableElementsID = new HashSet<int>();

        private bool _InitTableElementRows;
        private IList<TIFRow> _TableElementRows;
        /// <summary>
        /// Строки(они же карточки табличного элемента)
        /// </summary>
        private IList<TIFRow> TableElementRows
        {
            get
            {
                if (!_InitTableElementRows)
                {
                    //Если нет в настройке табличного элемента - выходим вернув пустой словарь
                    if (string.IsNullOrEmpty(this.Settings.TableElementName))
                        return null;

                    //Получаем табличный элемент и далее все строки(карточки) в нём
                    TableItemsField tableElementField = this.Item.List.GetField<TableItemsField>(this.Settings.TableElementName, true);
                    _TableElementRows = tableElementField?.GetRows(this.Item);

                    _InitTableElementRows = true;
                }
                return _TableElementRows;
            }
        }

        private bool _InitTableElementSourceFields;
        private List<string> _TableElementSourceFields;
        /// <summary>
        /// Поля которые указывают на ID карточек табличных элементов
        /// </summary>
        private List<string> TableElementSourceFields
        {
            get
            {
                if (!_InitTableElementSourceFields)
                {
                    _TableElementSourceFields = new List<string>();

                    XElement fieldsRoot = this.Settings.SettingList.Element("TableElemetSettings");
                    IEnumerable<string> elements = fieldsRoot?.Elements()?.Where(node => node.Name == "SourceField").Select(node => node.Attribute("name")?.Value);

                    //Если есть поля, необходимо проверить их
                    if (elements != null)
                    {
                        _TableElementSourceFields.AddRange(elements);
                        DBList tableElementList = this.TableElementRows.FirstOrDefault()?.Item.List;
                        if (tableElementList != null)
                        {
                            string missingField = elements.FirstOrDefault(t => !tableElementList.ContainsField(t));
                            if (missingField != null)
                                throw new Exception($"Для табличных элементов на списке '{ tableElementList.Name}' отсутствует поле '{missingField}' из настройки");
                        }
                    }
                    _InitTableElementSourceFields = true;
                }
                return _TableElementSourceFields;
            }
        }

        private bool _InitRelevantVersions;
        private Dictionary<int, Dictionary<int, int>> _RelevantVersions;
        /// <summary>
        /// Номер версии документа  : ИД карточки табличного элемента : версия табличного элемента для версии документа
        /// </summary>
        private Dictionary<int, Dictionary<int, int>> RelevantVersions
        {
            get
            {
                if (!_InitRelevantVersions)
                {
                    _RelevantVersions = new Dictionary<int, Dictionary<int, int>>();
                    DBConnection connection = this.Item.Site.DataAdapter.Connection;

                    //Имя таблицы документа
                    string sqlTableNameItem = this.Item.IsArchive ? this.Item.List.TableInfo.VersionsTable.ArchiveTable.GetQueryName(connection)
                                                                  : this.Item.List.TableInfo.VersionsTable.GetQueryName(connection);


                    DBItem tableElementItem = this.TableElementRows.First().Item;
                    string sqlTableNameTableElementMain = tableElementItem.List.TableInfo.GetQueryName(connection);
                    string sqlTableNameTableElementVersion = tableElementItem.List.TableInfo.VersionsTable.GetQueryName(connection);
                    string sqlTableNameTableElementVersionArchive = tableElementItem.List.TableInfo.VersionsTable.ArchiveTable?.GetQueryName(connection);

                    StringBuilder query = new StringBuilder();
                    StringBuilder sourceFields = new StringBuilder();
                    string sourceFieldsCondition = string.Concat(this.TableElementSourceFields.Select(
                                                                 (field, index) => index == 0 ? $@"[{field}] = {this.Item.ID} " : $@" OR [{field}] = {this.Item.ID}").ToArray());

                    //Формируем:
                    //таблицу документа
                    //таблицу с ИД карточек табличного элемента
                    //таблицу с карточками табличного элемента
                    query.AppendLine($@" WITH document AS (SELECT [TimeModified], [ID], [VersionNumber] 
                                         FROM {sqlTableNameItem} WITH(NOLOCK)
				                         WHERE [ID] = {this.Item.ID}), tableElementIDs AS (SELECT [ID], [Deleted] 
                                                                                           FROM {sqlTableNameTableElementMain} WITH(NOLOCK)
					                                                                       WHERE {sourceFieldsCondition}), tableElement AS (SELECT [TimeModified], [ID], [VersionNumber] 
                                                                                                                                            FROM {sqlTableNameTableElementVersion} WITH(NOLOCK)
				                                                                                                                            WHERE [ID] IN (SELECT ID FROM tableElementIDs WITH(NOLOCK))");
                    //если есть архивная версия - берём из неё тоже
                    if (!string.IsNullOrEmpty(sqlTableNameTableElementVersionArchive))
                    {
                        query.AppendLine($@"UNION
                                            SELECT [TimeModified], [ID], [VersionNumber] 
                                            FROM {sqlTableNameTableElementVersionArchive} WITH(NOLOCK)
                                            WHERE [ID] IN (SELECT ID FROM tableElementIDs WITH(NOLOCK))");
                    }
                    query.AppendLine("),");
                    query.AppendLine(@"deletedTableElements AS (
                                        SELECT elementsMaxVersion.[ID], elementsMaxVersion.[VersionNumber], tableElement.[TimeModified] 
                                        FROM (SELECT [ID], MAX([VersionNumber]) AS [VersionNumber]
										      FROM tableElement WITH(NOLOCK)
						 				      GROUP BY [ID]
										     ) AS elementsMaxVersion
										RIGHT JOIN tableElement ON tableElement.ID = elementsMaxVersion.[ID] AND tableElement.VersionNumber =  elementsMaxVersion.VersionNumber																								  
						                WHERE elementsMaxVersion.[ID] IN (SELECT [ID] 
                                                                          FROM tableElementIDs WITH(NOLOCK)
											                              WHERE [Deleted] = 1)
                                                                         ),
                                        deletedInfo AS (SELECT * 
                                                        FROM (SELECT deletedTableElements.ID AS tiID, 
                                                              MIN(document.VersionNumber) 
                                                              OVER (PARTITION BY deletedTableElements.ID) AS itemVersion 
                                                              FROM deletedTableElements WITH(NOLOCK)
                                                              LEFT JOIN  document ON deletedTableElements.TimeModified < document.TimeModified) AS deletedTempInfo
                                                              GROUP BY deletedTempInfo.tiID, deletedTempInfo.itemVersion
                                                       )");

                    //находим 
                    query.AppendLine($@"SELECT tableElement.ID AS tableElementID, tableElement.VersionNumber AS tableElementVersion, document.VersionNumber AS itemVersion
                                        FROM tableElement WITH(NOLOCK)
                                        RIGHT JOIN document ON tableElement.TimeModified <= document.TimeModified
                                        AND tableElement.TimeModified IN (SELECT TimeModified 
									                                      FROM (SELECT ROW_NUMBER() OVER(PARTITION BY ID ORDER BY TimeModified DESC) AS rowNumber, ID, VersionNumber, TimeModified
										                                        FROM tableElement WITH(NOLOCK)
										                                        WHERE TimeModified <= document.TimeModified 
										                                        ) NewestVersions WHERE NewestVersions.rowNumber = 1
								                                          )
				                        WHERE tableElement.ID NOT IN (SELECT [tiID] FROM deletedInfo WITH(NOLOCK))
										OR (tableElement.ID IN (SELECT [tiID] FROM deletedInfo WITH(NOLOCK) where document.VersionNumber = deletedInfo.[itemVersion]))
                                        ORDER BY itemVersion ASC");

                    DataTable dbTable = this.Item.Site.DataAdapter.GetDataTable(query.ToString());
                    Dictionary<int, int> сonformity;
                    foreach (DataRow dbRow in dbTable.Rows)
                    {
                        int version = dbRow.Field<int>("itemVersion");
                        сonformity = new Dictionary<int, int>();
                        int? key = dbRow.Field<int?>("tableElementID");
                        int? value = dbRow.Field<int?>("tableElementVersion");

                        if (!_RelevantVersions.ContainsKey(version))
                        {
                            if (key.HasValue && value.HasValue)
                                сonformity.Add(key.Value, value.Value);
                            _RelevantVersions.Add(version, сonformity);
                        }
                        else
                        {
                            //_RelevantVersions[version].ContainsKey(key.Value) это костыль!
                            if (key.HasValue && value.HasValue && !_RelevantVersions[version].ContainsKey(key.Value))
                                _RelevantVersions[version].Add(key.Value, value.Value);
                        }
                    }
                    _InitRelevantVersions = true;
                }
                return _RelevantVersions;
            }
        }

        private bool _InitTableElementItemVersions;
        Dictionary<int, Dictionary<int, DBItemVersion>> _TableElementItemVersions;
        /// <summary>
        /// ID табличного элемента : новер версии табличого эл. : версия
        /// </summary>
        Dictionary<int, Dictionary<int, DBItemVersion>> TableElementItemVersions
        {
            get
            {
                if (!_InitTableElementItemVersions)
                {
                    _TableElementItemVersions = new Dictionary<int, Dictionary<int, DBItemVersion>>();

                    //если табличный элемент пуст то возвращаем пустой словарь
                    if (this.TableElementRows == null || this.TableElementRows.Count == 0)
                        return _TableElementItemVersions;

                    //если таблица пуста - выходим вернув пустой словарь
                    if (this.TableElementRows == null || this.TableElementRows.Count == 0)
                        return _TableElementItemVersions;

                    //Каждая строка это карточка и для каждой карточки помещаем в словарь версии                    
                    for (int i = 0; i < this.TableElementRows.Count; i++)
                    {
                        //создаём словарь - номер версии : версия
                        //и если он не пустой то добавляем его
                        Dictionary<int, DBItemVersion> versions = this.TableElementRows[i].Item.Versions?.ToDictionary(t => t.VersionNumber, t => t);
                        if (versions != null && versions.Count != 0)
                            _TableElementItemVersions.Add(this.TableElementRows[i].Item.ID, versions);
                    }

                    _InitTableElementItemVersions = true;
                }

                return _TableElementItemVersions;
            }
        }

        private bool _InitTableElementFieldsVersioned;
        List<DBField> _TableElementFieldsVersioned;
        /// <summary>
        /// Версионные поля для табличных элементов
        /// </summary>
        List<DBField> TableElementFieldsVersioned
        {
            get
            {
                if (!_InitTableElementFieldsVersioned)
                {
                    //В табличном элементе все карточки из одной версии, поэтому берём любую и получаем для неё все версионные поля
                    _TableElementFieldsVersioned = this.TableElementRows.First().Item.List.Fields.Where(field => field.Versioned && !field.IsSystem).ToList();
                    _InitTableElementFieldsVersioned = true;
                }
                return _TableElementFieldsVersioned;
            }
        }

        #endregion


        #region Methods

        /// <summary>
        /// Получаем значение поля версии карточки
        /// </summary>
        /// <param name="field">Поле</param>
        /// <param name="version">Версия карточки</param>
        internal string GetFieldValue(DBField field, DBItemVersion version)
        {
            string value = string.Empty;
            switch (field.Type)
            {
                case "DBFieldDateTime":
                    DateTime date = version.GetValue<DateTime>(field.Name);
                    value = date != DateTime.MinValue ? date.ToString("dd.MM.yyyy") : string.Empty;
                    break;
                case "DBFieldBoolean":
                    bool boolValue = version.GetValue<bool>(field.Name);
                    value = boolValue ? "Да" : "Нет";
                    break;
                case "DBFieldLookupSingle":
                    value = version.GetValue<DBFieldLookupValue>(field.Name)?.LookupText;
                    break;
                case "DBFieldLookupMulti":
                    List<DBFieldLookupValue> objects = version.GetValue<DBFieldLookupValueCollection>(field.Name).ToList();
                    value = objects != null ? string.Join("; ", objects.FindAll(t => !string.IsNullOrEmpty(t.LookupText)).Select(t => t.LookupText).ToArray())?.TrimEnd(' ') : string.Empty;
                    break;
                case "DBFieldChoice":
                    object menu = version.GetValue(field.Name);

                    if (menu != null)
                    {
                        string valStr = menu as string;
                        IEnumerable valCollection = menu as IEnumerable;

                        //если это строка
                        if (valStr != null)
                        {
                            value = valStr;
                        }
                        //если коллекция
                        else if (valCollection != null)
                        {
                            value = string.Join("; ", valCollection.Cast<string>().ToArray());
                        }
                        else
                        {
                            throw new Exception($"Для поля '{field.Name}' типа 'Меню' не определен тип");
                        }
                    }
                    else
                        value = string.Empty;
                    break;
                default:
                    value = version.GetValue(field.Name)?.ToString();
                    break;
            }
            return value;
        }

        /// <summary>
        /// Получаем словарь [имя поля] : массив значений версионных полей
        /// </summary>
        /// <param name="fields">Коллекция версионных полей</param>
        /// <param name="versions">Коллекция версий</param>
        internal Dictionary<string, string[]> GetFieldsValues(List<DBField> fields, List<DBItemVersion> versions)
        {
            Dictionary<string, string[]> result = new Dictionary<string, string[]>();

            //Для каждого поля получаем значения всех версий и добавлям их в словарь
            foreach (DBField field in fields)
            {
                if (field.ValueLoadingType != DBFieldValueIOType.Directly)
                    field.ValueLoadingType = DBFieldValueIOType.Directly;

                List<string> values = new List<string>();
                foreach (DBItemVersion version in versions)
                {
                    //Добавляем поле в массив значений и если оно не пустое то кодируем для html
                    string value = this.GetFieldValue(field, version);
                    string content = !string.IsNullOrEmpty(value) ? value.ToString() : string.Empty;
                    values.Add(content);
                }
                result.Add(field.Name, values.ToArray());
            }
            return result;
        }

        /// <summary>
        /// Получаем ID табличного элемена и список полей которые были в нём изменены для указанной версии документа
        /// </summary>
        /// <param name="versionNumber">Новер версии</param>
        /// <returns>Детализация об изменения в табличном элементе</returns>
        private string GetTableElementChangedFields(int versionNumber)
        {
            StringBuilder result = new StringBuilder();

            //Если нет табличных элементов - выходим, т.к. и проверять нечего, ибо их нельзя удалить из карточки
            if (this.TableElementRows.Count == 0 || !this.RelevantVersions.TryGetValue(versionNumber, out Dictionary<int, int> currentTableElements))
                return result.ToString();

            //Для первой версии - проверить наличие табичных элементов, а для остальных их изменения            
            Dictionary<int, int> previousTableElements;
            if (versionNumber == 1)
                previousTableElements = null;
            else
                this.RelevantVersions.TryGetValue(versionNumber - 1, out previousTableElements);

            if (currentTableElements.Count != previousTableElements?.Count)
                return Const.CellTableElementChanged;

            //currentTableElements - Словарь из карточек и их версий для определённой версии versionNumber
            //currentElement.Key - ИД карточки; currentElement.Value - версия карточки
            foreach (KeyValuePair<int, int> currentElement in currentTableElements)
            {
                int currentItemID = currentElement.Key;             //ID этой карточки
                int currentItemVersion = currentElement.Value;      //Версий этой карточки              
                this.TableElementItemVersions.TryGetValue(currentItemID, out Dictionary<int, DBItemVersion> currentDic);

                //Если этой карточки нет для предыдущей версии или номера их версий не совпадают - проверям какие поля изменены
                //Или карточка была удалена
                if (!previousTableElements.TryGetValue(currentItemID, out int previousItemVersion) || previousItemVersion != currentItemVersion
                    || currentDic == null)
                {
                    //Проверка на удаление карточки                    
                    if (currentDic == null)
                    {
                        return previousTableElements.ContainsKey(currentItemID) ? Const.CellTableElementChanged : result.ToString();
                    }

                    DBItemVersion currentVersion = currentDic[currentItemVersion];
                    DBItemVersion previousVersion = currentDic[previousItemVersion];

                    //Получаем версионные поля и их значения для текущей и предыдущей версии
                    //и если хоть одно поле текущей версии не равно предыдущей - возвращаем инфу об изменении
                    Dictionary<string, string[]> fieldsValues = this.GetFieldsValues(this.TableElementFieldsVersioned, new List<DBItemVersion> { currentVersion, previousVersion });
                    if (fieldsValues.Any(field => field.Value.First() != field.Value.Last()))
                        return Const.CellTableElementChanged;
                }
            }
            return result.ToString();
        }

        /// <summary>
        /// Получение модели данных об изменении версии
        /// </summary>
        /// <returns></returns>
        internal List<HistoryModel> BuildHistory()
        {
            List<HistoryModel> result = new List<HistoryModel>();
            //int systemUserID = this.Item.Site.SystemAccount.ID;

            //Получаем все данные о изменениях полей для всех версий кроме первой
            for (int i = 0; i < this.ItemVersions.Count - 1; i++)
            {
                DBItemVersion version = this.ItemVersions[i];
                HistoryModel model = new HistoryModel()
                {
                    Version = version.VersionNumber,
                    Date = version.TimeModified,
                    Author = version.Editor,
                    Stage = version.GetValue("Этап").ToString(),
                    ChangedFields = new List<string>()
                };

                foreach (string field in this.Settings.SettingFields)
                {
                    string value = string.Empty;

                    //поле если табличный элемент
                    if (field == this.Settings.TableElementName)
                    {
                        value = this.GetTableElementChangedFields(version.VersionNumber);
                    }
                    //остальные поля
                    else
                    {
                        if (this.FieldsValue[field][i + 1] != this.FieldsValue[field][i])
                        {
                            value = !string.IsNullOrEmpty(this.FieldsValue[field][i]) ? this.FieldsValue[field][i] : Const.EmptyCell;
                        }
                    }

                    //если поле изменялось оно не будет пустым - записываем его в словарь
                    if (!string.IsNullOrEmpty(value))
                    {
                        model.ChangedFields.Add(field);
                    }
                }
                result.Add(model);
            }
            return result;
        }

        internal Dictionary<string, string> BuildFieldsHistory(int itemVersion)
        {
            Dictionary<string, string> result = new Dictionary<string, string>();
            DBItemVersion version = this.ItemVersions[this.ItemVersions.Count - itemVersion - 2];
            foreach (string field in this.Settings.SettingFields)
            {
                
                string value = string.Empty;

                //поле если табличный элемент
                if (field == this.Settings.TableElementName)
                {
                    value = this.GetTableElementChangedFields(version.VersionNumber);
                }
                //остальные поля
                else
                {
                    if (this.FieldsValue[field][itemVersion + 1] != this.FieldsValue[field][itemVersion])
                    {
                        value = !string.IsNullOrEmpty(this.FieldsValue[field][itemVersion]) ? this.FieldsValue[field][itemVersion] : Const.EmptyCell;
                    }
                }

                //если поле изменялось оно не будет пустым - записываем его в словарь
                if (!string.IsNullOrEmpty(value))
                {
                    result.Add(field, value);
                }
            }
            return result;
        }
        #endregion

        /// <summary>
        /// Конструктор
        /// </summary>
        /// <param name="item"></param>
        public HistoryBuilder (DBItem item)
        {
            this.Item = item;
        }
    }
}