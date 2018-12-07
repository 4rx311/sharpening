using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/*  Создайте перечисление, в котором будут содержаться должности сотрудников как имена констант.
 *  Присвойте каждой константе значение, задающее количество часов, которые должен отработать сотрудник за месяц.
 *  Создайте класс Accauntant c методом bool AskForBonus(Post worker, int hours), отражающее давать или нет сотруднику премию.
 *  Если сотрудник отработал больше положенных часов в месяц, то ему положена премия.
 */

namespace ConsoleApp9
{
    enum Post
    {
        Manager = 160,
        Janitor = 80,
        Stamper = 140,
        Chief = 180
    }
    class Accauntant
    {
        public Post worker;
        public int hours;
        
        public bool AskForBonus(Post worker, int hours)
        {
            bool result = false;

            result = (hours >= 100) ? true : false; 

            return result;
        }

        public Accauntant(Post stuff, int time)
        {
            worker = stuff;
            hours = time;
        }
    }


    class Program
    {
        static void Main(string[] args)
        {
            
            Post worker;
            int hours;

            foreach (int value in Enum.GetValues(typeof(Post)))
            {
                hours = (int)value;
                Accauntant count = new Accauntant((Post)value, hours);
                Console.Write("post: "+ ((Post)value).ToString());
                Console.WriteLine("\t Bonus: " + count.AskForBonus((Post)value, hours));
            }

            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
