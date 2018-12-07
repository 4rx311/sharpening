using System;
using System.Collections;

namespace task_1.UserCollections
{
    class UserCollectionEnumerator : IEnumerable, IEnumerator, IDisposable
    {
        readonly Month[] elements = new Month[12];

        // Обертка для индексатора массива elements
        public Month this[int index]
        {
            get { return elements[index]; }
            set { elements[index] = value; }
        }

        // Указатель текущего элемента в коллекции
        int position = -1;

        // Реализация интерфейса IEnumerator:
        // 1. Метод MoveNext().
        bool IEnumerator.MoveNext()
        {
            if (position < elements.Length - 1)
            {
                position++;
                return true;
            }
            return false;
        }

        // 3. Свойство Current.
        object IEnumerator.Current
        {
            get { return elements[position]; }
        }

        // Реализация интерфейса IEnumerable:
        IEnumerator IEnumerable.GetEnumerator()
        {
            return (IEnumerator)this;
        }

        // 2. Метод Reset().
        void IEnumerator.Reset()
        {
            position = -1;
        }

        public void Dispose()
        {
            ((IEnumerator)this).Reset();
        }

    }
}
