using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace task_3
{
    class MyFile
    {
        #region Properies
        /// <summary>
        /// Путь до файла.
        /// </summary>
        public string FilePath { get; set; }

        /// <summary>
        /// Имя файла.
        /// </summary>
        public string FileName { get; set; }

        private bool __init_File;
        private FileInfo _File;
        /// <summary>
        /// Инициализация файла (Lazy propery).
        /// </summary>
        private FileInfo File
        {
            get
            {
                if (!__init_File)
                {
                    _File = new FileInfo(this.FilePath + this.FileName);
                    if (_File == null) throw new Exception("файл не проинициализирован");
                    __init_File = true;
                }
                return _File;
            }
        }
        #endregion

        /// <summary>
        /// Создает новый файл и заполяет его данными
        /// </summary>
        public void FileTextFiller()
        {
            #region data writer
            StreamWriter writer = this.File.CreateText();        // С помощью экземпляра StreamWriter записываем в файл строк текст.
            writer.WriteLine("Административные подразделения:");
            writer.WriteLine("Отдел документационного обеспечения 8(499) 245-06-12");
            writer.WriteLine("Отдел платных образовательных услуг 8(495) 708-33-94");
            writer.WriteLine("Отдел текущего планирования и контроля учебного процесса 8(495) 708-36-99");
            writer.WriteLine("Отдел планирования и финансового контроля 8(499) 245-24-17");
            writer.Write(writer.NewLine);
            writer.WriteLine("Управление кадров:");
            writer.WriteLine("Начальника Управления кадров 8(499) 245 - 11 - 13");
            writer.WriteLine("Отдел по работе со студентами и выпускникам 8(499) 245-32-02");
            writer.WriteLine("Отдел по работе с персоналом(сотрудники) 8(499) 245-25-39");
            writer.WriteLine("Отдел по работе с персоналом 8(495) 708-33-37");
            writer.Write(writer.NewLine);
            writer.WriteLine("Бухгалтерия:");
            writer.WriteLine("Сектор по учету ЗП  8(499) 246-50-89, 8(499) 245-25-53");
            writer.WriteLine("Сектор по налоговому учету 8(499) 245-33-50");
            writer.WriteLine("Сектор по учету стипендий 8(499) 255-23-84");
            writer.WriteLine("Сектор по учету финансовых и нефинансовых активов, обязательств 8(499) 245-17-32");
            writer.Close();
            #endregion

            // FileMode.OpenOrCreate - ЕСЛИ: существует ТО: открыть ИНАЧЕ: создать новый
            // FileAccess.Read - только для чтения,
            // FileShare.None - Совместный доступ - Нет.
            FileStream stream = this.File.Open(FileMode.OpenOrCreate, FileAccess.Read, FileShare.None);

            // Выводим основную информацию о созданном файле.
            Console.WriteLine("----- File {0} created -----", this.File.Name);
            Console.WriteLine("Full Name   : {0}", this.File.FullName);
            Console.WriteLine("Attributes  : {0}", this.File.Attributes.ToString());
            Console.WriteLine("CreationTime: {0}", this.File.CreationTime);

            // Закрываем FileStream. 
            stream.Close();
        }

        public void PrintFileData()
        {
            Console.WriteLine($"Содержимое файла {this.FileName}:\n");

            StreamReader reader = this.File.OpenText();       // Выводим информацию из файла на консоль при помощи StreamReader. 

            string content = "";
            while ((content = reader.ReadLine()) != null)       // Выводим содержимое файла в консоль.
                Console.WriteLine(content);

            reader.Close();
        }

        /// <summary>
        /// Коснтруктор.
        /// </summary>
        /// <param name="path">Путь до файла.</param>
        /// <param name="name">Имя файла.</param>
        public MyFile(string path, string name)
        {
            this.FilePath = path ?? throw new ArgumentNullException(nameof(path));
            this.FileName = name ?? throw new ArgumentNullException(nameof(name));
        }

    }
}
