import React, { useState } from 'react';
import { useQuery, useMutation } from 'react-query';
import ItemsService from "../../services/ItemsService";
import styles from "./Board.module.css";
import CategoriesService from "../../services/CategoriesService";
import TextareaAutosize from 'react-textarea-autosize';

function Board({ selectedCategoryId }) {
  const [tasks, setTasks] = useState([]);
  const [categoryTitle, setCategoryTitle] = useState('');


  const { isLoading, refetch } = useQuery(
    ['fetchItems', selectedCategoryId], () => ItemsService.GetAll(selectedCategoryId), {
    enabled: !!selectedCategoryId,
    onSuccess: (data) => {
      setTasks(data.data);
    },
  });

  const { isLoading: isCategoryLoading } = useQuery(
    ['fetchCategory', selectedCategoryId],
    () => CategoriesService.GetById(selectedCategoryId),
    {
      enabled: !!selectedCategoryId,
      onSuccess: (data) => {
        setCategoryTitle(data.data.name);
      },
      onError: err => {
        console.log(err)
      }
    }
  );

  const createItemMutation = useMutation(({ categoryId, title, description, status }) => {
    console.log("Creating item with status:", status);
    return ItemsService.Create(categoryId, title, description, status);
  }, {
    onSuccess: () => {
      console.log("Item created. Refetching...");
      refetch();
    },
  });

  const updateItemMutation = useMutation(itemsData => ItemsService.Update(itemsData.id, itemsData.title, itemsData.description, itemsData.status), {
    onSuccess: (data, variables) => {
      const updatedTasks = tasks.map(task =>
        task.id === variables.id ? { ...task, ...variables } : task
      );
      setTasks(updatedTasks);
      console.log("Item updated successfully");
      setEditingItemId(null);
      setCurrentEditingField(null);
    },
    onError: (error) => {
      console.error("Error updating item:", error);
    },
  });

  const deleteItemMutation = useMutation((id) => ItemsService.Delete(id), {
    onSuccess: () => {
      console.log("Item deleted. Refetching...");
      refetch();
    },
  });

  const createNewItem = (status) => {
    const newTask = {
      categoryId: selectedCategoryId,
      title: "Новая задача",
      description: "Описание задачи",
      status,
      isNew: true
    };
    createItemMutation.mutate(newTask);
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(item));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    const item = JSON.parse(e.dataTransfer.getData("application/reactflow"));
    updateItemMutation.mutate({ ...item, status: newStatus });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const boards = [
    { id: 1, title: "To Do", status: "todo" },
    { id: 2, title: "In Progress", status: "in_progress" },
    { id: 3, title: "Done", status: "completed" },
  ];

  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingItemId, setEditingItemId] = useState(null);
  const [currentEditingField, setCurrentEditingField] = useState(null);

  const handleEditTitle = (item) => {
    setCurrentEditingField('title');
    setEditingItemId(item.id);
    const currentItem = tasks.find(task => task.id === item.id);
    setEditingTitle(currentItem.title);
    setEditingDescription(currentItem.description);
  };

  const handleEditDescription = (item) => {
    setCurrentEditingField('description');
    setEditingItemId(item.id);
    const currentItem = tasks.find(task => task.id === item.id);
    setEditingTitle(currentItem.title);
    setEditingDescription(currentItem.description);
  };


  const handleSave = async (id) => {
    const updatedTask = {
      id,
      title: editingTitle,
      description: editingDescription,
      status: tasks.find(task => task.id === id).status,
    };

    try {
      await updateItemMutation.mutateAsync({
        id: updatedTask.id,
        title: updatedTask.title,
        description: updatedTask.description,
        status: updatedTask.status,
      }, {
        onSuccess: () => {
          const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, ...updatedTask } : task
          );
          setTasks(updatedTasks);

          setEditingItemId(null);
          setCurrentEditingField(null);
        }
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleFocus = (e, defaultValue) => {
    if (e.target.value === defaultValue) {
      e.target.value = '';
    }

    setTimeout(() => {
      const value = e.target.value;
      e.target.selectionStart = value.length;
      e.target.selectionEnd = value.length;
    }, 0);
  };

  return (
    <div className={styles["mainContainer"]}>
      <h1 className={styles["categoryTitle"]}>{categoryTitle}</h1>

      {isLoading && isCategoryLoading ? (
        <div>Loading...</div>
      ) : (
        <div className={styles["boardContainer"]}>
          {boards.map((board) => (
            <div
              key={board.id}
              className={styles["board"]}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, board.status)}
            >
              <div className={styles["board__title"]}>{board.title}</div>

              {tasks && tasks.filter(task => task.status === board.status).map((item) => (
                <div
                  key={item.id}
                  draggable={editingItemId !== item.id}
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={styles["item"]}
                >
                  {editingItemId === item.id ? (
                    <>
                      <div className={styles["item-content"]}>
                        {currentEditingField === 'title' ? (
                          <TextareaAutosize
                            minRows={1}
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            onBlur={() => handleSave(item.id)}
                            onFocus={(e) => handleFocus(e, item.isNew)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault(); // Чтобы избежать добавления новой строки
                                handleSave(item.id);
                              }
                            }}
                            placeholder={item.isNew ? "Новая задача" : ""}
                            className={styles["item-edit-form-input"]}
                            autoFocus
                          />
                        ) : (
                          <div className={styles["item-title"]}>
                            {editingTitle}
                          </div>
                        )}
                        {currentEditingField === 'description' ? (
                          <TextareaAutosize
                            minRows={1}
                            value={editingDescription}
                            onChange={(e) => setEditingDescription(e.target.value)}
                            onBlur={() => handleSave(item.id)}
                            onFocus={(e) => handleFocus(e, item.isNew)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSave(item.id);
                              }
                            }}
                            placeholder={item.isNew ? "Описание задачи" : ""}
                            className={styles["item-edit-form-textarea"]}
                            autoFocus
                          />
                        ) : (
                          <div className={styles["item-description"]}>
                            {editingDescription}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className={styles["item-content"]}>
                      <div onClick={() => handleEditTitle(item)} className={styles["item-title"]}>
                        <strong>{item.title}</strong>
                      </div>
                      <div onClick={() => handleEditDescription(item)} className={styles["item-description"]}>
                        {item.description}
                      </div>
                    </div>
                  )}
                  <button
                    className={styles["delete-item-button"]}
                    onClick={() => deleteItemMutation.mutate(item.id)}
                  />
                </div>
              ))}
              <button onClick={() => createNewItem(board.status)} className={styles["add-item-button"]}>Добавить дело</button>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}

export default Board;
