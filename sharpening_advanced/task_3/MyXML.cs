using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml.Linq;

namespace task_3
{
    /// <summary>
    /// Класс работы с телефонной XML книгой
    /// </summary>
    class MyXML
    {
        
        public Dictionary<string, string> dictionary = new Dictionary<string, string>();

        /// <summary>
        /// Преобразует считанные с .txt контактные данные в .xml формат.
        /// </summary>
        /// <param name="fileAddress"></param>
        public void LoadDictionaryFromTXT(string fileAddress)
        {
            string[] inputLines = System.IO.File.ReadAllLines(fileAddress);

            string pattern = @"\d{1}[(]\d{3}[)] \d{3}-\d{2}-\d{2}$";
            Regex regex = new Regex(pattern);

            //string result = "";

            foreach (string line in inputLines)
            {
                Match match = regex.Match(line);
                if (match.Success)
                {
                    dictionary.Add(line.Replace(match.Value, ""),match.Value);
                }
            }
            foreach (var d in dictionary) {
                Console.WriteLine($"Contact: {d.Key}");
                Console.WriteLine($"Number {d.Value}");
            }
        }

        public void XMLinit()
        {
            new XDocument(
                new XElement("MyContacts",
                 new XElement("Contact")));
        }
    }
}
