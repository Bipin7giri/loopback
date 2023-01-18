import slug from 'slug';

export const Slug = (string: string): string =>
  slug(`${string} ${Math.random().toString(36).slice(2, 9)}`);

export default Slug;
