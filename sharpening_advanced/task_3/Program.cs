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
            MyXML xml = new MyXML(dir.Path, "MyContacts", file.File.Name);
            xml.WriteData();

            string tel = "8(495) 708-33-94";
            string attr = "TelNumber";
            xml.Search(attr, tel);

            Console.WriteLine("End of program...");
            Console.ReadKey();
        }
    }
}
