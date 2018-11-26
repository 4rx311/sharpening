using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

// Несколькими способами создайте коллекцию, в которой можно хранить только целочисленные и вещественные значения,
// по типу «счет предприятия – доступная сумма» соответственно. 

namespace SystemCollections
{
    class Program
    {
        static void Main(string[] args)
        {
            Hashtable table = new Hashtable();

            table["11"] = 100000;

            table.Add("kali", 100000);
            table.Add("debian", 1000000);
            table.Add("ubuntu", 1000000);
            table.Add("centos", 1000000);

            foreach (DictionaryEntry name in table)
            {
                Console.WriteLine("{0} - {1}", name.Key, name.Value);
            }

            Console.ReadKey();
        }
    }
}
