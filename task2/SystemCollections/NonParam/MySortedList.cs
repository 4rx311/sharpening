using System;
using System.Collections;

namespace SystemCollections.Collections
{
    [Obsolete]
    class MySortedList
    {
        SortedList sort = new SortedList(new DescendingComparer());
        MyHashTable table = new MyHashTable();

        public void Init()
        {
            foreach (DictionaryEntry name in table.table)
            {
               sort[name.Value] = name.Key;
            }
        }

        public void Print()
        {
            Console.WriteLine(new string('-', 20));
            Console.WriteLine("Amount:  Value: ");
            foreach (DictionaryEntry name in sort)
            {
                Console.WriteLine("{0} \t {1}", name.Key, name.Value );
            }
        }

        public MySortedList()
        {
            Init();
        }
    }

    public class DescendingComparer : IComparer
    {
        CaseInsensitiveComparer comparer = new CaseInsensitiveComparer();

        public int Compare(object a, object b)
        {
            int result = comparer.Compare(b, a);
            return result;
        }
    }
}
