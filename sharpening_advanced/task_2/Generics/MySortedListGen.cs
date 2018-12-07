using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace task_2.Generics
{
    class MySortedListGen
    {
        public SortedList<int, int> list = new SortedList<int, int>(new DescendingComparer<int>());
        MyDictionaryGen dict = new MyDictionaryGen();

        public void Init()
        {
            foreach (var value in dict.dict)
            {
                list[value.Value] = value.Key;
            }
        }

        public MySortedListGen()
        {
            Init();
        }

        // Позволяет выводить результат по убыванию
        private class DescendingComparer<T> : IComparer<T>
        {
            public int Compare(T x, T y)
            {
                return Comparer<T>.Default.Compare(y, x);
            }
        }
    }
}
