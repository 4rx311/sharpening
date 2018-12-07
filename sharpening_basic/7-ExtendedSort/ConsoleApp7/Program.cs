using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/* Создать Расширяющий метод для целочисленного массива,
 * который сортирует элементы массива по возрастанию.
 */

namespace ConsoleApp7
{
    static class ExtentionClass
    {
        public static void MySort(this int[] array)
        {
            var result = array.OrderBy(g => g);
            foreach (var i in result)
            {
                Console.Write(i + " ");
            }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            int[] array = { 1, 2, 3, 4, 5, 6, 7, 8, 9 , 10 };
            array.MySort();

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
