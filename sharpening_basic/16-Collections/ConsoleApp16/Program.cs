using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/* Создайте метод, который в качестве аргумента принимает массив целых чисел и возвращает коолекцию всех четных чисел массива.
 * Для формирования коллекции используйте оператор yield.
 */

namespace ConsoleApp16
{
    class Program
    {
        static IEnumerable<int> GetNumbers(int[] array)
        {
            var newArray = 0;
            for (int i = 0; i < array.Length; i++)
            {
                if (array[i]%2 == 0)
                    yield return newArray = array[i];
            }
        }
        static void Main(string[] args)
        {
            int[] arr = { 1, 2, 3, 4, 5, 6, 7, 8, 9, 0 };

            foreach (var number in GetNumbers(arr))
                Console.WriteLine(number);

            Console.ReadLine();
        }
    }
}
