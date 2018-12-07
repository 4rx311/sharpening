using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;

namespace task_1.UserCollections
{
    [Obsolete]
    class UserCollectionGen<T> : ICollection<T>
    {
        T[] elements = new T[0];

        //Добавляет элемент в интерфейс ICollection<T>
        public void Add(T item)
        {
            var newArray = new T[elements.Length + 1];
            elements.CopyTo(newArray, 0);
            newArray[newArray.Length - 1] = item;
            elements = newArray;
        }

        // Удаляет все элементы из коллекции ICollection<T>
        public void Clear()
        {
            elements = new T[0];
        }

        // Определяет, содержит ли интерфейс ICollection<T> указанное значение
        public bool Contains(T item)
        {
            foreach (var element in elements)
            {
                if (element.Equals(item))
                    return true;
            }
            return false;

            // Or we can use LINQ
            // return element.Contains(item);
        }

        // Копирует элементы ICollection<T> в Array, начиная с конкретного индекса Array
        public void CopyTo(T[] array, int arrayIndex)
        {
            elements.CopyTo(array, arrayIndex);
        }

        // Получает число элементов, содержащихся в интерфейсе ICollection<T>
        public int Count
        {
            get { return elements.Length; }
        }

        // Получает значение, указывающее доступна ли ICollection<T> только для чтения
        public bool IsReadOnly
        {
            get { return false; }
        }

        // Удаляет первое вхождение указанного объекта коллекции ICollection<T>
        public bool Remove(T item)
        {
            // in development
            throw new NotImplementedException();
        }

        // Возвращает перечислитель, выполняющий перебор элементов в коллекции
        public IEnumerator<T> GetEnumerator()
        {
            return ((IEnumerable<T>)elements).GetEnumerator();
        }

        // Возвращает перечислитель, который выполгяет итерацию по элементам коллекции
        IEnumerator IEnumerable.GetEnumerator()
        {
            return (this as IEnumerable<T>).GetEnumerator();
        }



    }
}