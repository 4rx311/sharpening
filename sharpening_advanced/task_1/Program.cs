using System;
using System.Collections;
using task_1.UserCollections;
using System.Collections.Generic;

namespace task_1
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine(new string('*', 20));
            Console.WriteLine("Press 'h' for help");

            MonthsList list = new MonthsList();
            MonthCollection collection = new MonthCollection();
            collection.Init();

            #region Switch Menu
            bool tryAgain = true;
            while (tryAgain)
            {
                try
                {
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
                            try
                            {
                                Console.Write(">>days: ");
                                int days = Convert.ToInt32(Console.ReadLine());
                                ShowByDays(days);
                            }
                            catch (FormatException)
                            {
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
                catch (FormatException)
                {
                    Console.WriteLine("!-Wrong Format");
                }
            }
            #endregion

            #region Print Methods

            void ShowById(int id)
            {
                Console.WriteLine("In development");
            }

            void ShowByDays(int days)
            {
                Console.WriteLine("In development");
            }

            void ShowAll()
            {
                Console.WriteLine("In development");
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

            Console.ReadKey();
        }
    }
}
