using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp10
{
    /*  Создайте четыре лямбда оператора для выполнения арифметических действий:
     *  (Add - сложение, Sub - вычитание, Mul - умножение, Div - деление).
     *  Каждый лямбда оператор должен принимать два аргумента и возвращать результат вычисления.
     *  Лямбда оператор деления дожен делать проверку деления на ноль.
     */

    class Program
    {
        static void Main(string[] args)
        {
            Func<int, int, int> Add = (x, y) => x + y;
            Func<int, int, int> Sub = (x, y) => x - y;
            Func<int, int, int> Mul = (x, y) => x * y;
            Func<int, int, int> Div = (x, y) => y == 0 ? 0 : x / y;

            Console.Write("Input x: ");
            int arg1 = int.Parse(Console.ReadLine());
            Console.Write("Input y: ");
            int arg2 = int.Parse(Console.ReadLine());
            int result = 0;

            Console.WriteLine("Choose operation:\n" +
                              "\t 1- Add\n" +
                              "\t 2- Sub\n" +
                              "\t 3- Mul\n" +
                              "\t 4- Div\n");

            int caseSwitch = int.Parse(Console.ReadLine());


            switch (caseSwitch)
            {
                case 1:
                    result = Add(arg1, arg2);
                    Console.WriteLine(result);
                    break;
                case 2:
                    result = Sub(arg1, arg2);
                    Console.WriteLine(result);
                    break;
                case 3:
                    result = Mul(arg1, arg2);
                    Console.WriteLine(result);
                    break;
                case 4:
                    result = Div(arg1, arg2);
                    Console.WriteLine(result);
                    break;
            }

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
