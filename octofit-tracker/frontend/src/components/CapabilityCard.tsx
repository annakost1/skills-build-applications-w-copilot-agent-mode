import { useEffect, useState, type ReactNode } from 'react';

type Props<T> = {
  title: string;
  description: string;
  loadItems: () => Promise<Record<string, unknown>>;
  itemsKey: keyof T;
  emptyText: string;
  renderItem: (item: unknown) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  loadItems,
  itemsKey,
  emptyText,
  renderItem,
}: Props<T>) {
  const [items, setItems] = useState<unknown[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setItems(null);
    setError(null);

    loadItems()
      .then((data) => {
        if (!active) return;
        const value = data[String(itemsKey)];
        setItems(Array.isArray(value) ? value : []);
      })
      .catch((requestError: unknown) => {
        if (!active) return;
        setError(requestError instanceof Error ? requestError.message : 'Request failed');
      });

    return () => {
      active = false;
    };
  }, [loadItems, itemsKey]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          <ul className="list-unstyled">{items.map((item, index) => (
            <li key={index}>{renderItem(item)}</li>
          ))}</ul>
        )}
      </div>
    </section>
  );
}
