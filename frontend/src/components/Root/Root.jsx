import React, { useContext, useState } from "react";
import { Context } from "../../index";
import CategoriesPanel from "../CategoriesPanel/CategoriesPanel";
import Board from "../Board/Board";
import { useNavigate } from "react-router-dom";
import styles from "./Root.module.css"; 

function Root() {
  const { store } = useContext(Context);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const navigate = useNavigate();

  if (store.loading) {
    return <div>Loading...</div>; 
  }

  return (
    <div className={styles.boardContainer}>      
      <div className={styles.categoriesPanel}>
        <CategoriesPanel
          selectedCategoryId={selectedCategoryId}
          setSelectedCategoryId={setSelectedCategoryId}
        />
      </div>

      <div className={styles.board}>
      <button className={styles.logoutButton} onClick={() => {
        store.logout();
        navigate("/login");
      }}>Logout</button>
        <Board selectedCategoryId={store.getCategory()}/>
      </div>

      
    </div>
  );
}

export default Root;
