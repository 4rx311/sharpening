using System;
using System.IO;
using System.Text.RegularExpressions;

namespace task_3
{
    class Program
    {
        static void Main(string[] args)
        {

            //MyDirectory dir = new MyDirectory("../../");
            //dir.FilesAmount();

            //MyFile file = new MyFile(dir.Path, "data.txt");
            //file.FileTextFiller();
            //Console.WriteLine("File initialized...");
            //Console.ReadKey();

            //dir.FilesAmount();
            //file.PrintFileData();

            string input = "Отдел документационного обеспечения 8(499) 245-06-12";
            string pattern = @"\d{1}[(]\d{3}[)] \d{3}-\d{2}-\d{2}";
            Regex regex = new Regex(pattern);

            MatchCollection matches = regex.Matches(input);
            if (matches.Count > 0)
            {
                foreach (Match match in matches)
                    Console.WriteLine(match.Value);
            }

            Console.WriteLine("End of program...");
            Console.ReadKey();
        }
    }
}
