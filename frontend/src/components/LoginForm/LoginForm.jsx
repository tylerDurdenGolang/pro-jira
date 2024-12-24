import React, { useState, useContext } from 'react';
import styles from './LoginForm.module.css';
import { Context } from "../../index";
import { useNavigate } from "react-router-dom";

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null); // Добавляем состояние для успешного сообщения
    const { store } = useContext(Context);
    const navigate = useNavigate();

    const handleLogin = async () => {
        if (!email || !password) {
            setError("Please enter both email and password."); // Проверка на пустые поля
            setSuccessMessage(null); // Убираем сообщение об успешной регистрации
            return;
        }
        try {
            await store.login(email, password);
            setError(null); // Очищаем ошибки при успешной авторизации
            setSuccessMessage(null); // Убираем сообщение об успешной регистрации
            if (store.isAuth) {
                navigate("/root"); // Перенаправление при успешной авторизации
            }
        } catch (e) {
            setError(e.response?.data?.message || "Login failed. Please try again."); // Обработка ошибок
            setSuccessMessage(null); // Убираем сообщение об успешной регистрации
        }
    };

    const handleRegister = async () => {
        if (!email || !password) {
            setError("Please enter both email and password."); // Проверка на пустые поля
            setSuccessMessage(null); // Убираем сообщение об успешной регистрации
            return;
        }
        try {
            // Выполняем регистрацию
            await store.registration(email, password);
            setError(null); // Очищаем ошибки
            setSuccessMessage("Registration successful! You can now log in."); // Устанавливаем сообщение об успешной регистрации

            // После регистрации выполняем логин
            await store.login(email, password);

            // Проверяем авторизацию и перенаправляем
            if (store.isAuth) {
                navigate("/root");
            }
        } catch (e) {
            setError(e.response?.data?.message || "Registration failed. Please try again."); // Обработка ошибок
            setSuccessMessage(null); // Убираем сообщение об успешной регистрации
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleLogin(); // Вызов авторизации при нажатии Enter
        }
    };

    return (
        <div className={styles.formContainer} onKeyDown={handleKeyDown}>
            <div className={styles.siteHeader}>
                <img src="/jira.svg" alt="Иконка сайта" className={styles.siteIcon} />
                <h1 className={styles.siteName}>ProJira</h1>
            </div>
            <div className={styles.formBox}>
                <input
                    className={styles.formInput}
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    type="text"
                    placeholder='username'
                />
                <input
                    className={styles.formInput}
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    type="password"
                    placeholder='password'
                />
                <button
                    className={styles.formButton}
                    onClick={handleLogin}
                >
                    Войти
                </button>
                <button
                    className={styles.formButton}
                    onClick={handleRegister}
                >
                    Регистрация
                </button>
                {error && <div className={styles.error}>{error}</div>}
                {successMessage && <div className={styles.success}>{successMessage}</div>} {/* Выводим успешное сообщение */}
            </div>
        </div>
    );
};

export default LoginForm;
