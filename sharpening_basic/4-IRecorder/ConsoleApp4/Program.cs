using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/* Создайте 2 интерфейса IPlayable и IRecodable. В каждом из интерфейсов создайте по 3 метода
 * void Play() / void Pause() / void Stop() и
 * void Record() / void Pause() / void Stop() соответственно.
 * Создайте производный класс Player от базовых интерфесов IPlayable и IRecodable.
 * Написать программу, которая выполняет проигрвываение и запись.
 */

namespace ConsoleApp4
{
    class Program
    {
        public interface IPlayable
        {
            void Play();
            void Pause();
            void Stop();
        }
        public interface IRecodable
        {
            void Record();
            void Pause();
            void Stop();
        }

        public class Player : IPlayable, IRecodable
        {
            public void Play() { Console.WriteLine("Playing"); }
            public void Pause() { Console.WriteLine("Pause"); }
            public void Stop() { Console.WriteLine("Stop"); }
            public void Record() { Console.WriteLine("Play"); }

        }
        static void Main(string[] args)
        {
            Player player = new Player();
            
            int n; 
            string cont = "N";

            Console.WriteLine("Press:\n0-exit\n1-play,\n2-pause,\n3-stop,\n4-record");
            do
            {
                n = int.Parse(Console.ReadLine());
                switch (n)
                {
                    case 1:
                        player.Play();
                        Console.Write("Continue? (y) - ");
                        cont = Console.ReadLine();
                        break;
                    case 2:
                        player.Pause();
                        Console.Write("Continue? (y) - ");
                        cont = Console.ReadLine();
                        break;
                    case 3:
                        player.Stop();
                        Console.Write("Continue? (y) - ");
                        cont = Console.ReadLine();
                        break;
                    case 4:
                        player.Record();
                        Console.Write("Continue? (y) - ");
                        cont = Console.ReadLine();
                        break;
                    default:
                        Console.WriteLine("Wrong number!");
                        break;
                }
            }while (cont == "y" );


            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
