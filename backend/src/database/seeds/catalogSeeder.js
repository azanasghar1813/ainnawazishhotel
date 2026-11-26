import crypto from 'crypto';

/**
 * Seeds the 3 default main categories (Fast Food, Restaurant, Deals)
 * only when the categories table is completely empty.
 *
 * @param {Object} db
 * @returns {Object}
 */
export const runCatalogSeeder = (db) => {
  const row = db.prepare('SELECT COUNT(*) as c FROM categories').get();
  if ((row?.c || 0) > 0) {
    return { name: 'Catalog', inserted: 0 };
  }

  const insertCategory = db.prepare(`
    INSERT INTO categories (id, name, parent_id, display_order, lifecycle_state, visibility, color_code)
    VALUES (?, ?, NULL, ?, 'ACTIVE', 'VISIBLE', ?)
  `);

  const defaults = [
    { name: 'Fast Food', order: 10, color: '#F97316' },
    { name: 'Restaurant', order: 20, color: '#3B82F6' },
    { name: 'Deals', order: 30, color: '#8B5CF6' }
  ];

  let inserted = 0;
  for (const cat of defaults) {
    const res = insertCategory.run(crypto.randomUUID(), cat.name, cat.order, cat.color);
    if (res.changes > 0) inserted++;
  }

  return { name: 'Catalog', inserted };
};
