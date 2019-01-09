using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using WSSC.V4.SYS.DBFramework;
using WSSC.V4.SYS.Fields.Files;

namespace WSSC.V4.DMS.MMV.Controls.ChangeFieldNotify
{
    /// <summary>
    /// Менеджер получения слепка файлов
    /// </summary>
    internal class FilesVersionSnapshotManager
    {
        /// <summary>
        /// Создание менеджера получения слепка файлов на основании элемента, где хранятся эти файлы
        /// </summary>
        /// <param name="item">Элемент, в котором хранятся файлы</param>
        internal FilesVersionSnapshotManager(DBItem item)
        {
            if (item == null)
            {
                throw new DBException.EmptyParameter("item");
            }

            this.Item = item;
        }

        private DBItem Item { get; set; }

        /// <summary>
        /// Получить слепок версий файлов по переданным полям
        /// </summary>
        /// <param name="fieldsNames">Названия полей, которые могут содержать файлы</param>
        /// <returns>Слепок версий файлов</returns>
        internal List<JSClient.FileDescription> GetSnapshot(IEnumerable<string> fieldsNames)
        {
            List<JSClient.FileDescription> result = new List<JSClient.FileDescription>();

            foreach (string fieldName in fieldsNames)
            {
                DBField field = this.Item.List.GetField(fieldName, true);
                // Проверить, является поле файлом или нет
                if (!field.IsTypeOfFiles())
                {
                    continue;
                }
                // Получить сохраненные файлы
                DBFieldFilesValueCollection filesValueCollection = this.Item.GetValue<DBFieldFilesValueCollection>(fieldName);
                // Сохранить версии файлов
                foreach (DBFieldFilesValue fileValue in filesValueCollection)
                {
                    JSClient.FileDescription fileDescription = new JSClient.FileDescription()
                    {
                        FieldID = field.ID,
                        FileID = fileValue.FileItemID,
                        Version = fileValue.SharePointFile.MajorVersion
                    };
                    result.Add(fileDescription);
                }
            }

            return result;
        }
    }
}
