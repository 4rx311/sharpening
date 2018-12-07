using System;
using System.IO;
using System.Text.RegularExpressions;

namespace task_3
{
    class Program
    {
        static void Main(string[] args)
        {

            MyDirectory dir = new MyDirectory("../../");
            dir.FilesAmount();

            MyFile file = new MyFile(dir.Path, "data.txt");
            file.FileTextFiller();
            Console.WriteLine("File initialized...");
            Console.ReadKey();

            dir.FilesAmount();
            file.PrintFileData();

            Regex regex = new Regex(@"\d{3}-\d{3}-\d{4}");

            Console.ReadKey();
        }
    }
}
