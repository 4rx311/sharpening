using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System.Threading;

/* Напишите программу, в которой метод будет вызываться рекурсивно.
 * Каждый новый вызов метода выполняется в отдельном потоке
 */

namespace ConsoleApp13
{
    class Program
    {
        static void Go(object num)
        {
            int n = (int)num;
            if (n <= 0) return;

            Thread th = new Thread(Go);

            th.Name = "Thread-" + n;
            th.Start(n - 1);

            Console.WriteLine(th.Name);
        }
        static void Main(string[] args)
        {
            Go(1000);
            Console.ReadKey();
        }
    }
}
