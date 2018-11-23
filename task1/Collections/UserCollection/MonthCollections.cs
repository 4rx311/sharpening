using System;
using System.Collections;
using Collection.UserCollections;

namespace Collection.UserCollections
{
    public class MonthCollection
    {
        UserCollection collection = new UserCollection();

        public int year = 2018;
        
        public void Init()
        {
            collection[0] = new Month("January", year);
            collection[1] = new Month("February", year);
            collection[2] = new Month("Macrh", year);
            collection[3] = new Month("April", year);
            collection[4] = new Month("May", year);
            collection[5] = new Month("June", year);
            collection[6] = new Month("July", year);
            collection[7] = new Month("August", year);
            collection[8] = new Month("September", year);
            collection[9] = new Month("October", year);
            collection[10] = new Month("November", year);
            collection[11] = new Month("December", year);
        }

        public void ShowAll()
        {
            Console.WriteLine(new string('-', 13));
            Console.WriteLine("Months list: ");

            try
            {
                var enumerator = ((IEnumerable)collection).GetEnumerator();
                while (enumerator.MoveNext())
                {
                    Month element = (Month)enumerator.Current;
                    Console.WriteLine("{0}, {1}", element);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("!-Collection not initialized \n {0}", ex);
            }
            Console.WriteLine(new string('-', 13));
        }

        public void Dispose()
        {
            // Collection disposing
            if (collection is IDisposable)
                ((IDisposable)collection).Dispose();
        }
    }


}
