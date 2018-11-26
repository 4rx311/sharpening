using System;
using System.IO;

namespace InputOutput
{
    class TxtManipulator
    {
        public DirectoryInfo directory; // = new DirectoryInfo(@"..\..\");
        public TxtManipulator(string dir)
        {
            directory = new DirectoryInfo(dir);
            DirTest();
        }

        #region Data Manipulating
        ///<summary> Создает файл с информацией. </summary>
        public static void CreateData(string fileName)
        {
            // Создаем новый файл в корневом каталоге диска D:
            FileInfo file = new FileInfo(@"..\..\" + fileName);             // Создаем файл.           

            #region data writer
            StreamWriter writer = file.CreateText();        // С помощью экземпляра StreamWriter записываем в файл строк текст.
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
            FileStream stream = file.Open(FileMode.OpenOrCreate, FileAccess.Read, FileShare.None);

            // Выводим основную информацию о созданном файле.
            Console.WriteLine("----- File {0} created -----", file.Name);
            Console.WriteLine("Full Name   : {0}", file.FullName);
            Console.WriteLine("Attributes  : {0}", file.Attributes.ToString());
            Console.WriteLine("CreationTime: {0}", file.CreationTime);

            // Закрываем FileStream. 
            stream.Close();
        }

        ///<summary> Выводит содержимое файла. </summary>
        public static void PrintFileData(string fileName)
        {
            Console.WriteLine("Содержимое файла {0}:\n", fileName);

            StreamReader reader = File.OpenText(fileName);              // Выводим информацию из файла на консоль при помощи StreamReader. 
            string input;

            while ((input = reader.ReadLine()) != null)                 // Выводим содержимое файла в консоль.
            {
                Console.WriteLine(input);
            }

            reader.Close();
        }

        #endregion

        #region Info Print
        ///<summary> Выводит подробную информацию о каталоге. </summary>
        public void DirInfo()
        {
            if (directory.Exists)
            {
                Console.WriteLine("----- Working Directory Info -----");
                Console.WriteLine("FullName    : {0}", directory.FullName);
                Console.WriteLine("Name        : {0}", directory.Name);
                Console.WriteLine("CreationTime: {0}", directory.CreationTime);
                Console.WriteLine("Attributes  : {0}", directory.Attributes.ToString());
                Console.WriteLine("Root        : {0}", directory.Root);
                Console.Write("\n");
            }
        }

        ///<summary> Выводит подробную информацию о каждом файле. </summary>
        public static void FilesInfo(FileInfo[] files)
        {
            foreach (FileInfo file in files)
            {
                Console.WriteLine("File name : {0}", file.Name);
                Console.WriteLine("File size : {0}", file.Length);
                Console.WriteLine("Creation  : {0}", file.CreationTime);
                Console.WriteLine("Attributes: {0}", file.Attributes.ToString());
                Console.Write("\n");
            }
        }

        /// <summary> Выводит сколько файлов с расширением .txt в данной директории найдено. </summary>
        public static void FilesAmount(FileInfo[] files)
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("Найдено {0} *.txt файлов", files.Length);
            int index = 0;
            foreach (FileInfo file in files)
            {
                Console.WriteLine("{0} - {1}", index, file.Name);
                index++;
            }
            Console.Write("\n");
        }
        #endregion

        private void DirTest()
        {
            if (!directory.Exists)
                Console.WriteLine("Директория с именем: {0}  не найдена.", directory.FullName);
        }
    }
}
