using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/* Написать программу, которая на вход принимает данные о пассажире
 * ФИО, номер рейса (формат aaxxx, где a - буква, а x - число),
 * номер и серия паспорта (формат xxxx xxxxxx x - число)
 * Если данные введены не верно или отсутствуют, то выдать исключения.
 */


namespace ConsoleApp17
{
    class Passenger
    {
        private string firstName;
        private string secondName;
        private string flight = string.Format("aa###");
        private int passport;
        
        public Passenger(string name, string surname, int passport, string flight)
        {
            string exeptions = "1234567890-=,./'][!@#$%^&*()_+`;|?}{";
            if (name.Contains(exeptions) || surname.Contains(exeptions))
                throw new Exception("Wrong personal data input");
            
        }

        public string FirstName     { get { return firstName; } }
        public string SecondName    { get { return secondName; } }
        public string Flight        { get { return flight; } }
        public int Passport         { get { return passport; } }
    }

    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Input your Name: ");
            string name = Console.ReadLine();
            Console.Write("Input your Surname: ");
            string surname = Console.ReadLine();

            Passenger passenger1 = new Passenger(name, surname, 1, "1");

            Console.ReadKey();
        }
    }
}
