using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;

namespace ConsoleApp14
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

            SetColor(n);
            Console.WriteLine(th.Name);
        }

        static void SetColor(int n)
        {
            if (n == 1) Console.ForegroundColor = ConsoleColor.White;
            else if (n == 2) Console.ForegroundColor = ConsoleColor.Green;
            else Console.ForegroundColor = ConsoleColor.DarkGreen;
        }

        static void Main(string[] args)
        {
            Go(20);
            Console.ReadKey();
        }
    }
}
