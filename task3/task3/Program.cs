using System;
using System.IO;
using System.Text.RegularExpressions;

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
            TxtManipulator text = new TxtManipulator(@"..\..\");
            text.DirInfo();
            text.CreateData("data.txt");

            Regex regex = new Regex(@"\d{3}-\d{3}-\d{4}");


            //if (directory.Exists)
            //{
            //    CreateData("data.txt");

            //    public FileInfo[] files = directory.GetFiles("*.txt");

            //    FilesAmount(files);
            //    PrintFileData(directory + "data.txt");
            //}
            //else
            //{
            //    Console.WriteLine("Директория с именем: {0}  не найдена.", directory.FullName);
            //}

            Console.ReadKey();
        }


        static void NumbersSearch()
        {

        }
        

        
    }
}
