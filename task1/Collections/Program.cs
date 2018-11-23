using System;
using System.Collections;
using Collection.UserCollections;
using System.Collections.Generic;

//  Создайте коллекцию, в которой бы хранились наименования 12 месяцев, порядковый номер и количество дней в соответствующем месяце.
//  Реализуйте возможность выбора месяцев, как по порядковому номеру, так и количеству дней в месяце, 
//  при этом результатом может быть не только один месяц.

namespace Collection
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine(new string('*', 20));
            Console.WriteLine("Press 'h' for help");

            MonthList list = new MonthList();
            MonthCollection collection = new MonthCollection();
            collection.Init();

            #region Switch Menu
            bool tryAgain = true;          
            while (tryAgain)
            {
                try {
                    Console.Write(">> ");

                    char caseSwitch = Console.ReadKey().KeyChar;
                    Console.WriteLine();
                    switch (caseSwitch)
                    {
                        case 'h':
                            Help();
                            break;

                        case '1':
                            try
                            {
                                Console.Write(">>id: ");
                                int id = Convert.ToInt32(Console.ReadLine());
                                ShowById(id);
                            }
                            catch (FormatException)
                            {
                                Console.WriteLine("!-Wrong Format");
                            }
                            break;

                        case '2':
                            try {
                                Console.Write(">>days: ");
                                int days = Convert.ToInt32(Console.ReadLine());
                                ShowByDays(days);
                            }
                            catch (FormatException) {
                                Console.WriteLine("!-Wrong Format");
                            }
                            break;

                        case '3':
                            ShowAll();
                            break;

                        case 'q':
                            tryAgain = false;
                            break;

                        default:
                            Console.WriteLine($"Invalid selection ({caseSwitch})");
                            break;
                    }
                }
                catch (FormatException) {
                    Console.WriteLine("!-Wrong Format");
                }
            }
            #endregion
     
            #region Print Methods

            void ShowById(int id)
            {
                try
                {
                    //Element element = collection[id];
                    //Console.WriteLine("{0}, {1}, {2}", id, element.Name, element.Days);
                }
                catch (IndexOutOfRangeException)
                {
                    Console.WriteLine("!-Out of range value");
                }
            }

            void ShowByDays(int days)
            {

            }

            void ShowAll()
            {

            }

            void Help()
            {
                Console.WriteLine("1 - show by id\n" +
                                  "2 - show by days\n" +
                                  "3 - show all\n" +
                                  "q - exit");
            }

            #endregion

            Console.WriteLine(new string('*', 20));
            Console.Write("End of program...");
            System.Threading.Thread.Sleep(1000);
        }




    }
}
