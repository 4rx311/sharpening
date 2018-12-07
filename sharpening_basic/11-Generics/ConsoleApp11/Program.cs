using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp11
{
    public static class ExtentionClass
    {

        public static void GetArray<T>(this List<T> list)
        {
            T[] array = list.ToArray();
            for (int i = 0; i < array.Length; i++)
            {
                Console.Write(array[i] + " ");
            }
        }
    }
    class Program
    {
        static void Main(string[] args)
        {
            
            var ints = new List<int>();
            ints.Add(7);
            ints.Add(5);
            ints.Add(9);

            Console.WriteLine();

            ints.GetArray();

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
