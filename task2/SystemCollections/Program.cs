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
            MyHashTable table = new MyHashTable();
            table.Print();
            
            //table.Input(table);
            //table.Print();


            MySortedList sort = new MySortedList();
            sort.Print();

            Console.ReadKey();
        }


    }
}
