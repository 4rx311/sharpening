using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/*
 *  Создать класс User, содержащий информацию о пользователе
 *  (логин, имя, фамилия, возраст, дата заполнения анкеты)
 *  Поле дата заполнения нкеты должно быть проинциализировано только один раз
 *  (при создании экземпляра данного класса) без возможности его дальнейшего изменения.
 *  Реализуйте вывод на экран информации о пользователе.
*/

namespace ConsoleApp2
{

    class User
    {
        public string login, firstName, lastName;
        public int age;
        private readonly DateTime _dt;

        public User(string log, string first, string last, int age, DateTime date)
        {
            this.login = log;
            this.firstName = first;
            this.lastName = last;
            this.age = age;
            this._dt = date;
        }

        public DateTime DT
        {
            get { return _dt; }
        }
    }

    class Program
    {
        static void Main(string[] args)
        {
            User user1 = new User("dvladimirov", "Denis", "Vladimirov", 25, DateTime.Parse("2009.11.23"));

            Console.WriteLine("Name: {0}, Age: {1}", user1.firstName, user1.age);
            Console.WriteLine("Date of completion: {0}", user1.DT);

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
