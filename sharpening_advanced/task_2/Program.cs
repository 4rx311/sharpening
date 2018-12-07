using System;
using System.Collections;
using System.Collections.Generic;
using task_2.Generics;

// Несколькими способами создайте коллекцию, в которой можно хранить только целочисленные и вещественные значения,
// по типу «счет предприятия – доступная сумма» соответственно. 

namespace task_2
{
    static class Program
    {
        static void Main(string[] args)
        {
            MyDictionaryGen myDict = new MyDictionaryGen();
            MySortedListGen myList = new MySortedListGen();
            Print(myDict.dict);
            Print(myList.list);

            Console.ReadKey();
        }

        public static void Print(Dictionary<int, int> dict)
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("Dictionary:");
            Console.WriteLine("Number:  Amount: ");
            foreach (var value in dict)
            {
                Console.WriteLine("{0} \t {1}", value.Key, value.Value);
            }
        }

        public static void Print(SortedList<int, int> list)
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("SortedList:");
            Console.WriteLine("Amount:  Number:");
            foreach (var value in list)
            {
                Console.WriteLine("{0} \t {1}", value.Key, value.Value);
            }
        }
    }
}
