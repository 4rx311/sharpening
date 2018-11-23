using System.Collections;

namespace Collection.UserCollections
{
    abstract class Iterator
    {
        public abstract object First();
        public abstract object Next();
        public abstract bool IsDone();
        public abstract object CurrentItem();
    }

    abstract class Aggregate
    {
        public abstract Iterator CreateIterator();
        public abstract object this[int index] { get; set; }
    }

    class ConcreteAggregate : Aggregate
    {
        private readonly ArrayList elements = new ArrayList();
        private ConcreteIterator iterator;
        public override Iterator CreateIterator()
        {
            iterator = new ConcreteIterator(this);
            return iterator;
        }

        public int Count { get { return elements.Count; } }

        public override object this[int index]
        {
            get { return elements[index]; }
            set { elements.Insert(index, value); }
        }
    }

    class ConcreteIterator : Iterator
    {
        private readonly ConcreteAggregate aggregate;
        private int current;

        public ConcreteIterator(ConcreteAggregate aggregate)
        {
            this.aggregate = aggregate;
        }

        public override object First()
        {
            return aggregate[0];
        }

        public override object Next()
        {
            object element = null;
            if (current < aggregate.Count - 1)
                element = aggregate[++current];

            return element;
        }

        public override object CurrentItem()
        {
            return aggregate[current];
        }

        public override bool IsDone()
        {
            return current >= aggregate.Count - 1;
        }
    }

    class UsageExample
    {
        //Aggregate aggregate = new ConcreteAggregate();
        //    aggregate[0] = "January";
        //    aggregate[1] = "February";
        //    aggregate[2] = "March";
        //    aggregate[3] = "April";
        //    aggregate[4] = "May";
        //    aggregate[5] = "June";
        //    aggregate[6] = "July";
        //    aggregate[7] = "August";
        //    aggregate[8] = "September";
        //    aggregate[9] = "October";
        //    aggregate[10] = "November";
        //    aggregate[11] = "December";

        //    Iterator iterator = aggregate.CreateIterator();

        //    Console.WriteLine("First elment of collection: ");

        //    object element = iterator.First();
        //    Console.WriteLine(element);

        //    Console.WriteLine(new string('-', 25));

        //    Console.WriteLine("Collection iteration: ");
        //    while (!iterator.IsDone())
        //    {
        //        Console.WriteLine(element);
        //        element = iterator.Next();
        //    }
    }
}
