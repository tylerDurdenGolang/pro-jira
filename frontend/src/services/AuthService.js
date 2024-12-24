import $api from "../http";
// import {AuthResponse} from "../models/response/AuthResponse";

export default class AuthService {
    static async login(username, password) {
        return $api.post('/auth/sign-in', {username, password})
    }

    static async registration(username, password) {
        return $api.post('/auth/sign-up', {username, password})
    }

    static async logout() {
        return $api.post('/auth/logout')
    }
}
