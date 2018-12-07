using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ConsoleApp8
{
    class Program
    {
        struct Train
        {
            public string Destination;
            public int Number;
            public DateTime Departure;
        }
        static void Main(string[] args)
        {
            int amount = 2;
            var array = new Train[amount];
            for(var i = 0; i < amount; i++)
            {
                array[i] = TrainInit();
            }

            var sortedArr = array.OrderBy(t => t.Number).ToArray();
            TrainsPrint(sortedArr);


            Train TrainInit()
            {
                Console.Write("Input destination: ");
                string place = Console.ReadLine();
                Console.Write("Input train number: ");
                int number = int.Parse(Console.ReadLine());
                Console.Write("Input dparture time: ");
                DateTime date = DateTime.Parse(Console.ReadLine());

                return new Train
                {
                    Destination = place,
                    Number = number,
                    Departure = date
                    
                };
            }

            void TrainsPrint(Train[] arr)
            {
                Console.WriteLine("Trains available: ");
                foreach (var trn in arr)
                    Console.WriteLine("{0} {1}", trn.Number, trn.Destination);
            }

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
