using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;

namespace task_3
{
    /// <summary>
    /// Класс работы с указанной директорией.
    /// </summary>
    class MyDirectory
    {
        #region Properties
        /// <summary>
        /// Путь.
        /// </summary>
        public string Path { get; set; }

        /// <summary>
        /// Объект директории.
        /// </summary>
        private bool __init_Directory;
        private DirectoryInfo _Directory;
        private DirectoryInfo Directory
        {
            get
            {
                if (!__init_Directory)
                {
                    _Directory = new DirectoryInfo(this.Path);
                    __init_Directory = true;
                }
                return _Directory;
            }
        }

        /// <summary>
        /// txt файлы в директории.
        /// </summary>
        private bool __init_Files;
        private FileInfo[] _Files;
        private FileInfo[] Files
        {
            get
            {
                if (!__init_Files)
                {
                    _Files = this.Directory.GetFiles("*.txt");
                    __init_Files = true;
                }
                return _Files;
            }
        }
        #endregion

        /// <summary>
        /// Коснтруктор (директория программы - "..\..\").
        /// </summary>
        /// <param name="path"></param>
        public MyDirectory(string path)
        {
            this.Path = path ?? throw new ArgumentNullException(nameof(path));
        }

        /// <summary>
        /// Выводит подробную информацию о каталоге.
        /// </summary>
        public void DirInfo()
        {
            if (this.Directory.Exists)
            {
                Console.WriteLine("----- Working Directory Info -----");
                Console.WriteLine("FullName    : {0}", this.Directory.FullName);
                Console.WriteLine("Name        : {0}", this.Directory.Name);
                Console.WriteLine("CreationTime: {0}", this.Directory.CreationTime);
                Console.WriteLine("Attributes  : {0}", this.Directory.Attributes.ToString());
                Console.WriteLine("Root        : {0}", this.Directory.Root);
                Console.Write("\n");
            }
        }

        /// <summary>
        /// Выводит сколько файлов с расширением .txt в данной директории найдено.
        /// </summary>
        /// <param name="files"></param>
        public void FilesAmount()
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("Найдено {0} *.txt файлов", this.Files.Length);
            int index = 0;
            foreach (FileInfo file in this.Files)
            {
                Console.WriteLine("{0} - {1}", index, file.Name);
                index++;
            }
            Console.Write("\n");
        }

        /// <summary>
        /// Выводит подробную информацию о каждом файле.
        /// </summary>
        /// <param name="files"></param>
        public void FilesInfo()
        {
            foreach (FileInfo file in this.Files)
            {
                Console.WriteLine("File name : {0}", file.Name);
                Console.WriteLine("File size : {0}", file.Length);
                Console.WriteLine("Creation  : {0}", file.CreationTime);
                Console.WriteLine("Attributes: {0}", file.Attributes.ToString());
                Console.Write("\n");
            }
        }
    }
}
