using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/*
 * Создать классы Poin и Figure.
 * Класс Point должен содержать два целочисленных поля
 * и одно строковое поле. Создать три свойства с одним методом доступа get.
 * Создать пользовательский конструктор, в теле которого проинициализируйте поля значениями аргументов.
 * Класс Figure должен содержать конструкторы, которые принимают от 3-х до 5-ти
 * аргументов типа Point.
 * Создать два метода: double LengthSide(Point A, Point B), который рассчитывает длину стороны
 * многоугольника; void PerimeterCalculator(), который рассчитывает периметр многоугольника.
 * Написать программу, которая выводит на экран название и периметр многоугольника.
 *
*/


namespace ConsoleApp1
{
    class Point
    {
        int x, y;
        string name;

        public int X { get { return x; } }
        public int Y { get { return y; } }  
        public string Name { get { return name; } }
        
        public Point() : this( 0, 0, "") { }

        
        public Point(int x, int y, string name)
        { 
            this.x = x;
            this.y = y;
            this.name = Console.ReadLine();
        }
    }
    class Figure {
        int amount = 0;
        string name;
        Point[] points;

        public string Name { get { return name; } }

        public void FigureInit(int amount)
        {
            this.amount = amount;
            points = new Point[amount];

            for (int i = 0; i < amount; i++)
            {
                int x, y;
                string name;
                Console.Write("Input x: ");
                x = int.Parse(Console.ReadLine());
                Console.Write("Input y: ");
                y = int.Parse(Console.ReadLine());
                Console.Write("Input name: ");
                name = Console.ReadLine();

                points[i] = new Point(x, y, name);
            }
        }
        
        public double LengthSide(Point A, Point B)
        {
            return Math.Sqrt(Math.Pow(A.X - B.X, 2) + Math.Pow(A.Y - B.Y, 2));
        }

        public double PerimeterCalculator()
        {
            double perimeter = 0;
            for(int i = 1; i<points.Length; i++)
            {
                perimeter += this.LengthSide(points[i - 1], points[i]);
            }
            perimeter += this.LengthSide(points[0], points[points.Length - 1]);
            return perimeter;
        }

        public Figure(int numberOfPints, string name)
        {
            this.amount = numberOfPints;
            this.name = name;
            FigureInit(this.amount);
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            int n = 0;
            Console.Write("Enter amount of points in your figure: ");
            n = int.Parse(Console.ReadLine());
            Figure cube = new Figure(n, "cube");
            Console.WriteLine(cube.PerimeterCalculator());

            Console.ReadKey();
        }
    }
}
