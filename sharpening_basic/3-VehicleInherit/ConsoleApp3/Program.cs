using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp3
{
    abstract class Vehicle
    {
        public string place;
        public int price,speed;
        public DateTime release;

        public string Place { get; set; } 
        public int Price
        {
            get { return price; }
            set { if (value > 0) price = value; }
        }

        public int Speed
        {
            get { return speed; }
            set { if (value > 0) speed = value; }
        }
        public DateTime Release { get; set; }

        public Vehicle(string place, int price, int speed, DateTime release)
        {
            this.Place = place;
            this.Price = price;
            this.Speed = speed;
            this.Release = release;
        }
    }
    sealed class Plane : Vehicle
    {
        public int Altitude { get; set; }

        public Plane(string place, int price, int speed, DateTime release, int Altitude)
            :base(place, price, speed, release)
        {
            this.Altitude = Altitude;
        }
    }
    sealed class Car : Vehicle
    {
        public Car(string place, int price, int speed, DateTime release)
            : base(place, price, speed, release) { }
    }
        
    sealed class Ship : Vehicle
    {
        public int Passengers { get; set; }
        public string Port { get; set; }

            public Ship(string place, int price, int speed, DateTime release, int Passengers, string Port)
            : base(place, price, speed, release)
            {
                this.Passengers = Passengers;
                this.Port = Port;
            }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Plane plane1 = new Plane("Marokko", 1000000, 650, DateTime.Parse("2000.10.23"), 10000);
            Car car1 = new Car("Moscow", 40000, 200, DateTime.Parse("2016.11.20"));
            Ship ship1 = new Ship("Murmansk", 500000, 50, DateTime.Parse("1942.04.30"), 140, "Portillo");

            Console.WriteLine("========Plane_Info========");
            Console.WriteLine("Place: {0}", plane1.Place);
            Console.WriteLine("Price: {0}", plane1.Price);
            Console.WriteLine("MaxSpeed: {0}", plane1.Speed);
            Console.WriteLine("Release: {0}", plane1.Release);
            Console.WriteLine("Altitude: {0}\n", plane1.Altitude);
            Console.WriteLine("========Car_Info========");
            Console.WriteLine("Place: {0}", car1.Place);
            Console.WriteLine("Price: {0}", car1.Price);
            Console.WriteLine("MaxSpeed: {0}", car1.Speed);
            Console.WriteLine("Release: {0}\n", car1.Release);
            Console.WriteLine("========Ship_Info========");
            Console.WriteLine("Place: {0}", ship1.Place);
            Console.WriteLine("Price: {0}", ship1.Price);
            Console.WriteLine("MaxSpeed: {0}", ship1.Speed);
            Console.WriteLine("Release: {0}", ship1.Release);
            Console.WriteLine("Passengers: {0}", ship1.Passengers);
            Console.WriteLine("Port: {0}\n", ship1.Port);

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
