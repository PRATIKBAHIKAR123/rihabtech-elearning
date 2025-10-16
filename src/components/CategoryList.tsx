import React, { useEffect, useState } from "react";

type Category = {
  id: string;
  title: string;
};

type SubCategory = {
  id: string;
  name: string;
  categoryId: string;
};
import { getCategories, getSubCategories } from "../utils/firebaseCategory";

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    getCategories().then((data) => setCategories(data as Category[]));
    getSubCategories().then((data) => setSubCategories(data as SubCategory[]));
  }, []);

  // Helper to get category name by id
  const getCategoryName = (id: string) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.title : id;
  };

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>{cat.title}</li>
        ))}
      </ul>
      <h2>Subcategories</h2>
      <ul>
        {subCategories.map(sub => (
          <li key={sub.id}>
            {sub.name} (Category: {getCategoryName(sub.categoryId)})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
