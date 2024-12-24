import React, { useContext, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import CategoriesService from "../../services/CategoriesService";
import { Context } from "../../index";
import styles from "./CategoriesPanel.module.css";
import TextareaAutosize from 'react-textarea-autosize';


function CategoriesPanel({ selectedCategoryId, setSelectedCategoryId }) {
  const { store } = useContext(Context);

  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery('categories', CategoriesService.GetAll, {
    select: data => data?.data,
    onSuccess: data => {
      if (data && data.length > 0) {
        console.log("Fetched Categories", data[0].id);
        if (store.getCategory() === 0) {
          handleSelectCategory(data[0].id);
        } else {
          handleSelectCategory(store.getCategory());
        }
      } else {
        console.log("No categories fetched or categories are empty");
        setSelectedCategoryId(null);

      }
      store.setLoading(false);
      console.log("Store", store);
    }
  });

  const handleFocus = (e) => {
    const value = e.target.value;
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
    e.target.value = '';
    e.target.value = value;
  };

  const mutation = useMutation(newTitle => CategoriesService.Update(editingCategory, newTitle), {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });

  const createCategoryMutation = useMutation(() => CategoriesService.Create("Новая категория"), {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });

  const deleteCategoryMutation = useMutation(id => CategoriesService.Delete(id), {
    onSuccess: () => {
      queryClient.invalidateQueries('categories');
    },
  });

  const handleStartEditCategory = (id) => {
    setEditingCategory(id);
  };

  const handleSaveCategoryTitle = (id, newTitle) => {
    mutation.mutate(newTitle);
    setEditingCategory(null);
  };

  const handleSelectCategory = (id) => {
    setSelectedCategoryId(id);
    store.setCategory(id);
    console.log("handleSelectCategory", id)
  };

  const handleCreateCategory = () => {
    createCategoryMutation.mutate();
  };

  const handleDeleteCategory = (id) => {
    deleteCategoryMutation.mutate(id);
    if (selectedCategoryId === id) {
      setSelectedCategoryId(null);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles["panel_title"]}>Категории</div>


      {isLoading ? (
        <div>Loading</div>
      ) : (
        categories && categories.data && categories.data.length > 0 ? (
          categories.data.map((category) => (
            <div
              key={category.id}
              className={`${styles.category} ${selectedCategoryId === category.id ? styles.selectedCategory : ''}`}
              onClick={() => handleSelectCategory(category.id)}
            >
              {editingCategory === category.id ? (
                <TextareaAutosize
                  minRows={1}
                  defaultValue={category.name}
                  onBlur={(e) => handleSaveCategoryTitle(category.id, e.target.value)}
                  autoFocus
                  className={styles.categoryInput}
                  onFocus={handleFocus}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault(); // Предотвращаем переход на новую строку
                      handleSaveCategoryTitle(category.id, e.target.value); // Сохраняем изменения
                    }
                  }}
                />
              ) : (
                <div onDoubleClick={() => handleStartEditCategory(category.id)}>
                  <span className={styles.categoryTxt}>{category.name}</span>
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category.id); }} className={styles.deleteItemButton}></button>
            </div>
          ))
        ) : (
          <div>No categories available</div>
        )
      )}
      <button onClick={handleCreateCategory} className={styles.newCategoryButton}>Добавить категорию</button>
    </div>
  );
}

export default CategoriesPanel;