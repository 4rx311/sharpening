using System;
using System.IO;
using System.Text.RegularExpressions;

namespace task_3
{
    class Program
    {
        static void Main(string[] args)
        {
            // Init
            MyDirectory dir = new MyDirectory("../../");
            MyFile file = new MyFile(dir.Path, "data.txt");
            MyXML xml = new MyXML();

            xml.LoadDictionaryFromTXT(file.File.FullName);


            //System.Console.WriteLine("Contents = ");
            //foreach (string line in txtLines)
            //{
            //    // Use a tab to indent each line of the file.
            //    Console.WriteLine(TelRegex(line));
            //}



            Console.WriteLine("End of program...");
            Console.ReadKey();
        }


    }
}
