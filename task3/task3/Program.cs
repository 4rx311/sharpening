using System;
using System.IO;

// ------------------_task_3_--------------------------------------------------------
// Создайте файл, запишите в него произвольные данные и закройте файл.
// Затем снова откройте этот файл, прочитайте из него данные и выведете их на консоль
// ------------------_task_4_--------------------------------------------------------
// Напишите регулярное выражение, которое бы соответствовало номеру телефона в формате +x(xxx) xxx-xx-xx, где x – это цифра.
// ------------------_task_5_--------------------------------------------------------
// Создайте.xml файл, который соответствовал бы следующим требованиям: 
// •	имя файла: TelephoneBook.xml 
// •	корневой элемент: “MyContacts” 
// •	тег “Contact”, и в нем должно быть записано имя контакта и атрибут “TelephoneNumber” со значением номера телефона.
// •	сделать несколько тегов “Contact” с разными данными.
// Написать консольное приложение, которое будет искать контакт по ФИО или по номеру телефона

namespace InputOutput
{
    class Program
    {
        static void Main(string[] args)
        {
            var directory = new DirectoryInfo(@"..\..\");
            if (directory.Exists)
            {
                FileInfo[] files = directory.GetFiles("*.txt");
                FilesAmount(files);

                
                // читаем содержимое файла(ов)
                // записываем данные с файлов в новый файл
                // читаем реузльтирующий файл

            }
            else
            {
                Console.WriteLine("Директория с именем: {0}  не существует.", directory.FullName);
            }
            Console.ReadKey();
        }
        #region Data Manipulating
        ///<summary> Создает файлы с информацией. </summary>
        static void CreateData()
        {
            var stream = new FileStream("Test.dat", FileMode.OpenOrCreate, FileAccess.ReadWrite);
        }
        #endregion

        #region Info Print
        ///<summary> Выводит подробную информацию о каталоге. </summary>
        static void DirInfo(DirectoryInfo directory)
        {
                Console.WriteLine("++++++Working+Directory+Info++++++");
                Console.WriteLine("FullName    : {0}", directory.FullName);
                Console.WriteLine("Name        : {0}", directory.Name);
                Console.WriteLine("CreationTime: {0}", directory.CreationTime);
                Console.WriteLine("Attributes  : {0}", directory.Attributes.ToString());
                Console.WriteLine("Root        : {0}", directory.Root);
                Console.Write("\n");
    }

        ///<summary> Выводит подробную информацию о каждом файле. </summary>
        static void FilesInfo(FileInfo[] files)
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
        static void FilesAmount(FileInfo[] files)
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
    }
}
