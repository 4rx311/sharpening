using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;

// Несколькими способами создайте коллекцию, в которой можно хранить только целочисленные и вещественные значения,
// по типу «счет предприятия – доступная сумма» соответственно. 

namespace SystemCollections
{
    static class Program
    {
        static void Main(string[] args)
        {
            MyDictGen myDict = new MyDictGen();
            myDict.Print();

            Console.ReadKey();
        }

        private static void PrintList<T>(this IEnumerable<T> intList)
        {
            foreach (T t in intList)
            {
                Console.WriteLine(t);
            }
        }
    }
}
