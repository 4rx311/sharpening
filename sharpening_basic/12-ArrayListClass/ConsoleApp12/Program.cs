using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

/* Создайте класс ArrayList. Реализуйте в простейшем приближении возможность использования его экземпляра 
 * аналогично экземпляру класса ArrayList из пространства имен System.Collections.
 */

namespace ConsoleApp12
{
    public class MyArrayList<T> //: IList<T>
    {
        private static int _cap = 10;
        private int _size = 0;
        private T[] _items = null;

        // constructor
        public MyArrayList()
        {
            _items = new T[_size];
        }

        public void PrintElement()
        {
            for(int i = 0; i < _items.Length; i++)
            {
                Console.WriteLine(_items[i]);
            }
        }

        // adds elements in ArrayList
        public int Add(T value)
        {
            T[] tmp = new T[_items.Length + 1];
            for(int i = 0; i < _items.Length; i++)
            {
                tmp[i] = _items[i];
            }
            tmp[tmp.Length - 1] = value;
            _items = tmp;
            return tmp.Length - 1;
        }

        public bool Contains(T value)
        {
            return IndexOf(value) != -1;
        }

        public int IndexOf(T value)
        {
            return IndexOf(value, 0);
        }

        public int IndexOf(T value, int startIndex)
        {
            for(int i = startIndex; i < _items.Length; i++)
            {
                if (_items[i].Equals(value)) return i;
            }
            return -1;
        }

        public void Remove(T value)
        {
            if (!Contains(value)) return;

            T[] tmp = new T[_items.Length - 1];
            bool deleted = false;
            for(int i = 0, j = 0; i < tmp.Length; i++, j++)
            {
                if(_items[i].Equals(value) && !deleted)
                {
                    j++;
                    deleted = true;
                }
                tmp[i] = _items[j];
            }
            _items = tmp;
        }
    }
    class Program
    {
        static void Main(string[] args)
        {
            // Список целочисленных значений
            var ints = new MyArrayList<int>();
            ints.Add(7);
            ints.Add(5);
            ints.Add(9);
            ints.PrintElement();

            //Список строк
            var strings = new MyArrayList<string>();
            strings.Add("string1");
            strings.Add("string1");
            strings.Add("string1");
            strings.PrintElement();


            Console.WriteLine("Press any key to exit.");
            Console.ReadKey();
        }
    }
}
