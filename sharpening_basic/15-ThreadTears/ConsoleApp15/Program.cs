using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading;

namespace ConsoleApp15
{
    class Program
    {
        static Random rand = new Random();
        static object locker = new object();

        static int consWidth;              // console Width
        static int consHeight;             // console Height

        static void Cry(object argument)
        {
            Thread.Sleep(rand.Next(20, 100));           // random delay before thread start
            int length = rand.Next(10, consHeight - 7);      // length of the tear

            int tear = (int)argument;
            int sleep = rand.Next(6, 10);

            while (true)
            {
                Thread.Sleep(rand.Next(60, 150));
                lock (locker)
                {
                    if (length < consHeight)
                    {
                        for (int i = 0; i < length; i++)
                        {
                            if (length - i == 1)
                            {
                                Console.ForegroundColor = ConsoleColor.White;
                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 12, i);

                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 27, i);

                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 39, i);

                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.ForegroundColor = ConsoleColor.White;
                                Thread.Sleep(sleep);
                            }
                            else if (length - i > 1 && length - i < 4)
                            {
                                Console.ForegroundColor = ConsoleColor.Green;
                                Console.Write("{0}{1}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 12, i);

                                Console.Write("{0}{1}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 27, i);

                                Console.Write("{0}{1}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 39, i);

                                Console.Write("{0}{1}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.ForegroundColor = ConsoleColor.Green;

                                Thread.Sleep(sleep);
                            }
                            else
                            {
                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 12, i);

                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 27, i);

                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.SetCursorPosition(tear + 39, i);

                                Console.Write("{0}", rand.Next(0, 2), rand.Next(0, 2));
                                Console.ForegroundColor = ConsoleColor.DarkGreen;

                                Thread.Sleep(sleep * 3);
                            }
                        }
                        length += rand.Next(1, 20);
                        if (length >= consHeight) length = consHeight;
                    }
                    else
                    {
                        for (int i = 0; i < length; i++)
                        {
                            Console.SetCursorPosition(tear, i);
                            Console.Write(" ");

                            Console.SetCursorPosition(tear + 7, i);
                            Console.Write("{0}", rand.Next(0, 2));

                            Console.SetCursorPosition(tear + 27, i);
                            Console.Write(" ");

                            Console.SetCursorPosition(tear + 39, i);
                            Console.Write(" ");
                        }
                        length = rand.Next(8, 25);
                    }
                }
            }
        }

        static void Main(string[] args)
        {
            Console.SetWindowSize(130, 74);
            consWidth = Console.WindowWidth;
            consHeight = Console.WindowHeight;


            for( int i = 0; i < Console.WindowWidth-39; i++)
            {
                ParameterizedThreadStart cry = new ParameterizedThreadStart(Cry);
                Thread thread = new Thread(cry);
                thread.Start(i);
            }
        }
    }
   
}
