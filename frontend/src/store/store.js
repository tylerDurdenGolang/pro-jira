import { makeAutoObservable } from "mobx";
import AuthService from "../services/AuthService";
import $api, { API_URL } from "../http";
import { jwtDecode } from "jwt-decode";

class Store {
    user = {};
    isAuth = false;
    isLoading = true;
    categoryId = 0;
    isRefreshing = false; // Флаг для предотвращения дублирующих запросов

    constructor() {
        makeAutoObservable(this);
    }

    setAuth(bool) {
        this.isAuth = bool;
    }

    setUser(user) {
        this.user = user;
    }

    setLoading(bool) {
        this.isLoading = bool;
    }

    setCategory(categoryId) {
        this.categoryId = categoryId;
        localStorage.setItem("selectedCategoryId", categoryId);
    }

    getCategory() {
        return localStorage.getItem("selectedCategoryId");
    }

    async login(username, password) {
        try {
            const response = await AuthService.login(username, password);
            localStorage.setItem("token", response.data.accessToken);

            const decodedToken = this.parseJwt(response.data.accessToken);
            this.setUser(decodedToken.user_id);
            this.setAuth(true);
        } catch (e) {
            console.error("Login error:", e.response?.data?.message || e.message);
            throw e; // Пробрасываем ошибку для обработки в вызывающем компоненте
        }
    }

    async registration(email, password) {
        try {
            const response = await AuthService.registration(email, password);
            localStorage.setItem("token", response.data.accessToken);

            const decodedToken = this.parseJwt(response.data.accessToken);
            this.setUser(decodedToken.user_id);
            this.setAuth(true);
        } catch (e) {
            console.error("Registration error:", e.response?.data?.message || e.message);
            throw e;
        }
    }

    async logout() {
        try {
            await AuthService.logout();
            localStorage.removeItem("token");
            this.setAuth(false);
            this.setUser({});
        } catch (e) {
            console.error("Logout error:", e.response?.data?.message || e.message);
        }
    }

    async checkAuth() {
        if (this.isRefreshing) return;
        this.isRefreshing = true;

        this.setLoading(true);

        try {
            const token = localStorage.getItem("token");
            if (!token || !this.isAuthenticated()) {
                this.setAuth(false);
                this.setLoading(false);
                return;
            }

            const response = await $api.get(`${API_URL}/auth/refresh`);
            localStorage.setItem("token", response.data.accessToken);

            this.setAuth(true);

            const decodedToken = this.parseJwt(response.data.accessToken);
            this.setUser(decodedToken.user_id);
        } catch (e) {
            console.error("Auth check error:", e.response?.data?.message || e.message);
            this.setAuth(false);
        } finally {
            this.isRefreshing = false;
            this.setLoading(false);
        }
    }

    isAuthenticated() {
        const token = localStorage.getItem("token");
        if (!token) return false;

        try {
            const decoded = jwtDecode(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (e) {
            console.error("Token decode error:", e.message);
            return false;
        }
    }

    parseJwt(token) {
        if (!token) {
            throw new Error("Token is required for parsing");
        }
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => {
                    return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                })
                .join("")
        );

        return JSON.parse(jsonPayload);
    }
}

export default Store;
