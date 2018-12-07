using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/*  Создайте адстрактный класс Figure и интерфейс IFigure. 
 *  В интерфейсе и абстрактном классе создайте методы int int GetSquare()
 *  и int GetPerimetr().
 *  Создайте производный класс Rectangle от базового класса Figure и Circle 
 *  от базового интерфейся IFigure.
 *  Написать программу, которая выводит площадь 
 *  и периметр (длину окружности) прямоугольника и круга.
 */

namespace ConsoleApp5
{
    abstract class Figure
    {
        public int N { get; set; }
        public int B { get; set; }

        public virtual int GetSquare()
        {
            return this.N * this.B;
        }
        
        public virtual int GetPerimetr()
        {
            return this.N + this.B;
        }

        public Figure() { }

        public Figure(int a, int b)
        {
            this.N = a;
            this.B = b;
        }
    }

    interface IFigure
    {
        double GetSquare();
        double GetPerimetr();

    }

    class Rectangle : Figure
    {
        public Rectangle(int n, int b) : base(n, b) { }
    }
    
    class Circle : IFigure
    {
        public int R { get; set; }
        public double GetSquare()
        {
            return Math.PI * Math.Pow(this.R, 2);
        }
        public double GetPerimetr()
        {
            return 2 * Math.PI * this.R;
        }

        public Circle( int radius )
        {
            this.R = radius;
        }
    }


    class Program
    {
        static void Main(string[] args)
        {
            Rectangle rect = new Rectangle(12, 20);
            IFigure circle = new Circle(14);

            Console.WriteLine("======Circle=========\n Square: {0}\n Perimetr: {1}\n", circle.GetSquare(), circle.GetPerimetr());
            Console.WriteLine("=====Rectangle=======\n Square: {0}\n Perimetr: {1}\n", rect.GetSquare(), rect.GetPerimetr());

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
